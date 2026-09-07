import { icon, Layout, PageHero, CampaignCard } from './shared'
import { defaultCampaigns } from '../defaults'
import type { UserSession } from '../types'

export function Campaigns({ campaigns = [], user }: { campaigns?: any[], user?: UserSession }) {
  return <Layout user={user} title="الحملات | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="حملاتنا" title={'كل حملةٍ باب،<br/><em>وكل تبرّع حياة.</em>'} text="اختر المجال الأقرب إلى قلبك، واترك لنا مسؤولية أن يصل عطاؤك بكرامة وأمانة." />
    <section class="listing-section section-pad">
      <div class="filter-row" data-filter-group>
        <button class="active" data-filter="all">الكل</button>
        <button data-filter="صحة">الصحة</button>
        <button data-filter="غذاء">الغذاء</button>
        <button data-filter="تعليم">التعليم</button>
        <button data-filter="قرآن">القرآن</button>
        <button data-filter="مجتمع">المجتمع</button>
      </div>
      {campaigns.length > 0 ? (
        <div class="campaign-grid all-campaigns">
          {campaigns.map(c => <div data-category={c.category || c.cat || 'عام'}><CampaignCard c={c} /></div>)}
        </div>
      ) : (
        <div style="text-align:center; padding:4rem 1.5rem; background:var(--paper); border:1px dashed var(--line); border-radius:var(--radius); margin-top:1.5rem">
          <div style="width:56px; height:56px; border-radius:16px; background:rgba(67,160,71,0.12); color:var(--emerald-600); display:grid; place-items:center; font-size:1.6rem; margin:0 auto 1rem">
            {icon('fa-bullseye')}
          </div>
          <h4 style="margin:0 0 8px; font-size:1.2rem">لا توجد حملات منشورة حاليًا</h4>
          <p style="color:var(--muted); max-width:480px; margin:0 auto 1.5rem; font-size:.92rem">
            {user?.role === 'admin'
              ? 'تم إخلاء الحملات الافتراضية. يمكنك البدء بإضافة حملاتك الحقيقية من لوحة التحكم.'
              : 'نعمل حاليًا على إعداد الحالات والمشاريع القادمة — ترقبوا إطلاقها قريبًا.'}
          </p>
          {user?.role === 'admin' && (
            <a class="primary-btn" href="/dashboard?view=campaigns" style="display:inline-flex; align-items:center; gap:8px">
              {icon('fa-plus')} إضافة حملة من لوحة التحكم
            </a>
          )}
        </div>
      )}
    </section>
  </Layout>
}

export function CampaignDetail({ c, user }: { c: any, user?: UserSession }) {
  const goal = Number(c.goal || 0)
  const raised = Number(c.raised || 0)
  const progress = goal > 0 ? Math.round(raised / goal * 100) : 0

  return <Layout user={user} title={`${c.title} | مؤسسة الدكتور عمر هشام`}>
    <section class="detail-hero">
      <a href="/campaigns" class="back-link">{icon('fa-arrow-right')} كل الحملات</a>
      <div class="detail-icon">{icon(c.icon || 'fa-heart')}</div>
      <span class="category-chip">{c.category || c.cat || 'عام'}</span>
      <h1>{c.title}</h1>
      <p>{c.description || c.text} مساهمتك، مهما كانت، تقترب بنا من إنسان ينتظر باب الفرج.</p>
      <div class="detail-progress">
        <div>
          <strong>{(raised).toLocaleString('ar-EG')} ج.م</strong>
          <span>تم جمعها من {(goal).toLocaleString('ar-EG')} ج.م</span>
        </div>
        <b>{progress}%</b>
        <div class="progress-track"><i style={`width:${progress}%`}></i></div>
      </div>
      <a class="primary-btn" href={`/donate?campaign=${c.id}`}>ساهم في الحملة {icon('fa-heart')}</a>
    </section>
  </Layout>
}
