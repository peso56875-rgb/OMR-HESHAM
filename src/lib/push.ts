/**
 * ═══════════════════ طبقة Push عبر Firebase Cloud Messaging ═══════════════════
 *
 * لماذا FCM ولا شيء آخر؟
 * المشروع يُنشر على Vercel كدوال مُجهَّزة مسبقًا (prebuilt functions)، وVercel
 * لا تُشغّل npm install لها: أي حزمة خارجية يجب نسخها يدويًا في
 * scripts/copy-externals.mjs. أي إضافة تبعية جديدة = مخاطرة نشر حقيقية.
 * وfirebase-admin — الموجود أصلًا — يشمل firebase-admin/messaging داخله،
 * فتحقّقنا من ذلك على القرص قبل الاعتماد عليه: صفر تبعيات جديدة.
 *
 * التدهور اللطيف مبدأ أساسي هنا:
 * إشعارات Push تحتاج FIREBASE_VAPID_KEY (يُولَّد من إعدادات Firebase Cloud
 * Messaging). المفتاح غير متوفّر حاليًا. الوحدة تتعامل مع غيابه كحالة
 * مشروعة لا كخطأ — تُرجع { sent: 0, skipped } وتُسجّل سطرًا واحدًا في اللوج،
 * تمامًا كما يتعامل email.ts مع غياب RESEND_API_KEY. مركز الإشعارات الداخلي
 * والبريد يعملان كاملين، وتفعيل الـ Push لاحقًا لا يحتاج أي تعديل كود:
 * تُضاف المتغيّرة فقط.
 *
 * لا شيء هنا يرمي استثناءً — الـ Push أضعف الطبقات الثلاث وأقلّها ضمانًا.
 */

import { getFirestore, getFirebaseAdminApp } from './firebase-admin'
import { getMessaging as getMessagingAdmin } from 'firebase-admin/messaging'

const glob = globalThis as any

/** أقصى عدد توكنات في رسالة multicast واحدة — حدّ تفرضه FCM نفسها. */
const FCM_BATCH_LIMIT = 500

/**
 * أكواد الخطأ التي تعني أن التوكن مات نهائيًا (حُذف التطبيق، أُلغي الإذن،
 * انتهت صلاحيته). التوكنات الميتة تُحذف فورًا: بقاؤها يجعل كل إرسال لاحق
 * يهدر محاولة، ويُفسد إحصاءات "أُرسل إلى ٥ أجهزة" وهي في الحقيقة جهاز واحد.
 */
const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument'
])

/** يقرأ مفتاح VAPID من البيئة. غيابه = الـ Push غير مُهيّأة. */
export const getVapidKey = (c?: any): string => {
  const env = c?.env || {}
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env || {} : {}
  return String(env.FIREBASE_VAPID_KEY || procEnv.FIREBASE_VAPID_KEY || '')
}

export const isPushConfigured = (c?: any): boolean => Boolean(getVapidKey(c))

/**
 * إعدادات Firebase التي يحتاجها العميل لتفعيل الـ Push.
 *
 * تُرجع null عند غياب أي مفتاح مطلوب — والواجهة تستخدم هذا العدم كإشارة
 * لعدم تحميل سكربت الـ Push إطلاقًا. لولا ذلك لحمَّلنا مكتبة كاملة على كل
 * صفحة ثم فشلت بصمت لأن vapidKey فارغ.
 *
 * كل هذه القيم عامة بطبيعتها: أي موقع يستخدم Firebase على العميل يكشفها
 * في مصدر صفحته. الحماية الفعلية في قواعد Firestore وتحقّق الجلسة، لا في
 * إخفاء apiKey. لكن لا يُدرج هنا أي مفتاح خاص (private key / client email).
 */
export const getPushClientConfig = (c?: any): Record<string, string> | null => {
  const env = c?.env || {}
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env || {} : {}
  const read = (k: string) => String(env[k] || procEnv[k] || '')

  const cfg = {
    apiKey: read('FIREBASE_API_KEY'),
    authDomain: read('FIREBASE_AUTH_DOMAIN'),
    projectId: read('FIREBASE_PROJECT_ID'),
    storageBucket: read('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: read('FIREBASE_MESSAGING_SENDER_ID'),
    appId: read('FIREBASE_APP_ID'),
    vapidKey: getVapidKey(c)
  }

  // messagingSenderId و vapidKey شرطان لا بديل عنهما في FCM Web.
  if (!cfg.projectId || !cfg.messagingSenderId || !cfg.vapidKey) return null
  return cfg
}

export const getMessaging = (c?: any) => {
  const app = getFirebaseAdminApp(c)
  return getMessagingAdmin(app)
}

/* ────────────────────────── الإرسال ────────────────────────── */

export interface PushPayload {
  title: string
  body?: string
  /** مسار داخلي يُفتح عند الضغط على الإشعار. */
  link?: string
  /**
   * وسم التجميع. إشعارات بنفس الوسم تستبدل بعضها في مركز إشعارات النظام
   * بدل أن تتراكم — مهم على الجوال حيث عشرة إشعارات متطابقة تُقرأ كخلل.
   */
  tag?: string
  icon?: string
}

export interface PushResult {
  sent: number
  failed: number
  pruned: number
  skipped?: string
}

/**
 * يجلب توكنات مجموعة مستخدمين.
 * استعلام `in` في Firestore محدود بثلاثين قيمة، لذا نُقسّم القائمة.
 * هذا يهمّ فعليًا: إشعار المشرفين يمرّر كل المشرفين معًا.
 */
const fetchTokens = async (db: any, userIds: string[]): Promise<string[]> => {
  const unique = [...new Set(userIds.filter(Boolean))]
  if (!unique.length) return []

  const CHUNK = 30
  const chunks: string[][] = []
  for (let i = 0; i < unique.length; i += CHUNK) chunks.push(unique.slice(i, i + CHUNK))

  const results = await Promise.all(
    chunks.map((chunk) =>
      db
        .collection('push_tokens')
        .where('user_id', 'in', chunk)
        .where('is_active', '==', true)
        .get()
        .catch((e: any) => {
          console.error('[push] تعذّر جلب التوكنات:', e?.message || e)
          return { docs: [] }
        })
    )
  )

  const tokens: string[] = []
  for (const snap of results) {
    for (const doc of snap.docs || []) tokens.push(doc.id)
  }
  return [...new Set(tokens)]
}

/** يحذف التوكنات الميتة دفعة واحدة. */
const pruneDeadTokens = async (db: any, tokens: string[]): Promise<number> => {
  if (!tokens.length) return 0
  try {
    const batch = db.batch()
    for (const t of tokens) batch.delete(db.collection('push_tokens').doc(t))
    await batch.commit()
    return tokens.length
  } catch (e: any) {
    console.error('[push] تعذّر تنظيف التوكنات الميتة:', e?.message || e)
    return 0
  }
}

const siteOrigin = (c?: any): string => {
  const env = c?.env || {}
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env || {} : {}
  return String(
    env.SITE_ORIGIN || procEnv.SITE_ORIGIN || 'https://omarhesham.org'
  ).replace(/\/+$/, '')
}

/**
 * يبني رسالة FCM.
 *
 * المحتوى يوضع في data لا في notification — عن قصد.
 * لو أُرسل في notification، فمتصفّح Chrome يعرض الإشعار تلقائيًا، ثم
 * onBackgroundMessage في الـ service worker يعرضه مرة أخرى = إشعار مكرر
 * لكل حدث. بوضعه في data يتولّى الـ service worker العرض وحده فيظهر مرة
 * واحدة، ونتحكّم في الأيقونة والاتجاه والوسم بأنفسنا.
 */
const buildMessage = (payload: PushPayload, origin: string) => {
  const link = payload.link || '/notifications'
  const url = link.startsWith('http') ? link : `${origin}${link.startsWith('/') ? '' : '/'}${link}`

  return {
    data: {
      title: String(payload.title || 'إشعار جديد').slice(0, 200),
      body: String(payload.body || '').slice(0, 400),
      url,
      tag: String(payload.tag || 'general'),
      icon: String(payload.icon || '/static/icon-192.png')
    },
    webpush: {
      fcmOptions: { link: url },
      headers: {
        // TTL يوم واحد: إشعار عمره أكثر من ذلك فقد قيمته العملية،
        // ووصوله متأخرًا يُربك المستخدم أكثر مما يفيده.
        TTL: '86400'
      }
    }
  }
}

/**
 * يرسل Push لمجموعة مستخدمين.
 * لا يرمي استثناءً — يعيد وصفًا لما حدث.
 */
export const sendPushToUsers = async (
  c: any,
  userIds: string[],
  payload: PushPayload
): Promise<PushResult> => {
  const empty: PushResult = { sent: 0, failed: 0, pruned: 0 }

  try {
    if (!isPushConfigured(c)) {
      // ليست حالة خطأ: الموقع يعمل كاملًا دون Push
      console.log('[push] تم تخطّي الإرسال: FIREBASE_VAPID_KEY غير مُهيّأ.')
      return { ...empty, skipped: 'push not configured' }
    }

    if (!userIds?.length) return { ...empty, skipped: 'no recipients' }

    const db = getFirestore(c)
    const tokens = await fetchTokens(db, userIds)
    if (!tokens.length) return { ...empty, skipped: 'no registered devices' }

    const messaging = getMessaging(c)
    const message = buildMessage(payload, siteOrigin(c))

    let sent = 0
    let failed = 0
    const dead: string[] = []

    for (let i = 0; i < tokens.length; i += FCM_BATCH_LIMIT) {
      const batch = tokens.slice(i, i + FCM_BATCH_LIMIT)
      try {
        const res = await messaging.sendEachForMulticast({ ...message, tokens: batch })
        sent += res.successCount
        failed += res.failureCount

        res.responses.forEach((r: any, idx: number) => {
          if (!r.success) {
            const code = r.error?.code || ''
            if (DEAD_TOKEN_CODES.has(code)) dead.push(batch[idx])
            else console.error('[push] فشل إرسال لتوكن:', code || r.error?.message)
          }
        })
      } catch (e: any) {
        failed += batch.length
        console.error('[push] فشل إرسال دفعة:', e?.message || e)
      }
    }

    const pruned = await pruneDeadTokens(db, dead)
    return { sent, failed, pruned }
  } catch (e: any) {
    console.error('[push] تعذّر الإرسال:', e?.message || e)
    return { ...empty, skipped: e?.message || 'unknown error' }
  }
}

/** يرسل Push لمستخدم واحد. */
export const sendPushToUser = (c: any, userId: string, payload: PushPayload): Promise<PushResult> =>
  sendPushToUsers(c, [userId], payload)

/* ────────────────────────── إدارة التوكنات ────────────────────────── */

export interface TokenRecord {
  user_id: string
  platform: string
  user_agent: string
  created_at: string
  last_seen_at: string
  is_active: boolean
}

/** يستنبط منصّة الجهاز من User-Agent — للعرض في الإدارة فقط. */
export const detectPlatform = (ua: string): string => {
  const s = (ua || '').toLowerCase()
  if (/iphone|ipad|ipod/.test(s)) return 'ios'
  if (/android/.test(s)) return 'android'
  if (/windows/.test(s)) return 'windows'
  if (/mac os/.test(s)) return 'macos'
  if (/linux/.test(s)) return 'linux'
  return 'unknown'
}

/**
 * يسجّل (أو يحدّث) توكن جهاز.
 * التوكن = معرّف المستند، فإعادة التسجيل تحدّث الصف نفسه ولا تُنشئ نسخة.
 * هذا مهم لأن المتصفّح يُعيد استدعاء getToken() في كل زيارة.
 */
export const registerToken = async (
  c: any,
  userId: string,
  token: string
): Promise<{ ok: boolean; error?: string }> => {
  try {
    if (!userId) return { ok: false, error: 'no user' }
    // توكنات FCM أطول من ١٠٠ حرف — فحص بسيط يمنع تخزين قمامة
    if (!token || token.length < 50 || token.length > 4096) {
      return { ok: false, error: 'invalid token' }
    }

    const db = getFirestore(c)
    const now = new Date().toISOString()
    const ua = (c?.req?.header?.('user-agent') || '').slice(0, 200)
    const ref = db.collection('push_tokens').doc(token)
    const existing = await ref.get()

    if (existing.exists) {
      await ref.update({
        user_id: userId,
        is_active: true,
        last_seen_at: now,
        user_agent: ua,
        platform: detectPlatform(ua)
      })
    } else {
      const record: TokenRecord = {
        user_id: userId,
        platform: detectPlatform(ua),
        user_agent: ua,
        created_at: now,
        last_seen_at: now,
        is_active: true
      }
      await ref.set(record)
    }

    return { ok: true }
  } catch (e: any) {
    console.error('[push] تعذّر تسجيل التوكن:', e?.message || e)
    return { ok: false, error: e?.message || 'unknown error' }
  }
}

/**
 * يُلغي تسجيل توكن.
 * الحذف لا التعطيل: المستخدم طلب إيقاف الإشعارات على هذا الجهاز صراحة،
 * وإبقاء صف معطّل بلا فائدة يخالف مبدأ تقليل البيانات المحفوظة.
 */
export const unregisterToken = async (
  c: any,
  userId: string,
  token: string
): Promise<{ ok: boolean; error?: string }> => {
  try {
    if (!token) return { ok: false, error: 'no token' }
    const db = getFirestore(c)
    const ref = db.collection('push_tokens').doc(token)
    const snap = await ref.get()

    // لا نسمح لمستخدم بحذف توكن مستخدم آخر
    if (snap.exists && snap.data()?.user_id !== userId) {
      return { ok: false, error: 'forbidden' }
    }

    await ref.delete()
    return { ok: true }
  } catch (e: any) {
    console.error('[push] تعذّر إلغاء التوكن:', e?.message || e)
    return { ok: false, error: e?.message || 'unknown error' }
  }
}
