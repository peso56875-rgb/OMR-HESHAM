import { pageHero } from '../layout'

export const donatePage = () => pageHero(
  'تبرّع الآن',
  'أضحيتك أجر لك وفرحة لهم. عطاؤك أمانة تصل بشفافية وأمانة إلى مستحقيها.',
  'تبرّع'
) + `
<section class="section">
  <div class="wrap">
    <div class="split" style="align-items:start">
      <!-- Donation form -->
      <div class="form-card reveal-x">
        <h2 class="h-lg" style="margin-bottom:.4rem">أكمِل تبرّعك</h2>
        <p style="color:var(--muted);margin-bottom:1.6rem">معاملةٌ آمنة ومشفّرة بالكامل <i class="fas fa-lock" style="color:var(--emerald-700)"></i></p>

        <form id="donateForm" method="POST" action="/api/donations/add">
          <input type="hidden" name="donation_type" id="donationTypeInput" value="once">
          <input type="hidden" name="amount" id="amountInput" value="500">
          <input type="hidden" name="payment_method" id="paymentInput" value="instapay">

          <div class="field">
            <label>نوع التبرّع</label>
            <div class="tabs" style="display:flex" id="donateType">
              <button type="button" class="tab active" data-type="once" style="flex:1" onclick="document.getElementById('donationTypeInput').value='once';this.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));this.classList.add('active')">مرة واحدة</button>
              <button type="button" class="tab" data-type="monthly" style="flex:1" onclick="document.getElementById('donationTypeInput').value='monthly';this.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));this.classList.add('active')">شهري</button>
            </div>
          </div>

          <div class="field">
            <label>اختر المبلغ (ج.م) <span class="req">*</span></label>
            <div class="amount-grid" id="amountGrid">
              ${[100, 500, 1000, 11000].map((a, i) => `<button type="button" class="amount-opt${i === 1 ? ' active' : ''}" data-amt="${a}" onclick="document.getElementById('amountInput').value='${a}';document.getElementById('customAmt').value='';document.getElementById('sumAmt').textContent='${a.toLocaleString('ar-EG')}';this.parentElement.querySelectorAll('.amount-opt').forEach(o=>o.classList.remove('active'));this.classList.add('active')">${a === 11000 ? '١١,٠٠٠ (صك أضحية)' : a.toLocaleString('ar-EG')}</button>`).join('')}
            </div>
          </div>

          <div class="field">
            <label for="customAmt">أو مبلغ آخر</label>
            <input type="number" id="customAmt" placeholder="أدخل المبلغ" min="10" oninput="document.getElementById('amountInput').value=this.value;document.getElementById('sumAmt').textContent=Number(this.value||0).toLocaleString('ar-EG');this.parentElement.parentElement.querySelectorAll('.amount-opt').forEach(o=>o.classList.remove('active'))">
          </div>

          <div class="grid cols-2" style="gap:0 1rem">
            <div class="field"><label for="dn">الاسم <span class="req">*</span></label><input id="dn" name="donor_name" required placeholder="اسمك الكريم"></div>
            <div class="field"><label for="dp">الجوال <span class="req">*</span></label><input id="dp" name="donor_phone" required placeholder="01xxxxxxxxx"></div>
          </div>
          <div class="field"><label for="de">البريد الإلكتروني</label><input type="email" id="de" name="donor_email" placeholder="email@example.com"></div>

          <div class="field">
            <label>طريقة الدفع</label>
            <div class="grid cols-3" style="gap:.7rem">
              <label class="amount-opt active" style="display:flex;gap:.5rem;align-items:center;justify-content:center;cursor:pointer" onclick="document.getElementById('paymentInput').value='instapay';this.parentElement.querySelectorAll('.amount-opt').forEach(o=>o.classList.remove('active'));this.classList.add('active')"><i class="fas fa-mobile-screen-button"></i> إنستاباي</label>
              <label class="amount-opt" style="display:flex;gap:.5rem;align-items:center;justify-content:center;cursor:pointer" onclick="document.getElementById('paymentInput').value='vodafone_cash';this.parentElement.querySelectorAll('.amount-opt').forEach(o=>o.classList.remove('active'));this.classList.add('active')"><i class="fas fa-wallet"></i> فودافون كاش</label>
              <label class="amount-opt" style="display:flex;gap:.5rem;align-items:center;justify-content:center;cursor:pointer" onclick="document.getElementById('paymentInput').value='cash';this.parentElement.querySelectorAll('.amount-opt').forEach(o=>o.classList.remove('active'));this.classList.add('active')"><i class="fas fa-money-bill-wave"></i> نقدي</label>
            </div>
          </div>

          <button type="submit" class="btn btn-gold btn-block btn-lg magnetic" style="margin-top:1rem"><i class="fas fa-hand-holding-heart"></i> تبرّع بـ <span id="sumAmt">٥٠٠</span> ج.م</button>
          <p class="center" style="margin-top:1rem;color:var(--muted);font-size:.85rem"><i class="fas fa-shield-halved" style="color:var(--emerald-700)"></i> تقبل الله منا ومنكم صالح الأعمال</p>
        </form>
      </div>

      <!-- Side info - Real Payment Methods -->
      <div class="reveal d1">
        
        <!-- InstaPay Bank Transfer -->
        <div class="card" style="margin-bottom:1.4rem;border-right:4px solid var(--brand-gold)">
          <h3 style="margin-bottom:1.2rem;display:flex;align-items:center;gap:.8rem">
            <i class="fas fa-building-columns" style="color:var(--brand-gold)"></i> التحويل البنكي عبر إنستاباي
          </h3>
          <div style="background:var(--bg-muted);padding:1.2rem;border-radius:.8rem;margin-bottom:1rem">
            <p style="margin-bottom:.5rem"><strong>البنك:</strong> البنك الزراعي المصري</p>
            <p style="margin-bottom:.5rem"><strong>رقم الحساب:</strong></p>
            <div style="background:var(--ink-100);color:var(--ink-900);border:1px dashed var(--ink-300);padding:.8rem 1rem;border-radius:.5rem;font-family:monospace;font-size:1.1rem;text-align:center;letter-spacing:2px;direction:ltr" onclick="navigator.clipboard.writeText('10010397596901014');if(window.__toast) window.__toast('تم نسخ رقم الحساب ✅');" style="cursor:pointer">
              10010397596901014
            </div>
            <p style="text-align:center;margin-top:.5rem;color:var(--muted);font-size:.8rem">اضغط للنسخ</p>
          </div>
          <ol style="padding-right:1.2rem;line-height:2;color:var(--ink-700);font-size:.95rem">
            <li>افتح تطبيق إنستاباي</li>
            <li>اختر <strong>تحويل بنكي / Bank Transfer</strong></li>
            <li>اختر <strong>البنك الزراعي المصري</strong></li>
            <li>أدخل رقم الحساب أعلاه</li>
            <li>اكتب المبلغ المراد التبرع به</li>
            <li>تأكيد التحويل ✅</li>
          </ol>
        </div>

        <!-- InstaPay Phone -->
        <div class="card" style="margin-bottom:1.4rem;border-right:4px solid #2ecc71">
          <h3 style="margin-bottom:1rem;display:flex;align-items:center;gap:.8rem">
            <i class="fas fa-mobile-screen-button" style="color:#2ecc71"></i> إنستاباي / فودافون كاش
          </h3>
          <div style="background:var(--bg-muted);padding:1.2rem;border-radius:.8rem;text-align:center" onclick="navigator.clipboard.writeText('01060920249');if(window.__toast) window.__toast('تم نسخ الرقم ✅');" style="cursor:pointer">
            <p style="font-size:1.4rem;font-weight:800;color:var(--ink-900);direction:ltr;letter-spacing:1px">01060920249</p>
            <p style="color:var(--muted);font-size:.85rem;margin-top:.4rem">اضغط للنسخ — يعمل على إنستاباي وفودافون كاش</p>
          </div>
        </div>

        <!-- Cash -->
        <div class="card" style="margin-bottom:1.4rem;border-right:4px solid var(--blue-600)">
          <h3 style="margin-bottom:.8rem;display:flex;align-items:center;gap:.8rem">
            <i class="fas fa-money-bill-wave" style="color:var(--blue-600)"></i> الدفع المباشر نقدياً
          </h3>
          <p style="line-height:1.8">يمكنكم التبرع نقدياً عبر:</p>
          <p style="font-weight:800;font-size:1.1rem;margin-top:.5rem"><i class="fas fa-user-tie" style="color:var(--brand-gold)"></i> الأستاذ جمال عبد الخالق</p>
          <p style="color:var(--muted);font-size:.9rem;margin-top:.3rem">المقر: كفر العنانية</p>
        </div>

        <!-- Adahi/Sacrifice -->
        <div class="glass-card" style="background:var(--grad-hero);color:#fff">
          <div class="card-icon ic-gold" style="margin-bottom:1rem"><i class="fas fa-cow"></i></div>
          <h3 style="color:#fff">ساهم في صكوك الأضاحي 🐑</h3>
          <p style="color:rgba(255,255,255,.85);margin-top:.5rem;font-size:1rem">أضحيتك أجر لك وفرحة لهم. شارك فرحة العيد.</p>
          <div style="display:flex;gap:1rem;margin-top:1.2rem;flex-wrap:wrap">
            <div style="flex:1;min-width:140px;background:rgba(255,255,255,.12);padding:1rem;border-radius:.8rem;text-align:center">
              <div style="font-size:1.6rem;font-weight:800">٥٠٠ ج.م</div>
              <div style="opacity:.7;font-size:.85rem">صك الصدقة</div>
            </div>
            <div style="flex:1;min-width:140px;background:rgba(255,255,255,.15);padding:1rem;border-radius:.8rem;text-align:center;border:1px solid rgba(212,175,55,.4)">
              <div style="font-size:1.6rem;font-weight:800;color:var(--brand-gold)">١١,٠٠٠ ج.م</div>
              <div style="opacity:.7;font-size:.85rem">صك الأضحية الكامل</div>
            </div>
          </div>
          <p style="opacity:.6;margin-top:1rem;font-size:.85rem;text-align:center">تقبل الله منا ومنكم صالح الأعمال وجعلها في ميزان حسناتكم</p>
        </div>

      </div>
    </div>
  </div>
</section>

<script>
// Show success/error toast from query params
(function(){
  const p = new URLSearchParams(window.location.search);
  if(p.get('success')==='1') {
    setTimeout(function(){ if(window.__toast) window.__toast('جزاك الله خيرًا 💚 تم استلام تبرّعك بنجاح'); }, 600);
    history.replaceState(null,'','/donate');
  }
  if(p.get('error')) {
    setTimeout(function(){ if(window.__toast) window.__toast('حدث خطأ، يرجى المحاولة مرة أخرى'); }, 600);
    history.replaceState(null,'','/donate');
  }
})();
</script>
`

