/**
 * ═══════════════════ مهمة الفحص والصيانة الدورية (Daily Notification Digest & Cleanup) ═══════════════════
 *
 * يُشغَّل دوريًا (Cron) للقيام بالمهام التالية:
 *  1. فحص بطاقات المتطوعين التي تنتهي صلاحيتها قريبًا (30 يومًا، 7 أيام) وإشعار المتطوع والإدارة.
 *  2. تنظيف وحذف الإشعارات القديمة المقروءة (> 90 يومًا) للحفاظ على سرعة الاستعلامات والحد المجاني.
 *  3. تنظيف توكنات الأجهزة غير النشطة (> 180 يومًا).
 */

import { getFirestore } from '../../src/lib/firebase-admin.ts'
import { notify, notifyAdmins } from '../../src/lib/notifications.ts'
import { getEmailConfig, volunteerCardStatus } from '../../src/lib/email.ts'

export async function runNotificationDigest(c) {
  const db = getFirestore(c)
  const now = new Date()
  const stats = {
    volunteersExpiring30d: 0,
    volunteersExpiring7d: 0,
    prunedNotifications: 0,
    prunedTokens: 0
  }

  console.log('[cron:notifications] بدء مهمة الفحص والصيانة اليومية...')

  try {
    // ─── 1. فحص انتهاء صلاحية بطاقات المتطوعين ───
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const volSnap = await db.collection('volunteers')
      .where('status', '==', 'approved')
      .where('is_active', '==', true)
      .get()

    const emailCfg = getEmailConfig(c)

    for (const doc of volSnap.docs) {
      const vol = doc.data()
      if (!vol.expires_at) continue // صلاحية مفتوحة

      const expiryDate = new Date(vol.expires_at)
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // تنبيه قبل 30 يومًا
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 29) {
        stats.volunteersExpiring30d++
        if (vol.profile_id) {
          await notify(c, {
            user_id: vol.profile_id,
            type: 'volunteer_card_expiring',
            title: 'تنبيه: اقتراب موعد تجديد كارنيه التطوع',
            body: `تبقى 30 يومًا على انتهاء صلاحية بطاقة التطوع الخاصة بك (${vol.volunteer_code}). يرجى مراجعة الإدارة للتجديد.`,
            link: '/profile',
            meta: { volunteer_id: doc.id, expires_at: vol.expires_at }
          })
        }
      }

      // تنبيه قبل 7 أيام (عاجل)
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 6) {
        stats.volunteersExpiring7d++
        if (vol.profile_id) {
          await notify(c, {
            user_id: vol.profile_id,
            type: 'volunteer_card_expiring',
            priority: 'high',
            title: 'تنبيه عاجل: كارنيه التطوع ينتهي خلال أسبوع',
            body: `تنتهي صلاحية بطاقتك التطوعية خلال 7 أيام (${new Date(vol.expires_at).toLocaleDateString('ar-EG')}).`,
            link: '/profile',
            meta: { volunteer_id: doc.id, expires_at: vol.expires_at }
          })
        }

        // إشعار الإدارة
        await notifyAdmins(c, {
          type: 'volunteer_card_expiring_admin',
          title: `كارنيه متطوع ينتهي قريبًا: ${vol.full_name}`,
          body: `كود المتطوع: ${vol.volunteer_code} — ينتهي في: ${new Date(vol.expires_at).toLocaleDateString('ar-EG')}`,
          link: '/dashboard?view=volunteers',
          meta: { volunteer_id: doc.id, volunteer_code: vol.volunteer_code }
        })
      }
    }

    // ─── 2. تنظيف الإشعارات القديمة المقروءة (> 90 يومًا) ───
    const cutoff90d = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const oldNotifsSnap = await db.collection('notifications')
      .where('is_read', '==', true)
      .where('created_at', '<', cutoff90d)
      .limit(500)
      .get()

    if (!oldNotifsSnap.empty) {
      const batch = db.batch()
      oldNotifsSnap.docs.forEach((d) => batch.delete(d.ref))
      await batch.commit()
      stats.prunedNotifications = oldNotifsSnap.size
    }

    // ─── 3. تنظيف توكنات الأجهزة غير النشطة (> 180 يومًا) ───
    const cutoff180d = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString()
    const oldTokensSnap = await db.collection('push_tokens')
      .where('last_seen_at', '<', cutoff180d)
      .limit(500)
      .get()

    if (!oldTokensSnap.empty) {
      const batch = db.batch()
      oldTokensSnap.docs.forEach((d) => batch.delete(d.ref))
      await batch.commit()
      stats.prunedTokens = oldTokensSnap.size
    }

    console.log('[cron:notifications] اكتملت المهمة بنجاح:', stats)
    return { ok: true, stats }
  } catch (error) {
    console.error('[cron:notifications] فشل تنفيذ المهمة:', error)
    return { ok: false, error: error.message }
  }
}
