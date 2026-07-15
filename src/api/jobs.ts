import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const jobs = new Hono()

// Get all active published jobs
jobs.get('/', async (c) => {
  try {
    const db = getFirestore(c)
    const snapshot = await db.collection('jobs')
      .where('is_published', '==', true)
      .where('is_active', '==', true)
      .orderBy('created_at', 'desc')
      .get()

    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Add job (Admin only)
jobs.post('/add', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const body = await c.req.parseBody()

  const title = body.title as string
  if (!title) {
    return c.redirect('/dashboard/jobs?error=missing_title')
  }

  try {
    await db.collection('jobs').add({
      title,
      department: body.department || 'عام',
      job_type: body.job_type || 'دوام كامل',
      location: body.location || 'كفر العنانية',
      description: body.description || '',
      is_active: body.is_active === 'true' || body.is_active === 'on',
      is_published: true,
      created_at: new Date().toISOString()
    })

    return c.redirect('/dashboard/jobs?success=1')
  } catch (error: any) {
    console.error('Error creating job:', error.message)
    return c.redirect('/dashboard/jobs?error=1')
  }
})

// Edit job (Admin only)
jobs.post('/edit/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()

  const title = body.title as string
  if (!title) {
    return c.redirect('/dashboard/jobs?error=missing_title')
  }

  try {
    await db.collection('jobs').doc(id).update({
      title,
      department: body.department || 'عام',
      job_type: body.job_type || 'دوام كامل',
      location: body.location || 'كفر العنانية',
      description: body.description || '',
      is_active: body.is_active === 'true' || body.is_active === 'on'
    })

    return c.redirect('/dashboard/jobs?success=1')
  } catch (error: any) {
    console.error('Error updating job:', error.message)
    return c.redirect('/dashboard/jobs?error=1')
  }
})

// Delete job (Admin only)
jobs.post('/delete/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string

  try {
    await db.collection('jobs').doc(id).delete()
    return c.redirect('/dashboard/jobs?success=1')
  } catch (error: any) {
    console.error('Error deleting job:', error.message)
    return c.redirect('/dashboard/jobs?error=1')
  }
})

// Apply for a job (accepts form data from browser or JSON)
jobs.post('/apply', async (c) => {
  const db = getFirestore(c)

  const contentType = c.req.header('content-type') || ''
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }

  const { job_id, full_name, email, phone, bio, cv_url } = body

  if (!full_name || !email || !phone) {
    if (!contentType.includes('application/json')) {
      return c.redirect('/careers?error=missing_fields')
    }
    return c.json({ error: 'الرجاء ملء جميع الحقول الإلزامية' }, 400)
  }

  try {
    let job_title = ''
    if (job_id) {
      const jobDoc = await db.collection('jobs').doc(job_id).get()
      if (jobDoc.exists) {
        job_title = jobDoc.data()?.title || ''
      }
    }

    await db.collection('job_applications').add({
      job_id: job_id || null,
      job_title: job_title || 'عام',
      full_name,
      email,
      phone,
      bio: bio || '',
      cv_url: cv_url || '',
      status: 'pending',
      created_at: new Date().toISOString()
    })

    if (!contentType.includes('application/json')) {
      return c.redirect('/careers?success=1#applyForm')
    }
    return c.json({ message: 'تم تقديم طلبك بنجاح.' })
  } catch (error: any) {
    console.error('Error submitting job application:', error.message)
    if (!contentType.includes('application/json')) {
      return c.redirect('/careers?error=' + encodeURIComponent(error.message))
    }
    return c.json({ error: error.message }, 500)
  }
})
