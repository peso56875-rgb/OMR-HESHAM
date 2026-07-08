import { Hono } from 'hono'
import { getSupabaseFromContext, getSupabaseAdminFromContext } from '../lib/supabase'
import { adminMiddleware } from './middleware'

export const stories = new Hono()

// Get all stories
stories.get('/', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Add story (Admin only)
stories.post('/add', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const body = await c.req.parseBody()
  
  const name = body.name as string
  const content = body.content as string

  if (!name || !content) {
    return c.redirect('/dashboard/stories?error=missing_fields')
  }

  const { error } = await supabase
    .from('stories')
    .insert([{
      name,
      role: (body.role as string) || null,
      rating: body.rating ? Number(body.rating) : 5,
      content,
      image_url: (body.image_url as string) || null
    }])

  if (error) {
    console.error('Insert error:', error.message)
    return c.redirect('/dashboard/stories?error=db_error')
  }

  return c.redirect('/dashboard/stories?success=1')
})

// Edit story (Admin only)
stories.post('/edit/:id', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  
  const name = body.name as string
  const content = body.content as string

  if (!name || !content) {
    return c.redirect('/dashboard/stories?error=missing_fields')
  }

  const { error } = await supabase
    .from('stories')
    .update({
      name,
      role: (body.role as string) || null,
      rating: body.rating ? Number(body.rating) : 5,
      content,
      image_url: (body.image_url as string) || null
    })
    .eq('id', id)

  if (error) {
    console.error('Update error:', error.message)
    return c.redirect('/dashboard/stories?error=db_error')
  }

  return c.redirect('/dashboard/stories?success=1')
})

// Delete story (Admin only)
stories.post('/delete/:id', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const id = c.req.param('id')
  
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete error:', error.message)
    return c.redirect('/dashboard/stories?error=db_error')
  }

  return c.redirect('/dashboard/stories?success=1')
})
