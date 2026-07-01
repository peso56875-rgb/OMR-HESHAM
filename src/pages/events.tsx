import { pageHero, ctaBanner } from '../layout'

export const eventsPage = (events: any[] = []) => pageHero(
  'الفعاليات والمناسبات',
  'انضمّ إلينا في فعالياتنا القادمة — قوافل، ملتقيات، وحفلات خيرية تصنع الفرق معًا.',
  'الفعاليات'
) + `
<section class="section">
  <div class="wrap">
    <div class="split" style="align-items:start">
      <!-- featured event -->
      <div class="reveal-x">
        ${events.length > 0 ? `
        <article class="campaign">
          <div class="campaign-media"><img src="${events[0].image_url || '/static/img/placeholder.jpg'}" alt="${events[0].title}"><span class="chip chip-gold tag">فعالية مميّزة</span></div>
          <div class="campaign-body">
            <h3 class="h-lg">${events[0].title}</h3>
            <p>${events[0].description}</p>
            <div style="display:flex;gap:1.4rem;flex-wrap:wrap;margin:.6rem 0">
              <span class="chip chip-blue"><i class="fas fa-calendar"></i> ${new Date(events[0].event_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span class="chip"><i class="fas fa-location-dot"></i> ${events[0].location}</span>
            </div>
            <a href="#" class="btn btn-primary magnetic"><i class="fas fa-ticket"></i> احجز مقعدك</a>
          </div>
        </article>
        ` : '<p style="color:var(--muted)">لا توجد فعاليات مميزة حالياً.</p>'}
      </div>

      <!-- upcoming list -->
      <div class="reveal d1">
        <h2 class="h-lg" style="margin-bottom:1.4rem">الفعاليات القادمة</h2>
        <div class="flow">
          ${events.length ? events.map((e: any) => {
            const date = new Date(e.event_date);
            const d = date.getDate();
            const m = date.toLocaleDateString('ar-EG', { month: 'short' });
            return `
            <div class="event-row">
              <div class="event-date"><div class="d">${d}</div><div class="m">${m}</div></div>
              <div style="flex:1">
                <span class="chip chip-blue" style="margin-bottom:.4rem">فعالية</span>
                <h3 style="font-size:1.08rem">${e.title}</h3>
                <p style="color:var(--muted);font-size:.88rem"><i class="fas fa-location-dot"></i> ${e.location}</p>
              </div>
              <a href="#" class="btn btn-ghost btn-sm">التفاصيل</a>
            </div>`
          }).join('') : '<p style="text-align:center;color:var(--muted);padding:2rem">لا توجد فعاليات قادمة حالياً.</p>'}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- past events -->
<section class="section bg-cream">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">من أرشيف فعالياتنا</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">لحظاتٌ <span class="text-grad-emerald">لا تُنسى</span></h2>
    </div>
    <div class="grid cols-3">
      <p style="text-align:center;grid-column:1/-1;color:var(--muted);padding:2rem">قريباً سنشارككم أرشيف الفعاليات السابقة.</p>
    </div>
  </div>
</section>

${ctaBanner()}
`
