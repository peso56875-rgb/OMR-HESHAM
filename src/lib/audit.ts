/**
 * سجل التدقيق — Audit trail
 *
 * لماذا؟
 * المؤسسة مسجّلة لدى وزارة التضامن الاجتماعي (3115 لسنة 2026)، والإيصالات
 * تُثبت للمتبرع أن تبرعه وصل. لكن لا شيء كان يُثبت *للمراجع* من عدّل
 * السجلات المالية ومتى. بدون ذلك يمكن تغيير مبلغ تبرع أو حذف حالة أو
 * تعديل رصيد الخزنة دون أي أثر — وهذه أكبر ثغرة مساءلة متبقية.
 *
 * قرارات التصميم:
 *
 * 1) وسيط عام (middleware) لا نداء يدوي في كل نقطة نهاية:
 *    المشروع فيه 60 نقطة تعديل موزّعة على 17 وحدة. تعديلها يدويًا يعني
 *    أن أي نقطة جديدة ستُنسى بصمت، وهذا أخطر من عدم وجود سجل أصلًا لأنه
 *    يمنح ثقة زائفة. الوسيط يغطّي كل شيء تلقائيًا بما فيه ما يُضاف لاحقًا.
 *
 * 2) لا يُسجّل إلا العمليات الناجحة المُغيِّرة (2xx على POST/PUT/PATCH/DELETE):
 *    محاولة فاشلة (403/422) ليست تغييرًا في البيانات، وتسجيلها يُغرق
 *    السجل بضجيج يُخفي التغييرات الحقيقية.
 *
 * 3) الكتابة لا تُفشل الطلب أبدًا:
 *    لو تعطّل السجل فالأسوأ أن نفقد سطر تدقيق، لا أن نمنع الإدارة من
 *    عملها أو نُفشل تبرعًا. لذلك كل شيء داخل try/catch.
 *
 * 4) لا تُسجّل الحقول الحسّاسة:
 *    السجل قد يُصدَّر للمراجعة، فتنقية كلمات المرور والتوكنات إلزامية.
 *    كذلك لا يُسجّل توقيع الإيصال (receipt_token) لأنه مفتاح وصول فعلي.
 */

/** حقول لا تُكتب في السجل إطلاقًا — أسرار أو مفاتيح وصول. */
const REDACTED_KEYS = [
  'password',
  'newpassword',
  'currentpassword',
  'token',
  'idtoken',
  'accesstoken',
  'refreshtoken',
  'secret',
  'apikey',
  'api_key',
  'authorization',
  'receipt_token',
  'private_key',
  'firebase_private_key',
]

/** أقصى طول لقيمة نصية في السجل — يمنع تخزين محتوى ضخم مثل صور base64. */
const MAX_STR = 300

/**
 * تنقية جسم الطلب قبل التسجيل: تحجب الأسرار وتقصّ القيم الطويلة.
 * تعمل بشكل تعاودي على الكائنات والمصفوفات.
 */
export const sanitize = (value: unknown, depth = 0): unknown => {
  if (value === null || value === undefined) return value
  if (depth > 4) return '[عميق جدًا]'

  if (typeof value === 'string') {
    return value.length > MAX_STR ? `${value.slice(0, MAX_STR)}… (${value.length} حرفًا)` : value
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value

  if (Array.isArray(value)) {
    // نكتفي بأول 20 عنصرًا: الهدف إثبات ما تغيّر لا أرشفة الحمولة كاملة
    const out = value.slice(0, 20).map((v) => sanitize(v, depth + 1))
    if (value.length > 20) out.push(`… و${value.length - 20} عنصرًا آخر`)
    return out
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = REDACTED_KEYS.includes(k.toLowerCase()) ? '[محجوب]' : sanitize(v, depth + 1)
    }
    return out
  }
  return String(value)
}

/** استنتاج نوع العملية من طريقة HTTP. */
const actionFor = (method: string): string => {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'create'
    case 'PUT':
    case 'PATCH':
      return 'update'
    case 'DELETE':
      return 'delete'
    default:
      return method.toLowerCase()
  }
}

/**
 * استنتاج المورد والمعرّف من المسار.
 * مثال: /api/donations/status/abc123 → { resource: 'donations', id: 'abc123' }
 */
export const parseTarget = (path: string): { resource: string; id: string | null } => {
  const parts = path.split('/').filter(Boolean)
  const i = parts.indexOf('api')
  const rest = i >= 0 ? parts.slice(i + 1) : parts
  const resource = rest[0] || 'unknown'

  // آخر مقطع يُعتبر معرّف السجل، إلا لو كان كلمة فعل.
  //
  // القائمة دي مستخرجة من مسارات المشروع الفعلية لا من أفعال REST
  // العامة: المسارات هنا على نمط /add و /edit/:id و /delete/:id، مش
  // /campaigns و /campaigns/:id. أول نسخة كانت بتفترض النمط العام،
  // فسجّلت "add" كأنها معرّف سجل في أول عملية حقيقية اتعملت على
  // Firestore — وسجل تدقيق يشير لسجل غير موجود أسوأ من سجل بلا معرّف،
  // لأن المراجع هيحاول يتابعه.
  const VERBS = new Set([
    'add', 'edit', 'update', 'delete', 'status', 'role', 'clear-all',
    'income', 'expense', 'groups', 'validity', 'update-hours', 'apply',
    'public', 'session', 'toggle', 'approve', 'reject', 'publish',
    'feature', 'bulk', 'import'
  ])

  const last = rest[rest.length - 1] || ''
  const id = rest.length > 1 && !VERBS.has(last) ? last : null
  return { resource, id }
}

export interface AuditEntry {
  action: string
  resource: string
  target_id: string | null
  method: string
  path: string
  status: number
  actor_id: string | null
  actor_email: string | null
  actor_name: string | null
  payload: unknown
  ip: string | null
  user_agent: string | null
  created_at: string
}

/**
 * كتابة سطر في سجل التدقيق. لا ترمي استثناءً أبدًا.
 * تُستدعى بعد نجاح العملية فقط.
 */
export const writeAudit = async (db: any, entry: AuditEntry): Promise<void> => {
  try {
    await db.collection('audit_logs').add(entry)
  } catch (err: any) {
    // فقدان سطر تدقيق أهون من إفشال عملية إدارية أو تبرع
    console.error('[audit] تعذّر كتابة سجل التدقيق:', err?.message || err)
  }
}

/**
 * الوسيط العام: يسجّل كل عملية تعديل ناجحة.
 * يُركَّب مرة واحدة على موجّه الـ API فيغطّي كل النقاط الحالية والمستقبلية.
 */
/**
 * الوسيط العام: يسجّل كل عملية تعديل ناجحة.
 *
 * getDb اختيارية لحقن قاعدة بيانات وهمية في الاختبارات: بدونها كان
 * الاختبار يستورد Firestore الحقيقية فيكتب صفوفًا تجريبية في بيانات
 * الإنتاج (حدث فعلًا وتطلّب تنظيفًا). الإنتاج لا يمرّر شيئًا فيستخدم
 * الاستيراد الفعلي.
 */
export const makeAuditMiddleware = (getDb?: (c: any) => any) => async (c: any, next: any) => {
  const reqMethod = c.req.method.toUpperCase()
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(reqMethod)

  // يُقرأ الجسم *قبل* المعالج: Hono يخزّن نتيجة c.req.json() مؤقتًا
  // (bodyCache) فالقراءة هنا لا تستهلك التيار ولا تمنع المعالج من قراءته.
  // القراءة بعد المعالج غير موثوقة لأن التيار قد يكون استُهلك بصيغة أخرى.
  let captured: unknown = undefined
  if (isMutation) {
    const ct = c.req.header('content-type') || ''
    // multipart يُستثنى: قد يحمل ملفات ضخمة، وقراءته هنا تكلفة بلا فائدة
    if (ct.includes('application/json')) {
      try {
        captured = await c.req.json()
      } catch {
        captured = undefined
      }
    }
  }

  await next()

  try {
    const method = reqMethod
    if (!isMutation) return

    const status = c.res?.status ?? 0
    // العمليات الفاشلة ليست تغييرًا في البيانات؛ تسجيلها يُغرق السجل بالضجيج
    if (status < 200 || status >= 300) return

    const path = c.req.path || ''
    // لا معنى لتسجيل تسجيل الدخول أو الاشتراك في النشرة كتغيير إداري
    if (path.includes('/auth/') || path.includes('/newsletter/subscribe')) return

    const user = c.get('user') || null
    const { resource, id } = parseTarget(path)

    const payload = captured === undefined ? null : sanitize(captured)

    let db: any
    if (getDb) {
      db = getDb(c)
    } else {
      const { getFirestore } = await import('./firebase-admin')
      db = getFirestore(c)
    }

    await writeAudit(db, {
      action: actionFor(method),
      resource,
      target_id: id,
      method,
      path,
      status,
      actor_id: user?.id || null,
      actor_email: user?.email || null,
      actor_name: user?.name || null,
      payload,
      ip:
        c.req.header('cf-connecting-ip') ||
        c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
        null,
      user_agent: (c.req.header('user-agent') || '').slice(0, 200) || null,
      created_at: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[audit] خطأ في وسيط التدقيق:', err?.message || err)
  }
}

/** الوسيط الجاهز للاستخدام في الإنتاج — يستخدم Firestore الحقيقية. */
export const auditMiddleware = makeAuditMiddleware()
