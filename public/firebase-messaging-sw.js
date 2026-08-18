/**
 * Firebase Cloud Messaging — Service Worker
 *
 * يجب أن يبقى هذا الملف في جذر النطاق (/firebase-messaging-sw.js): عامل
 * الخدمة لا يستطيع التحكّم إلا في المسارات داخل نطاقه، و FCM يبحث عن هذا
 * الاسم في الجذر تحديدًا. نقله إلى /static/ يعني توقّف الـ Push كليًا.
 *
 * يُستخدم إصدار compat من الـ SDK لأن عوامل الخدمة الكلاسيكية
 * (importScripts) لا تدعم وحدات ES، وتسجيل العامل كـ module غير مدعوم
 * على Safari وهو المتصفح الأهم هنا (مستخدمو iOS).
 */

/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js')

/**
 * إعدادات Firebase تُمرَّر عبر معاملات الرابط عند التسجيل، لا مكتوبة هنا.
 *
 * السبب: هذا ملف ثابت داخل public/ لا يمرّ على السيرفر، فلا يمكنه قراءة
 * متغيّرات البيئة. الحلّ البديل (كتابة المفاتيح داخل الملف) يعني تثبيت
 * إعدادات مشروع Firebase في المستودع، وتغييرها لاحقًا يتطلّب تعديل كود.
 *
 * هذه المفاتيح عامة بطبيعتها (تظهر في أي صفحة تستخدم Firebase على العميل)
 * فلا يوجد تسريب سرّي هنا — الحماية الحقيقية في قواعد Firestore.
 */
const params = new URL(self.location.href).searchParams
const firebaseConfig = {
  apiKey: params.get('apiKey') || '',
  authDomain: params.get('authDomain') || '',
  projectId: params.get('projectId') || '',
  storageBucket: params.get('storageBucket') || '',
  messagingSenderId: params.get('messagingSenderId') || '',
  appId: params.get('appId') || ''
}

const DEFAULT_ICON = '/static/icon-192.png'
const BADGE = '/static/icon-192.png'

if (firebaseConfig.projectId && firebaseConfig.messagingSenderId) {
  firebase.initializeApp(firebaseConfig)
  const messaging = firebase.messaging()

  /**
   * الرسائل تُرسل كـ data-only من السيرفر (لا حقل notification)، لذلك
   * المتصفح لا يعرض شيئًا تلقائيًا ونحن نبني الإشعار هنا.
   *
   * الفائدة: لو أرسلنا حقل notification لعرض المتصفح إشعاره الخاص
   * *بالإضافة* إلى إشعارنا في بعض الإصدارات، فيرى المستخدم نفس الرسالة
   * مرتين. البناء اليدوي يمنع ذلك ويسمح أيضًا بأزرار الإجراءات.
   */
  messaging.onBackgroundMessage((payload) => {
    const d = (payload && payload.data) || {}
    const title = d.title || 'مؤسسة الدكتور عمر هشام الخيرية'

    return self.registration.showNotification(title, {
      body: d.body || '',
      icon: d.icon || DEFAULT_ICON,
      badge: BADGE,
      // dir/lang يضمنان عرض النص العربي بالاتجاه الصحيح في مركز إشعارات
      // النظام، وإلا ظهرت علامات الترقيم في الطرف الخاطئ.
      dir: 'rtl',
      lang: 'ar',
      tag: d.tag || 'general',
      // renotify مع tag: الإشعار الجديد يستبدل القديم من نفس النوع لكن
      // ينبّه المستخدم مرة أخرى — بدونها يُستبدل الإشعار بصمت تام.
      renotify: true,
      data: { url: d.url || '/notifications' },
      actions: [{ action: 'open', title: 'عرض' }]
    })
  })
}

/**
 * الضغط على الإشعار.
 *
 * نحاول تركيز تبويب مفتوح على نفس النطاق بدل فتح تبويب جديد: المستخدم
 * الذي ضغط عشرة إشعارات لا يريد عشرة تبويبات للموقع نفسه.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const target = (event.notification.data && event.notification.data.url) || '/notifications'

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })

    let targetPath = target
    try {
      targetPath = new URL(target, self.location.origin).pathname
    } catch (_) { /* رابط غير صالح — نُبقي القيمة كما هي */ }

    for (const client of all) {
      try {
        if (new URL(client.url).origin !== self.location.origin) continue
        await client.focus()
        // التوجيه بعد التركيز: التبويب قد يكون على صفحة أخرى تمامًا.
        if ('navigate' in client) await client.navigate(targetPath)
        return
      } catch (_) { /* التبويب أُغلق بين الاستعلام والتركيز */ }
    }

    await self.clients.openWindow(target)
  })())
})

// التنشيط الفوري: بدونهما يبقى العامل القديم مسيطرًا حتى يُغلق المستخدم
// كل تبويبات الموقع، فلا تظهر إصلاحات هذا الملف إلا بعد أيام.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
