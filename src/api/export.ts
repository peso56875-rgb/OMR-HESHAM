import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'

export const exportApi = new Hono()

exportApi.use('*', adminMiddleware)

type ColumnDef = {
  key: string
  label: string
  format?: (value: any, row: any) => string
}

type ConfigDef = {
  title: string
  columns: ColumnDef[]
}

const collectionConfigs: Record<string, ConfigDef> = {
  donations: {
    title: 'سجل التبرعات والمساهمات المالية',
    columns: [
      { key: 'donor_name', label: 'اسم المتبرع' },
      { key: 'donor_phone', label: 'رقم الهاتف' },
      { key: 'donor_email', label: 'البريد الإلكتروني' },
      { key: 'amount', label: 'المبلغ (ج.م)', format: (v) => Number(v || 0).toLocaleString('ar-EG') + ' ج.م' },
      { key: 'campaign_title', label: 'الحملة المستهدفة', format: (v) => v || 'الصندوق العام' },
      { key: 'payment_method', label: 'طريقة التحويل', format: (v) => v === 'instapay' ? 'إنستاباي / تحويل بنكي' : v === 'vodafone' ? 'فودافون كاش' : 'دفع نقدي مباشر' },
      { key: 'status', label: 'حالة التبرع', format: (v) => v === 'completed' ? 'مكتمل' : 'قيد المراجعة' },
      { key: 'created_at', label: 'تاريخ التحويل', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' }
    ]
  },
  treasury_income: {
    title: 'سجل إيرادات الخزنة المالية',
    columns: [
      { key: 'amount', label: 'المبلغ (ج.م)', format: (v) => Number(v || 0).toLocaleString('ar-EG') + ' ج.م' },
      { key: 'source', label: 'مصدر الإيراد' },
      { key: 'donor_name', label: 'اسم المتبرع/المصدر', format: (v) => v || 'فاعل خير' },
      { key: 'donor_phone', label: 'رقم الهاتف', format: (v) => v || '-' },
      { key: 'campaign_title', label: 'الحملة المستهدفة', format: (v) => v || 'الصندوق العام' },
      { key: 'description', label: 'التفاصيل والملاحظات', format: (v) => v || '-' },
      { key: 'date', label: 'تاريخ الاستلام' },
      { key: 'recorded_by', label: 'تم التسجيل بواسطة (الأدمن)' },
      { key: 'created_at', label: 'تاريخ الإدخال النظامي', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' }
    ]
  },
  treasury_expenses: {
    title: 'سجل مصروفات الخزنة المالية',
    columns: [
      { key: 'amount', label: 'المبلغ المصروف (ج.م)', format: (v) => Number(v || 0).toLocaleString('ar-EG') + ' ج.م' },
      { key: 'category', label: 'بند الصرف' },
      { key: 'beneficiary', label: 'الجهة / المستفيد' },
      { key: 'campaign_title', label: 'الحملة المرتبطة', format: (v) => v || 'عام' },
      { key: 'description', label: 'وصف المصروف' },
      { key: 'date', label: 'تاريخ الصرف' },
      { key: 'recorded_by', label: 'تم الصرف بواسطة (الأدمن)' },
      { key: 'created_at', label: 'تاريخ الإدخال النظامي', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' }
    ]
  },
  volunteers: {
    title: 'سجل طلبات التطوع والمبادرات',
    columns: [
      { key: 'full_name', label: 'اسم المتطوع' },
      { key: 'phone', label: 'رقم الهاتف' },
      { key: 'city', label: 'المدينة / المحافظة' },
      { key: 'preferred_role', label: 'المجال المفضل' },
      { key: 'skills', label: 'المهارات والخبرات' },
      { key: 'status', label: 'حالة الطلب', format: (v) => v === 'approved' ? 'مقبول' : v === 'rejected' ? 'مرفوض' : 'قيد المراجعة' },
      { key: 'created_at', label: 'تاريخ التقديم', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' }
    ]
  },
  users: {
    title: 'سجل مستخدمي وأعضاء المنصة',
    columns: [
      { key: 'full_name', label: 'الاسم الكامل' },
      { key: 'email', label: 'البريد الإلكتروني' },
      { key: 'phone', label: 'رقم الهاتف', format: (v) => v || '-' },
      { key: 'role', label: 'الصلاحية / الدور', format: (v) => v === 'admin' ? 'مشرف (Admin)' : 'عضو (Donor)' },
      { key: 'created_at', label: 'تاريخ الانضمام', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' }
    ]
  },
  profiles: {
    title: 'سجل مستخدمي وأعضاء المنصة',
    columns: [
      { key: 'full_name', label: 'الاسم الكامل' },
      { key: 'email', label: 'البريد الإلكتروني' },
      { key: 'phone', label: 'رقم الهاتف', format: (v) => v || '-' },
      { key: 'role', label: 'الصلاحية / الدور', format: (v) => v === 'admin' ? 'مشرف (Admin)' : 'عضو (Donor)' },
      { key: 'created_at', label: 'تاريخ الانضمام', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' }
    ]
  },
  contacts: {
    title: 'سجل رسائل واستفسارات تواصل معنا',
    columns: [
      { key: 'name', label: 'اسم المرسل' },
      { key: 'email', label: 'البريد الإلكتروني' },
      { key: 'phone', label: 'رقم الهاتف', format: (v) => v || '-' },
      { key: 'subject', label: 'الموضوع' },
      { key: 'message', label: 'مضمون الرسالة' },
      { key: 'status', label: 'حالة الرسالة', format: (v) => v === 'read' ? 'مقروءة' : 'جديدة' },
      { key: 'created_at', label: 'تاريخ الرسالة', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' }
    ]
  },
  job_applications: {
    title: 'سجل طلبات التوظيف الواردة',
    columns: [
      { key: 'full_name', label: 'اسم المتقدم' },
      { key: 'email', label: 'البريد الإلكتروني' },
      { key: 'phone', label: 'رقم الهاتف' },
      { key: 'job_title', label: 'الوظيفة المستهدفة', format: (v) => v || 'عام' },
      { key: 'cv_url', label: 'رابط السيرة الذاتية' },
      { key: 'bio', label: 'نبذة عن الخبرات' },
      { key: 'created_at', label: 'تاريخ التقديم', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' }
    ]
  },
  newsletter_subscribers: {
    title: 'سجل مشتركي النشرة البريدية',
    columns: [
      { key: 'email', label: 'البريد الإلكتروني' },
      { key: 'status', label: 'حالة الاشتراك', format: (v) => v === 'subscribed' ? 'نشط' : 'ملغى' },
      { key: 'created_at', label: 'تاريخ الاشتراك', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' }
    ]
  },
  campaigns: {
    title: 'سجل الحملات والمشاريع الخيرية',
    columns: [
      { key: 'title', label: 'عنوان الحملة' },
      { key: 'category', label: 'القسم' },
      { key: 'goal', label: 'الهدف التمويلي', format: (v) => Number(v || 0).toLocaleString('ar-EG') + ' ج.م' },
      { key: 'raised', label: 'المبلغ المجمع', format: (v) => Number(v || 0).toLocaleString('ar-EG') + ' ج.م' },
      { key: 'is_urgent', label: 'عاجلة؟', format: (v) => v ? 'نعم' : 'لا' },
      { key: 'description', label: 'الوصف' },
      { key: 'created_at', label: 'تاريخ الإنشاء', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' }
    ]
  },
  news: {
    title: 'سجل الأخبار والفعاليات المنشورة',
    columns: [
      { key: 'title', label: 'عنوان الخبر' },
      { key: 'category', label: 'القسم' },
      { key: 'excerpt', label: 'الموجز' },
      { key: 'publish_date', label: 'تاريخ النشر', format: (v) => v ? new Date(v).toLocaleDateString('ar-EG') : '-' }
    ]
  },
  events: {
    title: 'سجل الفعاليات والمؤتمرات',
    columns: [
      { key: 'title', label: 'عنوان الفعالية' },
      { key: 'type', label: 'النوع' },
      { key: 'place', label: 'المكان' },
      { key: 'event_date', label: 'تاريخ الفعالية', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' }
    ]
  }
}

// =====================================================
// استخراج عينة عشوائية من مجموعة مستفيدين
// GET /api/export/cases_sample?group_id=XXX&count=150
// =====================================================
exportApi.get('/cases_sample', async (c) => {
  const groupId = c.req.query('group_id') || ''
  const countParam = parseInt(c.req.query('count') || '0', 10)

  if (!groupId) {
    return c.text('يجب تحديد مجموعة (group_id)', 400)
  }

  try {
    const db = getFirestore(c)
    const doc = await db.collection('beneficiary_groups').doc(groupId).get()

    if (!doc.exists) {
      return c.text('المجموعة غير موجودة', 404)
    }

    const groupData: any = doc.data()
    const allNames: string[] = groupData.names || []

    if (allNames.length === 0) {
      return c.text('لا توجد أسماء في هذه المجموعة', 400)
    }

    // Fisher-Yates Shuffle — عشوائية مضمونة ١٠٠%
    const shuffled = [...allNames]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // تحديد العدد المطلوب
    const sampleCount = countParam > 0 && countParam <= shuffled.length
      ? countParam
      : shuffled.length

    const sample = shuffled.slice(0, sampleCount)

    const dateStr = new Date().toLocaleDateString('ar-EG', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

    const tableBodyRows = sample.map((name, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#fcfaf5'
      const safeName = String(name).replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `<tr>
        <td style="border:1px solid #e2d9c8; padding:10px 14px; font-size:11pt; text-align:center; color:#555; background-color:${bg}; font-weight:bold;">${idx + 1}</td>
        <td style="border:1px solid #e2d9c8; padding:10px 14px; font-size:11pt; text-align:right; color:#111; background-color:${bg}; font-weight:600;">${safeName}</td>
        <td style="border:1px solid #e2d9c8; padding:10px 14px; font-size:10pt; text-align:right; color:#444; background-color:${bg};">${String(groupData.title || '').replace(/</g, '&lt;')}</td>
        <td style="border:1px solid #e2d9c8; padding:10px 14px; font-size:10pt; text-align:right; color:#444; background-color:${bg};">${String(groupData.aid_type || '-').replace(/</g, '&lt;')}</td>
        <td style="border:1px solid #e2d9c8; padding:10px 14px; font-size:10pt; text-align:center; color:#666; background-color:${bg};">${dateStr}</td>
      </tr>`
    }).join('\n')

    const colCount = 5
    const excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>عينة المستفيدين</x:Name>
    <x:WorksheetOptions>
     <x:DisplayRightToLeft/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
  table { border-collapse: collapse; width: 100%; margin-top: 10px; }
</style>
</head>
<body>
  <table>
    <tr>
      <td colspan="${colCount}" style="background-color:#0c4a3f; color:#ffffff; text-align:center; font-size:18pt; font-weight:bold; padding:16px 10px;">
        مؤسسة الدكتور عمر هشام للخدمات المجتمعية والخيرية
      </td>
    </tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#d6a64b; color:#0c4a3f; text-align:center; font-size:13pt; font-weight:bold; padding:8px 10px;">
        قائمة المستفيدين — عينة عشوائية
      </td>
    </tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#f4efe6; color:#555555; text-align:right; font-size:10pt; padding:8px 12px; border-bottom:2px solid #d6a64b;">
        <b>المجموعة:</b> ${String(groupData.title || '').replace(/</g, '&lt;')} &nbsp;|&nbsp;
        <b>نوع المساعدة:</b> ${String(groupData.aid_type || '-').replace(/</g, '&lt;')} &nbsp;|&nbsp;
        <b>إجمالي المجموعة:</b> ${allNames.length} اسم &nbsp;|&nbsp;
        <b>العينة المستخرجة:</b> ${sampleCount} اسم &nbsp;|&nbsp;
        <b>تاريخ الاستخراج:</b> ${dateStr}
      </td>
    </tr>
    <tr><td colspan="${colCount}" style="height:10px;"></td></tr>
    <thead>
      <tr>
        <th style="background-color:#0c4a3f; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #072d27; padding:12px 10px; text-align:center; width:60px;">م</th>
        <th style="background-color:#0c4a3f; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #072d27; padding:12px 10px; text-align:right;">اسم المستفيد</th>
        <th style="background-color:#0c4a3f; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #072d27; padding:12px 10px; text-align:right;">المجموعة</th>
        <th style="background-color:#0c4a3f; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #072d27; padding:12px 10px; text-align:right;">نوع المساعدة</th>
        <th style="background-color:#0c4a3f; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #072d27; padding:12px 10px; text-align:center;">تاريخ الاستخراج</th>
      </tr>
    </thead>
    <tbody>
      ${tableBodyRows}
    </tbody>
    <tr>
      <td colspan="${colCount}" style="background-color:#f4efe6; color:#0c4a3f; text-align:center; font-size:10pt; padding:10px; border-top:2px solid #d6a64b; font-weight:bold;">
        ✦ تم إعداد هذه القائمة بواسطة نظام مؤسسة الدكتور عمر هشام ✦
      </td>
    </tr>
  </table>
</body>
</html>`

    const safeTitle = String(groupData.title || 'cases').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').slice(0, 30)

    return c.body('\uFEFF' + excelHtml, 200, {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="sample_${safeTitle}_${sampleCount}_${Date.now()}.xls"`
    })
  } catch (e: any) {
    console.error('[Cases Sample Export Error]', e)
    return c.text(`خطأ في التصدير: ${e.message}`, 500)
  }
})

// تصدير كامل أسماء مجموعة
exportApi.get('/cases_full/:id', async (c) => {
  const groupId = c.req.param('id')

  try {
    const db = getFirestore(c)
    const doc = await db.collection('beneficiary_groups').doc(groupId).get()

    if (!doc.exists) {
      return c.text('المجموعة غير موجودة', 404)
    }

    const groupData: any = doc.data()
    const allNames: string[] = groupData.names || []

    const dateStr = new Date().toLocaleDateString('ar-EG', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

    const tableBodyRows = allNames.map((name, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#fcfaf5'
      const safeName = String(name).replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `<tr>
        <td style="border:1px solid #e2d9c8; padding:10px 14px; font-size:11pt; text-align:center; color:#555; background-color:${bg}; font-weight:bold;">${idx + 1}</td>
        <td style="border:1px solid #e2d9c8; padding:10px 14px; font-size:11pt; text-align:right; color:#111; background-color:${bg}; font-weight:600;">${safeName}</td>
        <td style="border:1px solid #e2d9c8; padding:10px 14px; font-size:10pt; text-align:right; color:#444; background-color:${bg};">${String(groupData.aid_type || '-').replace(/</g, '&lt;')}</td>
      </tr>`
    }).join('\n')

    const colCount = 3
    const excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>قائمة المستفيدين</x:Name>
    <x:WorksheetOptions>
     <x:DisplayRightToLeft/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
  table { border-collapse: collapse; width: 100%; margin-top: 10px; }
</style>
</head>
<body>
  <table>
    <tr>
      <td colspan="${colCount}" style="background-color:#0c4a3f; color:#ffffff; text-align:center; font-size:18pt; font-weight:bold; padding:16px 10px;">
        مؤسسة الدكتور عمر هشام للخدمات المجتمعية والخيرية
      </td>
    </tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#d6a64b; color:#0c4a3f; text-align:center; font-size:13pt; font-weight:bold; padding:8px 10px;">
        ${String(groupData.title || 'قائمة المستفيدين').replace(/</g, '&lt;')} — القائمة الكاملة
      </td>
    </tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#f4efe6; color:#555555; text-align:right; font-size:10pt; padding:8px 12px; border-bottom:2px solid #d6a64b;">
        <b>نوع المساعدة:</b> ${String(groupData.aid_type || '-').replace(/</g, '&lt;')} &nbsp;|&nbsp;
        <b>إجمالي السجلات:</b> ${allNames.length} اسم &nbsp;|&nbsp;
        <b>تاريخ الاستخراج:</b> ${dateStr}
      </td>
    </tr>
    <tr><td colspan="${colCount}" style="height:10px;"></td></tr>
    <thead>
      <tr>
        <th style="background-color:#0c4a3f; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #072d27; padding:12px 10px; text-align:center; width:60px;">م</th>
        <th style="background-color:#0c4a3f; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #072d27; padding:12px 10px; text-align:right;">اسم المستفيد</th>
        <th style="background-color:#0c4a3f; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #072d27; padding:12px 10px; text-align:right;">نوع المساعدة</th>
      </tr>
    </thead>
    <tbody>
      ${tableBodyRows}
    </tbody>
    <tr>
      <td colspan="${colCount}" style="background-color:#f4efe6; color:#0c4a3f; text-align:center; font-size:10pt; padding:10px; border-top:2px solid #d6a64b; font-weight:bold;">
        ✦ تم إعداد هذه القائمة بواسطة نظام مؤسسة الدكتور عمر هشام ✦
      </td>
    </tr>
  </table>
</body>
</html>`

    const safeTitle = String(groupData.title || 'cases').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').slice(0, 30)

    return c.body('\uFEFF' + excelHtml, 200, {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="full_${safeTitle}_${Date.now()}.xls"`
    })
  } catch (e: any) {
    console.error('[Cases Full Export Error]', e)
    return c.text(`خطأ في التصدير: ${e.message}`, 500)
  }
})

exportApi.get('/:collection', async (c) => {
  const collectionName = c.req.param('collection')
  const config = collectionConfigs[collectionName]

  if (!config) {
    return c.text('المجموعة غير مسموح بها للتصدير', 400)
  }

  try {
    const db = getFirestore(c)
    const snap = await db.collection(collectionName === 'users' ? 'profiles' : collectionName).get()
    const docs = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))

    const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

    // Generate Styled Excel HTML Spreadsheet
    const tableHeaderRows = config.columns.map(col => `<th style="background-color:#0c4a3f; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #072d27; padding:12px 10px; text-align:right;">${col.label}</th>`).join('')

    const tableBodyRows = docs.length === 0
      ? `<tr><td colspan="${config.columns.length}" style="text-align:center; padding:20px; color:#888;">لا توجد بيانات مسجلة في هذا القسم حتى الآن.</td></tr>`
      : docs.map((doc, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#fcfaf5'
        const cells = config.columns.map(col => {
          const rawVal = doc[col.key]
          const formattedVal = col.format ? col.format(rawVal, doc) : (rawVal ?? '-')
          const safeText = String(formattedVal).replace(/</g, '&lt;').replace(/>/g, '&gt;')
          return `<td style="border:1px solid #e2d9c8; padding:10px; font-size:10pt; text-align:right; color:#222; background-color:${bg};">${safeText}</td>`
        }).join('')
        return `<tr>${cells}</tr>`
      }).join('\n')

    const excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>${config.title.slice(0, 30)}</x:Name>
    <x:WorksheetOptions>
     <x:DisplayRightToLeft/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
  table { border-collapse: collapse; width: 100%; margin-top: 10px; }
</style>
</head>
<body>
  <table>
    <tr>
      <td colspan="${config.columns.length}" style="background-color:#0c4a3f; color:#ffffff; text-align:center; font-size:18pt; font-weight:bold; padding:16px 10px;">
        مؤسسة الدكتور عمر هشام للخدمات المجتمعية والخيرية
      </td>
    </tr>
    <tr>
      <td colspan="${config.columns.length}" style="background-color:#d6a64b; color:#0c4a3f; text-align:center; font-size:13pt; font-weight:bold; padding:8px 10px;">
        ${config.title}
      </td>
    </tr>
    <tr>
      <td colspan="${config.columns.length}" style="background-color:#f4efe6; color:#555555; text-align:right; font-size:10pt; padding:8px 12px; border-bottom:2px solid #d6a64b;">
        <b>تاريخ الاستخراج:</b> ${dateStr} &nbsp; | &nbsp; <b>إجمالي السجلات:</b> ${docs.length} سجل
      </td>
    </tr>
    <tr><td colspan="${config.columns.length}" style="height:10px;"></td></tr>
    <thead>
      <tr>${tableHeaderRows}</tr>
    </thead>
    <tbody>
      ${tableBodyRows}
    </tbody>
  </table>
</body>
</html>`

    return c.body('\uFEFF' + excelHtml, 200, {
      'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
      'Content-Disposition': `attachment; filename="${collectionName}_export_${Date.now()}.xls"`
    })
  } catch (e: any) {
    console.error('[Export Error]', e)
    return c.text(`خطأ في تصدير البيانات: ${e.message}`, 500)
  }
})
