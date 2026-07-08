// Shared layout chrome for Omar Hesham Foundation
// Navigation, Footer, Preloader, Floating elements — Arabic RTL, premium brand design.

export interface PageOpts {
  title: string
  active?: string
  desc?: string
  image?: string
  canonical?: string
  user?: any
}

const LOGO = '/static/img/logo.png'

export const preloader = () => `
<div id="preloader">
  <div class="pl-inner">
    <div style="position:relative;display:grid;place-items:center">
      <div class="pl-ring"></div>
      <div class="pl-logo"><img src="${LOGO}" alt="شعار المؤسسة"></div>
    </div>
    <div class="pl-bar"><span></span></div>
    <div class="pl-text">مؤسسة الدكتور عمر هشام الخيرية</div>
  </div>
</div>`

const NAV = [
  { href: '/', label: 'الرئيسية', key: 'home' },
  { href: '/about', label: 'من نحن', key: 'about' },
  {
    label: 'أنشطتنا', key: 'work', children: [
      { href: '/campaigns', label: 'الحملات', icon: 'fa-bullhorn' },
      { href: '/achievements', label: 'الإنجازات', icon: 'fa-trophy' },
      { href: '/success-stories', label: 'قصص النجاح', icon: 'fa-heart' },
      { href: '/events', label: 'الفعاليات', icon: 'fa-calendar-check' },
      { href: '/gallery', label: 'معرض الصور', icon: 'fa-images' },
    ]
  },
  {
    label: 'شارك معنا', key: 'join', children: [
      { href: '/donate', label: 'تبرّع الآن', icon: 'fa-hand-holding-heart' },
      { href: '/volunteers', label: 'التطوّع', icon: 'fa-hands-helping' },
      { href: '/careers', label: 'الوظائف', icon: 'fa-briefcase' },
    ]
  },
  { href: '/news', label: 'الأخبار', key: 'news' },
  {
    label: 'المزيد', key: 'more', children: [
      { href: '/transparency', label: 'الشفافية المالية', icon: 'fa-scale-balanced' },
      { href: '/faq', label: 'الأسئلة الشائعة', icon: 'fa-circle-question' },
      { href: '/contact', label: 'تواصل معنا', icon: 'fa-envelope' },
      { href: '/dashboard', label: 'لوحة التحكم', icon: 'fa-gauge-high' },
    ]
  },
]

export const nav = (active = '', user?: any) => {
  const link = (n: any) => {
    if (n.children) {
      return `
      <li class="nav-item-drop">
        <button class="nav-trigger">${n.label} <i class="fas fa-chevron-down" style="font-size:.6rem"></i></button>
        <div class="nav-drop">
          ${n.children.map((c: any) => `<a href="${c.href}"><i class="fas ${c.icon}"></i><span>${c.label}</span></a>`).join('')}
        </div>
      </li>`
    }
    const cls = active === n.key ? 'active' : ''
    return `<li class="${cls}"><a href="${n.href}">${n.label}</a></li>`
  }
  const authLink = user
    ? `<a href="/profile" class="nav-account" title="حسابي"><i class="fas fa-user-circle"></i><span>حسابي</span></a>`
    : `<a href="/login" class="nav-account" title="تسجيل الدخول"><i class="fas fa-user-shield"></i><span>تسجيل الدخول</span></a>`

  return `
  <header class="nav" id="mainNav">
    <div class="wrap-wide">
      <a href="/" class="brand" aria-label="الصفحة الرئيسية">
        <img src="${LOGO}" alt="شعار مؤسسة الدكتور عمر هشام الخيرية">
        <span class="brand-txt"><b>مؤسسة د. عمر هشام</b><span>الخيرية · العطاء بإيمان</span></span>
      </a>
      <ul class="nav-links">${NAV.map((n: any) => {
        if (n.key === 'more') {
          const isAdmin = user?.role === 'admin'
          const children = n.children.filter((c: any) => c.href !== '/dashboard' || isAdmin)
          return link({ ...n, children })
        }
        return link(n)
      }).join('')}</ul>
      <div class="nav-cta">
        ${authLink}
        <button class="theme-btn" id="themeToggle" title="تبديل المظهر" aria-label="تبديل المظهر"><i class="fas fa-moon"></i></button>
        <a href="/donate" class="btn btn-gold magnetic"><i class="fas fa-hand-holding-heart"></i> تبرّع الآن</a>
      </div>
      <button class="burger" id="burger" aria-label="القائمة"><span></span></button>
    </div>
  </header>

  <div class="drawer" id="drawer">
    <div class="drawer-overlay" data-close></div>
    <div class="drawer-panel">
      <div class="drawer-head">
        <a href="/" class="brand"><img src="${LOGO}" style="width:42px;height:42px"><span class="brand-txt"><b>مؤسسة د. عمر هشام</b></span></a>
        <button class="burger open" id="burgerClose" aria-label="إغلاق"><span></span></button>
      </div>
      <a href="/">الرئيسية</a>
      <a href="/about">من نحن</a>
      <a href="/campaigns">الحملات</a>
      <a href="/achievements">الإنجازات</a>
      <a href="/success-stories">قصص النجاح</a>
      <a href="/events">الفعاليات</a>
      <a href="/gallery">معرض الصور</a>
      <a href="/donate">تبرّع الآن</a>
      <a href="/volunteers">التطوّع</a>
      <a href="/careers">الوظائف</a>
      <a href="/news">الأخبار</a>
      <a href="/transparency">الشفافية المالية</a>
      <a href="/faq">الأسئلة الشائعة</a>
      <a href="/contact">تواصل معنا</a>
      ${user?.role === 'admin' ? '<a href="/dashboard">لوحة التحكم</a>' : ''}
      ${authLink}
      <a href="/donate" class="btn btn-gold btn-block" style="margin-top:1.2rem"><i class="fas fa-hand-holding-heart"></i> تبرّع الآن</a>
    </div>
  </div>`
}

export const footer = (active = '') => {
  const fabAndToTop = `
<a href="#" class="totop" id="toTop" aria-label="إلى الأعلى"><i class="fas fa-arrow-up"></i></a>
`
  if (active !== 'home') return fabAndToTop

  return `
<footer class="footer">
  <div class="footer-glow"></div>
  <div class="wrap-wide">
    <div class="footer-grid">
      <div>
        <a href="/" class="brand">
          <img src="${LOGO}" alt="الشعار">
          <span class="brand-txt"><b>مؤسسة د. عمر هشام</b><span>الخيرية</span></span>
        </a>
        <p style="margin-top:1.2rem;max-width:320px">مؤسسة خيرية إنسانية تعمل على إغاثة المحتاجين، ودعم المرضى، ونشر العلم، وتحفيظ القرآن الكريم بروح الإيمان والإحسان. مقرنا الرئيسي: كفر العنانية.</p>
      </div>
      <div>
        <h4>روابط سريعة</h4>
        <div class="footer-links">
          <a href="/about">من نحن</a>
          <a href="/campaigns">الحملات</a>
          <a href="/achievements">الإنجازات</a>
          <a href="/success-stories">قصص النجاح</a>
          <a href="/news">الأخبار</a>
        </div>
      </div>
      <div>
        <h4>شارك معنا</h4>
        <div class="footer-links">
          <a href="/donate">تبرّع الآن</a>
          <a href="/volunteers">كن متطوعًا</a>
          <a href="/careers">الوظائف</a>
          <a href="/transparency">الشفافية المالية</a>
          <a href="/contact">تواصل معنا</a>
        </div>
      </div>
      <div>
        <h4>النشرة البريدية</h4>
        <p>اشترك ليصلك جديد المؤسسة وحملاتها الإنسانية.</p>
        <form action="/api/newsletter" method="POST" class="footer-newsletter">
          <input type="email" name="email" placeholder="بريدك الإلكتروني" required aria-label="البريد الإلكتروني">
          <button class="btn btn-primary btn-sm" type="submit"><i class="fas fa-paper-plane"></i></button>
        </form>
        <div class="chip chip-emerald" style="margin-top:1rem"><i class="fas fa-shield-halved"></i> جهة مرخّصة ومعتمدة</div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>مؤسسة الدكتور عمر هشام الخيرية · جميع الحقوق محفوظة</span>
      <div style="display:flex;gap:1.4rem">
        <a href="/transparency">سياسة الخصوصية</a>
        <a href="/transparency">الشروط والأحكام</a>
        <a href="/faq">المساعدة</a>
      </div>
    </div>
  </div>
</footer>
${fabAndToTop}
`
}

// Wraps page content in full HTML document
export const page = (opts: PageOpts, content: string) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.title} · مؤسسة الدكتور عمر هشام الخيرية</title>
  <meta name="description" content="${opts.desc || 'مؤسسة الدكتور عمر هشام الخيرية — العطاء بإيمان والإحسان للجميع'}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ar_EG">
  <meta property="og:site_name" content="مؤسسة الدكتور عمر هشام الخيرية">
  <meta property="og:title" content="${opts.title} · مؤسسة الدكتور عمر هشام الخيرية">
  <meta property="og:description" content="${opts.desc || 'مؤسسة الدكتور عمر هشام الخيرية — العطاء بإيمان والإحسان للجميع'}">
  <meta property="og:image" content="${opts.image || '/static/img/og-image.png'}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${opts.title} · مؤسسة الدكتور عمر هشام الخيرية">
  <meta name="twitter:description" content="${opts.desc || 'مؤسسة الدكتور عمر هشام الخيرية — العطاء بإيمان والإحسان للجميع'}">
  <meta name="twitter:image" content="${opts.image || '/static/img/og-image.png'}">
  ${opts.canonical ? `<link rel="canonical" href="${opts.canonical}">` : ''}
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'مؤسسة الدكتور عمر هشام الخيرية',
    url: 'https://omarhesham.org/',
    logo: 'https://omarhesham.org/static/img/logo.png',
    areaServed: 'Egypt'
  })}</script>
  <link rel="icon" type="image/png" href="${LOGO}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" rel="stylesheet">
  <link href="/static/style.css" rel="stylesheet">
</head>
<body data-page="${opts.active || ''}">
  ${preloader()}
  ${nav(opts.active, opts.user)}
  <main>${content}</main>
  ${footer(opts.active)}
  <script>window.__USER = ${JSON.stringify(opts.user || null)};</script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="/static/app.js"></script>
  <script src="/static/presence.js"></script>
</body>
</html>`

// Reusable interior page hero
export const pageHero = (title: string, sub: string, crumb: string) => `
<section class="page-hero">
  <div class="hero-bg-grid"></div>
  <div class="hero-glow g1"></div>
  <div class="hero-glow g3"></div>
  <div class="wrap">
    <div class="crumbs reveal"><a href="/">الرئيسية</a> <i class="fas fa-chevron-left"></i> <span>${crumb}</span></div>
    <h1 class="h-xl reveal d1">${title}</h1>
    <p class="lead reveal d2">${sub}</p>
  </div>
  <div class="wave-divider">
    <svg viewBox="0 0 1440 90" preserveAspectRatio="none"><path fill="#fbfaf6" d="M0,40 C360,90 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,90 L0,90 Z"></path></svg>
  </div>
</section>`

// CTA banner reused across pages
export const ctaBanner = () => `
<section class="section">
  <div class="wrap">
    <div class="cta-banner reveal-scale">
      <span class="eyebrow" style="color:#ffe9b8;justify-content:center">معًا نصنع الأثر</span>
      <h2 class="h-xl" style="margin-top:1rem">عطاؤك اليوم يُغيّر حياة غدًا</h2>
      <p class="lead" style="margin:1rem auto 0;max-width:620px">انضمّ إلى أهل الخير الذين يصنعون أملاً حقيقيًا. كل تبرّع يصل إلى مستحقيه بأمانة وشفافية كاملة.</p>
      <div class="hero-actions">
        <a href="/donate" class="btn btn-gold btn-lg magnetic"><i class="fas fa-hand-holding-heart"></i> تبرّع الآن</a>
        <a href="/volunteers" class="btn btn-outline-light btn-lg"><i class="fas fa-hands-helping"></i> كن متطوعًا</a>
      </div>
    </div>
  </div>
</section>`
