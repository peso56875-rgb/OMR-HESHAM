import { dashboardLayout } from './layout'

export const dashDonations = (donations: any[]) => dashboardLayout(
  'donations',
  'سجل التبرّعات',
  `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
    <p style="color:var(--muted)">متابعة كافة التبرّعات الواردة وحالاتها.</p>
  </div>

  <div class="panel">
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>رقم المرجع</th><th>المتبرّع</th><th>البريد الإلكتروني</th><th>الهاتف</th><th>المبلغ</th><th>الطريقة</th><th>الحالة</th><th>التاريخ</th></tr></thead>
        <tbody>
          ${donations.length ? donations.map(d => `
          <tr>
            <td style="font-family:monospace;color:var(--muted)">${d.id.split('-')[0]}</td>
            <td><b>${d.donor_name}</b></td>
            <td>${d.donor_email || '-'}</td>
            <td>${d.donor_phone || '-'}</td>
            <td><b>${Number(d.amount).toLocaleString('ar-EG')} ج.م</b></td>
            <td>${d.payment_method === 'card' ? 'بطاقة' : d.payment_method === 'transfer' ? 'تحويل' : d.payment_method || '-'}</td>
            <td><span class="badge badge-${d.status === 'completed' ? 'ok' : d.status === 'pending' ? 'pend' : 'info'}">${d.status}</span></td>
            <td style="color:var(--muted)">${new Date(d.created_at).toLocaleDateString('ar-EG')}</td>
          </tr>`).join('') : '<tr><td colspan="8" style="text-align:center;padding:2rem">لا توجد تبرعات مسجلة.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
  `
)
