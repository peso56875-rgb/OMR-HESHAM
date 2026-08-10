/**
 * إيصالات التبرع — Donation Receipts
 * ===================================
 *
 * مؤسسة الدكتور عمر هشام الخيرية مسجلة لدى وزارة التضامن الاجتماعي برقم 3115/2026،
 * ومن ثم فإن إيصال التبرع ليس رسالة شكر بل مستند مالي قابل للمراجعة.
 * القرارات التالية مبنية على هذا الأساس:
 *
 * 1) الترقيم تسلسلي سنوي (REC-2026-000001) وليس معرّفًا عشوائيًا.
 *    السبب: المراجع المالي يحتاج أن يثبت عدم وجود فجوات أو تكرار. المعرّف
 *    العشوائي من Firestore لا يمكن إثبات اكتماله، أما التسلسل فيمكن.
 *
 * 2) لا يُصدر إيصال إلا للتبرعات المؤكدة (completed).
 *    السبب: إصدار مستند مالي لمبلغ لم يُستلم فعليًا هو خطأ محاسبي جوهري.
 *
 * 3) الإيصال يحتفظ بنسخة (snapshot) من بيانات التبرع لحظة الإصدار.
 *    السبب: لو أعاد المسؤول تسمية حملة بعد شهور، لا يجوز أن يتغير مستند
 *    مالي صادر بالفعل. المستند المالي ثابت بعد إصداره.
 *
 * 4) روابط الإيصالات موقّعة بـ HMAC-SHA256.
 *    السبب: الأرقام التسلسلية قابلة للتعداد (REC-2026-000001, ...000002).
 *    بدون توقيع يستطيع أي شخص المرور على كل الأرقام وقراءة اسم المتبرع
 *    وهاتفه ومبلغه. التوقيع يجعل الرابط غير قابل للتخمين.
 *
 * ملاحظة تقنية: نستخدم WebCrypto (crypto.subtle) وليس مكتبة خارجية، لأن
 * Vercel لا يشغّل npm install للدوال المبنية مسبقًا، فكل تبعية جديدة يجب
 * نسخها يدويًا. WebCrypto متاح أصلًا في Node 22 وفي Workers.
 */

const PREFIX = 'REC'
const SEQ_WIDTH = 6

const glob: any = globalThis as any

/* ------------------------------------------------------------------ *
 * التوقيع — Signing
 * ------------------------------------------------------------------ */

/**
 * يقرأ سر التوقيع من البيئة. يتبع نفس نمط getFirebaseAdminApp:
 * c.env أولًا (Workers) ثم process.env (Node).
 */
const getSigningSecret = (c?: any): string => {
  const env = c?.env || {}
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env || {} : {}

  const explicit = env.RECEIPT_SECRET || procEnv.RECEIPT_SECRET || ''
  if (explicit) return explicit

  // اشتقاق من مفتاح Firebase كحل احتياطي. نستخدم بادئة حتى لا يكون
  // التوقيع مشتقًا مباشرة من المفتاح — تسريب توقيع إيصال لا يجب أن
  // يقترب من مفتاح الخدمة.
  const derived = env.FIREBASE_PRIVATE_KEY || procEnv.FIREBASE_PRIVATE_KEY || ''
  if (derived) return `receipt-v1:${derived}`

  console.warn('[receipts] no RECEIPT_SECRET and no FIREBASE_PRIVATE_KEY — using an INSECURE dev secret')
  return 'insecure-development-secret'
}

const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

/**
 * يوقّع رقم إيصال. النتيجة 20 حرفًا سداسيًا (80 بت) — كافية أمنيًا
 * وتحافظ على قابلية نسخ الرابط ومشاركته.
 */
export const signReceipt = async (receiptNumber: string, c?: any): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSigningSecret(c)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`receipt:${receiptNumber}`))
  return toHex(sig).slice(0, 20)
}

/**
 * مقارنة نصين بزمن ثابت.
 *
 * المقارنة العادية (===) تتوقف عند أول حرف مختلف، فيصبح زمن الرد
 * مؤشرًا على عدد الأحرف الصحيحة، ويمكن نظريًا تخمين التوقيع حرفًا حرفًا.
 * هنا نجمع الفروق بـ XOR على كل الأحرف فيكون الزمن ثابتًا.
 */
export const constantTimeEqual = (a: string, b: string): boolean => {
  if (!a || !b || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/**
 * تحقق من توقيع الإيصال.
 *
 * الترتيب مقصود: يُقارَن التوقيع المُرسل أولًا بالتوقيع *المخزَّن* في
 * المستند، ولا يُعاد حسابه من المفتاح إلا إن لم يكن مخزَّنًا.
 *
 * لماذا؟ لأن إعادة الحساب وحدها تربط صلاحية الرابط ببقاء المفتاح كما هو،
 * فأي تدوير للمفتاح (أو فقدانه عند تغيير البيئة) يقتل كل روابط الإيصالات
 * الصادرة للمتبرعين — وقد حدث هذا فعلًا في بيئة التطوير: أُعيد توليد
 * RECEIPT_SECRET فتوقّف إيصال صادر عن التحقق رغم أن توقيعه المخزَّن سليم.
 *
 * التوقيع المخزَّن هو المرجع لأنه صدر لحظة إنشاء المستند المالي؛ وإعادة
 * الحساب تبقى كخطة بديلة للمستندات القديمة التي لا تحمل توقيعًا مخزَّنًا.
 * أمان المقارنة لا يتغيّر: كلتا الحالتين تستخدمان مقارنة ثابتة الزمن.
 */
export const verifyReceiptToken = async (
  receiptNumber: string,
  token: string,
  c?: any,
  storedToken?: string
): Promise<boolean> => {
  if (!receiptNumber || !token) return false
  if (storedToken) return constantTimeEqual(storedToken, token)
  return constantTimeEqual(await signReceipt(receiptNumber, c), token)
}

/* ------------------------------------------------------------------ *
 * الترقيم — Numbering
 * ------------------------------------------------------------------ */

/**
 * يولّد رقم الإيصال التالي بشكل ذرّي (atomic).
 *
 * العدّاد محفوظ في counters/receipts-YYYY ويُزاد داخل transaction، فلو
 * أكّد مسؤولان تبرعين في نفس اللحظة لا يحصلان على نفس الرقم.
 *
 * تنبيه: Firestore لا يسمح بتداخل الـ transactions، لذا يجب استدعاء هذه
 * الدالة *قبل* أي transaction أخرى وليس داخلها.
 */
export const mintReceiptNumber = async (db: any, when: Date = new Date()): Promise<string> => {
  const year = when.getFullYear()
  const counterRef = db.collection('counters').doc(`receipts-${year}`)

  const seq: number = await db.runTransaction(async (tx: any) => {
    const snap = await tx.get(counterRef)
    const current = snap.exists ? Number(snap.data()?.value || 0) : 0
    const next = current + 1
    tx.set(counterRef, { value: next, year, updated_at: when.toISOString() }, { merge: true })
    return next
  })

  return `${PREFIX}-${year}-${String(seq).padStart(SEQ_WIDTH, '0')}`
}

/* ------------------------------------------------------------------ *
 * بناء الإيصال — Building
 * ------------------------------------------------------------------ */

export interface ReceiptSnapshot {
  receipt_number: string
  receipt_issued_at: string
  receipt_token: string
  receipt_snapshot: {
    donor_name: string
    donor_phone: string
    donor_email: string
    amount: number
    campaign_title: string
    payment_method: string
    donated_at: string
  }
}

/**
 * يبني الحقول التي تُدمج في مستند التبرع عند الإصدار.
 * النسخة (snapshot) مقصودة: المستند المالي لا يتغير بعد إصداره.
 */
export const buildReceipt = async (
  db: any,
  donation: any,
  c?: any,
  when: Date = new Date()
): Promise<ReceiptSnapshot> => {
  const receipt_number = await mintReceiptNumber(db, when)
  const receipt_token = await signReceipt(receipt_number, c)

  return {
    receipt_number,
    receipt_issued_at: when.toISOString(),
    receipt_token,
    receipt_snapshot: {
      donor_name: donation?.donor_name || donation?.name || 'متبرع',
      donor_phone: donation?.donor_phone || donation?.phone || '',
      donor_email: donation?.donor_email || donation?.email || '',
      amount: Number(donation?.amount || 0),
      campaign_title: donation?.campaign_title || donation?.campaign_name || 'تبرع عام',
      payment_method: donation?.payment_method || 'غير محدد',
      donated_at: donation?.created_at || donation?.donated_at || when.toISOString(),
    },
  }
}

/** مسار عرض الإيصال مع توقيعه. */
export const receiptPath = (receiptNumber: string, token: string): string =>
  `/receipt/${encodeURIComponent(receiptNumber)}?t=${encodeURIComponent(token)}`

/* ------------------------------------------------------------------ *
 * تنسيق المبالغ — Money formatting
 * ------------------------------------------------------------------ */

/**
 * يصيغ المبلغ بالأرقام اللاتينية (15,000.25) لا العربية (١٥٬٠٠٠٫٢٥).
 *
 * استثناء مقصود عن بقية الموقع الذي يستخدم الأرقام العربية، والسبب
 * مُتحقَّق منه بصريًا في متصفح حقيقي وليس افتراضًا:
 * الفاصل العشري العربي U+066B يُرسم قريبًا جدًا من حرف "ر"، وفاصل
 * الآلاف U+066C يُرسم كفاصلة عليا، فيُقرأ "١٥٬٠٠٠٫٢٥" بصريًا كأنه
 * "١٥'٠٠٠ر٢٥" — وهي قراءة ملتبسة.
 *
 * الالتباس في رقم عادي على الموقع مقبول، أما في مستند مالي رسمي يُقدَّم
 * لمراجع أو جهة رقابية فغير مقبول: المبلغ هو الحقل الذي لا يجوز أن
 * يحتمل أكثر من قراءة واحدة.
 *
 * ملاحظة: التفقيط (amountInWords) يبقى بالعربية وهو الضمانة الأساسية.
 * الأرقام اللاتينية هنا لإزالة الالتباس لا للاستغناء عن التفقيط.
 */
export const formatMoney = (amount: unknown): string =>
  Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

/* ------------------------------------------------------------------ *
 * التفقيط — Amount in words
 * ------------------------------------------------------------------ *
 *
 * التفقيط إلزامي في المستندات المالية: الرقم "1000" يمكن تحويله إلى
 * "10000" بإضافة صفر، أما "ألف جنيه مصري" فلا.
 *
 * القواعد النحوية المطبّقة (تمييز العدد):
 *  - 1 و 2      : المعدود يتقدّم العدد    → "جنيه مصري واحد" / "جنيهان مصريان"
 *  - 3 إلى 10   : المعدود جمع مجرور        → "ثلاثة جنيهات مصرية"
 *  - 11 إلى 99  : المعدود مفرد منصوب       → "أحد عشر جنيهًا مصريًا"
 *  - 100 وأكثر  : المعدود مفرد مجرور       → "مائة جنيه مصري"
 *  - المضاف يحذف نون التثنية              → "مائتان ألف" ← "مائتا ألف"
 *  - كلمة الكمية في الإضافة تفقد التنوين   → "خمسة عشر ألفًا جنيه" ← "خمسة عشر ألف جنيه"
 */

const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة']
const TEENS = [
  'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر',
  'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر',
]
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون']
const HUNDREDS = [
  '', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة',
  'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة',
]

/** يفقّط رقمًا من 0 إلى 999. */
const under1000 = (n: number): string => {
  const parts: string[] = []
  const h = Math.floor(n / 100)
  const rest = n % 100

  if (h > 0) parts.push(HUNDREDS[h])

  if (rest > 0) {
    if (rest < 10) parts.push(ONES[rest])
    else if (rest < 20) parts.push(TEENS[rest - 10])
    else {
      const t = Math.floor(rest / 10)
      const o = rest % 10
      parts.push(o > 0 ? `${ONES[o]} و${TENS[t]}` : TENS[t])
    }
  }

  return parts.join(' و')
}

/**
 * يحذف نون التثنية عند الإضافة.
 * "مائتان ألف" خطأ — الصواب "مائتا ألف"، لأن المضاف تُحذف نونه.
 */
const dropDualNun = (s: string): string =>
  s
    .replace(/مائتان$/, 'مائتا')
    .replace(/ألفان$/, 'ألفا')
    .replace(/مليونان$/, 'مليونا')
    .replace(/ملياران$/, 'مليارا')
    .replace(/اثنان$/, 'اثنا')

/**
 * يصيغ وحدة الكمية (ألف/مليون/مليار) حسب عددها.
 * لاحظ أن ما بعد 10 يبقى مفردًا مجرورًا لأن الكلمة نفسها في محل إضافة،
 * فلا تُنوّن: "خمسة عشر ألف" وليس "خمسة عشر ألفًا".
 */
const scaleWord = (n: number, one: string, dual: string, plural: string): string => {
  if (n === 1) return one
  if (n === 2) return dual
  if (n <= 10) return `${under1000(n)} ${plural}`
  return `${dropDualNun(under1000(n))} ${one}`
}

/** يفقّط عددًا صحيحًا كاملًا. */
const integerInWords = (n: number): string => {
  if (n === 0) return 'صفر'

  const groups: string[] = []

  const milliards = Math.floor(n / 1_000_000_000)
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000)
  const thousands = Math.floor((n % 1_000_000) / 1000)
  const units = n % 1000

  if (milliards > 0) groups.push(scaleWord(milliards, 'مليار', 'مليارا', 'مليارات'))
  if (millions > 0) groups.push(scaleWord(millions, 'مليون', 'مليونا', 'ملايين'))
  if (thousands > 0) groups.push(scaleWord(thousands, 'ألف', 'ألفا', 'آلاف'))
  if (units > 0) groups.push(under1000(units))

  return groups.join(' و')
}

// [مفرد, مثنى, جمع, منصوب, مجرور]
const POUND = ['جنيه مصري', 'جنيهان مصريان', 'جنيهات مصرية', 'جنيهًا مصريًا', 'جنيه مصري']
const PIASTRE = ['قرش', 'قرشان', 'قروش', 'قرشًا', 'قرش']

/** يختار صيغة العملة حسب آخر جزء من العدد. */
const currencyForm = (tail: number, forms: string[]): string => {
  if (tail === 1) return forms[0]
  if (tail === 2) return forms[1]
  if (tail >= 3 && tail <= 10) return forms[2]
  if (tail >= 11 && tail <= 99) return forms[3]
  return forms[4]
}

/**
 * يضم العدد إلى وحدته مراعيًا تقدّم المعدود في 1 و 2.
 *
 * الحالة الدقيقة: العدد المركّب المنتهي بـ 1 أو 2 لا يعيد ذكر الوحدة.
 * "مائة وواحد جنيه مصري واحد" خطأ — الصواب "مائة وواحد جنيه مصري".
 */
const withUnit = (n: number, forms: string[]): string => {
  const tail = n % 100
  const words = integerInWords(n)

  if (n === 1) return `${forms[0]} ${ONES[1]}`
  if (n === 2) return forms[1]

  // عدد مركّب ينتهي بـ 1 أو 2 → الوحدة مجرورة مرة واحدة بلا تكرار
  if (tail === 1 || tail === 2) return `${words} ${forms[4]}`

  // إذا انتهى العدد بمضاعف كامل (tail === 0) فالكلمة الأخيرة مضافة إلى
  // الوحدة مباشرة، فتُحذف نون التثنية: "مائتان جنيه" ← "مائتا جنيه".
  //
  // نقصر هذا على tail === 0 تحديدًا: في مثل "مائة واثنان جنيه" تكون
  // "اثنان" معطوفة لا مضافة، فلا يجوز حذف نونها.
  if (tail === 0) return `${dropDualNun(words)} ${forms[4]}`

  return `${words} ${currencyForm(tail, forms)}`
}

/**
 * التفقيط الكامل للمبلغ بالجنيه المصري والقروش.
 * مثال: 15000.25 → "خمسة عشر ألف جنيه مصري وخمسة وعشرون قرشًا فقط لا غير"
 */
export const amountInWords = (amount: unknown): string => {
  const value = Number(amount || 0)
  if (!isFinite(value) || value < 0) return ''

  const pounds = Math.floor(value)
  // التقريب قبل الاستخراج يمنع أخطاء الفاصلة العائمة (0.145 → 14 بدل 15)
  const piastres = Math.round((value - pounds) * 100)

  // التقريب قد يرفع القروش إلى 100 فتصبح جنيهًا
  const finalPounds = piastres === 100 ? pounds + 1 : pounds
  const finalPiastres = piastres === 100 ? 0 : piastres

  const parts: string[] = []
  if (finalPounds > 0) parts.push(withUnit(finalPounds, POUND))
  if (finalPiastres > 0) parts.push(withUnit(finalPiastres, PIASTRE))

  if (parts.length === 0) return 'صفر جنيه مصري فقط لا غير'
  return `${parts.join(' و')} فقط لا غير`
}
