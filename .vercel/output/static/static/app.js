(() => {
  const $ = (s, root = document) => root.querySelector(s)
  const $$ = (s, root = document) => [...root.querySelectorAll(s)]

  const toast = (message, type = 'success') => {
    const box = $('#toast')
    if (!box) return
    const isError = type === 'error'
    const icon = $('.toast-icon i', box)
    const title = $('.toast-content strong', box)
    const text = $('.toast-message', box)

    clearTimeout(window.__toastTimer)
    box.classList.remove('show', 'is-success', 'is-error')
    box.classList.add(isError ? 'is-error' : 'is-success')
    if (icon) icon.className = `fa-solid ${isError ? 'fa-xmark' : 'fa-check'}`
    if (title) title.textContent = isError ? 'حدث خطأ' : 'تم بنجاح'
    if (text) text.textContent = message

    void box.offsetWidth
    box.classList.add('show')
    window.__toastTimer = setTimeout(() => box.classList.remove('show'), 2800)
  }

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

  $$('.mobile-bottom a').forEach(link => {
    const href = link.getAttribute('href')
    const isCurrent = href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)
    if (isCurrent) link.setAttribute('aria-current', 'page')
  })

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        revealObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' })
  $$('.reveal').forEach(el => revealObserver.observe(el))

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
      toast('تم نسخ الرقم بنجاح')
      const original = button.innerHTML
      button.innerHTML = '<i class="fa-solid fa-check"></i> تم النسخ'
      setTimeout(() => { button.innerHTML = original }, 1800)
    } catch {
      toast('حدد الرقم وانسخه يدويًا', 'error')
    }
  }))

  $$('.toast-trigger').forEach(button => button.addEventListener('click', () => toast(button.dataset.message)))

  $$('.amount-picks button').forEach(button => button.addEventListener('click', () => {
    $$('.amount-picks button').forEach(item => item.classList.remove('active'))
    button.classList.add('active')
    const input = $('#amount-input')
    if (input) input.value = button.dataset.amount
  }))

  $$('.ajax-form').forEach(form => form.addEventListener('submit', async e => {
    e.preventDefault()
    if (!form.checkValidity()) return form.reportValidity()
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
      if (!response.ok) throw new Error(result.message)
      toast(result.message || 'تم استلام طلبك بنجاح')
      if (!form.classList.contains('donation-form')) form.reset()
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
})()
