import { pageHero, ctaBanner } from '../layout'

export const achievementsPage = (stats: any = { total_donors: 0, total_campaigns: 0, total_volunteers: 0 }) => pageHero(
  'مسيرة من الإنجازات',
  'كل عامٍ نقطع خطوةً أقرب نحو رؤيتنا. هذه محطّاتٌ مضيئة في رحلة عطائنا المستمرة.',
  'الإنجازات'
) + `
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

<section class="section">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">الخط الزمني</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">رحلتنا <span class="text-grad-brand">عامًا بعد عام</span></h2>
    </div>
    <div class="timeline">
      <p style="text-align:center;color:var(--muted);padding:2rem">جاري إعداد التقرير السنوي للإنجازات.</p>
    </div>
  </div>
</section>

<!-- Awards -->
<section class="section bg-cream">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">تقديرٌ واعتماد</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">جوائز <span class="text-grad-gold">وشهادات</span></h2>
    </div>
    <div class="grid cols-4">
      ${[
        { i: 'fa-award', t: 'جائزة التميّز الإنساني', y: '٢٠٢٤' },
        { i: 'fa-certificate', t: 'اعتماد الشفافية المالية', y: '٢٠٢٣' },
        { i: 'fa-medal', t: 'درع العمل التطوّعي', y: '٢٠٢٢' },
        { i: 'fa-ribbon', t: 'شهادة الجودة المؤسسية', y: '٢٠٢١' },
      ].map((a, idx) => `
      <article class="card reveal d${idx + 1}" style="text-align:center">
        <div class="card-icon ic-gold" style="margin-inline:auto"><i class="fas ${a.i}"></i></div>
        <h3 style="font-size:1.08rem">${a.t}</h3>
        <p style="color:var(--gold-700);font-weight:800">${a.y}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

${ctaBanner()}
`
