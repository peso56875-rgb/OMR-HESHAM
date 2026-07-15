import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const users = new Hono()

// Get all users (Admin only)
users.get('/', adminMiddleware, async (c) => {
  const db = getFirestore(c)

  try {
    const snapshot = await db.collection('profiles').orderBy('created_at', 'desc').get()
    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update user role (Admin only)
users.post('/role/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string

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

  const newRole = (body.role || '').toString().trim()

  if (!newRole || !['admin', 'donor'].includes(newRole)) {
    return c.json({ error: 'الصلاحية غير صالحة. استخدم admin أو donor' }, 400)
  }

  // Prevent admin from demoting themselves
  const currentUser = (c as any).get('user')
  if (currentUser && currentUser.id === id && newRole !== 'admin') {
    return c.json({ error: 'لا يمكنك إزالة صلاحية المشرف عن نفسك' }, 400)
  }

  try {
    const profileRef = db.collection('profiles').doc(id)
    const profileDoc = await profileRef.get()

    if (!profileDoc.exists) {
      return c.json({ error: 'المستخدم غير موجود' }, 404)
    }

    await profileRef.update({ role: newRole })

    const profileData = profileDoc.data()!
    return c.json({ 
      message: `تم تغيير صلاحية ${profileData.full_name || profileData.email} إلى ${newRole === 'admin' ? 'مشرف' : 'متبرع'} بنجاح`,
      data: { id, role: newRole }
    })
  } catch (error: any) {
    console.error('Error updating user role:', error.message)
    return c.json({ error: error.message }, 500)
  }
})
