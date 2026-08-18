/**
 * ═══════════════════ نظام الإشعارات في الواجهة الأمامية (Client SDK) ═══════════════════
 *
 * يتولى:
 *  1. جرس الإشعارات، العدّاد الفوري، القائمة المنسدلة، والتنقل في SPA.
 *  2. استعلام دوري خفيف (Polling) كل 60 ثانية + فور العودة للتبويب.
 *  3. تسجيل وتفعيل إشعارات Push عبر المتصفح وFirebase Cloud Messaging.
 *  4. التفاعل مع صفحة /notifications ولوحة التحكم /dashboard.
 */

(function () {
  'use strict';

  var pollTimer = null;
  var lastUnreadCount = 0;
  var isFetchingFeed = false;
  var currentTab = 'all';

  function timeAgo(dateString) {
    if (!dateString) return 'منذ قليل';
    var date = new Date(dateString);
    if (isNaN(date.getTime())) return 'منذ قليل';

    var now = new Date();
    var diffMs = now.getTime() - date.getTime();
    var diffSec = Math.floor(diffMs / 1000);
    var diffMin = Math.floor(diffSec / 60);
    var diffHours = Math.floor(diffMin / 60);
    var diffDays = Math.floor(diffHours / 24);

    if (diffSec < 45) return 'الآن';
    if (diffMin < 60) return 'منذ ' + diffMin + ' د';
    if (diffHours < 24) return 'منذ ' + diffHours + ' س';
    if (diffDays === 1) return 'أمس';
    if (diffDays <= 7) return 'منذ ' + diffDays + ' أيام';

    return date.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'short'
    });
  }

  function playNotificationSound() {
    try {
      var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (_) {}
  }

  // ────────────────────────── تحديث العدّاد ──────────────────────────

  async function updateUnreadCount() {
    try {
      var res = await fetch('/api/notifications/count', {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return;

      var data = await res.json();
      var count = Number(data.unread || 0);

      var badges = document.querySelectorAll('.notif-badge, #notifBadge');
      badges.forEach(function (badge) {
        if (count > 0) {
          badge.textContent = count > 99 ? '+99' : String(count);
          badge.style.display = 'inline-flex';
          badge.classList.add('pulse-badge');
        } else {
          badge.textContent = '0';
          badge.style.display = 'none';
          badge.classList.remove('pulse-badge');
        }
      });

      var headerUnread = document.getElementById('notifHeaderUnreadCount');
      if (headerUnread) {
        headerUnread.textContent = count > 0 ? (count + ' جديدة') : 'لا توجد جديدة';
      }

      var pageUnreadTotal = document.getElementById('notifPageUnreadTotal');
      if (pageUnreadTotal) {
        pageUnreadTotal.textContent = String(count);
      }

      // إذا زادت الإشعارات أثناء تصفح المستخدم، نُصدر صوتًا خفيفًا وتوست
      if (count > lastUnreadCount && lastUnreadCount >= 0 && data.latest) {
        playNotificationSound();
        if (window.showToast) {
          window.showToast(data.latest.title, 'subscribe');
        }
      }

      lastUnreadCount = count;
    } catch (e) {
      // فشل صامت
    }
  }

  // ────────────────────────── جلب وعرض الإشعارات في القائمة ──────────────────────────

  async function loadDropdownFeed() {
    var listWrapper = document.getElementById('notifItemsWrapper');
    var loadingState = document.getElementById('notifLoadingState');
    var emptyState = document.getElementById('notifEmptyState');

    if (!listWrapper) return;
    if (isFetchingFeed) return;
    isFetchingFeed = true;

    if (loadingState) loadingState.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';

    try {
      var url = '/api/notifications?limit=20' + (currentTab === 'unread' ? '&unread=1' : '');
      var res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      var json = await res.json();
      var items = (json && json.data) || [];

      if (loadingState) loadingState.style.display = 'none';

      if (items.length === 0) {
        listWrapper.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      var html = '';
      items.forEach(function (item) {
        var isRead = Boolean(item.is_read);
        var iconName = item.icon || 'fa-bell';
        var link = item.link || '#';

        html += '<div class="notif-dropdown-item ' + (isRead ? 'is-read' : 'is-unread') + '" data-id="' + item.id + '" data-link="' + (item.link || '') + '">';
        html += '  <div class="notif-item-icon-box"><i class="fa-solid ' + iconName + '"></i></div>';
        html += '  <div class="notif-item-text-box">';
        html += '    <h5 class="notif-item-title">' + escapeHtml(item.title) + '</h5>';
        if (item.body) {
          html += '    <p class="notif-item-body">' + escapeHtml(item.body) + '</p>';
        }
        html += '    <span class="notif-item-time">' + timeAgo(item.created_at) + '</span>';
        html += '  </div>';
        if (!isRead) {
          html += '  <span class="notif-item-unread-bullet" title="إشعار غير مقروء"></span>';
        }
        html += '</div>';
      });

      listWrapper.innerHTML = html;

      // إضافة أحداث النقر على الإشعارات
      listWrapper.querySelectorAll('.notif-dropdown-item').forEach(function (el) {
        el.addEventListener('click', async function (e) {
          var notifId = el.getAttribute('data-id');
          var targetLink = el.getAttribute('data-link');

          // تعليم كمقروء في الخلفية
          if (el.classList.contains('is-unread')) {
            markAsRead(notifId);
            el.classList.remove('is-unread');
            el.classList.add('is-read');
            var bullet = el.querySelector('.notif-item-unread-bullet');
            if (bullet) bullet.remove();
          }

          if (targetLink && targetLink !== '#' && targetLink !== '') {
            window.location.href = targetLink;
          }
        });
      });

    } catch (e) {
      if (loadingState) loadingState.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
    } finally {
      isFetchingFeed = false;
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async function markAsRead(id) {
    if (!id) return;
    try {
      await fetch('/api/notifications/read/' + encodeURIComponent(id), {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      updateUnreadCount();
    } catch (_) {}
  }

  async function markAllAsRead() {
    try {
      var res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        if (window.showToast) window.showToast('تم تحديد جميع الإشعارات كمقروءة', 'success');
        updateUnreadCount();
        loadDropdownFeed();
        // تحديث عناصر الصفحة إذا كنا في /notifications
        document.querySelectorAll('.notif-feed-item.is-unread').forEach(function (el) {
          el.classList.remove('is-unread');
          el.classList.add('is-read');
        });
      }
    } catch (_) {}
  }

  // ────────────────────────── تهيئة زر وقائمة الجرس ──────────────────────────

  function initBellHandlers() {
    var bellBtn = document.getElementById('notifBellBtn');
    var dropdown = document.getElementById('notifDropdown');
    var container = document.getElementById('notifBellContainer');

    if (!bellBtn || !dropdown) return;

    // تبديل فتح القائمة
    bellBtn.onclick = function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.contains('open');
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    };

    function openDropdown() {
      dropdown.classList.add('open');
      dropdown.setAttribute('aria-hidden', 'false');
      bellBtn.setAttribute('aria-expanded', 'true');
      loadDropdownFeed();
    }

    function closeDropdown() {
      dropdown.classList.remove('open');
      dropdown.setAttribute('aria-hidden', 'true');
      bellBtn.setAttribute('aria-expanded', 'false');
    }

    // إغلاق عند النقر بالخارج
    document.addEventListener('click', function (e) {
      if (container && !container.contains(e.target)) {
        closeDropdown();
      }
    });

    // إغلاق بزر Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dropdown.classList.contains('open')) {
        closeDropdown();
      }
    });

    // أزرار التبويبات (الكل / غير المقروءة)
    dropdown.querySelectorAll('.notif-tab').forEach(function (tab) {
      tab.onclick = function (e) {
        e.stopPropagation();
        dropdown.querySelectorAll('.notif-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        currentTab = tab.getAttribute('data-tab') || 'all';
        loadDropdownFeed();
      };
    });

    // زر قراءة الكل في القائمة
    var markAllBtn = document.getElementById('notifMarkAllBtn');
    if (markAllBtn) {
      markAllBtn.onclick = function (e) {
        e.stopPropagation();
        markAllAsRead();
      };
    }
  }

  // ────────────────────────── تهيئة أحداث الصفحة المستقلة واللوحة ──────────────────────────

  function initPageHandlers() {
    // صفحة /notifications: تحديد الكل كمقروء
    var pageMarkAll = document.getElementById('notifPageMarkAll');
    if (pageMarkAll) {
      pageMarkAll.onclick = function () { markAllAsRead(); };
    }

    // صفحة /notifications: قراءة إشعار فردي
    document.querySelectorAll('.notif-single-read-btn, .dash-single-read-btn').forEach(function (btn) {
      btn.onclick = async function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = btn.getAttribute('data-id');
        if (id) {
          await markAsRead(id);
          var row = btn.closest('.notif-feed-item') || btn.closest('tr');
          if (row) {
            row.classList.remove('is-unread');
            row.classList.add('is-read');
            btn.remove();
          }
        }
      };
    });

    // لوحة التحكم: زر قراءة الكل
    var dashMarkAll = document.getElementById('dashMarkAllNotifRead');
    if (dashMarkAll) {
      dashMarkAll.onclick = function () { markAllAsRead(); };
    }

    // لوحة التحكم: زر إرسال إشعار تجريبي
    var testBtn = document.getElementById('dashSendTestNotifBtn');
    if (testBtn) {
      testBtn.onclick = async function () {
        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جارٍ الإرسال...';
        try {
          var res = await fetch('/api/notifications/test', {
            method: 'POST',
            headers: { 'Accept': 'application/json' }
          });
          var data = await res.json();
          if (data.ok) {
            if (window.showToast) window.showToast('تم إرسال الإشعار التجريبي بنجاح ✅', 'success');
            updateUnreadCount();
            setTimeout(function () { window.location.reload(); }, 1200);
          } else {
            if (window.showToast) window.showToast(data.error || 'تعذر الإرسال', 'error');
          }
        } catch (e) {
          if (window.showToast) window.showToast('حدث خطأ أثناء إرسال الإشعار', 'error');
        } finally {
          testBtn.disabled = false;
          testBtn.innerHTML = '<i class="fa-solid fa-flask"></i> إرسال إشعار تجريبي';
        }
      };
    }

    // تفعيل إشعارات الـ Push من زر الصفحة
    var pushBtn = document.getElementById('notifEnablePushBtn');
    if (pushBtn) {
      pushBtn.onclick = function () {
        requestPushPermission();
      };
    }
  }

  // ────────────────────────── Web Push & Service Worker ──────────────────────────

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }
    try {
      var reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      });
      return reg;
    } catch (e) {
      console.warn('[Push] Service worker registration failed:', e);
      return null;
    }
  }

  async function requestPushPermission() {
    if (!('Notification' in window)) {
      if (window.showToast) window.showToast('المتصفح لا يدعم إشعارات الشاشة.', 'warning');
      return;
    }

    if (Notification.permission === 'granted') {
      await subscribeDevice();
      return;
    }

    if (Notification.permission === 'denied') {
      if (window.showToast) window.showToast('تم حظر الإشعارات مسبقًا. يمكنك تفعيلها من إعدادات المتصفح.', 'warning');
      return;
    }

    var permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await subscribeDevice();
    } else {
      if (window.showToast) window.showToast('لم يتم منح إذن الإشعارات.', 'info');
    }
  }

  async function subscribeDevice() {
    try {
      var reg = await registerServiceWorker();
      if (!reg) return;

      // نحاول تسجيل التوكن مع الخادم
      var sub = await reg.pushManager.getSubscription();
      if (!sub) {
        // إذا كان هناك مفتاح VAPID في المتصفح أو تم توفيره
        var subOptions = {
          userVisibleOnly: true
        };
        // محاولة جلب الاشتراك
        try {
          sub = await reg.pushManager.subscribe(subOptions);
        } catch (subErr) {
          console.log('[Push] Subscribe without VAPID fallback info:', subErr);
        }
      }

      if (sub) {
        var token = JSON.stringify(sub);
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: btoa(token) })
        });
        if (window.showToast) window.showToast('تم تفعيل التنبيهات الفورية على هذا الجهاز بنجاح 🔔', 'success');
      } else {
        if (window.showToast) window.showToast('تم تفعيل الإذن بنجاح.', 'success');
      }
    } catch (e) {
      console.warn('[Push] Error subscribing device:', e);
    }
  }

  // ────────────────────────── الدالة الرئيسية للتشغيل ──────────────────────────

  function init() {
    // منع تكرار المؤقتات
    if (pollTimer) clearInterval(pollTimer);

    initBellHandlers();
    initPageHandlers();
    updateUnreadCount();

    // استعلام دوري كل 60 ثانية
    pollTimer = setInterval(function () {
      if (!document.hidden) {
        updateUnreadCount();
      }
    }, 60000);

    // تحديث فوري عند العودة للتبويب
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        updateUnreadCount();
      }
    });

    // تسجيل الـ Service Worker في الخلفية إذا كان مدعومًا
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }

  // تصدير الدالة العامة ليتسنى استدعاؤها من SPA / Dashboard
  window.initNotificationBell = init;
  window.requestPushPermission = requestPushPermission;

  // تشغيل عند تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
