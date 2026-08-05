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

/** 8) ترحيب بمشترك جديد في النشرة البريدية. */
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
