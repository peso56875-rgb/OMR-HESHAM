import { pageHero, ctaBanner } from '../layout'

export const transparencyPage = () => pageHero(
  'الشفافية المالية',
  'نؤمن أن ثقتكم أمانة. هنا نعرض بوضوحٍ كامل كيف نُدير ونصرف كل جنيهٍ تتبرّعون به.',
  'الشفافية المالية'
) + `
<section class="section">
  <div class="wrap">
    <!-- KPI cards -->
    <div class="grid cols-4" style="margin-bottom:3rem">
      ${[
        { i: 'fa-sack-dollar', c: 'ic-emerald', n: '٠', s: 'ج.م', l: 'إجمالي التبرّعات (سيتم تحديثه)' },
        { i: 'fa-hand-holding-heart', c: 'ic-blue', n: '٠', s: '%', l: 'تُصرف على البرامج' },
        { i: 'fa-receipt', c: 'ic-gold', n: '٠', s: '', l: 'تقرير دوري منشور' },
        { i: 'fa-user-check', c: 'ic-crimson', n: '١٠٠', s: '%', l: 'مراجعة مستقلة' },
      ].map((k, i) => `
      <div class="kpi reveal d${i + 1}">
        <div class="kpi-top"><div class="kpi-ic ${k.c}"><i class="fas ${k.i}"></i></div></div>
        <div class="kpi-num">${k.n}<span style="font-size:1rem;color:var(--muted)"> ${k.s}</span></div>
        <div class="kpi-lbl">${k.l}</div>
      </div>`).join('')}
    </div>

    <div class="split" style="align-items:start">
      <!-- chart -->
      <div class="panel reveal-x">
        <h3>توزيع الإنفاق حسب البرامج</h3>
        <canvas id="spendChart" height="260"></canvas>
      </div>
      <!-- breakdown -->
      <div class="panel reveal d1">
        <h3>تفصيل أوجه الصرف</h3>
        ${[
          { l: 'الإغاثة والغذاء', p: 38, c: 'var(--grad-emerald)' },
          { l: 'الرعاية الصحية', p: 26, c: 'var(--grad-blue)' },
          { l: 'التعليم والمنح', p: 18, c: 'var(--grad-gold)' },
          { l: 'كفالة الأيتام', p: 12, c: 'linear-gradient(135deg,#ff5252,#b71c1c)' },
          { l: 'التشغيل والإدارة', p: 6, c: 'linear-gradient(135deg,#90a4ae,#546e7a)' },
        ].map(m => `
        <div style="padding:.7rem 0">
          <div style="display:flex;justify-content:space-between"><b>${m.l}</b><b>${m.p}%</b></div>
          <div class="bar-track"><div class="bar-fill" style="width:${m.p}%;background:${m.c}"></div></div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<!-- yearly trend + reports -->
<section class="section bg-cream">
  <div class="wrap">
    <div class="panel reveal" style="margin-bottom:3rem">
      <h3>نمو التبرّعات على مدار السنوات (مليون ج.م)</h3>
      <canvas id="trendChart" height="110"></canvas>
    </div>

    <div class="sec-head center" style="margin-bottom:2rem">
      <h2 class="h-lg reveal">التقارير المالية القابلة للتنزيل</h2>
    </div>
    <div class="grid cols-3">
      ${[
        { y: '٢٠٢٤', s: 'مراجَع ومعتمد' },
        { y: '٢٠٢٣', s: 'مراجَع ومعتمد' },
        { y: '٢٠٢٢', s: 'مراجَع ومعتمد' },
      ].map((r, i) => `
      <article class="job-card reveal d${i + 1}">
        <div style="display:flex;gap:1rem;align-items:center">
          <div class="card-icon ic-blue" style="margin:0"><i class="fas fa-file-pdf"></i></div>
          <div><b style="font-size:1.1rem">التقرير السنوي ${r.y}</b><br><span class="chip chip-emerald" style="margin-top:.3rem"><i class="fas fa-circle-check"></i> ${r.s}</span></div>
        </div>
        <a href="#" class="btn btn-ghost btn-sm"><i class="fas fa-download"></i> تنزيل</a>
      </article>`).join('')}
    </div>
  </div>
</section>

${ctaBanner()}
`
