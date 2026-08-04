import { icon, Layout } from './shared'
import type { UserSession } from '../types'

export function Dashboard({ view, data, user }: { view: string, data: any, user: UserSession }) {
  const sideMenu = [
    ['fa-chart-pie', 'نظرة عامة', 'overview'],
    ['fa-vault', 'الخزنة المالية', 'treasury'],
    ['fa-arrow-down', 'الإيرادات (الوارد)', 'income'],
    ['fa-arrow-up', 'المصروفات (المنصرف)', 'expenses'],
    ['fa-bullseye', 'الحملات', 'campaigns'],
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
    ['fa-clipboard-list', 'الحالات والمستفيدون', 'cases']
  ]

  const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })

  return <Layout user={user} title="لوحة التحكم | مؤسسة الدكتور عمر هشام" pageType="dashboard">
    <section class="dashboard-wrap">
      <aside class="dash-sidebar" aria-label="تنقل لوحة التحكم">
        <div class="dash-brand"><a href="/" style="display:flex;align-items:center;gap:15px;color:inherit;text-decoration:none"><img src="/static/foundation-logo.png" alt="" /><span><small>مؤسسة الدكتور عمر هشام</small>لوحة التحكم</span></a><button id="dash-menu-close" type="button" aria-label="إغلاق القائمة">{icon('fa-xmark')}</button></div>
        <nav>{sideMenu.map((n) => <a class={view === n[2] ? 'active' : ''} href={`/dashboard?view=${n[2]}`} aria-current={view === n[2] ? 'page' : undefined}>{icon(n[0])}<span>{n[1]}</span></a>)}</nav>
        <div class="dash-sidebar-footer"><a href="/">{icon('fa-arrow-up-right-from-square')}<span>عرض الموقع</span></a><a href="/api/auth/logout">{icon('fa-right-from-bracket')}<span>تسجيل الخروج</span></a></div>
      </aside>
      <button class="dash-backdrop" type="button" aria-label="إغلاق القائمة"></button>
      <div class="dash-main">
        <header class="dash-topbar">
          <button class="dash-menu-button" id="dash-menu-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false">{icon('fa-bars-staggered')}</button>
          <div><p>{dateStr}</p><h1>مرحبًا، {user.name}</h1></div>
          <div class="dash-top-actions">
            <div style="display:flex; align-items:center; background:var(--surface-2); border:1px solid var(--border); padding:6px 14px; border-radius:12px; gap:8px; margin-inline-end:10px">
              <span style="color:var(--muted)">{icon('fa-magnifying-glass')}</span>
              <input type="text" id="dash-search-input" placeholder="بحث في الجدول..." style="border:none; background:transparent; outline:none; font-size:.88rem; width:140px; color:var(--text)" />
            </div>
            <button id="theme-toggle" type="button" aria-label="تغيير المظهر">{icon('fa-moon')}</button>
            <span>{icon('fa-user-shield')}</span>
            <b>{user.name}</b>
          </div>
        </header>

        {view === 'overview' && <DashOverview stats={data.stats} recentDonations={data.recentDonations} />}
        {view === 'treasury' && <DashTreasury summary={data.summary} incomeList={data.incomeList} expenseList={data.expenseList} campaigns={data.campaigns} user={user} />}
        {view === 'income' && <DashIncome list={data.list} campaigns={data.campaigns} user={user} />}
        {view === 'expenses' && <DashExpenses list={data.list} campaigns={data.campaigns} user={user} />}
        {view === 'campaigns' && <DashCampaigns list={data.list} />}
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
        {view === 'cases' && <DashCases groups={data.groups || []} stats={data.stats || {}} user={user} />}
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
        <label>تاريخ الاستلام *<input type="date" name="date" defaultValue={today} required /></label>
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
        <label>تاريخ الصرف *<input type="date" name="date" defaultValue={today} required /></label>
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
      <header style="display:flex; justify-content:space-between; align-items:center">
        <h3>الحملات الحالية</h3>
        <a href="/api/export/campaigns" download class="export-excel-btn">
          {icon('fa-file-excel')} تصدير Excel
        </a>
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
          {list.map((c: any) => (
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
          ))}
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
            <input name="icon" id="campaign-icon-input" defaultValue="fa-heart" placeholder="fa-heart" style="flex:1" />
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
  const totalApproved = list.filter((v: any) => v.status === 'approved').length
  const totalPending = list.filter((v: any) => v.status === 'pending').length
  const totalRevoked = list.filter((v: any) => v.status === 'revoked' || v.is_active === false).length
  const totalHours = list.reduce((sum: number, v: any) => sum + (v.hours_count || 0), 0)

  return <>
    {/* KPI Summary Cards */}
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-bottom:1.5rem">
      <article style="background:var(--paper); border:1px solid var(--line); border-radius:16px; padding:1.2rem; display:flex; align-items:center; justify-content:space-between">
        <div>
          <span style="font-size:.82rem; color:var(--muted); display:block; font-weight:700">إجمالي المتطوعين</span>
          <strong style="font-size:1.6rem; color:var(--text); font-weight:900">{list.length}</strong>
        </div>
        <div style="width:44px; height:44px; border-radius:12px; background:rgba(59,130,246,.12); color:#3b82f6; display:grid; place-items:center; font-size:1.2rem">
          {icon('fa-people-group')}
        </div>
      </article>

      <article style="background:var(--paper); border:1px solid var(--line); border-radius:16px; padding:1.2rem; display:flex; align-items:center; justify-content:space-between">
        <div>
          <span style="font-size:.82rem; color:var(--muted); display:block; font-weight:700">المعتمَدون النشطون</span>
          <strong style="font-size:1.6rem; color:var(--emerald-600); font-weight:900">{totalApproved}</strong>
        </div>
        <div style="width:44px; height:44px; border-radius:12px; background:rgba(67,160,71,.12); color:var(--emerald-600); display:grid; place-items:center; font-size:1.2rem">
          {icon('fa-circle-check')}
        </div>
      </article>

      <article style="background:var(--paper); border:1px solid var(--line); border-radius:16px; padding:1.2rem; display:flex; align-items:center; justify-content:space-between">
        <div>
          <span style="font-size:.82rem; color:var(--muted); display:block; font-weight:700">طلبات قيد المراجعة</span>
          <strong style="font-size:1.6rem; color:var(--gold-600); font-weight:900">{totalPending}</strong>
        </div>
        <div style="width:44px; height:44px; border-radius:12px; background:rgba(245,124,0,.12); color:var(--gold-600); display:grid; place-items:center; font-size:1.2rem">
          {icon('fa-clock')}
        </div>
      </article>

      <article style="background:var(--paper); border:1px solid var(--line); border-radius:16px; padding:1.2rem; display:flex; align-items:center; justify-content:space-between">
        <div>
          <span style="font-size:.82rem; color:var(--muted); display:block; font-weight:700">البطاقات الملغاة / المنتهية</span>
          <strong style="font-size:1.6rem; color:#e53935; font-weight:900">{totalRevoked}</strong>
        </div>
        <div style="width:44px; height:44px; border-radius:12px; background:rgba(229,57,53,.12); color:#e53935; display:grid; place-items:center; font-size:1.2rem">
          {icon('fa-ban')}
        </div>
      </article>

      <article style="background:var(--paper); border:1px solid var(--line); border-radius:16px; padding:1.2rem; display:flex; align-items:center; justify-content:space-between">
        <div>
          <span style="font-size:.82rem; color:var(--muted); display:block; font-weight:700">ساعات الخدمة المسجلة</span>
          <strong style="font-size:1.6rem; color:var(--forest); font-weight:900">{totalHours} س</strong>
        </div>
        <div style="width:44px; height:44px; border-radius:12px; background:rgba(12,74,63,.12); color:var(--forest); display:grid; place-items:center; font-size:1.2rem">
          {icon('fa-award')}
        </div>
      </article>
    </div>

    {/* Main Table Section */}
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px">
        <div>
          <h3 style="font-weight:900; font-size:1.2rem">سجل ومتطوعو المؤسسة</h3>
          <p style="color:var(--muted); font-size:.82rem; margin:4px 0 0">
            يمكنك عرض كافة التفاصيل والصور الرسمية، تعديل المدة، أو إلغاء صلاحية هوية المتطوع بسهولة.
          </p>
        </div>
        <a href="/api/export/volunteers" download class="export-excel-btn">
          {icon('fa-file-excel')} تصدير Excel
        </a>
      </header>

      <table>
        <thead>
          <tr>
            <th>الصورة والاسم</th>
            <th>كود الهوية</th>
            <th>الهاتف والتفاصيل</th>
            <th>المجال / الرتبة</th>
            <th>الساعات</th>
            <th>تاريخ الانتهاء</th>
            <th>الحالة</th>
            <th>الإجراءات والتحكم</th>
          </tr>
        </thead>
        <tbody>
          {list.map((v: any) => {
            const isApproved = v.status === 'approved'
            const isRevoked = v.status === 'revoked' || v.is_active === false
            const isExpired = Boolean(v.expires_at && new Date(v.expires_at) < new Date())
            const expiryDate = v.expires_at ? new Date(v.expires_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' }) : 'مفتوح (دائم)'

            return <tr>
              <td>
                <div style="display:flex; align-items:center; gap:10px">
                  <div style="width:40px; height:40px; border-radius:50%; border:2px solid var(--line); overflow:hidden; background:var(--surface-2); display:grid; place-items:center; flex-shrink:0">
                    {v.avatar_url
                      ? <img src={v.avatar_url} alt={v.full_name} style="width:100%; height:100%; object-fit:cover" />
                      : <span style="font-weight:900; font-size:.9rem; color:var(--emerald)">{v.full_name?.split(' ')?.[0]?.[0] || 'م'}</span>
                    }
                  </div>
                  <div>
                    <strong style="display:block; font-size:.92rem">{v.full_name}</strong>
                    <small style="color:var(--muted); font-size:.75rem">{v.city ? `${v.city}` : ''} {v.age ? `· ${v.age} سنة` : ''}</small>
                  </div>
                </div>
              </td>

              <td>
                {v.volunteer_code
                  ? <span style="font-family:monospace; font-weight:900; font-size:.9rem; color:var(--emerald); background:rgba(22,138,112,.1); padding:4px 10px; border-radius:8px; border:1px solid rgba(22,138,112,.2)">{v.volunteer_code}</span>
                  : <span style="color:var(--muted); font-size:.8rem">—</span>
                }
              </td>

              <td>
                <span style="display:block; font-size:.85rem; font-weight:700">{v.phone}</span>
                {v.skills && <small style="color:var(--muted); font-size:.72rem; display:block; max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap" title={v.skills}>{v.skills}</small>}
              </td>

              <td>
                <span style="display:block; font-size:.82rem; font-weight:700">{v.preferred_role || v.team}</span>
                <span style="font-size:.75rem; color:var(--gold-600); font-weight:700">{v.rank || (isApproved ? 'متطوع مبادر' : '—')}</span>
              </td>

              <td>
                <span style="font-weight:900; color:var(--emerald-600); font-size:.95rem">{v.hours_count || 0} س</span>
              </td>

              <td>
                <span style={`font-size:.78rem; font-weight:700; color:${isRevoked || isExpired ? '#e53935' : 'var(--text)'}`}>
                  {isRevoked ? icon('fa-ban') : isExpired ? icon('fa-triangle-exclamation') : ''} {expiryDate}
                </span>
              </td>

              <td>
                <span style={`padding:4px 10px; border-radius:8px; font-weight:800; font-size:.75rem; background:${isRevoked ? 'rgba(239,68,68,.15)' : isApproved ? 'rgba(67,160,71,.15)' : v.status === 'rejected' ? 'rgba(231,76,60,.15)' : 'rgba(245,124,0,.15)'}; color:${isRevoked ? '#ef4444' : isApproved ? 'var(--emerald-600)' : v.status === 'rejected' ? '#e53935' : 'var(--gold-600)'}`}>
                  {isRevoked ? 'ملغاة / مجمّدة' : isApproved ? 'معتمد' : v.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                </span>
              </td>

              <td style="white-space:nowrap">
                <div style="display:flex; align-items:center; gap:6px">
                  {/* Detailed View Modal */}
                  <details style="position:relative">
                    <summary style="list-style:none; cursor:pointer; background:var(--surface-2); border:1px solid var(--border); padding:6px 12px; border-radius:8px; font-size:.78rem; font-weight:800; color:var(--text)">
                      {icon('fa-eye')} التفاصيل والـ ID
                    </summary>

                    <div style="position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(6px); z-index:99999; display:grid; place-items:center; padding:20px; overflow-y:auto">
                      <div style="background:var(--paper); border:1px solid var(--line); border-radius:24px; max-width:700px; width:100%; max-height:90vh; overflow-y:auto; padding:28px; box-shadow:0 25px 80px rgba(0,0,0,.4); text-align:right">
                        
                        {/* Modal Header */}
                        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--line); padding-bottom:16px; margin-bottom:20px">
                          <div style="display:flex; align-items:center; gap:16px">
                            <div style="width:64px; height:64px; border-radius:50%; border:3px solid var(--gold); overflow:hidden; background:var(--surface-2); flex-shrink:0">
                              {v.avatar_url
                                ? <img src={v.avatar_url} alt="" style="width:100%; height:100%; object-fit:cover" />
                                : <div style="width:100%; height:100%; display:grid; place-items:center; font-weight:900; font-size:1.5rem; color:var(--emerald); background:var(--ivory)">{v.full_name?.[0]}</div>
                              }
                            </div>
                            <div>
                              <h3 style="margin:0; font-size:1.25rem; font-weight:900; color:var(--text)">{v.full_name}</h3>
                              <span style="font-size:.82rem; color:var(--muted)">كود الهوية: <strong style="color:var(--emerald); font-family:monospace">{v.volunteer_code || 'غير مفعّل'}</strong></span>
                            </div>
                          </div>
                          
                          <span style="font-size:.85rem; font-weight:800; padding:6px 14px; border-radius:10px; background:var(--surface-2); border:1px solid var(--border)">
                            {isRevoked ? '❌ بطاقة ملغاة' : isApproved ? '✅ متطوع معتمد' : '⏳ قيد المراجعة'}
                          </span>
                        </div>

                        {/* Full Info Grid */}
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; background:var(--surface-2); padding:18px; border-radius:16px; border:1px solid var(--border); margin-bottom:24px">
                          <div><small style="color:var(--muted); display:block; font-size:.72rem">رقم الهاتف</small><b style="font-size:.9rem">{v.phone}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.72rem">العمر</small><b style="font-size:.9rem">{v.age ? `${v.age} سنة` : 'غير محدد'}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.72rem">المدينة / المحافظة</small><b style="font-size:.9rem">{v.city || 'غير محدد'}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.72rem">المجال المفضل</small><b style="font-size:.9rem">{v.preferred_role || 'عام'}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.72rem">الرتبة التطوعية</small><b style="font-size:.9rem; color:var(--gold-600)">{v.rank || 'متطوع مبادر'}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.72rem">ساعات الخدمة</small><b style="font-size:.9rem; color:var(--emerald-600)">{v.hours_count || 0} ساعة</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.72rem">تاريخ التقديم</small><b style="font-size:.9rem">{v.created_at ? new Date(v.created_at).toLocaleDateString('ar-EG') : '-'}</b></div>
                          <div><small style="color:var(--muted); display:block; font-size:.72rem">صلاحية البطاقة</small><b style={`font-size:.9rem; color:${isRevoked || isExpired ? '#e53935' : 'var(--emerald-600)'}`}>{expiryDate}</b></div>
                        </div>

                        {v.skills && (
                          <div style="background:var(--ivory); padding:14px; border-radius:12px; margin-bottom:24px; border:1px solid var(--line)">
                            <small style="color:var(--muted); display:block; font-size:.75rem; font-weight:700">المهارات والخبرات:</small>
                            <p style="margin:4px 0 0; font-size:.88rem">{v.skills}</p>
                          </div>
                        )}

                        {/* ID Card Validity & Duration Control Panel */}
                        <div style="background:var(--surface); border:1px solid var(--line); border-radius:18px; padding:20px; margin-bottom:24px">
                          <h4 style="margin:0 0 14px; font-size:1rem; font-weight:900; display:flex; align-items:center; gap:8px; color:var(--forest)">
                            {icon('fa-sliders')} التحكم في صلاحية الـ ID ومدة التطوع
                          </h4>

                          <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:16px">
                            {/* Extend +2 Years */}
                            <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:inline">
                              <input type="hidden" name="action" value="extend_2yr" />
                              <button type="submit" style="background:var(--emerald-600); color:white; border:none; padding:8px 14px; border-radius:10px; font-weight:800; font-size:.8rem; cursor:pointer">
                                {icon('fa-calendar-plus')} تجديد الصلاحية 2 سنة
                              </button>
                            </form>

                            {/* Extend +1 Year */}
                            <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:inline">
                              <input type="hidden" name="action" value="extend_1yr" />
                              <button type="submit" style="background:var(--blue-600); color:white; border:none; padding:8px 14px; border-radius:10px; font-weight:800; font-size:.8rem; cursor:pointer">
                                {icon('fa-plus')} تمديد سنة واحدة
                              </button>
                            </form>

                            {/* Set Indefinite Expiry */}
                            <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:inline">
                              <input type="hidden" name="action" value="indefinite" />
                              <button type="submit" style="background:var(--forest); color:white; border:none; padding:8px 14px; border-radius:10px; font-weight:800; font-size:.8rem; cursor:pointer">
                                {icon('fa-infinity')} جعل الصلاحية مفتوحة (بدون تاريخ انتهاء)
                              </button>
                            </form>

                            {/* Revoke / Freeze ID */}
                            {!isRevoked ? (
                              <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:inline">
                                <input type="hidden" name="action" value="revoke" />
                                <button type="submit" style="background:#e53935; color:white; border:none; padding:8px 14px; border-radius:10px; font-weight:800; font-size:.8rem; cursor:pointer">
                                  {icon('fa-ban')} إلغاء / تجميد صلاحية الـ ID
                                </button>
                              </form>
                            ) : (
                              <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:inline">
                                <input type="hidden" name="action" value="activate" />
                                <button type="submit" style="background:var(--emerald-600); color:white; border:none; padding:8px 14px; border-radius:10px; font-weight:800; font-size:.8rem; cursor:pointer">
                                  {icon('fa-rotate-left')} إعادة تفعيل صلاحية الـ ID
                                </button>
                              </form>
                            )}
                          </div>

                          {/* Custom Date Form */}
                          <form action={`/api/volunteers/validity/${v.id}`} method="post" style="display:flex; align-items:center; gap:10px; background:var(--paper); padding:10px; border-radius:12px; border:1px solid var(--border); flex-wrap:wrap">
                            <input type="hidden" name="action" value="set_custom" />
                            <label style="font-size:.8rem; font-weight:800; white-space:nowrap">تاريخ انتهاء مخصص:</label>
                            <input type="date" name="expires_at" defaultValue={v.expires_at ? new Date(v.expires_at).toISOString().slice(0,10) : ''} required style="border:1px solid var(--line); border-radius:8px; padding:6px; font-size:.82rem; background:var(--ivory)" />
                            <button type="submit" style="background:var(--text); color:var(--paper); border:none; border-radius:8px; padding:6px 14px; font-size:.78rem; font-weight:800; cursor:pointer">تطبيق التاريخ</button>
                          </form>
                        </div>

                        {/* Full Edit Form Collapsible */}
                        <details style="background:var(--surface-2); border:1px solid var(--border); border-radius:18px; padding:16px">
                          <summary style="font-weight:900; font-size:.92rem; cursor:pointer; color:var(--text)">
                            {icon('fa-pen-to-square')} تعديل كافة بيانات المتطوع والصورة
                          </summary>
                          
                          <form action={`/api/volunteers/update/${v.id}`} method="post" enctype="multipart/form-data" style="margin-top:16px; display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px">
                            <label style="font-size:.8rem; font-weight:700">الاسم الكامل<input name="full_name" value={v.full_name} required style="width:100%; border:1px solid var(--line); border-radius:8px; padding:8px; background:var(--paper)" /></label>
                            <label style="font-size:.8rem; font-weight:700">رقم الهاتف<input name="phone" value={v.phone} required style="width:100%; border:1px solid var(--line); border-radius:8px; padding:8px; background:var(--paper)" /></label>
                            <label style="font-size:.8rem; font-weight:700">العمر<input name="age" type="number" value={v.age || ''} style="width:100%; border:1px solid var(--line); border-radius:8px; padding:8px; background:var(--paper)" /></label>
                            <label style="font-size:.8rem; font-weight:700">المدينة<input name="city" value={v.city || ''} style="width:100%; border:1px solid var(--line); border-radius:8px; padding:8px; background:var(--paper)" /></label>
                            <label style="font-size:.8rem; font-weight:700">المجال<input name="preferred_role" value={v.preferred_role || ''} style="width:100%; border:1px solid var(--line); border-radius:8px; padding:8px; background:var(--paper)" /></label>
                            <label style="font-size:.8rem; font-weight:700">كود الهوية<input name="volunteer_code" value={v.volunteer_code || ''} style="width:100%; border:1px solid var(--line); border-radius:8px; padding:8px; background:var(--paper)" /></label>
                            <label style="font-size:.8rem; font-weight:700">ساعات الخدمة<input name="hours_count" type="number" value={v.hours_count || 0} style="width:100%; border:1px solid var(--line); border-radius:8px; padding:8px; background:var(--paper)" /></label>
                            <label style="font-size:.8rem; font-weight:700">الرتبة
                              <select name="rank" style="width:100%; border:1px solid var(--line); border-radius:8px; padding:8px; background:var(--paper)">
                                {['متطوع مبادر', 'متطوع فعّال', 'قائد ميداني', 'سفير العطاء'].map(r => <option selected={v.rank === r}>{r}</option>)}
                              </select>
                            </label>
                            <label style="font-size:.8rem; font-weight:700">الحالة
                              <select name="status" style="width:100%; border:1px solid var(--line); border-radius:8px; padding:8px; background:var(--paper)">
                                <option value="approved" selected={v.status === 'approved'}>معتمد</option>
                                <option value="pending" selected={v.status === 'pending'}>قيد المراجعة</option>
                                <option value="rejected" selected={v.status === 'rejected'}>مرفوض</option>
                                <option value="revoked" selected={v.status === 'revoked'}>ملغاة / مجمّدة</option>
                              </select>
                            </label>
                            
                            <div style="grid-column:1/-1; margin-top:8px">
                              <label style="font-size:.8rem; font-weight:700; display:block; margin-bottom:6px">تغيير الصورة الشخصية:</label>
                              <input type="file" name="avatar_file" accept="image/*" style="font-size:.8rem" />
                              <input type="hidden" name="avatar_url" value={v.avatar_url || ''} />
                            </div>

                            <div style="grid-column:1/-1; display:flex; justify-content:flex-end; gap:10px; margin-top:10px">
                              <button type="submit" style="background:var(--forest); color:white; border:none; border-radius:10px; padding:10px 20px; font-weight:800; cursor:pointer">حفظ التغييرات</button>
                            </div>
                          </form>
                        </details>

                        {/* Modal Close Hint */}
                        <div style="text-align:center; margin-top:24px">
                          <summary style="cursor:pointer; display:inline-block; background:var(--surface-2); border:1px solid var(--border); padding:8px 24px; border-radius:12px; font-weight:800; font-size:.85rem">
                            إغلاق النافذة {icon('fa-xmark')}
                          </summary>
                        </div>

                      </div>
                    </div>
                  </details>

                  {/* Pending quick actions */}
                  {v.status === 'pending' && <>
                    <form action={`/api/volunteers/status/${v.id}`} method="post" style="display:inline">
                      <input type="hidden" name="status" value="approved" />
                      <button type="submit" style="background:var(--emerald-600); color:#fff; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:.78rem; font-weight:700">{icon('fa-circle-check')} قبول</button>
                    </form>
                    <form action={`/api/volunteers/status/${v.id}`} method="post" style="display:inline">
                      <input type="hidden" name="status" value="rejected" />
                      <button type="submit" style="background:#ff6b6b; color:#fff; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:.78rem; font-weight:700">{icon('fa-circle-xmark')} رفض</button>
                    </form>
                  </>}

                  {/* Delete volunteer button */}
                  <form action={`/api/volunteers/delete/${v.id}`} method="post" style="display:inline">
                    <button type="submit" style="background:none; border:none; color:var(--muted); cursor:pointer; font-size:.85rem; padding:4px" title="حذف المتطوع">{icon('fa-trash-can')}</button>
                  </form>
                </div>
              </td>
            </tr>
          })}
        </tbody>
      </table>
    </section>
  </>
}

export function DashContacts({ list = [] }: { list: any[] }) {
  return <section class="dash-table">
    <header style="display:flex; justify-content:space-between; align-items:center">
      <h3>الرسائل الواردة</h3>
      <a href="/api/export/contacts" download class="export-excel-btn">
        {icon('fa-file-excel')} تصدير Excel
      </a>
    </header>
    <table>
      <thead>
        <tr>
          <th>الاسم</th>
          <th>الهاتف / الإيميل</th>
          <th>الموضوع</th>
          <th>الرسالة</th>
          <th>الحالة</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {list.map((c: any) => {
          const isRead = c.status === 'read'
          return <tr>
            <td>{c.name}</td>
            <td>{c.phone} / {c.email}</td>
            <td>{c.subject}</td>
            <td style="max-width:300px; white-space:pre-wrap">{c.message}</td>
            <td>{isRead ? 'مقروءة' : 'جديدة'}</td>
            <td>
              {!isRead && (
                <form action={`/api/contacts/status/${c.id}`} method="post" style="display:inline">
                  <input type="hidden" name="status" value="read" />
                  <button type="submit" style="background:var(--blue-600); color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">تحديد كمقروءة</button>
                </form>
              )}
            </td>
          </tr>
        })}
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
        <label>التقييم (1-5)<input type="number" name="rating" min="1" max="5" defaultValue="5" required /></label>
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
          <label>الموقع / المكان<input name="location" placeholder="مثل: كفر العنانية، الدقهلية" defaultValue="كفر العنانية" /></label>
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
        <label>الموقع<input name="location" defaultValue="كفر العنانية" required /></label>
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
export function DashCases({ groups = [], stats = {}, user }: { groups: any[], stats: any, user: UserSession }) {
  const totalGroups = stats.total_groups || 0
  const totalBeneficiaries = stats.total_beneficiaries || 0

  return <>
    {/* بطاقات إحصائية */}
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-bottom: 2rem">
      <article style="background: var(--paper); border: 2px solid #8b5cf6; border-radius: 20px; padding: 1.4rem">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span style="font-size:1.6rem; color:#8b5cf6">{icon('fa-people-group')}</span>
          <small style="color:var(--muted); font-weight:700">إجمالي الأسماء بالأرشيف العام</small>
        </div>
        <b style="font-size:2rem; display:block; margin-top:.8rem; color:#8b5cf6">
          {totalBeneficiaries.toLocaleString('ar-EG')} مستفيد
        </b>
      </article>
      <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 1.4rem">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span style="font-size:1.6rem; color:#06b6d4">{icon('fa-boxes-stacked')}</span>
          <small style="color:var(--muted); font-weight:700">عدد دفعات الإدخال</small>
        </div>
        <b style="font-size:2rem; display:block; margin-top:.8rem; color:#06b6d4">
          {totalGroups} دفعة
        </b>
      </article>
      <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 1.4rem">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span style="font-size:1.6rem; color:var(--gold-600)">{icon('fa-file-excel')}</span>
          <small style="color:var(--muted); font-weight:700">نظام استخراج ملفات Excel</small>
        </div>
        <b style="font-size:1.1rem; display:block; margin-top:.8rem; color:var(--gold-600)">
          مع شعار المؤسسة والأسماء المخصصة
        </b>
      </article>
    </div>

    {/* واجهة الاستخراج العشوائي والتصدير */}
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
              defaultValue="مجموعة مستفيدين — عينة عشوائية"
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
                defaultValue="50"
                style="flex:1; accent-color:#8b5cf6"
              />
              <input
                type="number"
                id="sample-count-input"
                min="1"
                max="9999"
                defaultValue="50"
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
