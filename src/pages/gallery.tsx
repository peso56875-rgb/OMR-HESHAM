import { pageHero, ctaBanner } from '../layout'
import { img } from '../data'

const photos: any[] = []

export const galleryPage = () => pageHero(
  'معرض الصور',
  'لحظاتٌ من الميدان توثّق رحلة العطاء، وتروي قصص الأمل التي صنعناها معًا.',
  'معرض الصور'
) + `
<section class="section">
  <div class="wrap">
    <div class="center" style="margin-bottom:2.4rem">
      <div class="tabs" id="galFilter">
        <button class="tab active" data-filter="all">الكل</button>
        <button class="tab" data-filter="صحة">صحة</button>
        <button class="tab" data-filter="غذاء">غذاء</button>
        <button class="tab" data-filter="تعليم">تعليم</button>
        <button class="tab" data-filter="ميدان">ميدان</button>
      </div>
    </div>
    <div class="masonry reveal">
      ${photos.length > 0 ? photos.map((p, i) => `
      <div class="g-item">
        <img src="${img(p.id, 600, p.h)}" alt="${p.t}" loading="lazy">
        <div class="g-overlay"><span><i class="fas fa-camera"></i> ${p.t}</span></div>
      </div>`).join('') : '<p style="text-align:center;grid-column:1/-1;color:var(--muted);padding:4rem 0;font-size:1.1rem">سيتم إضافة صور المعرض قريباً.</p>'}
    </div>
  </div>
</section>

<!-- video block -->
<section class="section bg-cream">
  <div class="wrap">
    <div class="split">
      <div class="reveal-x">
        <span class="eyebrow">شاهد قصتنا</span>
        <h2 class="h-xl" style="margin:.8rem 0 1rem">رحلةٌ من <span class="text-grad-blue">العطاء</span> بالصورة والصوت</h2>
        <p class="lead">شاهد كيف يتحوّل تبرّعك إلى ابتسامةٍ على وجه طفل، وإلى أملٍ في قلب أسرة. وثائقيٌّ قصير من قلب الميدان.</p>
        <a href="/campaigns" class="btn btn-primary magnetic" style="margin-top:1.4rem"><i class="fas fa-heart"></i> ادعم حملاتنا</a>
      </div>
      <div class="reveal d1 frame" style="aspect-ratio:16/9;display:grid;place-items:center;background:var(--grad-hero);cursor:pointer">
        <button class="lang-btn" style="width:84px;height:84px;font-size:1.8rem;background:rgba(255,255,255,.95);color:var(--blue-700)"><i class="fas fa-play"></i></button>
      </div>
    </div>
  </div>
</section>

${ctaBanner()}
`
