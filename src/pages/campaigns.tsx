import { pageHero, ctaBanner } from '../layout'

const pct = (r: number, g: number) => Math.min(100, Math.round((r / g) * 100))
const money = (n: number) => n.toLocaleString('ar-EG')

export const campaignsPage = (campaigns: any[] = []) => pageHero(
  'حملاتنا الإنسانية',
  'اختر القضية التي تُلامس قلبك، وكن سببًا في تغيير حياة. كل حملة موثّقة وكل تبرّع يصل بأمانة.',
  'الحملات'
) + `
<section class="section">
  <div class="wrap">
    <!-- filter tabs -->
    <div class="center" style="margin-bottom:2.6rem">
      <div class="tabs" id="campFilter" role="tablist">
        <button class="tab active" data-filter="all">الكل</button>
        <button class="tab" data-filter="صحة">صحة</button>
        <button class="tab" data-filter="غذاء">غذاء</button>
        <button class="tab" data-filter="تعليم">تعليم</button>
        <button class="tab" data-filter="مياه">مياه</button>
        <button class="tab" data-filter="كساء">كساء</button>
        <button class="tab" data-filter="إسكان">إسكان</button>
      </div>
    </div>

    <div class="grid cols-3" id="campGrid">
      ${campaigns.length ? campaigns.map((c: any, i: number) => `
      <article class="campaign reveal d${(i % 3) + 1}" data-cat="${c.category}">
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
      </article>`).join('') : '<p style="text-align:center;grid-column:1/-1;color:var(--muted);padding:2rem">لا توجد حملات متاحة حالياً.</p>'}
    </div>
  </div>
</section>
${ctaBanner()}
`
