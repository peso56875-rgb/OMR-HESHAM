import { dashboardLayout } from './layout'

export const dashCampaigns = (campaigns: any[]) => dashboardLayout(
  'campaigns',
  'إدارة الحملات',
  `
  <div class="data-panel">
    <div class="data-panel-header">
      <h3><i class="fas fa-bullhorn" style="color:var(--gold-600)"></i> الحملات الإنسانية <span style="font-weight:400;font-size:.82rem;color:var(--muted)">(${campaigns.length})</span></h3>
      <a href="#addCampaign" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> إضافة حملة</a>
    </div>
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>عنوان الحملة</th><th>التصنيف</th><th>الهدف</th><th>المدفوع</th><th>التقدّم</th><th>الحالة</th><th>التاريخ</th><th>إجراء</th></tr></thead>
        <tbody>
          ${campaigns.length ? campaigns.map(c => {
            const progress = c.goal > 0 ? Math.min(100, Math.round((Number(c.raised || 0) / Number(c.goal)) * 100)) : 0
            return `
          <tr>
            <td><b>${c.title}</b></td>
            <td><span class="badge badge-info">${c.category || '-'}</span></td>
            <td>${Number(c.goal).toLocaleString('ar-EG')} ج.م</td>
            <td style="color:var(--emerald-700);font-weight:700">${Number(c.raised || 0).toLocaleString('ar-EG')} ج.م</td>
            <td style="min-width:120px">
              <div style="display:flex;align-items:center;gap:.5rem">
                <div style="flex:1;height:6px;border-radius:3px;background:rgba(12,26,43,.06);overflow:hidden">
                  <div style="width:${progress}%;height:100%;border-radius:3px;background:${progress >= 80 ? 'var(--emerald-600)' : progress >= 50 ? 'var(--gold-600)' : 'var(--blue-600)'};transition:width .3s"></div>
                </div>
                <span style="font-size:.75rem;font-weight:700;color:var(--muted)">${progress}%</span>
              </div>
            </td>
            <td>${c.is_urgent ? '<span class="badge badge-pend">عاجل</span>' : '<span class="badge badge-ok">عادي</span>'}</td>
            <td style="color:var(--muted);font-size:.85rem">${new Date(c.created_at).toLocaleDateString('ar-EG')}</td>
            <td>
              <div style="display:flex;gap:.3rem">
                <button class="btn btn-sm btn-ghost" onclick="editCampaign('${c.id}', \`${c.title.replace(/`/g, "\\`")}\`, '${c.category}', ${c.goal}, '${c.image_url || ''}', ${c.is_urgent}, \`${(c.description || '').replace(/`/g, "\\`")}\`)" title="تعديل"><i class="fas fa-edit"></i></button>
                <form action="/api/campaigns/delete/${c.id}" method="POST" style="display:inline" onsubmit="return confirm('هل أنت متأكد من حذف هذه الحملة؟')">
                  <button type="submit" class="btn btn-sm btn-ghost" style="color:var(--danger)" title="حذف"><i class="fas fa-trash"></i></button>
                </form>
              </div>
            </td>
          </tr>`}).join('') : '<tr><td colspan="8" style="text-align:center;padding:3rem;color:var(--muted)"><i class="fas fa-bullhorn" style="font-size:2rem;opacity:.15;display:block;margin-bottom:.5rem"></i>لا توجد حملات مسجلة</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add form -->
  <div class="data-panel" id="addCampaign">
    <h3 style="margin-bottom:1.5rem" id="campFormTitle"><i class="fas fa-plus-circle" style="color:var(--blue-600)"></i> حملة جديدة</h3>
    <form action="/api/campaigns/add" method="POST">
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>عنوان الحملة <span class="req">*</span></label><input type="text" name="title" required></div>
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
        <div class="field"><label>المبلغ المستهدف (ج.م) <span class="req">*</span></label><input type="number" name="goal" required></div>
        <div class="field"><label>رابط الصورة</label><input type="url" name="image_url" placeholder="https://..."></div>
      </div>
      <div class="field">
        <label><input type="checkbox" name="is_urgent" value="true"> حملة عاجلة؟</label>
      </div>
      <div class="field"><label>وصف الحملة</label><textarea name="description" rows="4"></textarea></div>
      <button type="submit" class="btn btn-primary" id="campSubmitBtn"><i class="fas fa-save"></i> حفظ الحملة</button>
    </form>
  </div>
  
  <script>
    function editCampaign(id, title, category, goal, image_url, is_urgent, description) {
      document.getElementById('addCampaign').scrollIntoView({ behavior: 'smooth' });
      const form = document.querySelector('#addCampaign form');
      form.action = '/api/campaigns/edit/' + id;
      form.elements['title'].value = title;
      form.elements['category'].value = category;
      form.elements['goal'].value = goal;
      form.elements['image_url'].value = image_url;
      form.elements['is_urgent'].checked = is_urgent;
      form.elements['description'].value = description;
      
      document.getElementById('campFormTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--gold-600)"></i> تعديل الحملة';
      document.getElementById('campSubmitBtn').innerHTML = '<i class="fas fa-save"></i> تحديث الحملة';
    }
  </script>
  `
)
