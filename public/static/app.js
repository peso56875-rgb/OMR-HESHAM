(() => {
  const $ = (s, root = document) => root.querySelector(s)
  const $$ = (s, root = document) => [...root.querySelectorAll(s)]

  const toastConfig = {
    success:    ['fa-check',              'تم بنجاح'],
    error:      ['fa-xmark',              'تعذر التنفيذ'],
    warning:    ['fa-triangle-exclamation','تنبيه'],
    info:       ['fa-circle-info',        'معلومة'],
    prayer:     ['fa-hands-praying',       'جزاك الله خيرًا'],
    gratitude:  ['fa-hand-holding-heart',  'بارك الله فيك'],
    copy:       ['fa-clipboard-check',     'تم النسخ'],
    subscribe:  ['fa-bell',               'أهلًا بك معنا'],
    volunteer:  ['fa-people-carry-box',    'شكرًا لروحك الطيبة'],
    contact:    ['fa-envelope-circle-check','وصلتنا رسالتك'],
    donate:     ['fa-heart',              'أثابك الله']
  }
  const hideToast = () => $('#toast')?.classList.remove('show')
  const toast = (message, type = 'success') => {
    const box = $('#toast')
    if (!box) return
    const kind = toastConfig[type] ? type : 'info'
    const [iconName, titleText] = toastConfig[kind]
    clearTimeout(window.__toastTimer)
    box.classList.remove('show','is-success','is-error','is-warning','is-info')
    box.classList.add(`is-${kind}`)
    const icon = $('.toast-icon i', box), title = $('.toast-content strong', box), text = $('.toast-message', box)
    if (icon) icon.className = `fa-solid ${iconName}`
    if (title) title.textContent = titleText
    if (text) text.textContent = message
    void box.offsetWidth
    box.classList.add('show')
    window.__toastTimer = setTimeout(hideToast, 3600)
  }
  window.showToast = toast
  $('.toast-close')?.addEventListener('click', hideToast)

  window.confirmAction = message => new Promise(resolve => {
    const modal = $('#confirm-modal'), text = $('#confirm-message'), accept = $('.confirm-accept'), cancel = $('.confirm-cancel')
    if (!modal || !accept || !cancel) return resolve(false)
    if (text) text.textContent = message
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false')
    const finish = value => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); accept.onclick = null; cancel.onclick = null; resolve(value) }
    accept.onclick = () => finish(true); cancel.onclick = () => finish(false)
    modal.onclick = event => event.target === modal && finish(false)
    accept.focus()
  })

  window.addEventListener('load', () => {
    setTimeout(() => $('#preloader')?.classList.add('loaded'), 450)
  })
  setTimeout(() => $('#preloader')?.classList.add('loaded'), 2200)

  const header = $('#site-header')
  const scrollTop = $('#scroll-top')
  const onScroll = () => {
    header?.classList.toggle('scrolled', scrollY > 30)
    scrollTop?.classList.toggle('show', scrollY > 600)
  }
  addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  scrollTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }))

  const drawer = $('#mobile-drawer')
  const backdrop = $('#drawer-backdrop')
  const setDrawer = (open) => {
    drawer?.classList.toggle('open', open)
    backdrop?.classList.toggle('open', open)
    drawer?.setAttribute('aria-hidden', String(!open))
    $('#menu-toggle')?.setAttribute('aria-expanded', String(open))
    document.body.style.overflow = open ? 'hidden' : ''
  }
  $('#menu-toggle')?.addEventListener('click', () => setDrawer(true))
  $('#menu-close')?.addEventListener('click', () => setDrawer(false))
  backdrop?.addEventListener('click', () => setDrawer(false))
  addEventListener('keydown', e => e.key === 'Escape' && setDrawer(false))

  const savedTheme = localStorage.getItem('omar-theme')
  if (savedTheme === 'dark') document.body.classList.add('dark')
  const updateThemeIcon = () => {
    const isDark = document.body.classList.contains('dark')
    $$('#theme-toggle i').forEach(i => {
      i.className = `fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`
    })
    const themeColor = $('meta[name="theme-color"]')
    if (themeColor) themeColor.setAttribute('content', isDark ? '#071d1a' : '#f9f6ee')
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  }
  updateThemeIcon()

  document.addEventListener('click', e => {
    if (e.target.closest('#theme-toggle')) {
      document.body.classList.toggle('dark')
      localStorage.setItem('omar-theme', document.body.classList.contains('dark') ? 'dark' : 'light')
      updateThemeIcon()
    }
  })

  $$('.desktop-nav a, .mobile-drawer nav a, .mobile-bottom a').forEach(link => {
    const href = link.getAttribute('href')
    const isCurrent = href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)
    if (isCurrent) link.setAttribute('aria-current', 'page')
  })

  const setDashMenu = open => { $('.dash-sidebar')?.classList.toggle('open',open); $('.dash-backdrop')?.classList.toggle('open',open) }
  $('#dash-menu-toggle')?.addEventListener('click', () => setDashMenu(true))
  $('#dash-menu-close')?.addEventListener('click', () => setDashMenu(false))
  $('.dash-backdrop')?.addEventListener('click', () => setDashMenu(false))

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        revealObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' })

  /* ─── Executive Dashboard Edit Modal System ─── */
  function openEditModal(type, data) {
    let backdrop = document.getElementById('dash-edit-modal-backdrop')
    if (!backdrop) {
      backdrop = document.createElement('div')
      backdrop.id = 'dash-edit-modal-backdrop'
      backdrop.className = 'dash-modal-backdrop'
      document.body.appendChild(backdrop)
    }

    const titlesMap = {
      campaigns: 'تعديل بيانات الحملة',
      news: 'تعديل بيانات الخبر',
      events: 'تعديل بيانات الفعالية',
      stories: 'تعديل قصة النجاح',
      jobs: 'تعديل فرصة العمل'
    }

    const actionUrl = `/api/${type}/edit/${data.id}`
    const modalTitle = titlesMap[type] || 'تعديل البيانات'

    // Values come from data-* attributes. An unescaped quote in a title used to
    // break the rest of the form markup — including the image field.
    const escAttr = value => String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const escHtml = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    /** Shared markup for every image field. The hidden input lives INSIDE the
        widget so forms with more than one image cannot cross-wire values. */
    const uploadFieldHtml = (labelText, imageValue) => {
      const value = escAttr(imageValue || '')
      const hasImage = Boolean(imageValue)
      return `
        <div class="upload-widget">
          <label>${labelText}</label>
          <input type="hidden" name="image_url" class="cloudinary-url" value="${value}" />
          <div class="upload-drop-zone">
            <input type="file" accept="image/*,video/*" class="upload-file-input" />
            <div class="upload-placeholder" style="${hasImage ? 'display:none' : ''}"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span><small>JPG, PNG, WEBP — حد أقصى 10 ميجا</small></div>
            <img class="upload-preview" src="${value}" style="${hasImage ? 'display:block' : 'display:none'}" alt="معاينة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" value="${value}" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>
      `
    }

    let formFieldsHtml = ''

    if (type === 'campaigns') {
      const presetIcons = ['fa-heart', 'fa-capsules', 'fa-basket-shopping', 'fa-school', 'fa-stethoscope', 'fa-book-open', 'fa-gift', 'fa-hand-holding-heart', 'fa-house-medical', 'fa-seedling']
      const iconValue = escAttr(data.icon || 'fa-heart')
      formFieldsHtml = `
        <label>عنوان الحملة<input type="text" name="title" value="${escAttr(data.title)}" required /></label>
        <label>القسم<input type="text" name="category" value="${escAttr(data.category)}" placeholder="صحة، غذاء، تعليم" required /></label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem">
          <label>المبلغ المستهدف (ج.م)<input type="number" name="goal" value="${escAttr(data.goal)}" required /></label>
          <label>المبلغ المجمع (ج.م)<input type="number" name="raised" value="${escAttr(data.raised || 0)}" /></label>
        </div>
        <label>
          أيقونة الحملة
          <div style="display:flex; gap:8px; align-items:center; margin-top:4px">
            <span id="modal-icon-badge" style="width:40px; height:40px; border-radius:8px; background:var(--gold-600); color:#fff; display:grid; place-items:center; font-size:1.2rem">
              <i class="fa-solid ${iconValue}"></i>
            </span>
            <input type="text" name="icon" id="modal-icon-input" value="${iconValue}" style="flex:1" />
          </div>
          <div class="icon-presets" style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px">
            ${presetIcons.map(ic => `<button type="button" class="modal-icon-preset-btn" data-icon="${ic}" style="padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--ivory); cursor:pointer; font-size:1.1rem"><i class="fa-solid ${ic}"></i></button>`).join('')}
          </div>
        </label>
        ${uploadFieldHtml('صورة الحملة', data.image)}
        <label style="display:flex; align-items:center; gap:.5rem; cursor:pointer"><input type="checkbox" name="is_urgent" value="true" ${data.urgent === 'true' ? 'checked' : ''} /> حملة عاجلة؟</label>
        <label>الوصف<textarea name="description" rows="3">${escHtml(data.description)}</textarea></label>
      `
    } else if (type === 'news') {
      formFieldsHtml = `
        <label>عنوان الخبر<input type="text" name="title" value="${escAttr(data.title)}" required /></label>
        <label>القسم<input type="text" name="category" value="${escAttr(data.category)}" placeholder="صحة، مجتمع، تعليم" required /></label>
        ${uploadFieldHtml('صورة الخبر', data.image)}
        <label>موجز الخبر (يظهر في القائمة)<input type="text" name="excerpt" value="${escAttr(data.excerpt)}" required /></label>
        <label>محتوى الخبر بالكامل<textarea name="content" rows="6" required>${escHtml(data.content)}</textarea></label>
      `
    } else if (type === 'events') {
      formFieldsHtml = `
        <label>اسم الفعالية<input type="text" name="title" value="${escAttr(data.title)}" required /></label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem">
          <label>نوع الفعالية<input type="text" name="type" value="${escAttr(data.type)}" placeholder="صحة، تعليم، مجتمع" required /></label>
          <label>المكان<input type="text" name="place" value="${escAttr(data.place)}" required /></label>
        </div>
        <label>التاريخ والوقت<input type="datetime-local" name="event_date" value="${escAttr(data.date)}" required /></label>
        ${uploadFieldHtml('صورة الفعالية', data.image)}
        <label>الوصف<textarea name="description" rows="3">${escHtml(data.description)}</textarea></label>
      `
    } else if (type === 'stories') {
      formFieldsHtml = `
        <label>الاسم<input type="text" name="name" value="${escAttr(data.name)}" required /></label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem">
          <label>الدور / الصفة<input type="text" name="role" value="${escAttr(data.role)}" placeholder="مستفيد، متطوع" required /></label>
          <label>التقييم (1-5)<input type="number" name="rating" min="1" max="5" value="${escAttr(data.rating || 5)}" required /></label>
        </div>
        ${uploadFieldHtml('صورة صاحب القصة (اختياري)', data.image)}
        <label>القصة كاملة<textarea name="content" rows="4" required>${escHtml(data.content)}</textarea></label>
      `
    } else if (type === 'jobs') {
      formFieldsHtml = `
        <label>المسمى الوظيفي<input type="text" name="title" value="${escAttr(data.title)}" required /></label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem">
          <label>القسم<input type="text" name="department" value="${escAttr(data.department)}" placeholder="إدارة، ميداني، طبي" required /></label>
          <label>نوع الوظيفة<input type="text" name="job_type" value="${escAttr(data.type)}" placeholder="دوام كامل، دوام جزئي" required /></label>
        </div>
        <label>الموقع<input type="text" name="location" value="${escAttr(data.location || 'كفر العنانية')}" required /></label>
        <label>وصف الوظيفة والمتطلبات<textarea name="description" rows="4" required>${escHtml(data.description)}</textarea></label>
        <label style="display:flex; align-items:center; gap:.5rem; cursor:pointer"><input type="checkbox" name="is_active" value="true" ${data.active === 'true' ? 'checked' : ''} /> وظيفة نشطة (تظهر في الموقع)؟</label>
      `
    }

    backdrop.innerHTML = `
      <div class="dash-modal" role="dialog" aria-modal="true">
        <div class="dash-modal-header">
          <h3><i class="fa-solid fa-pen-to-square" style="color:var(--gold-600)"></i> ${modalTitle}</h3>
          <button type="button" class="dash-modal-close" id="dash-modal-close-btn">&times;</button>
        </div>
        <form id="dash-modal-form" action="${actionUrl}" method="post">
          <div class="dash-modal-body">
            ${formFieldsHtml}
          </div>
          <div class="dash-modal-footer">
            <button type="button" class="dash-modal-cancel-btn" id="dash-modal-cancel-btn">إلغاء</button>
            <button type="submit" class="primary-btn" id="dash-modal-submit-btn" style="height:44px; padding:0 24px">حفظ التعديلات</button>
          </div>
        </form>
      </div>
    `

    backdrop.classList.add('open')

    // The modal markup was just injected, so its upload widget needs wiring.
    window.initUploadWidgets?.(backdrop)

    const closeModal = () => {
      backdrop.classList.remove('open')
      setTimeout(() => { backdrop.innerHTML = '' }, 300)
    }

    document.getElementById('dash-modal-close-btn')?.addEventListener('click', closeModal)
    document.getElementById('dash-modal-cancel-btn')?.addEventListener('click', closeModal)
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal() })

    // Icon preset click listeners in modal
    $$('.modal-icon-preset-btn', backdrop).forEach(btn => {
      btn.addEventListener('click', function() {
        const input = document.getElementById('modal-icon-input')
        const badge = document.getElementById('modal-icon-badge')
        if (input) input.value = this.dataset.icon
        if (badge) badge.innerHTML = `<i class="fa-solid ${this.dataset.icon}"></i>`
      })
    })

    const modalIconInput = document.getElementById('modal-icon-input')
    if (modalIconInput) {
      modalIconInput.addEventListener('input', function() {
        const badge = document.getElementById('modal-icon-badge')
        if (badge) badge.innerHTML = `<i class="fa-solid ${this.value.trim() || 'fa-heart'}"></i>`
      })
    }

    // Modal Form Submission
    const form = document.getElementById('dash-modal-form')
    form?.addEventListener('submit', async e => {
      e.preventDefault()
      const submitBtn = document.getElementById('dash-modal-submit-btn')
      const originalText = submitBtn ? submitBtn.innerHTML : 'حفظ التعديلات'
      if (submitBtn) {
        submitBtn.disabled = true
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جارٍ الحفظ...'
      }

      try {
        window.syncUploadWidgets?.(form)
        const response = await fetch(actionUrl, {
          method: 'POST',
          body: new FormData(form),
          credentials: 'same-origin'
        })

        if (!response.ok) throw new Error('تعذر حفظ التعديلات')

        toast('تم حفظ التغييرات والتحديث بنجاح', 'success')
        closeModal()

        setTimeout(() => {
          if (location.pathname.startsWith('/dashboard')) {
            loadDashboardView(location.href, false)
          } else {
            location.reload()
          }
        }, 500)
      } catch (err) {
        toast(err.message || 'خطأ أثناء التعديل', 'error')
        if (submitBtn) {
          submitBtn.disabled = false
          submitBtn.innerHTML = originalText
        }
      }
    })
  }

  /* ─── Dashboard SPA Seamless Navigation ─── */
  function rebindDashboardHandlers() {
    // 0. Upload widgets (dashboard views are injected dynamically)
    window.initUploadWidgets?.()

    // 1. Empty table placeholders
    $$('.dash-table tbody').forEach(body => {
      if (body.children.length) return
      const columns = body.closest('table')?.querySelectorAll('th').length || 1
      body.innerHTML = `<tr class="dash-empty-row"><td colspan="${columns}"><i class="fa-regular fa-folder-open"></i><strong>لا توجد بيانات حتى الآن</strong><small>ستظهر العناصر الجديدة هنا تلقائيًا.</small></td></tr>`
    })

    // 2. Forms handling
    $$('.page-dashboard form[action^="/api/"]').forEach(form => {
      if (form.dataset.bound === 'true') return
      const method = (form.getAttribute('method') || 'POST').toUpperCase()
      const action = form.getAttribute('action') || ''
      // Skip GET forms, export endpoints, and forms marked with data-no-ajax
      if (method === 'GET' || action.includes('/api/export/') || form.dataset.noAjax === 'true') return

      // NEVER read `form.action` inside this handler: a field named "action"
      // (used by the volunteer card-validity controls) shadows the property, so
      // `form.action` returns that <input> element instead of the URL string.
      // `form.action.includes(...)` then threw a TypeError which aborted the
      // whole submit listener -> every validity button silently did nothing.
      const actionUrl = new URL(action, location.origin).href

      form.dataset.bound = 'true'
      form.addEventListener('submit', async event => {
        event.preventDefault()
        const message = form.dataset.confirm || (action.includes('/delete/') ? 'هل أنت متأكد من حذف هذا العنصر؟' : '')
        if (message && !(await window.confirmAction(message))) return
        const submit = $('button[type="submit"]', form), original = submit?.innerHTML
        if (submit) { submit.disabled = true; submit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جارٍ التنفيذ' }
        try {
          const fetchOptions = {
            method,
            credentials: 'same-origin',
            // Tells the API to answer with JSON + a real status code instead of a
            // 302 to /dashboard?error=1. fetch() follows redirects transparently,
            // so an error redirect resolved to 200 and was reported as success
            // even though nothing had actually been saved.
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
          }
          if (method !== 'GET' && method !== 'HEAD') {
            window.syncUploadWidgets?.(form)
            fetchOptions.body = new FormData(form)
          }
          const response = await fetch(actionUrl, fetchOptions)
          let payload = null
          try { payload = await response.clone().json() } catch (_e) { payload = null }
          if (!response.ok || payload?.error) throw new Error(payload?.error || 'تعذر تنفيذ الطلب')
          toast(payload?.message || 'تم حفظ التغييرات بنجاح', 'success')
          setTimeout(() => {
            if (location.pathname.startsWith('/dashboard')) {
              loadDashboardView(location.href, false)
            } else {
              location.reload()
            }
          }, 600)
        } catch (error) { toast(error.message || 'تعذر تنفيذ الطلب','error'); if (submit) { submit.disabled=false; submit.innerHTML=original } }
      })
    })

    // 3. Search input
    const searchInput = $('#dash-search-input')
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true'
      searchInput.addEventListener('input', function() {
        var term = this.value.toLowerCase().trim()
        var rows = document.querySelectorAll('.dash-table table tbody tr')
        rows.forEach(function(row) {
          var text = row.textContent.toLowerCase()
          row.style.display = text.includes(term) ? '' : 'none'
        })
      })
    }

    // 4. Edit buttons — Open Executive Modal Dialog
    $$('.edit-campaign-btn, .edit-news-btn, .edit-event-btn, .edit-story-btn, .edit-job-btn').forEach(btn => {
      if (btn.dataset.bound === 'true') return
      btn.dataset.bound = 'true'
      btn.addEventListener('click', function() {
        const type = this.classList.contains('edit-campaign-btn') ? 'campaigns'
          : this.classList.contains('edit-news-btn') ? 'news'
          : this.classList.contains('edit-event-btn') ? 'events'
          : this.classList.contains('edit-story-btn') ? 'stories' : 'jobs'

        openEditModal(type, this.dataset)
      })
    })

    // 5. Icon presets & Input
    $$('.icon-preset-btn').forEach(btn => {
      if (btn.dataset.bound === 'true') return
      btn.dataset.bound = 'true'
      btn.addEventListener('click', function() {
        const input = document.getElementById('campaign-icon-input')
        const badge = document.getElementById('icon-preview-badge')
        if (input) input.value = this.dataset.icon
        if (badge) badge.innerHTML = `<i class="fa-solid ${this.dataset.icon}"></i>`
      })
    })
    const iconInput = document.getElementById('campaign-icon-input')
    if (iconInput && !iconInput.dataset.bound) {
      iconInput.dataset.bound = 'true'
      iconInput.addEventListener('input', function() {
        const badge = document.getElementById('icon-preview-badge')
        if (badge) badge.innerHTML = `<i class="fa-solid ${this.value.trim() || 'fa-heart'}"></i>`
      })
    }

    // 6. Volunteer modal close buttons & backdrop click
    $$('.vol-modal-close').forEach(btn => {
      if (btn.dataset.bound === 'true') return
      btn.dataset.bound = 'true'
      btn.addEventListener('click', function() {
        const details = this.closest('details')
        if (details) details.removeAttribute('open')
      })
    })
    // Close volunteer modal when clicking backdrop (the fixed overlay)
    $$('details > div[style*="position:fixed"]').forEach(overlay => {
      if (overlay.dataset.bound === 'true') return
      overlay.dataset.bound = 'true'
      overlay.addEventListener('click', function(e) {
        if (e.target === this) {
          const details = this.closest('details')
          if (details) details.removeAttribute('open')
        }
      })
    })

    // 7. Init Cases & Beneficiaries Handlers
    initDashCasesHandlers()

    // 8. Init Volunteer Image Modal
    initVolunteerImageModal()

    // 9. Reveal elements
    $$('.reveal').forEach(el => revealObserver.observe(el))

    // 10. Sync theme icon
    updateThemeIcon()
  }

  function initDashCasesHandlers() {
    const groupSelect = document.getElementById('sample-group-select')
    const rangeInput = document.getElementById('sample-count-range')
    const numInput = document.getElementById('sample-count-input')
    const extractBtn = document.getElementById('extract-sample-btn')
    const hintEl = document.getElementById('sample-max-hint')
    const ta = document.getElementById('names-textarea')
    const counter = document.getElementById('name-counter')
    const previewBox = document.getElementById('preview-box')
    const previewNames = document.getElementById('preview-names')

    // Live name counter in form
    if (ta && counter && !ta.dataset.bound) {
      ta.dataset.bound = 'true'
      const updateCount = () => {
        const lines = ta.value.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0)
        const unique = new Set(lines).size
        counter.textContent = unique.toLocaleString('ar-EG') + ' اسم'
      }
      ta.addEventListener('input', updateCount)
      updateCount()
    }

    // Range slider <-> number input sync
    if (rangeInput && numInput && !rangeInput.dataset.bound) {
      rangeInput.dataset.bound = 'true'
      numInput.dataset.bound = 'true'
      rangeInput.addEventListener('input', function() {
        numInput.value = this.value
      })
      numInput.addEventListener('input', function() {
        let v = parseInt(this.value, 10) || 1
        const max = parseInt(rangeInput.max, 10) || 500
        if (v < 1) v = 1
        rangeInput.value = Math.min(v, max)
      })
    }

    // Group Select change handler
    if (groupSelect && !groupSelect.dataset.bound) {
      groupSelect.dataset.bound = 'true'
      groupSelect.addEventListener('change', function() {
        const selectedOpt = this.options[this.selectedIndex]
        const total = parseInt(selectedOpt?.dataset?.total || '0', 10) || 500
        if (rangeInput) {
          rangeInput.max = total
          if (parseInt(rangeInput.value, 10) > total) {
            rangeInput.value = total
            if (numInput) numInput.value = total
          }
        }
        if (hintEl) {
          if (this.value) {
            hintEl.textContent = 'المجموعة تحتوي على ' + total.toLocaleString('ar-EG') + ' اسم — اختر العدد المطلوب استخراجه'
          } else {
            hintEl.textContent = 'سيتم استخراج عينة عشوائية بخوارزمية Fisher-Yates'
          }
        }

        // Preview names
        const rawPreview = selectedOpt?.dataset?.preview
        if (rawPreview && previewBox && previewNames) {
          try {
            const arr = JSON.parse(rawPreview)
            if (arr && arr.length > 0) {
              previewBox.style.display = 'block'
              previewNames.innerHTML = arr.map(n => `<span style="background:var(--surface);border:1px solid var(--border);padding:3px 10px;border-radius:8px;font-size:.85rem;">${n}</span>`).join('')
            } else {
              previewBox.style.display = 'none'
            }
          } catch(e) {
            previewBox.style.display = 'none'
          }
        } else if (previewBox) {
          previewBox.style.display = 'none'
        }
      })
    }

    // Quick sample preset buttons (1, 10, 50, all) — only set count, don't auto-export
    $$('.sample-preset-btn').forEach(btn => {
      if (btn.dataset.bound === 'true') return
      btn.dataset.bound = 'true'
      btn.addEventListener('click', function() {
        const countType = this.dataset.count
        const selectedOpt = groupSelect ? groupSelect.options[groupSelect.selectedIndex] : null
        const total = parseInt(selectedOpt?.dataset?.total || '0', 10) || 9999

        let targetCount = 1
        if (countType === 'all') {
          targetCount = total
        } else {
          targetCount = Math.min(parseInt(countType, 10) || 1, total)
        }

        if (numInput) numInput.value = targetCount
        if (rangeInput) rangeInput.value = Math.min(targetCount, parseInt(rangeInput.max || '9999', 10))
      })
    })

    // Main extract sample button click handler
    if (extractBtn && !extractBtn.dataset.bound) {
      extractBtn.dataset.bound = 'true'
      extractBtn.addEventListener('click', function() {
        const gid = groupSelect ? groupSelect.value : 'all'
        const count = numInput ? (parseInt(numInput.value, 10) || 50) : 50
        const titleInput = document.getElementById('custom-group-title')
        const customTitle = titleInput ? titleInput.value.trim() : ''
        triggerSampleExport(gid, count, customTitle)
      })
    }
  }

  /* ─── Volunteer Photo Lightbox Modal System ─── */
  function initVolunteerImageModal() {
    let modal = document.getElementById('vol-photo-lightbox')

    // Create modal DOM element dynamically if not present
    if (!modal) {
      modal = document.createElement('div')
      modal.id = 'vol-photo-lightbox'
      modal.className = 'vol-lightbox-modal'
      modal.setAttribute('role', 'dialog')
      modal.setAttribute('aria-modal', 'true')
      modal.setAttribute('aria-hidden', 'true')
      modal.style.display = 'none'
      modal.innerHTML = `
        <div class="vol-lightbox-backdrop"></div>
        <div class="vol-lightbox-card">
          <div class="vol-lightbox-topbar">
            <div class="vol-lightbox-identity">
              <div class="vol-lightbox-thumb" id="vol-lb-thumb">
                <span id="vol-lb-thumb-initials">م</span>
                <img id="vol-lb-thumb-img" src="" alt="" style="display:none" />
              </div>
              <div>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
                  <h3 id="vol-lb-name" class="vol-lb-name">اسم المتطوع</h3>
                  <span id="vol-lb-code" class="vol-lb-code">VOL-000</span>
                  <span id="vol-lb-status" class="vol-lb-status">معتمد</span>
                </div>
                <p id="vol-lb-meta" class="vol-lb-meta">المجال: عام • ساعات الخدمة: 0 ساعة</p>
              </div>
            </div>
            <div class="vol-lightbox-actions">
              <div class="vol-lightbox-controls">
                <button type="button" class="vol-lb-btn" id="vol-lb-zoom-in" title="تكبير (+)">
                  <i class="fa-solid fa-magnifying-glass-plus"></i>
                </button>
                <button type="button" class="vol-lb-btn" id="vol-lb-zoom-out" title="تصغير (-)">
                  <i class="fa-solid fa-magnifying-glass-minus"></i>
                </button>
                <button type="button" class="vol-lb-btn" id="vol-lb-rotate" title="تدوير 90 درجة (R)">
                  <i class="fa-solid fa-rotate-right"></i>
                </button>
                <button type="button" class="vol-lb-btn" id="vol-lb-reset" title="إعادة ضبط العرض (0)">
                  <i class="fa-solid fa-arrows-rotate"></i>
                </button>
              </div>
              <div class="vol-lightbox-divider"></div>
              <a id="vol-lb-download" href="#" download="volunteer-photo.jpg" class="vol-lb-btn vol-lb-btn-primary" title="تحميل الصورة">
                <i class="fa-solid fa-download"></i> <span>تحميل</span>
              </a>
              <a id="vol-lb-open-tab" href="#" target="_blank" rel="noopener noreferrer" class="vol-lb-btn" title="فتح الصورة الأصلية">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
              <button type="button" class="vol-lb-btn vol-lb-btn-close" id="vol-lb-close" title="إغلاق (Esc)">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div class="vol-lightbox-viewport" id="vol-lb-viewport">
            <div class="vol-lightbox-img-wrapper" id="vol-lb-img-wrapper">
              <img id="vol-lb-main-img" src="" alt="" class="vol-lb-main-img" />
              <div id="vol-lb-no-img" class="vol-lb-no-img" style="display:none">
                <div class="vol-lb-no-img-icon"><i class="fa-solid fa-image"></i></div>
                <h4>لا توجد صورة شخصية مرفوعة</h4>
                <p>يمكنك إضافة صورة من خلال قسم "التحكم والتفاصيل" ثم "تعديل كافة بيانات المتطوع".</p>
              </div>
            </div>
            <div class="vol-lightbox-zoom-badge" id="vol-lb-zoom-badge">100%</div>
            <div class="vol-lightbox-hint">
              <span><i class="fa-solid fa-computer-mouse"></i> انقر مرتين للتبديل السريع للتكبير • عجلة الفأرة للتكبير والتصغير</span>
            </div>
          </div>
          <div class="vol-lightbox-infobar">
            <div class="vol-lightbox-infogrid">
              <div class="vol-lb-infoitem">
                <span class="vol-lb-infolabel"><i class="fa-solid fa-phone"></i> الهاتف</span>
                <strong id="vol-lb-phone" class="vol-lb-infoval">—</strong>
              </div>
              <div class="vol-lb-infoitem">
                <span class="vol-lb-infolabel"><i class="fa-solid fa-location-dot"></i> المدينة</span>
                <strong id="vol-lb-city" class="vol-lb-infoval">—</strong>
              </div>
              <div class="vol-lb-infoitem">
                <span class="vol-lb-infolabel"><i class="fa-solid fa-star"></i> الرتبة</span>
                <strong id="vol-lb-rank" class="vol-lb-infoval" style="color:var(--gold-600)">—</strong>
              </div>
              <div class="vol-lb-infoitem">
                <span class="vol-lb-infolabel"><i class="fa-solid fa-clock"></i> ساعات الخدمة</span>
                <strong id="vol-lb-hours" class="vol-lb-infoval" style="color:var(--emerald-600)">0 ساعة</strong>
              </div>
              <div class="vol-lb-infoitem">
                <span class="vol-lb-infolabel"><i class="fa-solid fa-calendar"></i> تاريخ التقديم</span>
                <strong id="vol-lb-created" class="vol-lb-infoval">—</strong>
              </div>
              <div class="vol-lb-infoitem">
                <span class="vol-lb-infolabel"><i class="fa-solid fa-calendar-xmark"></i> الصلاحية</span>
                <strong id="vol-lb-expiry" class="vol-lb-infoval">—</strong>
              </div>
            </div>
            <div class="vol-lightbox-bottom-actions">
              <button type="button" class="vol-lb-copy-link-btn" id="vol-lb-copy-link">
                <i class="fa-solid fa-link"></i> نسخ رابط الصورة
              </button>
              <button type="button" class="vol-lb-close-bottom-btn" id="vol-lb-close-bottom">
                إغلاق النافذة <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      `
      document.body.appendChild(modal)
    }

    let currentScale = 1
    let currentRotate = 0
    let translateX = 0
    let translateY = 0
    let activePointerId = null
    let pointerStart = null
    let pinchStartDistance = 0
    let pinchStartScale = 1
    let currentDownloadUrl = ''
    let currentImageUrl = ''
    let currentFileName = 'volunteer-photo.jpg'
    let previousActiveElement = null
    const pointers = new Map()

    const mainImg = $('#vol-lb-main-img', modal)
    const imageWrapper = $('#vol-lb-img-wrapper', modal)
    const noImgBox = $('#vol-lb-no-img', modal)
    const zoomBadge = $('#vol-lb-zoom-badge', modal)
    const nameEl = $('#vol-lb-name', modal)
    const codeEl = $('#vol-lb-code', modal)
    const statusEl = $('#vol-lb-status', modal)
    const metaEl = $('#vol-lb-meta', modal)
    const phoneEl = $('#vol-lb-phone', modal)
    const cityEl = $('#vol-lb-city', modal)
    const rankEl = $('#vol-lb-rank', modal)
    const hoursEl = $('#vol-lb-hours', modal)
    const createdEl = $('#vol-lb-created', modal)
    const expiryEl = $('#vol-lb-expiry', modal)
    const thumbImg = $('#vol-lb-thumb-img', modal)
    const thumbInitials = $('#vol-lb-thumb-initials', modal)
    const downloadBtn = $('#vol-lb-download', modal)
    const openTabBtn = $('#vol-lb-open-tab', modal)
    const copyLinkBtn = $('#vol-lb-copy-link', modal)
    const closeBtn = $('#vol-lb-close', modal)
    const closeBottomBtn = $('#vol-lb-close-bottom', modal)
    const backdrop = $('.vol-lightbox-backdrop', modal)
    const zoomInBtn = $('#vol-lb-zoom-in', modal)
    const zoomOutBtn = $('#vol-lb-zoom-out', modal)
    const rotateBtn = $('#vol-lb-rotate', modal)
    const resetBtn = $('#vol-lb-reset', modal)
    const viewport = $('#vol-lb-viewport', modal)
    const infoBar = $('.vol-lightbox-infobar', modal)
    const controls = $('.vol-lightbox-controls', modal)

    const loadingEl = document.createElement('div')
    loadingEl.className = 'vol-lb-loading'
    loadingEl.innerHTML = '<span class="vol-lb-spinner"></span><b>جارٍ تجهيز الصورة...</b>'
    viewport?.appendChild(loadingEl)

    const fullscreenBtn = document.createElement('button')
    fullscreenBtn.type = 'button'
    fullscreenBtn.className = 'vol-lb-btn'
    fullscreenBtn.id = 'vol-lb-fullscreen'
    fullscreenBtn.title = 'ملء الشاشة (F)'
    fullscreenBtn.setAttribute('aria-label', 'عرض الصورة بملء الشاشة')
    fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>'
    controls?.appendChild(fullscreenBtn)

    const infoToggleBtn = document.createElement('button')
    infoToggleBtn.type = 'button'
    infoToggleBtn.className = 'vol-lb-info-toggle'
    infoToggleBtn.innerHTML = '<i class="fa-solid fa-circle-info"></i><span>بيانات المتطوع</span><i class="fa-solid fa-chevron-down"></i>'
    infoBar?.before(infoToggleBtn)

    function clampTranslation() {
      if (!viewport || currentScale <= 1) {
        translateX = 0
        translateY = 0
        return
      }
      const maxX = viewport.clientWidth * (currentScale - 1) / 2
      const maxY = viewport.clientHeight * (currentScale - 1) / 2
      translateX = Math.min(maxX, Math.max(-maxX, translateX))
      translateY = Math.min(maxY, Math.max(-maxY, translateY))
    }

    function updateTransform(animate = true) {
      if (!mainImg) return
      clampTranslation()
      mainImg.classList.toggle('is-dragging', !animate)
      mainImg.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotate(${currentRotate}deg) scale(${currentScale})`
      mainImg.classList.toggle('is-zoomed', currentScale > 1)
      viewport?.classList.toggle('can-pan', currentScale > 1)
      if (zoomBadge) zoomBadge.textContent = `${Math.round(currentScale * 100)}%`
    }

    function setScale(scale, originX, originY) {
      const oldScale = currentScale
      currentScale = Math.min(Math.max(scale, 0.5), 5)
      if (viewport && oldScale > 0 && originX !== undefined && originY !== undefined) {
        const rect = viewport.getBoundingClientRect()
        const offsetX = originX - rect.left - rect.width / 2
        const offsetY = originY - rect.top - rect.height / 2
        const ratio = currentScale / oldScale
        translateX = (translateX - offsetX) * ratio + offsetX
        translateY = (translateY - offsetY) * ratio + offsetY
      }
      updateTransform()
    }

    function resetTransform() {
      currentScale = 1
      currentRotate = 0
      translateX = 0
      translateY = 0
      updateTransform()
    }

    function setLoading(isLoading) {
      loadingEl.classList.toggle('active', isLoading)
      if (imageWrapper) imageWrapper.classList.toggle('is-loading', isLoading)
    }

    function openModal(data) {
      resetTransform()
      previousActiveElement = document.activeElement
      const hasImg = Boolean(data.img && data.img.trim())
      currentImageUrl = hasImg ? data.img : ''
      currentDownloadUrl = hasImg ? (data.download || data.img) : ''
      currentFileName = `صورة-${(data.name || 'متطوع').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'متطوع'}.jpg`

      if (nameEl) nameEl.textContent = data.name || 'متطوع'
      if (codeEl) {
        codeEl.textContent = data.code || ''
        codeEl.style.display = data.code ? 'inline-block' : 'none'
      }
      if (statusEl) {
        statusEl.textContent = data.status || 'معتمد'
        statusEl.style.color = data.statusColor || '#10b981'
        statusEl.style.background = data.statusBg || 'rgba(16,185,129,.12)'
      }
      if (metaEl) metaEl.textContent = `${data.role || 'عام'} • ${data.hours || 0} ساعة خدمة`
      if (phoneEl) phoneEl.textContent = data.phone || '—'
      if (cityEl) cityEl.textContent = data.city || '—'
      if (rankEl) rankEl.textContent = data.rank || 'متطوع مبادر'
      if (hoursEl) hoursEl.textContent = `${data.hours || 0} ساعة`
      if (createdEl) createdEl.textContent = data.created || '—'
      if (expiryEl) expiryEl.textContent = data.expiry || 'مفتوح'

      if (hasImg) {
        setLoading(true)
        if (mainImg) {
          mainImg.src = data.img
          mainImg.alt = `الصورة الشخصية للمتطوع ${data.name || ''}`
          mainImg.style.display = 'block'
        }
        if (noImgBox) noImgBox.style.display = 'none'
        if (thumbImg) {
          thumbImg.src = data.img
          thumbImg.alt = ''
          thumbImg.style.display = 'block'
        }
        if (thumbInitials) thumbInitials.style.display = 'none'
        if (downloadBtn) {
          downloadBtn.href = currentDownloadUrl
          downloadBtn.download = currentFileName
          downloadBtn.style.display = 'inline-flex'
          downloadBtn.classList.remove('is-loading')
          downloadBtn.removeAttribute('aria-disabled')
          const label = $('span', downloadBtn)
          if (label) label.textContent = 'تحميل الصورة'
        }
        if (openTabBtn) {
          openTabBtn.href = data.img
          openTabBtn.style.display = 'inline-grid'
        }
        if (copyLinkBtn) {
          copyLinkBtn.style.display = 'inline-flex'
          copyLinkBtn.dataset.url = data.img
        }
        if (zoomBadge) zoomBadge.style.display = 'block'
      } else {
        setLoading(false)
        if (mainImg) {
          mainImg.removeAttribute('src')
          mainImg.style.display = 'none'
        }
        if (noImgBox) noImgBox.style.display = 'block'
        if (thumbImg) thumbImg.style.display = 'none'
        if (thumbInitials) {
          thumbInitials.textContent = data.initials || data.name?.[0] || 'م'
          thumbInitials.style.display = 'block'
        }
        if (downloadBtn) downloadBtn.style.display = 'none'
        if (openTabBtn) openTabBtn.style.display = 'none'
        if (copyLinkBtn) copyLinkBtn.style.display = 'none'
        if (zoomBadge) zoomBadge.style.display = 'none'
      }

      modal.style.display = 'flex'
      void modal.offsetWidth
      modal.classList.add('active')
      modal.setAttribute('aria-hidden', 'false')
      document.body.classList.add('vol-lightbox-open')
      setTimeout(() => closeBtn?.focus(), 60)
    }

    function closeModal() {
      modal.classList.remove('active')
      modal.setAttribute('aria-hidden', 'true')
      document.body.classList.remove('vol-lightbox-open')
      if (document.fullscreenElement === modal) document.exitFullscreen?.().catch(() => {})
      setTimeout(() => {
        if (!modal.classList.contains('active')) {
          modal.style.display = 'none'
          resetTransform()
          mainImg?.removeAttribute('src')
          previousActiveElement?.focus?.()
        }
      }, 260)
    }

    async function downloadCurrentImage(event) {
      event.preventDefault()
      if (!currentDownloadUrl || downloadBtn?.classList.contains('is-loading')) return
      const label = $('span', downloadBtn)
      downloadBtn?.classList.add('is-loading')
      downloadBtn?.setAttribute('aria-disabled', 'true')
      if (label) label.textContent = 'جارٍ التحميل...'

      try {
        const response = await fetch(currentDownloadUrl, { credentials: 'same-origin' })
        if (!response.ok) {
          let message = 'تعذر تحميل الصورة'
          try { message = (await response.json()).error || message } catch (_) {}
          throw new Error(message)
        }
        const blob = await response.blob()
        const disposition = response.headers.get('Content-Disposition') || ''
        const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
        const filename = encodedName ? decodeURIComponent(encodedName) : currentFileName
        const blobUrl = URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = blobUrl
        anchor.download = filename
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1500)
        toast('تم تحميل صورة المتطوع على جهازك', 'success')
      } catch (error) {
        console.error('Volunteer photo download failed:', error)
        toast(error.message || 'تعذر تحميل الصورة — حاول مرة أخرى', 'error')
      } finally {
        downloadBtn?.classList.remove('is-loading')
        downloadBtn?.removeAttribute('aria-disabled')
        if (label) label.textContent = 'تحميل الصورة'
      }
    }

    if (!modal.dataset.bound) {
      modal.dataset.bound = 'true'
      closeBtn?.addEventListener('click', closeModal)
      closeBottomBtn?.addEventListener('click', closeModal)
      backdrop?.addEventListener('click', closeModal)
      downloadBtn?.addEventListener('click', downloadCurrentImage)

      mainImg?.addEventListener('load', () => {
        setLoading(false)
        mainImg.classList.add('is-ready')
      })
      mainImg?.addEventListener('error', () => {
        setLoading(false)
        mainImg.style.display = 'none'
        if (noImgBox) {
          noImgBox.style.display = 'block'
          const title = $('h4', noImgBox)
          const copy = $('p', noImgBox)
          if (title) title.textContent = 'تعذر عرض الصورة'
          if (copy) copy.textContent = 'يمكنك محاولة تحميل الصورة أو فتح المصدر الأصلي.'
        }
      })

      zoomInBtn?.addEventListener('click', () => setScale(currentScale + 0.25))
      zoomOutBtn?.addEventListener('click', () => setScale(currentScale - 0.25))
      rotateBtn?.addEventListener('click', () => {
        currentRotate = (currentRotate + 90) % 360
        updateTransform()
      })
      resetBtn?.addEventListener('click', resetTransform)

      fullscreenBtn.addEventListener('click', async () => {
        try {
          if (document.fullscreenElement === modal) await document.exitFullscreen()
          else await modal.requestFullscreen()
        } catch (_) {
          modal.classList.toggle('vol-lightbox-expanded')
        }
      })
      document.addEventListener('fullscreenchange', () => {
        fullscreenBtn.innerHTML = document.fullscreenElement === modal
          ? '<i class="fa-solid fa-compress"></i>'
          : '<i class="fa-solid fa-expand"></i>'
      })

      infoToggleBtn.addEventListener('click', () => {
        const collapsed = modal.classList.toggle('info-collapsed')
        infoToggleBtn.setAttribute('aria-expanded', String(!collapsed))
      })

      mainImg?.addEventListener('dblclick', e => {
        e.preventDefault()
        if (currentScale > 1) resetTransform()
        else setScale(2, e.clientX, e.clientY)
      })

      viewport?.addEventListener('wheel', e => {
        if (!modal.classList.contains('active')) return
        e.preventDefault()
        setScale(currentScale + (e.deltaY < 0 ? 0.18 : -0.18), e.clientX, e.clientY)
      }, { passive: false })

      viewport?.addEventListener('pointerdown', e => {
        if (!currentImageUrl) return
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
        viewport.setPointerCapture?.(e.pointerId)
        if (pointers.size === 1 && currentScale > 1) {
          activePointerId = e.pointerId
          pointerStart = { x: e.clientX, y: e.clientY, tx: translateX, ty: translateY }
        } else if (pointers.size === 2) {
          const [a, b] = [...pointers.values()]
          pinchStartDistance = Math.hypot(a.x - b.x, a.y - b.y)
          pinchStartScale = currentScale
        }
      })

      viewport?.addEventListener('pointermove', e => {
        if (!pointers.has(e.pointerId)) return
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()]
          const distance = Math.hypot(a.x - b.x, a.y - b.y)
          if (pinchStartDistance) setScale(pinchStartScale * distance / pinchStartDistance)
        } else if (e.pointerId === activePointerId && pointerStart && currentScale > 1) {
          translateX = pointerStart.tx + e.clientX - pointerStart.x
          translateY = pointerStart.ty + e.clientY - pointerStart.y
          updateTransform(false)
        }
      })

      const releasePointer = e => {
        pointers.delete(e.pointerId)
        if (e.pointerId === activePointerId) {
          activePointerId = null
          pointerStart = null
          updateTransform()
        }
        if (pointers.size < 2) pinchStartDistance = 0
      }
      viewport?.addEventListener('pointerup', releasePointer)
      viewport?.addEventListener('pointercancel', releasePointer)

      copyLinkBtn?.addEventListener('click', async () => {
        const url = copyLinkBtn.dataset.url
        if (!url) return
        try {
          await navigator.clipboard.writeText(url)
          toast('تم نسخ رابط صورة المتطوع', 'success')
        } catch (_) {
          toast('تعذر نسخ الرابط تلقائياً', 'warning')
        }
      })

      document.addEventListener('keydown', e => {
        if (!modal.classList.contains('active')) return
        if (e.key === 'Escape') closeModal()
        else if (e.key === '+' || e.key === '=') setScale(currentScale + 0.25)
        else if (e.key === '-' || e.key === '_') setScale(currentScale - 0.25)
        else if (e.key === 'r' || e.key === 'R' || e.key === 'ق') {
          currentRotate = (currentRotate + 90) % 360
          updateTransform()
        } else if (e.key === '0') resetTransform()
        else if (e.key === 'f' || e.key === 'F') fullscreenBtn.click()
        else if (e.key === 'Tab') {
          const focusable = [...modal.querySelectorAll('button:not([disabled]), a[href]:not([aria-disabled="true"])')]
            .filter(el => el.offsetParent !== null)
          if (!focusable.length) return
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
        }
      })
    }

    window.openVolunteerPhotoModal = openModal
    window.closeVolunteerPhotoModal = closeModal
  }

  function triggerSampleExport(gid, count, customTitle) {
    const title = customTitle || 'مجموعة مستفيدين — عينة عشوائية'
    const url = '/api/export/cases_sample?group_id=' + encodeURIComponent(gid) +
                '&count=' + encodeURIComponent(count) +
                '&custom_title=' + encodeURIComponent(title)

    toast('جارٍ استخراج العينة العشوائية وتحميل ملف Excel...', 'success')

    fetch(url, { credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) throw new Error('فشل التصدير: ' + res.status)
        const disposition = res.headers.get('Content-Disposition') || ''
        const unicodeMatch = disposition.match(/filename\*=UTF-8''([^;\n]+)/i)
        const asciiMatch = disposition.match(/filename="?([^"\n;]+)"?/i)
        let filename = `${title.replace(/[^\u0600-\u06FFa-zA-Z0-9]/g, '_')}.xls`
        if (unicodeMatch && unicodeMatch[1]) {
          try { filename = decodeURIComponent(unicodeMatch[1]) } catch(e) {}
        } else if (asciiMatch && asciiMatch[1]) {
          filename = asciiMatch[1]
        }
        return res.blob().then(blob => ({ blob, filename }))
      })
      .then(({ blob, filename }) => {
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(blobUrl)
        }, 300)
        toast('تم تحميل ملف Excel بنجاح', 'success')
      })
      .catch(err => {
        console.error('Export error:', err)
        toast('حدث خطأ أثناء التصدير — تأكد من وجود أسماء في الأرشيف', 'error')
      })
  }

  async function loadDashboardView(url, pushState = true) {
    const dashMain = $('.dash-main')
    if (!dashMain) return

    setDashMenu(false)

    dashMain.classList.add('view-transitioning')

    let progressBar = $('.dash-top-loader', dashMain)
    if (!progressBar) {
      progressBar = document.createElement('div')
      progressBar.className = 'dash-top-loader'
      progressBar.innerHTML = '<div class="dash-top-loader-bar"></div>'
      dashMain.prepend(progressBar)
    }
    progressBar.classList.add('loading')

    try {
      const response = await fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          location.href = url
          return
        }
        throw new Error('تعذر تحميل القسم')
      }

      const html = await response.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      const newDashMain = doc.querySelector('.dash-main')

      if (newDashMain) {
        if (pushState) {
          history.pushState({ url }, '', url)
        }

        const targetViewParam = new URL(url, location.origin).searchParams.get('view') || 'overview'

        $$('.dash-sidebar nav a').forEach(link => {
          const linkViewParam = new URL(link.href, location.origin).searchParams.get('view') || 'overview'
          const isTarget = linkViewParam === targetViewParam
          link.classList.toggle('active', isTarget)
          if (isTarget) link.setAttribute('aria-current', 'page')
          else link.removeAttribute('aria-current')
        })

        dashMain.innerHTML = newDashMain.innerHTML
        rebindDashboardHandlers()
      } else {
        location.href = url
      }
    } catch (err) {
      console.error('[Dashboard SPA Error]', err)
      location.href = url
    } finally {
      setTimeout(() => {
        dashMain.classList.remove('view-transitioning')
        const loader = $('.dash-top-loader', dashMain)
        if (loader) loader.classList.remove('loading')
      }, 150)
    }
  }

  // Intercept sidebar navigation clicks
  document.addEventListener('click', e => {
    const link = e.target.closest('.dash-sidebar nav a[href]')
    if (!link) return
    const href = link.getAttribute('href')
    if (!href || href === '#' || href.startsWith('javascript:')) return

    const targetUrl = new URL(href, location.origin).href
    if (targetUrl === location.href) {
      e.preventDefault()
      return
    }

    e.preventDefault()
    loadDashboardView(targetUrl, true)
  })

  // Intercept volunteer avatar click to open photo lightbox modal
  document.addEventListener('click', e => {
    const trigger = e.target.closest('.vol-avatar-trigger, [data-vol-img]')
    if (trigger) {
      e.preventDefault()
      e.stopPropagation()

      const data = {
        img: trigger.getAttribute('data-vol-img') || '',
        download: trigger.getAttribute('data-vol-download') || '',
        name: trigger.getAttribute('data-vol-name') || '',
        code: trigger.getAttribute('data-vol-code') || '',
        role: trigger.getAttribute('data-vol-role') || '',
        status: trigger.getAttribute('data-vol-status') || '',
        statusColor: trigger.getAttribute('data-vol-status-color') || '',
        statusBg: trigger.getAttribute('data-vol-status-bg') || '',
        phone: trigger.getAttribute('data-vol-phone') || '',
        city: trigger.getAttribute('data-vol-city') || '',
        rank: trigger.getAttribute('data-vol-rank') || '',
        hours: trigger.getAttribute('data-vol-hours') || '0',
        created: trigger.getAttribute('data-vol-created') || '',
        expiry: trigger.getAttribute('data-vol-expiry') || '',
        initials: trigger.getAttribute('data-vol-initials') || ''
      }

      if (!window.openVolunteerPhotoModal) {
        initVolunteerImageModal()
      }
      window.openVolunteerPhotoModal?.(data)
    }
  })

  // Handle browser Back / Forward buttons
  window.addEventListener('popstate', () => {
    if (location.pathname.startsWith('/dashboard')) {
      loadDashboardView(location.href, false)
    }
  })

  // Initial handlers binding
  rebindDashboardHandlers()

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return
      const end = Number(target.dataset.target)
      const duration = 1600
      const start = performance.now()
      const step = now => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        target.textContent = Math.round(end * eased).toLocaleString('ar-EG')
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
      counterObserver.unobserve(target)
    })
  }, { threshold: 0.7 })
  $$('.counter').forEach(el => counterObserver.observe(el))

  $$('.copy-btn').forEach(button => button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy)
      toast('تم نسخ الرقم — حوّل وأرسل الأثر', 'copy')
      const original = button.innerHTML
      button.innerHTML = '<i class="fa-solid fa-check"></i> تم النسخ'
      setTimeout(() => { button.innerHTML = original }, 1800)
    } catch {
      toast('حدد الرقم وانسخه يدويًا', 'error')
    }
  }))

  /* ─── فتح تطبيقات الدفع (إنستاباي / فودافون كاش) مع نسخ الرقم ─── */
  const payAppsConfig = {
    instapay: {
      appName: 'إنستاباي',
      scheme: 'instapay://',
      android: 'intent://#Intent;package=com.egyptianbanks.instapay;scheme=instapay;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.egyptianbanks.instapay;end',
      ios: 'https://apps.apple.com/eg/app/instapay-egypt/id1592108795',
      web: 'https://instapay.eg/'
    },
    vodafone: {
      appName: 'فودافون كاش',
      scheme: 'anavodafone://',
      android: 'intent://#Intent;package=com.emeint.android.myservices;scheme=anavodafone;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.emeint.android.myservices;end',
      ios: 'https://apps.apple.com/eg/app/ana-vodafone/id437564823',
      web: 'https://web.vodafone.com.eg/'
    }
  }

  $$('.pay-app-btn').forEach(button => button.addEventListener('click', async () => {
    const config = payAppsConfig[button.dataset.app]
    if (!config) return

    // 1) نسخ الرقم أولاً
    const number = button.dataset.copy
    if (number) {
      try {
        await navigator.clipboard.writeText(number)
        toast(`تم نسخ الرقم — جارٍ فتح ${config.appName}`, 'copy')
      } catch {
        toast(`الرقم: ${number} — جارٍ فتح ${config.appName}`, 'info')
      }
    }

    // 2) فتح التطبيق حسب نظام التشغيل
    const ua = navigator.userAgent || ''
    const isAndroid = /Android/i.test(ua)
    const isIOS = /iPhone|iPad|iPod/i.test(ua)

    setTimeout(() => {
      if (isAndroid) {
        // intent:// يفتح التطبيق مباشرة أو متجر Google Play إن لم يكن مثبتًا
        window.location.href = config.android
      } else if (isIOS) {
        // محاولة فتح التطبيق عبر الـ scheme ثم الانتقال لمتجر التطبيقات
        const start = Date.now()
        window.location.href = config.scheme
        setTimeout(() => {
          if (Date.now() - start < 2200 && !document.hidden) window.location.href = config.ios
        }, 1600)
      } else {
        // كمبيوتر مكتبي: فتح الموقع الرسمي في تبويب جديد
        window.open(config.web, '_blank', 'noopener')
      }
    }, 450)
  }))

  $$('.toast-trigger').forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.toastType || 'prayer'
    toast(button.dataset.message, type)
  }))

  $$('.amount-picks button').forEach(button => button.addEventListener('click', () => {
    $$('.amount-picks button').forEach(item => item.classList.remove('active'))
    button.classList.add('active')
    const input = $('#amount-input')
    if (input) input.value = button.dataset.amount
  }))

  /* ─── Real-time Form Validation & Enhancements ─── */
  function validateField(field) {
    if (!field || field.type === 'hidden' || field.disabled) return true
    const value = field.value.trim()
    const type = field.type
    const name = field.name
    let isValid = true

    if (field.hasAttribute('required') && !value) {
      isValid = false
    } else if (value && (type === 'email' || name === 'email')) {
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    } else if (value && (type === 'tel' || name === 'phone' || name === 'donor_phone')) {
      isValid = /^[\d+\s\-]{8,15}$/.test(value)
    } else if (value && type === 'number' && field.min) {
      isValid = Number(value) >= Number(field.min)
    }

    if (!isValid && (value || field.dataset.touched === 'true')) {
      field.classList.add('is-invalid')
      field.classList.remove('is-valid')
    } else if (isValid && value) {
      field.classList.remove('is-invalid')
      field.classList.add('is-valid')
    } else {
      field.classList.remove('is-invalid', 'is-valid')
    }
    return isValid
  }

  $$('form input, form select, form textarea').forEach(field => {
    field.addEventListener('blur', () => {
      field.dataset.touched = 'true'
      validateField(field)
    })
    field.addEventListener('input', () => {
      if (field.dataset.touched === 'true') validateField(field)
    })
  })

  $$('.ajax-form').forEach(form => form.addEventListener('submit', async e => {
    e.preventDefault()
    let isAllValid = true
    $$('input, select, textarea', form).forEach(field => {
      field.dataset.touched = 'true'
      if (!validateField(field)) isAllValid = false
    })
    if (!isAllValid) {
      toast('يرجى التأكد من تصحيح الحقول المحددة بالأحمر', 'error')
      const invalidField = $('.is-invalid', form)
      if (invalidField) {
        invalidField.focus()
        invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    const submit = $('button[type="submit"], button:not([type])', form)
    const original = submit?.innerHTML
    if (submit) {
      submit.disabled = true
      submit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جارٍ الإرسال'
    }
    try {
      const data = Object.fromEntries(new FormData(form))
      const response = await fetch(form.dataset.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || result.error)
      
      const endpoint = (form.dataset.endpoint || '').toLowerCase()
      let toastType = 'success'
      if (endpoint.includes('donation'))       toastType = 'donate'
      else if (endpoint.includes('volunteer')) toastType = 'volunteer'
      else if (endpoint.includes('newsletter')) toastType = 'subscribe'
      else if (endpoint.includes('contact'))   toastType = 'contact'
      
      toast(result.message || 'تم استلام طلبك بنجاح', toastType)
      if (!form.classList.contains('donation-form')) form.reset()
      $$('.is-valid', form).forEach(el => el.classList.remove('is-valid'))
    } catch (error) {
      toast(error.message || 'تعذر الإرسال الآن، حاول مرة أخرى', 'error')
    } finally {
      if (submit) {
        submit.disabled = false
        submit.innerHTML = original
      }
    }
  }))

  /* ─── Interactive Payment Details Modal System ─── */
  function openPaymentDetailsModal(method) {
    let backdrop = document.getElementById('pay-modal-backdrop')
    if (!backdrop) {
      backdrop = document.createElement('div')
      backdrop.id = 'pay-modal-backdrop'
      backdrop.className = 'dash-modal-backdrop'
      document.body.appendChild(backdrop)
    }

    const payDataMap = {
      instapay: {
        title: 'بيانات التحويل عبر إنستاباي — InstaPay',
        badge: 'تحويل فوري 24/7 بدون أي رسوم',
        logo: '/static/img/instapay-logo.png',
        number: '01060920249',
        label: 'رقم حساب InstaPay / المحفظة',
        steps: [
          'افتح تطبيق إنستاباي (InstaPay) على هاتفك',
          'اختر "إرسال أموال" ثم اختر "رقم الهاتف / المحفظة"',
          'أدخل الرقم التالي: <b>01060920249</b>',
          'أدخل مبلغ التبرع واضغط "إرسال"'
        ],
        appUrl: 'instapay://'
      },
      vodafone: {
        title: 'بيانات التحويل عبر فودافون كاش — Vodafone Cash',
        badge: 'محفظة إلكترونية فورية',
        logo: '/static/img/vodafone-cash-logo.png',
        number: '01060920249',
        label: 'رقم محفظة فودافون كاش',
        steps: [
          'افتح تطبيق Ana Vodafone أو اطلب كود <b>*9#</b>',
          'اختر "تحويل أموال"',
          'أدخل الرقم التالي: <b>01060920249</b>',
          'أدخل مبلغ التبرع ورقمك السرّي للتأكيد'
        ],
        appUrl: 'tel:*9%23'
      },
      bank: {
        title: 'بيانات الحساب البنكي — البنك الزراعي المصري',
        badge: 'حساب رسمي مرخص للمؤسسة',
        logoIcon: 'fa-building-columns',
        number: '10010397596901014',
        label: 'رقم الحساب البنكي الرسمي',
        bankName: 'البنك الزراعي المصري — فرع كفر العنانية / الدقهلية',
        accountTitle: 'مؤسسة الدكتور عمر هشام صبري الخيرية',
        steps: [
          'قم بزيارة أي فرع للبنك الزراعي المصري أو عبر تطبيق البنك',
          'أدخل اسم الحساب: <b>مؤسسة الدكتور عمر هشام صبري الخيرية</b>',
          'أدخل رقم الحساب: <b>10010397596901014</b>',
          'قم بإيداع أو تحويل المبلغ'
        ]
      }
    }

    const data = payDataMap[method] || payDataMap.instapay

    const logoHtml = data.logo
      ? `<img src="${data.logo}" alt="${data.title}" style="height:36px; object-fit:contain" />`
      : `<i class="fa-solid ${data.logoIcon || 'fa-building-columns'}" style="font-size:1.8rem; color:var(--emerald)"></i>`

    const stepsHtml = data.steps.map((st, i) => `
      <div style="display:flex; align-items:flex-start; gap:12px">
        <span style="width:26px; height:26px; border-radius:50%; background:rgba(22,138,112,0.12); color:var(--emerald); display:grid; place-items:center; font-weight:800; font-size:0.8rem; flex-shrink:0">${i + 1}</span>
        <p style="margin:0; font-size:0.92rem; color:var(--text); line-height:1.5">${st}</p>
      </div>
    `).join('')

    const appBtnHtml = data.appUrl
      ? `<a href="${data.appUrl}" class="primary-btn" style="height:44px; padding:0 20px; font-size:0.88rem"><i class="fa-solid fa-arrow-up-right-from-square"></i> فتح التطبيق مباشرة</a>`
      : ''

    backdrop.innerHTML = `
      <div class="dash-modal" role="dialog" aria-modal="true" style="max-width:540px">
        <div class="dash-modal-header">
          <div style="display:flex; align-items:center; gap:12px">
            ${logoHtml}
            <div>
              <h3 style="margin:0; font-size:1.1rem; font-weight:800">${data.title}</h3>
              <span style="font-size:0.75rem; color:var(--emerald); font-weight:700">${data.badge}</span>
            </div>
          </div>
          <button type="button" class="dash-modal-close" id="pay-modal-close-btn">&times;</button>
        </div>
        <div class="dash-modal-body">
          ${data.accountTitle ? `<div style="background:var(--ivory); padding:10px 14px; border-radius:10px; border:1px solid var(--border); font-size:0.85rem"><b>اسم الحساب:</b> ${data.accountTitle}<br/><small style="color:var(--muted)">${data.bankName}</small></div>` : ''}
          
          <div class="pay-modal-number-box">
            <span style="font-size:0.8rem; color:var(--muted); font-weight:700">${data.label}</span>
            <strong dir="ltr" class="pay-modal-num">${data.number}</strong>
            <button type="button" class="primary-btn modal-copy-btn" id="modal-copy-number-btn"><i class="fa-solid fa-copy"></i> نسخ الرقم</button>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px">
            <b style="font-size:0.9rem; color:var(--text)">خطوات التحويل السريعة:</b>
            ${stepsHtml}
          </div>
        </div>
        <div class="dash-modal-footer">
          <button type="button" class="dash-modal-cancel-btn" id="pay-modal-cancel-btn">إغلاق</button>
          ${appBtnHtml}
        </div>
      </div>
    `

    backdrop.classList.add('open')

    const closeModal = () => {
      backdrop.classList.remove('open')
      setTimeout(() => { backdrop.innerHTML = '' }, 300)
    }

    document.getElementById('pay-modal-close-btn')?.addEventListener('click', closeModal)
    document.getElementById('pay-modal-cancel-btn')?.addEventListener('click', closeModal)
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal() })

    document.getElementById('modal-copy-number-btn')?.addEventListener('click', function() {
      navigator.clipboard.writeText(data.number).then(() => {
        toast('تم نسخ الرقم بنجاح: ' + data.number, 'success')
        this.innerHTML = '<i class="fa-solid fa-check"></i> تم النسخ!'
        setTimeout(() => { this.innerHTML = '<i class="fa-solid fa-copy"></i> نسخ الرقم' }, 2500)
      }).catch(() => {
        toast('تعذر النسخ التلقائي، يمكنك نسخ الرقم يدوياً: ' + data.number, 'info')
      })
    })
  }

  // Donate Amount Picks Preset Handler
  document.addEventListener('click', e => {
    const pickBtn = e.target.closest('#amount-picks-container button, .amount-picks button')
    if (pickBtn) {
      const amountInput = document.getElementById('amount-input')
      if (amountInput && pickBtn.dataset.amount) {
        amountInput.value = pickBtn.dataset.amount
        amountInput.dispatchEvent(new Event('input', { bubbles: true }))
        pickBtn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'))
        pickBtn.classList.add('active')
      }
    }

    const payModalBtn = e.target.closest('[data-pay-modal]')
    if (payModalBtn) {
      e.preventDefault()
      e.stopPropagation()
      openPaymentDetailsModal(payModalBtn.dataset.payModal)
    }
  })

  // Open modal automatically when user selects InstaPay, Vodafone or Bank radio if explicitly clicked
  document.addEventListener('change', e => {
    if (e.target.name === 'method' && ['instapay', 'vodafone', 'bank'].includes(e.target.value)) {
      openPaymentDetailsModal(e.target.value)
    }
  })

  $$('[data-filter-group] button').forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.filter
    $$('[data-filter-group] button').forEach(item => item.classList.remove('active'))
    button.classList.add('active')
    $$('.all-campaigns > div').forEach(card => {
      card.classList.toggle('hidden', value !== 'all' && card.dataset.category !== value)
    })
  }))

  if (matchMedia('(pointer: fine)').matches) {
    const dot = $('#cursor-dot')
    const ring = $('#cursor-ring')
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0
    addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY
      if (dot) dot.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`
    })
    const animateRing = () => {
      ringX += (mouseX - ringX) * .16; ringY += (mouseY - ringY) * .16
      if (ring) ring.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`
      requestAnimationFrame(animateRing)
    }
    animateRing()
    $$('a,button,input,select,textarea').forEach(el => {
      el.addEventListener('mouseenter', () => ring?.classList.add('hover'))
      el.addEventListener('mouseleave', () => ring?.classList.remove('hover'))
    })

    $$('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - .5
        const y = (e.clientY - rect.top) / rect.height - .5
        card.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-7px)`
      })
      card.addEventListener('mouseleave', () => card.style.transform = '')
    })
  }

  /* ─── Media Upload Widget ───────────────────────────────────────────────
     Must be re-runnable: dashboard views and the edit modal inject their
     markup after load, so widgets created later were never wired up before
     (that is why "upload image" silently did nothing in the edit modal). */

  const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
  const COMPRESSIBLE = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp']

  /** Finds the hidden input that belongs to THIS widget (forms may hold several). */
  function resolveHiddenInput(widget) {
    const targetSel = widget.dataset.target
    if (targetSel) {
      const byTarget = document.querySelector(targetSel)
      if (byTarget) return byTarget
    }
    // Preferred: the hidden input lives inside the widget.
    const inner = widget.querySelector('.cloudinary-url, input[name="image_url"][type="hidden"]')
    if (inner) return inner

    // Otherwise the nearest previous sibling hidden input.
    let sibling = widget.previousElementSibling
    while (sibling) {
      if (sibling.matches?.('.cloudinary-url, input[name="image_url"][type="hidden"]')) return sibling
      const nested = sibling.querySelector?.('.cloudinary-url, input[name="image_url"][type="hidden"]')
      if (nested) return nested
      sibling = sibling.previousElementSibling
    }

    // Last resort: pair widgets and hidden inputs by their order in the form.
    const form = widget.closest('form')
    if (!form) return null
    const widgets = Array.from(form.querySelectorAll('.upload-widget'))
    const hidden = Array.from(form.querySelectorAll('.cloudinary-url, input[name="image_url"][type="hidden"]'))
    return hidden[widgets.indexOf(widget)] || hidden[0] || null
  }

  /** Mirrors normalizeMediaUrl() on the server so preview and stored value agree. */
  function normalizeMediaUrlClient(raw) {
    let value = String(raw ?? '').trim().replace(/^['"]+|['"]+$/g, '').trim()
    if (!value) return ''
    if (value.startsWith('/') || value.startsWith('data:image/')) return value
    if (/^https?:\/\//i.test(value)) return value
    if (/^\/\//.test(value)) return 'https:' + value
    if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(value)) return 'https://' + value
    return value
  }

  /** Downscales large photos in the browser so uploads stay under the limit. */
  function compressImage(file) {
    return new Promise(resolve => {
      if (!COMPRESSIBLE.includes((file.type || '').toLowerCase()) || file.size <= 900 * 1024) {
        resolve(file)
        return
      }
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        const maxSide = 1800
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(file); return }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(blob => {
          if (!blob || blob.size >= file.size) { resolve(file); return }
          const name = (file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg'
          resolve(new File([blob], name, { type: 'image/jpeg' }))
        }, 'image/jpeg', 0.85)
      }
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
      img.src = url
    })
  }

  function initUploadWidget(widget) {
    if (widget.dataset.uploadBound === '1') return
    const dropZone = widget.querySelector('.upload-drop-zone')
    const fileInput = widget.querySelector('.upload-file-input')
    const preview = widget.querySelector('.upload-preview')
    const placeholder = widget.querySelector('.upload-placeholder')
    const urlFallback = widget.querySelector('.upload-url-fallback')
    const hiddenInput = resolveHiddenInput(widget)

    if (!dropZone || !fileInput || !hiddenInput) return
    widget.dataset.uploadBound = '1'

    const progressWrap = document.createElement('div')
    progressWrap.className = 'upload-progress'
    progressWrap.innerHTML = '<div class="upload-progress-bar"></div>'
    dropZone.parentElement.insertBefore(progressWrap, dropZone.nextSibling)
    const progressBar = progressWrap.querySelector('.upload-progress-bar')

    const statusEl = document.createElement('div')
    statusEl.className = 'upload-status'
    progressWrap.parentElement.insertBefore(statusEl, progressWrap.nextSibling)

    const setStatus = (text, kind) => {
      statusEl.textContent = text || ''
      statusEl.className = 'upload-status' + (kind ? ' ' + kind : '')
    }

    const showPreview = src => {
      if (!preview) return
      if (src) {
        preview.src = src
        preview.style.display = 'block'
        if (placeholder) placeholder.style.display = 'none'
      } else {
        preview.removeAttribute('src')
        preview.style.display = 'none'
        if (placeholder) placeholder.style.display = ''
      }
    }

    // Tell the admin when a pasted URL cannot actually be loaded, instead of
    // silently saving a broken link.
    if (preview) {
      preview.addEventListener('error', () => {
        if (preview.getAttribute('src')) {
          setStatus('⚠ لا يمكن تحميل الصورة من هذا الرابط. تأكد أنه رابط صورة مباشر.', 'error')
        }
      })
      preview.addEventListener('load', () => {
        if (statusEl.classList.contains('error')) setStatus('')
      })
    }

    // Sync the initial value (edit modal opens with an existing image).
    const initial = normalizeMediaUrlClient(hiddenInput.value || urlFallback?.value || '')
    if (initial) {
      hiddenInput.value = initial
      if (urlFallback) urlFallback.value = initial
      showPreview(initial)
    }

    ;['dragenter', 'dragover'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.add('dragover') }))
    ;['dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.remove('dragover') }))

    dropZone.addEventListener('drop', e => {
      const files = e.dataTransfer?.files
      if (files?.length) handleFileUpload(files[0])
    })

    dropZone.addEventListener('click', e => {
      if (e.target === fileInput) return
      fileInput.click()
    })

    fileInput.addEventListener('change', () => {
      if (fileInput.files?.length) handleFileUpload(fileInput.files[0])
    })

    // URL fallback: react to every way a value can arrive (typing, paste, autofill).
    if (urlFallback) {
      const applyUrl = () => {
        const value = normalizeMediaUrlClient(urlFallback.value)
        hiddenInput.value = value
        showPreview(value)
        if (value) setStatus('سيتم حفظ الرابط عند الضغط على حفظ', 'success')
        else setStatus('')
      }
      ;['input', 'change', 'blur'].forEach(ev => urlFallback.addEventListener(ev, applyUrl))
      urlFallback.addEventListener('paste', () => setTimeout(applyUrl, 0))
    }

    async function handleFileUpload(rawFile) {
      if (!rawFile) return

      if (rawFile.size > MAX_UPLOAD_BYTES * 4) {
        setStatus('✗ حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت', 'error')
        return
      }

      const file = await compressImage(rawFile)
      if (file.size > MAX_UPLOAD_BYTES) {
        setStatus('✗ حجم الملف كبير جداً بعد الضغط. الحد الأقصى 10 ميجابايت', 'error')
        return
      }

      if ((file.type || '').startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = e => showPreview(e.target.result)
        reader.readAsDataURL(file)
      }

      progressWrap.style.display = 'block'
      progressBar.style.width = '25%'
      progressBar.style.background = ''
      setStatus('جارٍ رفع الصورة...')

      try {
        const formData = new FormData()
        formData.append('file', file, file.name || 'upload.jpg')
        progressBar.style.width = '65%'

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        })

        progressBar.style.width = '90%'

        if (response.status === 401 || response.status === 403) {
          throw new Error('انتهت صلاحية الجلسة. فضلاً أعد تسجيل الدخول ثم حاول مرة أخرى.')
        }

        const data = await response.json().catch(() => ({}))
        if (!response.ok || !data.url) {
          throw new Error(data.error || 'فشل رفع الملف')
        }

        progressBar.style.width = '100%'
        const url = normalizeMediaUrlClient(data.url)
        hiddenInput.value = url
        if (urlFallback) urlFallback.value = url
        showPreview(url)

        setStatus('✓ تم رفع الصورة بنجاح', 'success')
        setTimeout(() => { progressWrap.style.display = 'none' }, 1500)
      } catch (err) {
        progressBar.style.width = '100%'
        progressBar.style.background = 'var(--coral)'
        setStatus('✗ ' + (err.message || 'فشل رفع الملف'), 'error')
        setTimeout(() => {
          progressWrap.style.display = 'none'
          progressBar.style.width = '0'
          progressBar.style.background = ''
        }, 4000)
      }
    }
  }

  function initUploadWidgets(root = document) {
    $$('.upload-widget', root).forEach(initUploadWidget)
  }

  /** Copies any typed URL into the hidden input right before a form submits. */
  function syncUploadWidgets(root = document) {
    $$('.upload-widget', root).forEach(widget => {
      const hiddenInput = resolveHiddenInput(widget)
      const urlFallback = widget.querySelector('.upload-url-fallback')
      if (!hiddenInput) return
      const typed = normalizeMediaUrlClient(urlFallback?.value || '')
      if (typed) hiddenInput.value = typed
      else hiddenInput.value = normalizeMediaUrlClient(hiddenInput.value)
    })
  }

  window.initUploadWidgets = initUploadWidgets
  window.syncUploadWidgets = syncUploadWidgets

  initUploadWidgets()

  // Photo Gallery Filter and Lightbox initialization
  function initGallery() {
    const filterBtns = $$('.gallery-filter-btn')
    const cards = $$('.gallery-card')
    const lightbox = $('#gallery-lightbox')
    const lbImg = $('#gallery-lightbox-img')
    const lbTitle = $('#gallery-lightbox-title')
    const lbLocation = $('#gallery-lightbox-location span')
    const lbTag = $('#gallery-lightbox-tag')
    const lbClose = $('#gallery-lightbox-close')
    const lbBackdrop = $('.gallery-lightbox-backdrop')

    if (filterBtns.length > 0) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'))
          btn.classList.add('active')
          const cat = btn.getAttribute('data-filter')

          cards.forEach(card => {
            const cardCat = card.getAttribute('data-category')
            if (cat === 'all' || cardCat === cat) {
              card.style.display = 'flex'
            } else {
              card.style.display = 'none'
            }
          })
        })
      })
    }

    if (lightbox && cards.length > 0) {
      const openLightbox = (card) => {
        const img = card.getAttribute('data-img')
        const title = card.getAttribute('data-title')
        const location = card.getAttribute('data-location')
        const tag = card.getAttribute('data-category')

        if (lbImg) lbImg.src = img
        if (lbTitle) lbTitle.textContent = title
        if (lbLocation) lbLocation.textContent = location || 'المؤسسة'
        if (lbTag) lbTag.textContent = tag || 'عام'

        lightbox.classList.add('active')
        lightbox.setAttribute('aria-hidden', 'false')
      }

      const closeLightbox = () => {
        lightbox.classList.remove('active')
        lightbox.setAttribute('aria-hidden', 'true')
      }

      cards.forEach(card => {
        card.addEventListener('click', () => openLightbox(card))
      })

      lbClose?.addEventListener('click', (e) => {
        e.stopPropagation()
        closeLightbox()
      })
      lbBackdrop?.addEventListener('click', closeLightbox)

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
          closeLightbox()
        }
      })
    }
  }

  initGallery()

  // ===== Volunteer ID Verify Tool =====
  function initVolVerify() {
    const btn = $('#volVerifyBtn')
    const input = $('#volVerifyInput')
    const result = $('#volVerifyResult')
    if (!btn || !input || !result) return

    async function verify() {
      const code = input.value.trim()
      if (!code) {
        input.focus()
        return
      }
      btn.disabled = true
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحقق...'

      try {
        const res = await fetch(`/api/volunteers/verify/${encodeURIComponent(code)}`)
        const data = await res.json()

        result.style.display = 'block'
        result.className = 'vol-verify-result ' + (data.found ? 'found' : 'not-found')

        if (data.found) {
          const v = data.volunteer
          const isExpired = data.expired
          const isRevoked = data.revoked || v.status === 'revoked'
          result.innerHTML = `
            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
              <div style="width:56px;height:56px;border-radius:50%;background:rgba(22,138,112,.3);display:grid;place-items:center;font-size:1.3rem;color:#7ee2bd;overflow:hidden;flex-shrink:0;border:2px solid #f0cf82;box-shadow:0 4px 12px rgba(0,0,0,.3)">
                ${v.avatar_url ? `<img src="${v.avatar_url}" style="width:100%;height:100%;object-fit:cover" />` : '<i class="fa-solid fa-user"></i>'}
              </div>
              <div style="flex:1">
                <strong style="font-size:1.08rem;display:block">${v.full_name}</strong>
                <span style="font-size:.82rem;color:rgba(255,255,255,.65)">${v.preferred_role || v.team || ''}</span>
              </div>
              <div style="text-align:center">
                <span style="font-family:monospace;font-size:1.15rem;font-weight:900;color:#f0cf82;display:block">${v.volunteer_code}</span>
                <small style="font-size:.7rem;color:rgba(255,255,255,.5)">${v.rank || 'متطوع مبادر'}</small>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:14px;font-size:.82rem;font-weight:800;${isRevoked || isExpired ? 'color:#ff7675' : 'color:#7ee2bd'}">
              <i class="fa-solid ${isRevoked ? 'fa-ban' : isExpired ? 'fa-triangle-exclamation' : 'fa-shield-halved'}"></i>
              ${isRevoked ? 'هذه البطاقة ملغاة / مجمّدة برمجياً من قِبل الإدارة' : isExpired ? 'هذه البطاقة منتهية الصلاحية' : 'متطوع معتمد رسمياً من مؤسسة الدكتور عمر هشام ✦'}
              ${v.expires_at && !isRevoked ? `&nbsp;·&nbsp; تنتهي: ${new Date(v.expires_at).toLocaleDateString('ar-EG', {year:'numeric',month:'long'})}` : ''}
            </div>
          `
        } else {
          result.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.8)">
              <i class="fa-solid fa-circle-xmark" style="font-size:1.3rem;color:#e86f51"></i>
              <span>${data.message || 'لا يوجد متطوع بهذا الكود أو أن الكود غير مفعّل.'}</span>
            </div>
          `
        }
      } catch (e) {
        result.style.display = 'block'
        result.className = 'vol-verify-result not-found'
        result.innerHTML = '<i class="fa-solid fa-wifi"></i> تعذر التحقق الآن، يرجى المحاولة لاحقاً.'
      } finally {
        btn.disabled = false
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> تحقق الآن'
      }
    }

    btn.addEventListener('click', verify)
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') verify() })
  }

  initVolVerify()

  // ===== Volunteer Avatar Preview & Upload =====
  function initVolAvatarUpload() {
    const fileInput = $('#volAvatarInput')
    const preview = $('#volAvatarPreview')
    const hiddenUrl = $('#volAvatarUrl')
    if (!fileInput || !preview) return

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0]
      if (!file) return

      // Show local preview immediately
      const reader = new FileReader()
      reader.onload = (ev) => {
        preview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`
      }
      reader.readAsDataURL(file)

      // Upload to public storage endpoint
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload/public', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url && hiddenUrl) {
          hiddenUrl.value = data.url
        }
      } catch (err) {
        console.error('Avatar upload failed:', err)
      }
    })
  }

  initVolAvatarUpload()

  // ===== Download & Print Volunteer ID Card =====
  // Renders the card manually on a <canvas> (no html2canvas) — bulletproof, no
  // cross-browser rendering bugs, guaranteed to produce a valid PNG every time.
  function initVolCardDownload() {
    const cardEl = $('#volunteerIdCard')
    const downloadBtn = $('#downloadVolCard')
    const printBtn = $('#printVolCard')

    if (printBtn) {
      printBtn.addEventListener('click', () => window.print())
    }

    if (!cardEl || !downloadBtn) return

    // ---- helpers ----
    function loadImage(src, crossOrigin) {
      return new Promise((resolve) => {
        if (!src) return resolve(null)
        const img = new Image()
        if (crossOrigin) img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null) // never fail the whole export for an image
        img.src = src
      })
    }

    function roundRect(ctx, x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2)
      ctx.beginPath()
      ctx.moveTo(x + rr, y)
      ctx.arcTo(x + w, y, x + w, y + h, rr)
      ctx.arcTo(x + w, y + h, x, y + h, rr)
      ctx.arcTo(x, y + h, x, y, rr)
      ctx.arcTo(x, y, x + w, y, rr)
      ctx.closePath()
    }

    function canvasToBlob(canvas) {
      return new Promise((resolve, reject) => {
        try {
          canvas.toBlob((blob) => {
            if (blob && blob.size > 0) resolve(blob)
            else reject(new Error('Empty image data'))
          }, 'image/png')
        } catch (e) { reject(e) }
      })
    }

    // ---- minimal high-resolution ID painter ----
    async function renderCardToCanvas() {
      const nameEl = cardEl.querySelector('.vol-id-name')
      const codeEl = cardEl.querySelector('.vol-id-code')
      const expiryEl = cardEl.querySelector('.vol-id-expiry-date')
      const roleEl = cardEl.querySelector('.vol-id-role')
      const avatarImgEl = cardEl.querySelector('.vol-id-avatar')
      const initialsEl = cardEl.querySelector('.vol-id-avatar-initials')
      const statusEl = cardEl.querySelector('.vol-id-status')

      const name = nameEl ? nameEl.textContent.trim() : 'متطوع المؤسسة'
      const code = codeEl ? codeEl.textContent.trim() : 'VOL-PASS'
      const expiry = expiryEl ? expiryEl.textContent.trim() : 'صلاحية مفتوحة'
      const role = roleEl ? roleEl.textContent.trim() : 'متطوع معتمد'
      const statusText = statusEl ? statusEl.textContent.trim() : 'سارية'
      const isActive = statusEl ? statusEl.classList.contains('is-active') : true
      const initials = initialsEl ? initialsEl.textContent.trim()
        : name.split(/\s+/).slice(0, 2).map(w => w[0] || '').join('')

      const S = 3
      const W = 1060, H = 600
      const canvas = document.createElement('canvas')
      canvas.width = W * S
      canvas.height = H * S
      const ctx = canvas.getContext('2d')
      ctx.scale(S, S)
      ctx.textBaseline = 'middle'
      ctx.direction = 'rtl'

      // Quiet deep-green identity surface.
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, '#06352f')
      bg.addColorStop(0.6, '#07483e')
      bg.addColorStop(1, '#052d28')
      roundRect(ctx, 0, 0, W, H, 32)
      ctx.fillStyle = bg
      ctx.fill()

      // Fine gold edge and top signature line.
      roundRect(ctx, 3, 3, W - 6, H - 6, 29)
      ctx.strokeStyle = 'rgba(238,201,107,.58)'
      ctx.lineWidth = 2
      ctx.stroke()
      const accent = ctx.createLinearGradient(0, 0, W, 0)
      accent.addColorStop(0, '#b98527')
      accent.addColorStop(.5, '#f1d77f')
      accent.addColorStop(1, '#b98527')
      ctx.save()
      roundRect(ctx, 0, 0, W, H, 32)
      ctx.clip()
      ctx.fillStyle = accent
      ctx.fillRect(0, 0, W, 7)
      ctx.restore()

      // Restrained geometric watermark.
      ctx.save()
      ctx.globalAlpha = .055
      ctx.strokeStyle = '#f1d77f'
      ctx.lineWidth = 2
      ;[150, 205, 260].forEach(r => {
        ctx.beginPath()
        ctx.arc(80, H - 20, r, 0, Math.PI * 2)
        ctx.stroke()
      })
      ctx.restore()

      // Header logo and institution name.
      const logo = await loadImage('/static/foundation-export-logo.png')
      if (logo) ctx.drawImage(logo, W - 118, 30, 76, 76)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffffff'
      ctx.font = '900 27px Cairo, Tajawal, Arial, sans-serif'
      ctx.fillText('مؤسسة الدكتور عمر هشام الخيرية', W - 136, 57)
      ctx.fillStyle = '#e9cd7b'
      ctx.font = '800 14px Manrope, Cairo, Arial, sans-serif'
      ctx.fillText('VOLUNTEER ID  ·  بطاقة متطوع', W - 136, 87)

      // Compact status pill.
      ctx.font = '800 18px Cairo, Tajawal, Arial, sans-serif'
      const pillW = Math.max(112, ctx.measureText(statusText).width + 48)
      const pillX = 42, pillY = 43, pillH = 42
      roundRect(ctx, pillX, pillY, pillW, pillH, 21)
      ctx.fillStyle = isActive ? 'rgba(112,220,178,.12)' : 'rgba(239,115,104,.14)'
      ctx.fill()
      ctx.strokeStyle = isActive ? 'rgba(112,220,178,.34)' : 'rgba(239,115,104,.42)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = isActive ? '#8ce3c1' : '#ff9b91'
      ctx.textAlign = 'center'
      ctx.fillText(statusText, pillX + pillW / 2, pillY + pillH / 2 + 1)

      ctx.fillStyle = 'rgba(255,255,255,.11)'
      ctx.fillRect(42, 130, W - 84, 1)

      // Portrait — formal portrait ratio rather than a decorative square.
      const phW = 210, phH = 250, phX = W - 42 - phW, phY = 170, phR = 28
      const avatar = avatarImgEl ? await loadImage(avatarImgEl.currentSrc || avatarImgEl.src, true) : null
      roundRect(ctx, phX - 4, phY - 4, phW + 8, phH + 8, phR + 4)
      ctx.fillStyle = accent
      ctx.fill()
      roundRect(ctx, phX, phY, phW, phH, phR)
      ctx.save()
      ctx.clip()
      if (avatar) {
        const iw = avatar.naturalWidth || avatar.width
        const ih = avatar.naturalHeight || avatar.height
        const targetRatio = phW / phH
        const sourceRatio = iw / ih
        let sx = 0, sy = 0, sw = iw, sh = ih
        if (sourceRatio > targetRatio) { sw = ih * targetRatio; sx = (iw - sw) / 2 }
        else { sh = iw / targetRatio; sy = (ih - sh) / 2 }
        try { ctx.drawImage(avatar, sx, sy, sw, sh, phX, phY, phW, phH) }
        catch (e) { drawInitialsTile() }
      } else drawInitialsTile()
      ctx.restore()

      function drawInitialsTile() {
        ctx.fillStyle = '#0c6657'
        ctx.fillRect(phX, phY, phW, phH)
        ctx.fillStyle = '#ffffff'
        ctx.font = '900 72px Cairo, Tajawal, Arial, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(initials || '✦', phX + phW / 2, phY + phH / 2)
      }

      // Only the essential identity fields.
      const infoRight = phX - 42
      const infoLeft = 42
      const infoW = infoRight - infoLeft
      ctx.textAlign = 'right'
      ctx.fillStyle = '#e9cd7b'
      ctx.font = '900 20px Cairo, Tajawal, Arial, sans-serif'
      ctx.fillText(role, infoRight, 196)

      ctx.fillStyle = '#ffffff'
      let nameSize = 45
      do {
        ctx.font = `900 ${nameSize}px Cairo, Tajawal, Arial, sans-serif`
        if (ctx.measureText(name).width <= infoW) break
        nameSize -= 2
      } while (nameSize > 28)
      ctx.fillText(name, infoRight, 246)

      const boxY = 292, boxH = 96
      roundRect(ctx, infoLeft, boxY, infoW, boxH, 18)
      ctx.fillStyle = 'rgba(255,255,255,.07)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,.12)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,.55)'
      ctx.font = '800 16px Cairo, Tajawal, Arial, sans-serif'
      ctx.fillText('رقم الهوية', infoRight - 20, boxY + 28)
      ctx.fillStyle = '#f1d77f'
      ctx.font = '900 38px Manrope, Consolas, monospace'
      ctx.fillText(code, infoRight - 20, boxY + 66)

      // Minimal footer: expiry + trust marker.
      const ftY = 478
      ctx.fillStyle = 'rgba(0,0,0,.14)'
      ctx.fillRect(0, ftY, W, H - ftY)
      ctx.fillStyle = 'rgba(255,255,255,.09)'
      ctx.fillRect(42, ftY, W - 84, 1)
      ctx.textAlign = 'right'
      ctx.fillStyle = 'rgba(255,255,255,.5)'
      ctx.font = '800 16px Cairo, Tajawal, Arial, sans-serif'
      ctx.fillText('صالحة حتى', W - 42, 520)
      ctx.fillStyle = isActive ? '#ffffff' : '#ff9b91'
      ctx.font = '900 22px Cairo, Tajawal, Arial, sans-serif'
      ctx.fillText(expiry, W - 42, 552)

      ctx.textAlign = 'left'
      ctx.fillStyle = '#e9cd7b'
      ctx.font = '900 18px Cairo, Tajawal, Arial, sans-serif'
      ctx.fillText('◆  هوية رقمية موثّقة', 42, 530)
      ctx.fillStyle = 'rgba(255,255,255,.5)'
      ctx.font = '700 14px Manrope, Arial, sans-serif'
      ctx.fillText('omarhesham.org', 42, 557)

      return canvas
    }

    // ---- download click ----
    downloadBtn.addEventListener('click', async () => {
      const originalText = downloadBtn.innerHTML
      downloadBtn.disabled = true
      downloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تجهيز البطاقة...'

      let blobUrl = null
      try {
        // wait for webfonts so Arabic text renders correctly
        if (document.fonts && document.fonts.ready) {
          try { await document.fonts.ready } catch (e) {}
        }

        const canvas = await renderCardToCanvas()
        if (!canvas || !canvas.width || !canvas.height) throw new Error('Canvas render failed')

        const blob = await canvasToBlob(canvas)

        const codeEl = cardEl.querySelector('.vol-id-code')
        const codeText = codeEl ? codeEl.textContent.trim().replace(/\s+/g, '') : 'VOL-PASS'
        const filename = `Volunteer_ID_${codeText}.png`

        blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = filename
        link.href = blobUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        downloadBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> تم التحميل بنجاح'
        if (window.showToast) {
          window.showToast('تم تحميل بطاقة الهوية بنجاح! تحقق من مجلد التنزيلات 📥', 'success')
        }
        setTimeout(() => {
          downloadBtn.disabled = false
          downloadBtn.innerHTML = originalText
        }, 2600)
      } catch (err) {
        console.error('Export error:', err)
        if (window.showToast) {
          window.showToast('تعذر تحميل البطاقة الآن، حاول مرة أخرى أو استخدم زر الطباعة.', 'error')
        }
        downloadBtn.disabled = false
        downloadBtn.innerHTML = originalText
      } finally {
        if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
      }
    })
  }

  initVolCardDownload()

})()
