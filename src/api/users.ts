import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'
import { 
  isSeedAdmin, 
  appointAdmin, 
  appointAdminByEmail, 
  removeAdmin, 
  listAllAdmins,
  normalizeEmail
} from '../lib/admin-check'
import { getEmailConfig, roleChanged } from '../lib/email'
import { notify, notifyAdmins, notifyInBackground, dashLink } from '../lib/notifications'

export const users = new Hono()

// Get all users (Admin only)
users.get('/', adminMiddleware, async (c) => {
  const db = getFirestore(c)

  try {
    const [snapshot, adminsSnap] = await Promise.all([
      db.collection('profiles').orderBy('created_at', 'desc').get(),
      db.collection('platform_admins').where('active', '==', true).get().catch(() => ({ docs: [] }))
    ])

    const activeAdminSet = new Set<string>()
    adminsSnap.docs.forEach((d: any) => {
      const data = d.data()
      if (data.uid) activeAdminSet.add(data.uid)
      if (data.email) activeAdminSet.add(normalizeEmail(data.email))
    })

    const data = snapshot.docs.map((doc: any) => {
      const d = doc.data()
      const isAdm = d.role === 'admin' || isSeedAdmin(d.email, doc.id) || activeAdminSet.has(doc.id) || activeAdminSet.has(normalizeEmail(d.email || ''))
      return {
        id: doc.id,
        ...d,
        role: isAdm ? 'admin' : (d.role || 'donor')
      }
    })

    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get all admins list (Admin only)
users.get('/admins', adminMiddleware, async (c) => {
  try {
    const list = await listAllAdmins(c)
    return c.json({ data: list })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Appoint admin by email directly (Admin only)
users.post('/appoint-email', adminMiddleware, async (c) => {
  const contentType = c.req.header('content-type') || ''
  const acceptsJson = c.req.header('accept')?.includes('application/json')
  let body: any
  try {
    if (contentType.includes('application/json')) {
      body = await c.req.json()
    } else {
      body = await c.req.parseBody()
    }
  } catch {
    if (acceptsJson) return c.json({ error: 'بيانات غير صالحة' }, 400)
    return c.redirect('/dashboard?view=users&error=invalid_data')
  }

  const rawEmail = (body.email || '').toString().trim()
  const email = normalizeEmail(rawEmail)

  if (!email || !email.includes('@')) {
    if (acceptsJson) return c.json({ error: 'يرجى إدخال بريد إلكتروني صالح' }, 400)
    return c.redirect('/dashboard?view=users&error=invalid_email')
  }

  const currentUser = (c as any).get('user')
  const actorId = currentUser?.id || 'admin'
  const actorName = currentUser?.name || currentUser?.email || 'مشرف المنصة'

  try {
    const res = await appointAdminByEmail(c, email, actorId, actorName)
    if (!res.success) {
      if (acceptsJson) return c.json({ error: res.error || 'فشل تعيين المشرف' }, 400)
      return c.redirect(`/dashboard?view=users&error=${encodeURIComponent(res.error || 'failed')}`)
    }

    // إشعارات
    await notifyInBackground(c, async () => {
      await Promise.allSettled([
        // إشعار لجميع المشرفين بالتعيين الجديد
        notifyAdmins(c, {
          type: 'role_promoted_admin',
          title: `تم تعيين مشرف جديد: ${res.name || email}`,
          body: `قام ${actorName} بتعيين البريد (${email}) كمشرف على المنصة.`,
          link: dashLink('users'),
          actor: { id: actorId, name: actorName },
          meta: { email, appointed_by: actorName, user_found: res.userFound }
        }),
        // إذا كان حسابه موجوداً مسجلاً، نرسل له إشعاراً في حسابه وبريد
        res.uid ? notify(c, {
          user_id: res.uid,
          type: 'role_promoted_admin',
          title: 'تم تعيينك مديرًا ومشرفًا للنظام',
          body: 'أصبح لديك الآن كامل الصلاحيات الإدارية على لوحة التحكم.',
          link: dashLink('overview'),
          actor: { id: actorId, name: actorName },
          meta: { from: 'donor', to: 'admin' }
        }) : Promise.resolve(),
        // إرسال بريد
        roleChanged(getEmailConfig(c), {
          email: email,
          name: res.name || email.split('@')[0],
          role: 'admin',
          actor: actorName
        })
      ])
    })

    if (acceptsJson) {
      return c.json({
        success: true,
        message: `تم بنجاح تعيين ${email} مشرفًا على المنصة`,
        user_found: res.userFound
      })
    }
    return c.redirect('/dashboard?view=users&success=admin_appointed')
  } catch (error: any) {
    console.error('Error appointing admin by email:', error.message)
    if (acceptsJson) return c.json({ error: error.message }, 500)
    return c.redirect('/dashboard?view=users&error=server_error')
  }
})

// Update user role (Admin only)
users.post('/role/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string

  const contentType = c.req.header('content-type') || ''
  const acceptsJson = c.req.header('accept')?.includes('application/json')
  let body: any
  try {
    if (contentType.includes('application/json')) {
      body = await c.req.json()
    } else {
      body = await c.req.parseBody()
    }
  } catch {
    if (acceptsJson) return c.json({ error: 'بيانات غير صالحة' }, 400)
    return c.redirect('/dashboard?view=users&error=invalid_data')
  }

  const newRole = (body.role || '').toString().trim()

  if (!newRole || !['admin', 'donor'].includes(newRole)) {
    if (acceptsJson) return c.json({ error: 'الصلاحية غير صالحة. استخدم admin أو donor' }, 400)
    return c.redirect('/dashboard?view=users&error=invalid_role')
  }

  // Prevent admin from demoting themselves
  const currentUser = (c as any).get('user')
  if (currentUser && currentUser.id === id && newRole !== 'admin') {
    if (acceptsJson) return c.json({ error: 'لا يمكنك إزالة صلاحية المشرف عن نفسك' }, 400)
    return c.redirect('/dashboard?view=users&error=self_demotion')
  }

  try {
    const profileRef = db.collection('profiles').doc(id)
    const profileDoc = await profileRef.get()

    if (!profileDoc.exists) {
      if (acceptsJson) return c.json({ error: 'المستخدم غير موجود' }, 404)
      return c.redirect('/dashboard?view=users&error=user_not_found')
    }

    const profileData = profileDoc.data()!
    const oldRole = String(profileData.role || 'user')
    const targetName = profileData.full_name || profileData.email || 'المستخدم'
    const targetEmail = String(profileData.email || '')
    const actorName = currentUser?.name || currentUser?.email || 'إدارة المؤسسة'
    const actorId = currentUser?.id || 'admin'

    // حماية المؤسسين الثابتين من إزالة الإشراف
    if (newRole !== 'admin' && isSeedAdmin(targetEmail, id)) {
      if (acceptsJson) return c.json({ error: 'لا يمكن إزالة صلاحية المؤسسين الأساسيين للمنصة للحفاظ على أمان النظام' }, 403)
      return c.redirect('/dashboard?view=users&error=seed_admin_protected')
    }

    if (newRole === 'admin') {
      // تعيين كمشرف
      const appointRes = await appointAdmin(c, id, targetEmail, targetName, actorId, actorName)
      if (!appointRes.success) {
        if (acceptsJson) return c.json({ error: appointRes.error || 'فشل التعيين' }, 500)
        return c.redirect('/dashboard?view=users&error=appoint_failed')
      }
    } else {
      // إزالة الإشراف وتنزيل لرتبة عضو
      const removeRes = await removeAdmin(c, id, targetEmail, actorId, actorName)
      if (!removeRes.success) {
        if (acceptsJson) return c.json({ error: removeRes.error || 'فشل إزالة المشرف' }, 400)
        return c.redirect('/dashboard?view=users&error=remove_failed')
      }
    }

    // إرسال الإشعارات والبريد
    if (oldRole !== newRole) {
      const becameAdmin = newRole === 'admin'

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
            actor: { id: actorId, name: actorName },
            meta: { from: oldRole, to: newRole }
          }),

          // 2) إشعار لبقية المشرفين
          notifyAdmins(c, {
            type: becameAdmin ? 'role_promoted_admin' : 'role_admin_removed',
            title: becameAdmin
              ? `تم تعيين ${targetName} مديرًا للنظام`
              : `تم سحب صلاحية الإدارة من ${targetName}`,
            body: `نُفّذ بواسطة ${actorName}.`,
            link: dashLink('users'),
            actor: { id: actorId, name: actorName },
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

    if (acceptsJson) {
      return c.json({ 
        message: `تم تغيير صلاحية ${targetName} إلى ${newRole === 'admin' ? 'مشرف' : 'عضو'} بنجاح`,
        data: { id, role: newRole }
      })
    }

    return c.redirect('/dashboard?view=users&success=role_updated')
  } catch (error: any) {
    console.error('Error updating user role:', error.message)
    if (acceptsJson) return c.json({ error: error.message }, 500)
    return c.redirect('/dashboard?view=users&error=server_error')
  }
})
