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
  // Prefer the lightweight 256px logo for embedding (keeps .xls files small)
  for (const fileName of ['foundation-logo-256.png', 'foundation-logo.png']) {
    try {
      const logoPath = path.join(process.cwd(), 'public', 'static', fileName)
      if (fs.existsSync(logoPath)) {
        const buf = fs.readFileSync(logoPath)
        cachedLogoBase64 = `data:image/png;base64,${buf.toString('base64')}`
        return cachedLogoBase64
      }
    } catch (e) {}
  }

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

// =====================================================
// قالب التصدير الموحد الجديد — تصميم رسمي فاخر
// =====================================================
const esc = (v: any) => String(v ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')

type ExcelTemplateOpts = {
  sheetName: string
  docTitle: string
  docSubtitle: string
  metaItems: { label: string, value: string }[]
  colCount: number
  headerCells: string
  bodyRows: string
  logoSrc: string
  docRef: string
}

function buildExcelHtml(opts: ExcelTemplateOpts): string {
  const metaCells = opts.metaItems.map((m, i) => `
        <td style="width:${Math.floor(100 / opts.metaItems.length)}%; background-color:#ffffff; border:1px solid #d4e7f8; border-top:3px solid #3b9ed9; padding:12px 16px; text-align:center; vertical-align:middle;">
          <div style="font-size:8.5pt; color:#6b93b8; font-weight:700; margin-bottom:4px;">${esc(m.label)}</div>
          <div style="font-size:11pt; color:#0f4c81; font-weight:800;">${esc(m.value)}</div>
        </td>${i < opts.metaItems.length - 1 ? '<td style="width:12px; border:none; background-color:#eef5fb;"></td>' : ''}`).join('')

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>${esc(opts.sheetName).slice(0, 30)}</x:Name>
    <x:WorksheetOptions>
     <x:DisplayRightToLeft/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; background-color:#eef5fb; }
  table { border-collapse: collapse; }
</style>
</head>
<body>
  <!-- ══ شريط علوي أزرق ══ -->
  <table style="width:100%;"><tr><td colspan="${opts.colCount}" style="background-color:#3b9ed9; height:6px; font-size:1pt;">&nbsp;</td></tr></table>

  <!-- ══ ترويسة الوثيقة ══ -->
  <table style="width:100%; background-color:#0f4c81;">
    <tr>
      <td colspan="${opts.colCount}" style="padding:24px 30px; vertical-align:middle;">
        <table style="width:100%; border:none;">
          <tr>
            <td style="width:104px; vertical-align:middle; border:none;">
              <table style="border:none;"><tr>
                <td style="background-color:#ffffff; border:3px solid #7ec3ef; padding:9px; text-align:center; vertical-align:middle;">
                  <img src="${opts.logoSrc}" width="72" height="72" alt="شعار المؤسسة" style="display:block;" />
                </td>
              </tr></table>
            </td>
            <td style="vertical-align:middle; border:none; padding-right:22px; text-align:right;">
              <div style="font-size:9pt; color:#a8d8f5; font-weight:800; letter-spacing:2px; margin-bottom:6px;">✦ &nbsp;وثيقة رسمية معتمدة&nbsp; ✦</div>
              <div style="font-size:19pt; font-weight:900; color:#ffffff;">مؤسسة الدكتور عمر هشام الخيرية</div>
              <div style="font-size:10.5pt; color:#cfe8f9; font-weight:600; margin-top:6px;">للخدمات المجتمعية والتنموية — الإدارة المركزية للبيانات والتقارير</div>
            </td>
            <td style="width:160px; vertical-align:middle; border:none; text-align:center;">
              <table style="border:none; margin:0 auto;"><tr>
                <td style="background-color:#1a5f9c; border:1px solid #5aa9e0; padding:10px 14px; text-align:center;">
                  <div style="font-size:8pt; color:#a8d8f5; font-weight:700; margin-bottom:3px;">مرجع الوثيقة</div>
                  <div style="font-size:11pt; color:#ffffff; font-weight:900; font-family:Consolas,monospace;">${esc(opts.docRef)}</div>
                </td>
              </tr></table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- ══ شريط عنوان التقرير ══ -->
  <table style="width:100%; background-color:#1a5f9c;">
    <tr>
      <td colspan="${opts.colCount}" style="padding:14px 30px; text-align:center; vertical-align:middle; border-bottom:3px solid #7ec3ef;">
        <div style="font-size:15pt; font-weight:900; color:#ffffff;">${esc(opts.docTitle)}</div>
        <div style="font-size:9.5pt; color:#bfe2f8; font-weight:700; margin-top:4px;">${esc(opts.docSubtitle)}</div>
      </td>
    </tr>
  </table>

  <!-- ══ بطاقات بيانات الوثيقة ══ -->
  <table style="width:100%; background-color:#eef5fb;">
    <tr><td colspan="${opts.colCount}" style="height:14px; font-size:1pt;">&nbsp;</td></tr>
    <tr>${metaCells}</tr>
    <tr><td colspan="${opts.colCount}" style="height:14px; font-size:1pt;">&nbsp;</td></tr>
  </table>

  <!-- ══ جدول البيانات ══ -->
  <table style="width:100%; background-color:#ffffff;">
    <thead>
      <tr>${opts.headerCells}</tr>
    </thead>
    <tbody>
      ${opts.bodyRows}
    </tbody>
  </table>

  <!-- ══ تذييل الوثيقة ══ -->
  <table style="width:100%;">
    <tr><td colspan="${opts.colCount}" style="height:16px; font-size:1pt;">&nbsp;</td></tr>
    <tr>
      <td colspan="${opts.colCount}" style="background-color:#0f4c81; border-top:3px solid #3b9ed9; padding:14px 30px; text-align:center;">
        <div style="font-size:10pt; color:#ffffff; font-weight:900;">✦ صدرت هذه الوثيقة آلياً من لوحة التحكم المركزية لمؤسسة الدكتور عمر هشام الخيرية ✦</div>
        <div style="font-size:8.5pt; color:#a8d8f5; font-weight:600; margin-top:5px;">omarhesham.org — جميع البيانات الواردة بهذا السجل محفوظة وموثقة لدى الإدارة، ولا يجوز تداولها خارج الأطر الرسمية.</div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// مرجع وثيقة مختصر (حروف + أرقام)
function timestampSuffix(): string {
  const t = Date.now().toString(36).toUpperCase()
  const r = Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, '0')
  return `${t.slice(-5)}${r}`
}

// خلية رأس عمود موحدة — أزرق فاتح أنيق
const thCell = (label: string, align: string = 'right', width?: number) =>
  `<th style="background-color:#0f4c81; color:#ffffff; font-weight:800; font-size:11pt; border:1px solid #1a5f9c; border-bottom:3px solid #7ec3ef; padding:13px 14px; text-align:${align};${width ? ` width:${width}px;` : ''}">${esc(label)}</th>`

// خلية بيانات موحدة — حدود زرقاء فاتحة
const tdCell = (value: string, bg: string, opts2: { align?: string, color?: string, bold?: boolean, size?: string } = {}) =>
  `<td style="border:1px solid #d4e7f8; padding:11px 14px; font-size:${opts2.size || '10.5pt'}; text-align:${opts2.align || 'right'}; color:${opts2.color || '#1d3a54'}; background-color:${bg};${opts2.bold ? ' font-weight:800;' : ''}">${value}</td>`

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
      { key: 'volunteer_code', label: 'كود الهوية', format: (v) => v || '-' },
      { key: 'full_name', label: 'اسم المتطوع' },
      { key: 'phone', label: 'رقم الهاتف' },
      { key: 'age', label: 'العمر', format: (v) => v || '-' },
      { key: 'city', label: 'المدينة / المحافظة' },
      { key: 'preferred_role', label: 'المجال المفضل' },
      { key: 'team', label: 'الفريق', format: (v) => v || '-' },
      { key: 'rank', label: 'الرتبة', format: (v) => v || '-' },
      { key: 'skills', label: 'المهارات والخبرات' },
      { key: 'hours_count', label: 'ساعات الخدمة', format: (v) => v ?? 0 },
      { key: 'status', label: 'حالة الطلب', format: (v) => v === 'approved' ? 'مقبول' : v === 'rejected' ? 'مرفوض' : v === 'revoked' ? 'ملغاة / مجمّدة' : 'قيد المراجعة' },
      { key: 'is_active', label: 'البطاقة نشطة', format: (v) => v === false ? 'لا' : 'نعم' },
      { key: 'expires_at', label: 'انتهاء صلاحية البطاقة', format: (v) => v ? new Date(v).toLocaleDateString('ar-EG') : 'مفتوحة' },
      { key: 'approved_at', label: 'تاريخ الاعتماد', format: (v) => v ? new Date(v).toLocaleString('ar-EG') : '-' },
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
      const bg = idx % 2 === 0 ? '#ffffff' : '#eef5fb'
      return `<tr>
        ${tdCell(String(idx + 1), bg, { align: 'center', color: '#0f4c81', bold: true, size: '10pt' })}
        ${tdCell(esc(name), bg, { bold: true, size: '11.5pt' })}
        ${tdCell(esc(groupTitleFinal), bg, { color: '#2f7fb8', bold: true })}
        ${tdCell(esc(dateStr), bg, { align: 'center', color: '#5f7f9c', size: '9.5pt' })}
        ${tdCell('<span style="color:#9db8cf;">.........................................</span>', bg, { align: 'center' })}
      </tr>`
    }).join('\n')

    const headerCells =
      thCell('م', 'center', 55) +
      thCell('اسم المستفيد') +
      thCell('المجموعة / البيان') +
      thCell('تاريخ الاستخراج', 'center') +
      thCell('ملاحظات / توقيع الاستلام', 'center', 190)

    const excelHtml = buildExcelHtml({
      sheetName: String(groupTitleFinal),
      docTitle: 'كشف العينة العشوائية للمستفيدين',
      docSubtitle: `بيان الكشف: ${String(groupTitleFinal)}`,
      metaItems: [
        { label: 'بيان الكشف', value: String(groupTitleFinal) },
        { label: 'إجمالي السجلات', value: `${sampleCount} اسم` },
        { label: 'تاريخ الاستخراج', value: dateStr }
      ],
      colCount: 5,
      headerCells,
      bodyRows: tableBodyRows,
      logoSrc,
      docRef: `SMP-${timestampSuffix()}`
    })

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
      const bg = idx % 2 === 0 ? '#ffffff' : '#eef5fb'
      return `<tr>
        ${tdCell(String(idx + 1), bg, { align: 'center', color: '#0f4c81', bold: true, size: '10pt' })}
        ${tdCell(esc(name), bg, { bold: true, size: '11.5pt' })}
        ${tdCell(esc(groupTitleFinal), bg, { color: '#2f7fb8', bold: true })}
        ${tdCell('<span style="color:#9db8cf;">.........................................</span>', bg, { align: 'center' })}
      </tr>`
    }).join('\n')

    const headerCells =
      thCell('م', 'center', 55) +
      thCell('اسم المستفيد') +
      thCell('المجموعة / البيان') +
      thCell('ملاحظات / توقيع الاستلام', 'center', 210)

    const excelHtml = buildExcelHtml({
      sheetName: String(groupTitleFinal),
      docTitle: 'القائمة الكاملة للمستفيدين',
      docSubtitle: `بيان الكشف: ${String(groupTitleFinal)}`,
      metaItems: [
        { label: 'المجموعة / البيان', value: String(groupTitleFinal) },
        { label: 'إجمالي السجلات', value: `${allNames.length} اسم` },
        { label: 'تاريخ الاستخراج', value: dateStr }
      ],
      colCount: 4,
      headerCells,
      bodyRows: tableBodyRows,
      logoSrc,
      docRef: `FULL-${timestampSuffix()}`
    })

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

    const headerCells = config.columns.map(col => thCell(col.label)).join('')

    const tableBodyRows = docs.length === 0
      ? `<tr><td colspan="${config.columns.length}" style="text-align:center; padding:26px; color:#6b93b8; font-size:11pt; font-weight:700; background-color:#ffffff; border:1px solid #d4e7f8;">لا توجد بيانات مسجلة في هذا القسم حتى الآن.</td></tr>`
      : docs.map((doc, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#eef5fb'
        const cells = config.columns.map((col, ci) => {
          const rawVal = doc[col.key]
          const formattedVal = col.format ? col.format(rawVal, doc) : (rawVal ?? '-')
          const isFirstCol = ci === 0
          return tdCell(esc(formattedVal), bg, { bold: isFirstCol, color: isFirstCol ? '#0f4c81' : '#1d3a54' })
        }).join('')
        return `<tr>${cells}</tr>`
      }).join('\n')

    const colCount = config.columns.length
    const excelHtml = buildExcelHtml({
      sheetName: config.title,
      docTitle: config.title,
      docSubtitle: 'تقرير بيانات شامل — مستخرج مباشرة من قاعدة بيانات المنصة',
      metaItems: [
        { label: 'نوع التقرير', value: config.title },
        { label: 'إجمالي السجلات', value: `${docs.length} سجل` },
        { label: 'تاريخ الاستخراج', value: dateStr }
      ],
      colCount,
      headerCells,
      bodyRows: tableBodyRows,
      logoSrc,
      docRef: `EXP-${timestampSuffix()}`
    })

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
