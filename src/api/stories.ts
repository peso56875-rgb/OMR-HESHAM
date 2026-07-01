import { Hono } from 'hono'
import { getSupabaseFromContext } from '../lib/supabase'

export const stories = new Hono()

// Get all stories
stories.get('/', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Add story
stories.post('/add', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const body = await c.req.parseBody()
  
  const { error } = await supabase
    .from('stories')
    .insert([{
      name: body.name,
      role: body.role || null,
      rating: body.rating ? Number(body.rating) : 5,
      content: body.content,
      image_url: body.image_url || null
    }])

  if (error) {
    console.error('Insert error:', error.message)
    return c.redirect('/dashboard/stories?error=1')
  }

  return c.redirect('/dashboard/stories?success=1')
})
