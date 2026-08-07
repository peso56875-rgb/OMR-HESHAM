import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware, authMiddleware, rateLimiter } from './middleware'
import {
  getEmailConfig,
  sendInBackground,
  donationAlert,
  donationThanks,
  donationReceipt
} from '../lib/email'
import { buildReceipt, receiptPath } from '../lib/receipts'
import { SITE_ORIGIN } from '../lib/seo'

export const donations = new Hono()

// Create a new donation
donations.post('/', rateLimiter(10, 60000, 'donate'), async (c) => {
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
    const record = { id: docRef.id, ...donationData }

    // Receipt for the donor + alert for the team. Deliberately best-effort:
    // throwing here would surface an error after the money was already
    // recorded, and could push the donor into donating a second time.
    const cfg = getEmailConfig(c)
    await sendInBackground(c, async () => {
      await Promise.allSettled([donationAlert(cfg, record), donationThanks(cfg, record)])
    })

    return c.json({ 
      data: record, 
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
donations.post('/add', rateLimiter(10, 60000, 'donate'), async (c) => {
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
  const requested_campaign_id = (body.campaign_id || '').toString().trim() || null

  if (!amount || !donor_name || !donor_phone) {
    return c.json({ error: 'الحقول المطلوبة غير مكتملة (الاسم، الهاتف، المبلغ)' }, 400)
  }

  try {
    // The public form (Donate.tsx) has always submitted a `campaign_id`, but
    // this handler hardcoded null — so every donation made through the site was
    // filed under the general fund and no campaign's `raised` total ever moved,
    // leaving the progress bars permanently wrong. Resolve it here, and verify
    // the campaign exists and is published so a tampered form value cannot
    // attach money to a hidden or deleted campaign.
    let campaign_id: string | null = null
    let campaign_title = 'الصندوق العام'
    let campaign_category = 'عام'

    if (requested_campaign_id) {
      const campDoc = await db.collection('campaigns').doc(requested_campaign_id).get()
      const campData = campDoc.exists ? campDoc.data() : null
      if (campData && campData.is_published !== false) {
        campaign_id = campDoc.id
        campaign_title = campData.title || campaign_title
        campaign_category = campData.category || campaign_category
      } else {
        console.warn(`[donations] campaign ${requested_campaign_id} not found or unpublished — filed under the general fund`)
      }
    }

    const donationData = {
      profile_id: null,
      campaign_id,
      campaign_title,
      campaign_category,
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

    const docRef = await db.collection('donations').add(donationData)
    const record = { id: docRef.id, ...donationData }

    const cfg = getEmailConfig(c)
    await sendInBackground(c, async () => {
      await Promise.allSettled([donationAlert(cfg, record), donationThanks(cfg, record)])
    })

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
      return c.redirect('/dashboard?view=donations&error=not_found')
    }

    const donationData = donationDoc.data()!
    const oldStatus = donationData.status
    const amount = Number(donationData.amount || 0)
    const campaignId = donationData.campaign_id

    // إصدار الإيصال قبل الـ transaction وليس داخلها.
    //
    // السبب التقني: mintReceiptNumber تشغّل transaction خاصة بها، و Firestore
    // لا يسمح بتداخل الـ transactions.
    //
    // السبب المحاسبي: لو فشل تحديث الحالة بعد توليد الرقم نخسر رقمًا من
    // التسلسل. وهذا مقبول — الفجوة يمكن تفسيرها للمراجع، أما تكرار نفس
    // الرقم على إيصالين فهو خلل مراجعة حقيقي.
    //
    // يُصدر مرة واحدة فقط: لو أُلغي التأكيد ثم أُعيد، يحتفظ التبرع بإيصاله
    // الأصلي لأن المستند المالي لا يُعاد إصداره.
    const isIssuing = newStatus === 'completed' && oldStatus !== 'completed'
    const receipt = isIssuing && !donationData.receipt_number
      ? await buildReceipt(db, donationData, c)
      : null

    // Use transaction to update status and increment campaign raised amount if completed
    await db.runTransaction(async (transaction) => {
      // 1. Update donation status
      transaction.update(donationRef, { 
        status: newStatus,
        payment_status: newStatus === 'completed' ? 'paid' : 'pending',
        ...(receipt || {})
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

    // إرسال الإيصال بعد نجاح الـ transaction فقط — لا نرسل مستندًا
    // ماليًا لمبلغ لم تُثبت حالته في قاعدة البيانات.
    if (receipt) {
      const cfg = getEmailConfig(c)
      const url = SITE_ORIGIN + receiptPath(receipt.receipt_number, receipt.receipt_token)
      await sendInBackground(c, () =>
        donationReceipt(cfg, { ...donationData, ...receipt }, url)
      )
    }

    return c.redirect('/dashboard?view=donations&success=1')
  } catch (error: any) {
    console.error('Error updating donation status:', error.message)
    return c.redirect('/dashboard?view=donations&error=1')
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
