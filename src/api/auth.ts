import { Hono } from 'hono'
import { getAuth, getFirestore } from '../lib/firebase-admin'
import { setCookie, deleteCookie } from 'hono/cookie'

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

    // Get user details
    const decodedToken = await firebaseAuth.verifySessionCookie(sessionCookie)
    const db = getFirestore(c)
    
    const profileRef = db.collection('profiles').doc(decodedToken.uid)
    const profileDoc = await profileRef.get()

    let role = 'donor'
    if (!profileDoc.exists) {
      // Check if it's the first profile in the collection to set as admin
      const profilesSnapshot = await db.collection('profiles').limit(1).get()
      const isFirst = profilesSnapshot.empty
      
      // Let's also check if user has custom admin emails
      const email = decodedToken.email || ''
      const isAdminEmail = email === 'dr.omarheshamfoundation@gmail.com' || email === 'rahmmaaa9900@gmail.com' || email.startsWith('admin')
      role = (isFirst || isAdminEmail) ? 'admin' : 'donor'

      await profileRef.set({
        full_name: decodedToken.name || email.split('@')[0] || 'فاعل خير',
        phone: '',
        role: role,
        avatar_url: decodedToken.picture || '',
        email: email,
        created_at: new Date().toISOString()
      })
    } else {
      role = profileDoc.data()?.role || 'donor'
    }

    return c.json({ success: true, role, message: 'تم تسجيل الدخول بنجاح' })
  } catch (error: any) {
    console.error('[Session Auth Error]', error.message)
    return c.json({ error: 'فشل في إنشاء الجلسة، رمز غير صالح' }, 401)
  }
})

auth.get('/logout', async (c) => {
  deleteCookie(c, 'fb-session', { path: '/' })
  return c.redirect('/login')
})
