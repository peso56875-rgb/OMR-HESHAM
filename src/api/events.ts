import { Hono } from 'hono'
import { getSupabaseFromContext } from '../lib/supabase'

export const events = new Hono()

// Get all events
events.get('/', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Add event
events.post('/add', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const body = await c.req.parseBody()
  
  const { error } = await supabase
    .from('events')
    .insert([{
      title: body.title,
      type: body.type || null,
      place: body.place || null,
      event_date: body.event_date ? new Date(body.event_date as string).toISOString() : null,
      description: body.description,
      image_url: body.image_url || null
    }])

  if (error) {
    console.error('Error creating event:', error.message)
    return c.redirect('/dashboard/events?error=1')
  }

  return c.redirect('/dashboard/events?success=1')
})
