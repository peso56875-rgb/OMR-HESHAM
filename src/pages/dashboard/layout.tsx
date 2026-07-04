const LOGO = '/static/img/logo.png'

const dashNav = (active: string) => `
<aside class="dash-side" id="dashSide">
  <div class="ds-brand">
    <a href="/" class="ds-logo-link">
      <img src="${LOGO}" alt="Logo" class="ds-logo-img">
      <div class="ds-brand-text">
        <span class="ds-brand-name">د. عمر هشام</span>
        <span class="ds-brand-sub">لوحة التحكم</span>
      </div>
    </a>
  </div>

  <div class="ds-section-label">الرئيسية</div>
  <nav class="dash-nav">
    <a href="/dashboard" class="ds-link ${active === 'overview' ? 'active' : ''}"><i class="fas fa-gauge-high"></i><span>النظرة العامة</span></a>
    <a href="/dashboard/campaigns" class="ds-link ${active === 'campaigns' ? 'active' : ''}"><i class="fas fa-bullhorn"></i><span>الحملات</span></a>
    <a href="/dashboard/donations" class="ds-link ${active === 'donations' ? 'active' : ''}"><i class="fas fa-hand-holding-dollar"></i><span>التبرّعات</span></a>
  </nav>

  <div class="ds-section-label">إدارة المحتوى</div>
  <nav class="dash-nav">
    <a href="/dashboard/news" class="ds-link ${active === 'news' ? 'active' : ''}"><i class="fas fa-newspaper"></i><span>الأخبار</span></a>
    <a href="/dashboard/events" class="ds-link ${active === 'events' ? 'active' : ''}"><i class="fas fa-calendar-check"></i><span>الفعاليات</span></a>
    <a href="/dashboard/stories" class="ds-link ${active === 'stories' ? 'active' : ''}"><i class="fas fa-heart"></i><span>قصص النجاح</span></a>
    <a href="/dashboard/jobs" class="ds-link ${active === 'jobs' ? 'active' : ''}"><i class="fas fa-briefcase"></i><span>الوظائف</span></a>
  </nav>

  <div class="ds-section-label">الأشخاص</div>
  <nav class="dash-nav">
    <a href="/dashboard/volunteers" class="ds-link ${active === 'volunteers' ? 'active' : ''}"><i class="fas fa-hands-helping"></i><span>المتطوّعون</span></a>
    <a href="/dashboard/contacts" class="ds-link ${active === 'contacts' ? 'active' : ''}"><i class="fas fa-envelope"></i><span>رسائل التواصل</span></a>
    <a href="/dashboard/newsletter" class="ds-link ${active === 'newsletter' ? 'active' : ''}"><i class="fas fa-envelope-open-text"></i><span>النشرة البريدية</span></a>
    <a href="/dashboard/users" class="ds-link ${active === 'users' ? 'active' : ''}"><i class="fas fa-users-gear"></i><span>المسجلين</span></a>
  </nav>

  <div class="ds-footer">
    <a href="/" target="_blank" class="ds-link"><i class="fas fa-external-link-alt"></i><span>عرض الموقع</span></a>
    <a href="/api/auth/logout" class="ds-link ds-logout"><i class="fas fa-right-from-bracket"></i><span>تسجيل الخروج</span></a>
  </div>
</aside>`

export const dashboardLayout = (active: string, title: string, content: string) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} · لوحة التحكم</title>
  <link rel="icon" type="image/png" href="${LOGO}">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" rel="stylesheet">
  <link href="/static/style.css" rel="stylesheet">
  <style>
    /* ===== Dashboard Premium Overrides ===== */
    .dash { display: grid; grid-template-columns: 270px 1fr; min-height: 100vh; background: var(--bg); }

    /* Sidebar */
    .dash-side {
      background: #0b1224; color: #fff; position: sticky; top: 0; height: 100vh; overflow-y: auto;
      display: flex; flex-direction: column; border-inline-end: 1px solid rgba(255,255,255,.06);
      scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.1) transparent;
    }
    .ds-brand { padding: 1.3rem 1.2rem; border-bottom: 1px solid rgba(255,255,255,.06); }
    .ds-logo-link { display: flex; align-items: center; gap: .8rem; text-decoration: none; color: #fff; }
    .ds-logo-img { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,.08); padding: 3px; }
    .ds-brand-name { font-weight: 800; font-size: .95rem; display: block; }
    .ds-brand-sub { font-size: .72rem; color: var(--gold-400); font-weight: 600; display: block; margin-top: 1px; }
    .ds-section-label {
      font-size: .68rem; font-weight: 700; color: rgba(255,255,255,.3); text-transform: uppercase;
      letter-spacing: .1em; padding: 1.2rem 1.2rem .5rem; margin-top: .2rem;
    }
    .dash-nav { display: flex; flex-direction: column; gap: 2px; padding: 0 .7rem; }
    .ds-link {
      display: flex; align-items: center; gap: .75rem; padding: .7rem .85rem; border-radius: 10px;
      font-weight: 600; font-size: .88rem; color: rgba(255,255,255,.6); transition: all .2s; text-decoration: none;
    }
    .ds-link i { width: 18px; text-align: center; font-size: .9rem; }
    .ds-link:hover { background: rgba(255,255,255,.06); color: rgba(255,255,255,.9); }
    .ds-link.active { background: linear-gradient(135deg, rgba(30,136,229,.2), rgba(67,160,71,.15)); color: #fff; border: 1px solid rgba(30,136,229,.2); }
    .ds-link.active i { color: var(--blue-400); }
    .ds-footer { margin-top: auto; padding: .7rem; border-top: 1px solid rgba(255,255,255,.06); }
    .ds-logout { color: rgba(255,100,100,.7) !important; }
    .ds-logout:hover { color: #ff6b6b !important; background: rgba(255,100,100,.1) !important; }

    /* Main */
    .dash-main { padding: 1.5rem clamp(1.2rem, 2.5vw, 2rem); min-width: 0; overflow-x: hidden; }
    .dash-topbar {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.8rem;
      padding: 1rem 1.5rem; background: var(--surface); border: 1px solid rgba(12,26,43,.05);
      border-radius: 16px; box-shadow: var(--sh-xs);
    }
    [data-theme="dark"] .dash-topbar { background: var(--surface); border-color: rgba(255,255,255,.05); }
    .dash-topbar h1 { font-size: 1.25rem; font-weight: 800; margin: 0; }

    /* KPI Cards */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .kpi-card {
      background: var(--surface); border-radius: 16px; padding: 1.4rem; border: 1px solid rgba(12,26,43,.05);
      box-shadow: var(--sh-xs); transition: all .25s; position: relative; overflow: hidden;
    }
    .kpi-card:hover { transform: translateY(-3px); box-shadow: var(--sh-sm); }
    .kpi-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      border-radius: 16px 16px 0 0;
    }
    .kpi-card.kpi-blue::after { background: var(--grad-blue); }
    .kpi-card.kpi-emerald::after { background: var(--grad-emerald); }
    .kpi-card.kpi-gold::after { background: var(--grad-gold); }
    .kpi-card.kpi-crimson::after { background: linear-gradient(135deg, #e53935, #b71c1c); }
    .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .8rem; }
    .kpi-icon {
      width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; font-size: 1.1rem;
    }
    .kpi-icon.bg-blue { background: rgba(30,136,229,.1); color: var(--blue-600); }
    .kpi-icon.bg-emerald { background: rgba(67,160,71,.1); color: var(--emerald-600); }
    .kpi-icon.bg-gold { background: rgba(245,124,0,.1); color: var(--gold-600); }
    .kpi-icon.bg-crimson { background: rgba(229,57,53,.1); color: var(--crimson); }
    .kpi-value { font-size: 1.7rem; font-weight: 900; line-height: 1.2; color: var(--ink-900); }
    .kpi-label { font-size: .82rem; color: var(--muted); font-weight: 600; margin-top: .15rem; }

    /* Chart panels */
    .chart-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
    .chart-panel {
      background: var(--surface); border-radius: 16px; padding: 1.4rem; border: 1px solid rgba(12,26,43,.05);
      box-shadow: var(--sh-xs);
    }
    .chart-panel h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; gap: .5rem; }
    .chart-panel h3 i { font-size: .85rem; }

    /* Data panel */
    .data-panel {
      background: var(--surface); border-radius: 16px; padding: 1.4rem; border: 1px solid rgba(12,26,43,.05);
      box-shadow: var(--sh-xs); margin-bottom: 1.5rem;
    }
    .data-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .data-panel-header h3 { font-size: 1rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: .5rem; }
    .data-panel-header a { font-size: .85rem; font-weight: 700; color: var(--blue-600); text-decoration: none; }
    .data-panel-header a:hover { text-decoration: underline; }

    /* Quick stats row */
    .quick-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .8rem; margin-bottom: 1.5rem; }
    .qs-item {
      background: var(--surface); border-radius: 12px; padding: 1rem; border: 1px solid rgba(12,26,43,.05);
      display: flex; align-items: center; gap: .8rem;
    }
    .qs-icon { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; font-size: .85rem; }
    .qs-value { font-weight: 800; font-size: 1.1rem; }
    .qs-label { font-size: .72rem; color: var(--muted); font-weight: 600; }

    /* Responsive */
    @media (max-width: 980px) {
      .dash { grid-template-columns: 1fr; }
      .dash-side { position: fixed; inset-inline-start: 0; top: 0; width: 270px; transform: translateX(100%); z-index: 60; transition: .3s; }
      [dir="rtl"] .dash-side { transform: translateX(100%); }
      .dash-side.open { transform: none; }
      .chart-grid { grid-template-columns: 1fr; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .kpi-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="dash">
    ${dashNav(active)}
    <div class="dash-main">
      <div class="dash-topbar">
        <div style="display:flex;align-items:center;gap:1rem">
          <button class="burger" id="dashBurger" style="display:none" onclick="document.getElementById('dashSide').classList.toggle('open')"><span></span></button>
          <h1>${title}</h1>
        </div>
        <div style="display:flex;gap:.6rem;align-items:center">
          <button class="theme-btn" id="themeToggle" title="تبديل المظهر" aria-label="تبديل المظهر" style="width:36px;height:36px;font-size:.95rem"><i class="fas fa-moon"></i></button>
          <a href="/profile" class="avatar placeholder" style="width:38px;height:38px;text-decoration:none;font-size:.85rem" title="حسابي">ع</a>
        </div>
      </div>
      
      ${content}
      
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="/static/app.js"></script>
  <script src="/static/presence.js"></script>
  <script>
    (function(){
      const p = new URLSearchParams(window.location.search);
      if(p.get('success')==='1') {
        setTimeout(function(){ if(window.__toast) window.__toast('تمت العملية بنجاح ✅'); }, 500);
        history.replaceState(null,'', window.location.pathname);
      }
      if(p.get('error')) {
        setTimeout(function(){ if(window.__toast) window.__toast('حدث خطأ. تأكد من البيانات وحاول مجدداً ❌'); }, 500);
        history.replaceState(null,'', window.location.pathname);
      }
      // Mobile sidebar toggle
      const burger = document.getElementById('dashBurger');
      if (window.innerWidth <= 980 && burger) burger.style.display = 'grid';
    })();
  </script>
</body>
</html>`
