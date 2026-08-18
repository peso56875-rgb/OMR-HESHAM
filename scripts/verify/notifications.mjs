/**
 * فحص نظام الإشعارات — Notifications test & verification harness
 *
 * يُشغَّل بـ: npx tsx scripts/verify/notifications.mjs
 */
import {
  NOTIFICATION_TYPES,
  CATEGORY_LABELS,
  buildNotification,
  detectRankChange,
  rankChangeBody,
  notifyMoney,
  dashLink,
  isQuietHour,
  typeDef
} from '../../src/lib/notifications.ts'

let pass = 0, fail = 0
const check = (name, ok, extra = '') => {
  ok ? pass++ : fail++
  console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `  ${extra}`}`)
}

console.log('\n─── 1. فحص كتالوج أنواع الإشعارات ───')
{
  const types = Object.keys(NOTIFICATION_TYPES)
  check('عدد أنواع الإشعارات المسجلة >= 15 نوعًا', types.length >= 15, `العدد: ${types.length}`)

  // التحقق من أحداث الإدارة
  check('وجود حدث تبرع جديد (donation_new)', Boolean(NOTIFICATION_TYPES.donation_new))
  check('وجود حدث طلب تطوع جديد (volunteer_new)', Boolean(NOTIFICATION_TYPES.volunteer_new))
  check('وجود حدث حركة خزنة كبيرة (treasury_large)', Boolean(NOTIFICATION_TYPES.treasury_large))
  check('وجود حدث بلوغ هدف الحملة (campaign_goal_reached)', Boolean(NOTIFICATION_TYPES.campaign_goal_reached))

  // التحقق من أحداث المستخدم والمتطوع
  check('وجود حدث ترقية المشرف (role_promoted_admin)', Boolean(NOTIFICATION_TYPES.role_promoted_admin))
  check('وجود حدث إزالة صلاحية المشرف (role_admin_removed)', Boolean(NOTIFICATION_TYPES.role_admin_removed))
  check('وجود حدث اعتماد المتطوع (volunteer_approved)', Boolean(NOTIFICATION_TYPES.volunteer_approved))
  check('وجود حدث ترقية رتبة المتطوع (volunteer_rank_promoted)', Boolean(NOTIFICATION_TYPES.volunteer_rank_promoted))
  check('وجود حدث تجميد الكارنيه (volunteer_card_frozen)', Boolean(NOTIFICATION_TYPES.volunteer_card_frozen))

  // التحقق من الأنواع الصامتة
  check('إشعار النشرة البريدية صامت (silent: true)', NOTIFICATION_TYPES.newsletter_new?.silent === true)
  check('إشعار تسجيل المستخدم صامت (silent: true)', NOTIFICATION_TYPES.user_registered?.silent === true)
  check('إشعار تحديث الساعات صامت (silent: true)', NOTIFICATION_TYPES.volunteer_hours_updated?.silent === true)
}

console.log('\n─── 2. فحص بناء سجل الإشعار والتنقية ───')
{
  const rec = buildNotification({
    user_id: 'user123',
    type: 'volunteer_rank_promoted',
    title: 'ترقية جديدة في فريق المتطوعين',
    body: 'تمت ترقيتك إلى منسق ميداني',
    link: '/profile',
    actor: { id: 'admin1', name: 'أحمد المشرف' },
    meta: { from: 'متطوع مبادر', to: 'منسق ميداني', amount: 0, bad: undefined }
  })

  check('الجمهور محدد كـ user', rec.audience === 'user')
  check('معرف المستخدم صحيح', rec.user_id === 'user123')
  check('التصنيف مستنتج كـ volunteers', rec.category === 'volunteers')
  check('الأيقونة مستنتجة من النوع', Boolean(rec.icon))
  check('الرابط محفوظ مع السجل', rec.link === '/profile')
  check('الحقول غير المعرفة تُستبعد من meta', !('bad' in rec.meta))
  check('بيانات المشرف محفوظة', rec.actor_id === 'admin1' && rec.actor_name === 'أحمد المشرف')
}

console.log('\n─── 3. فحص إشعارات الإدارة العامة (Admins broadcast) ───')
{
  const adminRec = buildNotification({
    audience: 'admins',
    type: 'donation_new',
    title: 'تبرع جديد وارد: 1000 ج.م',
    body: 'فاعل خير'
  })

  check('user_id للإشعار الإداري العام هو null (لتوفير التكرار)', adminRec.user_id === null)
  check('الجمهور admins', adminRec.audience === 'admins')
}

console.log('\n─── 4. فحص اكتشاف تغيير الرتبة (detectRankChange) ───')
{
  const first = detectRankChange('', 'متطوع مبادر')
  check('أول إسناد يُكتشف كـ isFirstAssignment (لا يُرسل ترقية مكررة مع القبول)', first.changed && first.isFirstAssignment)

  const realUpgrade = detectRankChange('متطوع مبادر', 'منسق ميداني')
  check('ترقية حقيقية بين رتبتين مختلفتين', realUpgrade.changed && !realUpgrade.isFirstAssignment && realUpgrade.from === 'متطوع مبادر' && realUpgrade.to === 'منسق ميداني')

  const noChange = detectRankChange('منسق ميداني', 'منسق ميداني')
  check('حفظ النموذج بنفس الرتبة لا يولد إشعارًا (idempotent)', !noChange.changed)

  const bodyText = rankChangeBody('علي', 'متطوع مبادر', 'قائد فريق')
  check('صياغة نص الترقية واضحة', bodyText.includes('علي') && bodyText.includes('متطوع مبادر') && bodyText.includes('قائد فريق'))
}

console.log('\n─── 5. فحص ساعات الهدوء (Quiet Hours) ───')
{
  const cfg = {
    quietEnabled: true,
    quietFrom: 23,
    quietTo: 7,
    treasuryThreshold: 50000
  }

  // ساعة داخل الهدوء (توقيت القاهرة 3 فجرًا)
  const dMidnight = new Date('2026-08-18T01:00:00Z') // 3:00 am Cairo
  const inQuiet = isQuietHour(cfg, dMidnight)
  check('اكتشاف ساعات الهدوء بعد منتصف الليل', inQuiet === true)

  // ساعة عمل (توقيت القاهرة 12 ظهرًا)
  const dNoon = new Date('2026-08-18T10:00:00Z') // 12:00 pm Cairo
  const notQuiet = isQuietHour(cfg, dNoon)
  check('ساعات النهار ليست هادئة', notQuiet === false)

  const disabledCfg = { ...cfg, quietEnabled: false }
  check('عند تعطيل الساعات الهادئة تعود دومًا false', isQuietHour(disabledCfg, dMidnight) === false)
}

console.log('\n─── 6. فحص المساعدات العامة ───')
{
  check('تنسيق المبالغ المالية بالعربية', notifyMoney(5000).includes('ج.م'))
  check('مسار لوحة التحكم مع المعاملات', dashLink('volunteers', 'tab=approved') === '/dashboard?view=volunteers&tab=approved')
  check('التراجع اللطيف للأنواع غير المعروفة', typeDef('unknown_custom_type').category === 'system')
}

console.log(`\n═════════════════════════════════════════`)
console.log(`  النتيجة الإجمالية: ${pass} نجح | ${fail} فشل`)
console.log(`═════════════════════════════════════════\n`)

if (fail > 0) process.exit(1)
