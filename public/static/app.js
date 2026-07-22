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

    let formFieldsHtml = ''

    if (type === 'campaigns') {
      const presetIcons = ['fa-heart', 'fa-capsules', 'fa-basket-shopping', 'fa-school', 'fa-stethoscope', 'fa-book-open', 'fa-gift', 'fa-hand-holding-heart', 'fa-house-medical', 'fa-seedling']
      const iconValue = data.icon || 'fa-heart'
      formFieldsHtml = `
        <label>عنوان الحملة<input type="text" name="title" value="${data.title || ''}" required /></label>
        <label>القسم<input type="text" name="category" value="${data.category || ''}" placeholder="صحة، غذاء، تعليم" required /></label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem">
          <label>المبلغ المستهدف (ج.م)<input type="number" name="goal" value="${data.goal || ''}" required /></label>
          <label>المبلغ المجمع (ج.م)<input type="number" name="raised" value="${data.raised || 0}" /></label>
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
        <input type="hidden" name="image_url" class="cloudinary-url" value="${data.image || ''}" />
        <div class="upload-widget">
          <label>صورة الحملة</label>
          <div class="upload-drop-zone">
            <input type="file" accept="image/*,video/*" class="upload-file-input" />
            <div class="upload-placeholder" style="${data.image ? 'display:none' : ''}"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span></div>
            <img class="upload-preview" src="${data.image || ''}" style="${data.image ? 'display:block' : 'display:none'}" alt="معاينة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" value="${data.image || ''}" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>
        <label style="display:flex; align-items:center; gap:.5rem; cursor:pointer"><input type="checkbox" name="is_urgent" value="true" ${data.urgent === 'true' ? 'checked' : ''} /> حملة عاجلة؟</label>
        <label>الوصف<textarea name="description" rows="3">${data.description || ''}</textarea></label>
      `
    } else if (type === 'news') {
      formFieldsHtml = `
        <label>عنوان الخبر<input type="text" name="title" value="${data.title || ''}" required /></label>
        <label>القسم<input type="text" name="category" value="${data.category || ''}" placeholder="صحة، مجتمع، تعليم" required /></label>
        <input type="hidden" name="image_url" class="cloudinary-url" value="${data.image || ''}" />
        <div class="upload-widget">
          <label>صورة الخبر</label>
          <div class="upload-drop-zone">
            <input type="file" accept="image/*,video/*" class="upload-file-input" />
            <div class="upload-placeholder" style="${data.image ? 'display:none' : ''}"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span></div>
            <img class="upload-preview" src="${data.image || ''}" style="${data.image ? 'display:block' : 'display:none'}" alt="معاينة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" value="${data.image || ''}" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>
        <label>موجز الخبر (يظهر في القائمة)<input type="text" name="excerpt" value="${data.excerpt || ''}" required /></label>
        <label>محتوى الخبر بالكامل<textarea name="content" rows="6" required>${data.content || ''}</textarea></label>
      `
    } else if (type === 'events') {
      formFieldsHtml = `
        <label>اسم الفعالية<input type="text" name="title" value="${data.title || ''}" required /></label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem">
          <label>نوع الفعالية<input type="text" name="type" value="${data.type || ''}" placeholder="صحة، تعليم، مجتمع" required /></label>
          <label>المكان<input type="text" name="place" value="${data.place || ''}" required /></label>
        </div>
        <label>التاريخ والوقت<input type="datetime-local" name="event_date" value="${data.date || ''}" required /></label>
        <input type="hidden" name="image_url" class="cloudinary-url" value="${data.image || ''}" />
        <div class="upload-widget">
          <label>صورة الفعالية</label>
          <div class="upload-drop-zone">
            <input type="file" accept="image/*,video/*" class="upload-file-input" />
            <div class="upload-placeholder" style="${data.image ? 'display:none' : ''}"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span></div>
            <img class="upload-preview" src="${data.image || ''}" style="${data.image ? 'display:block' : 'display:none'}" alt="معاينة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" value="${data.image || ''}" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>
        <label>الوصف<textarea name="description" rows="3">${data.description || ''}</textarea></label>
      `
    } else if (type === 'stories') {
      formFieldsHtml = `
        <label>الاسم<input type="text" name="name" value="${data.name || ''}" required /></label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem">
          <label>الدور / الصفة<input type="text" name="role" value="${data.role || ''}" placeholder="مستفيد، متطوع" required /></label>
          <label>التقييم (1-5)<input type="number" name="rating" min="1" max="5" value="${data.rating || 5}" required /></label>
        </div>
        <label>القصة كاملة<textarea name="content" rows="4" required>${data.content || ''}</textarea></label>
      `
    } else if (type === 'jobs') {
      formFieldsHtml = `
        <label>المسمى الوظيفي<input type="text" name="title" value="${data.title || ''}" required /></label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem">
          <label>القسم<input type="text" name="department" value="${data.department || ''}" placeholder="إدارة، ميداني، طبي" required /></label>
          <label>نوع الوظيفة<input type="text" name="job_type" value="${data.type || ''}" placeholder="دوام كامل، دوام جزئي" required /></label>
        </div>
        <label>الموقع<input type="text" name="location" value="${data.location || 'كفر العنانية'}" required /></label>
        <label>وصف الوظيفة والمتطلبات<textarea name="description" rows="4" required>${data.description || ''}</textarea></label>
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
        const response = await fetch(actionUrl, {
          method: 'POST',
          body: new FormData(form)
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
    // 1. Empty table placeholders
    $$('.dash-table tbody').forEach(body => {
      if (body.children.length) return
      const columns = body.closest('table')?.querySelectorAll('th').length || 1
      body.innerHTML = `<tr class="dash-empty-row"><td colspan="${columns}"><i class="fa-regular fa-folder-open"></i><strong>لا توجد بيانات حتى الآن</strong><small>ستظهر العناصر الجديدة هنا تلقائيًا.</small></td></tr>`
    })

    // 2. Forms handling
    $$('.page-dashboard form[action^="/api/"]').forEach(form => {
      if (form.dataset.bound === 'true') return
      form.dataset.bound = 'true'
      form.addEventListener('submit', async event => {
        event.preventDefault()
        const message = form.dataset.confirm || (form.action.includes('/delete/') ? 'هل أنت متأكد من حذف هذا العنصر؟' : '')
        if (message && !(await window.confirmAction(message))) return
        const submit = $('button[type="submit"]', form), original = submit?.innerHTML
        if (submit) { submit.disabled = true; submit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جارٍ التنفيذ' }
        try {
          const response = await fetch(form.action,{ method:(form.method || 'POST').toUpperCase(), body:new FormData(form) })
          if (!response.ok) throw new Error('تعذر تنفيذ الطلب')
          toast('تم حفظ التغييرات بنجاح', 'success')
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

    // 6. Reveal elements
    $$('.reveal').forEach(el => revealObserver.observe(el))

    // 7. Sync theme icon
    updateThemeIcon()
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

  /* ─── Cloudinary Upload Widget ─── */
  $$('.upload-widget').forEach(widget => {
    const dropZone = widget.querySelector('.upload-drop-zone')
    const fileInput = widget.querySelector('.upload-file-input')
    const preview = widget.querySelector('.upload-preview')
    const placeholder = widget.querySelector('.upload-placeholder')
    const urlFallback = widget.querySelector('.upload-url-fallback')
    const hiddenInput = widget.closest('form')?.querySelector('.cloudinary-url')

    if (!dropZone || !fileInput || !hiddenInput) return

    // Create progress bar and status elements
    const progressWrap = document.createElement('div')
    progressWrap.className = 'upload-progress'
    progressWrap.innerHTML = '<div class="upload-progress-bar"></div>'
    dropZone.parentElement.insertBefore(progressWrap, dropZone.nextSibling)
    const progressBar = progressWrap.querySelector('.upload-progress-bar')

    const statusEl = document.createElement('div')
    statusEl.className = 'upload-status'
    progressWrap.parentElement.insertBefore(statusEl, progressWrap.nextSibling)

    // Drag and drop visual feedback
    ;['dragenter', 'dragover'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.add('dragover') }))
    ;['dragleave', 'drop'].forEach(ev => dropZone.addEventListener(ev, e => { e.preventDefault(); dropZone.classList.remove('dragover') }))

    dropZone.addEventListener('drop', e => {
      const files = e.dataTransfer?.files
      if (files?.length) {
        fileInput.files = files
        handleFileUpload(files[0])
      }
    })

    fileInput.addEventListener('change', () => {
      if (fileInput.files?.length) handleFileUpload(fileInput.files[0])
    })

    // URL fallback: when user types a URL directly
    if (urlFallback) {
      urlFallback.addEventListener('input', () => {
        hiddenInput.value = urlFallback.value.trim()
        if (urlFallback.value.trim()) {
          preview.src = urlFallback.value.trim()
          preview.style.display = 'block'
          placeholder.style.display = 'none'
        }
      })
    }

    async function handleFileUpload(file) {
      // Local preview
      const reader = new FileReader()
      reader.onload = e => {
        if (file.type.startsWith('image/')) {
          preview.src = e.target.result
          preview.style.display = 'block'
          placeholder.style.display = 'none'
        }
      }
      reader.readAsDataURL(file)

      // Show progress
      progressWrap.style.display = 'block'
      progressBar.style.width = '20%'
      statusEl.textContent = 'جارٍ رفع الصورة...'
      statusEl.className = 'upload-status'

      try {
        const formData = new FormData()
        formData.append('file', file)

        // Simulate progress
        progressBar.style.width = '60%'

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        progressBar.style.width = '90%'

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err.error || 'فشل رفع الملف')
        }

        const data = await response.json()
        progressBar.style.width = '100%'

        hiddenInput.value = data.url
        if (urlFallback) urlFallback.value = data.url

        statusEl.textContent = '✓ تم رفع الصورة بنجاح'
        statusEl.className = 'upload-status success'

        setTimeout(() => { progressWrap.style.display = 'none' }, 1500)
      } catch (err) {
        progressBar.style.width = '100%'
        progressBar.style.background = 'var(--coral)'
        statusEl.textContent = '✗ ' + (err.message || 'فشل رفع الملف')
        statusEl.className = 'upload-status error'
        setTimeout(() => {
          progressWrap.style.display = 'none'
          progressBar.style.width = '0'
          progressBar.style.background = ''
        }, 3000)
      }
    }
  })
})()

