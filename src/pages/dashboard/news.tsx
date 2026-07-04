import { dashboardLayout } from './layout'

export const dashNews = (news: any[]) => dashboardLayout(
  'news',
  'الأخبار والمقالات',
  `
  <div class="data-panel" style="margin-bottom:1.5rem">
    <div class="data-panel-header">
      <h3><i class="fas fa-newspaper" style="color:var(--blue-600)"></i> المقالات المنشورة <span style="font-weight:400;font-size:.82rem;color:var(--muted)">(${news.length})</span></h3>
      <a href="#addNews" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> إضافة خبر</a>
    </div>
    <div style="overflow-x:auto">
      <table class="dtable">
        <thead><tr><th>عنوان الخبر</th><th>التصنيف</th><th>تاريخ النشر</th><th>إجراء</th></tr></thead>
        <tbody>
          ${news.length ? news.map(n => `
          <tr>
            <td><b>${n.title}</b></td>
            <td><span class="badge badge-info">${n.category || '-'}</span></td>
            <td style="color:var(--muted);font-size:.85rem">${new Date(n.publish_date).toLocaleDateString('ar-EG')}</td>
            <td>
              <div style="display:flex;gap:.3rem">
                <button class="btn btn-sm btn-ghost" onclick="editNews('${n.id}', \`${n.title.replace(/`/g, "\\`")}\`, '${n.category || ''}', \`${(n.excerpt || '').replace(/`/g, "\\`")}\`, \`${(n.content || '').replace(/`/g, "\\`")}\`, '${n.image_url || ''}')" title="تعديل"><i class="fas fa-edit"></i></button>
                <form action="/api/news/delete/${n.id}" method="POST" style="display:inline" onsubmit="return confirm('هل أنت متأكد من حذف هذا الخبر؟')">
                  <button type="submit" class="btn btn-sm btn-ghost" style="color:var(--danger)" title="حذف"><i class="fas fa-trash"></i></button>
                </form>
              </div>
            </td>
          </tr>`).join('') : '<tr><td colspan="4" style="text-align:center;padding:3rem;color:var(--muted)"><i class="fas fa-newspaper" style="font-size:2rem;opacity:.15;display:block;margin-bottom:.5rem"></i>لا توجد أخبار مسجلة</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <div class="data-panel" id="addNews">
    <h3 style="margin-bottom:1.5rem" id="newsFormTitle"><i class="fas fa-plus-circle" style="color:var(--blue-600)"></i> خبر جديد</h3>
    <form action="/api/news/add" method="POST">
      <div class="grid cols-2" style="gap:1rem">
        <div class="field"><label>عنوان الخبر <span class="req">*</span></label><input type="text" name="title" required></div>
        <div class="field"><label>التصنيف</label><input type="text" name="category" placeholder="مثال: إنجازات، تغطية إعلامية"></div>
      </div>
      <div class="field"><label>رابط الصورة</label><input type="url" name="image_url" placeholder="https://..."></div>
      <div class="field"><label>مقتطف (Excerpt) <span class="req">*</span></label><textarea name="excerpt" rows="2" required></textarea></div>
      <div class="field"><label>المحتوى الكامل <span class="req">*</span></label><textarea name="content" rows="6" required></textarea></div>
      <button type="submit" class="btn btn-primary" id="newsSubmitBtn"><i class="fas fa-save"></i> حفظ ونشر</button>
    </form>
  </div>
  
  <script>
    function editNews(id, title, category, excerpt, content, image_url) {
      document.getElementById('addNews').scrollIntoView({ behavior: 'smooth' });
      const form = document.querySelector('#addNews form');
      form.action = '/api/news/edit/' + id;
      form.elements['title'].value = title;
      form.elements['category'].value = category;
      form.elements['excerpt'].value = excerpt;
      form.elements['content'].value = content;
      form.elements['image_url'].value = image_url;
      
      document.getElementById('newsFormTitle').innerHTML = '<i class="fas fa-edit" style="color:var(--gold-600)"></i> تعديل الخبر';
      document.getElementById('newsSubmitBtn').innerHTML = '<i class="fas fa-save"></i> تحديث الخبر';
    }
  </script>
  `
)
