import { Layout, icon } from './shared'
import type { UserSession } from '../types'

export function MedicalEquipment({ equipment = [], user }: { equipment: any[], user?: UserSession }) {
  const categories = [
    { id: 'all', label: 'كافة الأجهزة والمعدات' },
    { id: 'respiratory', label: 'أجهزة تنفسية وأكسجين' },
    { id: 'mobility', label: 'كراسي متحركة وأجهزة حركية' },
    { id: 'beds', label: 'أسرّة طبية ومستلزمات' },
    { id: 'diagnostics', label: 'أجهزة قياس وفحص منزلي' }
  ]

  return (
    <Layout
      user={user}
      title="بنك الأجهزة الطبية والتنفسية المجاني | مؤسسة الدكتور عمر هشام الخيرية"
      description="إعارة مجانية للأجهزة الطبية والتنفسية ومولدات الأكسجين والكراسي المتحركة لمرضى الرعاية المنزلية لوجه الله صدقةً جارية."
      image="/static/img/og-image.png"
    >
      {/* ─── Hero Section ─── */}
      <section class="page-hero medical-hero">
        <div class="hero-glow"></div>
        <p class="eyebrow reveal">{icon('fa-stethoscope')} صدقة جارية لروح طبيب القلوب د. عمر هشام</p>
        <h1 class="reveal">بنك الأجهزة الطبية <span>والتنفسية المجاني</span></h1>
        <p class="reveal">
          "وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا" — نوفر أجهزة التنفس ومولدات الأكسجين، الكراسي المتحركة، وأسرّة الرعاية المنزلية مجاناً بالكامل للأسر المتعففة مع التوصيل والمتابعة.
        </p>

        {/* Quick Highlights */}
        <div class="medical-hero-badges reveal">
          <div class="med-badge-pill">
            {icon('fa-hand-holding-medical')} <span>إعارة مجانية ١٠٠٪</span>
          </div>
          <div class="med-badge-pill">
            {icon('fa-truck-medical')} <span>توصيل وتسليم فوري</span>
          </div>
          <div class="med-badge-pill">
            {icon('fa-pump-medical')} <span>مولدات وأسطوانات أكسجين</span>
          </div>
          <div class="med-badge-pill">
            {icon('fa-wheelchair')} <span>كراسي كهربائية وعادية</span>
          </div>
          <div class="med-badge-pill">
            {icon('fa-shield-heart')} <span>تعقيم وفحص دوري معتمد</span>
          </div>
        </div>
      </section>

      {/* ─── Main Content Section ─── */}
      <section class="section-pad medical-section-wrap">
        <div class="medical-container">
          {/* Instructions Strip */}
          <div class="medical-notice-strip reveal">
            <div class="notice-icon-box">{icon('fa-circle-info')}</div>
            <div class="notice-content">
              <strong>شروط الاستعارة الخيرية المجانية:</strong>
              <p>يُتاح الجهاز للمريض المحتاج بموجب تقرير طبي أو روشتة معتمدة، وصورة بطاقة المريض والمستلم، مع التعهد الأخلاقي برد الجهاز فور شفاء المريض لخدمة مريض آخر في قائمة الانتظار.</p>
            </div>
            <button type="button" class="primary-btn open-med-modal-btn" data-preset-device="">
              {icon('fa-file-signature')} <span>تقديم طلب استعارة</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div class="medical-filter-bar reveal">
            <div class="med-filter-chips">
              {categories.map((cat, idx) => (
                <button
                  type="button"
                  class={`med-chip-btn ${idx === 0 ? 'active' : ''}`}
                  data-category={cat.id}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div class="med-status-switch">
              <label>
                <input type="checkbox" id="available-only-check" />
                <span>{icon('fa-circle-check')} الأجهزة المتاحة للتسليم الفوري فقط</span>
              </label>
            </div>
          </div>

          {/* Equipment Grid */}
          <div class="medical-grid" id="medical-grid">
            {equipment.map((item) => {
              const isAvail = item.is_available !== false && item.status === 'available'

              return (
                <article
                  class="medical-card reveal"
                  data-category={item.category || 'all'}
                  data-available={isAvail ? 'true' : 'false'}
                >
                  <div class="med-card-header">
                    <div class="med-icon-circle">
                      <i class={`fa-solid ${item.image_icon || 'fa-heart-pulse'}`}></i>
                    </div>
                    <div class="med-header-tags">
                      <span class="med-code-tag">{item.code || 'MED-01'}</span>
                      {isAvail ? (
                        <span class="med-status-badge available-badge">
                          <i class="fa-solid fa-circle-check"></i> متاح للإعارة
                        </span>
                      ) : (
                        <span class="med-status-badge loaned-badge">
                          <i class="fa-solid fa-clock-rotate-left"></i> قيد الإعارة لمريض
                        </span>
                      )}
                    </div>
                  </div>

                  <div class="med-card-body">
                    <span class="med-category-pill">{item.category_name || 'أجهزة طبية'}</span>
                    <h3 class="med-title">{item.name}</h3>
                    <p class="med-desc">{item.description}</p>

                    <div class="med-meta-specs">
                      <div class="med-spec-item">
                        <span>الحالة الفنية:</span>
                        <b>{item.condition || 'ممتازة'}</b>
                      </div>
                      <div class="med-spec-item">
                        <span>مرات الإعارة:</span>
                        <b>{(item.total_loans_count || 0).toLocaleString('ar-EG')} مريض</b>
                      </div>
                    </div>
                  </div>

                  <div class="med-card-footer">
                    {isAvail ? (
                      <button
                        type="button"
                        class="primary-btn med-request-btn open-med-modal-btn"
                        data-preset-device={item.name}
                      >
                        <span>{icon('fa-hand-holding-medical')} طلب استعارة الجهاز</span>
                        <i class="fa-solid fa-arrow-left"></i>
                      </button>
                    ) : (
                      <button
                        type="button"
                        class="outline-btn med-waitlist-btn open-med-modal-btn"
                        data-preset-device={item.name}
                      >
                        <span>{icon('fa-clock')} الحجز في قائمة الانتظار</span>
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          {/* Need specific device banner */}
          <div class="medical-custom-banner reveal">
            <div class="custom-banner-icon">{icon('fa-heart-pulse')}</div>
            <div class="custom-banner-text">
              <h3>هل تبحث عن جهاز طبي أو مستلزم علاجي غير مدرج هنا؟</h3>
              <p>تواصل مع قسم الرعاية الطبية والإنسانية بالمؤسسة، ونبذل قصارى جهدنا لتدبيره فوراً عبر شبكة متبرعينا وشركائنا.</p>
            </div>
            <div class="custom-banner-actions">
              <button type="button" class="primary-btn open-med-modal-btn" data-preset-device="طلب جهاز طبي خاص وغير مدرج">
                {icon('fa-envelope-open-text')} تسجيل احتياج طبي
              </button>
              <a href="tel:01060920249" class="outline-btn">
                {icon('fa-phone')} <span>01060920249</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Modal Form: Request Medical Equipment ─── */}
      <div class="med-modal-backdrop" id="med-modal-backdrop" style="display:none">
        <div class="med-modal-dialog">
          <header class="med-modal-header">
            <div style="display:flex; align-items:center; gap:10px">
              <div class="modal-title-icon">{icon('fa-hand-holding-medical')}</div>
              <div>
                <h4>طلب استعارة جهاز طبي مجاناً</h4>
                <small>خدمة إنسانية لوجه الله تعالى لمرضى الرعاية المنزلية</small>
              </div>
            </div>
            <button type="button" class="modal-close-btn" id="close-med-modal-btn" aria-label="إغلاق">
              {icon('fa-xmark')}
            </button>
          </header>

          <form class="ajax-form med-modal-form" data-endpoint="/api/medical/request" method="post" id="medRequestForm">
            <div class="form-grid">
              <label>
                اسم المريض الثلاثي *
                <input name="patient_name" required placeholder="الاسم كما في البطاقة الشخصية" />
              </label>
              <label>
                الرقم القومي للمريض *
                <input name="patient_national_id" required inputmode="numeric" maxlength={14} placeholder="١٤ رقم قومي" />
              </label>
            </div>

            <div class="form-grid">
              <label>
                اسم مقدم الطلب / المستلم *
                <input name="requester_name" required placeholder="اسم المستلم وصلة القرابة" />
              </label>
              <label>
                رقم هاتف التواصل الأساسي *
                <input name="requester_phone" required inputmode="tel" placeholder="01xxxxxxxxx" />
              </label>
            </div>

            <div class="form-grid">
              <label>
                رقم هاتف بديل / واتساب
                <input name="alt_phone" inputmode="tel" placeholder="01xxxxxxxxx" />
              </label>
              <label>
                المحافظة والمركز *
                <input name="city" required placeholder="مثال: الدقهلية — شربين / المنصورة" />
              </label>
            </div>

            <label>
              العنوان التفصيلي ومحل إقامة المريض *
              <input name="address" required placeholder="القرية / الحي، اسم الشارع، رقم المنزل، علامة مميزة" />
            </label>

            <div class="form-grid">
              <label>
                نوع الجهاز الطبي المطلوب *
                <input name="equipment_type" id="modal-equipment-type-input" required placeholder="مثال: مولد أكسجين 10 لتر" />
              </label>
              <label>
                المدة التقديرية للاحتياج *
                <select name="expected_duration" style="padding:12px; border-radius:12px; border:1px solid var(--line); background:var(--ivory); margin-top:6px; width:100%">
                  <option value="أسبوع إلى أسبوعين">أسبوع إلى أسبوعين (فترة نقاهة طارئة)</option>
                  <option value="شهر واحد" selected>شهر واحد (قابل للتجديد)</option>
                  <option value="ثلاثة أشهر">ثلاثة أشهر</option>
                  <option value="حالة مزمنة طويلة الأمد">حالة مزمنة طويلة الأمد</option>
                </select>
              </label>
            </div>

            <label>
              التشخيص الطبي أو ملخص الحالة *
              <textarea name="diagnosis" required rows={2} placeholder="مثال: مريض يعاني من قصور تنفسي حاد ويحتاج جلسات أكسجين منزلي مستمرة وفق توصية المستشفى..." style="padding:10px; font-family:inherit; line-height:1.6"></textarea>
            </label>

            <div class="med-sharia-pledge">
              <label style="display:flex; align-items:flex-start; gap:10px; font-size:.88rem; cursor:pointer">
                <input type="checkbox" required style="margin-top:4px; width:18px; height:18px; accent-color:var(--emerald-600)" />
                <span>
                  أتعهد أمام الله تعالى بالمحافظة التامة على الجهاز واستعماله للمريض المذكور فقط، وإعادته لإدارة المؤسسة فور شفاء المريض أو انتهاء الاحتياج لينتفع به مريض آخر في أشد الحاجة إليه.
                </span>
              </label>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px">
              <button type="button" class="outline-btn" id="cancel-med-modal-btn">إلغاء</button>
              <button type="submit" class="primary-btn" style="padding:10px 24px">
                <span>{icon('fa-paper-plane')} إرسال الطلب للمراجعة</span>
                <i class="fa-solid fa-arrow-left"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Client-side Controller */}
      <script dangerouslySetInnerHTML={{ __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const chips = document.querySelectorAll('.med-chip-btn');
          const availCheck = document.getElementById('available-only-check');
          const cards = document.querySelectorAll('.medical-card');
          const modal = document.getElementById('med-modal-backdrop');
          const openBtns = document.querySelectorAll('.open-med-modal-btn');
          const closeBtn = document.getElementById('close-med-modal-btn');
          const cancelBtn = document.getElementById('cancel-med-modal-btn');
          const deviceInput = document.getElementById('modal-equipment-type-input');

          function filterDevices() {
            const activeChip = document.querySelector('.med-chip-btn.active');
            const category = activeChip ? activeChip.getAttribute('data-category') : 'all';
            const availOnly = availCheck ? availCheck.checked : false;

            cards.forEach(card => {
              const cardCat = card.getAttribute('data-category') || '';
              const isAvail = card.getAttribute('data-available') === 'true';

              const matchCat = (category === 'all' || cardCat === category);
              const matchAvail = (!availOnly || isAvail);

              if (matchCat && matchAvail) {
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
              filterDevices();
            });
          });

          if (availCheck) {
            availCheck.addEventListener('change', filterDevices);
          }

          // Modal Handlers
          function openModal(presetDevice) {
            if (modal) {
              modal.style.display = 'flex';
              document.body.style.overflow = 'hidden';
              if (deviceInput && presetDevice) {
                deviceInput.value = presetDevice;
              }
            }
          }

          function closeModal() {
            if (modal) {
              modal.style.display = 'none';
              document.body.style.overflow = '';
            }
          }

          openBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              const preset = btn.getAttribute('data-preset-device') || '';
              openModal(preset);
            });
          });

          if (closeBtn) closeBtn.addEventListener('click', closeModal);
          if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
          if (modal) {
            modal.addEventListener('click', (e) => {
              if (e.target === modal) closeModal();
            });
          }
        });
      `}} />
    </Layout>
  )
}
