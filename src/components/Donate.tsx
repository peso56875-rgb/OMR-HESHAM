import { icon, Layout, PageHero } from './shared'
import type { UserSession } from '../types'

export function Donate({
  user,
  campaigns = [],
  selectedCampaignId,
  selectedCaseId,
  selectedCaseCode,
  selectedCaseTitle,
  initialAmount,
  donationPurpose
}: {
  user?: UserSession
  campaigns?: any[]
  selectedCampaignId?: string
  selectedCaseId?: string
  selectedCaseCode?: string
  selectedCaseTitle?: string
  initialAmount?: number | string
  donationPurpose?: string
}) {
  const defaultAmount = initialAmount ? Number(initialAmount) || 500 : 500

  return <Layout user={user} title="تبرّع الآن | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="تبرّع الآن" title={'عطاؤك اليوم،<br/><em>قد يغيّر غدًا كاملًا.</em>'} text="اختر الطريقة الأنسب لك. كل مساهمة تصل لأصحابها بكرامة وخصوصية وتوثيق محكم." />
    <section class="donate-layout section-pad">
      <div class="donation-journey reveal">
        <p class="eyebrow"><span></span>حدد مساهمتك</p>
        <h2>كم تريد أن تزرع من الخير؟</h2>

        {selectedCaseId && (
          <div class="dedicated-case-banner" style="background:rgba(22,138,112,.08); border:1.5px solid var(--emerald-600); border-radius:14px; padding:14px 18px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:12px">
              <div style="width:40px; height:40px; border-radius:10px; background:var(--emerald-600); color:#fff; display:grid; place-items:center; font-size:1.15rem">
                {icon('fa-hand-holding-heart')}
              </div>
              <div>
                <small style="color:var(--muted); font-size:.8rem; font-weight:700">تبرع مخصص لكفالة حالة إنسانية:</small>
                <div style="font-weight:900; color:var(--heading); font-size:1.05rem">
                  {selectedCaseCode || 'حالة خاصة'} {selectedCaseTitle ? `— ${selectedCaseTitle}` : ''}
                </div>
              </div>
            </div>
            <a href="/donate" class="outline-btn" style="font-size:.8rem; padding:4px 12px; border-radius:8px" title="إلغاء التخصيص والعودة للصندوق العام">
              {icon('fa-xmark')} إلغاء التخصيص
            </a>
          </div>
        )}

        {donationPurpose && !selectedCaseId && (
          <div class="dedicated-purpose-banner" style="background:rgba(217,119,6,.08); border:1.5px solid var(--gold-600); border-radius:14px; padding:12px 18px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap">
            <div style="display:flex; align-items:center; gap:12px">
              <div style="width:40px; height:40px; border-radius:10px; background:var(--gold-600); color:#fff; display:grid; place-items:center; font-size:1.15rem">
                {icon('fa-scale-balanced')}
              </div>
              <div>
                <small style="color:var(--muted); font-size:.8rem; font-weight:700">مصرف المساهمة الشرعية:</small>
                <div style="font-weight:900; color:var(--heading); font-size:1.05rem">{donationPurpose}</div>
              </div>
            </div>
            <a href="/donate" class="outline-btn" style="font-size:.8rem; padding:4px 12px; border-radius:8px">
              {icon('fa-xmark')} مساهمة عامة
            </a>
          </div>
        )}

        <form class="donation-form ajax-form" data-endpoint="/api/donations/add" method="post">
          <input type="hidden" name="case_id" value={selectedCaseId || ''} />
          <input type="hidden" name="case_code" value={selectedCaseCode || ''} />
          <input type="hidden" name="case_title" value={selectedCaseTitle || ''} />
          <input type="hidden" name="donation_purpose" value={donationPurpose || ''} />

          <div class="amount-picks" id="amount-picks-container">
            <button type="button" class={defaultAmount === 100 ? 'active' : ''} data-amount="100">١٠٠ ج.م</button>
            <button type="button" class={defaultAmount === 500 ? 'active' : ''} data-amount="500">٥٠٠ ج.م</button>
            <button type="button" class={defaultAmount === 1000 ? 'active' : ''} data-amount="1000">١٬٠٠٠ ج.م</button>
            <button type="button" class={defaultAmount === 5000 ? 'active' : ''} data-amount="5000">٥٬٠٠٠ ج.م</button>
          </div>
          <label>مبلغ التبرّع <span>بالجنيه المصري</span><input type="number" name="amount" id="amount-input" value={String(defaultAmount)} min="1" required /></label>
          <div class="form-grid">
            <label>الاسم الكريم<input name="name" required placeholder="الاسم بالكامل" /></label>
            <label>رقم الهاتف<input name="phone" required inputmode="tel" placeholder="01xxxxxxxxx" /></label>
          </div>
          <label>البريد الإلكتروني <span>اختياري</span><input type="email" name="email" placeholder="name@example.com" /></label>
          {campaigns.length > 0 && !selectedCaseId && <label>الحملة المستهدفة <span>اختياري</span><select name="campaign_id"><option value="">الصندوق العام (لكل أعمال الخير)</option>{campaigns.map((cp: any) => <option value={cp.id} selected={cp.id === selectedCampaignId}>{cp.title}</option>)}</select></label>}
          
          <fieldset class="payment-methods-fieldset">
            <legend>طريقة التبرّع والتحويل</legend>
            <div class="payment-methods-grid">
              <label class="method-option method-instapay">
                <input type="radio" name="method" value="instapay" checked />
                <span class="method-box">
                  <i class="method-logo"><img src="/static/img/instapay-logo.png" alt="InstaPay" loading="lazy" /></i>
                  <div class="method-info">
                    <b>إنستاباي (InstaPay)</b>
                    <small>تحويل فوري 24/7 بدون رسوم</small>
                  </div>
                  <button type="button" class="view-pay-info-btn" data-pay-modal="instapay">{icon('fa-eye')} التفاصيل</button>
                </span>
              </label>

              <label class="method-option method-vodafone">
                <input type="radio" name="method" value="vodafone" />
                <span class="method-box">
                  <i class="method-logo"><img src="/static/img/vodafone-cash-logo.png" alt="Vodafone Cash" loading="lazy" /></i>
                  <div class="method-info">
                    <b>فودافون كاش</b>
                    <small>تحويل فوري عبر المحفظة</small>
                  </div>
                  <button type="button" class="view-pay-info-btn" data-pay-modal="vodafone">{icon('fa-eye')} التفاصيل</button>
                </span>
              </label>

              <label class="method-option method-bank">
                <input type="radio" name="method" value="bank" />
                <span class="method-box">
                  <i class="method-logo bank-icon">{icon('fa-building-columns')}</i>
                  <div class="method-info">
                    <b>البنك الزراعي المصري</b>
                    <small>تحويل بنكي مباشر للحساب</small>
                  </div>
                  <button type="button" class="view-pay-info-btn" data-pay-modal="bank">{icon('fa-eye')} التفاصيل</button>
                </span>
              </label>

              <label class="method-option method-cash">
                <input type="radio" name="method" value="cash" />
                <span class="method-box">
                  <i class="method-logo cash-icon">{icon('fa-money-bill-wave')}</i>
                  <div class="method-info">
                    <b>دفع نقدي مباشر</b>
                    <small>تحصيل ميداني أو بمقر المؤسسة</small>
                  </div>
                </span>
              </label>
            </div>
          </fieldset>

          <button class="primary-btn submit-btn" type="submit">تسجيل مساهمتي الآن {icon('fa-arrow-left')}</button>
          <p class="privacy-note">{icon('fa-lock')} جميع البيانات مشفرة ومحفوظة بأمان تام.</p>
        </form>
      </div>

      <aside class="payment-panel reveal">
        <div class="trust-badge-card">
          <i class="fa-solid fa-shield-halved"></i>
          <div>
            <b>جهة رسمية موثّقة</b>
            <small>مؤسسة الدكتور عمر هشام مشهرة برقم <b>3115 لسنة 2026</b> وخاضعة لإشراف وزارة التضامن الاجتماعي والجهات الرقابية المختصة.</small>
          </div>
        </div>

        <div class="quick-pay-cards">
          <h3><i class="fa-solid fa-qrcode"></i> بيانات التحويل المالي المباشر</h3>
          <p>اضغط على أي وسيلة لعرض رقم الحساب والنسخ بلمسة واحدة:</p>

          <article class="pay-quick-item" data-pay-modal="instapay">
            <div class="pay-quick-head">
              <img src="/static/img/instapay-logo.png" alt="InstaPay" />
              <span>إنستاباي — InstaPay</span>
            </div>
            <strong dir="ltr">01060920249</strong>
            <button type="button" class="pay-quick-btn">{icon('fa-copy')} عرض الرقم والنسخ</button>
          </article>

          <article class="pay-quick-item" data-pay-modal="vodafone">
            <div class="pay-quick-head">
              <img src="/static/img/vodafone-cash-logo.png" alt="Vodafone Cash" />
              <span>فودافون كاش — Vodafone Cash</span>
            </div>
            <strong dir="ltr">01060920249</strong>
            <button type="button" class="pay-quick-btn">{icon('fa-copy')} عرض الرقم والنسخ</button>
          </article>

          <article class="pay-quick-item" data-pay-modal="bank">
            <div class="pay-quick-head">
              {icon('fa-building-columns')}
              <span>البنك الزراعي المصري</span>
            </div>
            <strong dir="ltr">10010397596901014</strong>
            <button type="button" class="pay-quick-btn">{icon('fa-copy')} عرض الحساب والنسخ</button>
          </article>
        </div>

        <article class="voucher-card">
          <span>{icon('fa-cow')}</span>
          <div>
            <small>صك الأضحية والخير</small>
            <h3>شارك في فرحة الموسم</h3>
            <p><b>٥٠٠ ج.م</b> صك خيري <i></i> <b>١١٬٠٠٠ ج.م</b> أضحية كاملة</p>
          </div>
        </article>

        <article class="donor-certificate-aside-card" style="margin-top:16px; background:linear-gradient(135deg, rgba(22,138,112,0.08), rgba(217,119,6,0.08)); border:1px solid rgba(22,138,112,0.25); border-radius:14px; padding:16px; display:flex; gap:12px; align-items:center">
          <div style="width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg, var(--emerald-600), var(--emerald-800)); color:#fff; display:grid; place-items:center; font-size:1.15rem; flex-shrink:0">
            {icon('fa-file-invoice-dollar')}
          </div>
          <div style="flex:1">
            <strong style="display:block; font-size:.9rem; color:var(--heading); margin-bottom:2px">شهادة العطاء السنوية</strong>
            <small style="color:var(--muted); display:block; font-size:.78rem; line-height:1.4">استخرج كشف حساب تبرعاتك السنوي الموثق رسمياً برقم التشهير 3115</small>
          </div>
          <a href="/donor-statement" class="outline-btn" style="padding:6px 12px; font-size:.78rem; white-space:nowrap; border-radius:8px">
            استخراج {icon('fa-arrow-left')}
          </a>
        </article>
      </aside>
    </section>
  </Layout>
}
