import { Hono } from 'hono'
import { getSupabaseFromContext, getSupabaseAdminFromContext } from '../lib/supabase'
import { adminMiddleware } from './middleware'

export const jobs = new Hono()

// Get all jobs
jobs.get('/', async (c) => {
  const supabase = getSupabaseFromContext(c)

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Add job (Admin only)
jobs.post('/add', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const body = await c.req.parseBody()

  const { error } = await supabase
    .from('jobs')
    .insert([{
      title: body.title,
      department: body.department || null,
      job_type: body.job_type || null,
      location: body.location || null,
      description: body.description || null,
      is_active: body.is_active === 'true'
    }])

  if (error) {
    console.error('Error creating job:', error.message)
    return c.redirect('/dashboard/jobs?error=1')
  }

  return c.redirect('/dashboard/jobs?success=1')
})

// Edit job (Admin only)
jobs.post('/edit/:id', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  
  const { error } = await supabase
    .from('jobs')
    .update({
      title: body.title,
      department: body.department || null,
      job_type: body.job_type || null,
      location: body.location || null,
      description: body.description || null,
      is_active: body.is_active === 'true'
    })
    .eq('id', id)

  if (error) return c.redirect('/dashboard/jobs?error=1')
  return c.redirect('/dashboard/jobs?success=1')
})

// Delete job (Admin only)
jobs.post('/delete/:id', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const id = c.req.param('id')
  
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)

  if (error) return c.redirect('/dashboard/jobs?error=1')
  return c.redirect('/dashboard/jobs?success=1')
})

// Apply for a job (accepts form data from browser)
jobs.post('/apply', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)

  // Accept both JSON and form data
  const contentType = c.req.header('content-type') || ''
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }

  const { job_id, full_name, email, phone, bio, cv_url } = body

  if (!full_name || !email || !phone) {
    if (!contentType.includes('application/json')) {
      return c.redirect('/careers?error=missing_fields')
    }
    return c.json({ error: 'الرجاء ملء جميع الحقول الإلزامية' }, 400)
  }

  const { error } = await supabase
    .from('job_applications')
    .insert([{
      job_id: job_id || null,
      full_name,
      email,
      phone,
      bio,
      cv_url,
      status: 'pending'
    }])

  // If form submission, redirect back
  if (!contentType.includes('application/json')) {
    if (error) return c.redirect('/careers?error=' + encodeURIComponent(error.message))
    return c.redirect('/careers?success=1#applyForm')
  }

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ message: 'تم تقديم طلبك بنجاح.' })
})
