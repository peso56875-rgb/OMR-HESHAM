import { Hono } from 'hono'
import { getSupabaseFromContext, getSupabaseAdminFromContext } from '../lib/supabase'
import { adminMiddleware } from './middleware'

export const events = new Hono()

// Get all events
events.get('/', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('event_date', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Add event (Admin only)
events.post('/add', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const body = await c.req.parseBody()
  
  const title = body.title as string
  if (!title) {
    return c.redirect('/dashboard/events?error=missing_fields')
  }

  const { error } = await supabase
    .from('events')
    .insert([{
      title,
      type: (body.type as string) || null,
      place: (body.place as string) || null,
      event_date: body.event_date ? new Date(body.event_date as string).toISOString() : null,
      description: body.description as string,
      image_url: (body.image_url as string) || null
    }])

  if (error) {
    console.error('Error creating event:', error.message)
    return c.redirect('/dashboard/events?error=db_error')
  }

  return c.redirect('/dashboard/events?success=1')
})

// Edit event (Admin only)
events.post('/edit/:id', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  
  const title = body.title as string
  if (!title) {
    return c.redirect('/dashboard/events?error=missing_fields')
  }

  const { error } = await supabase
    .from('events')
    .update({
      title,
      type: (body.type as string) || null,
      place: (body.place as string) || null,
      event_date: body.event_date ? new Date(body.event_date as string).toISOString() : null,
      description: body.description as string,
      image_url: (body.image_url as string) || null
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating event:', error.message)
    return c.redirect('/dashboard/events?error=db_error')
  }

  return c.redirect('/dashboard/events?success=1')
})

// Delete event (Admin only)
events.post('/delete/:id', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const id = c.req.param('id')
  
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting event:', error.message)
    return c.redirect('/dashboard/events?error=db_error')
  }

  return c.redirect('/dashboard/events?success=1')
})
