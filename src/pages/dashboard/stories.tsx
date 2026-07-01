import { dashboardLayout } from './layout'

export const dashStories = (stories: any[]) => dashboardLayout(
  'stories',
  'قصص النجاح',
  `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
    <p style="color:var(--muted)">إدارة قصص النجاح وتجارب المستفيدين.</p>
    <a href="#addStory" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> إضافة قصة</a>
  </div>

  <div class="panel" style="margin-bottom:2rem">
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>الاسم</th><th>الدور/الصفة</th><th>التقييم</th><th>تاريخ الإضافة</th></tr></thead>
        <tbody>
          ${stories.length ? stories.map(s => `
          <tr>
            <td><b>${s.name}</b></td>
            <td>${s.role || '-'}</td>
            <td>${'⭐'.repeat(s.rating || 5)}</td>
            <td style="color:var(--muted)">${new Date(s.created_at).toLocaleDateString('ar-EG')}</td>
          </tr>`).join('') : '<tr><td colspan="4" style="text-align:center;padding:2rem">لا توجد قصص مسجلة.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add form -->
  <div class="panel" id="addStory">
    <h3 style="margin-bottom:1.5rem"><i class="fas fa-plus-circle"></i> قصة جديدة</h3>
    <form action="/api/stories/add" method="POST">
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>اسم صاحب القصة</label><input type="text" name="name" required></div>
        <div class="field"><label>الدور أو الصفة (مثال: متبرع، مستفيد)</label><input type="text" name="role"></div>
      </div>
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>التقييم (1-5)</label><input type="number" name="rating" min="1" max="5" value="5"></div>
        <div class="field"><label>رابط الصورة</label><input type="url" name="image_url" placeholder="https://..."></div>
      </div>
      <div class="field"><label>القصة أو التجربة</label><textarea name="content" rows="4" required></textarea></div>
      <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> حفظ القصة</button>
    </form>
  </div>
  `
)
