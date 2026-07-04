import { dashboardLayout } from './layout'

export const dashStories = (stories: any[]) => dashboardLayout(
  'stories',
  'قصص النجاح',
  `
  <div class="data-panel" style="margin-bottom:1.5rem">
    <div class="data-panel-header">
      <h3><i class="fas fa-heart" style="color:var(--crimson)"></i> القصص الملهمة <span style="font-weight:400;font-size:.82rem;color:var(--muted)">(${stories.length})</span></h3>
      <a href="#addStory" class="btn btn-primary btn-sm" onclick="resetStoryForm()"><i class="fas fa-plus"></i> إضافة قصة</a>
    </div>
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>الاسم</th><th>الدور/الصفة</th><th>التقييم</th><th>تاريخ الإضافة</th><th>إجراء</th></tr></thead>
        <tbody>
          ${stories.length ? stories.map(s => `
          <tr>
            <td><b>${s.name}</b></td>
            <td><span class="badge badge-info">${s.role || '-'}</span></td>
            <td style="color:var(--gold-500)">${'★'.repeat(s.rating || 5)}${'☆'.repeat(5 - (s.rating || 5))}</td>
            <td style="color:var(--muted);font-size:.85rem">${new Date(s.created_at).toLocaleDateString('ar-EG')}</td>
            <td>
              <div style="display:flex;gap:.3rem">
                <button class="btn btn-sm btn-ghost" onclick="editStory('${s.id}', \`${s.name.replace(/`/g, "\\`")}\`, '${s.role || ''}', ${s.rating}, '${s.image_url || ''}', \`${s.content.replace(/`/g, "\\`")}\`)" title="تعديل"><i class="fas fa-edit"></i></button>
                <form action="/api/stories/delete/${s.id}" method="POST" style="display:inline" onsubmit="return confirm('هل أنت متأكد من حذف هذه القصة؟')">
                  <button type="submit" class="btn btn-sm btn-ghost" style="color:var(--danger)" title="حذف"><i class="fas fa-trash"></i></button>
                </form>
              </div>
            </td>
          </tr>`).join('') : '<tr><td colspan="5" style="text-align:center;padding:3rem;color:var(--muted)"><i class="fas fa-heart" style="font-size:2rem;opacity:.15;display:block;margin-bottom:.5rem"></i>لا توجد قصص مسجلة</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <div class="data-panel" id="addStory">
    <h3 style="margin-bottom:1.5rem" id="formTitle"><i class="fas fa-plus-circle" style="color:var(--blue-600)"></i> قصة جديدة</h3>
    <form action="/api/stories/add" method="POST">
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>اسم صاحب القصة <span class="req">*</span></label><input type="text" name="name" required></div>
        <div class="field"><label>الدور أو الصفة</label><input type="text" name="role" placeholder="مثال: متبرع، مستفيد"></div>
      </div>
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>التقييم (1-5)</label><input type="number" name="rating" min="1" max="5" value="5"></div>
        <div class="field"><label>رابط الصورة</label><input type="url" name="image_url" placeholder="https://..."></div>
      </div>
      <div class="field"><label>القصة أو التجربة <span class="req">*</span></label><textarea name="content" rows="4" required></textarea></div>
      <button type="submit" class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> حفظ القصة</button>
    </form>
  </div>

  <script>
    function editStory(id, name, role, rating, image_url, content) {
      document.getElementById('addStory').scrollIntoView({ behavior: 'smooth' });
      const form = document.querySelector('#addStory form');
      form.action = '/api/stories/edit/' + id;
      document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--gold-600)"></i> تعديل القصة';
      form.elements['name'].value = name;
      form.elements['role'].value = role;
      form.elements['rating'].value = rating;
      form.elements['image_url'].value = image_url;
      form.elements['content'].value = content;
      document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> تحديث القصة';
    }
    function resetStoryForm() {
      const form = document.querySelector('#addStory form');
      form.action = '/api/stories/add';
      document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle" style="color:var(--blue-600)"></i> قصة جديدة';
      form.reset();
      document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> حفظ القصة';
    }
  </script>
  `
)
