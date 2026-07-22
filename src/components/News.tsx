import { icon, Layout, PageHero } from './shared'
import { defaultNews } from '../defaults'
import type { UserSession } from '../types'

export function News({ news = [], user }: { news?: any[], user?: UserSession }) {
  const renderNews = news.length > 0 ? news : defaultNews

  return <Layout user={user} title="الأخبار | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="يوميات الأثر" title={'كل خبر هنا،<br/><em>وراءه قلبٌ أضاء.</em>'} text="تابع أنشطتنا ومبادراتنا، وشاهد كيف يتحول العطاء إلى قصص حقيقية على الأرض." />
    <section class="listing-section section-pad">
      <div class="news-grid news-all">
        {renderNews.map((n, i) => {
          const isDoc = typeof n.id !== 'undefined'
          const title = isDoc ? n.title : n[0]
          const cat = isDoc ? n.category : n[1]
          const excerpt = isDoc ? n.excerpt : n[2]
          const ic = isDoc ? (n.icon || 'fa-newspaper') : n[3]
          const date = isDoc ? new Date(n.publish_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : '١٢ يوليو ٢٠٢٦'
          const img = isDoc ? n.image_url : null

          return <article class={`news-card reveal ${i === 0 ? 'featured' : ''}`}>
            <div class="news-art" style={img ? `background-image:url(${img});background-size:cover;background-position:center;color:transparent;` : ''}>
              {!img && icon(ic)}
              <span style={img ? 'background:rgba(12,74,63,0.8);color:white' : ''}>{cat}</span>
            </div>
            <div>
              <time>{date}</time>
              <h3>{title}</h3>
              <p>{excerpt}</p>
              <a href={isDoc ? `/news/${n.id}` : '#'}>اقرأ القصة {icon('fa-arrow-left')}</a>
            </div>
          </article>
        })}
      </div>
    </section>
  </Layout>
}

export function NewsDetail({ n, user }: { n: any, user?: UserSession }) {
  const date = new Date(n.publish_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
  return <Layout user={user} title={`${n.title} | مؤسسة الدكتور عمر هشام`}>
    <section class="page-hero" style="min-height:50vh; display:flex; flex-direction:column; justify-content:center">
      <a href="/news" class="back-link" style="margin-bottom:1.5rem">{icon('fa-arrow-right')} كل الأخبار</a>
      <span class="category-chip" style="margin:0 auto">{n.category || 'أخبار'}</span>
      <h1 style="font-size:clamp(1.8rem, 4vw, 3rem); margin: 1rem 0">{n.title}</h1>
      <time style="color:var(--muted); font-size:.9rem">{date}</time>
    </section>
    <section class="section-pad" style="max-width:800px; margin:0 auto; padding-top:0">
      {n.image_url && <img src={n.image_url} alt={n.title} style="width:100%; border-radius:16px; margin-bottom:2rem; object-fit:cover; max-height:400px; box-shadow:var(--shadow);" />}
      <div style="font-size:1.15rem; line-height:1.8; color:var(--text); white-space:pre-wrap">
        {n.content}
      </div>
    </section>
  </Layout>
}
