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
  var lastUnreadCount = -1;
  try {
    var storedLastCount = sessionStorage.getItem('omar_last_unread_count');
    if (storedLastCount !== null) {
      lastUnreadCount = parseInt(storedLastCount, 10);
    }
  } catch (_) {}
  var isFetchingFeed = false;
  var currentTab = 'all';

  // دالة لتعليم قسم لوحة التحكم كمشاهد وإخفاء النقطة الحمراء
  function markDashboardSectionSeen(section) {
    if (!section) return;
    try {
      localStorage.setItem('omar_dash_seen_' + section, new Date().toISOString());
    } catch (_) {}

    var dot = document.querySelector('.dash-alert-dot[data-dot-for="' + section + '"]');
    if (dot) {
      dot.style.display = 'none';
    }
  }

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

  // ────────────────────────── إدارة حالة القراءة محلياً (Guest / Offline Persistence) ──────────────────────────
  function getLocallyReadIds() {
    try {
      return JSON.parse(localStorage.getItem('omar_read_notifs') || '[]');
    } catch (_) {
      return [];
    }
  }

  function addLocallyReadId(id) {
    if (!id) return;
    try {
      var ids = getLocallyReadIds();
      if (ids.indexOf(id) === -1) {
        ids.push(id);
        localStorage.setItem('omar_read_notifs', JSON.stringify(ids));
      }
    } catch (_) {}
  }

  // ────────────────────────── تحديث العدّاد ──────────────────────────

  async function updateUnreadCount() {
    try {
      var res = await fetch('/api/notifications/count?_ts=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return;

      var data = await res.json();
      var count = Number(data.unread || 0);

      var localReads = getLocallyReadIds();
      if (count > 0 && localReads.length > 0) {
        var defaultUnreads = ['welcome-quran', 'welcome-zakat'];
        var readDefaultsCount = defaultUnreads.filter(function (id) {
          return localReads.indexOf(id) !== -1;
        }).length;
        if (readDefaultsCount > 0) {
          count = Math.max(0, count - readDefaultsCount);
        }
      }

      // تحديث شارات الأجراس
      var badges = document.querySelectorAll('.notif-badge, #notifBadge, #dashNotifBadge');
      badges.forEach(function (badge) {
        if (count > 0) {
          badge.textContent = count > 99 ? '+99' : String(count);
          badge.style.setProperty('display', 'inline-flex', 'important');
          badge.classList.add('pulse-badge');
        } else {
          badge.textContent = '0';
          badge.style.setProperty('display', 'none', 'important');
          badge.classList.remove('pulse-badge');
        }
      });

      // إضافة حالة has-unread لأزرار الأجراس للتنبيه البصري
      var bellButtons = document.querySelectorAll('.notif-bell-btn, #notifBellBtn, #dashNotifBellBtn');
      bellButtons.forEach(function (btn) {
        if (count > 0) {
          btn.classList.add('has-unread');
        } else {
          btn.classList.remove('has-unread');
        }
      });

      var headerUnread = document.getElementById('notifHeaderUnreadCount');
      if (headerUnread) {
        headerUnread.textContent = count > 0 ? (count + ' جديدة') : 'لا توجد جديدة';
      }

      var dashHeaderUnread = document.getElementById('dashNotifHeaderUnreadCount');
      if (dashHeaderUnread) {
        dashHeaderUnread.textContent = count > 0 ? (count + ' جديدة') : 'لا توجد جديدة';
      }

      var pageUnreadTotal = document.getElementById('notifPageUnreadTotal');
      if (pageUnreadTotal) {
        pageUnreadTotal.textContent = String(count);
      }

      // ────────────────── التحكم الذكي في ظهور التوست والتنبيه الصوتي ──────────────────
      if (count > 0 && data.latest && data.latest.id) {
        var toastKey = 'omar_toast_seen_' + data.latest.id;
        var seenThisSession = sessionStorage.getItem(toastKey);
        var isNewArrival = lastUnreadCount >= 0 && count > lastUnreadCount;
        var isFirstVisitWithUnread = !seenThisSession && !sessionStorage.getItem('omar_session_toasted');

        if (isNewArrival || isFirstVisitWithUnread) {
          sessionStorage.setItem(toastKey, '1');
          sessionStorage.setItem('omar_session_toasted', '1');
          playNotificationSound();
          if (window.showToast) {
            window.showToast(data.latest.title, 'subscribe');
          }
        }
      }

      lastUnreadCount = count;
      try {
        sessionStorage.setItem('omar_last_unread_count', String(count));
      } catch (_) {}

      // ────────────────── تحديث النقاط الحمراء التنبيهية في لوحة التحكم (Section Alert Dots) ──────────────────
      if (data.section_alerts) {
        var isDashboard = window.location.pathname.startsWith('/dashboard');
        var currentView = (new URL(location.href)).searchParams.get('view') || 'overview';

        var allDots = document.querySelectorAll('.dash-alert-dot');
        allDots.forEach(function (dot) {
          var sec = dot.getAttribute('data-dot-for');
          if (!sec) return;

          var alertInfo = data.section_alerts[sec];
          var seenAt = null;
          try {
            seenAt = localStorage.getItem('omar_dash_seen_' + sec);
          } catch (_) {}

          if (isDashboard && currentView === sec) {
            // القسم المفتوح حالياً تختفي نقطته فوراً ويُعتبر تمت مشاهدته
            dot.style.display = 'none';
            if (alertInfo && alertInfo.latest_at) {
              try { localStorage.setItem('omar_dash_seen_' + sec, alertInfo.latest_at); } catch (_) {}
            }
          } else if (alertInfo && alertInfo.count > 0) {
            // حدث جديد لم يشاهده المشرف بعد في هذا القسم
            var isNewer = !seenAt || (alertInfo.latest_at && alertInfo.latest_at > seenAt);
            dot.style.display = isNewer ? 'inline-block' : 'none';
          } else {
            dot.style.display = 'none';
          }
        });
      }
    } catch (e) {
      // فشل صامت
    }
  }

  // ────────────────────────── جلب وعرض الإشعارات في القائمة ──────────────────────────

  async function loadDropdownFeed(targetDropdown) {
    var dropdown = targetDropdown || document.querySelector('.notif-dropdown');
    if (!dropdown) return;
    var listWrapper = dropdown.querySelector('.notif-items-wrapper') || document.getElementById('notifItemsWrapper');
    var loadingState = dropdown.querySelector('.notif-loading-state') || document.getElementById('notifLoadingState');
    var emptyState = dropdown.querySelector('.notif-empty-state') || document.getElementById('notifEmptyState');

    if (!listWrapper) return;
    if (isFetchingFeed) return;
    isFetchingFeed = true;

    if (loadingState) loadingState.style.display = 'flex';
    if (emptyState) emptyState.style.display = 'none';

    try {
      var url = '/api/notifications?limit=20&_ts=' + Date.now() + (currentTab === 'unread' ? '&unread=1' : '');
      var res = await fetch(url, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      var json = await res.json();
      var items = (json && json.data) || [];

      if (loadingState) loadingState.style.display = 'none';

      if (items.length === 0) {
        listWrapper.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      var localReads = getLocallyReadIds();
      var html = '';
      items.forEach(function (item) {
        var isRead = Boolean(item.is_read) || localReads.indexOf(item.id) !== -1;
        var iconName = item.icon || 'fa-bell';

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

          // تعليم كمقروء محلياً وفي السيرفر
          if (notifId) {
            addLocallyReadId(notifId);
            markAsRead(notifId);
          }

          el.classList.remove('is-unread');
          el.classList.add('is-read');
          var bullet = el.querySelector('.notif-item-unread-bullet');
          if (bullet) bullet.remove();

          closeAllDropdowns();

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
    addLocallyReadId(id);
    try {
      await fetch('/api/notifications/read/' + encodeURIComponent(id), {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
    } catch (_) {}
    updateUnreadCount();
  }

  async function markAllAsRead() {
    // تعليم كل الإشعارات محلياً فوراً
    addLocallyReadId('welcome-quran');
    addLocallyReadId('welcome-zakat');
    addLocallyReadId('welcome-foundation');

    document.querySelectorAll('.notif-dropdown-item, .notif-feed-item').forEach(function (el) {
      var id = el.getAttribute('data-id');
      if (id) addLocallyReadId(id);
      el.classList.remove('is-unread');
      el.classList.add('is-read');
      var bullet = el.querySelector('.notif-item-unread-bullet');
      if (bullet) bullet.remove();
    });

    // تصفير فوري لشارات الأجراس في الواجهة
    var badges = document.querySelectorAll('.notif-badge, #notifBadge, #dashNotifBadge');
    badges.forEach(function (badge) {
      badge.textContent = '0';
      badge.style.setProperty('display', 'none', 'important');
      badge.classList.remove('pulse-badge');
    });

    var bellButtons = document.querySelectorAll('.notif-bell-btn, #notifBellBtn, #dashNotifBellBtn');
    bellButtons.forEach(function (btn) {
      btn.classList.remove('has-unread');
    });

    var headerUnreads = document.querySelectorAll('#notifHeaderUnreadCount, #dashNotifHeaderUnreadCount');
    headerUnreads.forEach(function (el) {
      el.textContent = 'لا توجد جديدة';
    });

    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
    } catch (_) {}

    if (window.showToast) window.showToast('تم تحديد جميع الإشعارات كمقروءة', 'success');
    updateUnreadCount();
    loadDropdownFeed();
  }

  // ────────────────────────── تهيئة زر وقائمة الجرس ──────────────────────────

  function closeAllDropdowns() {
    var dropdowns = document.querySelectorAll('.notif-dropdown');
    var bells = document.querySelectorAll('.notif-bell-btn, #notifBellBtn, #dashNotifBellBtn');
    var backdrop = document.getElementById('notifBackdrop');

    dropdowns.forEach(function (d) {
      d.classList.remove('open');
      d.setAttribute('aria-hidden', 'true');
    });
    bells.forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.site-header.notif-open, .dash-topbar.notif-open').forEach(function (h) {
      h.classList.remove('notif-open');
    });
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function checkPushBanner() {
    var optinBoxes = document.querySelectorAll('.notif-push-optin-box, #notifPushOptinBox');
    if (!('Notification' in window)) {
      optinBoxes.forEach(function (b) { b.style.display = 'none'; });
      return;
    }
    if (Notification.permission === 'granted') {
      optinBoxes.forEach(function (b) { b.style.display = 'none'; });
    } else {
      optinBoxes.forEach(function (b) { b.style.display = 'flex'; });
    }
  }

  function openDropdown(dropdown, bellBtn) {
    if (!dropdown) return;
    dropdown.classList.add('open');
    dropdown.setAttribute('aria-hidden', 'false');
    if (bellBtn) bellBtn.setAttribute('aria-expanded', 'true');

    var header = dropdown.closest('.site-header, .dash-topbar') || document.querySelector('.site-header, .dash-topbar');
    if (header) header.classList.add('notif-open');

    if (window.innerWidth <= 780) {
      var bd = document.getElementById('notifBackdrop');
      if (!bd) {
        bd = document.createElement('div');
        bd.className = 'notif-backdrop';
        bd.id = 'notifBackdrop';
        bd.setAttribute('aria-hidden', 'true');
        document.body.appendChild(bd);
        bd.onclick = function (e) {
          e.preventDefault();
          closeAllDropdowns();
        };
      }
      bd.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    checkPushBanner();
    loadDropdownFeed(dropdown);
  }

  function initBellHandlers() {
    var backdrop = document.getElementById('notifBackdrop');
    var dropdowns = document.querySelectorAll('.notif-dropdown');

    // إغلاق عبر الخلفية (Backdrop)
    if (backdrop) {
      backdrop.onclick = function (e) {
        e.preventDefault();
        closeAllDropdowns();
      };
    }

    // أزرار الإغلاق الصريحة في الهواتف
    document.querySelectorAll('.notif-close-mobile-btn, .notif-close-btn').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeAllDropdowns();
      };
    });

    // تفويض نقر الجرس على مستوى الـ document ليعمل في كافة الشاشات ولوحة التحكم وتحديثات الـ DOM
    document.addEventListener('click', function (e) {
      var bellBtn = e.target.closest('.notif-bell-btn, #notifBellBtn, #dashNotifBellBtn');
      if (bellBtn) {
        e.preventDefault();
        e.stopPropagation();
        var container = bellBtn.closest('.notif-bell-container');
        var dropdown = container ? container.querySelector('.notif-dropdown') : document.querySelector('.notif-dropdown');
        if (!dropdown) return;

        var isOpen = dropdown.classList.contains('open');
        if (isOpen) {
          closeAllDropdowns();
        } else {
          closeAllDropdowns();
          openDropdown(dropdown, bellBtn);
        }
        return;
      }

      // إغلاق عند النقر بالخارج
      var inDropdown = e.target.closest('.notif-dropdown');
      var inContainer = e.target.closest('.notif-bell-container');
      var inBackdrop = e.target.closest('.notif-backdrop');
      if (!inDropdown && !inContainer && !inBackdrop) {
        closeAllDropdowns();
      }
    });

    // إغلاق بزر Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllDropdowns();
      }
    });

    // أزرار التبويبات (الكل / غير المقروءة)
    dropdowns.forEach(function (dropdown) {
      dropdown.querySelectorAll('.notif-tab').forEach(function (tab) {
        tab.onclick = function (e) {
          e.stopPropagation();
          dropdown.querySelectorAll('.notif-tab').forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
          currentTab = tab.getAttribute('data-tab') || 'all';
          loadDropdownFeed(dropdown);
        };
      });
    });

    // زر قراءة الكل في القائمة
    document.querySelectorAll('.notif-mark-all-btn, #notifMarkAllBtn').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        markAllAsRead();
      };
    });

    // زر تفعيل الـ Push من داخل القائمة
    document.querySelectorAll('.notif-push-optin-action-btn, #notifDropdownEnablePushBtn').forEach(function (btn) {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        requestPushPermission();
      };
    });
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

    // لوحة التحكم: زر تفريغ الإشعارات المقروءة القديمة
    var dashClearReadBtn = document.getElementById('dashClearReadNotifsBtn');
    if (dashClearReadBtn) {
      dashClearReadBtn.onclick = async function () {
        if (!confirm('هل أنت متأكد من رغبتك في تفريغ الإشعارات المقروءة؟')) return;
        try {
          var res = await fetch('/api/notifications/clear-all-admin', { method: 'POST' });
          var data = await res.json();
          if (data.ok) {
            if (window.showToast) window.showToast('تم تنظيف ' + (data.deleted || 0) + ' إشعار مقروء بنجاح', 'success');
            setTimeout(function () { window.location.reload(); }, 900);
          }
        } catch (e) {
          if (window.showToast) window.showToast('تعذر تنظيف الإشعارات', 'error');
        }
      };
    }

    // لوحة التحكم: حذف إشعار فردي
    document.querySelectorAll('.dash-single-delete-btn').forEach(function (btn) {
      btn.onclick = async function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = btn.getAttribute('data-id');
        if (!id) return;
        if (!confirm('هل تريد حذف هذا الإشعار نهائياً من السجل؟')) return;

        try {
          var res = await fetch('/api/notifications/delete/' + id, { method: 'POST' });
          var data = await res.json();
          if (data.ok) {
            var row = btn.closest('tr');
            if (row) {
              row.style.transition = 'opacity 0.3s, transform 0.3s';
              row.style.opacity = '0';
              row.style.transform = 'translateX(20px)';
              setTimeout(function () { row.remove(); }, 300);
            }
            if (window.showToast) window.showToast('تم حذف الإشعار بنجاح', 'success');
            updateUnreadCount();
          }
        } catch (err) {
          if (window.showToast) window.showToast('تعذر حذف الإشعار', 'error');
        }
      };
    });

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
          testBtn.innerHTML = '<i class="fa-solid fa-flask"></i> <span>إشعار تجريبي</span>';
        }
      };
    }

    // ────────────────────────── نافذة إنشاء وبث الإشعارات المخصصة (Modal) ──────────────────────────
    var sendModal = document.getElementById('sendNotificationModal');
    var openSendBtn = document.getElementById('dashOpenSendModalBtn');
    var closeSendBtn = document.getElementById('dashCloseSendModalBtn');
    var cancelSendBtn = document.getElementById('dashCancelSendModalBtn');
    var modalBackdrop = document.getElementById('dashModalBackdrop');
    var sendForm = document.getElementById('sendCustomNotificationForm');

    if (sendModal && openSendBtn) {
      function openModal() {
        sendModal.style.display = 'flex';
        sendModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }

      function closeModal() {
        sendModal.style.display = 'none';
        sendModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      openSendBtn.onclick = openModal;
      if (closeSendBtn) closeSendBtn.onclick = closeModal;
      if (cancelSendBtn) cancelSendBtn.onclick = closeModal;
      if (modalBackdrop) modalBackdrop.onclick = closeModal;

      // إغلاق بـ Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && sendModal.style.display === 'flex') {
          closeModal();
        }
      });

      // القوالب الجاهزة السريعة (Presets)
      var presetSelect = document.getElementById('notifPresetSelect');
      var titleInput = document.getElementById('notifCustomTitle');
      var bodyInput = document.getElementById('notifCustomBody');
      var catSelect = document.getElementById('notifCustomCategory');
      var prioSelect = document.getElementById('notifCustomPriority');
      var linkInput = document.getElementById('notifCustomLink');
      var audienceSelect = document.getElementById('notifAudienceSelect');
      var targetWrap = document.getElementById('targetUserWrap');

      var PRESETS = {
        urgent_campaign: {
          title: 'حملة خيرية عاجلة تحتاج دعمكم الآن 🚨',
          body: 'ندعو أهل الخير للمساهمة في توفير العلاج والمساعدات الطبية الطارئة للأسر الأكثر احتياجاً.',
          category: 'financial',
          priority: 'high',
          link: '/campaigns',
          audience: 'all'
        },
        volunteer_thanks: {
          title: 'شكر وتقدير لفريق أبطال التطوع 🤝💚',
          body: 'تتوجه إدارة المؤسسة بالشكر الجزيل لكافة المتطوعين على جهودهم المشرفة في الفعاليات الميدانية الأخيرة.',
          category: 'volunteers',
          priority: 'normal',
          link: '/dashboard?view=volunteers',
          audience: 'volunteers'
        },
        new_event: {
          title: 'فعالية جديدة: قافلة الخير الطبية 📅',
          body: 'يسرنا دعوتكم لحضور والمشاركة في فعاليات القافلة الخيرية يوم الجمعة القادم بمقر المؤسسة.',
          category: 'content',
          priority: 'normal',
          link: '/events',
          audience: 'all'
        },
        management_update: {
          title: 'تحديث هام من مجلس إدارة المؤسسة 📢',
          body: 'تم اعتماد التقرير المالي والإداري للربع السنوي بنجاح. شكراً لثقتكم ومساهماتكم المستمرة.',
          category: 'content',
          priority: 'normal',
          link: '/news',
          audience: 'all'
        },
        donation_drive: {
          title: 'نداء مساهمة: مشروع إطعام الأسر المتعففة 🍲',
          body: 'ساهم معنا اليوم في توفير وجبات وكراتين المواد الغذائية الشهرية للعائلات المستحقة.',
          category: 'financial',
          priority: 'high',
          link: '/campaigns',
          audience: 'donors'
        }
      };

      if (presetSelect) {
        presetSelect.onchange = function () {
          var val = presetSelect.value;
          if (val && PRESETS[val]) {
            var p = PRESETS[val];
            if (titleInput) titleInput.value = p.title;
            if (bodyInput) bodyInput.value = p.body;
            if (catSelect) catSelect.value = p.category;
            if (prioSelect) prioSelect.value = p.priority;
            if (linkInput) linkInput.value = p.link;
            if (audienceSelect) audienceSelect.value = p.audience;
            if (targetWrap) targetWrap.style.display = p.audience === 'single' ? 'block' : 'none';
            updateLivePreview();
          }
        };
      }

      // إظهار حقل المستخدم المستهدف عند اختيار single
      if (audienceSelect && targetWrap) {
        audienceSelect.onchange = function () {
          targetWrap.style.display = audienceSelect.value === 'single' ? 'block' : 'none';
        };
      }

      // المعاينة الحية (Live Real-time Preview)
      var prevTitle = document.getElementById('previewTitle');
      var prevBody = document.getElementById('previewBody');
      var prevBadge = document.getElementById('previewPriorityBadge');
      var prevLink = document.getElementById('previewLink');
      var prevBellTitle = document.getElementById('previewBellTitle');
      var prevBellBody = document.getElementById('previewBellBody');

      function updateLivePreview() {
        var t = titleInput ? titleInput.value.trim() : '';
        var b = bodyInput ? bodyInput.value.trim() : '';
        var p = prioSelect ? prioSelect.value : 'normal';
        var l = linkInput ? linkInput.value.trim() : '/notifications';

        if (prevTitle) prevTitle.textContent = t || 'عنوان الإشعار يظهر هنا';
        if (prevBellTitle) prevBellTitle.textContent = t || 'عنوان الإشعار';

        if (prevBody) prevBody.textContent = b || 'تفاصيل ونص الرسالة ستظهر هنا مباشرة للمستخدم في شاشة القفل وإشعارات النظام.';
        if (prevBellBody) prevBellBody.textContent = b || 'تفاصيل الإشعار في القائمة...';

        if (prevBadge) {
          prevBadge.textContent = p === 'high' ? 'عاجل' : 'عادي';
          prevBadge.style.background = p === 'high' ? 'rgba(244,63,94,.18)' : 'rgba(16,185,129,.18)';
          prevBadge.style.color = p === 'high' ? '#f43f5e' : '#10b981';
        }

        if (prevLink) prevLink.textContent = 'اضغط لفتح: ' + (l || '/notifications');
      }

      [titleInput, bodyInput, prioSelect, linkInput].forEach(function (el) {
        if (el) el.addEventListener('input', updateLivePreview);
      });

      // إرسال النموذج عبر AJAX
      if (sendForm) {
        sendForm.onsubmit = async function (e) {
          e.preventDefault();
          var submitBtn = document.getElementById('submitBroadcastBtn');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جارٍ الإرسال...';
          }

          try {
            var formData = new FormData(sendForm);
            var payload = {
              title: formData.get('title'),
              body: formData.get('body'),
              category: formData.get('category'),
              priority: formData.get('priority'),
              link: formData.get('link'),
              audience: formData.get('audience'),
              target_user: formData.get('target_user'),
              send_in_app: formData.get('send_in_app') === '1',
              send_push: formData.get('send_push') === '1'
            };

            var res = await fetch('/api/notifications/send-custom', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            var data = await res.json();
            if (data.ok) {
              if (window.showToast) window.showToast(data.message || 'تم إرسال الإشعار بنجاح 🚀', 'success');
              closeModal();
              sendForm.reset();
              updateUnreadCount();
              setTimeout(function () { window.location.reload(); }, 1200);
            } else {
              if (window.showToast) window.showToast(data.error || 'تعذر إرسال الإشعار', 'error');
            }
          } catch (err) {
            if (window.showToast) window.showToast('حدث خطأ أثناء الإرسال', 'error');
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> إرسال الإشعار الآن';
            }
          }
        };
      }
    }

    // ────────────────────────── فلترة وبحث جدول الإشعارات في لوحة التحكم ──────────────────────────
    var searchInput = document.getElementById('notifDashSearchInput');
    var tabBtns = document.querySelectorAll('#dashNotifTabs .dash-tab-btn');
    var rows = document.querySelectorAll('#dashNotificationsTable tbody tr.notif-row');
    var emptyRow = document.getElementById('noNotifsRow');

    var currentFilter = 'all';
    var currentQuery = '';

    function applyTableFilters() {
      var visibleCount = 0;
      rows.forEach(function (row) {
        var cat = row.getAttribute('data-category');
        var readStatus = row.getAttribute('data-read');
        var searchIndex = (row.getAttribute('data-search') || '').toLowerCase();

        var matchCategory = true;
        if (currentFilter === 'unread') matchCategory = (readStatus === 'unread');
        else if (currentFilter !== 'all') matchCategory = (cat === currentFilter);

        var matchSearch = !currentQuery || searchIndex.indexOf(currentQuery) !== -1;

        if (matchCategory && matchSearch) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });

      if (emptyRow) {
        emptyRow.style.display = visibleCount === 0 ? '' : 'none';
      }
    }

    if (searchInput) {
      searchInput.oninput = function () {
        currentQuery = searchInput.value.trim().toLowerCase();
        applyTableFilters();
      };
    }

    tabBtns.forEach(function (btn) {
      btn.onclick = function () {
        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter') || 'all';
        applyTableFilters();
      };
    });

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
      if (window.showToast) window.showToast('المتصفح لا يدعم إشعارات الشاشة على هذا الجهاز.', 'warning');
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

    try {
      var permission = await new Promise(function (resolve) {
        try {
          var p = Notification.requestPermission(function (status) {
            resolve(status);
          });
          if (p && p.then) {
            p.then(resolve).catch(function () { resolve('denied'); });
          }
        } catch (e) {
          resolve('denied');
        }
      });

      if (permission === 'granted') {
        await subscribeDevice();
        var optinBoxes = document.querySelectorAll('.notif-push-optin-box, #notifPushOptinBox');
        optinBoxes.forEach(function (b) { b.style.display = 'none'; });
      } else {
        if (window.showToast) window.showToast('لم يتم منح إذن الإشعارات.', 'info');
      }
    } catch (err) {
      console.warn('[Push] Permission request error:', err);
    }
  }

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function subscribeDevice() {
    try {
      var reg = await registerServiceWorker();
      if (!reg) return;

      var vapidRes = await fetch('/api/notifications/vapid').catch(() => null);
      var vapidData = vapidRes && vapidRes.ok ? await vapidRes.json() : null;
      var vapidKey = (vapidData && vapidData.vapidKey) || 'BCFKta5Azzt7VNaDKC-yJtfuPxzK5hHZAeRkocJuyzxt4L4KBxZPQe8gl60Sf8S1XgW2HxxejxiggtfHF0dprkY';

      var sub = await reg.pushManager.getSubscription();
      if (!sub && vapidKey) {
        try {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey)
          });
        } catch (subErr) {
          console.warn('[Push] Subscribe with VAPID failed:', subErr);
        }
      }

      if (sub) {
        var token = JSON.stringify(sub);
        var res = await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: btoa(token) })
        });
        if (res.ok) {
          if (window.showToast) window.showToast('تم تفعيل التنبيهات الفورية على هذا الجهاز بنجاح 🔔', 'success');
        }
      } else {
        if (window.showToast) window.showToast('تم حفظ إذن الإشعارات بنجاح.', 'success');
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

    // مراقبة نقرات أقسام لوحة التحكم لتعليمها كمقروءة وإزالة النقطة الحمراء فوراً
    if (window.location.pathname.startsWith('/dashboard')) {
      var currentView = (new URL(location.href)).searchParams.get('view') || 'overview';
      markDashboardSectionSeen(currentView);

      document.querySelectorAll('.dash-sidebar nav a[data-dash-view]').forEach(function (link) {
        link.addEventListener('click', function () {
          var viewName = link.getAttribute('data-dash-view');
          if (viewName) {
            markDashboardSectionSeen(viewName);
          }
        });
      });
    }

    // تسجيل الـ Service Worker في الخلفية إذا كان مدعومًا
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }

  // تصدير الدوال العامة ليتسنى استدعاؤها من SPA / Dashboard
  window.initNotificationBell = init;
  window.requestPushPermission = requestPushPermission;
  window.closeNotificationDropdowns = closeAllDropdowns;
  window.markDashboardSectionSeen = markDashboardSectionSeen;
  window.updateNotificationCount = updateUnreadCount;

  // تشغيل عند تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
