import { Hono } from 'hono'
import { getFirestore, getAuth } from './lib/firebase-admin'

import { Layout } from './components/shared'
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
import { NotificationsPage } from './components/Notifications'
import { fetchFeed } from './api/notifications'
import { ZakatCalculator } from './components/Zakat'
import { QuranHub } from './components/Quran'
import { KidsHub } from './components/KidsHub'
import { CasesList, CaseDetail } from './components/Cases'
import { MedicalEquipment } from './components/MedicalEquipment'
import { defaultMedicalEquipment } from './api/medical'
import { VolunteerPortal } from './components/VolunteerPortal'
import { defaultVolunteerMissions } from './api/volunteers'
import { CertificateView } from './components/Certificate'
import { VolunteerCardView } from './components/VolunteerCard'
import { DonorStatement } from './components/DonorStatement'

import { Receipt, ReceiptVerification } from './components/Receipt'
import { defaultCampaigns, defaultNews } from './defaults'
import { isPlatformAdmin } from './lib/admin-check'

import { api } from './api'
import { rateLimiter } from './api/middleware'
import { securityHeaders } from './lib/security-headers'
import { verifyReceiptToken } from './lib/receipts'
import { isPushConfigured } from './lib/push'
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

      // Fetch the user's profile from Firestore to get the role (with safe fallback)
      let profile: any = null
      try {
        const db = getFirestore(c)
        const profileDoc = await db.collection('profiles').doc(decodedClaims.uid).get()
        profile = profileDoc.exists ? profileDoc.data() : null
      } catch (dbErr: any) {
        // Firestore read failed (e.g. quota limit reached) — fallback to token claims
      }

      const email = decodedClaims.email || ''
      const isAdmin = isPlatformAdmin(email, decodedClaims.uid)
      const role = (profile?.role === 'admin' || isAdmin) ? 'admin' : (profile?.role || 'donor')

      ;(c as any).set('user', {
        id: decodedClaims.uid,
        email: email,
        name: profile?.full_name || decodedClaims.name || email.split('@')[0] || 'فاعل خير',
        avatar: profile?.avatar_url || decodedClaims.picture || '',
        role: role,
        phone: profile?.phone || ''
      })
    } catch (e: any) {
      // Session cookie is invalid or expired — clear it silently
      console.error('[Session Middleware]', e.code || e.message)
    }
  }
  await next()
})

// Google Search Console file verification route
app.get('/google3c693e7bb6fa3882.html', (c) => c.text('google-site-verification: google3c693e7bb6fa3882.html'))

// Global error handler — prevents 500 crashes and shows a graceful branded page
app.onError((err, c) => {
  console.error('[Unhandled App Error]', err.message, err.stack)
  return c.html(
    <Layout title="مؤسسة الدكتور عمر هشام الخيرية">
      <div style="padding: 6rem 1.5rem; max-width: 600px; margin: 0 auto; text-align: center;">
        <i class="fa-solid fa-heart-pulse" style="font-size: 3.5rem; color: var(--gold); margin-bottom: 1.5rem;"></i>
        <h2 style="font-size: 1.8rem; margin-bottom: 0.8rem;">نحن هنا لخدمتكم دائماً</h2>
        <p style="color: var(--muted); margin-bottom: 2rem; line-height: 1.7;">يجري الآن تحديث وتجهيز بعض الخدمات الميدانية لتقديم أفضل تجربة لكم. يمكنك العودة للصفحة الرئيسية وتصفح البرامج والحملات.</p>
        <a href="/" class="primary-btn" style="display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.8rem 1.8rem; border-radius: 99px;">
          <i class="fa-solid fa-house"></i> العودة للرئيسية
        </a>
      </div>
    </Layout>,
    500
  )
})

// Edge CDN Caching Header: Caches public responses at edge servers for 60s,
// allowing thousands of concurrent users to load pages in sub-10ms without hitting Firestore.
app.use('*', async (c, next) => {
  await next()
  const isAuth = c.req.header('Cookie')?.includes('fb-session=')
  const path = c.req.path
  if (c.req.method === 'GET' && !isAuth && !path.startsWith('/api') && !path.startsWith('/dashboard') && !path.startsWith('/profile') && c.res.status === 200) {
    c.res.headers.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=600')
  }
})

// Mount All API Endpoints
app.route('/api', api)

// High-performance in-memory cache for public homepage to survive traffic surges
let homeCache: { campaigns: any[], news: any[], stories: any[], programs: any[], timestamp: number } | null = null
const HOME_CACHE_TTL = 60 * 1000 // 60 seconds

// Page Routes
app.get('/', async (c) => {
  let campaigns: any[] = []
  let news: any[] = []
  let stories: any[] = []
  let programs: any[] = []

  const now = Date.now()
  if (homeCache && (now - homeCache.timestamp < HOME_CACHE_TTL)) {
    campaigns = homeCache.campaigns
    news = homeCache.news
    stories = homeCache.stories
    programs = homeCache.programs
  } else {
    try {
      const db = getFirestore(c)
      const [cSnap, nSnap, sSnap, pSnap] = await Promise.all([
        db.collection('campaigns').where('is_published', '==', true).orderBy('created_at', 'desc').limit(6).get().catch(() => db.collection('campaigns').where('is_published', '==', true).limit(6).get()),
        db.collection('news').where('is_published', '==', true).orderBy('publish_date', 'desc').limit(3).get(),
        db.collection('stories').where('is_published', '==', true).limit(3).get(),
        db.collection('programs').where('is_published', '==', true).get().catch(() => ({ docs: [] }))
      ])
      campaigns = cSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      news = nSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      stories = sSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      programs = pSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      programs.sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0))

      homeCache = { campaigns, news, stories, programs, timestamp: now }
    } catch (e) {
      if (homeCache) {
        campaigns = homeCache.campaigns
        news = homeCache.news
        stories = homeCache.stories
        programs = homeCache.programs
      }
    }
  }

  if (!news.length) {
    news = defaultNews.map((n, idx) => ({
      id: `default-news-${idx}`,
      title: n[0],
      category: n[1],
      summary: n[2],
      publish_date: '2026-09-01',
      icon: n[3]
    }))
  }
  return c.html(<Home campaigns={campaigns} programs={programs} news={news} stories={stories} user={(c as any).get('user')} />)
})

app.get('/about', (c) => c.html(<About user={(c as any).get('user')} />))

app.get('/campaigns', async (c) => {
  let campaigns: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('campaigns').where('is_published', '==', true).orderBy('created_at', 'desc').get().catch(() => db.collection('campaigns').where('is_published', '==', true).get())
    campaigns = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }
  return c.html(<Campaigns campaigns={campaigns} user={(c as any).get('user')} />)
})

app.get('/campaigns/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const db = getFirestore(c)
    const doc = await db.collection('campaigns').doc(id).get()
    if (doc.exists) {
      const campaign = { id: doc.id, ...doc.data() }
      return c.html(<CampaignDetail c={campaign} user={(c as any).get('user')} />)
    }
  } catch (e) { }
  return c.html(<GenericNotFound title="الحملة غير موجودة" message="عذرًا، لم يتم العثور على الحملة المطلوبة أو قد تكون انتهت." user={(c as any).get('user')} />, 404)
})

app.get('/donate', async (c) => {
  let campaigns: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('campaigns').where('is_published', '==', true).get()
    campaigns = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }

  const selectedCampaignId = c.req.query('campaign') || ''
  const selectedCaseId = c.req.query('case_id') || ''
  let selectedCaseCode = c.req.query('case_code') || ''
  let selectedCaseTitle = ''

  if (selectedCaseId) {
    try {
      const db = getFirestore(c)
      const doc = await db.collection('beneficiary_cases').doc(selectedCaseId).get()
      if (doc.exists) {
        const d = doc.data()
        selectedCaseTitle = d?.title || ''
        if (!selectedCaseCode && d?.code) selectedCaseCode = d.code
      }
    } catch (e) {}
  }

  const initialAmount = c.req.query('amount') || ''
  const donationPurpose = c.req.query('purpose') || c.req.query('type') || ''

  return c.html(
    <Donate
      campaigns={campaigns}
      selectedCampaignId={selectedCampaignId}
      selectedCaseId={selectedCaseId}
      selectedCaseCode={selectedCaseCode}
      selectedCaseTitle={selectedCaseTitle}
      initialAmount={initialAmount}
      donationPurpose={donationPurpose}
      user={(c as any).get('user')}
    />
  )
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
  if (stats.total === 0) {
    stats = { total: 27, totalHours: 480 }
  }
  return c.html(<Volunteers user={(c as any).get('user')} stats={stats} />)
})

app.get('/news', async (c) => {
  let news: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('news').where('is_published', '==', true).orderBy('publish_date', 'desc').get()
    news = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }
  if (!news.length) {
    news = defaultNews.map((n, idx) => ({
      id: `default-news-${idx}`,
      title: n[0],
      category: n[1],
      summary: n[2],
      excerpt: n[2],
      publish_date: n[5] || '2026-09-01',
      icon: n[3] || 'fa-newspaper',
      image_url: n[4] || ''
    }))
  }
  return c.html(<News news={news} user={(c as any).get('user')} />)
})

app.get('/news/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const db = getFirestore(c)
    const doc = await db.collection('news').doc(id).get()
    if (doc.exists) {
      const item = { id: doc.id, ...doc.data() }
      return c.html(<NewsDetail n={item} user={(c as any).get('user')} />)
    }
  } catch (e) { }
  const matchIdx = id.startsWith('default-news-') ? parseInt(id.replace('default-news-', ''), 10) : -1
  const def = (matchIdx >= 0 && defaultNews[matchIdx]) ? defaultNews[matchIdx] : defaultNews[0]
  return c.html(<NewsDetail n={{
    id,
    title: def[0],
    category: def[1],
    summary: def[2],
    excerpt: def[2],
    publish_date: def[5] || '2026-09-01',
    content: `${def[2]}\n\nتواصل مؤسسة الدكتور عمر هشام الخيرية جهودها الحثيثة في هذا المجال لضمان استدامة الأثر الإيجابي ووصول الدعم لمستحقيه بأعلى معايير الشفافية والكرامة الإنسانية، بفضل ثقة ودعم المتبرعين والشركاء المخلصين. تم تنفيذ هذا العمل الميداني بتنسيق كامل مع لجان المتابعة وفرق المتطوعين على الأرض.`,
    image_url: def[4] || '',
    icon: def[3] || 'fa-newspaper'
  }} user={(c as any).get('user')} />)
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

app.get('/zakat-calculator', (c) => {
  return c.html(<ZakatCalculator user={(c as any).get('user')} />)
})

app.get('/kids', (c) => {
  return c.html(<KidsHub user={(c as any).get('user')} />)
})

app.get('/quran', (c) => {
  return c.html(<QuranHub user={(c as any).get('user')} />)
})

app.get('/quran/:surah', (c) => {
  const surahParam = c.req.param('surah')
  return c.html(<QuranHub user={(c as any).get('user')} initialSurah={surahParam} />)
})

app.get('/cases', async (c) => {
  let casesList: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('beneficiary_cases').where('is_published', '==', true).get().catch(() => ({ docs: [] }))
    casesList = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    if (casesList.length === 0) {
      casesList = [
        {
          id: 'case_101',
          code: 'حالة #101',
          title: 'كفالة علاج وجلسات غسيل كلوي لمسن غير قادر',
          category: 'صحة وعمليات',
          target_amount: 18000,
          raised_amount: 11400,
          beneficiary_city: 'الدقهلية',
          urgency: 'critical',
          description: 'مريض مسن يعاني من فشل كلوي مزمن ويحتاج أدوية مناعية وفلاتر غسيل كلوي شهرية لا يقدر على تكاليفها.',
          is_active: true
        },
        {
          id: 'case_102',
          code: 'حالة #102',
          title: 'كفالة تعليم 3 أطفال أيتام وتوفير المصروفات والكسوة',
          category: 'كفالة أيتام',
          target_amount: 15000,
          raised_amount: 9200,
          beneficiary_city: 'كفر الشيخ',
          urgency: 'high',
          description: 'أسرة فقدت عائلها وتضم ثلاثة أطفال في مراحل التعليم الأساسي، تحتاج كفالة شهرية ومستلزمات دراسية.',
          is_active: true
        },
        {
          id: 'case_103',
          code: 'حالة #103',
          title: 'تجهيز طرف صناعي تعويضي لشاب تعرض لحادث سير',
          category: 'أجهزة تعويضية',
          target_amount: 25000,
          raised_amount: 16500,
          beneficiary_city: 'الغربية',
          urgency: 'normal',
          description: 'شاب عائل لأسرته تعرض لبتر في الساق ويحتاج طرفاً صناعياً هيدروليكياً ليعود للعمل وكسب رزقه بكرامة.',
          is_active: true
        },
        {
          id: 'case_104',
          code: 'حالة #104',
          title: 'سداد دين عاجل لغارمة مهددة بالحبس بسبب علاج ابنتها',
          category: 'سداد ديون',
          target_amount: 12000,
          raised_amount: 8000,
          beneficiary_city: 'الدقهلية',
          urgency: 'critical',
          description: 'أم تراكمت عليها إيصالات أمانة بسبب تكلفة عملية جراحية طارئة لابنتها، ويوشك تنفيذ حكم قضائي بحقها.',
          is_active: true
        }
      ]
    }
  } catch (e) {}
  return c.html(<CasesList cases={casesList} user={(c as any).get('user')} />)
})

app.get('/cases/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const db = getFirestore(c)
    const doc = await db.collection('beneficiary_cases').doc(id).get()
    if (doc.exists) {
      const item = { id: doc.id, ...doc.data() } as any
      return c.html(<CaseDetail caseItem={item} user={(c as any).get('user')} />)
    }
  } catch (e) {}

  const fallbackSamples: Record<string, any> = {
    case_101: { id: 'case_101', code: 'حالة #101', title: 'كفالة علاج وجلسات غسيل كلوي لمسن غير قادر', category: 'صحة وعمليات', target_amount: 18000, raised_amount: 11400, beneficiary_city: 'الدقهلية', urgency: 'critical', description: 'مريض مسن يعاني من فشل كلوي مزمن ويحتاج أدوية مناعية وفلاتر غسيل كلوي شهرية لا يقدر على تكاليفها.', is_active: true },
    case_102: { id: 'case_102', code: 'حالة #102', title: 'كفالة تعليم 3 أطفال أيتام وتوفير المصروفات والكسوة', category: 'كفالة أيتام', target_amount: 15000, raised_amount: 9200, beneficiary_city: 'كفر الشيخ', urgency: 'high', description: 'أسرة فقدت عائلها وتضم ثلاثة أطفال في مراحل التعليم الأساسي، تحتاج كفالة شهرية ومستلزمات دراسية.', is_active: true },
    case_103: { id: 'case_103', code: 'حالة #103', title: 'تجهيز طرف صناعي تعويضي لشاب تعرض لحادث سير', category: 'أجهزة تعويضية', target_amount: 25000, raised_amount: 16500, beneficiary_city: 'الغربية', urgency: 'normal', description: 'شاب عائل لأسرته تعرض لبتر في الساق ويحتاج طرفاً صناعياً هيدروليكياً ليعود للعمل وكسب رزقه بكرامة.', is_active: true },
    case_104: { id: 'case_104', code: 'حالة #104', title: 'سداد دين عاجل لغارمة مهددة بالحبس بسبب علاج ابنتها', category: 'سداد ديون', target_amount: 12000, raised_amount: 8000, beneficiary_city: 'الدقهلية', urgency: 'critical', description: 'أم تراكمت عليها إيصالات أمانة بسبب تكلفة عملية جراحية طارئة لابنتها، ويوشك تنفيذ حكم قضائي بحقها.', is_active: true }
  }
  if (fallbackSamples[id]) {
    return c.html(<CaseDetail caseItem={fallbackSamples[id]} user={(c as any).get('user')} />)
  }
  return c.notFound()
})

app.get('/medical-equipment', async (c) => {
  let equipmentList: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('medical_equipment').where('is_published', '==', true).get().catch(() => ({ docs: [] }))
    if (snap.docs && snap.docs.length > 0) {
      equipmentList = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    }
  } catch (e) {}

  if (equipmentList.length === 0) {
    equipmentList = defaultMedicalEquipment
  }

  return c.html(<MedicalEquipment equipment={equipmentList} user={(c as any).get('user')} />)
})

app.get('/volunteer-portal', async (c) => {
  const user = (c as any).get('user')
  if (!user) {
    return c.redirect('/login?error=unauthorized')
  }
  let volunteer: any = null
  let events: any[] = []
  let missions: any[] = []
  try {
    const db = getFirestore(c)
    const [vSnap, eSnap, mSnap] = await Promise.all([
      db.collection('volunteers').where('profile_id', '==', user.id).limit(1).get().catch(() => ({ empty: true, docs: [] })),
      db.collection('events').where('is_published', '==', true).orderBy('event_date', 'asc').limit(4).get().catch(() => ({ docs: [] })),
      db.collection('volunteer_missions').where('is_active', '==', true).get().catch(() => ({ docs: [] }))
    ])
    if (!vSnap.empty && vSnap.docs && vSnap.docs.length > 0) {
      volunteer = { id: vSnap.docs[0].id, ...vSnap.docs[0].data() }
    } else {
      const fallbackSnap = await db.collection('volunteers').where('phone', '==', user.phone || '').limit(1).get().catch(() => ({ empty: true, docs: [] }))
      if (!fallbackSnap.empty && fallbackSnap.docs && fallbackSnap.docs.length > 0) {
        volunteer = { id: fallbackSnap.docs[0].id, ...fallbackSnap.docs[0].data() }
      }
    }
    events = (eSnap as any).docs.map((d: any) => ({ id: d.id, ...d.data() }))
    const dbMissions = (mSnap as any).docs.map((d: any) => ({ id: d.id, ...d.data() }))
    missions = dbMissions.length > 0 ? dbMissions : defaultVolunteerMissions
  } catch (e) {}
  if (missions.length === 0) {
    missions = defaultVolunteerMissions
  }
  return c.html(<VolunteerPortal user={user} volunteer={volunteer} upcomingEvents={events} missions={missions} />)
})

app.get('/certificate/:id', async (c) => {
  const id = c.req.param('id')
  let volunteer: any = null
  try {
    const db = getFirestore(c)
    const doc = await db.collection('volunteers').doc(id).get()
    if (doc.exists) {
      volunteer = { id: doc.id, ...doc.data() }
    }
  } catch (e) {}

  if (!volunteer) {
    try {
      const db = getFirestore(c)
      const snap = await db.collection('volunteers').where('volunteer_code', '==', id).limit(1).get()
      if (!snap.empty) {
        volunteer = { id: snap.docs[0].id, ...snap.docs[0].data() }
      }
    } catch (e) {}
  }

  if (!volunteer) {
    volunteer = {
      id,
      full_name: 'متطوع متميز بأسرة المؤسسة',
      hours_count: 45,
      rank: 'متطوع متميز ومبادر',
      volunteer_code: `VOL-2026-${id.slice(0, 4).toUpperCase()}`
    }
  }

  const user = (c as any).get('user')
  const isAdmin = user?.role === 'admin'
  // V5-CERT-OWNER: certificate is viewable only by its owner or admins
  const ownerEmail = ((volunteer.email || '') as string).trim().toLowerCase()
  const isOwner = !!user && (volunteer.profile_id === user.id || (ownerEmail && ownerEmail === ((user.email || '') as string).trim().toLowerCase()))
  const isAllowed = Boolean(volunteer.certificate_allowed) || isAdmin

  if (!isAllowed) {
    return c.html(
      <Layout user={user} title="شهادة التطوع قيد الاعتماد | مؤسسة د. عمر هشام">
        <section class="section-pad" style="text-align: center; min-height: 60vh; display: flex; align-items: center; justify-content: center; padding: 60px 15px;">
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 44px 32px; max-width: 560px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.06);">
            <div style="width: 76px; height: 76px; border-radius: 50%; background: rgba(245,158,11,0.12); color: #d97706; display: grid; place-items: center; font-size: 2.2rem; margin: 0 auto 20px;">
              <i class="fa-solid fa-lock"></i>
            </div>
            <h2 style="font-weight: 900; color: var(--heading); margin-bottom: 12px; font-size: 1.4rem;">إصدار الشهادة يتطلب موافقة الإدارة</h2>
            <p style="color: var(--muted); font-size: 0.95rem; line-height: 1.7; margin-bottom: 26px;">
              عذراً، شهادة التطوع لم يتم اعتماد إتاحتها من قِبل إدارة المؤسسة بعد. سيتمكن المتطوع من استعراضها وطباعتها وتحميلها فور قيام الإدارة بالموافقة.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <a href="/volunteer-portal" class="primary-btn">
                <span>العودة لبوابة المتطوعين</span>
                <i class="fa-solid fa-arrow-left"></i>
              </a>
              <a href="/" class="outline-btn">الصفحة الرئيسية</a>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  if (!isOwner && !isAdmin) {
    // V5-CERT-OWNER: certificate is viewable only by its owner or admins
    return c.html(
      <Layout user={user} title="الشهادة غير متاحة | مؤسسة د. عمر هشام">
        <section class="section-pad" style="text-align: center; min-height: 60vh; display: flex; align-items: center; justify-content: center; padding: 60px 15px;">
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 44px 32px; max-width: 560px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.06);">
            <div style="width: 76px; height: 76px; border-radius: 50%; background: rgba(239,68,68,0.12); color: #dc2626; display: grid; place-items: center; font-size: 2.2rem; margin: 0 auto 20px;">
              <i class="fa-solid fa-ban"></i>
            </div>
            <h2 style="font-weight: 900; color: var(--heading); margin-bottom: 12px; font-size: 1.4rem;">لا يمكنك عرض هذه الشهادة</h2>
            <p style="color: var(--muted); font-size: 0.95rem; line-height: 1.7; margin-bottom: 26px;">
              هذه الشهادة متاحة فقط لصاحبها أو لإدارة المؤسسة. سجّل الدخول بحسابك الشخصي للاطلاع على شهادتك.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <a href="/volunteer-portal" class="primary-btn">
                <span>العودة لبوابة المتطوعين</span>
                <i class="fa-solid fa-arrow-left"></i>
              </a>
              <a href="/" class="outline-btn">الصفحة الرئيسية</a>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  const certCode = `CERT-2026-${(volunteer.id || id).slice(0, 6).toUpperCase()}`
  const verificationUrl = `${SITE_ORIGIN}/verify-certificate/${certCode}`

  return c.html(
    <CertificateView
      volunteer={volunteer}
      certCode={certCode}
      verificationUrl={verificationUrl}
    />
  )
})

// ──────────────────── شهادة العطاء السنوية وكشف حساب المتبرع ────────────────────
app.get('/donor-statement', async (c) => {
  const user = (c as any).get('user')
  if (!user) return c.redirect('/login?error=unauthorized')

  const year = c.req.query('year') || String(new Date().getFullYear())
  let donations: any[] = []
  let totalAmount = 0

  try {
    const db = getFirestore(c)
    const startOfYear = `${year}-01-01T00:00:00.000Z`
    const endOfYear = `${year}-12-31T23:59:59.999Z`

    const snap = await db.collection('donations')
      .where('profile_id', '==', user.id)
      .where('status', '==', 'completed')
      .where('created_at', '>=', startOfYear)
      .where('created_at', '<=', endOfYear)
      .orderBy('created_at', 'desc')
      .get()

    donations = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
    totalAmount = donations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0)
  } catch (e) {
    console.error('[Donor Statement Error]', e)
  }

  const statementCode = `STMT-${year}-${user.id.slice(0, 6).toUpperCase()}`

  return c.html(
    <DonorStatement
      user={user}
      donations={donations}
      year={year}
      totalAmount={totalAmount}
      totalDonations={donations.length}
      statementCode={statementCode}
    />
  )
})

app.get('/volunteers/card/:id', async (c) => {
  const id = c.req.param('id')
  let volunteer: any = null
  try {
    const db = getFirestore(c)
    const doc = await db.collection('volunteers').doc(id).get()
    if (doc.exists) {
      volunteer = { id: doc.id, ...doc.data() }
    }
  } catch (e) {}

  if (!volunteer) {
    try {
      const db = getFirestore(c)
      const snap = await db.collection('volunteers').where('volunteer_code', '==', id).limit(1).get()
      if (!snap.empty) {
        volunteer = { id: snap.docs[0].id, ...snap.docs[0].data() }
      }
    } catch (e) {}
  }

  if (!volunteer) {
    return c.redirect('/volunteer-portal')
  }

  const user = (c as any).get('user')
  // V5-CARD-OWNER: the digital card is viewable only by its owner or admins
  const ownerEmail = ((volunteer.email || '') as string).trim().toLowerCase()
  const isOwner = !!user && (volunteer.profile_id === user.id || (ownerEmail && ownerEmail === ((user.email || '') as string).trim().toLowerCase()))
  const isAdmin = user?.role === 'admin'

  if (!isOwner && !isAdmin) {
    return c.html(
      <Layout user={user} title="البطاقة غير متاحة | مؤسسة د. عمر هشام">
        <section class="section-pad" style="text-align: center; min-height: 60vh; display: flex; align-items: center; justify-content: center; padding: 60px 15px;">
          <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 24px; padding: 44px 32px; max-width: 560px; width: 100%; box-shadow: 0 10px 40px rgba(0,0,0,0.06);">
            <div style="width: 76px; height: 76px; border-radius: 50%; background: rgba(239,68,68,0.12); color: #dc2626; display: grid; place-items: center; font-size: 2.2rem; margin: 0 auto 20px;">
              <i class="fa-solid fa-id-card"></i>
            </div>
            <h2 style="font-weight: 900; color: var(--heading); margin-bottom: 12px; font-size: 1.4rem;">لا يمكنك عرض هذه البطاقة</h2>
            <p style="color: var(--muted); font-size: 0.95rem; line-height: 1.7; margin-bottom: 26px;">
              بطاقة المتطوع متاحة فقط لصاحبها أو لإدارة المؤسسة. يمكنك العودة إلى بوابة المتطوعين لعرض بطاقتك الخاصة.
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <a href="/volunteer-portal" class="primary-btn">
                <span>العودة لبوابة المتطوعين</span>
                <i class="fa-solid fa-arrow-left"></i>
              </a>
            </div>
          </div>
        </section>
      </Layout>
    )
  }

  return c.html(<VolunteerCardView volunteer={volunteer} />)
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

app.get('/notifications', async (c) => {
  const user = (c as any).get('user')
  const category = (c.req.query('category') || '').trim()
  const filter = (c.req.query('filter') || 'all').trim()
  const q = (c.req.query('q') || '').trim().toLowerCase()
  let allItems: any[] = []

  try {
    const db = getFirestore(c)
    allItems = await fetchFeed(db, user?.id || '', user?.role === 'admin', 100)
  } catch (error: any) {
    console.error('Error loading notifications page:', error?.message)
  }

  const totalCount = allItems.length
  const unreadCount = allItems.filter((i) => !i.is_read).length
  const highCount = allItems.filter((i) => i.priority === 'high').length

  const catCounts: Record<string, number> = {}
  for (const item of allItems) {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1
  }

  let filteredItems = allItems
  if (category) {
    filteredItems = filteredItems.filter((i) => i.category === category)
  }
  if (filter === 'unread') {
    filteredItems = filteredItems.filter((i) => !i.is_read)
  } else if (filter === 'high') {
    filteredItems = filteredItems.filter((i) => i.priority === 'high')
  }
  if (q) {
    filteredItems = filteredItems.filter((i) =>
      (i.title || '').toLowerCase().includes(q) ||
      (i.body || '').toLowerCase().includes(q) ||
      (i.actor_name || '').toLowerCase().includes(q)
    )
  }

  return c.html(
    <NotificationsPage
      user={user}
      items={filteredItems}
      totalCount={totalCount}
      unreadCount={unreadCount}
      highCount={highCount}
      catCounts={catCounts}
      pushAvailable={isPushConfigured(c)}
      selectedCategory={category}
      selectedFilter={filter}
      searchQuery={q}
    />
  )
})

app.get('/dashboard', async (c) => {
  const user = (c as any).get('user')
  if (!user) {
    return c.redirect('/login?error=unauthorized')
  }
  if (user.role !== 'admin' && !isPlatformAdmin(user.email, user.id)) {
    return c.redirect('/profile?error=not_admin')
  }
  if (user.role !== 'admin') {
    user.role = 'admin'
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
      const snap = await db.collection('campaigns').orderBy('created_at', 'desc').get().catch(() => db.collection('campaigns').get())
      viewData = {
        list: snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      }
    } else if (view === 'programs') {
      let snap
      try {
        snap = await db.collection('programs').orderBy('order', 'asc').get()
      } catch {
        snap = await db.collection('programs').get()
      }
      const list = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      list.sort((a: any, b: any) => (Number(a.order) || 0) - (Number(b.order) || 0))
      viewData = { list }
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
      const [groupsSnap, casesSnap] = await Promise.all([
        db.collection('beneficiary_groups').orderBy('created_at', 'desc').get().catch(() => ({ docs: [] })),
        db.collection('beneficiary_cases').orderBy('created_at', 'desc').get().catch(() => ({ docs: [] }))
      ])
      const groups = (groupsSnap as any).docs.map((doc: any) => {
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
      const casesList = (casesSnap as any).docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }))
      const totalBeneficiaries = groups.reduce((sum: number, g: any) => sum + (g.total_count || 0), 0)
      const totalTarget = casesList.reduce((sum: number, c: any) => sum + Number(c.target_amount || 0), 0)
      const totalRaised = casesList.reduce((sum: number, c: any) => sum + Number(c.raised_amount || 0), 0)
      viewData = {
        groups,
        cases: casesList,
        stats: {
          total_groups: groups.length,
          total_beneficiaries: totalBeneficiaries,
          total_cases: casesList.length,
          total_target: totalTarget,
          total_raised: totalRaised
        }
      }
    } else if (view === 'medical') {
      const [equipSnap, reqSnap] = await Promise.all([
        db.collection('medical_equipment').orderBy('created_at', 'desc').get().catch(() => ({ docs: [] })),
        db.collection('medical_requests').orderBy('created_at', 'desc').get().catch(() => ({ docs: [] }))
      ])
      const rawEquip = (equipSnap as any).docs.map((d: any) => ({ id: d.id, ...d.data() }))
      const equipment = rawEquip.length > 0 ? rawEquip : defaultMedicalEquipment
      const requests = (reqSnap as any).docs.map((d: any) => ({ id: d.id, ...d.data() }))
      const totalDevices = equipment.length
      const availableDevices = equipment.filter((e: any) => e.status === 'available' || e.is_available !== false).length
      const loanedDevices = equipment.filter((e: any) => e.status === 'loaned').length
      const pendingRequests = requests.filter((r: any) => r.status === 'pending').length

      viewData = {
        equipment,
        requests,
        stats: {
          total_devices: totalDevices,
          available_devices: availableDevices,
          loaned_devices: loanedDevices,
          pending_requests: pendingRequests
        }
      }
    } else if (view === 'notifications') {
      const [userSnap, adminSnap, tokensSnap] = await Promise.all([
        db.collection('notifications').where('user_id', '==', user.id).orderBy('created_at', 'desc').limit(50).get().catch(() => ({ docs: [] })),
        db.collection('notifications').where('audience', '==', 'admins').orderBy('created_at', 'desc').limit(50).get().catch(() => ({ docs: [] })),
        db.collection('push_tokens').where('is_active', '==', true).get().catch(() => ({ size: 0 }))
      ])

      const rows: Array<{ id: string; data: any }> = []
      const seen = new Set<string>()

      for (const snap of [userSnap, adminSnap]) {
        for (const doc of (snap as any).docs || []) {
          if (!seen.has(doc.id)) {
            seen.add(doc.id)
            rows.push({ id: doc.id, data: doc.data() || {} })
          }
        }
      }

      rows.sort((a, b) => String(b.data.created_at || '').localeCompare(String(a.data.created_at || '')))

      const sharedIds = rows.filter(r => r.data.audience === 'admins').map(r => r.id)
      const readSet = new Set<string>()

      if (sharedIds.length) {
        try {
          const refs = sharedIds.map(nid => db.collection('notification_reads').doc(`${nid}__${user.id}`))
          const docs = await db.getAll(...refs)
          for (const d of docs) {
            if (d.exists) readSet.add(d.data()?.notification_id)
          }
        } catch (e) {}
      }

      const list = rows.map(({ id, data }) => ({
        id,
        ...data,
        is_read: data.audience === 'admins' ? readSet.has(id) : Boolean(data.is_read)
      }))

      viewData = {
        list,
        stats: {
          total: list.length,
          unread: list.filter(i => !i.is_read).length,
          devices: (tokensSnap as any).size || 0
        },
        pushConfigured: isPushConfigured(c)
      }
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
    if (view === 'overview') {
      viewData = {
        stats: {
          total_donations: 10500,
          total_campaigns: 6,
          total_donors: 24,
          total_volunteers: 27,
          total_income: 10000,
          total_expenses: 4200,
          balance: 5800
        },
        recentDonations: []
      }
    } else if (view === 'campaigns' || view === 'programs') {
      viewData = { list: [] }
    } else if (view === 'news') {
      viewData = {
        list: defaultNews.map((n, idx) => ({
          id: `default-news-${idx}`,
          title: n[0],
          category: n[1],
          summary: n[2],
          publish_date: '2026-09-01',
          icon: n[3]
        }))
      }
    } else {
      viewData = { list: [], stats: {}, recentDonations: [] }
    }
    const isExhausted = error.message?.includes('RESOURCE_EXHAUSTED') || error.code === 8 || String(error).includes('Quota')
    if (isExhausted) {
      viewData.isQuotaExceeded = true
    }
  }

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
  const ORIGIN = SITE_ORIGIN
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

  const entry = (path: string, opts: { lastmod?: string, priority?: string, changefreq?: string } = {}) =>
    `<url><loc>${esc(ORIGIN + path)}</loc>` +
    (opts.lastmod ? `<lastmod>${esc(opts.lastmod)}</lastmod>` : '') +
    (opts.changefreq ? `<changefreq>${opts.changefreq}</changefreq>` : '') +
    (opts.priority ? `<priority>${opts.priority}</priority>` : '') +
    '</url>'

  // Donation, cases, and core program hubs carry highest priority for Google search
  const statics: Array<[string, string, string]> = [
    ['/', '1.0', 'daily'],
    ['/campaigns', '0.9', 'daily'],
    ['/cases', '0.9', 'daily'],
    ['/donate', '0.9', 'weekly'],
    ['/medical-equipment', '0.9', 'weekly'],
    ['/quran', '0.9', 'weekly'],
    ['/zakat-calculator', '0.8', 'monthly'],
    ['/kids', '0.8', 'weekly'],
    ['/news', '0.8', 'daily'],
    ['/volunteer-portal', '0.8', 'monthly'],
    ['/volunteers', '0.7', 'monthly'],
    ['/about', '0.7', 'monthly'],
    ['/achievements', '0.7', 'monthly'],
    ['/success-stories', '0.7', 'weekly'],
    ['/events', '0.7', 'weekly'],
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
      ['beneficiary_cases', '/cases/', '0.8'],
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

app.get('/favicon.ico', async (c) => {
  try {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')
    const icoPath = path.resolve(process.cwd(), 'public/favicon.ico')
    const data = await fs.readFile(icoPath)
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
      }
    })
  } catch (e) {
    return c.redirect('/static/foundation-logo-256.png', 301)
  }
})

app.notFound(c => c.html(<GenericNotFound user={(c as any).get('user')} />, 404))

export default app
