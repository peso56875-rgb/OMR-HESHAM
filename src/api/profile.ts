import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { authMiddleware } from './middleware'
import { stripHtml } from './sanitize'

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

  const full_name = stripHtml(body.full_name || body.name, 100)
  // Clean phone to allowed digits and + prefix only, capped at 20 characters
  const rawPhone = (body.phone || '').toString().trim()
  const phone = rawPhone.replace(/[^\d+]/g, '').slice(0, 20)

  if (!full_name || full_name.length < 2) {
    if (!contentType.includes('application/json')) {
      return c.redirect('/profile?error=missing_name')
    }
    return c.json({ error: 'الاسم يجب أن يحتوي على حرفين على الأقل' }, 400)
  }

  try {
    // Only safe profile fields can be modified. Role/admin privileges can NEVER be updated here.
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
