import { Hono } from 'hono'
import { getSupabaseFromContext } from '../lib/supabase'

export const jobs = new Hono()

// Get all jobs
jobs.get('/', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Add job
jobs.post('/add', async (c) => {
  const supabase = getSupabaseFromContext(c)
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
