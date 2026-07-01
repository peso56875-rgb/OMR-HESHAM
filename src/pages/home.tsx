import { ctaBanner } from '../layout'
import { programs, img } from '../data'

const pct = (r: number, g: number) => Math.min(100, Math.round((r / g) * 100))
const money = (n: number) => n.toLocaleString('ar-EG')

export const home = ({ campaigns = [], news = [], stories = [], stats = { total_donors: 0, total_campaigns: 0, total_volunteers: 0 }, partners = [] }: any = {}) => `
<!-- ============ HERO ============ -->
<section class="hero">
  <div class="hero-bg-grid"></div>
  <div class="hero-glow g1"></div>
  <div class="hero-glow g2"></div>
  <div class="hero-glow g3"></div>
  <div class="wrap-wide">
    <div class="hero-copy">
      <span class="hero-badge reveal"><span class="dot"></span> العطاء بإيمان · الإحسان للجميع</span>
      <h1 class="display reveal d1">نزرع الأمل،<br>ونصنع <span class="accent">حياةً كريمة</span></h1>
      <p class="lead reveal d2">مؤسسة الدكتور عمر هشام الخيرية — رسالة إنسانية تمتد لتُغيث المحتاج، وتُداوي المريض، وتُعلّم النشء، وتُمكّن الأسر. معًا نحوّل التبرّع إلى أثرٍ يدوم.</p>
      <div class="hero-actions reveal d3">
        <a href="/donate" class="btn btn-gold btn-lg magnetic"><i class="fas fa-hand-holding-heart"></i> ابدأ عطاءك</a>
        <a href="/about" class="btn btn-outline-light btn-lg"><i class="fas fa-circle-play"></i> تعرّف علينا</a>
      </div>
      <div class="hero-stats reveal d4">
        <div class="hero-stat"><b>${stats.total_donors || '—'}</b><span>مستفيد</span></div>
        <div class="hero-stat"><b>${stats.total_campaigns || '—'}</b><span>حملة إنسانية</span></div>
        <div class="hero-stat"><b>${stats.total_volunteers || '—'}</b><span>متطوّع</span></div>
      </div>
    </div>

    <!-- Professional Logo Showcase -->
    <div class="hero-portrait reveal-scale d2" id="heroPortrait">
      <div class="hp-orbit o1"></div>
      <div class="hp-orbit o2"></div>
      <div class="hp-disc" data-tilt>
        <img class="hp-img" src="/static/img/logo.png" alt="شعار مؤسسة الدكتور عمر هشام الخيرية" style="object-fit:contain;padding:2rem;border-radius:50%;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px)">
        <div class="hp-ground"></div>
      </div>
      <i class="fas fa-star fa-lg hp-sparkle" style="top:8%;inset-inline-start:18%"></i>
      <i class="fas fa-star hp-sparkle" style="bottom:30%;inset-inline-start:-2%;animation-delay:.7s"></i>
      <i class="fas fa-heart hp-sparkle" style="top:30%;inset-inline-end:6%;color:#ff5252;animation-delay:1.1s"></i>
      <div class="hp-card c1"><i class="fas fa-mosque ic-emerald"></i><div><b>العطاء بإيمان</b><small>الإحسان للجميع</small></div></div>
      <div class="hp-card c2"><i class="fas fa-hands-holding-heart ic-crimson"></i><div><b>مؤسسة خيرية</b><small>مرخّصة ومعتمدة</small></div></div>
      <div class="hp-card c3"><i class="fas fa-seedling ic-emerald"></i><div><b>صدقة جارية</b><small>أثر يدوم</small></div></div>
    </div>
  </div>
  <div class="wave-divider">
    <svg viewBox="0 0 1440 90" preserveAspectRatio="none"><path fill="#fbfaf6" d="M0,40 C360,90 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,90 L0,90 Z"></path></svg>
  </div>
</section>

<!-- ============ PARTNERS MARQUEE ============ -->
<section class="section-tight">
  <div class="wrap center">
    <p class="eyebrow" style="justify-content:center;margin-bottom:1.6rem">شركاء النجاح والثقة</p>
    <div class="marquee">
      <div class="marquee-track">
        ${partners.length ? [...partners, ...partners].map((p: any) => `<span class="partner"><i class="fas fa-handshake"></i> ${p.name || p}</span>`).join('') : '<span class="partner">شركاؤنا الداعمون</span>'}
      </div>
    </div>
  </div>
</section>

<!-- ============ STATS STRIP ============ -->
<section class="section-tight">
  <div class="wrap">
    <div class="stats-strip reveal">
      <div class="grid cols-4">
        <div class="stat-item">
          <i class="fas fa-hand-holding-heart"></i>
          <div class="num"><span data-count="${stats.total_donors || 0}">0</span>+</div>
          <div class="lbl">مستفيد ومستفيدة</div>
        </div>
        <div class="stat-item">
          <i class="fas fa-bullhorn"></i>
          <div class="num"><span data-count="${stats.total_campaigns || 0}">0</span>+</div>
          <div class="lbl">حملة إنسانية</div>
        </div>
        <div class="stat-item">
          <i class="fas fa-hands-helping"></i>
          <div class="num"><span data-count="${stats.total_volunteers || 0}">0</span>+</div>
          <div class="lbl">متطوّع نشط</div>
        </div>
        <div class="stat-item">
          <i class="fas fa-globe"></i>
          <div class="num"><span data-count="14">0</span></div>
          <div class="lbl">محافظة نخدمها</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============ PROGRAMS ============ -->
<section class="section bg-aurora">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">مجالات عملنا</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">برامج تُلامس <span class="text-grad-brand">كل احتياج إنساني</span></h2>
      <p class="lead reveal d2">نعمل عبر برامج متكاملة تُغطي أولويات الإنسان: الغذاء، والصحة، والتعليم، والمأوى، حتى نصل بالخير إلى من يستحقه.</p>
    </div>
    <div class="grid cols-3">
      ${programs.map((p, i) => `
      <article class="card reveal d${(i % 3) + 1}">
        <div class="card-icon ${p.cls}"><i class="fas ${p.icon}"></i></div>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <a href="${p.href}" class="card-link">اعرف المزيد <i class="fas fa-arrow-left"></i></a>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- ============ ABOUT SPLIT ============ -->
<section class="section bg-cream">
  <div class="wrap">
    <div class="split">
      <div class="reveal-x">
        <div class="frame">
          <div class="frame-deco fd1"></div>
          <div class="frame-deco fd2"></div>
          <img src="${img('photo-1593113630400-ea4288922497', 700, 560)}" alt="فريق المؤسسة">
        </div>
      </div>
      <div class="reveal d1">
        <span class="eyebrow">من نحن</span>
        <h2 class="h-xl" style="margin:.8rem 0 1rem">رسالةٌ إنسانية<br>تنبع من <span class="text-grad-emerald">القلب</span></h2>
        <p class="lead" style="margin-bottom:1.6rem">انطلقت المؤسسة برؤية الدكتور عمر هشام لتكون جسرًا بين المُحسن والمحتاج، تعمل بأمانةٍ وشفافيةٍ لإحداث أثرٍ حقيقي ومستدام في حياة الناس.</p>
        <ul class="feature-list">
          <li><span class="fi ic-emerald"><i class="fas fa-bullseye"></i></span><div><b>رؤية واضحة</b><p>مجتمع متكافل لا يُترك فيه محتاجٌ دون عون.</p></div></li>
          <li><span class="fi ic-blue"><i class="fas fa-route"></i></span><div><b>منهج مؤسسي</b><p>إجراءات دقيقة تضمن وصول الدعم لمستحقيه.</p></div></li>
          <li><span class="fi ic-gold"><i class="fas fa-award"></i></span><div><b>أثر موثّق</b><p>تقارير وأرقام تعكس واقع ما نُنجزه على الأرض.</p></div></li>
        </ul>
        <a href="/about" class="btn btn-primary magnetic" style="margin-top:1.4rem"><i class="fas fa-arrow-left"></i> قصتنا كاملة</a>
      </div>
    </div>
  </div>
</section>

<!-- ============ CAMPAIGNS ============ -->
<section class="section">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">حملاتنا النشطة</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">كن جزءًا من <span class="text-grad-gold">قصة عطاء</span></h2>
      <p class="lead reveal d2">اختر الحملة التي تُلامس قلبك، وتابع أثر تبرّعك خطوةً بخطوة حتى يصل إلى مستحقيه.</p>
    </div>
    <div class="grid cols-3">
      ${campaigns.length ? campaigns.slice(0, 3).map((c: any, i: number) => `
      <article class="campaign reveal d${i + 1}">
        <div class="campaign-media">
          <img src="${c.image_url || '/static/img/placeholder.jpg'}" alt="${c.title}" loading="lazy">
          <span class="chip chip-blue tag">${c.category}</span>
          ${c.is_urgent ? '<span class="urgency"><i class="fas fa-bolt"></i> عاجلة</span>' : ''}
        </div>
        <div class="campaign-body">
          <h3>${c.title}</h3>
          <p>${c.description}</p>
          <div class="progress"><span style="width:${pct(c.raised || 0, c.goal)}%"></span></div>
          <div class="campaign-meta">
            <span class="raised">جُمع ${money(c.raised || 0)} ج.م</span>
            <span class="goal">الهدف ${money(c.goal)}</span>
          </div>
          <div class="campaign-foot">
            <span class="pct">${pct(c.raised || 0, c.goal)}%</span>
            <a href="/donate?campaign=${c.id}" class="btn btn-primary btn-sm"><i class="fas fa-heart"></i> تبرّع</a>
          </div>
        </div>
      </article>`).join('') : '<p style="text-align:center;grid-column:1/-1;color:var(--muted);padding:2rem">جاري إطلاق حملاتنا الجديدة.</p>'}
    </div>
    <div class="center" style="margin-top:2.6rem">
      <a href="/campaigns" class="btn btn-ghost btn-lg">عرض كل الحملات <i class="fas fa-arrow-left"></i></a>
    </div>
  </div>
</section>

<!-- ============ IMPACT / HOW IT WORKS ============ -->
<section class="section bg-sand">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">كيف نعمل</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">من تبرّعك إلى <span class="text-grad-brand">الأثر</span> في ٤ خطوات</h2>
    </div>
    <div class="grid cols-4">
      ${[
        { ic: 'fa-hand-holding-dollar', t: 'تتبرّع', d: 'تختار الحملة وتتبرّع بأمان عبر وسائل دفع متعددة.' },
        { ic: 'fa-magnifying-glass-chart', t: 'ندرس الحالات', d: 'نفحص ونتحقّق من المستحقين بدقّة وشفافية.' },
        { ic: 'fa-truck-fast', t: 'نُوصِل الدعم', d: 'فرقنا الميدانية تُسلّم المساعدات يدًا بيد.' },
        { ic: 'fa-file-circle-check', t: 'تتابع الأثر', d: 'يصلك تقرير موثّق بأثر تبرّعك على أرض الواقع.' },
      ].map((s, i) => `
      <div class="card reveal d${i + 1}" style="text-align:center">
        <div class="card-icon ic-blue" style="margin-inline:auto;position:relative">
          <i class="fas ${s.ic}"></i>
          <span style="position:absolute;top:-10px;inset-inline-end:-10px;width:28px;height:28px;border-radius:50%;background:var(--grad-gold);color:#0c1a2b;display:grid;place-items:center;font-size:.85rem;font-weight:900">${['١','٢','٣','٤'][i]}</span>
        </div>
        <h3>${s.t}</h3><p>${s.d}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<!-- ============ TESTIMONIALS ============ -->
<section class="section">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">قصص من الميدان</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">حياةٌ <span class="text-grad-emerald">تغيّرت</span> بفضل عطائكم</h2>
    </div>
    <div class="grid cols-3">
      ${stories.length ? stories.map((s: any, i: number) => `
      <figure class="testi reveal d${i + 1}">
        <span class="quote-mark">”</span>
        <div class="stars" style="margin-bottom:.8rem">${'<i class="fas fa-star"></i>'.repeat(s.rating || 5)}</div>
        <p>${s.content}</p>
        <figcaption class="who">
          <span class="avatar placeholder">${s.name.charAt(0)}</span>
          <span><b>${s.name}</b><span>${s.role}</span></span>
        </figcaption>
      </figure>`).join('') : '<p style="text-align:center;grid-column:1/-1;color:var(--muted);padding:2rem">قريباً سنشارككم أثر العطاء.</p>'}
    </div>
    <div class="center" style="margin-top:2.4rem"><a href="/success-stories" class="btn btn-ghost">المزيد من القصص <i class="fas fa-arrow-left"></i></a></div>
  </div>
</section>

<!-- ============ NEWS PREVIEW ============ -->
<section class="section bg-cream">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">آخر الأخبار</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">جديد <span class="text-grad-blue">المؤسسة</span></h2>
    </div>
    <div class="grid cols-3">
      ${news.length ? news.slice(0, 3).map((n: any, i: number) => `
      <article class="news-card reveal d${i + 1}">
        <div class="news-media"><img src="${n.image_url || '/static/img/placeholder.jpg'}" alt="${n.title}" loading="lazy"><span class="chip chip-gold" style="position:absolute;top:1rem;inset-inline-start:1rem">${n.category}</span></div>
        <div class="news-body">
          <div class="news-date"><span><i class="fas fa-calendar"></i> ${n.publish_date}</span></div>
          <h3>${n.title}</h3>
          <p style="color:var(--muted);font-size:.92rem">${n.excerpt}</p>
          <a href="/news/${n.id}" class="card-link">اقرأ المزيد <i class="fas fa-arrow-left"></i></a>
        </div>
      </article>`).join('') : '<p style="text-align:center;grid-column:1/-1;color:var(--muted);padding:2rem">لا توجد أخبار متاحة حالياً.</p>'}
    </div>
  </div>
</section>

${ctaBanner()}
`
