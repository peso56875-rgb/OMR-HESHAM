import { dashboardLayout } from './layout'

export const dashNews = (news: any[]) => dashboardLayout(
  'news',
  'الأخبار والمقالات',
  `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
    <p style="color:var(--muted)">إدارة المركز الإعلامي وأخبار المؤسسة.</p>
    <a href="#addNews" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> إضافة خبر</a>
  </div>

  <div class="panel" style="margin-bottom:2rem">
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>عنوان الخبر</th><th>التصنيف</th><th>تاريخ النشر</th></tr></thead>
        <tbody>
          ${news.length ? news.map(n => `
          <tr>
            <td><b>${n.title}</b></td>
            <td>${n.category || '-'}</td>
            <td style="color:var(--muted)">${new Date(n.publish_date).toLocaleDateString('ar-EG')}</td>
          </tr>`).join('') : '<tr><td colspan="3" style="text-align:center;padding:2rem">لا توجد أخبار مسجلة.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add form -->
  <div class="panel" id="addNews">
    <h3 style="margin-bottom:1.5rem"><i class="fas fa-plus-circle"></i> خبر جديد</h3>
    <form action="/api/news/add" method="POST">
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>عنوان الخبر</label><input type="text" name="title" required></div>
        <div class="field"><label>التصنيف</label><input type="text" name="category" placeholder="مثال: إنجازات، تغطية إعلامية"></div>
      </div>
      <div class="field"><label>رابط الصورة</label><input type="url" name="image_url" placeholder="https://..."></div>
      <div class="field"><label>مقتطف (Excerpt)</label><textarea name="excerpt" rows="2" required></textarea></div>
      <div class="field"><label>المحتوى الكامل</label><textarea name="content" rows="6" required></textarea></div>
      <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> حفظ ونشر</button>
    </form>
  </div>
  `
)
