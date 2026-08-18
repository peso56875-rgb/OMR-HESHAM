/**
 * تفعيل إشعارات الجهاز (FCM Web Push) — الطبقة العميلة
 *
 * يُصدِّر window.enableDevicePush() الذي يستدعيه زر التفعيل في
 * notifications.js. لا يفعل شيئًا تلقائيًا عند التحميل، والسبب مقصود:
 *
 * طلب الإذن بدون تفاعل صريح من المستخدم يعطي نتيجة عكسية — المتصفحات
 * الحديثة تحجب الطلب التلقائي أو تسجّله كرفض دائم، وحينها لا يمكن طلب
 * الإذن مرة أخرى من الكود إطلاقًا (يجب على المستخدم تغييره من إعدادات
 * المتصفح يدويًا). لذلك يُطلب الإذن فقط بعد نقرة حقيقية على الزر.
 */
(() => {
  'use strict'

  const SDK = 'https://www.gstatic.com/firebasejs/10.8.0/'
  const SW_PATH = '/firebase-messaging-sw.js'

  const cfg = window.__FIREBASE_PUSH__ || {}

  const fail = (message) => ({ ok: false, message })

  /** الإعدادات ناقصة = الميزة غير مُهيّأة على السيرفر (لا مفتاح VAPID مثلًا). */
  const isConfigured = () =>
    Boolean(cfg.apiKey && cfg.projectId && cfg.messagingSenderId && cfg.vapidKey)

  /**
   * الدعم الفني. تُفحص كل قدرة منفصلة لأن رسالة الخطأ يجب أن تخبر
   * المستخدم بالسبب الحقيقي: iOS قبل 16.4 لا يدعم Push للويب مطلقًا،
   * والتصفّح الخاص يعطّل الـ Service Worker.
   */
  const support = () => {
    if (!('serviceWorker' in navigator)) return fail('متصفحك لا يدعم إشعارات الويب')
    if (!('Notification' in window)) return fail('متصفحك لا يدعم إشعارات الويب')
    if (!('PushManager' in window)) {
      return fail('متصفحك لا يدعم إشعارات الويب. على أجهزة iPhone أضِف الموقع إلى الشاشة الرئيسية أولًا ثم أعد المحاولة.')
    }
    // Push يعمل على الأصول الآمنة فقط (https أو localhost).
    if (!window.isSecureContext) return fail('إشعارات الجهاز تعمل على الاتصال الآمن (https) فقط')
    return { ok: true }
  }

  /**
   * إعدادات Firebase تُمرَّر إلى عامل الخدمة عبر معاملات الرابط، لأنه ملف
   * ثابت لا يستطيع قراءة متغيّرات البيئة على السيرفر.
   */
  const swUrl = () => {
    const p = new URLSearchParams({
      apiKey: cfg.apiKey || '',
      authDomain: cfg.authDomain || '',
      projectId: cfg.projectId || '',
      storageBucket: cfg.storageBucket || '',
      messagingSenderId: cfg.messagingSenderId || '',
      appId: cfg.appId || ''
    })
    return `${SW_PATH}?${p}`
  }

  let cachedToken = null

  const enableDevicePush = async () => {
    if (!isConfigured()) return fail('إشعارات الجهاز غير مُهيّأة على السيرفر')

    const sup = support()
    if (!sup.ok) return sup

    // الرفض السابق لا يمكن تجاوزه برمجيًا — نوضّح ذلك بدل تركه يفشل بصمت.
    if (Notification.permission === 'denied') {
      return fail('الإشعارات محجوبة لهذا الموقع. اسمح بها من إعدادات المتصفح ثم أعد المحاولة.')
    }

    try {
      // الإذن قبل تحميل الـ SDK: لو رفض المستخدم فلا داعي لتنزيل مكتبة
      // بحجمها كاملًا بلا فائدة.
      const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission()

      if (permission !== 'granted') return fail('لم يتم منح إذن الإشعارات')

      const registration = await navigator.serviceWorker.register(swUrl(), { scope: '/' })
      // getToken يفشل إن لم يكن العامل نشطًا بعد.
      await navigator.serviceWorker.ready

      const [appMod, msgMod] = await Promise.all([
        import(SDK + 'firebase-app.js'),
        import(SDK + 'firebase-messaging.js')
      ])

      const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp({
        apiKey: cfg.apiKey,
        authDomain: cfg.authDomain,
        projectId: cfg.projectId,
        storageBucket: cfg.storageBucket,
        messagingSenderId: cfg.messagingSenderId,
        appId: cfg.appId
      })

      const messaging = msgMod.getMessaging(app)
      const token = await msgMod.getToken(messaging, {
        vapidKey: cfg.vapidKey,
        serviceWorkerRegistration: registration
      })

      if (!token) return fail('تعذّر الحصول على معرّف الجهاز، حاول مرة أخرى')

      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ token })
      })
      const data = await res.json().catch(() => ({}))

      if (data && data.reason === 'push_not_configured') {
        return fail('إشعارات الجهاز غير مُهيّأة على السيرفر')
      }
      if (!res.ok || !data.ok) return fail(data.error || 'تعذّر تسجيل الجهاز')

      cachedToken = token

      // الرسائل الواردة والتبويب مفتوح: النظام لا يعرض إشعارًا في هذه
      // الحالة، فنُظهر Toast ونُحدّث العدّاد فورًا حتى لا ينتظر المستخدم
      // دورة الاستقصاء (٦٠ ثانية) ليرى ما وصله.
      msgMod.onMessage(messaging, (payload) => {
        const d = (payload && payload.data) || {}
        window.showToast?.(d.title || 'وصلك إشعار جديد', 'subscribe')
        window.initNotificationBell?.()
      })

      return { ok: true, token }
    } catch (error) {
      console.error('[push] تعذّر التفعيل:', error)
      // رسالة SDK الخام إنجليزية وغير مفهومة للمستخدم النهائي.
      return fail('تعذّر تفعيل إشعارات الجهاز على هذا المتصفح')
    }
  }

  /** إلغاء التسجيل — يُستخدم عند إيقاف Push من صفحة التفضيلات. */
  const disableDevicePush = async () => {
    if (!cachedToken) return { ok: true, skipped: 'no token' }
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ token: cachedToken })
      })
      cachedToken = null
      return { ok: true }
    } catch (error) {
      console.error('[push] تعذّر إلغاء التسجيل:', error)
      return fail('تعذّر إلغاء تسجيل الجهاز')
    }
  }

  /**
   * حالة الجهاز الحالية — يستخدمها زر التفعيل ليعرض النص الصحيح عند
   * تحميل الصفحة، فلا يقول «تفعيل» لمستخدم مُفعِّل أصلًا.
   */
  const pushState = () => ({
    configured: isConfigured(),
    supported: support().ok,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  })

  window.enableDevicePush = enableDevicePush
  window.disableDevicePush = disableDevicePush
  window.pushState = pushState
})()
