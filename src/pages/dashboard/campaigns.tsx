import { dashboardLayout } from './layout'

export const dashCampaigns = (campaigns: any[]) => dashboardLayout(
  'campaigns',
  'إدارة الحملات',
  `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
    <p style="color:var(--muted)">إدارة الحملات الإنسانية والتحكم فيها.</p>
    <a href="#addCampaign" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> إضافة حملة</a>
  </div>

  <div class="panel" style="margin-bottom:2rem">
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>عنوان الحملة</th><th>التصنيف</th><th>الهدف</th><th>المدفوع</th><th>الحالة</th><th>تاريخ الإنشاء</th></tr></thead>
        <tbody>
          ${campaigns.length ? campaigns.map(c => `
          <tr>
            <td><b>${c.title}</b></td>
            <td>${c.category || '-'}</td>
            <td>${Number(c.goal).toLocaleString('ar-EG')} ج.م</td>
            <td>${Number(c.raised || 0).toLocaleString('ar-EG')} ج.م</td>
            <td>${c.is_urgent ? '<span class="badge badge-pend">عاجل</span>' : '<span class="badge badge-info">عادي</span>'}</td>
            <td style="color:var(--muted)">${new Date(c.created_at).toLocaleDateString('ar-EG')}</td>
          </tr>`).join('') : '<tr><td colspan="6" style="text-align:center;padding:2rem">لا توجد حملات مسجلة.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add form -->
  <div class="panel" id="addCampaign">
    <h3 style="margin-bottom:1.5rem"><i class="fas fa-plus-circle"></i> حملة جديدة</h3>
    <form action="/api/campaigns/add" method="POST">
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>عنوان الحملة</label><input type="text" name="title" required></div>
        <div class="field"><label>التصنيف</label>
          <select name="category">
            <option value="صحة">صحة</option>
            <option value="غذاء">غذاء</option>
            <option value="تعليم">تعليم</option>
            <option value="إغاثة">إغاثة عامة</option>
          </select>
        </div>
      </div>
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>المبلغ المستهدف (ج.م)</label><input type="number" name="goal" required></div>
        <div class="field"><label>رابط الصورة</label><input type="url" name="image_url" placeholder="https://..."></div>
      </div>
      <div class="field">
        <label><input type="checkbox" name="is_urgent" value="true"> حملة عاجلة؟</label>
      </div>
      <div class="field"><label>وصف الحملة</label><textarea name="description" rows="4"></textarea></div>
      <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> حفظ الحملة</button>
    </form>
  </div>
  `
)
