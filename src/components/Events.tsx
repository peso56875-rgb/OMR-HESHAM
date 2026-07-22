import { icon, Layout, PageHero } from './shared'
import type { UserSession } from '../types'

export function Events({ events = [], user }: { events?: any[], user?: UserSession }) {
  const renderEvents = events.length > 0 ? events : [
    { title: 'قافلة طبية شاملة', event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), place: 'مستشفى كفر العنانية', type: 'صحة' },
    { title: 'تكريم أوائل الطلبة', event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(), place: 'قاعة المؤسسة', type: 'تعليم' },
    { title: 'يوم المتطوعين المفتوح', event_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(), place: 'كفر العنانية', type: 'مجتمع' }
  ]
  return <Layout user={user} title="الفعاليات | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="الفعاليات" title={'نلتقي على الخير،<br/><em>فتكبر الدائرة.</em>'} text="مواعيد قادمة ومساحات مفتوحة للمشاركة وصناعة الأثر معًا." />
    <section class="event-list section-pad">
      {renderEvents.map(e => {
        const dateObj = new Date(e.event_date)
        const day = dateObj.getDate()
        const month = dateObj.toLocaleDateString('ar-EG', { month: 'short' })

        return <article class="event-card reveal">
          <time><b>{day}</b><span>{month}</span></time>
          <div>
            <span class="category-chip">{e.type}</span>
            <h3>{e.title}</h3>
            <p>{icon('fa-location-dot')} {e.place}</p>
          </div>
          <a href={e.id ? `/events/${e.id}` : '#'}>التفاصيل {icon('fa-arrow-left')}</a>
        </article>
      })}
    </section>
  </Layout>
}

export function EventDetail({ e, user }: { e: any, user?: UserSession }) {
  const dateObj = new Date(e.event_date)
  const dateStr = dateObj.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  return <Layout user={user} title={`${e.title} | مؤسسة الدكتور عمر هشام`}>
    <section class="page-hero" style="min-height:50vh; display:flex; flex-direction:column; justify-content:center">
      <a href="/events" class="back-link" style="margin-bottom:1.5rem">{icon('fa-arrow-right')} كل الفعاليات</a>
      <span class="category-chip" style="margin:0 auto">{e.type || 'فعالية'}</span>
      <h1 style="font-size:clamp(1.8rem, 4vw, 3rem); margin: 1rem 0">{e.title}</h1>
      <div style="display:flex; gap:1.5rem; justify-content:center; flex-wrap:wrap; color:var(--muted); font-size:.95rem">
        <span>{icon('fa-calendar-day')} {dateStr}</span>
        <span>{icon('fa-clock')} {timeStr}</span>
        {e.place && <span>{icon('fa-location-dot')} {e.place}</span>}
      </div>
    </section>
    <section class="section-pad" style="max-width:800px; margin:0 auto; padding-top:0">
      {e.image_url && <img src={e.image_url} alt={e.title} style="width:100%; border-radius:16px; margin-bottom:2rem; object-fit:cover; max-height:400px; box-shadow:var(--shadow);" />}
      {e.description && <div style="font-size:1.15rem; line-height:1.8; color:var(--text); white-space:pre-wrap">{e.description}</div>}
      <div style="margin-top:2rem; text-align:center">
        <a class="primary-btn" href="/volunteers">شارك في الفعالية {icon('fa-hand-holding-hand')}</a>
      </div>
    </section>
  </Layout>
}
