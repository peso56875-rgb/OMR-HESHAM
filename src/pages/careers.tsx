import { pageHero, ctaBanner } from '../layout'

export const careersPage = (jobs: any[] = []) => pageHero(
  'انضمّ إلى فريقنا',
  'ابنِ مسيرتك المهنية في بيئةٍ ملهمة، واجعل عملك اليومي رسالةً إنسانية تترك أثرًا.',
  'الوظائف'
) + `
<!-- why work with us -->
<section class="section">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">لماذا نحن؟</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">أكثر من <span class="text-grad-brand">مجرّد وظيفة</span></h2>
    </div>
    <div class="grid cols-4">
      ${[
        { i: 'fa-seedling', c: 'ic-emerald', t: 'رسالة ذات معنى', d: 'عملك يلامس حياة آلاف المحتاجين كل يوم.' },
        { i: 'fa-arrow-trend-up', c: 'ic-blue', t: 'نموّ مهني', d: 'مسارات تطوير وتدريب مستمر لصقل مهاراتك.' },
        { i: 'fa-people-roof', c: 'ic-gold', t: 'بيئة محفّزة', d: 'فريقٌ متعاون وثقافة عملٍ إيجابية وداعمة.' },
        { i: 'fa-scale-balanced', c: 'ic-crimson', t: 'توازن الحياة', d: 'مرونة في العمل واحترام لوقتك الشخصي.' },
      ].map((v, i) => `
      <article class="card reveal d${i + 1}" style="text-align:center">
        <div class="card-icon ${v.c}" style="margin-inline:auto"><i class="fas ${v.i}"></i></div>
        <h3 style="font-size:1.08rem">${v.t}</h3><p>${v.d}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- open positions -->
<section class="section bg-cream">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">الوظائف المتاحة</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">فرصٌ <span class="text-grad-emerald">في انتظارك</span></h2>
    </div>
    <div class="flow" style="max-width:900px;margin-inline:auto">
      ${jobs.length ? jobs.map((j: any, i: number) => `
      <article class="job-card reveal d${(i % 3) + 1}">
        <div style="display:flex;gap:1rem;align-items:center">
          <div class="card-icon ic-blue" style="margin:0;flex-shrink:0"><i class="fas fa-briefcase"></i></div>
          <div>
            <b style="font-size:1.12rem">${j.title}</b>
            <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.4rem">
              <span class="chip chip-blue"><i class="fas fa-building"></i> ${j.department}</span>
              <span class="chip"><i class="fas fa-location-dot"></i> ${j.location}</span>
              <span class="chip chip-emerald"><i class="fas fa-clock"></i> ${j.job_type}</span>
            </div>
          </div>
        </div>
        <a href="#applyForm" class="btn btn-primary btn-sm magnetic">تقدّم الآن <i class="fas fa-arrow-left"></i></a>
      </article>`).join('') : '<p style="text-align:center;color:var(--muted);padding:2rem">لا توجد شواغر حالياً.</p>'}
    </div>
  </div>
</section>

<!-- application form -->
<section class="section" id="applyForm">
  <div class="wrap" style="max-width:760px">
    <div class="form-card reveal-scale">
      <div class="sec-head center" style="margin-bottom:2rem">
        <h2 class="h-lg">قدّم طلبك</h2>
        <p style="color:var(--muted)">املأ النموذج وأرفق سيرتك الذاتية وسنتواصل معك.</p>
      </div>
      <form data-toast="تم استلام طلبك بنجاح، سنتواصل معك قريبًا 📩">
        <div class="grid cols-2" style="gap:0 1rem">
          <div class="field"><label>الاسم الكامل <span class="req">*</span></label><input required placeholder="اسمك"></div>
          <div class="field"><label>البريد <span class="req">*</span></label><input type="email" required placeholder="email@example.com"></div>
        </div>
        <div class="grid cols-2" style="gap:0 1rem">
          <div class="field"><label>الجوال <span class="req">*</span></label><input required placeholder="01xxxxxxxxx"></div>
          <div class="field"><label>الوظيفة المتقدّم لها</label><select>${jobs.map(j => `<option value="${j.id}">${j.title}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label>نبذة عنك</label><textarea placeholder="أخبرنا عن خبراتك ولماذا ترغب بالانضمام إلينا"></textarea></div>
        <div class="field"><label>السيرة الذاتية (PDF)</label><input type="file" accept=".pdf,.doc,.docx"></div>
        <button type="submit" class="btn btn-primary btn-block btn-lg magnetic"><i class="fas fa-paper-plane"></i> إرسال الطلب</button>
      </form>
    </div>
  </div>
</section>

${ctaBanner()}
`
