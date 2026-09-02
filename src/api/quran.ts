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

  // Strategy 1: Al-Quran Cloud API (Al-Muyassar) - Fast & highly reliable
  try {
    const aqcRes = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar.muyassar`, {
      signal: AbortSignal.timeout(4000)
    })
    if (aqcRes.ok) {
      const aqcData = (await aqcRes.json()) as { data?: { text?: string } }
      if (aqcData && aqcData.data && aqcData.data.text) {
        const text = aqcData.data.text.trim()
        tafsirCache.set(cacheKey, text)
        c.header('Cache-Control', 'public, max-age=86400, s-maxage=604800')
        return c.json({ success: true, surah, ayah, tafsir: text })
      }
    }
  } catch (_) {}

  // Strategy 2: Quran.com API v4 (Tafsir Al-Muyassar - id 16)
  try {
    const qdcRes = await fetch(`https://api.quran.com/api/v4/tafsirs/16/by_ayah/${surah}:${ayah}`, {
      signal: AbortSignal.timeout(4000)
    })
    if (qdcRes.ok) {
      const qdcData = (await qdcRes.json()) as { tafsir?: { text?: string } }
      if (qdcData && qdcData.tafsir && qdcData.tafsir.text) {
        // Strip HTML tags if present
        const text = qdcData.tafsir.text.replace(/<[^>]*>/g, '').trim()
        if (text) {
          tafsirCache.set(cacheKey, text)
          c.header('Cache-Control', 'public, max-age=86400, s-maxage=604800')
          return c.json({ success: true, surah, ayah, tafsir: text })
        }
      }
    }
  } catch (_) {}

  // Strategy 3: QuranEnc
  try {
    const qeRes = await fetch(`https://quranenc.com/api/v1/translation/aya/arabic_moyassar/${surah}/${ayah}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(3000)
    })
    if (qeRes.ok) {
      const qeData = (await qeRes.json()) as { result?: { translation?: string } }
      if (qeData && qeData.result && qeData.result.translation) {
        const text = qeData.result.translation.trim()
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
  const rangeHeader = c.req.header('range')
  const numStr = (surahNum < 10 ? '00' : (surahNum < 100 ? '0' : '')) + surahNum
  const baseUrls = RECITER_AUDIO_MAP[reciter] || RECITER_AUDIO_MAP.minshawi

  for (const base of baseUrls) {
    try {
      const audioUrl = `${base}${numStr}.mp3`
      const fetchHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
      if (rangeHeader) {
        fetchHeaders['Range'] = rangeHeader
      }

      const res = await fetch(audioUrl, {
        headers: fetchHeaders,
        signal: AbortSignal.timeout(8000)
      })

      if ((res.status === 200 || res.status === 206) && res.body) {
        const responseHeaders = new Headers()
        responseHeaders.set('Content-Type', res.headers.get('content-type') || 'audio/mpeg')
        responseHeaders.set('Accept-Ranges', 'bytes')
        responseHeaders.set('Cache-Control', 'public, max-age=604800, s-maxage=2592000')

        const contentRange = res.headers.get('content-range')
        if (contentRange) {
          responseHeaders.set('Content-Range', contentRange)
        }
        const contentLength = res.headers.get('content-length')
        if (contentLength) {
          responseHeaders.set('Content-Length', contentLength)
        }
        if (isDownload) {
          responseHeaders.set('Content-Disposition', `attachment; filename="Surah_${numStr}_${reciter}.mp3"`)
        }

        return new Response(res.body, {
          status: res.status,
          headers: responseHeaders
        })
      }
    } catch (_) {}
  }

  return c.redirect(`${baseUrls[0]}${numStr}.mp3`, 302)
})

// 4. Endpoint to stream live Quran Radio stations with multi-server failover
const RADIO_STREAM_MAP: Record<string, string[]> = {
  cairo: [
    'https://stream.radiojar.com/8s5u5tpdtwzuv',
    'https://stream.zeno.fm/f3wvbbqmdg8uv',
    'https://n0a.radiojar.com/8s5u5tpdtwzuv'
  ],
  dosari_radio: [
    'https://backup.qurango.net/radio/yasser_aldosari',
    'https://qurango.net/radio/yasser_aldosari'
  ],
  minshawi_radio: [
    'https://backup.qurango.net/radio/mohammed_siddiq_alminshawi',
    'https://qurango.net/radio/mohammed_siddiq_alminshawi'
  ],
  abdulbasit_radio: [
    'https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad',
    'https://backup.qurango.net/radio/abdulbasit_abdulsamad_murattal'
  ],
  husary_radio: [
    'https://backup.qurango.net/radio/mahmoud_khalil_alhussary',
    'https://qurango.net/radio/mahmoud_khalil_alhussary'
  ],
  afs_radio: [
    'https://backup.qurango.net/radio/mishary_alafasi',
    'https://qurango.net/radio/mishary_alafasi'
  ],
  maher_radio: [
    'https://backup.qurango.net/radio/maher',
    'https://qurango.net/radio/maher'
  ],
  ghamdi_radio: [
    'https://backup.qurango.net/radio/saad_alghamdi',
    'https://qurango.net/radio/saad_alghamdi'
  ],
  tarateel: [
    'https://backup.qurango.net/radio/tarateel',
    'https://qurango.net/radio/tarateel'
  ],
  tafseer_radio: [
    'https://backup.qurango.net/radio/tafseer',
    'https://qurango.net/radio/tafseer'
  ],
  ruqyah_radio: [
    'https://backup.qurango.net/radio/roqiah',
    'https://qurango.net/radio/roqiah'
  ]
}

quranApi.get('/radio/:id', async (c) => {
  const radioId = c.req.param('id')
  const streamUrls = RADIO_STREAM_MAP[radioId] || RADIO_STREAM_MAP.cairo
  return c.redirect(streamUrls[0], 302)
})

export { quranApi }
