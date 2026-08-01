import { icon, Layout, PageHero, SectionHead } from './shared'
import type { UserSession } from '../types'

export function Achievements({ user }: { user?: UserSession }) {
  return <Layout user={user} title="الإنجازات | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="أثرنا بالأرقام" title={'لا نعدُ بالكثير،<br/><em>نُريك ما تحقق.</em>'} text="الشفافية عندنا ليست صفحة؛ إنها الطريقة التي نعمل بها ونحفظ بها أمانة كل متبرع." />
    <section class="metrics-showcase section-pad"><article><span>أكثر من</span><b>٥٠</b><p>أسرة حصلت على دعم مباشر</p></article><article><span>إجمالي</span><b>٨٠ ألف</b><p>جنيه تم توجيهها للمستحقين</p></article><article><span>دعم الأسر</span><b>٦٠ ألف</b><p>جنيه لـ ٥٠ أسرة أولى بالرعاية</p></article><article><span>دعم المرضى</span><b>٢٠ ألف</b><p>جنيه علاج ومساعدات طبية</p></article></section>
    <section class="achievement-tracks section-pad"><SectionHead kicker="ما وراء الأرقام" title={'أعمالٌ تلمس<br/><em>كل جانب من الحياة.</em>'} /><div class="track-grid">{[['fa-heart-pulse', 'الصحة', 'عيادة أنف وأذن، تطوير كهرباء المستشفى، دواء شهري، دعم مرضى السرطان، ومساهمات في العمليات.'], ['fa-graduation-cap', 'التعليم', 'ماكينات تصوير للمدارس، تكريم المتفوقين، مصروفات وأدوات ومتابعة طوال العام.'], ['fa-book-quran', 'القرآن', 'حلقات للأطفال بمناهج مناسبة، معلمون مؤهلون، مسابقات في الحفظ والتجويد وجوائز قيّمة.'], ['fa-bowl-rice', 'الغذاء والأسرة', 'لحوم طازجة، كراتين رمضان، كسوة عيد، ووجبات ساخنة تصل إلى البيوت بكرامة.']].map(t => <article class="track-card reveal"><div>{icon(t[0])}</div><h3>{t[1]}</h3><p>{t[2]}</p></article>)}</div></section>
  </Layout>
}

export function Volunteers({ user, stats }: { user?: UserSession, stats?: any }) {
  const roles = [
    ['fa-people-carry-box', 'تطوع ميداني', 'المشاركة في القوافل الإنسانية وتوزيع المساعدات على الأسر الأولى بالرعاية.', 'tone-emerald'],
    ['fa-user-doctor', 'تطوع طبي', 'دعم العيادات والقوافل الطبية وتقديم الاستشارات الصحية المجانية.', 'tone-blue'],
    ['fa-laptop-code', 'تطوع رقمي', 'المساهمة في تطوير المنصات الرقمية والتصميم والتوثيق الإعلامي.', 'tone-violet'],
    ['fa-chalkboard-user', 'تطوع تعليمي', 'تعليم الأطفال ومحو الأمية ودعم حلقات تحفيظ القرآن الكريم.', 'tone-gold'],
    ['fa-bullhorn', 'توعية وحملات', 'تنظيم حملات التوعية المجتمعية والمشاركة في الفعاليات.', 'tone-coral'],
    ['fa-people-roof', 'رعاية أسر', 'كفالة ومتابعة الأسر المحتاجة وتوصيل الدعم بانتظام.', 'tone-cyan']
  ]
  const totalVols = stats?.total || 0
  const totalHours = stats?.totalHours || 0

  return <Layout user={user} title="تطوع معنا | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="كن جزءًا من الحكاية" title={'قد لا تتبرع بالمال،<br/><em>لكن وقتك ثروة.</em>'} text="موهبتك، خبرتك، أو حتى ساعتان من يومك قد تصنع فرقًا حقيقيًا في حياة إنسان." />

    {/* Volunteer Impact Stats */}
    <section class="vol-impact section-pad" style="padding-bottom:0">
      <div class="vol-impact-grid">
        <article class="vol-impact-card reveal">
          <div class="vol-impact-icon">{icon('fa-users')}</div>
          <b>{totalVols > 0 ? totalVols : '٢٥'}+</b>
          <span>متطوع نشط</span>
        </article>
        <article class="vol-impact-card reveal" style="--delay:100ms">
          <div class="vol-impact-icon">{icon('fa-clock')}</div>
          <b>{totalHours > 0 ? totalHours : '٥٠٠'}+</b>
          <span>ساعة خدمة تطوعية</span>
        </article>
        <article class="vol-impact-card reveal" style="--delay:200ms">
          <div class="vol-impact-icon">{icon('fa-id-badge')}</div>
          <b>VOL</b>
          <span>بطاقة هوية رقمية</span>
        </article>
        <article class="vol-impact-card reveal" style="--delay:300ms">
          <div class="vol-impact-icon">{icon('fa-award')}</div>
          <b>٤</b>
          <span>رتب تطوعية</span>
        </article>
      </div>
    </section>

    {/* ID Verification Tool */}
    <section class="vol-verify-section section-pad reveal">
      <div class="vol-verify-box">
        <div class="vol-verify-header">
          <div class="vol-verify-icon-wrap">{icon('fa-shield-halved')}</div>
          <div>
            <h3>التحقق من هوية المتطوع</h3>
            <p>أدخل كود المتطوع للتأكد من صلاحية بطاقة الهوية واعتماده رسمياً من المؤسسة.</p>
          </div>
        </div>
        <div class="vol-verify-input-row">
          <input type="text" id="volVerifyInput" placeholder="أدخل الكود مثلاً VOL-1" autocomplete="off" />
          <button type="button" id="volVerifyBtn" class="primary-btn">{icon('fa-magnifying-glass')} تحقق الآن</button>
        </div>
        <div id="volVerifyResult" class="vol-verify-result" style="display:none"></div>
      </div>
    </section>

    {/* Volunteer Roles */}
    <section class="vol-roles section-pad">
      <div class="section-head"><p class="eyebrow">مسارات التطوع</p><h2>اختر مسارك<br/><em>واصنع أثرك.</em></h2></div>
      <div class="vol-role-grid">
        {roles.map((r, i) => <article class={`vol-role-card ${r[3]} reveal`} style={`--delay:${i * 80}ms`}>
          <div class="vol-role-icon">{icon(r[0])}</div>
          <h3>{r[1]}</h3>
          <p>{r[2]}</p>
        </article>)}
      </div>
    </section>

    {/* Volunteer ID Benefits */}
    <section class="vol-id-benefits section-pad" style="background:var(--ink);color:white">
      <div class="section-head"><p class="eyebrow" style="color:var(--gold-2)">بطاقة هوية المتطوع الرقمية</p><h2 style="color:white">كل متطوعٍ معتمد<br/><em style="color:var(--gold-2)">يحمل هويّته الرسمية.</em></h2></div>
      <div class="vol-benefits-grid">
        {[
          ['fa-fingerprint', 'كود فريد', 'كل متطوع يحصل على كود خاص (VOL-1, VOL-2...) يُعرّفه رسمياً.'],
          ['fa-calendar-check', 'صلاحية سنتين', 'البطاقة صالحة لمدة عامين كاملين من تاريخ الاعتماد.'],
          ['fa-star', 'رتب تطوعية', 'متطوع مبادر ← فعّال ← قائد ميداني ← سفير العطاء.'],
          ['fa-download', 'قابلة للتحميل', 'بطاقة احترافية يمكن تحميلها ومشاركتها بفخر.']
        ].map((b, i) => <article class="vol-benefit-card reveal" style={`--delay:${i * 100}ms`}>
          <div>{icon(b[0])}</div>
          <h4>{b[1]}</h4>
          <p>{b[2]}</p>
        </article>)}
      </div>
    </section>

    {/* Enhanced Luxury Application Form */}
    <section class="roles section-pad">
      <form class="vol-application-form ajax-form reveal" data-endpoint="/api/volunteers" method="post" id="volForm">
        <div class="vol-form-header">
          <span class="vol-form-badge">{icon('fa-hand-holding-heart')} بوابتك للعطاء</span>
          <h2>انضم إلى عائلة المتطوعين</h2>
          <p>قدّم طلبك الآن وسيقوم فريق الإدارة بمراجعته. بعد الاعتماد، ستتحول عضويتك تلقائياً إلى <strong>"متطوع رسمي"</strong> وستحصل على **بطاقة هويّة رقمية معتمدة** بكود خاص بك.</p>
        </div>

        {/* Photo Upload Box */}
        <div class="vol-form-avatar-section">
          <div class="vol-avatar-preview" id="volAvatarPreview">
            {icon('fa-camera')}
          </div>
          <div class="vol-avatar-text">
            <label class="vol-avatar-label primary-btn" id="volAvatarLabel" style="padding:10px 20px;font-size:.85rem">
              {icon('fa-cloud-arrow-up')} اختر صورة شخصية للبطاقة
              <input type="file" name="avatar_file" accept="image/*" id="volAvatarInput" style="display:none" />
            </label>
            <small style="color:var(--muted);display:block;margin-top:8px">الصورة ستظهر بشكل رسمي على بطاقة الهوية الرقمية (اختياري)</small>
          </div>
          <input type="hidden" name="avatar_url" id="volAvatarUrl" />
        </div>

        {/* Form Inputs Grid */}
        <div class="vol-input-grid">
          <div class="vol-input-group">
            <label>{icon('fa-user')} الاسم الكامل <span class="req">*</span></label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-user input-icon"></i>
              <input name="name" required placeholder="أدخل اسمك الرباعي هنا..." />
            </div>
          </div>

          <div class="vol-input-group">
            <label>{icon('fa-phone')} رقم الهاتف <span class="req">*</span></label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-phone input-icon"></i>
              <input name="phone" required placeholder="01xxxxxxxxx" dir="ltr" style="text-align:right" />
            </div>
          </div>

          <div class="vol-input-group">
            <label>{icon('fa-cake-candles')} العمر</label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-cake-candles input-icon"></i>
              <input name="age" type="number" min="16" max="90" placeholder="مثلاً 22" />
            </div>
          </div>

          <div class="vol-input-group">
            <label>{icon('fa-location-dot')} المدينة / المحافظة</label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-location-dot input-icon"></i>
              <input name="city" placeholder="مثلاً المنصورة، كفر العنانية..." />
            </div>
          </div>

          <div class="vol-input-group vol-full-width">
            <label>{icon('fa-briefcase')} مجال التطوع المفضل <span class="req">*</span></label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-layer-group input-icon"></i>
              <select name="role" required>
                {roles.map(r => <option value={r[1]}>{r[1]} — {r[2]}</option>)}
              </select>
            </div>
          </div>

          <div class="vol-input-group vol-full-width">
            <label>{icon('fa-wand-magic-sparkles')} الخبرات والمهارات الحالية</label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-star input-icon"></i>
              <input name="skills" placeholder="مثلاً: قيادة سيارة، تصوير، برمجة، تنظيم، تدريس..." />
            </div>
          </div>
        </div>

        <div class="vol-form-footer">
          <button class="primary-btn submit-btn" type="submit" style="width:100%;justify-content:center;padding:18px;font-size:1.05rem">
            تقديم طلب التطوع الآن {icon('fa-paper-plane')}
          </button>
          <p class="vol-privacy-note">{icon('fa-lock')} بياناتك محفوظة ومحميّة بالكامل وفق أعلى معايير الخصوصية في المؤسسة.</p>
        </div>
      </form>
    </section>
  </Layout>
}

export function FAQ({ user }: { user?: UserSession }) {
  const qs = [
    ['كيف يمكنني التبرع للمؤسسة؟', 'يمكنك التبرع عبر إنستاباي بتحويل بنكي إلى البنك الزراعي المصري، حساب 10010397596901014، أو عبر إنستاباي/فودافون كاش على 01060920249، أو التبرع النقدي المباشر بالتنسيق مع الأستاذ جمال عبد الخالق.'],
    ['ما مجالات عمل المؤسسة؟', 'نعمل في الدعم الصحي، وتوزيع الغذاء، ودعم التعليم، ومسابقات القرآن، والمشروعات الإنتاجية، وقنوات الزكاة والصدقة، والمشروعات المجتمعية.'],
    ['أين يقع مقر المؤسسة؟', 'يقع مقر المؤسسة في كفر العنانية، محافظة الدقهلية، جمهورية مصر العربية.'],
    ['هل المؤسسة مرخصة رسميًا؟', 'نعم، المؤسسة مسجلة ومرخصة لدى الجهات المختصة وتعمل بكامل الشفافية.'],
    ['ما سعر صك الأضحية؟', 'الصك الخيري: 500 جنيه، والأضحية الكاملة: 11,000 جنيه. تقبل الله منا ومنكم.'],
    ['كيف أتأكد من وصول تبرعي؟', 'نلتزم بأعلى معايير الشفافية، وننشر تقارير الإنفاق والإنجازات باستمرار على منصتنا.']
  ]
  return <Layout user={user} title="الأسئلة الشائعة | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="أسئلة شائعة" title={'الوضوح أولُ<br/><em>خطوات الثقة.</em>'} text="جمعنا أكثر الأسئلة التي تصلنا. وإن لم تجد إجابتك، نحن على بُعد رسالة." />
    <section class="faq-list section-pad">{qs.map((q, i) => <details class="faq-item reveal" open={i === 0}><summary><span>0{i + 1}</span><h3>{q[0]}</h3><i class="fa-solid fa-plus"></i></summary><p>{q[1]}</p></details>)}</section>
  </Layout>
}

export function Contact({ user }: { user?: UserSession }) {
  return <Layout user={user} title="تواصل معنا | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="نحن قريبون" title={'رسالتك تصلُ<br/><em>إلى قلبٍ يسمع.</em>'} text="لا تتردد في السؤال أو الاقتراح أو طلب الشراكة. نحن هنا لخدمتكم." />
    <section class="contact-layout section-pad">
      <aside class="contact-info reveal">
        <p class="eyebrow">بيانات التواصل</p>
        <h2>بابنا مفتوح،<br />وقلوبنا كذلك.</h2>
        <a href="tel:01060920249">{icon('fa-phone')}<span><small>اتصل بنا</small><b dir="ltr">01060920249</b></span></a>
        <a href="mailto:info@omarhesham.org">{icon('fa-envelope')}<span><small>راسلنا</small><b>info@omarhesham.org</b></span></a>
        <div>{icon('fa-location-dot')}<span><small>تفضل بزيارتنا</small><b>كفر العنانية، الدقهلية، مصر</b></span></div>
        <div>{icon('fa-clock')}<span><small>مواعيد العمل</small><b>متاحون لخدمتكم — الجمعة إجازة</b></span></div>
      </aside>
      <form class="contact-form ajax-form reveal" data-endpoint="/api/contacts" method="post">
        <div class="form-grid">
          <label>الاسم<input name="name" required /></label>
          <label>البريد الإلكتروني<input name="email" type="email" required /></label>
          <label>الهاتف<input name="phone" /></label>
          <label>الموضوع<select name="subject"><option>استفسار عام</option><option>شراكة</option><option>شكوى أو اقتراح</option><option>إعلام وصحافة</option></select></label>
        </div>
        <label>رسالتك<textarea name="message" rows={6} required placeholder="اكتب رسالتك هنا..."></textarea></label>
        <button class="primary-btn">إرسال الرسالة {icon('fa-paper-plane')}</button>
      </form>
    </section>
  </Layout>
}

export function Transparency({ user }: { user?: UserSession }) {
  return <Layout user={user} title="الشفافية المالية | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="الشفافية المالية" title={'كل جنيهٍ أمانة،<br/><em>وكل خطوة موثّقة.</em>'} text="ثقتكم هي رأس مالنا الحقيقي؛ لذلك نلتزم بالوضوح من لحظة استلام التبرع حتى وصوله." />
    <section class="methodology section-pad">{[['fa-file-shield', 'توثيق التبرعات', 'نسجّل كل مساهمة ونربطها بالمسار الذي اختاره المتبرع.'], ['fa-magnifying-glass-chart', 'مراجعة داخلية', 'مراجعة دورية للمصروفات والمستندات وحالات الاستحقاق.'], ['fa-scale-balanced', 'إنفاق مسؤول', 'توجيه الموارد للأولوية والأكثر أثرًا مع تقليل التكلفة التشغيلية.']].map((m, i) => <article class="method-card reveal"><span>0{i + 1}</span>{icon(m[0])}<h3>{m[1]}</h3><p>{m[2]}</p></article>)}</section>
    <section class="promise section-pad"><p class="eyebrow">وعدنا للمتبرع</p><h2>لن نطلب ثقتك فقط،<br /><em>سنستحقّها كل يوم.</em></h2><p>نعمل على إصدار تقارير دورية أكثر تفصيلًا تشمل أبواب الصرف، أعداد المستفيدين، ونسب الإنجاز في كل حملة.</p></section>
  </Layout>
}

export function Gallery({ user, items }: { user?: UserSession, items?: any[] }) {
  const defaultItems = [
    { title: 'قافلة الدفء والإطعام', location: 'كفر العنانية', img: '/static/img/gallery-1.jpg', tag: 'غذاء' },
    { title: 'مستلزمات مدرسية للأطفال', location: 'الدقهلية', img: '/static/img/gallery-2.jpg', tag: 'تعليم' },
    { title: 'الرعاية الطبية والدواء', location: 'مستشفى كفر العنانية', img: '/static/img/gallery-3.jpg', tag: 'صحة' },
    { title: 'تكريم حفظة القرآن الكريم', location: 'المؤسسة', img: '/static/img/gallery-4.jpg', tag: 'قرآن' },
    { title: 'كسوة العيد للأسر الأولى بالرعاية', location: 'كفر العنانية', img: '/static/img/gallery-5.jpg', tag: 'مجتمع' },
    { title: 'فرحة العطاء في الميدان', location: 'الدقهلية', img: '/static/img/gallery-6.jpg', tag: 'تطوع' },
    { title: 'مشروع الأضاحي السنوي', location: 'كفر العنانية', img: '/static/img/gallery-7.jpg', tag: 'موسمي' },
    { title: 'زيارات ودية وتكريم الأوائل', location: 'منازل الطلاب', img: '/static/img/gallery-8.jpg', tag: 'تعليم' }
  ]

  const displayItems = (items && items.length > 0)
    ? items.map((it: any) => ({
        title: it.title,
        location: it.location || 'المؤسسة',
        img: it.image_url || it.img || '/static/img/gallery-1.jpg',
        tag: it.tag || 'عام'
      }))
    : defaultItems

  // Extract unique categories for filter tabs
  const rawCategories = Array.from(new Set(displayItems.map((i: any) => i.tag))).filter(Boolean)
  const categories = ['الكل', ...rawCategories]

  return <Layout user={user} title="معرض الصور | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="معرض الصور" title={'وجوهٌ ومواقف،<br/><em>تقول ما لا تقوله الأرقام.</em>'} text="لقطات من الميدان، صُنعت فيها الفرحة بأيدي المتطوعين وقلوب المتبرعين." />
    
    <section class="gallery-section section-pad">
      {/* Category Filter Tabs */}
      <div class="gallery-filters">
        {categories.map((cat, idx) => (
          <button
            type="button"
            class={`gallery-filter-btn ${idx === 0 ? 'active' : ''}`}
            data-filter={cat === 'الكل' ? 'all' : cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Professional Photo Cards Grid */}
      <div class="gallery-cards-grid">
        {displayItems.map((item, i) => (
          <article class="gallery-card reveal" data-category={item.tag} data-img={item.img} data-title={item.title} data-location={item.location}>
            <div class="gallery-card-image-wrap">
              <img src={item.img} alt={item.title} class="gallery-card-img" loading="lazy" />
              <span class="gallery-card-tag">{item.tag}</span>
              <div class="gallery-card-overlay">
                <span class="gallery-zoom-icon">{icon('fa-magnifying-glass-plus')} تكبير الصورة</span>
              </div>
            </div>
            <div class="gallery-card-body">
              <h3 class="gallery-card-title">{item.title}</h3>
              <p class="gallery-card-location">{icon('fa-location-dot')} <span>{item.location}</span></p>
            </div>
          </article>
        ))}
      </div>
    </section>

    {/* Lightbox Preview Modal */}
    <div id="gallery-lightbox" class="gallery-lightbox" aria-hidden="true">
      <div class="gallery-lightbox-backdrop"></div>
      <div class="gallery-lightbox-content">
        <button id="gallery-lightbox-close" type="button" class="gallery-lightbox-close" aria-label="إغلاق المعاينة">
          {icon('fa-xmark')}
        </button>
        <div class="gallery-lightbox-img-box">
          <img id="gallery-lightbox-img" src="" alt="" />
        </div>
        <div class="gallery-lightbox-caption">
          <span id="gallery-lightbox-tag" class="gallery-card-tag"></span>
          <h3 id="gallery-lightbox-title"></h3>
          <p id="gallery-lightbox-location">{icon('fa-location-dot')} <span></span></p>
        </div>
      </div>
    </div>
  </Layout>
}

export function GenericNotFound({ user }: { user?: UserSession }) {
  return <Layout user={user} title="الصفحة غير موجودة | مؤسسة الدكتور عمر هشام">
    <section class="empty-state section-pad" style="min-height:70vh; display:flex; flex-direction:column; justify-content:center; align-items:center">
      <div>{icon('fa-compass')}<span></span></div>
      <h2>عذرًا، الصفحة غير موجودة (404)</h2>
      <p>قد يكون الرابط خاطئًا أو تم نقل الصفحة إلى مكان آخر.</p>
      <a class="primary-btn" href="/">العودة للرئيسية {icon('fa-arrow-left')}</a>
    </section>
  </Layout>
}
