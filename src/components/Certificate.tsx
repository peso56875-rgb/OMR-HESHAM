import { icon } from './shared'
import type { Volunteer } from '../types'

export function CertificateView({
  volunteer,
  certCode,
  verificationUrl,
  isPublicVerification = false
}: {
  volunteer: Volunteer
  certCode: string
  verificationUrl: string
  isPublicVerification?: boolean
}) {
  const issueDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
  const hours = volunteer.hours_count || 30
  const rank = volunteer.rank || 'متطوع متميز'

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>شهادة تطوع وتقدير معتمدة | {volunteer.full_name} | مؤسسة الدكتور عمر هشام</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --cert-gold: #c59b27;
            --cert-gold-dark: #8c6d15;
            --cert-ink: #072722;
            --cert-forest: #0d4a3e;
            --cert-paper: #fcfbf7;
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
            color: var(--cert-ink);
          }
          .no-print-toolbar {
            width: 100%;
            max-width: 1050px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #ffffff;
            padding: 12px 24px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            margin-bottom: 24px;
          }
          .toolbar-info {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
            color: var(--cert-forest);
            font-weight: 700;
          }
          .toolbar-actions {
            display: flex;
            gap: 12px;
          }
          .cert-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 9px 18px;
            border-radius: 10px;
            font-size: 0.88rem;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            border: none;
            transition: all 0.2s;
          }
          .cert-btn-primary {
            background: var(--cert-forest);
            color: #ffffff;
          }
          .cert-btn-primary:hover {
            background: var(--cert-ink);
          }
          .cert-btn-outline {
            background: #f1f5f9;
            color: #334155;
          }
          .cert-btn-outline:hover {
            background: #e2e8f0;
          }

          /* The Certificate Frame */
          .certificate-sheet {
            width: 1050px;
            height: 742px; /* A4 Landscape aspect ratio */
            background: var(--cert-paper);
            position: relative;
            padding: 24px;
            box-shadow: 0 15px 50px rgba(0,0,0,0.15);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
          }
          .cert-border-outer {
            width: 100%;
            height: 100%;
            border: 3px solid var(--cert-gold);
            border-radius: 8px;
            padding: 10px;
            position: relative;
          }
          .cert-border-inner {
            width: 100%;
            height: 100%;
            border: 1px solid var(--cert-gold);
            border-radius: 6px;
            padding: 35px 50px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            position: relative;
            background: radial-gradient(circle at center, #ffffff 40%, #fbf8f0 100%);
          }
          .cert-watermark {
            position: absolute;
            width: 320px;
            opacity: 0.04;
            pointer-events: none;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          /* Corners */
          .corner-dec {
            position: absolute;
            width: 40px;
            height: 40px;
            border: 3px solid var(--cert-gold-dark);
          }
          .corner-tl { top: 6px; right: 6px; border-bottom: none; border-left: none; }
          .corner-tr { top: 6px; left: 6px; border-bottom: none; border-right: none; }
          .corner-bl { bottom: 6px; right: 6px; border-top: none; border-left: none; }
          .corner-br { bottom: 6px; left: 6px; border-top: none; border-right: none; }

          /* Header */
          .cert-header {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .cert-brand {
            display: flex;
            align-items: center;
            gap: 14px;
            text-align: right;
          }
          .cert-brand img { width: 55px; height: 55px; }
          .cert-brand h3 { font-size: 1.1rem; color: var(--cert-forest); margin: 0; }
          .cert-brand p { font-size: 0.75rem; color: #64748b; margin: 0; }
          .cert-license-tag {
            font-size: 0.72rem;
            color: var(--cert-gold-dark);
            border: 1px solid var(--cert-gold);
            padding: 4px 10px;
            border-radius: 999px;
            background: rgba(197, 155, 39, 0.08);
          }

          /* Main Title */
          .cert-main-title {
            margin-top: 10px;
          }
          .cert-main-title h1 {
            font-family: 'Aref Ruqaa', serif;
            font-size: 3.2rem;
            color: var(--cert-forest);
            letter-spacing: 0.05em;
            margin-bottom: 6px;
          }
          .cert-main-title p {
            font-size: 1.05rem;
            color: #475569;
          }

          /* Recipient Name */
          .cert-recipient {
            margin: 15px 0;
            width: 100%;
          }
          .cert-recipient h2 {
            font-family: 'Tajawal', sans-serif;
            font-size: 2.5rem;
            font-weight: 900;
            color: var(--cert-ink);
            border-bottom: 2px solid var(--cert-gold);
            display: inline-block;
            padding: 0 40px 10px;
          }

          /* Certificate Text */
          .cert-statement {
            font-size: 1.12rem;
            line-height: 1.8;
            color: #334155;
            max-width: 820px;
          }
          .cert-statement strong {
            color: var(--cert-forest);
          }

          /* Footer & Verification */
          .cert-footer {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px dashed rgba(197, 155, 39, 0.4);
          }
          .cert-sig-block {
            text-align: center;
          }
          .cert-sig-block p {
            font-size: 0.88rem;
            color: #64748b;
            margin-bottom: 12px;
          }
          .cert-sig-block b {
            font-size: 1.05rem;
            color: var(--cert-forest);
          }
          .cert-stamp-box {
            position: relative;
          }
          .cert-official-seal {
            width: 85px;
            height: 85px;
            border-radius: 50%;
            border: 2px dashed var(--cert-gold-dark);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--cert-gold-dark);
            font-size: 0.65rem;
            font-weight: 800;
            transform: rotate(-12deg);
            background: rgba(197, 155, 39, 0.05);
          }
          .cert-official-seal i { font-size: 1.5rem; margin-bottom: 2px; }

          .cert-qr-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }
          .qr-placeholder {
            width: 60px;
            height: 60px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            display: grid;
            place-items: center;
            font-size: 1.6rem;
            color: var(--cert-forest);
          }
          .cert-code-text {
            font-family: monospace;
            font-size: 0.72rem;
            font-weight: bold;
            color: #64748b;
            direction: ltr;
          }

          /* Print Styles */
          @media print {
            body {
              background: none;
              padding: 0;
            }
            .no-print-toolbar {
              display: none !important;
            }
            .certificate-sheet {
              box-shadow: none;
              border-radius: 0;
              width: 100vw;
              height: 100vh;
              page-break-inside: avoid;
            }
            @page {
              size: A4 landscape;
              margin: 0;
            }
          }
        `}} />
      </head>
      <body>
        <div class="no-print-toolbar">
          <div class="toolbar-info">
            <i class="fa-solid fa-circle-check" style="color:#10b981;font-size:1.2rem"></i>
            <span>شهادة تطوع رقمية موثقة ومعتمدة من مجلس إدارة المؤسسة</span>
          </div>
          <div class="toolbar-actions">
            <button type="button" class="cert-btn cert-btn-primary" onclick="window.print()">
              <i class="fa-solid fa-print"></i> طباعة / حفظ كـ PDF
            </button>
            <a href="/volunteer-portal" class="cert-btn cert-btn-outline">
              <i class="fa-solid fa-arrow-right"></i> عودة للبوابة
            </a>
          </div>
        </div>

        <div class="certificate-sheet">
          <div class="cert-border-outer">
            <div class="corner-dec corner-tl"></div>
            <div class="corner-dec corner-tr"></div>
            <div class="corner-dec corner-bl"></div>
            <div class="corner-dec corner-br"></div>

            <div class="cert-border-inner">
              <img class="cert-watermark" src="/static/foundation-logo.png" alt="" />

              {/* Header */}
              <div class="cert-header">
                <div class="cert-brand">
                  <img src="/static/foundation-logo.png" alt="الشعار" />
                  <div>
                    <h3>مؤسسة الدكتور عمر هشام الخيرية</h3>
                    <p>مشهرة برقم 3115 لسنة 2026 — وزارة التضامن الاجتماعي</p>
                  </div>
                </div>
                <div class="cert-license-tag">
                  <i class="fa-solid fa-award"></i> وثيقة تطوع رسمية
                </div>
              </div>

              {/* Title */}
              <div class="cert-main-title">
                <h1>شهادة شكر وتقدير واعتزاز</h1>
                <p>تُهدي إدارة مؤسسة الدكتور عمر هشام الخيرية هذه الشهادة تقديراً للجهود المخلصة</p>
              </div>

              {/* Recipient */}
              <div class="cert-recipient">
                <h2>{volunteer.full_name}</h2>
              </div>

              {/* Statement */}
              <p class="cert-statement">
                تقديراً لمشاركته الفاعلة وتفانيه الاستثنائي في دعم المبادرات الإنسانية والقوافل الميدانية للمؤسسة،
                واجتيازه بنجاح <strong>({hours} ساعة عمل تطوعي معتمد)</strong> برتبة <strong>({rank})</strong>،
                مما كان له عظيم الأثر في تفريج الكرب وإدخال السرور على قلوب الأسر المستحقة.
              </p>

              {/* Footer */}
              <div class="cert-footer">
                <div class="cert-sig-block">
                  <p>تاريخ الاعتماد والإصدار</p>
                  <b>{issueDate}</b>
                </div>

                <div class="cert-stamp-box">
                  <div class="cert-official-seal">
                    <i class="fa-solid fa-shield-heart"></i>
                    <span>ختم الاعتماد</span>
                    <small>3115 / 2026</small>
                  </div>
                </div>

                <div class="cert-sig-block">
                  <p>رئيس مجلس الأمناء</p>
                  <b>مؤسسة د. عمر هشام</b>
                </div>

                <div class="cert-qr-block">
                  <div class="qr-placeholder">
                    <i class="fa-solid fa-qrcode"></i>
                  </div>
                  <span class="cert-code-text">{certCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
