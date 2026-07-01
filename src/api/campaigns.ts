import { Hono } from 'hono'
import { getSupabaseFromContext } from '../lib/supabase'

export const campaigns = new Hono()

// Get all campaigns
campaigns.get('/', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
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
    .single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Create campaign (Admin only - requires proper RLS or checking token in Supabase client)
campaigns.post('/add', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  // Note: in a real app, you'd check auth cookies here to authenticate the admin.
  // For the sake of this dashboard UI working out of the box, we will bypass server-side RLS 
  // if you set the SERVICE_ROLE_KEY or just rely on RLS logic matching the active user.

  const body = await c.req.parseBody()
  
  const { error } = await supabase
    .from('campaigns')
    .insert([{
      title: body.title,
      category: body.category,
      goal: Number(body.goal),
      image_url: body.image_url || null,
      is_urgent: body.is_urgent === 'true',
      description: body.description || null
    }])

  if (error) {
    console.error('Error creating campaign:', error.message)
    return c.redirect('/dashboard/campaigns?error=1')
  }
  
  return c.redirect('/dashboard/campaigns?success=1')
})
