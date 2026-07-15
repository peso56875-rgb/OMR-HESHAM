import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const stories = new Hono()

// Get all published stories
stories.get('/', async (c) => {
  try {
    const db = getFirestore(c)
    const snapshot = await db.collection('stories')
      .where('is_published', '==', true)
      .orderBy('created_at', 'desc')
      .get()

    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Add story (Admin only)
stories.post('/add', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const contentType = c.req.header('content-type') || ''
  
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }
  
  const name = body.name as string
  const content = body.content as string

  if (!name || !content) {
    if (contentType.includes('application/json')) {
      return c.json({ error: 'الاسم والمحتوى مطلوبان' }, 400)
    }
    return c.redirect('/dashboard/stories?error=missing_fields')
  }

  try {
    await db.collection('stories').add({
      name,
      role: body.role || 'مستفيد',
      rating: body.rating ? Number(body.rating) : 5,
      content,
      image_url: body.image_url || '',
      is_published: true,
      created_at: new Date().toISOString()
    })

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم إضافة قصة النجاح بنجاح' })
    }
    return c.redirect('/dashboard/stories?success=1')
  } catch (error: any) {
    console.error('Error creating success story:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard/stories?error=db_error')
  }
})

// Edit story (Admin only)
stories.post('/edit/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const contentType = c.req.header('content-type') || ''
  
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }
  
  const name = body.name as string
  const content = body.content as string

  if (!name || !content) {
    if (contentType.includes('application/json')) {
      return c.json({ error: 'الاسم والمحتوى مطلوبان' }, 400)
    }
    return c.redirect('/dashboard/stories?error=missing_fields')
  }

  try {
    await db.collection('stories').doc(id).update({
      name,
      role: body.role || 'مستفيد',
      rating: body.rating ? Number(body.rating) : 5,
      content,
      image_url: body.image_url || ''
    })

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم تعديل قصة النجاح بنجاح' })
    }
    return c.redirect('/dashboard/stories?success=1')
  } catch (error: any) {
    console.error('Error updating success story:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard/stories?error=db_error')
  }
})

// Delete story (Admin only)
stories.post('/delete/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const contentType = c.req.header('content-type') || ''

  try {
    await db.collection('stories').doc(id).delete()

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم حذف قصة النجاح بنجاح' })
    }
    return c.redirect('/dashboard/stories?success=1')
  } catch (error: any) {
    console.error('Error deleting success story:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard/stories?error=db_error')
  }
})
