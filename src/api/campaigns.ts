import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const campaigns = new Hono()

// Get all published campaigns
campaigns.get('/', async (c) => {
  try {
    const db = getFirestore(c)
    const snapshot = await db.collection('campaigns')
      .where('is_published', '==', true)
      .orderBy('created_at', 'desc')
      .get()
      
    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get single campaign
campaigns.get('/:id', async (c) => {
  try {
    const db = getFirestore(c)
    const id = c.req.param('id') as string
    const doc = await db.collection('campaigns').doc(id).get()
    
    if (!doc.exists) {
      return c.json({ error: 'الحملة غير موجودة' }, 404)
    }
    
    return c.json({ data: { id: doc.id, ...doc.data() } })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Create campaign (Admin only)
campaigns.post('/add', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const contentType = c.req.header('content-type') || ''
  
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }
  
  const title = body.title as string
  const category = body.category as string
  const goal = Number(body.goal)
  const is_urgent = body.is_urgent === 'true' || body.is_urgent === true
  
  if (!title || !goal || isNaN(goal) || goal <= 0) {
    if (contentType.includes('application/json')) {
      return c.json({ error: 'بيانات غير صالحة' }, 400)
    }
    return c.redirect('/dashboard?view=campaigns&error=invalid_inputs')
  }

  try {
    await db.collection('campaigns').add({
      title,
      category: category || 'عام',
      goal,
      raised: 0,
      image_url: body.image_url || '',
      is_urgent,
      is_published: true,
      description: body.description || '',
      created_at: new Date().toISOString()
    })

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم إضافة الحملة بنجاح' })
    }
    return c.redirect('/dashboard?view=campaigns&success=1')
  } catch (error: any) {
    console.error('Error creating campaign:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=campaigns&error=db_error')
  }
})

// Edit campaign (Admin only)
campaigns.post('/edit/:id', adminMiddleware, async (c) => {
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
  const category = body.category as string
  const goal = Number(body.goal)
  const is_urgent = body.is_urgent === 'true' || body.is_urgent === true
  
  if (!title || !goal || isNaN(goal) || goal <= 0) {
    if (contentType.includes('application/json')) {
      return c.json({ error: 'بيانات غير صالحة' }, 400)
    }
    return c.redirect('/dashboard?view=campaigns&error=invalid_inputs')
  }

  try {
    const updateData: any = {
      title,
      category: category || 'عام',
      goal,
      image_url: body.image_url || '',
      is_urgent,
      description: body.description || ''
    }
    
    if (body.raised !== undefined) {
      updateData.raised = Number(body.raised)
    }

    await db.collection('campaigns').doc(id).update(updateData)

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم تعديل الحملة بنجاح' })
    }
    return c.redirect('/dashboard?view=campaigns&success=1')
  } catch (error: any) {
    console.error('Error updating campaign:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=campaigns&error=db_error')
  }
})

// Delete campaign (Admin only)
campaigns.post('/delete/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const contentType = c.req.header('content-type') || ''

  try {
    await db.collection('campaigns').doc(id).delete()

    if (contentType.includes('application/json')) {
      return c.json({ success: true, message: 'تم حذف الحملة بنجاح' })
    }
    return c.redirect('/dashboard?view=campaigns&success=1')
  } catch (error: any) {
    console.error('Error deleting campaign:', error.message)
    if (contentType.includes('application/json')) {
      return c.json({ error: error.message }, 500)
    }
    return c.redirect('/dashboard?view=campaigns&error=db_error')
  }
})
