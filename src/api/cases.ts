import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const cases = new Hono()

cases.use('*', adminMiddleware)

// ──────────────────────────── الحالات الإنسانية العامة المنشورة ────────────────────────────

// إضافة حالة إنسانية عامة جديدة
cases.post('/item/add', async (c) => {
  try {
    const body = await c.req.parseBody()
    const title = String(body.title || '').trim()
    const category = String(body.category || 'مساعدات إنسانية').trim()
    const target_amount = Math.max(0, Number(body.target_amount) || 0)
    const raised_amount = Math.max(0, Number(body.raised_amount) || 0)
    const beneficiary_city = String(body.beneficiary_city || '').trim()
    const urgency = String(body.urgency || 'normal').trim()
    const description = String(body.description || '').trim()
    const story_summary = String(body.story_summary || '').trim()
    let code = String(body.code || '').trim()

    if (!title || !target_amount) {
      return c.redirect('/dashboard?view=cases&tab=public&error=missing_fields')
    }

    if (!code) {
      code = `حالة #${Math.floor(100 + Math.random() * 900)}`
    }

    const user = (c as any).get('user')
    const db = getFirestore(c)

    await db.collection('beneficiary_cases').add({
      title,
      code,
      category,
      target_amount,
      raised_amount,
      beneficiary_city,
      urgency: ['critical', 'high', 'normal'].includes(urgency) ? urgency : 'normal',
      description,
      story_summary,
      is_published: true,
      is_active: true,
      created_by: user?.name || 'مشرف',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    return c.redirect('/dashboard?view=cases&tab=public&success=case_added')
  } catch (e: any) {
    console.error('[Case Item Add Error]', e)
    return c.redirect('/dashboard?view=cases&tab=public&error=server')
  }
})

// تعديل حالة إنسانية
cases.post('/item/update/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.parseBody()
    const title = String(body.title || '').trim()
    const category = String(body.category || '').trim()
    const target_amount = Number(body.target_amount)
    const raised_amount = Number(body.raised_amount)
    const beneficiary_city = String(body.beneficiary_city || '').trim()
    const urgency = String(body.urgency || 'normal').trim()
    const description = String(body.description || '').trim()
    const story_summary = String(body.story_summary || '').trim()
    const code = String(body.code || '').trim()

    const db = getFirestore(c)
    const ref = db.collection('beneficiary_cases').doc(id)
    const doc = await ref.get()

    if (!doc.exists) {
      return c.redirect('/dashboard?view=cases&tab=public&error=not_found')
    }

    const updates: any = {
      updated_at: new Date().toISOString()
    }
    if (title) updates.title = title
    if (code) updates.code = code
    if (category) updates.category = category
    if (!isNaN(target_amount) && target_amount >= 0) updates.target_amount = target_amount
    if (!isNaN(raised_amount) && raised_amount >= 0) updates.raised_amount = raised_amount
    if (beneficiary_city !== undefined) updates.beneficiary_city = beneficiary_city
    if (['critical', 'high', 'normal'].includes(urgency)) updates.urgency = urgency
    if (description !== undefined) updates.description = description
    if (story_summary !== undefined) updates.story_summary = story_summary
    if (body.is_published !== undefined) updates.is_published = body.is_published === 'true' || body.is_published === '1'

    await ref.update(updates)
    return c.redirect('/dashboard?view=cases&tab=public&success=case_updated')
  } catch (e: any) {
    console.error('[Case Item Update Error]', e)
    return c.redirect('/dashboard?view=cases&tab=public&error=server')
  }
})

// تبديل حالة النشر لحالة إنسانية
cases.post('/item/toggle/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = getFirestore(c)
    const ref = db.collection('beneficiary_cases').doc(id)
    const doc = await ref.get()

    if (!doc.exists) {
      return c.redirect('/dashboard?view=cases&tab=public&error=not_found')
    }

    const current = Boolean(doc.data()?.is_published)
    await ref.update({
      is_published: !current,
      updated_at: new Date().toISOString()
    })

    return c.redirect('/dashboard?view=cases&tab=public&success=case_toggled')
  } catch (e: any) {
    console.error('[Case Item Toggle Error]', e)
    return c.redirect('/dashboard?view=cases&tab=public&error=server')
  }
})

// حذف حالة إنسانية
cases.post('/item/delete/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = getFirestore(c)
    await db.collection('beneficiary_cases').doc(id).delete()
    return c.redirect('/dashboard?view=cases&tab=public&success=case_deleted')
  } catch (e: any) {
    console.error('[Case Item Delete Error]', e)
    return c.redirect('/dashboard?view=cases&tab=public&error=server')
  }
})

// ──────────────────────────── أرشيف كشوفات المساعدات (دفعات الأسماء) ────────────────────────────

// إضافة دفعة أسماء مستفيدين جديدة
cases.post('/groups/add', async (c) => {
  try {
    const body = await c.req.parseBody()
    const title = String(body.title || '').trim()
    const aid_type = String(body.aid_type || '').trim()
    const namesRaw = String(body.names || '').trim()
    const user = (c as any).get('user')

    if (!namesRaw) {
      return c.redirect('/dashboard?view=cases&tab=groups&error=missing_fields')
    }

    // تقسيم الأسماء: كل سطر = اسم، وإزالة الفراغات والأسماء الفارغة والمكررة
    const namesArr = namesRaw
      .split('\n')
      .map((n: string) => n.trim())
      .filter((n: string) => n.length > 0)

    // إزالة التكرار مع الحفاظ على الترتيب
    const uniqueNames = [...new Set(namesArr)]

    if (uniqueNames.length === 0) {
      return c.redirect('/dashboard?view=cases&tab=groups&error=no_names')
    }

    const db = getFirestore(c)
    await db.collection('beneficiary_groups').add({
      title: title || 'دفعة أسماء عامة',
      aid_type: aid_type || 'عام',
      names: uniqueNames,
      total_count: uniqueNames.length,
      created_by: user?.name || 'مشرف',
      created_at: new Date().toISOString()
    })

    return c.redirect('/dashboard?view=cases&tab=groups&success=group_added')
  } catch (e: any) {
    console.error('[Cases Add Error]', e)
    return c.redirect('/dashboard?view=cases&tab=groups&error=server')
  }
})

// حذف مجموعة
cases.post('/groups/delete/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = getFirestore(c)
    await db.collection('beneficiary_groups').doc(id).delete()
    return c.redirect('/dashboard?view=cases&tab=groups&success=group_deleted')
  } catch (e: any) {
    console.error('[Cases Delete Error]', e)
    return c.redirect('/dashboard?view=cases&tab=groups&error=server')
  }
})

// تصفير جميع الأسماء بالأرشيف
cases.post('/clear-all', async (c) => {
  try {
    const db = getFirestore(c)
    const snap = await db.collection('beneficiary_groups').get()
    const batch = db.batch()
    snap.docs.forEach((doc: any) => {
      batch.delete(doc.ref)
    })
    await batch.commit()
    return c.redirect('/dashboard?view=cases&tab=groups&success=cleared')
  } catch (e: any) {
    console.error('[Cases Clear All Error]', e)
    return c.redirect('/dashboard?view=cases&tab=groups&error=server')
  }
})
