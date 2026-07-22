import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const exportApi = new Hono()

exportApi.use('*', adminMiddleware)

exportApi.get('/:collection', async (c) => {
  const collectionName = c.req.param('collection')
  const allowed = ['donations', 'volunteers', 'contacts', 'newsletter_subscribers', 'job_applications']
  if (!allowed.includes(collectionName)) {
    return c.text('المجموعة غير مسموح بها', 400)
  }

  try {
    const db = getFirestore(c)
    const snap = await db.collection(collectionName).orderBy('created_at', 'desc').get()
    const docs = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))

    if (docs.length === 0) {
      return c.text('لا توجد بيانات للتصدير', 404)
    }

    // Extract headers
    const headers = Object.keys(docs[0]).filter(k => typeof docs[0][k] !== 'object')
    const csvRows = [headers.join(',')]

    for (const doc of docs) {
      const values = headers.map(header => {
        const val = doc[header] ?? ''
        const escaped = String(val).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvRows.push(values.join(','))
    }

    const csvContent = '\uFEFF' + csvRows.join('\n') // UTF-8 BOM for Arabic support in Excel

    return c.body(csvContent, 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${collectionName}_${Date.now()}.csv"`
    })
  } catch (e: any) {
    return c.text(`خطأ في تصدير البيانات: ${e.message}`, 500)
  }
})
