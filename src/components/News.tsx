import { icon, Layout, cssBackground } from './shared'
import { defaultNews } from '../defaults'
import type { UserSession } from '../types'

function normalizeNews(n: any, fallbackIdx: number = 0) {
  const isDoc = typeof n.id !== 'undefined'
  const title = isDoc ? n.title : n[0]
  const cat = isDoc ? (n.category || 'أخبار عامة') : (n[1] || 'أخبار عامة')
  const excerpt = isDoc ? (n.excerpt || n.summary || '') : (n[2] || '')
  const ic = isDoc ? (n.icon || 'fa-newspaper') : (n[3] || 'fa-newspaper')
  const img = isDoc ? String(n.image_url || '').trim() : (n[4] || '')
  const rawDate = isDoc ? (n.publish_date || n.created_at) : (n[5] || '2026-09-01')
  const id = isDoc ? n.id : `default-news-${fallbackIdx}`

  let formattedDate = '١٥ سبتمبر ٢٠٢٦'
  try {
    if (rawDate) {
      formattedDate = new Date(rawDate).toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
  } catch (e) {}

  const wordCount = (excerpt + ' ' + (n.content || '')).split(/\s+/).filter(Boolean).length
  const readMinutes = Math.max(1, Math.min(8, Math.round(wordCount / 50) || 2))

  return {
    isDoc,
    id,
    title,
    cat,
    excerpt,
    ic,
    img,
    date: formattedDate,
    rawDate,
    readMinutes,
    href: `/news/${id}`
  }
}

export function News({ news = [], user }: { news?: any[], user?: UserSession }) {
  const rawList = news.length > 0 ? news : defaultNews
  const items = rawList.map((item, idx) => normalizeNews(item, idx))
  const [featured, ...rest] = items

  // Collect distinct categories
  const categories = Array.from(new Set(items.map(item => item.cat))).filter(Boolean)

  return <Layout user={user} title="الأخبار والمستجدات | مؤسسة الدكتور عمر هشام الخيرية" description="تابع أحدث أخبار ومبادرات مؤسسة الدكتور عمر هشام الخيرية لحظة بلحظة، وشاهد كيف يتحول عطاؤكم إلى واقع ملموس وأثر باقٍ.">
    {/* ===== Toast Notification for sharing ===== */}
    <div id="news-toast" class="news-toast" role="status" aria-live="polite">
      <i class="fa-solid fa-circle-check"></i>
      <span id="news-toast-msg">تم نسخ رابط الخبر بنجاح!</span>
    </div>

    {/* ===== Modern Sleek Newsroom Header (No bulky PageHero) ===== */}
    <div class="newsroom-header-wrap">
      <div class="newsroom-header-container">
        {/* Top Breadcrumb & Live Tag */}
        <div class="newsroom-top-bar">
          <nav class="newsroom-breadcrumb" aria-label="مسار التصفح">
            <a href="/">{icon('fa-house')} الرئيسية</a>
            <i class="fa-solid fa-chevron-left"></i>
            <span class="current-crumb">المركز الإعلامي</span>
          </nav>
          <div class="newsroom-live-badge">
            <span class="pulse-dot"></span>
            <span>تغطية ميدانية مستمرة</span>
          </div>
        </div>

        {/* Header Title & Intro Row */}
        <div class="newsroom-intro-row">
          <div class="newsroom-title-col">
            <span class="newsroom-eyebrow">
              <i class="fa-solid fa-newspaper"></i> نبض الميدان والأثر
            </span>
            <h1 class="newsroom-main-title">الأخبار والمستجدات</h1>
            <p class="newsroom-subtitle">
              توثيق حيّ ولحظي لكل يدٍ تمتد بالخير، ولكل أثرٍ تصنعونه في حياة الأسر والمرضى وطلاب العلم.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div class="newsroom-stats-col">
            <div class="newsroom-stat-card">
              <div class="stat-icon-wrap emerald">
                <i class="fa-solid fa-bullhorn"></i>
              </div>
              <div class="stat-info">
                <strong>{items.length}</strong>
                <span>قصة ومبادرة موثقة</span>
              </div>
            </div>
            <div class="newsroom-stat-card">
              <div class="stat-icon-wrap gold">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <div class="stat-info">
                <strong>100%</strong>
                <span>شفافية ومصداقية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breaking / Latest Ticker Bar */}
        {featured && (
          <div class="newsroom-ticker">
            <div class="ticker-badge">
              <i class="fa-solid fa-bolt"></i>
              <span>أحدث خبر</span>
            </div>
            <a href={featured.href} class="ticker-text">
              <span class="ticker-cat">[{featured.cat}]</span>
              <span class="ticker-title">{featured.title}</span>
            </a>
            <a href={featured.href} class="ticker-action" title="قراءة الخبر">
              <span>قراءة</span> {icon('fa-arrow-left')}
            </a>
          </div>
        )}
      </div>
    </div>

    {/* ===== Main Interactive Content Area ===== */}
    <main class="newsroom-main-content">
      <div class="newsroom-container">

        {/* ===== Filter & Search Toolbar ===== */}
        <div class="news-toolbar" id="news-toolbar">
          <div class="news-search-box">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              id="news-search-input"
              class="news-search-input"
              placeholder="ابحث في الأخبار، الحملات، المبادرات، المستشفيات..."
              aria-label="ابحث في الأخبار والمستجدات"
              autocomplete="off"
            />
            <button type="button" id="news-search-clear" class="news-search-clear" aria-label="مسح البحث" style="display:none">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* View Mode Toggle (Grid / List) */}
          <div class="news-view-toggle" role="group" aria-label="طريقة العرض">
            <button type="button" class="view-btn active" data-view="grid" title="عرض شبكي كروت">
              <i class="fa-solid fa-border-all"></i>
              <span class="btn-tooltip">شبكة</span>
            </button>
            <button type="button" class="view-btn" data-view="list" title="عرض أفقي مفصل">
              <i class="fa-solid fa-list-ul"></i>
              <span class="btn-tooltip">قائمة</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div class="news-categories-nav" role="tablist" aria-label="تصنيفات الأخبار">
          <button type="button" class="news-cat-pill active" data-category="all" role="tab" aria-selected="true">
            <span>الكل</span>
            <small class="pill-count">{items.length}</small>
          </button>
          {categories.map(cat => {
            const count = items.filter(it => it.cat === cat).length
            return (
              <button type="button" class="news-cat-pill" data-category={cat} role="tab" aria-selected="false">
                <span>{cat}</span>
                <small class="pill-count">{count}</small>
              </button>
            )
          })}
        </div>

        {/* Active Filters & Results Counter */}
        <div class="news-results-status" id="news-results-status">
          <span id="news-count-label">عرض جميع الأخبار ({items.length})</span>
          <button type="button" id="news-reset-filters" class="news-reset-btn" style="display:none">
            <i class="fa-solid fa-rotate-left"></i> إلغاء التصفية
          </button>
        </div>

        {/* ===== Featured Story Card (Magazine Layout) ===== */}
        {featured && (
          <div class="featured-story-wrapper" id="featured-story-block" data-category={featured.cat} data-title={featured.title} data-excerpt={featured.excerpt}>
            <article class="featured-story-card">
              <a href={featured.href} class="featured-story-media" style={featured.img ? `${cssBackground(featured.img)}color:transparent;` : ''}>
                {!featured.img && (
                  <div class="featured-art-fallback">
                    <i class={`fa-solid ${featured.ic || 'fa-newspaper'}`}></i>
                  </div>
                )}
                <div class="featured-badges">
                  <span class="featured-highlight-badge">
                    <i class="fa-solid fa-star"></i> تغطية خاصة
                  </span>
                  <span class="featured-category-badge">{featured.cat}</span>
                </div>
              </a>

              <div class="featured-story-body">
                <div class="story-meta-row">
                  <time class="story-time">
                    <i class="fa-regular fa-calendar-check"></i> {featured.date}
                  </time>
                  <span class="story-read-time">
                    <i class="fa-regular fa-clock"></i> {featured.readMinutes} دقيقة قراءة
                  </span>
                </div>

                <h2 class="featured-story-title">
                  <a href={featured.href}>{featured.title}</a>
                </h2>

                <p class="featured-story-excerpt">{featured.excerpt}</p>

                <div class="featured-story-actions">
                  <a href={featured.href} class="featured-read-btn">
                    <span>اقرأ القصة كاملة</span>
                    <i class="fa-solid fa-arrow-left"></i>
                  </a>

                  <div class="story-share-actions">
                    <button type="button" class="btn-share-icon copy-link-btn" data-url={featured.href} data-title={featured.title} title="نسخ رابط الخبر">
                      <i class="fa-solid fa-link"></i>
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(featured.title + ' ' + (typeof window !== 'undefined' ? window.location.origin : '') + featured.href)}`} target="_blank" rel="noopener noreferrer" class="btn-share-icon whatsapp" title="مشاركة على واتساب">
                      <i class="fa-brands fa-whatsapp"></i>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </div>
        )}

        {/* ===== News Articles Grid / List ===== */}
        <div class="news-stream-grid" id="news-stream-grid" data-active-view="grid">
          {items.map((item, idx) => (
            <article
              class="news-stream-card"
              data-category={item.cat}
              data-title={item.title}
              data-excerpt={item.excerpt}
              data-index={idx}
            >
              <a href={item.href} class="news-card-visual" style={item.img ? `${cssBackground(item.img)}color:transparent;` : ''}>
                {!item.img && (
                  <div class="card-art-fallback">
                    <i class={`fa-solid ${item.ic || 'fa-newspaper'}`}></i>
                  </div>
                )}
                <span class="card-category-badge">{item.cat}</span>
                <span class="card-read-badge">
                  <i class="fa-regular fa-clock"></i> {item.readMinutes} د
                </span>
              </a>

              <div class="news-card-body">
                <div class="news-card-meta">
                  <time>
                    <i class="fa-regular fa-calendar-day"></i> {item.date}
                  </time>
                </div>

                <h3 class="news-card-title">
                  <a href={item.href}>{item.title}</a>
                </h3>

                <p class="news-card-excerpt">{item.excerpt}</p>

                <div class="news-card-footer">
                  <a href={item.href} class="news-card-link">
                    <span>قراءة الخبر</span>
                    <i class="fa-solid fa-arrow-left"></i>
                  </a>

                  <div class="card-mini-actions">
                    <button
                      type="button"
                      class="card-share-btn copy-link-btn"
                      data-url={item.href}
                      data-title={item.title}
                      title="نسخ الرابط"
                      aria-label="نسخ الرابط"
                    >
                      <i class="fa-solid fa-share-nodes"></i>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ===== Empty Search State ===== */}
        <div class="news-empty-state" id="news-empty-state" style="display:none">
          <div class="empty-icon-wrap">
            <i class="fa-solid fa-magnifying-glass-arrow-right"></i>
          </div>
          <h3>لم نعثر على أخبار مطابقة</h3>
          <p>لم نجد أي مقالات أو أخبار تتطابق مع معايير البحث الحالية. جرّب كلمات أخرى أو قم بإعادة ضبط التصنيف.</p>
          <button type="button" id="btn-empty-reset" class="btn-empty-reset">
            <i class="fa-solid fa-rotate-left"></i> عرض جميع الأخبار
          </button>
        </div>

        {/* ===== Load More / Pagination Button ===== */}
        <div class="news-pagination-wrap" id="news-pagination-wrap">
          <button type="button" class="btn-load-more" id="btn-load-more">
            <i class="fa-solid fa-angles-down"></i>
            <span>عرض المزيد من الأخبار</span>
          </button>
        </div>

        {/* ===== High-end Newsletter & Social Updates Box ===== */}
        <section class="news-connect-section">
          <div class="news-connect-card">
            <div class="connect-visual-ornament"></div>
            <div class="connect-content">
              <span class="connect-eyebrow">
                <i class="fa-solid fa-bell"></i> ابقَ على اتصال بالخير
              </span>
              <h3>لا تفوّت أثرًا جديدًا تصنعه معنا</h3>
              <p>اشترك في نشرة المؤسسة البريدية الشهرية لتصلك تقارير الميدان المصورة وقصص المستفيدين أولاً بأول.</p>

              <form class="news-sub-form ajax-form" data-endpoint="/api/newsletter">
                <div class="news-sub-input-wrap">
                  <i class="fa-regular fa-envelope input-icon"></i>
                  <input
                    type="email"
                    name="email"
                    placeholder="أدخل بريدك الإلكتروني هنا..."
                    required
                    aria-label="البريد الإلكتروني للنشرة"
                  />
                  <button type="submit" class="btn-subscribe">
                    <span>اشتراك</span>
                    <i class="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </form>

              <div class="connect-socials">
                <span>أو تابعنا عبر منصات التواصل:</span>
                <div class="social-links-pill">
                  <a href="https://www.facebook.com/share/1Dj3HrELjY/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="فيسبوك"><i class="fa-brands fa-facebook-f"></i> فيسبوك</a>
                  <a href="https://www.instagram.com/dr.omarheshamfoundation?igsh=MWZiMXRjOTh2bm4zZA==" target="_blank" rel="noopener noreferrer" aria-label="إنستجرام"><i class="fa-brands fa-instagram"></i> إنستجرام</a>
                  <a href="https://www.tiktok.com/@dr.omarfoundation?_r=1&_t=ZS-98FEn5WIdE4" target="_blank" rel="noopener noreferrer" aria-label="تيك توك"><i class="fa-brands fa-tiktok"></i> تيك توك</a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>

    {/* ===== Client Interactive Script ===== */}
    <script dangerouslySetInnerHTML={{ __html: `
      document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('news-search-input');
        const clearBtn = document.getElementById('news-search-clear');
        const catPills = document.querySelectorAll('.news-cat-pill');
        const countLabel = document.getElementById('news-count-label');
        const resetBtn = document.getElementById('news-reset-filters');
        const emptyState = document.getElementById('news-empty-state');
        const streamGrid = document.getElementById('news-stream-grid');
        const featuredStory = document.getElementById('featured-story-block');
        const viewBtns = document.querySelectorAll('.view-btn');
        const loadMoreBtn = document.getElementById('btn-load-more');
        const paginationWrap = document.getElementById('news-pagination-wrap');
        const toast = document.getElementById('news-toast');
        const toastMsg = document.getElementById('news-toast-msg');

        let activeCategory = 'all';
        let searchQuery = '';
        const pageSize = 6;
        let visibleCount = pageSize;

        // Toast helper
        function showToast(msg) {
          if (!toast) return;
          if (toastMsg) toastMsg.textContent = msg;
          toast.classList.add('show');
          setTimeout(() => { toast.classList.remove('show'); }, 3000);
        }

        // Copy link handler
        document.addEventListener('click', function(e) {
          const btn = e.target.closest('.copy-link-btn');
          if (!btn) return;
          e.preventDefault();
          const path = btn.getAttribute('data-url') || window.location.pathname;
          const fullUrl = window.location.origin + path;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fullUrl).then(() => {
              showToast('تم نسخ رابط الخبر بنجاح!');
            }).catch(() => {
              fallbackCopy(fullUrl);
            });
          } else {
            fallbackCopy(fullUrl);
          }
        });

        function fallbackCopy(text) {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            showToast('تم نسخ رابط الخبر بنجاح!');
          } catch (err) {
            showToast('الرابط: ' + text);
          }
          document.body.removeChild(ta);
        }

        // Filter and Search Logic
        function applyFilter() {
          const cards = streamGrid ? streamGrid.querySelectorAll('.news-stream-card') : [];
          let matchedCount = 0;

          // Process Featured Story
          if (featuredStory) {
            const featCat = featuredStory.getAttribute('data-category') || '';
            const featTitle = (featuredStory.getAttribute('data-title') || '').toLowerCase();
            const featExcerpt = (featuredStory.getAttribute('data-excerpt') || '').toLowerCase();

            const catMatch = activeCategory === 'all' || featCat === activeCategory;
            const searchMatch = !searchQuery || featTitle.includes(searchQuery) || featExcerpt.includes(searchQuery);

            if (catMatch && searchMatch) {
              featuredStory.style.display = '';
              matchedCount++;
            } else {
              featuredStory.style.display = 'none';
            }
          }

          let streamMatched = 0;
          cards.forEach((card) => {
            const cardCat = card.getAttribute('data-category') || '';
            const cardTitle = (card.getAttribute('data-title') || '').toLowerCase();
            const cardExcerpt = (card.getAttribute('data-excerpt') || '').toLowerCase();

            const catMatch = activeCategory === 'all' || cardCat === activeCategory;
            const searchMatch = !searchQuery || cardTitle.includes(searchQuery) || cardExcerpt.includes(searchQuery);

            if (catMatch && searchMatch) {
              streamMatched++;
              matchedCount++;
              if (streamMatched <= visibleCount) {
                card.style.display = '';
              } else {
                card.style.display = 'none';
              }
            } else {
              card.style.display = 'none';
            }
          });

          // Empty state handling
          if (matchedCount === 0) {
            if (emptyState) emptyState.style.display = 'block';
            if (paginationWrap) paginationWrap.style.display = 'none';
          } else {
            if (emptyState) emptyState.style.display = 'none';
            if (paginationWrap) {
              paginationWrap.style.display = (streamMatched > visibleCount) ? 'flex' : 'none';
            }
          }

          // Update count status
          if (countLabel) {
            if (activeCategory === 'all' && !searchQuery) {
              countLabel.textContent = 'عرض جميع الأخبار (' + matchedCount + ')';
            } else {
              countLabel.textContent = 'تم العثور على ' + matchedCount + ' خبر مطابق';
            }
          }

          // Reset button visibility
          if (resetBtn) {
            resetBtn.style.display = (activeCategory !== 'all' || searchQuery) ? 'inline-flex' : 'none';
          }
        }

        // Search Input Listener
        if (searchInput) {
          searchInput.addEventListener('input', function(e) {
            searchQuery = e.target.value.trim().toLowerCase();
            visibleCount = pageSize; // reset pagination on new search
            if (clearBtn) clearBtn.style.display = searchQuery ? 'block' : 'none';
            applyFilter();
          });
        }

        if (clearBtn) {
          clearBtn.addEventListener('click', function() {
            if (searchInput) {
              searchInput.value = '';
              searchQuery = '';
            }
            clearBtn.style.display = 'none';
            applyFilter();
            if (searchInput) searchInput.focus();
          });
        }

        // Category Pills Listener
        catPills.forEach(pill => {
          pill.addEventListener('click', function() {
            catPills.forEach(p => {
              p.classList.remove('active');
              p.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            activeCategory = this.getAttribute('data-category') || 'all';
            visibleCount = pageSize;
            applyFilter();
          });
        });

        // Reset Filter handler
        function resetAllFilters() {
          activeCategory = 'all';
          searchQuery = '';
          visibleCount = pageSize;
          if (searchInput) searchInput.value = '';
          if (clearBtn) clearBtn.style.display = 'none';
          catPills.forEach(p => {
            if (p.getAttribute('data-category') === 'all') {
              p.classList.add('active');
              p.setAttribute('aria-selected', 'true');
            } else {
              p.classList.remove('active');
              p.setAttribute('aria-selected', 'false');
            }
          });
          applyFilter();
        }

        if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
        const emptyResetBtn = document.getElementById('btn-empty-reset');
        if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAllFilters);

        // View Mode Switcher (Grid / List)
        viewBtns.forEach(btn => {
          btn.addEventListener('click', function() {
            const targetView = this.getAttribute('data-view');
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (streamGrid) {
              streamGrid.setAttribute('data-active-view', targetView);
            }
          });
        });

        // Load More Handler
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', function() {
            visibleCount += pageSize;
            applyFilter();
          });
        }

        // Initialize view
        applyFilter();
      });
    ` }} />
  </Layout>
}

export function NewsDetail({ n, user }: { n: any, user?: UserSession }) {
  const date = new Date(n.publish_date || '2026-09-01').toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  const wordCount = String(n.content || n.summary || '').split(/\s+/).filter(Boolean).length
  const readMinutes = Math.max(1, Math.round(wordCount / 180) || 2)
  const img = String(n.image_url || '').trim()

  return <Layout user={user} title={`${n.title} | مؤسسة الدكتور عمر هشام الخيرية`} description={n.summary || n.excerpt || n.title}>
    {/* Reading Progress Bar */}
    <div id="reading-progress-bar" class="reading-progress-bar"></div>

    {/* Toast notification */}
    <div id="detail-toast" class="news-toast" role="status">
      <i class="fa-solid fa-circle-check"></i>
      <span>تم نسخ رابط المقال بنجاح!</span>
    </div>

    <main class="news-article-page">
      <div class="news-article-container">

        {/* Clean Article Breadcrumbs */}
        <nav class="article-breadcrumbs" aria-label="مسار التصفح">
          <a href="/">{icon('fa-house')} الرئيسية</a>
          <i class="fa-solid fa-chevron-left"></i>
          <a href="/news">{icon('fa-newspaper')} الأخبار والمستجدات</a>
          <i class="fa-solid fa-chevron-left"></i>
          <span class="active-crumb">{n.category || 'خبر'}</span>
        </nav>

        {/* Article Header Box */}
        <header class="article-main-header">
          <div class="article-meta-badges">
            <span class="article-cat-badge">{n.category || 'أخبار الميدان'}</span>
            <span class="article-read-badge">
              <i class="fa-regular fa-clock"></i> {readMinutes} دقيقة قراءة
            </span>
          </div>

          <h1 class="article-headline">{n.title}</h1>

          {n.summary && (
            <p class="article-lead-summary">{n.summary}</p>
          )}

          <div class="article-author-row">
            <div class="author-avatar-wrap">
              <img src="/static/foundation-logo.png" alt="فريق المؤسسة" />
            </div>
            <div class="author-details">
              <strong>فريق التغطية والإعلام</strong>
              <small>مؤسسة الدكتور عمر هشام الخيرية</small>
            </div>
            <div class="article-pub-date">
              <i class="fa-regular fa-calendar-check"></i>
              <span>{date}</span>
            </div>
          </div>

          {/* Social Share Toolbar */}
          <div class="article-share-strip">
            <span class="share-label"><i class="fa-solid fa-share-nodes"></i> مشاركة الخبر:</span>
            <div class="share-strip-btns">
              <a href={`https://wa.me/?text=${encodeURIComponent(n.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`} target="_blank" rel="noopener noreferrer" class="share-pill whatsapp" title="مشاركة عبر واتساب">
                <i class="fa-brands fa-whatsapp"></i> واتساب
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" class="share-pill facebook" title="مشاركة على فيسبوك">
                <i class="fa-brands fa-facebook-f"></i> فيسبوك
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(n.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" class="share-pill twitter" title="مشاركة على إكس">
                <i class="fa-brands fa-x-twitter"></i> إكس
              </a>
              <button type="button" class="share-pill copy-btn" id="btn-copy-article" title="نسخ رابط المقال">
                <i class="fa-solid fa-link"></i> نسخ الرابط
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {img && (
          <figure class="article-featured-figure">
            <img src={img} alt={n.title} class="article-featured-img" />
            <figcaption>
              <i class="fa-solid fa-camera"></i> لقطة حية من التغطية الميدانية للحدث
            </figcaption>
          </figure>
        )}

        {/* Article Body Content */}
        <div class="article-rich-body">
          {String(n.content || n.summary || '').split(/\n\n+/).map((para: string) => (
            <p>{para}</p>
          ))}
        </div>

        {/* Article Footer & Action Callout */}
        <footer class="article-bottom-actions">
          <div class="article-impact-callout">
            <div class="impact-heart-icon">
              <i class="fa-solid fa-hand-holding-heart"></i>
            </div>
            <div class="impact-text">
              <h4>هذا الأثر صنعه أهل الخير والعطاء</h4>
              <p>كل مساهمة تقدمها تصنع فرقًا ملموسًا في حياة إنسان. ساهم معنا اليوم واستمر في صناعة الأثر الطيب.</p>
            </div>
            <div class="impact-buttons">
              <a href="/donate" class="btn-impact-donate">
                <span>تبرّع الآن</span>
                <i class="fa-solid fa-heart"></i>
              </a>
              <a href="/news" class="btn-impact-more">
                <span>المزيد من الأخبار</span>
                <i class="fa-solid fa-arrow-left"></i>
              </a>
            </div>
          </div>
        </footer>

      </div>
    </main>

    {/* Reading progress & copy script */}
    <script dangerouslySetInnerHTML={{ __html: `
      document.addEventListener('DOMContentLoaded', function() {
        const progressBar = document.getElementById('reading-progress-bar');
        const copyBtn = document.getElementById('btn-copy-article');
        const toast = document.getElementById('detail-toast');

        window.addEventListener('scroll', function() {
          if (!progressBar) return;
          const h = document.documentElement;
          const b = document.body;
          const st = 'scrollTop';
          const sh = 'scrollHeight';
          const percent = ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100;
          progressBar.style.width = Math.min(100, Math.max(0, percent)) + '%';
        });

        if (copyBtn) {
          copyBtn.addEventListener('click', function() {
            const url = window.location.href;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(url).then(() => {
                if (toast) {
                  toast.classList.add('show');
                  setTimeout(() => toast.classList.remove('show'), 3000);
                }
              });
            }
          });
        }
      });
    ` }} />
  </Layout>
}
