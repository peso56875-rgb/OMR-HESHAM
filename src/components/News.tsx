import { icon, Layout, PageHero, cssBackground } from './shared'
import { defaultNews } from '../defaults'
import type { UserSession } from '../types'

function normalizeNews(n: any) {
  const isDoc = typeof n.id !== 'undefined'
  return {
    isDoc,
    id: isDoc ? n.id : null,
    title: isDoc ? n.title : n[0],
    cat: isDoc ? (n.category || 'أخبار') : n[1],
    excerpt: isDoc ? n.excerpt : n[2],
    ic: isDoc ? (n.icon || 'fa-newspaper') : n[3],
    date: isDoc
      ? new Date(n.publish_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
      : '١٢ يوليو ٢٠٢٦',
    img: isDoc ? String(n.image_url || '').trim() : '',
    href: isDoc ? `/news/${n.id}` : '#'
  }
}

export function News({ news = [], user }: { news?: any[], user?: UserSession }) {
  const items = (news.length > 0 ? news : defaultNews).map(normalizeNews)
  const [featured, ...rest] = items

  return <Layout user={user} title="الأخبار | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="يوميات الأثر" title={'كل خبرٍ هنا،<br/><em>وراءه قلبٌ أضاء.</em>'} text="تابع أنشطتنا ومبادراتنا لحظة بلحظة، وشاهد كيف يتحوّل عطاؤكم إلى قصصٍ حقيقية على الأرض." />

    <section class="news-pro-section section-pad">
      {/* ===== Featured story ===== */}
      {featured && (
        <a href={featured.href} class="news-featured reveal">
          <div class="news-featured-art" style={featured.img ? `${cssBackground(featured.img)}color:transparent;` : ''}>
            {!featured.img && icon(featured.ic)}
            <span class="news-featured-tag">{icon('fa-bolt')} أحدث خبر</span>
          </div>
          <div class="news-featured-body">
            <div class="news-meta">
              <span class="news-chip">{featured.cat}</span>
              <time>{icon('fa-calendar-day')} {featured.date}</time>
            </div>
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <span class="news-read-more">اقرأ القصة كاملة {icon('fa-arrow-left')}</span>
          </div>
        </a>
      )}

      {/* ===== All stories grid ===== */}
      <div class="news-pro-head">
        <h3>{icon('fa-newspaper')} كل الأخبار والمستجدات</h3>
        <span>{items.length} قصة من الميدان</span>
      </div>

      <div class="news-pro-grid">
        {rest.map((n) => (
          <article class="news-pro-card reveal">
            <a href={n.href} class="news-pro-art" style={n.img ? `${cssBackground(n.img)}color:transparent;` : ''}>
              {!n.img && icon(n.ic)}
              <span class="news-chip on-art">{n.cat}</span>
            </a>
            <div class="news-pro-body">
              <time>{icon('fa-calendar-day')} {n.date}</time>
              <h4>{n.title}</h4>
              <p>{n.excerpt}</p>
              <a href={n.href} class="news-pro-link">اقرأ المزيد {icon('fa-arrow-left')}</a>
            </div>
          </article>
        ))}
      </div>

      {/* ===== Bottom CTA ===== */}
      <div class="news-pro-cta reveal">
        <div class="news-pro-cta-icon">{icon('fa-bell')}</div>
        <div>
          <h3>لا يفوتك جديد المؤسسة</h3>
          <p>تابعنا باستمرار لتعرف أين يصل عطاؤك وكيف يصنع الفرق في حياة الناس.</p>
        </div>
        <a class="primary-btn" href="/donate">كن جزءًا من القصة {icon('fa-heart')}</a>
      </div>
    </section>
  </Layout>
}

export function NewsDetail({ n, user }: { n: any, user?: UserSession }) {
  const date = new Date(n.publish_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
  const wordCount = String(n.content || '').split(/\s+/).filter(Boolean).length
  const readMinutes = Math.max(1, Math.round(wordCount / 200))
  const img = String(n.image_url || '').trim()

  return <Layout user={user} title={`${n.title} | مؤسسة الدكتور عمر هشام`}>
    {/* ===== Article hero ===== */}
    <section class="news-detail-hero">
      <div class="news-detail-hero-inner">
        <a href="/news" class="news-detail-back">{icon('fa-arrow-right')} كل الأخبار</a>
        <span class="news-chip light">{n.category || 'أخبار'}</span>
        <h1>{n.title}</h1>
        <div class="news-detail-meta">
          <span>{icon('fa-calendar-day')} {date}</span>
          <i></i>
          <span>{icon('fa-clock')} قراءة في {readMinutes} {readMinutes === 1 ? 'دقيقة' : 'دقائق'}</span>
          <i></i>
          <span>{icon('fa-pen-nib')} فريق المؤسسة</span>
        </div>
      </div>
    </section>

    {/* ===== Article body ===== */}
    <article class="news-detail-article">
      {img && (
        <figure class="news-detail-figure reveal">
          <img src={img} alt={n.title} />
          <figcaption>{icon('fa-camera')} من تغطية المؤسسة الميدانية</figcaption>
        </figure>
      )}
      <div class="news-detail-content reveal">
        {n.content}
      </div>

      <div class="news-detail-footer">
        <div class="news-detail-share-note">
          <span class="news-detail-seal">{icon('fa-heart')}</span>
          <p><b>هذا الأثر صنعه أهل الخير أمثالكم</b><small>شارك القصة أو كن جزءًا من القصة القادمة</small></p>
        </div>
        <div class="news-detail-actions">
          <a class="primary-btn" href="/donate">ساهم في صناعة الأثر {icon('fa-hand-holding-heart')}</a>
          <a class="outline-btn" href="/news">{icon('fa-newspaper')} المزيد من الأخبار</a>
        </div>
      </div>
    </article>
  </Layout>
}
