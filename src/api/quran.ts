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

// 3. Endpoint to stream or proxy Surah Audio with multi-CDN fallback
const RECITER_AUDIO_MAP: Record<string, string[]> = {
  minshawi: [
    'https://server10.mp3quran.net/minsh/',
    'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/'
  ],
  minshawi_mujawwad: [
    'https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/',
    'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee_mujawwad/'
  ],
  abdulbasit: [
    'https://server7.mp3quran.net/basit/',
    'https://download.quranicaudio.com/quran/abdul_basit_murattal/'
  ],
  abdulbasit_mujawwad: [
    'https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/',
    'https://download.quranicaudio.com/quran/abdulbaset_mujawwad/'
  ],
  yasser: [
    'https://server11.mp3quran.net/yasser/',
    'https://download.quranicaudio.com/quran/yasser_ad-dussary/'
  ],
  husary: [
    'https://server13.mp3quran.net/husr/',
    'https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree/'
  ],
  afs: [
    'https://server8.mp3quran.net/afs/',
    'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/'
  ],
  ghamadi: [
    'https://server7.mp3quran.net/s_gmd/',
    'https://download.quranicaudio.com/quran/sa3d_al-ghaamidee/complete/'
  ],
  maher: [
    'https://server12.mp3quran.net/maher/',
    'https://download.quranicaudio.com/quran/maher_2/'
  ],
  ajmy: [
    'https://server10.mp3quran.net/ajm/',
    'https://download.quranicaudio.com/quran/ahmed_ibn_3ali_al-3ajamy/'
  ],
  shuraim: [
    'https://server7.mp3quran.net/shur/',
    'https://download.quranicaudio.com/quran/sa3ood_ash-shuraym/'
  ],
  hudhaify: [
    'https://server9.mp3quran.net/hthfi/',
    'https://download.quranicaudio.com/quran/ali_alhuthaify/'
  ]
}

quranApi.get('/audio/:reciter/:surah', async (c) => {
  const reciter = c.req.param('reciter')
  let surah = c.req.param('surah').replace('.mp3', '')
  const surahNum = parseInt(surah, 10)
  if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
    return c.text('Invalid Surah Number', 400)
  }

  const isDownload = c.req.query('download') === '1'
  const numStr = (surahNum < 10 ? '00' : (surahNum < 100 ? '0' : '')) + surahNum
  const baseUrls = RECITER_AUDIO_MAP[reciter] || RECITER_AUDIO_MAP.minshawi

  for (const base of baseUrls) {
    try {
      const audioUrl = `${base}${numStr}.mp3`
      const res = await fetch(audioUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        signal: AbortSignal.timeout(6000)
      })
      if (res.ok && res.body) {
        const headers: Record<string, string> = {
          'Content-Type': 'audio/mpeg',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=604800, s-maxage=2592000'
        }
        if (isDownload) {
          headers['Content-Disposition'] = `attachment; filename="Surah_${numStr}_${reciter}.mp3"`
        }
        return new Response(res.body, { headers })
      }
    } catch (_) {}
  }

  return c.redirect(`${baseUrls[0]}${numStr}.mp3`, 302)
})

export { quranApi }
