import { Hono, Context } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'
import fs from 'fs'
import path from 'path'

export const exportApi = new Hono()

exportApi.use('*', adminMiddleware)

let cachedLogoBase64 = ''
function getLogoImgSrc(c: Context): string {
  if (cachedLogoBase64) return cachedLogoBase64
  try {
    const logoPath = path.join(process.cwd(), 'public', 'static', 'foundation-logo.png')
    if (fs.existsSync(logoPath)) {
      const buf = fs.readFileSync(logoPath)
      cachedLogoBase64 = `data:image/png;base64,${buf.toString('base64')}`
      return cachedLogoBase64
    }
  } catch (e) {}

  try {
    const reqUrl = new URL(c.req.url)
    return `${reqUrl.protocol}//${reqUrl.host}/static/foundation-logo.png`
  } catch (e) {}

  return 'https://omarhesham.org/static/foundation-logo.png'
}

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
  },
  gallery: {
    title: 'سجل معرض الصور المنشورة',
    columns: [
      { key: 'title', label: 'عنوان الصورة' },
      { key: 'tag', label: 'التصنيف' },
      { key: 'location', label: 'المكان / الموقع' },
      { key: 'image_url', label: 'رابط الصورة' },
      { key: 'created_at', label: 'تاريخ الإضافة', format: (v) => v ? new Date(v).toLocaleDateString('ar-EG') : '-' }
    ]
  }
}

// =====================================================
// استخراج عينة عشوائية من مستفيضي المؤسسة
// GET /api/export/cases_sample?group_id=XXX&count=150&custom_title=اسم_المجموعة
// =====================================================
exportApi.get('/cases_sample', async (c) => {
  const groupId = c.req.query('group_id') || ''
  const customTitle = String(c.req.query('custom_title') || c.req.query('title') || '').trim()
  const countParam = parseInt(c.req.query('count') || '0', 10)

  try {
    const db = getFirestore(c)
    let allNames: string[] = []
    let sourceBatchTitle = ''

    if (groupId && groupId !== 'all') {
      const doc = await db.collection('beneficiary_groups').doc(groupId).get()
      if (!doc.exists) {
        return c.text('الدفعة المختارة غير موجودة', 404)
      }
      const groupData: any = doc.data()
      allNames = groupData.names || []
      sourceBatchTitle = groupData.title || ''
    } else {
      // سحب كل الأسماء من جميع الدفعات (Open Data Pool)
      const snap = await db.collection('beneficiary_groups').get()
      snap.docs.forEach((doc: any) => {
        const d = doc.data()
        if (Array.isArray(d.names)) {
          allNames.push(...d.names)
        }
      })
    }

    // إزالة التكرار
    allNames = [...new Set(allNames.filter(n => n && n.trim().length > 0))]

    if (allNames.length === 0) {
      return c.text('لا توجد أسماء مسجلة لاستخراج العينة', 400)
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

    const groupTitleFinal = customTitle || sourceBatchTitle || 'عينة عشوائية للمستفيدين'
    const logoSrc = getLogoImgSrc(c)

    const tableBodyRows = sample.map((name, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8faf9'
      const safeName = String(name).replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `<tr>
        <td style="border:1px solid #cbd5e1; padding:9px 12px; font-size:10.5pt; text-align:center; color:#047857; background-color:${bg}; font-weight:700;">${idx + 1}</td>
        <td style="border:1px solid #cbd5e1; padding:9px 14px; font-size:11.5pt; text-align:right; color:#0f172a; background-color:${bg}; font-weight:700;">${safeName}</td>
        <td style="border:1px solid #cbd5e1; padding:9px 14px; font-size:10.5pt; text-align:right; color:#047857; background-color:${bg}; font-weight:600;">${String(groupTitleFinal).replace(/</g, '&lt;')}</td>
        <td style="border:1px solid #cbd5e1; padding:9px 12px; font-size:10pt; text-align:center; color:#475569; background-color:${bg};">${dateStr}</td>
        <td style="border:1px solid #cbd5e1; padding:9px 12px; font-size:10pt; text-align:center; color:#94a3b8; background-color:${bg}; min-width:150px;">.........................................</td>
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
    <x:Name>${String(groupTitleFinal).slice(0, 30)}</x:Name>
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
      <td colspan="${colCount}" style="background-color:#064e3b; color:#ffffff; padding:18px 24px; vertical-align:middle; border-bottom:4px solid #d97706;">
        <table style="width:100%; border:none; border-collapse:collapse;">
          <tr>
            <td style="width:70px; vertical-align:middle; border:none;">
              <img src="${logoSrc}" width="56" height="56" alt="Logo" style="display:block; border-radius:8px;" />
            </td>
            <td style="vertical-align:middle; border:none; padding-right:15px; text-align:right;">
              <div style="font-size:18pt; font-weight:800; color:#ffffff; font-family:'Segoe UI', Arial, sans-serif;">مؤسسة الدكتور عمر هشام للخدمات المجتمعية والخيرية</div>
              <div style="font-size:11pt; color:#fef3c7; font-weight:600; margin-top:3px;">لوحة التحكم والإدارة المركزية — وثيقة رسمية معتمدة</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#047857; color:#ffffff; text-align:center; font-size:14pt; font-weight:700; padding:10px; border-bottom:2px solid #059669;">
        ${String(groupTitleFinal).replace(/</g, '&lt;')} — قائمة العينة العشوائية
      </td>
    </tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#f0fdf4; color:#064e3b; text-align:right; font-size:10.5pt; padding:10px 16px; border-bottom:2px solid #a7f3d0; font-weight:600;">
        <b>بيان الكشف:</b> ${String(groupTitleFinal).replace(/</g, '&lt;')} &nbsp;&nbsp;|&nbsp;&nbsp;
        <b>إجمالي السجلات:</b> ${sampleCount} اسم &nbsp;&nbsp;|&nbsp;&nbsp;
        <b>تاريخ الاستخراج:</b> ${dateStr}
      </td>
    </tr>
    <tr><td colspan="${colCount}" style="height:10px; background-color:#ffffff;"></td></tr>
    <thead>
      <tr>
        <th style="background-color:#064e3b; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #047857; padding:12px 10px; text-align:center; width:60px;">م</th>
        <th style="background-color:#064e3b; color:#ffffff; font-weight:bold; font-size:11.5pt; border:1px solid #047857; padding:12px 14px; text-align:right;">اسم المستفيد</th>
        <th style="background-color:#064e3b; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #047857; padding:12px 14px; text-align:right;">المجموعة / البيان</th>
        <th style="background-color:#064e3b; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #047857; padding:12px 10px; text-align:center;">تاريخ الاستخراج</th>
        <th style="background-color:#064e3b; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #047857; padding:12px 10px; text-align:center;">ملاحظات / توقيع الاستلام</th>
      </tr>
    </thead>
    <tbody>
      ${tableBodyRows}
    </tbody>
    <tr><td colspan="${colCount}" style="height:14px; background-color:#ffffff;"></td></tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#064e3b; color:#fbbf24; text-align:center; font-size:10pt; padding:12px; border-top:3px solid #d97706; font-weight:bold;">
        ✦ وثيقة رسمية معتمدة — صُدرت من لوحة تحكم مؤسسة الدكتور عمر هشام للخدمات المجتمعية والخيرية ✦
      </td>
    </tr>
  </table>
</body>
</html>`

    const timestamp = Date.now()
    const asciiFilename = `cases_sample_${sampleCount}_${timestamp}.xls`
    const encodedUnicodeFilename = encodeURIComponent(`${groupTitleFinal}_${sampleCount}_${timestamp}.xls`)

    const encoder = new TextEncoder()
    const bodyBytes = encoder.encode('\uFEFF' + excelHtml)

    return new Response(bodyBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedUnicodeFilename}`,
        'Content-Length': String(bodyBytes.byteLength),
        'Cache-Control': 'no-cache, no-store'
      }
    })
  } catch (e: any) {
    console.error('[Cases Sample Export Error]', e)
    return c.text(`خطأ في التصدير: ${e.message}`, 500)
  }
})

// تصدير كامل أسماء مجموعة أو كل الأرشيف
exportApi.get('/cases_full/:id', async (c) => {
  const groupId = c.req.param('id')
  const customTitle = String(c.req.query('custom_title') || c.req.query('title') || '').trim()

  try {
    const db = getFirestore(c)
    let allNames: string[] = []
    let defaultTitle = ''

    if (groupId && groupId !== 'all') {
      const doc = await db.collection('beneficiary_groups').doc(groupId).get()
      if (!doc.exists) {
        return c.text('الدفعة المختارة غير موجودة', 404)
      }
      const groupData: any = doc.data()
      allNames = groupData.names || []
      defaultTitle = groupData.title || ''
    } else {
      const snap = await db.collection('beneficiary_groups').get()
      snap.docs.forEach((doc: any) => {
        const d = doc.data()
        if (Array.isArray(d.names)) {
          allNames.push(...d.names)
        }
      })
      defaultTitle = 'أرشيف المستفيدين بالكامل'
    }

    allNames = [...new Set(allNames.filter(n => n && n.trim().length > 0))]

    const dateStr = new Date().toLocaleDateString('ar-EG', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

    const groupTitleFinal = customTitle || defaultTitle || 'قائمة المستفيدين'
    const logoSrc = getLogoImgSrc(c)

    const tableBodyRows = allNames.map((name, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8faf9'
      const safeName = String(name).replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `<tr>
        <td style="border:1px solid #cbd5e1; padding:9px 12px; font-size:10.5pt; text-align:center; color:#047857; background-color:${bg}; font-weight:700;">${idx + 1}</td>
        <td style="border:1px solid #cbd5e1; padding:9px 14px; font-size:11.5pt; text-align:right; color:#0f172a; background-color:${bg}; font-weight:700;">${safeName}</td>
        <td style="border:1px solid #cbd5e1; padding:9px 14px; font-size:10.5pt; text-align:right; color:#047857; background-color:${bg}; font-weight:600;">${String(groupTitleFinal).replace(/</g, '&lt;')}</td>
        <td style="border:1px solid #cbd5e1; padding:9px 12px; font-size:10pt; text-align:center; color:#94a3b8; background-color:${bg}; min-width:150px;">.........................................</td>
      </tr>`
    }).join('\n')

    const colCount = 4
    const excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>${String(groupTitleFinal).slice(0, 30)}</x:Name>
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
      <td colspan="${colCount}" style="background-color:#064e3b; color:#ffffff; padding:18px 24px; vertical-align:middle; border-bottom:4px solid #d97706;">
        <table style="width:100%; border:none; border-collapse:collapse;">
          <tr>
            <td style="width:70px; vertical-align:middle; border:none;">
              <img src="${logoSrc}" width="56" height="56" alt="Logo" style="display:block; border-radius:8px;" />
            </td>
            <td style="vertical-align:middle; border:none; padding-right:15px; text-align:right;">
              <div style="font-size:18pt; font-weight:800; color:#ffffff;">مؤسسة الدكتور عمر هشام للخدمات المجتمعية والخيرية</div>
              <div style="font-size:11pt; color:#fef3c7; font-weight:600; margin-top:3px;">لوحة التحكم والإدارة المركزية — وثيقة رسمية معتمدة</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#047857; color:#ffffff; text-align:center; font-size:14pt; font-weight:700; padding:10px; border-bottom:2px solid #059669;">
        ${String(groupTitleFinal).replace(/</g, '&lt;')} — القائمة الكاملة
      </td>
    </tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#f0fdf4; color:#064e3b; text-align:right; font-size:10.5pt; padding:10px 16px; border-bottom:2px solid #a7f3d0; font-weight:600;">
        <b>المجموعة / البيان:</b> ${String(groupTitleFinal).replace(/</g, '&lt;')} &nbsp;&nbsp;|&nbsp;&nbsp;
        <b>إجمالي السجلات:</b> ${allNames.length} اسم &nbsp;&nbsp;|&nbsp;&nbsp;
        <b>تاريخ الاستخراج:</b> ${dateStr}
      </td>
    </tr>
    <tr><td colspan="${colCount}" style="height:10px; background-color:#ffffff;"></td></tr>
    <thead>
      <tr>
        <th style="background-color:#064e3b; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #047857; padding:12px 10px; text-align:center; width:60px;">م</th>
        <th style="background-color:#064e3b; color:#ffffff; font-weight:bold; font-size:11.5pt; border:1px solid #047857; padding:12px 14px; text-align:right;">اسم المستفيد</th>
        <th style="background-color:#064e3b; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #047857; padding:12px 14px; text-align:right;">المجموعة / البيان</th>
        <th style="background-color:#064e3b; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #047857; padding:12px 10px; text-align:center;">ملاحظات / توقيع الاستلام</th>
      </tr>
    </thead>
    <tbody>
      ${tableBodyRows}
    </tbody>
    <tr><td colspan="${colCount}" style="height:14px; background-color:#ffffff;"></td></tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#064e3b; color:#fbbf24; text-align:center; font-size:10pt; padding:12px; border-top:3px solid #d97706; font-weight:bold;">
        ✦ وثيقة رسمية معتمدة — صُدرت من لوحة تحكم مؤسسة الدكتور عمر هشام للخدمات المجتمعية والخيرية ✦
      </td>
    </tr>
  </table>
</body>
</html>`

    const timestamp = Date.now()
    const asciiFilename = `cases_full_${timestamp}.xls`
    const encodedUnicodeFilename = encodeURIComponent(`${groupTitleFinal}_full_${timestamp}.xls`)

    const encoder = new TextEncoder()
    const bodyBytes = encoder.encode('\uFEFF' + excelHtml)

    return new Response(bodyBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedUnicodeFilename}`,
        'Content-Length': String(bodyBytes.byteLength),
        'Cache-Control': 'no-cache, no-store'
      }
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

    const logoSrc = getLogoImgSrc(c)

    const tableHeaderRows = config.columns.map(col => `<th style="background-color:#064e3b; color:#ffffff; font-weight:bold; font-size:11pt; border:1px solid #047857; padding:12px 10px; text-align:right;">${col.label}</th>`).join('')

    const tableBodyRows = docs.length === 0
      ? `<tr><td colspan="${config.columns.length}" style="text-align:center; padding:20px; color:#888;">لا توجد بيانات مسجلة في هذا القسم حتى الآن.</td></tr>`
      : docs.map((doc, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8faf9'
        const cells = config.columns.map(col => {
          const rawVal = doc[col.key]
          const formattedVal = col.format ? col.format(rawVal, doc) : (rawVal ?? '-')
          const safeText = String(formattedVal).replace(/</g, '&lt;').replace(/>/g, '&gt;')
          return `<td style="border:1px solid #cbd5e1; padding:9px 12px; font-size:10pt; text-align:right; color:#0f172a; background-color:${bg};">${safeText}</td>`
        }).join('')
        return `<tr>${cells}</tr>`
      }).join('\n')

    const colCount = config.columns.length
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
      <td colspan="${colCount}" style="background-color:#064e3b; color:#ffffff; padding:18px 24px; vertical-align:middle; border-bottom:4px solid #d97706;">
        <table style="width:100%; border:none; border-collapse:collapse;">
          <tr>
            <td style="width:70px; vertical-align:middle; border:none;">
              <img src="${logoSrc}" width="56" height="56" alt="Logo" style="display:block; border-radius:8px;" />
            </td>
            <td style="vertical-align:middle; border:none; padding-right:15px; text-align:right;">
              <div style="font-size:18pt; font-weight:800; color:#ffffff;">مؤسسة الدكتور عمر هشام للخدمات المجتمعية والخيرية</div>
              <div style="font-size:11pt; color:#fef3c7; font-weight:600; margin-top:3px;">لوحة التحكم والإدارة المركزية — وثيقة رسمية معتمدة</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#047857; color:#ffffff; text-align:center; font-size:13pt; font-weight:bold; padding:9px 10px;">
        ${config.title}
      </td>
    </tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#f0fdf4; color:#064e3b; text-align:right; font-size:10pt; padding:8px 12px; border-bottom:2px solid #a7f3d0; font-weight:600;">
        <b>تاريخ الاستخراج:</b> ${dateStr} &nbsp; | &nbsp; <b>إجمالي السجلات:</b> ${docs.length} سجل
      </td>
    </tr>
    <tr><td colspan="${colCount}" style="height:10px; background-color:#ffffff;"></td></tr>
    <thead>
      <tr>${tableHeaderRows}</tr>
    </thead>
    <tbody>
      ${tableBodyRows}
    </tbody>
    <tr><td colspan="${colCount}" style="height:14px; background-color:#ffffff;"></td></tr>
    <tr>
      <td colspan="${colCount}" style="background-color:#064e3b; color:#fbbf24; text-align:center; font-size:10pt; padding:12px; border-top:3px solid #d97706; font-weight:bold;">
        ✦ وثيقة رسمية معتمدة — صُدرت من لوحة تحكم مؤسسة الدكتور عمر هشام للخدمات المجتمعية والخيرية ✦
      </td>
    </tr>
  </table>
</body>
</html>`

    const fileName = `${collectionName}_export_${Date.now()}.xls`

    const encoder = new TextEncoder()
    const bodyBytes = encoder.encode('\uFEFF' + excelHtml)

    return new Response(bodyBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': String(bodyBytes.byteLength),
        'Cache-Control': 'no-cache, no-store'
      }
    })
  } catch (e: any) {
    console.error('[Export Error]', e)
    return c.text(`خطأ في تصدير البيانات: ${e.message}`, 500)
  }
})
