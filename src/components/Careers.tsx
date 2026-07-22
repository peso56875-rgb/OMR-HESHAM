import { icon, Layout, PageHero } from './shared'
import type { UserSession } from '../types'

export function Careers({ jobs = [], user }: { jobs?: any[], user?: UserSession }) {
  return <Layout user={user} title="الوظائف | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="العمل معنا" title={'وظيفةٌ ذات معنى،<br/><em>ومكانٌ ينمو بك.</em>'} text="انضم إلى شبكة مواهبنا وساهم في خدمة مجتمعنا." />

    {jobs.length === 0 ? (
      <section class="empty-state section-pad">
        <div>{icon('fa-briefcase')}<span></span></div>
        <h2>لا توجد فرص مفتوحة حاليًا</h2>
        <p>اترك لنا بياناتك وسنتواصل معك عندما تظهر فرصة تناسب خبرتك.</p>
        <a class="primary-btn" href="/contact">أرسل سيرتك الذاتية {icon('fa-arrow-left')}</a>
      </section>
    ) : (
      <section class="section-pad" style="max-width: 900px; margin: 0 auto">
        <div style="display:flex; flex-direction:column; gap:1.5rem">
          {jobs.map((j: any) => (
            <article class="reveal" style="background:var(--surface); border:1px solid var(--border); padding:1.8rem; border-radius:16px; display:flex; flex-direction:column; gap:1rem">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem">
                <div>
                  <span class="category-chip" style="margin-inline-end:.5rem">{j.department}</span>
                  <span class="category-chip" style="background:rgba(30,136,229,.1); color:var(--blue-600)">{j.job_type}</span>
                  <h3 style="font-size:1.3rem; font-weight:800; margin-top:.7rem">{j.title}</h3>
                </div>
                <span style="color:var(--muted); font-size:.9rem">{icon('fa-location-dot')} {j.location}</span>
              </div>
              <p style="color:var(--text); line-height:1.7">{j.description}</p>
              <button class="primary-btn" onclick={`document.getElementById('applyForm').scrollIntoView({behavior:'smooth'}); document.getElementsByName('job_id')[0].value='${j.id}'`} style="align-self:flex-start">التقديم للوظيفة {icon('fa-arrow-left')}</button>
            </article>
          ))}
        </div>

        <form class="application-form ajax-form reveal" data-endpoint="/api/jobs/apply" method="post" id="applyForm" style="margin-top:4rem">
          <input type="hidden" name="job_id" value="" />
          <p class="eyebrow">استمارة التقديم</p>
          <h2>انضم إلى فريق العمل</h2>
          <div class="form-grid">
            <label>الاسم الكامل<input name="full_name" required /></label>
            <label>البريد الإلكتروني<input name="email" type="email" required /></label>
            <label>رقم الهاتف<input name="phone" required /></label>
            <label>رابط السيرة الذاتية (Google Drive/Dropbox)<input name="cv_url" placeholder="http://..." required /></label>
          </div>
          <label>نبذة عنك وخبراتك<textarea name="bio" rows={4} placeholder="اكتب هنا..."></textarea></label>
          <button class="primary-btn">تقديم الطلب {icon('fa-arrow-left')}</button>
        </form>
      </section>
    )}
  </Layout>
}
