import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'
import { normalizeMediaUrl } from '../lib/storage'

export const gallery = new Hono()

// Get all published gallery items
gallery.get('/', async (c) => {
  try {
    const db = getFirestore(c)
    const snapshot = await db.collection('gallery')
      .where('is_published', '==', true)
      .orderBy('created_at', 'desc')
      .get()

    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Add gallery photo (Admin only)
gallery.post('/add', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const contentType = c.req.header('content-type') || ''
  
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }
  
  const title = body.title as string
  const rawImageUrl = body.image_url as string

  if (!title || !rawImageUrl) {
    if (contentType.includes('application/json')) {
      return c.json({ error: 'عنوان الصورة ورابط/ملف الصورة مطلوبان' }, 400)
    }
    return c.redirect('/dashboard?view=gallery&error=missing_fields')
  }

  try {
    await db.collection('gallery').add({
      title,
      image_url: normalizeMediaUrl(rawImageUrl),
      location: body.location || 'المؤسسة',
      tag: body.tag || 'عام',
      is_published: true,
      created_at: new Date().toISOString()
    })

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم إضافة الصورة إلى معرض الصور بنجاح' })
    }
    return c.redirect('/dashboard?view=gallery&success=1')
  } catch (error: any) {
    console.error('Error creating gallery item:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=gallery&error=db_error')
  }
})

// Edit gallery photo (Admin only)
gallery.post('/edit/:id', adminMiddleware, async (c) => {
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
    return c.redirect('/dashboard?view=gallery&error=missing_fields')
  }

  try {
    const updateData: any = {
      title,
      location: body.location || 'المؤسسة',
      tag: body.tag || 'عام'
    }

    if (body.image_url) {
      updateData.image_url = normalizeMediaUrl(body.image_url)
    }

    await db.collection('gallery').doc(id).update(updateData)

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم تعديل بيانات الصورة بنجاح' })
    }
    return c.redirect('/dashboard?view=gallery&success=1')
  } catch (error: any) {
    console.error('Error updating gallery item:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=gallery&error=db_error')
  }
})

// Delete gallery photo (Admin only)
gallery.post('/delete/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const contentType = c.req.header('content-type') || ''

  try {
    await db.collection('gallery').doc(id).delete()

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم حذف الصورة بنجاح' })
    }
    return c.redirect('/dashboard?view=gallery&success=1')
  } catch (error: any) {
    console.error('Error deleting gallery item:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=gallery&error=db_error')
  }
})
