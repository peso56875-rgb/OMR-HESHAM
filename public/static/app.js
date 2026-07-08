/* ============================================================
   Omar Hesham Foundation — Premium Interactions
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme (Dark/Light) ---------- */
  function initTheme() {
    const saved = localStorage.getItem('omrh_theme');
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
    
    const btn = $('#themeToggle');
    if (btn) {
      btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      btn.addEventListener('click', () => {
        const currentIsDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (currentIsDark) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('omrh_theme', 'light');
          btn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('omrh_theme', 'dark');
          btn.innerHTML = '<i class="fas fa-sun"></i>';
        }
      });
    }
  }
  initTheme();

  /* ---------- Preloader ---------- */
  function hidePreloader() {
    const pl = $('#preloader');
    if (pl) setTimeout(() => pl.classList.add('hide'), 500);
  }
  window.addEventListener('load', hidePreloader);
  // safety fallback
  setTimeout(hidePreloader, 2600);

  /* ---------- Nav scroll state ---------- */
  const nav = $('#mainNav');
  const toTop = $('#toTop');
  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 30);
    if (toTop) toTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- Mobile drawer ---------- */
  const drawer = $('#drawer');
  const openDrawer = () => drawer && drawer.classList.add('open');
  const closeDrawer = () => drawer && drawer.classList.remove('open');
  $('#burger') && $('#burger').addEventListener('click', () => { $('#burger').classList.toggle('open'); openDrawer(); });
  $('#burgerClose') && $('#burgerClose').addEventListener('click', closeDrawer);
  $$('[data-close]').forEach(el => el.addEventListener('click', closeDrawer));
  $$('.drawer-panel a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ---------- Dashboard sidebar toggle ---------- */
  const dashBurger = $('#dashBurger');
  if (dashBurger) {
    dashBurger.style.display = 'grid';
    dashBurger.addEventListener('click', () => $('#dashSide').classList.toggle('open'));
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal, .reveal-x, .reveal-scale');
  if (revealEls.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('in'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(el => io.observe(el));
    }
  }

  /* ---------- Count up ---------- */
  function animateCount(el) {
    const target = +el.dataset.count;
    if (reduce) { el.textContent = format(target); return; }
    const dur = 1800, start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = format(target);
    }
    requestAnimationFrame(tick);
  }
  function format(n) { return n.toLocaleString('ar-EG'); }
  const counters = $$('[data-count]');
  if (counters.length) {
    if (!('IntersectionObserver' in window)) counters.forEach(animateCount);
    else {
      const cio = new IntersectionObserver((ents) => {
        ents.forEach(en => { if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); } });
      }, { threshold: 0.5 });
      counters.forEach(c => cio.observe(c));
    }
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Hero portrait parallax (mouse) ---------- */
  const heroP = $('#heroPortrait');
  if (heroP && !reduce && window.matchMedia('(pointer:fine)').matches) {
    const cards = $$('.hp-card, .hp-badge-logo, .hp-sparkle', heroP);
    const img = $('.hp-img', heroP);
    heroP.addEventListener('mousemove', (e) => {
      const r = heroP.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / r.width;
      const dy = (e.clientY - r.top - r.height / 2) / r.height;
      if (img) img.style.transform = `translate(${dx * 18}px, ${dy * 18}px)`;
      cards.forEach((c, i) => { const f = (i + 1) * 8; c.style.transform = `translate(${dx * f}px, ${dy * f}px)`; });
    });
    heroP.addEventListener('mouseleave', () => {
      if (img) img.style.transform = '';
      cards.forEach(c => c.style.transform = '');
    });
  }

  /* ---------- Hero glow drift parallax on scroll ---------- */
  if (!reduce) {
    const glows = $$('.hero-glow');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      glows.forEach((g, i) => { g.style.transform = `translateY(${y * (0.06 + i * 0.02)}px)`; });
    }, { passive: true });
  }

  /* ---------- Accordion (FAQ) ---------- */
  $$('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.parentElement;
      const body = head.nextElementSibling;
      const open = item.classList.contains('open');
      // close siblings
      $$('.acc-item', item.parentElement).forEach(it => {
        it.classList.remove('open');
        const b = $('.acc-body', it); if (b) b.style.maxHeight = null;
      });
      if (!open) { item.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; }
    });
  });

  /* ---------- Tabs / filters ---------- */
  // Campaign + gallery filters
  function setupFilter(containerId, gridSelector) {
    const cont = $('#' + containerId);
    if (!cont) return;
    cont.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      $$('.tab', cont).forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const f = tab.dataset.filter;
      $$(gridSelector + ' [data-cat], ' + gridSelector + ' .g-item').forEach(item => {
        const cat = item.dataset.cat;
        const show = f === 'all' || !cat || cat === f;
        item.style.display = show ? '' : 'none';
      });
    });
  }
  setupFilter('campFilter', '#campGrid');
  setupFilter('galFilter', '.masonry');

  /* ---------- Donation amount selector ---------- */
  const amountGrid = $('#amountGrid');
  if (amountGrid) {
    const sumAmt = $('#sumAmt');
    const customAmt = $('#customAmt');
    function setSum(v) { if (sumAmt) sumAmt.textContent = (+v).toLocaleString('ar-EG'); }
    amountGrid.addEventListener('click', (e) => {
      const opt = e.target.closest('.amount-opt');
      if (!opt) return;
      $$('.amount-opt', amountGrid).forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      if (customAmt) customAmt.value = '';
      setSum(opt.dataset.amt);
    });
    if (customAmt) customAmt.addEventListener('input', () => {
      $$('.amount-opt', amountGrid).forEach(o => o.classList.remove('active'));
      setSum(customAmt.value || 0);
    });
  }
  // donate type + payment toggles
  $$('#donateType .tab').forEach(t => t.addEventListener('click', () => {
    $$('#donateType .tab').forEach(x => x.classList.remove('active')); t.classList.add('active');
  }));
  $$('.form-card .grid .amount-opt').forEach(o => o.addEventListener('click', function () {
    const sibs = this.parentElement.querySelectorAll('.amount-opt');
    sibs.forEach(s => s.classList.remove('active')); this.classList.add('active');
  }));

  /* ---------- Toast ---------- */
  function toast(msg) {
    let t = $('#toastBox');
    if (!t) {
      t = document.createElement('div'); t.id = 'toastBox';
      t.style.cssText = 'position:fixed;bottom:96px;left:50%;transform:translateX(-50%) translateY(20px);background:#0c1a2b;color:#fff;padding:1rem 1.6rem;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.3);z-index:9999;font-weight:700;opacity:0;transition:.4s;max-width:90vw;text-align:center;border:1px solid rgba(255,255,255,.12)';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
    clearTimeout(t._tid);
    t._tid = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, 3600);
  }
  window.__toast = toast;

  /* ---------- Forms (AJAX handling & Validation) ---------- */
  $$('form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      // Don't intercept dashboard CRUD forms that act as normal POST forms unless they are custom-handled.
      const action = form.getAttribute('action') || '';
      if (action.includes('/dashboard/') || action.includes('/api/campaigns/') || action.includes('/api/news/') || action.includes('/api/events/') || action.includes('/api/stories/') || action.includes('/api/jobs/') || action.includes('/api/newsletter/status/') || action.includes('/api/newsletter/delete/') || action.includes('/api/volunteers/status/') || action.includes('/api/donations/status/') || action.includes('/api/users/')) {
        return; // Let dashboard actions submit natively
      }
      
      e.preventDefault();

      // Client-side validations
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          toast('الرجاء إدخال بريد إلكتروني صالح ❌');
          return;
        }
      }

      const phoneInput = form.querySelector('input[type="tel"]');
      if (phoneInput && phoneInput.value) {
        const cleaned = phoneInput.value.replace(/[\s\-\(\)]/g, '');
        const phoneRegex = /^(\+?2)?01[0125]\d{8}$/;
        if (cleaned && !phoneRegex.test(cleaned)) {
          toast('الرجاء إدخال رقم هاتف مصري صالح (مثال: 01012345678) ❌');
          return;
        }
      }

      const amountInput = form.querySelector('input[name="amount"]');
      if (amountInput && amountInput.value) {
        const amount = Number(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
          toast('الرجاء إدخال مبلغ تبرع صالح أكبر من الصفر ❌');
          return;
        }
      }

      // Check required textareas/inputs manually for custom error message
      let hasError = false;
      const requiredInputs = $$( '[required]', form );
      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          input.classList.add('input-error');
          hasError = true;
        } else {
          input.classList.remove('input-error');
        }
      });

      if (hasError) {
        toast('يرجى ملء كافة الحقول المطلوبة ⚠️');
        return;
      }

      const btn = form.querySelector('button[type=submit]');
      const orig = btn ? btn.innerHTML : '';
      if (btn) {
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> جارٍ المعالجة...';
        btn.disabled = true;
      }

      try {
        // Collect form data
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
          data[key] = value;
        });

        // Special handling for donations amount check
        if (action.includes('/api/donations') && !data['amount']) {
          const activeOpt = $('.amount-opt.active');
          if (activeOpt) {
            data['amount'] = activeOpt.dataset.amt;
          } else if ($('#customAmt') && $('#customAmt').value) {
            data['amount'] = $('#customAmt').value;
          }
        }

        const isJson = !form.querySelector('input[type="file"]');
        const headers = {};
        let body;

        if (isJson) {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify(data);
        } else {
          body = formData;
        }

        const response = await fetch(action || window.location.pathname, {
          method: 'POST',
          headers,
          body
        });

        if (response.ok) {
          const result = await response.json().catch(() => ({}));
          toast(result.message || form.dataset.toast || 'تمت العملية بنجاح ✅');
          form.reset();
          
          // reset any custom selects/amount selectors
          $$('.amount-opt', form).forEach(o => o.classList.remove('active'));
          if ($('#sumAmt')) $('#sumAmt').textContent = '٠';

          const redirect = form.dataset.redirect;
          if (redirect) {
            setTimeout(() => {
              window.location.href = redirect;
            }, 1000);
          } else if (action.includes('/api/auth/login') || action.includes('/api/profile/update')) {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        } else {
          const err = await response.json().catch(() => ({}));
          toast(err.error || 'حدث خطأ ما، يرجى المحاولة مرة أخرى ❌');
        }
      } catch (err) {
        console.error('Submission error:', err);
        toast('خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً ❌');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = orig;
        }
      }
    });
  });


  /* ---------- Charts ---------- */
  function initCharts() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.font.family = 'Cairo, sans-serif';
    Chart.defaults.color = '#4b5b6e';
    const blue = '#1e88e5', emerald = '#43a047', gold = '#f57c00', crimson = '#e53935', grey = '#90a4ae';


    const spend = $('#spendChart');
    if (spend) new Chart(spend, {
      type: 'doughnut',
      data: { labels: ['الإغاثة والغذاء', 'الصحة', 'التعليم', 'كفالة الأيتام', 'الإدارة'],
        datasets: [{ data: [38, 26, 18, 12, 6], backgroundColor: [emerald, blue, gold, crimson, grey], borderWidth: 0, hoverOffset: 10 }] },
      options: { plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12, weight: 600 } } } }, cutout: '62%' }
    });

    const trend = $('#trendChart');
    if (trend) {
      const ctx = trend.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, 200);
      g.addColorStop(0, 'rgba(30,136,229,.35)'); g.addColorStop(1, 'rgba(30,136,229,0)');
      new Chart(trend, {
        type: 'line',
        data: { labels: ['٢٠١٩', '٢٠٢٠', '٢٠٢١', '٢٠٢٢', '٢٠٢٣', '٢٠٢٤'],
          datasets: [{ label: 'التبرّعات', data: [8, 14, 21, 29, 36, 43], borderColor: blue, backgroundColor: g, fill: true, tension: .4, borderWidth: 3, pointBackgroundColor: gold, pointRadius: 5 }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#eceadf' } }, x: { grid: { display: false } } } }
      });
    }
  }
  initCharts();
})();
