import { Hono } from 'hono'
import { uploadToCloudinary } from '../lib/cloudinary'
import { adminMiddleware } from './middleware'

export const upload = new Hono()

// Upload file to Cloudinary (Admin only)
upload.post('/', adminMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body.file

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'لم يتم اختيار ملف' }, 400)
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf']
    if (!allowedTypes.some(t => file.type.startsWith(t.split('/')[0]) || file.type === t)) {
      return c.json({ error: 'نوع الملف غير مدعوم. الأنواع المسموحة: صور، فيديو، PDF' }, 400)
    }

    // Max size: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' }, 400)
    }

    const url = await uploadToCloudinary(file, c)
    return c.json({ success: true, url })
  } catch (error: any) {
    console.error('Upload error:', error.message)
    return c.json({ error: 'فشل رفع الملف: ' + error.message }, 500)
  }
})
