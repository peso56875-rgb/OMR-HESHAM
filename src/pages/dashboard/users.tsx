import { dashboardLayout } from './layout'

export const dashUsers = (users: any[]) => {
  const admins = users.filter(u => u.role === 'admin').length
  const regularUsers = users.length - admins

  return dashboardLayout(
  'users',
  'المستخدمين والمسجلين',
  `
  <div class="quick-stats" style="margin-bottom:1.2rem">
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(30,136,229,.08);color:#1e88e5"><i class="fas fa-users-gear"></i></div>
      <div><div class="qs-value">${users.length}</div><div class="qs-label">إجمالي المسجلين</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(46,204,113,.08);color:#27ae60"><i class="fas fa-shield-halved"></i></div>
      <div><div class="qs-value">${admins}</div><div class="qs-label">المدراء</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(245,124,0,.08);color:#f57c00"><i class="fas fa-user"></i></div>
      <div><div class="qs-value">${regularUsers}</div><div class="qs-label">مستخدمين عاديين</div></div>
    </div>
  </div>

  <div class="data-panel" style="margin-bottom:1.5rem;border:1px solid rgba(46,204,113,.2);background:rgba(46,204,113,.02)">
    <h3 style="margin-bottom:1rem;display:flex;align-items:center;gap:.5rem;font-size:1rem;font-weight:700">
      <span class="live-dot" style="width:8px;height:8px;border-radius:50%;background:#2ecc71;display:inline-block;box-shadow:0 0 8px #2ecc71"></span>
      المتواجدون الآن في الموقع (نشطين)
    </h3>
    <div id="onlineUsersList" style="display:flex;gap:.8rem;flex-wrap:wrap">
      <p style="color:var(--muted);font-size:.85rem"><i class="fas fa-circle-notch fa-spin"></i> جاري جلب بيانات المتواجدين حالياً...</p>
    </div>
  </div>

  <div class="data-panel">
    <div class="data-panel-header">
      <h3><i class="fas fa-users-gear" style="color:var(--blue-600)"></i> قائمة المستخدمين</h3>
    </div>
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>المستخدم</th><th>البريد الإلكتروني</th><th>الصلاحية</th><th>تاريخ التسجيل</th><th>إجراء</th></tr></thead>
        <tbody>
          ${users.length ? users.map(u => `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:.7rem">
                ${u.avatar_url ? `<img src="${u.avatar_url}" alt="" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1.5px solid var(--ink-100)">` : '<span class="avatar placeholder" style="width:36px;height:36px;font-size:.85rem;font-weight:700">👤</span>'}
                <b>${u.full_name || 'بدون اسم'}</b>
              </div>
            </td>
            <td style="direction:ltr;text-align:right;font-size:.85rem">${u.email || '-'}</td>
            <td>
              <span class="badge badge-${u.role === 'admin' ? 'ok' : 'info'}" style="display:inline-flex;align-items:center;gap:.3rem">
                <i class="fas ${u.role === 'admin' ? 'fa-shield-halved' : 'fa-user'}"></i> ${u.role === 'admin' ? 'مدير' : 'مستخدم'}
              </span>
            </td>
            <td style="color:var(--muted);font-size:.85rem">${new Date(u.created_at).toLocaleDateString('ar-EG')}</td>
            <td>
              <form action="/api/users/${u.id}/role" method="POST" style="display:inline">
                <input type="hidden" name="role" value="${u.role === 'admin' ? 'user' : 'admin'}">
                <button type="submit" class="btn btn-sm ${u.role === 'admin' ? 'btn-ghost' : 'btn-primary'}" style="font-size:.78rem">
                  <i class="fas ${u.role === 'admin' ? 'fa-user-minus' : 'fa-user-shield'}"></i>
                  ${u.role === 'admin' ? 'تنزيل الصلاحية' : 'ترقية لمدير'}
                </button>
              </form>
            </td>
          </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:3rem;color:var(--muted)">لا يوجد مستخدمون مسجلون</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    window.addEventListener('onlineUsersSync', (e) => {
      const users = e.detail;
      const list = document.getElementById('onlineUsersList');
      if (!list) return;
      if (!users || users.length === 0) {
        list.innerHTML = '<p style="color:var(--muted);font-size:.85rem">لا يوجد مستخدمون متواجدون حالياً.</p>';
        return;
      }
      
      list.innerHTML = users.map(u => {
        const avatarHtml = u.avatar 
          ? '<img src="' + u.avatar + '" alt="" style="width:28px;height:28px;border-radius:50%;object-fit:cover">' 
          : '<span class="avatar placeholder" style="width:28px;height:28px;font-size:.7rem">' + (u.name ? u.name.charAt(0) : 'U') + '</span>';
        
        return '<div style="display:flex;align-items:center;gap:.6rem;background:var(--surface);padding:.4rem .8rem;border-radius:2rem;box-shadow:var(--sh-xs);border:1px solid rgba(12,26,43,.04)">' +
                 avatarHtml +
                 '<div>' +
                   '<div style="font-weight:700;font-size:.8rem">' + (u.name || 'بدون اسم') + '</div>' +
                   '<div style="font-size:.65rem;color:var(--muted)">' + (u.role === 'admin' ? 'مدير' : 'مستخدم') + '</div>' +
                 '</div>' +
               '</div>';
      }).join('');
    });
  </script>
  `
)}
