import { pageHero } from '../layout'

export const newsPage = (news: any[] = []) => pageHero(
  'أخبار المؤسسة',
  'تابع آخر مستجدّات حملاتنا وفعالياتنا وأثرنا الإنساني على أرض الواقع.',
  'الأخبار'
) + `
<section class="section">
  <div class="wrap">
    ${news.length > 0 ? `
    <!-- featured -->
    <article class="news-card reveal" style="margin-bottom:3rem">
      <div class="split" style="gap:0;align-items:stretch">
        <div class="news-media" style="aspect-ratio:auto"><img src="${news[0].image_url || '/static/img/placeholder.jpg'}" alt="${news[0].title}" style="height:100%;min-height:320px"></div>
        <div style="padding:clamp(1.6rem,3vw,2.6rem);display:flex;flex-direction:column;justify-content:center">
          <span class="chip chip-gold" style="align-self:flex-start;margin-bottom:1rem">خبر مميّز · ${news[0].category}</span>
          <h2 class="h-lg">${news[0].title}</h2>
          <p class="lead" style="margin:1rem 0">${news[0].excerpt}</p>
          <div class="news-date" style="margin-bottom:1rem"><span><i class="fas fa-calendar"></i> ${news[0].publish_date}</span><span><i class="fas fa-user"></i> فريق التحرير</span></div>
          <a href="/news/${news[0].id}" class="btn btn-primary magnetic" style="align-self:flex-start"><i class="fas fa-book-open"></i> اقرأ المقال كاملاً</a>
        </div>
      </div>
    </article>

    <div class="grid cols-3">
      ${news.slice(1).map((n: any, i: number) => `
      <article class="news-card reveal d${(i % 3) + 1}">
        <div class="news-media"><img src="${n.image_url || '/static/img/placeholder.jpg'}" alt="${n.title}" loading="lazy"><span class="chip chip-blue" style="position:absolute;top:1rem;inset-inline-start:1rem">${n.category}</span></div>
        <div class="news-body">
          <div class="news-date"><span><i class="fas fa-calendar"></i> ${n.publish_date}</span></div>
          <h3>${n.title}</h3>
          <p style="color:var(--muted);font-size:.92rem">${n.excerpt}</p>
          <a href="/news/${n.id}" class="card-link">اقرأ المزيد <i class="fas fa-arrow-left"></i></a>
        </div>
      </article>`).join('')}
    </div>

    <div class="center" style="margin-top:3rem">
      <button class="btn btn-ghost btn-lg">تحميل المزيد <i class="fas fa-rotate"></i></button>
    </div>
    ` : '<p style="text-align:center;color:var(--muted);padding:4rem 0;font-size:1.1rem">لا توجد أخبار منشورة حالياً. يرجى العودة لاحقاً لمعرفة جديد المؤسسة.</p>'}
  </div>
</section>
`
