import { Layout, icon } from './shared'
import type { UserSession, Volunteer } from '../types'

export function VolunteerPortal({
  user,
  volunteer,
  upcomingEvents = [],
  missions = []
}: {
  user: UserSession
  volunteer: Volunteer | null
  upcomingEvents?: any[]
  missions?: any[]
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

                {/* ═══════════════════════════ المهام والتكليفات الميدانية ═══════════════════════════ */}
                <div class="portal-missions-card">
                  <div class="missions-card-header">
                    <h4>{icon('fa-clipboard-list')} المهام والتكليفات الميدانية المتاحة</h4>
                    <span class="missions-count-badge">{missions.filter((m: any) => m.is_active).length} مهمة نشطة</span>
                  </div>

                  <div class="missions-grid">
                    {missions.length === 0 ? (
                      <div class="empty-missions-note">
                        {icon('fa-circle-info')} لا توجد مهام ميدانية متاحة حالياً. سيصلك إشعار فوري عند إطلاق أي مهمة جديدة تناسب تخصصك.
                      </div>
                    ) : (
                      missions.map((m: any) => {
                        const joinedPercent = m.volunteers_needed > 0
                          ? Math.min(100, Math.round((m.volunteers_joined / m.volunteers_needed) * 100))
                          : 0
                        const isFull = m.volunteers_joined >= m.volunteers_needed
                        const volActiveMissions = volunteer?.active_missions || []
                        const alreadyJoined = Array.isArray(volActiveMissions) && volActiveMissions.includes(m.id)

                        return (
                          <div class={`mission-card ${isFull ? 'mission-full' : ''} ${alreadyJoined ? 'mission-joined' : ''}`} data-mission-id={m.id}>
                            <div class="mission-card-top">
                              <div class="mission-cat-badge">
                                {icon(m.category_icon || 'fa-tasks')} {m.category || 'عمل ميداني'}
                              </div>
                              <div class="mission-hours-badge">
                                {icon('fa-stopwatch')} {m.hours || 3} ساعات
                              </div>
                            </div>

                            <h5 class="mission-title">{m.title}</h5>
                            <p class="mission-desc">{m.description}</p>

                            <div class="mission-location">
                              {icon('fa-location-dot')} {m.location || 'الدقهلية'}
                            </div>

                            <div class="mission-volunteers-bar">
                              <div class="mission-vol-header">
                                <span>{icon('fa-users')} المتطوعون</span>
                                <span class="mission-vol-count">{m.volunteers_joined || 0} / {m.volunteers_needed || 8}</span>
                              </div>
                              <div class="mission-vol-track">
                                <div
                                  class={`mission-vol-fill ${isFull ? 'full' : ''}`}
                                  style={`width: ${joinedPercent}%`}
                                ></div>
                              </div>
                            </div>

                            <div class="mission-actions">
                              {alreadyJoined ? (
                                <button
                                  type="button"
                                  class="mission-checkin-btn"
                                  data-mission-id={m.id}
                                  data-mission-hours={m.hours || 3}
                                >
                                  {icon('fa-circle-check')} تأكيد الحضور وإنجاز المهمة
                                </button>
                              ) : isFull ? (
                                <button type="button" class="mission-full-btn" disabled>
                                  {icon('fa-lock')} اكتمل عدد المتطوعين
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  class="mission-join-btn"
                                  data-mission-id={m.id}
                                >
                                  {icon('fa-hand-holding-heart')} الانضمام لهذه المهمة
                                </button>
                              )}
                            </div>

                            {alreadyJoined && (
                              <div class="mission-joined-indicator">
                                {icon('fa-circle-check')} أنت منضم لهذه المهمة
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════ Embedded Styles for Missions ═══════════════════════════ */}
      <style dangerouslySetInnerHTML={{ __html: `
        .portal-missions-card {
          background: var(--surface);
          border-radius: 18px;
          padding: 1.6rem;
          border: 1px solid var(--border);
          margin-top: 1.2rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .missions-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
          gap: 10px;
        }
        .missions-card-header h4 {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--heading);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .missions-count-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .missions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        .empty-missions-note {
          grid-column: 1 / -1;
          padding: 2rem;
          text-align: center;
          color: var(--muted);
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--surface-2);
          border-radius: 14px;
          border: 1px dashed var(--border);
        }
        .mission-card {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.3rem;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .mission-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #10b981, #059669, #0d9488);
          opacity: 0.7;
          transition: opacity 0.3s;
        }
        .mission-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.3);
        }
        .mission-card:hover::before { opacity: 1; }
        .mission-card.mission-joined::before {
          background: linear-gradient(90deg, #f59e0b, #d97706);
          opacity: 1;
        }
        .mission-card.mission-full { opacity: 0.7; }
        .mission-card.mission-full::before {
          background: var(--muted);
          opacity: 0.4;
        }
        .mission-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .mission-cat-badge {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          font-size: 0.76rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .mission-hours-badge {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          font-size: 0.76rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .mission-title {
          font-size: 1rem;
          font-weight: 800;
          color: var(--heading);
          line-height: 1.5;
          margin: 0;
        }
        .mission-desc {
          font-size: 0.84rem;
          color: var(--muted);
          line-height: 1.65;
          margin: 0;
        }
        .mission-location {
          font-size: 0.82rem;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .mission-location i { color: #ef4444; }
        .mission-volunteers-bar {
          margin-top: auto;
        }
        .mission-vol-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--muted);
          margin-bottom: 5px;
        }
        .mission-vol-count { font-weight: 800; color: var(--heading); }
        .mission-vol-track {
          height: 7px;
          background: var(--border);
          border-radius: 999px;
          overflow: hidden;
        }
        .mission-vol-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          border-radius: 999px;
          transition: width 0.6s ease;
        }
        .mission-vol-fill.full {
          background: linear-gradient(90deg, #f59e0b, #d97706);
        }
        .mission-actions {
          margin-top: 0.4rem;
        }
        .mission-join-btn,
        .mission-checkin-btn,
        .mission-full-btn {
          width: 100%;
          border: none;
          padding: 10px 14px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: all 0.3s;
        }
        .mission-join-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
        }
        .mission-join-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
        }
        .mission-checkin-btn {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff;
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
          animation: mission-pulse 2s ease-in-out infinite;
        }
        .mission-checkin-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.35);
        }
        @keyframes mission-pulse {
          0%, 100% { box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25); }
          50% { box-shadow: 0 4px 24px rgba(245, 158, 11, 0.45); }
        }
        .mission-full-btn {
          background: var(--surface);
          color: var(--muted);
          border: 1px dashed var(--border);
          cursor: not-allowed;
          opacity: 0.7;
        }
        .mission-joined-indicator {
          font-size: 0.78rem;
          font-weight: 700;
          color: #d97706;
          text-align: center;
          padding: 5px;
          background: rgba(245, 158, 11, 0.08);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        /* Mission Toast */
        .mission-toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: var(--surface);
          color: var(--text);
          padding: 14px 24px;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 700;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid var(--border);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: 90vw;
        }
        .mission-toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        .mission-toast.success { border-color: #10b981; }
        .mission-toast.error { border-color: #ef4444; }
        .mission-toast .toast-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .mission-toast.success .toast-icon { background: rgba(16,185,129,0.15); color: #10b981; }
        .mission-toast.error .toast-icon { background: rgba(239,68,68,0.15); color: #ef4444; }
        @media (max-width: 640px) {
          .missions-grid { grid-template-columns: 1fr; }
          .mission-card { padding: 1rem; }
          .missions-card-header { flex-direction: column; align-items: flex-start; }
        }
      ` }} />

      {/* ═══════════════════════════ Client-Side JS for Missions ═══════════════════════════ */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          // Toast helper
          function showMissionToast(message, type) {
            var existing = document.querySelector('.mission-toast');
            if (existing) existing.remove();

            var toast = document.createElement('div');
            toast.className = 'mission-toast ' + type;
            toast.innerHTML = '<span class="toast-icon"><i class="fa-solid ' +
              (type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark') +
              '"></i></span><span>' + message + '</span>';
            document.body.appendChild(toast);

            requestAnimationFrame(function() {
              requestAnimationFrame(function() {
                toast.classList.add('show');
              });
            });

            setTimeout(function() {
              toast.classList.remove('show');
              setTimeout(function() { toast.remove(); }, 400);
            }, 4500);
          }

          // Join Mission
          document.querySelectorAll('.mission-join-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
              var missionId = this.getAttribute('data-mission-id');
              var card = this.closest('.mission-card');
              var originalHTML = this.innerHTML;
              this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التسجيل...';
              this.disabled = true;

              fetch('/api/volunteers/missions/join', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ mission_id: missionId })
              })
              .then(function(r) { return r.json(); })
              .then(function(data) {
                if (data.success) {
                  showMissionToast(data.message || 'تم تسجيل انضمامك بنجاح!', 'success');
                  // Update UI to show checkin button
                  card.classList.add('mission-joined');
                  btn.className = 'mission-checkin-btn';
                  btn.setAttribute('data-mission-hours', btn.getAttribute('data-mission-hours') || '3');
                  btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> تأكيد الحضور وإنجاز المهمة';
                  btn.disabled = false;

                  // Update volunteer count
                  var countEl = card.querySelector('.mission-vol-count');
                  if (countEl) {
                    var parts = countEl.textContent.split('/');
                    var joined = parseInt(parts[0].trim()) + 1;
                    var needed = parseInt(parts[1].trim());
                    countEl.textContent = joined + ' / ' + needed;

                    var fill = card.querySelector('.mission-vol-fill');
                    if (fill) {
                      fill.style.width = Math.min(100, Math.round((joined / needed) * 100)) + '%';
                    }
                  }

                  // Add joined indicator
                  var indicator = document.createElement('div');
                  indicator.className = 'mission-joined-indicator';
                  indicator.innerHTML = '<i class="fa-solid fa-circle-check"></i> أنت منضم لهذه المهمة';
                  card.appendChild(indicator);

                  // Re-attach checkin handler
                  attachCheckinHandler(btn);
                } else {
                  showMissionToast(data.error || 'تعذر الانضمام', 'error');
                  btn.innerHTML = originalHTML;
                  btn.disabled = false;
                }
              })
              .catch(function() {
                showMissionToast('حدث خطأ في الاتصال بالخادم', 'error');
                btn.innerHTML = originalHTML;
                btn.disabled = false;
              });
            });
          });

          // Checkin handler
          function attachCheckinHandler(btn) {
            btn.addEventListener('click', function handleCheckin() {
              var missionId = this.getAttribute('data-mission-id');
              var missionHours = this.getAttribute('data-mission-hours') || '3';
              var card = this.closest('.mission-card');
              var originalHTML = this.innerHTML;
              this.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري تسجيل الحضور...';
              this.disabled = true;

              fetch('/api/volunteers/missions/checkin', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                  mission_id: missionId,
                  hours: parseInt(missionHours)
                })
              })
              .then(function(r) { return r.json(); })
              .then(function(data) {
                if (data.success) {
                  showMissionToast(data.message || 'تقبل الله جهدكم! تم تسجيل الحضور بنجاح.', 'success');

                  // Update the card UI to "completed" state
                  card.style.opacity = '0.6';
                  card.style.pointerEvents = 'none';
                  btn.innerHTML = '<i class="fa-solid fa-check-double"></i> تم تسجيل الحضور بنجاح ✓';
                  btn.className = 'mission-full-btn';
                  btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                  btn.style.color = '#fff';
                  btn.style.opacity = '1';

                  var indicator = card.querySelector('.mission-joined-indicator');
                  if (indicator) {
                    indicator.innerHTML = '<i class="fa-solid fa-check-double"></i> تم الإنجاز — +' + (data.added_hours || missionHours) + ' ساعات';
                    indicator.style.color = '#10b981';
                    indicator.style.background = 'rgba(16,185,129,0.1)';
                  }

                  // Update KPIs if visible
                  if (data.total_hours) {
                    var kpiNums = document.querySelectorAll('.kpi-num');
                    if (kpiNums[0]) kpiNums[0].innerHTML = data.total_hours + ' <small>ساعة معتمدة</small>';
                  }
                  if (data.rank) {
                    var rankKpi = document.querySelectorAll('.kpi-num');
                    if (rankKpi[2]) rankKpi[2].textContent = data.rank;
                    var rankPill = document.querySelector('.id-rank-pill');
                    if (rankPill) rankPill.innerHTML = '<i class="fa-solid fa-medal"></i> ' + data.rank;
                  }

                  // If promoted, trigger celebration
                  if (data.promoted) {
                    var celebBtn = document.querySelector('.btn-trigger-celebration');
                    if (celebBtn) {
                      celebBtn.setAttribute('data-vol-hours', data.total_hours);
                      celebBtn.setAttribute('data-vol-rank', data.rank);
                      setTimeout(function() { celebBtn.click(); }, 1500);
                    }
                  }
                } else {
                  showMissionToast(data.error || 'تعذر تسجيل الحضور', 'error');
                  btn.innerHTML = originalHTML;
                  btn.disabled = false;
                }
              })
              .catch(function() {
                showMissionToast('حدث خطأ في الاتصال بالخادم', 'error');
                btn.innerHTML = originalHTML;
                btn.disabled = false;
              });
            });
          }

          // Attach checkin handlers to existing buttons
          document.querySelectorAll('.mission-checkin-btn').forEach(attachCheckinHandler);
        })();
      ` }} />
    </Layout>
  )
}
