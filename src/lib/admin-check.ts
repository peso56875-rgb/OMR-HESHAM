/**
 * فحص صلاحيات المشرفين — قائمة بيضاء صارمة بالبريد الرسمي فقط
 *
 * 🔴 الثغرة القديمة (C1):
 * كانت الصلاحية تُمنح لأي بريد يبدأ بـ "peso" أو "admin"، أو يحتوي
 * "omarhesham" أو "abdelhalem" — أي أن أي شخص ينشئ Gmail مطابقًا
 * (مثل "admin99@gmail.com" أو "peso123@gmail.com") كان يصبح مشرفًا
 * تلقائيًا بمجرد تسجيل الدخول عبر Google.
 *
 * ✅ الإصلاح:
 * الصلاحية تُمنح فقط للبريد المذكور حرفيًا في متغير البيئة ADMIN_EMAILS
 * (قائمة برسائل مفصولة بفواصل). لو لم يُضبط المتغير، يُستخدم البريدان
 * الرسميان الأساسيان كافتراضي آمن — وليس أنماطًا قابلة للاحتيال.
 */
const OFFICIAL_ADMINS = [
  'dr.omarheshamfoundation@gmail.com',
  'rahmmaaa9900@gmail.com',
]

const normalize = (value: string): string => value.trim().toLowerCase()

const envList = (key: string): string[] => {
  if (typeof process === 'undefined') return []
  return String(process.env[key] || '')
    .split(',')
    .map(normalize)
    .filter(Boolean)
}

/**
 * @param email بريد المستخدم من التوكن (اختياري إذا لم يتوفر)
 * @param uid    معرّف Firebase Auth (اختياري — قائمة ADMIN_UIDS للمشرفين
 *               الذين قد لا يتوفر بريدهم في Claims)
 */
export function isPlatformAdmin(email?: string, uid?: string): boolean {
  const emailAllowlist = envList('ADMIN_EMAILS')
  const admins = emailAllowlist.length > 0 ? emailAllowlist : OFFICIAL_ADMINS

  if (email) {
    const lower = normalize(email)
    if (admins.includes(lower)) return true
  }

  const uidAllowlist = envList('ADMIN_UIDS')
  if (uid && uidAllowlist.length > 0 && uidAllowlist.includes(uid)) return true

  return false
}