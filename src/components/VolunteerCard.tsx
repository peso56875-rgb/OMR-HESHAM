import { icon } from './shared'
import type { Volunteer } from '../types'

export function VolunteerCardView({
  volunteer
}: {
  volunteer: Volunteer
}) {
  const rank = volunteer.rank || 'متطوع مبادر'
  const code = volunteer.volunteer_code || `VOL-${(volunteer.id || '').slice(0, 6).toUpperCase()}`
  const joinDate = volunteer.approved_at
    ? new Date(volunteer.approved_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : '2026'
  const expiryDate = volunteer.expires_at
    ? new Date(volunteer.expires_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'صلاحية مفتوحة'
  const isExpired = Boolean(volunteer.expires_at && new Date(volunteer.expires_at) < new Date())
  const isRevoked = volunteer.status === 'revoked'

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>بطاقة هوية متطوع رسمية | {volunteer.full_name} | مؤسسة الدكتور عمر هشام</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --card-emerald-dark: #072722;
            --card-emerald: #0d4a3e;
            --card-gold: #c59b27;
            --card-gold-light: #f5d77f;
            --card-bg: #eef2f5;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Tajawal', sans-serif;
            background: var(--card-bg);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 30px 15px;
            color: #1e293b;
          }
          .card-toolbar {
            width: 100%;
            max-width: 460px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #ffffff;
            padding: 12px 18px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            margin-bottom: 24px;
          }
          .toolbar-actions {
            display: flex;
            gap: 10px;
            width: 100%;
            justify-content: center;
          }
          .action-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 9px 16px;
            border-radius: 10px;
            font-size: 0.85rem;
            font-weight: 800;
            cursor: pointer;
            text-decoration: none;
            border: none;
            transition: all 0.2s;
          }
          .btn-gold {
            background: linear-gradient(135deg, #c59b27, #8c6d15);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(197, 155, 39, 0.3);
          }
          .btn-gold:hover {
            background: linear-gradient(135deg, #a67f1b, #6b530c);
            transform: translateY(-1px);
          }
          .btn-primary {
            background: var(--card-emerald);
            color: #ffffff;
          }
          .btn-primary:hover {
            background: var(--card-emerald-dark);
          }
          .btn-outline {
            background: #f1f5f9;
            color: #334155;
          }

          /* The Volunteer Badge Frame */
          .id-badge-wrap {
            width: 440px;
            background: linear-gradient(145deg, #072722, #0d4a3e 70%, #051e1a);
            color: #ffffff;
            border-radius: 28px;
            padding: 26px 24px;
            box-shadow: 0 20px 50px rgba(7, 39, 34, 0.4);
            position: relative;
            overflow: hidden;
            border: 2px solid rgba(197, 155, 39, 0.45);
          }
          .badge-gold-accents {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #c59b27, #f5d77f, #c59b27);
          }
          .badge-watermark {
            position: absolute;
            width: 260px;
            opacity: 0.04;
            pointer-events: none;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
          .badge-topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .badge-brand {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .badge-brand img {
            width: 44px;
            height: 44px;
          }
          .badge-brand-text h4 {
            font-size: 0.95rem;
            font-weight: 900;
            color: #ffffff;
            margin: 0;
          }
          .badge-brand-text p {
            font-size: 0.65rem;
            color: #94a3b8;
            margin: 0;
          }
          .badge-official-tag {
            font-size: 0.68rem;
            font-weight: 800;
            color: var(--card-gold-light);
            border: 1px solid var(--card-gold);
            padding: 3px 9px;
            border-radius: 999px;
            background: rgba(197, 155, 39, 0.15);
          }

          .badge-avatar-center {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 16px;
            position: relative;
          }
          .badge-avatar-img {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            border: 4px solid #c59b27;
            box-shadow: 0 6px 20px rgba(0,0,0,0.35);
            object-fit: cover;
            background: #ffffff;
          }
          .badge-avatar-initials {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            border: 4px solid #c59b27;
            box-shadow: 0 6px 20px rgba(0,0,0,0.35);
            display: grid;
            place-items: center;
            font-size: 2.4rem;
            font-weight: 900;
            background: #0d4a3e;
            color: #c59b27;
          }
          .badge-name {
            font-size: 1.35rem;
            font-weight: 900;
            margin: 10px 0 4px;
            color: #ffffff;
            text-align: center;
          }
          .badge-rank-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.78rem;
            font-weight: 800;
            color: #f5d77f;
            background: rgba(197, 155, 39, 0.2);
            border: 1px solid rgba(197, 155, 39, 0.35);
            padding: 4px 14px;
            border-radius: 999px;
          }

          .badge-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.12);
            padding: 12px 14px;
            border-radius: 16px;
            margin-bottom: 16px;
          }
          .badge-info-cell span {
            font-size: 0.68rem;
            color: #94a3b8;
            display: block;
            margin-bottom: 2px;
          }
          .badge-info-cell b {
            font-size: 0.84rem;
            color: #ffffff;
          }

          .badge-footer-strip {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 12px;
            border-top: 1px dashed rgba(197, 155, 39, 0.3);
          }
          .badge-qr-box {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .badge-qr-icon {
            width: 44px;
            height: 44px;
            background: #ffffff;
            border-radius: 8px;
            display: grid;
            place-items: center;
            font-size: 1.5rem;
            color: var(--card-emerald);
          }
          .badge-seal-mini {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            text-align: left;
            color: #94a3b8;
            font-size: 0.65rem;
          }
          .badge-seal-mini strong {
            color: var(--card-gold-light);
            font-size: 0.72rem;
          }

          @media print {
            body { background: none; padding: 0; }
            .card-toolbar { display: none !important; }
            .id-badge-wrap {
              box-shadow: none;
              page-break-inside: avoid;
            }
          }
        `}} />
      </head>
      <body>
        <div class="card-toolbar">
          <div class="toolbar-actions">
            <button type="button" class="action-btn btn-gold" id="btn-download-card-png" onclick="downloadCardPNG()">
              <i class="fa-solid fa-download"></i> تحميل الكارنيه (PNG)
            </button>
            <button type="button" class="action-btn btn-primary" onclick="window.print()">
              <i class="fa-solid fa-print"></i> طباعة
            </button>
            <a href="/volunteer-portal" class="action-btn btn-outline">
              <i class="fa-solid fa-arrow-right"></i> البوابة
            </a>
          </div>
        </div>

        <div class="id-badge-wrap" id="volunteer-id-card-target">
          <div class="badge-gold-accents"></div>
          <img class="badge-watermark" src="/static/foundation-logo.png" alt="" />

          <div class="badge-topbar">
            <div class="badge-brand">
              <img src="/static/foundation-logo.png" alt="الشعار" />
              <div class="badge-brand-text">
                <h4>مؤسسة د. عمر هشام</h4>
                <p>إدارة العمل التطوعي الميداني</p>
              </div>
            </div>
            <span class="badge-official-tag">بطاقة هوية رسمية</span>
          </div>

          <div class="badge-avatar-center">
            {volunteer.avatar_url ? (
              <img src={volunteer.avatar_url} alt={volunteer.full_name} class="badge-avatar-img" />
            ) : (
              <div class="badge-avatar-initials">
                {volunteer.full_name?.split(' ')?.[0]?.[0] || 'م'}
              </div>
            )}
            <h3 class="badge-name">{volunteer.full_name}</h3>
            <span class="badge-rank-pill">{icon('fa-medal')} {rank}</span>
          </div>

          <div class="badge-info-grid">
            <div class="badge-info-cell">
              <span>كود المتطوع:</span>
              <b style="font-family:monospace; color:var(--card-gold-light); font-size:0.92rem">{code}</b>
            </div>
            <div class="badge-info-cell">
              <span>فريق العمل:</span>
              <b>{volunteer.team || volunteer.preferred_role || 'الفريق الميداني'}</b>
            </div>
            <div class="badge-info-cell">
              <span>المحافظة:</span>
              <b>{volunteer.city || 'الدقهلية'}</b>
            </div>
            <div class="badge-info-cell">
              <span>ساعات الخدمة:</span>
              <b style="color:#10b981">{volunteer.hours_count || 0} ساعة موثقة</b>
            </div>
            <div class="badge-info-cell">
              <span>تاريخ الانضمام:</span>
              <b>{joinDate}</b>
            </div>
            <div class="badge-info-cell">
              <span>صلاحية البطاقة:</span>
              <b style={`color:${isExpired || isRevoked ? '#ef4444' : '#10b981'}`}>{expiryDate}</b>
            </div>
          </div>

          <div class="badge-footer-strip">
            <div class="badge-qr-box">
              <div class="badge-qr-icon">
                <i class="fa-solid fa-qrcode"></i>
              </div>
              <div style="font-size:0.7rem; color:#94a3b8">
                <span style="display:block; color:#ffffff; font-weight:700">توثيق رقمي معتمد</span>
                <span style="font-family:monospace; font-size:0.65rem">{code}</span>
              </div>
            </div>

            <div class="badge-seal-mini">
              <strong>مشهرة برقم 3115 / 2026</strong>
              <span>وزارة التضامن الاجتماعي</span>
            </div>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          async function downloadCardPNG() {
            const btn = document.getElementById('btn-download-card-png');
            const card = document.getElementById('volunteer-id-card-target');
            if (!card) return;

            const originalHTML = btn ? btn.innerHTML : '';
            if (btn) {
              btn.disabled = true;
              btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التوليد...';
            }

            try {
              if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
              }

              const canvas = await html2canvas(card, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                logging: false,
                imageTimeout: 15000
              });

              const rawName = ${JSON.stringify(volunteer.full_name || 'volunteer')};
              const safeName = rawName.replace(/[\\\\/:*?"<>|\\r\\n]+/g, '-').trim() || 'volunteer';
              const filename = 'كارنيه-متطوع-' + safeName + '.png';

              const link = document.createElement('a');
              link.download = filename;
              link.href = canvas.toDataURL('image/png', 1.0);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-check"></i> تم التحميل!';
                setTimeout(() => {
                  btn.innerHTML = originalHTML;
                  btn.disabled = false;
                }, 2500);
              }
            } catch (err) {
              console.error('Error generating card image:', err);
              alert('تعذر تحميل الكارنيه كصورة، يمكنك استخدام زر الطباعة.');
              if (btn) {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
              }
            }
          }
        `}} />
      </body>
    </html>
  )
}
