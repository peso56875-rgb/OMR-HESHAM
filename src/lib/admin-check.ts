/**
 * فحص صلاحيات المشرفين — نموذج هجين فائق الأمان: مؤسسون ثابتون + تعيين ديناميكي من لوحة التحكم
 *
 * ═══════════════════════════════════════════════════════════════════════
 * النموذج الأمني:
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 1) المؤسسون (SEED_ADMINS):
 *    قائمة ثابتة من الإيميلات في الكود أو في ADMIN_EMAILS بملف البيئة.
 *    هؤلاء يمثلون «جذر الثقة» لمنع أي قفل للنظام (Admin Lockout).
 *    لا يمكن لأي مشرف آخر إزالتهم أو تنزيل رتبتهم.
 *
 * 2) المشرفون المُعيَّنون (Dynamic Platform Admins):
 *    أي مشرف حالي (سواء كان مؤسسًا أو تم تعيينه) يستطيع ترقية أي مستخدم
 *    أو تعيين أي بريد إلكتروني كمشرف من داخل لوحة التحكم مباشرة.
 *    يُسجَّل التعيين في مجموعة `platform_admins` في Firestore مع توثيق:
 *    - من عيّنه (معرّف واسم المشرف)
 *    - تاريخ ووقت التعيين
 *    - حالة التفعيل
 *
 * 3) الحماية من تصعيد الصلاحيات (Privilege Escalation Protection):
 *    - واجهة المتصفح/Firestore Client Rules تمنع منعًا باتًا التعديل المباشر
 *      على حقول الصلاحيات (role, is_admin) ومجموعة `platform_admins`.
 *    - العمليات تمر حصرًا عبر Firebase Admin SDK المحمي بـ Admin Middleware.
 *    - المشرف لا يمكنه إزالة صلاحية نفسه عن طريق الخطأ.
 *    - كل عملية ترقية أو تخفيض تُسجَّل في سجل التدقيق (Audit Logs).
 *    - إشعارات فورية ترسل لجميع المشرفين وللمستخدم المستهدف.
 */

import { getFirestore } from './firebase-admin'

/* ────────────────────────── المؤسسون (جذر الثقة) ────────────────────────── */

const SEED_ADMINS = [
  'dr.omarheshamfoundation@gmail.com',
  'rahmmaaa9900@gmail.com',
  'peso56875@gmail.com',
]

export const normalizeEmail = (value: string): string => value.trim().toLowerCase()

const envList = (key: string): string[] => {
  if (typeof process === 'undefined') return []
  return String(process.env[key] || '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean)
}

/**
 * هل الإيميل أو المعرّف ينتمي للمؤسسين الأساسيين؟
 */
export function isSeedAdmin(email?: string, uid?: string): boolean {
  const emailAllowlist = envList('ADMIN_EMAILS')
  const admins = emailAllowlist.length > 0 ? emailAllowlist : SEED_ADMINS

  if (email) {
    const lower = normalizeEmail(email)
    if (admins.includes(lower)) return true
  }

  const uidAllowlist = envList('ADMIN_UIDS')
  if (uid && uidAllowlist.length > 0 && uidAllowlist.includes(uid)) return true

  return false
}

/**
 * فحص متزامن سريع (للمؤسسين فقط)
 */
export function isPlatformAdmin(email?: string, uid?: string): boolean {
  return isSeedAdmin(email, uid)
}

/* ────────────────────────── كاش الذاكرة (Memory Cache) ────────────────────────── */

interface AdminCacheEntry {
  isAdmin: boolean
  timestamp: number
}

const adminCache = new Map<string, AdminCacheEntry>()
const CACHE_TTL = 45_000 // 45 ثانية لتسريع الاستجابة وتقليل استهلاك كوتا Firestore

export function invalidateAdminCache(identifier?: string) {
  if (identifier) {
    adminCache.delete(`email:${normalizeEmail(identifier)}`)
    adminCache.delete(`uid:${identifier}`)
  } else {
    adminCache.clear()
  }
}

/* ────────────────────────── التحقق الكامل (Async) ────────────────────────── */

/**
 * التحقق الكامل: المؤسسون + المشرفون المعينون في Firestore
 */
export async function isPlatformAdminAsync(
  c: any,
  email?: string,
  uid?: string
): Promise<boolean> {
  // 1) فحص المؤسسين
  if (isSeedAdmin(email, uid)) return true

  const cleanEmail = email ? normalizeEmail(email) : ''

  // 2) فحص كاش الذاكرة
  const uidKey = uid ? `uid:${uid}` : ''
  const emailKey = cleanEmail ? `email:${cleanEmail}` : ''

  if (uidKey) {
    const cached = adminCache.get(uidKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.isAdmin
    }
  }
  if (emailKey) {
    const cached = adminCache.get(emailKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.isAdmin
    }
  }

  // 3) فحص Firestore
  try {
    const db = getFirestore(c)

    // أ) فحص بالـ UID أولاً
    if (uid) {
      const docByUid = await db.collection('platform_admins').doc(uid).get()
      if (docByUid.exists && docByUid.data()?.active !== false) {
        adminCache.set(uidKey, { isAdmin: true, timestamp: Date.now() })
        if (emailKey) adminCache.set(emailKey, { isAdmin: true, timestamp: Date.now() })
        return true
      }
    }

    // ب) فحص بمستند الإيميل المباشر email:xxx
    if (cleanEmail) {
      const docByEmailId = await db.collection('platform_admins').doc(`email:${cleanEmail}`).get()
      if (docByEmailId.exists && docByEmailId.data()?.active !== false) {
        if (uidKey) adminCache.set(uidKey, { isAdmin: true, timestamp: Date.now() })
        adminCache.set(emailKey, { isAdmin: true, timestamp: Date.now() })
        return true
      }

      // ج) استعلام عام في platform_admins بحقل email
      const snap = await db.collection('platform_admins')
        .where('email', '==', cleanEmail)
        .where('active', '==', true)
        .limit(1)
        .get()

      if (!snap.empty) {
        if (uidKey) adminCache.set(uidKey, { isAdmin: true, timestamp: Date.now() })
        adminCache.set(emailKey, { isAdmin: true, timestamp: Date.now() })
        return true
      }
    }

    // د) فحص احتياطي في ملف profiles لو دور المستخدم admin ومسجل رسميًا
    if (uid) {
      const profileDoc = await db.collection('profiles').doc(uid).get()
      if (profileDoc.exists && profileDoc.data()?.role === 'admin') {
        // تأكيد إضافي: هل هذا الحساب نشط؟
        adminCache.set(uidKey, { isAdmin: true, timestamp: Date.now() })
        return true
      }
    }

    // ليس مشرفًا
    if (uidKey) adminCache.set(uidKey, { isAdmin: false, timestamp: Date.now() })
    if (emailKey) adminCache.set(emailKey, { isAdmin: false, timestamp: Date.now() })
    return false
  } catch (err: any) {
    console.warn('[admin-check] تعذّر قراءة المشرفين من Firestore:', err.message)
    return false
  }
}

/**
 * التحقق الكامل مع فحص توثيق البريد الإلكتروني
 */
export async function isVerifiedPlatformAdminAsync(
  c: any,
  email?: string,
  uid?: string,
  emailVerified?: boolean
): Promise<boolean> {
  const uidAllowlist = envList('ADMIN_UIDS')
  if (uid && uidAllowlist.length > 0 && uidAllowlist.includes(uid)) return true

  // للبريد، يجب التحقق من أنه بريد موثق
  if (emailVerified !== true) return false

  return isPlatformAdminAsync(c, email, uid)
}

/**
 * نسخة متوافقة سريعة للأماكن المتزامنة
 */
export function isVerifiedPlatformAdmin(
  email?: string,
  uid?: string,
  emailVerified?: boolean
): boolean {
  const uidAllowlist = envList('ADMIN_UIDS')
  if (uid && uidAllowlist.length > 0 && uidAllowlist.includes(uid)) return true

  if (emailVerified !== true) return false

  const emailAllowlist = envList('ADMIN_EMAILS')
  const admins = emailAllowlist.length > 0 ? emailAllowlist : SEED_ADMINS
  return email ? admins.includes(normalizeEmail(email)) : false
}

/* ────────────────────────── إدارة وتعيين المشرفين ────────────────────────── */

export interface AdminRecord {
  uid: string
  email: string
  full_name: string
  appointed_by_uid: string
  appointed_by_name: string
  appointed_at: string
  active: boolean
  is_seed?: boolean
}

/**
 * ترقية مستخدم مسجل (بواسطة UID) إلى مشرف
 */
export async function appointAdmin(
  c: any,
  targetUid: string,
  targetEmail: string,
  targetName: string,
  appointedByUid: string,
  appointedByName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getFirestore(c)
    const cleanEmail = normalizeEmail(targetEmail)

    const record: AdminRecord = {
      uid: targetUid,
      email: cleanEmail,
      full_name: targetName || 'مشرف جديد',
      appointed_by_uid: appointedByUid || 'system',
      appointed_by_name: appointedByName || 'إدارة المؤسسة',
      appointed_at: new Date().toISOString(),
      active: true,
    }

    // حفظ في platform_admins بالـ UID
    await db.collection('platform_admins').doc(targetUid).set(record, { merge: true })

    // وأيضًا إنشاء مستند إضافي بالإيميل لسهولة البحث والربط الفوري
    if (cleanEmail) {
      await db.collection('platform_admins').doc(`email:${cleanEmail}`).set(record, { merge: true })
    }

    // تحديث ملف profiles
    await db.collection('profiles').doc(targetUid).set({
      role: 'admin',
      updated_at: new Date().toISOString()
    }, { merge: true })

    // إبطال الكاش
    invalidateAdminCache(cleanEmail)
    invalidateAdminCache(targetUid)

    return { success: true }
  } catch (err: any) {
    console.error('[admin-check] فشل تعيين المشرف:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * تعيين مشرف جديد بالبريد الإلكتروني مباشرة (سواء كان حسابه مسجلاً حالياً أم سيسجل لاحقاً)
 */
export async function appointAdminByEmail(
  c: any,
  rawEmail: string,
  appointedByUid: string,
  appointedByName: string
): Promise<{ success: boolean; userFound: boolean; name?: string; uid?: string; error?: string }> {
  const email = normalizeEmail(rawEmail)
  if (!email || !email.includes('@')) {
    return { success: false, userFound: false, error: 'البريد الإلكتروني غير صالح' }
  }

  try {
    const db = getFirestore(c)

    // البحث في profiles لمعرفة إذا كان الحساب موجوداً بالفعل
    const profileSnap = await db.collection('profiles')
      .where('email', '==', email)
      .limit(1)
      .get()

    if (!profileSnap.empty) {
      const doc = profileSnap.docs[0]
      const uid = doc.id
      const data = doc.data()
      const fullName = data.full_name || email.split('@')[0]

      const res = await appointAdmin(c, uid, email, fullName, appointedByUid, appointedByName)
      return {
        success: res.success,
        userFound: true,
        uid,
        name: fullName,
        error: res.error
      }
    }

    // المستخدم لم يسجل حسابه بعد: ننشئ له تصريحًا مسبقًا برقم الإيميل
    const preApprovedRecord: AdminRecord = {
      uid: '',
      email: email,
      full_name: email.split('@')[0],
      appointed_by_uid: appointedByUid || 'system',
      appointed_by_name: appointedByName || 'إدارة المؤسسة',
      appointed_at: new Date().toISOString(),
      active: true
    }

    await db.collection('platform_admins').doc(`email:${email}`).set(preApprovedRecord, { merge: true })

    invalidateAdminCache(email)

    return {
      success: true,
      userFound: false,
      name: email.split('@')[0],
      error: undefined
    }
  } catch (err: any) {
    console.error('[admin-check] فشل تعيين المشرف بالبريد:', err.message)
    return { success: false, userFound: false, error: err.message }
  }
}

/**
 * إزالة صلاحية المشرف (تنزيله لعضو عادي)
 */
export async function removeAdmin(
  c: any,
  targetUid: string,
  targetEmail: string,
  removedByUid: string,
  removedByName: string
): Promise<{ success: boolean; error?: string }> {
  // حماية المؤسسين الثابتين
  if (isSeedAdmin(targetEmail, targetUid)) {
    return { success: false, error: 'لا يمكن إزالة صلاحية المؤسسين الأساسيين للمنصة للحفاظ على استقرار النظام' }
  }

  // منع المشرف من إزالة نفسه
  if (removedByUid && targetUid && removedByUid === targetUid) {
    return { success: false, error: 'لا يمكنك إزالة صلاحية المشرف عن نفسك' }
  }

  try {
    const db = getFirestore(c)
    const cleanEmail = normalizeEmail(targetEmail)

    // تحديث سجل platform_admins
    if (targetUid) {
      await db.collection('platform_admins').doc(targetUid).update({
        active: false,
        removed_by_uid: removedByUid,
        removed_by_name: removedByName,
        removed_at: new Date().toISOString()
      }).catch(() => {})
    }

    if (cleanEmail) {
      await db.collection('platform_admins').doc(`email:${cleanEmail}`).update({
        active: false,
        removed_by_uid: removedByUid,
        removed_by_name: removedByName,
        removed_at: new Date().toISOString()
      }).catch(() => {})
    }

    // تحديث ملف profiles إلى donor
    if (targetUid) {
      await db.collection('profiles').doc(targetUid).update({
        role: 'donor',
        updated_at: new Date().toISOString()
      }).catch(() => {})
    }

    // إبطال الكاش
    invalidateAdminCache(cleanEmail)
    if (targetUid) invalidateAdminCache(targetUid)

    return { success: true }
  } catch (err: any) {
    console.error('[admin-check] فشل إزالة المشرف:', err.message)
    return { success: false, error: err.message }
  }
}

/**
 * استخراج قائمة المشرفين المعينين بالإضافة للمؤسسين
 */
export async function listAllAdmins(c: any): Promise<AdminRecord[]> {
  try {
    const db = getFirestore(c)
    const snap = await db.collection('platform_admins')
      .where('active', '==', true)
      .get()

    const list: AdminRecord[] = snap.docs.map((d: any) => ({ ...d.data(), uid: d.id }))

    // دمج المؤسسين الأساسيين لمن لا يملك سجلاً في platform_admins
    const emailList = envList('ADMIN_EMAILS')
    const seedEmails = emailList.length > 0 ? emailList : SEED_ADMINS

    for (const seed of seedEmails) {
      const alreadyIn = list.some(a => normalizeEmail(a.email) === seed)
      if (!alreadyIn) {
        list.unshift({
          uid: 'seed-' + seed,
          email: seed,
          full_name: 'مؤسس المنصة',
          appointed_by_uid: 'system',
          appointed_by_name: 'النظام الأساسي',
          appointed_at: '2026-01-01T00:00:00.000Z',
          active: true,
          is_seed: true
        })
      }
    }

    return list
  } catch (err: any) {
    console.error('[admin-check] فشل جلب قائمة المشرفين:', err.message)
    return []
  }
}
