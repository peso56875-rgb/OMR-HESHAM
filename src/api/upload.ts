import { Hono } from 'hono'
import { adminMiddleware, rateLimiter } from './middleware'
import {
  storeMediaFile,
  storageBucketCandidates,
  cloudinaryConfigured,
  sniffFileType,
  SNIFF_IMAGE_TYPES,
  SNIFF_ALLOWED_TYPES,
} from '../lib/storage'

export const upload = new Hono()

const MAX_BYTES = 10 * 1024 * 1024

// ملاحظة أمنية (C3): `file.type` قادم من المتصفح ويمكن تزويره بالكامل، لذا
// لم يعد يُستخدم في القرار النهائي — القرار الآن مبني على بصمة الملف الفعلية
// (sniffFileType). أزلنا SVG نهائيًا لأنه نص قابل للتنفيذ (XSS) وليس له
// بصمة بايتات موثوقة، والرفع العام للصور فقط.
// ALLOWED_EXTENSIONS أُزيلت كلها: الامتداد قابل للتزوير ولا يضيف أمانًا بعد
// فحص البصمة، لكن أبقينا فحصًا رمزيًا للامتداد داخل safeFileName في storage.ts.
const isSniffedAllowed = (sniffed: string): boolean => SNIFF_ALLOWED_TYPES.includes(sniffed)
const isSniffedImage = (sniffed: string): boolean => SNIFF_IMAGE_TYPES.includes(sniffed)

/** يقرأ بايتات الملف ويفحص بصمته. يعيد النوع المكتشف أو سلسلة فارغة. */
const readSniffed = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer()
  return sniffFileType(Buffer.from(arrayBuffer))
}

/** Upload a file (admin only). Returns a public URL for the stored media. */
upload.post('/', adminMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody()

    // Accept several field names so any dashboard form works.
    const candidate = body.file || body.image || body.upload || body.media
    const file = Array.isArray(candidate) ? candidate[0] : candidate

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'لم يتم اختيار ملف' }, 400)
    }

    if (file.size === 0) {
      return c.json({ error: 'الملف فارغ، فضلاً اختر صورة صالحة' }, 400)
    }

    if (file.size > MAX_BYTES) {
      return c.json({ error: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' }, 413)
    }

    // ✅ الأمان (C3): رفض حسب البصمة الفعلية — أي ملف بلا بصمة معروفة
    // (مثل SVG أو HTML مقنّع) يُرفض حتى لو ادعى المتصفح أنه صورة.
    const sniffed = await readSniffed(file)
    if (!isSniffedAllowed(sniffed)) {
      return c.json(
        { error: 'نوع الملف غير مدعوم أو لا يطابق محتواه الفعلي. الأنواع المسموحة: JPG, PNG, WEBP, GIF, AVIF, BMP, MP4, WEBM, PDF' },
        400
      )
    }

    const stored = await storeMediaFile(file, c)

    if (stored.warnings.length) {
      console.warn('[upload] fallback used:', stored.provider, stored.warnings.join(' | '))
    }

    return c.json({
      success: true,
      url: stored.url,
      // Kept for backwards compatibility with the old Cloudinary response shape.
      secure_url: stored.url,
      provider: stored.provider,
      warnings: stored.warnings,
    })
  } catch (error: any) {
    console.error('Upload error:', error?.message)
    return c.json({ error: 'فشل رفع الملف: ' + (error?.message || 'خطأ غير معروف') }, 500)
  }
})

/**
 * ✅ الأمان: أُزيل مسار /public نهائيًا — نقطة هجوم إضافية بلا حاجة.
 * المسار الرئيسي / (admin-only) يغطي جميع حالات الاستخدام.
 * نُبقي المسار معرّفًا لمنع سقوط الطلبات على مسارات أخرى، لكن نرد 410 Gone.
 */
upload.post('/public', (c) => {
  return c.json({ error: 'تم إلغاء مسار الرفع العام. استخدم المسار الرئيسي /api/upload مع صلاحية مشرف.' }, 410)
})

/** Diagnostics so an admin can see which storage backends are usable. */
upload.get('/status', adminMiddleware, (c) => {
  const buckets = storageBucketCandidates(c)
  const cloudinary = cloudinaryConfigured(c)
  return c.json({
    // Order reflects the real fallback order used by storeMediaFile().
    order: ['cloudinary', 'firebase-storage', 'firestore'],
    cloudinary: { configured: cloudinary, primary: cloudinary },
    firebaseStorage: { configured: buckets.length > 0, buckets },
    firestoreFallback: { configured: true, maxSizeMb: 5 },
    maxUploadMb: MAX_BYTES / (1024 * 1024),
  })
})
