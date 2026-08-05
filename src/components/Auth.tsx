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

  // Next donor tier progress
  const nextTierTarget = totalDonated >= 5000 ? 0 : totalDonated >= 1000 ? 5000 : 1000
  const nextTierName = totalDonated >= 5000 ? '' : totalDonated >= 1000 ? 'الذهبية ✦' : 'الفضية ✦'
  const tierProgress = nextTierTarget > 0 ? Math.min(100, Math.round((totalDonated / nextTierTarget) * 100)) : 100
  const remainingToNextTier = nextTierTarget > 0 ? Math.max(0, nextTierTarget - totalDonated) : 0
  const lastDonation = donations.length > 0
    ? donations.map((d: any) => new Date(d.created_at || 0).getTime()).sort((a: number, b: number) => b - a)[0]
    : 0

  return <Layout user={user} title="حسابي | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="ملفي الشخصي" title={'لوحة التحكم الشخصية<br/><em>شركاء الخير والعطاء.</em>'} text="مرحبًا بك في مساحتك الخاصة بالمؤسسة. يمكنك متابعة مساهماتك، حالة تطوعك، وإدارة ملفك الشخصي." />

    <section class="section-pad" style="padding-top: 0">
      <div class="profile-hero-modern reveal">
        <div class="profile-hero-glow profile-hero-glow-1"></div>
        <div class="profile-hero-glow profile-hero-glow-2"></div>

        <div class="profile-hero-main">
          <div class="profile-user-info">
            <div class="profile-user-avatar">
              {initials}
              <span class="profile-avatar-ring"></span>
            </div>
            <div class="profile-user-details">
              <span class="profile-hero-kicker">{icon('fa-sparkles')} مساحتك الخاصة في المؤسسة</span>
              <h1>{user.name}</h1>
              <div class="profile-pills-row">
                <span class="role-pill">
                  {icon(user.role === 'admin' ? 'fa-user-shield' : user.role === 'volunteer' ? 'fa-people-carry-box' : 'fa-user')}
                  {user.role === 'admin' ? 'مشرف الموقع' : user.role === 'volunteer' ? 'متطوع رسمي' : 'عضو المؤسسة'}
                </span>
                {totalDonated > 0 && (
                  <span class={`profile-badge-tier ${tierClass}`}>
                    {icon(tierIcon)} {tierName}
                  </span>
                )}
                <span class="profile-status-pill">{icon('fa-circle')} حساب نشط</span>
              </div>
              <div class="profile-contact-row">
                <span>{icon('fa-envelope')} <bdi>{user.email}</bdi></span>
                {user.phone && <span>{icon('fa-phone')} <bdi>{user.phone}</bdi></span>}
              </div>
            </div>
          </div>

          <div class="profile-quick-stats">
            <div class="profile-stat-box">
              <div class="profile-stat-icon">{icon('fa-sack-dollar')}</div>
              <span>إجمالي العطاء</span>
              <strong>{(totalDonated).toLocaleString('ar-EG')} <small>ج.م</small></strong>
            </div>
            <div class="profile-stat-box">
              <div class="profile-stat-icon">{icon('fa-hand-holding-heart')}</div>
              <span>عدد المساهمات</span>
              <strong>{donationsCount.toLocaleString('ar-EG')} <small>مساهمة</small></strong>
            </div>
            <div class="profile-stat-box">
              <div class="profile-stat-icon">{icon('fa-clock-rotate-left')}</div>
              <span>آخر مساهمة</span>
              <strong class="profile-stat-date">{lastDonation ? new Date(lastDonation).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }) : '—'}</strong>
            </div>
          </div>
        </div>

        <div class="profile-tier-progress">
          <div class="profile-tier-progress-info">
            {nextTierTarget > 0 ? (
              <>
                <span>{icon('fa-arrow-trend-up')} تبقّى <b>{remainingToNextTier.toLocaleString('ar-EG')} ج.م</b> للوصول إلى العضوية {nextTierName}</span>
                <span class="profile-tier-progress-value">{tierProgress}%</span>
              </>
            ) : (
              <>
                <span>{icon('fa-crown')} وصلت إلى أعلى مرتبة في شركاء العطاء — جزاك الله خيرًا</span>
                <span class="profile-tier-progress-value">100%</span>
              </>
            )}
          </div>
          <div class="profile-tier-track"><i style={`width:${tierProgress}%`}></i></div>
        </div>
      </div>

      <div class="profile-layout">
        <div style="display: flex; flex-direction: column; gap: 25px">
          <div class="profile-card-modern reveal">
            <div class="profile-card-head">
              <div class="profile-card-title-wrap">
                <span class="profile-card-icon">{icon('fa-hand-holding-dollar')}</span>
                <div>
                  <h3>سجل التبرعات والمساهمات</h3>
                  <p>رحلة عطائك الكاملة موثقة لحظة بلحظة</p>
                </div>
              </div>
              {donationsCount > 0 && <span class="profile-card-count">{donationsCount.toLocaleString('ar-EG')} مساهمة</span>}
            </div>

            {donations.length === 0 ? (
              <div class="profile-empty-donations">
                <i class="fa-solid fa-heart-pulse"></i>
                <h4>لا توجد تبرعات مسجلة حتى الآن</h4>
                <p>عطاؤك المستمر هو النور الذي يضيء دروب المحتاجين ويصنع فرقًا حقيقيًا.</p>
                <a class="primary-btn" href="/donate">ابدأ أول مساهمة الآن {icon('fa-heart')}</a>
              </div>
            ) : (
              <div class="profile-donations-list">
                {donations.map((d: any) => {
                  const date = new Date(d.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
                  const isCompleted = d.status === 'completed'
                  return (
                    <div class="profile-donation-row">
                      <div class="profile-donation-icon">{icon(isCompleted ? 'fa-circle-check' : 'fa-hourglass-half')}</div>
                      <div class="profile-donation-info">
                        <b>{d.campaign_title || 'الصندوق العام'}</b>
                        <span>{icon('fa-calendar-day')} {date}</span>
                      </div>
                      <div class="profile-donation-amount">
                        <b>{Number(d.amount).toLocaleString('ar-EG')}</b>
                        <small>ج.م</small>
                      </div>
                      <span class={`profile-donation-status ${isCompleted ? 'done' : 'pending'}`}>
                        {isCompleted ? 'مكتمل' : 'قيد المراجعة'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div class="profile-card-modern reveal">
            <div class="profile-card-head">
              <div class="profile-card-title-wrap">
                <span class="profile-card-icon profile-card-icon-gold">{icon('fa-people-group')}</span>
                <div>
                  <h3>مسيرتك التطوعية</h3>
                  <p>هويتك الرقمية وحالة انضمامك لأسرة المتطوعين</p>
                </div>
              </div>
              {/* A frozen card (approved but is_active === false) must not still
                  advertise "متطوع معتمد" next to a revoked-looking ID card. */}
              {volunteer?.status === 'approved' && volunteer?.is_active !== false && <span class="profile-card-count profile-card-count-green">{icon('fa-shield-halved')} متطوع معتمد</span>}
            </div>

            {volunteer ? (
              (volunteer.status === 'approved' || volunteer.status === 'revoked') && volunteer.volunteer_code ? (
                // ===== Minimal official volunteer identity =====
                (() => {
                  const isRevoked = volunteer.status === 'revoked'
                  const isFrozen = volunteer.status === 'approved' && volunteer.is_active === false
                  const isInactive = isRevoked || isFrozen
                  const isExpired = Boolean(volunteer.expires_at && new Date(volunteer.expires_at) < new Date())
                  const expiryText = volunteer.expires_at
                    ? new Date(volunteer.expires_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'صلاحية مفتوحة'
                  const statusClass = isInactive || isExpired ? 'is-expired' : 'is-active'
                  const statusLabel = isRevoked ? 'ملغاة' : isFrozen ? 'مجمّدة' : isExpired ? 'منتهية' : 'سارية'
                  const statusIcon = isRevoked ? 'fa-ban' : isFrozen ? 'fa-snowflake' : isExpired ? 'fa-triangle-exclamation' : 'fa-circle-check'
                  return (
                <div class="vol-id-card-wrapper">
                  <div class={`vol-id-card${isInactive ? ' is-void' : ''}`} id="volunteerIdCard">
                    <div class="vol-id-orbit" aria-hidden="true"></div>
                    <img src="/static/foundation-logo.png" alt="" class="vol-id-watermark" aria-hidden="true" />

                    <div class="vol-id-card-header">
                      <div class="vol-id-brand">
                        <img src="/static/foundation-logo.png" alt="شعار المؤسسة" class="vol-id-logo" />
                        <div class="vol-id-org">
                          <span>مؤسسة الدكتور عمر هشام الخيرية</span>
                          <small>VOLUNTEER ID · بطاقة متطوع</small>
                        </div>
                      </div>
                      <div class={`vol-id-status ${statusClass}`}>{icon(statusIcon)} {statusLabel}</div>
                    </div>

                    {isInactive && (
                      <div class="vol-id-alert">
                        {icon(isRevoked ? 'fa-ban' : 'fa-snowflake')}
                        {isRevoked ? 'هذه البطاقة ملغاة وغير صالحة للاستخدام' : 'هذه البطاقة مجمّدة مؤقتاً'}
                      </div>
                    )}

                    <div class="vol-id-body">
                      <div class="vol-id-avatar-ring">
                        {(volunteer.avatar_url || user.avatar)
                          ? <img src={volunteer.avatar_url || user.avatar} alt={volunteer.full_name} class="vol-id-avatar" />
                          : <div class="vol-id-avatar-initials">{volunteer.full_name?.split(' ').slice(0,2).map((n: string) => n[0]).join('')}</div>
                        }
                      </div>

                      <div class="vol-id-info">
                        <span class="vol-id-role">{volunteer.rank || 'متطوع معتمد'}</span>
                        <h4 class="vol-id-name">{volunteer.full_name}</h4>
                        <div class="vol-id-code-box">
                          <span class="vol-id-code-label">رقم الهوية</span>
                          <strong class="vol-id-code">{volunteer.volunteer_code}</strong>
                        </div>
                      </div>
                    </div>

                    <div class={`vol-id-footer${isInactive || isExpired ? ' is-expired' : ''}`}>
                      <div class="vol-id-expiry-row">
                        <span class="vol-id-expiry-label">صالحة حتى</span>
                        <b class="vol-id-expiry-date">{expiryText}</b>
                      </div>
                      <div class="vol-id-verified">
                        <span>{icon('fa-shield-halved')}</span>
                        <small>هوية رقمية موثّقة</small>
                      </div>
                    </div>
                  </div>

                  {/* ID Action Buttons Bar */}
                  <div class="vol-id-actions-bar">
                    <button class="primary-btn" id="downloadVolCard" type="button" style="padding:13px 26px;font-size:.9rem;background:linear-gradient(135deg,#0c4a3f,#168a70);border-radius:16px">
                      {icon('fa-download')} تحميل البطاقة
                    </button>
                    <button class="outline-btn" id="printVolCard" type="button" style="padding:13px 26px;font-size:.9rem;border-radius:16px">
                      {icon('fa-print')} طباعة
                    </button>
                  </div>
                </div>
                  )
                })()
              ) : (
                // Pending or rejected state
                <div style="background:var(--ivory); border:1px solid var(--line); padding:25px; border-radius:20px; display:flex; flex-direction:column; gap:15px">
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px">
                    <div>
                      <h4 style="margin:0 0 5px; font-weight:800; font-size:1.15rem">{volunteer.preferred_role}</h4>
                      <span style="font-size:0.85rem; color:var(--muted)">رقم الهاتف: {volunteer.phone}</span>
                    </div>
                    <span class={`profile-vol-badge ${volunteer.status === 'rejected' ? 'rejected' : 'pending'}`}>
                      {volunteer.status === 'rejected' ? icon('fa-circle-xmark') : icon('fa-clock')}
                      {volunteer.status === 'rejected' ? 'مرفوض حاليًا' : 'طلب قيد المراجعة'}
                    </span>
                  </div>
                  <p style="margin: 0; font-size:0.92rem; color:var(--muted); line-height:1.6">
                    {volunteer.status === 'rejected'
                      ? 'نشكرك على اهتمامك ورغبتك بالتطوع. تعذر قبول طلبك حالياً، ونرحب بتقديمك مجدداً في المبادرات المستقبلية.'
                      : 'نقوم بمراجعة طلبك وخبراتك للتأكد من ملاءمتها للمشاريع الحالية. سيقوم فريق العمل بالتواصل معك فور اعتماد الطلب.'}
                  </p>
                </div>
              )
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
            <div class="profile-card-head">
              <div class="profile-card-title-wrap">
                <span class="profile-card-icon">{icon('fa-id-card')}</span>
                <div>
                  <h3>بيانات الحساب</h3>
                  <p>حدّث معلوماتك الشخصية في أي وقت</p>
                </div>
              </div>
            </div>
            <form class="ajax-form profile-edit-form" data-endpoint="/api/profile/update" method="post">
              <div class="profile-field">
                <label for="pf_full_name">{icon('fa-user-pen')} الاسم الكامل</label>
                <input id="pf_full_name" name="full_name" value={user.name} required placeholder="اكتب اسمك بالكامل" />
              </div>
              <div class="profile-field">
                <label for="pf_email">{icon('fa-envelope')} البريد الإلكتروني</label>
                <input id="pf_email" name="email" value={user.email} disabled />
                <small>{icon('fa-lock')} البريد الإلكتروني مرتبط بحساب Google ولا يمكن تغييره</small>
              </div>
              <div class="profile-field">
                <label for="pf_phone">{icon('fa-phone')} رقم الهاتف</label>
                <input id="pf_phone" name="phone" value={user.phone || ''} placeholder="01xxxxxxxxx" inputMode="tel" />
              </div>
              <button class="primary-btn submit-btn" type="submit" style="width:100%; justify-content:center; border-radius:16px; padding:14px">
                {icon('fa-floppy-disk')} حفظ التغييرات
              </button>
            </form>
          </div>

          <div class="profile-card-modern reveal" style="padding: 28px">
            <div class="profile-card-head" style="margin-bottom:18px">
              <div class="profile-card-title-wrap">
                <span class="profile-card-icon profile-card-icon-coral">{icon('fa-bolt')}</span>
                <div>
                  <h3 style="margin-bottom:2px">إجراءات سريعة</h3>
                  <p>وصول سريع لأهم الصفحات</p>
                </div>
              </div>
            </div>
            <div class="profile-quick-actions">
              <a href="/donate" class="profile-action-link">
                <span class="profile-action-icon">{icon('fa-hand-holding-heart')}</span>
                <span>تبرع الآن</span>
                <i class="fa-solid fa-arrow-left"></i>
              </a>
              <a href="/volunteers" class="profile-action-link">
                <span class="profile-action-icon">{icon('fa-people-carry-box')}</span>
                <span>فرص التطوع</span>
                <i class="fa-solid fa-arrow-left"></i>
              </a>
              {user.role === 'admin' && (
                <a href="/dashboard" class="profile-action-link profile-action-gold">
                  <span class="profile-action-icon">{icon('fa-gauge-high')}</span>
                  <span>لوحة تحكم المشرفين</span>
                  <i class="fa-solid fa-arrow-left"></i>
                </a>
              )}
              <a href="/api/auth/logout" class="profile-action-link profile-action-danger">
                <span class="profile-action-icon">{icon('fa-right-from-bracket')}</span>
                <span>تسجيل الخروج</span>
                <i class="fa-solid fa-arrow-left"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <script dangerouslySetInnerHTML={{
      __html: `
      (function() {
        // ── Welcome back message on first login ──
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

        // ── Volunteer approval welcome ──
        const userRole = ${JSON.stringify(volunteer?.status === 'approved' && volunteer?.volunteer_code ? 'volunteer' : '')};
        const volCode = ${JSON.stringify(volunteer?.volunteer_code || '')};
        const volName = ${JSON.stringify(volunteer?.full_name || '')};
        const seenKey = 'vol_welcome_' + volCode;

        if (userRole === 'volunteer' && volCode && !localStorage.getItem(seenKey)) {
          localStorage.setItem(seenKey, '1');

          // Load confetti
          const cs = document.createElement('script');
          cs.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
          cs.onload = function() {
            // Gold and green confetti burst for volunteers
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.5 },
              colors: ['#d6a64b', '#f0cf82', '#168a70', '#7ee2bd', '#ffffff']
            });
            setTimeout(() => confetti({
              particleCount: 60,
              spread: 100,
              origin: { y: 0.4 },
              colors: ['#d6a64b', '#f0cf82', '#168a70']
            }), 500);
          };
          document.head.appendChild(cs);

          // Show a beautiful multi-line welcome toast
          setTimeout(() => {
            // Create a special volunteer welcome banner
            const banner = document.createElement('div');
            banner.style.cssText = \`
              position:fixed; inset:0; z-index:3000; display:grid; place-items:center;
              background:rgba(6,43,38,.85); backdrop-filter:blur(10px);
              animation:fadeIn .4s ease;
            \`;
            banner.innerHTML = \`
              <style>@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}</style>
              <div style="
                background:linear-gradient(145deg,#0c5044,#083828);
                border:1px solid rgba(240,207,130,.3);
                border-radius:28px;
                padding:40px 48px;
                max-width:520px;
                width:90vw;
                color:white;
                text-align:center;
                box-shadow:0 30px 80px rgba(0,0,0,.4);
                position:relative;
                overflow:hidden;
                animation:slideUp .5s cubic-bezier(.2,.8,.2,1);
              ">
                <div style="position:absolute;inset:0;background-image:linear-gradient(30deg,transparent 48%,rgba(255,255,255,.03) 49%,rgba(255,255,255,.03) 51%,transparent 52%),linear-gradient(-30deg,transparent 48%,rgba(255,255,255,.02) 49%,rgba(255,255,255,.02) 51%,transparent 52%);background-size:50px 87px;pointer-events:none"></div>
                <div style="position:relative">
                  <img src="/static/foundation-logo.png" style="width:72px;margin:0 auto 20px;filter:drop-shadow(0 8px 16px rgba(0,0,0,.4))" />
                  <div style="background:rgba(240,207,130,.15);border:1px solid rgba(240,207,130,.3);border-radius:999px;display:inline-flex;align-items:center;gap:8px;padding:6px 16px;font-size:.75rem;color:#f0cf82;font-weight:800;margin-bottom:20px">
                    <i class="fa-solid fa-star"></i> متطوع رسمي معتمد
                  </div>
                  <h2 style="font-size:1.9rem;font-weight:900;margin:0 0 12px;line-height:1.2">
                    مبروك يا <span style="color:#f0cf82">\${volName || 'صديقنا'}</span>! 🎉
                  </h2>
                  <p style="color:rgba(255,255,255,.75);font-size:.95rem;line-height:1.7;margin:0 0 20px">
                    تم اعتمادك رسمياً كمتطوع في مؤسسة الدكتور عمر هشام. يسعدنا انضمامك لعائلتنا المتطوعة الرائعة! 🤲
                  </p>
                  <div style="background:rgba(240,207,130,.08);border:1px solid rgba(240,207,130,.2);border-radius:14px;padding:14px 20px;margin-bottom:24px;display:inline-block">
                    <small style="color:rgba(255,255,255,.5);font-size:.7rem;display:block;margin-bottom:4px">كود المتطوع الخاص بك</small>
                    <span style="font-family:monospace;font-size:1.8rem;font-weight:900;color:#f0cf82;letter-spacing:.15em">\${volCode}</span>
                  </div>
                  <p style="color:rgba(255,255,255,.6);font-size:.82rem;margin:0 0 28px">
                    بطاقتك الرقمية جاهزة أسفل الصفحة ويمكنك طباعتها ومشاركتها.
                  </p>
                  <button id="volWelcomeClose" style="background:#d6a64b;color:#072d28;border:none;border-radius:14px;padding:13px 30px;font-weight:900;font-size:.95rem;cursor:pointer;width:100%;transition:.3s">
                    <i class="fa-solid fa-heart"></i> شكراً، متحمس للبداية!
                  </button>
                </div>
              </div>
            \`;
            document.body.appendChild(banner);
            document.getElementById('volWelcomeClose')?.addEventListener('click', () => {
              banner.style.opacity = '0';
              banner.style.transition = '.4s';
              setTimeout(() => banner.remove(), 400);
            });
            banner.addEventListener('click', (e) => {
              if (e.target === banner) {
                banner.style.opacity = '0';
                banner.style.transition = '.4s';
                setTimeout(() => banner.remove(), 400);
              }
            });
          }, 900);
        }
      })();
      `
    }} />
  </Layout>
}
