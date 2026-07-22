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

import { api } from './api'

const app = new Hono()

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
app.get('/volunteers', (c) => c.html(<Volunteers user={(c as any).get('user')} />))

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
app.get('/gallery', (c) => c.html(<Gallery user={(c as any).get('user')} />))

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
      const [cSnap, dSnap, vSnap, recentDonationsSnap] = await Promise.all([
        db.collection('campaigns').where('is_published', '==', true).get(),
        db.collection('donations').where('status', '==', 'completed').get(),
        db.collection('volunteers').get(),
        db.collection('donations').orderBy('created_at', 'desc').limit(5).get()
      ])

      const totalDonations = dSnap.docs.reduce((sum: number, doc: any) => sum + Number(doc.data().amount || 0), 0)
      const uniqueDonors = new Set(dSnap.docs.map((doc: any) => doc.data().donor_email || doc.data().donor_phone)).size

      viewData = {
        stats: {
          total_donations: totalDonations,
          total_campaigns: cSnap.size,
          total_donors: uniqueDonors,
          total_volunteers: vSnap.size
        },
        recentDonations: recentDonationsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
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
    }
  } catch (error: any) {
    console.error(`Error loading dashboard view ${view}:`, error.message)
    viewData = { list: [], stats: {}, recentDonations: [] }
  }

  return c.html(<Dashboard view={view} data={viewData} user={user} />)
})

app.get('/sitemap.xml', c => c.body(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['', 'about', 'campaigns', 'achievements', 'success-stories', 'events', 'gallery', 'donate', 'volunteers', 'careers', 'news', 'transparency', 'faq', 'contact'].map(x => `<url><loc>https://omarhesham.org/${x}</loc></url>`).join('')}</urlset>`, 200, { 'Content-Type': 'application/xml' }))

app.notFound(c => c.html(<GenericNotFound user={(c as any).get('user')} />, 404))

export default app
