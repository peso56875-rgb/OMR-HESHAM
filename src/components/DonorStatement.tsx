import { icon } from './shared'
import type { UserSession } from '../types'

/**
 * شهادة العطاء السنوية وكشف حساب المتبرع
 * مستند A4 رسمي مهيأ للطباعة والحفظ كصورة
 */
export function DonorStatement({
  user,
  donations = [],
  year,
  totalAmount,
  totalDonations,
  statementCode
}: {
  user: UserSession
  donations?: any[]
  year: string
  totalAmount: number
  totalDonations: number
  statementCode: string
}) {
  const issueDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  const hijriYear = '1448'

  // Arabic number words (Tafqeet) for amounts
  function tafqeet(num: number): string {
    if (num === 0) return 'صفر جنيه'
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة']
    const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر']
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة']

    if (num >= 1000000) return `${Math.floor(num).toLocaleString('ar-EG')} جنيهًا مصريًا`
    if (num >= 1000) {
      const thousands = Math.floor(num / 1000)
      const remainder = num % 1000
      const thPart = thousands === 1 ? 'ألف' : thousands === 2 ? 'ألفان' : (thousands <= 10 ? ones[thousands] + ' آلاف' : `${thousands.toLocaleString('ar-EG')} ألف`)
      return remainder > 0 ? `${thPart} و${tafqeet(remainder)}` : `${thPart} جنيهًا مصريًا`
    }
    if (num >= 100) {
      const h = Math.floor(num / 100)
      const remainder = num % 100
      return remainder > 0 ? `${hundreds[h]} و${tafqeet(remainder)}` : `${hundreds[h]} جنيهًا مصريًا`
    }
    if (num >= 20) {
      const t = Math.floor(num / 10)
      const o = num % 10
      return o > 0 ? `${ones[o]} و${tens[t]} جنيهًا مصريًا` : `${tens[t]} جنيهًا مصريًا`
    }
    if (num >= 10) return `${teens[num - 10]} جنيهًا مصريًا`
    return `${ones[num]} جنيهات`
  }

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>شهادة عطاء وكشف تبرعات سنوي | {user.name} | مؤسسة الدكتور عمر هشام</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --ds-gold: #c59b27;
            --ds-gold-dark: #8c6d15;
            --ds-ink: #072722;
            --ds-forest: #0d4a3e;
            --ds-paper: #fcfbf7;
            --ds-border: #e5dcc8;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Tajawal', sans-serif;
            background: #e5e5e5;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px 15px;
            color: var(--ds-ink);
          }

          /* Toolbar */
          .no-print-toolbar {
            width: 100%; max-width: 850px;
            display: flex; justify-content: space-between; align-items: center;
            background: #fff; padding: 12px 24px; border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 24px;
          }
          .toolbar-info { display: flex; align-items: center; gap: 10px; }
          .toolbar-info i { color: var(--ds-gold); font-size: 1.4rem; }
          .toolbar-info span { font-weight: 800; font-size: 0.95rem; }
          .toolbar-actions { display: flex; gap: 10px; }
          .toolbar-actions button, .toolbar-actions a {
            background: var(--ds-forest); color: #fff; border: none;
            padding: 8px 16px; border-radius: 10px; font-weight: 700;
            font-size: 0.85rem; cursor: pointer; text-decoration: none;
            display: inline-flex; align-items: center; gap: 6px;
            transition: all 0.3s;
          }
          .toolbar-actions button:hover, .toolbar-actions a:hover {
            background: var(--ds-gold-dark);
          }

          /* A4 Page */
          .a4-page {
            width: 210mm; min-height: 297mm;
            background: var(--ds-paper);
            padding: 25mm 22mm 30mm;
            position: relative;
            box-shadow: 0 4px 30px rgba(0,0,0,0.12);
            overflow: hidden;
          }

          /* Watermark */
          .watermark {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 5rem; font-weight: 900; opacity: 0.03;
            color: var(--ds-forest); pointer-events: none;
            white-space: nowrap; z-index: 0;
            font-family: 'Aref Ruqaa', serif;
          }

          /* Header */
          .stmt-header {
            display: flex; justify-content: space-between; align-items: flex-start;
            border-bottom: 3px solid var(--ds-gold);
            padding-bottom: 18px; margin-bottom: 20px;
            position: relative; z-index: 1;
          }
          .stmt-header-right { text-align: right; }
          .stmt-header-right h1 {
            font-family: 'Aref Ruqaa', serif;
            font-size: 1.5rem; font-weight: 700;
            color: var(--ds-forest); margin-bottom: 4px;
          }
          .stmt-header-right p {
            font-size: 0.78rem; color: #666; line-height: 1.5;
          }
          .stmt-header-left {
            text-align: left; display: flex; flex-direction: column;
            align-items: flex-end; gap: 4px;
          }
          .stmt-header-left img {
            width: 60px; height: 60px; border-radius: 12px;
            object-fit: contain;
          }
          .stmt-header-left .reg-num {
            font-size: 0.7rem; color: #999; font-weight: 700;
          }

          /* Title Bar */
          .stmt-title-bar {
            background: linear-gradient(135deg, var(--ds-forest), #0a3d33);
            color: #fff; text-align: center; padding: 14px 20px;
            border-radius: 12px; margin-bottom: 22px;
            position: relative; z-index: 1;
          }
          .stmt-title-bar h2 {
            font-size: 1.2rem; font-weight: 900;
            font-family: 'Aref Ruqaa', serif;
          }
          .stmt-title-bar p { font-size: 0.8rem; opacity: 0.85; margin-top: 4px; }

          /* Donor Info */
          .donor-info-grid {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 10px 20px; margin-bottom: 22px;
            background: rgba(12,74,63,0.03);
            padding: 16px 18px; border-radius: 12px;
            border: 1px solid var(--ds-border);
            position: relative; z-index: 1;
          }
          .donor-info-item label {
            font-size: 0.72rem; color: #888; font-weight: 700;
            display: block; margin-bottom: 2px;
          }
          .donor-info-item span {
            font-size: 0.9rem; font-weight: 800; color: var(--ds-ink);
          }

          /* Table */
          .stmt-table-wrap {
            position: relative; z-index: 1; margin-bottom: 22px;
          }
          .stmt-table-wrap h3 {
            font-size: 0.95rem; font-weight: 800; margin-bottom: 10px;
            color: var(--ds-forest);
            display: flex; align-items: center; gap: 8px;
          }
          .stmt-table {
            width: 100%; border-collapse: collapse; font-size: 0.78rem;
          }
          .stmt-table thead th {
            background: var(--ds-forest); color: #fff;
            padding: 8px 10px; font-weight: 700; text-align: right;
            white-space: nowrap;
          }
          .stmt-table thead th:first-child { border-radius: 0 8px 0 0; }
          .stmt-table thead th:last-child { border-radius: 8px 0 0 0; }
          .stmt-table tbody td {
            padding: 8px 10px; border-bottom: 1px solid var(--ds-border);
            vertical-align: middle;
          }
          .stmt-table tbody tr:nth-child(even) { background: rgba(12,74,63,0.02); }
          .stmt-table tbody tr:hover { background: rgba(197,155,39,0.06); }
          .stmt-table tfoot td {
            padding: 10px; font-weight: 900; font-size: 0.88rem;
            border-top: 2px solid var(--ds-gold);
            background: rgba(197,155,39,0.06);
          }

          /* Summary Card */
          .stmt-summary-card {
            background: linear-gradient(135deg, var(--ds-forest), #0a3d33);
            color: #fff; padding: 20px 24px; border-radius: 14px;
            text-align: center; margin-bottom: 22px;
            position: relative; z-index: 1;
          }
          .stmt-summary-card .total-label { font-size: 0.85rem; opacity: 0.8; }
          .stmt-summary-card .total-val {
            font-size: 2rem; font-weight: 900;
            font-family: 'Aref Ruqaa', serif; margin: 6px 0;
          }
          .stmt-summary-card .total-words {
            font-size: 0.82rem; opacity: 0.7;
            font-style: italic;
          }

          /* Signature */
          .stmt-signature-section {
            display: flex; justify-content: space-between;
            margin-top: 30px; position: relative; z-index: 1;
          }
          .sig-block { text-align: center; min-width: 180px; }
          .sig-block .sig-label { font-size: 0.75rem; color: #888; margin-bottom: 20px; }
          .sig-block .sig-line {
            width: 140px; height: 1px; background: #999;
            margin: 0 auto 4px;
          }
          .sig-block .sig-name { font-weight: 800; font-size: 0.82rem; }
          .sig-block .sig-title { font-size: 0.72rem; color: #888; }

          /* Seal */
          .official-seal {
            position: absolute; bottom: 80px; left: 50%;
            transform: translateX(-50%); width: 110px; height: 110px;
            border: 3px solid rgba(197,155,39,0.3);
            border-radius: 50%; display: flex; align-items: center;
            justify-content: center; flex-direction: column;
            font-family: 'Aref Ruqaa', serif; opacity: 0.5;
            color: var(--ds-gold-dark);
          }
          .official-seal .seal-top { font-size: 0.55rem; font-weight: 700; }
          .official-seal .seal-main { font-size: 0.72rem; font-weight: 700; }
          .official-seal .seal-bottom { font-size: 0.5rem; }

          /* Footer */
          .stmt-footer {
            margin-top: auto; padding-top: 16px;
            border-top: 1px solid var(--ds-border);
            font-size: 0.68rem; color: #999;
            display: flex; justify-content: space-between;
            position: relative; z-index: 1;
          }

          /* Print Styles */
          @media print {
            body { background: #fff; padding: 0; }
            .no-print-toolbar { display: none !important; }
            .a4-page {
              box-shadow: none; width: 100%;
              padding: 15mm 18mm 20mm;
              min-height: auto;
            }
            @page { size: A4 portrait; margin: 0; }
          }
          @media (max-width: 768px) {
            .a4-page { width: 100%; padding: 20px 16px; min-height: auto; }
            .donor-info-grid { grid-template-columns: 1fr; }
            .stmt-signature-section { flex-direction: column; gap: 20px; align-items: center; }
          }
        ` }} />
      </head>
      <body>
        {/* Toolbar */}
        <div class="no-print-toolbar">
          <div class="toolbar-info">
            <i class="fa-solid fa-file-invoice"></i>
            <span>شهادة عطاء وكشف تبرعات سنوي — {user.name}</span>
          </div>
          <div class="toolbar-actions">
            <button type="button" onclick="window.print()">
              <i class="fa-solid fa-print"></i> طباعة
            </button>
            <a href="/volunteer-portal">
              <i class="fa-solid fa-arrow-right"></i> العودة
            </a>
          </div>
        </div>

        {/* A4 Document */}
        <div class="a4-page" id="donor-statement">
          <div class="watermark">مؤسسة الدكتور عمر هشام الخيرية</div>

          {/* Header */}
          <div class="stmt-header">
            <div class="stmt-header-right">
              <h1>مؤسسة الدكتور عمر هشام الخيرية</h1>
              <p>
                مشهرة برقم 3115 لسنة 2026 — المنصورة، الدقهلية<br />
                خدمة المجتمع · الرعاية الصحية · كفالة الأيتام · إغاثة المتعففين
              </p>
            </div>
            <div class="stmt-header-left">
              <img src="/static/foundation-logo.png" alt="شعار المؤسسة" />
              <span class="reg-num">سجل رقم 3115/2026</span>
            </div>
          </div>

          {/* Title */}
          <div class="stmt-title-bar">
            <h2>شهادة عطاء وكشف تبرعات سنوي</h2>
            <p>للعام الميلادي {year} — الموافق {hijriYear} هجرية</p>
          </div>

          {/* Donor Info */}
          <div class="donor-info-grid">
            <div class="donor-info-item">
              <label>اسم المتبرع:</label>
              <span>{user.name}</span>
            </div>
            <div class="donor-info-item">
              <label>البريد الإلكتروني:</label>
              <span>{user.email}</span>
            </div>
            <div class="donor-info-item">
              <label>رقم مرجع الكشف:</label>
              <span>{statementCode}</span>
            </div>
            <div class="donor-info-item">
              <label>تاريخ الإصدار:</label>
              <span>{issueDate}</span>
            </div>
          </div>

          {/* Donations Table */}
          <div class="stmt-table-wrap">
            <h3><i class="fa-solid fa-list-check"></i> بيان التبرعات المؤكدة خلال عام {year}</h3>
            <table class="stmt-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>التاريخ</th>
                  <th>الغرض / الحملة</th>
                  <th>طريقة الدفع</th>
                  <th>رقم الإيصال</th>
                  <th>المبلغ (ج.م)</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr>
                    <td colspan={6} style="text-align:center; padding: 24px; color: #888">
                      لا توجد تبرعات مؤكدة خلال هذا العام
                    </td>
                  </tr>
                ) : (
                  donations.map((d: any, idx: number) => (
                    <tr>
                      <td>{idx + 1}</td>
                      <td>{d.created_at ? new Date(d.created_at).toLocaleDateString('ar-EG') : '—'}</td>
                      <td>{d.case_title || d.campaign_title || d.donation_purpose || 'الصندوق العام'}</td>
                      <td>{d.payment_method || 'تحويل'}</td>
                      <td>{d.receipt_number || '—'}</td>
                      <td style="font-weight:800">{Number(d.amount).toLocaleString('ar-EG')}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {donations.length > 0 && (
                <tfoot>
                  <tr>
                    <td colspan={5} style="text-align:left; font-weight:900">
                      الإجمالي الكلي للتبرعات المؤكدة:
                    </td>
                    <td style="font-weight:900; color:var(--ds-forest)">
                      {totalAmount.toLocaleString('ar-EG')} ج.م
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Grand Total Summary */}
          <div class="stmt-summary-card">
            <div class="total-label">إجمالي عطاءاتك المؤكدة خلال عام {year}</div>
            <div class="total-val">{totalAmount.toLocaleString('ar-EG')} جنيه</div>
            <div class="total-words">فقط {tafqeet(totalAmount)} لا غير</div>
          </div>

          {/* Appreciation Note */}
          <div style="text-align:center; margin-bottom:20px; position:relative; z-index:1">
            <p style="font-family:'Aref Ruqaa',serif; font-size:1.05rem; color:var(--ds-forest); font-weight:700; line-height:1.8">
              «مَنْ تَصَدَّقَ بِعَدْلِ تَمْرَةٍ مِنْ كَسْبٍ طَيِّبٍ — وَلَا يَقْبَلُ اللَّهُ إِلَّا الطَّيِّبَ — فَإِنَّ اللَّهَ يَتَقَبَّلُهَا بِيَمِينِهِ»
            </p>
            <p style="font-size:0.82rem; color:#888; margin-top:8px">
              تشهد إدارة المؤسسة بأن المبالغ أعلاه قد وردت وتم توظيفها في مصارفها الشرعية والإنسانية المعتمدة.
            </p>
          </div>

          {/* Signatures */}
          <div class="stmt-signature-section">
            <div class="sig-block">
              <div class="sig-label">المدير التنفيذي</div>
              <div class="sig-line"></div>
              <div class="sig-name">إدارة المؤسسة</div>
              <div class="sig-title">مؤسسة الدكتور عمر هشام الخيرية</div>
            </div>
            <div class="sig-block">
              <div class="sig-label">الختم الرسمي</div>
              <div class="official-seal" style="position:relative; bottom:auto; left:auto; transform:none">
                <span class="seal-top">مؤسسة</span>
                <span class="seal-main">د. عمر هشام</span>
                <span class="seal-bottom">3115 / 2026</span>
              </div>
            </div>
            <div class="sig-block">
              <div class="sig-label">المسؤول المالي</div>
              <div class="sig-line"></div>
              <div class="sig-name">القسم المالي</div>
              <div class="sig-title">إدارة شؤون التبرعات</div>
            </div>
          </div>

          {/* Footer */}
          <div class="stmt-footer">
            <span>كود الكشف: {statementCode}</span>
            <span>صادر بتاريخ: {issueDate}</span>
            <span>هذا المستند آلي ولا يحتاج لتوقيع ممسوح</span>
          </div>
        </div>

        {/* Download as Image Script */}
        <script dangerouslySetInnerHTML={{ __html: `
          // Print shortcut
          document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
              // Allow default print
            }
          });
        ` }} />
      </body>
    </html>
  )
}
