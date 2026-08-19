import { Layout, icon } from './shared'
import type { UserSession } from '../types'

export interface PublicCaseItem {
  id: string
  code: string
  title: string
  category: string
  target_amount: number
  raised_amount: number
  beneficiary_city?: string
  urgency: 'critical' | 'high' | 'normal'
  description: string
  story_summary?: string
  is_active: boolean
  created_at?: string
}

export function CasesList({ cases = [], user }: { cases: PublicCaseItem[], user?: UserSession }) {
  const categories = ['الكل', 'صحة وعمليات', 'كفالة أيتام', 'سداد ديون', 'تحسين مسكن', 'أجهزة تعويضية']

  return (
    <Layout
      user={user}
      title="الحالات الإنسانية العاجلة والكفالات | مؤسسة الدكتور عمر هشام الخيرية"
      description="تصفح الحالات الإنسانية الموثقة وساهم في كفالة مريض أو يتيم أو تفريج كرب أسرة متعففة بشفافية تامة."
      image="/static/img/og-image.png"
    >
      <section class="page-hero cases-hero">
        <div class="hero-glow"></div>
        <p class="eyebrow">{icon('fa-hand-holding-heart')} تفريج الكرب وباب الجنة</p>
        <h1>الحالات الإنسانية والكفالات</h1>
        <p>
          "مَنْ فَرَّجَ عَنْ مُسْلِمٍ كُرْبَةً فَرَّجَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرُبَاتِ يَوْمِ الْقِيَامَةِ" — حالات خضعت لبحث ميداني دقيق ونُشرت بكرامة وشفافية كاملة.
        </p>
      </section>

      <section class="section-pad cases-section">
        <div class="cases-container">
          {/* Quick Filters */}
          <div class="cases-filter-bar">
            <div class="filter-chips-list">
              {categories.map((cat, idx) => (
                <button
                  type="button"
                  class={`case-filter-chip ${idx === 0 ? 'active' : ''}`}
                  data-category={cat === 'الكل' ? 'all' : cat}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div class="cases-urgent-switch">
              <label>
                <input type="checkbox" id="urgent-cases-only" />
                <span>{icon('fa-bolt')} الحالات الأكثر حرجاً واستعجالاً فقط</span>
              </label>
            </div>
          </div>

          {/* Cases Grid */}
          <div class="cases-grid" id="cases-grid">
            {cases.length === 0 ? (
              <div class="cases-empty-card">
                <div class="empty-icon">{icon('fa-hands-holding-heart')}</div>
                <h3>جاري تحديث وتوثيق الحالات الميدانية</h3>
                <p>يتم تدقيق ملفات الحالات الجديدة عبر الباحثين الاجتماعيين. يمكنك المساهمة في الصندوق العام للتكفل الفوري.</p>
                <a href="/donate" class="primary-btn"><span>تبرّع للصندوق الإنساني</span><i class="fa-solid fa-arrow-left"></i></a>
              </div>
            ) : (
              cases.map((item) => {
                const percent = Math.min(100, Math.round(((item.raised_amount || 0) / (item.target_amount || 1)) * 100))
                const remaining = Math.max(0, (item.target_amount || 0) - (item.raised_amount || 0))
                const isUrgent = item.urgency === 'critical' || item.urgency === 'high'

                return (
                  <article class={`case-card ${isUrgent ? 'urgent-case' : ''}`} data-category={item.category} data-urgent={isUrgent ? 'true' : 'false'}>
                    <div class="case-card-header">
                      <div class="case-code-badge">
                        {icon('fa-shield-halved')}
                        <span>{item.code || `حالة #${item.id.slice(-4)}`}</span>
                      </div>
                      {isUrgent && (
                        <span class="urgent-pulse-tag">
                          <i class="fa-solid fa-heart-pulse"></i> حالة حرجة
                        </span>
                      )}
                    </div>

                    <div class="case-card-body">
                      <span class="case-category-pill">{item.category || 'مساعدات إنسانية'}</span>
                      <h3 class="case-title">{item.title}</h3>
                      <p class="case-desc">{item.description || item.story_summary || 'حالة تستحق الدعم والتكافل وفق البحث الاجتماعي.'}</p>
                      
                      {item.beneficiary_city && (
                        <div class="case-location-tag">
                          {icon('fa-location-dot')} محافظة: {item.beneficiary_city}
                        </div>
                      )}
                    </div>

                    <div class="case-progress-wrap">
                      <div class="case-progress-bar">
                        <div class="case-progress-fill" style={`width: ${percent}%`}></div>
                      </div>
                      <div class="case-progress-stats">
                        <div>
                          <span>تم جمع:</span>
                          <b>{(item.raised_amount || 0).toLocaleString('ar-EG')} ج.م</b>
                        </div>
                        <div class="stat-percent">{percent}%</div>
                        <div>
                          <span>المتبقي:</span>
                          <b class="remaining-amt">{remaining.toLocaleString('ar-EG')} ج.م</b>
                        </div>
                      </div>
                    </div>

                    <div class="case-card-actions">
                      <a href={`/donate?case_id=${item.id}&case_code=${encodeURIComponent(item.code || item.title)}&amount=${Math.min(500, remaining || 100)}`} class="primary-btn donate-case-btn">
                        <span>{icon('fa-heart')} كفالة ومساهمة</span>
                        <i class="fa-solid fa-arrow-left"></i>
                      </a>
                      <a href={`/cases/${item.id}`} class="outline-btn mini-btn" title="تفاصيل الحالة">
                        {icon('fa-circle-info')}
                      </a>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const chips = document.querySelectorAll('.case-filter-chip');
          const urgentCheck = document.getElementById('urgent-cases-only');
          const cards = document.querySelectorAll('.case-card');

          function filterCases() {
            const activeChip = document.querySelector('.case-filter-chip.active');
            const category = activeChip ? activeChip.getAttribute('data-category') : 'all';
            const urgentOnly = urgentCheck ? urgentCheck.checked : false;

            cards.forEach(card => {
              const cardCat = card.getAttribute('data-category') || '';
              const isUrgent = card.getAttribute('data-urgent') === 'true';

              const matchCat = (category === 'all' || cardCat === category || (category === 'صحة وعمليات' && (cardCat.includes('صحة') || cardCat.includes('علاج'))));
              const matchUrgent = (!urgentOnly || isUrgent);

              if (matchCat && matchUrgent) {
                card.style.display = 'flex';
              } else {
                card.style.display = 'none';
              }
            });
          }

          chips.forEach(chip => {
            chip.addEventListener('click', () => {
              chips.forEach(c => c.classList.remove('active'));
              chip.classList.add('active');
              filterCases();
            });
          });

          urgentCheck?.addEventListener('change', filterCases);
        });
      `}} />
    </Layout>
  )
}

export function CaseDetail({ caseItem, user }: { caseItem: PublicCaseItem, user?: UserSession }) {
  const percent = Math.min(100, Math.round(((caseItem.raised_amount || 0) / (caseItem.target_amount || 1)) * 100))
  const remaining = Math.max(0, (caseItem.target_amount || 0) - (caseItem.raised_amount || 0))
  const isUrgent = caseItem.urgency === 'critical' || caseItem.urgency === 'high'

  return (
    <Layout
      user={user}
      title={`${caseItem.title} | مؤسسة الدكتور عمر هشام الخيرية`}
      description={`ساهم في تفريج كرب ${caseItem.title} - المبلغ المطلوب: ${caseItem.target_amount} ج.م`}
      image="/static/img/og-image.png"
    >
      <section class="detail-hero case-detail-hero">
        <a class="back-link" href="/cases">{icon('fa-arrow-right')} العودة لكل الحالات</a>
        <div class="case-detail-badge-row">
          <span class="case-code-badge">{icon('fa-shield-halved')} {caseItem.code || `حالة #${caseItem.id.slice(-4)}`}</span>
          <span class="case-category-pill">{caseItem.category}</span>
          {isUrgent && <span class="urgent-pulse-tag"><i class="fa-solid fa-heart-pulse"></i> حالة حرجة وعاجلة</span>}
        </div>
        <h1>{caseItem.title}</h1>
        {caseItem.beneficiary_city && <p class="city-indicator">{icon('fa-location-dot')} محافظة: {caseItem.beneficiary_city}</p>}
      </section>

      <section class="section-pad case-detail-content-wrap">
        <div class="case-detail-grid">
          <div class="case-detail-main">
            <article class="case-detail-card">
              <h3>{icon('fa-clipboard-check')} تقرير البحث الاجتماعي والميداني</h3>
              <div class="case-detail-text">
                <p>{caseItem.description}</p>
                {caseItem.story_summary && (
                  <blockquote class="case-quote">
                    <p>{caseItem.story_summary}</p>
                  </blockquote>
                )}
              </div>

              <div class="case-safety-strip">
                <div class="safety-icon">{icon('fa-user-shield')}</div>
                <div>
                  <h4>ضمان الخصوصية والكرامة</h4>
                  <p>تلتزم المؤسسة بحماية بيانات المستفيدين والأسماء الحقيقية وفقاً لميثاق الشرف الإنساني وضوابط وزارة التضامن الاجتماعي.</p>
                </div>
              </div>
            </article>
          </div>

          <aside class="case-detail-sidebar">
            <div class="case-action-card">
              <h3>{icon('fa-coins')} الموقف المالي للحالة</h3>
              
              <div class="case-progress-wrap detail-progress">
                <div class="case-progress-bar big">
                  <div class="case-progress-fill" style={`width: ${percent}%`}></div>
                </div>
                <div class="case-numbers-grid">
                  <div class="num-box">
                    <span>المطلوب:</span>
                    <strong>{(caseItem.target_amount || 0).toLocaleString('ar-EG')} ج.م</strong>
                  </div>
                  <div class="num-box">
                    <span>المُحصّل:</span>
                    <strong class="highlight-green">{(caseItem.raised_amount || 0).toLocaleString('ar-EG')} ج.م</strong>
                  </div>
                  <div class="num-box">
                    <span>المتبقي:</span>
                    <strong class="highlight-gold">{remaining.toLocaleString('ar-EG')} ج.م</strong>
                  </div>
                </div>
              </div>

              <div class="case-donation-form">
                <h4>اختر مبلغ المساهمة:</h4>
                <div class="amount-picks quick-picks">
                  <button type="button" class="amount-btn active" data-val="100">100 ج.م</button>
                  <button type="button" class="amount-btn" data-val="250">250 ج.م</button>
                  <button type="button" class="amount-btn" data-val="500">500 ج.م</button>
                  <button type="button" class="amount-btn" data-val={remaining}>كفالة كاملة</button>
                </div>

                <a
                  id="case-direct-donate-btn"
                  href={`/donate?case_id=${caseItem.id}&case_code=${encodeURIComponent(caseItem.code || caseItem.title)}&amount=100`}
                  class="primary-btn donate-now-btn"
                >
                  <span>{icon('fa-heart')} تبرّع لهذه الحالة الآن</span>
                  <i class="fa-solid fa-arrow-left"></i>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const btns = document.querySelectorAll('.amount-picks.quick-picks .amount-btn');
          const donateBtn = document.getElementById('case-direct-donate-btn');
          const caseId = '${caseItem.id}';
          const caseCode = '${encodeURIComponent(caseItem.code || caseItem.title)}';

          btns.forEach(b => {
            b.addEventListener('click', () => {
              btns.forEach(x => x.classList.remove('active'));
              b.classList.add('active');
              const val = b.getAttribute('data-val') || '100';
              if (donateBtn) {
                donateBtn.href = '/donate?case_id=' + caseId + '&case_code=' + caseCode + '&amount=' + val;
              }
            });
          });
        });
      `}} />
    </Layout>
  )
}
