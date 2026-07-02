import { Hono } from 'hono'
import { getSupabaseFromContext } from '../lib/supabase'

export const contacts = new Hono()

// Submit a contact message (accepts form data from browser)
contacts.post('/', async (c) => {
  const supabase = getSupabaseFromContext(c)

  // Accept both JSON and form data
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
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const { error } = await supabase
    .from('contacts')
    .insert([{
      name,
      email,
      phone,
      subject,
      message,
      status: 'unread'
    }])

  // If form submission, redirect back
  if (!contentType.includes('application/json')) {
    if (error) return c.redirect('/contact?error=' + encodeURIComponent(error.message))
    return c.redirect('/contact?success=1')
  }

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ message: 'Message sent successfully.' })
})
