/**
 * فحص نظام الإشعارات — Notification system verification harness
 *
 * يُشغَّل بـ: npx tsx scripts/verify/notifications.mjs
 *
 * لا يوجد إطار اختبارات في المشروع (بند 3.11)، فهذا ملف تحقق قائم بذاته
 * على نمط scripts/verify/audit.mjs و receipts.mjs.
 *
 * نطاق الفحص: **المنطق الخالص فقط** — لا يلمس Firestore ولا FCM ولا يُرسل
 * بريدًا. الدوال التي تكتب في قاعدة البيانات (notify/notifyAdmins) تُختبر
 * عبر مكوّناتها الخالصة (buildNotification/typeDef) لأن حقنها بقاعدة وهمية
 * يتطلب تعديل توقيعاتها، وهو ثمن معماري لا يستحق مقابل تغطية أثر جانبي.
 *
 * أهم ما يحرسه هذا الملف: قواعد **منع الإشعارات المكرّرة**. هي أخطر جزء في
 * النظام، لأن فشلها لا يظهر كخطأ بل كإزعاج للمستخدم — رسالة «تمت ترقيتك»
 * تصل ثلاث مرات، أو «تم تأكيد تبرعك» تتكرر لنفس المبلغ.
 */
import {
  getNotifyConfig,
  isQuietHour,
  typeDef,
  buildNotification,
  detectRankChange,
  rankChangeBody,
  notifyMoney,
  dashLink,
  NOTIFICATION_TYPES,
  DEFAULT_PREFS,
  CATEGORY_LABELS
} from '../../src/lib/notifications.ts'
import { detectPlatform, isPushConfigured } from '../../src/lib/push.ts'

let pass = 0, fail = 0
const check = (name, ok, extra = '') => {
  ok ? pass++ : fail++
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `  ${extra}`}`)
}

/* ─────────────────────── كتالوج الأنواع ─────────────────────── */
console.log('\n  كتالوج أنواع الإشعارات:')
{
  const types = Object.keys(NOTIFICATION_TYPES)
  check('الكتالوج غير فارغ', types.length >= 25, `العدد ${types.length}`)

  const validCategories = ['financial', 'volunteers', 'content', 'system', 'account']
  const validPriorities = ['low', 'normal', 'high']

  const badCategory = types.filter((t) => !validCategories.includes(NOTIFICATION_TYPES[t].category))
  check('كل نوع له تصنيف معروف', badCategory.length === 0, badCategory.join(','))

  const badPriority = types.filter((t) => !validPriorities.includes(NOTIFICATION_TYPES[t].priority))
  check('كل نوع له أولوية صالحة', badPriority.length === 0, badPriority.join(','))

  const noIcon = types.filter((t) => !NOTIFICATION_TYPES[t].icon)
  check('كل نوع له أيقونة', noIcon.length === 0, noIcon.join(','))

  const noLabel = types.filter((t) => !NOTIFICATION_TYPES[t].label)
  check('كل نوع له تسمية عربية', noLabel.length === 0, noLabel.join(','))

  // الحدثان المطلوبان صراحةً من صاحب الموقع
  check('نوع تعيين المدير موجود', Boolean(NOTIFICATION_TYPES.role_promoted_admin))
  check('نوع ترقية المتطوع موجود', Boolean(NOTIFICATION_TYPES.volunteer_rank_promoted))

  // كلاهما حساس: يجب ألا يكون منخفض الأولوية فيُكتم في ساعات الهدوء
  check(
    'تعيين المدير أولويته عالية',
    NOTIFICATION_TYPES.role_promoted_admin.priority === 'high',
    NOTIFICATION_TYPES.role_promoted_admin.priority
  )

  // كل تصنيف مستخدم لازم يكون له تسمية معروضة في واجهة التفضيلات
  const missingLabel = validCategories.filter((cat) => !CATEGORY_LABELS[cat])
  check('كل تصنيف له تسمية في الواجهة', missingLabel.length === 0, missingLabel.join(','))
}

console.log('\n  النوع المجهول لا يُسقط الإشعار:')
{
  const def = typeDef('نوع_لا_وجود_له')
  check('يرجّع تعريفًا افتراضيًا لا undefined', Boolean(def && def.category))
  check('الافتراضي تصنيفه system', def.category === 'system', def.category)
}

/* ─────────────────── بناء سجل الإشعار ─────────────────── */
console.log('\n  بناء سجل الإشعار:')
{
  const rec = buildNotification({
    user_id: 'u1',
    type: 'donation_confirmed',
    title: 'تم تأكيد تبرعك',
    body: 'شكرًا',
    link: '/profile',
    actor: { id: 'admin1', name: 'مشرف' },
    meta: { amount: 500 }
  })
  check('الجمهور يُستنبط user من user_id', rec.audience === 'user', rec.audience)
  check('التصنيف يُؤخذ من الكتالوج', rec.category === 'financial', rec.category)
  check('يبدأ غير مقروء', rec.is_read === false && rec.read_at === null)
  check('push_sent يبدأ false', rec.push_sent === false)
  check('created_at بصيغة ISO', /^\d{4}-\d{2}-\d{2}T/.test(rec.created_at), rec.created_at)
  check('الفاعل يُسجّل للمساءلة', rec.actor_id === 'admin1' && rec.actor_name === 'مشرف')
}

{
  // إشعار المشرفين سجل واحد مشترك: user_id لازم null وإلا تسرّب لمستخدم واحد
  const rec = buildNotification({ audience: 'admins', user_id: 'u1', type: 'donation_new', title: 'تبرع' })
  check('جمهور المشرفين يُصفّر user_id', rec.user_id === null, String(rec.user_id))
}

{
  const rec = buildNotification({ type: 'donation_new', title: 'تبرع' })
  check('بدون user_id يُستنبط الجمهور admins', rec.audience === 'admins', rec.audience)
}

console.log('\n  قصّ النصوص الطويلة (حماية حجم مستند Firestore):')
{
  const rec = buildNotification({
    user_id: 'u1',
    type: 'test',
    title: 'ع'.repeat(500),
    body: 'ب'.repeat(3000)
  })
  check('العنوان يُقصّ', rec.title.length < 500, `الطول ${rec.title.length}`)
  check('النص يُقصّ', rec.body.length < 3000, `الطول ${rec.body.length}`)
}

{
  // عنوان فارغ لا يجوز أن يترك الإشعار بلا نص معروض في الواجهة
  const rec = buildNotification({ user_id: 'u1', type: 'donation_confirmed', title: '' })
  check('العنوان الفارغ يُستبدل بتسمية النوع', rec.title.length > 0, rec.title)
}

/* ───────── منع تكرار إشعار الترقية (النقطة الحرجة #4) ───────── */
console.log('\n  كشف تغيّر الرتبة — حائط منع الإشعارات المكرّرة:')
{
  const same = detectRankChange('متطوع مبادر', 'متطوع مبادر')
  check('نفس الرتبة = لا تغيير', same.changed === false)

  const promoted = detectRankChange('متطوع مبادر', 'متطوع فعّال')
  check('رتبة مختلفة = تغيير', promoted.changed === true)
  check('التغيير ليس تعيينًا أولًا', promoted.isFirstAssignment === false)
  check('يحفظ الرتبة السابقة', promoted.from === 'متطوع مبادر', promoted.from)
  check('يحفظ الرتبة الجديدة', promoted.to === 'متطوع فعّال', promoted.to)

  // الحالة الحرجة: أول إصدار بطاقة يمنح «متطوع مبادر» تلقائيًا.
  // لو عُدّت ترقية لوصل للمتطوع إشعارا قبول + ترقية في نفس اللحظة.
  const first = detectRankChange('', 'متطوع مبادر')
  check('التعيين الأول يُرصد كتغيير', first.changed === true)
  check('لكنه مُعلَّم كتعيين أول ليُستثنى', first.isFirstAssignment === true)

  const firstNull = detectRankChange(undefined, 'متطوع مبادر')
  check('undefined يُعامل كتعيين أول', firstNull.isFirstAssignment === true)

  // النموذج يبعت الرتبة مع الساعات في كل حفظ. لو الحقل غائب من الـ patch
  // لازم لا يُحسب تغييرًا، وإلا كل تحديث ساعات يبعت إشعار ترقية.
  const absent = detectRankChange('متطوع فعّال', undefined)
  check('الرتبة الغائبة من الطلب ليست ترقية', absent.changed === false)

  const emptied = detectRankChange('متطوع فعّال', '')
  check('تفريغ الرتبة ليس ترقية', emptied.changed === false)

  // المسافات الزائدة من إدخال المشرف لا يجوز أن تُعتبر ترقية
  const spaced = detectRankChange('متطوع فعّال', '  متطوع فعّال  ')
  check('المسافات الزائدة لا تُعتبر ترقية', spaced.changed === false)
}

console.log('\n  صياغة نص الترقية:')
{
  const withFrom = rankChangeBody('أحمد', 'متطوع مبادر', 'متطوع فعّال')
  check('يذكر الرتبة الجديدة', withFrom.includes('متطوع فعّال'))
  const noFrom = rankChangeBody('أحمد', '', 'متطوع فعّال')
  check('يعمل بدون رتبة سابقة', typeof noFrom === 'string' && noFrom.length > 0)
}

/* ─────────────── ساعات الهدوء بتوقيت القاهرة ─────────────── */
console.log('\n  ساعات الهدوء (بتوقيت القاهرة لا UTC):')
{
  const off = getNotifyConfig({ env: {} })
  check('معطّلة افتراضيًا', off.quietEnabled === false)
  check('حد الخزينة الافتراضي ٥٠٠٠٠', off.treasuryThreshold === 50000, String(off.treasuryThreshold))
  check('لا تكتم شيئًا وهي معطّلة', isQuietHour(off, new Date('2026-08-18T00:00:00Z')) === false)

  const cfg = getNotifyConfig({ env: { NOTIFY_QUIET_HOURS: '22-8' } })
  check('تُقرأ الصيغة "22-8"', cfg.quietEnabled === true && cfg.quietFrom === 22 && cfg.quietTo === 8,
    `${cfg.quietFrom}-${cfg.quietTo}`)

  // القاهرة = UTC+2 صيفًا (بلا توقيت صيفي منذ ٢٠١٥ ثم أُعيد ٢٠٢٣؛ Intl يحسمها)
  // 21:00 UTC = 23:00 بالقاهرة → داخل الهدوء
  check('٢٣:٠٠ بالقاهرة داخل الهدوء', isQuietHour(cfg, new Date('2026-08-18T21:00:00Z')) === true)
  // 12:00 UTC = 14:00 بالقاهرة → خارج الهدوء
  check('١٤:٠٠ بالقاهرة خارج الهدوء', isQuietHour(cfg, new Date('2026-08-18T12:00:00Z')) === false)

  // لو الحساب كان بـ getHours() على UTC لكانت 22:00 UTC (= منتصف الليل
  // بالقاهرة) تعطي نتيجة مطابقة بالخطأ. النقطة الفاصلة هي 19:00 UTC:
  // = 21:00 بالقاهرة → خارج الهدوء، لكن 19 < 22 بـ UTC أيضًا خارج.
  // الفاصل الحقيقي 20:00 UTC = 22:00 بالقاهرة → داخل الهدوء بينما UTC=20 خارج.
  check('٢٠:٠٠ UTC = ٢٢:٠٠ بالقاهرة → داخل الهدوء (يُثبت استخدام التوقيت المحلي)',
    isQuietHour(cfg, new Date('2026-08-18T20:00:00Z')) === true)

  const bad = getNotifyConfig({ env: { NOTIFY_QUIET_HOURS: 'كلام غير صالح' } })
  check('صيغة غير صالحة تُعطّل الميزة بأمان', bad.quietEnabled === false)

  const outOfRange = getNotifyConfig({ env: { NOTIFY_QUIET_HOURS: '99-200' } })
  check('ساعات خارج المدى تُرفض', outOfRange.quietEnabled === false)

  const th = getNotifyConfig({ env: { NOTIFY_TREASURY_THRESHOLD: '120000' } })
  check('حد الخزينة يُقرأ من البيئة', th.treasuryThreshold === 120000, String(th.treasuryThreshold))

  const negative = getNotifyConfig({ env: { NOTIFY_TREASURY_THRESHOLD: '-5' } })
  check('حد سالب يعود للافتراضي', negative.treasuryThreshold === 50000, String(negative.treasuryThreshold))
}

/* ───────────────────── مساعدات العرض ───────────────────── */
console.log('\n  تنسيق المبالغ والروابط:')
{
  const m = notifyMoney(50000)
  check('المبلغ يُنسّق بالعربية مع ج.م', m.includes('ج.م'), m)
  check('المبلغ غير الرقمي لا يُسقط الدالة', typeof notifyMoney('كلام') === 'string')
  check('الصفر يُنسّق', typeof notifyMoney(0) === 'string')

  check('رابط اللوحة صحيح', dashLink('donations') === '/dashboard?view=donations', dashLink('donations'))
  check('يضيف معاملات إضافية', dashLink('donations', 'id=5').includes('&id=5'))
  // اسم عرض فيه محرف خاص لازم يُرمَّز وإلا انكسر الرابط
  check('يُرمّز اسم العرض', dashLink('a&b').includes('a%26b'), dashLink('a&b'))
}

/* ───────────────────── التفضيلات ───────────────────── */
console.log('\n  التفضيلات الافتراضية:')
{
  check('التفضيلات الافتراضية كائن', DEFAULT_PREFS && typeof DEFAULT_PREFS === 'object')
  // القاعدة: الجديد يشتغل مفتوحًا. المستخدم يقفل ما لا يريده بنفسه.
  check('البريد مفعّل افتراضيًا', DEFAULT_PREFS.email !== false)
  check('البوش مفعّل افتراضيًا', DEFAULT_PREFS.push !== false)
}

/* ───────────────────── طبقة الـ Push ───────────────────── */
console.log('\n  طبقة الـ Push — التدرّج الآمن بدون مفتاح VAPID:')
{
  // المستخدم لم يوفّر FIREBASE_VAPID_KEY. النظام لازم يعرف ده ويتخطى
  // الـ Push بصمت بدل ما يرمي استثناء يُفشل عملية إدارية ناجحة.
  check('بدون مفتاح VAPID → غير مُهيّأ', isPushConfigured({ env: {} }) === false)
  check('مع مفتاح VAPID → مُهيّأ', isPushConfigured({ env: { FIREBASE_VAPID_KEY: 'k'.repeat(80) } }) === true)
}

console.log('\n  كشف المنصّة من User-Agent:')
{
  check('أندرويد', detectPlatform('Mozilla/5.0 (Linux; Android 14) Chrome/120') === 'android')
  check('آيفون', detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Safari') === 'ios')
  check('ويندوز', detectPlatform('Mozilla/5.0 (Windows NT 10.0) Chrome/120') === 'windows')
  check('UA فارغ لا يُسقط الدالة', typeof detectPlatform('') === 'string')
  check('UA غير معروف يرجّع قيمة', detectPlatform('xyz').length > 0)
}

/* ───────────────────── البث العام (audience: 'all') ───────────────────── */
console.log('\n  البث العام — نشر الأخبار والحملات والفعاليات:')
{
  // القاعدة الحاسمة: البث سجل واحد بلا مالك. لو انسرب user_id للسجل كان
  // هيظهر مرتين في التدفّق — مرة من استعلام user_id ومرة من استعلام البث.
  const broadcast = buildNotification({
    audience: 'all',
    user_id: 'someone',
    type: 'content_published',
    title: 'خبر جديد'
  })
  check("البث يُفرِّغ user_id دائمًا", broadcast.user_id === null, String(broadcast.user_id))
  check("جمهور البث 'all'", broadcast.audience === 'all', broadcast.audience)

  // إشعارات الإدارة تحتفظ بنفس القاعدة — لم نكسرها بإضافة البث.
  const adminRec = buildNotification({
    audience: 'admins',
    user_id: 'someone',
    type: 'contact_new',
    title: 'رسالة'
  })
  check("إشعار الإدارة يُفرِّغ user_id", adminRec.user_id === null, String(adminRec.user_id))

  // إشعار المستخدم لا يتأثر: لسه بيحتفظ بمالكه.
  const userRec = buildNotification({
    user_id: 'u1',
    type: 'donation_confirmed',
    title: 'تأكيد'
  })
  check('إشعار المستخدم يحتفظ بمالكه', userRec.user_id === 'u1', String(userRec.user_id))
  check("جمهور إشعار المستخدم 'user'", userRec.audience === 'user', userRec.audience)

  // نشر الأخبار أولويته low: قاعدة notifyAll تمنع الـ Push لها بشكل مقصود
  // حتى لا يقفل المستخدم الإشعارات كلها من كثرة أخبار غير عاجلة.
  check("نوع content_published أولويته low", typeDef('content_published').priority === 'low',
    typeDef('content_published').priority)

  // الحملة العاجلة ترفع الأولوية يدويًا إلى normal فتستحق Push.
  const urgent = buildNotification({
    audience: 'all',
    type: 'content_published',
    title: 'حملة عاجلة',
    priority: 'normal'
  })
  check('الحملة العاجلة ترفع الأولوية إلى normal', urgent.priority === 'normal', urgent.priority)

  // تجاوز الأيقونة لازم يشتغل: الفعالية أيقونتها تقويم لا صحيفة.
  const evt = buildNotification({
    audience: 'all',
    type: 'content_published',
    title: 'فعالية',
    icon: 'fa-calendar-day'
  })
  check('تجاوز الأيقونة يعمل', evt.icon === 'fa-calendar-day', evt.icon)
}

console.log('\n  أنواع أحداث المرحلة الرابعة موجودة في الكتالوج:')
{
  for (const t of [
    'contact_new',
    'contact_replied',
    'job_application_new',
    'newsletter_new',
    'treasury_large',
    'content_published'
  ]) {
    check(`النوع ${t} معرَّف`, !!NOTIFICATION_TYPES[t])
  }
  // newsletter_new لازم يبقى silent: عشرات الاشتراكات يوميًا × Push = المستخدم
  // يقفل الإشعارات فنخسر التنبيهات المهمة معاها.
  check('newsletter_new صامت', NOTIFICATION_TYPES.newsletter_new?.silent === true)
  check('treasury_large أولوية عالية', NOTIFICATION_TYPES.treasury_large?.priority === 'high')
  check('contact_new تصنيفه content', NOTIFICATION_TYPES.contact_new?.category === 'content')
  check('treasury_large تصنيفه financial', NOTIFICATION_TYPES.treasury_large?.category === 'financial')
}

console.log('\n══════════════════════════════════════════════')
console.log(`  ${pass} ناجح · ${fail} فاشل`)
console.log('══════════════════════════════════════════════')
process.exit(fail ? 1 : 0)
