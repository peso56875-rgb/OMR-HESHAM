import { pageHero } from '../layout'

export const contactPage = (success = false, errorMsg: string | null = null) => pageHero(
  'تواصل معنا',
  'نحن هنا لسماعك. سواء كان لديك استفسار، اقتراح، أو رغبة في الشراكة — لا تتردّد في مراسلتنا.',
  'تواصل معنا'
) + `
<section class="section">
  <div class="wrap">
    <div class="grid cols-3" style="margin-bottom:3rem">
      ${[
        { i: 'fa-location-dot', c: 'ic-blue', t: 'العنوان', d: 'القاهرة، جمهورية مصر العربية<br>يتم التحديث' },
        { i: 'fa-phone-volume', c: 'ic-emerald', t: 'الهاتف', d: 'يتم التحديث' },
        { i: 'fa-envelope-open-text', c: 'ic-gold', t: 'البريد', d: 'يتم التحديث' },
      ].map((m, i) => `
      <article class="card reveal d${i + 1}" style="text-align:center">
        <div class="card-icon ${m.c}" style="margin-inline:auto"><i class="fas ${m.i}"></i></div>
        <h3>${m.t}</h3><p>${m.d}</p>
      </article>`).join('')}
    </div>

    <div class="split" style="align-items:start">
      <div class="form-card reveal-x">
        <h2 class="h-lg" style="margin-bottom:.4rem">أرسل لنا رسالة</h2>
        <p style="color:var(--muted);margin-bottom:1.6rem">سنردّ عليك خلال ٢٤–٤٨ ساعة عمل.</p>
        ${success ? '<div style="background:var(--emerald-600);color:#fff;padding:1rem;border-radius:.5rem;margin-bottom:1.5rem;text-align:center;font-weight:700"><i class="fas fa-check-circle"></i> تم إرسال رسالتك بنجاح، شكرًا لتواصلك 💌</div>' : ''}
        ${errorMsg ? `<div style="background:#e53935;color:#fff;padding:1rem;border-radius:.5rem;margin-bottom:1.5rem;text-align:center;font-weight:700"><i class="fas fa-exclamation-circle"></i> حدث خطأ: ${errorMsg}</div>` : ''}
        <form action="/api/contact" method="POST">
          <div class="grid cols-2" style="gap:0 1rem">
            <div class="field"><label>الاسم <span class="req">*</span></label><input name="name" required placeholder="اسمك الكريم"></div>
            <div class="field"><label>البريد <span class="req">*</span></label><input name="email" type="email" required placeholder="email@example.com"></div>
          </div>
          <div class="grid cols-2" style="gap:0 1rem">
            <div class="field"><label>الجوال</label><input name="phone" placeholder="01xxxxxxxxx"></div>
            <div class="field"><label>الموضوع</label><select name="subject"><option>استفسار عام</option><option>شراكة</option><option>شكوى أو اقتراح</option><option>إعلام وصحافة</option></select></div>
          </div>
          <div class="field"><label>رسالتك <span class="req">*</span></label><textarea name="message" required placeholder="اكتب رسالتك هنا..."></textarea></div>
          <button type="submit" class="btn btn-primary btn-block btn-lg magnetic"><i class="fas fa-paper-plane"></i> إرسال الرسالة</button>
        </form>
      </div>

      <div class="reveal d1">
        <div class="frame" style="aspect-ratio:4/3;background:var(--grad-hero);display:grid;place-items:center;color:#fff;text-align:center">
          <div><i class="fas fa-map-location-dot" style="font-size:3rem;color:var(--gold-400)"></i><p style="margin-top:1rem;font-weight:800">القاهرة · مدينة نصر</p><p style="color:rgba(255,255,255,.7);font-size:.9rem">موقعنا على الخريطة</p></div>
        </div>
        <div class="card" style="margin-top:1.4rem">
          <h3 style="margin-bottom:1rem"><i class="fas fa-clock" style="color:var(--blue-600)"></i> ساعات العمل</h3>
          <div class="metric-row"><span>السبت – الخميس</span><b>٩ ص – ٥ م</b></div>
          <div class="metric-row"><span>الجمعة</span><b style="color:var(--crimson)">إجازة</b></div>
          <div class="social" style="margin-top:1.2rem">
            <a href="#" style="background:var(--cream);color:var(--ink-700)"><i class="fab fa-facebook-f"></i></a>
            <a href="#" style="background:var(--cream);color:var(--ink-700)"><i class="fab fa-x-twitter"></i></a>
            <a href="#" style="background:var(--cream);color:var(--ink-700)"><i class="fab fa-instagram"></i></a>
            <a href="#" style="background:var(--cream);color:var(--ink-700)"><i class="fab fa-whatsapp"></i></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
`
