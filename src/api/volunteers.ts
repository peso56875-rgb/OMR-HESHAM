import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { getCookie } from 'hono/cookie'
import { adminMiddleware, authMiddleware } from './middleware'

export const volunteers = new Hono()

// Submit a volunteer application (accepts form data from browser or JSON)
volunteers.post('/', async (c) => {
  const db = getFirestore(c)

  // Extract profile ID from cookie if logged in
  let profile_id = null
  const sessionCookie = getCookie(c, 'fb-session')
  if (sessionCookie) {
    try {
      // Decode JWT token directly on client session cookie without verification if we just want uid for relation
      const payload = JSON.parse(atob(sessionCookie.split('.')[1]))
      profile_id = payload.uid || payload.sub
    } catch(e) {}
  }

  const contentType = c.req.header('content-type') || ''
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }

  const full_name = (body.name || body.full_name) as string
  const phone = body.phone as string
  const age = body.age ? parseInt(body.age as string) : null
  const city = body.city as string
  const preferred_role = (body.role || body.preferred_role) as string
  const skills = body.skills as string

  if (!full_name || !phone) {
    if (!contentType.includes('application/json')) {
      return c.redirect('/volunteers?error=missing_fields')
    }
    return c.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, 400)
  }

  try {
    const volData = {
      profile_id,
      full_name,
      age,
      phone,
      city: city || '',
      preferred_role: preferred_role || '',
      skills: skills || '',
      status: 'pending',
      created_at: new Date().toISOString()
    }

    await db.collection('volunteers').add(volData)

    if (!contentType.includes('application/json')) {
      return c.redirect('/volunteers?success=1#volForm')
    }
    return c.json({ message: 'تم إرسال طلب التطوع بنجاح.' })
  } catch (error: any) {
    console.error('Error submitting volunteer app:', error.message)
    if (!contentType.includes('application/json')) {
      return c.redirect('/volunteers?error=' + encodeURIComponent(error.message))
    }
    return c.json({ error: error.message }, 500)
  }
})

// Get my volunteer applications (Requires Auth)
volunteers.get('/my', authMiddleware, async (c) => {
  const user = (c as any).get('user') as { id: string }
  const db = getFirestore(c)

  try {
    const snapshot = await db.collection('volunteers')
      .where('profile_id', '==', user.id)
      .orderBy('created_at', 'desc')
      .get()

    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update status (Admin only)
volunteers.post('/status/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()
  const status = body.status as string

  try {
    await db.collection('volunteers').doc(id).update({ status })
    return c.redirect('/dashboard/volunteers?success=1')
  } catch (error: any) {
    console.error('Error updating volunteer status:', error.message)
    return c.redirect('/dashboard/volunteers?error=1')
  }
})
