const LOGO = '/static/img/logo.png'

const dashNav = (active: string) => `
<aside class="dash-side" id="dashSide">
  <a href="/" class="brand"><img src="${LOGO}" style="width:42px;height:42px"><span class="brand-txt"><b>د. عمر هشام</b><span>لوحة التحكم</span></span></a>
  <nav class="dash-nav">
    <a href="/dashboard" class="${active === 'overview' ? 'active' : ''}"><i class="fas fa-gauge-high"></i> النظرة العامة</a>
    <a href="/dashboard/campaigns" class="${active === 'campaigns' ? 'active' : ''}"><i class="fas fa-bullhorn"></i> الحملات</a>
    <a href="/dashboard/donations" class="${active === 'donations' ? 'active' : ''}"><i class="fas fa-hand-holding-dollar"></i> التبرّعات</a>
    <a href="/dashboard/volunteers" class="${active === 'volunteers' ? 'active' : ''}"><i class="fas fa-hands-helping"></i> المتطوّعون</a>
    <a href="/dashboard/contacts" class="${active === 'contacts' ? 'active' : ''}"><i class="fas fa-envelope"></i> رسائل التواصل</a>
    <a href="/dashboard/news" class="${active === 'news' ? 'active' : ''}"><i class="fas fa-newspaper"></i> الأخبار والمقالات</a>
    <a href="/dashboard/events" class="${active === 'events' ? 'active' : ''}"><i class="fas fa-calendar-check"></i> الفعاليات</a>
    <a href="/dashboard/stories" class="${active === 'stories' ? 'active' : ''}"><i class="fas fa-star"></i> قصص النجاح</a>
    <a href="/dashboard/jobs" class="${active === 'jobs' ? 'active' : ''}"><i class="fas fa-briefcase"></i> الوظائف</a>
    <a href="/dashboard/users" class="${active === 'users' ? 'active' : ''}"><i class="fas fa-users-gear"></i> المسجلين</a>
    <a href="/api/auth/logout" style="margin-top:1.5rem;color:#ff8a80"><i class="fas fa-right-from-bracket"></i> تسجيل الخروج</a>
  </nav>
</aside>`

export const dashboardLayout = (active: string, title: string, content: string) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} · لوحة التحكم</title>
  <link rel="icon" type="image/png" href="${LOGO}">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" rel="stylesheet">
  <link href="/static/style.css" rel="stylesheet">
</head>
<body>
  <div class="dash">
    ${dashNav(active)}
    <div class="dash-main">
      <div class="dash-topbar">
        <div style="display:flex;align-items:center;gap:1rem">
          <button class="burger" id="dashBurger" style="display:none"><span></span></button>
          <div><h1 class="h-lg">${title}</h1></div>
        </div>
        <div style="display:flex;gap:.8rem;align-items:center">
          <button class="theme-btn" id="themeToggle" title="تبديل المظهر" aria-label="تبديل المظهر" style="width:36px;height:36px;font-size:1rem"><i class="fas fa-moon"></i></button>
          <a href="/" target="_blank" class="btn btn-ghost btn-sm" title="عرض الموقع"><i class="fas fa-external-link-alt"></i></a>
          <a href="/profile" class="avatar placeholder" style="width:44px;height:44px;text-decoration:none" title="حسابي الشخصي">ع</a>
        </div>
      </div>
      
      ${content}
      
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="/static/app.js"></script>
  <script>
    (function(){
      const p = new URLSearchParams(window.location.search);
      if(p.get('success')==='1') {
        setTimeout(function(){ if(window.__toast) window.__toast('تمت الإضافة بنجاح ✅'); }, 500);
        history.replaceState(null,'', window.location.pathname);
      }
      if(p.get('error')) {
        setTimeout(function(){ if(window.__toast) window.__toast('حدث خطأ أثناء الإضافة. تأكد من البيانات وحاول مجدداً ❌'); }, 500);
        history.replaceState(null,'', window.location.pathname);
      }
    })();
  </script>
</body>
</html>`
