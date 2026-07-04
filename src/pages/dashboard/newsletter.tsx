import { dashboardLayout } from './layout'

export const dashNewsletter = (subscribers: any[]) => {
  const active = subscribers.filter(s => s.status === 'subscribed' || s.status === 'active').length

  return dashboardLayout(
  'newsletter',
  'النشرة البريدية',
  `
  <div class="quick-stats" style="margin-bottom:1.2rem">
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(30,136,229,.08);color:#1e88e5"><i class="fas fa-users"></i></div>
      <div><div class="qs-value">${subscribers.length}</div><div class="qs-label">إجمالي المشتركين</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(46,204,113,.08);color:#27ae60"><i class="fas fa-user-check"></i></div>
      <div><div class="qs-value">${active}</div><div class="qs-label">مشترك نشط</div></div>
    </div>
  </div>

  <div class="data-panel">
    <div class="data-panel-header">
      <h3><i class="fas fa-envelope-open-text" style="color:var(--blue-600)"></i> المشتركون</h3>
    </div>
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>#</th><th>البريد الإلكتروني</th><th>الحالة</th><th>تاريخ الاشتراك</th><th>إجراء</th></tr></thead>
        <tbody>
          ${subscribers.length ? subscribers.map((s, i) => `
          <tr>
            <td style="color:var(--muted);font-size:.82rem">${i + 1}</td>
            <td><b style="direction:ltr;display:inline-block">${s.email}</b></td>
            <td><span class="badge badge-${s.status === 'subscribed' || s.status === 'active' ? 'ok' : 'info'}">${s.status === 'subscribed' || s.status === 'active' ? 'نشط' : s.status === 'unsubscribed' ? 'ملغي' : s.status}</span></td>
            <td style="color:var(--muted);font-size:.85rem">${new Date(s.created_at).toLocaleDateString('ar-EG')}</td>
            <td>
              <div style="display:flex;gap:.3rem">
                <form action="/api/newsletter/status/${s.id}" method="POST" style="display:inline">
                  <input type="hidden" name="status" value="${s.status === 'subscribed' || s.status === 'active' ? 'unsubscribed' : 'active'}">
                  <button type="submit" class="btn btn-sm ${s.status === 'subscribed' || s.status === 'active' ? 'btn-ghost' : 'btn-primary'}" style="font-size:.78rem" title="تغيير الحالة">
                    <i class="fas ${s.status === 'subscribed' || s.status === 'active' ? 'fa-ban' : 'fa-check'}"></i>
                  </button>
                </form>
                <form action="/api/newsletter/delete/${s.id}" method="POST" style="display:inline" onsubmit="return confirm('حذف هذا المشترك؟')">
                  <button type="submit" class="btn btn-sm btn-ghost" style="color:var(--danger)" title="حذف"><i class="fas fa-trash"></i></button>
                </form>
              </div>
            </td>
          </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:3rem;color:var(--muted)"><i class="fas fa-envelope-open-text" style="font-size:2rem;opacity:.15;display:block;margin-bottom:.5rem"></i>لا يوجد مشتركون</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
  `
)}
