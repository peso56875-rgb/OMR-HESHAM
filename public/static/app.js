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
    const i = $('#theme-toggle i')
    const themeColor = $('meta[name="theme-color"]')
    if (i) i.className = `fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`
    if (themeColor) themeColor.setAttribute('content', isDark ? '#071d1a' : '#f9f6ee')
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  }
  updateThemeIcon()
  $('#theme-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark')
    localStorage.setItem('omar-theme', document.body.classList.contains('dark') ? 'dark' : 'light')
    updateThemeIcon()
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

    // 4. Edit buttons
    $$('.edit-campaign-btn, .edit-news-btn, .edit-event-btn, .edit-story-btn, .edit-job-btn').forEach(btn => {
      if (btn.dataset.bound === 'true') return
      btn.dataset.bound = 'true'
      btn.addEventListener('click', function() {
        const type = this.classList.contains('edit-campaign-btn') ? 'campaigns'
          : this.classList.contains('edit-news-btn') ? 'news'
          : this.classList.contains('edit-event-btn') ? 'events'
          : this.classList.contains('edit-story-btn') ? 'stories' : 'jobs'

        const form = document.querySelector(`form[action^="/api/${type}/"]`)
        if (!form) return
        form.action = `/api/${type}/edit/${this.dataset.id}`

        if (type === 'campaigns') {
          form.querySelector('input[name="title"]').value = this.dataset.title || ''
          form.querySelector('input[name="category"]').value = this.dataset.category || ''
          form.querySelector('input[name="goal"]').value = this.dataset.goal || ''
          const iconInput = form.querySelector('input[name="icon"]')
          if (iconInput) {
            iconInput.value = this.dataset.icon || 'fa-heart'
            const badge = document.getElementById('icon-preview-badge')
            if (badge) badge.innerHTML = `<i class="fa-solid ${iconInput.value}"></i>`
          }
          const description = form.querySelector('textarea[name="description"]')
          if (description) description.value = this.dataset.description || ''
          const urgent = form.querySelector('input[name="is_urgent"]')
          if (urgent) urgent.checked = this.dataset.urgent === 'true'
        } else if (type === 'news') {
          form.querySelector('input[name="title"]').value = this.dataset.title || ''
          form.querySelector('input[name="category"]').value = this.dataset.category || ''
          form.querySelector('input[name="excerpt"]').value = this.dataset.excerpt || ''
          const content = form.querySelector('textarea[name="content"]')
          if (content) content.value = this.dataset.content || ''
        } else if (type === 'events') {
          form.querySelector('input[name="title"]').value = this.dataset.title || ''
          form.querySelector('input[name="type"]').value = this.dataset.type || ''
          form.querySelector('input[name="place"]').value = this.dataset.place || ''
          if (this.dataset.date) form.querySelector('input[name="event_date"]').value = this.dataset.date
          const description = form.querySelector('textarea[name="description"]')
          if (description) description.value = this.dataset.description || ''
        } else if (type === 'stories') {
          form.querySelector('input[name="name"]').value = this.dataset.name || ''
          form.querySelector('input[name="role"]').value = this.dataset.role || ''
          form.querySelector('input[name="rating"]').value = this.dataset.rating || 5
          const content = form.querySelector('textarea[name="content"]')
          if (content) content.value = this.dataset.content || ''
        } else if (type === 'jobs') {
          form.querySelector('input[name="title"]').value = this.dataset.title || ''
          form.querySelector('input[name="department"]').value = this.dataset.department || ''
          form.querySelector('input[name="job_type"]').value = this.dataset.type || ''
          form.querySelector('input[name="location"]').value = this.dataset.location || ''
          const description = form.querySelector('textarea[name="description"]')
          if (description) description.value = this.dataset.description || ''
          const active = form.querySelector('input[name="is_active"]')
          if (active) active.checked = this.dataset.active === 'true'
        }

        const imgInput = form.querySelector('.cloudinary-url')
        if (imgInput) imgInput.value = this.dataset.image || ''
        const fallbackInput = form.querySelector('.upload-url-fallback')
        if (fallbackInput) fallbackInput.value = this.dataset.image || ''
        const preview = form.querySelector('.upload-preview')
        const placeholder = form.querySelector('.upload-placeholder')
        if (this.dataset.image && preview && placeholder) {
          preview.src = this.dataset.image
          preview.style.display = 'block'
          placeholder.style.display = 'none'
        }

        const titleHeader = form.querySelector('h3')
        if (titleHeader) titleHeader.textContent = 'حفظ التعديلات'
        form.scrollIntoView({ behavior: 'smooth' })
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

