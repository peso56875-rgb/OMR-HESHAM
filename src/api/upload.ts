import { Hono } from 'hono'
import { adminMiddleware } from './middleware'
import { storeMediaFile, storageBucketCandidates, cloudinaryConfigured } from '../lib/storage'

export const upload = new Hono()

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_PREFIXES = ['image/', 'video/']
const ALLOWED_EXACT = ['application/pdf']
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'bmp', 'mp4', 'webm', 'pdf']

const isAllowed = (file: File): boolean => {
  const type = (file.type || '').toLowerCase()
  if (type) {
    if (ALLOWED_PREFIXES.some(prefix => type.startsWith(prefix))) return true
    if (ALLOWED_EXACT.includes(type)) return true
    return false
  }
  // Some browsers send an empty mime type — fall back to the extension.
  const ext = String((file as any).name || '').split('.').pop()?.toLowerCase() || ''
  return ALLOWED_EXTENSIONS.includes(ext)
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

    if (!isAllowed(file)) {
      return c.json({ error: 'نوع الملف غير مدعوم. الأنواع المسموحة: صور، فيديو، PDF' }, 400)
    }

    if (file.size > MAX_BYTES) {
      return c.json({ error: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' }, 413)
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

/** Public image upload endpoint (for volunteer photos & avatars). Max 5MB images. */
upload.post('/public', async (c) => {
  try {
    const body = await c.req.parseBody()
    const candidate = body.file || body.image || body.avatar || body.upload || body.media || body.avatar_file
    const file = Array.isArray(candidate) ? candidate[0] : candidate

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'لم يتم اختيار صورة' }, 400)
    }

    if (file.size === 0) {
      return c.json({ error: 'الملف فارغ، فضلاً اختر صورة صالحة' }, 400)
    }

    const type = (file.type || '').toLowerCase()
    const ext = String(file.name || '').split('.').pop()?.toLowerCase() || ''
    const isImage = type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext)

    if (!isImage) {
      return c.json({ error: 'الرفع العام مخصص للصور فقط (JPG, PNG, WEBP)' }, 400)
    }

    const PUBLIC_MAX_BYTES = 5 * 1024 * 1024
    if (file.size > PUBLIC_MAX_BYTES) {
      return c.json({ error: 'حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت' }, 413)
    }

    const stored = await storeMediaFile(file, c)

    return c.json({
      success: true,
      url: stored.url,
      secure_url: stored.url,
      provider: stored.provider
    })
  } catch (error: any) {
    console.error('Public upload error:', error?.message)
    return c.json({ error: 'فشل رفع الصورة: ' + (error?.message || 'خطأ غير معروف') }, 500)
  }
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
