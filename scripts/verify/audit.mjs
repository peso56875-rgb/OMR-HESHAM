/**
 * فحص سجل التدقيق — Audit trail verification harness
 *
 * يُشغَّل بـ: npx tsx scripts/verify/audit.mjs
 *
 * لا يوجد إطار اختبارات في المشروع بعد (بند 3.11)، فهذا ملف تحقق قائم
 * بذاته على نمط scripts/verify/receipts.mjs. وُضع داخل المستودع حتى
 * يمكن إعادة تشغيله عند أي تعديل على منطق التدقيق.
 */
import { sanitize, parseTarget, makeAuditMiddleware, writeAudit } from '../../src/lib/audit.ts'

// قاعدة بيانات وهمية تُحقن في الوسيط: بدون الحقن كان الوسيط يستورد
// Firestore الحقيقية فيكتب صفوفًا تجريبية في بيانات الإنتاج.
const mw = (db) => makeAuditMiddleware(() => db)

let pass = 0, fail = 0
const check = (name, ok, extra = '') => {
  ok ? pass++ : fail++
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `  ${extra}`}`)
}

console.log('\n  تنقية الحقول الحسّاسة:')
{
  const out = sanitize({
    donor_name: 'أحمد',
    password: 'hunter2',
    receipt_token: 'abc123',
    FIREBASE_PRIVATE_KEY: 'xxx',
    nested: { apiKey: 'k', amount: 500 },
  })
  check('الاسم يبقى', out.donor_name === 'أحمد')
  check('كلمة المرور محجوبة', out.password === '[محجوب]', JSON.stringify(out.password))
  check('توقيع الإيصال محجوب', out.receipt_token === '[محجوب]')
  check('المفتاح الخاص محجوب (غير حسّاس لحالة الأحرف)', out.FIREBASE_PRIVATE_KEY === '[محجوب]')
  check('الحجب يعمل داخل الكائنات المتداخلة', out.nested.apiKey === '[محجوب]')
  check('المبلغ المتداخل يبقى', out.nested.amount === 500)
}

console.log('\n  قصّ القيم الطويلة:')
{
  const long = 'x'.repeat(1000)
  const out = sanitize({ note: long })
  check('القيمة الطويلة تُقصّ', out.note.length < 400, `الطول ${out.note.length}`)
  check('القصّ يذكر الطول الأصلي', out.note.includes('1000'))
  const short = sanitize({ note: 'قصير' })
  check('القيمة القصيرة لا تُمس', short.note === 'قصير')
}

console.log('\n  المصفوفات والعمق:')
{
  const out = sanitize({ items: Array.from({ length: 30 }, (_, i) => i) })
  check('المصفوفة تُقصّ إلى 20 عنصرًا + ملاحظة', out.items.length === 21, `الطول ${out.items.length}`)
  check('الملاحظة تذكر العدد المتبقي', String(out.items[20]).includes('10'))

  let deep = { v: 'قاع' }
  for (let i = 0; i < 8; i++) deep = { child: deep }
  const d = sanitize(deep)
  check('العمق المفرط يُقطع بدل التعليق', JSON.stringify(d).includes('عميق جدًا'))
}

console.log('\n  الأنواع البسيطة:')
{
  check('null يبقى null', sanitize(null) === null)
  check('undefined يبقى undefined', sanitize(undefined) === undefined)
  check('الأرقام تبقى', sanitize(42) === 42)
  check('القيم المنطقية تبقى', sanitize(true) === true)
}

console.log('\n  استنتاج المورد والمعرّف من المسار:')
{
  const cases = [
    ['/api/donations/status/abc123', 'donations', 'abc123'],
    ['/api/campaigns/xyz789', 'campaigns', 'xyz789'],
    ['/api/treasury', 'treasury', null],
    ['/api/cases/bulk', 'cases', null],          // bulk فعل لا معرّف
    ['/api/news/publish', 'news', null],          // publish فعل لا معرّف
    ['/api/volunteers/approve', 'volunteers', null],
  ]
  for (const [path, res, id] of cases) {
    const t = parseTarget(path)
    check(`${path} → ${res}/${id}`, t.resource === res && t.id === id, JSON.stringify(t))
  }
}

// ── سياق وهمي لمحاكاة Hono بدون شبكة أو Firestore ──
const fakeDb = () => {
  const rows = []
  return {
    rows,
    collection: () => ({ add: async (doc) => { rows.push(doc); return { id: `id${rows.length}` } } }),
  }
}

const fakeCtx = ({ method = 'POST', path = '/api/campaigns/abc', status = 200, body = null, user = null, headers = {} }) => {
  const store = {}
  return {
    req: {
      method,
      path,
      json: async () => {
        if (body === null) throw new Error('no body')
        return body
      },
      header: (k) => headers[k.toLowerCase()],
    },
    res: { status },
    get: (k) => (k === 'user' ? user : store[k]),
    set: (k, v) => { store[k] = v },
  }
}

console.log('\n  كتابة السجل — لا ترمي استثناءً أبدًا:')
{
  const broken = { collection: () => ({ add: async () => { throw new Error('firestore down') } }) }
  let threw = false
  try {
    await writeAudit(broken, { action: 'create', resource: 'x', created_at: 'now' })
  } catch { threw = true }
  check('تعطّل Firestore لا يُفشل العملية', !threw)
}

console.log('\n  الوسيط — ماذا يُسجّل وماذا يتجاهل:')
{
  // 1) عملية تعديل ناجحة تُسجّل فعلًا — يُتحقق من الصف المكتوب لا من عدم الرمي
  const db1 = fakeDb()
  const c1 = fakeCtx({
    method: 'POST', path: '/api/campaigns/abc', status: 201,
    body: { title: 'حملة', password: 'secret' },
    user: { id: 'u1', email: 'a@b.com', name: 'مدير' },
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '1.2.3.4', 'user-agent': 'UA' },
  })
  await mw(db1)(c1, async () => {})
  check('العملية الناجحة تُكتب صفًا واحدًا', db1.rows.length === 1, `العدد ${db1.rows.length}`)
  const r = db1.rows[0] || {}
  check('نوع العملية create', r.action === 'create', r.action)
  check('المورد campaigns', r.resource === 'campaigns', r.resource)
  check('المعرّف abc', r.target_id === 'abc', r.target_id)
  check('الفاعل مُسجَّل', r.actor_email === 'a@b.com' && r.actor_id === 'u1')
  check('عنوان IP مُسجَّل', r.ip === '1.2.3.4', r.ip)
  check('الحمولة مُسجَّلة', r.payload?.title === 'حملة')
  check('كلمة المرور محجوبة في الصف الفعلي', r.payload?.password === '[محجوب]', JSON.stringify(r.payload))
  check('الطابع الزمني موجود', typeof r.created_at === 'string' && r.created_at.includes('T'))

  // 2) GET لا يُسجّل ولا يُقرأ جسمه
  const db2 = fakeDb()
  let jsonCalled = false
  const c2 = fakeCtx({ method: 'GET', path: '/api/campaigns', status: 200, headers: { 'content-type': 'application/json' } })
  c2.req.json = async () => { jsonCalled = true; return {} }
  await mw(db2)(c2, async () => {})
  check('GET لا يُقرأ جسمه', !jsonCalled)
  check('GET لا يُسجّل', db2.rows.length === 0, `العدد ${db2.rows.length}`)

  // 3) العملية الفاشلة لا تُسجّل — ليست تغييرًا في البيانات
  const db3 = fakeDb()
  let nextRan = false
  const c3 = fakeCtx({ method: 'POST', path: '/api/campaigns/add', status: 403, body: { a: 1 }, headers: { 'content-type': 'application/json' } })
  await mw(db3)(c3, async () => { nextRan = true })
  check('المعالج يُنفّذ دائمًا', nextRan)
  check('حالة 403 لا تُسجّل', db3.rows.length === 0, `العدد ${db3.rows.length}`)

  // 4) مسارات المصادقة تُستثنى
  const db4 = fakeDb()
  const c4 = fakeCtx({ method: 'POST', path: '/api/auth/login', status: 200, body: { email: 'a@b.com' }, headers: { 'content-type': 'application/json' } })
  await mw(db4)(c4, async () => {})
  check('تسجيل الدخول لا يُسجّل كتغيير إداري', db4.rows.length === 0)

  // 5) DELETE يُسجّل بنوع delete
  const db5 = fakeDb()
  const c5 = fakeCtx({ method: 'DELETE', path: '/api/cases/xyz', status: 200, headers: {} })
  await mw(db5)(c5, async () => {})
  check('DELETE يُسجّل بنوع delete', db5.rows[0]?.action === 'delete', db5.rows[0]?.action)

  // 6) multipart لا يُقرأ جسمه (قد يحمل ملفات ضخمة) لكن يُسجّل
  const db6 = fakeDb()
  let mpJson = false
  const c6 = fakeCtx({ method: 'POST', path: '/api/upload/image', status: 200, headers: { 'content-type': 'multipart/form-data; boundary=x' } })
  c6.req.json = async () => { mpJson = true; return {} }
  await mw(db6)(c6, async () => {})
  check('multipart لا يُقرأ جسمه', !mpJson)
  check('multipart يُسجّل بحمولة فارغة', db6.rows.length === 1 && db6.rows[0].payload === null)

  // 7) تعطّل قاعدة البيانات لا يُفشل الطلب
  const broken = { collection: () => ({ add: async () => { throw new Error('down') } }) }
  let threw = false
  const c7 = fakeCtx({ method: 'POST', path: '/api/cases/abc', status: 200, body: { a: 1 }, headers: { 'content-type': 'application/json' } })
  try { await mw(broken)(c7, async () => {}) } catch { threw = true }
  check('تعطّل السجل لا يُفشل الطلب', !threw)
}

console.log('\n══════════════════════════════════════════════')
console.log(`  ${pass} ناجح · ${fail} فاشل`)
console.log('══════════════════════════════════════════════')
process.exit(fail ? 1 : 0)
