import { routeNames } from '../defaults'
import type { UserSession } from '../types'

export const icon = (name: string) => <i class={`fa-solid ${name}`} aria-hidden="true"></i>

export function Header({ user }: { user?: UserSession }) {
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
          <>
            <a href="/profile" style="color:var(--blue-600);font-weight:bold"><i class="fa-solid fa-user"></i> حسابي ({user.name})</a>
            {user.role === 'admin' && <a href="/dashboard" style="color:var(--gold-600);font-weight:bold"><i class="fa-solid fa-gauge"></i> لوحة التحكم</a>}
          </>
        ) : (
          <a href="/login"><i class="fa-solid fa-right-to-bracket"></i> تسجيل الدخول</a>
        )}
      </nav>
    </aside>
    <div class="drawer-backdrop" id="drawer-backdrop"></div>
  </>
}

export function Footer() {
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

export function Layout({ children, title = 'مؤسسة الدكتور عمر هشام الخيرية', description = 'عطاء مستمر لتنمية الإنسان والمجتمع', user, showFooter = true, pageType = 'public' }: { children: any, title?: string, description?: string, user?: UserSession, showFooter?: boolean, pageType?: 'public' | 'auth' | 'dashboard' }) {
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
      {pageType !== 'dashboard' && <div class="preloader" id="preloader"><div class="preloader-orbit"><img src="/static/foundation-logo.png" alt="" /><span></span></div><p>يبدأ الأثر من قلبٍ تؤمن بالخير</p></div>}
      <div class="noise"></div><div class="cursor-dot" id="cursor-dot"></div><div class="cursor-ring" id="cursor-ring"></div>
      {pageType !== 'dashboard' && <Header user={user} />}<main>{children}</main>{pageType !== 'dashboard' && showFooter && <Footer />}
      {pageType !== 'dashboard' && <button class="scroll-top" id="scroll-top" aria-label="إلى أعلى">{icon('fa-arrow-up')}</button>}
      <div class="toast" id="toast" role="status" aria-live="polite" aria-atomic="true"><span class="toast-icon"><i class="fa-solid fa-check"></i></span><span class="toast-content"><strong>تم بنجاح</strong><span class="toast-message"></span></span><button class="toast-close" type="button" aria-label="إغلاق الإشعار">{icon('fa-xmark')}</button><span class="toast-progress" aria-hidden="true"></span></div>
      <div class="confirm-modal" id="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-hidden="true"><div class="confirm-card"><span class="confirm-icon">{icon('fa-triangle-exclamation')}</span><h2 id="confirm-title">تأكيد الإجراء</h2><p id="confirm-message">هل أنت متأكد من تنفيذ هذا الإجراء؟</p><div><button type="button" class="confirm-cancel">إلغاء</button><button type="button" class="confirm-accept">تأكيد</button></div></div></div>
      {pageType === 'public' && <nav class="mobile-bottom" aria-label="تنقل سريع"><a href="/">{icon('fa-house')}<span>الرئيسية</span></a><a href="/campaigns">{icon('fa-seedling')}<span>الحملات</span></a><a class="bottom-donate" href="/donate">{icon('fa-heart')}<span>تبرّع</span></a><a href="/volunteers">{icon('fa-hand-holding-hand')}<span>تطوع</span></a><a href="/contact">{icon('fa-comment-dots')}<span>تواصل</span></a></nav>}
      <script src="/static/app.js"></script>
    </body></html>
}

export function SectionHead({ kicker, title, text }: { kicker: string, title: string, text?: string }) {
  return <header class="section-head reveal"><p class="eyebrow"><span></span>{kicker}</p><h2 dangerouslySetInnerHTML={{ __html: title }}></h2>{text && <p class="section-copy">{text}</p>}</header>
}

export function PageHero({ kicker, title, text }: { kicker: string, title: string, text: string }) {
  return <section class="page-hero"><div class="page-orb"></div><p class="eyebrow reveal"><span></span>{kicker}</p><h1 class="reveal" dangerouslySetInnerHTML={{ __html: title }}></h1><p class="reveal">{text}</p><div class="breadcrumb"><a href="/">الرئيسية</a><i class="fa-solid fa-chevron-left"></i><span>{kicker}</span></div></section>
}

export function CampaignCard({ c }: { c: any }) {
  const goal = Number(c.goal || 0)
  const raised = Number(c.raised || 0)
  const progress = goal > 0 ? Math.round(raised / goal * 100) : 0
  const detailUrl = c.id ? `/campaigns/${c.id}` : '#'
  const hasImage = c.image_url && c.image_url.trim()

  return <article class="campaign-card reveal tilt-card">
    <div class="campaign-visual" style={hasImage ? `background-image:url(${c.image_url});background-size:cover;background-position:center;` : ''}>
      <span class="visual-orb"></span>
      {!hasImage && icon(c.icon || 'fa-heart')}
      <b style={hasImage ? 'background:rgba(12,74,63,0.85);color:#fff;padding:4px 10px;border-radius:8px' : ''}>{c.category || c.cat || 'عام'}</b>
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
