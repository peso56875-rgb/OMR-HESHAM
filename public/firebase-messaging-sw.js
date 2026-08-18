/**
 * ══════════════ Service Worker لنظام الإشعارات الفورية (Web Push) ══════════════
 *
 * يعمل في الخلفية لاستقبال الإشعارات حتى والموقع مغلق بالكامل.
 * يدعم كلا من إشعارات Firebase Cloud Messaging والمعيار المباشر لـ Web Push API.
 */

/* global self, clients */

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// استقبال رسائل الدفع (Push Event)
self.addEventListener('push', (event) => {
  let data = {}
  try {
    if (event.data) {
      data = event.data.json()
    }
  } catch (e) {
    try {
      data = { body: event.data.text() }
    } catch (_) {}
  }

  // دعم بنية FCM data payload وبنية Web Push القياسية
  const payload = data.data || data.notification || data || {}
  const title = payload.title || 'مؤسسة الدكتور عمر هشام'
  const body = payload.body || 'لديك إشعار جديد في حسابك.'
  const icon = payload.icon || '/static/foundation-logo-256.png'
  const badge = '/static/foundation-logo-256.png'
  const tag = payload.tag || 'omar-foundation-notification'
  const url = payload.url || payload.link || '/notifications'

  const options = {
    body: body,
    icon: icon,
    badge: badge,
    tag: tag,
    dir: 'rtl',
    lang: 'ar',
    renotify: true,
    data: {
      url: url,
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'open_url',
        title: 'عرض الإشعار'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// الضغط على الإشعار (Notification Click)
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = (event.notification.data && event.notification.data.url) || '/notifications'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // إذا كان هناك تبويب مفتوح للموقع بالفعل، نركّز عليه وننقله للرابط
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl)
          }
          return client.focus()
        }
      }
      // إذا لم يكن مفتوحًا، نفتح نافذة جديدة بالرابط المطلوب
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
