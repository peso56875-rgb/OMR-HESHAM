import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { getCookie } from 'hono/cookie'
import { adminMiddleware, authMiddleware } from './middleware'
import { normalizeMediaUrl } from '../lib/storage'

export const volunteers = new Hono()

// Submit a volunteer application (accepts form data from browser or JSON)
volunteers.post('/', async (c) => {
  const db = getFirestore(c)

  // Extract profile ID from cookie if logged in
  let profile_id = null
  const sessionCookie = getCookie(c, 'fb-session')
  if (sessionCookie) {
    try {
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
  const avatar_url = body.avatar_url ? normalizeMediaUrl(body.avatar_url) : ''

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
      avatar_url,
      status: 'pending',
      volunteer_code: '',
      rank: '',
      hours_count: 0,
      team: preferred_role || '',
      approved_at: '',
      expires_at: '',
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

// Public: Verify a volunteer by code
volunteers.get('/verify/:code', async (c) => {
  const code = c.req.param('code')
  const db = getFirestore(c)

  try {
    const snap = await db.collection('volunteers')
      .where('volunteer_code', '==', code.toUpperCase())
      .where('status', '==', 'approved')
      .limit(1)
      .get()

    if (snap.empty) {
      return c.json({ found: false, message: 'لا يوجد متطوع بهذا الكود أو أن الكود غير مفعّل.' })
    }

    const vol = snap.docs[0].data()
    const isExpired = vol.expires_at && new Date(vol.expires_at) < new Date()

    return c.json({
      found: true,
      expired: isExpired,
      volunteer: {
        full_name: vol.full_name,
        volunteer_code: vol.volunteer_code,
        preferred_role: vol.preferred_role,
        team: vol.team || vol.preferred_role,
        rank: vol.rank || 'متطوع مبادر',
        hours_count: vol.hours_count || 0,
        avatar_url: vol.avatar_url || '',
        approved_at: vol.approved_at,
        expires_at: vol.expires_at
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update status (Admin only) — generates VOL code on approval
volunteers.post('/status/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()
  const status = body.status as string

  try {
    const updateData: any = { status }

    if (status === 'approved') {
      // Generate sequential volunteer code: VOL-1, VOL-2, etc.
      const allApproved = await db.collection('volunteers')
        .where('volunteer_code', '!=', '')
        .get()

      const maxNum = allApproved.docs.reduce((max: number, doc: any) => {
        const code = doc.data().volunteer_code || ''
        const match = code.match(/VOL-(\d+)/)
        return match ? Math.max(max, parseInt(match[1])) : max
      }, 0)

      const newCode = `VOL-${maxNum + 1}`
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setFullYear(expiresAt.getFullYear() + 2) // 2-year validity

      updateData.volunteer_code = newCode
      updateData.rank = 'متطوع مبادر'
      updateData.approved_at = now.toISOString()
      updateData.expires_at = expiresAt.toISOString()

      // Update user profile role to 'volunteer' if they have a profile_id
      const volDoc = await db.collection('volunteers').doc(id).get()
      const volData = volDoc.data()
      if (volData?.profile_id) {
        const profileRef = db.collection('profiles').doc(volData.profile_id)
        const profileDoc = await profileRef.get()
        if (profileDoc.exists) {
          const currentRole = profileDoc.data()?.role
          if (currentRole !== 'admin') {
            await profileRef.update({ role: 'volunteer' })
          }
        }
      }
    }

    await db.collection('volunteers').doc(id).update(updateData)
    return c.redirect('/dashboard?view=volunteers&success=1')
  } catch (error: any) {
    console.error('Error updating volunteer status:', error.message)
    return c.redirect('/dashboard?view=volunteers&error=1')
  }
})

// Update volunteer hours (Admin only)
volunteers.post('/update-hours/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()
  const hours = parseInt(body.hours as string) || 0
  const rank = body.rank as string

  try {
    const updateData: any = { hours_count: hours }
    if (rank) updateData.rank = rank

    await db.collection('volunteers').doc(id).update(updateData)
    return c.redirect('/dashboard?view=volunteers&success=1')
  } catch (error: any) {
    console.error('Error updating volunteer hours:', error.message)
    return c.redirect('/dashboard?view=volunteers&error=1')
  }
})
