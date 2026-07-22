import { icon, Layout, PageHero, CampaignCard } from './shared'
import { defaultCampaigns } from '../defaults'
import type { UserSession } from '../types'

export function Campaigns({ campaigns = [], user }: { campaigns?: any[], user?: UserSession }) {
  const renderCampaigns = campaigns.length > 0 ? campaigns : defaultCampaigns

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
      <div class="campaign-grid all-campaigns">
        {renderCampaigns.map(c => <div data-category={c.category || c.cat || 'عام'}><CampaignCard c={c} /></div>)}
      </div>
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
