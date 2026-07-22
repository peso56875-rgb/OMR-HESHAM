import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const cases = new Hono()

cases.use('*', adminMiddleware)

// إضافة مجموعة مستفيدين جديدة
cases.post('/groups/add', async (c) => {
  try {
    const body = await c.req.parseBody()
    const title = String(body.title || '').trim()
    const aid_type = String(body.aid_type || '').trim()
    const namesRaw = String(body.names || '').trim()
    const user = (c as any).get('user')

    if (!title || !namesRaw) {
      return c.redirect('/dashboard?view=cases&error=missing_fields')
    }

    // تقسيم الأسماء: كل سطر = اسم، وإزالة الفراغات والأسماء الفارغة والمكررة
    const namesArr = namesRaw
      .split('\n')
      .map((n: string) => n.trim())
      .filter((n: string) => n.length > 0)

    // إزالة التكرار مع الحفاظ على الترتيب
    const uniqueNames = [...new Set(namesArr)]

    if (uniqueNames.length === 0) {
      return c.redirect('/dashboard?view=cases&error=no_names')
    }

    const db = getFirestore(c)
    await db.collection('beneficiary_groups').add({
      title,
      aid_type: aid_type || 'غير محدد',
      names: uniqueNames,
      total_count: uniqueNames.length,
      created_by: user?.name || 'مشرف',
      created_at: new Date().toISOString()
    })

    return c.redirect('/dashboard?view=cases&success=group_added')
  } catch (e: any) {
    console.error('[Cases Add Error]', e)
    return c.redirect('/dashboard?view=cases&error=server')
  }
})

// حذف مجموعة
cases.post('/groups/delete/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = getFirestore(c)
    await db.collection('beneficiary_groups').doc(id).delete()
    return c.redirect('/dashboard?view=cases&success=group_deleted')
  } catch (e: any) {
    console.error('[Cases Delete Error]', e)
    return c.redirect('/dashboard?view=cases&error=server')
  }
})
