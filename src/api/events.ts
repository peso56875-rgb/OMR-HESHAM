import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const events = new Hono()

// Get all published events
events.get('/', async (c) => {
  try {
    const db = getFirestore(c)
    const snapshot = await db.collection('events')
      .where('is_published', '==', true)
      .orderBy('event_date', 'asc')
      .get()

    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Add event (Admin only)
events.post('/add', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const contentType = c.req.header('content-type') || ''
  
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }
  
  const title = body.title as string
  if (!title) {
    if (contentType.includes('application/json')) {
      return c.json({ error: 'العنوان مطلوب' }, 400)
    }
    return c.redirect('/dashboard?view=events&error=missing_fields')
  }

  try {
    await db.collection('events').add({
      title,
      type: body.type || 'عام',
      place: body.place || '',
      event_date: body.event_date ? new Date(body.event_date as string).toISOString() : new Date().toISOString(),
      description: body.description || '',
      image_url: body.image_url || '',
      is_published: true,
      created_at: new Date().toISOString()
    })

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم إضافة الفعالية بنجاح' })
    }
    return c.redirect('/dashboard?view=events&success=1')
  } catch (error: any) {
    console.error('Error creating event:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=events&error=db_error')
  }
})

// Edit event (Admin only)
events.post('/edit/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const contentType = c.req.header('content-type') || ''
  
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }
  
  const title = body.title as string
  if (!title) {
    if (contentType.includes('application/json')) {
      return c.json({ error: 'العنوان مطلوب' }, 400)
    }
    return c.redirect('/dashboard?view=events&error=missing_fields')
  }

  try {
    await db.collection('events').doc(id).update({
      title,
      type: body.type || 'عام',
      place: body.place || '',
      event_date: body.event_date ? new Date(body.event_date as string).toISOString() : new Date().toISOString(),
      description: body.description || '',
      image_url: body.image_url || ''
    })

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم تعديل الفعالية بنجاح' })
    }
    return c.redirect('/dashboard?view=events&success=1')
  } catch (error: any) {
    console.error('Error updating event:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=events&error=db_error')
  }
})

// Delete event (Admin only)
events.post('/delete/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const contentType = c.req.header('content-type') || ''

  try {
    await db.collection('events').doc(id).delete()

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم حذف الفعالية بنجاح' })
    }
    return c.redirect('/dashboard?view=events&success=1')
  } catch (error: any) {
    console.error('Error deleting event:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=events&error=db_error')
  }
})
