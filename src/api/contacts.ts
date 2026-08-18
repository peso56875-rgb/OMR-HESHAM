import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware, rateLimiter } from './middleware'
import {
  getEmailConfig,
  sendInBackground,
  contactAlert,
  contactAck,
  contactReplied
} from '../lib/email'
import { notify, notifyAdmins, notifyInBackground, dashLink } from '../lib/notifications'

export const contacts = new Hono()

/**
 * يقصّ نصًّا طويلًا لعنوان إشعار.
 *
 * عناوين الإشعارات بيكتبها زوّار من الخارج، وبعضهم بيلزق رسالة كاملة في
 * حقل الموضوع. بدون القص كان الجرس بيتمدّد ويكسر تنسيق الهيدر.
 */
const clip = (value: unknown, max: number): string => {
  const s = String(value ?? '').replace(/\s+/g, ' ').trim()
  if (!s) return ''
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

// Submit a contact message (accepts form data from browser or JSON)
contacts.post('/', rateLimiter(5, 60000, 'contact'), async (c) => {
  const db = getFirestore(c)

  const contentType = c.req.header('content-type') || ''
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }

  const { name, email, phone, subject, message } = body

  if (!name || !email || !message) {
    if (!contentType.includes('application/json')) {
      return c.redirect('/contact?error=missing_fields')
    }
    return c.json({ error: 'الرجاء ملء جميع الحقول المطلوبة' }, 400)
  }

  try {
    const contactData = {
      name,
      email,
      phone: phone || '',
      subject: subject || 'استفسار عام',
      message,
      status: 'unread',
      created_at: new Date().toISOString()
    }

    const ref = await db.collection('contacts').add(contactData)

    // Notify the team and reassure the sender. Email is best-effort: a mail
    // failure must never turn a saved message into an error for the visitor.
    const cfg = getEmailConfig(c)
    await sendInBackground(c, async () => {
      await Promise.allSettled([
        contactAlert(cfg, { ...contactData, id: ref.id }),
        contactAck(cfg, contactData)
      ])
    })

    // A3 — إشعار المشرفين برسالة تواصل جديدة.
    //
    // منفصل عن البريد بشكل مقصود: البريد ممكن يكون غير مُهيَّأ (لا RESEND_API_KEY)
    // أو يفشل، ومركز الإشعارات هو الضمان الوحيد إن الرسالة مش هتضيع.
    // نقص الموضوع/النص في العنوان حتى لا ينفجر عرض الجرس بنص طويل.
    await notifyInBackground(c, async () => {
      await notifyAdmins(c, {
        type: 'contact_new',
        title: `رسالة تواصل جديدة: ${clip(contactData.subject, 60)}`,
        body: `${contactData.name} — ${clip(contactData.message, 140)}`,
        link: dashLink('contacts'),
        meta: {
          contact_id: ref.id,
          sender_name: contactData.name,
          sender_email: contactData.email,
          sender_phone: contactData.phone
        }
      })
    })

    if (!contentType.includes('application/json')) {
      return c.redirect('/contact?success=1')
    }
    return c.json({ message: 'تم إرسال رسالتك بنجاح.' })
  } catch (error: any) {
    console.error('Error submitting contact message:', error.message)
    if (!contentType.includes('application/json')) {
      return c.redirect('/contact?error=' + encodeURIComponent(error.message))
    }
    return c.json({ error: error.message }, 500)
  }
})

// Update status (Admin only)
contacts.post('/status/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()
  const status = String(body.status || '')
  const reply = String((body as any).reply || '').trim()

  try {
    const ref = db.collection('contacts').doc(id)

    // نقرأ **قبل** التحديث للحصول على الحالة القديمة وبيانات المُرسِل.
    // بعد الـ update تكون الحالة القديمة قد ضاعت، ولن نعرف هل هذا تغيير
    // فعلي أم إعادة حفظ لنفس القيمة.
    const snap = await ref.get()
    if (!snap.exists) {
      return c.redirect('/dashboard?view=contacts&error=1')
    }
    const before = snap.data() || {}
    const oldStatus = String(before.status || 'unread')

    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
    if (reply) {
      patch.reply = reply
      patch.replied_at = new Date().toISOString()
      const actor = (c as any).get('user')
      patch.replied_by = actor?.name || actor?.email || 'إدارة المؤسسة'
    }

    await ref.update(patch)

    // U7 — إشعار صاحب الرسالة بأن الإدارة ردّت عليه.
    //
    // شرطان معًا:
    //  1) statusChanged — لوحة التحكم تسمح بإعادة إرسال نفس الحالة، وبدون
    //     المقارنة كان السائل هيستلم «تم الرد على رسالتك» كل مرة يضغط
    //     المشرف الزر، وهو إزعاج يفقده الثقة في إشعاراتنا.
    //  2) الحالة النهائية replied، أو (read مع نص ردّ) — «مقروءة» وحدها
    //     ليست ردًّا ولا تستحق إزعاج السائل.
    const statusChanged = status !== oldStatus
    const isReplyEvent = status === 'replied' || (status === 'read' && !!reply)

    if (statusChanged && isReplyEvent) {
      const senderEmail = String(before.email || '')
      const senderName = String(before.name || 'السائل الكريم')
      const subject = String(before.subject || 'استفسار عام')
      // profile_id غالبًا null: معظم الرسائل من زوّار بلا حساب. notify()
      // بترجع skipped بأمان في الحالة دي، والبريد يبقى قناة التوصيل.
      const targetId = (before as any).profile_id || null
      const actor = (c as any).get('user')
      const actorRef = { id: actor?.id || null, name: actor?.name || actor?.email || 'إدارة المؤسسة' }

      await notifyInBackground(c, async () => {
        const cfg = getEmailConfig(c)
        await Promise.allSettled([
          notify(c, {
            user_id: targetId,
            type: 'contact_replied',
            title: `تم الرد على رسالتك: ${clip(subject, 60)}`,
            body: reply
              ? clip(reply, 160)
              : 'راجع فريق المؤسسة رسالتك وتم الرد عليها. تفقّد بريدك الإلكتروني.',
            link: '/contact',
            actor: actorRef,
            meta: { contact_id: id, subject }
          }),
          contactReplied(cfg, { email: senderEmail, name: senderName, subject, id, reply })
        ])
      })
    }

    return c.redirect('/dashboard?view=contacts&success=1')
  } catch (error: any) {
    console.error('Error updating contact status:', error.message)
    return c.redirect('/dashboard?view=contacts&error=1')
  }
})
