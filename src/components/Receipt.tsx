/**
 * صفحة إيصال التبرع — Printable Donation Receipt
 * ===============================================
 *
 * قرار معماري: هذه الصفحة **لا** تستخدم Layout المشترك.
 *
 * السبب: Layout يحمل شاشة تحميل (preloader)، ومؤشر فأرة مخصص، وطبقة
 * تشويش (noise)، وهيدر، وفوتر، وشريط تنقل سفلي للموبايل. كل ذلك مناسب
 * لموقع تسويقي وغير مناسب لمستند مالي يُطبع ويُقدَّم لمراجع أو جهة رقابية.
 * المستند المطبوع يجب أن يحتوي على المعلومة المالية فقط.
 *
 * الأنماط مكتوبة inline داخل <style> وليست في ملف خارجي، حتى لا تعتمد
 * الطباعة على نجاح تحميل ملف CSS — لو فشل التحميل يطبع المستخدم ورقة
 * بلا تنسيق، وهذا غير مقبول في مستند مالي.
 */

import { formatMoney, amountInWords, receiptPath } from '../lib/receipts'

export { receiptPath }

/* بيانات المؤسسة الرسمية — تظهر على المستند لأنه مستند رسمي */
const ORG = {
  name: 'مؤسسة الدكتور عمر هشام الخيرية',
  registration: '3115 لسنة 2026',
  supervisor: 'وزارة التضامن الاجتماعي',
  address: 'كفر العنانية، مركز أجا، الدقهلية، جمهورية مصر العربية',
  site: 'omarhesham.org',
}

const C = {
  green: '#0c4a3f',
  emerald: '#168a70',
  gold: '#c9a227',
  ink: '#1f2937',
  muted: '#6b7280',
  line: '#e5e7eb',
}

/**
 * أنماط المستند.
 *
 * print-color-adjust: exact ضروري لأن المتصفحات تحذف الخلفيات الملونة
 * افتراضيًا عند الطباعة، فيفقد المستند ترويسته وهويته.
 */
const styles = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    margin: 0; padding: 24px 16px;
    font-family: 'Tajawal', 'Cairo', 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #eef1f0; color: ${C.ink};
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .sheet {
    max-width: 820px; margin: 0 auto; background: #fff; position: relative;
    border-radius: 14px; overflow: hidden;
    box-shadow: 0 10px 40px rgba(12,74,63,.14);
  }
  .top {
    background: linear-gradient(135deg, ${C.green} 0%, ${C.emerald} 100%);
    color: #fff; padding: 26px 30px;
    display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;
  }
  .org-name { font-size: 22px; font-weight: 800; margin: 0 0 6px; line-height: 1.3; }
  .org-meta { font-size: 12px; opacity: .9; line-height: 1.7; margin: 0; }
  .doc-badge {
    background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.3);
    border-radius: 10px; padding: 12px 16px; text-align: center; flex-shrink: 0;
  }
  .doc-badge .label { font-size: 11px; opacity: .85; display: block; margin-bottom: 4px; }
  .doc-badge .num { font-size: 16px; font-weight: 800; letter-spacing: .5px; direction: ltr; }
  .body { padding: 28px 30px 12px; position: relative; z-index: 1; }
  h1.title {
    font-size: 19px; margin: 0 0 4px; color: ${C.green};
    text-align: center; font-weight: 800;
  }
  .subtitle {
    text-align: center; color: ${C.muted}; font-size: 12.5px;
    margin: 0 0 22px; padding-bottom: 14px; border-bottom: 2px dashed ${C.line};
  }
  .amount-box {
    background: #f0faf7; border: 1px solid #c9e9df;
    border-right: 5px solid ${C.emerald};
    border-radius: 10px; padding: 18px 20px; margin: 0 0 22px; text-align: center;
  }
  .amount-box .cap { font-size: 12px; color: ${C.muted}; margin-bottom: 6px; }
  .amount-box .val { font-size: 30px; font-weight: 800; color: ${C.green}; line-height: 1.2; }
  .amount-box .cur { font-size: 15px; font-weight: 600; }
  .amount-box .words {
    margin-top: 10px; padding-top: 10px; border-top: 1px solid #d7ece5;
    font-size: 13.5px; color: ${C.ink}; font-weight: 600; line-height: 1.8;
  }
  table.rows { width: 100%; border-collapse: collapse; margin: 0 0 20px; font-size: 13.5px; }
  table.rows th, table.rows td {
    padding: 10px 12px; border-bottom: 1px solid ${C.line};
    text-align: right; vertical-align: top;
  }
  table.rows th { color: ${C.muted}; font-weight: 600; width: 38%; background: #fafbfb; }
  table.rows td { color: ${C.ink}; font-weight: 600; }
  table.rows tr:last-child th, table.rows tr:last-child td { border-bottom: none; }
  .mono { direction: ltr; display: inline-block; font-family: ui-monospace, monospace; }
  /*
    الختم المائي.

    z-index أعلى من .body وليس أقل: خلايا الجدول لها خلفيات معتمة
    (#fafbfb) فلو كان الختم تحتها لظهر مقطّعًا بين الصفوف بدل أن يكون
    ختمًا متصلًا. لأنه بشفافية 8% فوق النص فهو لا يعيق القراءة، مع
    pointer-events: none حتى لا يمنع تحديد النص أو نسخه.

    max-width يمنع تجاوز الختم لحدود الورقة على الشاشات الضيقة.

    ملاحظة تحقّق: قيست حدود نص الختم في متصفح حقيقي (342→557) وهي داخل
    حدود الورقة (40→860)، و scrollWidth = clientWidth أي لا فائض داخلي،
    فالختم غير مقطوع. ما قد يبدو انقطاعًا هو تباين فقط: عند 8% يكاد
    يختفي فوق الصفوف البيضاء ويظهر فوق الخلايا المظلّلة.
  */
  .stamp {
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%) rotate(-20deg);
    border: 5px double ${C.emerald}; color: ${C.emerald};
    opacity: .08; font-size: 40px; font-weight: 800; letter-spacing: 2px;
    padding: 16px 44px; border-radius: 14px; white-space: nowrap;
    max-width: 90%; text-align: center;
    pointer-events: none; user-select: none; z-index: 5;
  }
  .verify {
    background: #fbfaf5; border: 1px solid #ece5c9; border-radius: 10px;
    padding: 14px 16px; margin: 0 0 18px; font-size: 12.5px; line-height: 1.9;
  }
  .verify .vt { font-weight: 800; color: ${C.gold}; display: block; margin-bottom: 4px; }
  .verify a { color: ${C.emerald}; word-break: break-all; }
  .foot {
    border-top: 2px solid ${C.line}; margin-top: 6px;
    padding: 18px 30px 24px; font-size: 11.5px; color: ${C.muted};
    line-height: 1.9; text-align: center;
  }
  .sign-row {
    display: flex; justify-content: space-between; gap: 30px;
    margin: 26px 0 6px; padding: 0 30px;
  }
  .sign-box { flex: 1; text-align: center; font-size: 12px; color: ${C.muted}; }
  .sign-line { border-top: 1.5px solid ${C.ink}; margin-bottom: 6px; padding-top: 0; }
  .actions {
    max-width: 820px; margin: 18px auto 0;
    display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
  }
  .btn {
    background: ${C.green}; color: #fff; border: none; cursor: pointer;
    padding: 11px 22px; border-radius: 9px; font-size: 14px; font-weight: 700;
    font-family: inherit; text-decoration: none; display: inline-block;
  }
  .btn.ghost { background: #fff; color: ${C.green}; border: 1.5px solid ${C.green}; }

  /* شاشات صغيرة */
  @media (max-width: 560px) {
    body { padding: 12px 8px; }
    .top { flex-direction: column; padding: 20px; }
    .doc-badge { width: 100%; }
    .body { padding: 20px 18px 10px; }
    .amount-box .val { font-size: 24px; }
    .sign-row { flex-direction: column; gap: 22px; padding: 0 18px; }
    .stamp { font-size: 28px; }
    table.rows th { width: 42%; }
  }

  /* الطباعة: A4 بهوامش مريحة، وإخفاء كل ما ليس جزءًا من المستند */
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { box-shadow: none; border-radius: 0; max-width: 100%; }
    .actions, .no-print { display: none !important; }
    /*
      الختم على الشاشة بشفافية 8% حتى لا يزاحم قراءة البيانات، لكن
      الطابعات تحوّل التدرجات إلى نقاط (halftone) وعند 8% قد تسقط النقاط
      تمامًا فيخرج الإيصال المطبوع بلا ختم — وهو موجود أصلًا كعلامة أصالة
      على نسخة ورقية. لذلك نرفعها للطباعة فقط إلى 12%: تظهر على الورق
      وتبقى خلف النص دون التأثير على وضوحه.
    */
    .stamp { opacity: .12; }
    @page { size: A4; margin: 14mm; }
  }
`

/** صف في جدول البيانات — يُحذف تلقائيًا لو كانت القيمة فارغة. */
const Row = ({ label, value, mono }: { label: string; value: unknown; mono?: boolean }) => {
  const v = String(value ?? '').trim()
  if (!v) return null
  return (
    <tr>
      <th>{label}</th>
      <td>{mono ? <span class="mono">{v}</span> : v}</td>
    </tr>
  )
}

const fmtDate = (iso: unknown): string => {
  if (!iso) return ''
  const d = new Date(String(iso))
  if (isNaN(d.getTime())) return ''
  return d.toLocaleString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'نقدًا',
  bank_transfer: 'تحويل بنكي',
  bank: 'تحويل بنكي',
  vodafone_cash: 'فودافون كاش',
  instapay: 'إنستاباي',
  fawry: 'فوري',
  card: 'بطاقة بنكية',
  other: 'أخرى',
}

const paymentLabel = (v: unknown): string => {
  const k = String(v ?? '').trim()
  if (!k) return ''
  return PAYMENT_LABELS[k] || k
}

/* ------------------------------------------------------------------ *
 * الإيصال — Receipt
 * ------------------------------------------------------------------ */

/**
 * الإيصال القابل للطباعة.
 *
 * يعرض المبلغ رقمًا وكتابةً معًا: التفقيط هو الحماية القياسية ضد
 * التلاعب، لأن إضافة صفر إلى رقم سهلة أما تغيير الكتابة فلا.
 */
export const Receipt = ({ donation, verifyUrl }: { donation: any; verifyUrl: string }) => {
  const snap = donation?.receipt_snapshot || {}
  const amount = snap.amount ?? donation?.amount ?? 0
  const number = donation?.receipt_number || ''

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* لا يُفهرس: مستند مالي يحمل بيانات متبرع شخصية */}
        <meta name="robots" content="noindex,nofollow,noarchive" />
        <title>إيصال تبرع {number} — {ORG.name}</title>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        <div class="sheet">
          <div class="top">
            <div>
              <p class="org-name">{ORG.name}</p>
              <p class="org-meta">
                مؤسسة أهلية مشهرة برقم {ORG.registration}
                <br />
                خاضعة لإشراف {ORG.supervisor}
              </p>
            </div>
            <div class="doc-badge">
              <span class="label">رقم الإيصال</span>
              <span class="num">{number}</span>
            </div>
          </div>

          <div class="body">
            {/*
              داخل .body لا خارجها: التمركز يكون على متن المستند نفسه،
              فلا يزيح الهيدر والفوتر الختم عن مركز المحتوى.
            */}
            <div class="stamp">تبرع مستلم</div>

            <h1 class="title">إيصال استلام تبرع</h1>
            <p class="subtitle">هذا المستند إثبات رسمي لاستلام المؤسسة للمبلغ المذكور أدناه</p>

            <div class="amount-box">
              <div class="cap">المبلغ المستلم</div>
              <div class="val">
                {formatMoney(amount)} <span class="cur">جنيه مصري</span>
              </div>
              <div class="words">{amountInWords(amount)}</div>
            </div>

            <table class="rows">
              <tbody>
                <Row label="اسم المتبرع" value={snap.donor_name || donation?.donor_name} />
                <Row label="رقم الهاتف" value={snap.donor_phone || donation?.donor_phone} mono />
                <Row label="البريد الإلكتروني" value={snap.donor_email || donation?.donor_email} mono />
                <Row label="أُنفق في" value={snap.campaign_title} />
                <Row label="طريقة الدفع" value={paymentLabel(snap.payment_method)} />
                <Row label="تاريخ التبرع" value={fmtDate(snap.donated_at)} />
                <Row label="تاريخ إصدار الإيصال" value={fmtDate(donation?.receipt_issued_at)} />
              </tbody>
            </table>

            <div class="verify">
              <span class="vt">التحقق من صحة هذا الإيصال</span>
              يمكن لأي جهة التأكد من صحة هذا الإيصال عبر الرابط التالي:
              <br />
              <a href={verifyUrl}>{verifyUrl}</a>
            </div>
          </div>

          <div class="sign-row">
            <div class="sign-box">
              <div class="sign-line"></div>
              المسؤول المالي
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              ختم المؤسسة
            </div>
          </div>

          <div class="foot">
            {ORG.address}
            <br />
            {ORG.site}
            <br />
            <br />
            جزاكم الله خيرًا — صدقتكم أمانة نحفظها ونوصلها لمستحقيها.
            <br />
            هذا الإيصال صادر إلكترونيًا ومسجّل لدى المؤسسة برقمه التسلسلي أعلاه.
          </div>
        </div>

        <div class="actions">
          <button type="button" class="btn" id="print-btn">
            طباعة الإيصال
          </button>
          <a class="btn ghost" href="/">
            العودة للموقع
          </a>
        </div>

        {/*
          مستمع حدث وليس onclick مباشرًا: سياسة أمان المحتوى (CSP) في
          هذا المشروع تمنع معالجات الأحداث المضمّنة في السمات.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.getElementById('print-btn').addEventListener('click',function(){window.print()});`,
          }}
        />
      </body>
    </html>
  )
}

/* ------------------------------------------------------------------ *
 * صفحة التحقق — Public verification
 * ------------------------------------------------------------------ */

/**
 * صفحة التحقق العامة.
 *
 * قرار خصوصية مهم: هذه الصفحة **لا تعرض هاتف المتبرع ولا بريده**.
 * التحقق من أن المؤسسة أصدرت إيصالًا بمبلغ معيّن حق عام يخدم الشفافية،
 * أما البيانات الشخصية للمتبرع فليست كذلك. نعرض القدر الذي يثبت صحة
 * المستند فقط.
 */
export const ReceiptVerification = ({
  valid,
  donation,
  reason,
}: {
  valid: boolean
  donation?: any
  reason?: string
}) => {
  const snap = donation?.receipt_snapshot || {}
  const amount = snap.amount ?? donation?.amount ?? 0

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex,nofollow" />
        <title>{valid ? 'إيصال صحيح' : 'تعذّر التحقق'} — {ORG.name}</title>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        <div class="sheet">
          <div class="top">
            <div>
              <p class="org-name">{ORG.name}</p>
              <p class="org-meta">
                مؤسسة أهلية مشهرة برقم {ORG.registration}
                <br />
                خاضعة لإشراف {ORG.supervisor}
              </p>
            </div>
          </div>

          <div class="body">
            {valid ? (
              <>
                <div
                  class="amount-box"
                  style="background:#f0faf7;border-color:#c9e9df;border-right-color:#168a70;"
                >
                  <div style="font-size:34px;line-height:1;margin-bottom:8px;">✓</div>
                  <h1 class="title" style="margin-bottom:6px;">
                    هذا الإيصال صحيح وصادر عن المؤسسة
                  </h1>
                  <div class="cap" style="color:#6b7280;font-size:12.5px;">
                    تم التحقق من التوقيع الرقمي للإيصال بنجاح
                  </div>
                </div>

                <table class="rows">
                  <tbody>
                    <Row label="رقم الإيصال" value={donation?.receipt_number} mono />
                    <Row label="اسم المتبرع" value={snap.donor_name || donation?.donor_name} />
                    <Row label="المبلغ" value={`${formatMoney(amount)} جنيه مصري`} />
                    <Row label="المبلغ كتابةً" value={amountInWords(amount)} />
                    <Row label="أُنفق في" value={snap.campaign_title} />
                    <Row label="تاريخ التبرع" value={fmtDate(snap.donated_at)} />
                    <Row label="تاريخ الإصدار" value={fmtDate(donation?.receipt_issued_at)} />
                  </tbody>
                </table>

                <div class="verify">
                  حماية لخصوصية المتبرعين، لا تُعرض بيانات الاتصال في صفحة التحقق العامة.
                </div>
              </>
            ) : (
              <>
                <div
                  class="amount-box"
                  style="background:#fef4f4;border-color:#f3d1d1;border-right-color:#c0392b;"
                >
                  <div style="font-size:34px;line-height:1;margin-bottom:8px;">✕</div>
                  <h1 class="title" style="color:#c0392b;margin-bottom:6px;">
                    تعذّر التحقق من هذا الإيصال
                  </h1>
                  <div style="color:#6b7280;font-size:12.5px;">
                    {reason || 'الرقم أو رابط التحقق غير صحيح.'}
                  </div>
                </div>
                <p style="font-size:13.5px;line-height:2;color:#1f2937;">
                  إذا كنت تحمل إيصالًا ورقيًا وتعتقد أن هناك خطأً، تواصل مع المؤسسة وسنراجع
                  الأمر. لا يعني ظهور هذه الرسالة بالضرورة أن الإيصال مزيّف — قد يكون الرابط
                  ناقصًا أو منسوخًا بشكل غير كامل.
                </p>
              </>
            )}
          </div>

          <div class="foot">
            {ORG.address}
            <br />
            {ORG.site}
          </div>
        </div>

        <div class="actions">
          <a class="btn" href="/contact">
            تواصل مع المؤسسة
          </a>
          <a class="btn ghost" href="/">
            العودة للموقع
          </a>
        </div>
      </body>
    </html>
  )
}
