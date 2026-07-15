import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const newsletter = new Hono()

// Subscribe to newsletter (accepts form data from browser or JSON)
newsletter.post('/', async (c) => {
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

  try {
    // Find if subscriber already exists
    const querySnapshot = await db.collection('newsletter_subscribers')
      .where('email', '==', email.trim().toLowerCase())
      .get()

    if (!querySnapshot.empty) {
      // Update status to active if already exists
      const docId = querySnapshot.docs[0].id
      await db.collection('newsletter_subscribers').doc(docId).update({
        status: 'subscribed'
      })
    } else {
      // Insert new subscriber
      await db.collection('newsletter_subscribers').add({
        email: email.trim().toLowerCase(),
        status: 'subscribed',
        created_at: new Date().toISOString()
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
    return c.redirect('/dashboard/newsletter?success=1')
  } catch (error: any) {
    console.error('Error updating newsletter subscriber status:', error.message)
    return c.redirect('/dashboard/newsletter?error=1')
  }
})

// Delete subscriber (Admin only)
newsletter.post('/delete/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string

  try {
    await db.collection('newsletter_subscribers').doc(id).delete()
    return c.redirect('/dashboard/newsletter?success=1')
  } catch (error: any) {
    console.error('Error deleting newsletter subscriber:', error.message)
    return c.redirect('/dashboard/newsletter?error=1')
  }
})
