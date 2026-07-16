import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { api } from './api'
import { getAuth, getFirestore } from './lib/firebase-admin'

const app = new Hono()

// Mount API routes
app.route('/api', api)

// Session check middleware
app.use('*', async (c, next) => {
  const sessionCookie = getCookie(c, 'fb-session')
  if (sessionCookie) {
    try {
      const auth = getAuth(c)
      const decodedClaims = await auth.verifySessionCookie(sessionCookie)

      const db = getFirestore(c)
      const profileRef = db.collection('profiles').doc(decodedClaims.uid)
      const profileDoc = await profileRef.get()
      let profileData = profileDoc.exists ? profileDoc.data() : null

      const email = decodedClaims.email || ''

      if (!profileData && decodedClaims.uid) {
        // If profile doesn't exist, create it
        const profilesSnapshot = await db.collection('profiles').limit(1).get()
        const isFirst = profilesSnapshot.empty
        const role = isFirst ? 'admin' : 'donor'

        profileData = {
          full_name: decodedClaims.name || email.split('@')[0] || 'فاعل خير',
          phone: '',
          role: role,
          avatar_url: decodedClaims.picture || '',
          email: email,
          created_at: new Date().toISOString()
        }
        await profileRef.set(profileData)
      }

      ; (c as any).set('user', {
        id: decodedClaims.uid,
        email: decodedClaims.email,
        name: profileData?.full_name || decodedClaims.name || decodedClaims.email || 'فاعل خير',
        avatar: profileData?.avatar_url || decodedClaims.picture || '',
        role: profileData?.role || 'user',
        phone: profileData?.phone || ''
      })
    } catch (e) { }
  }
  await next()
})

app.get('/api/config', (c) => {
  const env = (c?.env as any) || {}
  const glob = globalThis as any
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env : {}

  const hasAdminSdk = Boolean(
    (env.FIREBASE_PROJECT_ID || procEnv.FIREBASE_PROJECT_ID) &&
    (env.FIREBASE_CLIENT_EMAIL || procEnv.FIREBASE_CLIENT_EMAIL) &&
    (env.FIREBASE_PRIVATE_KEY || procEnv.FIREBASE_PRIVATE_KEY)
  )

  return c.json({
    apiKey: env.FIREBASE_API_KEY || procEnv.FIREBASE_API_KEY || '',
    authDomain: env.FIREBASE_AUTH_DOMAIN || procEnv.FIREBASE_AUTH_DOMAIN || '',
    projectId: env.FIREBASE_PROJECT_ID || procEnv.FIREBASE_PROJECT_ID || '',
    hasAdminSdk,
    user: (c as any).get('user') || null
  })
})

// Static Fallbacks (used if Firestore is empty)
const defaultPrograms = [
  ['fa-cow', 'مشروع الأضاحي', 'فرحة تصل إلى البيوت المستحقة في المواسم والأعياد.', 'gold'],
  ['fa-bowl-food', 'إطعام الطعام', 'كراتين رمضان ووجبات ساخنة تحفظ كرامة الأسرة.', 'coral'],
  ['fa-heart-pulse', 'الدعم الصحي', 'دواء وعلاج وعمليات لمن أثقل المرض كاهلهم.', 'blue'],
  ['fa-book-quran', 'مسابقات القرآن', 'حلقات ومسابقات تغرس نور القرآن في قلوب الأطفال.', 'emerald'],
  ['fa-graduation-cap', 'الدعم التعليمي', 'مصروفات وأدوات ورعاية تفتح أبواب المستقبل.', 'violet'],
  ['fa-people-roof', 'مبادرات المجتمع', 'كسوة وهدايا ومبادرات تصنع مجتمعًا أكثر رحمة.', 'cyan'],
]

const defaultCampaigns = [
  { id: 'medicine', cat: 'صحة', title: 'دواء كل شهر', text: 'ساهم في توفير العلاج الشهري لمرضى لا يملكون ثمن الدواء.', raised: 32000, goal: 50000, icon: 'fa-capsules', urgent: true },
  { id: 'food', cat: 'غذاء', title: 'مائدة تكفي بيتًا', text: 'كراتين غذائية متكاملة تكفي الأسرة وتصل إليها بكرامة.', raised: 18500, goal: 30000, icon: 'fa-basket-shopping', urgent: false },
  { id: 'school', cat: 'تعليم', title: 'حقيبة تفتح بابًا', text: 'أدوات ومصروفات مدرسية تساعد طفلًا على استكمال تعليمه.', raised: 12400, goal: 25000, icon: 'fa-school', urgent: false },
  { id: 'surgery', cat: 'صحة', title: 'عملية تنقذ حياة', text: 'مساهمة عاجلة في تكاليف العمليات للحالات غير القادرة.', raised: 41000, goal: 60000, icon: 'fa-stethoscope', urgent: true },
  { id: 'quran', cat: 'قرآن', title: 'جيل يحمل النور', text: 'دعم حلقات التحفيظ والمسابقات وجوائز المتفوقين.', raised: 9000, goal: 20000, icon: 'fa-book-open', urgent: false },
  { id: 'eid', cat: 'مجتمع', title: 'كسوة وفرحة عيد', text: 'ملابس جديدة وهدايا تجعل العيد أجمل في عيون الأطفال.', raised: 15000, goal: 22000, icon: 'fa-gift', urgent: false },
]

const defaultNews = [
  ['دعم مستشفى كفر العنانية', 'الصحة', 'تجهيز عيادة الأنف والأذن وتحسين البنية الكهربائية لخدمة المرضى بأمان.', 'fa-hospital'],
  ['زيارة أوائل الطلبة في بيوتهم', 'التعليم', 'لحظات تقدير حقيقية تشجع أبناءنا وتشارك أسرهم فرحة النجاح.', 'fa-medal'],
  ['قافلة دفء إلى الأسر الأولى بالرعاية', 'المجتمع', 'متطوعونا يصلون بالمساعدات إلى البيوت في القرى الأكثر احتياجًا.', 'fa-hands-holding-child']
]

const routeNames: Record<string, string> = {
  '/about': 'من نحن', '/campaigns': 'الحملات', '/achievements': 'الإنجازات', '/success-stories': 'قصص النجاح',
  '/events': 'الفعاليات', '/gallery': 'معرض الصور', '/donate': 'تبرّع الآن', '/volunteers': 'التطوع', '/careers': 'الوظائف',
  '/news': 'الأخبار', '/transparency': 'الشفافية المالية', '/faq': 'الأسئلة الشائعة', '/contact': 'تواصل معنا',
  '/login': 'تسجيل الدخول', '/profile': 'حسابي', '/dashboard': 'لوحة التحكم'
}

const icon = (name: string) => <i class={`fa-solid ${name}`} aria-hidden="true"></i>

function Header({ user }: { user?: any }) {
  return <>
    <header class="site-header" id="site-header">
      <a class="brand" href="/" aria-label="الرئيسية">
        <img src="/static/foundation-logo.png" alt="شعار مؤسسة الدكتور عمر هشام" />
        <span><b>مؤسسة الدكتور</b><strong>عمر هشام الخيرية</strong></span>
      </a>
      <nav class="desktop-nav" aria-label="التنقل الرئيسي">
        <a href="/">الرئيسية</a><a href="/about">من نحن</a><a href="/campaigns">الحملات</a><a href="/achievements">أثرنا</a><a href="/news">الأخبار</a><a href="/contact">تواصل</a>
        {user ? (
          <>
            <a href="/profile" class="profile-link" style="color:var(--blue-600);font-weight:bold"><i class="fa-solid fa-user"></i> حسابي</a>
            {user.role === 'admin' && <a href="/dashboard" class="dash-link" style="color:var(--gold-600);font-weight:bold"><i class="fa-solid fa-gauge"></i> التحكم</a>}
          </>
        ) : (
          <a href="/login" class="login-link"><i class="fa-solid fa-right-to-bracket"></i> دخول</a>
        )}
      </nav>
      <div class="header-actions">
        <button class="icon-btn" id="theme-toggle" aria-label="تغيير المظهر">{icon('fa-moon')}</button>
        <button class="icon-btn menu-toggle" id="menu-toggle" aria-label="فتح القائمة">{icon('fa-bars-staggered')}</button>
        <a class="donate-pill magnetic" href="/donate"><span>تبرّع الآن</span>{icon('fa-heart')}</a>
      </div>
    </header>
    <aside class="mobile-drawer" id="mobile-drawer" aria-hidden="true">
      <button id="menu-close" class="drawer-close" aria-label="إغلاق">{icon('fa-xmark')}</button>
      <p class="eyebrow">اصنع أثرًا يبقى</p>
      <nav>
        {Object.entries(routeNames).slice(0, 13).map(([href, label]) => <a href={href}>{label}<i class="fa-solid fa-arrow-left"></i></a>)}
        <div style="border-top:1px solid var(--border); margin:1rem 0; padding-top:1rem"></div>
        {user ? (
          user.role === 'admin' ?
            <a href="/dashboard" style="color:var(--gold-600);font-weight:bold"><i class="fa-solid fa-gauge"></i> لوحة التحكم</a> :
            <a href="/profile" style="color:var(--blue-600);font-weight:bold"><i class="fa-solid fa-user"></i> حسابي ({user.name})</a>
        ) : (
          <a href="/login"><i class="fa-solid fa-right-to-bracket"></i> تسجيل الدخول</a>
        )}
      </nav>
    </aside>
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
  </>
}

function Footer() {
  return <footer class="site-footer">
    <div class="footer-glow"></div>
    <section class="footer-main">
      <article class="footer-story">
        <img src="/static/foundation-logo.png" alt="" />
        <h2>الخير لا يغيب،<br /><em>بل يتحوّل إلى أثر.</em></h2>
        <p>مؤسسة إنسانية تعمل لتفريج الكرب، ودعم المرضى، ونشر العلم، وتعليم القرآن بروح من الإيمان والإحسان.</p>
        <span class="licensed">{icon('fa-shield-heart')} جهة مرخصة ومعتمدة</span>
      </article>
      <nav class="footer-links"><h3>اكتشف</h3><a href="/about">قصة عمر</a><a href="/campaigns">الحملات</a><a href="/achievements">الإنجازات</a><a href="/gallery">معرض الصور</a><a href="/faq">الأسئلة الشائعة</a></nav>
      <nav class="footer-links"><h3>شاركنا</h3><a href="/donate">تبرّع الآن</a><a href="/volunteers">كن متطوعًا</a><a href="/careers">الوظائف</a><a href="/transparency">الشفافية</a><a href="/contact">تواصل معنا</a></nav>
      <article class="newsletter"><p class="eyebrow">رسالة أثر</p><h3>خيرٌ صغير في بريدك،<br />كل شهر.</h3><form class="ajax-form" data-endpoint="/api/newsletter"><label class="sr-only" for="newsletter-email">البريد الإلكتروني</label><div class="input-action"><input id="newsletter-email" name="email" type="email" placeholder="بريدك الإلكتروني" required /><button aria-label="اشتراك">{icon('fa-arrow-left')}</button></div></form><div class="socials"><a href="https://www.facebook.com/share/1Dj3HrELjY/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="صفحة المؤسسة على فيسبوك"><i class="fa-brands fa-facebook-f"></i></a><a href="https://www.instagram.com/dr.omarheshamfoundation?igsh=MWZiMXRjOTh2bm4zZA==" target="_blank" rel="noopener noreferrer" aria-label="حساب المؤسسة على إنستجرام"><i class="fa-brands fa-instagram"></i></a></div></article>
    </section>
    <div class="footer-bottom"><p>© 2026 مؤسسة الدكتور عمر هشام الخيرية</p><div class="footer-signature"><a class="developer-credit" href="https://peso-is-here.vercel.app" target="_blank" rel="noopener noreferrer" aria-label="Visit PESO website"><span class="credit-label">Developed by</span><span class="credit-brand"><strong>PESO</strong><i class="fa-solid fa-heart" aria-hidden="true"></i></span><span class="credit-arrow"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></span></a></div></div>
  </footer>
}

function Layout({ children, title = 'مؤسسة الدكتور عمر هشام الخيرية', description = 'عطاء مستمر لتنمية الإنسان والمجتمع', user, showFooter = false, pageType = 'public' }: { children: any, title?: string, description?: string, user?: any, showFooter?: boolean, pageType?: 'public' | 'auth' | 'dashboard' }) {
  return <html lang="ar" dir="rtl"><head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} /><meta name="theme-color" content="#f9f6ee" /><meta name="color-scheme" content="light dark" />
    <meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:image" content="/static/foundation-logo.png" />
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Manrope:wght@400;600;700;800&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet" />
    <link rel="icon" type="image/png" href="/static/foundation-logo.png" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css" />
    <link rel="stylesheet" href="/static/style.css" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'NGO', name: 'مؤسسة الدكتور عمر هشام الخيرية', url: 'https://omarhesham.org', telephone: '+201060920249', address: 'كفر العنانية، الدقهلية، مصر' }) }}></script>
  </head><body class={`page-${pageType}`}>
      {pageType !== 'dashboard' && <div class="preloader" id="preloader"><div class="preloader-orbit"><img src="/static/foundation-logo.png" alt="" /><span></span></div><p>يبدأ الأثر من قلبٍ يؤمن بالخير</p></div>}
      <div class="noise"></div><div class="cursor-dot" id="cursor-dot"></div><div class="cursor-ring" id="cursor-ring"></div>
      {pageType !== 'dashboard' && <Header user={user} />}<main>{children}</main>{showFooter && <Footer />}
      {pageType !== 'dashboard' && <button class="scroll-top" id="scroll-top" aria-label="إلى أعلى">{icon('fa-arrow-up')}</button>}
      <div class="toast" id="toast" role="status" aria-live="polite" aria-atomic="true"><span class="toast-icon"><i class="fa-solid fa-check"></i></span><span class="toast-content"><strong>تم بنجاح</strong><span class="toast-message"></span></span><button class="toast-close" type="button" aria-label="إغلاق الإشعار">{icon('fa-xmark')}</button><span class="toast-progress" aria-hidden="true"></span></div>
      <div class="confirm-modal" id="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-hidden="true"><div class="confirm-card"><span class="confirm-icon">{icon('fa-triangle-exclamation')}</span><h2 id="confirm-title">تأكيد الإجراء</h2><p id="confirm-message">هل أنت متأكد من تنفيذ هذا الإجراء؟</p><div><button type="button" class="confirm-cancel">إلغاء</button><button type="button" class="confirm-accept">تأكيد</button></div></div></div>
      {pageType === 'public' && <nav class="mobile-bottom" aria-label="تنقل سريع"><a href="/">{icon('fa-house')}<span>الرئيسية</span></a><a href="/campaigns">{icon('fa-seedling')}<span>الحملات</span></a><a class="bottom-donate" href="/donate">{icon('fa-heart')}<span>تبرّع</span></a><a href="/volunteers">{icon('fa-hand-holding-hand')}<span>تطوع</span></a><a href="/contact">{icon('fa-comment-dots')}<span>تواصل</span></a></nav>}
      <script src="/static/app.js"></script>
    </body></html>
}

function SectionHead({ kicker, title, text }: { kicker: string, title: string, text?: string }) {
  return <header class="section-head reveal"><p class="eyebrow"><span></span>{kicker}</p><h2 dangerouslySetInnerHTML={{ __html: title }}></h2>{text && <p class="section-copy">{text}</p>}</header>
}

function CampaignCard({ c }: { c: any }) {
  const goal = Number(c.goal || 0)
  const raised = Number(c.raised || 0)
  const progress = goal > 0 ? Math.round(raised / goal * 100) : 0
  const detailUrl = c.id ? `/campaigns/${c.id}` : '#'

  return <article class="campaign-card reveal tilt-card">
    <div class="campaign-visual">
      <span class="visual-orb"></span>
      {icon(c.icon || 'fa-heart')}
      <b>{c.category || c.cat || 'عام'}</b>
      {(c.is_urgent || c.urgent) && <em>عاجل</em>}
    </div>
    <div class="campaign-body">
      <h3>{c.title}</h3>
      <p>{c.description || c.text}</p>
      <div class="progress-meta">
        <strong>{(raised).toLocaleString('ar-EG')} ج.م</strong>
        <span>من {(goal).toLocaleString('ar-EG')} ج.م</span>
      </div>
      <div class="progress-track"><i style={`width:${progress}%`}></i></div>
      <a href={detailUrl}>اكتشف الحملة <i class="fa-solid fa-arrow-left"></i></a>
    </div>
  </article>
}

function Home({ campaigns = [], news = [], stories = [], user }: { campaigns?: any[], news?: any[], stories?: any[], user?: any }) {
  const renderCampaigns = campaigns.length > 0 ? campaigns : defaultCampaigns
  const renderNews = news.length > 0 ? news : defaultNews

  return <Layout user={user} showFooter>
    <section class="hero" id="hero-section">
      <div class="hero-pattern"></div><div class="hero-halo halo-one"></div><div class="hero-halo halo-two"></div>
      <div class="hero-copy reveal"><div class="hero-badge"><span></span>صدقة جارية على روح الدكتور عمر هشام</div><h1>حين يرحلُ الجسد،<br /><em>يبقى الخيرُ حيًّا.</em></h1><p>نُكمل حلم طبيبٍ شاب أراد أن يداوي الناس، فنحوّل عطاءكم إلى دواءٍ وأملٍ وعلمٍ يصل إلى من يستحق.</p><div class="hero-actions"><a class="primary-btn magnetic" href="/donate">ابدأ أثرًا الآن {icon('fa-arrow-left')}</a><a class="story-link" href="/about"><i class="fa-solid fa-play"></i><span><small>اكتشف</small>حكاية عمر</span></a></div><div class="trust-row"><span>{icon('fa-circle-check')} جهة رسمية مرخصة</span><span>{icon('fa-location-dot')} كفر العنانية، الدقهلية</span></div></div>
      <div class="hero-art reveal">
        <div class="orbit orbit-a"><i></i><span>{icon('fa-heart-pulse')}</span></div><div class="orbit orbit-b"><i></i><span>{icon('fa-book-open')}</span></div>
        <div class="logo-sanctuary"><div class="arch"></div><img src="/static/foundation-logo.png" alt="مؤسسة الدكتور عمر هشام الخيرية" /><span class="spark s1">✦</span><span class="spark s2">✦</span><span class="spark s3">✦</span></div>
        <div class="floating-note"><i class="fa-solid fa-infinity"></i><span><small>عطاء</small>لا ينقطع</span></div>
      </div>
      <a href="#impact" class="scroll-cue"><span>اكتشف الأثر</span><i></i></a>
    </section>

    <section class="impact-ribbon" id="impact"><div><b class="counter" data-target="50">0</b><span>أسرة وصل إليها الدعم</span></div><i></i><div><b class="counter" data-target="80000">0</b><span>جنيه دعم مباشر</span></div><i></i><div><b>6</b><span>مسارات لصناعة الخير</span></div><i></i><div><b>∞</b><span>أثر نرجو ألا ينقطع</span></div></section>

    <section class="story-section section-pad">
      <div class="story-portrait reveal"><div class="portrait-frame"><img src="/static/omar-portrait.jpg" alt="الدكتور عمر هشام" /><span class="portrait-shine"></span></div><div class="portrait-caption"><i class="fa-solid fa-stethoscope"></i><p>كان يحلم<br /><strong>أن يداوي الناس</strong></p></div><span class="year-mark">رحمه الله</span></div>
      <article class="story-copy reveal"><p class="eyebrow"><span></span>الحكاية التي بدأت منها الرحلة</p><h2>حلمُ طبيبٍ شاب،<br />صار <em>مؤسسةً للرحمة.</em></h2><blockquote>«عمر لم يكن مجرد ابن، كان طالب طب نابغًا يحلم بعلاج الناس… فأردتُ أن يستمر حلمه وألا ينقطع عمله الصالح.»</blockquote><p>أسّس المهندس هشام صبري هذه المؤسسة كصدقة جارية على روح ابنه، لتبقى يده ممتدة إلى كل مريض ومحتاج.</p><a class="text-arrow" href="/about">اقرأ الحكاية كاملة <i class="fa-solid fa-arrow-left-long"></i></a></article>
    </section>

    <section class="programs section-pad">
      <SectionHead kicker="مساحات العطاء" title={'ستةُ أبواب،<br/><em>ووجهةٌ واحدة: الإنسان.</em>'} text="نصل إلى الإنسان في صحته وتعليمه وغذائه وروحه؛ لأن التنمية الحقيقية لا تترك جانبًا من الحياة خلفها." />
      <div class="program-grid">{defaultPrograms.map((p, i) => <article class={`program-card reveal tone-${p[3]}`} style={`--delay:${i * 70}ms`}><span class="program-index">0{i + 1}</span><div class="program-icon">{icon(p[0])}</div><h3>{p[1]}</h3><p>{p[2]}</p><a href="/achievements" aria-label={`اعرف المزيد عن ${p[1]}`}><i class="fa-solid fa-arrow-left"></i></a></article>)}</div>
    </section>

    <section class="verse-break"><div class="verse-stars"></div><p class="reveal">﴿ مَثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ ﴾</p><span>البقرة — ٢٦١</span></section>

    <section class="campaigns-preview section-pad">
      <div class="head-row"><SectionHead kicker="الأثر ينتظرك" title={'اختر القصة التي<br/><em>تريد أن تغيّر نهايتها.</em>'} /><a class="outline-btn" href="/campaigns">كل الحملات {icon('fa-arrow-left')}</a></div>
      <div class="campaign-grid">{renderCampaigns.slice(0, 3).map(c => <CampaignCard c={c} />)}</div>
    </section>

    <section class="process section-pad"><div class="process-bg-word">أثر</div><SectionHead kicker="من يدك إلى مستحقه" title={'طريقٌ واضح،<br/><em>وأمانةٌ محفوظة.</em>'} /><div class="steps">{[['fa-hand-holding-heart', 'تتبرّع', 'اختر المسار والمبلغ الذي يناسبك.'], ['fa-magnifying-glass-chart', 'نبحث', 'ندرس الحالات ميدانيًا بعناية.'], ['fa-box-open', 'نُوصل', 'نقدم الدعم بكرامة وخصوصية.'], ['fa-chart-line', 'نُوثّق', 'نشاركك أين وكيف صُنع الأثر.']].map((s, i) => <article class="step reveal"><span>0{i + 1}</span><div>{icon(s[0])}</div><h3>{s[1]}</h3><p>{s[2]}</p>{i < 3 && <i class="step-line"></i>}</article>)}</div></section>

    <section class="quote-section section-pad"><div class="quote-mark">“</div><blockquote class="reveal">لسنا نمنحُ الناس مساعدةً عابرة،<br />بل نقول لهم: <em>أنتم لستم وحدكم.</em></blockquote><div class="quote-person"><span>هـ ص</span><p><b>المهندس هشام صبري</b><small>المؤسس ورئيس مجلس الإدارة</small></p></div></section>

    <section class="news-section section-pad">
      <div class="head-row">
        <SectionHead kicker="يوميات الرحمة" title={'أخبارٌ لا تُقرأ فقط،<br/><em>بل تُشعرك أن الخير قريب.</em>'} />
        <a class="text-arrow" href="/news">كل الأخبار {icon('fa-arrow-left-long')}</a>
      </div>
      <div class="news-grid">
        {renderNews.slice(0, 3).map((n, i) => {
          // Firebase News Doc has different structure than static fallback
          const isDoc = typeof n.id !== 'undefined'
          const title = isDoc ? n.title : n[0]
          const cat = isDoc ? n.category : n[1]
          const excerpt = isDoc ? n.excerpt : n[2]
          const ic = isDoc ? (n.icon || 'fa-newspaper') : n[3]
          const date = isDoc ? new Date(n.publish_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : '١٢ يوليو ٢٠٢٦'
          const img = isDoc ? n.image_url : null

          return <article class={`news-card reveal ${i === 0 ? 'featured' : ''}`}>
            <div class="news-art" style={img ? `background-image:url(${img});background-size:cover;background-position:center;color:transparent;` : ''}>
              {!img && icon(ic)}
              <span style={img ? 'background:rgba(12,74,63,0.8);color:white' : ''}>{cat}</span>
            </div>
            <div>
              <time>{date}</time>
              <h3>{title}</h3>
              <p>{excerpt}</p>
              <a href={isDoc ? `/news/${n.id}` : '/news'}>اقرأ القصة {icon('fa-arrow-left')}</a>
            </div>
          </article>
        })}
      </div>
    </section>

    <section class="final-cta"><div class="cta-rays"></div><img src="/static/foundation-logo.png" alt="" /><p class="eyebrow">قد تكون أنت الإجابة عن دعاء شخصٍ ما</p><h2>ازرع خيرًا اليوم،<br /><em>ودعه يُزهر إلى الأبد.</em></h2><div><a class="light-btn magnetic" href="/donate">تبرّع الآن {icon('fa-heart')}</a><a href="/volunteers">أو شارك بوقتك <i class="fa-solid fa-arrow-left"></i></a></div></section>
  </Layout>
}

function PageHero({ kicker, title, text }: { kicker: string, title: string, text: string }) { return <section class="page-hero"><div class="page-orb"></div><p class="eyebrow reveal"><span></span>{kicker}</p><h1 class="reveal" dangerouslySetInnerHTML={{ __html: title }}></h1><p class="reveal">{text}</p><div class="breadcrumb"><a href="/">الرئيسية</a><i class="fa-solid fa-chevron-left"></i><span>{kicker}</span></div></section> }

function About({ user }: { user?: any }) {
  return <Layout user={user} title="من نحن | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="من نحن" title={'من الفقد وُلد نورٌ،<br/><em>ومن الحلم وُلد أثر.</em>'} text="حكاية إنسان لم يتوقف حلمه برحيله، بل صار بابًا للخير يدخل منه الجميع." />
    <section class="about-memorial section-pad"><div class="memorial-image reveal"><img src="/static/omar-portrait.jpg" alt="الدكتور عمر هشام" /><div class="image-prayer">رحمه الله رحمةً واسعة</div></div><article class="memorial-text reveal"><p class="eyebrow"><span></span>صدقة جارية</p><h2>كان عمر يحلمُ بالشفاء،<br />فنحن نُكمل الحلم.</h2><p>في ذاكرة كل من عرفه، بقي الدكتور عمر هشام شابًا طموحًا، بشوشًا، يحمل حلم الطب ورسالة الرحمة. وحين اختاره الله، قرر والده المهندس هشام صبري أن يتحوّل الحزن إلى يدٍ تمتد لكل محتاج.</p><blockquote>«ليحمل اسمُه رسالة نشر الخير والرحمة والإحسان بين الناس.»</blockquote></article></section>
    <section class="sacred-section"><div class="sacred-pattern"></div><p class="eyebrow">دعاءٌ يصل إلى السماء</p><h2>اللهم اغفر له وارحمه، وعافه واعف عنه،<br />وأكرم نزله، ووسّع مدخله.</h2><div class="fatiha"><h3>الفاتحة</h3><p>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ <span class="ayah-number">١</span><br />الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ <span class="ayah-number">٢</span> الرَّحْمَنِ الرَّحِيمِ <span class="ayah-number">٣</span> مَالِكِ يَوْمِ الدِّينِ <span class="ayah-number">٤</span> إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ <span class="ayah-number">٥</span> اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ <span class="ayah-number">٦</span> صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ <span class="ayah-number">٧</span></p></div><button class="light-btn toast-trigger" data-message="جزاك الله خيرًا، تقبّل الله دعاءك ورحم حبيبنا وأسكنه فسيح جناته">قرأتُ الفاتحة وأهديتُه الرحمة {icon('fa-heart')}</button></section>
    <section class="values section-pad"><SectionHead kicker="ما نؤمن به" title={'قيمٌ لا نكتبها على الجدران،<br/><em>بل نمارسها كل يوم.</em>'} /><div class="value-grid">{[['الإخلاص', 'كل ما نقدمه خالصًا لوجه الله.'], ['الشفافية', 'وضوحٌ وأمانة في كل خطوة.'], ['المسؤولية', 'أثر حقيقي ومستدام في المجتمع.'], ['الرحمة', 'نقف بجوار المحتاج بلطف وكرامة.'], ['الشراكة', 'معًا يصبح أثر الخير أكبر.']].map((v, i) => <article class="value-card reveal"><span>0{i + 1}</span><h3>{v[0]}</h3><p>{v[1]}</p></article>)}</div></section>
  </Layout>
}

function Campaigns({ campaigns = [], user }: { campaigns?: any[], user?: any }) {
  const renderCampaigns = campaigns.length > 0 ? campaigns : defaultCampaigns

  return <Layout user={user} title="الحملات | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="حملاتنا" title={'كل حملةٍ باب،<br/><em>وكل تبرّع حياة.</em>'} text="اختر المجال الأقرب إلى قلبك، واترك لنا مسؤولية أن يصل عطاؤك بكرامة وأمانة." />
    <section class="listing-section section-pad">
      <div class="filter-row" data-filter-group>
        <button class="active" data-filter="all">الكل</button>
        <button data-filter="صحة">الصحة</button>
        <button data-filter="غذاء">الغذاء</button>
        <button data-filter="تعليم">التعليم</button>
        <button data-filter="قرآن">القرآن</button>
        <button data-filter="مجتمع">المجتمع</button>
      </div>
      <div class="campaign-grid all-campaigns">
        {renderCampaigns.map(c => <div data-category={c.category || c.cat || 'عام'}><CampaignCard c={c} /></div>)}
      </div>
    </section>
  </Layout>
}

function CampaignDetail({ c, user }: { c: any, user?: any }) {
  const goal = Number(c.goal || 0)
  const raised = Number(c.raised || 0)
  const progress = goal > 0 ? Math.round(raised / goal * 100) : 0

  return <Layout user={user} title={`${c.title} | مؤسسة الدكتور عمر هشام`}>
    <section class="detail-hero">
      <a href="/campaigns" class="back-link">{icon('fa-arrow-right')} كل الحملات</a>
      <div class="detail-icon">{icon(c.icon || 'fa-heart')}</div>
      <span class="category-chip">{c.category || c.cat || 'عام'}</span>
      <h1>{c.title}</h1>
      <p>{c.description || c.text} مساهمتك، مهما كانت، تقترب بنا من إنسان ينتظر باب الفرج.</p>
      <div class="detail-progress">
        <div>
          <strong>{(raised).toLocaleString('ar-EG')} ج.م</strong>
          <span>تم جمعها من {(goal).toLocaleString('ar-EG')} ج.م</span>
        </div>
        <b>{progress}%</b>
        <div class="progress-track"><i style={`width:${progress}%`}></i></div>
      </div>
      <a class="primary-btn" href="/donate">ساهم في الحملة {icon('fa-heart')}</a>
    </section>
  </Layout>
}

function Donate({ user }: { user?: any }) {
  return <Layout user={user} title="تبرّع الآن | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="تبرّع الآن" title={'عطاؤك اليوم،<br/><em>قد يغيّر غدًا كاملًا.</em>'} text="اختر الطريقة الأنسب لك. كل بيانات التحويل أمامك بوضوح، وكل مساهمة موثّقة بأمانة." />
    <section class="donate-layout section-pad">
      <div class="donation-journey reveal">
        <p class="eyebrow"><span></span>حدد مساهمتك</p>
        <h2>كم تريد أن تزرع من الخير؟</h2>
        <form class="donation-form ajax-form" data-endpoint="/api/donations/add" method="post">
          <div class="amount-picks">
            <button type="button" data-amount="100">١٠٠</button>
            <button type="button" class="active" data-amount="500">٥٠٠</button>
            <button type="button" data-amount="1000">١٬٠٠٠</button>
            <button type="button" data-amount="5000">٥٬٠٠٠</button>
          </div>
          <label>مبلغ التبرّع <span>بالجنيه المصري</span><input type="number" name="amount" id="amount-input" value="500" min="1" required /></label>
          <div class="form-grid">
            <label>الاسم الكريم<input name="name" required placeholder="الاسم بالكامل" /></label>
            <label>رقم الهاتف<input name="phone" required inputmode="tel" placeholder="01xxxxxxxxx" /></label>
          </div>
          <label>البريد الإلكتروني <span>اختياري</span><input type="email" name="email" placeholder="name@example.com" /></label>
          <fieldset>
            <legend>طريقة التحويل</legend>
            <label class="method-option"><input type="radio" name="method" value="instapay" checked /><span>{icon('fa-building-columns')}<b>إنستاباي / تحويل بنكي</b><small>البنك الزراعي المصري</small></span></label>
            <label class="method-option"><input type="radio" name="method" value="vodafone" /><span><i class="fa-solid fa-mobile-screen-button"></i><b>فودافون كاش</b><small>تحويل فوري من هاتفك</small></span></label>
            <label class="method-option"><input type="radio" name="method" value="cash" /><span>{icon('fa-money-bill-wave')}<b>دفع نقدي مباشر</b><small>مع إيصال موثّق</small></span></label>
          </fieldset>
          <button class="primary-btn submit-btn" type="submit">تسجيل مساهمتي {icon('fa-arrow-left')}</button>
          <p class="privacy-note">{icon('fa-lock')} بياناتك محفوظة ولا نشاركها مع أي طرف.</p>
        </form>
      </div>
      <aside class="payment-panel reveal">
        <p class="eyebrow">بيانات التحويل</p>
        <h2>انسخ. حوّل.<br />وأرسل الأثر.</h2>
        <article class="account-card bank">
          <div>{icon('fa-building-columns')}<span><small>البنك الزراعي المصري</small><b>حساب المؤسسة</b></span></div>
          <strong dir="ltr">10010397596901014</strong>
          <button class="copy-btn" data-copy="10010397596901014">{icon('fa-copy')} نسخ رقم الحساب</button>
        </article>
        <article class="account-card phone">
          <div>{icon('fa-mobile-screen')}<span><small>إنستاباي أو فودافون كاش</small><b>تحويل عبر الهاتف</b></span></div>
          <strong dir="ltr">01060920249</strong>
          <button class="copy-btn" data-copy="01060920249">{icon('fa-copy')} نسخ الرقم</button>
        </article>
        <article class="voucher-card">
          <span>{icon('fa-cow')}</span>
          <div>
            <small>صك الأضحية</small>
            <h3>شارك في فرحة الموسم</h3>
            <p><b>٥٠٠ ج.م</b> صك خيري <i></i> <b>١١٬٠٠٠ ج.م</b> أضحية كاملة</p>
          </div>
        </article>
      </aside>
    </section>
  </Layout>
}

function Achievements({ user }: { user?: any }) {
  return <Layout user={user} title="الإنجازات | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="أثرنا بالأرقام" title={'لا نعدُ بالكثير،<br/><em>نُريك ما تحقق.</em>'} text="الشفافية عندنا ليست صفحة؛ إنها الطريقة التي نعمل بها ونحفظ بها أمانة كل متبرع." />
    <section class="metrics-showcase section-pad"><article><span>أكثر من</span><b>٥٠</b><p>أسرة حصلت على دعم مباشر</p></article><article><span>إجمالي</span><b>٨٠ ألف</b><p>جنيه تم توجيهها للمستحقين</p></article><article><span>دعم الأسر</span><b>٦٠ ألف</b><p>جنيه لـ ٥٠ أسرة أولى بالرعاية</p></article><article><span>دعم المرضى</span><b>٢٠ ألف</b><p>جنيه علاج ومساعدات طبية</p></article></section>
    <section class="achievement-tracks section-pad"><SectionHead kicker="ما وراء الأرقام" title={'أعمالٌ تلمس<br/><em>كل جانب من الحياة.</em>'} /><div class="track-grid">{[['fa-heart-pulse', 'الصحة', 'عيادة أنف وأذن، تطوير كهرباء المستشفى، دواء شهري، دعم مرضى السرطان، ومساهمات في العمليات.'], ['fa-graduation-cap', 'التعليم', 'ماكينات تصوير للمدارس، تكريم المتفوقين، مصروفات وأدوات ومتابعة طوال العام.'], ['fa-book-quran', 'القرآن', 'حلقات للأطفال بمناهج مناسبة، معلمون مؤهلون، مسابقات في الحفظ والتجويد وجوائز قيّمة.'], ['fa-bowl-rice', 'الغذاء والأسرة', 'لحوم طازجة، كراتين رمضان، كسوة عيد، ووجبات ساخنة تصل إلى البيوت بكرامة.']].map(t => <article class="track-card reveal"><div>{icon(t[0])}</div><h3>{t[1]}</h3><p>{t[2]}</p></article>)}</div></section>
  </Layout>
}

function Volunteers({ user }: { user?: any }) {
  const roles = [['fa-people-carry-box', 'تطوع ميداني'], ['fa-user-doctor', 'تطوع طبي'], ['fa-laptop-code', 'تطوع رقمي'], ['fa-chalkboard-user', 'تطوع تعليمي'], ['fa-bullhorn', 'توعية وحملات'], ['fa-people-roof', 'رعاية أسر']]
  return <Layout user={user} title="تطوع معنا | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="كن جزءًا من الحكاية" title={'قد لا تتبرع بالمال،<br/><em>لكن وقتك ثروة.</em>'} text="موهبتك، خبرتك، أو حتى ساعتان من يومك قد تصنع فرقًا حقيقيًا في حياة إنسان." />
    <section class="roles section-pad">
      <div class="role-grid">{roles.map(r => <article class="role-card reveal">{icon(r[0])}<h3>{r[1]}</h3><p>شارك بمهارتك ضمن فريق يؤمن أن العمل المنظم والرحيم يصنع أثرًا أكبر.</p></article>)}</div>
      <form class="application-form ajax-form reveal" data-endpoint="/api/volunteers" method="post" id="volForm">
        <p class="eyebrow">طلب انضمام</p>
        <h2>أخبرنا كيف تحب أن تساعد.</h2>
        <div class="form-grid">
          <label>الاسم<input name="name" required /></label>
          <label>العمر<input name="age" type="number" min="16" /></label>
          <label>الهاتف<input name="phone" required /></label>
          <label>المدينة<input name="city" /></label>
          <label>المجال المفضل<select name="role">{roles.map(r => <option>{r[1]}</option>)}</select></label>
          <label>مهاراتك<input name="skills" /></label>
        </div>
        <button class="primary-btn">أرسل طلبي {icon('fa-arrow-left')}</button>
      </form>
    </section>
  </Layout>
}

function News({ news = [], user }: { news?: any[], user?: any }) {
  const renderNews = news.length > 0 ? news : defaultNews

  return <Layout user={user} title="الأخبار | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="يوميات الأثر" title={'كل خبر هنا،<br/><em>وراءه قلبٌ أضاء.</em>'} text="تابع أنشطتنا ومبادراتنا، وشاهد كيف يتحول العطاء إلى قصص حقيقية على الأرض." />
    <section class="listing-section section-pad">
      <div class="news-grid news-all">
        {renderNews.map((n, i) => {
          const isDoc = typeof n.id !== 'undefined'
          const title = isDoc ? n.title : n[0]
          const cat = isDoc ? n.category : n[1]
          const excerpt = isDoc ? n.excerpt : n[2]
          const ic = isDoc ? (n.icon || 'fa-newspaper') : n[3]
          const date = isDoc ? new Date(n.publish_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : '١٢ يوليو ٢٠٢٦'
          const img = isDoc ? n.image_url : null

          return <article class={`news-card reveal ${i === 0 ? 'featured' : ''}`}>
            <div class="news-art" style={img ? `background-image:url(${img});background-size:cover;background-position:center;color:transparent;` : ''}>
              {!img && icon(ic)}
              <span style={img ? 'background:rgba(12,74,63,0.8);color:white' : ''}>{cat}</span>
            </div>
            <div>
              <time>{date}</time>
              <h3>{title}</h3>
              <p>{excerpt}</p>
              <a href={isDoc ? `/news/${n.id}` : '#'}>اقرأ القصة {icon('fa-arrow-left')}</a>
            </div>
          </article>
        })}
      </div>
    </section>
  </Layout>
}

function NewsDetail({ n, user }: { n: any, user?: any }) {
  const date = new Date(n.publish_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
  return <Layout user={user} title={`${n.title} | مؤسسة الدكتور عمر هشام`}>
    <section class="page-hero" style="min-height:50vh; display:flex; flex-direction:column; justify-content:center">
      <a href="/news" class="back-link" style="margin-bottom:1.5rem">{icon('fa-arrow-right')} كل الأخبار</a>
      <span class="category-chip" style="margin:0 auto">{n.category || 'أخبار'}</span>
      <h1 style="font-size:clamp(1.8rem, 4vw, 3rem); margin: 1rem 0">{n.title}</h1>
      <time style="color:var(--muted); font-size:.9rem">{date}</time>
    </section>
    <section class="section-pad" style="max-width:800px; margin:0 auto; padding-top:0">
      {n.image_url && <img src={n.image_url} alt={n.title} style="width:100%; border-radius:16px; margin-bottom:2rem; object-fit:cover; max-height:400px; box-shadow:var(--shadow);" />}
      <div style="font-size:1.15rem; line-height:1.8; color:var(--text); white-space:pre-wrap">
        {n.content}
      </div>
    </section>
  </Layout>
}

function FAQ({ user }: { user?: any }) {
  const qs = [
    ['كيف يمكنني التبرع للمؤسسة؟', 'يمكنك التبرع عبر إنستاباي بتحويل بنكي إلى البنك الزراعي المصري، حساب 10010397596901014، أو عبر إنستاباي/فودافون كاش على 01060920249، أو التبرع النقدي المباشر بالتنسيق مع الأستاذ جمال عبد الخالق.'],
    ['ما مجالات عمل المؤسسة؟', 'نعمل في الدعم الصحي، وتوزيع الغذاء، ودعم التعليم، ومسابقات القرآن، والمشروعات الإنتاجية، وقنوات الزكاة والصدقة، والمشروعات المجتمعية.'],
    ['أين يقع مقر المؤسسة؟', 'يقع مقر المؤسسة في كفر العنانية، محافظة الدقهلية، جمهورية مصر العربية.'],
    ['هل المؤسسة مرخصة رسميًا؟', 'نعم، المؤسسة مسجلة ومرخصة لدى الجهات المختصة وتعمل بكامل الشفافية.'],
    ['ما سعر صك الأضحية؟', 'الصك الخيري: 500 جنيه، والأضحية الكاملة: 11,000 جنيه. تقبل الله منا ومنكم.'],
    ['كيف أتأكد من وصول تبرعي؟', 'نلتزم بأعلى معايير الشفافية، وننشر تقارير الإنفاق والإنجازات باستمرار على منصتنا.']
  ]
  return <Layout user={user} title="الأسئلة الشائعة | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="أسئلة شائعة" title={'الوضوح أولُ<br/><em>خطوات الثقة.</em>'} text="جمعنا أكثر الأسئلة التي تصلنا. وإن لم تجد إجابتك، نحن على بُعد رسالة." />
    <section class="faq-list section-pad">{qs.map((q, i) => <details class="faq-item reveal" open={i === 0}><summary><span>0{i + 1}</span><h3>{q[0]}</h3><i class="fa-solid fa-plus"></i></summary><p>{q[1]}</p></details>)}</section>
  </Layout>
}

function Contact({ user }: { user?: any }) {
  return <Layout user={user} title="تواصل معنا | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="نحن قريبون" title={'رسالتك تصلُ<br/><em>إلى قلبٍ يسمع.</em>'} text="لا تتردد في السؤال أو الاقتراح أو طلب الشراكة. نحن هنا لخدمتكم." />
    <section class="contact-layout section-pad">
      <aside class="contact-info reveal">
        <p class="eyebrow">بيانات التواصل</p>
        <h2>بابنا مفتوح،<br />وقلوبنا كذلك.</h2>
        <a href="tel:01060920249">{icon('fa-phone')}<span><small>اتصل بنا</small><b dir="ltr">01060920249</b></span></a>
        <a href="mailto:info@omarhesham.org">{icon('fa-envelope')}<span><small>راسلنا</small><b>info@omarhesham.org</b></span></a>
        <div>{icon('fa-location-dot')}<span><small>تفضل بزيارتنا</small><b>كفر العنانية، الدقهلية، مصر</b></span></div>
        <div>{icon('fa-clock')}<span><small>مواعيد العمل</small><b>متاحون لخدمتكم — الجمعة إجازة</b></span></div>
      </aside>
      <form class="contact-form ajax-form reveal" data-endpoint="/api/contacts" method="post">
        <div class="form-grid">
          <label>الاسم<input name="name" required /></label>
          <label>البريد الإلكتروني<input name="email" type="email" required /></label>
          <label>الهاتف<input name="phone" /></label>
          <label>الموضوع<select name="subject"><option>استفسار عام</option><option>شراكة</option><option>شكوى أو اقتراح</option><option>إعلام وصحافة</option></select></label>
        </div>
        <label>رسالتك<textarea name="message" rows={6} required placeholder="اكتب رسالتك هنا..."></textarea></label>
        <button class="primary-btn">إرسال الرسالة {icon('fa-paper-plane')}</button>
      </form>
    </section>
  </Layout>
}

function Transparency({ user }: { user?: any }) {
  return <Layout user={user} title="الشفافية المالية | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="الشفافية المالية" title={'كل جنيهٍ أمانة،<br/><em>وكل خطوة موثّقة.</em>'} text="ثقتكم هي رأس مالنا الحقيقي؛ لذلك نلتزم بالوضوح من لحظة استلام التبرع حتى وصوله." />
    <section class="methodology section-pad">{[['fa-file-shield', 'توثيق التبرعات', 'نسجّل كل مساهمة ونربطها بالمسار الذي اختاره المتبرع.'], ['fa-magnifying-glass-chart', 'مراجعة داخلية', 'مراجعة دورية للمصروفات والمستندات وحالات الاستحقاق.'], ['fa-scale-balanced', 'إنفاق مسؤول', 'توجيه الموارد للأولوية والأكثر أثرًا مع تقليل التكلفة التشغيلية.']].map((m, i) => <article class="method-card reveal"><span>0{i + 1}</span>{icon(m[0])}<h3>{m[1]}</h3><p>{m[2]}</p></article>)}</section>
    <section class="promise section-pad"><p class="eyebrow">وعدنا للمتبرع</p><h2>لن نطلب ثقتك فقط،<br /><em>سنستحقّها كل يوم.</em></h2><p>نعمل على إصدار تقارير دورية أكثر تفصيلًا تشمل أبواب الصرف، أعداد المستفيدين، ونسب الإنجاز في كل حملة.</p></section>
  </Layout>
}

function Gallery({ user }: { user?: any }) {
  return <Layout user={user} title="معرض الصور | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="معرض الصور" title={'وجوهٌ ومواقف،<br/><em>تقول ما لا تقوله الأرقام.</em>'} text="لقطات من الميدان، صُنعت فيها الفرحة بأيدي المتطوعين وقلوب المتبرعين." />
    <section class="gallery-grid section-pad">{defaultPrograms.concat(defaultPrograms.slice(0, 2)).map((p, i) => <article class={`gallery-tile tile-${i + 1} reveal`}><div class={`gallery-art tone-${p[3]}`}>{icon(p[0])}<span>لحظة أثر</span></div><p>{p[1]}<small>كفر العنانية</small></p></article>)}</section>
  </Layout>
}

function Events({ events = [], user }: { events?: any[], user?: any }) {
  const renderEvents = events.length > 0 ? events : [
    { title: 'قافلة طبية شاملة', event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), place: 'مستشفى كفر العنانية', type: 'صحة' },
    { title: 'تكريم أوائل الطلبة', event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(), place: 'قاعة المؤسسة', type: 'تعليم' },
    { title: 'يوم المتطوعين المفتوح', event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(), place: 'كفر العنانية', type: 'مجتمع' }
  ]
  return <Layout user={user} title="الفعاليات | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="الفعاليات" title={'نلتقي على الخير،<br/><em>فتكبر الدائرة.</em>'} text="مواعيد قادمة ومساحات مفتوحة للمشاركة وصناعة الأثر معًا." />
    <section class="event-list section-pad">
      {renderEvents.map(e => {
        const dateObj = new Date(e.event_date)
        const day = dateObj.getDate()
        const month = dateObj.toLocaleDateString('ar-EG', { month: 'short' })

        return <article class="event-card reveal">
          <time><b>{day}</b><span>{month}</span></time>
          <div>
            <span class="category-chip">{e.type}</span>
            <h3>{e.title}</h3>
            <p>{icon('fa-location-dot')} {e.place}</p>
          </div>
          <a href="#">التفاصيل {icon('fa-arrow-left')}</a>
        </article>
      })}
    </section>
  </Layout>
}

function Stories({ stories = [], user }: { stories?: any[], user?: any }) {
  const renderStories = stories.length > 0 ? stories : [
    { name: 'أم محمد', role: 'إحدى المستفيدات', content: 'لم تكن المساعدة مجرد دواء؛ كانت رسالة تقول إننا لسنا وحدنا. جزاكم الله عنا كل خير.' },
    { name: 'والد طالبة', role: 'من برنامج التعليم', content: 'حين جاءت المؤسسة لتكريم ابنتي في بيتنا، شعرتُ أن تعبها وتعبنا لم يذهب سدى.' },
    { name: 'متطوع ميداني', role: 'فريق المؤسسة', content: 'دخلتُ لأساعد الآخرين، فوجدت أن التطوع غيّرني أنا أيضًا، وعلّمني معنى النعمة.' }
  ]
  return <Layout user={user} title="قصص النجاح | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="قصص النجاح" title={'أثرٌ يُحكى،<br/><em>وأملٌ ينتقل.</em>'} text="نحفظ خصوصية المستفيدين، ونشارك كلماتهم التي تذكّرنا جميعًا بأن الخير يصل." />
    <section class="stories-grid section-pad">
      {renderStories.map((s: any) => <article class="story-card reveal">
        <div class="stars">{'★'.repeat(s.rating || 5)}</div>
        <blockquote>“{s.content}”</blockquote>
        <div>
          <span>{s.name.slice(0, 2)}</span>
          <p><b>{s.name}</b><small>{s.role}</small></p>
        </div>
      </article>)}
    </section>
  </Layout>
}

function Careers({ jobs = [], user }: { jobs?: any[], user?: any }) {
  return <Layout user={user} title="الوظائف | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="العمل معنا" title={'وظيفةٌ ذات معنى،<br/><em>ومكانٌ ينمو بك.</em>'} text="انضم إلى شبكة مواهبنا وساهم في خدمة مجتمعنا." />

    {jobs.length === 0 ? (
      <section class="empty-state section-pad">
        <div>{icon('fa-briefcase')}<span></span></div>
        <h2>لا توجد فرص مفتوحة حاليًا</h2>
        <p>اترك لنا بياناتك وسنتواصل معك عندما تظهر فرصة تناسب خبرتك.</p>
        <a class="primary-btn" href="/contact">أرسل سيرتك الذاتية {icon('fa-arrow-left')}</a>
      </section>
    ) : (
      <section class="section-pad" style="max-width: 900px; margin: 0 auto">
        <div style="display:flex; flex-direction:column; gap:1.5rem">
          {jobs.map((j: any) => (
            <article class="reveal" style="background:var(--surface); border:1px solid var(--border); padding:1.8rem; border-radius:16px; display:flex; flex-direction:column; gap:1rem">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem">
                <div>
                  <span class="category-chip" style="margin-inline-end:.5rem">{j.department}</span>
                  <span class="category-chip" style="background:rgba(30,136,229,.1); color:var(--blue-600)">{j.job_type}</span>
                  <h3 style="font-size:1.3rem; font-weight:800; margin-top:.7rem">{j.title}</h3>
                </div>
                <span style="color:var(--muted); font-size:.9rem">{icon('fa-location-dot')} {j.location}</span>
              </div>
              <p style="color:var(--text); line-height:1.7">{j.description}</p>
              <button class="primary-btn" onclick={`document.getElementById('applyForm').scrollIntoView({behavior:'smooth'}); document.getElementsByName('job_id')[0].value='${j.id}'`} style="align-self:flex-start">التقديم للوظيفة {icon('fa-arrow-left')}</button>
            </article>
          ))}
        </div>

        <form class="application-form ajax-form reveal" data-endpoint="/api/jobs/apply" method="post" id="applyForm" style="margin-top:4rem">
          <input type="hidden" name="job_id" value="" />
          <p class="eyebrow">استمارة التقديم</p>
          <h2>انضم إلى فريق العمل</h2>
          <div class="form-grid">
            <label>الاسم الكامل<input name="full_name" required /></label>
            <label>البريد الإلكتروني<input name="email" type="email" required /></label>
            <label>رقم الهاتف<input name="phone" required /></label>
            <label>رابط السيرة الذاتية (Google Drive/Dropbox)<input name="cv_url" placeholder="http://..." required /></label>
          </div>
          <label>نبذة عنك وخبراتك<textarea name="bio" rows={4} placeholder="اكتب هنا..."></textarea></label>
          <button class="primary-btn">تقديم الطلب {icon('fa-arrow-left')}</button>
        </form>
      </section>
    )}
  </Layout>
}

function Login({ firebaseConfig }: { firebaseConfig: any }) {
  return <Layout title="تسجيل الدخول | مؤسسة الدكتور عمر هشام" pageType="auth">
    <section class="auth-page">
      <div class="auth-story">
        <img src="/static/foundation-logo.png" alt="" />
        <p class="eyebrow">مساحتك الخاصة</p>
        <h1>تابع أثر عطائك،<br /><em>خطوةً بخطوة.</em></h1>
        <p>سجّل الدخول لمتابعة تبرعاتك وحالة طلب التطوع وتحديث بياناتك.</p>
      </div>

      <div class="auth-form-container" style="background:var(--surface); border:1px solid var(--border); padding:2.5rem; border-radius:24px; box-shadow:var(--sh-xs); max-width:460px; width:100%">
        <h2>مرحبًا بك في منصّة الأثر</h2>
        <p style="color:var(--muted); margin-bottom:2rem">سجّل دخولك بواسطة Google للوصول إلى لوحة التحكم أو الحساب الشخصي.</p>

        <div id="authError" role="alert" aria-live="assertive" style="display:none;background:rgba(231,76,60,.12);color:#c0392b;padding:.8rem 1.2rem;border-radius:.6rem;margin-bottom:1.2rem;font-weight:600;font-size:.9rem;text-align:center"></div>

        <button id="googleLoginButton" type="button" aria-describedby="authError" class="primary-btn" style="display:flex;align-items:center;justify-content:center;gap:.8rem;background:#fff;color:#333;border:1px solid #ddd;width:100%;margin-bottom:1.5rem;cursor:pointer; font-weight:bold; height:50px; border-radius:12px">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" style="width:24px;height:24px" />
          <span>تسجيل الدخول بواسطة Google</span>
        </button>

        <div style="display:flex;align-items:center;gap:1rem;margin:1.5rem 0;color:var(--muted)">
          <span style="flex:1;height:1px;background:var(--border)"></span>
          <span>أو</span>
          <span style="flex:1;height:1px;background:var(--border)"></span>
        </div>

        <a href="/" class="guest-button">{icon('fa-compass')} المتابعة كزائر</a>
        <p class="guest-note">يمكن للزوار تصفح الصفحات العامة، بينما تظل لوحة التحكم محمية للمشرفين فقط.</p>
      </div>
    </section>

    <script dangerouslySetInnerHTML={{
      __html: `
      (function () {
        const firebaseConfig = ${JSON.stringify(firebaseConfig)};
        const googleButton = document.getElementById('googleLoginButton');
        const buttonLabel = googleButton ? googleButton.querySelector('span') : null;
        const errorBox = document.getElementById('authError');
        const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
        const defaultButtonLabel = 'تسجيل الدخول بواسطة Google';

        function showError(message) {
          if (!errorBox) return;
          errorBox.textContent = message;
          errorBox.style.display = 'block';
          errorBox.focus?.();
        }

        function clearError() {
          if (!errorBox) return;
          errorBox.textContent = '';
          errorBox.style.display = 'none';
        }

        function setLoading(isLoading) {
          if (!googleButton || !buttonLabel) return;
          googleButton.disabled = isLoading;
          googleButton.setAttribute('aria-busy', String(isLoading));
          googleButton.style.cursor = isLoading ? 'wait' : 'pointer';
          googleButton.style.opacity = isLoading ? '0.75' : '1';
          buttonLabel.textContent = isLoading ? 'جارٍ فتح نافذة Google...' : defaultButtonLabel;
        }

        function getFriendlyError(error) {
          const code = error && error.code ? error.code : '';
          if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
            return 'تم إلغاء تسجيل الدخول. اضغط على الزر للمحاولة مرة أخرى.';
          }
          if (code === 'auth/popup-blocked') {
            return 'المتصفح منع نافذة Google. اسمح بالنوافذ المنبثقة ثم حاول مرة أخرى.';
          }
          if (code === 'auth/unauthorized-domain') {
            return 'هذا النطاق غير مصرح له في إعدادات Firebase. يرجى التواصل مع إدارة الموقع.';
          }
          if (code === 'auth/operation-not-allowed') {
            return 'تسجيل الدخول بواسطة Google غير مفعّل في Firebase.';
          }
          return error && error.message
            ? 'فشل تسجيل الدخول: ' + error.message
            : 'تعذر تسجيل الدخول الآن. يرجى المحاولة مرة أخرى.';
        }

        async function loginWithGoogle() {
          clearError();

          if (!isConfigured) {
            showError('إعدادات Firebase غير مكتملة. يرجى التواصل مع إدارة الموقع.');
            return;
          }

          setLoading(true);
          try {
            const modules = await Promise.all([
              import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js'),
              import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js')
            ]);
            const firebaseApp = modules[0];
            const firebaseAuth = modules[1];
            const app = firebaseApp.getApps().length
              ? firebaseApp.getApp()
              : firebaseApp.initializeApp(firebaseConfig);
            const auth = firebaseAuth.getAuth(app);
            const provider = new firebaseAuth.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            const result = await firebaseAuth.signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken(true);
            const response = await fetch('/api/auth/session', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken })
            });
            const data = await response.json().catch(function () { return {}; });

            if (!response.ok || !data.success) {
              throw new Error(data.error || 'تعذر إنشاء جلسة تسجيل الدخول.');
            }

            const displayName = result.user.displayName || 'صديق المؤسسة';
            localStorage.setItem('just_logged_in', 'true');
            localStorage.setItem('user_display_name', displayName);

            const container = document.querySelector('.auth-form-container');
            if (container) {
              container.innerHTML = '<div style="text-align:center;padding:2.5rem 0;display:flex;flex-direction:column;align-items:center;gap:1.5rem">' +
                '<div style="width:70px;height:70px;border-radius:50%;background:var(--gold);color:var(--ink);display:grid;place-items:center;font-size:2rem;box-shadow:0 10px 25px rgba(214,166,75,0.3)"><i class="fa-solid fa-hands-praying"></i></div>' +
                '<div><h2 id="loginWelcome" style="margin:0 0 8px;font-size:1.8rem;font-weight:800;color:var(--text)"></h2><p style="color:var(--muted);margin:0;font-size:0.95rem">تم تسجيل الدخول بنجاح.</p></div>' +
                '<div style="font-size:0.88rem;color:var(--emerald);font-weight:800;display:flex;align-items:center;gap:8px;margin-top:0.5rem"><i class="fa-solid fa-circle-notch fa-spin"></i><span>جارٍ توجيهك إلى حسابك...</span></div>' +
              '</div>';
              const welcome = document.getElementById('loginWelcome');
              if (welcome) welcome.textContent = 'أهلًا بك، ' + displayName;
            }

            window.setTimeout(function () {
              window.location.assign('/profile');
            }, 1400);
          } catch (error) {
            console.error('[Google Login Error]', error);
            showError(getFriendlyError(error));
            setLoading(false);
          }
        }

        if (googleButton) {
          googleButton.addEventListener('click', loginWithGoogle);
        }

        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        if (error) {
          const messages = {
            unauthorized: 'يرجى تسجيل الدخول أولًا للوصول إلى لوحة التحكم.',
            not_admin: 'ليس لديك صلاحية الوصول إلى لوحة التحكم. تواصل مع المدير.',
            cancelled: 'تم إلغاء عملية تسجيل الدخول.'
          };
          showError(messages[error] || 'حدث خطأ غير متوقع.');
          history.replaceState(null, '', '/login');
        }
      }());
    `}} />
  </Layout>
}

function Profile({ user, donations = [], volunteer }: { user: any, donations?: any[], volunteer?: any }) {
  // Calculate statistics
  const completedDonations = donations.filter((d: any) => d.status === 'completed')
  const totalDonated = completedDonations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0)
  const donationsCount = completedDonations.length

  // Determine Donation Tier
  let tierName = 'صديق المؤسسة'
  let tierClass = 'none'
  let tierIcon = 'fa-user'

  if (totalDonated >= 5000) {
    tierName = 'متبرع ذهبي ✦'
    tierClass = 'gold'
    tierIcon = 'fa-award'
  } else if (totalDonated >= 1000) {
    tierName = 'متبرع فضي ✦'
    tierClass = 'silver'
    tierIcon = 'fa-medal'
  } else if (totalDonated > 0) {
    tierName = 'متبرع برونزي'
    tierClass = 'bronze'
    tierIcon = 'fa-ribbon'
  }

  // Get user avatar initials
  const initials = user.name ? user.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('') : 'ف خ'

  return <Layout user={user} title="حسابي | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="ملفي الشخصي" title={'لوحة التحكم الشخصية<br/><em>شركاء الخير والعطاء.</em>'} text="مرحبًا بك في مساحتك الخاصة بالمؤسسة. يمكنك متابعة مساهماتك، حالة تطوعك، وإدارة ملفك الشخصي." />

    <section class="section-pad" style="padding-top: 0">
      {/* Premium Header Banner */}
      <div class="profile-header reveal">
        <div class="profile-user-info">
          <div class="profile-user-avatar">{initials}</div>
          <div class="profile-user-details">
            <h1>{user.name}</h1>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
              <span class="role-pill">
                {icon(user.role === 'admin' ? 'fa-user-shield' : 'fa-user')} {user.role === 'admin' ? 'مشرف الموقع' : 'عضو المؤسسة'}
              </span>
              {totalDonated > 0 && (
                <span class={`profile-badge-tier ${tierClass}`}>
                  {icon(tierIcon)} {tierName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div class="profile-quick-stats">
          <div class="profile-stat-box">
            <span>إجمالي العطاء</span>
            <strong>{(totalDonated).toLocaleString('ar-EG')} <small style="font-size:0.75rem">ج.م</small></strong>
          </div>
          <div class="profile-stat-box">
            <span>عدد المساهمات</span>
            <strong>{donationsCount.toLocaleString('ar-EG')} <small style="font-size:0.75rem">مساهمة</small></strong>
          </div>
          <div class="profile-stat-box">
            <span>حالة العضوية</span>
            <strong>نشط</strong>
          </div>
        </div>
      </div>

      {/* Main Profile Grid Layout */}
      <div class="profile-layout">

        {/* Right Column: History & Activities */}
        <div style="display: flex; flex-direction: column; gap: 25px">

          {/* Donations Card */}
          <div class="profile-card-modern reveal">
            <h3>{icon('fa-hand-holding-dollar')} سجل التبرعات والمساهمات</h3>

            {donations.length === 0 ? (
              <div class="profile-empty-donations">
                <i class="fa-solid fa-heart-pulse"></i>
                <h4>لا توجد تبرعات مسجلة حتى الآن</h4>
                <p>عطاؤك المستمر هو النور الذي يضيء دروب المحتاجين ويصنع فرقًا حقيقيًا.</p>
                <a class="primary-btn" href="/donate">ابدأ أول مساهمة الآن {icon('fa-heart')}</a>
              </div>
            ) : (
              <div class="dash-table" style="box-shadow:none; padding:0; background:transparent">
                <table class="profile-donations-table" style="width:100%; border-collapse:collapse">
                  <thead>
                    <tr style="border-bottom: 2px solid var(--line)">
                      <th style="text-align:right; padding:15px; font-weight:800; color:var(--text)">الحملة والمجال</th>
                      <th style="text-align:right; padding:15px; font-weight:800; color:var(--text)">المبلغ</th>
                      <th style="text-align:right; padding:15px; font-weight:800; color:var(--text)">التاريخ</th>
                      <th style="text-align:right; padding:15px; font-weight:800; color:var(--text)">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d: any) => {
                      const date = new Date(d.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
                      const isCompleted = d.status === 'completed'

                      return <tr style="border-bottom:1px solid var(--line)">
                        <td data-label="الحملة والمجال" style="padding:15px; font-weight: 600; color: var(--text)">{d.campaign_title || 'الصندوق العام'}</td>
                        <td data-label="المبلغ" style="padding:15px; font-weight:bold; color:var(--emerald)">{Number(d.amount).toLocaleString('ar-EG')} ج.م</td>
                        <td data-label="التاريخ" style="padding:15px; color:var(--muted); font-size: 0.9rem">{date}</td>
                        <td data-label="الحالة" style="padding:15px">
                          <span style={`font-size:.78rem; padding:6px 12px; border-radius:8px; font-weight:800; background:${isCompleted ? 'rgba(22,138,112,.09)' : 'rgba(245,124,0,.09)'}; color:${isCompleted ? 'var(--emerald)' : 'var(--gold)'}; border: 1px solid ${isCompleted ? 'rgba(22,138,112,.15)' : 'rgba(245,124,0,.15)'}`}>
                            {isCompleted ? 'مكتمل' : 'قيد المراجعة'}
                          </span>
                        </td>
                      </tr>
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Volunteering Card */}
          <div class="profile-card-modern reveal">
            <h3>{icon('fa-people-group')} مسيرتك التطوعية</h3>

            {volunteer ? (
              <div style="background:var(--ivory); border:1px solid var(--line); padding:25px; border-radius:20px; display:flex; flex-direction:column; gap:15px">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px">
                  <div>
                    <h4 style="margin:0 0 5px; font-weight:800; font-size:1.15rem">{volunteer.preferred_role}</h4>
                    <span style="font-size:0.85rem; color:var(--muted)">رقم الهاتف: {volunteer.phone}</span>
                  </div>
                  <span class={`profile-vol-badge ${volunteer.status === 'approved' ? 'approved' : volunteer.status === 'rejected' ? 'rejected' : 'pending'}`}>
                    {volunteer.status === 'approved' ? icon('fa-circle-check') : volunteer.status === 'rejected' ? icon('fa-circle-xmark') : icon('fa-clock')}
                    {volunteer.status === 'approved' ? 'عضو متطوع نشط' : volunteer.status === 'rejected' ? 'مرفوض حاليًا' : 'طلب قيد المراجعة'}
                  </span>
                </div>
                <p style="margin: 0; font-size:0.92rem; color:var(--muted); line-height:1.6">
                  {volunteer.status === 'approved'
                    ? 'أهلاً بك في عائلة متطوعي مؤسسة الدكتور عمر هشام. سنقوم بالتواصل معك قريباً للمشاركة في مبادراتنا الميدانية والمجتمعية القادمة.'
                    : volunteer.status === 'rejected'
                      ? 'نشكرك على اهتمامك ورغبتك بالتطوع. تعذر قبول طلبك حالياً، ونرحب بتقديمك مجدداً في المبادرات المستقبلية.'
                      : 'نقوم بمراجعة طلبك وخبراتك للتأكد من ملاءمتها للمشاريع الحالية. سيقوم فريق العمل بالتواصل معك فور اعتماد الطلب.'}
                </p>
              </div>
            ) : (
              <div class="profile-vol-incentive">
                <div class="profile-vol-incentive-text">
                  <h4>هل ترغب في ترك أثر بوقتك وجهدك؟</h4>
                  <p>باب التطوع مفتوح للمساهمة في القوافل الطبية والمجتمعية والتعليمية.</p>
                </div>
                <a class="primary-btn magnetic" href="/volunteers">قدم طلب تطوع الآن {icon('fa-hand-holding-hand')}</a>
              </div>
            )}
          </div>

        </div>

        {/* Left Column: Account Info & Actions */}
        <div style="display: flex; flex-direction: column; gap: 25px">

          {/* Settings Card */}
          <div class="profile-card-modern reveal">
            <h3>{icon('fa-id-card')} تعديل بيانات الحساب</h3>
            <form class="ajax-form" data-endpoint="/api/profile/update" method="post" style="display:flex; flex-direction:column; gap:1.2rem">
              <label>الاسم الكامل
                <input name="full_name" value={user.name} required style="background:var(--ivory); font-weight:600" />
              </label>
              <label>البريد الإلكتروني
                <input name="email" value={user.email} disabled style="background:var(--line); color:var(--muted); cursor:not-allowed" />
              </label>
              <label>رقم الهاتف
                <input name="phone" value={user.phone || ''} placeholder="01xxxxxxxxx" style="background:var(--ivory); font-weight:600" />
              </label>
              <button class="primary-btn submit-btn" type="submit" style="width:100%; justify-content:center">حفظ التغييرات</button>
            </form>
          </div>

          {/* Quick Actions Card */}
          <div class="profile-card-modern reveal" style="padding: 25px">
            <h3>{icon('fa-gears')} إجراءات سريعة</h3>
            <div style="display:flex; flex-direction:column; gap:12px">
              {user.role === 'admin' && (
                <a href="/dashboard" class="outline-btn" style="width:100%; border-color:var(--gold); color:var(--text); text-align:center; display:flex; justify-content:center">
                  {icon('fa-gauge-high')} لوحة تحكم المشرفين
                </a>
              )}
              <a href="/api/auth/logout" class="primary-btn" style="background:#e86f51; color:#fff; border:none; width:100%; text-align:center; display:flex; justify-content:center">
                تسجيل الخروج {icon('fa-right-from-bracket')}
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>

    <script dangerouslySetInnerHTML={{
      __html: `
      (function() {
        if (localStorage.getItem('just_logged_in') === 'true') {
          const userName = localStorage.getItem('user_display_name') || 'صديقنا العزيز';
          localStorage.removeItem('just_logged_in');
          localStorage.removeItem('user_display_name');
          
          // Load confetti script
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
          script.onload = function() {
            const duration = 2.5 * 1000;
            const end = Date.now() + duration;

            (function frame() {
              confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 }
              });
              confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 }
              });

              if (Date.now() < end) {
                requestAnimationFrame(frame);
              }
            }());
          };
          document.head.appendChild(script);
          
          // Show toast after a slight delay
          setTimeout(() => {
            if (window.showToast) {
              window.showToast("أهلاً بك معنا يا " + userName + " في عائلة المؤسسة! ✦", "subscribe");
            }
          }, 800);
        }
      })();
      `
    }} />
  </Layout>
}

// Admin Dashboard Components
function Dashboard({ view, data, user }: { view: string, data: any, user: any }) {
  const sideMenu = [
    ['fa-chart-pie', 'نظرة عامة', 'overview'],
    ['fa-bullseye', 'الحملات', 'campaigns'],
    ['fa-hand-holding-dollar', 'التبرعات', 'donations'],
    ['fa-people-group', 'المتطوعون', 'volunteers'],
    ['fa-users-gear', 'المستخدمون', 'users'],
    ['fa-envelope', 'الرسائل', 'contacts'],
    ['fa-newspaper', 'الأخبار', 'news'],
    ['fa-calendar', 'الفعاليات', 'events'],
    ['fa-heart', 'قصص النجاح', 'stories'],
    ['fa-briefcase', 'الوظائف', 'jobs'],
    ['fa-envelope-open-text', 'النشرة البريدية', 'newsletter']
  ]

  const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })

  return <Layout user={user} title="لوحة التحكم | مؤسسة الدكتور عمر هشام" pageType="dashboard">
    <section class="dashboard-wrap">
      <aside class="dash-sidebar" aria-label="تنقل لوحة التحكم">
        <div class="dash-brand"><a href="/" style="display:flex;align-items:center;gap:15px;color:inherit;text-decoration:none"><img src="/static/foundation-logo.png" alt="" /><span><small>مؤسسة الدكتور عمر هشام</small>لوحة التحكم</span></a><button id="dash-menu-close" type="button" aria-label="إغلاق القائمة">{icon('fa-xmark')}</button></div>
        <nav>{sideMenu.map((n) => <a class={view === n[2] ? 'active' : ''} href={`/dashboard?view=${n[2]}`} aria-current={view === n[2] ? 'page' : undefined}>{icon(n[0])}<span>{n[1]}</span></a>)}</nav>
        <div class="dash-sidebar-footer"><a href="/">{icon('fa-arrow-up-right-from-square')}<span>عرض الموقع</span></a><a href="/api/auth/logout">{icon('fa-right-from-bracket')}<span>تسجيل الخروج</span></a></div>
      </aside>
      <button class="dash-backdrop" type="button" aria-label="إغلاق القائمة"></button>
      <div class="dash-main">
        <header class="dash-topbar">
          <button class="dash-menu-button" id="dash-menu-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false">{icon('fa-bars-staggered')}</button>
          <div><p>{dateStr}</p><h1>مرحبًا، {user.name}</h1></div>
          <div class="dash-top-actions"><button id="theme-toggle" type="button" aria-label="تغيير المظهر">{icon('fa-moon')}</button><span>{icon('fa-user-shield')}</span><b>{user.name}</b></div>
        </header>

        {view === 'overview' && <DashOverview stats={data.stats} recentDonations={data.recentDonations} />}
        {view === 'campaigns' && <DashCampaigns list={data.list} />}
        {view === 'donations' && <DashDonations list={data.list} />}
        {view === 'volunteers' && <DashVolunteers list={data.list} />}
        {view === 'contacts' && <DashContacts list={data.list} />}
        {view === 'news' && <DashNews list={data.list} />}
        {view === 'events' && <DashEvents list={data.list} />}
        {view === 'stories' && <DashStories list={data.list} />}
        {view === 'jobs' && <DashJobs list={data.list} />}
        {view === 'newsletter' && <DashNewsletter list={data.list} />}
        {view === 'users' && <DashUsers list={data.list} currentUserId={user.id} />}
      </div>
    </section>
  </Layout>
}

function DashOverview({ stats, recentDonations = [] }: { stats: any, recentDonations?: any[] }) {
  const items = [
    ['إجمالي التبرعات', `${(stats.total_donations || 0).toLocaleString('ar-EG')} ج.م`, 'fa-hand-holding-heart'],
    ['الحملات النشطة', `${stats.total_campaigns || 0}`, 'fa-bullseye'],
    ['المتبرعون', `${stats.total_donors || 0}`, 'fa-users'],
    ['طلبات التطوع', `${stats.total_volunteers || 0}`, 'fa-people-group']
  ]
  return <>
    <div class="kpi-grid">
      {items.map(k => <article><div>{icon(k[2])}</div><p>{k[0]}</p><b>{k[1]}</b></article>)}
    </div>
    <section class="dash-table" style="margin-top:2rem">
      <header><h3>أحدث التبرعات</h3></header>
      <table>
        <thead>
          <tr>
            <th>المتبرع</th>
            <th>الحملة</th>
            <th>المبلغ</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {recentDonations.map((r: any) => {
            const isCompleted = r.status === 'completed'
            return <tr>
              <td>{r.donor_name}</td>
              <td>{r.campaign_title || 'الصندوق العام'}</td>
              <td>{Number(r.amount).toLocaleString('ar-EG')} ج.م</td>
              <td>
                <span style={`padding:2px 8px; border-radius:4px; font-weight:600; background:${isCompleted ? 'rgba(67,160,71,.15)' : 'rgba(245,124,0,.15)'}; color:${isCompleted ? 'var(--emerald-600)' : 'var(--gold-600)'}`}>
                  {isCompleted ? 'مكتمل' : 'معلق'}
                </span>
              </td>
            </tr>
          })}
        </tbody>
      </table>
    </section>
  </>
}

function DashCampaigns({ list = [] }: { list: any[] }) {
  return <>
    <section class="dash-table">
      <header><h3>الحملات الحالية</h3></header>
      <table>
        <thead>
          <tr>
            <th>العنوان</th>
            <th>القسم</th>
            <th>الهدف</th>
            <th>المجمع</th>
            <th>عاجل</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c: any) => (
            <tr>
              <td>{c.title}</td>
              <td>{c.category}</td>
              <td>{Number(c.goal).toLocaleString('ar-EG')} ج.م</td>
              <td>{Number(c.raised || 0).toLocaleString('ar-EG')} ج.م</td>
              <td>{c.is_urgent ? 'نعم' : 'لا'}</td>
              <td>
                <form action={`/api/campaigns/delete/${c.id}`} method="post" class="dash-action-form" data-confirm="هل أنت متأكد من حذف هذه الحملة؟">
                  <button type="submit" style="background:#ff6b6b; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">حذف</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/campaigns/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:600px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة حملة جديدة</h3>
        <label>عنوان الحملة<input name="title" required /></label>
        <label>القسم<input name="category" placeholder="صحة، غذاء، تعليم" required /></label>
        <label>المبلغ المستهدف (ج.م)<input type="number" name="goal" required /></label>
        <input type="hidden" name="image_url" class="cloudinary-url" />
        <div class="upload-widget">
          <label>صورة الحملة</label>
          <div class="upload-drop-zone">
            <input type="file" accept="image/*,video/*" class="upload-file-input" />
            <div class="upload-placeholder"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span><small>JPG, PNG, WEBP — حد أقصى 10 ميجا</small></div>
            <img class="upload-preview" style="display:none" alt="معاينة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>
        <label style="display:flex; align-items:center; gap:.5rem"><input type="checkbox" name="is_urgent" value="true" /> حملة عاجلة؟</label>
        <label>الوصف<textarea name="description" rows={3}></textarea></label>
        <button class="primary-btn" type="submit">حفظ الحملة</button>
      </form>
    </section>
  </>
}

function DashDonations({ list = [] }: { list: any[] }) {
  return <section class="dash-table">
    <header><h3>إدارة عمليات التبرع</h3></header>
    <table>
      <thead>
        <tr>
          <th>المتبرع</th>
          <th>الهاتف</th>
          <th>المبلغ</th>
          <th>طريقة الدفع</th>
          <th>الحالة</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {list.map((d: any) => {
          const isCompleted = d.status === 'completed'
          return <tr>
            <td>{d.donor_name}</td>
            <td>{d.donor_phone}</td>
            <td>{Number(d.amount).toLocaleString('ar-EG')} ج.م</td>
            <td>{d.payment_method}</td>
            <td>
              <span style={`padding:2px 8px; border-radius:4px; font-weight:600; background:${isCompleted ? 'rgba(67,160,71,.15)' : 'rgba(245,124,0,.15)'}; color:${isCompleted ? 'var(--emerald-600)' : 'var(--gold-600)'}`}>
                {isCompleted ? 'مكتمل' : 'معلق'}
              </span>
            </td>
            <td>
              {!isCompleted && (
                <form action={`/api/donations/status/${d.id}`} method="post" style="display:inline">
                  <input type="hidden" name="status" value="completed" />
                  <button type="submit" style="background:var(--emerald-600); color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">تأكيد الدفع</button>
                </form>
              )}
            </td>
          </tr>
        })}
      </tbody>
    </table>
  </section>
}

function DashVolunteers({ list = [] }: { list: any[] }) {
  return <section class="dash-table">
    <header><h3>طلبات التطوع الحالية</h3></header>
    <table>
      <thead>
        <tr>
          <th>الاسم</th>
          <th>الهاتف</th>
          <th>المدينة</th>
          <th>المجال</th>
          <th>المهارات</th>
          <th>الحالة</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {list.map((v: any) => {
          const isApproved = v.status === 'approved'
          return <tr>
            <td>{v.full_name}</td>
            <td>{v.phone}</td>
            <td>{v.city}</td>
            <td>{v.preferred_role}</td>
            <td>{v.skills}</td>
            <td>
              <span style={`padding:2px 8px; border-radius:4px; font-weight:600; background:${isApproved ? 'rgba(67,160,71,.15)' : v.status === 'rejected' ? 'rgba(231,76,60,.15)' : 'rgba(245,124,0,.15)'}; color:${isApproved ? 'var(--emerald-600)' : v.status === 'rejected' ? '#e53935' : 'var(--gold-600)'}`}>
                {v.status === 'approved' ? 'مقبول' : v.status === 'rejected' ? 'مرفوض' : 'معلق'}
              </span>
            </td>
            <td>
              {v.status === 'pending' && <>
                <form action={`/api/volunteers/status/${v.id}`} method="post" style="display:inline; margin-inline-end:.3rem">
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" style="background:var(--emerald-600); color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">قبول</button>
                </form>
                <form action={`/api/volunteers/status/${v.id}`} method="post" style="display:inline">
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" style="background:#ff6b6b; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">رفض</button>
                </form>
              </>}
            </td>
          </tr>
        })}
      </tbody>
    </table>
  </section>
}

function DashContacts({ list = [] }: { list: any[] }) {
  return <section class="dash-table">
    <header><h3>الرسائل الواردة</h3></header>
    <table>
      <thead>
        <tr>
          <th>الاسم</th>
          <th>الهاتف / الإيميل</th>
          <th>الموضوع</th>
          <th>الرسالة</th>
          <th>الحالة</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {list.map((c: any) => {
          const isRead = c.status === 'read'
          return <tr>
            <td>{c.name}</td>
            <td>{c.phone} / {c.email}</td>
            <td>{c.subject}</td>
            <td style="max-width:300px; white-space:pre-wrap">{c.message}</td>
            <td>{isRead ? 'مقروءة' : 'جديدة'}</td>
            <td>
              {!isRead && (
                <form action={`/api/contacts/status/${c.id}`} method="post" style="display:inline">
                  <input type="hidden" name="status" value="read" />
                  <button type="submit" style="background:var(--blue-600); color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">تحديد كمقروءة</button>
                </form>
              )}
            </td>
          </tr>
        })}
      </tbody>
    </table>
  </section>
}

function DashNews({ list = [] }: { list: any[] }) {
  return <>
    <section class="dash-table">
      <header><h3>الأخبار المنشورة</h3></header>
      <table>
        <thead>
          <tr>
            <th>العنوان</th>
            <th>القسم</th>
            <th>موجز</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((n: any) => (
            <tr>
              <td>{n.title}</td>
              <td>{n.category}</td>
              <td style="max-width:300px">{n.excerpt}</td>
              <td>
                <form action={`/api/news/delete/${n.id}`} method="post" style="display:inline">
                  <button type="submit" style="background:#ff6b6b; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">حذف</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/news/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:600px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة خبر جديد</h3>
        <label>عنوان الخبر<input name="title" required /></label>
        <label>القسم<input name="category" placeholder="صحة، مجتمع، تعليم" required /></label>
        <input type="hidden" name="image_url" class="cloudinary-url" />
        <div class="upload-widget">
          <label>صورة الخبر</label>
          <div class="upload-drop-zone">
            <input type="file" accept="image/*,video/*" class="upload-file-input" />
            <div class="upload-placeholder"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span><small>JPG, PNG, WEBP — حد أقصى 10 ميجا</small></div>
            <img class="upload-preview" style="display:none" alt="معاينة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>
        <label>موجز الخبر (يظهر في القائمة)<input name="excerpt" required /></label>
        <label>محتوى الخبر بالكامل<textarea name="content" rows={6} required></textarea></label>
        <button class="primary-btn" type="submit">نشر الخبر</button>
      </form>
    </section>
  </>
}

function DashEvents({ list = [] }: { list: any[] }) {
  return <>
    <section class="dash-table">
      <header><h3>الفعاليات الحالية</h3></header>
      <table>
        <thead>
          <tr>
            <th>الفعالية</th>
            <th>النوع</th>
            <th>المكان</th>
            <th>التاريخ</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((e: any) => {
            const date = new Date(e.event_date).toLocaleDateString('ar-EG')
            return <tr>
              <td>{e.title}</td>
              <td>{e.type}</td>
              <td>{e.place}</td>
              <td>{date}</td>
              <td>
                <form action={`/api/events/delete/${e.id}`} method="post" style="display:inline">
                  <button type="submit" style="background:#ff6b6b; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">حذف</button>
                </form>
              </td>
            </tr>
          })}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/events/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:600px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة فعالية جديدة</h3>
        <label>اسم الفعالية<input name="title" required /></label>
        <label>نوع الفعالية<input name="type" placeholder="صحة، تعليم، مجتمع" required /></label>
        <label>المكان<input name="place" required /></label>
        <label>التاريخ والوقت<input type="datetime-local" name="event_date" required /></label>
        <input type="hidden" name="image_url" class="cloudinary-url" />
        <div class="upload-widget">
          <label>صورة الفعالية</label>
          <div class="upload-drop-zone">
            <input type="file" accept="image/*,video/*" class="upload-file-input" />
            <div class="upload-placeholder"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span><small>JPG, PNG, WEBP — حد أقصى 10 ميجا</small></div>
            <img class="upload-preview" style="display:none" alt="معاينة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>
        <label>الوصف<textarea name="description" rows={3}></textarea></label>
        <button class="primary-btn" type="submit">حفظ الفعالية</button>
      </form>
    </section>
  </>
}

function DashStories({ list = [] }: { list: any[] }) {
  return <>
    <section class="dash-table">
      <header><h3>قصص النجاح المنشورة</h3></header>
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الدور</th>
            <th>المحتوى</th>
            <th>التقييم</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s: any) => (
            <tr>
              <td>{s.name}</td>
              <td>{s.role}</td>
              <td style="max-width:300px">{s.content}</td>
              <td>{'★'.repeat(s.rating || 5)}</td>
              <td>
                <form action={`/api/stories/delete/${s.id}`} method="post" style="display:inline">
                  <button type="submit" style="background:#ff6b6b; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">حذف</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/stories/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:600px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة قصة نجاح جديدة</h3>
        <label>الاسم<input name="name" placeholder="أحمد م." required /></label>
        <label>الدور / الصفة<input name="role" placeholder="مستفيد، متطوع" required /></label>
        <label>التقييم (1-5)<input type="number" name="rating" min="1" max="5" defaultValue="5" required /></label>
        <label>القصة كاملة<textarea name="content" rows={4} required></textarea></label>
        <button class="primary-btn" type="submit">نشر القصة</button>
      </form>
    </section>
  </>
}

function DashJobs({ list = [] }: { list: any[] }) {
  return <>
    <section class="dash-table">
      <header><h3>فرص العمل الحالية</h3></header>
      <table>
        <thead>
          <tr>
            <th>الوظيفة</th>
            <th>القسم</th>
            <th>النوع</th>
            <th>المكان</th>
            <th>نشط</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((j: any) => (
            <tr>
              <td>{j.title}</td>
              <td>{j.department}</td>
              <td>{j.job_type}</td>
              <td>{j.location}</td>
              <td>{j.is_active ? 'نعم' : 'لا'}</td>
              <td>
                <form action={`/api/jobs/delete/${j.id}`} method="post" style="display:inline">
                  <button type="submit" style="background:#ff6b6b; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">حذف</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/jobs/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:600px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة فرصة عمل جديدة</h3>
        <label>المسمى الوظيفي<input name="title" required /></label>
        <label>القسم<input name="department" placeholder="إدارة، ميداني، طبي" required /></label>
        <label>نوع الوظيفة<input name="job_type" placeholder="دوام كامل، دوام جزئي" required /></label>
        <label>الموقع<input name="location" defaultValue="كفر العنانية" required /></label>
        <label>وصف الوظيفة والمتطلبات<textarea name="description" rows={5} required></textarea></label>
        <label style="display:flex; align-items:center; gap:.5rem"><input type="checkbox" name="is_active" value="true" defaultChecked /> وظيفة نشطة (تظهر في الموقع)؟</label>
        <button class="primary-btn" type="submit">حفظ الوظيفة</button>
      </form>
    </section>
  </>
}

function DashNewsletter({ list = [] }: { list: any[] }) {
  return <section class="dash-table">
    <header><h3>مشتركو النشرة البريدية</h3></header>
    <table>
      <thead>
        <tr>
          <th>البريد الإلكتروني</th>
          <th>الحالة</th>
          <th>تاريخ الاشتراك</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {list.map((n: any) => {
          const date = new Date(n.created_at).toLocaleDateString('ar-EG')
          return <tr>
            <td>{n.email}</td>
            <td>{n.status}</td>
            <td>{date}</td>
            <td>
              <form action={`/api/newsletter/delete/${n.id}`} method="post" style="display:inline">
                <button type="submit" style="background:#ff6b6b; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">إزالة</button>
              </form>
            </td>
          </tr>
        })}
      </tbody>
    </table>
  </section>
}

function DashUsers({ list = [], currentUserId }: { list: any[], currentUserId: string }) {
  return <>
    <section class="dash-table">
      <header><h3>إدارة المستخدمين</h3><span style="color:var(--muted); font-size:.9rem">({list.length} مستخدم)</span></header>
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>البريد</th>
            <th>الهاتف</th>
            <th>الصلاحية</th>
            <th>تاريخ التسجيل</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((u: any) => {
            const isAdmin = u.role === 'admin'
            const isCurrentUser = u.id === currentUserId
            const date = u.created_at ? new Date(u.created_at).toLocaleDateString('ar-EG') : '-'
            return <tr>
              <td>
                <div style="display:flex; align-items:center; gap:8px">
                  {u.avatar_url ? <img src={u.avatar_url} style="width:32px; height:32px; border-radius:50%; object-fit:cover" /> : <i class="fa-solid fa-user-circle" style="font-size:1.5rem; color:var(--muted)"></i>}
                  <span>{u.full_name || 'بدون اسم'}</span>
                  {isCurrentUser && <small style="color:var(--gold-600); font-weight:600">(أنت)</small>}
                </div>
              </td>
              <td style="font-size:.85rem; direction:ltr; text-align:left">{u.email || '-'}</td>
              <td>{u.phone || '-'}</td>
              <td>
                <span style={`padding:4px 12px; border-radius:6px; font-weight:700; font-size:.8rem; background:${isAdmin ? 'rgba(212,175,55,.15)' : 'rgba(100,149,237,.12)'}; color:${isAdmin ? 'var(--gold-600)' : 'var(--blue-600)'}`}>
                  {isAdmin ? '🛡️ مشرف' : '💙 متبرع'}
                </span>
              </td>
              <td style="font-size:.85rem">{date}</td>
              <td>
                {!isCurrentUser && (
                  <button
                    type="button"
                    class="role-toggle-btn"
                    data-user-id={u.id}
                    data-current-role={u.role}
                    data-user-name={u.full_name || u.email}
                    style={`border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-weight:600; font-size:.8rem; transition:all .2s; ${isAdmin ? 'background:rgba(231,76,60,.12); color:#e53935' : 'background:rgba(212,175,55,.15); color:var(--gold-600)'}`}
                  >
                    {isAdmin ? 'إزالة مشرف' : 'تعيين مشرف'}
                  </button>
                )}
              </td>
            </tr>
          })}
        </tbody>
      </table>
    </section>
    <script dangerouslySetInnerHTML={{
      __html: `
      document.querySelectorAll('.role-toggle-btn').forEach(function(btn) {
        btn.addEventListener('click', async function() {
          var userId = this.dataset.userId;
          var currentRole = this.dataset.currentRole;
          var userName = this.dataset.userName;
          var newRole = currentRole === 'admin' ? 'donor' : 'admin';
          var action = newRole === 'admin' ? 'تعيين مشرف' : 'إزالة صلاحية المشرف';
          
          var confirmed = await window.confirmAction('هل تريد ' + action + ' عن ' + userName + '?');
          if (!confirmed) return;
          
          this.disabled = true;
          this.textContent = 'جارٍ التحديث...';
          
          try {
            var res = await fetch('/api/users/role/' + userId, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: newRole })
            });
            var data = await res.json();
            if (res.ok) {
              window.showToast(data.message || 'تم تحديث الصلاحية بنجاح', 'success');
              setTimeout(function() { window.location.reload(); }, 700);
            } else {
              window.showToast(data.error || 'حدث خطأ', 'error');
              this.disabled = false;
              this.textContent = currentRole === 'admin' ? 'إزالة مشرف' : 'تعيين مشرف';
            }
          } catch(e) {
            window.showToast('حدث خطأ في الاتصال', 'error');
            this.disabled = false;
            this.textContent = currentRole === 'admin' ? 'إزالة مشرف' : 'تعيين مشرف';
          }
        });
      });
    `}} />
  </>
}

function GenericNotFound({ user }: { user?: any }) {
  return <Layout user={user} title="الصفحة غير موجودة">
    <section class="not-found">
      <div>4<span>✦</span>4</div>
      <h1>يبدو أن الصفحة ضلّت الطريق</h1>
      <p>ربما تم نقلها أو لم تعد متاحة، لكن طريق الخير يبدأ دائمًا من الرئيسية.</p>
      <a class="primary-btn" href="/">العودة للرئيسية {icon('fa-house')}</a>
    </section>
  </Layout>
}

// ROUTING HANDLERS
app.get('/', async (c) => {
  let campaigns: any[] = []
  let news: any[] = []

  try {
    const db = getFirestore(c)
    const campaignsSnap = await db.collection('campaigns')
      .where('is_published', '==', true)
      .orderBy('created_at', 'desc')
      .limit(3)
      .get()
    campaigns = campaignsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }

  try {
    const db = getFirestore(c)
    const newsSnap = await db.collection('news')
      .where('is_published', '==', true)
      .orderBy('publish_date', 'desc')
      .limit(3)
      .get()
    news = newsSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }

  return c.html(<Home campaigns={campaigns} news={news} user={(c as any).get('user')} />)
})

app.get('/about', (c) => c.html(<About user={(c as any).get('user')} />))

app.get('/campaigns', async (c) => {
  let campaigns: any[] = []
  try {
    const db = getFirestore(c)
    const snap = await db.collection('campaigns').where('is_published', '==', true).orderBy('created_at', 'desc').get()
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

app.get('/donate', (c) => c.html(<Donate user={(c as any).get('user')} />))
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
    const snap = await db.collection('jobs').where('is_published', '==', true).where('is_active', '==', true).orderBy('created_at', 'desc').get()
    jobs = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }
  return c.html(<Careers jobs={jobs} user={(c as any).get('user')} />)
})

app.get('/login', (c) => {
  const user = (c as any).get('user')
  if (user) {
    return c.redirect(user.role === 'admin' ? '/' : '/profile')
  }

  const env = (c?.env as any) || {}
  const glob = globalThis as any
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env : {}

  const firebaseConfig = {
    apiKey: env.FIREBASE_API_KEY || procEnv.FIREBASE_API_KEY || '',
    authDomain: env.FIREBASE_AUTH_DOMAIN || procEnv.FIREBASE_AUTH_DOMAIN || '',
    projectId: env.FIREBASE_PROJECT_ID || procEnv.FIREBASE_PROJECT_ID || '',
    storageBucket: env.FIREBASE_STORAGE_BUCKET || procEnv.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || procEnv.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.FIREBASE_APP_ID || procEnv.FIREBASE_APP_ID || ''
  }

  return c.html(<Login firebaseConfig={firebaseConfig} />)
})

app.get('/register', (c) => c.redirect('/login'))

app.get('/profile', async (c) => {
  const user = (c as any).get('user')
  if (!user) return c.redirect('/login')

  const db = getFirestore(c)
  let donationsList: any[] = []
  let volunteerApp: any = null

  try {
    const donSnap = await db.collection('donations')
      .where('profile_id', '==', user.id)
      .orderBy('created_at', 'desc')
      .get()
    donationsList = donSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
  } catch (e) { }

  try {
    const volSnap = await db.collection('volunteers')
      .where('profile_id', '==', user.id)
      .limit(1)
      .get()
    if (!volSnap.empty) {
      volunteerApp = volSnap.docs[0].data()
    }
  } catch (e) { }

  return c.html(<Profile user={user} donations={donationsList} volunteer={volunteerApp} />)
})

// Dashboard Security Guard for routes
const dashboardPageGuard = async (c: any, next: any) => {
  const user = (c as any).get('user')
  if (!user) {
    return c.redirect('/login?error=unauthorized')
  }
  if (user.role !== 'admin') {
    return c.redirect('/login?error=not_admin')
  }
  await next()
}

app.use('/dashboard', dashboardPageGuard)

app.get('/dashboard', async (c) => {
  const view = c.req.query('view') || 'overview'
  const user = (c as any).get('user')

  let viewData: any = {}

  try {
    const db = getFirestore(c)
    if (view === 'overview') {
      const [donationsSnap, campaignsSnap, volunteersSnap] = await Promise.all([
        db.collection('donations').get(),
        db.collection('campaigns').get(),
        db.collection('volunteers').get()
      ])

      const totalAmount = donationsSnap.docs.reduce((sum: number, doc: any) => sum + Number(doc.data().amount || 0), 0)

      const recentDonationsSnap = await db.collection('donations')
        .orderBy('created_at', 'desc')
        .limit(5)
        .get()

      const recentDonations = recentDonationsSnap.docs.map((doc: any) => doc.data())

      viewData = {
        stats: {
          total_donations: totalAmount,
          total_campaigns: campaignsSnap.size,
          total_donors: donationsSnap.size,
          total_volunteers: volunteersSnap.size
        },
        recentDonations
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
