import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware, authMiddleware, rateLimiter } from './middleware'
import {
  getEmailConfig,
  sendInBackground,
  donationAlert,
  donationThanks,
  donationReceipt,
  donationCancelled,
  campaignGoalReached
} from '../lib/email'
import {
  notify,
  notifyAdmins,
  notifyInBackground,
  notifyMoney,
  dashLink
} from '../lib/notifications'
import { buildReceipt, receiptPath } from '../lib/receipts'
import { SITE_ORIGIN } from '../lib/seo'
import { cleanEmail, cleanPhone, cleanText, isValidEmail } from './sanitize'

export const donations = new Hono()

/**
 * A1 — إشعار المشرفين بتبرع جديد.
 *
 * مشترك بين مسارين (POST / و POST /add) لأن الموقع يستقبل التبرعات من
 * نموذجين مختلفين: واحد للمستخدم المسجّل وواحد عام. لو كل مسار كتب
 * الإشعار بنفسه، أي تغيير في الصياغة أو الرابط لازم يتكرر مرتين.
 *
 * التبرع الجديد **معلّق** ولم يُتحقق منه بعد، فالإشعار موجّه للمشرفين
 * فقط ليراجعوه — المتبرع بياخد إشعاره لما الحالة تتأكد (U1).
 */
const notifyNewDonation = (c: any, record: any): Promise<void> =>
  notifyInBackground(c, async () => {
    await notifyAdmins(c, {
      type: 'donation_new',
      title: `تبرع جديد: ${notifyMoney(record?.amount)}`,
      body: [
        record?.donor_name || 'متبرع',
        record?.case_title ? `كفالة: ${record.case_title}` : record?.campaign_title,
        record?.donation_purpose ? `مصرف: ${record.donation_purpose}` : null,
        record?.payment_method
      ]
        .filter(Boolean)
        .join(' — '),
      link: dashLink('donations'),
      meta: {
        donation_id: record?.id,
        amount: Number(record?.amount || 0),
        campaign_id: record?.campaign_id || '',
        case_id: record?.case_id || '',
        payment_method: record?.payment_method || ''
      }
    })
  })

// Create a new donation
donations.post('/', rateLimiter(10, 60000, 'donate'), async (c) => {
  const db = getFirestore(c)
  
  let body: any
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'بيانات غير صالحة' }, 400)
  }

  const amount = body.amount
  const donation_type = cleanText(body.donation_type || 'once', 40)
  const campaign_id = cleanText(body.campaign_id, 160)
  const case_id = cleanText(body.case_id, 160)
  const case_code = cleanText(body.case_code, 80)
  const donation_purpose = cleanText(body.donation_purpose, 160)
  const donor_name = cleanText(body.donor_name, 120)
  const donor_phone = cleanPhone(body.donor_phone)
  const donor_email = cleanEmail(body.donor_email)
  const payment_method = cleanText(body.payment_method, 80)

  if (!donor_name || !donor_phone || !payment_method) {
    return c.json({ error: 'الحقول المطلوبة غير مكتملة' }, 400)
  }
  if (donor_email && !isValidEmail(donor_email)) {
    return c.json({ error: 'البريد الإلكتروني غير صالح' }, 400)
  }

  // ✅ الأمان: التحقق من صحة المبلغ قبل الحفظ.
  // كان يُقبل أي قيمة (سالب، صفر، لا نهائي، نص مختلط) ويُخزن كرقم لمبلغ
  // يظهر لاحقًا في الإحصائيات والإيصالات والتنبيهات. الحد الأدنى 1 جنيه
  // والحد الأقصى معقول حتى للتحويلات البنكية الكبيرة.
  const numericAmount = Number(amount)
  if (!Number.isFinite(numericAmount) || numericAmount < 1 || numericAmount > 100_000_000) {
    return c.json({ error: 'المبلغ غير صالح (يجب أن يكون رقمًا بين 1 و 100,000,000)' }, 400)
  }

  // Get user profile if authenticated
  const user = (c as any).get('user')
  const profile_id = user ? user.id : null

  try {
    let resolvedCampaignId: string | null = null
    let campaign_title = ''
    let campaign_category = ''

    if (campaign_id) {
      const campDoc = await db.collection('campaigns').doc(campaign_id).get()
      const campData = campDoc.exists ? campDoc.data() : null
      if (campData?.is_published === true) {
        resolvedCampaignId = campDoc.id
        campaign_title = campData.title || ''
        campaign_category = campData.category || ''
      }
    }

    let resolvedCaseId: string | null = null
    let case_title = ''
    let resolved_case_code = case_code || ''
    if (case_id) {
      try {
        const caseDoc = await db.collection('beneficiary_cases').doc(case_id).get()
        const caseData = caseDoc.exists ? caseDoc.data() : null
        if (caseData?.is_published === true) {
          resolvedCaseId = caseDoc.id
          case_title = caseData.title || ''
          if (!resolved_case_code) resolved_case_code = caseData.code || ''
        } else {
          resolved_case_code = ''
        }
      } catch (e) {}
    }

    const donationData = {
      profile_id,
      campaign_id: resolvedCampaignId,
      campaign_title: campaign_title || null,
      campaign_category: campaign_category || null,
      case_id: resolvedCaseId,
      case_code: resolved_case_code || null,
      case_title: case_title || null,
      donation_purpose: donation_purpose || null,
      amount: numericAmount,
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
    await notifyNewDonation(c, record)

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

  const amountRaw = Number(body.amount)
  // ✅ الأمان: رفض القيم غير الصالحة صراحةً بدلاً من تحويل "abc" إلى 0
  // بصمت (كانت 0 تنجح في فحص !amount؟ لا — بل كانت تُقبل لأن 0 || 0 = 0،
  // لكن القيم الضخمة/السالبة كانت تمر). نتحقق الآن من المدى بالكامل.
  const amount = Number.isFinite(amountRaw) ? amountRaw : NaN
  const donor_name = cleanText(body.name || body.donor_name, 120)
  const donor_phone = cleanPhone(body.phone || body.donor_phone)
  const donor_email = cleanEmail(body.email || body.donor_email) || null
  const payment_method = cleanText(body.method || body.payment_method || 'instapay', 80)
  const requested_campaign_id = cleanText(body.campaign_id, 160) || null
  const requested_case_id = cleanText(body.case_id, 160) || null
  const requested_case_code = cleanText(body.case_code, 80) || null
  const requested_case_title = cleanText(body.case_title, 180) || null
  const donation_purpose = cleanText(body.donation_purpose || body.purpose, 160) || null

  if (!Number.isFinite(amount) || amount < 1 || amount > 100_000_000) {
    return c.json({ error: 'المبلغ غير صالح (يجب أن يكون رقمًا بين 1 و 100,000,000)' }, 400)
  }

  if (!donor_name || !donor_phone) {
    return c.json({ error: 'الحقول المطلوبة غير مكتملة (الاسم، الهاتف، المبلغ)' }, 400)
  }
  if (donor_email && !isValidEmail(donor_email)) {
    return c.json({ error: 'البريد الإلكتروني غير صالح' }, 400)
  }

  try {
    let campaign_id: string | null = null
    let campaign_title = 'الصندوق العام'
    let campaign_category = 'عام'

    if (requested_campaign_id) {
      const campDoc = await db.collection('campaigns').doc(requested_campaign_id).get()
      const campData = campDoc.exists ? campDoc.data() : null
      if (campData && campData.is_published === true) {
        campaign_id = campDoc.id
        campaign_title = campData.title || campaign_title
        campaign_category = campData.category || campaign_category
      } else {
        console.warn(`[donations] campaign ${requested_campaign_id} not found or unpublished — filed under the general fund`)
      }
    }

    let case_id: string | null = null
    let case_code: string | null = null
    let case_title: string | null = null

    if (requested_case_id) {
      try {
        const caseDoc = await db.collection('beneficiary_cases').doc(requested_case_id).get()
        const caseData = caseDoc.exists ? caseDoc.data() : null
        if (caseData?.is_published === true) {
          case_id = caseDoc.id
          case_title = caseData.title || requested_case_title
          case_code = caseData.code || requested_case_code
        }
      } catch (e) {}
    }

    const donationData = {
      profile_id: null,
      campaign_id,
      campaign_title,
      campaign_category,
      case_id: case_id || null,
      case_code: case_code || null,
      case_title: case_title || null,
      donation_purpose: donation_purpose || null,
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
    await notifyNewDonation(c, record)

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
    const caseId = donationData.case_id

    // إصدار الإيصال قبل الـ transaction وليس داخلها.
    const isIssuing = newStatus === 'completed' && oldStatus !== 'completed'
    const receipt = isIssuing && !donationData.receipt_number
      ? await buildReceipt(db, donationData, c)
      : null

    // Use transaction to update status and increment campaign or case raised amount if completed
    await db.runTransaction(async (transaction) => {
      // 1. Update donation status
      transaction.update(donationRef, { 
        status: newStatus,
        payment_status: newStatus === 'completed' ? 'paid' : 'pending',
        ...(receipt || {})
      })

      // 2. If status is changing to completed, increment campaign or case raised progress
      if (newStatus === 'completed' && oldStatus !== 'completed') {
        if (campaignId) {
          const campaignRef = db.collection('campaigns').doc(campaignId)
          const campaignDoc = await transaction.get(campaignRef)
          if (campaignDoc.exists) {
            const currentRaised = Number(campaignDoc.data()?.raised || 0)
            transaction.update(campaignRef, { raised: currentRaised + amount })
          }
        }
        if (caseId) {
          const caseRef = db.collection('beneficiary_cases').doc(caseId)
          const caseDoc = await transaction.get(caseRef)
          if (caseDoc.exists) {
            const currentRaised = Number(caseDoc.data()?.raised_amount || 0)
            transaction.update(caseRef, { raised_amount: currentRaised + amount })
          }
        }
      }
      
      // 3. If status is changing from completed to something else, decrement campaign or case raised progress
      if (oldStatus === 'completed' && newStatus !== 'completed') {
        if (campaignId) {
          const campaignRef = db.collection('campaigns').doc(campaignId)
          const campaignDoc = await transaction.get(campaignRef)
          if (campaignDoc.exists) {
            const currentRaised = Number(campaignDoc.data()?.raised || 0)
            transaction.update(campaignRef, { raised: Math.max(0, currentRaised - amount) })
          }
        }
        if (caseId) {
          const caseRef = db.collection('beneficiary_cases').doc(caseId)
          const caseDoc = await transaction.get(caseRef)
          if (caseDoc.exists) {
            const currentRaised = Number(caseDoc.data()?.raised_amount || 0)
            transaction.update(caseRef, { raised_amount: Math.max(0, currentRaised - amount) })
          }
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

    // إشعارات تغيّر حالة التبرع.
    // الشرط newStatus !== oldStatus ضروري: لوحة التحكم تسمح بإعادة حفظ نفس
    // الحالة، ولو أرسلنا الإشعار على كل حفظ كان المتبرع هيستلم «تم تأكيد
    // تبرعك» أكثر من مرة لنفس المبلغ — وده يخلق شكًّا في سلامة المحاسبة.
    if (newStatus !== oldStatus) {
      const targetId = donationData.profile_id || null
      const donorEmail = String(donationData.donor_email || '')
      const donorName = String(donationData.donor_name || 'المتبرع الكريم')
      const actor = (c as any).get('user')
      const actorRef = { id: actor?.id || null, name: actor?.name || actor?.email || 'إدارة المؤسسة' }
      const cancelReason = String((body as any).reason || '')

      await notifyInBackground(c, async () => {
        const cfg = getEmailConfig(c)
        const jobs: Array<Promise<unknown>> = []

        // U1 — تأكيد التبرع.
        // نستخدم isIssuing وليس (newStatus === 'completed') لأنها محسوبة على
        // أساس «الانتقال إلى completed» لا مجرد الوجود فيها.
        // لا بريد إضافي هنا: الإيصال الرسمي أُرسل بالأعلى بالفعل.
        if (isIssuing) {
          jobs.push(
            notify(c, {
              user_id: targetId,
              type: 'donation_confirmed',
              title: `تم تأكيد تبرعك: ${notifyMoney(amount)}`,
              body: donationData.case_title
                ? `وصل تبرعك وسُجّل لكفالة «${donationData.case_title}». جزاك الله خيرًا وأثابك.`
                : donationData.campaign_title
                ? `وصل تبرعك وسُجّل لحملة «${donationData.campaign_title}». جزاك الله خيرًا.`
                : 'وصل تبرعك وتم تسجيله رسميًا. جزاك الله خيرًا.',
              link: '/profile?tab=donations',
              actor: actorRef,
              meta: {
                donation_id: id,
                amount,
                receipt_number: receipt?.receipt_number || donationData.receipt_number || ''
              }
            })
          )
        }

        // U2 — إلغاء أو فشل التبرع
        if (newStatus === 'cancelled' || newStatus === 'failed') {
          jobs.push(
            notify(c, {
              user_id: targetId,
              type: 'donation_cancelled',
              title: 'بخصوص عملية تبرعك',
              body: `لم تكتمل عملية التبرع بقيمة ${notifyMoney(amount)}. لم يُخصم منك أي مبلغ.`,
              link: '/donate',
              actor: actorRef,
              meta: { donation_id: id, amount, status: newStatus }
            }),
            donationCancelled(cfg, {
              email: donorEmail,
              donor_name: donorName,
              amount,
              id,
              reason: cancelReason
            })
          )
        }

        // A8 — بلوغ الحملة هدفها المالي.
        //
        // نعيد قراءة الحملة **بعد** الـ transaction للحصول على raised المحدّث.
        //
        // الشرط الحاسم: raised - amount < goal. بدونه كان الإشعار يتكرّر مع
        // **كل** تبرع لاحق على حملة بلغت هدفها، لأن raised >= goal تبقى صحيحة
        // للأبد. الطرح يضمن أن هذا التبرع تحديدًا هو من عبر بالحملة الحد.
        if (isIssuing && campaignId) {
          try {
            const campSnap = await db.collection('campaigns').doc(campaignId).get()
            const camp = campSnap.data()
            if (campSnap.exists && camp) {
              const goal = Number(camp.goal || camp.target_amount || 0)
              const raised = Number(camp.raised || 0)

              if (goal > 0 && raised >= goal && raised - amount < goal) {
                jobs.push(
                  notifyAdmins(c, {
                    type: 'campaign_goal_reached',
                    title: `حملة «${camp.title || 'حملة'}» بلغت هدفها`,
                    body: `تم جمع ${notifyMoney(raised)} من هدف ${notifyMoney(goal)}.`,
                    link: dashLink('campaigns'),
                    actor: actorRef,
                    meta: { campaign_id: campaignId, goal, raised }
                  }),
                  campaignGoalReached(cfg, {
                    id: campaignId,
                    title: camp.title,
                    goal,
                    raised
                  })
                )
              }
            }
          } catch (e: any) {
            console.error('[donations] campaign goal check failed:', e?.message || e)
          }
        }

        if (jobs.length) await Promise.allSettled(jobs)
      })
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
