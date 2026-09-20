import { Hono } from 'hono'
import crypto from 'crypto'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware, rateLimiter } from './middleware'
import { getEmailConfig, sendInBackground, newsletterWelcome, newsletterConfirmationEmail } from '../lib/email'
import { notifyAdmins, notifyInBackground, dashLink } from '../lib/notifications'
import { cleanEmail, isValidEmail } from './sanitize'

export const newsletter = new Hono()

/**
 * ✅ الأمان: تحويل آمن بعد معالجة النموذج لمنع هجمات Open Redirect.
 */
const safeLocalRedirect = (c: any, fallback = '/'): string => {
  const referer = c.req.header('referer') || ''
  try {
    const url = new URL(referer)
    const host = url.host.toLowerCase()
    const ownHost = (c.req.header('host') || '').toLowerCase()
    const knownHosts = new Set([
      'omarhesham-foundation.com',
      'www.omarhesham-foundation.com',
      'omarhesham.org',
      'www.omarhesham.org',
    ])
    if (ownHost === host || knownHosts.has(host)) {
      return url.pathname + url.search + url.hash || fallback
    }
  } catch {
    // Referer غير قابل للتحليل — تجاهله.
  }
  return fallback
}

/**
 * اشترك في النشرة البريدية مع التحقق المزدوج (Double Opt-In).
 * يحمي الدومين من الحظر ويمنع استغلال الخادم في Email Bombing.
 */
newsletter.post('/', rateLimiter(5, 60000, 'newsletter'), async (c) => {
  const db = getFirestore(c)

  const contentType = c.req.header('content-type') || ''
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json().catch(() => ({}))
  } else {
    body = await c.req.parseBody()
  }

  const { email } = body

  if (!email) {
    if (!contentType.includes('application/json')) {
      return c.redirect(safeLocalRedirect(c, '/#newsletter'))
    }
    return c.json({ error: 'البريد الإلكتروني مطلوب' }, 400)
  }

  // ✅ الأمان: تحقق صارم من RFC 5322 واستبعاد النطاقات المؤقتة
  const rawEmail = cleanEmail(email)
  if (!isValidEmail(rawEmail)) {
    if (!contentType.includes('application/json')) {
      return c.redirect(safeLocalRedirect(c, '/#newsletter') + '&news_error=invalid_email')
    }
    return c.json({ error: 'البريد الإلكتروني غير صالح أو من نطاق مؤقت غير مسموح به' }, 400)
  }

  const normalizedEmail = rawEmail.toLowerCase()

  try {
    const querySnapshot = await db.collection('newsletter_subscribers')
      .where('email', '==', normalizedEmail)
      .get()

    if (!querySnapshot.empty) {
      const existing = querySnapshot.docs[0].data()
      if (existing?.status === 'subscribed') {
        if (!contentType.includes('application/json')) {
          const dest = safeLocalRedirect(c, '/#newsletter')
          const separator = dest.includes('?') ? '&' : '?'
          return c.redirect(dest + separator + 'news_already=1')
        }
        return c.json({ message: 'أنت مشترك بالفعل في نشرتنا البريدية!' })
      }
    }

    // توليد رمز تأكيد مشفر وصالح لمدة 24 ساعة (CSPRNG Token)
    const confirmationToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()

    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id
      await db.collection('newsletter_subscribers').doc(docId).update({
        status: 'pending_confirmation',
        confirmation_token: confirmationToken,
        confirmation_expires_at: expiresAt,
        updated_at: now
      })
    } else {
      await db.collection('newsletter_subscribers').add({
        email: normalizedEmail,
        status: 'pending_confirmation',
        confirmation_token: confirmationToken,
        confirmation_expires_at: expiresAt,
        created_at: now
      })
    }

    // إنشاء رابط التفعيل الآمن
    let origin = ''
    try {
      origin = new URL(c.req.url).origin
    } catch {
      origin = 'https://omarhesham-foundation.com'
    }
    const confirmUrl = `${origin}/api/newsletter/confirm?token=${encodeURIComponent(confirmationToken)}`

    // إرسال بريد التأكيد فقط — لن يتم إرسال الترحيب النهائي أو إشعار الإدارة إلا بعد الضغط
    const cfg = getEmailConfig(c)
    await sendInBackground(c, () => newsletterConfirmationEmail(cfg, normalizedEmail, confirmUrl))

    if (!contentType.includes('application/json')) {
      const dest = safeLocalRedirect(c, '/#newsletter')
      const separator = dest.includes('?') ? '&' : '?'
      return c.redirect(dest + separator + 'news_pending=1')
    }
    return c.json({
      message: 'تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. يرجى فتح بريدك والضغط على رابط التأكيد لإتمام الاشتراك بنجاح.'
    })
  } catch (error: any) {
    console.error('Newsletter subscription error:', error.message)
    if (!contentType.includes('application/json')) {
      const dest = safeLocalRedirect(c, '/#newsletter')
      const separator = dest.includes('?') ? '&' : '?'
      return c.redirect(dest + separator + 'news_error=1')
    }
    return c.json({ error: error.message }, 400)
  }
})

/**
 * نقطة تأكيد الاشتراك (Double Opt-In Verification Endpoint).
 * يتحقق من الرمز ويفعّل الاشتراك ويرسل الترحيب النهائي ويخطر الإدارة.
 */
newsletter.get('/confirm', rateLimiter(10, 60000, 'news-confirm'), async (c) => {
  const token = (c.req.query('token') || '').trim()
  if (!token || token.length < 10) {
    return c.html(`
      <div dir="rtl" style="font-family:sans-serif;text-align:center;padding:50px 20px;">
        <h2 style="color:#e11d48">رابط التأكيد غير صالح</h2>
        <p style="color:#64748b">الرابط المستخدم غير صحيح أو ناقص. يرجى إعادة المحاولة من رسالة البريد الإلكتروني.</p>
        <a href="/" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#0c4a3f;color:#fff;border-radius:8px;text-decoration:none">العودة للرئيسية</a>
      </div>
    `, 400)
  }

  const db = getFirestore(c)

  try {
    const snap = await db.collection('newsletter_subscribers')
      .where('confirmation_token', '==', token)
      .limit(1)
      .get()

    if (snap.empty) {
      return c.html(`
        <div dir="rtl" style="font-family:sans-serif;text-align:center;padding:50px 20px;">
          <h2 style="color:#e11d48">رابط التأكيد غير صالح أو تم استخدامه سابقاً</h2>
          <p style="color:#64748b">لم يتم العثور على اشتراك معلق مطابق لهذا الرمز. قد تكون أكدت اشتراكك بالفعل.</p>
          <a href="/" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#0c4a3f;color:#fff;border-radius:8px;text-decoration:none">العودة للرئيسية</a>
        </div>
      `, 404)
    }

    const doc = snap.docs[0]
    const data = doc.data() || {}

    // التحقق من تاريخ الصلاحية (24 ساعة)
    if (data.confirmation_expires_at) {
      const expires = new Date(data.confirmation_expires_at).getTime()
      if (Date.now() > expires) {
        return c.html(`
          <div dir="rtl" style="font-family:sans-serif;text-align:center;padding:50px 20px;">
            <h2 style="color:#d97706">انتهت صلاحية رابط التأكيد</h2>
            <p style="color:#64748b">صلاحية الرابط هي 24 ساعة فقط. يرجى إدخال بريدك مرة أخرى من الصفحة الرئيسية للحصول على رابط جديد.</p>
            <a href="/#newsletter" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#0c4a3f;color:#fff;border-radius:8px;text-decoration:none">إعادة الاشتراك</a>
          </div>
        `, 410)
      }
    }

    // تفعيل الاشتراك ومسح رمز التأكيد لضمان عدم استخدامه مرة أخرى
    await db.collection('newsletter_subscribers').doc(doc.id).update({
      status: 'subscribed',
      confirmation_token: null,
      confirmation_expires_at: null,
      confirmed_at: new Date().toISOString()
    })

    const subscriberEmail = data.email || ''

    // إرسال بريد الترحيب بعد التأكيد
    if (subscriberEmail) {
      const cfg = getEmailConfig(c)
      await sendInBackground(c, () => newsletterWelcome(cfg, subscriberEmail))

      // إشعار الإدارة الآن فقط بعد ثبوت حقيقة البريد
      await notifyInBackground(c, async () => {
        await notifyAdmins(c, {
          type: 'newsletter_new',
          title: 'مشترك مؤكد في النشرة البريدية ✅',
          body: subscriberEmail,
          link: dashLink('newsletter'),
          meta: { email: subscriberEmail, confirmed: true }
        })
      })
    }

    return c.html(`
      <div dir="rtl" style="font-family:sans-serif;text-align:center;padding:60px 20px;background:#f8fafc;min-height:70vh;display:flex;align-items:center;justify-content:center;">
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:40px 30px;max-width:500px;box-shadow:0 10px 25px rgba(0,0,0,0.05);">
          <div style="font-size:3rem;margin-bottom:15px;color:#10b981">✨</div>
          <h2 style="color:#0c4a3f;margin-bottom:12px;font-weight:800;">تم تأكيد اشتراكك بنجاح!</h2>
          <p style="color:#64748b;line-height:1.7;margin-bottom:25px;">
            أهلاً بك في النشرة البريدية لمؤسسة د. عمر هشام الخيرية. تم تأكيد بريدك وسيصلك تقريرنا الشهري بأخبار الخير والحملات المباركة.
          </p>
          <a href="/news" style="display:inline-block;padding:12px 28px;background:#0c4a3f;color:#fff;border-radius:99px;text-decoration:none;font-weight:bold;">
            تصفح الأخبار والمستجدات
          </a>
        </div>
      </div>
    `)
  } catch (err: any) {
    console.error('Newsletter confirm error:', err?.message || err)
    return c.html(`
      <div dir="rtl" style="font-family:sans-serif;text-align:center;padding:50px 20px;">
        <h2 style="color:#e11d48">حدث خطأ أثناء التأكيد</h2>
        <p style="color:#64748b">يرجى المحاولة مرة أخرى لاحقاً.</p>
        <a href="/" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#0c4a3f;color:#fff;border-radius:8px;text-decoration:none">العودة للرئيسية</a>
      </div>
    `, 500)
  }
})

// Update subscriber status (Admin only)
newsletter.post('/status/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()
  const status = body.status as string

  try {
    await db.collection('newsletter_subscribers').doc(id).update({ status })
    return c.redirect('/dashboard?view=newsletter&success=1')
  } catch (error: any) {
    console.error('Error updating newsletter subscriber status:', error.message)
    return c.redirect('/dashboard?view=newsletter&error=1')
  }
})

// Delete subscriber (Admin only)
newsletter.post('/delete/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string

  try {
    await db.collection('newsletter_subscribers').doc(id).delete()
    return c.redirect('/dashboard?view=newsletter&success=1')
  } catch (error: any) {
    console.error('Error deleting newsletter subscriber:', error.message)
    return c.redirect('/dashboard?view=newsletter&error=1')
  }
})
