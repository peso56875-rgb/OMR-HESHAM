/**
 * ══════════════════════════════════════════════════════════════════════════════
 * PWA Controller — إدارة وتثبيت تطبيق مؤسسة د. عمر هشام الخيرية (PWA)
 * ══════════════════════════════════════════════════════════════════════════════
 */
(() => {
  let deferredPrompt = null;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  // إذا كان المستخدم يتصفح التطبيق بالفعل وهو مثبت، نتجاهل إظهار البانرات
  if (isStandalone) {
    document.documentElement.classList.add('is-pwa-standalone');
    return;
  }

  // تسجيل الـ Service Worker لضمان استيفاء معايير التثبيت
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
        .catch(() => {});
    });
  }

  function getBanner() {
    return document.getElementById('pwaFloatingBanner');
  }

  function getModal() {
    return document.getElementById('pwaGuideModal');
  }

  function showPwaBanner() {
    const banner = getBanner();
    if (!banner) return;

    // فحص تاريخ آخر إغلاق (لا نزعج الزائر إذا أغلقه قبل أقل من 24 ساعة)
    const dismissedAt = Number(localStorage.getItem('pwa_banner_dismissed_at') || 0);
    const hoursSinceDismiss = (Date.now() - dismissedAt) / (1000 * 60 * 60);
    if (hoursSinceDismiss < 24) return;

    setTimeout(() => {
      banner.style.display = 'flex';
      banner.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => banner.classList.add('is-visible'));
    }, 2800);
  }

  function hidePwaBanner() {
    const banner = getBanner();
    if (!banner) return;
    banner.classList.remove('is-visible');
    setTimeout(() => {
      banner.style.display = 'none';
      banner.setAttribute('aria-hidden', 'true');
    }, 350);
  }

  function openGuideModal() {
    const modal = getModal();
    if (!modal) return;

    const iosSteps = document.getElementById('pwaIosSteps');
    const androidSteps = document.getElementById('pwaAndroidSteps');

    if (isIos) {
      if (iosSteps) iosSteps.style.display = 'block';
      if (androidSteps) androidSteps.style.display = 'none';
    } else {
      if (iosSteps) iosSteps.style.display = 'none';
      if (androidSteps) androidSteps.style.display = 'block';
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  }

  function closeGuideModal() {
    const modal = getModal();
    if (!modal) return;
    modal.classList.remove('is-open');
    setTimeout(() => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }, 300);
  }

  async function handleInstallTrigger() {
    // 1. إذا كان المتصفح يدعم طلب التثبيت المباشر ولديه deferredPrompt
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          hidePwaBanner();
          if (window.showToast) {
            window.showToast('جاري تثبيت تطبيق المؤسسة على جهازك! 📱✨', 'success');
          }
          deferredPrompt = null;
        }
      } catch (_) {
        openGuideModal();
      }
      return;
    }

    // 2. إذا كان على نظام iOS Safari أو متصفح لا يدعم beforeinstallprompt المباشر
    openGuideModal();
  }

  // التقاط حدث قبل التثبيت القياسي من كروم/إيدج/أندرويد
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showPwaBanner();

    // إظهار أزرار التثبيت المخصصة إن كانت مخفية
    document.querySelectorAll('.pwa-install-trigger').forEach((btn) => {
      btn.classList.add('can-install');
    });
  });

  // حدث اكتمال التثبيت بنجاح
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hidePwaBanner();
    closeGuideModal();
    try {
      localStorage.setItem('pwa_app_installed', 'true');
    } catch (_) {}
    if (window.showToast) {
      window.showToast('أهلاً بك! تم تثبيت تطبيق المؤسسة بنجاح على شاشتك الرئيسية 📱🎉', 'success');
    }
  });

  // تفويض نقرات التثبيت والإغلاق لكافة عناصر الصفحة
  document.addEventListener('click', (e) => {
    // الضغط على أي زر تثبيت في السايد بار، الهيدر، البانر، أو لوحة التحكم
    const installTrigger = e.target.closest('.pwa-install-trigger, #pwaBannerInstallBtn, #drawerPwaInstallBtn, #dashPwaInstallBtn, #headerPwaBtn');
    if (installTrigger) {
      e.preventDefault();
      handleInstallTrigger();
      return;
    }

    // إغلاق البانر الطافي
    const closeBannerBtn = e.target.closest('#pwaBannerCloseBtn, #pwaBannerDismissBtn');
    if (closeBannerBtn) {
      e.preventDefault();
      hidePwaBanner();
      try {
        localStorage.setItem('pwa_banner_dismissed_at', String(Date.now()));
      } catch (_) {}
      return;
    }

    // إغلاق نافذة إرشادات التثبيت
    const closeGuideBtn = e.target.closest('#pwaGuideCloseBtn, #pwaGuideBackdrop, #pwaGuideConfirmBtn');
    if (closeGuideBtn) {
      e.preventDefault();
      closeGuideModal();
    }
  });

  // إغلاق بزر Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeGuideModal();
    }
  });

  // إذا كان على أندرويد/كمبيوتر ولم يظهر beforeinstallprompt خلال ثانيتين (مثل زوار iOS)
  // نعرض البانر للتشجيع والتوجيه
  setTimeout(() => {
    if (!deferredPrompt && !isStandalone) {
      showPwaBanner();
    }
  }, 3200);

  // تصدير دوال عامة
  window.installPwaApp = handleInstallTrigger;
  window.openPwaGuide = openGuideModal;
})();
