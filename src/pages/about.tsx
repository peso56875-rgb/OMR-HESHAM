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
          <img src="/static/img/omar-portrait.png" alt="الدكتور عمر هشام رحمه الله">
        </div>
        <p style="text-align:center;margin-top:1rem;color:var(--muted);font-style:italic">المرحوم الدكتور عمر هشام (رحمه الله)</p>
      </div>
      <div class="reveal d1">
        <span class="eyebrow">قصة الأثر والوفاء</span>
        <h2 class="h-xl" style="margin:.8rem 0 1rem">تأسيس <span class="text-grad-blue">وفاءً لذكراه</span></h2>
        <p class="lead">«لم يكن عمر مجرد ابن، بل كان طالباً متميزاً في كلية الطب، يحمل في قلبه حلم مداواة الناس والتخفيف عنهم. بعد أن اختاره الله إلى جواره، أردت أن يمتد حلمه وألا ينقطع أثره الطيب عن الدنيا.»</p>
        <p style="margin-top:1rem;color:var(--muted)">أسستُ هذه المؤسسة الخيرية كصدقة جارية لتكون يداً ممتدة لكل مريض ومحتاج، ولتستمر رسالة ابني الحبيب في نشر الخير والرحمة والإحسان بين الناس.</p>
        <div style="margin-top:1.6rem;display:flex;gap:1rem;align-items:center">
          <span class="avatar placeholder" style="width:56px;height:56px">هـ</span>
          <div><b style="font-size:1.05rem">المهندس هشام صبري</b><br><span style="color:var(--muted);font-size:.9rem">مؤسس المؤسسة ووالد الدكتور عمر</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Prayers and Remembrance -->
<section class="section bg-cream" style="border-top: 1px solid rgba(12,26,43,.05); border-bottom: 1px solid rgba(12,26,43,.05);">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">دعاء وصدقة</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">أدعية وأذكار <span class="text-grad-emerald">للدكتور عمر هشام</span></h2>
      <p class="lead" style="margin-top:1rem">شاركنا بالدعاء لفقيدنا الشاب الدكتور عمر هشام، نسأل الله أن يتقبله في الصالحين ويجعل هذا العمل شفيعاً له.</p>
    </div>
    
    <div class="grid cols-3">
      <article class="card reveal d1" style="text-align:center; display:flex; flex-direction:column; justify-content:center; padding:2rem;">
        <div class="card-icon ic-blue" style="margin-inline:auto"><i class="fas fa-hands-praying"></i></div>
        <h3>دعاء للمتوفى</h3>
        <p style="font-size:1.05rem; line-height:1.8; color:var(--ink-700); margin-top:1rem">«اللهم اغفر له وارحمه، وعافه واعف عنه، وأكرم نزله، ووسع مدخله، واغسله بالماء والثلج والبرد، ونقه من الخطايا كما ينقى الثوب الأبيض من الدنس.»</p>
      </article>
      
      <article class="card reveal d2" style="text-align:center; display:flex; flex-direction:column; justify-content:center; padding:2rem;">
        <div class="card-icon ic-gold" style="margin-inline:auto"><i class="fas fa-book-quran"></i></div>
        <h3>سورة الفاتحة</h3>
        <p style="font-size:1.1rem; line-height:2; font-weight:700; color:var(--blue-900); margin-top:1rem" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾
        </p>
      </article>

      <article class="card reveal d3" style="text-align:center; display:flex; flex-direction:column; justify-content:center; padding:2rem;">
        <div class="card-icon ic-emerald" style="margin-inline:auto"><i class="fas fa-heart-pulse"></i></div>
        <h3>دعاء الأثر والقبول</h3>
        <p style="font-size:1.05rem; line-height:1.8; color:var(--ink-700); margin-top:1rem">«اللهم اجعل كل عمل خيري وعلاج لمريض ومساعدة لمحتاج تقوم بها هذه المؤسسة صدقة جارية في ميزان حسنات عمر، واجعله شفيعاً له ومقراً لعينيه في جنات النعيم.»</p>
      </article>
    </div>

    <div class="center" style="margin-top:3rem">
      <button onclick="if(window.__toast) window.__toast('جزاك الله خيراً، وتقبل الله دعاءك ورحم فقيدنا وغفر له وجعل مثواه الجنة.')" class="btn btn-primary btn-lg magnetic">
        <i class="fas fa-circle-check"></i> قرأت الفاتحة وتمنيت له الرحمة
      </button>
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
      <span class="eyebrow reveal" style="justify-content:center">مجلس الأمناء</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">إدارة <span class="text-grad-emerald">المؤسسة</span></h2>
    </div>
    <div class="grid cols-4">
      ${[
        { n: 'المهندس هشام صبري', r: 'المؤسس ورئيس الأمناء', i: 'fa-user-tie' },
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
