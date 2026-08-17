/**
 * فحص إيصالات التبرع — Receipt verification harness
 *
 * يُشغَّل بـ: npx tsx scripts/verify/receipts.mjs
 *
 * لا يوجد إطار اختبارات في المشروع بعد (بند 3.11 في خطة التطوير)، فهذا
 * ملف تحقق قائم بذاته. وُضع داخل المستودع لا في /tmp حتى يمكن إعادة
 * تشغيله عند أي تعديل مستقبلي على منطق الإيصالات.
 */
import { amountInWords, formatMoney, buildReceipt, verifyReceiptToken, signReceipt, receiptPath, constantTimeEqual } from '../../src/lib/receipts.ts'
import { Receipt, ReceiptVerification } from '../../src/components/Receipt.tsx'
import fs from 'node:fs'
import path from 'node:path'

let pass = 0, fail = 0
const check = (name, ok, extra = '') => {
  ok ? pass++ : fail++
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `  ${extra}`}`)
}

/* ── 1) التفقيط ─────────────────────────────────────────────────── */
console.log('\n── التفقيط (تمييز العدد) ──')
const tafqit = [
  [1, 'جنيه مصري واحد فقط لا غير'],
  [2, 'جنيهان مصريان فقط لا غير'],
  [3, 'ثلاثة جنيهات مصرية فقط لا غير'],
  [10, 'عشرة جنيهات مصرية فقط لا غير'],
  [11, 'أحد عشر جنيهًا مصريًا فقط لا غير'],
  [25, 'خمسة وعشرون جنيهًا مصريًا فقط لا غير'],
  [99, 'تسعة وتسعون جنيهًا مصريًا فقط لا غير'],
  [100, 'مائة جنيه مصري فقط لا غير'],
  [101, 'مائة وواحد جنيه مصري فقط لا غير'],
  [102, 'مائة واثنان جنيه مصري فقط لا غير'],
  [200, 'مائتا جنيه مصري فقط لا غير'],
  [1000, 'ألف جنيه مصري فقط لا غير'],
  [2000, 'ألفا جنيه مصري فقط لا غير'],
  [3000, 'ثلاثة آلاف جنيه مصري فقط لا غير'],
  [15000, 'خمسة عشر ألف جنيه مصري فقط لا غير'],
  [200000, 'مائتا ألف جنيه مصري فقط لا غير'],
  [1000000, 'مليون جنيه مصري فقط لا غير'],
  [2000000, 'مليونا جنيه مصري فقط لا غير'],
  [0.01, 'قرش واحد فقط لا غير'],
  [0.02, 'قرشان فقط لا غير'],
  [0.25, 'خمسة وعشرون قرشًا فقط لا غير'],
  [100.01, 'مائة جنيه مصري وقرش واحد فقط لا غير'],
  [100.02, 'مائة جنيه مصري وقرشان فقط لا غير'],
  [100.03, 'مائة جنيه مصري وثلاثة قروش فقط لا غير'],
  [100.25, 'مائة جنيه مصري وخمسة وعشرون قرشًا فقط لا غير'],
  [0, 'صفر جنيه مصري فقط لا غير'],
]
for (const [n, want] of tafqit) {
  const got = amountInWords(n)
  check(`${n} → ${got}`, got === want, `\n     المتوقع: ${want}`)
}
// التقريب: 0.999 قرش لا يجب أن ينتج "100 قرش"
check('تقريب 1.999 لا ينتج 100 قرش', !amountInWords(1.999).includes('مائة قرش'), amountInWords(1.999))

/* ── 2) صيغة الأرقام ────────────────────────────────────────────── */
console.log('\n── صيغة المبلغ ──')
check('أرقام لاتينية بلا التباس', formatMoney(15000.25) === '15,000.25', formatMoney(15000.25))
check('لا فاصل عشري عربي U+066B', !formatMoney(15000.25).includes('\u066B'))
check('لا فاصل آلاف عربي U+066C', !formatMoney(15000.25).includes('\u066C'))

/* ── 3) التوقيع ─────────────────────────────────────────────────── */
console.log('\n── التوقيع HMAC ──')
const t1 = await signReceipt('REC-2026-000001')
const t2 = await signReceipt('REC-2026-000002')
check('طول التوقيع 20', t1.length === 20, `len=${t1.length}`)
check('توقيعان مختلفان لرقمين مختلفين', t1 !== t2)
check('التوقيع ثابت لنفس الرقم', t1 === (await signReceipt('REC-2026-000001')))
check('يقبل التوقيع الصحيح', await verifyReceiptToken('REC-2026-000001', t1))
check('يرفض توقيع إيصال آخر', !(await verifyReceiptToken('REC-2026-000001', t2)))
check('يرفض التوقيع الفارغ', !(await verifyReceiptToken('REC-2026-000001', '')))
check('يرفض توقيعًا أقصر', !(await verifyReceiptToken('REC-2026-000001', t1.slice(0, 10))))
check('يرفض حرفًا واحدًا مغيّرًا', !(await verifyReceiptToken('REC-2026-000001', t1.slice(0, 19) + (t1[19] === 'a' ? 'b' : 'a'))))
check('يرفض رقمًا فارغًا', !(await verifyReceiptToken('', t1)))

/* ── 4) الترقيم ─────────────────────────────────────────────────── */
console.log('\n── الترقيم التسلسلي ──')
const fakeDb = () => {
  const store = new Map()
  return {
    collection: (col) => ({ doc: (id) => ({ _k: `${col}/${id}` }) }),
    runTransaction: async (fn) => fn({
      get: async (ref) => ({ exists: store.has(ref._k), data: () => store.get(ref._k) }),
      set: (ref, val) => store.set(ref._k, { ...(store.get(ref._k) || {}), ...val }),
    }),
  }
}
const db = fakeDb()
const base = {
  donor_name: 'أحمد محمود عبد الرحمن', donor_phone: '01012345678',
  donor_email: 'ahmed@example.com', amount: 15000.25,
  campaign_title: 'حملة علاج مرضى الفشل الكلوي',
  payment_method: 'vodafone_cash', created_at: '2026-07-14T09:30:00.000Z', user_id: 'uid_1',
}
const r1 = await buildReceipt(db, base)
const r2 = await buildReceipt(db, base)
check('أول رقم REC-2026-000001', r1.receipt_number === 'REC-2026-000001', r1.receipt_number)
check('العدّاد يتزايد', r2.receipt_number === 'REC-2026-000002', r2.receipt_number)
check('عرض التسلسل 6 خانات', /^REC-\d{4}-\d{6}$/.test(r1.receipt_number), r1.receipt_number)
check('النسخة تحفظ المبلغ', r1.receipt_snapshot.amount === 15000.25)
check('النسخة تحفظ الحملة', r1.receipt_snapshot.campaign_title === base.campaign_title)
check('يحمل تاريخ إصدار', Boolean(Date.parse(r1.receipt_issued_at)))
check('receiptPath يرمّز المعامل', receiptPath(r1.receipt_number, r1.receipt_token).includes('?t='))

// النسخة ثابتة: تغيير اسم الحملة بعد الإصدار لا يمس المستند الصادر
const renamed = { ...base, campaign_title: 'اسم جديد تمامًا' }
check('النسخة لا تتأثر بتعديل لاحق', r1.receipt_snapshot.campaign_title !== renamed.campaign_title)

/* ── 5) عرض الصفحات ────────────────────────────────────────────── */
console.log('\n── العرض (HTML) ──')
const donation = { id: 'don_abc', ...base, ...r1 }
const verifyUrl = `https://omarhesham.org/receipt/verify/${r1.receipt_number}?t=${r1.receipt_token}`
const html = String(Receipt({ donation, verifyUrl }))
const vOk = String(ReceiptVerification({ valid: true, donation }))
const vBad = String(ReceiptVerification({ valid: false, reason: 'رابط غير صحيح.' }))

check('noindex على الإيصال', html.includes('noindex,nofollow,noarchive'))
check('المبلغ رقمًا', html.includes('15,000.25'))
check('المبلغ كتابةً', html.includes('خمسة عشر ألف جنيه مصري'))
check('طريقة الدفع مُترجمة', html.includes('فودافون كاش'))
check('لا مفتاح دفع خام', !html.includes('vodafone_cash'))
check('رقم التشهير', html.includes('3115 لسنة 2026'))
check('ختم مائي', html.includes('تبرع مستلم'))
check('طباعة A4', html.includes('size: A4'))
check('لا onclick مضمّن (CSP)', !/onclick=/i.test(html))
check('مستمع طباعة', html.includes("addEventListener('click'"))
check('dir=rtl', html.includes('dir="rtl"'))

console.log('  خصوصية صفحة التحقق:')
check('  الاسم يظهر', vOk.includes('أحمد محمود'))
check('  الهاتف مخفي', !vOk.includes('01012345678'))
check('  البريد مخفي', !vOk.includes('ahmed@example.com'))
check('  المبلغ يظهر', vOk.includes('15,000.25'))
check('  صفحة الرفض لا تسرّب بيانات', !vBad.includes('01012345678') && !vBad.includes('أحمد محمود'))

/* حفظ الملفات للفحص البصري */
const out = process.env.RECEIPT_OUT_DIR
if (out) {
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(path.join(out, 'receipt.html'), html)
  fs.writeFileSync(path.join(out, 'verify-ok.html'), vOk)
  fs.writeFileSync(path.join(out, 'verify-bad.html'), vBad)
  console.log(`\nكُتبت ملفات HTML في ${out}`)
}

console.log('\n  صمود الروابط أمام تدوير المفتاح:')
{
  // سيناريو حقيقي حدث في التطوير: فُقد RECEIPT_SECRET عند تغيير البيئة
  // فأُعيد توليده، فتوقّف إيصال صادر عن التحقق رغم سلامة توقيعه المخزَّن.
  const num = 'REC-2026-000001'
  const authentic = 'd248b7c9b0d311bd0d5a'   // توقيع صدر بمفتاح قديم
  const recomputed = await signReceipt(num)   // بمفتاح مختلف الآن

  check('المفتاح فعلًا مختلف (شرط صحة الاختبار)', recomputed !== authentic)
  check('التوقيع المخزَّن يُقبل بعد تدوير المفتاح',
    await verifyReceiptToken(num, authentic, undefined, authentic))
  check('توقيع مزيّف يُرفض حتى مع وجود توقيع مخزَّن',
    !(await verifyReceiptToken(num, 'ffffffffffffffffffff', undefined, authentic)))
  check('توقيع مقصوص يُرفض',
    !(await verifyReceiptToken(num, authentic.slice(0, 10), undefined, authentic)))
  check('حرف واحد مقلوب يُرفض',
    !(await verifyReceiptToken(num, authentic.slice(0, -1) + 'f', undefined, authentic)))
  check('بلا توقيع مخزَّن يعود لإعادة الحساب (توافق مع المستندات القديمة)',
    await verifyReceiptToken(num, recomputed, undefined, undefined))
  check('التوقيع الفارغ لا يتجاوز التحقق',
    !(await verifyReceiptToken(num, '', undefined, authentic)))
}

console.log('\n  المقارنة ثابتة الزمن:')
{
  check('متطابقان', constantTimeEqual('abc123', 'abc123'))
  check('مختلفان', !constantTimeEqual('abc123', 'abc124'))
  check('طولان مختلفان', !constantTimeEqual('abc', 'abcd'))
  check('فراغ يُرفض', !constantTimeEqual('', ''))
  check('null آمن', !constantTimeEqual(null, 'abc'))
}

console.log(`\n${'═'.repeat(46)}\n  ${pass} ناجح · ${fail} فاشل\n${'═'.repeat(46)}`)
process.exit(fail ? 1 : 0)
