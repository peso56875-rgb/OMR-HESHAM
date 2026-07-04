import { dashboardLayout } from './layout'

export const dashDonations = (donations: any[]) => {
  const total = donations.reduce((s, d) => s + Number(d.amount || 0), 0)
  const completed = donations.filter(d => d.status === 'completed').length
  const pending = donations.filter(d => d.status === 'pending').length

  return dashboardLayout(
  'donations',
  'سجل التبرّعات',
  `
  <!-- Mini KPIs -->
  <div class="quick-stats" style="margin-bottom:1.2rem">
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(67,160,71,.08);color:#43a047"><i class="fas fa-coins"></i></div>
      <div><div class="qs-value">${total.toLocaleString('ar-EG')} ج.م</div><div class="qs-label">إجمالي المبالغ</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(30,136,229,.08);color:#1e88e5"><i class="fas fa-receipt"></i></div>
      <div><div class="qs-value">${donations.length}</div><div class="qs-label">عملية تبرّع</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(46,204,113,.08);color:#27ae60"><i class="fas fa-check-circle"></i></div>
      <div><div class="qs-value">${completed}</div><div class="qs-label">مكتملة</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(245,124,0,.08);color:#f57c00"><i class="fas fa-hourglass-half"></i></div>
      <div><div class="qs-value">${pending}</div><div class="qs-label">معلّقة</div></div>
    </div>
  </div>

  <div class="data-panel">
    <div class="data-panel-header">
      <h3><i class="fas fa-hand-holding-dollar" style="color:var(--emerald-600)"></i> جميع التبرّعات</h3>
    </div>
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>#</th><th>المتبرّع</th><th>البريد</th><th>الهاتف</th><th>المبلغ</th><th>الطريقة</th><th>الحالة</th><th>التاريخ</th><th>إجراء</th></tr></thead>
        <tbody>
          ${donations.length ? donations.map((d, i) => `
          <tr>
            <td style="font-family:monospace;color:var(--muted);font-size:.8rem">${i + 1}</td>
            <td><b>${d.donor_name}</b></td>
            <td style="font-size:.85rem">${d.donor_email || '-'}</td>
            <td style="direction:ltr;font-size:.85rem">${d.donor_phone || '-'}</td>
            <td><b style="color:var(--emerald-700)">${Number(d.amount).toLocaleString('ar-EG')} ج.م</b></td>
            <td><span class="badge badge-info">${d.payment_method === 'card' ? 'بطاقة' : d.payment_method === 'transfer' ? 'تحويل' : d.payment_method === 'wallet' ? 'محفظة' : d.payment_method === 'instapay' ? 'إنستاباي' : d.payment_method || '-'}</span></td>
            <td><span class="badge badge-${d.status === 'completed' ? 'ok' : d.status === 'pending' ? 'pend' : 'info'}">${d.status === 'completed' ? 'مكتمل' : d.status === 'pending' ? 'معلّق' : d.status}</span></td>
            <td style="color:var(--muted);font-size:.85rem">${new Date(d.created_at).toLocaleDateString('ar-EG')}</td>
            <td>
              <form action="/api/donations/status/${d.id}" method="POST" style="display:inline">
                <input type="hidden" name="status" value="${d.status === 'completed' ? 'pending' : 'completed'}">
                <button type="submit" class="btn btn-sm ${d.status === 'completed' ? 'btn-ghost' : 'btn-primary'}" style="font-size:.78rem" title="تغيير الحالة">
                  <i class="fas ${d.status === 'completed' ? 'fa-rotate-left' : 'fa-check'}"></i>
                  ${d.status === 'completed' ? 'تراجع' : 'تأكيد'}
                </button>
              </form>
            </td>
          </tr>`).join('') : '<tr><td colspan="9" style="text-align:center;padding:3rem;color:var(--muted)"><i class="fas fa-inbox" style="font-size:2rem;opacity:.15;display:block;margin-bottom:.5rem"></i>لا توجد تبرعات مسجلة</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
  `
)}
