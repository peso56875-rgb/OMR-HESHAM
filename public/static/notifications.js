/**
 * مركز الإشعارات — الطبقة العميلة
 *
 * يُشغّل: الجرس في الهيدر ولوحة التحكم، صفحة الإشعارات الكاملة،
 * وبطاقة التفضيلات في صفحة الحساب.
 *
 * يُصدِّر window.initNotificationBell() لأن لوحة التحكم تعمل كـ SPA:
 * loadDashboardView() تستبدل innerHTML بالكامل، فيموت الجرس ومستمعاته
 * ويبقى المؤقّت القديم يعمل على عقدة منفصلة عن الصفحة (تسريب ذاكرة
 * + طلبات شبكة بلا فائدة). لذلك يجب استدعاء الدالة بعد كل تنقّل.
 */
(() => {
  'use strict'

  const $ = (s, root = document) => root.querySelector(s)
  const $$ = (s, root = document) => [...root.querySelectorAll(s)]

  const POLL_MS = 60000
  const COUNT_URL = '/api/notifications/count'
  const FEED_URL = '/api/notifications'

  /* ───────────────────────── أدوات ───────────────────────── */

  /**
   * أي نص من السيرفر يُدخل إلى innerHTML يجب أن يمرّ من هنا.
   * عناوين الإشعارات تحتوي أسماء مستخدمين وعناوين رسائل تواصل — أي
   * محتوى كتبه طرف خارجي. بدون تهريب، اسم متبرّع فيه <img onerror>
   * يصبح XSS مخزَّنًا يعمل في لوحة المشرف.
   */
  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  const toast = (msg, type) => window.showToast?.(msg, type || 'info')

  const AR_NUM = (n) => Number(n).toLocaleString('ar-EG')

  /** «منذ ٣ دقائق» — أقرب للإحساس البشري من تاريخ كامل داخل قائمة سريعة. */
  const timeAgo = (iso) => {
    const t = Date.parse(iso)
    if (!Number.isFinite(t)) return ''
    const diff = Math.floor((Date.now() - t) / 1000)
    if (diff < 45) return 'الآن'
    if (diff < 3600) return `منذ ${AR_NUM(Math.floor(diff / 60))} دقيقة`
    if (diff < 86400) return `منذ ${AR_NUM(Math.floor(diff / 3600))} ساعة`
    if (diff < 604800) return `منذ ${AR_NUM(Math.floor(diff / 86400))} يوم`
    // أقدم من أسبوع: التاريخ نفسه أوضح من «منذ ٣ أسابيع»
    return new Date(t).toLocaleDateString('ar-EG', {
      timeZone: 'Africa/Cairo', day: 'numeric', month: 'long'
    })
  }

  const getJSON = async (url) => {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
    if (!res.ok) throw new Error(String(res.status))
    return res.json()
  }

  const postJSON = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body || {})
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || String(res.status))
    return data
  }

  /* ───────────────────────── العرض ───────────────────────── */

  const emptyState = (msg) =>
    `<div class="notif-empty"><i class="fa-regular fa-bell-slash"></i><strong>${esc(msg)}</strong></div>`

  /** يبني عنصر إشعار واحد. `compact` للوحة المنسدلة، الكامل لصفحة الإشعارات. */
  const renderItem = (n, compact) => {
    const unread = n.is_read ? '' : ' is-unread'
    const high = n.priority === 'high' || n.priority === 'urgent' ? ' is-high' : ''
    // الرابط اختياري: إشعارات مثل «تحديث ساعاتك» لا وجهة لها.
    const tag = n.link ? 'a' : 'div'
    const href = n.link ? ` href="${esc(n.link)}"` : ''
    const meta = n.actor_name && !compact ? `<span class="notif-actor">${esc(n.actor_name)}</span>` : ''
    const body = n.body ? `<p class="notif-body">${esc(n.body)}</p>` : ''

    return `<${tag}${href} class="notif-item${unread}${high}" data-notif-item="${esc(n.id)}" data-notif-audience="${esc(n.audience)}">
      <span class="notif-icon"><i class="fa-solid ${esc(n.icon || 'fa-bell')}"></i></span>
      <span class="notif-main">
        <strong class="notif-title">${esc(n.title)}</strong>
        ${body}
        <span class="notif-foot">
          <time datetime="${esc(n.created_at)}">${esc(timeAgo(n.created_at))}</time>
          ${meta}
        </span>
      </span>
      ${n.is_read ? '' : '<span class="notif-dot" aria-label="غير مقروء"></span>'}
    </${tag}>`
  }

  const renderList = (items, compact) => {
    if (!items || !items.length) return emptyState('لا توجد إشعارات حتى الآن')
    return items.map((n) => renderItem(n, compact)).join('')
  }

  /**
   * تعليم كمقروء عند النقر.
   * نُرسل الطلب ولا ننتظره قبل التنقّل: الانتظار يعني تأخير الانتقال
   * إلى صفحة الإشعار بمقدار زمن الشبكة، والفشل غير مؤثّر (العدّاد
   * يُصحّح نفسه في أول استقصاء).
   */
  const bindItemClicks = (root, onChanged) => {
    $$('[data-notif-item]', root).forEach((el) => {
      if (el.dataset.notifBound === '1') return
      el.dataset.notifBound = '1'
      el.addEventListener('click', () => {
        if (!el.classList.contains('is-unread')) return
        el.classList.remove('is-unread')
        $('.notif-dot', el)?.remove()
        postJSON(`/api/notifications/read/${encodeURIComponent(el.dataset.notifItem)}`)
          .then(() => onChanged?.())
          .catch(() => {})
      })
    })
  }

  /* ───────────────────────── الجرس ───────────────────────── */

  // مؤقّت واحد على مستوى الصفحة. أي تهيئة جديدة تُلغي القديم أولًا،
  // وإلا تراكمت المؤقّتات مع كل تنقّل داخل لوحة التحكم.
  let pollTimer = null
  let bellLoaded = false
  let globalsBound = false

  const paintCount = (unread, capped) => {
    $$('[data-notif-count]').forEach((badge) => {
      if (unread > 0) {
        badge.textContent = capped ? `+${AR_NUM(99)}` : AR_NUM(unread)
        badge.hidden = false
      } else {
        badge.textContent = ''
        badge.hidden = true
      }
    })
    $$('[data-notif-bell] [data-notif-read-all]').forEach((b) => { b.hidden = unread === 0 })
  }

  const refreshCount = async () => {
    try {
      const data = await getJSON(COUNT_URL)
      paintCount(Number(data.unread) || 0, data.capped === true)
    } catch (_) {
      // الفشل صامت بالكامل: العدّاد رفاهية، وإظهار خطأ لأن استقصاء
      // خلفيًا فشل يُقلق المستخدم بلا سبب.
    }
  }

  const loadBellFeed = async (force) => {
    const list = $('[data-notif-bell] [data-notif-list]')
    if (!list) return
    if (bellLoaded && !force) return

    try {
      const data = await getJSON(`${FEED_URL}?limit=10`)
      list.innerHTML = renderList(data.data, true)
      bellLoaded = true
      paintCount(Number(data.unread) || 0, false)
      bindItemClicks(list, refreshCount)
    } catch (_) {
      list.innerHTML = emptyState('تعذّر تحميل الإشعارات')
    }
  }

  const closePanel = () => {
    const panel = $('[data-notif-bell] [data-notif-panel]')
    if (!panel || panel.hidden) return
    panel.hidden = true
    $('#notif-bell-btn')?.setAttribute('aria-expanded', 'false')
  }

  const markAllRead = async (onDone) => {
    try {
      const data = await postJSON('/api/notifications/read-all')
      if (data.updated > 0) toast(`تم تعليم ${AR_NUM(data.updated)} إشعارًا كمقروء`, 'success')
      paintCount(0, false)
      onDone?.()
    } catch (e) {
      toast(e.message || 'تعذّر تحديث الإشعارات', 'error')
    }
  }

  /**
   * تهيئة الجرس. آمنة للاستدعاء المتكرّر (idempotent) — تُستدعى مرة عند
   * تحميل الصفحة ومرة بعد كل تنقّل داخل لوحة التحكم.
   */
  const initNotificationBell = () => {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null }

    const wrap = $('[data-notif-bell]')
    if (!wrap) return   // لا جرس في هذه الصفحة (زائر غير مسجّل)

    bellLoaded = false
    const btn = $('#notif-bell-btn', wrap)
    const panel = $('[data-notif-panel]', wrap)

    if (btn && panel && wrap.dataset.notifBound !== '1') {
      wrap.dataset.notifBound = '1'

      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const open = panel.hidden
        panel.hidden = !open
        btn.setAttribute('aria-expanded', open ? 'true' : 'false')
        if (open) loadBellFeed(false)
      })

      $('[data-notif-close]', panel)?.addEventListener('click', closePanel)
      $('[data-notif-read-all]', panel)?.addEventListener('click', () => {
        markAllRead(() => loadBellFeed(true))
      })
    }

    // مستمعو المستند يُربطون مرة واحدة فقط طوال عمر الصفحة.
    // لو ربطناهم داخل الشرط أعلاه لأضفنا نسخة جديدة مع كل تنقّل في
    // لوحة التحكم (لأن العقدة تُعاد بناؤها فيفقد الحرس أثره)، فينتهي
    // الأمر بعشرات المستمعين على نفس الحدث.
    if (!globalsBound) {
      globalsBound = true
      // النقر خارج اللوحة أو Escape يغلقها — سلوك متوقّع لأي منسدلة.
      // نستعلم عن العقدة وقت الحدث لا وقت الربط، لأن العقدة المحفوظة
      // تصبح منفصلة عن المستند بعد أول تنقّل داخل اللوحة.
      document.addEventListener('click', (e) => {
        const w = $('[data-notif-bell]')
        if (w && !w.contains(e.target)) closePanel()
      })
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel() })
    }

    refreshCount()
    pollTimer = setInterval(refreshCount, POLL_MS)
  }

  window.initNotificationBell = initNotificationBell

  /**
   * الاستقصاء يتوقّف فعليًا عندما يكون التبويب مخفيًا (المتصفح يخنق
   * المؤقّتات)، لذا نُحدّث فورًا عند العودة بدل انتظار دورة كاملة.
   */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && $('[data-notif-bell]')) refreshCount()
  })

  /* ───────────────────── صفحة الإشعارات ───────────────────── */

  const pageState = { category: '', unreadOnly: false }

  const loadPage = async () => {
    const list = $('[data-notif-page-list]')
    if (!list) return

    const params = new URLSearchParams({ limit: '50' })
    if (pageState.category) params.set('category', pageState.category)
    if (pageState.unreadOnly) params.set('unread', '1')

    list.innerHTML = '<p class="notif-loading"><i class="fa-solid fa-spinner"></i> جارٍ التحميل…</p>'

    try {
      const data = await getJSON(`${FEED_URL}?${params}`)
      list.innerHTML = data.data && data.data.length
        ? renderList(data.data, false)
        : emptyState(pageState.unreadOnly ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات في هذا التصنيف')
      bindItemClicks(list, refreshCount)
    } catch (_) {
      list.innerHTML = emptyState('تعذّر تحميل الإشعارات، حاول التحديث')
    }
  }

  const initNotificationPage = () => {
    const page = $('[data-notif-page]')
    if (!page || page.dataset.notifBound === '1') return
    page.dataset.notifBound = '1'

    $$('[data-notif-filter]', page).forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('[data-notif-filter]', page).forEach((b) => {
          b.classList.remove('active')
          b.setAttribute('aria-selected', 'false')
        })
        btn.classList.add('active')
        btn.setAttribute('aria-selected', 'true')
        pageState.category = btn.dataset.notifFilter || ''
        loadPage()
      })
    })

    $('[data-notif-unread-only]', page)?.addEventListener('change', (e) => {
      pageState.unreadOnly = e.target.checked === true
      loadPage()
    })

    $('[data-notif-read-all]', page)?.addEventListener('click', () => {
      markAllRead(() => loadPage())
    })

    $('[data-notif-test]', page)?.addEventListener('click', async (e) => {
      const btn = e.currentTarget
      btn.disabled = true
      try {
        const data = await postJSON('/api/notifications/test')
        // نفرّق بين «أُنشئ ووصل Push» و«أُنشئ بدون Push»: الرسالة
        // الموحّدة تجعل المشرف يظنّ أن Push يعمل وهو غير مُهيّأ.
        toast(
          data.pushed
            ? 'تم إنشاء إشعار تجريبي وإرساله إلى أجهزتك'
            : 'تم إنشاء إشعار تجريبي (إشعارات الجهاز غير مُهيّأة أو لا يوجد جهاز مسجّل)',
          'success'
        )
        loadPage()
        refreshCount()
      } catch (err) {
        toast(err.message || 'تعذّر إرسال الإشعار التجريبي', 'error')
      } finally {
        btn.disabled = false
      }
    })

    // زر تفعيل إشعارات الجهاز — منطق FCM نفسه في push-client.js.
    const pushBtn = $('[data-notif-push-toggle]', page)
    if (pushBtn) {
      pushBtn.addEventListener('click', async () => {
        if (typeof window.enableDevicePush !== 'function') {
          toast('إشعارات الجهاز غير متاحة على هذا المتصفح', 'warning')
          return
        }
        pushBtn.disabled = true
        try {
          const res = await window.enableDevicePush()
          const label = $('[data-notif-push-label]', pushBtn)
          if (res && res.ok) {
            if (label) label.textContent = 'إشعارات الجهاز مُفعّلة'
            pushBtn.classList.add('is-on')
            toast('تم تفعيل إشعارات الجهاز على هذا المتصفح', 'success')
          } else {
            toast((res && res.message) || 'تعذّر تفعيل إشعارات الجهاز', 'warning')
          }
        } catch (err) {
          toast(err.message || 'تعذّر تفعيل إشعارات الجهاز', 'error')
        } finally {
          pushBtn.disabled = false
        }
      })
    }

    loadPage()
  }

  window.initNotificationPage = initNotificationPage

  /* ───────────────────── التفضيلات ───────────────────── */

  const initNotificationPrefs = () => {
    const card = $('[data-notif-prefs]')
    if (!card || card.dataset.notifBound === '1') return
    card.dataset.notifBound = '1'

    const status = $('[data-notif-prefs-status]', card)
    const setStatus = (msg, kind) => {
      if (!status) return
      status.textContent = msg
      status.className = `notif-prefs-status${kind ? ' is-' + kind : ''}`
    }

    // نجلب المحفوظ ونطبّقه: المربّعات تُرسل من السيرفر مُحدَّدة افتراضيًا،
    // فلو لم نجلب لظهرت كل التصنيفات مفعّلة لمن أوقف بعضها.
    getJSON('/api/notifications/prefs').then((res) => {
      const p = res.data || {}
      const email = $('[data-notif-pref="email"]', card)
      const push = $('[data-notif-pref="push"]', card)
      if (email) email.checked = p.email_enabled !== false
      if (push) push.checked = p.push_enabled !== false
      $$('[data-notif-pref-category]', card).forEach((el) => {
        const key = el.dataset.notifPrefCategory
        el.checked = !(p.categories && p.categories[key] === false)
      })
      if (res.devices > 0) setStatus(`${AR_NUM(res.devices)} جهاز مسجّل`, 'muted')
    }).catch(() => {})

    $('[data-notif-prefs-save]', card)?.addEventListener('click', async (e) => {
      const btn = e.currentTarget
      const categories = {}
      $$('[data-notif-pref-category]', card).forEach((el) => {
        categories[el.dataset.notifPrefCategory] = el.checked === true
      })

      btn.disabled = true
      setStatus('جارٍ الحفظ…', 'muted')
      try {
        await postJSON('/api/notifications/prefs', {
          email_enabled: $('[data-notif-pref="email"]', card)?.checked === true,
          push_enabled: $('[data-notif-pref="push"]', card)?.checked === true,
          categories
        })
        setStatus('تم حفظ التفضيلات', 'ok')
        toast('تم حفظ تفضيلات الإشعارات', 'success')
      } catch (err) {
        setStatus('تعذّر الحفظ', 'error')
        toast(err.message || 'تعذّر حفظ التفضيلات', 'error')
      } finally {
        btn.disabled = false
      }
    })
  }

  window.initNotificationPrefs = initNotificationPrefs

  /* ───────────────────── الإقلاع ───────────────────── */

  const boot = () => {
    initNotificationBell()
    initNotificationPage()
    initNotificationPrefs()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
