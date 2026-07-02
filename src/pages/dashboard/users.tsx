import { dashboardLayout } from './layout'

export const dashUsers = (users: any[]) => dashboardLayout(
  'users',
  'المسجلين',
  `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
    <p style="color:var(--muted)">إدارة المستخدمين المسجلين وصلاحياتهم.</p>
  </div>

  <div class="panel">
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>المستخدم</th><th>البريد الإلكتروني</th><th>الصلاحية</th><th>تاريخ التسجيل</th><th>إجراء</th></tr></thead>
        <tbody>
          ${users.length ? users.map(u => `
          <tr>
            <td style="display:flex;align-items:center;gap:.7rem">
              ${u.avatar_url ? `<img src="${u.avatar_url}" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover">` : '<span class="avatar placeholder" style="width:36px;height:36px;font-size:.8rem">👤</span>'}
              <b>${u.full_name || 'بدون اسم'}</b>
            </td>
            <td style="direction:ltr;text-align:right">${u.email || '-'}</td>
            <td>
              <span style="display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .8rem;border-radius:2rem;font-size:.82rem;font-weight:700;${u.role === 'admin' ? 'background:rgba(46,204,113,.15);color:#27ae60' : 'background:rgba(52,152,219,.1);color:#2980b9'}">
                <i class="fas ${u.role === 'admin' ? 'fa-shield-halved' : 'fa-user'}"></i> ${u.role === 'admin' ? 'مدير' : 'مستخدم'}
              </span>
            </td>
            <td style="color:var(--muted)">${new Date(u.created_at).toLocaleDateString('ar-EG')}</td>
            <td>
              <form action="/api/users/${u.id}/role" method="POST" style="display:inline">
                <input type="hidden" name="role" value="${u.role === 'admin' ? 'user' : 'admin'}">
                <button type="submit" class="btn btn-sm ${u.role === 'admin' ? 'btn-ghost' : 'btn-primary'}" style="font-size:.8rem">
                  <i class="fas ${u.role === 'admin' ? 'fa-user-minus' : 'fa-user-shield'}"></i>
                  ${u.role === 'admin' ? 'إزالة الإدارة' : 'ترقية لمدير'}
                </button>
              </form>
            </td>
          </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:2rem">لا يوجد مستخدمون مسجلون.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
  `
)
