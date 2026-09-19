import { Hono } from 'hono'
import { readStoredMedia } from '../lib/storage'

export const media = new Hono()

/**
 * Serves files kept in the Firestore fallback store. Public on purpose: these
 * are the images rendered on the public site.
 */
media.get('/:id', async (c) => {
  const id = c.req.param('id')

  if (!id || !/^[A-Za-z0-9_-]{6,64}$/.test(id)) {
    return c.json({ error: 'معرّف الملف غير صالح' }, 400)
  }

  try {
    const stored = await readStoredMedia(id, c)
    if (!stored) {
      return c.json({ error: 'الملف غير موجود' }, 404)
    }

    return new Response(stored.bytes as any, {
      status: 200,
      headers: {
        'Content-Type': stored.contentType,
        'Content-Length': String(stored.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        // ✅ (C3) حتى لو عُرض الملف مباشرة في تبويب (نوع قلنا إنه لن يُخزن
        // إلا بعد فحص بصمة)، بيئة sandbox تمنع تنفيذ أي سكربت داخل الصفحة
        // المعروضة. مع nosniff لا يمكن للمتصفح إعادة تفسير الملف كنوع آخر.
        'Content-Security-Policy': 'sandbox',
        // عرض داخل الصفحة لا تنزيل: صور المنصة تُعرض في <img>.
        'Content-Disposition': 'inline',
      },
    })
  } catch (error: any) {
    console.error('Media read error:', error?.message)
    return c.json({ error: 'فشل تحميل الملف' }, 500)
  }
})
