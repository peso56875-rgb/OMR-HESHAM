import { dashboardLayout } from './layout'

export const dashJobs = (jobs: any[], applications: any[]) => {
  const activeJobs = jobs.filter(j => j.is_active).length

  return dashboardLayout(
  'jobs',
  'الوظائف والتوظيف',
  `
  <div class="quick-stats" style="margin-bottom:1.2rem">
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(30,136,229,.08);color:#1e88e5"><i class="fas fa-briefcase"></i></div>
      <div><div class="qs-value">${jobs.length}</div><div class="qs-label">إجمالي الوظائف</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(46,204,113,.08);color:#27ae60"><i class="fas fa-check-circle"></i></div>
      <div><div class="qs-value">${activeJobs}</div><div class="qs-label">وظيفة نشطة</div></div>
    </div>
    <div class="qs-item">
      <div class="qs-icon" style="background:rgba(245,124,0,.08);color:#f57c00"><i class="fas fa-file-lines"></i></div>
      <div><div class="qs-value">${applications.length}</div><div class="qs-label">طلب تقديم</div></div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
    <div class="data-panel">
      <div class="data-panel-header">
        <h3><i class="fas fa-briefcase" style="color:var(--blue-600)"></i> الوظائف</h3>
        <a href="#addJob" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> إضافة</a>
      </div>
      <div style="overflow-x:auto">
        <table class="dtable">
          <thead><tr><th>المسمى</th><th>القسم</th><th>النوع</th><th>الحالة</th><th>إجراء</th></tr></thead>
          <tbody>
            ${jobs.length ? jobs.map(j => `
            <tr>
              <td><b>${j.title}</b></td>
              <td>${j.department || '-'}</td>
              <td><span class="badge badge-info">${j.job_type || '-'}</span></td>
              <td>${j.is_active ? '<span class="badge badge-ok">نشط</span>' : '<span class="badge badge-info">مغلق</span>'}</td>
              <td>
                <div style="display:flex;gap:.3rem">
                  <button class="btn btn-sm btn-ghost" onclick="editJob('${j.id}', \`${j.title.replace(/`/g, "\\`")}\`, '${j.department || ''}', '${j.job_type || ''}', '${j.location || ''}', \`${(j.description || '').replace(/`/g, "\\`")}\`, ${j.is_active})" title="تعديل"><i class="fas fa-edit"></i></button>
                  <form action="/api/jobs/delete/${j.id}" method="POST" style="display:inline" onsubmit="return confirm('حذف هذه الوظيفة؟')">
                    <button type="submit" class="btn btn-sm btn-ghost" style="color:var(--danger)" title="حذف"><i class="fas fa-trash"></i></button>
                  </form>
                </div>
              </td>
            </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--muted)">لا توجد وظائف</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="data-panel">
      <div class="data-panel-header">
        <h3><i class="fas fa-file-lines" style="color:var(--gold-600)"></i> طلبات التقديم</h3>
      </div>
      <div style="overflow-x:auto">
        <table class="dtable">
          <thead><tr><th>المتقدم</th><th>الهاتف</th><th>الحالة</th></tr></thead>
          <tbody>
            ${applications.length ? applications.map(a => `
            <tr>
              <td><b>${a.full_name}</b></td>
              <td><a href="tel:${a.phone}" dir="ltr" style="color:var(--blue-600)">${a.phone}</a></td>
              <td><span class="badge badge-${a.status === 'pending' ? 'pend' : a.status === 'accepted' ? 'ok' : 'info'}">${a.status === 'pending' ? 'قيد المراجعة' : a.status === 'accepted' ? 'مقبول' : a.status}</span></td>
            </tr>`).join('') : '<tr><td colspan="3" style="text-align:center;padding:2rem;color:var(--muted)">لا توجد طلبات</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="data-panel" id="addJob">
    <h3 style="margin-bottom:1.5rem" id="jobFormTitle"><i class="fas fa-plus-circle" style="color:var(--blue-600)"></i> وظيفة جديدة</h3>
    <form action="/api/jobs/add" method="POST">
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>المسمى الوظيفي <span class="req">*</span></label><input type="text" name="title" required></div>
        <div class="field"><label>القسم</label><input type="text" name="department" placeholder="مثال: الإدارة، العمليات"></div>
      </div>
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>نوع الدوام</label>
          <select name="job_type">
            <option value="دوام كامل">دوام كامل</option>
            <option value="دوام جزئي">دوام جزئي</option>
            <option value="تعاقد">تعاقد حر</option>
            <option value="تطوع">تطوع</option>
          </select>
        </div>
        <div class="field"><label>المكان</label><input type="text" name="location" placeholder="مثال: القاهرة، أو عن بعد"></div>
      </div>
      <div class="field"><label>الوصف الوظيفي والمتطلبات</label><textarea name="description" rows="4"></textarea></div>
      <div class="field">
        <label><input type="checkbox" name="is_active" value="true" checked> الوظيفة متاحة للتقديم حالياً</label>
      </div>
      <button type="submit" class="btn btn-primary" id="jobSubmitBtn"><i class="fas fa-save"></i> حفظ الوظيفة</button>
    </form>
  </div>
  
  <script>
    function editJob(id, title, department, job_type, location, description, is_active) {
      document.getElementById('addJob').scrollIntoView({ behavior: 'smooth' });
      const form = document.querySelector('#addJob form');
      form.action = '/api/jobs/edit/' + id;
      form.elements['title'].value = title;
      form.elements['department'].value = department;
      form.elements['job_type'].value = job_type;
      form.elements['location'].value = location;
      form.elements['description'].value = description;
      form.elements['is_active'].checked = is_active;
      
      document.getElementById('jobFormTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--gold-600)"></i> تعديل الوظيفة';
      document.getElementById('jobSubmitBtn').innerHTML = '<i class="fas fa-save"></i> تحديث الوظيفة';
    }
  </script>
  `
)}
