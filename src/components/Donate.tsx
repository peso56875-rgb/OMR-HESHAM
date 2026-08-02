import { icon, Layout, PageHero } from './shared'
import type { UserSession } from '../types'

export function Donate({ user, campaigns = [], selectedCampaignId }: { user?: UserSession, campaigns?: any[], selectedCampaignId?: string }) {
  return <Layout user={user} title="تبرّع الآن | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="تبرّع الآن" title={'عطاؤك اليوم،<br/><em>قد يغيّر غدًا كاملًا.</em>'} text="اختر الطريقة الأنسب لك. كل مساهمة تصل لأصحابها بكرامة وخصوصية وتوثيق محكم." />
    <section class="donate-layout section-pad">
      <div class="donation-journey reveal">
        <p class="eyebrow"><span></span>حدد مساهمتك</p>
        <h2>كم تريد أن تزرع من الخير؟</h2>
        <form class="donation-form ajax-form" data-endpoint="/api/donations/add" method="post">
          <div class="amount-picks" id="amount-picks-container">
            <button type="button" data-amount="100">١٠٠ ج.م</button>
            <button type="button" class="active" data-amount="500">٥٠٠ ج.م</button>
            <button type="button" data-amount="1000">١٬٠٠٠ ج.م</button>
            <button type="button" data-amount="5000">٥٬٠٠٠ ج.م</button>
          </div>
          <label>مبلغ التبرّع <span>بالجنيه المصري</span><input type="number" name="amount" id="amount-input" value="500" min="1" required /></label>
          <div class="form-grid">
            <label>الاسم الكريم<input name="name" required placeholder="الاسم بالكامل" /></label>
            <label>رقم الهاتف<input name="phone" required inputmode="tel" placeholder="01xxxxxxxxx" /></label>
          </div>
          <label>البريد الإلكتروني <span>اختياري</span><input type="email" name="email" placeholder="name@example.com" /></label>
          {campaigns.length > 0 && <label>الحملة المستهدفة <span>اختياري</span><select name="campaign_id"><option value="">الصندوق العام (لكل أعمال الخير)</option>{campaigns.map((cp: any) => <option value={cp.id} selected={cp.id === selectedCampaignId}>{cp.title}</option>)}</select></label>}
          
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
      </aside>
    </section>
  </Layout>
}
