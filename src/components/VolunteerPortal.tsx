import { Layout, icon } from './shared'
import type { UserSession, Volunteer } from '../types'

export function VolunteerPortal({
  user,
  volunteer,
  upcomingEvents = []
}: {
  user: UserSession
  volunteer: Volunteer | null
  upcomingEvents?: any[]
}) {
  const isApproved = volunteer && volunteer.status === 'approved'
  const hours = volunteer?.hours_count || 0
  const rank = volunteer?.rank || 'متطوع مبادر'
  const code = volunteer?.volunteer_code || `VOL-${user.id.slice(0, 6).toUpperCase()}`

  // Rank thresholds
  const ranksList = [
    { title: 'متطوع مبادر', minHours: 0, icon: 'fa-seedling' },
    { title: 'متطوع نشط', minHours: 20, icon: 'fa-person-walking' },
    { title: 'متطوع متميز', minHours: 50, icon: 'fa-award' },
    { title: 'قائد فريق ميداني', minHours: 100, icon: 'fa-crown' },
    { title: 'سفير أثر المؤسسة', minHours: 200, icon: 'fa-gem' }
  ]

  const currentRankIdx = ranksList.findIndex(r => r.title === rank) || 0
  const nextRank = ranksList[Math.min(ranksList.length - 1, currentRankIdx + 1)]
  const nextRankProgress = nextRank ? Math.min(100, Math.round((hours / nextRank.minHours) * 100)) : 100

  return (
    <Layout
      user={user}
      title="بوابة المتطوع الذاتية | مؤسسة الدكتور عمر هشام الخيرية"
      description="لوحة تحكم المتطوع: متابعة ساعات التطوع، الرتبة الميدانية، الفعاليات الموكلة، وإصدار شهادات الخبرة المعتمدة."
      image="/static/img/og-image.png"
    >
      <section class="page-hero volunteer-portal-hero">
        <div class="hero-glow"></div>
        <p class="eyebrow">{icon('fa-handshake-angle')} شريك صناعة الأثر</p>
        <h1>مرحباً، {user.name}</h1>
        <p>بوابتك الذاتية لمتابعة إنجازاتك التطوعية، وساعات خدمتك المجتمعية، واستخراج شهادات التقدير الموثقة.</p>
      </section>

      <section class="section-pad volunteer-portal-section">
        <div class="portal-container">
          {!volunteer ? (
            <div class="portal-unregistered-card">
              <div class="card-art-icon">{icon('fa-handshake')}</div>
              <h2>لم تنضم بعد لفريق متطوعي المؤسسة!</h2>
              <p>سجّل الآن كمتطوع لتشارك في القوافل الميدانية وتكتسب ساعات تطوعية معتمدة وشهادات خبرة رسمية.</p>
              <a href="/volunteers" class="primary-btn">
                <span>{icon('fa-user-plus')} تقديم طلب تطوع الآن</span>
                <i class="fa-solid fa-arrow-left"></i>
              </a>
            </div>
          ) : !isApproved ? (
            <div class="portal-pending-card">
              <div class="pending-icon">{icon('fa-hourglass-half')}</div>
              <h2>طلب تطوعك قيد المراجعة والتدقيق</h2>
              <p>يقوم منسق العمل التطوعي بمراجعة بياناتك ومهاراتك وسيتم إشعارك فور الاعتماد وإصدار بطاقتك التطوعية.</p>
              <div class="pending-status-pill">الحالة: {volunteer.status === 'rejected' ? 'نعتذر، لم يتم القبول في هذه الدورة' : 'قيد المراجعة'}</div>
            </div>
          ) : (
            <div class="portal-dashboard-grid">
              {/* Left Column: Volunteer ID Card & Rank */}
              <div class="portal-col-sidebar">
                {/* Digital Volunteer Badge */}
                <div class="digital-id-card">
                  <div class="id-card-top">
                    <img src="/static/foundation-logo.png" alt="الشعار" />
                    <span class="id-official-badge">بطاقة متطوع رسمية</span>
                  </div>
                  <div class="id-card-avatar">
                    <img src={volunteer.avatar_url || user.avatar || '/static/foundation-logo-256.png'} alt={user.name} />
                  </div>
                  <h3 class="id-card-name">{volunteer.full_name || user.name}</h3>
                  <div class="id-rank-pill">{icon('fa-medal')} {rank}</div>
                  
                  <div class="id-meta-grid">
                    <div>
                      <span>كود المتطوع:</span>
                      <b>{code}</b>
                    </div>
                    <div>
                      <span>المحافظة:</span>
                      <b>{volunteer.city || 'الدقهلية'}</b>
                    </div>
                    <div>
                      <span>فريق العمل:</span>
                      <b>{volunteer.team || 'الفريق الميداني'}</b>
                    </div>
                    <div>
                      <span>تاريخ الانضمام:</span>
                      <b>{volunteer.approved_at ? new Date(volunteer.approved_at).toLocaleDateString('ar-EG') : '2026'}</b>
                    </div>
                  </div>

                    <div class="id-card-footer" style="display: flex; flex-direction: column; gap: 6px;">
                      <button
                        type="button"
                        class="vol-download-id-card-btn"
                        data-vol-id={volunteer.id}
                        data-vol-name={volunteer.full_name || user.name}
                        data-vol-code={code}
                        data-vol-role={volunteer.preferred_role || 'عام'}
                        data-vol-team={volunteer.team || 'الفريق الميداني'}
                        data-vol-city={volunteer.city || 'الدقهلية'}
                        data-vol-rank={rank}
                        data-vol-hours={hours}
                        data-vol-avatar={volunteer.avatar_url || user.avatar || ''}
                        data-vol-created={volunteer.approved_at ? new Date(volunteer.approved_at).toLocaleDateString('ar-EG') : '2026'}
                        data-vol-expiry={volunteer.expires_at ? new Date(volunteer.expires_at).toLocaleDateString('ar-EG') : 'صلاحية مفتوحة'}
                        style="width: 100%; background: #0c4a3f; color: #fff; border: none; padding: 8px 12px; border-radius: 10px; font-weight: 800; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 14px rgba(12, 74, 63, 0.25);"
                        title="تحميل بطاقة هويتك التطوعية كصورة PNG عالية الدقة على جهازك"
                      >
                        {icon('fa-download')} تحميل الكارنيه (PNG)
                      </button>
                      <a href={`/volunteers/card/${volunteer.id}`} class="outline-btn mini-btn" target="_blank" style="width: 100%; text-align: center; justify-content: center;">
                        {icon('fa-arrow-up-right-from-square')} عرض الكارنيه الكامل
                      </a>
                      <button
                        type="button"
                        class="btn-trigger-celebration"
                        data-vol-id={volunteer.id}
                        data-vol-name={volunteer.full_name || user.name}
                        data-vol-rank={rank}
                        data-vol-hours={hours}
                        data-vol-code={code}
                        data-vol-avatar={volunteer.avatar_url || user.avatar || ''}
                        data-vol-cert={volunteer.certificate_allowed ? `/certificate/${volunteer.id}` : ''}
                        data-vol-card={`/volunteers/card/${volunteer.id}`}
                        style="width: 100%; background: linear-gradient(135deg, #c59b27, #8c6d15); color: #fff; border: none; padding: 8px 12px; border-radius: 10px; font-weight: 800; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 14px rgba(197, 155, 39, 0.25);"
                        title="عرض نافذة التهنئة الاحتفالية بالرتبة والألعاب النارية"
                      >
                        {icon('fa-wand-magic-sparkles')} احتفل برتبتك وإنجازك 🎉
                      </button>
                    </div>
                  </div>

                  {/* Hidden Celebration Trigger */}
                  <div
                    id="volunteer-celebration-trigger"
                    data-vol-id={volunteer.id}
                    data-vol-name={volunteer.full_name || user.name}
                    data-vol-rank={rank}
                    data-vol-hours={hours}
                    data-vol-code={code}
                    data-vol-avatar={volunteer.avatar_url || user.avatar || ''}
                    data-vol-cert={volunteer.certificate_allowed ? `/certificate/${volunteer.id}` : ''}
                    data-vol-card={`/volunteers/card/${volunteer.id}`}
                    style="display:none"
                  ></div>

                  {/* Certificate Generator Card */}
                  {volunteer.certificate_allowed ? (
                    <div class="portal-certificate-card" style="border: 2px solid var(--emerald); background: linear-gradient(145deg, var(--surface), rgba(16,185,129,0.06)); position: relative;">
                      <div style="position: absolute; top: 12px; left: 12px; background: rgba(16,185,129,0.15); color: #10b981; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 999px; display: inline-flex; align-items: center; gap: 4px;">
                        {icon('fa-circle-check')} معتمدة ومتاحة
                      </div>
                      <div class="cert-card-icon" style="color: var(--gold-600);">{icon('fa-award')}</div>
                      <h4 style="color: var(--heading); margin-top: 6px;">شهادة التطوع المعتمدة</h4>
                      <p style="color: var(--muted); font-size: 0.85rem; line-height: 1.6;">تم اعتماد وتوثيق ساعات تطوعك رسميًا من إدارة المؤسسة. يمكنك الآن إصدار الشهادة، أو طباعتها، أو تحميلها كصورة فائقة الجودة.</p>
                      <a href={`/certificate/${volunteer.id}`} class="primary-btn cert-download-btn" target="_blank" style="background: linear-gradient(135deg, #0c4a3f, #147a68); margin-top: 10px;">
                        <span>{icon('fa-file-certificate')} استعراض وطباعة وتحميل الشهادة</span>
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                      </a>
                    </div>
                  ) : (
                    <div class="portal-certificate-card" style="opacity: 0.9; background: var(--surface); border: 1px dashed var(--border); position: relative;">
                      <div style="position: absolute; top: 12px; left: 12px; background: rgba(245,158,11,0.12); color: #d97706; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 999px; display: inline-flex; align-items: center; gap: 4px;">
                        {icon('fa-lock')} تتطلب اعتماد الإدارة
                      </div>
                      <div class="cert-card-icon" style="color: var(--muted); opacity: 0.6;">{icon('fa-lock')}</div>
                      <h4 style="color: var(--heading); margin-top: 6px;">شهادة التطوع المعتمدة</h4>
                      <p style="color: var(--muted); font-size: 0.84rem; line-height: 1.6;">شهادة رسمية موثقة تثبت ساعات خدمتك المجتمعية. يتطلب استخراج الشهادة موافقة واعتماد إدارة شؤون المتطوعين أولاً.</p>
                      <div style="background: var(--surface-2); padding: 10px 12px; border-radius: 10px; font-size: 0.78rem; color: var(--muted); display: flex; align-items: center; gap: 6px; margin-top: 12px; border: 1px solid var(--border);">
                        <span style="color: #d97706;">{icon('fa-circle-info')}</span>
                        <span>سيصلك إشعار فوري وتنبيه ببريدك فور تفعيل الإدارة لإصدار شهادتك.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Hours, Progression, Assigned Tasks */}
                <div class="portal-col-main">
                  {/* Stats Row */}
                  <div class="portal-kpis-grid">
                    <div class="portal-kpi-card">
                      <div class="kpi-icon-wrap bg-green">{icon('fa-stopwatch')}</div>
                      <div>
                        <span class="kpi-sub">إجمالي ساعات التطوع:</span>
                        <b class="kpi-num">{hours} <small>ساعة معتمدة</small></b>
                      </div>
                    </div>
                    <div class="portal-kpi-card">
                      <div class="kpi-icon-wrap bg-gold">{icon('fa-calendar-check')}</div>
                      <div>
                        <span class="kpi-sub">الفعاليات المنجزة:</span>
                        <b class="kpi-num">{Math.max(1, Math.floor(hours / 4))} <small>فعالية ميدانية</small></b>
                      </div>
                    </div>
                    <div class="portal-kpi-card btn-trigger-celebration" style="cursor: pointer;" data-vol-id={volunteer.id} data-vol-name={volunteer.full_name || user.name} data-vol-rank={rank} data-vol-hours={hours} data-vol-code={code} data-vol-avatar={volunteer.avatar_url || user.avatar || ''} data-vol-cert={volunteer.certificate_allowed ? `/certificate/${volunteer.id}` : ''} data-vol-card={`/volunteers/card/${volunteer.id}`} title="اضغط للاحتفال برتبتك!">
                      <div class="kpi-icon-wrap bg-purple">{icon('fa-trophy')}</div>
                      <div>
                        <span class="kpi-sub">الرتبة الميدانية (احتفل 🎉):</span>
                        <b class="kpi-num">{rank}</b>
                      </div>
                    </div>
                  </div>

                {/* Progression Bar to Next Rank */}
                <div class="portal-progression-card">
                  <div class="progression-header">
                    <h4>{icon('fa-arrow-trend-up')} مسار الترقية إلى: <b>{nextRank?.title || 'أعلى رتبة'}</b></h4>
                    <span class="prog-hours-left">
                      {hours >= (nextRank?.minHours || 100) ? 'مؤهل للترقية القادمة!' : `متبقي ${(nextRank?.minHours || 100) - hours} ساعة`}
                    </span>
                  </div>
                  <div class="prog-bar-track">
                    <div class="prog-bar-fill" style={`width: ${nextRankProgress}%`}></div>
                  </div>
                  <div class="prog-ranks-steps">
                    {ranksList.map((r, i) => (
                      <div class={`rank-step-node ${i <= currentRankIdx ? 'completed' : ''}`}>
                        <div class="rank-node-circle">{icon(r.icon)}</div>
                        <span>{r.title}</span>
                        <small>{r.minHours} س</small>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events / Opportunities */}
                <div class="portal-events-card">
                  <div class="events-card-header">
                    <h4>{icon('fa-calendar-days')} الفعاليات والقوافل التطوعية القادمة</h4>
                    <a href="/events" class="see-all-link">استعراض كل الفعاليات {icon('fa-arrow-left')}</a>
                  </div>

                  <div class="portal-events-list">
                    {upcomingEvents.length === 0 ? (
                      <div class="empty-events-note">
                        {icon('fa-circle-info')} لا توجد فعاليات مجدولة هذا الأسبوع. سيصلك إشعار فوري عند إطلاق أي قافلة جديدة.
                      </div>
                    ) : (
                      upcomingEvents.map(e => (
                        <div class="portal-event-item">
                          <div class="event-date-box">
                            <b>{e.event_date ? new Date(e.event_date).getDate() : '15'}</b>
                            <small>{e.event_date ? new Date(e.event_date).toLocaleDateString('ar-EG', { month: 'short' }) : 'أغسطس'}</small>
                          </div>
                          <div class="event-info-box">
                            <h5>{e.title}</h5>
                            <p>{icon('fa-location-dot')} {e.place || 'المنصورة، الدقهلية'}</p>
                          </div>
                          <a href={`/events/${e.id}`} class="outline-btn mini-btn">تفاصيل الفعالية</a>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}
