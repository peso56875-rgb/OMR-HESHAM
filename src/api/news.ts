import { Hono } from 'hono'
import { getSupabaseFromContext, getSupabaseAdminFromContext } from '../lib/supabase'
import { adminMiddleware } from './middleware'

export const news = new Hono()

// Get all news
news.get('/', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('publish_date', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Get single news
news.get('/:id', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const id = c.req.param('id')
  
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Add news (Admin only)
news.post('/add', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const body = await c.req.parseBody()
  
  const title = body.title as string
  const content = body.content as string
  const excerpt = body.excerpt as string

  if (!title || !content || !excerpt) {
    return c.redirect('/dashboard/news?error=missing_fields')
  }

  const { error } = await supabase
    .from('news')
    .insert([{
      title,
      category: (body.category as string) || null,
      excerpt,
      content,
      image_url: (body.image_url as string) || null
    }])

  if (error) {
    console.error('Error creating news:', error.message)
    return c.redirect('/dashboard/news?error=db_error')
  }
  
  return c.redirect('/dashboard/news?success=1')
})

// Edit news (Admin only)
news.post('/edit/:id', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  
  const title = body.title as string
  const content = body.content as string
  const excerpt = body.excerpt as string

  if (!title || !content || !excerpt) {
    return c.redirect('/dashboard/news?error=missing_fields')
  }

  const { error } = await supabase
    .from('news')
    .update({
      title,
      category: (body.category as string) || null,
      excerpt,
      content,
      image_url: (body.image_url as string) || null
    })
    .eq('id', id)

  if (error) return c.redirect('/dashboard/news?error=db_error')
  return c.redirect('/dashboard/news?success=1')
})

// Delete news (Admin only)
news.post('/delete/:id', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const id = c.req.param('id')
  
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id)

  if (error) return c.redirect('/dashboard/news?error=db_error')
  return c.redirect('/dashboard/news?success=1')
})
