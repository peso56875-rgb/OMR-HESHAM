import { icon, Layout } from './shared'
import type { UserSession } from '../types'
import { NotificationBell, DashNotifications } from './Notifications'

export function Dashboard({ view, data, user }: { view: string, data: any, user: UserSession }) {
  const sideMenu = [
    ['fa-chart-pie', 'نظرة عامة', 'overview'],
    ['fa-bell', 'مركز الإشعارات', 'notifications'],
    ['fa-vault', 'الخزنة المالية', 'treasury'],
    ['fa-arrow-down', 'الإيرادات (الوارد)', 'income'],
    ['fa-arrow-up', 'المصروفات (المنصرف)', 'expenses'],
    ['fa-bullseye', 'الحملات', 'campaigns'],
    ['fa-door-open', 'برامج العطاء (الأبواب)', 'programs'],
    ['fa-hand-holding-dollar', 'التبرعات', 'donations'],
    ['fa-people-group', 'المتطوعون', 'volunteers'],
    ['fa-users-gear', 'المستخدمون', 'users'],
    ['fa-envelope', 'الرسائل', 'contacts'],
    ['fa-newspaper', 'الأخبار', 'news'],
    ['fa-calendar', 'الفعاليات', 'events'],
    ['fa-heart', 'قصص النجاح', 'stories'],
    ['fa-images', 'معرض الصور', 'gallery'],
    ['fa-briefcase', 'الوظائف', 'jobs'],
    ['fa-file-signature', 'طلبات التوظيف', 'job_applications'],
    ['fa-envelope-open-text', 'النشرة البريدية', 'newsletter'],
    ['fa-clipboard-list', 'الحالات والمستفيدون', 'cases'],
    ['fa-stethoscope', 'بنك الأجهزة الطبية', 'medical'],
    ['fa-clipboard-check', 'سجل التدقيق', 'audit']
  ]

  const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })

  return <Layout user={user} title="لوحة التحكم | مؤسسة الدكتور عمر هشام" pageType="dashboard">
    <section class="dashboard-wrap">
      <aside class="dash-sidebar" aria-label="تنقل لوحة التحكم">
        <div class="dash-brand"><a href="/" style="display:flex;align-items:center;gap:15px;color:inherit;text-decoration:none"><img src="/static/foundation-logo.png" alt="" /><span><small>مؤسسة الدكتور عمر هشام</small>لوحة التحكم</span></a><button id="dash-menu-close" type="button" aria-label="إغلاق القائمة">{icon('fa-xmark')}</button></div>
        <nav>
          {sideMenu.map((n) => (
            <a
              class={view === n[2] ? 'active' : ''}
              href={`/dashboard?view=${n[2]}`}
              data-dash-view={n[2]}
              aria-current={view === n[2] ? 'page' : undefined}
            >
              {icon(n[0])}
              <span>{n[1]}</span>
              <span class="dash-alert-dot" data-dot-for={n[2]} style="display:none" title="تحديثات وتنبيهات جديدة"></span>
            </a>
          ))}
        </nav>
        <div class="dash-sidebar-footer">
          <button type="button" class="dash-pwa-btn pwa-install-trigger" id="dashPwaInstallBtn">
            {icon('fa-mobile-screen-button')}<span>تثبيت التطبيق</span>
          </button>
          <a href="/">{icon('fa-arrow-up-right-from-square')}<span>عرض الموقع</span></a>
          <a href="/api/auth/logout">{icon('fa-right-from-bracket')}<span>تسجيل الخروج</span></a>
        </div>
      </aside>
      <button class="dash-backdrop" type="button" aria-label="إغلاق القائمة"></button>
      <div class="dash-main">
        <header class="dash-topbar">
          <button class="dash-menu-button" id="dash-menu-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false">{icon('fa-bars-staggered')}</button>
          <div class="dash-top-title"><p>{dateStr}</p><h1>مرحبًا، {user.name}</h1></div>
          <div class="dash-top-actions">
            <div class="dash-top-search">
              <span style="color:var(--muted)">{icon('fa-magnifying-glass')}</span>
              <input type="text" id="dash-search-input" placeholder="بحث في الجدول..." />
            </div>
            <NotificationBell user={user} isDashboard={true} />
            <button id="theme-toggle" type="button" aria-label="تغيير المظهر">{icon('fa-moon')}</button>
            <span class="dash-admin-badge">{icon('fa-user-shield')}</span>
            <b class="dash-user-name">{user.name}</b>
          </div>
        </header>

        {view === 'overview' && <DashOverview stats={data.stats} recentDonations={data.recentDonations} />}
        {view === 'notifications' && <DashNotifications list={data.list || []} stats={data.stats || {}} pushConfigured={data.pushConfigured || false} user={user} />}
        {view === 'treasury' && <DashTreasury summary={data.summary} incomeList={data.incomeList} expenseList={data.expenseList} campaigns={data.campaigns} user={user} />}
        {view === 'income' && <DashIncome list={data.list} campaigns={data.campaigns} user={user} />}
        {view === 'expenses' && <DashExpenses list={data.list} campaigns={data.campaigns} user={user} />}
        {view === 'campaigns' && <DashCampaigns list={data.list} />}
        {view === 'programs' && <DashPrograms list={data.list} />}
        {view === 'donations' && <DashDonations list={data.list} />}
        {view === 'volunteers' && <DashVolunteers list={data.list} />}
        {view === 'contacts' && <DashContacts list={data.list} />}
        {view === 'news' && <DashNews list={data.list} />}
        {view === 'events' && <DashEvents list={data.list} />}
        {view === 'stories' && <DashStories list={data.list} />}
        {view === 'gallery' && <DashGallery list={data.list} />}
        {view === 'jobs' && <DashJobs list={data.list} />}
        {view === 'job_applications' && <DashJobApplications list={data.list} />}
        {view === 'newsletter' && <DashNewsletter list={data.list} />}
        {view === 'users' && <DashUsers list={data.list} currentUserId={user.id} />}
        {view === 'cases' && <DashCases groups={data.groups || []} cases={data.cases || []} stats={data.stats || {}} user={user} />}
        {view === 'medical' && <DashMedical equipment={data.equipment || []} requests={data.requests || []} stats={data.stats || {}} />}
        {view === 'audit' && <DashAudit list={data.list || []} />}
      </div>
    </section>

  </Layout>
}

export function DashOverview({ stats, recentDonations = [] }: { stats: any, recentDonations?: any[] }) {
  const items = [
    ['رصيد الخزنة الصافي', `${(stats.balance || 0).toLocaleString('ar-EG')} ج.م`, 'fa-vault', stats.balance >= 0 ? 'var(--emerald-600)' : '#e53935'],
    ['إجمالي الإيرادات (الوارد)', `${(stats.total_income || 0).toLocaleString('ar-EG')} ج.م`, 'fa-arrow-down', 'var(--emerald-600)'],
    ['إجمالي المصروفات (المنصرف)', `${(stats.total_expenses || 0).toLocaleString('ar-EG')} ج.م`, 'fa-arrow-up', '#e86f51'],
    ['التبرعات أونلاين', `${(stats.total_donations || 0).toLocaleString('ar-EG')} ج.م`, 'fa-hand-holding-heart', 'var(--gold-600)'],
    ['الحملات النشطة', `${stats.total_campaigns || 0}`, 'fa-bullseye', 'var(--blue-600)'],
    ['المتبرعون المسجلون', `${stats.total_donors || 0}`, 'fa-users', '#3b82f6'],
    ['طلبات التطوع', `${stats.total_volunteers || 0}`, 'fa-people-group', '#8b5cf6']
  ]

  // Calculate proportional bar heights relative to maximum values
  const maxFin = Math.max(stats.total_income || 1, stats.total_expenses || 1, stats.total_donations || 1, 1)
  const maxAct = Math.max(stats.total_donors || 1, stats.total_volunteers || 1, stats.total_campaigns || 1, 1)

  const incH = Math.min(100, Math.max(18, Math.round(((stats.total_income || 0) / maxFin) * 100)))
  const expH = Math.min(100, Math.max(18, Math.round(((stats.total_expenses || 0) / maxFin) * 100)))
  const donH = Math.min(100, Math.max(18, Math.round(((stats.total_donations || 0) / maxFin) * 100)))
  const usrH = Math.min(100, Math.max(18, Math.round(((stats.total_donors || 0) / maxAct) * 100)))
  const volH = Math.min(100, Math.max(18, Math.round(((stats.total_volunteers || 0) / maxAct) * 100)))
  const cmpH = Math.min(100, Math.max(18, Math.round(((stats.total_campaigns || 0) / maxAct) * 100)))

  return <>
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem">
      {items.map(k => (
        <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 18px; padding: 1.2rem; display: flex; flex-direction: column; justify-content: space-between">
          <div style="display: flex; align-items: center; justify-content: space-between">
            <span style={`font-size: 1.4rem; color: ${k[3]}`}>{icon(k[2])}</span>
            <small style="color: var(--muted); font-size: .78rem; font-weight:700">{k[0]}</small>
          </div>
          <b style={`font-size: 1.5rem; margin-top: .8rem; color: ${k[3]}`}>{k[1]}</b>
        </article>
      ))}
    </div>

    {/* Advanced Multi-Metric Chart */}
    <section class="chart-panel" style="margin-top:2rem">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; border-bottom:1px solid var(--line); padding-bottom:1rem">
        <div>
          <h3 style="font-size:1.3rem; font-weight:900; color:var(--text); display:flex; align-items:center; gap:10px">
            {icon('fa-chart-column')} لوحة التحليلات والمؤشرات الشاملة
          </h3>
          <p style="font-size:.84rem; color:var(--muted); margin-top:4px">مقارنة شاملة بين التدفقات المالية والأنشطة والمستخدمين والمتطوعين</p>
        </div>
        <div style="display:flex; gap:.8rem; flex-wrap:wrap; font-size:.78rem; font-weight:800">
          <span style="display:inline-flex; align-items:center; gap:6px; color:#10b981; background:rgba(16,185,129,.1); padding:4px 10px; border-radius:8px">
            <i style="width:10px; height:10px; border-radius:50%; background:#10b981"></i> الإيرادات
          </span>
          <span style="display:inline-flex; align-items:center; gap:6px; color:#f43f5e; background:rgba(244,63,94,.1); padding:4px 10px; border-radius:8px">
            <i style="width:10px; height:10px; border-radius:50%; background:#f43f5e"></i> المصروفات
          </span>
          <span style="display:inline-flex; align-items:center; gap:6px; color:#f59e0b; background:rgba(245,158,11,.1); padding:4px 10px; border-radius:8px">
            <i style="width:10px; height:10px; border-radius:50%; background:#f59e0b"></i> تبرعات الموقع
          </span>
          <span style="display:inline-flex; align-items:center; gap:6px; color:#3b82f6; background:rgba(59,130,246,.1); padding:4px 10px; border-radius:8px">
            <i style="width:10px; height:10px; border-radius:50%; background:#3b82f6"></i> المتبرعون والأعضاء
          </span>
          <span style="display:inline-flex; align-items:center; gap:6px; color:#8b5cf6; background:rgba(139,92,246,.1); padding:4px 10px; border-radius:8px">
            <i style="width:10px; height:10px; border-radius:50%; background:#8b5cf6"></i> المتطوعون
          </span>
          <span style="display:inline-flex; align-items:center; gap:6px; color:#06b6d4; background:rgba(6,182,212,.1); padding:4px 10px; border-radius:8px">
            <i style="width:10px; height:10px; border-radius:50%; background:#06b6d4"></i> الحملات
          </span>
        </div>
      </div>

      {/* Main Multi-Metric Bar Graph */}
      <div class="fake-chart">
        <div class="bar-group">
          <div class="bar-container">
            <span class="bar-val-badge" style="color:#10b981">{(stats.total_income || 0).toLocaleString('ar-EG')} ج.م</span>
            <i class="inc-bar" style={`--h:${incH}%; height:${incH}%`} title={`إجمالي الإيرادات: ${(stats.total_income || 0).toLocaleString('ar-EG')} ج.م`}></i>
          </div>
          <span class="bar-label">{icon('fa-arrow-down')} الإيرادات</span>
        </div>

        <div class="bar-group">
          <div class="bar-container">
            <span class="bar-val-badge" style="color:#f43f5e">{(stats.total_expenses || 0).toLocaleString('ar-EG')} ج.م</span>
            <i class="exp-bar" style={`--h:${expH}%; height:${expH}%`} title={`إجمالي المصروفات: ${(stats.total_expenses || 0).toLocaleString('ar-EG')} ج.م`}></i>
          </div>
          <span class="bar-label">{icon('fa-arrow-up')} المصروفات</span>
        </div>

        <div class="bar-group">
          <div class="bar-container">
            <span class="bar-val-badge" style="color:#f59e0b">{(stats.total_donations || 0).toLocaleString('ar-EG')} ج.م</span>
            <i class="don-bar" style={`--h:${donH}%; height:${donH}%`} title={`التبرعات أونلاين: ${(stats.total_donations || 0).toLocaleString('ar-EG')} ج.م`}></i>
          </div>
          <span class="bar-label">{icon('fa-hand-holding-heart')} التبرعات</span>
        </div>

        <div class="bar-group">
          <div class="bar-container">
            <span class="bar-val-badge" style="color:#3b82f6">{stats.total_donors || 0} عضو</span>
            <i class="usr-bar" style={`--h:${usrH}%; height:${usrH}%`} title={`المتبرعون والمسجلون: ${stats.total_donors || 0}`}></i>
          </div>
          <span class="bar-label">{icon('fa-users')} الأعضاء</span>
        </div>

        <div class="bar-group">
          <div class="bar-container">
            <span class="bar-val-badge" style="color:#8b5cf6">{stats.total_volunteers || 0} طلب</span>
            <i class="vol-bar" style={`--h:${volH}%; height:${volH}%`} title={`طلبات التطوع: ${stats.total_volunteers || 0}`}></i>
          </div>
          <span class="bar-label">{icon('fa-people-group')} المتطوعون</span>
        </div>

        <div class="bar-group">
          <div class="bar-container">
            <span class="bar-val-badge" style="color:#06b6d4">{stats.total_campaigns || 0} حملة</span>
            <i class="cmp-bar" style={`--h:${cmpH}%; height:${cmpH}%`} title={`الحملات النشطة: ${stats.total_campaigns || 0}`}></i>
          </div>
          <span class="bar-label">{icon('fa-bullseye')} الحملات</span>
        </div>
      </div>
    </section>

    <section class="dash-table">
      <header><h3>أحدث عمليات التبرع الواردة للموقع</h3></header>
      <table>
        <thead>
          <tr>
            <th>المتبرع</th>
            <th>الحملة</th>
            <th>المبلغ</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {recentDonations.map((r: any) => {
            const isCompleted = r.status === 'completed'
            return <tr>
              <td>{r.donor_name}</td>
              <td>{r.campaign_title || 'الصندوق العام'}</td>
              <td>{Number(r.amount).toLocaleString('ar-EG')} ج.م</td>
              <td>
                <span style={`padding:2px 8px; border-radius:4px; font-weight:600; background:${isCompleted ? 'rgba(67,160,71,.15)' : 'rgba(245,124,0,.15)'}; color:${isCompleted ? 'var(--emerald-600)' : 'var(--gold-600)'}`}>
                  {isCompleted ? 'مكتمل' : 'معلق'}
                </span>
              </td>
            </tr>
          })}
        </tbody>
      </table>
    </section>
  </>
}

export function DashTreasury({ summary = {}, incomeList = [], expenseList = [], campaigns = [], user }: { summary: any, incomeList: any[], expenseList: any[], campaigns: any[], user: UserSession }) {
  const balance = summary.balance || 0
  const totalIncome = summary.total_income || 0
  const totalExpenses = summary.total_expenses || 0

  return <>
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.2rem">
      <article style="background: var(--paper); border: 2px solid var(--emerald-600); border-radius: 20px; padding: 1.4rem">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span>{icon('fa-vault')}</span>
          <small style="color:var(--muted)">صافي رصيد الخزنة الحالي</small>
        </div>
        <b style={`font-size:2rem; display:block; margin-top:.8rem; color:${balance >= 0 ? 'var(--emerald-600)' : '#e53935'}`}>
          {balance.toLocaleString('ar-EG')} ج.م
        </b>
      </article>
      <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 1.4rem">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span style="color:var(--emerald-600)">{icon('fa-arrow-down')}</span>
          <small style="color:var(--muted)">إجمالي الوارد (الإيرادات)</small>
        </div>
        <b style="font-size:1.8rem; display:block; margin-top:.8rem; color:var(--emerald-600)">
          {totalIncome.toLocaleString('ar-EG')} ج.م
        </b>
      </article>
      <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 1.4rem">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span style="color:#e86f51">{icon('fa-arrow-up')}</span>
          <small style="color:var(--muted)">إجمالي المنصرف (المصروفات)</small>
        </div>
        <b style="font-size:1.8rem; display:block; margin-top:.8rem; color:#e86f51">
          {totalExpenses.toLocaleString('ar-EG')} ج.م
        </b>
      </article>
    </div>

    <div style="display:flex; gap:1rem; margin:1.5rem 0">
      <a href="/dashboard?view=income" class="primary-btn" style="background:var(--emerald-600); text-decoration:none">
        {icon('fa-plus')} إضافة إيراد جديد
      </a>
      <a href="/dashboard?view=expenses" class="primary-btn" style="background:#e86f51; text-decoration:none">
        {icon('fa-minus')} إضافة مصروف جديد
      </a>
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap:1.5rem; margin-top:1rem">
      <section class="dash-table">
        <header style="display:flex; justify-content:space-between; align-items:center">
          <h3 style="color:var(--emerald-600)">أحدث الإيرادات الواردة</h3>
          <a href="/dashboard?view=income" style="font-size:.82rem; font-weight:bold">عرض الكل ←</a>
        </header>
        <table>
          <thead>
            <tr>
              <th>المبلغ</th>
              <th>المصدر</th>
              <th>التاريخ</th>
              <th>الأدمن المسجل</th>
            </tr>
          </thead>
          <tbody>
            {incomeList.map((inc: any) => (
              <tr>
                <td style="font-weight:bold; color:var(--emerald-600)">+{Number(inc.amount).toLocaleString('ar-EG')} ج.م</td>
                <td>{inc.source}</td>
                <td>{inc.date}</td>
                <td><small style="background:rgba(22,138,112,.1); padding:3px 8px; border-radius:6px; font-weight:600">{inc.recorded_by || 'مشرف'}</small></td>
              </tr>
            ))}
            {incomeList.length === 0 && <tr><td colSpan={4} style="text-align:center; color:var(--muted)">لا توجد إيرادات مسجلة بعد</td></tr>}
          </tbody>
        </table>
      </section>

      <section class="dash-table">
        <header style="display:flex; justify-content:space-between; align-items:center">
          <h3 style="color:#e86f51">أحدث المصروفات المنصرفة</h3>
          <a href="/dashboard?view=expenses" style="font-size:.82rem; font-weight:bold">عرض الكل ←</a>
        </header>
        <table>
          <thead>
            <tr>
              <th>المبلغ</th>
              <th>البند والجهة</th>
              <th>التاريخ</th>
              <th>الأدمن المسجل</th>
            </tr>
          </thead>
          <tbody>
            {expenseList.map((exp: any) => (
              <tr>
                <td style="font-weight:bold; color:#e86f51">-{Number(exp.amount).toLocaleString('ar-EG')} ج.م</td>
                <td><b>{exp.category}</b> — {exp.beneficiary}</td>
                <td>{exp.date}</td>
                <td><small style="background:rgba(232,111,81,.1); padding:3px 8px; border-radius:6px; font-weight:600">{exp.recorded_by || 'مشرف'}</small></td>
              </tr>
            ))}
            {expenseList.length === 0 && <tr><td colSpan={4} style="text-align:center; color:var(--muted)">لا توجد مصروفات مسجلة بعد</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  </>
}

export function DashIncome({ list = [], campaigns = [], user }: { list: any[], campaigns: any[], user: UserSession }) {
  const today = new Date().toISOString().split('T')[0]

  return <>
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center">
        <h3>سجل الإيرادات والأموال الواردة</h3>
        <a href="/api/export/treasury_income" download class="export-excel-btn">
          {icon('fa-file-excel')} تصدير Excel
        </a>
      </header>
      <table>
        <thead>
          <tr>
            <th>المبلغ</th>
            <th>نوع المصدر</th>
            <th>اسم المتبرع/المصدر</th>
            <th>الهاتف</th>
            <th>الحملة</th>
            <th>التاريخ</th>
            <th>مسجَّل بواسطة</th>
            <th>ملاحظات</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((inc: any) => (
            <tr>
              <td style="font-weight:bold; color:var(--emerald-600)">+{Number(inc.amount).toLocaleString('ar-EG')} ج.م</td>
              <td><span style="background:rgba(22,138,112,.12); color:var(--emerald-600); padding:3px 8px; border-radius:6px; font-weight:600">{inc.source}</span></td>
              <td>{inc.donor_name || 'فاعل خير'}</td>
              <td>{inc.donor_phone || '-'}</td>
              <td>{inc.campaign_title || 'الصندوق العام'}</td>
              <td>{inc.date}</td>
              <td><b>{inc.recorded_by || 'مشرف'}</b></td>
              <td style="max-width:200px; white-space:pre-wrap">{inc.description || '-'}</td>
              <td>
                <form action={`/api/treasury/income/delete/${inc.id}`} method="post" class="dash-action-form" data-confirm="هل أنت متأكد من حذف هذا الإيراد؟">
                  <button type="submit" class="dash-delete-btn">{icon('fa-trash-can')} حذف</button>
                </form>
              </td>
            </tr>
          ))}
          {list.length === 0 && <tr><td colSpan={9} style="text-align:center; color:var(--muted)">لا توجد إيرادات مسجلة بعد</td></tr>}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/treasury/income/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:650px; display:flex; flex-direction:column; gap:1.2rem">
        <h3 style="color:var(--emerald-600)">تسجيل إيراد وارد جديد</h3>
        <label>المبلغ (ج.م) *<input type="number" step="any" name="amount" required placeholder="مثال: 5000" /></label>
        <label>مصدر الإيراد *
          <select name="source" required style="padding:12px; border-radius:12px; border:1px solid var(--line); background:var(--ivory)">
            <option value="تبرع نقدي مباشر">تبرع نقدي مباشر</option>
            <option value="تحويل إنستاباي (InstaPay)">تحويل إنستاباي (InstaPay)</option>
            <option value="تحويل فودافون كاش">تحويل فودافون كاش</option>
            <option value="تحويل بنكي">تحويل بنكي</option>
            <option value="زكاة">زكاة</option>
            <option value="صدقة">صدقة</option>
            <option value="كفالة">كفالة أيتام/أسر</option>
            <option value="أخرى">مصدر آخر</option>
          </select>
        </label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem">
          <label>اسم المتبرع/المصدر<input name="donor_name" placeholder="اتركه فارغًا إذا كان فاعل خير" /></label>
          <label>رقم الهاتف<input name="donor_phone" placeholder="01xxxxxxxxx" /></label>
        </div>
        <label>مخصص لحملة معينة؟
          <select name="campaign_id" style="padding:12px; border-radius:12px; border:1px solid var(--line); background:var(--ivory)">
            <option value="">الصندوق العام (بدون تخصيص)</option>
            {campaigns.map((c: any) => <option value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <label>تاريخ الاستلام *<input type="date" name="date" value={today} required /></label>
        <label>ملاحظات وتفاصيل إضافية<textarea name="description" rows={3} placeholder="أي تفاصيل تتعلق بالاستلام أو الحساب البنكي..."></textarea></label>
        <div style="background:rgba(22,138,112,.08); padding:10px 14px; border-radius:10px; font-size:.85rem; color:var(--emerald-600)">
          {icon('fa-user-check')} سيتم تسجيل هذا الإيراد باسم الأدمن الحالي: <b>{user.name}</b>
        </div>
        <button class="primary-btn" type="submit" style="background:var(--emerald-600)">تسجيل الإيراد في الخزنة</button>
      </form>
    </section>
  </>
}

export function DashExpenses({ list = [], campaigns = [], user }: { list: any[], campaigns: any[], user: UserSession }) {
  const today = new Date().toISOString().split('T')[0]

  return <>
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center">
        <h3>سجل المصروفات والأموال المنصرفة</h3>
        <a href="/api/export/treasury_expenses" download class="export-excel-btn">
          {icon('fa-file-excel')} تصدير Excel
        </a>
      </header>
      <table>
        <thead>
          <tr>
            <th>المبلغ المصروف</th>
            <th>بند الصرف</th>
            <th>الجهة / المستفيد</th>
            <th>الحملة المرتبطة</th>
            <th>وصف المصروف</th>
            <th>التاريخ</th>
            <th>منصرف بواسطة (الأدمن)</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((exp: any) => (
            <tr>
              <td style="font-weight:bold; color:#e86f51">-{Number(exp.amount).toLocaleString('ar-EG')} ج.م</td>
              <td><span style="background:rgba(232,111,81,.12); color:#e86f51; padding:3px 8px; border-radius:6px; font-weight:600">{exp.category}</span></td>
              <td><b>{exp.beneficiary}</b></td>
              <td>{exp.campaign_title || 'عام'}</td>
              <td style="max-width:220px; white-space:pre-wrap">{exp.description}</td>
              <td>{exp.date}</td>
              <td><b>{exp.recorded_by || 'مشرف'}</b></td>
              <td>
                <form action={`/api/treasury/expense/delete/${exp.id}`} method="post" class="dash-action-form" data-confirm="هل أنت متأكد من حذف هذا المصروف؟">
                  <button type="submit" class="dash-delete-btn">{icon('fa-trash-can')} حذف</button>
                </form>
              </td>
            </tr>
          ))}
          {list.length === 0 && <tr><td colSpan={8} style="text-align:center; color:var(--muted)">لا توجد مصروفات مسجلة بعد</td></tr>}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/treasury/expense/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:650px; display:flex; flex-direction:column; gap:1.2rem">
        <h3 style="color:#e86f51">تسجيل مصروف جديد</h3>
        <label>المبلغ المصروف (ج.م) *<input type="number" step="any" name="amount" required placeholder="مثال: 1200" /></label>
        <label>بند الصرف *
          <select name="category" required style="padding:12px; border-radius:12px; border:1px solid var(--line); background:var(--ivory)">
            <option value="دعم صحي وعلاج">دعم صحي وعلاج (أدوية وعمليات)</option>
            <option value="إطعام وكراتين غذائية">إطعام وكراتين غذائية</option>
            <option value="دعم تعليمي ومصروفات">دعم تعليمي ومصروفات دراسية</option>
            <option value="كسوة وهدايا">كسوة وهدايا أعياد ومواسم</option>
            <option value="مصاريف تشغيل ومقر">مصاريف تشغيل ومقر المؤسسة</option>
            <option value="مطبوعات وإعلانات">مطبوعات وإعلانات للمبادرات</option>
            <option value="مساعدات مالية مباشرة">مساعدات مالية مباشرة لأسر مستحقة</option>
            <option value="أخرى">بند آخر</option>
          </select>
        </label>
        <label>الجهة أو اسم المستفيد *<input name="beneficiary" required placeholder="مثال: صيدلية كفر العنانية / أسرة المرحوم..." /></label>
        <label>مرتبط بحملة معينة؟
          <select name="campaign_id" style="padding:12px; border-radius:12px; border:1px solid var(--line); background:var(--ivory)">
            <option value="">عام (بدون ربط بحملة)</option>
            {campaigns.map((c: any) => <option value={c.id}>{c.title}</option>)}
          </select>
        </label>
        <label>وصف ومبرر الصرف *<textarea name="description" rows={3} required placeholder="اكتب التفاصيل والفواتير المرتبطة بهذا الصرف..."></textarea></label>
        <label>تاريخ الصرف *<input type="date" name="date" value={today} required /></label>
        <div style="background:rgba(232,111,81,.08); padding:10px 14px; border-radius:10px; font-size:.85rem; color:#e86f51">
          {icon('fa-user-check')} سيتم تسجيل هذا المصروف باسم الأدمن الحالى: <b>{user.name}</b>
        </div>
        <button class="primary-btn" type="submit" style="background:#e86f51">تسجيل المصروف في الخزنة</button>
      </form>
    </section>
  </>
}

export function DashCampaigns({ list = [] }: { list: any[] }) {
  return <>
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px">
        <div>
          <h3>الحملات الحالية («اختر القصة التي تريد أن تغيّر نهايتها»)</h3>
          <p style="color:var(--muted); font-size:.82rem; margin-top:2px">تتحكم هذه القائمة في الحملات المعروضة على الصفحة الرئيسية وصفحة الحملات.</p>
        </div>
        <div style="display:flex; gap:8px; align-items:center">
          {list.length === 0 && (
            <form action="/api/campaigns/seed-defaults" method="post" class="dash-action-form" data-confirm="هل تريد استيراد الحملات الافتراضية لقاعدة البيانات للبدء منها وتعديلها أو حذفها؟">
              <button type="submit" class="outline-btn" style="padding:6px 12px; font-size:.82rem">
                {icon('fa-wand-magic-sparkles')} استيراد الحملات الافتراضية
              </button>
            </form>
          )}
          <a href="/api/export/campaigns" download class="export-excel-btn">
            {icon('fa-file-excel')} تصدير Excel
          </a>
        </div>
      </header>
      <table>
        <thead>
          <tr>
            <th>العنوان</th>
            <th>القسم</th>
            <th>الهدف</th>
            <th>المجمع</th>
            <th>عاجل</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colspan={6} style="text-align:center; padding:2.5rem 1rem; color:var(--muted)">
                لا توجد حملات مضافة حتى الآن. يمكنك إضافة أول حملة حقيقية بالنموذج أدناه أو استيراد النماذج الافتراضية.
              </td>
            </tr>
          ) : (
            list.map((c: any) => (
              <tr>
                <td>{c.title}</td>
                <td>{c.category}</td>
                <td>{Number(c.goal).toLocaleString('ar-EG')} ج.م</td>
                <td>{Number(c.raised || 0).toLocaleString('ar-EG')} ج.م</td>
                <td>{c.is_urgent ? 'نعم' : 'لا'}</td>
                <td>
                  <div style="display:flex; gap:6px; align-items:center">
                    <button
                      type="button"
                      class="edit-campaign-btn dash-edit-btn"
                      data-id={c.id}
                      data-title={c.title}
                      data-category={c.category}
                      data-goal={c.goal}
                      data-raised={c.raised || 0}
                      data-urgent={c.is_urgent ? 'true' : 'false'}
                      data-icon={c.icon || 'fa-heart'}
                      data-description={c.description || ''}
                      data-image={c.image_url || ''}
                    >{icon('fa-pen-to-square')} تعديل</button>
                    <form action={`/api/campaigns/delete/${c.id}`} method="post" class="dash-action-form" data-confirm="هل أنت متأكد من حذف هذه الحملة؟">
                      <button type="submit" class="dash-delete-btn">{icon('fa-trash-can')} حذف</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/campaigns/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:600px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة حملة جديدة</h3>
        <label>عنوان الحملة<input name="title" required /></label>
        <label>القسم<input name="category" placeholder="صحة، غذاء، تعليم" required /></label>
        <label>المبلغ المستهدف (ج.م)<input type="number" name="goal" required /></label>
        <label>
          أيقونة الحملة <span>(اختر أو اكتب اسم رمز FontAwesome)</span>
          <div style="display:flex; gap:8px; align-items:center; margin-top:4px">
            <span id="icon-preview-badge" style="width:40px; height:40px; border-radius:8px; background:var(--gold-600); color:#fff; display:grid; place-items:center; font-size:1.2rem">
              <i class="fa-solid fa-heart"></i>
            </span>
            <input name="icon" id="campaign-icon-input" value="fa-heart" placeholder="fa-heart" style="flex:1" />
          </div>
          <div class="icon-presets" style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px">
            {['fa-heart', 'fa-capsules', 'fa-basket-shopping', 'fa-school', 'fa-stethoscope', 'fa-book-open', 'fa-gift', 'fa-hand-holding-heart', 'fa-house-medical', 'fa-seedling'].map(ic => (
              <button
                type="button"
                class="icon-preset-btn"
                data-icon={ic}
                style="padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:1.1rem"
              >
                {icon(ic)}
              </button>
            ))}
          </div>
        </label>
        <div class="upload-widget">
          <input type="hidden" name="image_url" class="cloudinary-url" />
          <label>صورة الحملة</label>
          <div class="upload-drop-zone">
            <input type="file" accept="image/*,video/*" class="upload-file-input" />
            <div class="upload-placeholder"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span><small>JPG, PNG, WEBP — حد أقصى 10 ميجا</small></div>
            <img class="upload-preview" style="display:none" alt="معاينة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>
        <label style="display:flex; align-items:center; gap:.5rem"><input type="checkbox" name="is_urgent" value="true" /> حملة عاجلة؟</label>
        <label>الوصف<textarea name="description" rows={3}></textarea></label>
        <button class="primary-btn" type="submit" id="campaign-submit-btn">حفظ الحملة</button>
      </form>
    </section>

  </>
}

export function DashPrograms({ list = [] }: { list: any[] }) {
  const toneNames: Record<string, string> = {
    gold: 'ذهبي (Gold)',
    coral: 'مرجاني (Coral)',
    blue: 'أزرق (Blue)',
    emerald: 'زمردي (Emerald)',
    violet: 'بنفسجي (Violet)',
    cyan: 'سماوي (Cyan)'
  }

  const toneHex: Record<string, string> = {
    gold: '#e0ae4c',
    coral: '#e86f51',
    blue: '#3d98df',
    emerald: '#29ab83',
    violet: '#8b6cc9',
    cyan: '#40b8be'
  }

  const presetIcons = [
    'fa-cow', 'fa-bowl-food', 'fa-heart-pulse', 'fa-book-quran',
    'fa-graduation-cap', 'fa-people-roof', 'fa-hand-holding-heart',
    'fa-seedling', 'fa-stethoscope', 'fa-gift', 'fa-kit-medical', 'fa-house-chimney-medical'
  ]

  return <>
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px">
        <div>
          <h3>أبواب العطاء ومساحات الخير («ستةُ أبواب، ووجهةٌ واحدة: الإنسان»)</h3>
          <p style="color:var(--muted); font-size:.82rem; margin-top:2px">تتحكم هذه القائمة في بطاقات البرامج والأبواب المعروضة في الصفحة الرئيسية.</p>
        </div>
        <div style="display:flex; gap:8px; align-items:center">
          {list.length === 0 && (
            <form action="/api/programs/seed-defaults" method="post" class="dash-action-form" data-confirm="هل تريد استيراد الأبواب الستة الافتراضية لقاعدة البيانات للبدء منها وتعديلها أو حذفها؟">
              <button type="submit" class="outline-btn" style="padding:6px 12px; font-size:.82rem">
                {icon('fa-wand-magic-sparkles')} استيراد الأبواب الستة الافتراضية
              </button>
            </form>
          )}
        </div>
      </header>

      <table>
        <thead>
          <tr>
            <th>الترتيب</th>
            <th>الأيقونة</th>
            <th>العنوان</th>
            <th>الوصف</th>
            <th>النغمة اللونية</th>
            <th>الرابط</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colspan={7} style="text-align:center; padding:2.5rem 1rem; color:var(--muted)">
                لا توجد أبواب أو برامج مضافة حتى الآن. يمكنك إضافة باب جديد بالنموذج أدناه أو استيراد الأبواب الستة الافتراضية.
              </td>
            </tr>
          ) : (
            list.map((p: any, idx: number) => (
              <tr>
                <td><strong>{p.order ?? idx + 1}</strong></td>
                <td>
                  <span style={`display:inline-grid; place-items:center; width:34px; height:34px; border-radius:10px; background:color-mix(in srgb, ${toneHex[p.tone] || '#29ab83'} 15%, transparent); color:${toneHex[p.tone] || '#29ab83'}; font-size:1.1rem`}>
                    {icon(p.icon || 'fa-hand-holding-heart')}
                  </span>
                </td>
                <td><strong>{p.title}</strong></td>
                <td style="max-width:280px; white-space:normal; line-height:1.4">{p.description}</td>
                <td>
                  <span style={`display:inline-flex; align-items:center; gap:6px; padding:3px 8px; border-radius:6px; font-size:.78rem; font-weight:700; background:color-mix(in srgb, ${toneHex[p.tone] || '#29ab83'} 18%, transparent); color:${toneHex[p.tone] || '#29ab83'}`}>
                    <i style={`width:8px; height:8px; border-radius:50%; background:${toneHex[p.tone] || '#29ab83'}`}></i>
                    {toneNames[p.tone] || p.tone || 'ذهبي'}
                  </span>
                </td>
                <td style="font-size:.82rem; color:var(--muted)">{p.link || '/campaigns'}</td>
                <td>
                  <div style="display:flex; gap:6px; align-items:center">
                    <button
                      type="button"
                      class="edit-program-btn dash-edit-btn"
                      data-id={p.id}
                      data-title={p.title}
                      data-description={p.description || ''}
                      data-icon={p.icon || 'fa-hand-holding-heart'}
                      data-tone={p.tone || 'gold'}
                      data-link={p.link || '/campaigns'}
                      data-order={p.order ?? idx + 1}
                    >{icon('fa-pen-to-square')} تعديل</button>
                    <form action={`/api/programs/delete/${p.id}`} method="post" class="dash-action-form" data-confirm="هل أنت متأكد من حذف هذا الباب؟">
                      <button type="submit" class="dash-delete-btn">{icon('fa-trash-can')} حذف</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/programs/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:640px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة باب / مسار عطاء جديد</h3>
        <label>عنوان الباب أو المسار<input name="title" placeholder="مثال: كفالة علاجية، مائدة إطعام، حقيبة علم" required /></label>
        <label>الوصف المختصر<textarea name="description" rows={2} placeholder="موجز يوضح أثر هذا الباب ويظهر في البطاقة على الصفحة الرئيسية" required></textarea></label>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem">
          <label>
            النغمة اللونية للبطاقة
            <select name="tone" style="width:100%; padding:9px; border-radius:8px; border:1px solid var(--border); background:var(--surface); color:var(--text); margin-top:4px">
              <option value="gold">ذهبي (Gold)</option>
              <option value="coral">مرجاني (Coral)</option>
              <option value="blue">أزرق (Blue)</option>
              <option value="emerald">زمردي (Emerald)</option>
              <option value="violet">بنفسجي (Violet)</option>
              <option value="cyan">سماوي (Cyan)</option>
            </select>
          </label>
          <label>
            رقم الترتيب
            <input type="number" name="order" value={list.length + 1} style="margin-top:4px" />
          </label>
        </div>

        <label>
          رابط الانتقال عند النقر (اختياري)
          <input name="link" placeholder="/campaigns أو /donate أو رابط صفحة مخصصة" value="/campaigns" />
        </label>

        <label>
          أيقونة البرنامج <span>(اختر من المقترحات أو اكتب اسم رمز FontAwesome)</span>
          <div style="display:flex; gap:8px; align-items:center; margin-top:4px">
            <span id="program-icon-badge" style="width:40px; height:40px; border-radius:8px; background:var(--gold-600); color:#fff; display:grid; place-items:center; font-size:1.2rem">
              <i class="fa-solid fa-hand-holding-heart"></i>
            </span>
            <input name="icon" id="program-icon-input" value="fa-hand-holding-heart" placeholder="fa-cow" style="flex:1" />
          </div>
          <div class="icon-presets" style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px">
            {presetIcons.map(ic => (
              <button
                type="button"
                class="program-icon-preset-btn"
                data-icon={ic}
                style="padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--surface-2); color:var(--text); cursor:pointer; font-size:1.1rem"
              >
                {icon(ic)}
              </button>
            ))}
          </div>
        </label>

        <button class="primary-btn" type="submit">حفظ وإضافة الباب</button>
      </form>
    </section>
  </>
}

export function DashDonations({ list = [] }: { list: any[] }) {
  return <section class="dash-table">
    <header style="display:flex; justify-content:space-between; align-items:center">
      <h3>إدارة عمليات التبرع</h3>
      <a href="/api/export/donations" download class="export-excel-btn">
        {icon('fa-file-excel')} تصدير Excel
      </a>
    </header>
    <table>
      <thead>
        <tr>
          <th>المتبرع</th>
          <th>الهاتف</th>
          <th>المبلغ</th>
          <th>الحملة</th>
          <th>الطريقة</th>
          <th>الحالة</th>
          <th>الإيصال</th>
          <th>التاريخ</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {list.map((d: any) => {
          const isCompleted = d.status === 'completed'
          const date = d.created_at ? new Date(d.created_at).toLocaleDateString('ar-EG') : '-'
          return <tr>
            <td>{d.donor_name}</td>
            <td>{d.donor_phone}</td>
            <td>{Number(d.amount).toLocaleString('ar-EG')} ج.م</td>
            <td>{d.campaign_title || 'الصندوق العام'}</td>
            <td>{d.payment_method}</td>
            <td>
              <span style={`padding:2px 8px; border-radius:4px; font-weight:600; background:${isCompleted ? 'rgba(67,160,71,.15)' : 'rgba(245,124,0,.15)'}; color:${isCompleted ? 'var(--emerald-600)' : 'var(--gold-600)'}`}>
                {isCompleted ? 'مكتمل' : 'قيد المراجعة'}
              </span>
            </td>
            {/*
              رقم الإيصال يظهر فقط للتبرعات المؤكدة، لأنه لا يُصدر إلا عند
              التأكيد. الرابط يحمل التوقيع لأن الصفحة تتحقق منه قبل العرض.
            */}
            <td>
              {d.receipt_number ? (
                <a
                  href={`/receipt/${encodeURIComponent(d.receipt_number)}?t=${encodeURIComponent(d.receipt_token || '')}`}
                  target="_blank"
                  rel="noopener"
                  title="عرض الإيصال وطباعته"
                  style="color:var(--emerald-600); font-weight:600; text-decoration:none; direction:ltr; display:inline-block"
                >
                  {icon('fa-receipt')} {d.receipt_number}
                </a>
              ) : (
                <span style="color:var(--ink-400,#9ca3af)">—</span>
              )}
            </td>
            <td>{date}</td>
            <td>
              {!isCompleted && (
                <form action={`/api/donations/status/${d.id}`} method="post" style="display:inline">
                  <input type="hidden" name="status" value="completed" />
                  <button type="submit" style="background:var(--emerald-600); color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">تأكيد الاستلام</button>
                </form>
              )}
            </td>
          </tr>
        })}
      </tbody>
    </table>
  </section>
}

export function DashVolunteers({ list = [] }: { list: any[] }) {
  // These buckets must be mutually exclusive, otherwise the KPI numbers add up
  // to more than the list length. `status` is the source of truth; a frozen card
  // is an approved record whose is_active flag was switched off, so it belongs
  // to "ملغاة / مجمّدة" only — never to "معتمدون" at the same time.
  const isFrozenCard = (v: any) => v.status === 'approved' && v.is_active === false
  const totalApproved = list.filter((v: any) => v.status === 'approved' && !isFrozenCard(v)).length
  const totalPending = list.filter((v: any) => !v.status || v.status === 'pending').length
  const totalRejected = list.filter((v: any) => v.status === 'rejected').length
  const totalRevoked = list.filter((v: any) => v.status === 'revoked' || isFrozenCard(v)).length
  const totalHours = list.reduce((sum: number, v: any) => sum + (v.hours_count || 0), 0)

  return <>
    {/* ══════ Section Header ══════ */}
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:24px">
      <div>
        <h2 style="margin:0; font-size:1.6rem; font-weight:900; color:var(--heading); display:flex; align-items:center; gap:12px">
          {icon('fa-people-group')} إدارة المتطوعين
        </h2>
        <p style="margin:6px 0 0; color:var(--muted); font-size:.85rem">عرض شامل لجميع المتطوعين مع إمكانية التحكم الكامل في البيانات والصلاحيات</p>
      </div>
      <a href="/api/export/volunteers" download class="export-excel-btn">
        {icon('fa-file-excel')} تصدير Excel
      </a>
    </div>

    {/* ══════ KPI Stats Row ══════ */}
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(155px, 1fr)); gap:14px; margin-bottom:28px">
      {[
        { label: 'إجمالي المتطوعين', value: list.length, iconName: 'fa-users', color: '#3b82f6', bg: 'rgba(59,130,246,.1)' },
        { label: 'معتمدون', value: totalApproved, iconName: 'fa-circle-check', color: '#10b981', bg: 'rgba(16,185,129,.1)' },
        { label: 'قيد المراجعة', value: totalPending, iconName: 'fa-hourglass-half', color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
        { label: 'مرفوض', value: totalRejected, iconName: 'fa-circle-xmark', color: '#ef4444', bg: 'rgba(239,68,68,.1)' },
        { label: 'ملغاة / مجمّدة', value: totalRevoked, iconName: 'fa-ban', color: '#dc2626', bg: 'rgba(220,38,38,.1)' },
        { label: 'ساعات الخدمة', value: `${totalHours}`, iconName: 'fa-clock', color: '#0c4a3f', bg: 'rgba(12,74,63,.1)' },
      ].map(s => (
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:18px; display:flex; align-items:center; gap:14px; transition:transform .2s, box-shadow .2s">
          <div style={`width:42px; height:42px; border-radius:12px; background:${s.bg}; color:${s.color}; display:grid; place-items:center; font-size:1.1rem; flex-shrink:0`}>
            {icon(s.iconName)}
          </div>
          <div>
            <div style="font-size:.75rem; color:var(--muted); font-weight:700">{s.label}</div>
            <strong style={`font-size:1.4rem; font-weight:900; color:${s.color}; line-height:1.2`}>{s.value}</strong>
          </div>
        </div>
      ))}
    </div>

    {/* ══════ Volunteer Cards Grid ══════ */}
    {list.length === 0 ? (
      <div style="text-align:center; padding:60px 20px; background:var(--surface); border:1px solid var(--border); border-radius:22px">
        <div style="font-size:3rem; margin-bottom:16px; opacity:.3">{icon('fa-people-group')}</div>
        <h3 style="margin:0 0 8px; font-weight:900; color:var(--heading)">لا يوجد متطوعون مسجلون حتى الآن</h3>
        <p style="color:var(--muted); font-size:.88rem">ستظهر طلبات التطوع الجديدة هنا تلقائياً عند تقديمها.</p>
      </div>
    ) : (
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:18px">
        {list.map((v: any) => {
          // `status` is the single source of truth. Treating is_active === false
          // as "revoked" wrongly painted every pending/rejected application red,
          // because a fresh application is not active yet either.
          const isApproved = v.status === 'approved'
          const isRevoked = v.status === 'revoked'
          const isPending = !v.status || v.status === 'pending'
          const isRejected = v.status === 'rejected'
          // An approved card whose active flag was turned off is frozen, not revoked.
          const isFrozen = isApproved && v.is_active === false
          const isInactive = isRevoked || isFrozen
          const isExpired = Boolean(v.expires_at && new Date(v.expires_at) < new Date())
          const expiryDate = v.expires_at ? new Date(v.expires_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : 'مفتوح'
          const createdDate = v.created_at ? new Date(v.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

          const statusColor = isInactive ? '#dc2626' : isApproved ? '#10b981' : isRejected ? '#ef4444' : '#f59e0b'
          const statusBg = isInactive ? 'rgba(220,38,38,.1)' : isApproved ? 'rgba(16,185,129,.1)' : isRejected ? 'rgba(239,68,68,.1)' : 'rgba(245,158,11,.1)'
          const statusText = isRevoked ? 'ملغاة / مجمّدة' : isFrozen ? 'مجمّدة مؤقتاً' : isApproved ? (isExpired ? 'معتمد — منتهية الصلاحية' : 'معتمد') : isRejected ? 'مرفوض' : 'قيد المراجعة'
          const statusIcon = isInactive ? 'fa-ban' : isApproved ? (isExpired ? 'fa-triangle-exclamation' : 'fa-shield-halved') : isRejected ? 'fa-circle-xmark' : 'fa-clock'

          return (
            <div style={`background:var(--surface); border:1px solid var(--border); border-radius:20px; overflow:hidden; transition:transform .25s, box-shadow .25s; position:relative${isInactive ? '; opacity:.75' : ''}`}>

              {/* ── Card Header with Avatar ── */}
              <div style={`padding:20px 20px 16px; display:flex; align-items:center; gap:16px; border-bottom:1px solid var(--border); background:${statusBg}`}>
                <button
                  type="button"
                  class="vol-avatar-trigger"
                  aria-label={`عرض صورة ${v.full_name}`}
                  title={v.avatar_url ? "اضغط لعرض وتكبير الصورة بالكامل" : "لا توجد صورة مرفوعة"}
                  data-vol-id={v.id}
                  data-vol-img={v.avatar_url || ''}
                  data-vol-avatar={v.avatar_url || ''}
                  data-vol-download={v.avatar_url ? `/api/volunteers/photo/${v.id}/download` : ''}
                  data-vol-name={v.full_name || ''}
                  data-vol-code={v.volunteer_code || ''}
                  data-vol-role={v.preferred_role || 'عام'}
                  data-vol-team={v.team || ''}
                  data-vol-status={statusText}
                  data-vol-status-color={statusColor}
                  data-vol-status-bg={statusBg}
                  data-vol-phone={v.phone || ''}
                  data-vol-city={v.city || ''}
                  data-vol-rank={v.rank || (isApproved ? 'متطوع مبادر' : '—')}
                  data-vol-hours={v.hours_count || 0}
                  data-vol-created={createdDate}
                  data-vol-expiry={expiryDate}
                  data-vol-initials={v.full_name?.split(' ')?.[0]?.[0] || 'م'}
                >
                  {v.avatar_url ? (
                    <>
                      <img src={v.avatar_url} alt={v.full_name} class="vol-avatar-img" />
                      <span class="vol-avatar-zoom-overlay">
                        {icon('fa-magnifying-glass-plus')}
                      </span>
                    </>
                  ) : (
                    <span class="vol-avatar-initials">{v.full_name?.split(' ')?.[0]?.[0] || 'م'}</span>
                  )}
                </button>
                <div style="flex:1; min-width:0">
                  <h4 style="margin:0; font-size:1.05rem; font-weight:900; color:var(--heading); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">{v.full_name}</h4>
                  <div style="display:flex; align-items:center; gap:6px; margin-top:4px; flex-wrap:wrap">
                    {v.volunteer_code && (
                      <span style="font-family:monospace; font-size:.78rem; font-weight:900; color:var(--emerald); background:rgba(22,138,112,.1); padding:3px 10px; border-radius:6px; border:1px solid rgba(22,138,112,.18); letter-spacing:.04em">
                        {v.volunteer_code}
                      </span>
                    )}
                    <span style={`font-size:.72rem; font-weight:800; padding:3px 8px; border-radius:6px; color:${statusColor}; background:${statusBg}; border:1px solid ${statusColor}22; display:inline-flex; align-items:center; gap:4px`}>
                      {icon(statusIcon)} {statusText}
                    </span>
                    <span style={`font-size:.72rem; font-weight:800; padding:3px 8px; border-radius:6px; color:${v.certificate_allowed ? '#10b981' : '#d97706'}; background:${v.certificate_allowed ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)'}; border:1px solid ${v.certificate_allowed ? 'rgba(16,185,129,.2)' : 'rgba(245,158,11,.2)'}; display:inline-flex; align-items:center; gap:4px`} title={v.certificate_allowed ? 'شهادة التطوع معتمدة ومسموح بإصدارها' : 'شهادة التطوع مقفلة ولم يتم تفعيلها للمتطوع بعد'}>
                      {icon(v.certificate_allowed ? 'fa-award' : 'fa-lock')} {v.certificate_allowed ? 'الشهادة متاحة' : 'الشهادة معلقة'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Card Body - Info Grid ── */}
              <div style="padding:16px 20px; display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <div>
                  <small style="color:var(--muted); font-size:.68rem; display:block">{icon('fa-phone')} الهاتف</small>
                  <b style="font-size:.85rem; color:var(--text)">{v.phone || '—'}</b>
                </div>
                <div>
                  <small style="color:var(--muted); font-size:.68rem; display:block">{icon('fa-briefcase')} المجال</small>
                  <b style="font-size:.85rem; color:var(--text)">{v.preferred_role || 'عام'}</b>
                </div>
                <div>
                  <small style="color:var(--muted); font-size:.68rem; display:block">{icon('fa-star')} الرتبة</small>
                  <b style="font-size:.85rem; color:var(--gold-600)">{v.rank || (isApproved ? 'متطوع مبادر' : '—')}</b>
                </div>
                <div>
                  <small style="color:var(--muted); font-size:.68rem; display:block">{icon('fa-clock')} ساعات الخدمة</small>
                  <b style="font-size:.85rem; color:var(--emerald-600)">{v.hours_count || 0} ساعة</b>
                </div>
                <div>
                  <small style="color:var(--muted); font-size:.68rem; display:block">{icon('fa-calendar')} تاريخ التقديم</small>
                  <b style="font-size:.85rem; color:var(--text)">{createdDate}</b>
                </div>
                <div>
                  <small style="color:var(--muted); font-size:.68rem; display:block">{icon('fa-calendar-xmark')} صلاحية البطاقة</small>
                  <b style={`font-size:.85rem; color:${isExpired || isInactive ? '#dc2626' : 'var(--emerald-600)'}`}>
                    {isRevoked ? 'ملغاة' : isFrozen ? 'مجمّدة' : isExpired ? 'منتهية' : expiryDate}
                  </b>
                </div>
              </div>

              {/* ── Card Footer - Actions ── */}
              <div style="padding:12px 20px 16px; border-top:1px solid var(--border); display:flex; align-items:center; gap:8px; flex-wrap:wrap">

                {/* Pending: Accept/Reject */}
                {isPending && <>
                  <form action={`/api/volunteers/status/${v.id}`} method="post" style="display:inline">
                    <input type="hidden" name="status" value="approved" />
                    <button type="submit" style="background:#10b981; color:#fff; border:none; padding:7px 14px; border-radius:10px; cursor:pointer; font-size:.78rem; font-weight:800; display:inline-flex; align-items:center; gap:5px">
                      {icon('fa-circle-check')} قبول
                    </button>
                  </form>
                  <form action={`/api/volunteers/status/${v.id}`} method="post" style="display:inline">
                    <input type="hidden" name="status" value="rejected" />
                    <button type="submit" style="background:#ef4444; color:#fff; border:none; padding:7px 14px; border-radius:10px; cursor:pointer; font-size:.78rem; font-weight:800; display:inline-flex; align-items:center; gap:5px">
                      {icon('fa-circle-xmark')} رفض
                    </button>
                  </form>
                </>}

                {/* Quick Certificate Permission Toggle */}
                {isApproved && (
                  <form action={`/api/volunteers/certificate-permission/${v.id}`} method="post" style="display:inline">
                    <input type="hidden" name="action" value={v.certificate_allowed ? 'revoke' : 'grant'} />
                    <button
                      type="submit"
                      style={`border:none; padding:7px 12px; border-radius:10px; cursor:pointer; font-size:.78rem; font-weight:800; display:inline-flex; align-items:center; gap:5px; ${v.certificate_allowed ? 'background:rgba(220,38,38,.1); color:#dc2626; border:1px solid rgba(220,38,38,.2)' : 'background:linear-gradient(135deg, #c59b27, #8c6d15); color:#fff'}`}
                      title={v.certificate_allowed ? 'إيقاف إمكانية استخراج الشهادة للمتطوع' : 'السماح للمتطوع بإصدار الشهادة وإرسال إشعار فوري له'}
                    >
                      {icon(v.certificate_allowed ? 'fa-lock' : 'fa-award')}
                      {v.certificate_allowed ? 'إيقاف الشهادة' : 'إتاحة الشهادة'}
                    </button>
                  </form>
                )}

                {/* Quick Download Volunteer ID Card (PNG) */}
                <button
                  type="button"
                  class="vol-download-id-card-btn"
                  data-vol-id={v.id}
                  data-vol-name={v.full_name}
                  data-vol-code={v.volunteer_code || ''}
                  data-vol-role={v.preferred_role || 'عام'}
                  data-vol-team={v.team || ''}
                  data-vol-city={v.city || 'الدقهلية'}
                  data-vol-rank={v.rank || (isApproved ? 'متطوع مبادر' : '—')}
                  data-vol-hours={v.hours_count || 0}
                  data-vol-avatar={v.avatar_url || ''}
                  data-vol-created={createdDate}
                  data-vol-expiry={expiryDate}
                  style="background:var(--surface-2); border:1px solid var(--border); color:var(--text); padding:7px 12px; border-radius:10px; cursor:pointer; font-size:.78rem; font-weight:800; display:inline-flex; align-items:center; gap:5px"
                  title="تحميل بطاقة هوية المتطوع (الكارنيه) كصورة PNG مباشرة على جهازك"
                >
                  {icon('fa-id-badge')} تنزيل الكارنيه (ID)
                </button>

                {/* Quick Download Avatar Photo */}
                {v.avatar_url && (
                  <a
                    href={`/api/volunteers/photo/${v.id}/download`}
                    download
                    style="background:var(--surface-2); border:1px solid var(--border); color:var(--muted); padding:7px 10px; border-radius:10px; font-size:.78rem; font-weight:800; text-decoration:none; display:inline-flex; align-items:center; gap:4px"
                    title="تنزيل الصورة الشخصية الأصلية"
                  >
                    {icon('fa-image')} الصورة
                  </a>
                )}

                {/* Details & Admin Modal */}
                <details style="position:relative; flex:1">
                  <summary style="list-style:none; cursor:pointer; background:var(--surface-2); border:1px solid var(--border); padding:7px 14px; border-radius:10px; font-size:.78rem; font-weight:800; color:var(--text); display:inline-flex; align-items:center; gap:5px; margin-right:auto">
                    {icon('fa-sliders')} التحكم والتفاصيل
                  </summary>

                  {/* ── Full-Screen Modal ── */}
                  <div style="position:fixed; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(8px); z-index:99999; display:grid; place-items:center; padding:20px; overflow-y:auto">
                    <div style="background:var(--surface); border:1px solid var(--border); border-radius:24px; max-width:680px; width:100%; max-height:92vh; overflow-y:auto; box-shadow:0 30px 100px rgba(0,0,0,.35); text-align:right">

                      {/* Modal Header */}
                      <div style={`padding:24px 28px; background:linear-gradient(135deg, ${statusBg}, transparent); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:18px`}>
                        <button
                          type="button"
                          class="vol-avatar-trigger in-modal"
                          aria-label={`عرض صورة ${v.full_name}`}
                          title={v.avatar_url ? "اضغط لعرض وتكبير الصورة بالكامل" : "لا توجد صورة مرفوعة"}
                          data-vol-id={v.id}
                          data-vol-img={v.avatar_url || ''}
                          data-vol-avatar={v.avatar_url || ''}
                          data-vol-download={v.avatar_url ? `/api/volunteers/photo/${v.id}/download` : ''}
                          data-vol-name={v.full_name || ''}
                          data-vol-code={v.volunteer_code || ''}
                          data-vol-role={v.preferred_role || 'عام'}
                          data-vol-team={v.team || ''}
                          data-vol-status={statusText}
                          data-vol-status-color={statusColor}
                          data-vol-status-bg={statusBg}
                          data-vol-phone={v.phone || ''}
                          data-vol-city={v.city || ''}
                          data-vol-rank={v.rank || (isApproved ? 'متطوع مبادر' : '—')}
                          data-vol-hours={v.hours_count || 0}
                          data-vol-created={createdDate}
                          data-vol-expiry={expiryDate}
                          data-vol-initials={v.full_name?.[0] || 'م'}
                        >
                          {v.avatar_url ? (
                            <>
                              <img src={v.avatar_url} alt="" class="vol-avatar-img" />
                              <span class="vol-avatar-zoom-overlay">
                                {icon('fa-magnifying-glass-plus')}
                              </span>
                            </>
                          ) : (
                            <span class="vol-avatar-initials">{v.full_name?.[0] || 'م'}</span>
                          )}
                        </button>
                        <div style="flex:1">
                          <h3 style="margin:0; font-size:1.3rem; font-weight:900; color:var(--heading)">{v.full_name}</h3>
                          <div style="display:flex; align-items:center; gap:8px; margin-top:6px; flex-wrap:wrap">
                            {v.volunteer_code && (
                              <span style="font-family:monospace; font-weight:900; font-size:.85rem; color:var(--emerald); background:rgba(22,138,112,.1); padding:4px 12px; border-radius:8px; border:1px solid rgba(22,138,112,.2)">
                                {icon('fa-fingerprint')} {v.volunteer_code}
                              </span>
                            )}
                            <span style={`font-size:.78rem; font-weight:800; padding:4px 10px; border-radius:8px; color:${statusColor}; background:${statusBg}; display:inline-flex; align-items:center; gap:4px`}>
                              {icon(statusIcon)} {statusText}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Full Info Grid */}
                      <div style="padding:24px 28px">
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:14px; background:var(--surface-2); padding:18px; border-radius:16px; border:1px solid var(--border); margin-bottom:20px">
                          <div><small style="color:var(--muted); display:block; font-size:.7rem; font-weight:700">{icon('fa-phone')} رقم الهاتف</small><b style="font-size:.88rem">{v.phone}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.7rem; font-weight:700">{icon('fa-user')} العمر</small><b style="font-size:.88rem">{v.age ? `${v.age} سنة` : 'غير محدد'}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.7rem; font-weight:700">{icon('fa-location-dot')} المدينة</small><b style="font-size:.88rem">{v.city || 'غير محدد'}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.7rem; font-weight:700">{icon('fa-briefcase')} المجال المفضل</small><b style="font-size:.88rem">{v.preferred_role || 'عام'}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.7rem; font-weight:700">{icon('fa-star')} الرتبة</small><b style="font-size:.88rem; color:var(--gold-600)">{v.rank || 'متطوع مبادر'}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.7rem; font-weight:700">{icon('fa-clock')} ساعات الخدمة</small><b style="font-size:.88rem; color:var(--emerald-600)">{v.hours_count || 0} ساعة</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.7rem; font-weight:700">{icon('fa-calendar')} تاريخ التقديم</small><b style="font-size:.88rem">{createdDate}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.7rem; font-weight:700">{icon('fa-calendar-xmark')} صلاحية البطاقة</small><b style={`font-size:.88rem; color:${isExpired || isInactive ? '#dc2626' : 'var(--emerald-600)'}`}>{expiryDate}</b></div>
                        </div>

                        {v.skills && (
                          <div style="background:var(--surface-2); padding:14px 18px; border-radius:14px; margin-bottom:20px; border:1px solid var(--border)">
                            <small style="color:var(--muted); font-size:.72rem; font-weight:800; display:block; margin-bottom:4px">{icon('fa-lightbulb')} المهارات والخبرات</small>
                            <p style="margin:0; font-size:.86rem; color:var(--text); line-height:1.7">{v.skills}</p>
                          </div>
                        )}

                        {/* ── Certificate & ID Badge Controls ── */}
                        <div style="background:var(--surface-2); border:1px solid var(--border); border-radius:16px; padding:18px; margin-bottom:20px">
                          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px">
                            <h4 style="margin:0; font-size:.95rem; font-weight:900; display:flex; align-items:center; gap:8px; color:var(--heading)">
                              {icon('fa-award')} إدارة شهادة التطوع والكارنيه الرسمي
                            </h4>
                            <span style={`font-size:.75rem; font-weight:800; padding:4px 10px; border-radius:8px; color:${v.certificate_allowed ? '#10b981' : '#d97706'}; background:${v.certificate_allowed ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)'}; border:1px solid ${v.certificate_allowed ? 'rgba(16,185,129,.2)' : 'rgba(245,158,11,.2)'}; display:inline-flex; align-items:center; gap:4px`}>
                              {icon(v.certificate_allowed ? 'fa-circle-check' : 'fa-lock')} {v.certificate_allowed ? 'الشهادة مسموح بها' : 'الشهادة معلقة ومقفلة'}
                            </span>
                          </div>

                          <p style="margin:0 0 14px; font-size:.84rem; color:var(--muted); line-height:1.6">
                            {v.certificate_allowed
                              ? 'المتطوع لديه تصريح معتمد لاستخراج وطباعة وتحميل شهادة التطوع المعتمدة. يمكنك إيقاف الصلاحية في أي وقت.'
                              : 'لا يستطيع المتطوع إصدار أو استعراض الشهادة حتى تضغط على زر "السماح بإصدار الشهادة" أدناه (سيتم إرسال إشعار فوري له).'}
                          </p>

                          <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center">
                            <form action={`/api/volunteers/certificate-permission/${v.id}`} method="post" style="display:inline">
                              <input type="hidden" name="action" value={v.certificate_allowed ? 'revoke' : 'grant'} />
                              <button
                                type="submit"
                                style={`border:none; padding:8px 16px; border-radius:10px; font-weight:800; font-size:.82rem; cursor:pointer; display:inline-flex; align-items:center; gap:6px; ${v.certificate_allowed ? 'background:rgba(220,38,38,.1); color:#dc2626; border:1px solid rgba(220,38,38,.2)' : 'background:linear-gradient(135deg, #c59b27, #8c6d15); color:#fff'}`}
                              >
                                {icon(v.certificate_allowed ? 'fa-lock' : 'fa-award')}
                                {v.certificate_allowed ? 'إيقاف إمكانية إصدار الشهادة' : 'السماح بإصدار الشهادة وإشعار المتطوع'}
                              </button>
                            </form>

                            <button
                              type="button"
                              class="vol-download-id-card-btn"
                              data-vol-id={v.id}
                              data-vol-name={v.full_name}
                              data-vol-code={v.volunteer_code || ''}
                              data-vol-role={v.preferred_role || 'عام'}
                              data-vol-team={v.team || ''}
                              data-vol-city={v.city || 'الدقهلية'}
                              data-vol-rank={v.rank || (isApproved ? 'متطوع مبادر' : '—')}
                              data-vol-hours={v.hours_count || 0}
                              data-vol-avatar={v.avatar_url || ''}
                              data-vol-created={createdDate}
                              data-vol-expiry={expiryDate}
                              style="background:#0c4a3f; color:#fff; border:none; padding:8px 16px; border-radius:10px; font-weight:800; font-size:.82rem; cursor:pointer; display:inline-flex; align-items:center; gap:6px"
                              title="تنزيل الكارنيه الرسمي للمتطوع كصورة PNG عالية الدقة على جهازك"
                            >
                              {icon('fa-id-badge')} تنزيل الكارنيه (PNG)
                            </button>

                            {v.avatar_url && (
                              <a
                                href={`/api/volunteers/photo/${v.id}/download`}
                                download
                                style="background:var(--surface); border:1px solid var(--border); color:var(--text); padding:8px 14px; border-radius:10px; font-weight:800; font-size:.82rem; text-decoration:none; display:inline-flex; align-items:center; gap:6px"
                                title="تحميل الصورة الشخصية الأصلية"
                              >
                                {icon('fa-image')} تنزيل الصورة الشخصية
                              </a>
                            )}

                            <a
                              href={`/volunteers/card/${v.id}`}
                              target="_blank"
                              style="background:var(--surface); border:1px solid var(--border); color:var(--text); padding:8px 14px; border-radius:10px; font-weight:800; font-size:.82rem; text-decoration:none; display:inline-flex; align-items:center; gap:6px"
                            >
                              {icon('fa-arrow-up-right-from-square')} عرض الكارنيه الكامل
                            </a>

                            <a
                              href={`/certificate/${v.id}`}
                              target="_blank"
                              style="background:var(--surface); border:1px solid var(--border); color:var(--text); padding:8px 14px; border-radius:10px; font-weight:800; font-size:.82rem; text-decoration:none; display:inline-flex; align-items:center; gap:6px"
                            >
                              {icon('fa-file-certificate')} معاينة الشهادة
                            </a>
                          </div>
                        </div>

                        {/* ── Validity Controls ── */}
                        <div style="background:var(--surface-2); border:1px solid var(--border); border-radius:16px; padding:18px; margin-bottom:20px">
                          <h4 style="margin:0 0 14px; font-size:.95rem; font-weight:900; display:flex; align-items:center; gap:8px; color:var(--heading)">
                            {icon('fa-shield-halved')} التحكم في صلاحية البطاقة
                          </h4>
                          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px">
                            <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:inline">
                              <input type="hidden" name="action" value="extend_2yr" />
                              <button type="submit" style="background:#10b981; color:white; border:none; padding:7px 12px; border-radius:8px; font-weight:800; font-size:.76rem; cursor:pointer; display:inline-flex; align-items:center; gap:4px">
                                {icon('fa-calendar-plus')} تجديد سنتين
                              </button>
                            </form>
                            <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:inline">
                              <input type="hidden" name="action" value="extend_1yr" />
                              <button type="submit" style="background:#3b82f6; color:white; border:none; padding:7px 12px; border-radius:8px; font-weight:800; font-size:.76rem; cursor:pointer; display:inline-flex; align-items:center; gap:4px">
                                {icon('fa-plus')} تمديد سنة
                              </button>
                            </form>
                            <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:inline">
                              <input type="hidden" name="action" value="indefinite" />
                              <button type="submit" style="background:#0c4a3f; color:white; border:none; padding:7px 12px; border-radius:8px; font-weight:800; font-size:.76rem; cursor:pointer; display:inline-flex; align-items:center; gap:4px">
                                {icon('fa-infinity')} صلاحية مفتوحة
                              </button>
                            </form>
                            {!isInactive ? (
                              <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:inline">
                                <input type="hidden" name="action" value="revoke" />
                                <button type="submit" style="background:#dc2626; color:white; border:none; padding:7px 12px; border-radius:8px; font-weight:800; font-size:.76rem; cursor:pointer; display:inline-flex; align-items:center; gap:4px">
                                  {icon('fa-ban')} إلغاء / تجميد
                                </button>
                              </form>
                            ) : (
                              <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:inline">
                                <input type="hidden" name="action" value="activate" />
                                <button type="submit" style="background:#10b981; color:white; border:none; padding:7px 12px; border-radius:8px; font-weight:800; font-size:.76rem; cursor:pointer; display:inline-flex; align-items:center; gap:4px">
                                  {icon('fa-rotate-left')} إعادة تفعيل
                                </button>
                              </form>
                            )}
                          </div>
                          <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; background:var(--surface); padding:10px; border-radius:10px; border:1px solid var(--border)">
                            <input type="hidden" name="action" value="set_custom" />
                            <label style="font-size:.78rem; font-weight:800; white-space:nowrap; color:var(--muted)">{icon('fa-calendar-day')} تاريخ مخصص:</label>
                            <input type="date" name="expires_at" value={v.expires_at ? new Date(v.expires_at).toISOString().slice(0,10) : ''} required style="border:1px solid var(--border); border-radius:8px; padding:6px 10px; font-size:.82rem; background:var(--surface-2); color:var(--text)" />
                            <button type="submit" style="background:var(--heading); color:var(--surface); border:none; border-radius:8px; padding:6px 14px; font-size:.76rem; font-weight:800; cursor:pointer">تطبيق</button>
                          </form>
                        </div>

                        {/* ── Edit Form ── */}
                        <details style="background:var(--surface-2); border:1px solid var(--border); border-radius:16px; padding:16px">
                          <summary style="font-weight:900; font-size:.88rem; cursor:pointer; color:var(--heading); display:flex; align-items:center; gap:8px">
                            {icon('fa-pen-to-square')} تعديل كافة بيانات المتطوع
                          </summary>
                          <form action={`/api/volunteers/update/${v.id}`} method="post" enctype="multipart/form-data" style="margin-top:16px; display:grid; grid-template-columns:1fr 1fr; gap:12px">
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted)">الاسم الكامل<input name="full_name" value={v.full_name} required style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px" /></label>
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted)">رقم الهاتف<input name="phone" value={v.phone} required style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px" /></label>
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted)">العمر<input name="age" type="number" value={v.age || ''} style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px" /></label>
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted)">المدينة<input name="city" value={v.city || ''} style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px" /></label>
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted)">المجال<input name="preferred_role" value={v.preferred_role || ''} style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px" /></label>
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted)">كود الهوية<input name="volunteer_code" value={v.volunteer_code || ''} style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px" /></label>
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted)">ساعات الخدمة<input name="hours_count" type="number" value={v.hours_count || 0} style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px" /></label>
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted)">الرتبة
                              <select name="rank" style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px">
                                {['متطوع مبادر', 'متطوع فعّال', 'قائد ميداني', 'سفير العطاء'].map(r => <option selected={v.rank === r}>{r}</option>)}
                              </select>
                            </label>
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted)">الحالة
                              <select name="status" style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px">
                                <option value="approved" selected={v.status === 'approved'}>معتمد</option>
                                <option value="pending" selected={v.status === 'pending'}>قيد المراجعة</option>
                                <option value="rejected" selected={v.status === 'rejected'}>مرفوض</option>
                                <option value="revoked" selected={v.status === 'revoked'}>ملغاة / مجمّدة</option>
                              </select>
                            </label>
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted)">إتاحة إصدار الشهادة
                              <select name="certificate_allowed" style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px">
                                <option value="false" selected={!v.certificate_allowed}>غير مسموح / معلقة</option>
                                <option value="true" selected={v.certificate_allowed}>مسموح بإصدار وتحميل الشهادة</option>
                              </select>
                            </label>
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted); grid-column:1/-1">تاريخ انتهاء البطاقة <small style="font-weight:600; opacity:.75">(اتركه فارغاً لصلاحية مفتوحة)</small>
                              <input type="date" name="expires_at" value={v.expires_at ? new Date(v.expires_at).toISOString().slice(0, 10) : ''} style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px" />
                            </label>
                            <label style="font-size:.78rem; font-weight:700; color:var(--muted); grid-column:1/-1">المهارات والخبرات
                              <textarea name="skills" rows={2} style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:4px; font-family:inherit; resize:vertical">{v.skills || ''}</textarea>
                            </label>
                            <div style="grid-column:1/-1">
                              <label style="font-size:.78rem; font-weight:700; color:var(--muted); display:block; margin-bottom:6px">{icon('fa-camera')} تغيير الصورة الشخصية</label>
                              <input type="file" name="avatar_file" accept="image/*" style="font-size:.78rem" />
                              <input name="avatar_url" value={v.avatar_url || ''} placeholder="أو ضع رابط الصورة مباشرة https://..." style="width:100%; border:1px solid var(--border); border-radius:8px; padding:8px; background:var(--surface); color:var(--text); margin-top:8px; font-size:.78rem" />
                              <small style="display:block; margin-top:4px; color:var(--muted); font-size:.7rem">اختر ملفاً لرفعه، أو الصق رابطاً، أو امسح الحقل لإزالة الصورة.</small>
                            </div>
                            <div style="grid-column:1/-1; display:flex; justify-content:flex-end; gap:10px; margin-top:6px">
                              <button type="submit" style="background:var(--emerald-600); color:white; border:none; border-radius:10px; padding:10px 24px; font-weight:800; font-size:.85rem; cursor:pointer; display:inline-flex; align-items:center; gap:6px">
                                {icon('fa-floppy-disk')} حفظ التغييرات
                              </button>
                            </div>
                          </form>
                        </details>

                        {/* Modal Actions Bar */}
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; padding-top:16px; border-top:1px solid var(--border)">
                          <form action={`/api/volunteers/delete/${v.id}`} method="post" style="display:inline" data-confirm={`هل أنت متأكد من حذف المتطوع "${v.full_name}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`}>
                            <button type="submit" style="background:rgba(220,38,38,.1); color:#dc2626; border:1px solid rgba(220,38,38,.2); padding:8px 16px; border-radius:10px; font-weight:800; font-size:.8rem; cursor:pointer; display:inline-flex; align-items:center; gap:6px">
                              {icon('fa-trash-can')} حذف المتطوع نهائياً
                            </button>
                          </form>
                          <button type="button" class="vol-modal-close" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px; background:var(--surface-2); border:1px solid var(--border); padding:8px 22px; border-radius:10px; font-weight:800; font-size:.8rem; color:var(--text)">
                            إغلاق {icon('fa-xmark')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Quick Delete (outside modal) */}
                <form action={`/api/volunteers/delete/${v.id}`} method="post" style="display:inline" data-confirm={`هل أنت متأكد من حذف المتطوع "${v.full_name}"؟`}>
                  <button type="submit" style="background:none; border:1px solid var(--border); color:var(--muted); cursor:pointer; font-size:.8rem; padding:6px 8px; border-radius:8px; display:inline-flex; align-items:center" title="حذف">
                    {icon('fa-trash-can')}
                  </button>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    )}

    {/* ══════ Volunteer Photo Lightbox Modal ══════ */}
    <div id="vol-photo-lightbox" class="vol-lightbox-modal" role="dialog" aria-modal="true" aria-hidden="true" style="display:none">
      <div class="vol-lightbox-backdrop"></div>
      <div class="vol-lightbox-card">
        {/* Header Bar */}
        <div class="vol-lightbox-topbar">
          <div class="vol-lightbox-identity">
            <div class="vol-lightbox-thumb" id="vol-lb-thumb">
              <span id="vol-lb-thumb-initials">م</span>
              <img id="vol-lb-thumb-img" src="" alt="" style="display:none" />
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
                <h3 id="vol-lb-name" class="vol-lb-name">اسم المتطوع</h3>
                <span id="vol-lb-code" class="vol-lb-code">VOL-000</span>
                <span id="vol-lb-status" class="vol-lb-status">معتمد</span>
              </div>
              <p id="vol-lb-meta" class="vol-lb-meta">المجال: عام • ساعات الخدمة: 0 ساعة</p>
            </div>
          </div>
          <div class="vol-lightbox-actions">
            <div class="vol-lightbox-controls">
              <button type="button" class="vol-lb-btn" id="vol-lb-zoom-in" title="تكبير (+)">
                {icon('fa-magnifying-glass-plus')}
              </button>
              <button type="button" class="vol-lb-btn" id="vol-lb-zoom-out" title="تصغير (-)">
                {icon('fa-magnifying-glass-minus')}
              </button>
              <button type="button" class="vol-lb-btn" id="vol-lb-rotate" title="تدوير الصورة 90 درجة (R)">
                {icon('fa-rotate-right')}
              </button>
              <button type="button" class="vol-lb-btn" id="vol-lb-reset" title="إعادة ضبط العرض (0)">
                {icon('fa-arrows-rotate')}
              </button>
            </div>
            <div class="vol-lightbox-divider"></div>
            <button type="button" class="vol-lb-btn vol-lb-btn-gold" id="vol-lb-download-id-card" title="تحميل بطاقة هوية المتطوع (الكارنيه) كصورة PNG فائقة الجودة">
              {icon('fa-id-badge')} <span>تحميل الكارنيه (ID)</span>
            </button>
            <a id="vol-lb-download" href="#" download="volunteer-photo.jpg" class="vol-lb-btn vol-lb-btn-primary" title="تحميل الصورة الشخصية بالجودة الكاملة">
              {icon('fa-download')} <span>تحميل الصورة</span>
            </a>
            <a id="vol-lb-open-tab" href="#" target="_blank" rel="noopener noreferrer" class="vol-lb-btn" title="فتح الصورة الأصلية في علامة تبويب جديدة">
              {icon('fa-arrow-up-right-from-square')}
            </a>
            <button type="button" class="vol-lb-btn vol-lb-btn-close" id="vol-lb-close" title="إغلاق (Esc)">
              {icon('fa-xmark')}
            </button>
          </div>
        </div>

        {/* Viewport / Image Container */}
        <div class="vol-lightbox-viewport" id="vol-lb-viewport">
          <div class="vol-lightbox-img-wrapper" id="vol-lb-img-wrapper">
            <img id="vol-lb-main-img" src="" alt="" class="vol-lb-main-img" />
            <div id="vol-lb-no-img" class="vol-lb-no-img" style="display:none">
              <div class="vol-lb-no-img-icon">{icon('fa-image')}</div>
              <h4>لا توجد صورة شخصية مرفوعة لهذا المتطوع</h4>
              <p>يمكنك رفع صورة شخصية للمتطوع من خلال خيار "التحكم والتفاصيل" ثم "تعديل كافة بيانات المتطوع".</p>
            </div>
          </div>
          <div class="vol-lightbox-zoom-badge" id="vol-lb-zoom-badge">100%</div>
          <div class="vol-lightbox-hint">
            <span>{icon('fa-computer-mouse')} انقر مرتين للتبديل السريع للتكبير • عجلة الفأرة للتكبير والتصغير</span>
          </div>
        </div>

        {/* Bottom Detailed Info Bar */}
        <div class="vol-lightbox-infobar">
          <div class="vol-lightbox-infogrid">
            <div class="vol-lb-infoitem">
              <span class="vol-lb-infolabel">{icon('fa-phone')} الهاتف</span>
              <strong id="vol-lb-phone" class="vol-lb-infoval">—</strong>
            </div>
            <div class="vol-lb-infoitem">
              <span class="vol-lb-infolabel">{icon('fa-location-dot')} المدينة</span>
              <strong id="vol-lb-city" class="vol-lb-infoval">—</strong>
            </div>
            <div class="vol-lb-infoitem">
              <span class="vol-lb-infolabel">{icon('fa-star')} الرتبة</span>
              <strong id="vol-lb-rank" class="vol-lb-infoval" style="color:var(--gold-600)">—</strong>
            </div>
            <div class="vol-lb-infoitem">
              <span class="vol-lb-infolabel">{icon('fa-clock')} ساعات الخدمة</span>
              <strong id="vol-lb-hours" class="vol-lb-infoval" style="color:var(--emerald-600)">0 ساعة</strong>
            </div>
            <div class="vol-lb-infoitem">
              <span class="vol-lb-infolabel">{icon('fa-calendar')} تاريخ التقديم</span>
              <strong id="vol-lb-created" class="vol-lb-infoval">—</strong>
            </div>
            <div class="vol-lb-infoitem">
              <span class="vol-lb-infolabel">{icon('fa-calendar-xmark')} الصلاحية</span>
              <strong id="vol-lb-expiry" class="vol-lb-infoval">—</strong>
            </div>
          </div>
          <div class="vol-lightbox-bottom-actions">
            <button type="button" class="vol-lb-copy-link-btn" id="vol-lb-copy-link">
              {icon('fa-link')} نسخ رابط الصورة
            </button>
            <button type="button" class="vol-lb-close-bottom-btn" id="vol-lb-close-bottom">
              إغلاق النافذة {icon('fa-xmark')}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
}

export function DashContacts({ list = [] }: { list: any[] }) {
  return <section class="dash-table">
    <header style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px">
      <div>
        <h3>الرسائل الواردة ({list.length})</h3>
        <p style="color:var(--muted); font-size:.82rem; margin-top:2px">جميع الرسائل والاستفسارات الواردة من زوار الموقع عبر صفحة تواصل معنا.</p>
      </div>
      <a href="/api/export/contacts" download class="export-excel-btn">
        {icon('fa-file-excel')} تصدير Excel
      </a>
    </header>
    <table>
      <thead>
        <tr>
          <th>المرسل</th>
          <th>بيانات التواصل</th>
          <th>الموضوع والتاريخ</th>
          <th>نص الرسالة</th>
          <th>الحالة</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {list.length === 0 ? (
          <tr>
            <td colSpan={6} style="text-align:center; padding:3rem 1rem; color:var(--muted)">
              <div style="font-size:2.2rem; margin-bottom:.5rem; color:var(--emerald)">{icon('fa-inbox')}</div>
              <strong style="display:block; font-size:1.05rem; color:var(--heading)">لا توجد رسائل واردة حتى الآن</strong>
              <p style="font-size:.84rem; margin-top:4px; color:var(--muted)">ستظهر هنا تلقائياً أي رسائل أو استفسارات يرسلها الزوار عبر الموقع.</p>
            </td>
          </tr>
        ) : (
          list.map((c: any) => {
            const isRead = c.status === 'read'
            const dateDisplay = c.created_at ? new Date(c.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

            return <tr>
              <td>
                <strong>{c.name}</strong>
              </td>
              <td>
                <div style="display:flex; flex-direction:column; gap:3px">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} style="display:inline-flex; align-items:center; gap:6px; font-size:.84rem; color:var(--text); text-decoration:none; direction:ltr; text-align:right">
                      <span style="color:var(--emerald)">{icon('fa-phone')}</span> <span>{c.phone}</span>
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} style="display:inline-flex; align-items:center; gap:6px; font-size:.82rem; color:var(--muted); text-decoration:none; direction:ltr; text-align:right">
                      <span>{icon('fa-envelope')}</span> <span>{c.email}</span>
                    </a>
                  )}
                </div>
              </td>
              <td>
                <strong>{c.subject || 'استفسار عام'}</strong>
                {dateDisplay && <small style="display:block; color:var(--muted); font-size:.74rem; margin-top:3px">{dateDisplay}</small>}
              </td>
              <td style="max-width:320px; white-space:pre-wrap; line-height:1.45; font-size:.86rem">
                {c.message}
              </td>
              <td>
                <span style={`display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:8px; font-weight:700; font-size:.78rem; ${isRead ? 'background:rgba(16,185,129,.12); color:#10b981' : 'background:rgba(232,111,81,.12); color:#e86f51'}`}>
                  {isRead ? icon('fa-envelope-open') : icon('fa-envelope')}
                  <span>{isRead ? 'مقروءة' : 'جديدة'}</span>
                </span>
              </td>
              <td>
                <div style="display:flex; gap:6px; align-items:center; flex-wrap:nowrap">
                  <form action={`/api/contacts/status/${c.id}`} method="post" class="dash-action-form" style="display:inline">
                    <input type="hidden" name="status" value={isRead ? 'unread' : 'read'} />
                    <button
                      type="submit"
                      class="dash-edit-btn"
                      style={isRead ? 'background:#64748b !important; border-color:#475569 !important' : 'background:#10b981 !important; border-color:#059669 !important'}
                      title={isRead ? 'تحديد كرسالة جديدة' : 'تحديد كرسالة مقروءة'}
                    >
                      {isRead ? <>{icon('fa-envelope')} غير مقروءة</> : <>{icon('fa-check')} مقروءة</>}
                    </button>
                  </form>
                  <form action={`/api/contacts/delete/${c.id}`} method="post" class="dash-action-form" data-confirm={`هل أنت متأكد من حذف رسالة "${c.name}" نهائياً؟`} style="display:inline">
                    <button type="submit" class="dash-delete-btn" title="حذف هذه الرسالة">
                      {icon('fa-trash-can')} حذف
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          })
        )}
      </tbody>
    </table>
  </section>
}

export function DashNews({ list = [] }: { list: any[] }) {
  return <>
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center">
        <h3>الأخبار المنشورة</h3>
        <a href="/api/export/news" download class="export-excel-btn">
          {icon('fa-file-excel')} تصدير Excel
        </a>
      </header>
      <table>
        <thead>
          <tr>
            <th>العنوان</th>
            <th>القسم</th>
            <th>موجز</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((n: any) => (
            <tr>
              <td>{n.title}</td>
              <td>{n.category}</td>
              <td style="max-width:300px">{n.excerpt}</td>
              <td>
                <div style="display:flex; gap:6px; align-items:center">
                  <button
                    type="button"
                    class="edit-news-btn dash-edit-btn"
                    data-id={n.id}
                    data-title={n.title}
                    data-category={n.category}
                    data-excerpt={n.excerpt}
                    data-content={n.content || ''}
                    data-image={n.image_url || ''}
                  >{icon('fa-pen-to-square')} تعديل</button>
                  <form action={`/api/news/delete/${n.id}`} method="post" class="dash-action-form" data-confirm="هل أنت متأكد من حذف هذا الخبر؟">
                    <button type="submit" class="dash-delete-btn">{icon('fa-trash-can')} حذف</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/news/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:600px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة خبر جديد</h3>
        <label>عنوان الخبر<input name="title" required /></label>
        <label>القسم<input name="category" placeholder="صحة، مجتمع، تعليم" required /></label>
        <div class="upload-widget">
          <input type="hidden" name="image_url" class="cloudinary-url" />
          <label>صورة الخبر</label>
          <div class="upload-drop-zone">
            <input type="file" accept="image/*,video/*" class="upload-file-input" />
            <div class="upload-placeholder"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span><small>JPG, PNG, WEBP — حد أقصى 10 ميجا</small></div>
            <img class="upload-preview" style="display:none" alt="معاينة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>
        <label>موجز الخبر (يظهر في القائمة)<input name="excerpt" required /></label>
        <label>محتوى الخبر بالكامل<textarea name="content" rows={6} required></textarea></label>
        <button class="primary-btn" type="submit" id="news-submit-btn">نشر الخبر</button>
      </form>
    </section>
  </>
}

export function DashEvents({ list = [] }: { list: any[] }) {
  return <>
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center">
        <h3>الفعاليات الحالية</h3>
        <a href="/api/export/events" download class="export-excel-btn">
          {icon('fa-file-excel')} تصدير Excel
        </a>
      </header>
      <table>
        <thead>
          <tr>
            <th>الفعالية</th>
            <th>النوع</th>
            <th>المكان</th>
            <th>التاريخ</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((e: any) => {
            const date = new Date(e.event_date).toLocaleDateString('ar-EG')
            return <tr>
              <td>{e.title}</td>
              <td>{e.type}</td>
              <td>{e.place}</td>
              <td>{date}</td>
              <td>
                <div style="display:flex; gap:6px; align-items:center">
                  <button
                    type="button"
                    class="edit-event-btn dash-edit-btn"
                    data-id={e.id}
                    data-title={e.title}
                    data-type={e.type}
                    data-place={e.place}
                    data-date={e.event_date ? new Date(e.event_date).toISOString().slice(0, 16) : ''}
                    data-description={e.description || ''}
                    data-image={e.image_url || ''}
                  >{icon('fa-pen-to-square')} تعديل</button>
                  <form action={`/api/events/delete/${e.id}`} method="post" class="dash-action-form" data-confirm="هل أنت متأكد من حذف هذه الفعالية؟">
                    <button type="submit" class="dash-delete-btn">{icon('fa-trash-can')} حذف</button>
                  </form>
                </div>
              </td>
            </tr>
          })}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/events/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:600px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة فعالية جديدة</h3>
        <label>اسم الفعالية<input name="title" required /></label>
        <label>نوع الفعالية<input name="type" placeholder="صحة، تعليم، مجتمع" required /></label>
        <label>المكان<input name="place" required /></label>
        <label>التاريخ والوقت<input type="datetime-local" name="event_date" required /></label>
        <div class="upload-widget">
          <input type="hidden" name="image_url" class="cloudinary-url" />
          <label>صورة الفعالية</label>
          <div class="upload-drop-zone">
            <input type="file" accept="image/*,video/*" class="upload-file-input" />
            <div class="upload-placeholder"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span><small>JPG, PNG, WEBP — حد أقصى 10 ميجا</small></div>
            <img class="upload-preview" style="display:none" alt="معاينة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>
        <label>الوصف<textarea name="description" rows={3}></textarea></label>
        <button class="primary-btn" type="submit" id="event-submit-btn">حفظ الفعالية</button>
      </form>
    </section>
  </>
}

export function DashStories({ list = [] }: { list: any[] }) {
  return <>
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center">
        <h3>قصص النجاح المنشورة</h3>
        <a href="/api/export/stories" download class="export-excel-btn">
          {icon('fa-file-excel')} تصدير Excel
        </a>
      </header>
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الدور</th>
            <th>المحتوى</th>
            <th>التقييم</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s: any) => (
            <tr>
              <td>{s.name}</td>
              <td>{s.role}</td>
              <td style="max-width:300px">{s.content}</td>
              <td>{'★'.repeat(s.rating || 5)}</td>
              <td>
                <div style="display:flex; gap:6px; align-items:center">
                  <button
                    type="button"
                    class="edit-story-btn dash-edit-btn"
                    data-id={s.id}
                    data-name={s.name}
                    data-role={s.role}
                    data-rating={s.rating || 5}
                    data-content={s.content || ''}
                    data-image={s.image_url || ''}
                  >{icon('fa-pen-to-square')} تعديل</button>
                  <form action={`/api/stories/delete/${s.id}`} method="post" class="dash-action-form" data-confirm="هل أنت متأكد من حذف قصة النجاح هذه؟">
                    <button type="submit" class="dash-delete-btn">{icon('fa-trash-can')} حذف</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/stories/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:600px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة قصة نجاح جديدة</h3>
        <label>الاسم<input name="name" placeholder="أحمد م." required /></label>
        <label>الدور / الصفة<input name="role" placeholder="مستفيد، متطوع" required /></label>
        <label>التقييم (1-5)<input type="number" name="rating" min="1" max="5" value="5" required /></label>
        <div class="upload-widget">
          <input type="hidden" name="image_url" class="cloudinary-url" />
          <label>صورة صاحب القصة (اختياري)</label>
          <div class="upload-drop-zone">
            <input type="file" accept="image/*" class="upload-file-input" />
            <div class="upload-placeholder"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span><small>JPG, PNG, WEBP — حد أقصى 10 ميجا</small></div>
            <img class="upload-preview" style="display:none" alt="معاينة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>
        <label>القصة كاملة<textarea name="content" rows={4} required></textarea></label>
        <button class="primary-btn" type="submit" id="story-submit-btn">نشر القصة</button>
      </form>
    </section>
  </>
}

export function DashGallery({ list = [] }: { list: any[] }) {
  return <>
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center">
        <h3>معرض الصور المنشورة ({list.length})</h3>
        <a href="/api/export/gallery" download class="export-excel-btn">
          {icon('fa-file-excel')} تصدير Excel
        </a>
      </header>
      <table>
        <thead>
          <tr>
            <th>الصورة</th>
            <th>العنوان</th>
            <th>التصنيف</th>
            <th>المكان / الموقع</th>
            <th>تاريخ الإضافة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((g: any) => {
            const date = g.created_at ? new Date(g.created_at).toLocaleDateString('ar-EG') : '-'
            return <tr>
              <td>
                <div style="width:60px; height:45px; border-radius:8px; overflow:hidden; background:var(--surface-2); border:1px solid var(--border)">
                  <img src={g.image_url} alt={g.title} style="width:100%; height:100%; object-fit:cover" />
                </div>
              </td>
              <td><b>{g.title}</b></td>
              <td><span class="category-chip">{g.tag || 'عام'}</span></td>
              <td>{g.location || 'المؤسسة'}</td>
              <td>{date}</td>
              <td>
                <div style="display:flex; gap:6px; align-items:center">
                  <form action={`/api/gallery/delete/${g.id}`} method="post" class="dash-action-form" data-confirm="هل أنت متأكد من حذف هذه الصورة من المعرض؟">
                    <button type="submit" class="dash-delete-btn">{icon('fa-trash-can')} حذف</button>
                  </form>
                </div>
              </td>
            </tr>
          })}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/gallery/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:600px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة صورة جديدة لمعرض الصور</h3>
        <label>عنوان الصورة *<input name="title" placeholder="مثل: قافلة الإطعام والدعم الغذائي" required /></label>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem">
          <label>التصنيف
            <select name="tag" style="padding:10px; border-radius:10px; border:1px solid var(--line); background:var(--surface); margin-top:4px">
              <option value="عام">عام</option>
              <option value="غذاء">غذاء وإطعام</option>
              <option value="تعليم">تعليم ومستلزمات</option>
              <option value="صحة">صحة ورعاية طبية</option>
              <option value="قرآن">قرآن ودعوة</option>
              <option value="مجتمع">مجتمع وتكافل</option>
              <option value="تطوع">تطوع وبناء</option>
              <option value="موسمي">موسمي وأعياد</option>
            </select>
          </label>
          <label>الموقع / المكان<input name="location" placeholder="مثل: كفر العنانية، الدقهلية" value="كفر العنانية" /></label>
        </div>

        <div class="upload-widget">
          <input type="hidden" name="image_url" class="cloudinary-url" required />
          <label>صورة الفعالية / المعرض *</label>
          <div class="upload-drop-zone">
            <input type="file" accept="image/*" class="upload-file-input" />
            <div class="upload-placeholder"><i class="fa-solid fa-cloud-arrow-up"></i><span>اسحب الصورة هنا أو اضغط للاختيار</span><small>JPG, PNG, WEBP — حد أقصى 10 ميجا</small></div>
            <img class="upload-preview" style="display:none" alt="معاينة الصورة" />
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-top:.5rem"><span style="font-size:.8rem;color:var(--muted)">أو</span><input class="upload-url-fallback" placeholder="أدخل رابط الصورة https://..." style="flex:1" /></div>
        </div>

        <button class="primary-btn" type="submit" id="gallery-submit-btn">حفظ وإضافة للمعرض {icon('fa-plus')}</button>
      </form>
    </section>
  </>
}

export function DashJobs({ list = [] }: { list: any[] }) {
  return <>
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center">
        <h3>فرص العمل الحالية</h3>
        <a href="/api/export/jobs" download class="export-excel-btn">
          {icon('fa-file-excel')} تصدير Excel
        </a>
      </header>
      <table>
        <thead>
          <tr>
            <th>الوظيفة</th>
            <th>القسم</th>
            <th>النوع</th>
            <th>المكان</th>
            <th>نشط</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {list.map((j: any) => (
            <tr>
              <td>{j.title}</td>
              <td>{j.department}</td>
              <td>{j.job_type}</td>
              <td>{j.location}</td>
              <td>{j.is_active ? 'نعم' : 'لا'}</td>
              <td>
                <div style="display:flex; gap:6px; align-items:center">
                  <button
                    type="button"
                    class="edit-job-btn dash-edit-btn"
                    data-id={j.id}
                    data-title={j.title}
                    data-department={j.department}
                    data-type={j.job_type}
                    data-location={j.location}
                    data-active={j.is_active ? 'true' : 'false'}
                    data-description={j.description || ''}
                  >{icon('fa-pen-to-square')} تعديل</button>
                  <form action={`/api/jobs/delete/${j.id}`} method="post" class="dash-action-form" data-confirm="هل أنت متأكد من حذف فرصة العمل هذه؟">
                    <button type="submit" class="dash-delete-btn">{icon('fa-trash-can')} حذف</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    <section class="section-pad" style="padding-top:2rem">
      <form action="/api/jobs/add" method="post" style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:16px; max-width:600px; display:flex; flex-direction:column; gap:1.2rem">
        <h3>إضافة فرصة عمل جديدة</h3>
        <label>المسمى الوظيفي<input name="title" required /></label>
        <label>القسم<input name="department" placeholder="إدارة، ميداني، طبي" required /></label>
        <label>نوع الوظيفة<input name="job_type" placeholder="دوام كامل، دوام جزئي" required /></label>
        <label>الموقع<input name="location" value="كفر العنانية" required /></label>
        <label>وصف الوظيفة والمتطلبات<textarea name="description" rows={5} required></textarea></label>
        <label style="display:flex; align-items:center; gap:.5rem"><input type="checkbox" name="is_active" value="true" defaultChecked /> وظيفة نشطة (تظهر في الموقع)؟</label>
        <button class="primary-btn" type="submit" id="job-submit-btn">حفظ الوظيفة</button>
      </form>
    </section>
  </>
}

export function DashJobApplications({ list = [] }: { list: any[] }) {
  return <section class="dash-table">
    <header style="display:flex; justify-content:space-between; align-items:center">
      <h3>طلبات التوظيف الواردة</h3>
      <a href="/api/export/job_applications" download class="export-excel-btn">
        {icon('fa-file-excel')} تصدير Excel
      </a>
    </header>
    <table>
      <thead>
        <tr>
          <th>المتقدم</th>
          <th>الوظيفة</th>
          <th>الهاتف / الإيميل</th>
          <th>السيرة الذاتية</th>
          <th>الخبرات</th>
          <th>التاريخ</th>
        </tr>
      </thead>
      <tbody>
        {list.map((a: any) => {
          const date = a.created_at ? new Date(a.created_at).toLocaleDateString('ar-EG') : '-'
          return <tr>
            <td>{a.full_name}</td>
            <td><span class="category-chip">{a.job_title || 'عام'}</span></td>
            <td>{a.phone} / {a.email}</td>
            <td>{a.cv_url ? <a href={a.cv_url} target="_blank" rel="noopener noreferrer" style="color:var(--blue-600);font-weight:600">عرض السيرة {icon('fa-arrow-up-right-from-square')}</a> : '-'}</td>
            <td style="max-width:250px; white-space:pre-wrap">{a.bio || '-'}</td>
            <td>{date}</td>
          </tr>
        })}
      </tbody>
    </table>
  </section>
}

export function DashNewsletter({ list = [] }: { list: any[] }) {
  return <section class="dash-table">
    <header style="display:flex; justify-content:space-between; align-items:center">
      <h3>مشتركو النشرة البريدية</h3>
      <a href="/api/export/newsletter_subscribers" download class="export-excel-btn">
        {icon('fa-file-excel')} تصدير Excel
      </a>
    </header>
    <table>
      <thead>
        <tr>
          <th>البريد الإلكتروني</th>
          <th>الحالة</th>
          <th>تاريخ الاشتراك</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {list.map((n: any) => {
          const date = n.created_at ? new Date(n.created_at).toLocaleDateString('ar-EG') : '-'
          return <tr>
            <td>{n.email}</td>
            <td>{n.status === 'subscribed' ? 'مشترك' : 'ملغى'}</td>
            <td>{date}</td>
            <td>
              <form action={`/api/newsletter/delete/${n.id}`} method="post" style="display:inline">
                <button type="submit" style="background:#ff6b6b; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">حذف</button>
              </form>
            </td>
          </tr>
        })}
      </tbody>
    </table>
  </section>
}

export function DashUsers({ list = [], currentUserId }: { list: any[], currentUserId: string }) {
  return <section class="dash-table">
    <header style="display:flex; justify-content:space-between; align-items:center">
      <h3>المستخدمون والأدوار</h3>
      <a href="/api/export/users" download class="export-excel-btn">
        {icon('fa-file-excel')} تصدير Excel
      </a>
    </header>
    <table>
      <thead>
        <tr>
          <th>الاسم</th>
          <th>البريد الإلكتروني</th>
          <th>الهاتف</th>
          <th>الدور الحالي</th>
          <th>تغيير الدور</th>
        </tr>
      </thead>
      <tbody>
        {list.map((u: any) => {
          const isAdmin = u.role === 'admin'
          const isSelf = u.id === currentUserId

          return <tr>
            <td>
              <b>{u.full_name}</b> {isSelf && <small style="color:var(--blue-600); font-weight:bold">(أنت)</small>}
            </td>
            <td>{u.email}</td>
            <td>{u.phone || '-'}</td>
            <td>
              <span style={`padding:3px 10px; border-radius:12px; font-weight:bold; font-size:.85rem; background:${isAdmin ? 'rgba(214,166,75,.15)' : 'rgba(30,136,229,.15)'}; color:${isAdmin ? 'var(--gold-600)' : 'var(--blue-600)'}`}>
                {isAdmin ? 'مشرف (Admin)' : 'عضو (Donor)'}
              </span>
            </td>
            <td>
              {!isSelf && (
                <form action={`/api/users/role/${u.id}`} method="post" style="display:inline">
                  <input type="hidden" name="role" value={isAdmin ? 'donor' : 'admin'} />
                  <button type="submit" style={`background:${isAdmin ? '#e86f51' : 'var(--emerald-600)'}; color:#fff; border:none; padding:4px 10px; border-radius:6px; cursor:pointer; font-weight:600`}>
                    {isAdmin ? 'تنزيل إلى عضو' : 'ترقية إلى مشرف'}
                  </button>
                </form>
              )}
            </td>
          </tr>
        })}
      </tbody>
    </table>
  </section>
}

// =====================================================================
// نظام الحالات والمستفيدون
// =====================================================================
export function DashCases({ groups = [], cases = [], stats = {}, user }: { groups: any[], cases?: any[], stats: any, user: UserSession }) {
  const totalGroups = stats.total_groups || 0
  const totalBeneficiaries = stats.total_beneficiaries || 0
  const totalCases = stats.total_cases || (cases || []).length
  const totalTarget = stats.total_target || (cases || []).reduce((sum: number, c: any) => sum + Number(c.target_amount || 0), 0)
  const totalRaised = stats.total_raised || (cases || []).reduce((sum: number, c: any) => sum + Number(c.raised_amount || 0), 0)
  const overallPercent = totalTarget > 0 ? Math.min(100, Math.round((totalRaised / totalTarget) * 100)) : 0

  return <>
    {/* بطاقات إحصائية رئيسية */}
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.2rem; margin-bottom: 2rem">
      <article style="background: var(--paper); border: 2px solid var(--emerald-600); border-radius: 20px; padding: 1.3rem">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span style="font-size:1.6rem; color:var(--emerald-600)">{icon('fa-hand-holding-heart')}</span>
          <small style="color:var(--muted); font-weight:700">الحالات الإنسانية المنشورة</small>
        </div>
        <b style="font-size:1.8rem; display:block; margin-top:.6rem; color:var(--emerald-600)">
          {totalCases} حالة
        </b>
      </article>

      <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 1.3rem">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span style="font-size:1.6rem; color:var(--gold-600)">{icon('fa-sack-dollar')}</span>
          <small style="color:var(--muted); font-weight:700">المحصل للحالات</small>
        </div>
        <b style="font-size:1.8rem; display:block; margin-top:.6rem; color:var(--gold-600)">
          {totalRaised.toLocaleString('ar-EG')} ج.م
        </b>
        <small style="color:var(--muted); font-size:.8rem">من إجمالي مستهدف {totalTarget.toLocaleString('ar-EG')} ج.م ({overallPercent}%)</small>
      </article>

      <article style="background: var(--paper); border: 1px solid #8b5cf6; border-radius: 20px; padding: 1.3rem">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span style="font-size:1.6rem; color:#8b5cf6">{icon('fa-people-group')}</span>
          <small style="color:var(--muted); font-weight:700">أرشيف أسماء المستفيدين</small>
        </div>
        <b style="font-size:1.8rem; display:block; margin-top:.6rem; color:#8b5cf6">
          {totalBeneficiaries.toLocaleString('ar-EG')} مستفيد
        </b>
        <small style="color:var(--muted); font-size:.8rem">في {totalGroups} دفعة مسجلة</small>
      </article>
    </div>

    {/* ────────────────── القسم الأول: الحالات الإنسانية المنشورة للجمهور ────────────────── */}
    <section class="section-pad" style="padding-top:0; margin-bottom:2.5rem">
      <div style="background:var(--surface); border:1.5px solid var(--emerald-600); border-radius:20px; padding:1.8rem; box-shadow:0 4px 20px rgba(0,0,0,0.03); margin-bottom:2rem">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.2rem">
          <div>
            <h3 style="color:var(--emerald-600); font-size:1.3rem; font-weight:900; display:flex; align-items:center; gap:8px">
              {icon('fa-square-plus')} إضافة حالة إنسانية جديدة للموقع
            </h3>
            <p style="font-size:.86rem; color:var(--muted); margin-top:4px">
              تُنشر الحالة في صفحة الحالات العامة (/cases) وتتاح لكفالة وتبرع الزوار مباشرة
            </p>
          </div>
          <a href="/cases" target="_blank" class="outline-btn" style="padding:6px 14px; font-size:.85rem; border-radius:10px">
            {icon('fa-arrow-up-right-from-square')} معاينة صفحة الحالات
          </a>
        </div>

        <form action="/api/cases/item/add" method="post" style="display:flex; flex-direction:column; gap:1.2rem">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem">
            <label style="font-weight:700; font-size:.9rem">
              عنوان الحالة *
              <input name="title" required placeholder="مثال: كفالة علاج وجلسات غسيل كلوي لمسن" style="margin-top:6px" />
            </label>
            <label style="font-weight:700; font-size:.9rem">
              كود الحالة <small style="font-weight:400; color:var(--muted)">(تلقائي إن تُرِك فارغاً)</small>
              <input name="code" placeholder="مثال: حالة #105" style="margin-top:6px" />
            </label>
            <label style="font-weight:700; font-size:.9rem">
              التصنيف *
              <select name="category" style="padding:12px; border-radius:12px; border:1px solid var(--line); background:var(--ivory); margin-top:6px; width:100%">
                <option value="صحة وعمليات">صحة وعمليات</option>
                <option value="كفالة أيتام">كفالة أيتام</option>
                <option value="سداد ديون">سداد ديون وغارمات</option>
                <option value="تحسين مسكن">تحسين مسكن وأسقف</option>
                <option value="أجهزة تعويضية">أجهزة تعويضية وتنفسية</option>
                <option value="مساعدات عاجلة">مساعدات غذائية وعاجلة</option>
              </select>
            </label>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem">
            <label style="font-weight:700; font-size:.9rem">
              المبلغ المستهدف (ج.م) *
              <input type="number" name="target_amount" min="1" required placeholder="مثال: 15000" style="margin-top:6px" />
            </label>
            <label style="font-weight:700; font-size:.9rem">
              المبلغ المحصل مبدئياً (ج.م)
              <input type="number" name="raised_amount" min="0" value="0" placeholder="0" style="margin-top:6px" />
            </label>
            <label style="font-weight:700; font-size:.9rem">
              المحافظة / المدينة
              <input name="beneficiary_city" placeholder="مثال: الدقهلية — شربين" style="margin-top:6px" />
            </label>
            <label style="font-weight:700; font-size:.9rem">
              درجة الاستعجال *
              <select name="urgency" style="padding:12px; border-radius:12px; border:1px solid var(--line); background:var(--ivory); margin-top:6px; width:100%">
                <option value="critical">حرجة جدًا (تظهر أولاً مع وميض نبض)</option>
                <option value="high">عالية الاستعجال</option>
                <option value="normal" selected>عادية</option>
              </select>
            </label>
          </div>

          <label style="font-weight:700; font-size:.9rem">
            وصف الحالة والظروف الاجتماعية *
            <textarea name="description" required rows={3} placeholder="شرح تفصيلي وموجز بكرامة وخصوصية لحالة الأسرة والاحتياج الطبي أو المعيشي..." style="margin-top:6px; padding:12px; font-family:inherit; line-height:1.7"></textarea>
          </label>

          <div style="display:flex; justify-content:flex-end">
            <button class="primary-btn" type="submit" style="padding:10px 26px; font-size:.95rem">
              {icon('fa-paper-plane')} نشر الحالة في الموقع فوراً
            </button>
          </div>
        </form>
      </div>

      {/* جدول الحالات المنشورة */}
      <div class="dash-table">
        <header style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px">
          <h3>{icon('fa-list-check')} جدول الحالات الإنسانية المنشورة ({cases.length})</h3>
          <span style="font-size:.82rem; color:var(--muted)">تحديث لحظي لتقدم التبرعات لكل حالة</span>
        </header>

        {cases.length === 0 ? (
          <p style="padding:24px; text-align:center; color:var(--muted)">لا توجد حالات مسجلة بعد في قاعدة البيانات. أضف أول حالة أعلاه.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>كود الحالة</th>
                <th>العنوان</th>
                <th>التصنيف والمحافظة</th>
                <th>درجة الاستعجال</th>
                <th>التقدم المالي</th>
                <th>حالة النشر</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c: any) => {
                const target = Number(c.target_amount || 0)
                const raised = Number(c.raised_amount || 0)
                const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0
                const isUrgent = c.urgency === 'critical'
                const isHigh = c.urgency === 'high'

                return <tr>
                  <td>
                    <b style="color:var(--emerald-600)">{c.code || `حالة #${c.id.slice(-4)}`}</b>
                  </td>
                  <td>
                    <div style="font-weight:700; max-width:260px">{c.title}</div>
                    <small style="color:var(--muted); font-size:.78rem; display:block; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">
                      {c.description || 'لا يوجد وصف'}
                    </small>
                  </td>
                  <td>
                    <span style="display:inline-block; padding:2px 8px; border-radius:6px; background:rgba(22,138,112,.1); color:var(--emerald-600); font-size:.8rem; font-weight:700">
                      {c.category || 'عام'}
                    </span>
                    {c.beneficiary_city && <small style="display:block; color:var(--muted); font-size:.76rem; margin-top:2px">{c.beneficiary_city}</small>}
                  </td>
                  <td>
                    {isUrgent ? (
                      <span style="background:#fee2e2; color:#b91c1c; padding:3px 10px; border-radius:999px; font-size:.75rem; font-weight:800">
                        {icon('fa-bolt')} حرجة
                      </span>
                    ) : isHigh ? (
                      <span style="background:#fef3c7; color:#b45309; padding:3px 10px; border-radius:999px; font-size:.75rem; font-weight:800">
                        عالية
                      </span>
                    ) : (
                      <span style="background:#e0f2fe; color:#0369a1; padding:3px 10px; border-radius:999px; font-size:.75rem; font-weight:700">
                        عادية
                      </span>
                    )}
                  </td>
                  <td style="min-width:160px">
                    <div style="display:flex; justify-content:space-between; font-size:.78rem; margin-bottom:4px">
                      <b>{raised.toLocaleString('ar-EG')} ج.م</b>
                      <small style="color:var(--muted)">من {target.toLocaleString('ar-EG')}</small>
                    </div>
                    <div style="width:100%; height:7px; background:var(--line); border-radius:999px; overflow:hidden">
                      <div style={`width:${pct}%; height:100%; background:${pct >= 100 ? 'var(--emerald-600)' : 'var(--gold-600)'}`}></div>
                    </div>
                    <small style="font-size:.72rem; color:var(--muted); font-weight:700">{pct}% مكتمل</small>
                  </td>
                  <td>
                    <form action={`/api/cases/item/toggle/${c.id}`} method="post" style="display:inline">
                      <button type="submit" style={`background:${c.is_published ? 'rgba(22,138,112,.12)' : 'rgba(216,74,74,.12)'}; color:${c.is_published ? 'var(--emerald-600)' : 'var(--danger)'}; border:none; padding:4px 10px; border-radius:8px; font-size:.8rem; font-weight:700; cursor:pointer`}>
                        {c.is_published ? 'منشورة بالموقع' : 'مسودة مخفية'}
                      </button>
                    </form>
                  </td>
                  <td>
                    <div style="display:flex; gap:6px; align-items:center">
                      <a href={`/cases/${c.id}`} target="_blank" class="outline-btn mini-btn" title="عرض في الموقع">
                        {icon('fa-arrow-up-right-from-square')}
                      </a>
                      <a href={`/donate?case_id=${c.id}&case_code=${encodeURIComponent(c.code || c.title)}`} target="_blank" class="primary-btn mini-btn" title="رابط التبرع المباشر">
                        {icon('fa-heart')}
                      </a>
                      <form action={`/api/cases/item/delete/${c.id}`} method="post" class="dash-action-form" data-confirm={`هل أنت متأكد من حذف ${c.title}؟`}>
                        <button type="submit" class="dash-delete-btn">{icon('fa-trash-can')}</button>
                      </form>
                    </div>
                  </td>
                </tr>
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>

    {/* ────────────────── القسم الثاني: واجهة الاستخراج العشوائي وأرشيف المستفيدين ────────────────── */}
    <div style="border-top:2px dashed var(--border); padding-top:2rem; margin-top:2rem; margin-bottom:1.5rem">
      <h3 style="color:#8b5cf6; font-size:1.3rem; font-weight:900; display:flex; align-items:center; gap:8px">
        {icon('fa-boxes-stacked')} أرشيف كشوفات المساعدات الميدانية (تصدير Excel)
      </h3>
      <p style="font-size:.88rem; color:var(--muted); margin-top:4px">
        إدارة دفعات أسماء المستفيدين وتوليد كشوفات التوزيع وتصدير ملفات Excel الرسمية
      </p>
    </div>

    <section style="background: linear-gradient(135deg, rgba(139,92,246,.08) 0%, rgba(6,182,212,.06) 100%); border: 2px solid #8b5cf6; border-radius: 20px; padding: 2rem; margin-bottom: 2rem">
      <h3 style="font-size:1.25rem; font-weight:900; color:#8b5cf6; margin-bottom:.5rem; display:flex; align-items:center; gap:10px">
        {icon('fa-shuffle')} استخراج عينة عشوائية أو كاملة — تحميل ملف Excel المنسق
      </h3>
      <p style="font-size:.88rem; color:var(--muted); margin-bottom:1.5rem">
        يمكنك كتابة أي اسم مجموعة تريد ظهوره على ملف الـ Excel واستخراج العينة فوراً من الأرشيف المفتوح
      </p>

      <div id="random-sample-form" style="display:flex; flex-direction:column; gap:1.2rem">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem">
          <label style="display:flex; flex-direction:column; gap:6px; font-weight:700; font-size:.9rem">
            اسم المجموعة المراد ظهوره في ملف الـ Excel *
            <input
              type="text"
              id="custom-group-title"
              placeholder="مثال: كشف توزيع كراتين رمضان - دفعة ١"
              value="مجموعة مستفيدين — عينة عشوائية"
              style="padding:12px 14px; border-radius:12px; border:1px solid var(--line); background:var(--ivory); font-size:.95rem; color:var(--text); font-weight:600"
            />
            <small style="color:var(--muted); font-size:.78rem">هذا الاسم سيظهر في ترويسة ملف Excel واسم الملف المُحمل</small>
          </label>

          <label style="display:flex; flex-direction:column; gap:6px; font-weight:700; font-size:.9rem">
            مصدر الأسماء المراد السحب منها
            <select name="group_id" id="sample-group-select"
              style="padding:12px 14px; border-radius:12px; border:1px solid var(--line); background:var(--ivory); font-size:.95rem; color:var(--text)">
              <option value="all">جميع أسماء الأرشيف (كل المستفيدين — {totalBeneficiaries.toLocaleString('ar-EG')} اسم)</option>
              {groups.map((g: any) => (
                <option
                  value={g.id}
                  data-total={g.total_count}
                >
                  دفعة: {g.title} ({(g.total_count || 0).toLocaleString('ar-EG')} اسم)
                </option>
              ))}
            </select>
            <small style="color:var(--muted); font-size:.78rem">يمكنك السحب من الأرشيف بالكامل أو اختيار دفعة معينة</small>
          </label>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; align-items:end">
          <label style="display:flex; flex-direction:column; gap:6px; font-weight:700; font-size:.9rem">
            عدد الأسماء المطلوبة عشوائيًا *
            <div style="display:flex; align-items:center; gap:12px">
              <input
                type="range"
                id="sample-count-range"
                name="count"
                min="1"
                max={Math.max(totalBeneficiaries, 100)}
                value="50"
                style="flex:1; accent-color:#8b5cf6"
              />
              <input
                type="number"
                id="sample-count-input"
                min="1"
                max="9999"
                value="50"
                style="width:90px; padding:10px; border-radius:10px; border:1px solid var(--line); background:var(--ivory); text-align:center; font-size:1.1rem; font-weight:700; color:#8b5cf6"
              />
            </div>
            <small id="sample-max-hint" style="color:var(--muted); font-size:.8rem">إجمالي الأرشيف: {totalBeneficiaries.toLocaleString('ar-EG')} اسم</small>
          </label>

          {/* اختصارات الأعداد */}
          <div style="display:flex; flex-direction:column; gap:6px">
            <span style="font-size:.82rem; font-weight:700; color:var(--muted)">اختصارات الاستخراج السريع:</span>
            <div style="display:flex; gap:8px; flex-wrap:wrap">
              <button type="button" class="sample-preset-btn" data-count="1">{icon('fa-dice')} 1 اسم</button>
              <button type="button" class="sample-preset-btn" data-count="10">{icon('fa-chart-column')} 10 أسماء</button>
              <button type="button" class="sample-preset-btn" data-count="50">{icon('fa-bolt')} 50 اسم</button>
              <button type="button" class="sample-preset-btn" data-count="100">{icon('fa-list-ol')} 100 اسم</button>
              <button type="button" class="sample-preset-btn" data-count="all">{icon('fa-globe')} الكل</button>
            </div>
          </div>
        </div>

        <div style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap; margin-top:.8rem; padding-top:1rem; border-top:1px dashed rgba(139,92,246,.2)">
          <button
            type="button"
            id="extract-sample-btn"
            class="btn-extract-main"
            style="font-size:1rem; padding:12px 24px; border-radius:12px;"
          >
            {icon('fa-file-excel')} استخراج العينة وتحميل ملف Excel المنسق
          </button>
          <small style="color:var(--muted); font-size:.84rem; display:flex; align-items:center; gap:6px">
            {icon('fa-shield-halved')} خوارزمية Fisher-Yates المعتمدة لضمان عشوائية ونزاهة الاختيار ١٠٠٪
          </small>
        </div>
      </div>
    </section>

    {/* نموذج إضافة أسماء للأرشيف */}
    <section class="section-pad" style="padding-top:0; margin-bottom:2.5rem">
      <form
        action="/api/cases/groups/add"
        method="post"
        style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:20px; max-width:850px; display:flex; flex-direction:column; gap:1.4rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03)"
      >
        <div>
          <h3 style="color:#8b5cf6; display:flex; align-items:center; gap:8px; font-size:1.3rem">
            {icon('fa-circle-plus')} إضافة أسماء جديدة لأرشيف المستفيدين العام
          </h3>
          <p style="font-size:.88rem; color:var(--muted); margin-top:4px">
            أدخل أو الصق الأسماء مباشرة — لا يُشترط تحديد اسم مجموعة الآن، يمكنك تسمية المجموعة وقت التصدير
          </p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem">
          <label style="font-weight:700">
            تسمية مرجعية للدفعة <small style="font-weight:400; color:var(--muted)">(اختياري للتمييز)</small>
            <input
              name="title"
              placeholder="مثال: كشف أسماء كفر الشيخ — دفعة أغسطس"
              style="margin-top:6px"
            />
          </label>
          <label style="font-weight:700">
            تصنيف المساعدة <small style="font-weight:400; color:var(--muted)">(اختياري)</small>
            <select name="aid_type" style="padding:12px; border-radius:12px; border:1px solid var(--line); background:var(--ivory); margin-top:6px; width:100%">
              <option value="عام">عام / غير محدد</option>
              <option value="مساعدة غذائية">مساعدة غذائية (أغذية وكراتين)</option>
              <option value="مساعدة طبية">مساعدة طبية (أدوية وعلاج)</option>
              <option value="مساعدة تعليمية">مساعدة تعليمية (مصاريف ومستلزمات)</option>
              <option value="مساعدة نقدية">مساعدة نقدية مباشرة</option>
              <option value="كسوة وملابس">كسوة وملابس</option>
              <option value="مساعدة مواسم وأعياد">مساعدة مواسم وأعياد</option>
            </select>
          </label>
        </div>

        <label style="font-weight:700">
          قائمة الأسماء المطلوبة *
          <small style="font-weight:400; color:var(--muted); margin-right:8px">— اكتب أو الصق الأسماء، كل اسم في سطر مستقل</small>
          <textarea
            name="names"
            required
            rows={10}
            placeholder={"أحمد محمد علي\nفاطمة سيد حسن\nمحمود عبدالله إبراهيم\nنور الهدى محمود\n..."}
            id="names-textarea"
            style="margin-top:8px; font-family:inherit; font-size:1rem; line-height:1.8; direction:rtl; padding:1rem"
          ></textarea>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px">
            <small style="color:var(--muted)">
              {icon('fa-circle-info')} الأسماء المكررة والفارغة ستُنظف تلقائيًا
            </small>
            <small id="name-counter" style="font-weight:700; color:#8b5cf6; font-size:.95rem">٠ اسم جاهز للإضافة</small>
          </div>
        </label>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem">
          <div style="background:rgba(139,92,246,.08); padding:8px 14px; border-radius:10px; font-size:.85rem; color:#8b5cf6">
            {icon('fa-user-check')} الأدمن المسجل: <b>{user.name}</b>
          </div>
          <button class="primary-btn" type="submit" style="background:linear-gradient(135deg,#8b5cf6,#06b6d4); font-size:1rem; padding:12px 28px">
            {icon('fa-floppy-disk')} حفظ الأسماء في الأرشيف
          </button>
        </div>
      </form>
    </section>

    {/* جدول دفعات الأرشيف */}
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:.8rem">
        <h3 style="display:flex; align-items:center; gap:8px">
          {icon('fa-list-check')} سجل دفعات الأسماء بالأرشيف
        </h3>
        <div style="display:flex; align-items:center; gap:10px">
          <span style="font-size:.85rem; color:var(--muted); background:rgba(139,92,246,.1); padding:4px 12px; border-radius:8px; font-weight:600">
            {totalBeneficiaries.toLocaleString('ar-EG')} مستفيد في {totalGroups} دفعة
          </span>
          {totalBeneficiaries > 0 && (
            <form action="/api/cases/clear-all" method="post" class="dash-action-form" data-confirm="هل أنت متأكد تماماً من تصفير ومسح جميع بيانات الأسماء من الأرشيف؟ هذا الإجراء لا يمكن التراجع عنه.">
              <button type="submit" style="background:rgba(216,74,74,.1); color:var(--danger); border:1px solid rgba(216,74,74,.3); padding:4px 12px; border-radius:8px; font-size:.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px">
                {icon('fa-rotate-left')} تصفير الأرشيف بالكامل
              </button>
            </form>
          )}
        </div>
      </header>
      {groups.length === 0 ? (
        <div style="text-align:center; padding:4rem 2rem; color:var(--muted)">
          <p style="font-size:3rem; margin-bottom:1rem">{icon('fa-inbox')}</p>
          <p style="font-size:1.1rem; font-weight:700">لا توجد دفعات أسماء في الأرشيف حتى الآن</p>
          <p style="font-size:.9rem">أضف أول دفعة أسماء من النموذج أعلاه</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>تسمية الدفعة</th>
              <th>التصنيف</th>
              <th>عدد الأسماء</th>
              <th>معاينة عينة أسماء</th>
              <th>أضيفت بواسطة</th>
              <th>تاريخ الإضافة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g: any) => {
              const date = g.created_at ? new Date(g.created_at).toLocaleDateString('ar-EG') : '-'
              return <tr>
                <td><b>{g.title || 'دفعة عامة'}</b></td>
                <td>
                  <span style="background:rgba(139,92,246,.12); color:#8b5cf6; padding:3px 10px; border-radius:8px; font-weight:600; font-size:.85rem">
                    {g.aid_type || 'عام'}
                  </span>
                </td>
                <td>
                  <b style="font-size:1.1rem; color:#8b5cf6">{(g.total_count || 0).toLocaleString('ar-EG')}</b>
                  <small style="color:var(--muted)"> اسم</small>
                </td>
                <td>
                  <div style="display:flex; flex-wrap:wrap; gap:4px; max-width:220px">
                    {(g.preview_names || []).slice(0, 4).map((n: string) => (
                      <span style="background:var(--surface); border:1px solid var(--border); padding:2px 8px; border-radius:6px; font-size:.78rem">
                        {n}
                      </span>
                    ))}
                    {(g.total_count || 0) > 4 && (
                      <span style="color:var(--muted); font-size:.78rem; padding:2px 4px">
                        +{((g.total_count || 0) - 4).toLocaleString('ar-EG')} آخرين
                      </span>
                    )}
                  </div>
                </td>
                <td><small style="background:rgba(22,138,112,.1); padding:3px 8px; border-radius:6px; font-weight:600">{g.created_by || 'مشرف'}</small></td>
                <td>{date}</td>
                <td>
                  <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center">
                    <a
                      href={`/api/export/cases_full/${g.id}?custom_title=${encodeURIComponent(g.title || 'قائمة_المستفيدين')}`}
                      download
                      target="_blank"
                      rel="noopener"
                      class="btn-export-excel"
                      style="background:#059669 !important; color:#ffffff !important; border:1px solid #047857; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:.84rem; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:4px; box-shadow:0 2px 6px rgba(5,150,105,0.25)"
                    >
                      {icon('fa-file-excel')} تصدير Excel
                    </a>
                    <form action={`/api/cases/groups/delete/${g.id}`} method="post" class="dash-action-form" data-confirm={`هل أنت متأكد من حذف دفعة "${g.title}"؟`}>
                      <button type="submit" class="dash-delete-btn">{icon('fa-trash-can')} حذف</button>
                    </form>
                  </div>
                </td>
              </tr>
            })}
          </tbody>
        </table>
      )}
    </section>
  </>
}

/**
 * سجل التدقيق — عرض للقراءة فقط.
 *
 * لا يوجد هنا زر تعديل أو حذف، وهذا مقصود: سجل التدقيق الذي يمكن للمشرف
 * تعديله أو حذف أسطر منه لا يُثبت شيئًا لأي مراجع خارجي. القيمة الكاملة
 * للسجل تأتي من كونه غير قابل للتغيير من داخل الواجهة.
 *
 * يُعرض أحدث 100 عملية فقط (الحدّ مطبَّق في مُحمِّل البيانات) لأن السجل
 * ينمو مع كل عملية إدارية بلا توقف.
 */
const AUDIT_ACTIONS: Record<string, [string, string]> = {
  create: ['إضافة', 'var(--emerald-600)'],
  update: ['تعديل', 'var(--gold-600)'],
  delete: ['حذف', '#e53935']
}

const AUDIT_RESOURCES: Record<string, string> = {
  campaigns: 'الحملات',
  donations: 'التبرعات',
  volunteers: 'المتطوعون',
  users: 'المستخدمون',
  cases: 'الحالات والمستفيدون',
  treasury: 'الخزينة',
  gallery: 'معرض الصور',
  news: 'الأخبار',
  reports: 'التقارير',
  partners: 'الشركاء',
  team: 'فريق العمل',
  testimonials: 'شهادات',
  contact: 'رسائل التواصل',
  newsletter: 'النشرة البريدية',
  settings: 'الإعدادات',
  upload: 'الملفات'
}

/**
 * صياغة عدد العمليات بعربية صحيحة.
 *
 * العدد في العربية يفرض صيغة المعدود، والصياغة الآلية
 * (`${n} عملية`) تُنتج "٣ عملية" وهي خطأ نحوي واضح على واجهة
 * مؤسسة مسجَّلة:
 *   ١ → عملية واحدة        (مفرد)
 *   ٢ → عمليتان            (مثنى)
 *   ٣–١٠ → ٣ عمليات        (جمع)
 *   ١١+ → ١١ عملية         (مفرد، تمييز منصوب)
 * والمئات المضبوطة (١٠٠، ٢٠٠…) تعود للمفرد كذلك.
 */
const countLabel = (n: number): string => {
  const d = (x: number) => x.toLocaleString('ar-EG')
  if (n === 0) return 'لا عمليات'
  if (n === 1) return 'أحدث عملية'
  if (n === 2) return 'أحدث عمليتين'
  const mod100 = n % 100
  if (mod100 >= 3 && mod100 <= 10) return `أحدث ${d(n)} عمليات`
  return `أحدث ${d(n)} عملية`
}

export function DashAudit({ list = [] }: { list: any[] }) {
  return <section class="dash-table">
    <header style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px">
      <h3>سجل التدقيق</h3>
      <span style="font-size:.82rem; color:var(--muted)">
        {countLabel(list.length)} · للقراءة فقط
      </span>
    </header>

    {list.length === 0 ? (
      <p style="padding:24px; text-align:center; color:var(--muted)">
        لا توجد عمليات مسجّلة بعد.
      </p>
    ) : (
      <table>
        <thead>
          <tr>
            <th>العملية</th>
            <th>القسم</th>
            <th>المُنفِّذ</th>
            <th>السجل</th>
            <th>التاريخ والوقت</th>
          </tr>
        </thead>
        <tbody>
          {list.map((row: any) => {
            const [label, color] = AUDIT_ACTIONS[row.action] || [row.action || '-', 'var(--muted)']
            const resource = AUDIT_RESOURCES[row.resource] || row.resource || '-'
            // الوقت بالدقيقة وليس التاريخ فقط: التدقيق يحتاج ترتيبًا زمنيًا
            // دقيقًا للتمييز بين عمليات وقعت في اليوم نفسه.
            //
            // التوقيت مثبَّت على القاهرة عن قصد: الطوابع تُخزَّن بـ UTC،
            // والصفحة تُبنى على السيرفر (Vercel) الذي يعمل بـ UTC أيضًا،
            // فلو تُرك للسيرفر لظهرت كل العمليات بفارق ساعتين أو ثلاث عن
            // التوقيت المحلي. في سجل مهمته إثبات *وقت* حدوث العملية،
            // فارق كهذا يجعل السجل مضلِّلًا لا مفيدًا.
            const when = row.created_at
              ? new Date(row.created_at).toLocaleString('ar-EG', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                  timeZone: 'Africa/Cairo'
                })
              : '-'
            return <tr>
              <td>
                <span style={`display:inline-block; padding:3px 10px; border-radius:999px; font-size:.78rem; font-weight:700; color:#fff; background:${color}`}>
                  {label}
                </span>
              </td>
              <td>{resource}</td>
              <td>
                <div style="font-weight:600">{row.actor_name || 'غير معروف'}</div>
                {row.actor_email && (
                  <div style="font-size:.76rem; color:var(--muted); direction:ltr; text-align:right">{row.actor_email}</div>
                )}
              </td>
              <td style="direction:ltr; text-align:right; font-size:.78rem; color:var(--muted)">
                {row.target_id || '—'}
              </td>
              <td style="white-space:nowrap">{when}</td>
            </tr>
          })}
        </tbody>
      </table>
    )}
  </section>
}

export function DashMedical({ equipment = [], requests = [], stats = {} }: { equipment: any[], requests: any[], stats: any }) {
  const totalDev = stats.total_devices ?? equipment.length
  const availDev = stats.available_devices ?? equipment.filter((e: any) => e.status === 'available' || e.is_available !== false).length
  const loanDev = stats.loaned_devices ?? equipment.filter((e: any) => e.status === 'loaned').length
  const pendReq = stats.pending_requests ?? requests.filter((r: any) => r.status === 'pending').length

  const STATUS_MAP: Record<string, [string, string]> = {
    pending: ['قيد المراجعة', '#f59e0b'],
    approved: ['موافقة مبدئية', '#3b82f6'],
    active_loan: ['مُسلَّم قيد الإعارة', 'var(--emerald-600)'],
    returned: ['تم الاسترداد والتعقيم', '#8b5cf6'],
    rejected: ['مرفوض / غير مطابق', '#ef4444']
  }

  return <section class="dash-section">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem">
      <div>
        <h2 style="font-size:1.4rem; font-weight:900; color:var(--text); display:flex; align-items:center; gap:10px">
          {icon('fa-stethoscope')} بنك الأجهزة الطبية والتنفسية المجاني
        </h2>
        <p style="color:var(--muted); font-size:.9rem; margin-top:4px">
          إدارة أسطول الأجهزة الطبية المعارة لوجه الله، ومتابعة طلبات المرضى وأسطوانات الأكسجين والكراسي المتحركة.
        </p>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap">
        <a href="/medical-equipment" target="_blank" class="dash-action-btn" style="text-decoration:none; background:var(--surface); border:1px solid var(--border); color:var(--text); padding:8px 16px; border-radius:10px; font-weight:700; font-size:.9rem; display:inline-flex; align-items:center; gap:8px">
          {icon('fa-arrow-up-right-from-square')} عرض صفحة البنك للجمهور
        </a>
      </div>
    </div>

    {/* KPI Summary Cards */}
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem">
      <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 16px; padding: 1.2rem; display: flex; flex-direction: column; justify-content: space-between">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span style="font-size: 1.4rem; color: var(--blue-600)">{icon('fa-boxes-stacked')}</span>
          <small style="color: var(--muted); font-size: .8rem; font-weight:700">إجمالي وحدات الأسطول</small>
        </div>
        <b style="font-size: 1.8rem; margin-top: .6rem; color: var(--blue-600)">{totalDev}</b>
      </article>

      <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 16px; padding: 1.2rem; display: flex; flex-direction: column; justify-content: space-between">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span style="font-size: 1.4rem; color: var(--emerald-600)">{icon('fa-circle-check')}</span>
          <small style="color: var(--muted); font-size: .8rem; font-weight:700">أجهزة متاحة للتسليم</small>
        </div>
        <b style="font-size: 1.8rem; margin-top: .6rem; color: var(--emerald-600)">{availDev}</b>
      </article>

      <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 16px; padding: 1.2rem; display: flex; flex-direction: column; justify-content: space-between">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span style="font-size: 1.4rem; color: var(--gold-600)">{icon('fa-hand-holding-medical')}</span>
          <small style="color: var(--muted); font-size: .8rem; font-weight:700">قيد الإعارة لدى المرضى</small>
        </div>
        <b style="font-size: 1.8rem; margin-top: .6rem; color: var(--gold-600)">{loanDev}</b>
      </article>

      <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 16px; padding: 1.2rem; display: flex; flex-direction: column; justify-content: space-between">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <span style="font-size: 1.4rem; color: #f59e0b">{icon('fa-clock-rotate-left')}</span>
          <small style="color: var(--muted); font-size: .8rem; font-weight:700">طلبات جديدة معلقة</small>
        </div>
        <b style="font-size: 1.8rem; margin-top: .6rem; color: #f59e0b">{pendReq}</b>
      </article>
    </div>

    {/* Section 1: Incoming Citizen Requests */}
    <div style="background:var(--paper); border:1px solid var(--line); border-radius:20px; padding:1.5rem; margin-bottom:2.5rem">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.2rem">
        <div>
          <h3 style="font-size:1.2rem; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px">
            {icon('fa-file-waveform')} طلبات استعارة الأجهزة الطبية ({requests.length})
          </h3>
          <p style="color:var(--muted); font-size:.85rem">الطلبات الواردة من المواطنين والأسر المتعففة عبر البوابة الإلكترونية</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div style="text-align:center; padding:3rem 1rem; color:var(--muted)">
          <p style="font-size:2.5rem; margin-bottom:.5rem">{icon('fa-inbox')}</p>
          <p style="font-weight:700">لا توجد طلبات استعارة معلقة حالياً بحمد الله</p>
        </div>
      ) : (
        <div style="overflow-x:auto">
          <table style="width:100%; border-collapse:collapse; min-width:850px">
            <thead>
              <tr style="border-bottom:2px solid var(--line); text-align:right">
                <th style="padding:10px">المريض / مقدم الطلب</th>
                <th style="padding:10px">الرقم القومي / الهاتف</th>
                <th style="padding:10px">الجهاز المطلوب</th>
                <th style="padding:10px">العنوان / المدينة</th>
                <th style="padding:10px">التشخيص والمدة</th>
                <th style="padding:10px">الحالة</th>
                <th style="padding:10px">تحديث الحالة</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r: any) => {
                const [statusText, statusColor] = STATUS_MAP[r.status] || [r.status || 'معلق', '#999']
                const cleanPhone = (r.requester_phone || '').replace(/\D/g, '')

                return (
                  <tr style="border-bottom:1px solid var(--line); vertical-align:middle">
                    <td style="padding:12px 10px">
                      <b>{r.patient_name || 'مريض'}</b>
                      {r.requester_name && r.requester_name !== r.patient_name && (
                        <div style="font-size:.78rem; color:var(--muted)">بواسطة: {r.requester_name}</div>
                      )}
                    </td>
                    <td style="padding:12px 10px">
                      <div style="direction:ltr; text-align:right; font-weight:600">
                        <a href={`tel:${cleanPhone}`} style="color:var(--emerald-600); text-decoration:none">
                          {icon('fa-phone')} {r.requester_phone || '-'}
                        </a>
                      </div>
                      {cleanPhone && (
                        <a href={`https://wa.me/2${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`} target="_blank" rel="noopener" style="font-size:.75rem; color:#25D366; text-decoration:none; display:inline-flex; align-items:center; gap:4px">
                          <i class="fa-brands fa-whatsapp"></i> مراسلة واتساب
                        </a>
                      )}
                      {r.patient_national_id && (
                        <div style="font-size:.75rem; color:var(--muted)">ق: {r.patient_national_id}</div>
                      )}
                    </td>
                    <td style="padding:12px 10px">
                      <span style="font-weight:700; color:var(--text)">{r.equipment_type || '-'}</span>
                    </td>
                    <td style="padding:12px 10px">
                      <div>{r.city || 'غير محدد'}</div>
                      <small style="color:var(--muted); font-size:.78rem">{r.address || '-'}</small>
                    </td>
                    <td style="padding:12px 10px; max-width:200px">
                      <div style="font-size:.85rem">{r.diagnosis || 'رعاية منزلية'}</div>
                      <small style="color:var(--muted)">المدة: {r.expected_duration || 'شهر'}</small>
                    </td>
                    <td style="padding:12px 10px">
                      <span style={`display:inline-block; padding:4px 10px; border-radius:999px; font-size:.78rem; font-weight:700; color:#fff; background:${statusColor}`}>
                        {statusText}
                      </span>
                    </td>
                    <td style="padding:12px 10px">
                      <form action={`/api/medical/requests/status/${r.id}`} method="post" style="display:flex; gap:6px; align-items:center">
                        <select name="status" style="padding:6px 8px; border-radius:8px; border:1px solid var(--border); background:var(--surface); font-size:.82rem">
                          <option value="pending" selected={r.status === 'pending'}>قيد المراجعة</option>
                          <option value="approved" selected={r.status === 'approved'}>موافقة مبدئية</option>
                          <option value="active_loan" selected={r.status === 'active_loan'}>تسليم وإعارة</option>
                          <option value="returned" selected={r.status === 'returned'}>تم الاسترداد</option>
                          <option value="rejected" selected={r.status === 'rejected'}>رفض</option>
                        </select>
                        <button type="submit" class="dash-action-btn" style="background:var(--emerald-600); color:#fff; border:none; padding:6px 10px; border-radius:8px; font-size:.8rem; cursor:pointer; font-weight:700">
                          حفظ
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* Section 2: Fleet Inventory & Add Device */}
    <div style="background:var(--paper); border:1px solid var(--line); border-radius:20px; padding:1.5rem">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem">
        <div>
          <h3 style="font-size:1.2rem; font-weight:800; color:var(--text); display:flex; align-items:center; gap:8px">
            {icon('fa-truck-medical')} أسطول الأجهزة والمعدات الطبية ({equipment.length})
          </h3>
          <p style="color:var(--muted); font-size:.85rem">سجل الأجهزة المملوكة للمؤسسة وجاهزيتها للتسليم الدوري</p>
        </div>
        <button
          type="button"
          id="btn-toggle-add-med"
          style="background:var(--emerald-600); color:#fff; border:none; padding:8px 18px; border-radius:10px; font-weight:700; font-size:.9rem; cursor:pointer; display:inline-flex; align-items:center; gap:6px"
          onclick="document.getElementById('add-med-panel').style.display = document.getElementById('add-med-panel').style.display === 'none' ? 'block' : 'none'"
        >
          {icon('fa-plus')} إضافة جهاز طبي جديد
        </button>
      </div>

      {/* Expandable Add Form */}
      <div id="add-med-panel" style="display:none; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:1.5rem; margin-bottom:2rem">
        <h4 style="margin-bottom:1rem; font-weight:800; display:flex; align-items:center; gap:8px">
          {icon('fa-file-circle-plus')} تسجيل جهاز طبي جديد في أسطول المؤسسة
        </h4>
        <form action="/api/medical/items/add" method="post" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem">
          <div>
            <label style="display:block; font-size:.85rem; font-weight:700; margin-bottom:4px">اسم الجهاز *</label>
            <input type="text" name="name" placeholder="مثال: مولد أكسجين 10 لتر Yuwell" required style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--border)" />
          </div>
          <div>
            <label style="display:block; font-size:.85rem; font-weight:700; margin-bottom:4px">التصنيف *</label>
            <select name="category" required style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--border)">
              <option value="respiratory">أجهزة تنفسية وأكسجين</option>
              <option value="mobility">كراسي متحركة وأجهزة حركية</option>
              <option value="beds">أسرّة طبية ومستلزمات</option>
              <option value="diagnostics">أجهزة قياس وفحص</option>
            </select>
          </div>
          <div>
            <label style="display:block; font-size:.85rem; font-weight:700; margin-bottom:4px">كود الجهاز / السيريال</label>
            <input type="text" name="code" placeholder="مثال: OXY-10L-03" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--border)" />
          </div>
          <div>
            <label style="display:block; font-size:.85rem; font-weight:700; margin-bottom:4px">الحالة الفنية</label>
            <input type="text" name="condition" placeholder="ممتازة — فحص دوري" value="ممتازة" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--border)" />
          </div>
          <div>
            <label style="display:block; font-size:.85rem; font-weight:700; margin-bottom:4px">أيقونة الجهاز (FontAwesome)</label>
            <select name="image_icon" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--border)">
              <option value="fa-lungs">رئة / أكسجين (fa-lungs)</option>
              <option value="fa-bottle-water">أسطوانة غاز (fa-bottle-water)</option>
              <option value="fa-wheelchair">كرسي متحرك (fa-wheelchair)</option>
              <option value="fa-bed-pulse">سرير طبي (fa-bed-pulse)</option>
              <option value="fa-heart-pulse">جهاز قياس وفحص (fa-heart-pulse)</option>
            </select>
          </div>
          <div style="grid-column:1 / -1">
            <label style="display:block; font-size:.85rem; font-weight:700; margin-bottom:4px">وصف ومواصفات الجهاز</label>
            <textarea name="description" rows={2} placeholder="سعة الأكسجين، الملحقات المتوفرة، ماسكات، شروط الاستخدام..." style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--border)"></textarea>
          </div>
          <div style="grid-column:1 / -1; display:flex; justify-content:flex-end; gap:8px">
            <button type="button" onclick="document.getElementById('add-med-panel').style.display='none'" style="padding:8px 16px; border-radius:8px; border:1px solid var(--border); background:none; cursor:pointer">إلغاء</button>
            <button type="submit" style="padding:8px 20px; border-radius:8px; background:var(--emerald-600); color:#fff; border:none; font-weight:700; cursor:pointer">حفظ الجهاز في الأسطول</button>
          </div>
        </form>
      </div>

      {/* Equipment Fleet Table */}
      <div style="overflow-x:auto">
        <table style="width:100%; border-collapse:collapse; min-width:800px">
          <thead>
            <tr style="border-bottom:2px solid var(--line); text-align:right">
              <th style="padding:10px">الجهاز والموديل</th>
              <th style="padding:10px">التصنيف</th>
              <th style="padding:10px">الكود المرجعي</th>
              <th style="padding:10px">الحالة الفنية</th>
              <th style="padding:10px">عدد مرات الإعارة</th>
              <th style="padding:10px">حالة التوفر</th>
              <th style="padding:10px">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item: any) => {
              const isAvail = item.status === 'available' || (item.is_available !== false && item.status !== 'maintenance' && item.status !== 'loaned')

              return (
                <tr style="border-bottom:1px solid var(--line); vertical-align:middle">
                  <td style="padding:12px 10px">
                    <div style="display:flex; align-items:center; gap:10px">
                      <div style="width:36px; height:36px; border-radius:8px; background:rgba(22,138,112,.12); color:var(--emerald-600); display:flex; align-items:center; justify-content:center; font-size:1.1rem">
                        <i class={`fa-solid ${item.image_icon || 'fa-stethoscope'}`}></i>
                      </div>
                      <div>
                        <b>{item.name}</b>
                        {item.description && (
                          <div style="font-size:.78rem; color:var(--muted); max-width:260px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style="padding:12px 10px">
                    <span style="font-size:.82rem; background:var(--surface); border:1px solid var(--border); padding:3px 8px; border-radius:6px">
                      {item.category_name || item.category || 'عام'}
                    </span>
                  </td>
                  <td style="padding:12px 10px; font-family:monospace; font-weight:700; color:var(--muted)">
                    {item.code || '-'}
                  </td>
                  <td style="padding:12px 10px">
                    <span style="font-size:.82rem">{item.condition || 'ممتازة'}</span>
                  </td>
                  <td style="padding:12px 10px">
                    <b>{(item.total_loans_count || 0).toLocaleString('ar-EG')}</b>
                    <small style="color:var(--muted)"> مريض</small>
                  </td>
                  <td style="padding:12px 10px">
                    {isAvail ? (
                      <span style="background:rgba(22,138,112,.12); color:var(--emerald-600); padding:3px 10px; border-radius:999px; font-size:.78rem; font-weight:700">
                        متاح للتسليم
                      </span>
                    ) : item.status === 'loaned' ? (
                      <span style="background:rgba(217,119,6,.12); color:#d97706; padding:3px 10px; border-radius:999px; font-size:.78rem; font-weight:700">
                        معار حالياً
                      </span>
                    ) : (
                      <span style="background:rgba(239,68,68,.12); color:#ef4444; padding:3px 10px; border-radius:999px; font-size:.78rem; font-weight:700">
                        صيانة وتعقيم
                      </span>
                    )}
                  </td>
                  <td style="padding:12px 10px">
                    <div style="display:flex; gap:6px; align-items:center">
                      <form action={`/api/medical/items/toggle/${item.id}`} method="post">
                        <button type="submit" title="تبديل بين متاح وصيانة" style="padding:5px 8px; border-radius:6px; border:1px solid var(--border); background:var(--surface); cursor:pointer; font-size:.78rem">
                          {icon('fa-arrows-rotate')} {isAvail ? 'إيقاف للصيانة' : 'تفعيل للإتاحة'}
                        </button>
                      </form>
                      <form action={`/api/medical/items/delete/${item.id}`} method="post" data-confirm={`هل أنت متأكد من حذف ${item.name} من الأسطول؟`}>
                        <button type="submit" class="dash-delete-btn" style="padding:5px 8px; border-radius:6px; border:none; background:rgba(239,68,68,.1); color:#ef4444; cursor:pointer; font-size:.78rem">
                          {icon('fa-trash-can')}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  </section>
}
