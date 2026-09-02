/**
 * واحة أطفال المؤسسة — Kids Learning Hub
 * Comprehensive Client-Side Interactive Engine
 * Web Speech API + Web Audio Synthesizer + Canvas Tracer + Quran Memorizer + Drawing Studio + Games
 */

;(function () {
  'use strict'

  // ─── Web Audio Chimes & Sound Synthesizer (Zero External Dependencies) ───
  class SoundFX {
    constructor() {
      this.ctx = null
      this.initCtx = () => {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext
          if (AudioContext) {
            this.ctx = new AudioContext()
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume()
        }
      }
      // Resume context on first user interaction
      window.addEventListener('pointerdown', this.initCtx, { once: true })
      window.addEventListener('keydown', this.initCtx, { once: true })
    }

    playTone(freq, type = 'sine', duration = 0.2, gainVal = 0.15) {
      try {
        this.initCtx()
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = type
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration)
        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start()
        osc.stop(this.ctx.currentTime + duration)
      } catch (e) {}
    }

    tap() {
      this.playTone(480, 'triangle', 0.08, 0.1)
    }

    correct() {
      // Pleasant two-tone chime
      this.playTone(523.25, 'sine', 0.18, 0.2) // C5
      setTimeout(() => this.playTone(659.25, 'sine', 0.28, 0.25), 120) // E5
      setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.28), 240) // G5
    }

    wrong() {
      this.playTone(280, 'sawtooth', 0.2, 0.15)
      setTimeout(() => this.playTone(240, 'sawtooth', 0.3, 0.15), 150)
    }

    star() {
      const notes = [659.25, 830.61, 987.77, 1318.51]
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.35, 0.2), i * 90)
      })
    }

    celebrate() {
      const fanfare = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.5]
      fanfare.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.25), idx * 110)
      })
    }
  }

  const sfx = new SoundFX()

  // ─── Arabic Speech Synthesizer Wrapper ───
  class KidsSpeech {
    constructor() {
      this.synth = window.speechSynthesis || null
      this.voice = null
      if (this.synth) {
        this.loadVoices()
        if (speechSynthesis.onvoiceschanged !== undefined) {
          speechSynthesis.onvoiceschanged = () => this.loadVoices()
        }
      }
    }

    loadVoices() {
      if (!this.synth) return
      const voices = this.synth.getVoices()
      // Look for Arabic voice
      this.voice = voices.find(v => v.lang.startsWith('ar')) || null
    }

    speak(text, onEnd = null) {
      if (!this.synth) return
      try {
        this.synth.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'ar-SA'
        if (this.voice) {
          utterance.voice = this.voice
        }
        utterance.rate = 0.85 // Slightly slower for kids clarity
        utterance.pitch = 1.1 // Cheerful slightly higher pitch
        if (onEnd) {
          utterance.onend = onEnd
        }
        this.synth.speak(utterance)
      } catch (e) {
        console.warn('Speech synthesis failed:', e)
      }
    }
  }

  const speech = new KidsSpeech()

  // ─── Confetti Fireworks Generator ───
  function launchKidsConfetti(count = 60) {
    const container = document.getElementById('kidsConfettiOverlay')
    if (!container) return
    sfx.celebrate()
    container.innerHTML = ''
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#facc15', '#06b6d4']

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div')
      piece.className = 'confetti-piece'
      const startX = Math.random() * 100
      const endX = startX + (Math.random() * 40 - 20)
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = Math.random() * 12 + 8
      const duration = Math.random() * 2 + 1.8

      piece.style.cssText = `
        position: fixed;
        top: -20px;
        left: ${startX}vw;
        width: ${size}px;
        height: ${size * 0.6}px;
        background: ${color};
        opacity: 0.9;
        transform: rotate(${Math.random() * 360}deg);
        border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
        z-index: 9999;
        pointer-events: none;
        transition: transform ${duration}s ease-out, top ${duration}s ease-in, opacity ${duration}s ease;
      `
      container.appendChild(piece)

      setTimeout(() => {
        piece.style.top = '105vh'
        piece.style.left = `${endX}vw`
        piece.style.transform = `rotate(${Math.random() * 720}deg) scale(0.6)`
        piece.style.opacity = '0'
      }, 30)

      setTimeout(() => piece.remove(), duration * 1000 + 200)
    }
  }

  // ─── Local Storage Progress Tracker ───
  class ProgressManager {
    constructor() {
      this.STORAGE_KEY = 'omar_kids_progress_v1'
      this.data = this.load()
    }

    load() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY)
        if (raw) return JSON.parse(raw)
      } catch (e) {}
      return {
        stars: 0,
        lettersLearned: {},
        surahsMemorized: {},
        drawings: [],
        gamesWon: 0,
        badges: {}
      }
    }

    save() {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data))
      } catch (e) {}
      this.updateUI()
    }

    addStars(count = 1, showCelebration = true) {
      this.data.stars = (this.data.stars || 0) + count
      sfx.star()
      if (showCelebration && count >= 3) {
        launchKidsConfetti(count * 8)
      }
      this.checkBadges()
      this.save()
    }

    markLetter(letter) {
      if (!this.data.lettersLearned[letter]) {
        this.data.lettersLearned[letter] = true
        this.addStars(1, false)
      }
      this.save()
    }

    markSurah(surahId) {
      if (!this.data.surahsMemorized[surahId]) {
        this.data.surahsMemorized[surahId] = true
        this.addStars(5, true)
      }
      this.save()
    }

    saveDrawing(dataUrl, title = 'لوحة فنية') {
      if (!this.data.drawings) this.data.drawings = []
      this.data.drawings.unshift({
        id: 'draw_' + Date.now(),
        dataUrl,
        title,
        date: new Date().toLocaleDateString('ar-EG')
      })
      if (this.data.drawings.length > 24) {
        this.data.drawings = this.data.drawings.slice(0, 24)
      }
      this.addStars(3, true)
      this.save()
    }

    deleteDrawing(id) {
      if (!this.data.drawings) return
      this.data.drawings = this.data.drawings.filter(d => d.id !== id)
      this.save()
    }

    checkBadges() {
      const lettersCount = Object.keys(this.data.lettersLearned || {}).length
      const surahsCount = Object.keys(this.data.surahsMemorized || {}).length
      const drawingsCount = (this.data.drawings || []).length

      if (lettersCount >= 10) this.data.badges['letters_10'] = true
      if (lettersCount >= 28) this.data.badges['letters_all'] = true
      if (this.data.surahsMemorized[1]) this.data.badges['quran_fatiha'] = true
      if (surahsCount >= 5) this.data.badges['quran_5'] = true
      if (drawingsCount >= 1) this.data.badges['draw_first'] = true
      if ((this.data.gamesWon || 0) >= 5) this.data.badges['game_champ'] = true
    }

    updateUI() {
      const starsCount = this.data.stars || 0
      const lettersCount = Object.keys(this.data.lettersLearned || {}).length
      const surahsCount = Object.keys(this.data.surahsMemorized || {}).length
      const drawingsCount = (this.data.drawings || []).length

      // Header stats
      const heroStars = document.getElementById('totalStarsCounter')
      if (heroStars) heroStars.textContent = starsCount

      const heroLetters = document.getElementById('lettersLearnedCounter')
      if (heroLetters) heroLetters.textContent = `${lettersCount} / 28`

      const heroSurahs = document.getElementById('surahsLearnedCounter')
      if (heroSurahs) heroSurahs.textContent = `${surahsCount} / 37`

      const rankTitle = document.getElementById('currentRankTitle')
      if (rankTitle) {
        if (starsCount >= 100) rankTitle.textContent = 'نجم الواحة الذهبي 👑'
        else if (starsCount >= 50) rankTitle.textContent = 'فارس العلم المبدع 🏆'
        else if (starsCount >= 20) rankTitle.textContent = 'بطل نشيط ومجتهد ⭐'
        else rankTitle.textContent = 'بطل مبتدئ 🌟'
      }

      // Certificate tab stats
      const certStars = document.getElementById('certStarsTotal')
      if (certStars) certStars.textContent = starsCount

      const certStarsPrint = document.getElementById('certStarsPrintVal')
      if (certStarsPrint) certStarsPrint.textContent = `⭐ ${starsCount} نجمة متلألئة`

      const galleryCountLabel = document.getElementById('galleryCountLabel')
      if (galleryCountLabel) galleryCountLabel.textContent = drawingsCount

      // Parent dashboard
      const parentStars = document.getElementById('parentTotalStars')
      if (parentStars) parentStars.textContent = starsCount
      const parentLetters = document.getElementById('parentLettersProgress')
      if (parentLetters) parentLetters.textContent = `${lettersCount} / 28`
      const parentSurahs = document.getElementById('parentSurahsProgress')
      if (parentSurahs) parentSurahs.textContent = `${surahsCount} / 37`
      const parentDrawings = document.getElementById('parentDrawingsCount')
      if (parentDrawings) parentDrawings.textContent = drawingsCount

      // Update trophy cards
      for (const [badgeId, isUnlocked] of Object.entries(this.data.badges || {})) {
        const badgeEl = document.getElementById(`badge_${badgeId}`)
        if (badgeEl && isUnlocked) {
          badgeEl.textContent = '✅ بطل متميز'
          badgeEl.classList.add('unlocked')
        }
      }

      // Surah list badges
      for (const surahId of Object.keys(this.data.surahsMemorized || {})) {
        const memBadge = document.getElementById(`memBadge_${surahId}`)
        if (memBadge) {
          memBadge.textContent = '⭐ تم الحفظ'
          memBadge.classList.add('memorized')
        }
      }
    }

    reset() {
      if (confirm('هل أنت متأكد من تصفير جميع إنجازات الطفل والبدء من جديد؟')) {
        localStorage.removeItem(this.STORAGE_KEY)
        this.data = this.load()
        this.updateUI()
        alert('تم تصفير البيانات بنجاح! بالتوفيق للبطل الصغير في رحلته الجديدة 🌟')
      }
    }
  }

  const progress = new ProgressManager()

  // ─── Setup Main Tab Navigation ───
  function initTabs() {
    const tabButtons = document.querySelectorAll('.kids-tab-btn')
    const tabPanels = document.querySelectorAll('.kids-tab-panel')

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        const targetTab = btn.getAttribute('data-tab')
        tabButtons.forEach(b => {
          b.classList.remove('active')
          b.setAttribute('aria-selected', 'false')
        })
        tabPanels.forEach(p => p.classList.remove('active'))

        btn.classList.add('active')
        btn.setAttribute('aria-selected', 'true')

        const activePanel = document.getElementById(`panel-${targetTab}`)
        if (activePanel) {
          activePanel.classList.add('active')
        }

        // Trigger resize event for canvas components when entering their tabs
        if (targetTab === 'drawing') {
          setTimeout(resizeDrawingCanvas, 50)
        } else if (targetTab === 'letters') {
          setTimeout(setupLetterTracer, 50)
        }
      })
    })

    // Submode pill navigation in sections
    const submodeBars = document.querySelectorAll('.letters-submode-bar, .numbers-submode-bar, .drawing-submode-bar, .games-submode-bar')
    submodeBars.forEach(bar => {
      const pills = bar.querySelectorAll('.submode-pill')
      pills.forEach(pill => {
        pill.addEventListener('click', () => {
          sfx.tap()
          pills.forEach(p => p.classList.remove('active'))
          pill.classList.add('active')
          const targetSub = pill.getAttribute('data-sub')
          const container = bar.closest('.kids-tab-panel')
          if (container) {
            container.querySelectorAll('.subview-content').forEach(v => v.classList.remove('active'))
            const targetView = container.querySelector(`#subview-${targetSub}`)
            if (targetView) targetView.classList.add('active')

            if (targetSub === 'draw-free') {
              setTimeout(resizeDrawingCanvas, 50)
            } else if (targetSub === 'tracer') {
              setTimeout(setupLetterTracer, 50)
            }
          }
        })
      })
    })

    // Audio guide greeting button
    const guideBtn = document.getElementById('kidsAudioGuideBtn')
    if (guideBtn) {
      guideBtn.addEventListener('click', () => {
        sfx.correct()
        speech.speak('مرحباً يا بطل في واحة أطفال مؤسسة الدكتور عمر هشام الخيرية! هنا ستتعلم الحروف والأرقام، وتحفظ القرآن الكريم، وترسم أحلى اللوحات! هيا بنا نبدأ المرح!')
      })
    }
  }

  // ─── SECTION 1: LETTERS & READING ───
  let activeLetterData = null

  function initLetters() {
    const letterCards = document.querySelectorAll('.kids-letter-card')
    const spotlight = document.getElementById('letterSpotlight')
    const spotlightChar = document.getElementById('spotlightChar')
    const spotlightWord = document.getElementById('spotlightWord')
    const spotlightDesc = document.getElementById('spotlightDesc')
    const playLetterBtn = document.getElementById('playLetterSoundBtn')
    const playWordBtn = document.getElementById('playWordSoundBtn')
    const goToTraceBtn = document.getElementById('goToTraceBtn')
    const closeSpotlight = document.getElementById('closeSpotlightBtn')

    letterCards.forEach(card => {
      card.addEventListener('click', () => {
        sfx.tap()
        const letter = card.getAttribute('data-letter')
        const name = card.getAttribute('data-name')
        const word = card.getAttribute('data-word')
        const emoji = card.getAttribute('data-emoji')

        activeLetterData = { letter, name, word, emoji }
        progress.markLetter(letter)

        if (spotlight && spotlightChar) {
          spotlightChar.textContent = letter
          spotlightWord.textContent = `${word} ${emoji}`
          spotlightDesc.textContent = `حرف ${name}: يُنطق "${letter}"، ومثاله في الكلمات "${word}"!`
          spotlight.classList.add('visible')
        }

        // Voice pronunciation
        speech.speak(`حرف ${name}، ${letter}، ${word}`)
      })
    })

    if (closeSpotlight && spotlight) {
      closeSpotlight.addEventListener('click', () => {
        spotlight.classList.remove('visible')
      })
    }

    if (playLetterBtn) {
      playLetterBtn.addEventListener('click', () => {
        if (activeLetterData) {
          sfx.tap()
          speech.speak(`حرف ${activeLetterData.name}، ${activeLetterData.letter}`)
        }
      })
    }

    if (playWordBtn) {
      playWordBtn.addEventListener('click', () => {
        if (activeLetterData) {
          sfx.tap()
          speech.speak(activeLetterData.word)
        }
      })
    }

    if (goToTraceBtn) {
      goToTraceBtn.addEventListener('click', () => {
        const tracePill = document.querySelector('.submode-pill[data-sub="tracer"]')
        if (tracePill) {
          tracePill.click()
          if (activeLetterData) {
            setTracerLetter(activeLetterData.letter)
          }
        }
      })
    }

    // Tashkeel dynamic interaction
    const tashkeelSelect = document.getElementById('tashkeelLetterSelect')
    const tashkeelDemo = document.getElementById('tashkeelDemoButtons')

    function updateTashkeelDemo(letter) {
      if (!tashkeelDemo) return
      tashkeelDemo.innerHTML = `
        <button type="button" class="tashkeel-demo-btn" data-vocal="${letter}َ">
          <span class="t-char">${letter}َ</span>
          <small>بالفتحة</small>
        </button>
        <button type="button" class="tashkeel-demo-btn" data-vocal="${letter}ُ">
          <span class="t-char">${letter}ُ</span>
          <small>بالضمة</small>
        </button>
        <button type="button" class="tashkeel-demo-btn" data-vocal="${letter}ِ">
          <span class="t-char">${letter}ِ</span>
          <small>بالكسرة</small>
        </button>
        <button type="button" class="tashkeel-demo-btn" data-vocal="أَ${letter}ْ">
          <span class="t-char">${letter}ْ</span>
          <small>بالسكون</small>
        </button>
        <button type="button" class="tashkeel-demo-btn" data-vocal="${letter}اً">
          <span class="t-char">${letter}اً</span>
          <small>تنوين فتح</small>
        </button>
        <button type="button" class="tashkeel-demo-btn" data-vocal="${letter}ٌ">
          <span class="t-char">${letter}ٌ</span>
          <small>تنوين ضم</small>
        </button>
      `
      tashkeelDemo.querySelectorAll('.tashkeel-demo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          sfx.tap()
          const vocal = btn.getAttribute('data-vocal')
          speech.speak(vocal)
        })
      })
    }

    if (tashkeelSelect) {
      tashkeelSelect.addEventListener('change', (e) => {
        updateTashkeelDemo(e.target.value)
      })
      updateTashkeelDemo(tashkeelSelect.value || 'أ')
    }

    // Static Tashkeel cards listen buttons
    document.querySelectorAll('.tashkeel-listen-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        speech.speak(btn.getAttribute('data-text') || '')
      })
    })

    // Init Quiz
    initLettersQuiz()
  }

  // ─── Letter Tracer with HTML5 Canvas ───
  let currentTraceLetter = 'أ'
  let tracerCanvas, tracerCtx
  let isTracing = false

  function setupLetterTracer() {
    tracerCanvas = document.getElementById('letterTraceCanvas')
    if (!tracerCanvas) return
    tracerCtx = tracerCanvas.getContext('2d')

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1
    const rect = tracerCanvas.getBoundingClientRect()
    tracerCanvas.width = 500 * dpr
    tracerCanvas.height = 500 * dpr
    tracerCtx.scale(dpr, dpr)

    drawTracerGuide()

    // Chip buttons
    document.querySelectorAll('.mini-letter-chips .chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        document.querySelectorAll('.mini-letter-chips .chip-btn').forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        setTracerLetter(btn.getAttribute('data-letter'))
      })
    })

    const clearBtn = document.getElementById('clearTracerBtn')
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        sfx.tap()
        drawTracerGuide()
        const scoreBox = document.getElementById('tracerScoreBox')
        if (scoreBox) scoreBox.style.display = 'none'
      })
    }

    const evalBtn = document.getElementById('evaluateTracerBtn')
    if (evalBtn) {
      evalBtn.addEventListener('click', evaluateTrace)
    }

    // Touch & Mouse Drawing on Tracer Canvas
    function getPos(e) {
      const b = tracerCanvas.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      return {
        x: (clientX - b.left) * (500 / b.width),
        y: (clientY - b.top) * (500 / b.height)
      }
    }

    function startTrace(e) {
      e.preventDefault()
      isTracing = true
      const pos = getPos(e)
      tracerCtx.beginPath()
      tracerCtx.moveTo(pos.x, pos.y)
      tracerCtx.lineCap = 'round'
      tracerCtx.lineJoin = 'round'
      tracerCtx.lineWidth = 18
      tracerCtx.strokeStyle = '#10b981' // Green for good writing
    }

    function moveTrace(e) {
      if (!isTracing) return
      e.preventDefault()
      const pos = getPos(e)
      tracerCtx.lineTo(pos.x, pos.y)
      tracerCtx.stroke()
    }

    function endTrace(e) {
      if (!isTracing) return
      isTracing = false
      tracerCtx.closePath()
    }

    tracerCanvas.addEventListener('mousedown', startTrace)
    tracerCanvas.addEventListener('mousemove', moveTrace)
    window.addEventListener('mouseup', endTrace)

    tracerCanvas.addEventListener('touchstart', startTrace, { passive: false })
    tracerCanvas.addEventListener('touchmove', moveTrace, { passive: false })
    window.addEventListener('touchend', endTrace)
  }

  function setTracerLetter(letter) {
    currentTraceLetter = letter
    drawTracerGuide()
    speech.speak(`تتبع حرف ${letter}`)
  }

  function drawTracerGuide() {
    if (!tracerCtx) return
    tracerCtx.clearRect(0, 0, 500, 500)

    // Background paper texture
    tracerCtx.fillStyle = '#f8fafc'
    tracerCtx.fillRect(0, 0, 500, 500)

    // Baseline rule
    tracerCtx.strokeStyle = '#e2e8f0'
    tracerCtx.lineWidth = 2
    tracerCtx.setLineDash([8, 8])
    tracerCtx.beginPath()
    tracerCtx.moveTo(40, 360)
    tracerCtx.lineTo(460, 360)
    tracerCtx.stroke()
    tracerCtx.setLineDash([])

    // Guide letter (dotted gray)
    tracerCtx.font = 'bold 310px "Tajawal", "Noto Naskh Arabic", sans-serif'
    tracerCtx.textAlign = 'center'
    tracerCtx.textBaseline = 'middle'

    // Dotted outline
    tracerCtx.fillStyle = 'rgba(148, 163, 184, 0.28)'
    tracerCtx.fillText(currentTraceLetter, 250, 240)

    tracerCtx.strokeStyle = '#94a3b8'
    tracerCtx.lineWidth = 3
    tracerCtx.setLineDash([6, 6])
    tracerCtx.strokeText(currentTraceLetter, 250, 240)
    tracerCtx.setLineDash([])
  }

  function evaluateTrace() {
    sfx.correct()
    progress.addStars(2, true)
    progress.markLetter(currentTraceLetter)
    const scoreBox = document.getElementById('tracerScoreBox')
    const feedback = document.getElementById('tracerFeedback')
    if (scoreBox && feedback) {
      scoreBox.style.display = 'block'
      feedback.textContent = `ما شاء الله يا بطل! خطك في حرف "${currentTraceLetter}" رائع وجميل ومتقن!`
    }
  }

  // ─── Listen & Choose Letters Quiz ───
  let quizCurrentLetter = null
  let quizScore = 0

  function initLettersQuiz() {
    const playAudioBtn = document.getElementById('playQuizAudioBtn')
    if (playAudioBtn) {
      playAudioBtn.addEventListener('click', () => {
        if (quizCurrentLetter) {
          speech.speak(`أين حرف ${quizCurrentLetter.name}؟ ${quizCurrentLetter.letter}`)
        }
      })
    }
    nextQuizQuestion()
  }

  const LETTERS_LIST = [
    { letter: 'أ', name: 'ألف' }, { letter: 'ب', name: 'باء' }, { letter: 'ت', name: 'تاء' },
    { letter: 'ث', name: 'ثاء' }, { letter: 'ج', name: 'جيم' }, { letter: 'ح', name: 'حاء' },
    { letter: 'د', name: 'دال' }, { letter: 'ر', name: 'راء' }, { letter: 'س', name: 'سين' },
    { letter: 'ش', name: 'شين' }, { letter: 'ص', name: 'صاد' }, { letter: 'ط', name: 'طاء' },
    { letter: 'ع', name: 'عين' }, { letter: 'ف', name: 'فاء' }, { letter: 'ق', name: 'قاف' },
    { letter: 'ك', name: 'كاف' }, { letter: 'ل', name: 'لام' }, { letter: 'م', name: 'ميم' },
    { letter: 'ن', name: 'نون' }, { letter: 'هـ', name: 'هاء' }, { letter: 'و', name: 'واو' }, { letter: 'ي', name: 'ياء' }
  ]

  function nextQuizQuestion() {
    const grid = document.getElementById('quizOptionsGrid')
    const banner = document.getElementById('quizResultBanner')
    if (!grid) return

    banner.style.display = 'none'
    const shuffled = [...LETTERS_LIST].sort(() => 0.5 - Math.random())
    const choices = shuffled.slice(0, 4)
    quizCurrentLetter = choices[Math.floor(Math.random() * choices.length)]

    grid.innerHTML = ''
    choices.forEach(item => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'quiz-choice-btn'
      btn.textContent = item.letter
      btn.addEventListener('click', () => {
        if (item.letter === quizCurrentLetter.letter) {
          btn.classList.add('correct')
          sfx.correct()
          quizScore += 10
          progress.addStars(2, false)
          const scoreEl = document.getElementById('quizScoreVal')
          if (scoreEl) scoreEl.textContent = quizScore
          banner.textContent = `🎉 أحسنت! هذا هو حرف ${quizCurrentLetter.name} (${quizCurrentLetter.letter})!`
          banner.className = 'quiz-result-banner success'
          banner.style.display = 'block'
          speech.speak(`ممتاز! إجابة صحيحة، حرف ${quizCurrentLetter.name}!`)
          setTimeout(nextQuizQuestion, 1600)
        } else {
          btn.classList.add('wrong')
          sfx.wrong()
          banner.textContent = `حاول مرة أخرى يا بطل! هذا حرف ${item.name} وليس ${quizCurrentLetter.name}`
          banner.className = 'quiz-result-banner error'
          banner.style.display = 'block'
          speech.speak(`حاول ثانية يا بطل`)
        }
      })
      grid.appendChild(btn)
    })

    // Auto-prompt speech
    setTimeout(() => {
      speech.speak(`أين حرف ${quizCurrentLetter.name}؟`)
    }, 300)
  }

  // ─── SECTION 2: NUMBERS & MATH ───
  const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢', '١٣', '١٤', '١٥', '١٦', '١٧', '١٨', '١٩', '٢٠']
  const NUMBER_NAMES = [
    'صِفْر', 'وَاحِد', 'اثْنَان', 'ثَلاثَة', 'أَرْبَعَة', 'خَمْسَة', 'سِتَّة', 'سَبْعَة', 'ثَمَانِيَة', 'تِسْعَة', 'عَشَرَة',
    'أَحَدَ عَشَر', 'اثْنَا عَشَر', 'ثَلاثَةَ عَشَر', 'أَرْبَعَةَ عَشَر', 'خَمْسَةَ عَشَر', 'سِتَّةَ عَشَر', 'سَبْعَةَ عَشَر', 'ثَمَانِيَةَ عَشَر', 'تِسْعَةَ عَشَر', 'عِشْرُون'
  ]
  const COUNT_EMOJIS = ['🍎', '⭐️', '🚗', '🐱', '🐥', '🎈', '🍭', '⚽️', '🧸', '🌸']

  function initNumbers() {
    const grid = document.getElementById('numbersGridContainer')
    if (grid) {
      grid.innerHTML = ''
      for (let i = 0; i <= 20; i++) {
        const card = document.createElement('div')
        card.className = 'kids-number-card'
        const emoji = COUNT_EMOJIS[i % COUNT_EMOJIS.length]
        const dots = i > 0 && i <= 10 ? emoji.repeat(i) : `${i} ${emoji}`
        card.innerHTML = `
          <div class="num-top">
            <span class="num-arabic">${ARABIC_DIGITS[i]}</span>
            <span class="num-latin">${i}</span>
          </div>
          <div class="num-name">${NUMBER_NAMES[i]}</div>
          <div class="num-dots">${dots}</div>
        `
        card.addEventListener('click', () => {
          sfx.tap()
          card.classList.add('pulse')
          setTimeout(() => card.classList.remove('pulse'), 400)
          speech.speak(`الرقم ${NUMBER_NAMES[i]}، ${i}`)
          progress.addStars(1, false)
        })
        grid.appendChild(card)
      }
    }

    // Counting Game
    initCountingGame()
    // Visual Math
    initVisualMath()
  }

  let countGameTarget = 3
  function initCountingGame() {
    const display = document.getElementById('countingItemsDisplay')
    const choicesRow = document.getElementById('countingChoicesRow')
    const feedback = document.getElementById('countingFeedback')
    if (!display || !choicesRow) return

    countGameTarget = Math.floor(Math.random() * 8) + 1
    const emoji = COUNT_EMOJIS[Math.floor(Math.random() * COUNT_EMOJIS.length)]
    display.innerHTML = ''
    for (let i = 0; i < countGameTarget; i++) {
      const span = document.createElement('span')
      span.className = 'count-item-bubble'
      span.textContent = emoji
      display.appendChild(span)
    }

    // Options
    const options = [countGameTarget]
    while (options.length < 4) {
      const rand = Math.floor(Math.random() * 10) + 1
      if (!options.includes(rand)) options.push(rand)
    }
    options.sort(() => 0.5 - Math.random())

    choicesRow.innerHTML = ''
    options.forEach(num => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'count-choice-btn'
      btn.textContent = `${num} (${ARABIC_DIGITS[num]})`
      btn.addEventListener('click', () => {
        if (num === countGameTarget) {
          sfx.correct()
          btn.classList.add('correct')
          feedback.textContent = `🎉 إجابة صحيحة! عددها هو ${NUMBER_NAMES[num]} (${num})!`
          feedback.className = 'counting-feedback success'
          progress.addStars(2, false)
          speech.speak(`ممتاز! عددهم ${num}`)
          setTimeout(initCountingGame, 1500)
        } else {
          sfx.wrong()
          btn.classList.add('wrong')
          feedback.textContent = `حاول مرة أخرى يا بطل، عدّهم بهدوء بالإصبع ☝️`
          feedback.className = 'counting-feedback error'
          speech.speak(`حاول مرة ثانية واعددهم بهدوء`)
        }
      })
      choicesRow.appendChild(btn)
    })
  }

  let mathMode = 'add'
  let mathNumA = 2, mathNumB = 3

  function initVisualMath() {
    const btnAdd = document.getElementById('btnModeAdd')
    const btnSub = document.getElementById('btnModeSub')
    if (btnAdd && btnSub) {
      btnAdd.addEventListener('click', () => {
        sfx.tap()
        mathMode = 'add'
        btnAdd.classList.add('active')
        btnSub.classList.remove('active')
        nextMathEquation()
      })
      btnSub.addEventListener('click', () => {
        sfx.tap()
        mathMode = 'sub'
        btnSub.classList.add('active')
        btnAdd.classList.remove('active')
        nextMathEquation()
      })
    }
    nextMathEquation()
  }

  function nextMathEquation() {
    const grpA = document.getElementById('mathGroupA')
    const grpB = document.getElementById('mathGroupB')
    const opEl = document.getElementById('mathOperator')
    const row = document.getElementById('mathOptionsRow')
    const feedback = document.getElementById('mathFeedback')
    if (!grpA || !grpB || !row) return

    feedback.textContent = ''

    const emoji = COUNT_EMOJIS[Math.floor(Math.random() * COUNT_EMOJIS.length)]
    let answer = 0

    if (mathMode === 'add') {
      mathNumA = Math.floor(Math.random() * 5) + 1
      mathNumB = Math.floor(Math.random() * 5) + 1
      answer = mathNumA + mathNumB
      opEl.textContent = '➕'
    } else {
      mathNumA = Math.floor(Math.random() * 6) + 4
      mathNumB = Math.floor(Math.random() * (mathNumA - 1)) + 1
      answer = mathNumA - mathNumB
      opEl.textContent = '➖'
    }

    grpA.innerHTML = `<span class="math-items">${emoji.repeat(mathNumA)}</span><b class="math-num">${mathNumA}</b>`
    grpB.innerHTML = `<span class="math-items">${emoji.repeat(mathNumB)}</span><b class="math-num">${mathNumB}</b>`

    const choices = [answer]
    while (choices.length < 4) {
      const r = Math.max(0, answer + Math.floor(Math.random() * 5) - 2)
      if (!choices.includes(r)) choices.push(r)
    }
    choices.sort(() => 0.5 - Math.random())

    row.innerHTML = ''
    choices.forEach(val => {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = 'math-choice-btn'
      b.textContent = val
      b.addEventListener('click', () => {
        if (val === answer) {
          sfx.correct()
          b.classList.add('correct')
          feedback.textContent = `🎉 إجابة مذهلة! ${mathNumA} ${mathMode === 'add' ? '+' : '-'} ${mathNumB} = ${answer}!`
          feedback.className = 'math-feedback success'
          progress.addStars(2, false)
          speech.speak(`إجابة صحيحة يا بطل، الناتج هو ${answer}`)
          setTimeout(nextMathEquation, 1600)
        } else {
          sfx.wrong()
          b.classList.add('wrong')
          feedback.textContent = `احسبها جيداً يا بطل، اجمع أو اطرح بالصور! 🧐`
          feedback.className = 'math-feedback error'
        }
      })
      row.appendChild(b)
    })
  }

  // ─── SECTION 3: QURAN MEMORIZATION ───
  let currentSurahId = 1
  let currentSurahName = 'الفاتحة'
  let currentVerses = []
  let currentPlayingVerseIdx = 0
  let isVersePlaying = false
  let verseAudio = new Audio()
  let isMaskMode = false
  let verseRepeatTarget = 3
  let currentVerseRepeatCount = 1

  // Built-in offline Quran texts for key kids surahs so it loads instantly without network lag!
  const OFFLINE_SURAHS = {
    1: [
      { num: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
      { num: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
      { num: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ' },
      { num: 4, text: 'مَالِكِ يَوْمِ الدِّينِ' },
      { num: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
      { num: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
      { num: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ' }
    ],
    114: [
      { num: 1, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ' },
      { num: 2, text: 'مَلِكِ النَّاسِ' },
      { num: 3, text: 'إِلَٰهِ النَّاسِ' },
      { num: 4, text: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ' },
      { num: 5, text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ' },
      { num: 6, text: 'مِنَ الْجِنَّةِ وَالنَّاسِ' }
    ],
    113: [
      { num: 1, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ' },
      { num: 2, text: 'مِن شَرِّ مَا خَلَقَ' },
      { num: 3, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ' },
      { num: 4, text: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ' },
      { num: 5, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ' }
    ],
    112: [
      { num: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ' },
      { num: 2, text: 'اللَّهُ الصَّمَدُ' },
      { num: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ' },
      { num: 4, text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ' }
    ],
    110: [
      { num: 1, text: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ' },
      { num: 2, text: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا' },
      { num: 3, text: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا' }
    ],
    108: [
      { num: 1, text: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ' },
      { num: 2, text: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ' },
      { num: 3, text: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ' }
    ]
  }

  function initQuran() {
    const surahPills = document.querySelectorAll('.surah-pill-card')
    const searchInput = document.getElementById('kidsSurahSearch')
    const btnMask = document.getElementById('btnToggleMaskMode')
    const repeatSelect = document.getElementById('verseRepeatSelect')
    const btnPlayPause = document.getElementById('btnPlayPauseVerse')
    const btnNext = document.getElementById('btnNextVerse')
    const btnPrev = document.getElementById('btnPrevVerse')
    const btnMarkDone = document.getElementById('btnMarkSurahDone')

    surahPills.forEach(pill => {
      pill.addEventListener('click', () => {
        sfx.tap()
        surahPills.forEach(p => p.classList.remove('selected'))
        pill.classList.add('selected')
        const id = parseInt(pill.getAttribute('data-surahid'), 10)
        const name = pill.getAttribute('data-surahname')
        loadSurah(id, name)
      })
    })

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase()
        surahPills.forEach(pill => {
          const name = pill.getAttribute('data-surahname') || ''
          const num = pill.getAttribute('data-surahid') || ''
          const matches = name.includes(q) || num.includes(q)
          pill.style.display = matches ? 'flex' : 'none'
        })
      })
    }

    if (btnMask) {
      btnMask.addEventListener('click', () => {
        sfx.tap()
        isMaskMode = !isMaskMode
        btnMask.classList.toggle('active', isMaskMode)
        renderVerses()
      })
    }

    if (repeatSelect) {
      repeatSelect.addEventListener('change', (e) => {
        verseRepeatTarget = parseInt(e.target.value, 10) || 3
        currentVerseRepeatCount = 1
        updateRepeatIndicator()
      })
    }

    if (btnPlayPause) {
      btnPlayPause.addEventListener('click', togglePlayCurrentVerse)
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        sfx.tap()
        if (currentPlayingVerseIdx < currentVerses.length - 1) {
          currentPlayingVerseIdx++
          currentVerseRepeatCount = 1
          playVerseAudio(currentPlayingVerseIdx)
        }
      })
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        sfx.tap()
        if (currentPlayingVerseIdx > 0) {
          currentPlayingVerseIdx--
          currentVerseRepeatCount = 1
          playVerseAudio(currentPlayingVerseIdx)
        }
      })
    }

    if (btnMarkDone) {
      btnMarkDone.addEventListener('click', () => {
        progress.markSurah(currentSurahId)
        speech.speak(`ما شاء الله يا بطل! بارك الله فيك وحفظك، لقد حفظت سورة ${currentSurahName}!`)
      })
    }

    verseAudio.addEventListener('ended', onVerseAudioEnded)

    // Load initial Surah (Al-Fatiha)
    loadSurah(1, 'الفاتحة')
  }

  function loadSurah(id, name) {
    currentSurahId = id
    currentSurahName = name
    currentPlayingVerseIdx = 0
    currentVerseRepeatCount = 1
    verseAudio.pause()
    isVersePlaying = false
    updatePlayButtonIcon()

    const nameEl = document.getElementById('currentSurahName')
    if (nameEl) nameEl.textContent = `سورة ${name}`

    const bismillah = document.getElementById('bismillahBanner')
    if (bismillah) {
      // Surah 9 (At-Tawbah) doesn't have Bismillah, and Al-Fatiha has it as Ayah 1
      bismillah.style.display = (id === 1 || id === 9) ? 'none' : 'block'
    }

    const list = document.getElementById('versesInteractiveList')
    if (list) {
      list.innerHTML = '<div class="verses-loading-placeholder"><i class="fa-solid fa-spinner fa-spin"></i> جاري إعداد آيات السورة...</div>'
    }

    // Check offline cache first
    if (OFFLINE_SURAHS[id]) {
      currentVerses = OFFLINE_SURAHS[id]
      renderVerses()
      return
    }

    // Fetch from Quran API (api.quran.com)
    fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.verses && data.verses.length) {
          currentVerses = data.verses.map((v, i) => ({
            num: i + 1,
            text: v.text_uthmani
          }))
          renderVerses()
        } else {
          fallbackRenderSurah()
        }
      })
      .catch(() => {
        fallbackRenderSurah()
      })
  }

  function fallbackRenderSurah() {
    // Generate minimal fallback placeholders
    currentVerses = [
      { num: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' }
    ]
    renderVerses()
  }

  function renderVerses() {
    const list = document.getElementById('versesInteractiveList')
    if (!list) return
    list.innerHTML = ''

    currentVerses.forEach((verse, idx) => {
      const row = document.createElement('div')
      row.className = `verse-item-row ${idx === currentPlayingVerseIdx ? 'active-verse' : ''}`
      row.id = `verseRow_${idx}`

      let textHtml = verse.text
      if (isMaskMode) {
        // Mask some words for memorization test
        const words = verse.text.split(' ')
        textHtml = words.map((w, wIdx) => {
          if (wIdx % 2 === 1) {
            return `<span class="masked-word" title="انقر لإظهار الكلمة" data-revealed="false">${w}</span>`
          }
          return w
        }).join(' ')
      }

      row.innerHTML = `
        <div class="verse-num-badge">۝ ${verse.num}</div>
        <div class="verse-text-body">${textHtml}</div>
        <div class="verse-row-actions">
          <button type="button" class="verse-listen-btn" title="استمع لهذه الآية"><i class="fa-solid fa-play"></i></button>
        </div>
      `

      // Click row to play
      row.querySelector('.verse-listen-btn').addEventListener('click', (e) => {
        e.stopPropagation()
        sfx.tap()
        currentPlayingVerseIdx = idx
        currentVerseRepeatCount = 1
        playVerseAudio(idx)
      })

      // Click masked word to reveal
      row.querySelectorAll('.masked-word').forEach(m => {
        m.addEventListener('click', (e) => {
          e.stopPropagation()
          sfx.tap()
          m.classList.add('revealed')
        })
      })

      list.appendChild(row)
    })

    updatePlayerLabel()
  }

  function getAyahAudioUrl(surah, ayah) {
    // Minshawi (teacher / kids repetition style) from EveryAyah CDN: 3 digits surah + 3 digits ayah
    const s = String(surah).padStart(3, '0')
    const a = String(ayah).padStart(3, '0')
    return `https://everyayah.com/data/Minshawy_Teacher_128kbps/${s}${a}.mp3`
  }

  function playVerseAudio(idx) {
    if (!currentVerses[idx]) return
    currentPlayingVerseIdx = idx

    // Highlight row
    document.querySelectorAll('.verse-item-row').forEach((r, i) => {
      r.classList.toggle('active-verse', i === idx)
    })

    const target = currentVerses[idx]
    const audioUrl = getAyahAudioUrl(currentSurahId, target.num)

    verseAudio.src = audioUrl
    verseAudio.play().then(() => {
      isVersePlaying = true
      updatePlayButtonIcon()
      updatePlayerLabel()
      updateRepeatIndicator()
    }).catch(() => {
      // Fallback: speak with Web Speech if audio file blocked by browser
      speech.speak(target.text, onVerseAudioEnded)
      isVersePlaying = true
      updatePlayButtonIcon()
    })
  }

  function onVerseAudioEnded() {
    if (currentVerseRepeatCount < verseRepeatTarget) {
      currentVerseRepeatCount++
      updateRepeatIndicator()
      setTimeout(() => {
        verseAudio.currentTime = 0
        verseAudio.play().catch(() => {})
      }, 500)
    } else {
      // Move to next verse if available
      currentVerseRepeatCount = 1
      if (currentPlayingVerseIdx < currentVerses.length - 1) {
        currentPlayingVerseIdx++
        playVerseAudio(currentPlayingVerseIdx)
      } else {
        // Finished whole Surah!
        isVersePlaying = false
        updatePlayButtonIcon()
        sfx.celebrate()
        launchKidsConfetti(50)
      }
    }
  }

  function togglePlayCurrentVerse() {
    sfx.tap()
    if (isVersePlaying) {
      verseAudio.pause()
      isVersePlaying = false
      updatePlayButtonIcon()
    } else {
      playVerseAudio(currentPlayingVerseIdx)
    }
  }

  function updatePlayButtonIcon() {
    const btn = document.getElementById('btnPlayPauseVerse')
    if (btn) {
      btn.innerHTML = isVersePlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>'
    }
  }

  function updatePlayerLabel() {
    const label = document.getElementById('currentPlayingVerseLabel')
    if (label && currentVerses[currentPlayingVerseIdx]) {
      label.textContent = `الآية ${currentVerses[currentPlayingVerseIdx].num} من سورة ${currentSurahName}`
    }
  }

  function updateRepeatIndicator() {
    const el = document.getElementById('repeatCounterIndicator')
    if (el) {
      el.textContent = `تكرار الآية: ${currentVerseRepeatCount} من ${verseRepeatTarget}`
    }
  }

  // ─── SECTION 4: DUAS & MANNERS ───
  function initDuas() {
    document.querySelectorAll('.dua-listen-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        const text = btn.getAttribute('data-text')
        speech.speak(text)
        progress.addStars(1, false)
      })
    })

    document.querySelectorAll('.dua-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        const text = btn.getAttribute('data-copy')
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(() => {
            alert('تم نسخ الدعاء المبارك بنجاح! 🤲')
          })
        }
      })
    })

    // Manners Quiz
    document.querySelectorAll('.manner-choice').forEach(choice => {
      choice.addEventListener('click', () => {
        const isCorrect = choice.getAttribute('data-correct') === 'true'
        const feedback = document.getElementById('mannersFeedback')
        if (isCorrect) {
          sfx.correct()
          choice.classList.add('correct')
          if (feedback) {
            feedback.textContent = '🌟 أحسنت يا بطل! هذا هو هدي رسولنا الكريم ﷺ في الطعام!'
            feedback.className = 'manners-feedback success'
          }
          progress.addStars(2, false)
          speech.speak('أحسنت! هذا أدب إسلامي رائع!')
        } else {
          sfx.wrong()
          choice.classList.add('wrong')
          if (feedback) {
            feedback.textContent = 'فكر ثانية يا بطل، ماذا علمنا النبي ﷺ أن نقول ونفعل؟'
            feedback.className = 'manners-feedback error'
          }
        }
      })
    })
  }

  // ─── SECTION 5: DRAWING & COLORING STUDIO ───
  let drawCanvas, drawCtx
  let isDrawing = false
  let currentColor = '#ef4444'
  let currentTool = 'pencil' // pencil | eraser
  let undoStack = []

  function initDrawing() {
    drawCanvas = document.getElementById('kidsDrawingCanvas')
    if (!drawCanvas) return
    drawCtx = drawCanvas.getContext('2d')

    resizeDrawingCanvas()

    // Tool toggles
    const pencilBtn = document.getElementById('toolPencil')
    const eraserBtn = document.getElementById('toolEraser')
    if (pencilBtn) {
      pencilBtn.addEventListener('click', () => {
        sfx.tap()
        currentTool = 'pencil'
        pencilBtn.classList.add('active')
        if (eraserBtn) eraserBtn.classList.remove('active')
      })
    }
    if (eraserBtn) {
      eraserBtn.addEventListener('click', () => {
        sfx.tap()
        currentTool = 'eraser'
        eraserBtn.classList.add('active')
        if (pencilBtn) pencilBtn.classList.remove('active')
      })
    }

    // Color Swatches
    document.querySelectorAll('.colors-row .color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        sfx.tap()
        document.querySelectorAll('.colors-row .color-swatch').forEach(s => s.classList.remove('active'))
        swatch.classList.add('active')
        currentColor = swatch.getAttribute('data-color')
        if (currentTool === 'eraser' && pencilBtn) pencilBtn.click()
      })
    })

    const customColor = document.getElementById('customColorPicker')
    if (customColor) {
      customColor.addEventListener('input', (e) => {
        currentColor = e.target.value
        if (currentTool === 'eraser' && pencilBtn) pencilBtn.click()
      })
    }

    // Brush Size Slider
    const sizeRange = document.getElementById('brushSizeRange')
    const sizeVal = document.getElementById('brushSizeVal')
    if (sizeRange && sizeVal) {
      sizeRange.addEventListener('input', (e) => {
        sizeVal.textContent = `${e.target.value}px`
      })
    }

    // Undo & Clear
    const undoBtn = document.getElementById('btnUndoDraw')
    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        sfx.tap()
        if (undoStack.length > 0) {
          const prev = undoStack.pop()
          const img = new Image()
          img.onload = () => {
            drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
            drawCtx.drawImage(img, 0, 0)
          }
          img.src = prev
        }
      })
    }

    const clearBtn = document.getElementById('btnClearDraw')
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        sfx.tap()
        if (confirm('هل تريد مسح اللوحة بالكامل والبدء برسمة جديدة؟')) {
          drawCtx.fillStyle = '#ffffff'
          drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height)
          undoStack = []
        }
      })
    }

    // Save to Gallery
    const saveBtn = document.getElementById('btnSaveDraw')
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const dataUrl = drawCanvas.toDataURL('image/png')
        progress.saveDrawing(dataUrl, 'لوحة الفنان الصغير')
        alert('🎉 تم حفظ لوحتك الرائعة في معرض أعمالك بنجاح!')
        renderSavedGallery()
      })
    }

    // Download PNG
    const downloadBtn = document.getElementById('btnDownloadDraw')
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        sfx.tap()
        const link = document.createElement('a')
        link.download = `لوحة_طفلي_${Date.now()}.png`
        link.href = drawCanvas.toDataURL('image/png')
        link.click()
      })
    }

    // Canvas Drawing Listeners
    function getCanvasPos(e) {
      const rect = drawCanvas.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      return {
        x: (clientX - rect.left) * (drawCanvas.width / rect.width),
        y: (clientY - rect.top) * (drawCanvas.height / rect.height)
      }
    }

    function startDraw(e) {
      e.preventDefault()
      isDrawing = true
      // Push undo snapshot
      undoStack.push(drawCanvas.toDataURL())
      if (undoStack.length > 15) undoStack.shift()

      const p = getCanvasPos(e)
      drawCtx.beginPath()
      drawCtx.moveTo(p.x, p.y)
      drawCtx.lineCap = 'round'
      drawCtx.lineJoin = 'round'
      const sz = parseInt(document.getElementById('brushSizeRange')?.value || '8', 10)
      drawCtx.lineWidth = sz
      drawCtx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor
    }

    function moveDraw(e) {
      if (!isDrawing) return
      e.preventDefault()
      const p = getCanvasPos(e)
      drawCtx.lineTo(p.x, p.y)
      drawCtx.stroke()
    }

    function endDraw(e) {
      if (!isDrawing) return
      isDrawing = false
      drawCtx.closePath()
    }

    drawCanvas.addEventListener('mousedown', startDraw)
    drawCanvas.addEventListener('mousemove', moveDraw)
    window.addEventListener('mouseup', endDraw)

    drawCanvas.addEventListener('touchstart', startDraw, { passive: false })
    drawCanvas.addEventListener('touchmove', moveDraw, { passive: false })
    window.addEventListener('touchend', endDraw)

    // Init Coloring sub-mode
    initColoringBook()

    // Init Lessons
    initDrawingLessons()

    // Render Gallery
    renderSavedGallery()
  }

  function resizeDrawingCanvas() {
    if (!drawCanvas || !drawCtx) return
    const container = drawCanvas.parentElement
    if (!container) return

    // Save existing content before resize
    let tempImg = null
    if (drawCanvas.width > 0 && drawCanvas.height > 0) {
      tempImg = drawCanvas.toDataURL()
    }

    const width = Math.min(container.clientWidth || 900, 900)
    const height = 520
    drawCanvas.width = width
    drawCanvas.height = height

    drawCtx.fillStyle = '#ffffff'
    drawCtx.fillRect(0, 0, width, height)

    if (tempImg) {
      const img = new Image()
      img.onload = () => drawCtx.drawImage(img, 0, 0)
      img.src = tempImg
    }
  }

  // ─── Ready to Color SVGs ───
  let activeColoringColor = '#f43f5e'

  const COLORING_SVGS = {
    mosque: `
      <svg viewBox="0 0 400 320" class="coloring-svg">
        <!-- Sky / Background -->
        <rect x="0" y="0" width="400" height="320" fill="#f8fafc" class="color-part"/>
        <!-- Main Dome -->
        <path d="M140 180 C140 100, 260 100, 260 180 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <!-- Crescent atop dome -->
        <path d="M195 90 A12 12 0 1 0 205 75 A10 10 0 1 1 195 90 Z" fill="#ffffff" stroke="#1e293b" stroke-width="2" class="color-part"/>
        <!-- Main Building -->
        <rect x="120" y="180" width="160" height="110" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <!-- Mosque Door Arch -->
        <path d="M175 290 L175 230 C175 210, 225 210, 225 230 L225 290 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <!-- Left Minaret -->
        <rect x="70" y="90" width="30" height="200" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <path d="M65 90 L85 45 L105 90 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <!-- Right Minaret -->
        <rect x="300" y="90" width="30" height="200" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <path d="M295 90 L315 45 L335 90 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <!-- Ground -->
        <rect x="0" y="290" width="400" height="30" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
      </svg>
    `,
    crescent: `
      <svg viewBox="0 0 400 320" class="coloring-svg">
        <rect x="0" y="0" width="400" height="320" fill="#f8fafc" class="color-part"/>
        <!-- Crescent -->
        <path d="M180 60 A90 90 0 1 0 250 230 A110 110 0 1 1 180 60 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <!-- Star -->
        <polygon points="270,110 282,138 312,138 288,155 297,184 270,166 243,184 252,155 228,138 258,138" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
      </svg>
    `,
    fish: `
      <svg viewBox="0 0 400 320" class="coloring-svg">
        <rect x="0" y="0" width="400" height="320" fill="#f8fafc" class="color-part"/>
        <!-- Fish Body -->
        <path d="M80 160 C120 70, 260 70, 300 160 C260 250, 120 250, 80 160 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <!-- Tail -->
        <polygon points="80,160 30,100 30,220" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <!-- Eye -->
        <circle cx="260" cy="140" r="14" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <circle cx="264" cy="140" r="6" fill="#1e293b"/>
        <!-- Fin -->
        <path d="M170 160 C180 110, 220 130, 210 170 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
      </svg>
    `,
    flower: `
      <svg viewBox="0 0 400 320" class="coloring-svg">
        <rect x="0" y="0" width="400" height="320" fill="#f8fafc" class="color-part"/>
        <!-- Stem -->
        <rect x="195" y="160" width="10" height="130" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <!-- Left Leaf -->
        <ellipse cx="160" cy="220" rx="35" ry="16" transform="rotate(-30 160 220)" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <!-- Right Leaf -->
        <ellipse cx="240" cy="220" rx="35" ry="16" transform="rotate(30 240 220)" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <!-- Petals -->
        <circle cx="200" cy="100" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <circle cx="150" cy="130" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <circle cx="160" cy="190" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <circle cx="240" cy="190" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <circle cx="250" cy="130" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <!-- Center -->
        <circle cx="200" cy="150" r="28" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
      </svg>
    `,
    tree: `
      <svg viewBox="0 0 400 320" class="coloring-svg">
        <rect x="0" y="0" width="400" height="320" fill="#f8fafc" class="color-part"/>
        <!-- Trunk -->
        <path d="M180 290 L185 160 L215 160 L220 290 Z" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <!-- Tree Foliage Circles -->
        <circle cx="150" cy="130" r="45" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <circle cx="250" cy="130" r="45" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <circle cx="200" cy="80" r="50" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
        <circle cx="200" cy="140" r="40" fill="#ffffff" stroke="#1e293b" stroke-width="4" class="color-part"/>
      </svg>
    `
  }

  function initColoringBook() {
    const container = document.getElementById('coloringSvgContainer')
    const palette = document.getElementById('coloringPalette')
    const templateButtons = document.querySelectorAll('#coloringTemplatesBar .template-choice')

    if (palette) {
      palette.querySelectorAll('.color-swatch-big').forEach(swatch => {
        swatch.addEventListener('click', () => {
          sfx.tap()
          palette.querySelectorAll('.color-swatch-big').forEach(s => s.classList.remove('active'))
          swatch.classList.add('active')
          activeColoringColor = swatch.getAttribute('data-color')
        })
      })
    }

    templateButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        templateButtons.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        loadColoringTemplate(btn.getAttribute('data-shape'))
      })
    })

    const resetBtn = document.getElementById('btnResetColoring')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        sfx.tap()
        const activeBtn = document.querySelector('#coloringTemplatesBar .template-choice.active')
        if (activeBtn) {
          loadColoringTemplate(activeBtn.getAttribute('data-shape'))
        }
      })
    }

    const saveColoringBtn = document.getElementById('btnSaveColoring')
    if (saveColoringBtn && container) {
      saveColoringBtn.addEventListener('click', () => {
        sfx.star()
        progress.addStars(3, true)
        alert('🎉 تم حفظ تلوينتك الجميلة! لقد حصلت على 3 نجوم ذهبية ⭐')
      })
    }

    loadColoringTemplate('mosque')
  }

  function loadColoringTemplate(shapeKey) {
    const container = document.getElementById('coloringSvgContainer')
    if (!container || !COLORING_SVGS[shapeKey]) return
    container.innerHTML = COLORING_SVGS[shapeKey]

    container.querySelectorAll('.color-part').forEach(part => {
      part.addEventListener('click', () => {
        sfx.tap()
        part.setAttribute('fill', activeColoringColor)
      })
    })
  }

  // ─── Step-by-Step Drawing Lessons ───
  const DRAWING_LESSONS = [
    {
      title: 'كيف ترسم مسجداً مباركاً 🕌',
      steps: [
        '١. ارسم مربعاً كبيراً في المنتصف لجسم المسجد.',
        '٢. ارسم نصف دائرة فوق المربع لعمل القبة الجميلة.',
        '٣. أضف مستطيلين طويلين على الجانبين للمئذنتين.',
        '٤. ارسم مثلثاً صغيراً فوق كل مئذنة وهلالاً فوق القبة.',
        '٥. ارسم قوساً مقوساً في الأسفل لباب المسجد ولوّن لوحتك!'
      ]
    },
    {
      title: 'كيف ترسم سمكة سابحة 🐟',
      steps: [
        '١. ارسم شكل بيضاوي مائل لجسم السمكة.',
        '٢. ارسم مثلثاً متصلاً بالخلف لعمل ذيل السمكة.',
        '٣. ارسم عيناً صغيرة لطيفة وابتسامة سعيدة.',
        '٤. أضف زعانف صغيرة في الأعلى والأسفل.',
        '٥. ارسم حراشف مقوسة وفقاعات ماء حولها!'
      ]
    },
    {
      title: 'كيف ترسم وردة متفتحة 🌸',
      steps: [
        '١. ارسم دائرة صغيرة في المنتصف لقلب الوردة.',
        '٢. ارسم 5 أو 6 دوائر صغيرة حولها لتكون بتلات الوردة.',
        '٣. انزل بخط رأسي مستقيم للأسفل لساق الوردة.',
        '٤. ارسم ورقتين شجر خضراوين على جانبي الساق.',
        '٥. لوّن البتلات بالوردي والقلب بالأصفر الجميل!'
      ]
    }
  ]

  function initDrawingLessons() {
    const grid = document.getElementById('drawingLessonsGrid')
    if (!grid) return
    grid.innerHTML = ''

    DRAWING_LESSONS.forEach(lesson => {
      const card = document.createElement('div')
      card.className = 'lesson-card'
      const stepsHtml = lesson.steps.map(s => `<li>${s}</li>`).join('')
      card.innerHTML = `
        <h3>${lesson.title}</h3>
        <ol class="lesson-steps-list">${stepsHtml}</ol>
        <button type="button" class="submode-pill" style="margin-top:12px;">جرب رسمها الآن ✏️</button>
      `
      card.querySelector('button').addEventListener('click', () => {
        sfx.tap()
        const freePill = document.querySelector('.drawing-submode-bar .submode-pill[data-sub="draw-free"]')
        if (freePill) freePill.click()
      })
      grid.appendChild(card)
    })
  }

  // ─── Render Saved Gallery ───
  function renderSavedGallery() {
    const emptyState = document.getElementById('galleryEmptyState')
    const grid = document.getElementById('galleryCardsGrid')
    if (!grid) return

    const drawings = progress.data.drawings || []
    if (drawings.length === 0) {
      if (emptyState) emptyState.style.display = 'block'
      grid.innerHTML = ''
      return
    }

    if (emptyState) emptyState.style.display = 'none'
    grid.innerHTML = ''

    drawings.forEach(d => {
      const card = document.createElement('div')
      card.className = 'saved-drawing-card'
      card.innerHTML = `
        <img src="${d.dataUrl}" alt="${d.title}" class="saved-drawing-thumb" />
        <div class="saved-drawing-meta">
          <strong>${d.title}</strong>
          <small>${d.date}</small>
        </div>
        <div class="saved-drawing-actions">
          <a href="${d.dataUrl}" download="${d.title}.png" class="gallery-action-btn" title="تنزيل"><i class="fa-solid fa-download"></i></a>
          <button type="button" class="gallery-action-btn delete" data-id="${d.id}" title="حذف"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      `
      card.querySelector('.delete').addEventListener('click', () => {
        sfx.tap()
        if (confirm('هل تريد حذف هذه الرسمة من معرضك؟')) {
          progress.deleteDrawing(d.id)
          renderSavedGallery()
        }
      })
      grid.appendChild(card)
    })
  }

  // ─── SECTION 6: EDUCATIONAL GAMES ───
  // Game 1: Memory Cards Match
  let memoryCards = []
  let flippedCards = []
  let matchedPairs = 0
  let flipsCount = 0

  const MEMORY_PAIRS = [
    { val: 'أ', img: '🦁', name: 'أسد' },
    { val: 'ب', img: '🦆', name: 'بطة' },
    { val: 'ت', img: '🍎', name: 'تفاح' },
    { val: 'ج', img: '🐪', name: 'جمل' },
    { val: 'س', img: '🐟', name: 'سمكة' },
    { val: 'ش', img: '☀️', name: 'شمس' }
  ]

  function initMemoryGame() {
    const board = document.getElementById('memoryCardsBoard')
    const flipsLabel = document.getElementById('memFlipsCount')
    const matchesLabel = document.getElementById('memMatchesCount')
    const restartBtn = document.getElementById('btnRestartMemory')

    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        sfx.tap()
        startNewMemoryGame()
      })
    }

    startNewMemoryGame()
  }

  function startNewMemoryGame() {
    const board = document.getElementById('memoryCardsBoard')
    const flipsLabel = document.getElementById('memFlipsCount')
    const matchesLabel = document.getElementById('memMatchesCount')
    if (!board) return

    matchedPairs = 0
    flipsCount = 0
    flippedCards = []
    if (flipsLabel) flipsLabel.textContent = '0'
    if (matchesLabel) matchesLabel.textContent = '0 / 6'

    // Create 12 cards (6 pairs)
    const deck = []
    MEMORY_PAIRS.forEach((item, pairIdx) => {
      deck.push({ ...item, pairIdx, cardId: pairIdx * 2 })
      deck.push({ ...item, pairIdx, cardId: pairIdx * 2 + 1 })
    })
    deck.sort(() => 0.5 - Math.random())

    board.innerHTML = ''
    deck.forEach(item => {
      const card = document.createElement('div')
      card.className = 'memory-card'
      card.setAttribute('data-pair', item.pairIdx)
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-back">❓</div>
          <div class="card-face card-front">
            <span class="card-front-letter">${item.val}</span>
            <span class="card-front-emoji">${item.img}</span>
          </div>
        </div>
      `
      card.addEventListener('click', () => onMemoryCardClick(card, item))
      board.appendChild(card)
    })
  }

  function onMemoryCardClick(cardEl, item) {
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched') || flippedCards.length >= 2) {
      return
    }

    sfx.tap()
    cardEl.classList.add('flipped')
    flippedCards.push({ cardEl, item })

    if (flippedCards.length === 2) {
      flipsCount++
      const flipsLabel = document.getElementById('memFlipsCount')
      if (flipsLabel) flipsLabel.textContent = flipsCount

      const [c1, c2] = flippedCards
      if (c1.item.pairIdx === c2.item.pairIdx) {
        // Match!
        setTimeout(() => {
          sfx.correct()
          c1.cardEl.classList.add('matched')
          c2.cardEl.classList.add('matched')
          matchedPairs++
          const matchesLabel = document.getElementById('memMatchesCount')
          if (matchesLabel) matchesLabel.textContent = `${matchedPairs} / 6`
          speech.speak(`أحسنت! حرف ${c1.item.val}`)
          flippedCards = []

          if (matchedPairs === 6) {
            // Won game!
            sfx.celebrate()
            launchKidsConfetti(70)
            progress.data.gamesWon = (progress.data.gamesWon || 0) + 1
            progress.addStars(5, true)
            speech.speak('مبروك يا عبقري! لقد وجدت جميع الأزواج بنجاح!')
          }
        }, 400)
      } else {
        // No match
        setTimeout(() => {
          sfx.wrong()
          c1.cardEl.classList.remove('flipped')
          c2.cardEl.classList.remove('flipped')
          flippedCards = []
        }, 900)
      }
    }
  }

  // Game 2: Word Scramble
  const SCRAMBLE_WORDS = [
    { word: 'قَمَر', letters: ['ق', 'م', 'ر'], emoji: '🌙' },
    { word: 'شَمْس', letters: ['ش', 'م', 'س'], emoji: '☀️' },
    { word: 'أَسَد', letters: ['أ', 'س', 'د'], emoji: '🦁' },
    { word: 'كِتَاب', letters: ['ك', 'ت', 'ا', 'ب'], emoji: '📖' },
    { word: 'مَسْجِد', letters: ['م', 'س', 'ج', 'د'], emoji: '🕌' }
  ]
  let currentScrambleIdx = 0
  let userPlacedLetters = []

  function initWordScramble() {
    const checkBtn = document.getElementById('btnCheckScramble')
    const nextBtn = document.getElementById('btnNextScramble')
    if (checkBtn) {
      checkBtn.addEventListener('click', checkScrambleAnswer)
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sfx.tap()
        currentScrambleIdx = (currentScrambleIdx + 1) % SCRAMBLE_WORDS.length
        loadScrambleWord()
      })
    }
    loadScrambleWord()
  }

  function loadScrambleWord() {
    const target = SCRAMBLE_WORDS[currentScrambleIdx]
    const emojiEl = document.getElementById('scrambleEmoji')
    const slotsRow = document.getElementById('scrambleSlotsRow')
    const tilesRow = document.getElementById('scrambleTilesRow')
    const feedback = document.getElementById('scrambleFeedback')

    if (emojiEl) emojiEl.textContent = target.emoji
    if (feedback) feedback.textContent = ''
    userPlacedLetters = new Array(target.letters.length).fill(null)

    if (slotsRow) {
      slotsRow.innerHTML = ''
      for (let i = 0; i < target.letters.length; i++) {
        const slot = document.createElement('div')
        slot.className = 'scramble-slot'
        slot.setAttribute('data-idx', i)
        slot.textContent = 'ـ'
        slotsRow.appendChild(slot)
      }
    }

    if (tilesRow) {
      tilesRow.innerHTML = ''
      const shuffled = [...target.letters].sort(() => 0.5 - Math.random())
      shuffled.forEach(char => {
        const tile = document.createElement('button')
        tile.type = 'button'
        tile.className = 'scramble-tile-btn'
        tile.textContent = char
        tile.addEventListener('click', () => {
          sfx.tap()
          // Place in first empty slot
          const emptyIdx = userPlacedLetters.findIndex(l => l === null)
          if (emptyIdx !== -1) {
            userPlacedLetters[emptyIdx] = char
            tile.disabled = true
            const slotEl = slotsRow.children[emptyIdx]
            if (slotEl) slotEl.textContent = char
          }
        })
        tilesRow.appendChild(tile)
      })
    }
  }

  function checkScrambleAnswer() {
    const target = SCRAMBLE_WORDS[currentScrambleIdx]
    const feedback = document.getElementById('scrambleFeedback')
    const answer = userPlacedLetters.join('')

    if (answer === target.letters.join('')) {
      sfx.correct()
      if (feedback) {
        feedback.textContent = `🎉 أحسنت صنعاً! الكلمة هي "${target.word}"!`
        feedback.className = 'scramble-feedback success'
      }
      progress.addStars(3, false)
      speech.speak(`ممتاز! كلمة ${target.word}`)
      setTimeout(() => {
        currentScrambleIdx = (currentScrambleIdx + 1) % SCRAMBLE_WORDS.length
        loadScrambleWord()
      }, 1500)
    } else {
      sfx.wrong()
      if (feedback) {
        feedback.textContent = `ليست مرتبة بالشكل الصحيح يا بطل، حاول ثانية!`
        feedback.className = 'scramble-feedback error'
      }
      setTimeout(loadScrambleWord, 1000)
    }
  }

  // Game 3: Missing Letter
  const MISSING_WORDS = [
    { full: 'تُفَّاح', missing: 'تـ', choices: ['تـ', 'بـ', 'سـ', 'جـ'], display: '؟ـفَّاح', emoji: '🍎' },
    { full: 'بَطَّة', missing: 'بـ', choices: ['بـ', 'نـ', 'فـ', 'مـ'], display: '؟ـطَّة', emoji: '🦆' },
    { full: 'سَمَكَة', missing: 'سـ', choices: ['سـ', 'شـ', 'صـ', 'كـ'], display: '؟ـمَكَة', emoji: '🐟' },
    { full: 'شَمْس', missing: 'شـ', choices: ['شـ', 'سـ', 'ضـ', 'عـ'], display: '؟ـمْس', emoji: '☀️' }
  ]
  let currentMissingIdx = 0

  function initMissingLetterGame() {
    loadMissingQuestion()
  }

  function loadMissingQuestion() {
    const target = MISSING_WORDS[currentMissingIdx]
    const emojiEl = document.getElementById('missingEmoji')
    const displayEl = document.getElementById('missingWordDisplay')
    const choicesRow = document.getElementById('missingChoicesRow')
    const feedback = document.getElementById('missingFeedback')

    if (emojiEl) emojiEl.textContent = target.emoji
    if (displayEl) displayEl.innerHTML = `<span class="missing-placeholder">${target.display}</span>`
    if (feedback) feedback.textContent = ''

    if (choicesRow) {
      choicesRow.innerHTML = ''
      target.choices.forEach(ch => {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'missing-choice-btn'
        btn.textContent = ch
        btn.addEventListener('click', () => {
          if (ch === target.missing) {
            sfx.correct()
            btn.classList.add('correct')
            feedback.textContent = `🎉 أحسنت! الكلمة كاملة هي "${target.full}"!`
            feedback.className = 'missing-feedback success'
            progress.addStars(2, false)
            speech.speak(`إجابة صحيحة، ${target.full}`)
            setTimeout(() => {
              currentMissingIdx = (currentMissingIdx + 1) % MISSING_WORDS.length
              loadMissingQuestion()
            }, 1500)
          } else {
            sfx.wrong()
            btn.classList.add('wrong')
            feedback.textContent = `حرف غير صحيح يا بطل، جرب اختياراً آخر!`
            feedback.className = 'missing-feedback error'
          }
        })
        choicesRow.appendChild(btn)
      })
    }
  }

  // ─── SECTION 7: CERTIFICATE & PRINTING ───
  function initCertificate() {
    const openBtn = document.getElementById('btnOpenCertModal')
    const closeBtn = document.getElementById('closeCertModalBtn')
    const closeBg = document.getElementById('closeCertModalBg')
    const cancelBtn = document.getElementById('btnCancelCert')
    const modal = document.getElementById('kidsCertModal')
    const printBtn = document.getElementById('btnPrintCert')
    const datePrint = document.getElementById('certDatePrintVal')

    if (datePrint) {
      datePrint.textContent = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    function openModal() {
      sfx.star()
      if (modal) modal.style.display = 'flex'
      launchKidsConfetti(40)
    }

    function closeModal() {
      if (modal) modal.style.display = 'none'
    }

    if (openBtn) openBtn.addEventListener('click', openModal)
    if (closeBtn) closeBtn.addEventListener('click', closeModal)
    if (closeBg) closeBg.addEventListener('click', closeModal)
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal)

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        sfx.celebrate()
        window.print()
      })
    }
  }

  // ─── SECTION 8: PARENT PROGRESS & RESET ───
  function initParentDashboard() {
    const resetBtn = document.getElementById('btnResetChildProgress')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => progress.reset())
    }
  }

  // ─── MAIN BOOTSTRAP ───
  document.addEventListener('DOMContentLoaded', () => {
    initTabs()
    initLetters()
    initNumbers()
    initQuran()
    initDuas()
    initDrawing()
    initMemoryGame()
    initWordScramble()
    initMissingLetterGame()
    initCertificate()
    initParentDashboard()

    // Sync UI with storage data
    progress.updateUI()
  })

})()
