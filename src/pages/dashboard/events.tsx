import { dashboardLayout } from './layout'

export const dashEvents = (events: any[]) => dashboardLayout(
  'events',
  'الفعاليات',
  `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
    <p style="color:var(--muted)">إدارة الفعاليات والأحداث القادمة والسابقة.</p>
    <a href="#addEvent" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> إضافة فعالية</a>
  </div>

  <div class="panel" style="margin-bottom:2rem">
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>عنوان الفعالية</th><th>النوع</th><th>المكان</th><th>التاريخ</th></tr></thead>
        <tbody>
          ${events.length ? events.map(e => `
          <tr>
            <td><b>${e.title}</b></td>
            <td>${e.type || '-'}</td>
            <td>${e.place || '-'}</td>
            <td style="color:var(--muted)">${new Date(e.event_date).toLocaleDateString('ar-EG')}</td>
          </tr>`).join('') : '<tr><td colspan="4" style="text-align:center;padding:2rem">لا توجد فعاليات مسجلة.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add form -->
  <div class="panel" id="addEvent">
    <h3 style="margin-bottom:1.5rem"><i class="fas fa-plus-circle"></i> فعالية جديدة</h3>
    <form action="/api/events/add" method="POST">
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>عنوان الفعالية</label><input type="text" name="title" required></div>
        <div class="field"><label>النوع (مثال: ميداني، رقمي)</label><input type="text" name="type"></div>
      </div>
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>المكان</label><input type="text" name="place"></div>
        <div class="field"><label>تاريخ الفعالية</label><input type="datetime-local" name="event_date" required></div>
      </div>
      <div class="field"><label>رابط الصورة</label><input type="url" name="image_url" placeholder="https://..."></div>
      <div class="field"><label>وصف الفعالية</label><textarea name="description" rows="4" required></textarea></div>
      <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> حفظ الفعالية</button>
    </form>
  </div>
  `
)
