import { dashboardLayout } from './layout'

export const dashContacts = (messages: any[]) => {
  const unread = messages.filter(m => m.status === 'unread').length

  return dashboardLayout(
  'contacts',
  'رسائل التواصل',
  `
  <div class="quick-stats" style="margin-bottom:1.2rem">
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(30,136,229,.08);color:#1e88e5"><i class="fas fa-envelope"></i></div>
      <div><div class="qs-value">${messages.length}</div><div class="qs-label">إجمالي الرسائل</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(229,57,53,.08);color:#e53935"><i class="fas fa-envelope-circle-exclamation"></i></div>
      <div><div class="qs-value">${unread}</div><div class="qs-label">غير مقروءة</div></div>
    </div>
  </div>

  <div class="data-panel">
    <div class="data-panel-header">
      <h3><i class="fas fa-inbox" style="color:var(--blue-600)"></i> الرسائل الواردة</h3>
    </div>
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>الاسم</th><th>البريد الإلكتروني</th><th>الموضوع</th><th>الرسالة</th><th>الحالة</th><th>التاريخ</th><th>إجراء</th></tr></thead>
        <tbody>
          ${messages.length ? messages.map(m => `
          <tr style="${m.status === 'unread' ? 'background:rgba(245,124,0,.03)' : ''}">
            <td><b>${m.name}</b></td>
            <td><a href="mailto:${m.email}" dir="ltr" style="color:var(--blue-600);font-size:.85rem">${m.email}</a></td>
            <td>${m.subject || '-'}</td>
            <td style="max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:help" title="${(m.message || '').replace(/"/g, '&quot;')}">${m.message}</td>
            <td><span class="badge badge-${m.status === 'unread' ? 'pend' : m.status === 'replied' ? 'ok' : 'info'}">${m.status === 'unread' ? 'غير مقروءة' : m.status === 'replied' ? 'تم الرد' : m.status === 'read' ? 'مقروءة' : m.status}</span></td>
            <td style="color:var(--muted);font-size:.85rem">${new Date(m.created_at).toLocaleDateString('ar-EG')}</td>
            <td>
              <form action="/api/contacts/status/${m.id}" method="POST" style="display:flex;gap:.25rem">
                ${m.status === 'unread' ? `<button type="submit" name="status" value="read" class="btn btn-sm btn-ghost" style="color:var(--blue-600)" title="تحديد كمقروءة"><i class="fas fa-eye"></i></button>` : ''}
                ${m.status !== 'replied' ? `<button type="submit" name="status" value="replied" class="btn btn-sm btn-ghost" style="color:var(--emerald-700)" title="تم الرد"><i class="fas fa-reply"></i></button>` : ''}
              </form>
            </td>
          </tr>`).join('') : '<tr><td colspan="7" style="text-align:center;padding:3rem;color:var(--muted)"><i class="fas fa-envelope" style="font-size:2rem;opacity:.15;display:block;margin-bottom:.5rem"></i>لا توجد رسائل واردة</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
  `
)}
