import { ctaBanner, pageHero } from '../layout'

const fallbackImage = '/static/img/og-image.png'

const esc = (value: any) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;')

const dateLabel = (value: any) => {
  if (!value) return 'موعد يعلن لاحقًا'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return 'موعد يعلن لاحقًا'
  return dt.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}

const money = (value: any) => Number(value || 0).toLocaleString('ar-EG')

export const newsDetailPage = (item: any) => {
  const title = esc(item.title)
  const excerpt = esc(item.excerpt || item.content || '')
  const content = esc(item.content || item.excerpt || '')
  const image = esc(item.image_url || fallbackImage)

  return pageHero(title, excerpt, 'الأخبار') + `
<section class="section">
  <div class="wrap detail-wrap">
    <article class="detail-article">
      <img class="detail-cover" src="${image}" alt="${title}" loading="eager">
      <div class="detail-meta">
        <span class="chip chip-blue"><i class="fas fa-newspaper"></i> ${esc(item.category || 'خبر')}</span>
        <span class="chip"><i class="fas fa-calendar"></i> ${dateLabel(item.publish_date || item.created_at)}</span>
      </div>
      <div class="detail-content">
        ${content.split('\n').filter(Boolean).map((p: string) => `<p>${p}</p>`).join('')}
      </div>
      <div class="detail-actions">
        <a href="/news" class="btn btn-ghost"><i class="fas fa-arrow-right"></i> العودة للأخبار</a>
        <a href="/donate" class="btn btn-gold"><i class="fas fa-hand-holding-heart"></i> ساهم في الأثر</a>
      </div>
    </article>
  </div>
</section>`
}

export const campaignDetailPage = (item: any) => {
  const title = esc(item.title)
  const desc = esc(item.description || '')
  const image = esc(item.image_url || fallbackImage)
  const goal = Number(item.goal || 0)
  const raised = Number(item.raised || 0)
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0

  return pageHero(title, desc, 'الحملات') + `
<section class="section">
  <div class="wrap detail-wrap">
    <article class="detail-article">
      <img class="detail-cover" src="${image}" alt="${title}" loading="eager">
      <div class="detail-meta">
        <span class="chip chip-blue"><i class="fas fa-tag"></i> ${esc(item.category || 'حملة')}</span>
        ${item.is_urgent ? '<span class="chip chip-crimson"><i class="fas fa-bolt"></i> عاجلة</span>' : ''}
      </div>
      <div class="detail-content"><p>${desc}</p></div>
      <div class="detail-progress">
        <div class="campaign-meta">
          <span class="raised">تم جمع ${money(raised)} ج.م</span>
          <span class="goal">الهدف ${money(goal)} ج.م</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:var(--grad-emerald)"></div></div>
        <strong>${pct}%</strong>
      </div>
      <div class="detail-actions">
        <a href="/campaigns" class="btn btn-ghost"><i class="fas fa-arrow-right"></i> كل الحملات</a>
        <a href="/donate?campaign=${esc(item.id)}" class="btn btn-gold btn-lg"><i class="fas fa-heart"></i> تبرع لهذه الحملة</a>
      </div>
    </article>
  </div>
</section>
${ctaBanner()}`
}

export const eventDetailPage = (item: any) => {
  const title = esc(item.title)
  const desc = esc(item.description || '')
  const image = esc(item.image_url || fallbackImage)

  return pageHero(title, desc, 'الفعاليات') + `
<section class="section">
  <div class="wrap detail-wrap">
    <article class="detail-article">
      <img class="detail-cover" src="${image}" alt="${title}" loading="eager">
      <div class="detail-meta">
        <span class="chip chip-blue"><i class="fas fa-calendar-check"></i> ${esc(item.type || 'فعالية')}</span>
        <span class="chip"><i class="fas fa-calendar"></i> ${dateLabel(item.event_date)}</span>
        <span class="chip"><i class="fas fa-location-dot"></i> ${esc(item.place || 'المكان يعلن لاحقًا')}</span>
      </div>
      <div class="detail-content"><p>${desc}</p></div>
      <div class="detail-actions">
        <a href="/events" class="btn btn-ghost"><i class="fas fa-arrow-right"></i> كل الفعاليات</a>
        <a href="/contact" class="btn btn-primary"><i class="fas fa-envelope"></i> تواصل للحجز أو الاستفسار</a>
      </div>
    </article>
  </div>
</section>`
}
