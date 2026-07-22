import { icon, Layout, PageHero } from './shared'
import type { UserSession } from '../types'

export function Donate({ user, campaigns = [], selectedCampaignId }: { user?: UserSession, campaigns?: any[], selectedCampaignId?: string }) {
  return <Layout user={user} title="تبرّع الآن | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="تبرّع الآن" title={'عطاؤك اليوم،<br/><em>قد يغيّر غدًا كاملًا.</em>'} text="اختر الطريقة الأنسب لك. كل بيانات التحويل أمامك بوضوح، وكل مساهمة موثّقة بأمانة." />
    <section class="donate-layout section-pad">
      <div class="donation-journey reveal">
        <p class="eyebrow"><span></span>حدد مساهمتك</p>
        <h2>كم تريد أن تزرع من الخير؟</h2>
        <form class="donation-form ajax-form" data-endpoint="/api/donations/add" method="post">
          <div class="amount-picks">
            <button type="button" data-amount="100">١٠٠</button>
            <button type="button" class="active" data-amount="500">٥٠٠</button>
            <button type="button" data-amount="1000">١٬٠٠٠</button>
            <button type="button" data-amount="5000">٥٬٠٠٠</button>
          </div>
          <label>مبلغ التبرّع <span>بالجنيه المصري</span><input type="number" name="amount" id="amount-input" value="500" min="1" required /></label>
          <div class="form-grid">
            <label>الاسم الكريم<input name="name" required placeholder="الاسم بالكامل" /></label>
            <label>رقم الهاتف<input name="phone" required inputmode="tel" placeholder="01xxxxxxxxx" /></label>
          </div>
          <label>البريد الإلكتروني <span>اختياري</span><input type="email" name="email" placeholder="name@example.com" /></label>
          {campaigns.length > 0 && <label>الحملة <span>اختياري</span><select name="campaign_id"><option value="">الصندوق العام</option>{campaigns.map((cp: any) => <option value={cp.id} selected={cp.id === selectedCampaignId}>{cp.title}</option>)}</select></label>}
          <fieldset>
            <legend>طريقة التحويل</legend>
            <label class="method-option"><input type="radio" name="method" value="instapay" checked /><span>{icon('fa-building-columns')}<b>إنستاباي / تحويل بنكي</b><small>البنك الزراعي المصري</small></span></label>
            <label class="method-option"><input type="radio" name="method" value="vodafone" /><span><i class="fa-solid fa-mobile-screen-button"></i><b>فودافون كاش</b><small>تحويل فوري من هاتفك</small></span></label>
            <label class="method-option"><input type="radio" name="method" value="cash" /><span>{icon('fa-money-bill-wave')}<b>دفع نقدي مباشر</b><small>مع إيصال موثّق</small></span></label>
          </fieldset>
          <button class="primary-btn submit-btn" type="submit">تسجيل مساهمتي {icon('fa-arrow-left')}</button>
          <p class="privacy-note">{icon('fa-lock')} بياناتك محفوظة ولا نشاركها مع أي طرف.</p>
        </form>
      </div>
      <aside class="payment-panel reveal">
        <p class="eyebrow">بيانات التحويل</p>
        <h2>انسخ. حوّل.<br />وأرسل الأثر.</h2>
        <article class="account-card bank">
          <div>{icon('fa-building-columns')}<span><small>البنك الزراعي المصري</small><b>حساب المؤسسة</b></span></div>
          <strong dir="ltr">10010397596901014</strong>
          <button class="copy-btn" data-copy="10010397596901014">{icon('fa-copy')} نسخ رقم الحساب</button>
        </article>
        <article class="account-card phone">
          <div>{icon('fa-mobile-screen')}<span><small>إنستاباي أو فودافون كاش</small><b>تحويل عبر الهاتف</b></span></div>
          <strong dir="ltr">01060920249</strong>
          <button class="copy-btn" data-copy="01060920249">{icon('fa-copy')} نسخ الرقم</button>
        </article>
        <article class="voucher-card">
          <span>{icon('fa-cow')}</span>
          <div>
            <small>صك الأضحية</small>
            <h3>شارك في فرحة الموسم</h3>
            <p><b>٥٠٠ ج.م</b> صك خيري <i></i> <b>١١٬٠٠٠ ج.م</b> أضحية كاملة</p>
          </div>
        </article>
      </aside>
    </section>
  </Layout>
}
