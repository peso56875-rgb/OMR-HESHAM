import { Hono } from 'hono'
import { getAuth, getFirestore } from '../lib/firebase-admin'
import { setCookie, deleteCookie } from 'hono/cookie'
import { notifyAdmins, notifyInBackground, dashLink } from '../lib/notifications'
import { isVerifiedPlatformAdminAsync, appointAdmin } from '../lib/admin-check'
import { rateLimiter } from './middleware'

export const auth = new Hono()

auth.post('/session', rateLimiter(10, 60000, 'session'), async (c) => {
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
    const isAdmin = await isVerifiedPlatformAdminAsync(c, email, decodedToken.uid, decodedToken.email_verified === true)
    let role = isAdmin ? 'admin' : 'donor'
    
    // Safely attempt Firestore profile synchronization
    try {
      const db = getFirestore(c)
      const profileRef = db.collection('profiles').doc(decodedToken.uid)
      const profileDoc = await profileRef.get()

      if (!profileDoc.exists) {
        role = isAdmin ? 'admin' : 'donor'
        const fullName = decodedToken.name || email.split('@')[0] || 'عضو جديد'

        await profileRef.set({
          full_name: fullName,
          phone: '',
          role: role,
          avatar_url: decodedToken.picture || '',
          email: email,
          created_at: new Date().toISOString()
        })

        // إذا كان مشرفاً، تأكيد تسجيله في platform_admins بالـ UID
        if (isAdmin) {
          await appointAdmin(c, decodedToken.uid, email, fullName, 'system', 'تسجيل دخول موثق').catch(() => {})
        }

        // إشعار صامت للإدارة بانضمام مستخدم جديد للمنصة
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
        const storedRole = String(profileDoc.data()?.role || role)
        role = isAdmin ? 'admin' : (storedRole === 'admin' ? 'donor' : storedRole)

        // مزامنة حالة الدور في profiles إذا كان مختلفاً
        if (isAdmin && storedRole !== 'admin') {
          await profileRef.update({ role: 'admin' }).catch(() => {})
        }

        // إذا كان مشرفاً، تأكيد تسجيله في platform_admins
        if (isAdmin) {
          const fullName = profileDoc.data()?.full_name || decodedToken.name || email.split('@')[0]
          await appointAdmin(c, decodedToken.uid, email, fullName, 'system', 'تأكيد هوية المشرف').catch(() => {})
        }
      }
    } catch (dbErr: any) {
      console.warn('[Session Auth] Firestore sync skipped due to error (e.g. quota limit):', dbErr.message)
      // Login still succeeds because Firebase Auth session cookie is valid!
    }

    return c.json({ success: true, role, message: 'تم تسجيل الدخول بنجاح' })
  } catch (error: any) {
    console.error('[Session Auth Error]', error.message, error.stack)
    return c.json({ error: 'فشل تسجيل الدخول. يرجى التحقق من بياناتك وإعادة المحاولة.' }, 401)
  }
})

auth.get('/logout', async (c) => {
  deleteCookie(c, 'fb-session', { path: '/' })
  return c.redirect('/login')
})
