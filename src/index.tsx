import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { api } from './api'
import { getSupabaseFromContext } from './lib/supabase'
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
import { dashOverview } from './pages/dashboard/overview'
import { dashCampaigns } from './pages/dashboard/campaigns'
import { dashDonations } from './pages/dashboard/donations'
import { dashVolunteers } from './pages/dashboard/volunteers'
import { dashContacts } from './pages/dashboard/contacts'
import { dashNews } from './pages/dashboard/news'
import { dashEvents } from './pages/dashboard/events'
import { dashStories } from './pages/dashboard/stories'
import { dashJobs } from './pages/dashboard/jobs'
import { dashUsers } from './pages/dashboard/users'
import { loginPage } from './pages/auth'

const app = new Hono()

// Mount API routes
app.route('/api', api)

app.get('/', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const [
    { data: campaigns },
    { data: news },
    { data: stories },
    // Later we can add a stats query here
  ] = await Promise.all([
    supabase.from('campaigns').select('*').order('created_at', { ascending: false }).limit(3),
    supabase.from('news').select('*').order('publish_date', { ascending: false }).limit(3),
    supabase.from('stories').select('*').order('created_at', { ascending: false }).limit(3)
  ])

  return c.html(page({ title: 'الرئيسية', active: 'home', desc: 'مؤسسة الدكتور عمر هشام الخيرية — نزرع الأمل ونصنع حياةً كريمة عبر برامج الإغاثة والصحة والتعليم.' }, home({ campaigns, news, stories })))
})
app.get('/about', (c) => c.html(page({ title: 'من نحن', active: 'about' }, about())))
app.get('/campaigns', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data: campaigns } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })
  return c.html(page({ title: 'الحملات', active: 'work' }, campaignsPage(campaigns || [])))
})
app.get('/achievements', (c) => c.html(page({ title: 'الإنجازات', active: 'work' }, achievementsPage())))
app.get('/success-stories', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data: stories } = await supabase.from('stories').select('*').order('created_at', { ascending: false })
  return c.html(page({ title: 'قصص النجاح', active: 'work' }, storiesPage(stories || [])))
})
app.get('/events', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data: events } = await supabase.from('events').select('*').order('event_date', { ascending: true })
  return c.html(page({ title: 'الفعاليات', active: 'work' }, eventsPage(events || [])))
})
app.get('/gallery', (c) => c.html(page({ title: 'معرض الصور', active: 'work' }, galleryPage())))
app.get('/donate', (c) => c.html(page({ title: 'تبرّع الآن', active: 'join' }, donatePage())))
app.get('/volunteers', (c) => c.html(page({ title: 'التطوّع', active: 'join' }, volunteersPage())))
app.get('/careers', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data: jobs } = await supabase.from('jobs').select('*').eq('is_active', true).order('created_at', { ascending: false })
  return c.html(page({ title: 'الوظائف', active: 'join' }, careersPage(jobs || [])))
})
app.get('/news', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data: news } = await supabase.from('news').select('*').order('publish_date', { ascending: false })
  return c.html(page({ title: 'المركز الإعلامي', active: 'news' }, newsPage(news || [])))
})
app.get('/transparency', (c) => c.html(page({ title: 'الشفافية المالية', active: 'more' }, transparencyPage())))
app.get('/faq', (c) => c.html(page({ title: 'الأسئلة الشائعة', active: 'more' }, faqPage())))
app.get('/contact', (c) => c.html(page({ title: 'تواصل معنا', active: 'more' }, contactPage())))

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
    return c.redirect('/login?error=not_admin')
  }

  await next()
}
app.use('/dashboard', dashboardGuard)
app.use('/dashboard/*', dashboardGuard)

// Dashboard Routes
app.get('/dashboard', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const [{ count: cDonors }, { count: cCampaigns }, { count: cVolunteers }, { data: recentDonations }, { data: sumData }] = await Promise.all([
    supabase.from('donations').select('*', { count: 'exact', head: true }),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }),
    supabase.from('volunteers').select('*', { count: 'exact', head: true }),
    supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('donations').select('amount')
  ])

  // Calculate total donations amount
  const totalAmount = (sumData || []).reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0)

  const stats = {
    total_donations: totalAmount,
    total_campaigns: cCampaigns || 0,
    total_donors: cDonors || 0,
    total_volunteers: cVolunteers || 0
  }
  return c.html(dashOverview(stats, recentDonations || []))
})

app.get('/dashboard/campaigns', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })
  return c.html(dashCampaigns(data || []))
})

app.get('/dashboard/donations', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data } = await supabase.from('donations').select('*').order('created_at', { ascending: false })
  return c.html(dashDonations(data || []))
})

app.get('/dashboard/volunteers', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data } = await supabase.from('volunteers').select('*').order('created_at', { ascending: false })
  return c.html(dashVolunteers(data || []))
})

app.get('/dashboard/contacts', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
  return c.html(dashContacts(data || []))
})

app.get('/dashboard/news', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false })
  return c.html(dashNews(data || []))
})

app.get('/dashboard/events', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false })
  return c.html(dashEvents(data || []))
})

app.get('/dashboard/stories', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const { data } = await supabase.from('stories').select('*').order('created_at', { ascending: false })
  return c.html(dashStories(data || []))
})

app.get('/dashboard/jobs', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const [ { data: jobs }, { data: apps } ] = await Promise.all([
    supabase.from('jobs').select('*').order('created_at', { ascending: false }),
    supabase.from('job_applications').select('*').order('created_at', { ascending: false })
  ])
  return c.html(dashJobs(jobs || [], apps || []))
})

app.get('/dashboard/users', async (c) => {
  const supabase = getSupabaseFromContext(c)
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
app.notFound((c) => c.html(page({ title: 'الصفحة غير موجودة' }, `
<section class="page-hero" style="min-height:70vh;display:grid;place-items:center">
  <div class="hero-bg-grid"></div><div class="hero-glow g1"></div><div class="hero-glow g3"></div>
  <div class="wrap center" style="position:relative;z-index:3">
    <div style="font-size:clamp(5rem,18vw,11rem);font-weight:900;line-height:1;background:var(--grad-gold);-webkit-background-clip:text;background-clip:text;color:transparent">٤٠٤</div>
    <h1 class="h-xl" style="color:#fff;margin-top:1rem">الصفحة غير موجودة</h1>
    <p class="lead" style="color:rgba(255,255,255,.8);margin:1rem auto 2rem;max-width:480px">يبدو أن الصفحة التي تبحث عنها قد انتقلت أو لم تعد متوفرة.</p>
    <a href="/" class="btn btn-gold btn-lg magnetic"><i class="fas fa-house"></i> العودة للرئيسية</a>
  </div>
</section>`)))

export default app
