/**
 * إصدار إيصالات للتبرعات المؤكدة السابقة — Receipt backfill
 *
 * لماذا هذا السكربت موجود؟
 * منطق الإصدار في src/api/donations.ts يعمل عند *الانتقال* إلى الحالة
 * completed فقط:
 *
 *   const isIssuing = newStatus === 'completed' && oldStatus !== 'completed'
 *
 * وهذا صحيح لمنع إعادة إصدار مستند مالي، لكنه يعني أن أي تبرع كان
 * مؤكدًا *قبل* تشغيل نظام الإيصالات لن يحصل على إيصال أبدًا، لأن
 * انتقاله حدث في الماضي. اكتُشفت هذه الفجوة عند الفحص على قاعدة
 * البيانات الحقيقية — الاختبارات على قاعدة وهمية لا يمكن أن تكشفها
 * لأنها تبدأ دائمًا من قاعدة فارغة.
 *
 * التشغيل:
 *   node scripts/backfill-receipts.mjs           # معاينة فقط (افتراضي)
 *   node scripts/backfill-receipts.mjs --apply   # التنفيذ الفعلي
 *
 * المعاينة هي الافتراضي عن قصد: السكربت يكتب في مستندات مالية ويستهلك
 * أرقامًا من العدّاد التسلسلي، فلا يصح أن ينفّذ بالخطأ.
 */
import { readFileSync } from 'node:fs'

/** تحميل .env يدويًا — المشروع يقرأ المتغيرات من بيئة Vercel ولا يعتمد dotenv. */
const loadEnv = () => {
  let raw
  try {
    raw = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  } catch {
    console.log('ℹ لا يوجد ملف .env — سيُعتمد على متغيرات البيئة الحالية.')
    return
  }
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    // مفاتيح Firebase الخاصة تُخزَّن بـ \n حرفية فتحتاج فك ترميز
    if (process.env[m[1]] === undefined) process.env[m[1]] = v.replace(/\\n/g, '\n')
  }
}

const main = async () => {
  loadEnv()

  const apply = process.argv.includes('--apply')
  const { getFirestore } = await import('../src/lib/firebase-admin.ts')
  const { buildReceipt, receiptPath, formatMoney } = await import('../src/lib/receipts.ts')

  const db = getFirestore()

  console.log('══════════════════════════════════════════════')
  console.log(apply ? '  تنفيذ فعلي (--apply)' : '  معاينة فقط — لن يُكتب أي شيء')
  console.log('══════════════════════════════════════════════\n')

  // نقرأ كل التبرعات المؤكدة، ثم نرشّح محليًا على غياب receipt_number.
  // السبب: Firestore لا يدعم استعلام "الحقل غير موجود" مباشرة، والتصفية
  // المحلية تتجنّب الحاجة إلى فهرس مركّب.
  const snap = await db.collection('donations').where('status', '==', 'completed').get()
  const missing = []
  snap.forEach((doc) => {
    const d = doc.data()
    if (!d.receipt_number) missing.push({ id: doc.id, data: d })
  })

  console.log(`تبرعات مؤكدة: ${snap.size}`)
  console.log(`بدون إيصال:   ${missing.length}\n`)

  if (!missing.length) {
    console.log('✓ لا شيء مطلوب — كل تبرع مؤكد لديه إيصال.')
    process.exit(0)
  }

  if (!apply) {
    for (const m of missing) {
      const name = m.data.donor_name || m.data.name || '(بدون اسم)'
      console.log(`  • ${m.id}  ${name}  ${formatMoney(m.data.amount)} ج.م`)
    }
    console.log('\nلإصدار الإيصالات فعليًا:')
    console.log('  node scripts/backfill-receipts.mjs --apply')
    process.exit(0)
  }

  let done = 0
  let failed = 0
  for (const m of missing) {
    try {
      // buildReceipt تشغّل transaction خاصة بها لسحب رقم من العدّاد،
      // فتُنفّذ تبرعًا تبرعًا لا داخل معاملة جامعة (Firestore يمنع التداخل).
      const receipt = await buildReceipt(db, m.data, undefined)
      await db.collection('donations').doc(m.id).update(receipt)
      const name = m.data.donor_name || m.data.name || '(بدون اسم)'
      console.log(`✓ ${receipt.receipt_number}  ${name}`)
      console.log(`   ${receiptPath(receipt.receipt_number, receipt.receipt_token)}`)
      done++
    } catch (e) {
      console.log(`✗ ${m.id}: ${e.message}`)
      failed++
    }
  }

  console.log('\n══════════════════════════════════════════════')
  console.log(`  ${done} صدر · ${failed} فشل`)
  console.log('══════════════════════════════════════════════')
  console.log('\nملاحظة: لم يُرسل بريد. الإيصالات السابقة تُراجَع يدويًا قبل')
  console.log('إبلاغ المتبرعين، تجنّبًا لإرسال مستند خاطئ عن تبرع قديم.')
  process.exit(failed ? 1 : 0)
}

main().catch((e) => {
  console.error('فشل غير متوقع:', e)
  process.exit(1)
})
