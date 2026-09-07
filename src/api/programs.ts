import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'
import { notifyAdmins, notifyInBackground, dashLink } from '../lib/notifications'
import { defaultPrograms } from '../defaults'

export const programs = new Hono()

// Get all published programs
programs.get('/', async (c) => {
  try {
    const db = getFirestore(c)
    let snapshot
    try {
      snapshot = await db.collection('programs')
        .where('is_published', '==', true)
        .orderBy('order', 'asc')
        .get()
    } catch {
      // Fallback if index on order is not yet built
      snapshot = await db.collection('programs')
        .where('is_published', '==', true)
        .get()
    }

    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    // Sort in-memory if needed
    data.sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0))
    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get single program
programs.get('/:id', async (c) => {
  try {
    const db = getFirestore(c)
    const id = c.req.param('id') as string
    const doc = await db.collection('programs').doc(id).get()

    if (!doc.exists) {
      return c.json({ error: 'البرنامج غير موجود' }, 404)
    }

    return c.json({ data: { id: doc.id, ...doc.data() } })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create program (Admin only)
programs.post('/add', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const contentType = c.req.header('content-type') || ''

  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }

  const title = (body.title as string || '').trim()
  const description = (body.description as string || '').trim()
  const icon = (body.icon as string || 'fa-hand-holding-heart').trim()
  const tone = (body.tone as string || 'gold').trim()
  const link = (body.link as string || '/campaigns').trim()
  const order = Number(body.order) || 0

  if (!title) {
    if (contentType.includes('application/json')) {
      return c.json({ error: 'يرجى إدخال عنوان البرنامج' }, 400)
    }
    return c.redirect('/dashboard?view=programs&error=invalid_inputs')
  }

  try {
    const ref = await db.collection('programs').add({
      title,
      description,
      icon,
      tone,
      link,
      order,
      is_published: true,
      created_at: new Date().toISOString()
    })

    await notifyInBackground(c, async () => {
      await notifyAdmins(c, {
        type: 'content_published',
        title: `باب/برنامج جديد أُضيف: ${title}`,
        body: description || 'تمت إضافة مسار عطاء جديد.',
        link: dashLink('programs'),
        meta: { program_id: ref.id }
      })
    })

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم إضافة البرنامج بنجاح', id: ref.id })
    }
    return c.redirect('/dashboard?view=programs&success=1')
  } catch (error: any) {
    console.error('Error creating program:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=programs&error=db_error')
  }
})

// Edit program (Admin only)
programs.post('/edit/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const contentType = c.req.header('content-type') || ''

  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }

  const title = (body.title as string || '').trim()
  const description = (body.description as string || '').trim()
  const icon = (body.icon as string || 'fa-hand-holding-heart').trim()
  const tone = (body.tone as string || 'gold').trim()
  const link = (body.link as string || '/campaigns').trim()
  const order = Number(body.order) || 0

  if (!title) {
    if (contentType.includes('application/json')) {
      return c.json({ error: 'بيانات غير صالحة' }, 400)
    }
    return c.redirect('/dashboard?view=programs&error=invalid_inputs')
  }

  try {
    const updateData: any = {
      title,
      description,
      icon,
      tone,
      link,
      order,
      updated_at: new Date().toISOString()
    }

    await db.collection('programs').doc(id).update(updateData)

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم تعديل البرنامج بنجاح' })
    }
    return c.redirect('/dashboard?view=programs&success=1')
  } catch (error: any) {
    console.error('Error updating program:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=programs&error=db_error')
  }
})

// Delete program (Admin only)
programs.post('/delete/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const contentType = c.req.header('content-type') || ''

  try {
    await db.collection('programs').doc(id).delete()

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم حذف البرنامج بنجاح' })
    }
    return c.redirect('/dashboard?view=programs&success=1')
  } catch (error: any) {
    console.error('Error deleting program:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=programs&error=db_error')
  }
})

// Seed default 6 programs (Admin only convenience helper)
programs.post('/seed-defaults', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const contentType = c.req.header('content-type') || ''

  try {
    const batch = db.batch()
    defaultPrograms.forEach((p, idx) => {
      const docRef = db.collection('programs').doc()
      batch.set(docRef, {
        title: p[1],
        description: p[2],
        icon: p[0],
        tone: p[3] || 'gold',
        link: '/campaigns',
        order: idx + 1,
        is_published: true,
        created_at: new Date().toISOString()
      })
    })
    await batch.commit()

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم استيراد الأبواب الستة بنجاح' })
    }
    return c.redirect('/dashboard?view=programs&success=seeded')
  } catch (error: any) {
    console.error('Error seeding programs:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=programs&error=seed_failed')
  }
})
