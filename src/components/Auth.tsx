import { icon, Layout, PageHero } from './shared'
import type { UserSession } from '../types'

export function Login({ firebaseConfig }: { firebaseConfig: any }) {
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

        <button id="googleLoginButton" type="button" aria-describedby="authError" aria-busy="true" disabled class="primary-btn" style="display:flex;align-items:center;justify-content:center;gap:.8rem;background:#fff;color:#333;border:1px solid #ddd;width:100%;margin-bottom:1.5rem;cursor:wait; font-weight:bold; height:50px; border-radius:12px;opacity:.75">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" style="width:24px;height:24px" />
          <span>جارٍ تهيئة تسجيل الدخول...</span>
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
        let firebaseAuthSdk = null;
        let auth = null;
        let provider = null;

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

        function setButtonState(state) {
          if (!googleButton || !buttonLabel) return;
          const isBusy = state !== 'ready';
          googleButton.disabled = isBusy;
          googleButton.setAttribute('aria-busy', String(isBusy));
          googleButton.style.cursor = isBusy ? 'wait' : 'pointer';
          googleButton.style.opacity = isBusy ? '0.75' : '1';
          buttonLabel.textContent = state === 'preparing'
            ? 'جارٍ تهيئة تسجيل الدخول...'
            : state === 'signing-in'
              ? 'جارٍ تسجيل الدخول...'
              : defaultButtonLabel;
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

        async function createSession(idToken) {
          let lastError = null;
          for (let attempt = 0; attempt < 2; attempt += 1) {
            try {
              const response = await fetch('/api/auth/session', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken })
              });
              const data = await response.json().catch(function () { return {}; });
              if (response.ok && data.success) return data;
              lastError = new Error(data.error || 'تعذر إنشاء جلسة تسجيل الدخول.');
            } catch (error) {
              lastError = error;
            }
            await new Promise(function (resolve) { window.setTimeout(resolve, 450); });
          }
          throw lastError || new Error('تعذر إنشاء جلسة تسجيل الدخول.');
        }

        async function loginWithGoogle() {
          clearError();
          if (!firebaseAuthSdk || !auth || !provider) {
            showError('لم يكتمل تجهيز تسجيل الدخول بعد. انتظر لحظة ثم حاول مرة أخرى.');
            return;
          }

          setButtonState('signing-in');
          try {
            const result = await firebaseAuthSdk.signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken(true);
            const sessionData = await createSession(idToken);

            const displayName = result.user.displayName || 'صديق المؤسسة';
            const userRole = sessionData.role || 'donor';
            const redirectTo = userRole === 'admin' ? '/dashboard' : '/profile';

            localStorage.setItem('just_logged_in', 'true');
            localStorage.setItem('user_display_name', displayName);

            const container = document.querySelector('.auth-form-container');
            if (container) {
              container.innerHTML = '<div style="text-align:center;padding:2.5rem 0;display:flex;flex-direction:column;align-items:center;gap:1.5rem">' +
                '<div style="width:70px;height:70px;border-radius:50%;background:var(--gold);color:var(--ink);display:grid;place-items:center;font-size:2rem;box-shadow:0 10px 25px rgba(214,166,75,0.3)"><i class="fa-solid fa-hands-praying"></i></div>' +
                '<div><h2 id="loginWelcome" style="margin:0 0 8px;font-size:1.8rem;font-weight:800;color:var(--text)"></h2><p style="color:var(--muted);margin:0;font-size:0.95rem">تم تسجيل الدخول بنجاح.</p></div>' +
                '<div style="font-size:0.88rem;color:var(--emerald);font-weight:800;display:flex;align-items:center;gap:8px;margin-top:0.5rem"><i class="fa-solid fa-circle-notch fa-spin"></i><span>جارٍ توجيهك إلى ' + (userRole === 'admin' ? 'لوحة التحكم' : 'حسابك') + '...</span></div>' +
              '</div>';
              const welcome = document.getElementById('loginWelcome');
              if (welcome) welcome.textContent = 'أهلًا بك، ' + displayName;
            }

            window.setTimeout(function () {
              window.location.replace(redirectTo);
            }, 1200);
          } catch (error) {
            console.error('[Google Login Error]', error);
            showError(getFriendlyError(error));
            setButtonState('ready');
          }
        }

        async function prepareGoogleLogin() {
          if (!isConfigured) {
            showError('إعدادات Firebase غير مكتملة. يرجى التواصل مع إدارة الموقع.');
            return;
          }

          setButtonState('preparing');
          try {
            const modules = await Promise.all([
              import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js'),
              import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js')
            ]);
            const firebaseApp = modules[0];
            firebaseAuthSdk = modules[1];
            const app = firebaseApp.getApps().length
              ? firebaseApp.getApp()
              : firebaseApp.initializeApp(firebaseConfig);
            auth = firebaseAuthSdk.getAuth(app);
            provider = new firebaseAuthSdk.GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });
            googleButton?.addEventListener('click', loginWithGoogle);
            setButtonState('ready');
          } catch (error) {
            console.error('[Google Auth Initialization Error]', error);
            showError('تعذر تجهيز تسجيل الدخول بواسطة Google. تحقق من اتصالك ثم أعد تحميل الصفحة.');
          }
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

        prepareGoogleLogin();
      }());
    `}} />
  </Layout>
}

export function Profile({ user, donations = [], volunteer }: { user: UserSession, donations?: any[], volunteer?: any }) {
  const completedDonations = donations.filter((d: any) => d.status === 'completed')
  const totalDonated = completedDonations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0)
  const donationsCount = completedDonations.length

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

  const initials = user.name ? user.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('') : 'ف خ'

  return <Layout user={user} title="حسابي | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="ملفي الشخصي" title={'لوحة التحكم الشخصية<br/><em>شركاء الخير والعطاء.</em>'} text="مرحبًا بك في مساحتك الخاصة بالمؤسسة. يمكنك متابعة مساهماتك، حالة تطوعك، وإدارة ملفك الشخصي." />

    <section class="section-pad" style="padding-top: 0">
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

      <div class="profile-layout">
        <div style="display: flex; flex-direction: column; gap: 25px">
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

        <div style="display: flex; flex-direction: column; gap: 25px">
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
          
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
          script.onload = function() {
            const duration = 2.5 * 1000;
            const end = Date.now() + duration;

            (function frame() {
              confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 0.8 } });
              confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 0.8 } });
              if (Date.now() < end) requestAnimationFrame(frame);
            }());
          };
          document.head.appendChild(script);
          
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
