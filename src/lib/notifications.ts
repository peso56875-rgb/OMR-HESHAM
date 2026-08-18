/**
 * ═══════════════════════ نظام الإشعارات — النواة ═══════════════════════
 *
 * هذه الوحدة هي المصدر الوحيد لكتابة الإشعارات في المشروع. أي نقطة نهاية
 * تريد إشعار مستخدم أو المشرفين تستدعي notify() أو notifyAdmins() فقط،
 * ولا تكتب في مجموعة notifications مباشرة. السبب: قواعد الأولوية
 * والتفضيلات وساعات الهدوء وإرسال الـ Push كلها منطق واحد؛ تكراره في
 * ستين نقطة تعديل يعني أن أي تعديل عليه سيُطبَّق في بعضها وينسى الباقي.
 *
 * ثلاث طبقات للتوصيل، مستقلة تمامًا عن بعضها:
 *   1) مركز الإشعارات (Firestore) — الضمان. يعمل دائمًا ولا يعتمد على شيء.
 *   2) Push (FCM) — تحسين. غياب FIREBASE_VAPID_KEY يُعطّله بصمت وسطر لوج.
 *   3) البريد (Resend) — للأحداث المهمة. غياب RESEND_API_KEY يُعطّله كذلك.
 *
 * قاعدة صارمة: لا شيء هنا يرمي استثناءً.
 * الإشعار أثر جانبي لعملية أصلية (تبرع، اعتماد متطوع، تعيين مشرف). لو
 * فشلت كتابة الإشعار فالعملية الأصلية نجحت فعلًا في قاعدة البيانات، ورمي
 * استثناء هنا سيُظهر للمستخدم خطأً عن عملية تمّت — وقد يدفعه لتكرارها.
 * كل دالة تعيد نتيجة تصف ما حدث، وتسجّل الفشل في اللوج.
 */

import { getFirestore } from './firebase-admin'

/* ────────────────────────── الإعدادات ────────────────────────── */

const glob = globalThis as any

export interface NotifyConfig {
  /** حدّ المبلغ الذي يُعتبر بعده الحركة المالية "كبيرة" وتستحق تنبيهًا. */
  treasuryThreshold: number
  /** ساعات الهدوء بتوقيت القاهرة: لا Push خلالها إلا للأولوية العالية. */
  quietFrom: number
  quietTo: number
  quietEnabled: boolean
}

/** يقرأ متغيّر بيئة من c.env (Workers) أو process.env (Node/Vercel). */
const readEnv = (c: any, key: string): string => {
  const env = c?.env || {}
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env || {} : {}
  return String(env[key] || procEnv[key] || '')
}

/** يحلّل "22-8" أو "22:00-08:00" إلى ساعتين صحيحتين. */
const parseQuietHours = (raw: string): { from: number; to: number; ok: boolean } => {
  const m = raw.match(/^\s*(\d{1,2})(?::\d{2})?\s*-\s*(\d{1,2})(?::\d{2})?\s*$/)
  if (!m) return { from: 0, to: 0, ok: false }
  const from = Number(m[1])
  const to = Number(m[2])
  if (!(from >= 0 && from <= 23 && to >= 0 && to <= 23) || from === to) {
    return { from: 0, to: 0, ok: false }
  }
  return { from, to, ok: true }
}

export const getNotifyConfig = (c?: any): NotifyConfig => {
  const thresholdRaw = Number(readEnv(c, 'NOTIFY_TREASURY_THRESHOLD'))
  const quiet = parseQuietHours(readEnv(c, 'NOTIFY_QUIET_HOURS'))

  return {
    // الافتراضي ٥٠٠٠٠ ج.م: مبلغ يستدعي مراجعة إدارية في مؤسسة بهذا الحجم
    treasuryThreshold: Number.isFinite(thresholdRaw) && thresholdRaw > 0 ? thresholdRaw : 50000,
    quietFrom: quiet.from,
    quietTo: quiet.to,
    quietEnabled: quiet.ok
  }
}

/**
 * هل نحن داخل ساعات الهدوء الآن؟
 *
 * الحساب بتوقيت القاهرة صراحةً عبر Intl لا بـ getHours().
 * السبب: Vercel تُشغّل الدوال بتوقيت UTC، فـ getHours() كانت ستعطي ٢٢
 * بتوقيت UTC = منتصف الليل في القاهرة تقريبًا — أي أن ساعات الهدوء كانت
 * ستُطبَّق في الوقت الخطأ بفارق ساعتين إلى ثلاث حسب التوقيت الصيفي.
 */
export const isQuietHour = (cfg: NotifyConfig, now: Date = new Date()): boolean => {
  if (!cfg.quietEnabled) return false

  let hour: number
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Cairo',
      hour: 'numeric',
      hour12: false
    })
    hour = Number(fmt.format(now))
    if (!Number.isFinite(hour)) return false
  } catch {
    // بيئة بلا بيانات مناطق زمنية: لا نُخاطر بكتم إشعار في الوقت الخطأ
    return false
  }

  // المدى قد يعبر منتصف الليل (٢٢ ← ٨) فيلزم شرط OR لا AND
  return cfg.quietFrom < cfg.quietTo
    ? hour >= cfg.quietFrom && hour < cfg.quietTo
    : hour >= cfg.quietFrom || hour < cfg.quietTo
}

/* ────────────────────────── كتالوج الأنواع ────────────────────────── */

export type NotificationCategory = 'financial' | 'volunteers' | 'content' | 'system' | 'account'
export type NotificationPriority = 'low' | 'normal' | 'high'
export type NotificationAudience = 'user' | 'admins'

export interface NotificationTypeDef {
  /** التصنيف — يستخدمه المستخدم لإيقاف نوع كامل من الإشعارات. */
  category: NotificationCategory
  /** أيقونة FontAwesome. */
  icon: string
  priority: NotificationPriority
  /**
   * صامت = يُسجَّل في المركز فقط بلا Push ولا بريد.
   * تُستخدم للأحداث كثيرة التكرار وقليلة الأهمية (مشترك نشرة، تحديث ساعات)
   * حتى لا يتحول التنبيه إلى إزعاج فيُغلقه المستخدم كليًا.
   */
  silent?: boolean
  /** وصف بشري — يظهر في شاشة التفضيلات وفي سكربت التحقق. */
  label: string
}

export const NOTIFICATION_TYPES: Record<string, NotificationTypeDef> = {
  /* ── إشعارات الإدارة (A) ── */
  donation_new: { category: 'financial', icon: 'fa-hand-holding-heart', priority: 'high', label: 'تبرع جديد وارد' },
  volunteer_new: { category: 'volunteers', icon: 'fa-user-plus', priority: 'normal', label: 'طلب تطوع جديد' },
  contact_new: { category: 'content', icon: 'fa-envelope', priority: 'normal', label: 'رسالة تواصل جديدة' },
  job_application_new: { category: 'content', icon: 'fa-briefcase', priority: 'normal', label: 'طلب توظيف جديد' },
  newsletter_new: { category: 'content', icon: 'fa-paper-plane', priority: 'low', silent: true, label: 'مشترك جديد في النشرة' },
  treasury_large: { category: 'financial', icon: 'fa-vault', priority: 'high', label: 'حركة مالية كبيرة' },
  user_registered: { category: 'account', icon: 'fa-user-check', priority: 'low', silent: true, label: 'مستخدم جديد مسجَّل' },
  campaign_goal_reached: { category: 'financial', icon: 'fa-trophy', priority: 'high', label: 'حملة بلغت هدفها' },
  volunteer_card_expiring_admin: { category: 'volunteers', icon: 'fa-id-card', priority: 'normal', label: 'كارنيهات متطوعين قاربت على الانتهاء' },
  system_error: { category: 'system', icon: 'fa-triangle-exclamation', priority: 'high', label: 'خطأ في النظام' },

  /* ── إشعارات المستخدم (U) ── */
  donation_confirmed: { category: 'financial', icon: 'fa-circle-check', priority: 'high', label: 'تأكيد تبرعك وإصدار الإيصال' },
  donation_cancelled: { category: 'financial', icon: 'fa-circle-xmark', priority: 'normal', label: 'إلغاء تبرع' },
  role_promoted_admin: { category: 'account', icon: 'fa-user-shield', priority: 'high', label: 'تعيينك مشرفًا' },
  role_admin_removed: { category: 'account', icon: 'fa-user-minus', priority: 'high', label: 'إزالة صلاحية الإشراف' },
  content_published: { category: 'content', icon: 'fa-newspaper', priority: 'low', label: 'خبر أو حملة جديدة' },
  event_upcoming: { category: 'content', icon: 'fa-calendar-day', priority: 'normal', label: 'اقتراب موعد فعالية' },
  contact_replied: { category: 'content', icon: 'fa-reply', priority: 'normal', label: 'رد الإدارة على رسالتك' },

  /* ── إشعارات المتطوعين (V) ── */
  volunteer_approved: { category: 'volunteers', icon: 'fa-id-badge', priority: 'high', label: 'قبول طلب التطوع' },
  volunteer_rejected: { category: 'volunteers', icon: 'fa-circle-xmark', priority: 'high', label: 'رفض طلب التطوع' },
  volunteer_rank_promoted: { category: 'volunteers', icon: 'fa-medal', priority: 'high', label: 'ترقية رتبة التطوع' },
  volunteer_hours_updated: { category: 'volunteers', icon: 'fa-clock', priority: 'low', silent: true, label: 'تحديث ساعات التطوع' },
  volunteer_card_frozen: { category: 'volunteers', icon: 'fa-ban', priority: 'high', label: 'إيقاف كارنيه التطوع' },
  volunteer_card_expiring: { category: 'volunteers', icon: 'fa-hourglass-half', priority: 'normal', label: 'اقتراب انتهاء الكارنيه' },
  volunteer_card_renewed: { category: 'volunteers', icon: 'fa-arrows-rotate', priority: 'normal', label: 'تجديد الكارنيه' },

  /* ── إشعار اختبار ── */
  test: { category: 'system', icon: 'fa-flask', priority: 'normal', label: 'إشعار تجريبي' }
}

export type NotificationType = keyof typeof NOTIFICATION_TYPES

/** النوع الافتراضي لو وصل مفتاح غير معروف — أفضل من رمي استثناء. */
const FALLBACK_TYPE: NotificationTypeDef = {
  category: 'system',
  icon: 'fa-bell',
  priority: 'normal',
  label: 'إشعار'
}

export const typeDef = (type: string): NotificationTypeDef =>
  NOTIFICATION_TYPES[type] || FALLBACK_TYPE

/** التصنيفات المتاحة للمستخدم في شاشة التفضيلات. */
export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  financial: 'المالية والتبرعات',
  volunteers: 'التطوع والكارنيهات',
  content: 'الأخبار والرسائل',
  account: 'الحساب والصلاحيات',
  system: 'النظام'
}

/* ────────────────────────── التفضيلات ────────────────────────── */

export interface NotificationPrefsDoc {
  push_enabled: boolean
  email_enabled: boolean
  categories: Partial<Record<NotificationCategory, boolean>>
  quiet_hours?: { enabled: boolean; from: string; to: string }
}

export const DEFAULT_PREFS: NotificationPrefsDoc = {
  push_enabled: true,
  email_enabled: true,
  categories: {
    financial: true,
    volunteers: true,
    content: true,
    account: true,
    system: true
  }
}

/**
 * يقرأ تفضيلات مستخدم. الغياب = القيم الافتراضية (كل شيء مفعّل).
 * لا يرمي استثناءً: فشل القراءة يعني الإرسال بالإعدادات الافتراضية، وهذا
 * أفضل من إسقاط الإشعار بصمت.
 */
export const getPrefs = async (db: any, userId: string): Promise<NotificationPrefsDoc> => {
  if (!userId) return DEFAULT_PREFS
  try {
    const snap = await db.collection('notification_prefs').doc(userId).get()
    if (!snap.exists) return DEFAULT_PREFS
    const d = snap.data() || {}
    return {
      push_enabled: d.push_enabled !== false,
      email_enabled: d.email_enabled !== false,
      categories: { ...DEFAULT_PREFS.categories, ...(d.categories || {}) },
      quiet_hours: d.quiet_hours
    }
  } catch (e: any) {
    console.error('[notify] تعذّر قراءة التفضيلات:', e?.message || e)
    return DEFAULT_PREFS
  }
}

/* ────────────────────────── الكتابة ────────────────────────── */

export interface NotifyInput {
  /** معرّف المستخدم المستهدف — مطلوب لإشعارات المستخدم. */
  user_id?: string | null
  audience?: NotificationAudience
  type: string
  title: string
  body?: string
  /** مسار داخلي يُفتح عند الضغط على الإشعار. */
  link?: string
  /** من قام بالإجراء (المشرف عادةً) — للشفافية والمساءلة. */
  actor?: { id?: string | null; name?: string | null } | null
  /** بيانات إضافية للعرض أو التتبع. لا تضع فيها أسرارًا. */
  meta?: Record<string, unknown>
  /** تجاوز الأيقونة/الأولوية المستنبطة من النوع (نادر). */
  icon?: string
  priority?: NotificationPriority
}

export interface NotificationRecord {
  user_id: string | null
  audience: NotificationAudience
  type: string
  category: NotificationCategory
  title: string
  body: string
  link: string | null
  icon: string
  priority: NotificationPriority
  is_read: boolean
  read_at: string | null
  actor_id: string | null
  actor_name: string | null
  meta: Record<string, unknown>
  push_sent: boolean
  created_at: string
}

const MAX_TITLE = 140
const MAX_BODY = 400

const clip = (v: unknown, max: number): string => {
  const s = String(v ?? '').trim()
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

/**
 * ينظّف meta: يُسقط undefined/null، ويحوّل ما ليس رقمًا أو منطقيًا إلى نص.
 * Firestore ترفض undefined، والكائنات المتداخلة العميقة تُصعّب الاستعلام
 * وتُضخّم المستند بلا فائدة — وmeta وصف لا مصدر بيانات.
 */
const cleanMeta = (meta?: Record<string, unknown>): Record<string, unknown> => {
  if (!meta) return {}
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(meta)) {
    if (v === undefined || v === null) continue
    if (typeof v === 'number' || typeof v === 'boolean') out[k] = v
    else out[k] = clip(v, 300)
  }
  return out
}

/** يبني السجل الكامل من المدخلات دون كتابته — مفصولة للاختبار. */
export const buildNotification = (input: NotifyInput): NotificationRecord => {
  const def = typeDef(input.type)
  const audience: NotificationAudience = input.audience || (input.user_id ? 'user' : 'admins')

  return {
    user_id: audience === 'admins' ? null : input.user_id || null,
    audience,
    type: input.type,
    category: def.category,
    title: clip(input.title, MAX_TITLE) || def.label,
    body: clip(input.body, MAX_BODY),
    link: input.link ? clip(input.link, 300) : null,
    icon: input.icon || def.icon,
    priority: input.priority || def.priority,
    is_read: false,
    read_at: null,
    actor_id: input.actor?.id || null,
    actor_name: input.actor?.name ? clip(input.actor.name, 120) : null,
    meta: cleanMeta(input.meta),
    push_sent: false,
    created_at: new Date().toISOString()
  }
}

/**
 * ينفّذ مهمة في الخلفية بلا تأخير للاستجابة ولا تسريب استثناء.
 * نسخة مستقلة عن نظيرتها في email.ts لتبقى سجلات الأخطاء مميّزة
 * (‎[notify]‎ لا ‎[email]‎) فيسهل تتبّع أي طبقة فشلت.
 */
export const notifyInBackground = async (c: any, task: () => Promise<unknown>): Promise<void> => {
  const guarded = () =>
    Promise.resolve()
      .then(task)
      .catch((e: any) => console.error('[notify] مهمة الخلفية فشلت:', e?.message || e))

  try {
    const ctx = c?.executionCtx
    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(guarded())
      return
    }
  } catch {
    // executionCtx getter يرمي استثناء على بعض بيئات التشغيل
  }

  await guarded()
}

export interface NotifyResult {
  created: boolean
  id?: string
  skipped?: string
  pushed?: number
}

/**
 * إشعار مستخدم واحد.
 *
 * يكتب السجل دائمًا (طالما التصنيف غير مُوقَف من المستخدم)، ثم يحاول
 * إرسال Push كأثر جانبي منفصل. فشل الـ Push لا يمنع ظهور الإشعار في
 * مركز الإشعارات — وهذا مقصود: المركز هو الضمان، والـ Push تحسين.
 */
export const notify = async (c: any, input: NotifyInput): Promise<NotifyResult> => {
  try {
    if (!input?.type || !input?.title) return { created: false, skipped: 'missing type/title' }

    const record = buildNotification(input)

    if (record.audience === 'user' && !record.user_id) {
      // حالة شائعة ومشروعة: طلب تطوع من زائر بلا حساب (profile_id = null)
      return { created: false, skipped: 'no target user' }
    }

    const db = getFirestore(c)
    const def = typeDef(input.type)

    // احترام تفضيلات المستخدم قبل الكتابة
    let prefs = DEFAULT_PREFS
    if (record.audience === 'user' && record.user_id) {
      prefs = await getPrefs(db, record.user_id)
      // إشعارات الحساب والنظام لا تُوقَف: إزالة صلاحية أو تعيين مشرف
      // معلومة يجب أن تصل صاحبها حتى لو أغلق التصنيف.
      const optional = def.category !== 'account' && def.category !== 'system'
      if (optional && prefs.categories[def.category] === false) {
        return { created: false, skipped: `category "${def.category}" disabled` }
      }
    }

    const ref = await db.collection('notifications').add(record)

    // ─ الـ Push أثر جانبي: لا يعطّل نجاح الإشعار ─
    let pushed = 0
    if (!def.silent && record.audience === 'user' && record.user_id && prefs.push_enabled) {
      const cfg = getNotifyConfig(c)
      const muted = record.priority !== 'high' && isQuietHour(cfg)
      if (!muted) {
        try {
          const { sendPushToUser } = await import('./push')
          const res = await sendPushToUser(c, record.user_id, {
            title: record.title,
            body: record.body,
            link: record.link || '/notifications',
            tag: `${record.type}:${ref.id}`
          })
          pushed = res.sent
          if (res.sent > 0) {
            await ref.update({ push_sent: true }).catch(() => {})
          }
        } catch (e: any) {
          console.error('[notify] فشل إرسال Push:', e?.message || e)
        }
      }
    }

    return { created: true, id: ref.id, pushed }
  } catch (e: any) {
    // الإشعار أثر جانبي — لا يُفشل العملية الأصلية أبدًا
    console.error('[notify] تعذّر إنشاء الإشعار:', e?.message || e)
    return { created: false, skipped: e?.message || 'unknown error' }
  }
}

/**
 * إشعار جميع المشرفين بسجل واحد.
 *
 * لا يُنسخ لكل مشرف: سجل واحد audience:'admins' وحالة القراءة لكل مشرف
 * في notification_reads. الـ Push يُرسل لكل مشرف على حدة لأن التوكنات
 * فردية بطبيعتها.
 */
export const notifyAdmins = async (
  c: any,
  input: Omit<NotifyInput, 'user_id' | 'audience'>
): Promise<NotifyResult> => {
  try {
    if (!input?.type || !input?.title) return { created: false, skipped: 'missing type/title' }

    const db = getFirestore(c)
    const record = buildNotification({ ...input, audience: 'admins' })
    const ref = await db.collection('notifications').add(record)

    const def = typeDef(input.type)
    let pushed = 0

    if (!def.silent) {
      const cfg = getNotifyConfig(c)
      const muted = record.priority !== 'high' && isQuietHour(cfg)
      if (!muted) {
        try {
          const adminsSnap = await db.collection('profiles').where('role', '==', 'admin').get()
          const adminIds: string[] = adminsSnap.docs
            .map((d: any) => d.id)
            // لا نُشعر المشرف بفعله هو — يعرفه أصلًا وقد قام به الآن
            .filter((id: string) => id !== record.actor_id)

          if (adminIds.length) {
            const { sendPushToUsers } = await import('./push')
            const res = await sendPushToUsers(c, adminIds, {
              title: record.title,
              body: record.body,
              link: record.link || '/dashboard?view=notifications',
              tag: `${record.type}:${ref.id}`
            })
            pushed = res.sent
            if (res.sent > 0) {
              await ref.update({ push_sent: true }).catch(() => {})
            }
          }
        } catch (e: any) {
          console.error('[notify] فشل إرسال Push للمشرفين:', e?.message || e)
        }
      }
    }

    return { created: true, id: ref.id, pushed }
  } catch (e: any) {
    console.error('[notify] تعذّر إشعار المشرفين:', e?.message || e)
    return { created: false, skipped: e?.message || 'unknown error' }
  }
}

/* ────────────────────────── أدوات مساعدة للأحداث ────────────────────────── */

/**
 * يكتشف ترقية رتبة متطوع حقيقية.
 *
 * لماذا دالة مخصّصة؟
 * حقل `rank` قابل للتعديل من ثلاث نقاط: /status/:id و /update/:id و
 * /update-hours/:id — وفورم الساعات يُرسل الرتبة مع الساعات في كل حفظ.
 * بدون هذه المقارنة، حفظ الساعات ثلاث مرات كان سيُرسل ثلاثة إشعارات
 * "تمت ترقيتك" والرتبة لم تتغير. القاعدة: نُشعر فقط لو القيمة اختلفت
 * فعلًا، ولها قيمة سابقة (أول إسناد يحدث لحظة القبول ويغطّيه إشعار
 * volunteer_approved فلا نكرّره).
 */
export const detectRankChange = (
  before: unknown,
  after: unknown
): { changed: boolean; from: string; to: string; isFirstAssignment: boolean } => {
  const from = String(before ?? '').trim()
  const to = String(after ?? '').trim()
  const changed = Boolean(to) && from !== to
  return { changed, from, to, isFirstAssignment: changed && !from }
}

/** يبني نص "من رتبة → إلى رتبة" للإشعار. */
export const rankChangeBody = (name: string, from: string, to: string): string =>
  from
    ? `تهانينا ${name}! تمت ترقيتك من "${from}" إلى "${to}".`
    : `تهانينا ${name}! أصبحت رتبتك "${to}".`

/** يصيغ مبلغًا بالعربية لعرضه داخل نص الإشعار. */
export const notifyMoney = (amount: unknown): string => {
  const n = Number(amount)
  if (!isFinite(n)) return String(amount ?? '')
  return `${n.toLocaleString('ar-EG')} ج.م`
}

/** مسارات لوحة التحكم — مصدر واحد يمنع تكرار السلاسل النصية. */
export const dashLink = (view: string, extra?: string): string =>
  `/dashboard?view=${encodeURIComponent(view)}${extra ? `&${extra}` : ''}`
