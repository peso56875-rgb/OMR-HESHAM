import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { api } from './api'
import { getSupabaseFromContext, getSupabaseAdminFromContext } from './lib/supabase'
import { page } from './layout'
import { home } from './pages/home'
import { about } from './pages/about'
import { campaignsPage } from './pages/campaigns'
import { achievementsPage } from './pages/achievements'
import { donatePage } from './pages/donate'
import { volunteersPage } from './pages/volunteers'
import { galleryPage } from './pages/gallery'
import { newsPage } from './pages/news'
import { eventsPage } from './pages/events'
import { contactPage } from './pages/contact'
import { faqPage } from './pages/faq'
import { storiesPage } from './pages/stories'
import { transparencyPage } from './pages/transparency'
import { careersPage } from './pages/careers'
import { campaignDetailPage, eventDetailPage, newsDetailPage } from './pages/details'
import { dashOverview } from './pages/dashboard/overview'
import { dashCampaigns } from './pages/dashboard/campaigns'
import { dashDonations } from './pages/dashboard/donations'
import { dashVolunteers } from './pages/dashboard/volunteers'
import { dashContacts } from './pages/dashboard/contacts'
import { dashNews } from './pages/dashboard/news'
import { dashEvents } from './pages/dashboard/events'
import { dashStories } from './pages/dashboard/stories'
import { dashJobs } from './pages/dashboard/jobs'
import { dashNewsletter } from './pages/dashboard/newsletter'
import { dashUsers } from './pages/dashboard/users'
import { loginPage } from './pages/auth'
import { profilePage } from './pages/profile'

const app = new Hono()

// Mount API routes
app.route('/api', api)

app.use('*', async (c, next) => {
  const token = getCookie(c, 'sb-access-token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      let role = 'user'
      try {
        const supabase = getSupabaseFromContext(c)
        const { data } = await supabase.from('profiles').select('role').eq('id', payload.sub).single()
        if (data?.role) role = data.role
      } catch(err) {}

      ;(c as any).set('user', {
        id: payload.sub,
        email: payload.email,
        name: payload.user_metadata?.full_name || payload.email,
        avatar: payload.user_metadata?.avatar_url,
        role
      })
    } catch(e) {}
  }
  await next()
})

import { Env } from './lib/supabase'

app.get('/api/config', (c) => {
  const env = c.env as Env;
  return c.json({
    supabaseUrl: env.SUPABASE_URL,
    supabaseKey: env.SUPABASE_KEY,
    user: (c as any).get('user') || null
  })
})


app.get('/', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const [
    { data: campaigns },
    { data: news },
    { data: stories },
    // Later we can add a stats query here
  ] = await Promise.all([
    supabase.from('campaigns').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('news').select('*').eq('is_published', true).order('publish_date', { ascending: false }).limit(3),
    supabase.from('stories').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3)
  ])

  return c.html(page({ user: (c as any).get('user'), title: 'الرئيسية', active: 'home', desc: 'مؤسسة الدكتور عمر هشام الخيرية — نزرع الأمل ونصنع حياةً كريمة عبر برامج الإغاثة والصحة والتعليم.' }, home({ campaigns, news, stories })))
})
app.get('/about', (c) => c.html(page({ user: (c as any).get('user'), title: 'من نحن', active: 'about' }, about())))
app.get('/campaigns', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data: campaigns } = await supabase.from('campaigns').select('*').eq('is_published', true).order('created_at', { ascending: false })
  return c.html(page({ user: (c as any).get('user'), title: 'الحملات', active: 'work' }, campaignsPage(campaigns || [])))
})
app.get('/campaigns/:id', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data, error } = await supabase.from('campaigns').select('*').eq('id', c.req.param('id')).eq('is_published', true).single()
  if (error || !data) return c.notFound()
  return c.html(page({
    user: (c as any).get('user'),
    title: data.title,
    active: 'work',
    desc: data.description || 'تفاصيل حملة من حملات مؤسسة الدكتور عمر هشام الخيرية',
    image: data.image_url
  }, campaignDetailPage(data)))
})
app.get('/achievements', (c) => c.html(page({ user: (c as any).get('user'), title: 'الإنجازات', active: 'work' }, achievementsPage())))
app.get('/success-stories', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data: stories } = await supabase.from('stories').select('*').eq('is_published', true).order('created_at', { ascending: false })
  return c.html(page({ user: (c as any).get('user'), title: 'قصص النجاح', active: 'work' }, storiesPage(stories || [])))
})
app.get('/events', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data: events } = await supabase.from('events').select('*').eq('is_published', true).order('event_date', { ascending: true })
  return c.html(page({ user: (c as any).get('user'), title: 'الفعاليات', active: 'work' }, eventsPage(events || [])))
})
app.get('/events/:id', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data, error } = await supabase.from('events').select('*').eq('id', c.req.param('id')).eq('is_published', true).single()
  if (error || !data) return c.notFound()
  return c.html(page({
    user: (c as any).get('user'),
    title: data.title,
    active: 'work',
    desc: data.description || 'تفاصيل فعالية من فعاليات مؤسسة الدكتور عمر هشام الخيرية',
    image: data.image_url
  }, eventDetailPage(data)))
})
app.get('/gallery', (c) => c.html(page({ user: (c as any).get('user'), title: 'معرض الصور', active: 'work' }, galleryPage())))
app.get('/donate', (c) => c.html(page({ user: (c as any).get('user'), title: 'تبرّع الآن', active: 'join' }, donatePage())))
app.get('/volunteers', (c) => c.html(page({ user: (c as any).get('user'), title: 'التطوّع', active: 'join' }, volunteersPage(c.req.query('success') === '1', c.req.query('error')))))

app.get('/careers', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data: jobs } = await supabase.from('jobs').select('*').eq('is_active', true).eq('is_published', true).order('created_at', { ascending: false })
  return c.html(page({ user: (c as any).get('user'), title: 'الوظائف', active: 'join' }, careersPage(jobs || [], c.req.query('success') === '1', c.req.query('error'))))
})


app.get('/news', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data: news } = await supabase.from('news').select('*').eq('is_published', true).order('publish_date', { ascending: false })
  return c.html(page({ user: (c as any).get('user'), title: 'المركز الإعلامي', active: 'news' }, newsPage(news || [])))
})
app.get('/news/:id', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data, error } = await supabase.from('news').select('*').eq('id', c.req.param('id')).eq('is_published', true).single()
  if (error || !data) return c.notFound()
  return c.html(page({
    user: (c as any).get('user'),
    title: data.title,
    active: 'news',
    desc: data.excerpt || data.content || 'خبر من أخبار مؤسسة الدكتور عمر هشام الخيرية',
    image: data.image_url
  }, newsDetailPage(data)))
})
app.get('/transparency', (c) => c.html(page({ user: (c as any).get('user'), title: 'الشفافية المالية', active: 'more' }, transparencyPage())))

app.get('/profile', async (c) => {
  const token = getCookie(c, 'sb-access-token')
  if (!token) return c.redirect('/login')

  const supabase = getSupabaseFromContext(c)
  const { data: { user } } = await supabase.auth.getUser(token)
  
  if (!user) return c.redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const [ { data: donations }, { data: volunteers } ] = await Promise.all([
    supabase.from('donations').select('*').eq('profile_id', user.id).order('created_at', { ascending: false }),
    supabase.from('volunteers').select('*').eq('profile_id', user.id).limit(1)
  ])

  const sessionUser = {
    ...profile,
    name: profile?.full_name,
    avatar: profile?.avatar_url,
    email: profile?.email
  }

  return c.html(page({ user: sessionUser, title: 'حسابي الشخصي' }, profilePage(sessionUser, donations || [], volunteers?.[0])))
})
app.get('/faq', (c) => c.html(page({ user: (c as any).get('user'), title: 'الأسئلة الشائعة', active: 'more' }, faqPage())))
app.get('/contact', (c) => c.html(page({ user: (c as any).get('user'), title: 'تواصل معنا', active: 'more' }, contactPage(c.req.query('success') === '1', c.req.query('error')))))



// Dashboard Protection Middleware
const dashboardGuard = async (c: any, next: any) => {
  const supabase = getSupabaseFromContext(c)
  const token = getCookie(c, 'sb-access-token')
  
  if (!token) {
    return c.redirect('/login?error=unauthorized')
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return c.redirect('/login?error=unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return c.redirect('/')
  }

  await next()
}
app.use('/dashboard', dashboardGuard)
app.use('/dashboard/*', dashboardGuard)

// Dashboard Routes
app.get('/dashboard', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  
  const [
    { count: cDonations },
    { count: cCampaigns },
    { count: cVolunteers },
    { count: cContacts },
    { count: cUnreadContacts },
    { count: cPendingVol },
    { count: cSubscribers },
    { count: cNews },
    { count: cEvents },
    { data: recentDonations },
    { data: allDonations },
  ] = await Promise.all([
    supabase.from('donations').select('*', { count: 'exact', head: true }),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }),
    supabase.from('volunteers').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
    supabase.from('volunteers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(7),
    supabase.from('donations').select('amount, payment_method, created_at'),
  ])

  // Calculate total donations amount
  const totalAmount = (allDonations || []).reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0)

  // Aggregate donations by month (last 12 months) for chart
  const monthlyData: number[] = new Array(12).fill(0)
  const now = new Date()
  const currentYear = now.getFullYear()
  ;(allDonations || []).forEach((d: any) => {
    const dt = new Date(d.created_at)
    if (dt.getFullYear() === currentYear) {
      monthlyData[dt.getMonth()] += Number(d.amount || 0)
    }
  })

  // Aggregate donations by payment method for pie chart
  const methodCounts: Record<string, number> = {}
  ;(allDonations || []).forEach((d: any) => {
    const m = d.payment_method || 'أخرى'
    methodCounts[m] = (methodCounts[m] || 0) + Number(d.amount || 0)
  })

  const stats = {
    total_donations: totalAmount,
    total_campaigns: cCampaigns || 0,
    total_donors: cDonations || 0,
    total_volunteers: cVolunteers || 0,
    total_contacts: cContacts || 0,
    unread_contacts: cUnreadContacts || 0,
    pending_volunteers: cPendingVol || 0,
    total_subscribers: cSubscribers || 0,
    total_news: cNews || 0,
    total_events: cEvents || 0,
    monthly_chart: monthlyData,
    method_chart: methodCounts,
  }
  return c.html(dashOverview(stats, recentDonations || []))
})

app.get('/dashboard/campaigns', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })
  return c.html(dashCampaigns(data || []))
})

app.get('/dashboard/donations', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const { data } = await supabase.from('donations').select('*').order('created_at', { ascending: false })
  return c.html(dashDonations(data || []))
})

app.get('/dashboard/volunteers', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const { data } = await supabase.from('volunteers').select('*').order('created_at', { ascending: false })
  return c.html(dashVolunteers(data || []))
})

app.get('/dashboard/contacts', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
  return c.html(dashContacts(data || []))
})

app.get('/dashboard/news', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false })
  return c.html(dashNews(data || []))
})

app.get('/dashboard/events', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false })
  return c.html(dashEvents(data || []))
})

app.get('/dashboard/stories', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false })
  return c.html(dashStories(data || []))
})

app.get('/dashboard/jobs', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const [ { data: jobs }, { data: apps } ] = await Promise.all([
    supabase.from('jobs').select('*').order('created_at', { ascending: false }),
    supabase.from('job_applications').select('*').order('created_at', { ascending: false })
  ])
  return c.html(dashJobs(jobs || [], apps || []))
})

app.get('/dashboard/newsletter', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false })
  return c.html(dashNewsletter(data || []))
})

app.get('/dashboard/users', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  return c.html(dashUsers(data || []))
})

// API: Change user role (admin only)
app.post('/api/users/:id/role', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const token = getCookie(c, 'sb-access-token')
  if (!token) return c.redirect('/login?error=unauthorized')

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return c.redirect('/login?error=unauthorized')

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') return c.redirect('/login?error=not_admin')

  const targetId = c.req.param('id')
  const body = await c.req.parseBody()
  const newRole = body.role as string

  if (!['admin', 'user'].includes(newRole)) {
    return c.redirect('/dashboard/users?error=invalid_role')
  }

  await supabase.from('profiles').update({ role: newRole }).eq('id', targetId)
  return c.redirect('/dashboard/users?success=1')
})

app.get('/login', (c) => c.html(loginPage()))

// 404
app.notFound((c) => c.html(page({ user: (c as any).get('user'), title: 'الصفحة غير موجودة' }, `
<section class="page-hero" style="min-height:70vh;display:grid;place-items:center">
  <div class="hero-bg-grid"></div><div class="hero-glow g1"></div><div class="hero-glow g3"></div>
  <div class="wrap center" style="position:relative;z-index:3">
    <div style="font-size:clamp(5rem,18vw,11rem);font-weight:900;line-height:1;background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;color:transparent">٤٠٤</div>
    <h1 class="h-xl" style="color:#fff;margin-top:1rem">الصفحة غير موجودة</h1>
    <p class="lead" style="color:rgba(255,255,255,.8);margin:1rem auto 2rem;max-width:480px">يبدو أن الصفحة التي تبحث عنها قد انتقلت أو لم تعد متوفرة.</p>
    <a href="/" class="btn btn-gold btn-lg magnetic"><i class="fas fa-house"></i> العودة للرئيسية</a>
  </div>
</section>`)))

app.get('/sitemap.xml', (c) => {
  c.header('Content-Type', 'application/xml')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url><loc>https://omarhesham.org/</loc><priority>1.0</priority></url>
   <url><loc>https://omarhesham.org/about</loc><priority>0.8</priority></url>
   <url><loc>https://omarhesham.org/campaigns</loc><priority>0.9</priority></url>
   <url><loc>https://omarhesham.org/achievements</loc><priority>0.7</priority></url>
   <url><loc>https://omarhesham.org/success-stories</loc><priority>0.8</priority></url>
   <url><loc>https://omarhesham.org/events</loc><priority>0.8</priority></url>
   <url><loc>https://omarhesham.org/gallery</loc><priority>0.6</priority></url>
   <url><loc>https://omarhesham.org/donate</loc><priority>0.9</priority></url>
   <url><loc>https://omarhesham.org/volunteers</loc><priority>0.8</priority></url>
   <url><loc>https://omarhesham.org/careers</loc><priority>0.7</priority></url>
   <url><loc>https://omarhesham.org/news</loc><priority>0.8</priority></url>
   <url><loc>https://omarhesham.org/transparency</loc><priority>0.7</priority></url>
   <url><loc>https://omarhesham.org/faq</loc><priority>0.5</priority></url>
   <url><loc>https://omarhesham.org/contact</loc><priority>0.7</priority></url>
</urlset>`
  return c.body(xml)
})

export default app
