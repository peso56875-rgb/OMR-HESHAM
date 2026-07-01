import { dashboardLayout } from './layout'

export const dashJobs = (jobs: any[], applications: any[]) => dashboardLayout(
  'jobs',
  'الوظائف والتوظيف',
  `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
    <p style="color:var(--muted)">إدارة الشواغر الوظيفية ومراجعة طلبات التقديم.</p>
    <a href="#addJob" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> إضافة وظيفة</a>
  </div>

  <div class="grid" style="grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:2rem">
    <div class="panel">
      <h3 style="margin-bottom:1rem">الوظائف الحالية</h3>
      <div style="overflow-x:auto">
        <table class="dtable">
          <thead><tr><th>المسمى</th><th>القسم</th><th>النوع</th><th>الحالة</th></tr></thead>
          <tbody>
            ${jobs.length ? jobs.map(j => `
            <tr>
              <td><b>${j.title}</b></td>
              <td>${j.department || '-'}</td>
              <td>${j.job_type || '-'}</td>
              <td>${j.is_active ? '<span class="badge badge-ok">نشط</span>' : '<span class="badge badge-info">مغلق</span>'}</td>
            </tr>`).join('') : '<tr><td colspan="4" style="text-align:center;padding:1rem">لا توجد وظائف.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="panel">
      <h3 style="margin-bottom:1rem">أحدث طلبات التقديم</h3>
      <div style="overflow-x:auto">
        <table class="dtable">
          <thead><tr><th>المتقدم</th><th>رقم الهاتف</th><th>الحالة</th></tr></thead>
          <tbody>
            ${applications.length ? applications.map(a => `
            <tr>
              <td><b>${a.full_name}</b></td>
              <td><a href="tel:${a.phone}" dir="ltr">${a.phone}</a></td>
              <td><span class="badge badge-${a.status === 'pending' ? 'pend' : 'info'}">${a.status}</span></td>
            </tr>`).join('') : '<tr><td colspan="3" style="text-align:center;padding:1rem">لا توجد طلبات حديثة.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Add form -->
  <div class="panel" id="addJob">
    <h3 style="margin-bottom:1.5rem"><i class="fas fa-plus-circle"></i> وظيفة جديدة</h3>
    <form action="/api/jobs/add" method="POST">
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>المسمى الوظيفي</label><input type="text" name="title" required></div>
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
      <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> حفظ الوظيفة</button>
    </form>
  </div>
  `
)
