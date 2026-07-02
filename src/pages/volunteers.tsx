import { pageHero, ctaBanner } from '../layout'

export const volunteersPage = (success = false, errorMsg: string | null = null) => pageHero(
  'كن متطوّعًا معنا',
  'وقتك ومهاراتك هدايا لا تُقدّر بثمن. انضمّ إلى أسرة المتطوّعين وكن جزءًا من صناعة الأثر.',
  'التطوّع'
) + `
<!-- roles -->
<section class="section">
  <div class="wrap">
    <div class="sec-head center">
      <span class="eyebrow reveal" style="justify-content:center">مجالات التطوّع</span>
      <h2 class="h-xl reveal d1" style="margin-top:.8rem">اختر <span class="text-grad-brand">دورك في العطاء</span></h2>
    </div>
    <div class="grid cols-3">
      ${[
        { i: 'fa-truck-medical', c: 'ic-crimson', t: 'التطوّع الميداني', d: 'المشاركة في توزيع المساعدات والقوافل الإغاثية على الأرض.' },
        { i: 'fa-stethoscope', c: 'ic-blue', t: 'التطوّع الطبي', d: 'أطباء وممرضون للمشاركة في القوافل الصحية المجانية.' },
        { i: 'fa-laptop-code', c: 'ic-emerald', t: 'التطوّع الرقمي', d: 'دعم تقني وتصميم وإدارة محتوى ووسائل تواصل.' },
        { i: 'fa-chalkboard-user', c: 'ic-gold', t: 'التطوّع التعليمي', d: 'تدريس ودروس تقوية وأنشطة للطلاب المكفولين.' },
        { i: 'fa-bullhorn', c: 'ic-blue', t: 'التوعية والحملات', d: 'نشر الوعي وتنظيم الفعاليات وجمع التبرّعات.' },
        { i: 'fa-hands-holding-child', c: 'ic-emerald', t: 'رعاية الأسر', d: 'متابعة الحالات وتقديم الدعم النفسي والاجتماعي.' },
      ].map((r, i) => `
      <article class="card role-card reveal d${(i % 3) + 1}">
        <div class="card-icon ${r.c}"><i class="fas ${r.i}"></i></div>
        <h3>${r.t}</h3><p>${r.d}</p>
        <a href="#volForm" class="card-link" style="justify-content:center">سجّل اهتمامك <i class="fas fa-arrow-left"></i></a>
      </article>`).join('')}
    </div>
  </div>
</section>

<!-- perks + form -->
<section class="section bg-cream" id="volForm">
  <div class="wrap">
    <div class="split" style="align-items:start">
      <div class="reveal-x">
        <span class="eyebrow">لماذا تتطوّع معنا؟</span>
        <h2 class="h-xl" style="margin:.8rem 0 1.4rem">تجربةٌ <span class="text-grad-emerald">تستحقها</span></h2>
        <ul class="feature-list">
          <li><span class="fi ic-emerald"><i class="fas fa-certificate"></i></span><div><b>شهادات معتمدة</b><p>وثّق ساعات تطوّعك بشهادات رسمية تدعم مسيرتك.</p></div></li>
          <li><span class="fi ic-blue"><i class="fas fa-people-group"></i></span><div><b>مجتمع ملهم</b><p>انضم لشبكة من المتطوّعين الشغوفين بالعطاء.</p></div></li>
          <li><span class="fi ic-gold"><i class="fas fa-graduation-cap"></i></span><div><b>تدريب وتطوير</b><p>ورش وبرامج لصقل مهاراتك القيادية والميدانية.</p></div></li>
          <li><span class="fi ic-crimson"><i class="fas fa-heart"></i></span><div><b>أثرٌ حقيقي</b><p>اشعر بمعنى العطاء حين تلمس حياة الناس بيديك.</p></div></li>
        </ul>
      </div>
      <div class="form-card reveal d1">
        <h3 class="h-lg" style="margin-bottom:1.2rem">استمارة التطوّع</h3>
        ${success ? '<div style="background:var(--emerald-600);color:#fff;padding:1rem;border-radius:.5rem;margin-bottom:1.5rem;text-align:center;font-weight:700"><i class="fas fa-check-circle"></i> شكرًا لك! تم تسجيل طلبك بنجاح وسنتواصل معك قريبًا.</div>' : ''}
        ${errorMsg ? `<div style="background:#e53935;color:#fff;padding:1rem;border-radius:.5rem;margin-bottom:1.5rem;text-align:center;font-weight:700"><i class="fas fa-exclamation-circle"></i> حدث خطأ: ${errorMsg}</div>` : ''}
        <form action="/api/volunteers" method="POST">
          <div class="grid cols-2" style="gap:0 1rem">
            <div class="field"><label>الاسم <span class="req">*</span></label><input name="full_name" required placeholder="اسمك الكامل"></div>
            <div class="field"><label>العمر</label><input name="age" type="number" placeholder="العمر"></div>
          </div>
          <div class="grid cols-2" style="gap:0 1rem">
            <div class="field"><label>الجوال <span class="req">*</span></label><input name="phone" required placeholder="01xxxxxxxxx"></div>
            <div class="field"><label>المدينة</label><input name="city" placeholder="المحافظة / المدينة"></div>
          </div>
          <div class="field"><label>مجال التطوّع المفضّل</label>
            <select name="preferred_role"><option>التطوّع الميداني</option><option>التطوّع الطبي</option><option>التطوّع الرقمي</option><option>التطوّع التعليمي</option><option>التوعية والحملات</option><option>رعاية الأسر</option></select>
          </div>
          <div class="field"><label>أوقات إتاحتك ومهاراتك</label><textarea name="skills" placeholder="أخبرنا عن مهاراتك والأوقات التي تستطيع التطوّع فيها"></textarea></div>
          <button type="submit" class="btn btn-primary btn-block btn-lg magnetic"><i class="fas fa-hands-helping"></i> أرسل طلب التطوّع</button>
        </form>
      </div>
    </div>
  </div>
</section>

${ctaBanner()}
`
