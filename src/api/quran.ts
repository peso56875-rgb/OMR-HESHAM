import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'

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

  for (const streamUrl of streamUrls) {
    const controller = new AbortController()
    const connectTimer = setTimeout(() => controller.abort(), 4000)
    try {
      const res = await fetch(streamUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          'Accept': '*/*'
        },
        signal: controller.signal
      })
      clearTimeout(connectTimer)

      if (res.ok && res.body) {
        return new Response(res.body, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }
    } catch (_) {
      clearTimeout(connectTimer)
    }
  }

  return c.redirect(streamUrls[0], 302)
})

// 4. Stream endpoint for Sheikh Al-Minshawi Teacher Ayah Audio (with children repetition)
quranApi.get('/audio/teacher/:surah/:ayah', async (c) => {
  const surah = parseInt(c.req.param('surah'), 10)
  const ayah = parseInt(c.req.param('ayah'), 10)
  if (isNaN(surah) || isNaN(ayah) || surah < 1 || surah > 114) {
    return c.json({ success: false, error: 'بيانات غير صالحة' }, 400)
  }

  const s = String(surah).padStart(3, '0')
  const a = String(ayah).padStart(3, '0')

  const urls = [
    `https://everyayah.com/data/Minshawy_Teacher_128kbps/${s}${a}.mp3`,
    `https://verses.quran.com/Minshawi/Mujawwad/mp3/${s}${a}.mp3`,
    `https://everyayah.com/data/Minshawy_Murattal_128kbps/${s}${a}.mp3`
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(4000)
      })
      if (res.ok && res.body) {
        return new Response(res.body, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=604800, immutable',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }
    } catch (_) {}
  }

  // Fallback redirect
  return c.redirect(urls[0], 302)
})

// 5. Stream endpoint for Sheikh Al-Minshawi Teacher Full Surah (with children repetition)
quranApi.get('/audio/teacher-surah/:surah', async (c) => {
  const surah = parseInt(c.req.param('surah'), 10)
  if (isNaN(surah) || surah < 1 || surah > 114) {
    return c.json({ success: false, error: 'رقم السورة غير صالح' }, 400)
  }

  const s = String(surah).padStart(3, '0')
  const urls = [
    `https://server10.mp3quran.net/minsh/Almusshaf-Al-Mo-lim/${s}.mp3`,
    `https://server10.mp3quran.net/minsh/${s}.mp3`,
    `https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/${s}.mp3`
  ]

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(4000)
      })
      if (res.ok && res.body) {
        return new Response(res.body, {
          status: 200,
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=604800, immutable',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }
    } catch (_) {}
  }

  return c.redirect(urls[0], 302)
})

// ────────────────── منظومة ختمة القرآن الكريم التشاركية المستمرة ──────────────────

export const JUZ_NAMES = [
  'الجزء ١ (الم - الفاتحة والبقرة)',
  'الجزء ٢ (سيقول السفهاء - البقرة)',
  'الجزء ٣ (تلك الرسل - البقرة وآل عمران)',
  'الجزء ٤ (لن تنالوا البر - آل عمران والنساء)',
  'الجزء ٥ (والمحصنات - النساء)',
  'الجزء ٦ (لا يحب الله - النساء والمائدة)',
  'الجزء ٧ (وإذا سمعوا - المائدة والأنعام)',
  'الجزء ٨ (ولو أننا - الأنعام والأعراف)',
  'الجزء ٩ (قال الملأ - الأعراف والأنفال)',
  'الجزء ١٠ (واعلموا - الأنفال والتوبة)',
  'الجزء ١١ (يعتذرون - التوبة ويونس وهود)',
  'الجزء ١٢ (وما من دابة - هود ويوسف)',
  'الجزء ١٣ (وما أبرئ نفسي - يوسف والرعد وإبراهيم)',
  'الجزء ١٤ (ربما - الحجر والنحل)',
  'الجزء ١٥ (سبحان الذي أسرى - الإسراء والكهف)',
  'الجزء ١٦ (قال ألم - الكهف ومريم وطه)',
  'الجزء ١٧ (اقترب للناس - الأنبياء والحج)',
  'الجزء ١٨ (قد أفلح المؤمنون - المؤمنون والنور والفرقان)',
  'الجزء ١٩ (وقال الذين لا يرجون - الفرقان والشعراء والنمل)',
  'الجزء ٢٠ (أمن خلق - النمل والقصص والعنكبوت)',
  'الجزء ٢١ (اتل ما أوحي - العنكبوت والروم ولقمان والسجدة والأحزاب)',
  'الجزء ٢٢ (ومن يقنت - الأحزاب وسبأ وفاطر ويس)',
  'الجزء ٢٣ (وما أنزلنا - يس والصافات وص والزمر)',
  'الجزء ٢٤ (فمن أظلم - الزمر وغافر وفصلت)',
  'الجزء ٢٥ (إليه يرد - فصلت والشورى والزخرف والدخان والجاثية)',
  'الجزء ٢٦ (حم - الأحقاف ومحمد والفتح والحجرات وق والذاريات)',
  'الجزء ٢٧ (قال فما خطبكم - الذاريات والطور والنجم والقمر والرحمن والواقعة والحديد)',
  'الجزء ٢٨ (قد سمع الله - جزء قد سمع)',
  'الجزء ٢٩ (تبارك الذي بيده الملك - جزء تبارك)',
  'الجزء ٣٠ (عم يتساءلون - جزء عم)'
]

const initialKhatmaParts = () => JUZ_NAMES.map((title, idx) => ({
  part: idx + 1,
  title,
  status: 'available', // available | reading | completed
  reader_name: '',
  updated_at: ''
}))

// Fallback in-memory state if DB offline
let memoryKhatma = {
  khatma_number: 14,
  total_completed: 13,
  parts: initialKhatmaParts()
}

// جلب حالة الختمة الحالية
quranApi.get('/khatma/current', async (c) => {
  try {
    const db = getFirestore(c)
    const doc = await db.collection('quran_khatmas').doc('active').get()
    if (doc.exists) {
      const data = doc.data()!
      return c.json({ success: true, khatma: data })
    }

    // إنشاء أول ختمة إن لم تكن موجودة
    const freshKhatma = {
      khatma_number: 1,
      total_completed: 0,
      parts: initialKhatmaParts(),
      created_at: new Date().toISOString()
    }
    await db.collection('quran_khatmas').doc('active').set(freshKhatma)
    return c.json({ success: true, khatma: freshKhatma })
  } catch (_) {
    return c.json({ success: true, khatma: memoryKhatma })
  }
})

// حجز قراءة جزء في الختمة
quranApi.post('/khatma/claim', async (c) => {
  try {
    const body = await c.req.json()
    const partNum = Number(body.part)
    const readerName = String(body.reader_name || 'قارئ كريم').trim()

    if (isNaN(partNum) || partNum < 1 || partNum > 30) {
      return c.json({ success: false, error: 'رقم الجزء غير صالح' }, 400)
    }

    try {
      const db = getFirestore(c)
      const ref = db.collection('quran_khatmas').doc('active')
      const doc = await ref.get()
      let data = doc.exists ? doc.data()! : { khatma_number: 1, total_completed: 0, parts: initialKhatmaParts() }

      const parts = data.parts || initialKhatmaParts()
      const p = parts.find((x: any) => x.part === partNum)
      if (p) {
        p.status = 'reading'
        p.reader_name = readerName || 'قارئ كريم'
        p.updated_at = new Date().toISOString()
      }

      await ref.set({ ...data, parts }, { merge: true })
      return c.json({ success: true, message: `تقبل الله منك! تم حجز الجزء ${partNum} لتلاوته.`, khatma: { ...data, parts } })
    } catch (_) {
      const p = memoryKhatma.parts.find(x => x.part === partNum)
      if (p) {
        p.status = 'reading'
        p.reader_name = readerName || 'قارئ كريم'
      }
      return c.json({ success: true, message: `تقبل الله منك! تم حجز الجزء ${partNum}.`, khatma: memoryKhatma })
    }
  } catch (e: any) {
    return c.json({ success: false, error: 'بيانات غير صالحة' }, 400)
  }
})

// تأكيد إتمام قراءة الجزء
quranApi.post('/khatma/complete', async (c) => {
  try {
    const body = await c.req.json()
    const partNum = Number(body.part)

    if (isNaN(partNum) || partNum < 1 || partNum > 30) {
      return c.json({ success: false, error: 'رقم الجزء غير صالح' }, 400)
    }

    try {
      const db = getFirestore(c)
      const ref = db.collection('quran_khatmas').doc('active')
      const doc = await ref.get()
      let data = doc.exists ? doc.data()! : { khatma_number: 1, total_completed: 0, parts: initialKhatmaParts() }

      const parts = data.parts || initialKhatmaParts()
      const p = parts.find((x: any) => x.part === partNum)
      if (p) {
        p.status = 'completed'
        p.updated_at = new Date().toISOString()
      }

      // هل اكتملت الـ 30 جزءاً بالكامل؟
      const isAllDone = parts.every((x: any) => x.status === 'completed')

      if (isAllDone) {
        const finishedKhatmaNum = data.khatma_number || 1
        const nextTotal = (Number(data.total_completed) || 0) + 1

        // حفظ سجل الختمة المكتملة في الأرشيف
        await db.collection('quran_khatmas_history').add({
          khatma_number: finishedKhatmaNum,
          completed_at: new Date().toISOString(),
          parts
        })

        // فتح ختمة جديدة برقم تالي
        const newKhatma = {
          khatma_number: finishedKhatmaNum + 1,
          total_completed: nextTotal,
          parts: initialKhatmaParts(),
          created_at: new Date().toISOString()
        }
        await ref.set(newKhatma)

        return c.json({
          success: true,
          khatma_completed: true,
          message: `هنيئاً لكم! اكتملت الختمة رقم ${finishedKhatmaNum} كاملة بفضل الله، وبدأت الختمة المباركة رقم ${finishedKhatmaNum + 1}.`,
          khatma: newKhatma
        })
      }

      await ref.set({ ...data, parts }, { merge: true })
      return c.json({ success: true, message: `جزاك الله خيراً وأثابك! تم تسجيل إتمام قراءة الجزء ${partNum}.`, khatma: { ...data, parts } })
    } catch (_) {
      const p = memoryKhatma.parts.find(x => x.part === partNum)
      if (p) p.status = 'completed'
      return c.json({ success: true, message: 'تم تسجيل إتمام القراءة بحمد الله.', khatma: memoryKhatma })
    }
  } catch (e: any) {
    return c.json({ success: false, error: 'بيانات غير صالحة' }, 400)
  }
})

export { quranApi }

