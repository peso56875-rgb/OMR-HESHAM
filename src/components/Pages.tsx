import { icon, Layout, PageHero, SectionHead } from './shared'
import type { UserSession } from '../types'

export function Achievements({ user }: { user?: UserSession }) {
  return <Layout user={user} title="الإنجازات | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="أثرنا بالأرقام" title={'لا نعدُ بالكثير،<br/><em>نُريك ما تحقق.</em>'} text="الشفافية عندنا ليست صفحة؛ إنها الطريقة التي نعمل بها ونحفظ بها أمانة كل متبرع." />
    <section class="metrics-showcase section-pad"><article><span>أكثر من</span><b>٥٠</b><p>أسرة حصلت على دعم مباشر</p></article><article><span>إجمالي</span><b>٨٠ ألف</b><p>جنيه تم توجيهها للمستحقين</p></article><article><span>دعم الأسر</span><b>٦٠ ألف</b><p>جنيه لـ ٥٠ أسرة أولى بالرعاية</p></article><article><span>دعم المرضى</span><b>٢٠ ألف</b><p>جنيه علاج ومساعدات طبية</p></article></section>
    <section class="achievement-tracks section-pad"><SectionHead kicker="ما وراء الأرقام" title={'أعمالٌ تلمس<br/><em>كل جانب من الحياة.</em>'} /><div class="track-grid">{[['fa-heart-pulse', 'الصحة', 'عيادة أنف وأذن، تطوير كهرباء المستشفى، دواء شهري، دعم مرضى السرطان، ومساهمات في العمليات.'], ['fa-graduation-cap', 'التعليم', 'ماكينات تصوير للمدارس، تكريم المتفوقين، مصروفات وأدوات ومتابعة طوال العام.'], ['fa-book-quran', 'القرآن', 'حلقات للأطفال بمناهج مناسبة، معلمون مؤهلون، مسابقات في الحفظ والتجويد وجوائز قيّمة.'], ['fa-bowl-rice', 'الغذاء والأسرة', 'لحوم طازجة، كراتين رمضان، كسوة عيد، ووجبات ساخنة تصل إلى البيوت بكرامة.']].map(t => <article class="track-card reveal"><div>{icon(t[0])}</div><h3>{t[1]}</h3><p>{t[2]}</p></article>)}</div></section>
  </Layout>
}

export function Volunteers({ user }: { user?: UserSession }) {
  const roles = [['fa-people-carry-box', 'تطوع ميداني'], ['fa-user-doctor', 'تطوع طبي'], ['fa-laptop-code', 'تطوع رقمي'], ['fa-chalkboard-user', 'تطوع تعليمي'], ['fa-bullhorn', 'توعية وحملات'], ['fa-people-roof', 'رعاية أسر']]
  return <Layout user={user} title="تطوع معنا | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="كن جزءًا من الحكاية" title={'قد لا تتبرع بالمال،<br/><em>لكن وقتك ثروة.</em>'} text="موهبتك، خبرتك، أو حتى ساعتان من يومك قد تصنع فرقًا حقيقيًا في حياة إنسان." />
    <section class="roles section-pad">
      <div class="role-grid">{roles.map(r => <article class="role-card reveal">{icon(r[0])}<h3>{r[1]}</h3><p>شارك بمهارتك ضمن فريق يؤمن أن العمل المنظم والرحيم يصنع أثرًا أكبر.</p></article>)}</div>
      <form class="application-form ajax-form reveal" data-endpoint="/api/volunteers" method="post" id="volForm">
        <p class="eyebrow">طلب انضمام</p>
        <h2>أخبرنا كيف تحب أن تساعد.</h2>
        <div class="form-grid">
          <label>الاسم<input name="name" required /></label>
          <label>العمر<input name="age" type="number" min="16" /></label>
          <label>الهاتف<input name="phone" required /></label>
          <label>المدينة<input name="city" /></label>
          <label>المجال المفضل<select name="role">{roles.map(r => <option>{r[1]}</option>)}</select></label>
          <label>مهاراتك<input name="skills" /></label>
        </div>
        <button class="primary-btn">أرسل طلبي {icon('fa-arrow-left')}</button>
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

export function Gallery({ user }: { user?: UserSession }) {
  const galleryItems = [
    { title: 'قافلة الدفء والإطعام', location: 'كفر العنانية', img: '/static/img/gallery-1.jpg', tag: 'غذاء' },
    { title: 'مستلزمات مدرسية للأطفال', location: 'الدقهلية', img: '/static/img/gallery-2.jpg', tag: 'تعليم' },
    { title: 'الرعاية الطبية والدواء', location: 'مستشفى كفر العنانية', img: '/static/img/gallery-3.jpg', tag: 'صحة' },
    { title: 'تكريم حفظة القرآن الكريم', location: 'المؤسسة', img: '/static/img/gallery-4.jpg', tag: 'قرآن' },
    { title: 'كسوة العيد للأسر الأولى بالرعاية', location: 'كفر العنانية', img: '/static/img/gallery-5.jpg', tag: 'مجتمع' },
    { title: 'فرحة العطاء في الميدان', location: 'الدقهلية', img: '/static/img/gallery-6.jpg', tag: 'تطوع' },
    { title: 'مشروع الأضاحي السنوي', location: 'كفر العنانية', img: '/static/img/gallery-7.jpg', tag: 'موسمي' },
    { title: 'زيارات ودية وتكريم الأوائل', location: 'منازل الطلاب', img: '/static/img/gallery-8.jpg', tag: 'تعليم' }
  ]
  return <Layout user={user} title="معرض الصور | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="معرض الصور" title={'وجوهٌ ومواقف،<br/><em>تقول ما لا تقوله الأرقام.</em>'} text="لقطات من الميدان، صُنعت فيها الفرحة بأيدي المتطوعين وقلوب المتبرعين." />
    <section class="gallery-grid section-pad">
      {galleryItems.map((item, i) => (
        <article class={`gallery-tile tile-${i + 1} reveal`}>
          <div class="gallery-art" style={`background-image:url(${item.img});background-size:cover;background-position:center;`}>
            <span style="background:rgba(12,74,63,0.85);color:#fff">{item.tag}</span>
          </div>
          <p>{item.title}<small>{icon('fa-location-dot')} {item.location}</small></p>
        </article>
      ))}
    </section>
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
