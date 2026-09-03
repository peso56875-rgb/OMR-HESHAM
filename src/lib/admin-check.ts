/**
 * فحص صلاحيات المشرفين والإدارة العليا للمنصة
 * يدعم كلاً من بريد المؤسسة الرسمي وحسابات المشرف الرئيسي المعتمدة
 */
export function isPlatformAdmin(email?: string, uid?: string): boolean {
  if (!email) return false
  const lower = email.toLowerCase().trim()
  return (
    lower.startsWith('peso') ||
    lower.includes('peso56875') ||
    lower === 'dr.omarheshamfoundation@gmail.com' ||
    lower === 'rahmmaaa9900@gmail.com' ||
    lower.startsWith('admin') ||
    lower.includes('omarhesham') ||
    lower.includes('abdelhalem')
  )
}
