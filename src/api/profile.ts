import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { authMiddleware } from './middleware'

export const profile = new Hono()

// Update profile information (Requires Auth)
profile.post('/update', authMiddleware, async (c) => {
  const db = getFirestore(c)
  const user = (c as any).get('user')

  const contentType = c.req.header('content-type') || ''
  let body: any
  try {
    if (contentType.includes('application/json')) {
      body = await c.req.json()
    } else {
      body = await c.req.parseBody()
    }
  } catch {
    return c.json({ error: 'بيانات غير صالحة' }, 400)
  }

  const full_name = (body.full_name || body.name || '').toString().trim()
  const phone = (body.phone || '').toString().trim()

  if (!full_name) {
    if (!contentType.includes('application/json')) {
      return c.redirect('/profile?error=missing_name')
    }
    return c.json({ error: 'الاسم مطلوب' }, 400)
  }

  try {
    await db.collection('profiles').doc(user.id).update({
      full_name,
      phone: phone || ''
    })

    if (!contentType.includes('application/json')) {
      return c.redirect('/profile?success=1')
    }
    return c.json({ message: 'تم تحديث الملف الشخصي بنجاح.' })
  } catch (error: any) {
    console.error('Error updating user profile:', error.message)
    if (!contentType.includes('application/json')) {
      return c.redirect('/profile?error=' + encodeURIComponent(error.message))
    }
    return c.json({ error: error.message }, 500)
  }
})
