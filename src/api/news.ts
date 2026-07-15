import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const news = new Hono()

// Get all published news
news.get('/', async (c) => {
  try {
    const db = getFirestore(c)
    const snapshot = await db.collection('news')
      .where('is_published', '==', true)
      .orderBy('publish_date', 'desc')
      .get()

    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get single news
news.get('/:id', async (c) => {
  try {
    const db = getFirestore(c)
    const id = c.req.param('id') as string
    const doc = await db.collection('news').doc(id).get()

    if (!doc.exists || doc.data()?.is_published === false) {
      return c.json({ error: 'الخبر غير موجود' }, 404)
    }

    return c.json({ data: { id: doc.id, ...doc.data() } })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Add news (Admin only)
news.post('/add', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const contentType = c.req.header('content-type') || ''
  
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }
  
  const title = body.title as string
  const content = body.content as string
  const excerpt = body.excerpt as string

  if (!title || !content || !excerpt) {
    if (contentType.includes('application/json')) {
      return c.json({ error: 'الرجاء ملء جميع الحقول المطلوبة' }, 400)
    }
    return c.redirect('/dashboard?view=news&error=missing_fields')
  }

  try {
    await db.collection('news').add({
      title,
      category: body.category || 'عام',
      excerpt,
      content,
      image_url: body.image_url || '',
      is_published: true,
      publish_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    })

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم إضافة الخبر بنجاح' })
    }
    return c.redirect('/dashboard?view=news&success=1')
  } catch (error: any) {
    console.error('Error creating news:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=news&error=db_error')
  }
})

// Edit news (Admin only)
news.post('/edit/:id', adminMiddleware, async (c) => {
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
  const content = body.content as string
  const excerpt = body.excerpt as string

  if (!title || !content || !excerpt) {
    if (contentType.includes('application/json')) {
      return c.json({ error: 'الرجاء ملء جميع الحقول المطلوبة' }, 400)
    }
    return c.redirect('/dashboard?view=news&error=missing_fields')
  }

  try {
    await db.collection('news').doc(id).update({
      title,
      category: body.category || 'عام',
      excerpt,
      content,
      image_url: body.image_url || ''
    })

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم تعديل الخبر بنجاح' })
    }
    return c.redirect('/dashboard?view=news&success=1')
  } catch (error: any) {
    console.error('Error updating news:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=news&error=db_error')
  }
})

// Delete news (Admin only)
news.post('/delete/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const contentType = c.req.header('content-type') || ''

  try {
    await db.collection('news').doc(id).delete()

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم حذف الخبر بنجاح' })
    }
    return c.redirect('/dashboard?view=news&success=1')
  } catch (error: any) {
    console.error('Error deleting news:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=news&error=db_error')
  }
})
