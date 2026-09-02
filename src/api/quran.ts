import { Hono } from 'hono'

const quranApi = new Hono()

// In-memory cache for surahs and tafsirs
const surahCache = new Map<number, any[]>()
const tafsirCache = new Map<string, string>()

// 1. Endpoint to get Surah text with high-availability multi-source fallbacks
quranApi.get('/surah/:number', async (c) => {
  const num = parseInt(c.req.param('number'), 10)
  if (isNaN(num) || num < 1 || num > 114) {
    return c.json({ success: false, error: 'رقم السورة غير صحيح' }, 400)
  }

  // Check in-memory cache
  if (surahCache.has(num)) {
    c.header('Cache-Control', 'public, max-age=86400, s-maxage=604800')
    return c.json({ success: true, surah: num, ayahs: surahCache.get(num) })
  }

  // Strategy 1: Try Quran.com v4 API
  try {
    const qdcRes = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${num}`, {
      signal: AbortSignal.timeout(6000)
    })
    if (qdcRes.ok) {
      const qdcData = (await qdcRes.json()) as { verses?: Array<{ id: number; verse_key: string; text_uthmani: string }> }
      if (qdcData && Array.isArray(qdcData.verses) && qdcData.verses.length > 0) {
        const ayahs = qdcData.verses.map((v, idx) => ({
          numberInSurah: idx + 1,
          text: v.text_uthmani
        }))

        // Strip initial bismillah from ayah 1 if not Al-Fatihah
        if (num !== 1 && ayahs.length > 0) {
          const bismillahStr = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'
          if (ayahs[0].text.startsWith(bismillahStr)) {
            ayahs[0].text = ayahs[0].text.replace(bismillahStr, '').trim()
          }
        }

        surahCache.set(num, ayahs)
        c.header('Cache-Control', 'public, max-age=86400, s-maxage=604800')
        return c.json({ success: true, surah: num, ayahs })
      }
    }
  } catch (_) {}

  // Strategy 2: Try Al-Quran Cloud API
  try {
    const aqcRes = await fetch(`https://api.alquran.cloud/v1/surah/${num}/quran-uthmani`, {
      signal: AbortSignal.timeout(6000)
    })
    if (aqcRes.ok) {
      const aqcData = (await aqcRes.json()) as { data?: { ayahs?: Array<{ numberInSurah: number; text: string }> } }
      if (aqcData && aqcData.data && Array.isArray(aqcData.data.ayahs) && aqcData.data.ayahs.length > 0) {
        const ayahs = aqcData.data.ayahs.map((a) => ({
          numberInSurah: a.numberInSurah,
          text: a.text
        }))

        if (num !== 1 && ayahs.length > 0) {
          const bismillahStr = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
          if (ayahs[0].text.startsWith(bismillahStr)) {
            ayahs[0].text = ayahs[0].text.replace(bismillahStr, '').trim()
          }
        }

        surahCache.set(num, ayahs)
        c.header('Cache-Control', 'public, max-age=86400, s-maxage=604800')
        return c.json({ success: true, surah: num, ayahs })
      }
    }
  } catch (_) {}

  return c.json({ success: false, error: 'تعذر جلب نص السورة حالياً' }, 502)
})

// 2. Endpoint to get Tafsir Al-Muyassar
quranApi.get('/tafsir/:surah/:ayah', async (c) => {
  const surah = parseInt(c.req.param('surah'), 10)
  const ayah = parseInt(c.req.param('ayah'), 10)
  if (isNaN(surah) || isNaN(ayah)) {
    return c.json({ success: false, error: 'بيانات الآية غير صحيحة' }, 400)
  }

  const cacheKey = `${surah}:${ayah}`
  if (tafsirCache.has(cacheKey)) {
    c.header('Cache-Control', 'public, max-age=86400, s-maxage=604800')
    return c.json({ success: true, surah, ayah, tafsir: tafsirCache.get(cacheKey) })
  }

  // Strategy 1: QuranEnc
  try {
    const qeRes = await fetch(`https://quranenc.com/api/v1/translation/aya/arabic_moyassar/${surah}/${ayah}`, {
      signal: AbortSignal.timeout(5000)
    })
    if (qeRes.ok) {
      const qeData = (await qeRes.json()) as { result?: { translation?: string } }
      if (qeData && qeData.result && qeData.result.translation) {
        const text = qeData.result.translation
        tafsirCache.set(cacheKey, text)
        c.header('Cache-Control', 'public, max-age=86400, s-maxage=604800')
        return c.json({ success: true, surah, ayah, tafsir: text })
      }
    }
  } catch (_) {}

  // Strategy 2: Al-Quran Cloud
  try {
    const aqcRes = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar.muyassar`, {
      signal: AbortSignal.timeout(5000)
    })
    if (aqcRes.ok) {
      const aqcData = (await aqcRes.json()) as { data?: { text?: string } }
      if (aqcData && aqcData.data && aqcData.data.text) {
        const text = aqcData.data.text
        tafsirCache.set(cacheKey, text)
        c.header('Cache-Control', 'public, max-age=86400, s-maxage=604800')
        return c.json({ success: true, surah, ayah, tafsir: text })
      }
    }
  } catch (_) {}

  return c.json({ success: false, error: 'تعذر جلب التفسير حالياً' }, 502)
})

export { quranApi }
