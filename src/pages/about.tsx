import { pageHero, ctaBanner } from '../layout'
import { values, img } from '../data'

export const about = (stats: any = { total_donors: 0, total_campaigns: 0, total_volunteers: 0 }) => pageHero(
  'قصة عطاءٍ لا تتوقّف',
  'تعرّف على مؤسسة الدكتور عمر هشام الخيرية — رؤيتها، رسالتها، وقيمها التي تقود كل ما نفعله.',
  'من نحن'
) + `
<!-- Founder split -->
<section class="section">
  <div class="wrap">
    <div class="split">
      <div class="reveal-x">
        <div class="frame">
          <div class="frame-deco fd1"></div>
          <div class="frame-deco fd2"></div>
          <img src="/static/img/omar-portrait.png" alt="الدكتور عمر هشام">
        </div>
      </div>
      <div class="reveal d1">
        <span class="eyebrow">كلمة المؤسس</span>
        <h2 class="h-xl" style="margin:.8rem 0 1rem">الدكتور <span class="text-grad-blue">عمر هشام</span></h2>
        <p class="lead">«آمنتُ منذ البداية أن العطاء ليس فضلاً نمنّ به، بل واجبٌ إنساني وأمانةٌ في أعناقنا. أسّستُ هذه المؤسسة لتكون يدًا تمتد لكل محتاج، وجسرًا يصل المُحسن بمن يستحق العون.»</p>
        <p style="margin-top:1rem;color:var(--muted)">حملنا الرسالة من حلمٍ صغير إلى مؤسسةٍ تخدم عشرات الآلاف، ونعدكم أن نبقى أوفياء للأمانة، شفّافين في العمل، رحماء بالناس.</p>
        <div style="margin-top:1.6rem;display:flex;gap:1rem;align-items:center">
          <span class="avatar placeholder" style="width:56px;height:56px">ع</span>
          <div><b style="font-size:1.05rem">د. عمر هشام</b><br><span style="color:var(--muted);font-size:.9rem">المؤسس والرئيس التنفيذي</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Mission / Vision -->
<section class="section bg-aurora">
  <div class="wrap">
    <div class="grid cols-2">
      <div class="glass-card reveal-x">
        <div class="card-icon ic-blue"><i class="fas fa-eye"></i></div>
        <h3 class="h-lg">رؤيتنا</h3>
        <p class="lead" style="margin-top:.6rem">مجتمعٌ متكافلٌ مُمكَّن، لا يُترك فيه إنسانٌ دون رعاية، وتُتاح فيه فرص الحياة الكريمة للجميع.</p>
      </div>
      <div class="glass-card reveal d1">
        <div class="card-icon ic-emerald"><i class="fas fa-flag"></i></div>
        <h3 class="h-lg">رسالتنا</h3>
        <p class="lead" style="margin-top:.6rem">تقديم الإغاثة والرعاية الصحية والتعليمية والاجتماعية للفئات الأكثر احتياجًا، بأعلى معايير الأمانة والشفافية والأثر المستدام.</p>
      </div>
    </div>
  </div>
</section>

<!-- Values -->
<section class="section">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">ما يحرّكنا</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">قيمٌ نعيشها <span class="text-grad-gold">قبل أن نقولها</span></h2>
    </div>
    <div class="grid cols-4">
      ${values.map((v, i) => `
      <article class="card reveal d${(i % 4) + 1}" style="text-align:center">
        <div class="card-icon ${v.cls}" style="margin-inline:auto"><i class="fas ${v.icon}"></i></div>
        <h3>${v.title}</h3><p>${v.desc}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- Stats -->
<section class="section-tight">
  <div class="wrap">
    <div class="stats-strip reveal">
      <div class="grid cols-4">
        <div class="stat-item">
          <i class="fas fa-hand-holding-heart"></i>
          <div class="num"><span data-count="${stats.total_donors || 0}">0</span>+</div>
          <div class="lbl">مستفيد ومستفيدة</div>
        </div>
        <div class="stat-item">
          <i class="fas fa-bullhorn"></i>
          <div class="num"><span data-count="${stats.total_campaigns || 0}">0</span>+</div>
          <div class="lbl">حملة إنسانية</div>
        </div>
        <div class="stat-item">
          <i class="fas fa-hands-helping"></i>
          <div class="num"><span data-count="${stats.total_volunteers || 0}">0</span>+</div>
          <div class="lbl">متطوّع نشط</div>
        </div>
        <div class="stat-item">
          <i class="fas fa-globe"></i>
          <div class="num"><span data-count="14">0</span></div>
          <div class="lbl">محافظة نخدمها</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Team -->
<section class="section bg-cream">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">فريق العمل</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">أيادٍ <span class="text-grad-emerald">أمينة</span> خلف كل إنجاز</h2>
    </div>
    <div class="grid cols-4">
      ${[
        { n: 'د. عمر هشام', r: 'المؤسس والرئيس', i: 'fa-user-doctor' },
        { n: 'م. ليلى السيد', r: 'مدير العمليات', i: 'fa-user-tie' },
        { n: 'أ. كريم منصور', r: 'مدير الحملات', i: 'fa-bullhorn' },
        { n: 'د. هبة فؤاد', r: 'مدير البرامج الطبية', i: 'fa-stethoscope' },
      ].map((m, idx) => `
      <article class="card reveal d${idx + 1}" style="text-align:center">
        <div class="card-icon ic-blue" style="margin-inline:auto;width:84px;height:84px;border-radius:50%;font-size:2rem"><i class="fas ${m.i}"></i></div>
        <h3 style="font-size:1.1rem">${m.n}</h3>
        <p style="color:var(--blue-700);font-weight:700">${m.r}</p>
        <div class="social" style="justify-content:center;margin-top:.8rem">
          <a href="#" style="width:36px;height:36px;background:var(--cream);color:var(--ink-700)"><i class="fab fa-linkedin-in"></i></a>
          <a href="#" style="width:36px;height:36px;background:var(--cream);color:var(--ink-700)"><i class="fab fa-x-twitter"></i></a>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>

${ctaBanner()}
`
