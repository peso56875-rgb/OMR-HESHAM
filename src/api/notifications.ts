/**
 * واجهة مركز الإشعارات.
 *
 * قرارات معمارية مهمة:
 *
 * 1) الدمج على مستوى التطبيق لا الاستعلام.
 *    Firestore لا يدعم OR بين حقلين مختلفين، والمشرف يحتاج تدفّقين:
 *    إشعاراته الشخصية (user_id == uid) وإشعارات الإدارة العامة
 *    (audience == 'admins'). لذلك نُشغّل استعلامين متوازيين ونَدمج
 *    ونُرتّب في الذاكرة. البديل — نسخ كل إشعار إداري لكل مشرف — يضاعف
 *    الكتابات ويجعل عدد المشرفين يضرب في تكلفة كل حدث.
 *
 * 2) حالة القراءة مزدوجة المصدر.
 *    إشعار المستخدم الفردي يحمل is_read داخله (بسيط ورخيص).
 *    إشعار الإدارة مشترك بين عدة مشرفين فلا يصلح فيه حقل واحد: قراءة
 *    مشرف ليست قراءة الآخر. لذلك تُخزَّن حالته في notification_reads
 *    بمعرّف مركّب `${notifId}__${uid}` — قراءة مباشرة بلا استعلام.
 *
 * 3) الفشل يعطي قائمة فارغة لا خطأ 500.
 *    جرس الإشعارات عنصر ثانوي في كل صفحة؛ لو انقطع الفهرس أو تعطّل
 *    Firestore فالمقبول أن يظهر الجرس صفرًا لا أن تتحول كل صفحة إلى
 *    خطأ. الأخطاء تُسجَّل في اللوج للتشخيص.
 */

import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { authMiddleware, adminMiddleware, rateLimiter } from './middleware'
import {
  NOTIFICATION_TYPES,
  CATEGORY_LABELS,
  DEFAULT_PREFS,
  getPrefs,
  notify,
  notifyAdmins,
  typeDef,
  type NotificationCategory,
  type NotificationPriority,
  type NotificationPrefsDoc
} from '../lib/notifications'
import { registerToken, unregisterToken, isPushConfigured, getVapidKey, sendPushToUsers } from '../lib/push'

export const notifications = new Hono()

/** أقصى عدد إشعارات في الصفحة — يحمي الذاكرة والاستجابة. */
const MAX_LIMIT = 50
const DEFAULT_LIMIT = 20

/**
 * سقف العدّاد. لا معنى لعرض "٤٧٣ غير مقروء": نتوقف عند ١٠٠ ونعرض
 * "+٩٩". يوفّر قراءات Firestore ويمنع استعلامًا يزحف على آلاف الصفوف.
 */
const COUNT_CAP = 100

const readId = (notifId: string, uid: string) => `${notifId}__${uid}`

const currentUser = (c: any) => (c.get('user') || {}) as {
  id?: string
  email?: string
  name?: string
  role?: string
}

/* ────────────────────────── جلب التدفّق ────────────────────────── */

interface FeedItem {
  id: string
  type: string
  category: string
  title: string
  body: string
  link: string | null
  icon: string
  priority: string
  audience: string
  actor_name: string | null
  created_at: string
  is_read: boolean
  read_at: string | null
}

/**
 * يجلب التدفّق المدمج لمستخدم.
 * نسحب `limit` من كل تدفّق ثم نُرتّب ونقطع: لو سحبنا نصف الحد من كل
 * تدفّق لضاع عنصر أحدث موجود بكثافة في تدفّق واحد.
 */
const fetchFeed = async (
  db: any,
  uid: string,
  isAdmin: boolean,
  limit: number
): Promise<FeedItem[]> => {
  const queries: Promise<any>[] = []

  if (uid) {
    queries.push(
      db
        .collection('notifications')
        .where('user_id', '==', uid)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .get()
        .catch((e: any) => {
          console.error('[notifications] فشل استعلام المستخدم:', e?.message || e)
          return { docs: [] }
        })
    )
  }

  // استعلام الإشعارات والبلاغات العامة الموجهة للجميع
  queries.push(
    db
      .collection('notifications')
      .where('audience', '==', 'all')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get()
      .catch(() => ({ docs: [] }))
  )

  if (isAdmin) {
    queries.push(
      db
        .collection('notifications')
        .where('audience', '==', 'admins')
        .orderBy('created_at', 'desc')
        .limit(limit)
        .get()
        .catch((e: any) => {
          console.error('[notifications] فشل استعلام الإدارة:', e?.message || e)
          return { docs: [] }
        })
    )
  }

  if (!queries.length) return []

  const snaps = await Promise.all(queries)

  const rows: Array<{ id: string; data: any }> = []
  const seen = new Set<string>()
  for (const snap of snaps) {
    for (const doc of snap.docs || []) {
      if (seen.has(doc.id)) continue
      seen.add(doc.id)
      rows.push({ id: doc.id, data: doc.data() || {} })
    }
  }

  if (!rows.length) {
    const now = new Date()
    return [
      {
        id: 'welcome-quran',
        type: 'content',
        category: 'content',
        title: 'مصحف ومحراب المؤسسة المطور 📖',
        body: 'استمع للتلاوات الخاشعة بمختلف المقامات، وتصفح السور بالرسم العثماني، وتابع أذكارك ووردك اليومي.',
        link: '/quran',
        icon: 'fa-book-quran',
        priority: 'normal',
        audience: 'all',
        actor_name: 'مؤسسة د. عمر هشام',
        created_at: new Date(now.getTime() - 15 * 60000).toISOString(),
        is_read: false,
        read_at: null
      },
      {
        id: 'welcome-zakat',
        type: 'financial',
        category: 'financial',
        title: 'حاسبة الزكاة الذكية ✨',
        body: 'احسب زكاة مالك وذهبك وتجارتك بدقة وفق الضوابط الشرعية المعتمدة.',
        link: '/zakat-calculator',
        icon: 'fa-scale-balanced',
        priority: 'normal',
        audience: 'all',
        actor_name: 'إدارة الزكاة والصدقات',
        created_at: new Date(now.getTime() - 60 * 60000).toISOString(),
        is_read: false,
        read_at: null
      },
      {
        id: 'welcome-foundation',
        type: 'welcome',
        category: 'general',
        title: 'أهلاً بك في منصة مؤسسة د. عمر هشام الخيرية 🤝',
        body: 'نسعد بزيارتكم ونسأل الله أن يتقبل منا ومنكم صالح الأعمال والدعاء للمرحوم د. عمر هشام.',
        link: '/about',
        icon: 'fa-heart',
        priority: 'normal',
        audience: 'all',
        actor_name: 'مجلس الإدارة',
        created_at: new Date(now.getTime() - 120 * 60000).toISOString(),
        is_read: true,
        read_at: new Date().toISOString()
      }
    ].slice(0, limit)
  }

  rows.sort((a, b) =>
    String(b.data.created_at || '').localeCompare(String(a.data.created_at || ''))
  )
  const page = rows.slice(0, limit)

  // حالة القراءة لإشعارات الإدارة — قراءة دفعة واحدة بـ getAll
  const sharedIds = page.filter((r) => r.data.audience === 'admins').map((r) => r.id)
  const readMap = new Map<string, string | null>()

  if (sharedIds.length && uid) {
    try {
      const refs = sharedIds.map((nid) =>
        db.collection('notification_reads').doc(readId(nid, uid))
      )
      const docs = await db.getAll(...refs)
      for (const d of docs) {
        if (d.exists) {
          readMap.set(String(d.data()?.notification_id || ''), d.data()?.read_at || null)
        }
      }
    } catch (e: any) {
      console.error('[notifications] فشل قراءة حالة الاطلاع:', e?.message || e)
    }
  }

  return page.map(({ id, data }) => {
    const def = typeDef(String(data.type || ''))
    const shared = data.audience === 'admins'
    const isRead = shared ? readMap.has(id) : Boolean(data.is_read)
    return {
      id,
      type: String(data.type || ''),
      category: String(data.category || def.category),
      title: String(data.title || def.label),
      body: String(data.body || ''),
      link: data.link || null,
      icon: String(data.icon || def.icon),
      priority: String(data.priority || def.priority),
      audience: shared ? 'admins' : (data.audience || 'user'),
      actor_name: data.actor_name || null,
      created_at: String(data.created_at || ''),
      is_read: isRead,
      read_at: shared ? readMap.get(id) || null : data.read_at || null
    }
  })
}

/**
 * GET /api/notifications
 * ?limit=20&unread=1&category=financial
 */
notifications.get('/', rateLimiter(60, 60000, 'notif-list'), async (c) => {
  const user = currentUser(c)
  const uid = user.id || ''
  const isAdmin = user.role === 'admin'

  const rawLimit = Number(c.req.query('limit'))
  const limit = Math.min(
    Math.max(Number.isFinite(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : DEFAULT_LIMIT, 1),
    MAX_LIMIT
  )
  const unreadOnly = c.req.query('unread') === '1'
  const category = (c.req.query('category') || '').trim()

  try {
    const db = getFirestore(c)
    let items = await fetchFeed(db, uid, isAdmin, limit)

    if (category) items = items.filter((i) => i.category === category)
    if (unreadOnly) items = items.filter((i) => !i.is_read)

    return c.json({
      data: items,
      unread: items.filter((i) => !i.is_read).length,
      push_available: isPushConfigured(c)
    })
  } catch (error: any) {
    // قائمة فارغة أفضل من خطأ يعطّل الصفحة كلها
    console.error('[notifications] فشل جلب التدفّق:', error?.message || error)
    return c.json({ data: [], unread: 0, push_available: isPushConfigured(c) })
  }
})

/**
 * GET /api/notifications/count
 * نقطة خفيفة يستدعيها الجرس كل دقيقة. حدّ معدّل مرتفع لأنها تُستدعى
 * تلقائيًا من كل تبويب مفتوح، ومنخفضة التكلفة (تُرجع رقمًا فقط).
 */
notifications.get('/count', rateLimiter(120, 60000, 'notif-count'), async (c) => {
  const user = currentUser(c)
  const uid = user.id || ''
  const isAdmin = user.role === 'admin'

  try {
    const db = getFirestore(c)
    const items = await fetchFeed(db, uid, isAdmin, COUNT_CAP)
    const unread = items.filter((i) => !i.is_read).length
    const latest = items.find((i) => !i.is_read)

    return c.json({
      unread,
      capped: unread >= COUNT_CAP,
      latest: latest
        ? { id: latest.id, title: latest.title, icon: latest.icon, link: latest.link }
        : null
    })
  } catch (error: any) {
    console.error('[notifications] فشل حساب العدّاد:', error?.message || error)
    return c.json({ unread: 0, capped: false, latest: null })
  }
})

/** POST /api/notifications/read/:id */
notifications.post('/read/:id', authMiddleware, async (c) => {
  const user = currentUser(c)
  const uid = user.id || ''
  // `as string` مطلوبة: c.req.param يُرجع string | undefined تحت
  // noUncheckedIndexedAccess، والمسار يضمن وجود الجزء فعلًا.
  const id = c.req.param('id') as string

  if (!id) return c.json({ error: 'معرّف الإشعار مطلوب' }, 400)

  try {
    const db = getFirestore(c)
    const ref = db.collection('notifications').doc(id)
    const snap = await ref.get()

    if (!snap.exists) return c.json({ error: 'الإشعار غير موجود' }, 404)

    const data = snap.data() || {}
    const now = new Date().toISOString()

    if (data.audience === 'admins') {
      if (user.role !== 'admin') return c.json({ error: 'غير مصرّح' }, 403)
      await db
        .collection('notification_reads')
        .doc(readId(id, uid))
        .set({ notification_id: id, user_id: uid, read_at: now })
    } else {
      // منع مستخدم من التلاعب بإشعار غيره
      if (data.user_id !== uid) return c.json({ error: 'غير مصرّح' }, 403)
      if (data.is_read !== true) await ref.update({ is_read: true, read_at: now })
    }

    return c.json({ ok: true, id, read_at: now })
  } catch (error: any) {
    console.error('[notifications] فشل تعليم الإشعار كمقروء:', error?.message || error)
    return c.json({ error: 'تعذّر تحديث حالة الإشعار' }, 500)
  }
})

/**
 * POST /api/notifications/read-all
 * يقتصر على أحدث COUNT_CAP إشعارًا: "تعليم الكل" في الواجهة يعني
 * "أفرِغ الجرس"، والجرس نفسه لا يعدّ أكثر من هذا السقف.
 */
notifications.post('/read-all', authMiddleware, async (c) => {
  const user = currentUser(c)
  const uid = user.id || ''
  const isAdmin = user.role === 'admin'

  try {
    const db = getFirestore(c)
    const items = await fetchFeed(db, uid, isAdmin, COUNT_CAP)
    const unread = items.filter((i) => !i.is_read)

    if (!unread.length) return c.json({ ok: true, updated: 0 })

    const now = new Date().toISOString()
    const batch = db.batch()

    for (const item of unread) {
      if (item.audience === 'admins') {
        batch.set(db.collection('notification_reads').doc(readId(item.id, uid)), {
          notification_id: item.id,
          user_id: uid,
          read_at: now
        })
      } else {
        batch.update(db.collection('notifications').doc(item.id), {
          is_read: true,
          read_at: now
        })
      }
    }

    await batch.commit()
    return c.json({ ok: true, updated: unread.length })
  } catch (error: any) {
    console.error('[notifications] فشل تعليم الكل كمقروء:', error?.message || error)
    return c.json({ error: 'تعذّر تحديث الإشعارات' }, 500)
  }
})

/* ────────────────────────── توكنات Push ────────────────────────── */

/**
 * POST /api/notifications/subscribe  { token }
 * حدّ معدّل منخفض: التسجيل يحدث مرة عند منح الإذن ثم نادرًا عند تدوير
 * التوكن، فأي معدّل أعلى يعني خطأ في الواجهة أو محاولة إساءة.
 */
notifications.post('/subscribe', authMiddleware, rateLimiter(10, 60000, 'notif-sub'), async (c) => {
  const user = currentUser(c)

  try {
    const body: any = await c.req.json().catch(() => ({}))
    const token = String(body?.token || '').trim()

    if (!token) return c.json({ error: 'التوكن مطلوب' }, 400)
    if (!isPushConfigured(c)) {
      // ليست حالة خطأ: الموقع يعمل كاملًا بدون Push. نُبلّغ الواجهة
      // لتُخفي زر التفعيل بدلًا من تركه يفشل صامتًا.
      return c.json({ ok: false, reason: 'push_not_configured' })
    }

    const res = await registerToken(c, user.id || '', token)
    if (!res.ok) return c.json({ error: res.error || 'تعذّر تسجيل الجهاز' }, 400)

    return c.json({ ok: true })
  } catch (error: any) {
    console.error('[notifications] فشل تسجيل التوكن:', error?.message || error)
    return c.json({ error: 'تعذّر تسجيل الجهاز' }, 500)
  }
})

/** POST /api/notifications/unsubscribe  { token } */
notifications.post('/unsubscribe', authMiddleware, async (c) => {
  const user = currentUser(c)

  try {
    const body: any = await c.req.json().catch(() => ({}))
    const token = String(body?.token || '').trim()

    if (!token) return c.json({ error: 'التوكن مطلوب' }, 400)

    const res = await unregisterToken(c, user.id || '', token)
    if (!res.ok) return c.json({ error: res.error || 'تعذّر إلغاء التسجيل' }, 400)

    return c.json({ ok: true })
  } catch (error: any) {
    console.error('[notifications] فشل إلغاء التوكن:', error?.message || error)
    return c.json({ error: 'تعذّر إلغاء التسجيل' }, 500)
  }
})

/* ────────────────────────── التفضيلات ────────────────────────── */

/** GET /api/notifications/prefs */
notifications.get('/prefs', authMiddleware, async (c) => {
  const user = currentUser(c)

  try {
    const db = getFirestore(c)
    const prefs = await getPrefs(db, user.id || '')

    let devices = 0
    try {
      const snap = await db
        .collection('push_tokens')
        .where('user_id', '==', user.id || '')
        .where('is_active', '==', true)
        .get()
      devices = snap.size
    } catch (e: any) {
      console.error('[notifications] فشل عدّ الأجهزة:', e?.message || e)
    }

    return c.json({
      data: prefs,
      categories: CATEGORY_LABELS,
      devices,
      push_available: isPushConfigured(c)
    })
  } catch (error: any) {
    console.error('[notifications] فشل جلب التفضيلات:', error?.message || error)
    return c.json({
      data: DEFAULT_PREFS,
      categories: CATEGORY_LABELS,
      devices: 0,
      push_available: isPushConfigured(c)
    })
  }
})

const VALID_CATEGORIES = Object.keys(CATEGORY_LABELS) as NotificationCategory[]
const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

/** POST /api/notifications/prefs */
notifications.post('/prefs', authMiddleware, async (c) => {
  const user = currentUser(c)
  const uid = user.id || ''
  if (!uid) return c.json({ error: 'غير مصرّح' }, 401)

  try {
    const contentType = c.req.header('content-type') || ''
    const body: any = contentType.includes('application/json')
      ? await c.req.json().catch(() => ({}))
      : await c.req.parseBody()

    const truthy = (v: unknown) => v === true || v === 'true' || v === 'on' || v === '1' || v === 1

    // القوائم البيضاء لا السوداء: أي مفتاح غير معروف يُهمَل تمامًا حتى
    // لا تُحقن حقول عشوائية في مستند التفضيلات.
    const categories: Partial<Record<NotificationCategory, boolean>> = {}
    for (const key of VALID_CATEGORIES) {
      const raw = body[`cat_${key}`] ?? body?.categories?.[key]
      categories[key] = raw === undefined ? true : truthy(raw)
    }

    const prefs: NotificationPrefsDoc = {
      push_enabled: body.push_enabled === undefined ? true : truthy(body.push_enabled),
      email_enabled: body.email_enabled === undefined ? true : truthy(body.email_enabled),
      categories
    }

    const qFrom = String(body.quiet_from || body?.quiet_hours?.from || '').trim()
    const qTo = String(body.quiet_to || body?.quiet_hours?.to || '').trim()
    const qEnabled = truthy(body.quiet_enabled ?? body?.quiet_hours?.enabled)

    if (qEnabled && TIME_RE.test(qFrom) && TIME_RE.test(qTo)) {
      prefs.quiet_hours = { enabled: true, from: qFrom, to: qTo }
    } else {
      prefs.quiet_hours = { enabled: false, from: qFrom || '22:00', to: qTo || '08:00' }
    }

    const db = getFirestore(c)
    await db
      .collection('notification_prefs')
      .doc(uid)
      .set({ ...prefs, updated_at: new Date().toISOString() }, { merge: true })

    if (!contentType.includes('application/json')) {
      return c.redirect('/profile?success=prefs')
    }
    return c.json({ ok: true, data: prefs })
  } catch (error: any) {
    console.error('[notifications] فشل حفظ التفضيلات:', error?.message || error)
    return c.json({ error: 'تعذّر حفظ التفضيلات' }, 500)
  }
})

/* ────────────────────────── تشخيص (مشرف) ────────────────────────── */

/**
 * POST /api/notifications/test
 * يُرسل إشعارًا حقيقيًا للمشرف نفسه عبر المسار الكامل (كتابة + Push).
 * الغرض: التحقق من أن السلسلة تعمل فعلًا بدل الاعتماد على أن الزر
 * "قال إنه اشتغل" — العطل الشائع في Push صامت تمامًا.
 */
notifications.post('/test', adminMiddleware, rateLimiter(5, 60000, 'notif-test'), async (c) => {
  const user = currentUser(c)

  const res = await notify(c, {
    user_id: user.id,
    type: 'test',
    title: 'إشعار تجريبي ✅',
    body: 'وصلك هذا الإشعار، إذًا نظام الإشعارات يعمل بشكل صحيح.',
    link: '/dashboard?view=notifications',
    actor: { id: user.id, name: user.name || 'النظام' }
  })

  return c.json({
    ok: res.created,
    id: res.id || null,
    pushed: res.pushed || 0,
    push_available: isPushConfigured(c),
    note: res.pushed
      ? 'تم إنشاء الإشعار وإرساله للأجهزة المسجّلة.'
      : isPushConfigured(c)
        ? 'تم إنشاء الإشعار داخليًا، ولا توجد أجهزة مسجّلة لإشعارات Push.'
        : 'تم إنشاء الإشعار داخليًا. إشعارات Push غير مُهيّأة (FIREBASE_VAPID_KEY مفقود).',
    skipped: res.skipped || null
  })
})

/** GET /api/notifications/types — كتالوج الأنواع للتوثيق والتشخيص. */
notifications.get('/types', adminMiddleware, (c) =>
  c.json({
    data: Object.entries(NOTIFICATION_TYPES).map(([key, def]) => ({
      type: key,
      category: def.category,
      category_label: CATEGORY_LABELS[def.category],
      icon: def.icon,
      priority: def.priority,
      silent: Boolean(def.silent),
      label: def.label
    })),
    total: Object.keys(NOTIFICATION_TYPES).length,
    push_available: isPushConfigured(c)
  })
)

/** GET /api/notifications/vapid — استرجاع المفتاح العام للمتصفح. */
notifications.get('/vapid', (c) =>
  c.json({
    vapidKey: getVapidKey(c),
    configured: isPushConfigured(c)
  })
)

/**
 * POST /api/notifications/send-custom
 * إرسال إشعار مخصص أو بث عام لكافة المستخدمين أو فئة محددة
 */
notifications.post('/send-custom', adminMiddleware, rateLimiter(15, 60000, 'notif-send-custom'), async (c) => {
  const user = currentUser(c)
  const db = getFirestore(c)

  try {
    const contentType = c.req.header('content-type') || ''
    const body: any = contentType.includes('application/json')
      ? await c.req.json().catch(() => ({}))
      : await c.req.parseBody()

    const title = String(body.title || '').trim()
    const textBody = String(body.body || '').trim()
    const category = String(body.category || 'content').trim() as NotificationCategory
    const priority = (String(body.priority || 'normal').trim() === 'high' ? 'high' : 'normal') as NotificationPriority
    const link = String(body.link || '').trim() || '/notifications'
    const audience = String(body.audience || 'all').trim() // 'all' | 'volunteers' | 'donors' | 'admins' | 'single'
    const targetUser = String(body.target_user || '').trim() // uid or email if single
    const sendInApp = body.send_in_app === undefined ? true : (body.send_in_app === true || body.send_in_app === 'on' || body.send_in_app === '1' || body.send_in_app === 1 || body.send_in_app === 'true')
    const sendPush = body.send_push === undefined ? true : (body.send_push === true || body.send_push === 'on' || body.send_push === '1' || body.send_push === 1 || body.send_push === 'true')

    if (!title) {
      if (!contentType.includes('application/json')) return c.redirect('/dashboard?view=notifications&error=title_required')
      return c.json({ error: 'عنوان الإشعار مطلوب' }, 400)
    }

    let recipientUserIds: string[] = []
    let inAppCreated = 0

    if (audience === 'admins') {
      // إشعار موجه لكل المشرفين
      if (sendInApp) {
        await notifyAdmins(c, {
          type: 'custom_broadcast',
          title,
          body: textBody,
          link,
          priority,
          actor: { id: user.id, name: user.name || 'المشرف' },
          meta: { broadcast: true, audience: 'admins' }
        })
        inAppCreated++
      }

      if (sendPush) {
        const adminProfiles = await db.collection('profiles').where('role', '==', 'admin').get().catch(() => ({ docs: [] }))
        recipientUserIds = adminProfiles.docs.map((d: any) => d.id)
      }
    } else if (audience === 'volunteers') {
      // جلب معرفات المتطوعين المعتمدين
      const volSnap = await db.collection('volunteers').where('status', '==', 'approved').get().catch(() => ({ docs: [] }))
      const profileIds = new Set<string>()
      volSnap.docs.forEach((d: any) => {
        const pId = d.data()?.profile_id
        if (pId) profileIds.add(pId)
      })
      recipientUserIds = Array.from(profileIds)

      if (sendInApp && recipientUserIds.length) {
        const batch = db.batch()
        const now = new Date().toISOString()
        for (const uid of recipientUserIds.slice(0, 500)) {
          const ref = db.collection('notifications').doc()
          batch.set(ref, {
            user_id: uid,
            audience: 'user',
            type: 'custom_broadcast',
            category: 'volunteers',
            priority,
            title,
            body: textBody,
            link,
            icon: 'fa-bullhorn',
            actor_id: user.id || null,
            actor_name: user.name || 'إدارة المؤسسة',
            meta: { audience: 'volunteers', broadcast: true },
            created_at: now,
            is_read: false,
            read_at: null
          })
          inAppCreated++
        }
        await batch.commit()
      }
    } else if (audience === 'donors') {
      // جلب معرفات المتبرعين
      const donorProfiles = await db.collection('profiles').where('role', '==', 'donor').limit(500).get().catch(() => ({ docs: [] }))
      recipientUserIds = donorProfiles.docs.map((d: any) => d.id)

      if (sendInApp && recipientUserIds.length) {
        const batch = db.batch()
        const now = new Date().toISOString()
        for (const uid of recipientUserIds.slice(0, 500)) {
          const ref = db.collection('notifications').doc()
          batch.set(ref, {
            user_id: uid,
            audience: 'user',
            type: 'custom_broadcast',
            category: 'financial',
            priority,
            title,
            body: textBody,
            link,
            icon: 'fa-bullhorn',
            actor_id: user.id || null,
            actor_name: user.name || 'إدارة المؤسسة',
            meta: { audience: 'donors', broadcast: true },
            created_at: now,
            is_read: false,
            read_at: null
          })
          inAppCreated++
        }
        await batch.commit()
      }
    } else if (audience === 'single') {
      // مستخدم محدد
      if (!targetUser) {
        if (!contentType.includes('application/json')) return c.redirect('/dashboard?view=notifications&error=target_required')
        return c.json({ error: 'يرجى تحديد المعرف أو البريد للمستخدم المستهدف' }, 400)
      }

      let uid = targetUser
      if (targetUser.includes('@')) {
        const profSnap = await db.collection('profiles').where('email', '==', targetUser.toLowerCase()).limit(1).get().catch(() => ({ empty: true, docs: [] }))
        if (profSnap.empty) {
          if (!contentType.includes('application/json')) return c.redirect('/dashboard?view=notifications&error=user_not_found')
          return c.json({ error: 'لم يتم العثور على مستخدم بهذا البريد الإلكتروني' }, 404)
        }
        uid = profSnap.docs[0].id
      }

      recipientUserIds = [uid]

      if (sendInApp) {
        await notify(c, {
          user_id: uid,
          type: 'custom_direct',
          category,
          priority,
          title,
          body: textBody,
          link,
          actor: { id: user.id, name: user.name || 'إدارة المؤسسة' },
          meta: { direct: true }
        })
        inAppCreated++
      }
    } else {
      // audience === 'all' (البث الشامل لكافة المستخدمين والأجهزة)
      const profSnap = await db.collection('profiles').limit(500).get().catch(() => ({ docs: [] }))
      recipientUserIds = profSnap.docs.map((d: any) => d.id)

      if (sendInApp) {
        await notifyAdmins(c, {
          type: 'custom_broadcast',
          title,
          body: textBody,
          link,
          priority,
          actor: { id: user.id, name: user.name || 'إدارة المؤسسة' },
          meta: { broadcast: true, audience: 'all' }
        })
        inAppCreated++

        if (recipientUserIds.length) {
          const batch = db.batch()
          const now = new Date().toISOString()
          for (const uid of recipientUserIds.slice(0, 500)) {
            const ref = db.collection('notifications').doc()
            batch.set(ref, {
              user_id: uid,
              audience: 'user',
              type: 'custom_broadcast',
              category: 'content',
              priority,
              title,
              body: textBody,
              link,
              icon: 'fa-bullhorn',
              actor_id: user.id || null,
              actor_name: user.name || 'إدارة المؤسسة',
              meta: { audience: 'all', broadcast: true },
              created_at: now,
              is_read: false,
              read_at: null
            })
            inAppCreated++
          }
          await batch.commit()
        }
      }
    }

    // إرسال Push Notification
    let pushResult = { sent: 0, failed: 0, pruned: 0 }
    if (sendPush && isPushConfigured(c)) {
      if (audience === 'all') {
        const allTokensSnap = await db.collection('push_tokens').where('is_active', '==', true).get().catch(() => ({ docs: [] }))
        const allUserIds = [...new Set(allTokensSnap.docs.map((d: any) => d.data()?.user_id).filter(Boolean))]
        pushResult = await sendPushToUsers(c, allUserIds.length ? allUserIds : recipientUserIds, {
          title,
          body: textBody,
          link,
          tag: 'admin-broadcast'
        })
      } else if (recipientUserIds.length) {
        pushResult = await sendPushToUsers(c, recipientUserIds, {
          title,
          body: textBody,
          link,
          tag: `custom-${audience}`
        })
      }
    }

    if (!contentType.includes('application/json')) {
      return c.redirect('/dashboard?view=notifications&success=broadcast_sent')
    }

    return c.json({
      ok: true,
      message: `تم إرسال الإشعار بنجاح (تم التدوين داخلياً: ${inAppCreated}، وإشعارات الشاشة Push المرسلة: ${pushResult.sent})`,
      inAppCreated,
      push: pushResult
    })
  } catch (error: any) {
    console.error('[notifications] فشل إرسال الإشعار المخصص:', error?.message || error)
    if (!c.req.header('content-type')?.includes('application/json')) {
      return c.redirect('/dashboard?view=notifications&error=send_failed')
    }
    return c.json({ error: error?.message || 'تعذّر إرسال الإشعار' }, 500)
  }
})

/**
 * POST /api/notifications/delete/:id
 * حذف إشعار فردي
 */
notifications.post('/delete/:id', adminMiddleware, async (c) => {
  const id = String(c.req.param('id') || '').trim()
  if (!id) return c.json({ error: 'معرّف الإشعار مطلوب' }, 400)
  const db = getFirestore(c)

  try {
    const ref = db.collection('notifications').doc(id)
    const snap = await ref.get()
    if (!snap.exists) return c.json({ error: 'الإشعار غير موجود' }, 404)

    await ref.delete()

    if (snap.data()?.audience === 'admins') {
      const readsSnap = await db.collection('notification_reads').where('notification_id', '==', id).get().catch(() => ({ docs: [] }))
      if (readsSnap.docs.length) {
        const batch = db.batch()
        readsSnap.docs.forEach((d: any) => batch.delete(d.ref))
        await batch.commit()
      }
    }

    const contentType = c.req.header('content-type') || ''
    if (!contentType.includes('application/json')) {
      return c.redirect('/dashboard?view=notifications&success=deleted')
    }
    return c.json({ ok: true })
  } catch (error: any) {
    console.error('[notifications] فشل حذف الإشعار:', error?.message || error)
    return c.json({ error: 'تعذّر حذف الإشعار' }, 500)
  }
})

/**
 * POST /api/notifications/clear-all-admin
 * تفريغ الإشعارات المقروءة للإدارة
 */
notifications.post('/clear-all-admin', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  try {
    const snap = await db.collection('notifications').where('is_read', '==', true).limit(200).get().catch(() => ({ docs: [] }))
    if (snap.docs.length) {
      const batch = db.batch()
      snap.docs.forEach((d: any) => batch.delete(d.ref))
      await batch.commit()
    }
    return c.json({ ok: true, deleted: snap.docs.length })
  } catch (error: any) {
    console.error('[notifications] فشل تنظيف الإشعارات:', error?.message || error)
    return c.json({ error: 'تعذّر تفريغ الإشعارات' }, 500)
  }
})


