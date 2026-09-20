export const cleanText = (value: unknown, max = 200): string =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

export const cleanMultiline = (value: unknown, max = 2000): string =>
  String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max)

export const cleanEmail = (value: unknown): string =>
  cleanText(value, 254).toLowerCase()

/**
 * قائمة النطاقات المؤقتة والمهملة المحجوبة (Disposable / Temp-mail domains).
 * تمنع إغراق النشرة بحسابات وهمية وتمنع استخدام الخادم في هجمات البريد العشوائي.
 */
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'trashmail.com',
  'trashmail.net',
  'yopmail.com',
  'yopmail.fr',
  'dispostable.com',
  'getairmail.com',
  'mytemp.email',
  'fakeinbox.com',
  'throwawaymail.com',
  'maildrop.cc',
  'inboxkitten.com',
  'tempail.com',
  'mohmal.com',
  'nada.ltd',
  'crazymailing.com',
  'dropmail.me'
])

/**
 * تحقق صارم من صحة البريد الإلكتروني وفق معايير RFC 5322
 * مع استبعاد النطاقات المهملة والرموز غير الآمنة.
 */
export const isValidEmail = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false
  const email = value.trim().toLowerCase()
  if (email.length < 5 || email.length > 254) return false

  // فحص RFC 5322 معتمد
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  if (!emailRegex.test(email)) return false

  const parts = email.split('@')
  if (parts.length !== 2) return false
  const [local, domain] = parts
  if (!local || !domain || local.length > 64) return false
  if (local.includes('..') || domain.includes('..')) return false

  // التحقق من امتداد النطاق (TLD) ألا يقل عن حرفين
  const domainParts = domain.split('.')
  if (domainParts.length < 2) return false
  const tld = domainParts[domainParts.length - 1]
  if (!tld || tld.length < 2 || !/^[a-z]+$/.test(tld)) return false

  // حظر نطاقات البريد المؤقتة
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return false

  return true
}

export const cleanPhone = (value: unknown): string =>
  cleanText(value, 40).replace(/[^\d+\-\s()]/g, '').slice(0, 32)

/**
 * تنقية الروابط المدخلة مع فرض التحقق الصارم من البروتوكول الآمن.
 * يرفض تمامًا بروتوكولات javascript: و data: و vbscript: وأي مخطط غير http/https/مسار نسبي.
 */
export const cleanUrl = (value: unknown, max = 2048): string => {
  const cleaned = cleanText(value, max)
  if (!cleaned) return ''
  // مسار محلي آمن
  if (cleaned.startsWith('/') && !cleaned.startsWith('//') && !cleaned.startsWith('/\\')) {
    return cleaned
  }
  try {
    const parsed = new URL(cleaned)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString().slice(0, max)
    }
  } catch {
    // ليس رابطًا صالحًا
  }
  return ''
}

/**
 * إزالة وسوم HTML وأقواس < > تمامًا لمنع حقن الوسوم في الحقول النصية (مثل الأسماء والعناوين).
 */
export const stripHtml = (value: unknown, max = 200): string =>
  cleanText(value, max)
    .replace(/[<>]/g, '')
    .trim()

/**
 * تسلسل آمن لـ JSON داخل عناصر <script> في الـ HTML لمنع كسر الوسم عبر </script> (Script Tag Breakout XSS).
 */
export const safeJsonStringify = (value: unknown): string => {
  return JSON.stringify(value ?? '')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

/**
 * فحص أمان أسماء أيقونات FontAwesome
 * يسمح فقط بالفئات القياسية fa-[a-z0-9-]+ لمنع حقن كود XSS أو وسوم HTML
 */
export const isSafeFontAwesomeIcon = (icon: unknown): boolean => {
  if (!icon || typeof icon !== 'string') return false
  return /^fa-[a-z0-9-]+$/.test(icon.trim())
}

/**
 * تنقية الروابط لمنع هجمات XSS عبر بروتوكول javascript: أو data:
 * يقبل فقط المسارات المحلية الآمنة (/...) أو روابط HTTPS الصريحة
 */
export const safeHref = (url: unknown, fallback = '/notifications'): string => {
  const s = String(url ?? '').trim()
  if (!s || s === '#') return fallback
  if (s.startsWith('/') && !s.startsWith('//') && !s.startsWith('/\\')) {
    return s.slice(0, 500)
  }
  try {
    const parsed = new URL(s)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString().slice(0, 500)
    }
  } catch {
    // غير صالح
  }
  return fallback
}
