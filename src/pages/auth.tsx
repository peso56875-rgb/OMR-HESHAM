// Authentication pages — login & register (split layout, own shell)
const LOGO = '/static/img/logo.png'

const shell = (title: string, body: string) => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} · مؤسسة الدكتور عمر هشام الخيرية</title>
  <link rel="icon" type="image/png" href="${LOGO}">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" rel="stylesheet">
  <link href="/static/style.css" rel="stylesheet">
</head>
<body>
  <div class="auth">
    <div class="auth-side">
      <div class="hero-bg-grid"></div>
      <div class="hero-glow g3"></div>
      <div class="auth-side-inner">
        <a href="/" class="brand" style="margin-bottom:2rem">
          <img src="${LOGO}" style="width:60px;height:60px">
          <span class="brand-txt"><b style="color:#fff;font-size:1.1rem">مؤسسة د. عمر هشام</b><span style="color:var(--gold-400)">الخيرية</span></span>
        </a>
        <h2 class="h-xl" style="color:#fff">العطاء بإيمان<br>والإحسان <span style="color:var(--gold-400)">للجميع</span></h2>
        <p class="lead" style="color:rgba(255,255,255,.8);margin-top:1rem">انضمّ إلى منصّتنا وكن جزءًا من رحلة الأثر الإنساني. تابع تبرّعاتك، وأنشطتك التطوّعية، وأثرك في مكانٍ واحد.</p>
      </div>
    </div>
    <div class="auth-form-wrap">
      <div class="auth-card">${body}</div>
    </div>
  </div>
  <script src="/static/app.js"></script>
</body>
</html>`

export const loginPage = () => shell('تسجيل الدخول', `
  <h1 class="h-lg" style="margin-bottom:.4rem">أهلاً بك في المؤسسة 👋</h1>
  <p style="color:var(--muted);margin-bottom:2rem">سجّل دخولك لمتابعة أثرك أو تابع كضيف.</p>
  
  <div id="authError" style="display:none;background:rgba(231,76,60,.12);color:#c0392b;padding:.8rem 1.2rem;border-radius:.6rem;margin-bottom:1.2rem;font-weight:600;font-size:.9rem;text-align:center"></div>

  <div style="display:flex;flex-direction:column;gap:1rem">
    <a href="/api/auth/google" class="btn btn-primary btn-block btn-lg magnetic" style="display:flex;align-items:center;justify-content:center;gap:.8rem;background:#fff;color:#333;border:1px solid #ddd">
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style="width:24px;height:24px">
      تسجيل الدخول بواسطة Google
    </a>
    
    <div style="display:flex;align-items:center;gap:1rem;margin:1rem 0;color:var(--muted)">
      <span style="flex:1;height:1px;background:var(--ink-100)"></span> 
      أو 
      <span style="flex:1;height:1px;background:var(--ink-100)"></span>
    </div>
    
    <a href="/" class="btn btn-ghost btn-block btn-lg">
      <i class="fas fa-home"></i> العودة للرئيسية
    </a>
  </div>

  <script>
    (function(){
      var p = new URLSearchParams(window.location.search);
      var e = p.get('error');
      if(e) {
        var box = document.getElementById('authError');
        var msgs = {
          'unauthorized': '⚠️ يرجى تسجيل الدخول أولاً للوصول إلى لوحة التحكم.',
          'not_admin': '🚫 ليس لديك صلاحية الوصول إلى لوحة التحكم. تواصل مع المدير.',
          'cancelled': '↩️ تم إلغاء عملية تسجيل الدخول.',
          'oauth_failed': '❌ حدث خطأ أثناء الاتصال بـ Google. حاول مرة أخرى.'
        };
        box.textContent = msgs[e] || 'حدث خطأ غير متوقع.';
        box.style.display = 'block';
        history.replaceState(null, '', '/login');
      }
    })();
  </script>
`)
