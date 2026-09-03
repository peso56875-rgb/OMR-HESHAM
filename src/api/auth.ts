import { Hono } from 'hono'
import { getAuth, getFirestore } from '../lib/firebase-admin'
import { setCookie, deleteCookie } from 'hono/cookie'
import { notifyAdmins, notifyInBackground, dashLink } from '../lib/notifications'
import { isPlatformAdmin } from '../lib/admin-check'

export const auth = new Hono()

auth.post('/session', async (c) => {
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'بيانات غير صالحة' }, 400)
  }

  const { idToken } = body
  if (!idToken) {
    return c.json({ error: 'الرمز التعريفي مطلوب' }, 400)
  }

  try {
    const firebaseAuth = getAuth(c)
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    
    // Create the session cookie
    const sessionCookie = await firebaseAuth.createSessionCookie(idToken, { expiresIn })
    
    // Set the cookie
    setCookie(c, 'fb-session', sessionCookie, {
      path: '/',
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax'
    })

    // Get user details from Firebase Auth
    const decodedToken = await firebaseAuth.verifySessionCookie(sessionCookie)
    const email = decodedToken.email || ''
    const isAdmin = isPlatformAdmin(email, decodedToken.uid)
    let role = isAdmin ? 'admin' : 'donor'
    
    // Safely attempt Firestore profile synchronization
    try {
      const db = getFirestore(c)
      const profileRef = db.collection('profiles').doc(decodedToken.uid)
      const profileDoc = await profileRef.get()

      if (!profileDoc.exists) {
        // Check if it's the first profile in the collection to set as admin
        const profilesSnapshot = await db.collection('profiles').limit(1).get()
        const isFirst = profilesSnapshot.empty
        role = (isFirst || isAdmin) ? 'admin' : 'donor'
        const fullName = decodedToken.name || email.split('@')[0] || 'عضو جديد'

        await profileRef.set({
          full_name: fullName,
          phone: '',
          role: role,
          avatar_url: decodedToken.picture || '',
          email: email,
          created_at: new Date().toISOString()
        })

        // A7 — إشعار صامت للإدارة بانضمام مستخدم جديد للمنصة
        await notifyInBackground(c, async () => {
          await notifyAdmins(c, {
            type: 'user_registered',
            title: `مستخدم جديد مسجّل: ${fullName}`,
            body: `البريد: ${email} — الصلاحية: ${role === 'admin' ? 'مشرف' : 'عضو'}`,
            link: dashLink('users'),
            meta: { user_id: decodedToken.uid, email, full_name: fullName, role }
          })
        })
      } else {
        role = (profileDoc.data()?.role === 'admin' || isAdmin) ? 'admin' : (profileDoc.data()?.role || role)
      }
    } catch (dbErr: any) {
      console.warn('[Session Auth] Firestore sync skipped due to error (e.g. quota limit):', dbErr.message)
      // Login still succeeds because Firebase Auth session cookie is valid!
    }

    return c.json({ success: true, role, message: 'تم تسجيل الدخول بنجاح' })
  } catch (error: any) {
    console.error('[Session Auth Error]', error.message, error.stack)
    return c.json({ error: `فشل تسجيل الدخول: ${error.message}` }, 401)
  }
})

auth.get('/logout', async (c) => {
  deleteCookie(c, 'fb-session', { path: '/' })
  return c.redirect('/login')
})
