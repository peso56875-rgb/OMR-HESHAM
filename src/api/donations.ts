import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware, authMiddleware } from './middleware'

export const donations = new Hono()

// Create a new donation
donations.post('/', async (c) => {
  const db = getFirestore(c)
  
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'بيانات غير صالحة' }, 400)
  }

  const { amount, donation_type, campaign_id, donor_name, donor_phone, donor_email, payment_method } = body

  if (!amount || !donor_name || !donor_phone || !payment_method) {
    return c.json({ error: 'الحقول المطلوبة غير مكتملة' }, 400)
  }

  // Get user profile if authenticated
  const user = (c as any).get('user')
  const profile_id = user ? user.id : null

  try {
    let campaign_title = ''
    let campaign_category = ''

    if (campaign_id) {
      const campDoc = await db.collection('campaigns').doc(campaign_id).get()
      if (campDoc.exists) {
        campaign_title = campDoc.data()?.title || ''
        campaign_category = campDoc.data()?.category || ''
      }
    }

    const donationData = {
      profile_id,
      campaign_id: campaign_id || null,
      campaign_title: campaign_title || null,
      campaign_category: campaign_category || null,
      amount: Number(amount),
      donation_type: donation_type || 'once',
      donor_name,
      donor_phone,
      donor_email: donor_email || null,
      payment_method,
      payment_status: 'pending',
      status: 'pending',
      created_at: new Date().toISOString()
    }

    const docRef = await db.collection('donations').add(donationData)
    
    return c.json({ 
      data: { id: docRef.id, ...donationData }, 
      message: 'تم تسجيل تبرعك بنجاح. شكرًا لعطائك!' 
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Get my donations (Requires Auth)
donations.get('/my', authMiddleware, async (c) => {
  const user = (c as any).get('user')
  const db = getFirestore(c)

  try {
    const snapshot = await db.collection('donations')
      .where('profile_id', '==', user.id)
      .orderBy('created_at', 'desc')
      .get()

    const data = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      // Add fake/mock campaigns property for dashboard compat
      campaigns: doc.data().campaign_id ? {
        title: doc.data().campaign_title,
        category: doc.data().campaign_category
      } : null
    }))

    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Accept donation from the public HTML form (supports both JSON and form-encoded)
donations.post('/add', async (c) => {
  const db = getFirestore(c)
  
  let body: any
  const contentType = c.req.header('content-type') || ''
  
  try {
    if (contentType.includes('application/json')) {
      body = await c.req.json()
    } else {
      body = await c.req.parseBody()
    }
  } catch {
    return c.json({ error: 'بيانات غير صالحة' }, 400)
  }

  const amount = Number(body.amount) || 0
  const donor_name = (body.name || body.donor_name || '').toString().trim()
  const donor_phone = (body.phone || body.donor_phone || '').toString().trim()
  const donor_email = (body.email || body.donor_email || '').toString().trim() || null
  const payment_method = (body.method || body.payment_method || 'instapay').toString()

  if (!amount || !donor_name || !donor_phone) {
    return c.json({ error: 'الحقول المطلوبة غير مكتملة (الاسم، الهاتف، المبلغ)' }, 400)
  }

  try {
    const donationData = {
      profile_id: null,
      campaign_id: null,
      campaign_title: 'الصندوق العام',
      campaign_category: 'عام',
      amount,
      donation_type: 'once',
      donor_name,
      donor_phone,
      donor_email,
      payment_method,
      payment_status: 'pending',
      status: 'pending',
      created_at: new Date().toISOString()
    }

    await db.collection('donations').add(donationData)
    return c.json({ message: 'تم تسجيل تبرعك بنجاح. شكرًا لعطائك! 🤲' })
  } catch (error: any) {
    console.error('Public donation insertion error:', error.message)
    return c.json({ error: 'حدث خطأ في حفظ التبرع، حاول مرة أخرى' }, 500)
  }
})

// Update status (Admin only)
donations.post('/status/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()
  const newStatus = body.status as string

  try {
    const donationRef = db.collection('donations').doc(id)
    const donationDoc = await donationRef.get()

    if (!donationDoc.exists) {
      return c.redirect('/dashboard/donations?error=not_found')
    }

    const donationData = donationDoc.data()!
    const oldStatus = donationData.status
    const amount = Number(donationData.amount || 0)
    const campaignId = donationData.campaign_id

    // Use transaction to update status and increment campaign raised amount if completed
    await db.runTransaction(async (transaction) => {
      // 1. Update donation status
      transaction.update(donationRef, { 
        status: newStatus,
        payment_status: newStatus === 'completed' ? 'paid' : 'pending' 
      })

      // 2. If status is changing to completed, increment campaign raised progress
      if (newStatus === 'completed' && oldStatus !== 'completed' && campaignId) {
        const campaignRef = db.collection('campaigns').doc(campaignId)
        const campaignDoc = await transaction.get(campaignRef)
        if (campaignDoc.exists) {
          const currentRaised = Number(campaignDoc.data()?.raised || 0)
          transaction.update(campaignRef, { raised: currentRaised + amount })
        }
      }
      
      // 3. If status is changing from completed to something else, decrement campaign raised progress
      if (oldStatus === 'completed' && newStatus !== 'completed' && campaignId) {
        const campaignRef = db.collection('campaigns').doc(campaignId)
        const campaignDoc = await transaction.get(campaignRef)
        if (campaignDoc.exists) {
          const currentRaised = Number(campaignDoc.data()?.raised || 0)
          transaction.update(campaignRef, { raised: Math.max(0, currentRaised - amount) })
        }
      }
    })

    return c.redirect('/dashboard/donations?success=1')
  } catch (error: any) {
    console.error('Error updating donation status:', error.message)
    return c.redirect('/dashboard/donations?error=1')
  }
})

// Get donation stats (Admin only)
donations.get('/stats', adminMiddleware, async (c) => {
  const db = getFirestore(c)

  try {
    const [donationsSnap, campaignsSnap, volunteersSnap] = await Promise.all([
      db.collection('donations').get(),
      db.collection('campaigns').get(),
      db.collection('volunteers').get()
    ])

    const totalAmount = donationsSnap.docs.reduce((sum: number, doc: any) => sum + Number(doc.data().amount || 0), 0)

    return c.json({
      total_donations: totalAmount,
      total_campaigns: campaignsSnap.size,
      total_donors: donationsSnap.size,
      total_volunteers: volunteersSnap.size
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})
