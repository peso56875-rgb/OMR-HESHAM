import { dashboardLayout } from './layout'

export const dashVolunteers = (volunteers: any[]) => {
  const approved = volunteers.filter(v => v.status === 'approved').length
  const pending = volunteers.filter(v => v.status === 'pending').length

  return dashboardLayout(
  'volunteers',
  'المتطوّعون',
  `
  <div class="quick-stats" style="margin-bottom:1.2rem">
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(30,136,229,.08);color:#1e88e5"><i class="fas fa-users"></i></div>
      <div><div class="qs-value">${volunteers.length}</div><div class="qs-label">إجمالي المتطوعين</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(46,204,113,.08);color:#27ae60"><i class="fas fa-user-check"></i></div>
      <div><div class="qs-value">${approved}</div><div class="qs-label">مقبولين</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(245,124,0,.08);color:#f57c00"><i class="fas fa-user-clock"></i></div>
      <div><div class="qs-value">${pending}</div><div class="qs-label">بانتظار الموافقة</div></div>
    </div>
  </div>

  <div class="data-panel">
    <div class="data-panel-header">
      <h3><i class="fas fa-hands-helping" style="color:var(--blue-600)"></i> طلبات التطوع</h3>
    </div>
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>الاسم</th><th>العمر</th><th>المدينة</th><th>الهاتف</th><th>الدور المفضل</th><th>المهارات</th><th>الحالة</th><th>التاريخ</th><th>إجراء</th></tr></thead>
        <tbody>
          ${volunteers.length ? volunteers.map(v => `
          <tr>
            <td><b>${v.full_name}</b></td>
            <td>${v.age || '-'}</td>
            <td>${v.city || '-'}</td>
            <td><a href="tel:${v.phone}" dir="ltr" style="color:var(--blue-600)">${v.phone}</a></td>
            <td>${v.preferred_role || '-'}</td>
            <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${v.skills || ''}">${v.skills || '-'}</td>
            <td><span class="badge badge-${v.status === 'approved' ? 'ok' : v.status === 'pending' ? 'pend' : 'info'}">${v.status === 'approved' ? 'مقبول' : v.status === 'pending' ? 'قيد المراجعة' : v.status === 'rejected' ? 'مرفوض' : v.status}</span></td>
            <td style="color:var(--muted);font-size:.85rem">${new Date(v.created_at).toLocaleDateString('ar-EG')}</td>
            <td>
              <form action="/api/volunteers/status/${v.id}" method="POST" style="display:flex;gap:.25rem">
                ${v.status !== 'approved' ? `<button type="submit" name="status" value="approved" class="btn btn-sm btn-ghost" style="color:var(--emerald-700)" title="قبول"><i class="fas fa-check"></i></button>` : ''}
                ${v.status !== 'rejected' ? `<button type="submit" name="status" value="rejected" class="btn btn-sm btn-ghost" style="color:var(--crimson)" title="رفض"><i class="fas fa-times"></i></button>` : ''}
                ${v.status !== 'pending' ? `<button type="submit" name="status" value="pending" class="btn btn-sm btn-ghost" style="color:var(--gold-600)" title="إعادة للمراجعة"><i class="fas fa-clock"></i></button>` : ''}
              </form>
            </td>
          </tr>`).join('') : '<tr><td colspan="9" style="text-align:center;padding:3rem;color:var(--muted)"><i class="fas fa-users" style="font-size:2rem;opacity:.15;display:block;margin-bottom:.5rem"></i>لا يوجد متطوعين مسجلين</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
  `
)}
