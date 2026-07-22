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
            <div style="display:flex; align-items:center; background:var(--ivory); border:1px solid var(--border); padding:6px 14px; border-radius:12px; gap:8px; margin-inline-end:10px">
              {icon('fa-magnifying-glass')}
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
                style="padding:6px 10px; border:1px solid var(--border); border-radius:6px; background:var(--ivory); cursor:pointer; font-size:1.1rem"
              >
                {icon(ic)}
              </button>
            ))}
          </div>
        </label>
        <input type="hidden" name="image_url" class="cloudinary-url" />
        <div class="upload-widget">
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
  return <section class="dash-table">
    <header style="display:flex; justify-content:space-between; align-items:center">
      <h3>طلبات التطوع الواردة</h3>
      <a href="/api/export/volunteers" download class="export-excel-btn">
        {icon('fa-file-excel')} تصدير Excel
      </a>
    </header>
    <table>
      <thead>
        <tr>
          <th>الاسم</th>
          <th>الهاتف</th>
          <th>المدينة</th>
          <th>المجال المفضل</th>
          <th>المهارات</th>
          <th>الحالة</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {list.map((v: any) => {
          const isApproved = v.status === 'approved'
          return <tr>
            <td>{v.full_name}</td>
            <td>{v.phone}</td>
            <td>{v.city}</td>
            <td>{v.preferred_role}</td>
            <td>{v.skills}</td>
            <td>
              <span style={`padding:2px 8px; border-radius:4px; font-weight:600; background:${isApproved ? 'rgba(67,160,71,.15)' : v.status === 'rejected' ? 'rgba(231,76,60,.15)' : 'rgba(245,124,0,.15)'}; color:${isApproved ? 'var(--emerald-600)' : v.status === 'rejected' ? '#e53935' : 'var(--gold-600)'}`}>
                {v.status === 'approved' ? 'مقبول' : v.status === 'rejected' ? 'مرفوض' : 'معلق'}
              </span>
            </td>
            <td>
              {v.status === 'pending' && <>
                <form action={`/api/volunteers/status/${v.id}`} method="post" style="display:inline; margin-inline-end:.3rem">
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" style="background:var(--emerald-600); color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">قبول</button>
                </form>
                <form action={`/api/volunteers/status/${v.id}`} method="post" style="display:inline">
                  <input type="hidden" name="status" value="rejected" />
                  <button type="submit" style="background:#ff6b6b; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer">رفض</button>
                </form>
              </>}
            </td>
          </tr>
        })}
      </tbody>
    </table>
  </section>
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
        <input type="hidden" name="image_url" class="cloudinary-url" />
        <div class="upload-widget">
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
        <input type="hidden" name="image_url" class="cloudinary-url" />
        <div class="upload-widget">
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
        <label>القصة كاملة<textarea name="content" rows={4} required></textarea></label>
        <button class="primary-btn" type="submit" id="story-submit-btn">نشر القصة</button>
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
          <small style="color:var(--muted); font-weight:700">إجمالي المستفيدين المسجلين</small>
        </div>
        <b style="font-size:2rem; display:block; margin-top:.8rem; color:#8b5cf6">
          {totalBeneficiaries.toLocaleString('ar-EG')} مستفيد
        </b>
      </article>
      <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 1.4rem">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span style="font-size:1.6rem; color:#06b6d4">{icon('fa-clipboard-list')}</span>
          <small style="color:var(--muted); font-weight:700">مجموعات المساعدات</small>
        </div>
        <b style="font-size:2rem; display:block; margin-top:.8rem; color:#06b6d4">
          {totalGroups} مجموعة
        </b>
      </article>
      <article style="background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 1.4rem">
        <div style="display:flex; justify-content:space-between; align-items:center">
          <span style="font-size:1.6rem; color:var(--gold-600)">{icon('fa-file-excel')}</span>
          <small style="color:var(--muted); font-weight:700">نظام الاستخراج العشوائي</small>
        </div>
        <b style="font-size:1.1rem; display:block; margin-top:.8rem; color:var(--gold-600)">
          جاهز للتصدير الآن
        </b>
      </article>
    </div>

    {/* واجهة الاستخراج العشوائي */}
    {groups.length > 0 && (
      <section style="background: linear-gradient(135deg, rgba(139,92,246,.08) 0%, rgba(6,182,212,.06) 100%); border: 2px solid #8b5cf6; border-radius: 20px; padding: 2rem; margin-bottom: 2rem">
        <h3 style="font-size:1.2rem; font-weight:900; color:#8b5cf6; margin-bottom:1.2rem; display:flex; align-items:center; gap:10px">
          {icon('fa-shuffle')} استخراج عينة عشوائية — تحميل ملف Excel
        </h3>
        <div id="random-sample-form" style="display:flex; flex-direction:column; gap:1.2rem">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem">
            <label style="display:flex; flex-direction:column; gap:6px; font-weight:700; font-size:.9rem">
              اختر مجموعة المستفيدين *
              <select name="group_id" id="sample-group-select" required
                style="padding:12px 14px; border-radius:12px; border:1px solid var(--line); background:var(--ivory); font-size:.95rem; color:var(--text)">
                <option value="">— اختر مجموعة —</option>
                {groups.map((g: any) => (
                  <option value={g.id} data-total={g.total_count}>
                    {g.title} ({(g.total_count || 0).toLocaleString('ar-EG')} اسم) — {g.aid_type}
                  </option>
                ))}
              </select>
            </label>

            <label style="display:flex; flex-direction:column; gap:6px; font-weight:700; font-size:.9rem">
              عدد الأسماء المطلوبة *
              <div style="display:flex; align-items:center; gap:12px">
                <input
                  type="range"
                  id="sample-count-range"
                  name="count"
                  min="1"
                  max="500"
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
              <small id="sample-max-hint" style="color:var(--muted); font-size:.8rem">سيتم استخراج عينة عشوائية بخوارزمية Fisher-Yates</small>
            </label>
          </div>

          {/* معاينة الأسماء */}
          <div id="preview-box" style="display:none; background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:1rem">
            <p style="font-size:.85rem; font-weight:700; color:var(--muted); margin-bottom:.6rem">
              {icon('fa-eye')} معاينة أول ١٠ أسماء من المجموعة:
            </p>
            <div id="preview-names" style="display:flex; flex-wrap:wrap; gap:6px"></div>
          </div>

          <div style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap">
            <button
              type="button"
              id="extract-sample-btn"
              class="primary-btn"
              style="background:linear-gradient(135deg,#8b5cf6,#06b6d4); border:none; font-size:1rem; padding:12px 28px"
            >
              {icon('fa-file-excel')} استخراج العينة وتحميل Excel
            </button>
            <small style="color:var(--muted); font-size:.82rem">
              {icon('fa-circle-info')} الأسماء ستُسحب عشوائيًا بالكامل في كل مرة تضغط فيها
            </small>
          </div>
        </div>
      </section>
    )}

    {/* جدول المجموعات */}
    <section class="dash-table">
      <header style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:.8rem">
        <h3 style="display:flex; align-items:center; gap:8px">
          {icon('fa-list-check')} مجموعات المستفيدين المسجلة
        </h3>
        <span style="font-size:.85rem; color:var(--muted); background:rgba(139,92,246,.1); padding:4px 12px; border-radius:8px; font-weight:600">
          {totalBeneficiaries.toLocaleString('ar-EG')} مستفيد في {totalGroups} مجموعة
        </span>
      </header>
      {groups.length === 0 ? (
        <div style="text-align:center; padding:4rem 2rem; color:var(--muted)">
          <p style="font-size:3rem; margin-bottom:1rem">{icon('fa-inbox')}</p>
          <p style="font-size:1.1rem; font-weight:700">لا توجد مجموعات مسجلة بعد</p>
          <p style="font-size:.9rem">أضف أول مجموعة مستفيدين من النموذج أدناه</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>اسم المجموعة</th>
              <th>نوع المساعدة</th>
              <th>عدد المستفيدين</th>
              <th>معاينة الأسماء</th>
              <th>تم الإضافة بواسطة</th>
              <th>التاريخ</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g: any) => {
              const date = g.created_at ? new Date(g.created_at).toLocaleDateString('ar-EG') : '-'
              return <tr>
                <td><b>{g.title}</b></td>
                <td>
                  <span style="background:rgba(139,92,246,.12); color:#8b5cf6; padding:3px 10px; border-radius:8px; font-weight:600; font-size:.85rem">
                    {g.aid_type}
                  </span>
                </td>
                <td>
                  <b style="font-size:1.1rem; color:#8b5cf6">{(g.total_count || 0).toLocaleString('ar-EG')}</b>
                  <small style="color:var(--muted)"> اسم</small>
                </td>
                <td>
                  <div style="display:flex; flex-wrap:wrap; gap:4px; max-width:200px">
                    {(g.preview_names || []).slice(0, 5).map((n: string) => (
                      <span style="background:var(--surface); border:1px solid var(--border); padding:2px 8px; border-radius:6px; font-size:.78rem">
                        {n}
                      </span>
                    ))}
                    {(g.total_count || 0) > 5 && (
                      <span style="color:var(--muted); font-size:.78rem; padding:2px 4px">
                        +{((g.total_count || 0) - 5).toLocaleString('ar-EG')} آخرين
                      </span>
                    )}
                  </div>
                </td>
                <td><small style="background:rgba(22,138,112,.1); padding:3px 8px; border-radius:6px; font-weight:600">{g.created_by || 'مشرف'}</small></td>
                <td>{date}</td>
                <td>
                  <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center">
                    <a
                      href={`/api/export/cases_full/${g.id}`}
                      download
                      style="background:var(--emerald-600); color:#fff; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:.82rem; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:4px"
                    >
                      {icon('fa-file-excel')} تصدير الكل
                    </a>
                    <form action={`/api/cases/groups/delete/${g.id}`} method="post" class="dash-action-form" data-confirm={`هل أنت متأكد من حذف مجموعة "${g.title}"؟ سيتم حذف جميع الأسماء المرتبطة بها.`}>
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

    {/* نموذج إضافة مجموعة جديدة */}
    <section class="section-pad" style="padding-top:2rem">
      <form
        action="/api/cases/groups/add"
        method="post"
        style="background:var(--surface); border:1px solid var(--border); padding:2rem; border-radius:20px; max-width:750px; display:flex; flex-direction:column; gap:1.4rem"
      >
        <div>
          <h3 style="color:#8b5cf6; display:flex; align-items:center; gap:8px">
            {icon('fa-circle-plus')} إضافة مجموعة مستفيدين جديدة
          </h3>
          <p style="font-size:.85rem; color:var(--muted); margin-top:4px">
            سجل قائمة بأسماء المستفيدين من مساعدة معينة — كل اسم في سطر منفصل
          </p>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem">
          <label style="font-weight:700">
            اسم المجموعة / المناسبة *
            <input
              name="title"
              required
              placeholder="مثال: توزيع بطاطس — يوليو ٢٠٢٦"
              style="margin-top:6px"
            />
          </label>
          <label style="font-weight:700">
            نوع المساعدة المقدمة
            <select name="aid_type" style="padding:12px; border-radius:12px; border:1px solid var(--line); background:var(--ivory); margin-top:6px; width:100%">
              <option value="مساعدة غذائية">مساعدة غذائية (أغذية وكراتين)</option>
              <option value="مساعدة طبية">مساعدة طبية (أدوية وعلاج)</option>
              <option value="مساعدة تعليمية">مساعدة تعليمية (مصاريف ومستلزمات)</option>
              <option value="مساعدة نقدية">مساعدة نقدية مباشرة</option>
              <option value="كسوة وملابس">كسوة وملابس</option>
              <option value="مساعدة مواسم وأعياد">مساعدة مواسم وأعياد</option>
              <option value="أخرى">أخرى</option>
            </select>
          </label>
        </div>

        <label style="font-weight:700">
          قائمة الأسماء *
          <small style="font-weight:400; color:var(--muted); margin-right:8px">— اكتب أو الصق الأسماء، كل اسم في سطر مستقل</small>
          <textarea
            name="names"
            required
            rows={12}
            placeholder={"أحمد محمد علي\nفاطمة سيد حسن\nمحمود عبدالله إبراهيم\nنور الهدى محمود\n..."}
            id="names-textarea"
            style="margin-top:8px; font-family:inherit; font-size:.95rem; line-height:1.8; direction:rtl"
          ></textarea>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px">
            <small style="color:var(--muted)">
              {icon('fa-circle-info')} الأسماء المكررة ستُحذف تلقائيًا
            </small>
            <small id="name-counter" style="font-weight:700; color:#8b5cf6">٠ اسم</small>
          </div>
        </label>

        <div style="background:rgba(139,92,246,.08); padding:10px 14px; border-radius:10px; font-size:.85rem; color:#8b5cf6">
          {icon('fa-user-check')} سيتم تسجيل هذه المجموعة باسم الأدمن الحالي: <b>{user.name}</b>
        </div>

        <button class="primary-btn" type="submit" style="background:linear-gradient(135deg,#8b5cf6,#06b6d4); font-size:1rem">
          {icon('fa-floppy-disk')} حفظ المجموعة
        </button>
      </form>
    </section>

    {/* JavaScript للواجهة التفاعلية */}
    <script dangerouslySetInnerHTML={{ __html: `
      (function() {
        // عداد الأسماء في الـ textarea
        var ta = document.getElementById('names-textarea');
        var counter = document.getElementById('name-counter');
        if (ta && counter) {
          function updateCount() {
            var lines = ta.value.split('\\n').map(function(l){return l.trim();}).filter(function(l){return l.length > 0;});
            var unique = new Set(lines).size;
            counter.textContent = unique.toLocaleString('ar-EG') + ' اسم';
          }
          ta.addEventListener('input', updateCount);
          updateCount();
        }

        // ربط الـ range slider بالـ number input
        var rangeInput = document.getElementById('sample-count-range');
        var numInput = document.getElementById('sample-count-input');
        var hintEl = document.getElementById('sample-max-hint');
        var groupSelect = document.getElementById('sample-group-select');
        var previewBox = document.getElementById('preview-box');
        var previewNames = document.getElementById('preview-names');

        // بيانات المجموعات للمعاينة
        var groupData = {};
        ${groups.map((g: any) => `groupData["${g.id}"] = { total: ${g.total_count || 0}, preview: ${JSON.stringify((g.preview_names || []).slice(0, 10))} };`).join('\n        ')}

        if (rangeInput && numInput) {
          rangeInput.addEventListener('input', function() {
            numInput.value = this.value;
          });
          numInput.addEventListener('input', function() {
            var v = parseInt(this.value) || 1;
            var max = parseInt(rangeInput.max) || 500;
            rangeInput.value = Math.min(v, max);
          });
        }

        if (groupSelect) {
          groupSelect.addEventListener('change', function() {
            var gid = this.value;
            if (!gid || !groupData[gid]) {
              if (previewBox) previewBox.style.display = 'none';
              if (hintEl) hintEl.textContent = 'سيتم استخراج عينة عشوائية بخوارزمية Fisher-Yates';
              if (rangeInput) rangeInput.max = 500;
              return;
            }
            var g = groupData[gid];
            var total = g.total;
            if (rangeInput) {
              rangeInput.max = total;
              if (parseInt(rangeInput.value) > total) {
                rangeInput.value = total;
                if (numInput) numInput.value = total;
              }
            }
            if (hintEl) hintEl.textContent = 'المجموعة تحتوي على ' + total.toLocaleString('ar-EG') + ' اسم — أدخل العدد المطلوب';
            if (previewBox && previewNames && g.preview && g.preview.length > 0) {
              previewBox.style.display = 'block';
              previewNames.innerHTML = g.preview.map(function(n) {
                return '<span style="background:var(--surface);border:1px solid var(--border);padding:3px 10px;border-radius:8px;font-size:.85rem;">' + n + '</span>';
              }).join('');
            } else {
              if (previewBox) previewBox.style.display = 'none';
            }
          });
        }

        // زر الاستخراج العشوائي — يستخدم window.location.href مباشرةً
        // لتفادي مشكلة الـ interceptor الذي يحاول إضافة body لـ GET request
        var extractBtn = document.getElementById('extract-sample-btn');
        if (extractBtn) {
          extractBtn.addEventListener('click', function() {
            var gid = groupSelect ? groupSelect.value : '';
            var count = numInput ? (parseInt(numInput.value) || 50) : 50;
            if (!gid) {
              alert('يرجى اختيار مجموعة أولاً');
              return;
            }
            var url = '/api/export/cases_sample?group_id=' + encodeURIComponent(gid) + '&count=' + encodeURIComponent(count);
            window.location.href = url;
          });
        }
      })();
    `}} />
  </>
}
