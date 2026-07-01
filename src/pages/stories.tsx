import { pageHero, ctaBanner } from '../layout'

export const storiesPage = (stories: any[] = []) => pageHero(
  'قصص النجاح',
  'خلف كل رقمٍ إنسانٌ وحياةٌ تغيّرت. هذه بعض القصص التي صنعها عطاؤكم.',
  'قصص النجاح'
) + `
<section class="section">
  <div class="wrap flow" style="gap:3rem">
    ${stories.filter((s: any) => s.image_url).slice(0, 3).map((s: any, i: number) => `
    <article class="news-card reveal" style="background:transparent;box-shadow:none;border:none">
      <div class="split" style="gap:clamp(20px,4vw,50px);${i % 2 ? 'direction:rtl' : ''}">
        <div class="frame" style="${i % 2 ? 'order:2' : ''}">
          <div class="frame-deco ${i % 2 ? 'fd2' : 'fd1'}"></div>
          <img src="${s.image_url}" alt="${s.name}" loading="lazy">
        </div>
        <div style="display:flex;flex-direction:column;justify-content:center;${i % 2 ? 'order:1' : ''}">
          <span class="chip chip-${['blue','gold','emerald'][i % 3]}" style="align-self:flex-start">${s.role}</span>
          <p class="lead" style="margin-top:1.4rem">${s.content}</p>
          <div class="who" style="margin-top:1.4rem;display:flex;gap:.8rem;align-items:center">
            <span class="avatar placeholder">${s.name.charAt(0)}</span>
            <b>${s.name}</b>
          </div>
        </div>
      </div>
    </article>`).join('')}
    ${stories.filter((s: any) => s.image_url).length === 0 ? '<p style="text-align:center;color:var(--muted);padding:2rem">جاري إضافة قصص مصورة قريباً.</p>' : ''}
  </div>
</section>

<!-- short testimonials wall -->
<section class="section bg-cream">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">كلمات من القلب</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">شهاداتُ <span class="text-grad-emerald">المستفيدين</span></h2>
    </div>
    <div class="grid cols-3">
      ${stories.filter((s: any) => !s.image_url).map((s: any, i: number) => `
      <figure class="testi reveal d${(i % 3) + 1}">
        <span class="quote-mark">”</span>
        <div class="stars" style="margin-bottom:.8rem">${'<i class="fas fa-star"></i>'.repeat(s.rating || 5)}</div>
        <p>${s.content}</p>
        <figcaption class="who"><span class="avatar placeholder">${s.name.charAt(0)}</span><span><b>${s.name}</b><span>${s.role}</span></span></figcaption>
      </figure>`).join('')}
      ${stories.filter((s: any) => !s.image_url).length === 0 ? '<p style="text-align:center;grid-column:1/-1;color:var(--muted);padding:2rem">لا توجد شهادات حالياً.</p>' : ''}
    </div>
  </div>
</section>

${ctaBanner()}
`
