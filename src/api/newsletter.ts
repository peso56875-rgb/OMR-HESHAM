import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware, rateLimiter } from './middleware'
import { getEmailConfig, sendInBackground, newsletterWelcome } from '../lib/email'
import { notifyAdmins, notifyInBackground, dashLink } from '../lib/notifications'

export const newsletter = new Hono()

// Subscribe to newsletter (accepts form data from browser or JSON)
newsletter.post('/', rateLimiter(5, 60000, 'newsletter'), async (c) => {
  const db = getFirestore(c)

  const contentType = c.req.header('content-type') || ''
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }

  const { email } = body

  if (!email) {
    if (!contentType.includes('application/json')) {
      const referer = c.req.header('referer') || '/'
      return c.redirect(referer)
    }
    return c.json({ error: 'البريد الإلكتروني مطلوب' }, 400)
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    // Find if subscriber already exists
    const querySnapshot = await db.collection('newsletter_subscribers')
      .where('email', '==', normalizedEmail)
      .get()

    // Only genuinely new (or previously unsubscribed) addresses get a welcome.
    // Re-submitting the footer form must not re-send the same email over and
    // over — that is how a legitimate sender gets marked as spam.
    let isNewSubscriber = false

    if (!querySnapshot.empty) {
      // Update status to active if already exists
      const docId = querySnapshot.docs[0].id
      const wasUnsubscribed = querySnapshot.docs[0].data()?.status !== 'subscribed'
      await db.collection('newsletter_subscribers').doc(docId).update({
        status: 'subscribed'
      })
      isNewSubscriber = wasUnsubscribed
    } else {
      // Insert new subscriber
      await db.collection('newsletter_subscribers').add({
        email: normalizedEmail,
        status: 'subscribed',
        created_at: new Date().toISOString()
      })
      isNewSubscriber = true
    }

    if (isNewSubscriber) {
      const cfg = getEmailConfig(c)
      await sendInBackground(c, () => newsletterWelcome(cfg, normalizedEmail))

      // A5 — إشعار صامت للإدارة بمشترك جديد
      await notifyInBackground(c, async () => {
        await notifyAdmins(c, {
          type: 'newsletter_new',
          title: 'مشترك جديد في النشرة البريدية',
          body: normalizedEmail,
          link: dashLink('newsletter'),
          meta: { email: normalizedEmail }
        })
      })
    }

    if (!contentType.includes('application/json')) {
      const referer = c.req.header('referer') || '/'
      const separator = referer.includes('?') ? '&' : '?'
      return c.redirect(referer + separator + 'news_success=1')
    }
    return c.json({ message: 'تم الاشتراك بنجاح في النشرة البريدية.' })
  } catch (error: any) {
    console.error('Newsletter subscription error:', error.message)
    if (!contentType.includes('application/json')) {
      const referer = c.req.header('referer') || '/'
      const separator = referer.includes('?') ? '&' : '?'
      return c.redirect(referer + separator + 'news_error=1')
    }
    return c.json({ error: error.message }, 400)
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
