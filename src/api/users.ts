import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'
import { getEmailConfig, roleChanged } from '../lib/email'
import { notify, notifyAdmins, notifyInBackground, dashLink } from '../lib/notifications'

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

    // نقرأ البيانات القديمة **قبل** التحديث.
    // لو قرأناها بعده مش هنعرف الصلاحية السابقة، وبالتالي مش هنقدر
    // نفرّق بين «تعيين مدير» و«سحب الصلاحية»، ولا نمنع الإشعار المكرر
    // لما المشرف يحفظ نفس الصلاحية تاني.
    const profileData = profileDoc.data()!
    const oldRole = String(profileData.role || 'user')
    const targetName = profileData.full_name || profileData.email || 'المستخدم'
    const targetEmail = String(profileData.email || '')

    await profileRef.update({ role: newRole })

    // إشعار تغيّر الصلاحية — أحد الحدثين المطلوبين صراحةً من صاحب الموقع.
    // الشرط oldRole !== newRole هو الحاجز الوحيد ضد الإشعارات المكرّرة،
    // لأن واجهة اللوحة تسمح بإرسال نفس الصلاحية أكثر من مرة.
    if (oldRole !== newRole) {
      const becameAdmin = newRole === 'admin'
      const lostAdmin = oldRole === 'admin' && newRole !== 'admin'

      if (becameAdmin || lostAdmin) {
        const actorName = currentUser?.name || currentUser?.email || 'إدارة المؤسسة'

        await notifyInBackground(c, async () => {
          await Promise.allSettled([
            // 1) إشعار داخلي للمستخدم المستهدف
            notify(c, {
              user_id: id,
              type: becameAdmin ? 'role_promoted_admin' : 'role_admin_removed',
              title: becameAdmin ? 'تم تعيينك مديرًا للنظام' : 'تم تحديث صلاحيات حسابك',
              body: becameAdmin
                ? 'أصبح لديك صلاحيات كاملة على لوحة التحكم. تعامل معها بأمانة — كل إجراء يُسجَّل.'
                : 'صلاحيات مدير النظام لم تعد مرتبطة بحسابك. حسابك ما زال نشطًا بشكل طبيعي.',
              link: becameAdmin ? dashLink('overview') : '/profile',
              actor: { id: currentUser?.id || null, name: actorName },
              meta: { from: oldRole, to: newRole }
            }),

            // 2) إشعار لبقية المشرفين — تغيّر الصلاحيات حدث رقابي
            //    يجب أن يراه كل من يملك صلاحية إدارية، لا المستهدف وحده.
            notifyAdmins(c, {
              type: becameAdmin ? 'role_promoted_admin' : 'role_admin_removed',
              title: becameAdmin
                ? `تم تعيين ${targetName} مديرًا للنظام`
                : `تم سحب صلاحية الإدارة من ${targetName}`,
              body: `نُفّذ بواسطة ${actorName}.`,
              link: dashLink('users'),
              actor: { id: currentUser?.id || null, name: actorName },
              meta: { target_id: id, from: oldRole, to: newRole }
            }),

            // 3) بريد إلكتروني للمستهدف
            roleChanged(getEmailConfig(c), {
              email: targetEmail,
              name: String(targetName),
              role: newRole,
              actor: actorName
            })
          ])
        })
      }
    }

    return c.json({ 
      message: `تم تغيير صلاحية ${targetName} إلى ${newRole === 'admin' ? 'مشرف' : 'متبرع'} بنجاح`,
      data: { id, role: newRole }
    })
  } catch (error: any) {
    console.error('Error updating user role:', error.message)
    return c.json({ error: error.message }, 500)
  }
})
