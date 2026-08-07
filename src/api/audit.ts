import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

/**
 * قراءة سجل التدقيق — للإدارة فقط.
 *
 * لا توجد نقطة إنشاء أو تعديل أو حذف هنا عن قصد: السجل يُكتب حصريًا من
 * وسيط التدقيق (src/lib/audit.ts) ويبقى append-only. سجل تدقيق يمكن
 * حذف أسطر منه عبر الـ API لا يُثبت شيئًا للمراجع.
 */
export const audit = new Hono()

/** أقصى عدد أسطر في الاستجابة — يمنع تحميل سجل ضخم بالكامل في طلب واحد. */
const MAX_LIMIT = 200

audit.get('/', adminMiddleware, async (c) => {
  const db = getFirestore(c)

  try {
    const limitParam = Number(c.req.query('limit') || 50)
    const limit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 50, 1), MAX_LIMIT)
    const resource = (c.req.query('resource') || '').trim()

    let query: any = db.collection('audit_logs')
    // الترشيح على المورد يحتاج فهرسًا مركّبًا مع الترتيب، فنرتّب دائمًا
    // على created_at ونضيف where فقط عند الطلب.
    if (resource) query = query.where('resource', '==', resource)
    query = query.orderBy('created_at', 'desc').limit(limit)

    const snapshot = await query.get()
    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    return c.json({ data, count: data.length })
  } catch (error: any) {
    console.error('[audit api]', error.message)
    return c.json({ error: 'تعذّر قراءة سجل التدقيق' }, 500)
  }
})

export default audit
