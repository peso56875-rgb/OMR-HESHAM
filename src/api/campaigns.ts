import { Hono } from 'hono'
import { getSupabaseFromContext, getSupabaseAdminFromContext } from '../lib/supabase'
import { adminMiddleware } from './middleware'

export const campaigns = new Hono()

// Get all campaigns
campaigns.get('/', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Get single campaign
campaigns.get('/:id', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const id = c.req.param('id')
  
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Create campaign (Admin only)
campaigns.post('/add', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const body = await c.req.parseBody()
  
  const title = body.title as string
  const category = body.category as string
  const goal = Number(body.goal)
  
  if (!title || !goal || isNaN(goal) || goal <= 0) {
    return c.redirect('/dashboard/campaigns?error=invalid_inputs')
  }

  const { error } = await supabase
    .from('campaigns')
    .insert([{
      title,
      category,
      goal,
      image_url: body.image_url || null,
      is_urgent: body.is_urgent === 'true',
      description: body.description || null
    }])

  if (error) {
    console.error('Error creating campaign:', error.message)
    return c.redirect('/dashboard/campaigns?error=db_error')
  }
  
  return c.redirect('/dashboard/campaigns?success=1')
})

// Edit campaign (Admin only)
campaigns.post('/edit/:id', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  
  const title = body.title as string
  const category = body.category as string
  const goal = Number(body.goal)
  
  if (!title || !goal || isNaN(goal) || goal <= 0) {
    return c.redirect('/dashboard/campaigns?error=invalid_inputs')
  }

  const { error } = await supabase
    .from('campaigns')
    .update({
      title,
      category,
      goal,
      image_url: body.image_url || null,
      is_urgent: body.is_urgent === 'true',
      description: body.description || null
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating campaign:', error.message)
    return c.redirect('/dashboard/campaigns?error=db_error')
  }
  return c.redirect('/dashboard/campaigns?success=1')
})

// Delete campaign (Admin only)
campaigns.post('/delete/:id', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const id = c.req.param('id')
  
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting campaign:', error.message)
    return c.redirect('/dashboard/campaigns?error=db_error')
  }
  return c.redirect('/dashboard/campaigns?success=1')
})
