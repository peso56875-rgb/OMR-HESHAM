/**
 * نظام الإشعارات البريدية — مؤسسة الدكتور عمر هشام الخيرية
 *
 * مبني على Resend HTTP API مباشرة (fetch) بدون أي حزمة npm جديدة.
 * السبب: مشروعنا يُنشر على Vercel كـ prebuilt function، و Vercel لا يشغّل
 * npm install، فكل تبعية جديدة لازم تُنسخ يدويًا عبر scripts/copy-externals.mjs.
 * استخدام HTTP API يوفّر علينا ده تمامًا.
 *
 * قواعد التصميم:
 *  1. البريد "أفضل جهد" (best-effort): لا يفشل طلب المستخدم أبدًا.
 *  2. محدود بزمن 8 ثوان عبر AbortController.
 *  3. لا يرمي استثناءات مطلقًا — يرجّع { sent: false } مع السبب.
 *  4. جداول HTML + أنماط inline (Outlook/Gmail يحذفون <style> ويتجاهلون flexbox).
 *  5. كل نص مستخدم يمر على esc() ضد XSS.
 */

import { amountInWords } from './receipts'

export interface EmailConfig {
  apiKey: string
  from: string
  adminEmail: string
  configured: boolean
}

export interface SendResult {
  sent: boolean
  skipped?: string
  error?: string
}

const glob = globalThis as any

/** يقرأ إعدادات البريد من c.env (Workers) أو process.env (Node/Vercel). */
export const getEmailConfig = (c?: any): EmailConfig => {
  const env = c?.env || {}
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env || {} : {}

  const apiKey = env.RESEND_API_KEY || procEnv.RESEND_API_KEY || ''
  const from =
    env.EMAIL_FROM || procEnv.EMAIL_FROM || 'مؤسسة الدكتور عمر هشام <onboarding@resend.dev>'
  const adminEmail = env.ADMIN_EMAIL || procEnv.ADMIN_EMAIL || ''

  return { apiKey, from, adminEmail, configured: Boolean(apiKey) }
}

/** يهرّب HTML لمنع XSS في محتوى الرسائل. */
export const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const brand = {
  green: '#0c4a3f',
  emerald: '#168a70',
  gold: '#c9a227',
  ink: '#1f2937',
  muted: '#6b7280',
  line: '#e5e7eb',
  bg: '#f4f6f5'
}

/** يصيغ المبالغ بالأرقام العربية. */
export const money = (amount: unknown): string => {
  const n = Number(amount)
  if (!isFinite(n)) return String(amount ?? '')
  return `${n.toLocaleString('ar-EG')} ج.م`
}

/** يبني صفوف جدول، ويتجاهل الحقول الفارغة تلقائيًا. */
const rows = (data: Array<[string, unknown]>): string =>
  data
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid ${brand.line};color:${brand.muted};font-size:14px;white-space:nowrap;">${esc(label)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid ${brand.line};color:${brand.ink};font-size:14px;font-weight:600;">${esc(value)}</td>
        </tr>`
    )
    .join('')

/** الهيكل العام للرسالة (RTL عربي متوافق مع عملاء البريد). */
const shell = (title: string, bodyHtml: string, footerNote?: string): string => `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${brand.bg};font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${brand.bg};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:${brand.green};padding:24px;text-align:center;">
              <div style="color:#ffffff;font-size:19px;font-weight:700;line-height:1.5;">مؤسسة الدكتور عمر هشام الخيرية</div>
              <div style="color:${brand.gold};font-size:12px;margin-top:6px;">مشهرة برقم 3115 لسنة 2026 — وزارة التضامن الاجتماعي</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;">
              <h1 style="margin:0 0 18px;color:${brand.green};font-size:20px;font-weight:700;">${esc(title)}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:#fafafa;border-top:1px solid ${brand.line};padding:18px 24px;text-align:center;">
              ${footerNote ? `<p style="margin:0 0 8px;color:${brand.muted};font-size:12px;line-height:1.7;">${esc(footerNote)}</p>` : ''}
              <p style="margin:0;color:${brand.muted};font-size:11px;line-height:1.7;">
                هذه رسالة آلية من موقع المؤسسة — برجاء عدم الرد عليها مباشرة.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const para = (text: string): string =>
  `<p style="margin:0 0 14px;color:${brand.ink};font-size:15px;line-height:1.9;">${text}</p>`

const table = (inner: string): string =>
  inner
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${brand.line};border-radius:10px;margin:18px 0;">${inner}</table>`
    : ''

/**
 * الإرسال الفعلي. لا يرمي استثناءً أبدًا.
 */
const deliver = async (
  cfg: EmailConfig,
  to: string | string[],
  subject: string,
  html: string,
  replyTo?: string
): Promise<SendResult> => {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean)

  if (!cfg.configured) return { sent: false, skipped: 'RESEND_API_KEY is not set' }
  if (!recipients.length) return { sent: false, skipped: 'no recipient' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: cfg.from,
        to: recipients,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {})
      }),
      signal: controller.signal
    })

    if (!res.ok) {
      let detail = ''
      try {
        detail = (await res.text()).slice(0, 300)
      } catch {
        /* ignore */
      }
      console.error(`[email] provider ${res.status} for "${subject}": ${detail}`)
      return { sent: false, error: `provider ${res.status}` }
    }

    return { sent: true }
  } catch (e: any) {
    const msg = e?.name === 'AbortError' ? 'timed out after 8s' : e?.message || 'unknown error'
    console.error(`[email] failed to send "${subject}": ${msg}`)
    return { sent: false, error: msg }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * ينفّذ مهمة البريد في الخلفية.
 * يستخدم waitUntil لو متاح (لا يؤخر الاستجابة)، وإلا ينتظرها بأمان.
 * أي استثناء داخل المهمة يُلتقط ولا يخرج للخارج.
 */
export const sendInBackground = async (c: any, task: () => Promise<unknown>): Promise<void> => {
  const guarded = () =>
    Promise.resolve()
      .then(task)
      .catch((e: any) => console.error('[email] task threw:', e?.message || e))

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

/* ─────────────────────────── القوالب ─────────────────────────── */

/** 1) إيصال شكر للمتبرع. */
export const donationThanks = (cfg: EmailConfig, d: any): Promise<SendResult> => {
  const to = (d?.donor_email || d?.email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no donor email' })

  const name = d?.donor_name || d?.name || 'المتبرع الكريم'
  // لو التبرع معلق (pending) نوضح للمتبرع أن المراجعة جارية
  const pending = (d?.payment_status || d?.status) === 'pending'
  const html = shell(
    'شكرًا لتبرعك',
    `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
     ${para('نشكرك من قلبنا على تبرعك الكريم. مساهمتك تصل مباشرة لمن يحتاجها، وتساعدنا على مواصلة رسالتنا.')}
     <div style="background:#f0faf7;border-right:4px solid ${brand.emerald};border-radius:8px;padding:16px;margin:18px 0;text-align:center;">
       <div style="color:${brand.muted};font-size:13px;margin-bottom:6px;">قيمة التبرع</div>
       <div style="color:${brand.green};font-size:26px;font-weight:800;">${esc(money(d?.amount))}</div>
     </div>
     ${table(
       rows([
         ['رقم الإيصال', d?.id],
         ['الحملة', d?.campaign_title || d?.campaign_name || d?.campaign_id],
         ['طريقة الدفع', d?.payment_method],
         ['التاريخ', d?.created_at ? new Date(d.created_at).toLocaleString('ar-EG') : ''],
         ['ملاحظات', d?.notes]
       ])
     )}
     ${pending ? para('<strong>ملاحظة:</strong> تبرعك قيد المراجعة وسيتم تأكيده بعد تحقق الفريق من التحويل.') : ''}
     ${para('جزاك الله خيرًا، وجعل صدقتك في ميزان حسناتك.')}`,
    'احتفظ بهذه الرسالة كإيصال لتبرعك.'
  )

  return deliver(cfg, to, 'شكرًا لتبرعك — مؤسسة الدكتور عمر هشام الخيرية', html)
}

/** 2) تنبيه الإدارة بتبرع جديد. */
export const donationAlert = (cfg: EmailConfig, d: any): Promise<SendResult> => {
  const html = shell(
    'تبرع جديد وارد',
    `${para('تم تسجيل تبرع جديد على الموقع:')}
     ${table(
       rows([
         ['المعرّف', d?.id],
         ['المتبرع', d?.donor_name || d?.name || 'غير مذكور'],
         ['البريد', d?.donor_email || d?.email],
         ['الهاتف', d?.donor_phone || d?.phone],
         ['المبلغ', money(d?.amount)],
         ['الحملة', d?.campaign_title || d?.campaign_name || d?.campaign_id || 'تبرع عام'],
         ['طريقة الدفع', d?.payment_method],
         ['الحالة', d?.status],
         ['التاريخ', d?.created_at ? new Date(d.created_at).toLocaleString('ar-EG') : ''],
         ['ملاحظات', d?.notes]
       ])
     )}
     ${para('راجع التبرع من <strong>لوحة التحكم ← التبرعات</strong>.')}`
  )

  return deliver(cfg, cfg.adminEmail, `تبرع جديد: ${money(d?.amount)}`, html)
}

/** 3) تنبيه الإدارة برسالة تواصل جديدة. */
export const contactAlert = (cfg: EmailConfig, m: any): Promise<SendResult> => {
  const html = shell(
    'رسالة تواصل جديدة',
    `${table(
      rows([
        ['المعرّف', m?.id],
        ['الاسم', m?.name],
        ['البريد', m?.email],
        ['الهاتف', m?.phone],
        ['الموضوع', m?.subject],
        ['التاريخ', m?.created_at ? new Date(m.created_at).toLocaleString('ar-EG') : '']
      ])
    )}
     <div style="background:#fafafa;border:1px solid ${brand.line};border-radius:10px;padding:16px;margin:0 0 14px;">
       <div style="color:${brand.muted};font-size:12px;margin-bottom:8px;">نص الرسالة</div>
       <div style="color:${brand.ink};font-size:14px;line-height:1.9;white-space:pre-wrap;">${esc(m?.message)}</div>
     </div>
     ${para('يمكنك الرد على هذه الرسالة مباشرة للتواصل مع المُرسل.')}`
  )

  // reply_to = بريد المُرسل، فالرد المباشر يوصله
  return deliver(
    cfg,
    cfg.adminEmail,
    `رسالة تواصل: ${m?.subject || 'استفسار عام'}`,
    html,
    (m?.email || '').trim() || undefined
  )
}

/** 4) تأكيد استلام رسالة التواصل للمُرسل. */
export const contactAck = (cfg: EmailConfig, m: any): Promise<SendResult> => {
  const to = (m?.email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no sender email' })

  const html = shell(
    'وصلتنا رسالتك',
    `${para(`السيد/ة <strong>${esc(m?.name || 'الفاضل')}</strong>، تحية طيبة.`)}
     ${para('نشكرك على تواصلك مع مؤسسة الدكتور عمر هشام الخيرية. وصلتنا رسالتك وسيقوم الفريق المختص بمراجعتها والرد عليك في أقرب وقت.')}
     ${table(
       rows([
         ['الموضوع', m?.subject],
         ['رقم الرسالة', m?.id]
       ])
     )}
     ${para('نقدّر ثقتك واهتمامك.')}`,
    'مدة الرد المعتادة من 24 إلى 48 ساعة عمل.'
  )

  return deliver(cfg, to, 'تأكيد استلام رسالتك — مؤسسة الدكتور عمر هشام', html)
}

/** 5) تنبيه الإدارة بطلب تطوع جديد. */
export const volunteerAlert = (cfg: EmailConfig, v: any): Promise<SendResult> => {
  const html = shell(
    'طلب تطوع جديد',
    `${table(
      rows([
        ['المعرّف', v?.id],
        ['الاسم', v?.full_name || v?.name],
        ['الهاتف', v?.phone],
        ['البريد', v?.email],
        ['السن', v?.age],
        ['المدينة', v?.city],
        ['المجال', v?.preferred_role || v?.field || v?.area],
        ['المهارات', v?.skills],
        ['التاريخ', v?.created_at ? new Date(v.created_at).toLocaleString('ar-EG') : '']
      ])
    )}
     ${para('راجع الطلب من <strong>لوحة التحكم ← المتطوعين</strong>.')}`
  )

  return deliver(
    cfg,
    cfg.adminEmail,
    `طلب تطوع جديد: ${v?.full_name || v?.name || 'متطوع'}`,
    html,
    (v?.email || '').trim() || undefined
  )
}

/** 6) تأكيد استلام طلب التطوع للمتطوع. */
export const volunteerAck = (cfg: EmailConfig, v: any): Promise<SendResult> => {
  const to = (v?.email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no volunteer email' })

  const html = shell(
    'استلمنا طلب تطوعك',
    `${para(`أهلًا <strong>${esc(v?.full_name || v?.name || 'بك')}</strong>،`)}
     ${para('شكرًا لرغبتك في الانضمام لفريق متطوعي مؤسسة الدكتور عمر هشام الخيرية. استلمنا طلبك وسنتواصل معك قريبًا لاستكمال الخطوات.')}
     ${table(
       rows([
         ['المجال', v?.preferred_role || v?.field || v?.area],
         ['المدينة', v?.city],
         ['رقم الطلب', v?.id]
       ])
     )}
     ${para('وجودك معنا إضافة حقيقية — شكرًا لك.')}`,
    'سنتواصل معك على رقم الهاتف المسجّل.'
  )

  return deliver(cfg, to, 'استلمنا طلب تطوعك — مؤسسة الدكتور عمر هشام', html)
}

/** 7) تنبيه الإدارة بطلب توظيف جديد. */
export const jobApplicationAlert = (cfg: EmailConfig, a: any): Promise<SendResult> => {
  const html = shell(
    'طلب توظيف جديد',
    `${table(
      rows([
        ['المعرّف', a?.id],
        ['الاسم', a?.full_name || a?.name],
        ['البريد', a?.email],
        ['الهاتف', a?.phone],
        ['الوظيفة', a?.job_title || a?.job_id],
        ['السيرة الذاتية', a?.cv_url || a?.resume_url],
        ['التاريخ', a?.created_at ? new Date(a.created_at).toLocaleString('ar-EG') : '']
      ])
    )}
     ${
       a?.message
         ? `<div style="background:#fafafa;border:1px solid ${brand.line};border-radius:10px;padding:16px;margin:0 0 14px;">
              <div style="color:${brand.muted};font-size:12px;margin-bottom:8px;">نبذة عن المتقدم</div>
              <div style="color:${brand.ink};font-size:14px;line-height:1.9;white-space:pre-wrap;">${esc(a.message)}</div>
            </div>`
         : ''
     }
     ${para('راجع الطلب من <strong>لوحة التحكم ← الوظائف</strong>.')}`
  )

  return deliver(
    cfg,
    cfg.adminEmail,
    `طلب توظيف: ${a?.job_title || 'وظيفة'} — ${a?.full_name || a?.name || ''}`.trim(),
    html,
    (a?.email || '').trim() || undefined
  )
}

/**
 * 8) إيصال التبرع الرسمي — يُرسل عند تأكيد التبرع فقط.
 *
 * لماذا هذا القالب منفصل عن donationThanks؟
 * القالب الأول رسالة شكر فورية على تبرع **لم يُتحقق منه بعد**، وهذا
 * مستند مالي لتبرع **مؤكد الاستلام**. دمجهما يعني إما تأخير الشكر حتى
 * انتهاء المراجعة، أو إصدار إيصال لمبلغ قد لا يصل — وكلاهما غير مقبول.
 */
export const donationReceipt = (
  cfg: EmailConfig,
  d: any,
  receiptUrl: string
): Promise<SendResult> => {
  const snap = d?.receipt_snapshot || {}
  const to = (snap.donor_email || d?.donor_email || d?.email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no donor email' })

  const name = snap.donor_name || d?.donor_name || 'المتبرع الكريم'
  const amount = snap.amount ?? d?.amount
  const number = d?.receipt_number || ''

  const html = shell(
    'إيصال تبرعك',
    `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
     ${para('تم تأكيد استلام تبرعك، وهذا إيصالك الرسمي الصادر عن المؤسسة.')}
     <div style="background:#f0faf7;border-right:4px solid ${brand.emerald};border-radius:8px;padding:16px;margin:18px 0;text-align:center;">
       <div style="color:${brand.muted};font-size:13px;margin-bottom:6px;">المبلغ المستلم</div>
       <div style="color:${brand.green};font-size:26px;font-weight:800;">${esc(money(amount))}</div>
       <div style="color:${brand.ink};font-size:13px;font-weight:600;margin-top:10px;padding-top:10px;border-top:1px solid #d7ece5;line-height:1.8;">${esc(amountInWords(amount))}</div>
     </div>
     ${table(
       rows([
         ['رقم الإيصال', number],
         ['أُنفق في', snap.campaign_title],
         ['طريقة الدفع', snap.payment_method],
         [
           'تاريخ الإصدار',
           d?.receipt_issued_at ? new Date(d.receipt_issued_at).toLocaleString('ar-EG') : ''
         ]
       ])
     )}
     <div style="text-align:center;margin:24px 0 8px;">
       <a href="${esc(receiptUrl)}" style="background:${brand.green};color:#ffffff;text-decoration:none;padding:13px 30px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block;">عرض الإيصال وطباعته</a>
     </div>
     ${para('جزاك الله خيرًا، وجعل صدقتك في ميزان حسناتك.')}`,
    'احتفظ بهذا الرابط — يمكن من خلاله التحقق من صحة الإيصال في أي وقت.'
  )

  return deliver(cfg, to, `إيصال تبرعك ${number}`.trim(), html)
}

/** 9) ترحيب بمشترك جديد في النشرة البريدية. */
export const newsletterWelcome = (cfg: EmailConfig, email: string): Promise<SendResult> => {
  const to = (email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no email' })

  const html = shell(
    'مرحبًا بك في نشرتنا البريدية',
    `${para('شكرًا لاشتراكك في النشرة البريدية لمؤسسة الدكتور عمر هشام الخيرية.')}
     ${para('سنوافيك بأخبار حملاتنا، ونتائج مشاريعنا، وقصص المستفيدين — بدون إزعاج.')}
     ${para('نسعد بوجودك معنا.')}`,
    'يمكنك إلغاء الاشتراك في أي وقت.'
  )

  return deliver(cfg, to, 'مرحبًا بك في نشرة مؤسسة الدكتور عمر هشام', html)
}

/* ───────────────────── قوالب نظام الإشعارات ─────────────────────
 *
 * القوالب 10–18 أُضيفت مع نظام الإشعارات المتكامل.
 * كلها تتبع نفس العقد: تُرجّع { sent: false, skipped } بدل ما ترمي
 * استثناء لو مفيش مستلم، وتمر على esc() لكل نص قادم من المستخدم.
 */

/** مربّع تنبيه ملوّن يُستخدم في قوالب الحالة (موافقة/رفض/تجميد). */
const banner = (label: string, value: string, color: string, tint: string): string => `
  <div style="background:${tint};border-right:4px solid ${color};border-radius:8px;padding:16px;margin:18px 0;text-align:center;">
    <div style="color:${brand.muted};font-size:13px;margin-bottom:6px;">${esc(label)}</div>
    <div style="color:${color};font-size:22px;font-weight:800;line-height:1.5;">${esc(value)}</div>
  </div>`

const ROLE_LABELS: Record<string, string> = {
  admin: 'مدير النظام',
  donor: 'متبرع',
  volunteer: 'متطوع',
  user: 'مستخدم'
}

const roleLabel = (role: unknown): string => {
  const key = String(role ?? '').trim()
  return ROLE_LABELS[key] || key || 'مستخدم'
}

/**
 * 10) تغيّر صلاحية الحساب — تعيين مدير أو سحب الصلاحية.
 *
 * هذا أحد الحدثين اللذين طلبهما صاحب الموقع بالنص: «لما حد يتعين ادمن».
 * الرسالة تُصاغ بنبرة مختلفة تمامًا في الحالتين، لأن سحب الصلاحية
 * إشعار حساس ولا يصحّ إرساله بنفس نبرة الترقية.
 */
export const roleChanged = (
  cfg: EmailConfig,
  u: { email?: string; name?: string; role: string; actor?: string }
): Promise<SendResult> => {
  const to = (u?.email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no email' })

  const name = u?.name || 'عضو المؤسسة'
  const isAdmin = String(u?.role || '') === 'admin'

  const html = isAdmin
    ? shell(
        'تم تعيينك مديرًا للنظام',
        `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
         ${para('تم منح حسابك صلاحيات <strong>مدير النظام</strong> على موقع مؤسسة الدكتور عمر هشام الخيرية.')}
         ${banner('صلاحيتك الجديدة', 'مدير النظام', brand.emerald, '#f0faf7')}
         ${para('أصبح بإمكانك الآن الدخول إلى لوحة التحكم لإدارة التبرعات، والمتطوعين، والحملات، والمحتوى، وخزينة المؤسسة.')}
         ${table(rows([['نُفّذ بواسطة', u?.actor]]))}
         ${para('نرجو منك التعامل مع هذه الصلاحية بما تستحقه من أمانة — كل إجراء تقوم به يُسجَّل في سجل التدقيق.')}`,
        'لو لم تكن تتوقع هذا التغيير، تواصل مع إدارة المؤسسة فورًا.'
      )
    : shell(
        'تحديث على صلاحيات حسابك',
        `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
         ${para('نُخبرك بأن صلاحيات <strong>مدير النظام</strong> لم تعد مرتبطة بحسابك.')}
         ${banner('صلاحيتك الحالية', roleLabel(u?.role), brand.gold, '#fdf8e7')}
         ${para('حسابك ما زال نشطًا بالكامل، ويمكنك استخدام الموقع بشكل طبيعي — التغيير يخص لوحة التحكم الإدارية فقط.')}
         ${table(rows([['نُفّذ بواسطة', u?.actor]]))}
         ${para('نشكرك على ما قدّمته، ونتمنى استمرار تواصلك مع المؤسسة.')}`,
        'لأي استفسار بخصوص هذا التغيير، تواصل مع إدارة المؤسسة.'
      )

  return deliver(cfg, to, isAdmin ? 'تم تعيينك مديرًا للنظام' : 'تحديث على صلاحيات حسابك', html)
}

/** 11) نتيجة مراجعة طلب التطوع — قبول أو رفض. */
export const volunteerDecision = (
  cfg: EmailConfig,
  v: {
    email?: string
    full_name?: string
    status: string
    volunteer_code?: string
    expires_at?: string
    reason?: string
  }
): Promise<SendResult> => {
  const to = (v?.email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no email' })

  const name = v?.full_name || 'المتطوع الكريم'
  const approved = String(v?.status || '') === 'approved'

  const html = approved
    ? shell(
        'تم قبول طلب تطوّعك',
        `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
         ${para('يسعدنا إبلاغك بقبول طلب انضمامك لفريق متطوعي مؤسسة الدكتور عمر هشام الخيرية.')}
         ${banner('حالة الطلب', 'مقبول', brand.emerald, '#f0faf7')}
         ${table(
           rows([
             ['كود المتطوع', v?.volunteer_code],
             [
               'صلاحية الكارنيه حتى',
               v?.expires_at ? new Date(v.expires_at).toLocaleDateString('ar-EG') : ''
             ]
           ])
         )}
         ${para('يمكنك الآن الدخول إلى حسابك لعرض كارنيه التطوّع الخاص بك ومتابعة ساعات عملك التطوعي.')}
         ${para('أهلًا بك في الفريق — جزاك الله خيرًا على وقتك وجهدك.')}`,
        'احتفظ بكود المتطوع الخاص بك، فهو مُعرّفك داخل أنشطة المؤسسة.'
      )
    : shell(
        'بخصوص طلب تطوّعك',
        `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
         ${para('نشكرك على رغبتك في التطوّع معنا وعلى الوقت الذي منحته لتقديم طلبك.')}
         ${banner('حالة الطلب', 'غير مقبول حاليًا', brand.gold, '#fdf8e7')}
         ${table(rows([['ملاحظات اللجنة', v?.reason]]))}
         ${para('عدم القبول الآن لا يعني إغلاق الباب — احتياجات المؤسسة تتغيّر مع كل حملة، ويسعدنا أن تتقدّم بطلب جديد لاحقًا.')}
         ${para('تقبّل تقديرنا واحترامنا.')}`,
        'لأي استفسار عن أسباب القرار، تواصل مع إدارة المتطوعين.'
      )

  return deliver(cfg, to, approved ? 'تم قبول طلب تطوّعك' : 'بخصوص طلب تطوّعك', html)
}

/**
 * 12) ترقية المتطوع في الرتبة.
 *
 * الحدث الثاني الذي طلبه صاحب الموقع بالنص: «او يترقي في المتطوعين».
 */
export const volunteerRankPromoted = (
  cfg: EmailConfig,
  v: { email?: string; full_name?: string; from?: string; to?: string; hours?: unknown; actor?: string }
): Promise<SendResult> => {
  const to = (v?.email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no email' })

  const name = v?.full_name || 'المتطوع الكريم'
  const newRank = (v?.to || '').trim() || 'رتبة جديدة'

  const html = shell(
    'مبارك — تمت ترقيتك',
    `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
     ${para('تقديرًا لجهدك وانتظامك في العمل التطوعي، تمت ترقيتك إلى رتبة جديدة داخل فريق متطوعي المؤسسة.')}
     ${banner('رتبتك الجديدة', newRank, brand.emerald, '#f0faf7')}
     ${table(
       rows([
         ['الرتبة السابقة', v?.from],
         ['الرتبة الحالية', v?.to],
         ['إجمالي ساعات التطوّع', v?.hours],
         ['اعتُمدت بواسطة', v?.actor]
       ])
     )}
     ${para('هذه الترقية شهادة على أثرٍ حقيقي تركته في عمل المؤسسة. نتمنى لك استمرار العطاء.')}
     ${para('جزاك الله خيرًا.')}`,
    'يمكنك عرض رتبتك المحدّثة على كارنيه التطوّع من حسابك.'
  )

  return deliver(cfg, to, `مبارك — تمت ترقيتك إلى ${newRank}`, html)
}

/** 13) تغيّر حالة كارنيه التطوّع — تجميد أو تجديد. */
export const volunteerCardStatus = (
  cfg: EmailConfig,
  v: { email?: string; full_name?: string; status: string; expires_at?: string; actor?: string }
): Promise<SendResult> => {
  const to = (v?.email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no email' })

  const name = v?.full_name || 'المتطوع الكريم'
  const frozen = String(v?.status || '') === 'revoked'

  const html = frozen
    ? shell(
        'تم تجميد كارنيه التطوّع',
        `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
         ${para('نُخبرك بأن كارنيه التطوّع الخاص بك أصبح <strong>موقوفًا</strong> مؤقتًا، ولا يصلح للاستخدام في أنشطة المؤسسة حتى إشعار آخر.')}
         ${banner('حالة الكارنيه', 'موقوف', '#b91c1c', '#fef2f2')}
         ${table(rows([['نُفّذ بواسطة', v?.actor]]))}
         ${para('إن كنت ترى أن هناك خطأً في هذا الإجراء، برجاء التواصل مع إدارة المتطوعين لمراجعة الحالة.')}`,
        'لا يترتب على تجميد الكارنيه حذف بياناتك أو ساعات تطوّعك.'
      )
    : shell(
        'تم تجديد كارنيه التطوّع',
        `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
         ${para('تم تجديد صلاحية كارنيه التطوّع الخاص بك بنجاح.')}
         ${banner(
           'صالح حتى',
           v?.expires_at ? new Date(v.expires_at).toLocaleDateString('ar-EG') : 'تم التحديث',
           brand.emerald,
           '#f0faf7'
         )}
         ${table(rows([['نُفّذ بواسطة', v?.actor]]))}
         ${para('يمكنك عرض الكارنيه المحدّث من حسابك في أي وقت.')}
         ${para('شكرًا لاستمرارك معنا.')}`,
        'ننبّهك قبل انتهاء الصلاحية بوقت كافٍ لتجديدها.'
      )

  return deliver(cfg, to, frozen ? 'تم تجميد كارنيه التطوّع' : 'تم تجديد كارنيه التطوّع', html)
}

/** 14) تنبيه المتطوع قبل انتهاء صلاحية الكارنيه (يُرسل من مهمة الكرون). */
export const volunteerCardExpiring = (
  cfg: EmailConfig,
  v: { email?: string; full_name?: string; expires_at?: string; days?: number; volunteer_code?: string }
): Promise<SendResult> => {
  const to = (v?.email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no email' })

  const name = v?.full_name || 'المتطوع الكريم'
  const days = Number(v?.days)
  const daysText = isFinite(days) && days > 0 ? `${days} يومًا` : 'أيام قليلة'

  const html = shell(
    'كارنيه التطوّع على وشك الانتهاء',
    `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
     ${para(`نُنبّهك بأن صلاحية كارنيه التطوّع الخاص بك ستنتهي خلال <strong>${esc(daysText)}</strong>.`)}
     ${banner(
       'ينتهي في',
       v?.expires_at ? new Date(v.expires_at).toLocaleDateString('ar-EG') : daysText,
       brand.gold,
       '#fdf8e7'
     )}
     ${table(rows([['كود المتطوع', v?.volunteer_code]]))}
     ${para('برجاء التواصل مع إدارة المتطوعين لتجديد الكارنيه قبل انتهاء صلاحيته، حتى لا تتأثر مشاركتك في الأنشطة القادمة.')}`,
    'هذا تنبيه آلي — لو تم التجديد بالفعل يمكنك تجاهل الرسالة.'
  )

  return deliver(cfg, to, 'كارنيه التطوّع على وشك الانتهاء', html)
}

/** 15) إخبار المتبرع بإلغاء أو فشل تبرعه. */
export const donationCancelled = (
  cfg: EmailConfig,
  d: { email?: string; donor_name?: string; amount?: unknown; id?: string; reason?: string }
): Promise<SendResult> => {
  const to = (d?.email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no email' })

  const name = d?.donor_name || 'المتبرع الكريم'

  const html = shell(
    'بخصوص عملية تبرعك',
    `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
     ${para('نأسف لإبلاغك بأن عملية التبرع المسجّلة باسمك لم تكتمل، وتم تحديث حالتها إلى <strong>غير مكتملة</strong>.')}
     ${banner('قيمة التبرع', money(d?.amount), brand.gold, '#fdf8e7')}
     ${table(
       rows([
         ['رقم العملية', d?.id],
         ['السبب', d?.reason]
       ])
     )}
     ${para('لم يُخصم من حسابك أي مبلغ مقابل هذه العملية. لو كنت ترى غير ذلك، برجاء التواصل معنا فورًا وسنراجع الأمر بنفسك اليوم.')}
     ${para('يمكنك إعادة المحاولة من الموقع في أي وقت — ونشكر لك حسن نيتك ورغبتك في العطاء.')}`,
    'لأي استفسار مالي، تواصل مع إدارة المؤسسة مع ذكر رقم العملية.'
  )

  return deliver(cfg, to, 'بخصوص عملية تبرعك', html)
}

/** 16) إخبار مُرسل رسالة «اتصل بنا» بأن رسالته تمت مراجعتها والرد عليها. */
export const contactReplied = (
  cfg: EmailConfig,
  m: { email?: string; name?: string; subject?: string; id?: string; reply?: string }
): Promise<SendResult> => {
  const to = (m?.email || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no email' })

  const name = m?.name || 'السائل الكريم'

  const html = shell(
    'تم الرد على رسالتك',
    `${para(`السيد/ة <strong>${esc(name)}</strong>، تحية طيبة.`)}
     ${para('راجع فريق المؤسسة رسالتك وتم الرد عليها.')}
     ${table(
       rows([
         ['موضوع الرسالة', m?.subject],
         ['رقم الرسالة', m?.id]
       ])
     )}
     ${
       m?.reply
         ? `<div style="background:#f0faf7;border-right:4px solid ${brand.emerald};border-radius:8px;padding:16px;margin:18px 0;">
              <div style="color:${brand.muted};font-size:13px;margin-bottom:8px;">ردّ المؤسسة</div>
              <div style="color:${brand.ink};font-size:15px;line-height:1.9;white-space:pre-line;">${esc(m.reply)}</div>
            </div>`
         : para('لو احتجت أي توضيح إضافي، يمكنك مراسلتنا مرة أخرى من صفحة «اتصل بنا».')
     }
     ${para('شكرًا لتواصلك معنا.')}`,
    'يمكنك الرد على هذه الرسالة لمتابعة نفس الموضوع.'
  )

  return deliver(cfg, to, `تم الرد على رسالتك${m?.subject ? `: ${m.subject}` : ''}`, html)
}

/**
 * 17) تنبيه إداري على حركة مالية كبيرة في الخزينة.
 *
 * يُرسل لبريد الإدارة فقط (ADMIN_EMAIL) لأنه إشعار رقابي داخلي،
 * الغرض منه أن يعرف صاحب المؤسسة بالحركات الكبيرة لحظة حدوثها.
 */
export const treasuryAlert = (
  cfg: EmailConfig,
  t: {
    kind: string
    amount?: unknown
    category?: string
    beneficiary?: string
    description?: string
    actor?: string
    id?: string
  }
): Promise<SendResult> => {
  const to = (cfg?.adminEmail || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no email' })

  const isExpense = String(t?.kind || '') === 'expense'
  const kindLabel = isExpense ? 'مصروف' : 'إيراد'
  const color = isExpense ? '#b91c1c' : brand.emerald
  const tint = isExpense ? '#fef2f2' : '#f0faf7'

  const html = shell(
    `حركة مالية كبيرة: ${kindLabel}`,
    `${para('تم تسجيل حركة مالية تجاوزت الحد المُعرّف للتنبيه في خزينة المؤسسة.')}
     ${banner(`قيمة ال${kindLabel}`, money(t?.amount), color, tint)}
     ${table(
       rows([
         ['النوع', kindLabel],
         ['البند', t?.category],
         ['الجهة/المستفيد', t?.beneficiary],
         ['الوصف', t?.description],
         ['سُجّلت بواسطة', t?.actor],
         ['رقم الحركة', t?.id]
       ])
     )}
     ${para('برجاء مراجعة الحركة من لوحة التحكم للتأكد من صحة البيانات والمستندات المرفقة.')}`,
    'هذا تنبيه رقابي آلي موجّه لإدارة المؤسسة فقط.'
  )

  return deliver(cfg, to, `تنبيه: ${kindLabel} بقيمة ${money(t?.amount)}`, html)
}

/** 18) تنبيه إداري ببلوغ حملة هدفها المالي. */
export const campaignGoalReached = (
  cfg: EmailConfig,
  ca: { id?: string; title?: string; goal?: unknown; raised?: unknown }
): Promise<SendResult> => {
  const to = (cfg?.adminEmail || '').trim()
  if (!to) return Promise.resolve({ sent: false, skipped: 'no email' })

  const title = ca?.title || 'حملة'
  const goalNum = Number(ca?.goal)
  const raisedNum = Number(ca?.raised)
  const pct =
    isFinite(goalNum) && goalNum > 0 && isFinite(raisedNum)
      ? `${Math.round((raisedNum / goalNum) * 100).toLocaleString('ar-EG')}%`
      : ''

  const html = shell(
    'حملة بلغت هدفها',
    `${para(`الحمد لله، حملة <strong>${esc(title)}</strong> وصلت إلى هدفها المالي بالكامل.`)}
     ${banner('إجمالي ما تم جمعه', money(ca?.raised), brand.emerald, '#f0faf7')}
     ${table(
       rows([
         ['الحملة', title],
         ['الهدف المُعلن', money(ca?.goal)],
         ['المُحصّل', money(ca?.raised)],
         ['نسبة الإنجاز', pct],
         ['رقم الحملة', ca?.id]
       ])
     )}
     ${para('يُفضّل الآن تحديث حالة الحملة على الموقع، ونشر تقرير بما تم إنجازه ليطمئن المتبرعون على أثر تبرعاتهم.')}`,
    'هذا تنبيه إداري آلي موجّه لإدارة المؤسسة.'
  )

  return deliver(cfg, to, `حملة «${title}» بلغت هدفها`, html)
}
