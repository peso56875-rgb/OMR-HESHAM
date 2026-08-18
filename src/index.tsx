import { Hono } from 'hono'
import { getFirestore, getAuth } from './lib/firebase-admin'

import { Home } from './components/Home'
import { About } from './components/About'
import { Campaigns, CampaignDetail } from './components/Campaigns'
import { Donate } from './components/Donate'
import { News, NewsDetail } from './components/News'
import { Events, EventDetail } from './components/Events'
import { Stories } from './components/Stories'
import { Careers } from './components/Careers'
import { Login, Profile } from './components/Auth'
import { Achievements, Volunteers, Contact, FAQ, Transparency, Gallery, GenericNotFound } from './components/Pages'
import { Dashboard } from './components/Dashboard'

import { Receipt, ReceiptVerification } from './components/Receipt'

import { api } from './api'
import { rateLimiter } from './api/middleware'
import { securityHeaders } from './lib/security-headers'
import { verifyReceiptToken } from './lib/receipts'
import { isPushConfigured, getPushClientConfig } from './lib/push'
import { NotificationsPage } from './components/NotificationsPage'
import { SITE_ORIGIN } from './lib/seo'
import { contextStorage } from 'hono/context-storage'

const app = new Hono()

// Makes the active request available to deeply-nested components (used by the
// SEO helper to derive the canonical URL without threading a prop through all
// 21 Layout call sites). Must be registered before anything that renders HTML.
app.use('*', contextStorage())

// Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, …).
// Registered early so the headers apply to every response, including error
// pages and 404s. See src/lib/security-headers.ts for the per-directive
// rationale.
app.use('*', securityHeaders())

// Session Middleware — reads the Firebase session cookie and populates c.get('user')
app.use('*', async (c, next) => {
  const sessionCookie = c.req.header('Cookie')?.match(/fb-session=([^;]+)/)?.[1]
  if (sessionCookie) {
    try {
      const firebaseAuth = getAuth(c)
      const decodedClaims = await firebaseAuth.verifySessionCookie(sessionCookie, true)

      // Fetch the user's profile from Firestore to get the role
      const db = getFirestore(c)
      const profileDoc = await db.collection('profiles').doc(decodedClaims.uid).get()
      const profile = profileDoc.exists ? profileDoc.data() : null

      ;(c as any).set('user', {
        id: decodedClaims.uid,
        email: decodedClaims.email || '',
        name: profile?.full_name || decodedClaims.name || decodedClaims.email?.split('@')[0] || 'فاعل خير',
        avatar: profile?.avatar_url || decodedClaims.picture || '',
        role: profile?.role || 'donor',
        phone: profile?.phone || ''
      })
    } catch (e: any) {
      // Session cookie is invalid or expired — clear it silently
      console.error('[Session Middleware]', e.code || e.message)
    }
  }
  await next()
})

// Mount All API Endpoints
app.route('/api', api)

// Page Routes
app.get('/', async (c) => {
  let campaigns: any[] = []
  let news: any[] = []
  let stories: any[] = []
  try {
    const db = getFirestore(c)
    const [cSnap, nSnap, sSnap] = await Promise.all([
      db.collection('campaigns').where('is_published', '==', true).limit(3).get(),
      db.collection('news').where('is_published', '==', true).orderBy('publish_date', 'desc').limit(3).get(),
      db.collection('stories').where('is_published', '==', true).limit(3).get()
    ])
    campaigns = cSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    news = nSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    stories = sSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }
  return c.html(<Home campaigns={campaigns} news={news} stories={stories} user={(c as any).get('user')} />)
})

app.get('/about', (c) => c.html(<About user={(c as any).get('user')} />))

app.get('/campaigns', async (c) => {
  let campaigns: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('campaigns').where('is_published', '==', true).get()
    campaigns = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }
  return c.html(<Campaigns campaigns={campaigns} user={(c as any).get('user')} />)
})

app.get('/campaigns/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const db = getFirestore(c)
    const doc = await db.collection('campaigns').doc(id).get()
    if (!doc.exists) {
      return c.notFound()
    }
    const campaign = { id: doc.id, ...doc.data() }
    return c.html(<CampaignDetail c={campaign} user={(c as any).get('user')} />)
  } catch (e) {
    return c.notFound()
  }
})

app.get('/donate', async (c) => {
  let campaigns: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('campaigns').where('is_published', '==', true).get()
    campaigns = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }
  const selectedCampaignId = c.req.query('campaign') || ''
  return c.html(<Donate campaigns={campaigns} selectedCampaignId={selectedCampaignId} user={(c as any).get('user')} />)
})

app.get('/achievements', (c) => c.html(<Achievements user={(c as any).get('user')} />))
app.get('/volunteers', async (c) => {
  let stats: any = { total: 0, totalHours: 0 }
  try {
    const db = getFirestore(c)
    const snap = await db.collection('volunteers').where('status', '==', 'approved').get()
    const approved = snap.docs.map((d: any) => d.data())
    stats = {
      total: approved.length,
      totalHours: approved.reduce((sum: number, v: any) => sum + (v.hours_count || 0), 0)
    }
  } catch (e) {}
  return c.html(<Volunteers user={(c as any).get('user')} stats={stats} />)
})

app.get('/news', async (c) => {
  let news: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('news').where('is_published', '==', true).orderBy('publish_date', 'desc').get()
    news = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }
  return c.html(<News news={news} user={(c as any).get('user')} />)
})

app.get('/news/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const db = getFirestore(c)
    const doc = await db.collection('news').doc(id).get()
    if (!doc.exists) {
      return c.notFound()
    }
    const item = { id: doc.id, ...doc.data() }
    return c.html(<NewsDetail n={item} user={(c as any).get('user')} />)
  } catch (e) {
    return c.notFound()
  }
})

app.get('/faq', (c) => c.html(<FAQ user={(c as any).get('user')} />))
app.get('/contact', (c) => c.html(<Contact user={(c as any).get('user')} />))
app.get('/transparency', (c) => c.html(<Transparency user={(c as any).get('user')} />))
app.get('/gallery', async (c) => {
  let items: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('gallery').where('is_published', '==', true).orderBy('created_at', 'desc').get()
    items = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }
  return c.html(<Gallery items={items} user={(c as any).get('user')} />)
})

app.get('/events', async (c) => {
  let events: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('events').where('is_published', '==', true).orderBy('event_date', 'asc').get()
    events = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }
  return c.html(<Events events={events} user={(c as any).get('user')} />)
})

app.get('/events/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const db = getFirestore(c)
    const doc = await db.collection('events').doc(id).get()
    if (!doc.exists) {
      return c.notFound()
    }
    const event = { id: doc.id, ...doc.data() }
    return c.html(<EventDetail e={event} user={(c as any).get('user')} />)
  } catch (e) {
    return c.notFound()
  }
})

app.get('/success-stories', async (c) => {
  let stories: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('stories').where('is_published', '==', true).orderBy('created_at', 'desc').get()
    stories = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }
  return c.html(<Stories stories={stories} user={(c as any).get('user')} />)
})

app.get('/careers', async (c) => {
  let jobs: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('jobs').where('is_published', '==', true).orderBy('created_at', 'desc').get()
    jobs = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }
  return c.html(<Careers jobs={jobs} user={(c as any).get('user')} />)
})

app.get('/login', (c) => {
  const user = (c as any).get('user')
  if (user) {
    return c.redirect(user.role === 'admin' ? '/dashboard' : '/profile')
  }

  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  }

  return c.html(<Login firebaseConfig={firebaseConfig} />)
})

app.get('/profile', async (c) => {
  const user = (c as any).get('user')
  if (!user) {
    return c.redirect('/login?error=unauthorized')
  }

  let donations: any[] = []
  let volunteer: any = null

  try {
    const db = getFirestore(c)
    const [dSnap, vSnap] = await Promise.all([
      db.collection('donations').where('donor_email', '==', user.email).orderBy('created_at', 'desc').get(),
      db.collection('volunteers').where('profile_id', '==', user.id).limit(1).get()
    ])

    donations = dSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    if (!vSnap.empty) {
      volunteer = { id: vSnap.docs[0].id, ...vSnap.docs[0].data() }
    }
  } catch (error: any) {
    console.error('Error fetching profile data:', error.message)
  }

  return c.html(<Profile user={user} donations={donations} volunteer={volunteer} />)
})

/**
 * صفحة الإشعارات — /notifications
 *
 * موجودة كصفحة مستقلة لا داخل لوحة التحكم فقط، لأن المتطوّع والمتبرّع
 * ممنوعان من دخول اللوحة (تحويل إلى /profile) وهما أهم مستقبِلَي
 * الإشعارات: قبول التطوّع، الترقية، تأكيد التبرّع. لو كان مركز
 * الإشعارات حصرًا للمشرفين لانتفى نصف الغرض من النظام.
 */
app.get('/notifications', async (c) => {
  const user = (c as any).get('user')
  if (!user) return c.redirect('/login?error=unauthorized&next=/notifications')

  return c.html(
    <NotificationsPage user={user} pushAvailable={isPushConfigured(c)} pushConfig={getPushClientConfig(c)} />
  )
})

app.get('/dashboard', async (c) => {
  const user = (c as any).get('user')
  if (!user) {
    return c.redirect('/login?error=unauthorized')
  }
  if (user.role !== 'admin') {
    return c.redirect('/profile?error=not_admin')
  }

  const view = c.req.query('view') || 'overview'
  let viewData: any = { list: [], stats: {}, recentDonations: [] }

  try {
    const db = getFirestore(c)

    if (view === 'overview') {
      const [cSnap, dSnap, vSnap, recentDonationsSnap, incSnap, expSnap] = await Promise.all([
        db.collection('campaigns').where('is_published', '==', true).get(),
        db.collection('donations').where('status', '==', 'completed').get(),
        db.collection('volunteers').get(),
        db.collection('donations').orderBy('created_at', 'desc').limit(5).get(),
        db.collection('treasury_income').get(),
        db.collection('treasury_expenses').get()
      ])

      const totalDonations = dSnap.docs.reduce((sum: number, doc: any) => sum + Number(doc.data().amount || 0), 0)
      const totalIncome = incSnap.docs.reduce((sum: number, doc: any) => sum + Number(doc.data().amount || 0), 0)
      const totalExpenses = expSnap.docs.reduce((sum: number, doc: any) => sum + Number(doc.data().amount || 0), 0)
      const uniqueDonors = new Set(dSnap.docs.map((doc: any) => doc.data().donor_email || doc.data().donor_phone)).size

      viewData = {
        stats: {
          total_donations: totalDonations,
          total_campaigns: cSnap.size,
          total_donors: uniqueDonors,
          total_volunteers: vSnap.size,
          total_income: totalIncome,
          total_expenses: totalExpenses,
          balance: totalIncome - totalExpenses
        },
        recentDonations: recentDonationsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'treasury') {
      const [incSnap, expSnap, campSnap] = await Promise.all([
        db.collection('treasury_income').orderBy('created_at', 'desc').get(),
        db.collection('treasury_expenses').orderBy('created_at', 'desc').get(),
        db.collection('campaigns').get()
      ])

      const incomeList = incSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      const expenseList = expSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      const campaigns = campSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))

      const totalIncome = incomeList.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0)
      const totalExpenses = expenseList.reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0)

      viewData = {
        summary: {
          balance: totalIncome - totalExpenses,
          total_income: totalIncome,
          total_expenses: totalExpenses,
          income_count: incomeList.length,
          expense_count: expenseList.length
        },
        incomeList: incomeList.slice(0, 10),
        expenseList: expenseList.slice(0, 10),
        campaigns
      }
    } else if (view === 'income') {
      const [snap, campSnap] = await Promise.all([
        db.collection('treasury_income').orderBy('created_at', 'desc').get(),
        db.collection('campaigns').get()
      ])
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
        campaigns: campSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'expenses') {
      const [snap, campSnap] = await Promise.all([
        db.collection('treasury_expenses').orderBy('created_at', 'desc').get(),
        db.collection('campaigns').get()
      ])
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
        campaigns: campSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'campaigns') {
      const snap = await db.collection('campaigns').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'donations') {
      const snap = await db.collection('donations').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'volunteers') {
      const snap = await db.collection('volunteers').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'contacts') {
      const snap = await db.collection('contacts').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'news') {
      const snap = await db.collection('news').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'events') {
      const snap = await db.collection('events').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'stories') {
      const snap = await db.collection('stories').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'gallery') {
      const snap = await db.collection('gallery').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'jobs') {
      const snap = await db.collection('jobs').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'job_applications') {
      const snap = await db.collection('job_applications').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'newsletter') {
      const snap = await db.collection('newsletter_subscribers').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'users') {
      const snap = await db.collection('profiles').orderBy('created_at', 'desc').get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'cases') {
      const snap = await db.collection('beneficiary_groups').orderBy('created_at', 'desc').get()
      const groups = snap.docs.map((doc: any) => {
        const d = doc.data()
        return {
          id: doc.id,
          title: d.title,
          aid_type: d.aid_type,
          total_count: d.total_count || (d.names ? d.names.length : 0),
          // أول 10 أسماء للمعاينة فقط، بدون إرسال كل الأسماء للـ frontend
          preview_names: (d.names || []).slice(0, 10),
          created_by: d.created_by,
          created_at: d.created_at
        }
      })
      const totalBeneficiaries = groups.reduce((sum: number, g: any) => sum + (g.total_count || 0), 0)
      viewData = {
        groups,
        stats: {
          total_groups: groups.length,
          total_beneficiaries: totalBeneficiaries
        }
      }
    } else if (view === 'notifications') {
      // لا استعلام هنا: صفحة الإشعارات تجلب تدفّقها من /api/notifications
      // على العميل (مع فلترة وترقيم)، فأي جلب هنا سيكون استعلامًا مكرّرًا
      // يُرمى فورًا بمجرّد أن يعمل السكربت.
      viewData = { pushAvailable: isPushConfigured(c) }
    } else if (view === 'audit') {
      // سجل التدقيق: أحدث 100 سطر فقط. السجل ينمو مع كل عملية إدارية،
      // وتحميله كاملًا سيبطئ الصفحة تدريجيًا حتى تتوقف عن العمل.
      const snap = await db.collection('audit_logs').orderBy('created_at', 'desc').limit(100).get()
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    }
  } catch (error: any) {
    console.error(`Error loading dashboard view ${view}:`, error.message)
    viewData = { list: [], stats: {}, recentDonations: [], pushAvailable: isPushConfigured(c) }
  }

  // إعدادات الـ Push تُمرَّر مع بيانات العرض لا كخاصية منفصلة، لأن
  // Dashboard يستقبل كائن data واحدًا فقط ولا داعي لتغيير توقيعه.
  viewData.pushConfig = getPushClientConfig(c)

  return c.html(<Dashboard view={view} data={viewData} user={user} />)
})

/**
 * إيصالات التبرع — Donation receipts
 * ==================================
 *
 * لا يُطلب تسجيل دخول لعرض الإيصال، والسبب مقصود: كثير من المتبرعين
 * يتبرعون كزوار بلا حساب. إلزامهم بإنشاء حساب لرؤية مستندهم المالي
 * يعني حجب مستند يملكونه بالفعل.
 *
 * الحماية تأتي من التوقيع الرقمي في الرابط بدلًا من ذلك. ويُقبل الوصول
 * أيضًا لصاحب التبرع المسجّل أو للمسؤول، حتى يستطيع المتبرع الذي فقد
 * الرابط الوصول لإيصاله من حسابه.
 */
app.get('/receipt/:number', rateLimiter(30, 60000, 'receipt-view'), async (c) => {
  const number = c.req.param('number') as string
  const token = c.req.query('t') || ''
  const user = (c as any).get('user')

  try {
    const db = getFirestore(c)
    const snap = await db
      .collection('donations')
      .where('receipt_number', '==', number)
      .limit(1)
      .get()

    if (snap.empty) {
      return c.html(
        <ReceiptVerification valid={false} reason="لا يوجد إيصال بهذا الرقم في سجلات المؤسسة." />,
        404
      )
    }

    const doc = snap.docs[0]
    const donation = { id: doc.id, ...doc.data() } as any

    // يُمرَّر التوقيع المخزَّن ليكون هو المرجع: إعادة الحساب من المفتاح
    // وحدها تجعل تدوير المفتاح يقتل كل روابط المتبرعين الصادرة.
    const signatureOk = await verifyReceiptToken(number, token, c, donation.receipt_token)
    const isOwner = Boolean(user?.id && donation.user_id && user.id === donation.user_id)
    const isAdmin = user?.role === 'admin'

    if (!signatureOk && !isOwner && !isAdmin) {
      // 403 وليس 404: المستند موجود فعلًا، والمشكلة في الصلاحية.
      return c.html(
        <ReceiptVerification
          valid={false}
          reason="رابط الإيصال غير مكتمل أو غير صحيح. تأكد من نسخ الرابط بالكامل."
        />,
        403
      )
    }

    const verifyUrl = `${SITE_ORIGIN}/receipt/verify/${encodeURIComponent(number)}?t=${encodeURIComponent(donation.receipt_token || token)}`
    return c.html(<Receipt donation={donation} verifyUrl={verifyUrl} />)
  } catch (error: any) {
    console.error('Error loading receipt:', error.message)
    return c.html(
      <ReceiptVerification valid={false} reason="حدث خطأ أثناء قراءة الإيصال. حاول لاحقًا." />,
      500
    )
  }
})

/**
 * صفحة التحقق العامة من صحة إيصال.
 *
 * موجّهة للجهات الرقابية والمراجعين: يستطيع من يحمل إيصالًا ورقيًا أن
 * يتأكد أن المؤسسة أصدرته فعلًا. التوقيع مطلوب هنا أيضًا حتى لا تتحول
 * الصفحة إلى وسيلة لتعداد أرقام الإيصالات وحصاد بيانات المتبرعين.
 */
app.get('/receipt/verify/:number', rateLimiter(30, 60000, 'receipt-verify'), async (c) => {
  const number = c.req.param('number') as string
  const token = c.req.query('t') || ''

  try {
    // يُقرأ المستند قبل التحقق لأن التوقيع المخزَّن فيه هو المرجع.
    // الترتيب لا يُسرّب شيئًا: الرد عند فشل التحقق لا يحمل أي بيانات.
    const db = getFirestore(c)
    const snap = await db
      .collection('donations')
      .where('receipt_number', '==', number)
      .limit(1)
      .get()

    if (snap.empty) {
      return c.html(
        <ReceiptVerification valid={false} reason="لا يوجد إيصال بهذا الرقم في سجلات المؤسسة." />,
        404
      )
    }

    const doc = snap.docs[0]
    const data = doc.data() as any

    if (!(await verifyReceiptToken(number, token, c, data.receipt_token))) {
      return c.html(
        <ReceiptVerification valid={false} reason="رابط التحقق غير صحيح أو غير مكتمل." />,
        403
      )
    }

    return c.html(
      <ReceiptVerification valid={true} donation={{ id: doc.id, ...data }} />
    )
  } catch (error: any) {
    console.error('Error verifying receipt:', error.message)
    return c.html(
      <ReceiptVerification valid={false} reason="حدث خطأ أثناء التحقق. حاول لاحقًا." />,
      500
    )
  }
})

/**
 * Sitemap.
 *
 * Previously this listed only the 14 static pages with no <lastmod>, so every
 * campaign, news article and event — the content that actually changes and that
 * people search for — was invisible to crawlers unless they happened to follow
 * an internal link. Now the published dynamic records are included too, with
 * lastmod so crawlers can tell what has changed since their last visit.
 */
app.get('/sitemap.xml', async (c) => {
  const ORIGIN = 'https://omarhesham.org'
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

  const entry = (path: string, opts: { lastmod?: string, priority?: string, changefreq?: string } = {}) =>
    `<url><loc>${esc(ORIGIN + path)}</loc>` +
    (opts.lastmod ? `<lastmod>${esc(opts.lastmod)}</lastmod>` : '') +
    (opts.changefreq ? `<changefreq>${opts.changefreq}</changefreq>` : '') +
    (opts.priority ? `<priority>${opts.priority}</priority>` : '') +
    '</url>'

  // Donation and campaign pages carry the highest priority — they are the ones
  // the foundation actually needs found.
  const statics: Array<[string, string, string]> = [
    ['/', '1.0', 'daily'],
    ['/campaigns', '0.9', 'daily'],
    ['/donate', '0.9', 'weekly'],
    ['/news', '0.8', 'daily'],
    ['/about', '0.7', 'monthly'],
    ['/achievements', '0.7', 'monthly'],
    ['/success-stories', '0.7', 'weekly'],
    ['/events', '0.7', 'weekly'],
    ['/volunteers', '0.7', 'monthly'],
    ['/transparency', '0.7', 'monthly'],
    ['/gallery', '0.6', 'weekly'],
    ['/careers', '0.6', 'weekly'],
    ['/faq', '0.5', 'monthly'],
    ['/contact', '0.5', 'monthly']
  ]

  let urls = statics.map(([path, priority, changefreq]) => entry(path, { priority, changefreq })).join('')

  const isoDate = (v: any): string | undefined => {
    if (!v) return undefined
    try {
      const d = typeof v?.toDate === 'function' ? v.toDate() : new Date(v)
      return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10)
    } catch { return undefined }
  }

  // A sitemap that 500s is worse than one missing a few rows, so any Firestore
  // problem degrades to the static list rather than failing the response.
  try {
    const db = getFirestore(c)
    const collections: Array<[string, string, string]> = [
      ['campaigns', '/campaigns/', '0.8'],
      ['news', '/news/', '0.7'],
      ['events', '/events/', '0.6']
    ]

    for (const [name, prefix, priority] of collections) {
      try {
        const snap = await db.collection(name).where('is_published', '==', true).get()
        urls += snap.docs.map((doc: any) => {
          const d = doc.data() || {}
          return entry(prefix + doc.id, {
            lastmod: isoDate(d.updated_at) || isoDate(d.created_at),
            priority,
            changefreq: 'weekly'
          })
        }).join('')
      } catch (e: any) {
        console.warn(`[sitemap] skipped ${name}:`, e?.message)
      }
    }
  } catch (e: any) {
    console.warn('[sitemap] dynamic entries unavailable:', e?.message)
  }

  return c.body(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    200,
    { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  )
})

app.notFound(c => c.html(<GenericNotFound user={(c as any).get('user')} />, 404))

export default app
