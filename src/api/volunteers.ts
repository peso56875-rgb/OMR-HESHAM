import { Hono } from 'hono'
import { getSupabaseFromContext } from '../lib/supabase'
import { getCookie } from 'hono/cookie'

export const volunteers = new Hono()

// Submit a volunteer application (accepts form data from browser)
volunteers.post('/', async (c) => {
  const supabase = getSupabaseFromContext(c)

  // Get user from cookie if logged in
  let profile_id = null
  const token = getCookie(c, 'sb-access-token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      profile_id = payload.sub
    } catch(e) {}
  }

  // Accept both JSON and form data
  const contentType = c.req.header('content-type') || ''
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }

  const { full_name, age, phone, city, preferred_role, skills } = body

  if (!full_name || !phone) {
    // If form submission, redirect back with error
    if (!contentType.includes('application/json')) {
      return c.redirect('/volunteers?error=missing_fields')
    }
    return c.json({ error: 'Missing required fields' }, 400)
  }

  // Set the session on the supabase client so that RLS knows who is making the request if authenticated
  if (token) {
    try {
      await supabase.auth.setSession({ access_token: token, refresh_token: '' })
    } catch(e) {}
  }

  const { error } = await supabase
    .from('volunteers')
    .insert([{
      profile_id,
      full_name,
      age: age ? parseInt(age as string) : null,
      phone,
      city,
      preferred_role,
      skills,
      status: 'pending'
    }])

  // If form submission, redirect back
  if (!contentType.includes('application/json')) {
    if (error) return c.redirect('/volunteers?error=' + encodeURIComponent(error.message))
    return c.redirect('/volunteers?success=1#volForm')
  }

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ message: 'Application submitted successfully.' })
})

// Get my volunteer applications (Requires Auth)
volunteers.get('/my', async (c) => {
  const supabase = getSupabaseFromContext(c)

  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)

  const token = authHeader.replace('Bearer ', '')
  await supabase.auth.setSession({ access_token: token, refresh_token: '' })

  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})
