import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const contacts = new Hono()

// Submit a contact message (accepts form data from browser or JSON)
contacts.post('/', async (c) => {
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

    await db.collection('contacts').add(contactData)

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
  const status = body.status as string

  try {
    await db.collection('contacts').doc(id).update({ status })
    return c.redirect('/dashboard/contacts?success=1')
  } catch (error: any) {
    console.error('Error updating contact status:', error.message)
    return c.redirect('/dashboard/contacts?error=1')
  }
})
