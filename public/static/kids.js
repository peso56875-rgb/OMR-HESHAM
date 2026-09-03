/**
 * واحة أطفال المؤسسة — Kids Learning Hub v2.4.0
 * 1. Sheikh Al-Minshawi Teacher Recitation with Children Repetition (المصحف المعلم بصوت المنشاوي وترديد الأطفال)
 * 2. Ultra-Accurate Classical Arabic Voice Engine (Google Natural Arabic + Neural TTS)
 * 3. Emoji Art & Stickers Studio (replacing SVGs with child-friendly emojis and stamps)
 * 4. 7 Multi-Level Kids Games with Emojis, XP, and Daily Quests
 */

;(function () {
  'use strict'

  // ─── Web Audio Chimes & Sound Synthesizer ───
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
      window.addEventListener('pointerdown', this.initCtx, { once: true })
      window.addEventListener('keydown', this.initCtx, { once: true })
    }

    playTone(freq, type = 'sine', duration = 0.2, gainVal = 0.12) {
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
      this.playTone(520, 'sine', 0.06, 0.08)
    }

    pop() {
      this.playTone(880, 'sine', 0.04, 0.2)
      setTimeout(() => this.playTone(440, 'triangle', 0.08, 0.15), 25)
    }

    correct() {
      this.playTone(523.25, 'sine', 0.16, 0.18) // C5
      setTimeout(() => this.playTone(659.25, 'sine', 0.22, 0.22), 110) // E5
      setTimeout(() => this.playTone(783.99, 'sine', 0.35, 0.25), 220) // G5
    }

    wrong() {
      this.playTone(260, 'sawtooth', 0.18, 0.12)
      setTimeout(() => this.playTone(220, 'sawtooth', 0.26, 0.12), 130)
    }

    star() {
      const notes = [659.25, 830.61, 987.77, 1318.51]
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'sine', 0.3, 0.16), i * 85)
      })
    }

    celebrate() {
      const fanfare = [523.25, 523.25, 659.25, 783.99, 1046.5]
      fanfare.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.22, 0.2), idx * 100)
      })
    }
  }

  const sfx = new SoundFX()

  // ─── High-Accuracy Classical Arabic Voice Engine (Google Natural Voice + Neural Fallback) ───
  class KidsSpeech {
    constructor() {
      this.audioEl = new Audio()
      this.audioEl.preload = 'auto'
      this.synth = window.speechSynthesis || null
      this.bestVoice = null
      this.initVoices()
    }

    initVoices() {
      if (!this.synth) return
      const pick = () => {
        const voices = this.synth.getVoices()
        this.bestVoice = voices.find(v => v.lang && v.lang.startsWith('ar') && (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural'))) ||
                         voices.find(v => v.lang && v.lang.startsWith('ar') && v.name.includes('Google')) ||
                         voices.find(v => v.lang === 'ar-SA' || v.lang === 'ar_SA') ||
                         voices.find(v => v.lang && v.lang.startsWith('ar')) || null
      }
      pick()
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = pick
      }
    }

    speak(text, onEnd = null) {
      if (!text) return
      // Clean text of emojis and special characters for clear pronunciation
      const cleanText = text.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu, '').replace(/[•—\-_]/g, ' ').trim()
      if (!cleanText) return

      this.stop()

      // Primary: Google Natural Arabic TTS (Crystal clear Classical Arabic with perfect vowels)
      const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encodeURIComponent(cleanText)}`
      
      this.audioEl.src = googleTtsUrl
      this.audioEl.onended = () => {
        if (onEnd) onEnd()
      }
      this.audioEl.onerror = () => {
        this.speakViaSynth(cleanText, onEnd)
      }

      const p = this.audioEl.play()
      if (p !== undefined) {
        p.catch(() => {
          this.speakViaSynth(cleanText, onEnd)
        })
      }
    }

    speakViaSynth(text, onEnd) {
      if (!this.synth) return
      try {
        this.synth.cancel()
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang = 'ar-SA'
        if (this.bestVoice) utter.voice = this.bestVoice
        utter.rate = 0.85
        utter.pitch = 1.05
        if (onEnd) utter.onend = onEnd
        this.synth.speak(utter)
      } catch (e) {
        console.warn('Synth error:', e)
      }
    }

    stop() {
      if (this.audioEl) {
        this.audioEl.pause()
        this.audioEl.currentTime = 0
        this.audioEl.onended = null
        this.audioEl.onerror = null
      }
      if (this.synth) {
        this.synth.cancel()
      }
    }
  }

  const speech = new KidsSpeech()

  // ─── Confetti Particle Generator ───
  function launchTastefulConfetti(count = 45) {
    const container = document.getElementById('kidsConfettiOverlay')
    if (!container) return
    sfx.celebrate()
    container.innerHTML = ''
    const colors = ['#0c4a3f', '#168a70', '#d97706', '#2563eb', '#7c3aed', '#f59e0b', '#ec4899']

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div')
      piece.className = 'confetti-piece'
      const startX = Math.random() * 100
      const endX = startX + (Math.random() * 30 - 15)
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = Math.random() * 10 + 6
      const duration = Math.random() * 1.8 + 1.6

      piece.style.cssText = `
        position: fixed;
        top: -15px;
        left: ${startX}vw;
        width: ${size}px;
        height: ${size * 0.7}px;
        background: ${color};
        opacity: 0.9;
        transform: rotate(${Math.random() * 360}deg);
        border-radius: 2px;
        z-index: 9999;
        pointer-events: none;
        transition: transform ${duration}s ease-out, top ${duration}s ease-in, opacity ${duration}s ease;
      `
      container.appendChild(piece)

      setTimeout(() => {
        piece.style.top = '105vh'
        piece.style.left = `${endX}vw`
        piece.style.transform = `rotate(${Math.random() * 540}deg) scale(0.6)`
        piece.style.opacity = '0'
      }, 25)

      setTimeout(() => piece.remove(), duration * 1000 + 200)
    }
  }

  // ─── Progress, XP & Daily Quests Manager ───
  class ProgressManager {
    constructor() {
      this.STORAGE_KEY = 'omar_kids_progress_v2_4'
      this.data = this.load()
    }

    load() {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY)
        if (raw) return JSON.parse(raw)
      } catch (e) {}
      return {
        stars: 0,
        xp: 0,
        level: 1,
        dailyQuests: {
          balloon: 0, // out of 5
          memory: false,
          math: 0, // out of 2
          treasureClaimed: false
        },
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

    addXp(amount = 10) {
      this.data.xp = (this.data.xp || 0) + amount
      const nextLevelReq = this.data.level * 100
      if (this.data.xp >= nextLevelReq) {
        this.data.level = (this.data.level || 1) + 1
        sfx.celebrate()
        launchTastefulConfetti(60)
        speech.speak(`مبارك يا بطل! ارتقيت إلى المستوى ${this.data.level}!`)
      }
      this.save()
    }

    addStars(count = 1, celebrate = true) {
      this.data.stars = (this.data.stars || 0) + count
      this.addXp(count * 5)
      sfx.star()
      if (celebrate && count >= 3) {
        launchTastefulConfetti(count * 6)
      }
      this.checkBadges()
      this.save()
    }

    updateQuest(type, amount = 1) {
      if (!this.data.dailyQuests) {
        this.data.dailyQuests = { balloon: 0, memory: false, math: 0, treasureClaimed: false }
      }
      if (type === 'balloon') {
        this.data.dailyQuests.balloon = Math.min(5, (this.data.dailyQuests.balloon || 0) + amount)
      } else if (type === 'memory') {
        this.data.dailyQuests.memory = true
      } else if (type === 'math') {
        this.data.dailyQuests.math = Math.min(2, (this.data.dailyQuests.math || 0) + amount)
      }
      this.save()
    }

    claimTreasure() {
      if (!this.data.dailyQuests) return
      const q = this.data.dailyQuests
      if (q.balloon >= 5 && q.memory && q.math >= 2 && !q.treasureClaimed) {
        q.treasureClaimed = true
        this.addStars(25, true)
        this.data.badges['daily_treasure'] = true
        launchTastefulConfetti(80)
        speech.speak('ما شاء الله! فتحت صندوق الكنز الذهبي وحصلت على 25 نجمة تميز وسام الشبل المغوار!')
        this.save()
      }
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

    saveDrawing(dataUrl, title = 'لوحة إبداعية') {
      if (!this.data.drawings) this.data.drawings = []
      this.data.drawings.unshift({
        id: 'draw_' + Date.now(),
        dataUrl,
        title,
        date: new Date().toLocaleDateString('ar-EG')
      })
      if (this.data.drawings.length > 20) {
        this.data.drawings = this.data.drawings.slice(0, 20)
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
      const level = this.data.level || 1
      const xp = this.data.xp || 0

      // Header indicators
      const heroStars = document.getElementById('totalStarsCounter')
      if (heroStars) heroStars.textContent = starsCount

      const heroLetters = document.getElementById('lettersLearnedCounter')
      if (heroLetters) heroLetters.textContent = `${lettersCount} / 28`

      const heroSurahs = document.getElementById('surahsLearnedCounter')
      if (heroSurahs) heroSurahs.textContent = `${surahsCount} / 37`

      const rankTitle = document.getElementById('currentRankTitle')
      if (rankTitle) {
        if (starsCount >= 150) rankTitle.textContent = 'فارس القرآن والعلم 👑'
        else if (starsCount >= 80) rankTitle.textContent = 'بطل الواحة الذهبي 🦁'
        else if (starsCount >= 40) rankTitle.textContent = 'شبل مجتهد 🌟'
        else rankTitle.textContent = 'مستكشف مبتدئ 🐣'
      }

      // Games Bar Rank & XP
      const gameAvatar = document.getElementById('gameRankAvatar')
      if (gameAvatar) {
        gameAvatar.textContent = level >= 4 ? '👑' : level >= 3 ? '🦁' : level >= 2 ? '🌟' : '🐣'
      }
      const gameTitle = document.getElementById('gameRankTitle')
      if (gameTitle) {
        gameTitle.textContent = level >= 4 ? 'فارس واحة المعرفة' : level >= 3 ? 'بطل الألعاب والتحديات' : level >= 2 ? 'صائد النجوم الذكي' : 'شبل الواحة'
      }
      const gameLvlNum = document.getElementById('gameLevelNum')
      if (gameLvlNum) gameLvlNum.textContent = level
      const gameXp = document.getElementById('gameXpText')
      if (gameXp) gameXp.textContent = `${xp % 100} / 100 XP`

      // Daily Quests
      const q = this.data.dailyQuests || { balloon: 0, memory: false, math: 0, treasureClaimed: false }
      const qB = document.getElementById('questBalloon')
      if (qB) {
        qB.classList.toggle('completed', q.balloon >= 5)
        qB.innerHTML = `<span class="q-icon">🎈</span> اصطد 5 بالونات (${q.balloon}/5)`
      }
      const qM = document.getElementById('questMemory')
      if (qM) {
        qM.classList.toggle('completed', !!q.memory)
        qM.innerHTML = `<span class="q-icon">🧠</span> جولة ذاكرة (${q.memory ? 'مكتمل' : '0/1'})`
      }
      const qMath = document.getElementById('questMath')
      if (qMath) {
        qMath.classList.toggle('completed', q.math >= 2)
        qMath.innerHTML = `<span class="q-icon">⚡</span> حل تحدي حساب (${q.math}/2)`
      }

      const btnTreasure = document.getElementById('btnOpenTreasure')
      if (btnTreasure) {
        const canClaim = q.balloon >= 5 && q.memory && q.math >= 2 && !q.treasureClaimed
        btnTreasure.classList.toggle('disabled', !canClaim)
        btnTreasure.classList.toggle('ready-claim', canClaim)
        if (q.treasureClaimed) {
          btnTreasure.innerHTML = '<span class="treasure-emoji">✨</span><span class="treasure-text">تم فتح الصندوق</span>'
        }
      }

      // Certificate indicators
      const certStars = document.getElementById('certStarsTotal')
      if (certStars) certStars.textContent = starsCount

      const certStarsPrint = document.getElementById('certStarsPrintVal')
      if (certStarsPrint) certStarsPrint.textContent = `${starsCount} نقطة تميز`

      const galleryCountLabel = document.getElementById('galleryCountLabel')
      if (galleryCountLabel) galleryCountLabel.textContent = drawingsCount

      // Parents Dashboard
      const parentStars = document.getElementById('parentTotalStars')
      if (parentStars) parentStars.textContent = starsCount
      const parentLetters = document.getElementById('parentLettersProgress')
      if (parentLetters) parentLetters.textContent = `${lettersCount} / 28`
      const parentSurahs = document.getElementById('parentSurahsProgress')
      if (parentSurahs) parentSurahs.textContent = `${surahsCount} / 37`
      const parentDrawings = document.getElementById('parentDrawingsCount')
      if (parentDrawings) parentDrawings.textContent = drawingsCount

      // Trophy Cards
      for (const [badgeId, isUnlocked] of Object.entries(this.data.badges || {})) {
        const badgeEl = document.getElementById(`badge_${badgeId}`)
        if (badgeEl && isUnlocked) {
          badgeEl.textContent = 'تم الإنجاز بنجاح'
          badgeEl.classList.add('unlocked')
        }
      }

      // Surahs sidebar badges
      for (const surahId of Object.keys(this.data.surahsMemorized || {})) {
        const memBadge = document.getElementById(`memBadge_${surahId}`)
        if (memBadge) {
          memBadge.textContent = 'تم الحفظ'
          memBadge.classList.add('memorized')
        }
      }
    }

    reset() {
      if (confirm('هل ترغب في تصفير سجل إنجازات الطفل والبدء من جديد؟')) {
        localStorage.removeItem(this.STORAGE_KEY)
        this.data = this.load()
        this.updateUI()
        alert('تم تصفير السجل بنجاح! وفقكم الله.')
      }
    }
  }

  const progress = new ProgressManager()

  // ─── Main Tabs Navigation ───
  function initTabs() {
    const navTabs = document.querySelectorAll('.kids-nav-tab')
    const tabViews = document.querySelectorAll('.kids-tab-view')

    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        sfx.tap()
        const target = tab.getAttribute('data-tab')
        navTabs.forEach(t => {
          t.classList.remove('active')
          t.setAttribute('aria-selected', 'false')
        })
        tabViews.forEach(v => v.classList.remove('active'))

        tab.classList.add('active')
        tab.setAttribute('aria-selected', 'true')

        const targetView = document.getElementById(`panel-${target}`)
        if (targetView) targetView.classList.add('active')

        if (target === 'drawing') {
          setTimeout(resizeDrawingCanvas, 60)
          setTimeout(initEmojiColoringCanvas, 60)
        } else if (target === 'letters') {
          setTimeout(setupLetterTracer, 60)
        }
      })
    })

    // Sub-mode pill chips
    document.querySelectorAll('.sub-mode-row').forEach(row => {
      const chips = row.querySelectorAll('.sub-tab-chip')
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          sfx.tap()
          chips.forEach(c => c.classList.remove('active'))
          chip.classList.add('active')

          const targetSub = chip.getAttribute('data-sub')
          const parentView = row.closest('.kids-tab-view')
          if (parentView) {
            parentView.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'))
            const activeSub = parentView.querySelector(`#subview-${targetSub}`)
            if (activeSub) activeSub.classList.add('active')

            if (targetSub === 'draw-free') {
              setTimeout(resizeDrawingCanvas, 60)
            } else if (targetSub === 'draw-coloring') {
              setTimeout(initEmojiColoringCanvas, 60)
            } else if (targetSub === 'letters-tracer') {
              setTimeout(setupLetterTracer, 60)
            }
          }
        })
      })
    })

    // Hero Voice Greeting
    const guideBtn = document.getElementById('kidsAudioGuideBtn')
    if (guideBtn) {
      guideBtn.addEventListener('click', () => {
        sfx.correct()
        speech.speak('مرحباً بكم في واحة أطفال مؤسسة الدكتور عمر هشام الخيرية! هنا نستمع للمصحف المعلم بصوت الشيخ المنشاوي وترديد الأطفال، ونتعلم لغة القرآن والأرقام ونلعب أجمل الألعاب الهادفة.')
      })
    }

    // Treasure box button
    const treasureBtn = document.getElementById('btnOpenTreasure')
    if (treasureBtn) {
      treasureBtn.addEventListener('click', () => {
        progress.claimTreasure()
      })
    }
  }

  // ─── TAB 1: LETTERS & READING ───
  const LETTERS_DATA = [
    { letter: 'أ', name: 'ألف', word: 'أَسَد', emoji: '🦁', initial: { char: 'أَ', word: 'أَسَد' }, medial: { char: 'ـأَ', word: 'فَأْر' }, final: { char: 'ـأ', word: 'نَبَأ' } },
    { letter: 'ب', name: 'باء', word: 'بَاب', emoji: '🚪', initial: { char: 'بـ', word: 'بَيْت' }, medial: { char: 'ـبـ', word: 'حَبْل' }, final: { char: 'ـب', word: 'عِنَب' } },
    { letter: 'ت', name: 'تاء', word: 'تَاج', emoji: '👑', initial: { char: 'تـ', word: 'تَمْر' }, medial: { char: 'ـتـ', word: 'كِتَاب' }, final: { char: 'ـت', word: 'بِنْت' } },
    { letter: 'ث', name: 'ثاء', word: 'ثَمَر', emoji: '🍓', initial: { char: 'ثـ', word: 'ثَوْب' }, medial: { char: 'ـثـ', word: 'عُثْمَان' }, final: { char: 'ـث', word: 'أَثَاث' } },
    { letter: 'ج', name: 'جيم', word: 'جَمَل', emoji: '🐪', initial: { char: 'جـ', word: 'جَمَل' }, medial: { char: 'ـجـ', word: 'شَجَرَة' }, final: { char: 'ـج', word: 'بُرْج' } },
    { letter: 'ح', name: 'حاء', word: 'حَدِيقَة', emoji: '🎒', initial: { char: 'حـ', word: 'حَقِيبَة' }, medial: { char: 'ـحـ', word: 'بَحْر' }, final: { char: 'ـح', word: 'مِفْتَاح' } },
    { letter: 'خ', name: 'خاء', word: 'خَيْر', emoji: '🍞', initial: { char: 'خـ', word: 'خُبْز' }, medial: { char: 'ـخـ', word: 'نَخْلَة' }, final: { char: 'ـخ', word: 'مَطْبَخ' } },
    { letter: 'د', name: 'دال', word: 'دَفْتَر', emoji: '📓', initial: { char: 'د', word: 'دَفْتَر' }, medial: { char: 'ـد', word: 'مَدْرَسَة' }, final: { char: 'ـد', word: 'مَسْجِد' } },
    { letter: 'ذ', name: 'ذال', word: 'ذَهَب', emoji: '🌽', initial: { char: 'ذ', word: 'ذُرَة' }, medial: { char: 'ـذ', word: 'بَذْرَة' }, final: { char: 'ـذ', word: 'مُعَاذ' } },
    { letter: 'ر', name: 'راء', word: 'رَحْمَة', emoji: '🕊️', initial: { char: 'ر', word: 'رَسُول' }, medial: { char: 'ـر', word: 'قُرْآن' }, final: { char: 'ـر', word: 'نَهْر' } },
    { letter: 'ز', name: 'زاي', word: 'زَيْتُون', emoji: '🌸', initial: { char: 'ز', word: 'زَهْرَة' }, medial: { char: 'ـز', word: 'مَزْرَعَة' }, final: { char: 'ـز', word: 'خُبْز' } },
    { letter: 'س', name: 'سين', word: 'سَلَام', emoji: '☀️', initial: { char: 'سـ', word: 'سَمَاء' }, medial: { char: 'ـسـ', word: 'مَسْجِد' }, final: { char: 'ـس', word: 'شَمْس' } },
    { letter: 'ش', name: 'شين', word: 'شَمْس', emoji: '🌴', initial: { char: 'شـ', word: 'شَجَرَة' }, medial: { char: 'ـشـ', word: 'مِشْكَاة' }, final: { char: 'ـش', word: 'عُشّ' } },
    { letter: 'ص', name: 'صاد', word: 'صَلَاة', emoji: '💡', initial: { char: 'صـ', word: 'صَبَاح' }, medial: { char: 'ـصـ', word: 'مِصْبَاح' }, final: { char: 'ـص', word: 'قَفَص' } },
    { letter: 'ض', name: 'ضاد', word: 'ضِيَاء', emoji: '🌍', initial: { char: 'ضـ', word: 'ضَوْء' }, medial: { char: 'ـضـ', word: 'رَمَضَان' }, final: { char: 'ـض', word: 'أَرْض' } },
    { letter: 'ط', name: 'طاء', word: 'طَيْر', emoji: '✈️', initial: { char: 'طـ', word: 'طَالِب' }, medial: { char: 'ـطـ', word: 'مَطَر' }, final: { char: 'ـط', word: 'خَيْط' } },
    { letter: 'ظ', name: 'ظاء', word: 'ظِلّ', emoji: '✉️', initial: { char: 'ظـ', word: 'ظَرْف' }, medial: { char: 'ـظـ', word: 'نَظَافَة' }, final: { char: 'ـظ', word: 'حَافِظ' } },
    { letter: 'ع', name: 'عين', word: 'عِلْم', emoji: '👁️', initial: { char: 'عـ', word: 'عَيْن' }, medial: { char: 'ـعـ', word: 'مُعَلِّم' }, final: { char: 'ـع', word: 'شَارِع' } },
    { letter: 'غ', name: 'غين', word: 'غَيْم', emoji: '☁️', initial: { char: 'غـ', word: 'غَابَة' }, medial: { char: 'ـغـ', word: 'صَغِير' }, final: { char: 'ـغ', word: 'صِمَاغ' } },
    { letter: 'ف', name: 'فاء', word: 'فَجْر', emoji: '🏮', initial: { char: 'فـ', word: 'فَانُوس' }, medial: { char: 'ـفـ', word: 'طِفْل' }, final: { char: 'ـف', word: 'مُصْحَف' } },
    { letter: 'ق', name: 'قاف', word: 'قُرْآن', emoji: '✏️', initial: { char: 'قـ', word: 'قَلَم' }, medial: { char: 'ـقـ', word: 'حَقِيبَة' }, final: { char: 'ـق', word: 'شُرُوق' } },
    { letter: 'ك', name: 'كاف', word: 'كِتَاب', emoji: '📖', initial: { char: 'كـ', word: 'كَعْبَة' }, medial: { char: 'ـكـ', word: 'مَكْتَبَة' }, final: { char: 'ـك', word: 'مَلِك' } },
    { letter: 'ل', name: 'لام', word: 'لَوْحَة', emoji: '🍋', initial: { char: 'لـ', word: 'لَيْل' }, medial: { char: 'ـلـ', word: 'قَلَم' }, final: { char: 'ـل', word: 'جَمَل' } },
    { letter: 'م', name: 'ميم', word: 'مَسْجِد', emoji: '🕌', initial: { char: 'مـ', word: 'مِئْذَنَة' }, medial: { char: 'ـمـ', word: 'شَمْس' }, final: { char: 'ـم', word: 'قَلَم' } },
    { letter: 'ن', name: 'نون', word: 'نُور', emoji: '🌴', initial: { char: 'نـ', word: 'نَخْلَة' }, medial: { char: 'ـنـ', word: 'مِنْبَر' }, final: { char: 'ـن', word: 'مُؤْمِن' } },
    { letter: 'هـ', name: 'هاء', word: 'هِدَايَة', emoji: '🌙', initial: { char: 'هـ', word: 'هِلَال' }, medial: { char: 'ـهـ', word: 'زَهْرَة' }, final: { char: 'ـه', word: 'وَجْه' } },
    { letter: 'و', name: 'واو', word: 'وُضُوء', emoji: '🌹', initial: { char: 'و', word: 'وَطَن' }, medial: { char: 'ـو', word: 'نُور' }, final: { char: 'ـو', word: 'دَلْو' } },
    { letter: 'ي', name: 'ياء', word: 'يَقِين', emoji: '✋', initial: { char: 'يـ', word: 'يَد' }, medial: { char: 'ـيـ', word: 'إِيمَان' }, final: { char: 'ـي', word: 'أَخِي' } }
  ]

  let activeLetterObj = LETTERS_DATA[0]

  function initLetters() {
    const letterCards = document.querySelectorAll('.refined-letter-card')
    const spotlight = document.getElementById('letterSpotlight')
    const charEl = document.getElementById('spotlightChar')
    const titleEl = document.getElementById('spotlightTitle')
    const wordEl = document.getElementById('spotlightWord')
    const emojiEl = document.getElementById('spotlightEmoji')
    const playLetterBtn = document.getElementById('playLetterSoundBtn')
    const playWordBtn = document.getElementById('playWordSoundBtn')
    const goToPositionsBtn = document.getElementById('goToPositionsBtn')
    const goToTraceBtn = document.getElementById('goToTraceBtn')
    const closeSpotlight = document.getElementById('closeSpotlightBtn')

    letterCards.forEach(card => {
      card.addEventListener('click', () => {
        sfx.tap()
        const lChar = card.getAttribute('data-letter')
        const found = LETTERS_DATA.find(x => x.letter === lChar)
        if (found) {
          activeLetterObj = found
          progress.markLetter(found.letter)

          if (spotlight && charEl && titleEl && wordEl) {
            charEl.textContent = found.letter
            titleEl.textContent = `حرف ${found.name} — ${found.letter}`
            wordEl.textContent = found.word
            if (emojiEl) emojiEl.textContent = found.emoji || '🌟'
            spotlight.classList.add('visible')
          }
          speech.speak(`حرف ${found.name}، ${found.letter}، ${found.word}`)
        }
      })
    })

    if (closeSpotlight && spotlight) {
      closeSpotlight.addEventListener('click', () => spotlight.classList.remove('visible'))
    }

    if (playLetterBtn) {
      playLetterBtn.addEventListener('click', () => {
        sfx.tap()
        speech.speak(`حرف ${activeLetterObj.name}، ${activeLetterObj.letter}`)
      })
    }

    if (playWordBtn) {
      playWordBtn.addEventListener('click', () => {
        sfx.tap()
        speech.speak(activeLetterObj.word)
      })
    }

    if (goToPositionsBtn) {
      goToPositionsBtn.addEventListener('click', () => {
        const posChip = document.querySelector('.sub-tab-chip[data-sub="letters-positions"]')
        if (posChip) {
          posChip.click()
          const select = document.getElementById('posLetterSelect')
          if (select) {
            select.value = activeLetterObj.letter
            renderPositionsForLetter(activeLetterObj.letter)
          }
        }
      })
    }

    if (goToTraceBtn) {
      goToTraceBtn.addEventListener('click', () => {
        const traceChip = document.querySelector('.sub-tab-chip[data-sub="letters-tracer"]')
        if (traceChip) {
          traceChip.click()
          setTracerLetter(activeLetterObj.letter)
        }
      })
    }

    // Positions explorer
    const posSelect = document.getElementById('posLetterSelect')
    if (posSelect) {
      posSelect.addEventListener('change', (e) => {
        sfx.tap()
        renderPositionsForLetter(e.target.value)
      })
      renderPositionsForLetter(posSelect.value || 'أ')
    }

    // Tashkeel
    const tashCustomSelect = document.getElementById('tashkeelCustomSelect')
    const vocalStrip = document.getElementById('vocalButtonsStrip')

    function updateVocalStrip(l) {
      if (!vocalStrip) return
      vocalStrip.innerHTML = `
        <button type="button" class="vocal-pill-btn" data-sound="${l}َ"><span>${l}َ</span> <small>بالفتحة</small></button>
        <button type="button" class="vocal-pill-btn" data-sound="${l}ُ"><span>${l}ُ</span> <small>بالضمة</small></button>
        <button type="button" class="vocal-pill-btn" data-sound="${l}ِ"><span>${l}ِ</span> <small>بالكسرة</small></button>
        <button type="button" class="vocal-pill-btn" data-sound="أَ${l}ْ"><span>${l}ْ</span> <small>بالسكون</small></button>
        <button type="button" class="vocal-pill-btn" data-sound="${l}اً"><span>${l}اً</span> <small>تنوين فتح</small></button>
        <button type="button" class="vocal-pill-btn" data-sound="${l}ٌ"><span>${l}ٌ</span> <small>تنوين ضم</small></button>
      `
      vocalStrip.querySelectorAll('.vocal-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          sfx.tap()
          speech.speak(btn.getAttribute('data-sound'))
        })
      })
    }

    if (tashCustomSelect) {
      tashCustomSelect.addEventListener('change', (e) => updateVocalStrip(e.target.value))
      updateVocalStrip(tashCustomSelect.value || 'أ')
    }

    document.querySelectorAll('.listen-tashkeel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        speech.speak(btn.getAttribute('data-sound') || '')
      })
    })

    initWordsCatalog()
    initSentencesKaraoke()
    initLettersQuiz()
  }

  function renderPositionsForLetter(letterChar) {
    const trio = document.getElementById('positionsCardsTrio')
    if (!trio) return
    const item = LETTERS_DATA.find(x => x.letter === letterChar) || LETTERS_DATA[0]

    trio.innerHTML = `
      <div class="pos-card-item">
        <span class="pos-tag">في أول الكلمة</span>
        <div class="pos-char-visual">${item.initial.char}</div>
        <div class="pos-word-example"><strong>${item.initial.word}</strong></div>
        <button type="button" class="listen-pos-btn" data-speak="${item.initial.word}">
          <i class="fa-solid fa-volume-high"></i> استمع للمثال
        </button>
      </div>

      <div class="pos-card-item">
        <span class="pos-tag">في وسط الكلمة</span>
        <div class="pos-char-visual">${item.medial.char}</div>
        <div class="pos-word-example"><strong>${item.medial.word}</strong></div>
        <button type="button" class="listen-pos-btn" data-speak="${item.medial.word}">
          <i class="fa-solid fa-volume-high"></i> استمع للمثال
        </button>
      </div>

      <div class="pos-card-item">
        <span class="pos-tag">في آخر الكلمة</span>
        <div class="pos-char-visual">${item.final.char}</div>
        <div class="pos-word-example"><strong>${item.final.word}</strong></div>
        <button type="button" class="listen-pos-btn" data-speak="${item.final.word}">
          <i class="fa-solid fa-volume-high"></i> استمع للمثال
        </button>
      </div>
    `

    trio.querySelectorAll('.listen-pos-btn').forEach(b => {
      b.addEventListener('click', () => {
        sfx.tap()
        speech.speak(b.getAttribute('data-speak'))
      })
    })
  }

  // Words Catalog (Expanded 120+ Rich Vocabulary Words across 8 Worlds)
  const WORDS_CATALOG = {
    animals: [
      { text: 'أَسَد', sub: 'ملك الغابة الشجاع 🦁', letters: 'أ - س - د' },
      { text: 'نَمِر', sub: 'سريع وقوي ومخطط 🐯', letters: 'ن - م - ر' },
      { text: 'فِيل', sub: 'ضخم وصاحب خرطوم طويل 🐘', letters: 'ف - ي - ل' },
      { text: 'زَرَافَة', sub: 'أطول كائن بعنق جميل 🦒', letters: 'ز - ر - ا - ف - ة' },
      { text: 'جَمَل', sub: 'سفينة الصحراء الصبورة 🐪', letters: 'ج - م - ل' },
      { text: 'حِصَان', sub: 'رمز الأصالة والسرعة 🐎', letters: 'ح - ص - ا - ن' },
      { text: 'صَقْر', sub: 'حامي السماء وحاد البصر 🦅', letters: 'ص - ق - ر' },
      { text: 'حَمَامَة', sub: 'رمز السلام والهدوء 🕊️', letters: 'ح - م - ا - م - ة' },
      { text: 'هُدْهُد', sub: 'طائر ذكي ذكره القرآن 🪶', letters: 'هـ - د - هـ - د' },
      { text: 'نَحْلَة', sub: 'تصنع العسل اللذيذ بنشاط 🐝', letters: 'ن - ح - ل - ة' },
      { text: 'فَرَاشَة', sub: 'ألوان زاهية تطير بخفة 🦋', letters: 'ف - ر - ا - ش - ة' },
      { text: 'أَرْنَب', sub: 'يقفز بمرح ويحب الجزر 🐰', letters: 'أ - ر - ن - ب' },
      { text: 'قِرْد', sub: 'رشيق ومرح ويتسلق الأشجار 🐒', letters: 'ق - ر - د' },
      { text: 'سُلَحْفَاة', sub: 'صبورة وتحمل بيتها على ظهرها 🐢', letters: 'س - ل - ح - ف - ا - ة' },
      { text: 'قِطَّة', sub: 'أليفة ونظيفة وتحب اللعب 🐱', letters: 'ق - ط - ة' }
    ],
    fruits: [
      { text: 'تُفَّاح', sub: 'فاكهة الصحة والقوة 🍎', letters: 'ت - ف - ا - ح' },
      { text: 'مَوْز', sub: 'طاقة ومذاق حلو رائع 🍌', letters: 'م - و - ز' },
      { text: 'بُرْتُقَال', sub: 'غني بفيتامين ج المنعش 🍊', letters: 'ب - ر - ت - ق - ا - ل' },
      { text: 'عِنَب', sub: 'عناقيد حلوة مباركة 🍇', letters: 'ع - ن - ب' },
      { text: 'فَرَاوْلَة', sub: 'حمراء جميلة يحبها الأطفال 🍓', letters: 'ف - ر - ا - و - ل - ة' },
      { text: 'رُمَّان', sub: 'حبات ياقوتية مذكورة في القرآن 🍒', letters: 'ر - م - ا - ن' },
      { text: 'تِين', sub: 'فاكهة مباركة ومغذية 🫐', letters: 'ت - ي - ن' },
      { text: 'زَيْتُون', sub: 'شجرة مباركة وزيت نافع 🫒', letters: 'ز - ي - ت - و - ن' },
      { text: 'بَطِّيخ', sub: 'منعش ولذيذ في الصيف 🍉', letters: 'ب - ط - ي - خ' },
      { text: 'جَزَر', sub: 'يقوي النظر ومقرمش ولذيذ 🥕', letters: 'ج - ز - ر' },
      { text: 'خِيَار', sub: 'رطب ومنعش في كل سلطة 🥒', letters: 'خ - ي - ا - ر' },
      { text: 'طَمَاطِم', sub: 'حمراء شهية وغنية بالفوائد 🍅', letters: 'ط - م - ا - ط - م' },
      { text: 'ذُرَة', sub: 'حبات صفراء ذهبية لذيذة 🌽', letters: 'ذ - ر - ة' },
      { text: 'أَنَانَاس', sub: 'تاج الفواكه الاستوائية 🍍', letters: 'أ - ن - ا - ن - ا - س' },
      { text: 'كُمَّثْرَى', sub: 'حلوة وعصيرية ومفيدة 🍐', letters: 'ك - م - ث - ر - ى' }
    ],
    family: [
      { text: 'أَبِي', sub: 'السند والعطاء والأمان 🧔', letters: 'أ - ب - ي' },
      { text: 'أُمِّي', sub: 'ينبوع الحنان والجنة تحت قدميها 🧕', letters: 'أ - م - ي' },
      { text: 'أَخِي', sub: 'رفيق دربي وسندي 👦', letters: 'أ - خ - ي' },
      { text: 'أُخْتِي', sub: 'نور دارنا وبهجتها 👧', letters: 'أ - خ - ت - ي' },
      { text: 'جَدِّي', sub: 'بركة البيت وحكايات الحكمة 👴', letters: 'ج - د - ي' },
      { text: 'جَدَّتِي', sub: 'قلب دافئ ودعاء مستجاب 👵', letters: 'ج - د - ت - ي' },
      { text: 'بَيْتِي', sub: 'سكن وأمان واجتماع الأحباب 🏡', letters: 'ب - ي - ت - ي' },
      { text: 'غُرْفَة', sub: 'مكاني الهادئ للنوم والدراسة 🚪', letters: 'غ - ر - ف - ة' },
      { text: 'نَافِذَة', sub: 'يدخل منها ضوء الشمس العليل 🪟', letters: 'ن - ا - ف - ذ - ة' },
      { text: 'سَرِير', sub: 'أنام عليه وأحلم أحلاماً سعيدة 🛏️', letters: 'س - ر - ي - ر' },
      { text: 'مَائِدَة', sub: 'نجتمع حولها ونسمي الله 🍽️', letters: 'م - ا - ئ - د - ة' },
      { text: 'مَطْبَخ', sub: 'تصنع فيه أمي أشهى الوجبات 🍳', letters: 'م - ط - ب - خ' },
      { text: 'حَدِيقَة', sub: 'زهور عطرة ولعب ومرح 🪴', letters: 'ح - د - ي - ق - ة' },
      { text: 'بَاب', sub: 'أستأذن قبله وأفتحه بابتسامة 🚪', letters: 'ب - ا - ب' },
      { text: 'سَاعَة', sub: 'تنظم أوقات صلاتنا ويومنا ⏰', letters: 'س - ا - ع - ة' }
    ],
    school: [
      { text: 'كِتَاب', sub: 'كنز المعرفة ونور العقول 📖', letters: 'ك - ت - ا - ب' },
      { text: 'قَلَم', sub: 'يكتب المستقبل ويبني الأمم ✏️', letters: 'ق - ل - م' },
      { text: 'دَفْتَر', sub: 'أسجل فيه دروسي بخط جميل 📓', letters: 'د - ف - ت - ر' },
      { text: 'مُعَلِّم', sub: 'يبني الأجيال ويهدي إلى الخير 👨‍🏫', letters: 'م - ع - ل - م' },
      { text: 'طَالِب', sub: 'يسعى بالجد نحو التفوق 🧑‍🎓', letters: 'ط - ا - ل - ب' },
      { text: 'مَدْرَسَة', sub: 'بيتي الثاني وميدان انطلاقي 🏫', letters: 'م - د - ر - س - ة' },
      { text: 'مِسْطَرَة', sub: 'تسطر خطوطي بدقة ونظام 📏', letters: 'م - س - ط - ر - ة' },
      { text: 'مِمْحَاة', sub: 'تمسح الخطأ لأتعلم الصواب 🧼', letters: 'م - م - ح - ا - ة' },
      { text: 'مِقَصّ', sub: 'أقص به الورق بحذر وأمان ✂️', letters: 'م - ق - ص' },
      { text: 'أَلْوَان', sub: 'أرسم بها أزهى اللوحات 🎨', letters: 'أ - ل - و - ا - ن' },
      { text: 'حَقِيبَة', sub: 'تحمل أدواتي المدرسية بترتيب 🎒', letters: 'ح - ق - ي - ب - ة' },
      { text: 'سَبُّورَة', sub: 'تشرح عليها المعلمة الدروس 📋', letters: 'س - ب - و - ر - ة' },
      { text: 'مَكْتَبَة', sub: 'واحة القراءة واكتشاف القصص 📚', letters: 'م - ك - ت - ب - ة' },
      { text: 'حَاسُوب', sub: 'أتعلم به البرمجة والتقنية الحديثة 💻', letters: 'ح - ا - س - و - ب' },
      { text: 'شَهَادَة', sub: 'ثمرة الاجتهاد والتفوق المشرف 📜', letters: 'ش - هـ - ا - د - ة' }
    ],
    transport: [
      { text: 'سَيَّارَة', sub: 'تنقلنا براحة وأمان في المدينة 🚗', letters: 'س - ي - ا - ر - ة' },
      { text: 'حَافِلَة', sub: 'تتسع للأصدقاء في طريق المدرسة 🚌', letters: 'ح - ا - ف - ل - ة' },
      { text: 'قِطَار', sub: 'سريع يسير على السكة الحديدية 🚆', letters: 'ق - ط - ا - ر' },
      { text: 'طَائِرَة', sub: 'تحلق في السحاب فوق القارات ✈️', letters: 'ط - ا - ئ - ر - ة' },
      { text: 'سَفِينَة', sub: 'تمخر عباب البحر الواسع بثبات 🚢', letters: 'س - ف - ي - ن - ة' },
      { text: 'دَرَّاجَة', sub: 'رياضة ممتعة وتقوي العضلات 🚲', letters: 'د - ر - ا - ج - ة' },
      { text: 'صَارُوخ', sub: 'ينطلق إلى الفضاء بين الكواكب 🚀', letters: 'ص - ا - ر - و - خ' },
      { text: 'مِرْوَحِيَّة', sub: 'تهبط عمودياً وتساعد في الإنقاذ 🚁', letters: 'م - ر - و - ح - ي - ة' },
      { text: 'شَاحِنَة', sub: 'تنقل البضائع والمؤن للمدن 🚛', letters: 'ش - ا - ح - ن - ة' },
      { text: 'غَوَّاصَة', sub: 'تغوص في أعماق المحيط السحيقة 🤿', letters: 'غ - و - ا - ص - ة' },
      { text: 'قَارِب', sub: 'صغير يبحر بمجدافين في البحيرة 🛶', letters: 'ق - ا - ر - ب' },
      { text: 'إِسْعَاف', sub: 'تسارع لإنقاذ المرضى بالصفارة 🚑', letters: 'إ - س - ع - ا - ف' },
      { text: 'إِطْفَاء', sub: 'سيارة الشجعان لإخماد الحرائق 🚒', letters: 'إ - ط - ف - ا - ء' },
      { text: 'شُرْطَة', sub: 'تحفظ الأمن والنظام في كل شارع 🚓', letters: 'ش - ر - ط - ة' },
      { text: 'مِنْطَاد', sub: 'يطير بالهواء الساخن فوق الحقول 🎈', letters: 'م - ن - ط - ا - د' }
    ],
    nature: [
      { text: 'شَمْس', sub: 'ضياء ودفء وطاقة لكل الكائنات ☀️', letters: 'ش - م - س' },
      { text: 'قَمَر', sub: 'نور في السماء ويهتدي به الساري 🌙', letters: 'ق - م - ر' },
      { text: 'نَجْم', sub: 'يتلألأ في الليل كأنه ألماسة ⭐', letters: 'ن - ج - م' },
      { text: 'سَحَاب', sub: 'يحمل قطرات المطر العذب ☁️', letters: 'س - ح - ا - ب' },
      { text: 'مَطَر', sub: 'غيث مبارك يحيي الأرض الميتة 🌧️', letters: 'م - ط - ر' },
      { text: 'قَوْسُ قُزَح', sub: 'ألوان سبعة تبهر الناظرين 🌈', letters: 'ق - و - س - ق - ز - ح' },
      { text: 'رَبِيع', sub: 'تتفتح فيه الأزهار وتغرد الطيور 🌸', letters: 'ر - ب - ي - ع' },
      { text: 'صَيْف', sub: 'شمس مشرقة ومرح على شاطئ البحر 🏖️', letters: 'ص - ي - ف' },
      { text: 'خَرِيف', sub: 'تتساقط فيه أوراق الشجر الذهبية 🍂', letters: 'خ - ر - ي - ف' },
      { text: 'شِتَاء', sub: 'مطر ودفء في البيت مع الأسرة ❄️', letters: 'ش - ت - ا - ء' },
      { text: 'جَبَل', sub: 'أوتاد راسخة وقمم شامخة ⛰️', letters: 'ج - ب - ل' },
      { text: 'نَهْر', sub: 'ماء عذب يجري ويسقي الحقول 🌊', letters: 'ن - هـ - ر' },
      { text: 'بَحْر', sub: 'عالم واسع من الأسماك والخيرات 🏖️', letters: 'ب - ح - ر' },
      { text: 'غَابَة', sub: 'أشجار خضراء ومأوى للحيوانات 🌲', letters: 'غ - ا - ب - ة' },
      { text: 'بَرْق', sub: 'وميض ساطع ينير ظلمة السحاب ⚡', letters: 'ب - ر - ق' }
    ],
    islamic: [
      { text: 'مَسْجِد', sub: 'بيت الله ومكان الصلاة المبارك 🕌', letters: 'م - س - ج - د' },
      { text: 'مُصْحَف', sub: 'كتاب الله الكريم ونور صدورنا 📖', letters: 'م - ص - ح - ف' },
      { text: 'صَلَاة', sub: 'صلتي بربي وخمس صلوات في اليوم 🤲', letters: 'ص - ل - ا - ة' },
      { text: 'كَعْبَة', sub: 'قبلة المسلمين المشرفة بمكة 🕋', letters: 'ك - ع - ب - ة' },
      { text: 'وُضُوء', sub: 'طهارة ونور لصلاتنا 💧', letters: 'و - ض - و - ء' },
      { text: 'صَدَقَة', sub: 'تطهر النفس وتساعد المحتاجين 🎁', letters: 'ص - د - ق - ة' },
      { text: 'صَوْم', sub: 'صبر وطاعة في شهر رمضان 🌙', letters: 'ص - و - م' },
      { text: 'حَجّ', sub: 'رحلة الإيمان إلى بيت الله الحرام 🕋', letters: 'ح - ج' },
      { text: 'دُعَاء', sub: 'نناجي به الله ونسأله الخير 🤲', letters: 'د - ع - ا - ء' },
      { text: 'إِحْسَان', sub: 'أن تعبد الله كأنك تراه 💖', letters: 'إ - ح - س - ا - ن' },
      { text: 'أَمَانَة', sub: 'خلق النبي الأمين وحفظ الودائع 🛡️', letters: 'أ - م - ا - ن - ة' },
      { text: 'صِدْق', sub: 'قول الحق والنجاة في الدارين ✨', letters: 'ص - د - ق' },
      { text: 'بِرّ', sub: 'طاعة الوالدين وإدخال الفرح عليهما ❤️', letters: 'ب - ر' },
      { text: 'سَلَام', sub: 'تحية الإسلام وناشر المحبة 🤝', letters: 'س - ل - ا - م' },
      { text: 'شُكْر', sub: 'حمد الله على نعمه الكثيرة 🌟', letters: 'ش - ك - ر' }
    ],
    body: [
      { text: 'عَيْن', sub: 'أرى بها جمال الكون وخلق الله 👀', letters: 'ع - ي - ن' },
      { text: 'أُذُن', sub: 'أستمع بها للقرآن وكلام والديّ 👂', letters: 'أ - ذ - ن' },
      { text: 'أَنْف', sub: 'أشم به عبير الزهور والرياحين 👃', letters: 'أ - ن - ف' },
      { text: 'فَم', sub: 'أنطق به الصدق وأذكر الله به 👄', letters: 'ف - م' },
      { text: 'يَد', sub: 'أكتب بها وأساعد بها الآخرين ✋', letters: 'ي - د' },
      { text: 'قَدَم', sub: 'أمشي بها إلى المسجد والمدرسة 🦶', letters: 'ق - د - م' },
      { text: 'قَلْب', sub: 'ينبض بالحياة ويمتلئ بالإيمان ❤️', letters: 'ق - ل - ب' },
      { text: 'أَسْنَان', sub: 'أنظفها بالفرشاة والسواك كل يوم 🦷', letters: 'أ - س - ن - ا - ن' },
      { text: 'عَقْل', sub: 'أفكر به وأبدع وأتعلم العلوم 🧠', letters: 'ع - ق - ل' },
      { text: 'شَعْر', sub: 'أمشطه وأعتني بنظافته وأناقته 💇', letters: 'ش - ع - ر' },
      { text: 'طَبِيب', sub: 'يعالج المرضى بإذن الله برحمة 👨‍⚕️', letters: 'ط - ب - ي - ب' },
      { text: 'دَوَاء', sub: 'سبب للشفاء بإذن الله تعالى 💊', letters: 'د - و - ا - ء' },
      { text: 'صَابُون', sub: 'يقضي على الجراثيم ويمنحنا النظافة 🧼', letters: 'ص - ا - ب - و - ن' },
      { text: 'مَاء', sub: 'سر الحياة وأعذب شراب 💧', letters: 'م - ا - ء' },
      { text: 'نَوْم', sub: 'راحة للبدن ونمو للعقل والجسد 😴', letters: 'ن - و - م' }
    ]
  }

  function initWordsCatalog() {
    const filterButtons = document.querySelectorAll('#wordsCategoryFilters .cat-chip')
    const grid = document.getElementById('wordsCardsGrid')

    function renderCategory(catId) {
      if (!grid) return
      const words = WORDS_CATALOG[catId] || WORDS_CATALOG.family
      grid.innerHTML = ''
      words.forEach(w => {
        const card = document.createElement('div')
        card.className = 'word-specimen-card'
        card.innerHTML = `
          <div class="word-card-top">
            <span class="word-pronounce-ico"><i class="fa-solid fa-volume-high"></i></span>
            <span class="word-letters-breakdown">${w.letters}</span>
          </div>
          <h3 class="word-card-title">${w.text}</h3>
          <p class="word-card-meaning">${w.sub}</p>
        `
        card.addEventListener('click', () => {
          sfx.tap()
          speech.speak(w.text)
          progress.addStars(1, false)
        })
        grid.appendChild(card)
      })
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        filterButtons.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        renderCategory(btn.getAttribute('data-cat'))
      })
    })

    renderCategory('family')
  }

  // Sentences Karaoke
  const SENTENCES_LIST = [
    { full: 'اللَّهُ رَبِّي وَالْإِسْلَامُ دِينِي', words: ['اللَّهُ', 'رَبِّي', 'وَالْإِسْلَامُ', 'دِينِي'], meaning: 'شهادة التوحيد واعتزاز بدين الإسلام' },
    { full: 'الْقُرْآنُ الْكَرِيمُ كِتَابِي وَنُورِي', words: ['الْقُرْآنُ', 'الْكَرِيمُ', 'كِتَابِي', 'وَنُورِي'], meaning: 'التمسك بالقرآن الكريم منهجاً وهداية' },
    { full: 'بِرُّ الْوَالِدَيْنِ مِنْ أَعْظَمِ الْقُرُبَاتِ', words: ['بِرُّ', 'الْوَالِدَيْنِ', 'مِنْ', 'أَعْظَمِ', 'الْقُرُبَاتِ'], meaning: 'طاعة الوالدين وبرهما وإدخال السرور عليهما' },
    { full: 'أَنَا طِفْلٌ نَشِيطٌ أُحِبُّ الْعِلْمَ', words: ['أَنَا', 'طِفْلٌ', 'نَشِيطٌ', 'أُحِبُّ', 'الْعِلْمَ'], meaning: 'همة واجتهاد في طلب العلم والمعرفة' },
    { full: 'الصِّدْقُ خُلُقٌ جَمِيلٌ يَهْدِي إِلَى الْجَنَّةِ', words: ['الصِّدْقُ', 'خُلُقٌ', 'جَمِيلٌ', 'يَهْدِي', 'إِلَى', 'الْجَنَّةِ'], meaning: 'التحلي بالصدق في القول والعمل' }
  ]
  let currentSentenceIdx = 0

  function initSentencesKaraoke() {
    const playBtn = document.getElementById('btnPlaySentenceAudio')
    const nextBtn = document.getElementById('btnNextSentence')

    if (playBtn) playBtn.addEventListener('click', playCurrentSentence)
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sfx.tap()
        currentSentenceIdx = (currentSentenceIdx + 1) % SENTENCES_LIST.length
        renderSentence()
      })
    }

    renderSentence()
  }

  function renderSentence() {
    const container = document.getElementById('sentenceWordsContainer')
    const meaningEl = document.getElementById('sentenceMeaningText')
    if (!container) return

    const s = SENTENCES_LIST[currentSentenceIdx]
    if (meaningEl) meaningEl.textContent = s.meaning

    container.innerHTML = ''
    s.words.forEach((w, i) => {
      const span = document.createElement('span')
      span.className = 'karaoke-word'
      span.setAttribute('data-widx', i)
      span.textContent = w
      span.addEventListener('click', () => {
        sfx.tap()
        speech.speak(w)
      })
      container.appendChild(span)
    })
  }

  function playCurrentSentence() {
    sfx.tap()
    const s = SENTENCES_LIST[currentSentenceIdx]
    const wordSpans = document.querySelectorAll('#sentenceWordsContainer .karaoke-word')

    let wordIdx = 0
    function speakNextWord() {
      if (wordIdx < s.words.length) {
        wordSpans.forEach(sp => sp.classList.remove('speaking'))
        if (wordSpans[wordIdx]) wordSpans[wordIdx].classList.add('speaking')
        speech.speak(s.words[wordIdx], () => {
          wordIdx++
          setTimeout(speakNextWord, 220)
        })
      } else {
        wordSpans.forEach(sp => sp.classList.remove('speaking'))
        progress.addStars(2, false)
      }
    }
    speakNextWord()
  }

  // Letter Tracer
  let currentTraceLetter = 'أ'
  let tracerCanvas, tracerCtx
  let isTracing = false

  function setupLetterTracer() {
    tracerCanvas = document.getElementById('letterTraceCanvas')
    if (!tracerCanvas) return
    tracerCtx = tracerCanvas.getContext('2d')

    const dpr = window.devicePixelRatio || 1
    tracerCanvas.width = 500 * dpr
    tracerCanvas.height = 500 * dpr
    tracerCtx.scale(dpr, dpr)

    drawTracerGuide()

    document.querySelectorAll('#tracerLetterChips .tracer-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        document.querySelectorAll('#tracerLetterChips .tracer-chip').forEach(b => b.classList.remove('active'))
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
      evalBtn.addEventListener('click', () => {
        sfx.correct()
        progress.addStars(2, true)
        const scoreBox = document.getElementById('tracerScoreBox')
        const feedback = document.getElementById('tracerFeedback')
        if (scoreBox && feedback) {
          scoreBox.style.display = 'block'
          feedback.textContent = `ما شاء الله! خطك في كتابة حرف "${currentTraceLetter}" متقن ومتميز.`
        }
      })
    }

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
      tracerCtx.lineWidth = 16
      tracerCtx.strokeStyle = '#0c4a3f'
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

  function setTracerLetter(l) {
    currentTraceLetter = l
    drawTracerGuide()
    speech.speak(`تتبع حرف ${l}`)
  }

  function drawTracerGuide() {
    if (!tracerCtx) return
    tracerCtx.clearRect(0, 0, 500, 500)

    tracerCtx.fillStyle = '#faf9f6'
    tracerCtx.fillRect(0, 0, 500, 500)

    tracerCtx.strokeStyle = '#cbd5e1'
    tracerCtx.lineWidth = 2
    tracerCtx.setLineDash([6, 6])
    tracerCtx.beginPath()
    tracerCtx.moveTo(40, 360)
    tracerCtx.lineTo(460, 360)
    tracerCtx.stroke()
    tracerCtx.setLineDash([])

    tracerCtx.font = 'bold 310px "Tajawal", "Noto Naskh Arabic", sans-serif'
    tracerCtx.textAlign = 'center'
    tracerCtx.textBaseline = 'middle'

    tracerCtx.fillStyle = 'rgba(148, 163, 184, 0.22)'
    tracerCtx.fillText(currentTraceLetter, 250, 240)

    tracerCtx.strokeStyle = '#94a3b8'
    tracerCtx.lineWidth = 3
    tracerCtx.setLineDash([6, 6])
    tracerCtx.strokeText(currentTraceLetter, 250, 240)
    tracerCtx.setLineDash([])
  }

  // Letters Quiz
  let quizCurrentLetter = null
  let quizScore = 0

  function initLettersQuiz() {
    const playAudioBtn = document.getElementById('playQuizAudioBtn')
    if (playAudioBtn) {
      playAudioBtn.addEventListener('click', () => {
        if (quizCurrentLetter) {
          speech.speak(`اختر حرف ${quizCurrentLetter.name}`)
        }
      })
    }
    nextQuizQuestion()
  }

  function nextQuizQuestion() {
    const grid = document.getElementById('quizOptionsGrid')
    const banner = document.getElementById('quizResultBanner')
    if (!grid) return

    banner.style.display = 'none'
    const shuffled = [...LETTERS_DATA].sort(() => 0.5 - Math.random())
    const choices = shuffled.slice(0, 4)
    quizCurrentLetter = choices[Math.floor(Math.random() * choices.length)]

    grid.innerHTML = ''
    choices.forEach(item => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'quiz-select-btn'
      btn.innerHTML = `<span class="q-char">${item.letter}</span><small>${item.emoji}</small>`
      btn.addEventListener('click', () => {
        if (item.letter === quizCurrentLetter.letter) {
          btn.classList.add('correct')
          sfx.correct()
          quizScore += 10
          progress.addStars(2, false)
          const scoreEl = document.getElementById('quizScoreVal')
          if (scoreEl) scoreEl.textContent = quizScore
          banner.textContent = `أحسنت! هذا حرف ${quizCurrentLetter.name} (${quizCurrentLetter.letter})! ${quizCurrentLetter.emoji}`
          banner.className = 'quiz-feedback-box success'
          banner.style.display = 'block'
          speech.speak(`إجابة صحيحة، حرف ${quizCurrentLetter.name}`)
          setTimeout(nextQuizQuestion, 1500)
        } else {
          btn.classList.add('wrong')
          sfx.wrong()
          banner.textContent = `حاول ثانية يا بطل، هذا حرف ${item.name}`
          banner.className = 'quiz-feedback-box error'
          banner.style.display = 'block'
        }
      })
      grid.appendChild(btn)
    })
  }

  // ─── TAB 2: QURAN MEMORIZATION (AL-MINSHAWI TEACHER - 100% AUTHENTIC AUDIO ENGINE) ───
  let currentSurahId = 1
  let currentSurahName = 'الفاتحة'
  let currentVerses = []
  let currentPlayingVerseIdx = 0
  let isVersePlaying = false
  let verseRepeatTarget = 3
  let currentVerseRepeatCount = 1
  let quranPlaybackMode = 'ayah' // 'ayah' (with children repetition) or 'full' (continuous teacher surah)
  let isMaskMode = false

  // Dedicated HTML5 audio instance for Holy Quran recitation
  let quranAudio = document.getElementById('kidsQuranAudio')
  if (!quranAudio) {
    quranAudio = new Audio()
    quranAudio.id = 'kidsQuranAudio'
    document.body.appendChild(quranAudio)
  }
  quranAudio.preload = 'auto'

  // Preloaded common Juz Amma surahs for instantaneous zero-latency offline loading
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
    111: [
      { num: 1, text: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ' },
      { num: 2, text: 'مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ' },
      { num: 3, text: 'سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ' },
      { num: 4, text: 'وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ' },
      { num: 5, text: 'فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ' }
    ],
    110: [
      { num: 1, text: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ' },
      { num: 2, text: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا' },
      { num: 3, text: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا' }
    ],
    109: [
      { num: 1, text: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ' },
      { num: 2, text: 'لَا أَعْبُدُ مَا تَعْبُدُونَ' },
      { num: 3, text: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ' },
      { num: 4, text: 'وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ' },
      { num: 5, text: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ' },
      { num: 6, text: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ' }
    ],
    108: [
      { num: 1, text: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ' },
      { num: 2, text: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ' },
      { num: 3, text: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ' }
    ],
    107: [
      { num: 1, text: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ' },
      { num: 2, text: 'فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ' },
      { num: 3, text: 'وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ' },
      { num: 4, text: 'فَوَيْلٌ لِّلْمُصَلِّينَ' },
      { num: 5, text: 'الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ' },
      { num: 6, text: 'الَّذِينَ هُمْ يُرَاءُونَ' },
      { num: 7, text: 'وَيَمْنَعُونَ الْمَاعُونَ' }
    ],
    106: [
      { num: 1, text: 'لِإِيلَافِ قُرَيْشٍ' },
      { num: 2, text: 'إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ' },
      { num: 3, text: 'فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ' },
      { num: 4, text: 'الَّذِي أَطْعَمَهُم مِّن جُوعٍ وَآمَنَهُم مِّنْ خَوْفٍ' }
    ],
    105: [
      { num: 1, text: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ' },
      { num: 2, text: 'أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ' },
      { num: 3, text: 'وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ' },
      { num: 4, text: 'تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ' },
      { num: 5, text: 'فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ' }
    ],
    103: [
      { num: 1, text: 'وَالْعَصْرِ' },
      { num: 2, text: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ' },
      { num: 3, text: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ' }
    ],
    97: [
      { num: 1, text: 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ' },
      { num: 2, text: 'وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ' },
      { num: 3, text: 'لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ' },
      { num: 4, text: 'تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ' },
      { num: 5, text: 'سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ' }
    ]
  }

  function initQuran() {
    const surahCards = document.querySelectorAll('.surah-item-card')
    const searchInput = document.getElementById('kidsSurahSearch')
    const btnMask = document.getElementById('btnToggleMaskMode')
    const repeatSelect = document.getElementById('verseRepeatSelect')
    const btnPlayPause = document.getElementById('btnPlayPauseVerse')
    const btnNext = document.getElementById('btnNextVerse')
    const btnPrev = document.getElementById('btnPrevVerse')
    const btnMarkDone = document.getElementById('btnMarkSurahDone')

    const btnModeAyah = document.getElementById('btnModeAyahByAyah')
    const btnModeFull = document.getElementById('btnModeFullSurah')

    if (btnModeAyah && btnModeFull) {
      btnModeAyah.addEventListener('click', () => {
        sfx.tap()
        quranPlaybackMode = 'ayah'
        btnModeAyah.classList.add('active')
        btnModeFull.classList.remove('active')
        stopQuranPlayback()
      })

      btnModeFull.addEventListener('click', () => {
        sfx.tap()
        quranPlaybackMode = 'full'
        btnModeFull.classList.add('active')
        btnModeAyah.classList.remove('active')
        playFullSurahAudio()
      })
    }

    surahCards.forEach(card => {
      card.addEventListener('click', () => {
        sfx.tap()
        surahCards.forEach(c => c.classList.remove('selected'))
        card.classList.add('selected')
        const sId = parseInt(card.getAttribute('data-surahid'), 10)
        const sName = card.getAttribute('data-surahname')
        loadSurah(sId, sName)
      })
    })

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase()
        surahCards.forEach(card => {
          const name = card.getAttribute('data-surahname') || ''
          const num = card.getAttribute('data-surahid') || ''
          const matches = name.includes(q) || num.includes(q)
          card.style.display = matches ? 'flex' : 'none'
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
        sfx.celebrate()
        launchTastefulConfetti(50)
      })
    }

    quranAudio.addEventListener('ended', onVerseAudioEnded)
    quranAudio.addEventListener('waiting', () => {
      const btn = document.getElementById('btnPlayPauseVerse')
      if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'
    })
    quranAudio.addEventListener('playing', () => {
      isVersePlaying = true
      updatePlayButtonIcon()
      setSoundwaveActive(true)
    })
    quranAudio.addEventListener('pause', () => {
      isVersePlaying = false
      updatePlayButtonIcon()
      setSoundwaveActive(false)
    })

    loadSurah(1, 'الفاتحة')
  }

  function setSoundwaveActive(active) {
    const wave = document.getElementById('quranAudioWave')
    if (wave) {
      wave.style.display = active ? 'inline-flex' : 'none'
    }
  }

  function stopQuranPlayback() {
    quranAudio.pause()
    quranAudio.currentTime = 0
    isVersePlaying = false
    updatePlayButtonIcon()
    setSoundwaveActive(false)
  }

  function loadSurah(id, name) {
    currentSurahId = id
    currentSurahName = name
    currentPlayingVerseIdx = 0
    currentVerseRepeatCount = 1
    stopQuranPlayback()

    const nameEl = document.getElementById('currentSurahName')
    if (nameEl) nameEl.textContent = `سورة ${name}`

    const bismillah = document.getElementById('bismillahBanner')
    if (bismillah) {
      bismillah.style.display = (id === 1 || id === 9) ? 'none' : 'block'
    }

    const list = document.getElementById('versesInteractiveList')
    if (list) {
      list.innerHTML = '<div class="verses-loading-state"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل سورة ' + name + '...</div>'
    }

    if (OFFLINE_SURAHS[id]) {
      currentVerses = OFFLINE_SURAHS[id]
      renderVerses()
      return
    }

    fetch(`/api/quran/surah/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d && d.success && Array.isArray(d.ayahs) && d.ayahs.length > 0) {
          currentVerses = d.ayahs.map(a => ({
            num: a.numberInSurah,
            text: a.text
          }))
          renderVerses()
        } else {
          fetchExternalSurah(id)
        }
      })
      .catch(() => fetchExternalSurah(id))
  }

  function fetchExternalSurah(id) {
    fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d && d.verses && d.verses.length) {
          currentVerses = d.verses.map((v, i) => ({
            num: i + 1,
            text: v.text_uthmani
          }))
          renderVerses()
        } else {
          fallbackSurah()
        }
      })
      .catch(() => fallbackSurah())
  }

  function fallbackSurah() {
    currentVerses = [{ num: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' }]
    renderVerses()
  }

  function renderVerses() {
    const list = document.getElementById('versesInteractiveList')
    if (!list) return
    list.innerHTML = ''

    currentVerses.forEach((verse, idx) => {
      const row = document.createElement('div')
      row.className = `verse-unit-row ${idx === currentPlayingVerseIdx ? 'active-reading' : ''}`
      row.id = `verseRow_${idx}`
      row.style.cursor = 'pointer'

      let textHtml = verse.text
      if (isMaskMode) {
        const words = verse.text.split(' ')
        textHtml = words.map((w, wIdx) => {
          if (wIdx % 2 === 1) {
            return `<span class="masked-word-chip" title="انقر لإظهار الكلمة">${w}</span>`
          }
          return w
        }).join(' ')
      }

      row.innerHTML = `
        <span class="verse-symbol-ring">۝ ${verse.num}</span>
        <div class="verse-script-content">${textHtml}</div>
        <button type="button" class="verse-single-play-btn" title="الاستماع لهذه الآية بصوت المنشاوي وترديد الأطفال"><i class="fa-solid fa-volume-high"></i></button>
      `

      // Clicking anywhere on the verse row starts reciting it!
      row.addEventListener('click', () => {
        sfx.tap()
        currentPlayingVerseIdx = idx
        currentVerseRepeatCount = 1
        playVerseAudio(idx)
      })

      row.querySelectorAll('.masked-word-chip').forEach(m => {
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

  function playVerseAudio(idx) {
    if (!currentVerses[idx]) return
    currentPlayingVerseIdx = idx

    // Stop any active speech synthesizer so it NEVER speaks over the Quran!
    speech.stop()

    document.querySelectorAll('.verse-unit-row').forEach((r, i) => {
      r.classList.toggle('active-reading', i === idx)
      if (i === idx) {
        r.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })

    const target = currentVerses[idx]
    const s = String(currentSurahId).padStart(3, '0')
    const a = String(target.num).padStart(3, '0')

    const mirrors = [
      `/api/quran/audio/teacher/${currentSurahId}/${target.num}`,
      `https://everyayah.com/data/Minshawy_Teacher_128kbps/${s}${a}.mp3`,
      `https://verses.quran.com/Minshawi/Mujawwad/mp3/${s}${a}.mp3`,
      `https://everyayah.com/data/Minshawy_Murattal_128kbps/${s}${a}.mp3`
    ]

    let mirrorIdx = 0

    function attemptPlay() {
      quranAudio.onerror = (e) => {
        console.warn(`Quran mirror ${mirrorIdx} (${mirrors[mirrorIdx]}) failed. Trying next mirror...`, e)
        mirrorIdx++
        if (mirrorIdx < mirrors.length) {
          attemptPlay()
        } else {
          console.error('All Quran mirrors failed for', s, a)
          isVersePlaying = false
          updatePlayButtonIcon()
          setSoundwaveActive(false)
        }
      }

      quranAudio.src = mirrors[mirrorIdx]
      const p = quranAudio.play()
      if (p !== undefined) {
        p.then(() => {
          isVersePlaying = true
          updatePlayButtonIcon()
          setSoundwaveActive(true)
        }).catch(err => {
          console.warn('Playback caught error:', err)
          if (err.name !== 'AbortError') {
            mirrorIdx++
            if (mirrorIdx < mirrors.length) {
              attemptPlay()
            } else {
              isVersePlaying = false
              updatePlayButtonIcon()
              setSoundwaveActive(false)
            }
          }
        })
      }
    }

    updatePlayerLabel()
    updateRepeatIndicator()
    attemptPlay()
  }

  function playFullSurahAudio() {
    speech.stop()
    const sStr = String(currentSurahId).padStart(3, '0')
    
    // Sheikh Al-Minshawi Authentic Teacher Surah (المصحف المعلم مع الأطفال)
    const mirrors = [
      `/api/quran/audio/teacher-surah/${currentSurahId}`,
      `https://server10.mp3quran.net/minsh/Almusshaf-Al-Mo-lim/${sStr}.mp3`,
      `https://server10.mp3quran.net/minsh/${sStr}.mp3`,
      `https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/${sStr}.mp3`
    ]

    let mIdx = 0

    function attemptFullSurah() {
      quranAudio.onerror = () => {
        mIdx++
        if (mIdx < mirrors.length) {
          console.warn(`Full surah mirror ${mIdx} failed, trying next mirror: ${mirrors[mIdx]}...`)
          attemptFullSurah()
        } else {
          isVersePlaying = false
          updatePlayButtonIcon()
          setSoundwaveActive(false)
        }
      }

      quranAudio.src = mirrors[mIdx]
      const p = quranAudio.play()
      if (p !== undefined) {
        p.then(() => {
          isVersePlaying = true
          updatePlayButtonIcon()
          setSoundwaveActive(true)
        }).catch(err => {
          console.warn('Full surah play caught error:', err)
          if (err.name !== 'AbortError') {
            mIdx++
            if (mIdx < mirrors.length) attemptFullSurah()
          }
        })
      }
    }

    const label = document.getElementById('currentPlayingVerseLabel')
    if (label) label.textContent = `تلاوة سورة ${currentSurahName} كاملة (المصحف المعلم - المنشاوي والأطفال)`

    attemptFullSurah()
  }

  function onVerseAudioEnded() {
    if (quranPlaybackMode === 'full') {
      isVersePlaying = false
      updatePlayButtonIcon()
      setSoundwaveActive(false)
      sfx.celebrate()
      launchTastefulConfetti(40)
      return
    }

    if (currentVerseRepeatCount < verseRepeatTarget) {
      currentVerseRepeatCount++
      updateRepeatIndicator()
      setTimeout(() => {
        quranAudio.currentTime = 0
        quranAudio.play().catch(() => {})
      }, 500)
    } else {
      currentVerseRepeatCount = 1
      if (currentPlayingVerseIdx < currentVerses.length - 1) {
        currentPlayingVerseIdx++
        playVerseAudio(currentPlayingVerseIdx)
      } else {
        isVersePlaying = false
        updatePlayButtonIcon()
        setSoundwaveActive(false)
        sfx.celebrate()
        launchTastefulConfetti(50)
      }
    }
  }

  function togglePlayCurrentVerse() {
    sfx.tap()
    if (isVersePlaying) {
      quranAudio.pause()
      isVersePlaying = false
      updatePlayButtonIcon()
      setSoundwaveActive(false)
    } else {
      if (quranPlaybackMode === 'full') {
        playFullSurahAudio()
      } else {
        playVerseAudio(currentPlayingVerseIdx)
      }
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
      label.textContent = `الآية ${currentVerses[currentPlayingVerseIdx].num} من سورة ${currentSurahName} (المنشاوي مع الأطفال)`
    }
  }

  function updateRepeatIndicator() {
    const el = document.getElementById('repeatCounterIndicator')
    if (el) {
      el.textContent = `التكرار: ${currentVerseRepeatCount} من ${verseRepeatTarget}`
    }
  }

  // ─── TAB 3: NUMBERS & MATH ───
  const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢', '١٣', '١٤', '١٥', '١٦', '١٧', '١٨', '١٩', '٢٠']
  const NUMBER_NAMES = [
    'صِفْر', 'وَاحِد', 'اثْنَان', 'ثَلَاثَة', 'أَرْبَعَة', 'خَمْسَة', 'سِتَّة', 'سَبْعَة', 'ثَمَانِيَة', 'تِسْعَة', 'عَشَرَة',
    'أَحَدَ عَشَر', 'اثْنَا عَشَر', 'ثَلَاثَةَ عَشَر', 'أَرْبَعَةَ عَشَر', 'خَمْسَةَ عَشَر', 'سِتَّةَ عَشَر', 'سَبْعَةَ عَشَر', 'ثَمَانِيَةَ عَشَر', 'تِسْعَةَ عَشَر', 'عِشْرُون'
  ]
  const NUMBER_EMOJIS = ['0️⃣', '☝️', '✌️', '🌟', '🍀', '✋', '🎲', '🌈', '🐙', '🎈', '🔟', '⚽', '🧁', '🍎', '🚗', '🚀', '👑', '🕌', '💎', '🌙', '🏆']

  function initNumbers() {
    const grid = document.getElementById('numbersGridContainer')
    if (grid) {
      grid.innerHTML = ''
      for (let i = 0; i <= 20; i++) {
        const card = document.createElement('div')
        card.className = 'clean-number-card'
        card.innerHTML = `
          <div class="number-top-figures">
            <span class="digit-arabic">${ARABIC_DIGITS[i]}</span>
            <span class="digit-latin">${i}</span>
          </div>
          <div class="digit-name">${NUMBER_NAMES[i]} <span class="num-emoji">${NUMBER_EMOJIS[i] || '⭐'}</span></div>
          <div class="digit-dots-row">${'● '.repeat(Math.min(i, 10))}</div>
        `
        card.addEventListener('click', () => {
          sfx.tap()
          speech.speak(`الرقم ${NUMBER_NAMES[i]}، ${i}`)
          progress.addStars(1, false)
        })
        grid.appendChild(card)
      }
    }

    initComparisonGame()
    initVisualMath()
    initSequenceGame()
  }

  let compA = 7, compB = 4
  function initComparisonGame() {
    const btnList = document.querySelectorAll('.compare-buttons-row .comp-btn')
    btnList.forEach(btn => {
      btn.addEventListener('click', () => {
        const op = btn.getAttribute('data-op')
        const feedback = document.getElementById('compFeedback')
        let isCorrect = false

        if (op === '>' && compA > compB) isCorrect = true
        else if (op === '<' && compA < compB) isCorrect = true
        else if (op === '=' && compA === compB) isCorrect = true

        if (isCorrect) {
          sfx.correct()
          feedback.textContent = `إجابة صحيحة! ${compA} ${op} ${compB} 🎉`
          feedback.className = 'exercise-feedback success'
          progress.addStars(2, false)
          speech.speak(`صحيح! ${compA} ${op === '>' ? 'أكبر من' : op === '<' ? 'أصغر من' : 'يساوي'} ${compB}`)
          setTimeout(nextComparison, 1400)
        } else {
          sfx.wrong()
          feedback.textContent = 'فكر ثانية يا بطل، قارن بين مقدار العددين'
          feedback.className = 'exercise-feedback error'
        }
      })
    })
    nextComparison()
  }

  function nextComparison() {
    const aEl = document.getElementById('compValA')
    const bEl = document.getElementById('compValB')
    const opBox = document.getElementById('compOperatorBox')
    const feedback = document.getElementById('compFeedback')
    if (!aEl || !bEl) return

    if (feedback) feedback.textContent = ''
    if (opBox) opBox.textContent = '؟'

    compA = Math.floor(Math.random() * 15) + 1
    compB = Math.floor(Math.random() * 15) + 1
    if (Math.random() < 0.2) compB = compA

    aEl.textContent = `${compA} (${ARABIC_DIGITS[compA] || compA})`
    bEl.textContent = `${compB} (${ARABIC_DIGITS[compB] || compB})`
  }

  let mathMode = 'add'
  let mathA = 3, mathB = 2

  function initVisualMath() {
    const btnAdd = document.getElementById('btnModeAdd')
    const btnSub = document.getElementById('btnModeSub')
    if (btnAdd && btnSub) {
      btnAdd.addEventListener('click', () => {
        sfx.tap()
        mathMode = 'add'
        btnAdd.classList.add('active')
        btnSub.classList.remove('active')
        nextMath()
      })
      btnSub.addEventListener('click', () => {
        sfx.tap()
        mathMode = 'sub'
        btnSub.classList.add('active')
        btnAdd.classList.remove('active')
        nextMath()
      })
    }
    nextMath()
  }

  function nextMath() {
    const grpA = document.getElementById('mathGroupA')
    const grpB = document.getElementById('mathGroupB')
    const opEl = document.getElementById('mathOperator')
    const row = document.getElementById('mathOptionsRow')
    const feedback = document.getElementById('mathFeedback')
    if (!grpA || !grpB || !row) return

    if (feedback) feedback.textContent = ''
    let answer = 0

    if (mathMode === 'add') {
      mathA = Math.floor(Math.random() * 6) + 1
      mathB = Math.floor(Math.random() * 5) + 1
      answer = mathA + mathB
      opEl.textContent = '+'
    } else {
      mathA = Math.floor(Math.random() * 6) + 4
      mathB = Math.floor(Math.random() * (mathA - 1)) + 1
      answer = mathA - mathB
      opEl.textContent = '-'
    }

    grpA.innerHTML = `<span class="math-dot-units">${'● '.repeat(mathA)}</span><strong class="math-val">${mathA}</strong>`
    grpB.innerHTML = `<span class="math-dot-units">${'● '.repeat(mathB)}</span><strong class="math-val">${mathB}</strong>`

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
      b.className = 'math-choice-tile'
      b.textContent = val
      b.addEventListener('click', () => {
        if (val === answer) {
          sfx.correct()
          b.classList.add('correct')
          feedback.textContent = `إجابة صحيحة! ${mathA} ${mathMode === 'add' ? '+' : '-'} ${mathB} = ${answer} 🎉`
          feedback.className = 'exercise-feedback success'
          progress.addStars(2, false)
          speech.speak(`صحيح! الناتج هو ${answer}`)
          setTimeout(nextMath, 1400)
        } else {
          sfx.wrong()
          b.classList.add('wrong')
          feedback.textContent = 'احسب المقدار بدقة وحاول ثانية'
          feedback.className = 'exercise-feedback error'
        }
      })
      row.appendChild(b)
    })
  }

  let seqAnswer = 3
  function initSequenceGame() {
    nextSequence()
  }

  function nextSequence() {
    const row = document.getElementById('sequenceRow')
    const choicesRow = document.getElementById('sequenceChoicesRow')
    const feedback = document.getElementById('sequenceFeedback')
    if (!row || !choicesRow) return

    if (feedback) feedback.textContent = ''

    const start = Math.floor(Math.random() * 12) + 1
    const missingIdx = Math.floor(Math.random() * 4)
    seqAnswer = start + missingIdx

    row.innerHTML = ''
    for (let i = 0; i < 4; i++) {
      const cell = document.createElement('div')
      cell.className = 'sequence-cell'
      if (i === missingIdx) {
        cell.className += ' missing'
        cell.textContent = '؟'
      } else {
        cell.textContent = start + i
      }
      row.appendChild(cell)
    }

    const choices = [seqAnswer]
    while (choices.length < 4) {
      const r = Math.max(1, seqAnswer + Math.floor(Math.random() * 7) - 3)
      if (!choices.includes(r)) choices.push(r)
    }
    choices.sort(() => 0.5 - Math.random())

    choicesRow.innerHTML = ''
    choices.forEach(val => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'seq-choice-btn'
      btn.textContent = val
      btn.addEventListener('click', () => {
        if (val === seqAnswer) {
          sfx.correct()
          btn.classList.add('correct')
          feedback.textContent = `أحسنت! الرقم المفقود هو ${seqAnswer} ⭐`
          feedback.className = 'exercise-feedback success'
          progress.addStars(2, false)
          speech.speak(`أحسنت! الرقم هو ${seqAnswer}`)
          setTimeout(nextSequence, 1400)
        } else {
          sfx.wrong()
          btn.classList.add('wrong')
          feedback.textContent = 'رقم غير مطابق للتسلسل، تأمل الأرقام بالترتيب'
          feedback.className = 'exercise-feedback error'
        }
      })
      choicesRow.appendChild(btn)
    })
  }

  // ─── TAB 4: DUAS & MANNERS ───
  function initDuas() {
    document.querySelectorAll('.dua-play-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        speech.speak(btn.getAttribute('data-text') || '')
        progress.addStars(1, false)
      })
    })

    document.querySelectorAll('.dua-copy-icon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        const t = btn.getAttribute('data-copy') || ''
        if (navigator.clipboard) {
          navigator.clipboard.writeText(t).then(() => {
            alert('تم نسخ نص الدعاء المبارك.')
          })
        }
      })
    })

    document.querySelectorAll('.manner-option-btn').forEach(opt => {
      opt.addEventListener('click', () => {
        const isCorrect = opt.getAttribute('data-correct') === 'true'
        const feedback = document.getElementById('mannersFeedback')
        if (isCorrect) {
          sfx.correct()
          opt.classList.add('correct')
          feedback.textContent = 'أحسنت صنعاً! هذا أدب إسلامي نبيل يرضي الله ورسوله. 🌟'
          feedback.className = 'exercise-feedback success'
          progress.addStars(2, false)
          speech.speak('أحسنت صنعاً، هذا هو الخلق الإسلامي النبيل')
        } else {
          sfx.wrong()
          opt.classList.add('wrong')
          feedback.textContent = 'فكر في الأسلوب الأرقى والأكثر لطفاً واحتراماً للآخرين.'
          feedback.className = 'exercise-feedback error'
        }
      })
    })
  }

  // ─── TAB 5: DRAWING STUDIO & EMOJI COLORING WORLD ───
  let drawCanvas, drawCtx
  let isDrawing = false
  let currentColor = '#0c4a3f'
  let currentTool = 'pencil'
  let undoStack = []

  function initDrawing() {
    drawCanvas = document.getElementById('kidsDrawingCanvas')
    if (!drawCanvas) return
    drawCtx = drawCanvas.getContext('2d')

    resizeDrawingCanvas()

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

    document.querySelectorAll('#colorsPalette .palette-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        sfx.tap()
        document.querySelectorAll('#colorsPalette .palette-swatch').forEach(s => s.classList.remove('active'))
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

    const sizeRange = document.getElementById('brushSizeRange')
    const sizeVal = document.getElementById('brushSizeVal')
    if (sizeRange && sizeVal) {
      sizeRange.addEventListener('input', (e) => {
        sizeVal.textContent = `${e.target.value}px`
      })
    }

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
        if (confirm('هل ترغب في مسح محتوى اللوحة؟')) {
          drawCtx.fillStyle = '#ffffff'
          drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height)
          undoStack = []
        }
      })
    }

    const saveBtn = document.getElementById('btnSaveDraw')
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const dataUrl = drawCanvas.toDataURL('image/png')
        progress.saveDrawing(dataUrl, 'لوحة الفنان الصغير')
        alert('تم حفظ اللوحة في معرض رسوماتك بنجاح.')
        renderSavedGallery()
      })
    }

    const downloadBtn = document.getElementById('btnDownloadDraw')
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        sfx.tap()
        const link = document.createElement('a')
        link.download = `لوحة_أطفال_عمر_هشام_${Date.now()}.png`
        link.href = drawCanvas.toDataURL('image/png')
        link.click()
      })
    }

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

    initEmojiColoringWorld()
    initDrawingLessons()
    renderSavedGallery()
  }

  function resizeDrawingCanvas() {
    if (!drawCanvas || !drawCtx) return
    const container = drawCanvas.parentElement
    if (!container) return

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

  // ─── EMOJI COLORING WORLD & STICKERS STUDIO (Replaces SVGs with pure child-friendly emojis) ───
  let emojiCanvas, emojiCtx
  let activeEmojiColor = '#168a70'
  let activeSelectedSticker = null
  let currentEmojiTemplate = 'mosque'
  let isEmojiPainting = false

  const EMOJI_TEMPLATES = {
    mosque: { emoji: '🕌', name: 'مسجد مبارك', desc: 'بيت الله المبارك لأداء الصلاة' },
    crescent: { emoji: '🌙', name: 'هلال رمضان', desc: 'ينير السماء في ليالي الشهر الفضيل' },
    fish: { emoji: '🐟', name: 'سمكة البحر', desc: 'تسبح بخفة في أعماق البحار' },
    flower: { emoji: '🌸', name: 'وردة الربيع', desc: 'عطر فواح وألوان بديعة' },
    tree: { emoji: '🌳', name: 'شجرة خضراء', desc: 'ظل وثمار وخضرة مباركة' },
    lion: { emoji: '🦁', name: 'أسد شجاع', desc: 'ملك الغابة القوي' },
    car: { emoji: '🚗', name: 'سيارة مرحة', desc: 'تسير في أمان وسلام' },
    rocket: { emoji: '🚀', name: 'صاروخ الفضاء', desc: 'ينطلق نحو النجوم والمجرات' },
    apple: { emoji: '🍎', name: 'تفاحة لذيذة', desc: 'فاكهة صحية ومفيدة' },
    crown: { emoji: '👑', name: 'تاج الأبطال', desc: 'يتوج به حفظة القرآن والناجحون' }
  }

  function initEmojiColoringCanvas() {
    emojiCanvas = document.getElementById('emojiColoringCanvas')
    if (!emojiCanvas) return
    emojiCtx = emojiCanvas.getContext('2d')
    renderEmojiTemplate(currentEmojiTemplate)
  }

  function initEmojiColoringWorld() {
    initEmojiColoringCanvas()

    const tplBtns = document.querySelectorAll('#coloringTemplatesBar .tpl-btn')
    tplBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        tplBtns.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        currentEmojiTemplate = btn.getAttribute('data-shape')
        renderEmojiTemplate(currentEmojiTemplate)
      })
    })

    // Palette swatches
    document.querySelectorAll('#coloringPalette .color-swatch-bubble').forEach(sw => {
      sw.addEventListener('click', () => {
        sfx.tap()
        document.querySelectorAll('#coloringPalette .color-swatch-bubble').forEach(s => s.classList.remove('active'))
        sw.classList.add('active')
        activeEmojiColor = sw.getAttribute('data-color')
        activeSelectedSticker = null
      })
    })

    const customColor = document.getElementById('coloringCustomColor')
    if (customColor) {
      customColor.addEventListener('input', (e) => {
        activeEmojiColor = e.target.value
        activeSelectedSticker = null
      })
    }

    // Emoji Sticker buttons
    document.querySelectorAll('#emojiStickerButtons .sticker-btn').forEach(stkBtn => {
      stkBtn.addEventListener('click', () => {
        sfx.pop()
        document.querySelectorAll('#emojiStickerButtons .sticker-btn').forEach(b => b.classList.remove('selected'))
        stkBtn.classList.add('selected')
        activeSelectedSticker = stkBtn.getAttribute('data-sticker')
      })
    })

    // Reset button
    const resetBtn = document.getElementById('btnResetColoring')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        sfx.tap()
        renderEmojiTemplate(currentEmojiTemplate)
      })
    }

    // Save button
    const saveBtn = document.getElementById('btnSaveColoring')
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (!emojiCanvas) return
        const dataUrl = emojiCanvas.toDataURL('image/png')
        progress.saveDrawing(dataUrl, `تلوين ${EMOJI_TEMPLATES[currentEmojiTemplate]?.name || 'إيموجي'}`)
        alert('تم حفظ لوحة الإيموجي في معرض رسوماتك بنجاح! 🎨')
        renderSavedGallery()
      })
    }

    // Download button
    const dlBtn = document.getElementById('btnDownloadColoring')
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        if (!emojiCanvas) return
        sfx.tap()
        const link = document.createElement('a')
        link.download = `لوحة_إيموجي_عمر_هشام_${Date.now()}.png`
        link.href = emojiCanvas.toDataURL('image/png')
        link.click()
      })
    }

    // Canvas click / draw handlers
    function getCanvasPos(e) {
      const rect = emojiCanvas.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      return {
        x: (clientX - rect.left) * (emojiCanvas.width / rect.width),
        y: (clientY - rect.top) * (emojiCanvas.height / rect.height)
      }
    }

    function onPointerDown(e) {
      if (!emojiCanvas || !emojiCtx) return
      e.preventDefault()
      const p = getCanvasPos(e)

      // If sticker tool is active, stamp the sticker!
      if (activeSelectedSticker) {
        sfx.pop()
        emojiCtx.font = '54px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
        emojiCtx.textAlign = 'center'
        emojiCtx.textBaseline = 'middle'
        emojiCtx.fillText(activeSelectedSticker, p.x, p.y)
        return
      }

      // Otherwise, paint!
      isEmojiPainting = true
      emojiCtx.beginPath()
      emojiCtx.moveTo(p.x, p.y)
      emojiCtx.lineCap = 'round'
      emojiCtx.lineJoin = 'round'
      emojiCtx.lineWidth = 14
      emojiCtx.strokeStyle = activeEmojiColor
    }

    function onPointerMove(e) {
      if (!isEmojiPainting || activeSelectedSticker) return
      e.preventDefault()
      const p = getCanvasPos(e)
      emojiCtx.lineTo(p.x, p.y)
      emojiCtx.stroke()
    }

    function onPointerUp() {
      isEmojiPainting = false
      if (emojiCtx) emojiCtx.closePath()
    }

    if (emojiCanvas) {
      emojiCanvas.addEventListener('mousedown', onPointerDown)
      emojiCanvas.addEventListener('mousemove', onPointerMove)
      window.addEventListener('mouseup', onPointerUp)

      emojiCanvas.addEventListener('touchstart', onPointerDown, { passive: false })
      emojiCanvas.addEventListener('touchmove', onPointerMove, { passive: false })
      window.addEventListener('touchend', onPointerUp)
    }
  }

  function renderEmojiTemplate(key) {
    if (!emojiCanvas || !emojiCtx) return
    const tpl = EMOJI_TEMPLATES[key] || EMOJI_TEMPLATES.mosque

    emojiCtx.clearRect(0, 0, emojiCanvas.width, emojiCanvas.height)

    // Cheerful background
    const bgGrad = emojiCtx.createLinearGradient(0, 0, 0, emojiCanvas.height)
    bgGrad.addColorStop(0, '#f8fafc')
    bgGrad.addColorStop(1, '#f1f5f9')
    emojiCtx.fillStyle = bgGrad
    emojiCtx.fillRect(0, 0, emojiCanvas.width, emojiCanvas.height)

    // Soft border frame
    emojiCtx.strokeStyle = '#e2e8f0'
    emojiCtx.lineWidth = 4
    emojiCtx.strokeRect(10, 10, emojiCanvas.width - 20, emojiCanvas.height - 20)

    // Giant central emoji character
    emojiCtx.font = '220px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
    emojiCtx.textAlign = 'center'
    emojiCtx.textBaseline = 'middle'
    emojiCtx.fillText(tpl.emoji, emojiCanvas.width / 2, emojiCanvas.height / 2 - 10)

    // Caption title
    emojiCtx.font = 'bold 26px "Tajawal", "Noto Naskh Arabic", sans-serif'
    emojiCtx.fillStyle = '#0c4a3f'
    emojiCtx.fillText(tpl.name, emojiCanvas.width / 2, emojiCanvas.height - 40)
  }

  // Drawing Lessons
  const DRAWING_LESSONS = [
    {
      title: 'كيف ترسم مسجداً إسلامياً مباركاً 🕌',
      steps: [
        '١. ارسم قاعدة مستطيلة للمسجد على سطر مستقيم.',
        '٢. ارسم نصف دائرة مقوسة فوق المنتصف لتشكل القبة الرئيسية.',
        '٣. أضف مستطيلين رأسيين على الجانبين للمئذنتين الشامختين.',
        '٤. توّج المئذنتين بمثلثين صغيرين وهلال في قمة القبة.',
        '٥. ارسم قوساً جميلاً لباب المسجد ولوّن لوحتك باللون الزمردي والذهبي.'
      ]
    },
    {
      title: 'كيف ترسم سمكة سابحة في الأعماق 🐟',
      steps: [
        '١. ارسم شكلاً بيضاوياً أفقياً لجسم السمكة.',
        '٢. ارسم مثلثاً متصلاً بالجهة الخلفية لعمل الذيل.',
        '٣. أضف عيناً صغيرة واضحة وانحناءة الفم الباسم.',
        '٤. أضف زعنفة علوية وزعنفة سفلية لتوجيه السباحة.',
        '٥. ارسم خطوطاً مقوسة رقيقة تمثل الحراشف وفقاعات ماء تعلوها.'
      ]
    },
    {
      title: 'كيف ترسم زهرة ربيعية متفتحة 🌸',
      steps: [
        '١. ابدأ برسم دائرة صغيرة في المنتصف تمثل قلب الزهرة.',
        '٢. ارسم خمس بتلات متناسقة ومستديرة تحيط بالدائرة المركزية.',
        '٣. مد خطاً رأسياً مائلاً قليلاً للأسفل ليكون ساق الزهرة.',
        '٤. أضف ورقتين بيضاويتين على جانبي الساق.',
        '٥. لوّن البتلات بلون هادئ والساق باللون الأخضر النضر.'
      ]
    }
  ]

  function initDrawingLessons() {
    const grid = document.getElementById('drawingLessonsGrid')
    if (!grid) return
    grid.innerHTML = ''

    DRAWING_LESSONS.forEach(lesson => {
      const card = document.createElement('div')
      card.className = 'refined-lesson-card'
      const stepsHtml = lesson.steps.map(s => `<li>${s}</li>`).join('')
      card.innerHTML = `
        <h3>${lesson.title}</h3>
        <ol class="lesson-ordered-list">${stepsHtml}</ol>
        <button type="button" class="sub-tab-chip" style="margin-top:14px;"><i class="fa-solid fa-pencil"></i> ابدأ رسمها في اللوحة</button>
      `
      card.querySelector('button').addEventListener('click', () => {
        sfx.tap()
        const freePill = document.querySelector('.sub-tab-chip[data-sub="draw-free"]')
        if (freePill) freePill.click()
      })
      grid.appendChild(card)
    })
  }

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
      card.className = 'gallery-thumbnail-card'
      card.innerHTML = `
        <img src="${d.dataUrl}" alt="${d.title}" class="gallery-thumb-img" />
        <div class="gallery-thumb-info">
          <strong>${d.title}</strong>
          <small>${d.date}</small>
        </div>
        <div class="gallery-thumb-actions">
          <a href="${d.dataUrl}" download="${d.title}.png" class="gallery-icon-action" title="تنزيل"><i class="fa-solid fa-download"></i></a>
          <button type="button" class="gallery-icon-action delete" data-id="${d.id}" title="حذف"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      `
      card.querySelector('.delete').addEventListener('click', () => {
        sfx.tap()
        if (confirm('هل ترغب في حذف هذه الرسمة؟')) {
          progress.deleteDrawing(d.id)
          renderSavedGallery()
        }
      })
      grid.appendChild(card)
    })
  }

  // ══════════════════════════════════════════════════════════════════════
  // TAB 6: THE 7 KIDS GAMES & ADVENTURE WORLD (WITH EMOJIS & CHALLENGES)
  // ══════════════════════════════════════════════════════════════════════

  // ─── Game 1: Super Memory Flip (with 3 difficulty levels) ───
  const MEMORY_DATA = {
    easy: [
      { val: '🍎', name: 'تفاح' },
      { val: '🍌', name: 'موز' },
      { val: '🍓', name: 'فراولة' },
      { val: '🍇', name: 'عنب' }
    ],
    medium: [
      { val: '🦁', name: 'أسد' },
      { val: '🐘', name: 'فيل' },
      { val: '🦒', name: 'زرافة' },
      { val: '🦓', name: 'حمار وحشي' },
      { val: '🐒', name: 'قرد' },
      { val: '🐪', name: 'جمل' }
    ],
    hard: [
      { val: '🚀', name: 'صاروخ' },
      { val: '🌙', name: 'قمر' },
      { val: '☀️', name: 'شمس' },
      { val: '🌟', name: 'نجمة' },
      { val: '📖', name: 'مصحف' },
      { val: '🕌', name: 'مسجد' },
      { val: '👑', name: 'تاج' },
      { val: '🏆', name: 'كأس' }
    ]
  }

  let memoryLevel = 'easy'
  let memoryFlippedCards = []
  let memoryMatchedCount = 0
  let memoryFlips = 0

  function initMemoryGame() {
    const diffChips = document.querySelectorAll('#memoryDiffPills .diff-chip')
    diffChips.forEach(chip => {
      chip.addEventListener('click', () => {
        sfx.tap()
        diffChips.forEach(c => c.classList.remove('active'))
        chip.classList.add('active')
        memoryLevel = chip.getAttribute('data-level')
        startMemoryRound()
      })
    })

    const restartBtn = document.getElementById('btnRestartMemory')
    if (restartBtn) restartBtn.addEventListener('click', () => { sfx.tap(); startMemoryRound() })

    const nextLvlBtn = document.getElementById('btnNextMemoryLevel')
    if (nextLvlBtn) {
      nextLvlBtn.addEventListener('click', () => {
        sfx.tap()
        if (memoryLevel === 'easy') memoryLevel = 'medium'
        else if (memoryLevel === 'medium') memoryLevel = 'hard'
        else memoryLevel = 'easy'
        diffChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-level') === memoryLevel))
        startMemoryRound()
      })
    }

    startMemoryRound()
  }

  function startMemoryRound() {
    const board = document.getElementById('memoryCardsBoard')
    const flipsLabel = document.getElementById('memFlipsCount')
    const matchesLabel = document.getElementById('memMatchesCount')
    const winBanner = document.getElementById('memWinBanner')
    if (!board) return

    if (winBanner) winBanner.style.display = 'none'
    memoryMatchedCount = 0
    memoryFlips = 0
    memoryFlippedCards = []

    const items = MEMORY_DATA[memoryLevel] || MEMORY_DATA.easy
    if (flipsLabel) flipsLabel.textContent = '0'
    if (matchesLabel) matchesLabel.textContent = `0 / ${items.length}`

    board.className = `memory-cards-grid level-${memoryLevel}`

    const deck = []
    items.forEach((item, pairIdx) => {
      deck.push({ ...item, pairIdx })
      deck.push({ ...item, pairIdx })
    })
    deck.sort(() => 0.5 - Math.random())

    board.innerHTML = ''
    deck.forEach(item => {
      const card = document.createElement('div')
      card.className = 'clean-memory-card'
      card.innerHTML = `
        <div class="card-flipper">
          <div class="card-side back"><span class="back-star-ico">⭐</span></div>
          <div class="card-side front">
            <span class="card-emoji-big">${item.val}</span>
            <small>${item.name}</small>
          </div>
        </div>
      `
      card.addEventListener('click', () => onCardClicked(card, item, items.length))
      board.appendChild(card)
    })
  }

  function onCardClicked(cardEl, item, totalPairs) {
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched') || memoryFlippedCards.length >= 2) {
      return
    }

    sfx.tap()
    cardEl.classList.add('flipped')
    memoryFlippedCards.push({ cardEl, item })

    if (memoryFlippedCards.length === 2) {
      memoryFlips++
      const flipsLabel = document.getElementById('memFlipsCount')
      if (flipsLabel) flipsLabel.textContent = memoryFlips

      const [c1, c2] = memoryFlippedCards
      if (c1.item.pairIdx === c2.item.pairIdx) {
        setTimeout(() => {
          sfx.correct()
          c1.cardEl.classList.add('matched')
          c2.cardEl.classList.add('matched')
          memoryMatchedCount++
          const matchesLabel = document.getElementById('memMatchesCount')
          if (matchesLabel) matchesLabel.textContent = `${memoryMatchedCount} / ${totalPairs}`
          speech.speak(c1.item.name)
          memoryFlippedCards = []

          if (memoryMatchedCount === totalPairs) {
            sfx.celebrate()
            launchTastefulConfetti(55)
            progress.updateQuest('memory')
            progress.addStars(4, true)
            const winBanner = document.getElementById('memWinBanner')
            if (winBanner) winBanner.style.display = 'block'
            speech.speak('رائع جداً! فزت بالجولة بجدارة!')
          }
        }, 320)
      } else {
        setTimeout(() => {
          sfx.wrong()
          c1.cardEl.classList.remove('flipped')
          c2.cardEl.classList.remove('flipped')
          memoryFlippedCards = []
        }, 800)
      }
    }
  }

  // ─── Game 2: Balloon Popper Quest 🎈 ───
  let balloonTimerInterval = null
  let balloonSecondsLeft = 30
  let balloonScore = 0
  let currentBalloonTarget = null
  let isBalloonGameRunning = false

  const BALLOON_LETTERS = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ر', 'س', 'ش', 'ص', 'ط', 'ع', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'و', 'ي']
  const BALLOON_COLORS = [
    { bg: '#ef4444', name: 'الأحمر' },
    { bg: '#3b82f6', name: 'الأزرق' },
    { bg: '#f59e0b', name: 'الأصفر' },
    { bg: '#10b981', name: 'الأخضر' },
    { bg: '#8b5cf6', name: 'الينفسجي' },
    { bg: '#ec4899', name: 'الوردي' }
  ]

  function initBalloonGame() {
    const startBtn = document.getElementById('btnStartBalloons')
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        sfx.tap()
        startBalloonRound()
      })
    }
  }

  function startBalloonRound() {
    isBalloonGameRunning = true
    balloonScore = 0
    balloonSecondsLeft = 30

    const scoreEl = document.getElementById('balloonScore')
    const timerEl = document.getElementById('balloonTimer')
    const container = document.getElementById('balloonsFloatContainer')
    if (scoreEl) scoreEl.textContent = '0'
    if (timerEl) timerEl.textContent = '30s'
    if (!container) return

    container.innerHTML = ''
    clearInterval(balloonTimerInterval)

    nextBalloonMission()
    spawnBalloonsWave()

    balloonTimerInterval = setInterval(() => {
      balloonSecondsLeft--
      if (timerEl) timerEl.textContent = `${balloonSecondsLeft}s`
      if (balloonSecondsLeft % 3 === 0) {
        spawnBalloonsWave()
      }
      if (balloonSecondsLeft <= 0) {
        clearInterval(balloonTimerInterval)
        endBalloonRound()
      }
    }, 1000)
  }

  function nextBalloonMission() {
    const targetChar = BALLOON_LETTERS[Math.floor(Math.random() * BALLOON_LETTERS.length)]
    currentBalloonTarget = targetChar
    const promptEl = document.getElementById('balloonTargetPrompt')
    if (promptEl) {
      promptEl.innerHTML = `اصطاد بالون حرف [ <span class="target-char-glow">${targetChar}</span> ] 🎈`
    }
    speech.speak(`اصطاد بالون حرف ${targetChar}`)
  }

  function spawnBalloonsWave() {
    const container = document.getElementById('balloonsFloatContainer')
    if (!container || !isBalloonGameRunning) return

    const waveLetters = [currentBalloonTarget]
    while (waveLetters.length < 5) {
      const rand = BALLOON_LETTERS[Math.floor(Math.random() * BALLOON_LETTERS.length)]
      waveLetters.push(rand)
    }
    waveLetters.sort(() => 0.5 - Math.random())

    waveLetters.forEach((char, idx) => {
      const bEl = document.createElement('div')
      const colorObj = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]
      bEl.className = 'interactive-flying-balloon'
      bEl.style.backgroundColor = colorObj.bg
      bEl.style.left = `${10 + idx * 17}%`
      bEl.style.animationDuration = `${Math.random() * 3 + 6}s`
      bEl.innerHTML = `
        <span class="balloon-string"></span>
        <span class="balloon-letter-face">${char}</span>
      `

      bEl.addEventListener('pointerdown', (e) => {
        e.stopPropagation()
        if (!isBalloonGameRunning) return
        if (char === currentBalloonTarget) {
          sfx.pop()
          bEl.classList.add('popped')
          balloonScore += 10
          const sEl = document.getElementById('balloonScore')
          if (sEl) sEl.textContent = balloonScore
          progress.updateQuest('balloon', 1)
          setTimeout(() => bEl.remove(), 250)
          nextBalloonMission()
        } else {
          sfx.wrong()
          bEl.classList.add('wobble-error')
          setTimeout(() => bEl.classList.remove('wobble-error'), 400)
        }
      })

      container.appendChild(bEl)

      setTimeout(() => {
        if (bEl.parentElement) bEl.remove()
      }, 9000)
    })
  }

  function endBalloonRound() {
    isBalloonGameRunning = false
    sfx.celebrate()
    launchTastefulConfetti(45)
    progress.addStars(Math.max(2, Math.floor(balloonScore / 20)), true)
    const promptEl = document.getElementById('balloonTargetPrompt')
    if (promptEl) {
      promptEl.innerHTML = `انتهت الجولة! جمعت <strong>${balloonScore}</strong> نقطة! 🎉`
    }
    speech.speak(`أحسنت يا بطل! أنهيت جولة البالونات بنجاح!`)
  }

  // ─── Game 3: Math Speed Blitz ⚡ ───
  let blitzDiff = 'easy'
  let blitzTimer = 30
  let blitzTimerId = null
  let blitzScore = 0
  let blitzStreak = 0
  let blitzCurrentAnswer = 0

  function initMathBlitz() {
    const diffChips = document.querySelectorAll('#mathBlitzDiffPills .diff-chip')
    diffChips.forEach(chip => {
      chip.addEventListener('click', () => {
        sfx.tap()
        diffChips.forEach(c => c.classList.remove('active'))
        chip.classList.add('active')
        blitzDiff = chip.getAttribute('data-level')
        startMathBlitz()
      })
    })

    startMathBlitz()
  }

  function startMathBlitz() {
    blitzScore = 0
    blitzStreak = 0
    blitzTimer = 30

    const scoreEl = document.getElementById('mathBlitzScore')
    const streakEl = document.getElementById('mathStreakCount')
    const timerEl = document.getElementById('mathBlitzTimer')
    const bar = document.getElementById('mathTimeProgressBar')

    if (scoreEl) scoreEl.textContent = '0'
    if (streakEl) streakEl.textContent = '0🔥'
    if (timerEl) timerEl.textContent = '30s'
    if (bar) bar.style.width = '100%'

    clearInterval(blitzTimerId)
    nextBlitzQuestion()

    blitzTimerId = setInterval(() => {
      blitzTimer--
      if (timerEl) timerEl.textContent = `${blitzTimer}s`
      if (bar) bar.style.width = `${(blitzTimer / 30) * 100}%`
      if (blitzTimer <= 0) {
        clearInterval(blitzTimerId)
        endMathBlitz()
      }
    }, 1000)
  }

  function nextBlitzQuestion() {
    const eqEl = document.getElementById('blitzEquationText')
    const matrix = document.getElementById('blitzChoicesMatrix')
    const feedback = document.getElementById('blitzFeedback')
    if (!eqEl || !matrix) return

    if (feedback) feedback.textContent = ''
    let a = 0, b = 0, op = '+'

    if (blitzDiff === 'easy') {
      a = Math.floor(Math.random() * 5) + 1
      b = Math.floor(Math.random() * 5) + 1
      op = '+'
      blitzCurrentAnswer = a + b
    } else if (blitzDiff === 'medium') {
      if (Math.random() > 0.5) {
        a = Math.floor(Math.random() * 15) + 5
        b = Math.floor(Math.random() * 10) + 1
        op = '+'
        blitzCurrentAnswer = a + b
      } else {
        a = Math.floor(Math.random() * 15) + 10
        b = Math.floor(Math.random() * 9) + 1
        op = '-'
        blitzCurrentAnswer = a - b
      }
    } else {
      a = Math.floor(Math.random() * 5) + 2
      b = Math.floor(Math.random() * 5) + 1
      op = '×'
      blitzCurrentAnswer = a * b
    }

    eqEl.textContent = `${a} ${op} ${b} = ؟`

    const choices = [blitzCurrentAnswer]
    while (choices.length < 4) {
      const r = Math.max(0, blitzCurrentAnswer + Math.floor(Math.random() * 7) - 3)
      if (!choices.includes(r)) choices.push(r)
    }
    choices.sort(() => 0.5 - Math.random())

    matrix.innerHTML = ''
    choices.forEach(val => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'blitz-choice-tile'
      btn.textContent = val
      btn.addEventListener('click', () => {
        if (val === blitzCurrentAnswer) {
          sfx.correct()
          blitzStreak++
          const bonus = Math.min(3, Math.floor(blitzStreak / 2) + 1)
          blitzScore += 10 * bonus
          progress.updateQuest('math', 1)

          const sEl = document.getElementById('mathBlitzScore')
          const strkEl = document.getElementById('mathStreakCount')
          if (sEl) sEl.textContent = blitzScore
          if (strkEl) strkEl.textContent = `${blitzStreak}🔥`

          feedback.textContent = `إجابة صحيحة! (+${10 * bonus} نقطة) 🎉`
          feedback.className = 'exercise-feedback success'
          setTimeout(nextBlitzQuestion, 600)
        } else {
          sfx.wrong()
          blitzStreak = 0
          const strkEl = document.getElementById('mathStreakCount')
          if (strkEl) strkEl.textContent = '0'
          feedback.textContent = 'إجابة غير صحيحة، ركز يا بطل'
          feedback.className = 'exercise-feedback error'
        }
      })
      matrix.appendChild(btn)
    })
  }

  function endMathBlitz() {
    sfx.celebrate()
    launchTastefulConfetti(45)
    progress.addStars(Math.max(2, Math.floor(blitzScore / 30)), true)
    const eqEl = document.getElementById('blitzEquationText')
    if (eqEl) eqEl.textContent = `أحسنت! نتيجتك: ${blitzScore} نقطة! 🏆`
  }

  // ─── Game 4: Word & Emoji Matcher 🧩 ───
  const EMOJI_PUZZLES = [
    { word: 'سَيَّارَة', correct: '🚗', options: ['🚗', '✈️', '🚢', '🚂'], meaning: 'وسيلة نقل برية تسير على عجلات' },
    { word: 'أَسَد', correct: '🦁', options: ['🦁', '🐘', '🦒', '🐒'], meaning: 'ملك الغابة القوي' },
    { word: 'شَمْس', correct: '☀️', options: ['☀️', '🌙', '⭐', '☁️'], meaning: 'تضيء الكون وتبعث الدفء' },
    { word: 'تُفَّاحَة', correct: '🍎', options: ['🍎', '🍌', '🍇', '🍓'], meaning: 'فاكهة لذيذة ومفيدة للصحة' },
    { word: 'مَسْجِد', correct: '🕌', options: ['🕌', '🏠', '🏫', '🏥'], meaning: 'بيت الله المبارك لأداء الصلاة' },
    { word: 'طَائِرَة', correct: '✈️', options: ['✈️', '🚗', '🚲', '🚀'], meaning: 'تحلق في السماء بين السحاب' },
    { word: 'قَمَر', correct: '🌙', options: ['🌙', '☀️', '🌍', '🪐'], meaning: 'ينير ظلمة الليل بإذن الله' },
    { word: 'سَاعَة', correct: '⏰', options: ['⏰', '📱', '💻', '📺'], meaning: 'نعرف بها أوقات الصلاة واليوم' }
  ]
  let currentEmojiPuzzleIdx = 0
  let emojiMatchScore = 0

  function initEmojiMatcher() {
    const listenBtn = document.getElementById('btnListenPuzzleWord')
    if (listenBtn) {
      listenBtn.addEventListener('click', () => {
        const p = EMOJI_PUZZLES[currentEmojiPuzzleIdx]
        sfx.tap()
        speech.speak(p.word)
      })
    }

    const nextBtn = document.getElementById('btnNextEmojiPuzzle')
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sfx.tap()
        currentEmojiPuzzleIdx = (currentEmojiPuzzleIdx + 1) % EMOJI_PUZZLES.length
        loadEmojiPuzzle()
      })
    }

    loadEmojiPuzzle()
  }

  function loadEmojiPuzzle() {
    const p = EMOJI_PUZZLES[currentEmojiPuzzleIdx]
    const wordEl = document.getElementById('emojiTargetWord')
    const grid = document.getElementById('emojiPuzzleChoices')
    const roundEl = document.getElementById('emojiMatchRound')
    const feedback = document.getElementById('emojiMatchFeedback')

    if (wordEl) wordEl.textContent = p.word
    if (roundEl) roundEl.textContent = `${currentEmojiPuzzleIdx + 1} / ${EMOJI_PUZZLES.length}`
    if (feedback) feedback.textContent = ''
    if (!grid) return

    grid.innerHTML = ''
    const shuffled = [...p.options].sort(() => 0.5 - Math.random())

    shuffled.forEach(emoji => {
      const tile = document.createElement('button')
      tile.type = 'button'
      tile.className = 'emoji-choice-tile'
      tile.innerHTML = `<span class="emoji-big">${emoji}</span>`
      tile.addEventListener('click', () => {
        if (emoji === p.correct) {
          sfx.correct()
          tile.classList.add('correct')
          emojiMatchScore += 10
          const sEl = document.getElementById('emojiMatchScore')
          if (sEl) sEl.textContent = emojiMatchScore
          feedback.textContent = `أحسنت يا بطل! ${p.word} تعني (${p.meaning}) 🎉`
          feedback.className = 'exercise-feedback success'
          progress.addStars(2, false)
          speech.speak(`أحسنت! كلمة ${p.word}`)
          setTimeout(() => {
            currentEmojiPuzzleIdx = (currentEmojiPuzzleIdx + 1) % EMOJI_PUZZLES.length
            loadEmojiPuzzle()
          }, 1500)
        } else {
          sfx.wrong()
          tile.classList.add('wrong')
          feedback.textContent = 'رمز غير مطابق للكلمة، تأمل المعنى جيداً'
          feedback.className = 'exercise-feedback error'
        }
      })
      grid.appendChild(tile)
    })
  }

  // ─── Game 5: Word Builder / Scramble 🔤 ───
  const SCRAMBLE_WORDS_BY_LEN = {
    3: [
      { word: 'أَسَد', letters: ['أ', 'س', 'د'], hint: 'ملك الغابة القوي', emoji: '🦁' },
      { word: 'قَلَم', letters: ['ق', 'ل', 'م'], hint: 'أداة الكتابة والعلم', emoji: '✏️' },
      { word: 'نُور', letters: ['ن', 'و', 'ر'], hint: 'ضياء يبدد الظلام', emoji: '💡' },
      { word: 'جَمَل', letters: ['ج', 'م', 'ل'], hint: 'سفينة الصحراء الصبور', emoji: '🐪' },
      { word: 'عِنَب', letters: ['ع', 'ن', 'ب'], hint: 'فاكهة لذيذة ومباركة', emoji: '🍇' }
    ],
    4: [
      { word: 'كِتَاب', letters: ['ك', 'ت', 'ا', 'ب'], hint: 'كنز المعرفة والقراءة', emoji: '📖' },
      { word: 'مَسْجِد', letters: ['م', 'س', 'ج', 'د'], hint: 'بيت الله المبارك', emoji: '🕌' },
      { word: 'هِلَال', letters: ['هـ', 'ل', 'ا', 'ل'], hint: 'بداية الشهر القمري', emoji: '🌙' },
      { word: 'شَجَرَة', letters: ['ش', 'ج', 'ر', 'ة'], hint: 'ظل وثمار وخضرة', emoji: '🌳' },
      { word: 'بَيْتِي', letters: ['ب', 'ي', 'ت', 'ي'], hint: 'سكن وأمان الأسرة', emoji: '🏠' }
    ],
    5: [
      { word: 'طَائِرَة', letters: ['ط', 'ا', 'ئ', 'ر', 'ة'], hint: 'تحلق عالياً في السماء', emoji: '✈️' },
      { word: 'سَيَّارَة', letters: ['س', 'ي', 'ا', 'ر', 'ة'], hint: 'مركبة للتنقل والسفر', emoji: '🚗' },
      { word: 'مَدْرَسَة', letters: ['م', 'د', 'ر', 'س', 'ة'], hint: 'صرح العلم والمعرفة', emoji: '🏫' },
      { word: 'فَرَاشَة', letters: ['ف', 'ر', 'ا', 'ش', 'ة'], hint: 'كائن ملون يطير بين الأزهار', emoji: '🦋' }
    ]
  }

  let scrambleLen = 3
  let currentScrambleIdx = 0
  let userPlacedLetters = []
  let scrambleSolved = 0

  function initWordScramble() {
    const lvlChips = document.querySelectorAll('#scrambleLevelPills .diff-chip')
    lvlChips.forEach(chip => {
      chip.addEventListener('click', () => {
        sfx.tap()
        lvlChips.forEach(c => c.classList.remove('active'))
        chip.classList.add('active')
        scrambleLen = parseInt(chip.getAttribute('data-len'), 10) || 3
        currentScrambleIdx = 0
        loadScramble()
      })
    })

    const checkBtn = document.getElementById('btnCheckScramble')
    const nextBtn = document.getElementById('btnNextScramble')
    const resetBtn = document.getElementById('btnResetCurrentScramble')

    if (checkBtn) checkBtn.addEventListener('click', checkScrambleAnswer)
    if (resetBtn) resetBtn.addEventListener('click', () => { sfx.tap(); loadScramble() })
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sfx.tap()
        const list = SCRAMBLE_WORDS_BY_LEN[scrambleLen]
        currentScrambleIdx = (currentScrambleIdx + 1) % list.length
        loadScramble()
      })
    }

    loadScramble()
  }

  function loadScramble() {
    const list = SCRAMBLE_WORDS_BY_LEN[scrambleLen]
    const target = list[currentScrambleIdx]
    const slotsRow = document.getElementById('scrambleSlotsRow')
    const tilesRow = document.getElementById('scrambleTilesRow')
    const promptEl = document.getElementById('scramblePrompt')
    const iconEl = document.getElementById('scrambleIconBadge')
    const feedback = document.getElementById('scrambleFeedback')

    if (iconEl) iconEl.textContent = target.emoji
    if (promptEl) promptEl.textContent = `رتّب حروف كلمة تعني: (${target.hint})`
    if (feedback) feedback.textContent = ''
    userPlacedLetters = new Array(target.letters.length).fill(null)

    if (slotsRow) {
      slotsRow.innerHTML = ''
      for (let i = 0; i < target.letters.length; i++) {
        const slot = document.createElement('div')
        slot.className = 'clean-scramble-slot'
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
        tile.className = 'clean-tile-btn'
        tile.textContent = char
        tile.addEventListener('click', () => {
          sfx.tap()
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
    const list = SCRAMBLE_WORDS_BY_LEN[scrambleLen]
    const target = list[currentScrambleIdx]
    const feedback = document.getElementById('scrambleFeedback')
    const answer = userPlacedLetters.join('')

    if (answer === target.letters.join('')) {
      sfx.correct()
      scrambleSolved++
      const sEl = document.getElementById('scrambleSolvedCount')
      if (sEl) sEl.textContent = scrambleSolved

      if (feedback) {
        feedback.textContent = `أحسنت صنعاً! الكلمة هي "${target.word}" ${target.emoji}`
        feedback.className = 'exercise-feedback success'
      }
      progress.addStars(3, false)
      speech.speak(`أحسنت، كلمة ${target.word}`)
      setTimeout(() => {
        currentScrambleIdx = (currentScrambleIdx + 1) % list.length
        loadScramble()
      }, 1400)
    } else {
      sfx.wrong()
      if (feedback) {
        feedback.textContent = 'الترتيب غير مطابق، انقر على إعادة المحاولة'
        feedback.className = 'exercise-feedback error'
      }
    }
  }

  // ─── Game 6: Missing Letter Hunter 🎯 ───
  const MISSING_WORDS = [
    { full: 'تُفَّاح', missing: 'تـ', choices: ['تـ', 'بـ', 'سـ', 'مـ'], display: '؟ـفَّاح', hint: 'فاكهة لذيذة ومفيدة', emoji: '🍎' },
    { full: 'كِتَاب', missing: 'كـ', choices: ['كـ', 'مـ', 'سـ', 'فـ'], display: '؟ـتَاب', hint: 'مصدر العلم والقراءة', emoji: '📖' },
    { full: 'مَسْجِد', missing: 'مـ', choices: ['مـ', 'نـ', 'بـ', 'لـ'], display: '؟ـسْجِد', hint: 'دار العبادة والصلاة', emoji: '🕌' },
    { full: 'قَلَم', missing: 'قـ', choices: ['قـ', 'فـ', 'عـ', 'طـ'], display: '؟ـلَم', hint: 'نكتب به العلم', emoji: '✏️' },
    { full: 'شَمْس', missing: 'شـ', choices: ['شـ', 'سـ', 'صـ', 'ضـ'], display: '؟ـمْس', hint: 'تشرق في الصباح', emoji: '☀️' }
  ]
  let currentMissingIdx = 0

  function initMissingLetterGame() {
    loadMissingQuestion()
  }

  function loadMissingQuestion() {
    const target = MISSING_WORDS[currentMissingIdx]
    const displayEl = document.getElementById('missingWordDisplay')
    const choicesRow = document.getElementById('missingChoicesRow')
    const iconEl = document.getElementById('missingIconBadge')
    const feedback = document.getElementById('missingFeedback')

    if (iconEl) iconEl.textContent = target.emoji
    if (displayEl) displayEl.innerHTML = `<span class="missing-text-cue">${target.display}</span> <small>(${target.hint})</small>`
    if (feedback) feedback.textContent = ''

    if (choicesRow) {
      choicesRow.innerHTML = ''
      target.choices.forEach(ch => {
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'clean-choice-tile'
        btn.textContent = ch
        btn.addEventListener('click', () => {
          if (ch === target.missing) {
            sfx.correct()
            btn.classList.add('correct')
            feedback.textContent = `إجابة صحيحة! الكلمة كاملة هي: "${target.full}" ${target.emoji}`
            feedback.className = 'exercise-feedback success'
            progress.addStars(2, false)
            speech.speak(`صحيح، ${target.full}`)
            setTimeout(() => {
              currentMissingIdx = (currentMissingIdx + 1) % MISSING_WORDS.length
              loadMissingQuestion()
            }, 1400)
          } else {
            sfx.wrong()
            btn.classList.add('wrong')
            feedback.textContent = 'حرف غير مطابق، جرب اختياراً آخر'
            feedback.className = 'exercise-feedback error'
          }
        })
        choicesRow.appendChild(btn)
      })
    }
  }

  // ─── Game 7: Little Muslim Quiz Challenge 🕌 ───
  const MUSLIM_QUESTIONS = [
    {
      emoji: '📖',
      question: 'ما هو الكتاب المعجز الذي أنزله الله تعالى على نبينا محمد ﷺ؟',
      answers: ['القرآن الكريم', 'التوراة', 'الإنجيل', 'الزبور'],
      correct: 0,
      note: 'القرآن الكريم كلام الله المعجز الخالد المنزّل على قلب نبينا محمد ﷺ.'
    },
    {
      emoji: '🕋',
      question: 'ما هي القبلة الشريفة التي يتجه إليها المسلمون في صلاتهم؟',
      answers: ['الكعبة المشرفة بمكة', 'المسجد الأقصى', 'المسجد النبوي', 'جبل أحد'],
      correct: 0,
      note: 'الكعبة المشرفة هي قبلة المسلمين في جميع بقاع الأرض.'
    },
    {
      emoji: '✋',
      question: 'كم عدد أركان الإسلام العظيمة؟',
      answers: ['خمسة أركان', 'ثلاثة أركان', 'سبعة أركان', 'عشرة أركان'],
      correct: 0,
      note: 'بني الإسلام على خمس: الشهادتان، الصلاة، الزكاة، صوم رمضان، وحج البيت.'
    },
    {
      emoji: '🍽️',
      question: 'ماذا يستحب للمسلم أن يقول قبل البدء في تناول طعامه؟',
      answers: ['بِسْمِ اللَّهِ', 'الْحَمْدُ لِلَّهِ', 'سُبْحَانَ اللَّهِ', 'أَسْتَغْفِرُ اللَّهَ'],
      correct: 0,
      note: 'قال ﷺ: (يا غلام سمّ الله وكل بيمينك وكل مما يليك).'
    },
    {
      emoji: '💖',
      question: 'من هما أحق الناس بحسن صحبتنا وبرنا ورعايتنا؟',
      answers: ['الوالدان (الأب والأم)', 'الأصدقاء فقط', 'الجيران فقط', 'المعلمون فقط'],
      correct: 0,
      note: 'بر الوالدين من أعظم القربات التي يحبها الله تعالى ورسوله.'
    },
    {
      emoji: '🤲',
      question: 'ماذا يقول المسلم إذا عطس وحمد الله؟',
      answers: ['الْحَمْدُ لِلَّهِ', 'يَرْحَمُكَ اللَّهُ', 'شُكْراً جَزِيلاً', 'أَهْلاً وَسَهْلاً'],
      correct: 0,
      note: 'يقول العاطس: الحمد لله، ويقول له أخوه: يرحمك الله.'
    }
  ]
  let muslimQuizIdx = 0
  let muslimQuizScore = 0

  function initMuslimQuiz() {
    loadMuslimQuestion()
  }

  function loadMuslimQuestion() {
    const target = MUSLIM_QUESTIONS[muslimQuizIdx]
    const emojiHead = document.getElementById('muslimQuestionEmoji')
    const textEl = document.getElementById('muslimQuestionText')
    const matrix = document.getElementById('muslimAnswersMatrix')
    const progEl = document.getElementById('muslimQuizProgress')
    const feedback = document.getElementById('muslimQuizFeedback')

    if (emojiHead) emojiHead.textContent = target.emoji
    if (textEl) textEl.textContent = target.question
    if (progEl) progEl.textContent = `السؤال ${muslimQuizIdx + 1} من ${MUSLIM_QUESTIONS.length}`
    if (feedback) feedback.textContent = ''
    if (!matrix) return

    matrix.innerHTML = ''
    target.answers.forEach((ans, idx) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'muslim-ans-tile'
      btn.textContent = ans
      btn.addEventListener('click', () => {
        if (idx === target.correct) {
          sfx.correct()
          btn.classList.add('correct')
          muslimQuizScore += 10
          const sEl = document.getElementById('muslimQuizScore')
          if (sEl) sEl.textContent = muslimQuizScore
          feedback.textContent = `إجابة صحيحة ومباركة! ✨ (${target.note})`
          feedback.className = 'exercise-feedback success'
          progress.addStars(2, false)
          speech.speak('إجابة صحيحة، ما شاء الله!')
          setTimeout(() => {
            muslimQuizIdx = (muslimQuizIdx + 1) % MUSLIM_QUESTIONS.length
            loadMuslimQuestion()
          }, 1800)
        } else {
          sfx.wrong()
          btn.classList.add('wrong')
          feedback.textContent = 'فكر ثانية يا بطل، اقرأ السؤال بتأمل'
          feedback.className = 'exercise-feedback error'
        }
      })
      matrix.appendChild(btn)
    })
  }

  // ─── TAB: PROPHETS STORIES AUDIO & INTERACTION ───
  const PROPHET_STORIES_DATA = {
    adam: { title: 'قصة أبينا آدم عليه السلام', speech: 'قصة أبينا آدم عليه السلام. خلق الله تعالى أبانا آدم من طين ونفخ فيه من روحه، وعلمه الأسماء كلها، وأسكنه الجنة مكرمًا. وعندما ندم على الأكل من الشجرة تاب الله عليه وجعله أول الأنبياء ليعمر الأرض بالإيمان والعمل الصالح. الدرس المستفاد: العلم يرفع مكانة الإنسان، والمسارعة إلى التوبة والاستغفار تفتح أبواب رحمة الله.' },
    nuh: { title: 'قصة سيدنا نوح والسفينة عليه السلام', speech: 'قصة سيدنا نوح والسفينة عليه السلام. دعا نوح قومه مئات السنين بالصبر والرفق، وصنع سفينة عظيمة في الصحراء بوحي من الله، وحمل فيها المؤمنين ومن كل صنف زوجين اثنين فنجاهم الله برحمته. الدرس المستفاد: الصبر في دعوة الخير والتوكل على الله في الشدائد.' },
    ibrahim: { title: 'قصة سيدنا إبراهيم خليل الله عليه السلام', speech: 'قصة سيدنا إبراهيم خليل الله عليه السلام. تفكر في خلق السماوات والأرض، وحطم الأصنام بالحجة والبرهان. وعندما ألقي في النار قال: حسبنا الله ونعم الوكيل، فجعلها الله بردًا وسلامًا. وبنى الكعبة المشرفة مع ابنه إسماعيل. الدرس المستفاد: إعمال العقل والشجاعة في قول الحق.' },
    yusuf: { title: 'قصة سيدنا يوسف الصديق عليه السلام', speech: 'قصة سيدنا يوسف الصديق عليه السلام. رأى في صغره أحد عشر كوكبًا والشمس والقمر له ساجدين. صبر على غيابة الجب والسجن ظلمًا حتى مكنه الله في خزائن مصر، وعفا عن إخوته وقال: لا تثريب عليكم اليوم يغفر الله لكم. الدرس المستفاد: الصبر مفتاح الفرج والعفو عند المقدرة.' },
    yunus: { title: 'قصة سيدنا يونس ذي النون عليه السلام', speech: 'قصة سيدنا يونس ذي النون عليه السلام. التقمه الحوت العظيم في ظلمات البحر، فنادى ربه خاشعًا: لا إله إلا أنت سبحانك إني كنت من الظالمين، فاستجاب الله له ونجاه من الكرب وأعاده لقومه. الدرس المستفاد: التسبيح والاستغفار يفرجان أصعب الشدائد.' },
    muhammad: { title: 'قصة خاتم الأنبياء محمد ﷺ', speech: 'قصة خاتم الأنبياء والمرسلين محمد صلى الله عليه وسلم. ولد يتيمًا وعرف بالصادق الأمين، وأنزل الله عليه القرآن الكريم في غار حراء. كان أرحم الناس بالصغار والضعفاء والحيوانات ونشر رسالة النور والهدى للعالمين. الدرس المستفاد: الصدق والأمانة والرحمة بالخلق والاقتداء بسنته الشريفة.' }
  }

  function initProphetsStories() {
    document.querySelectorAll('.story-listen-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        const id = btn.getAttribute('data-story-id')
        const st = PROPHET_STORIES_DATA[id]
        if (st) {
          speech.speak(st.speech)
          progress.addStars(2, false)
        }
      })
    })
  }

  // ─── TAB: HADITH & PROPHETIC MORALS ───
  const HADITHS_DATA = {
    1: 'قال رسول الله صلى الله عليه وسلم: تبسمك في وجه أخيك لك صدقة. رواه الترمذي. معناه: الابتسامة الطيبة صدقة تدخل الفرح على الناس ويكتب الله لك بها أجرًا عظيمًا.',
    2: 'قال رسول الله صلى الله عليه وسلم: إماطة الأذى عن الطريق صدقة. متفق عليه. معناه: إبعاد الحجارة أو النفايات عن طريق الناس خلق إسلامي عظيم يحمي الجميع وينال فاعله محبة الله.',
    3: 'قال رسول الله صلى الله عليه وسلم: لا تغضب. رواه البخاري. معناه: الشجاع الحقيقي هو من يملك نفسه عند الغضب، وإذا غضبت فاستعذ بالله وتوضأ بهدوء.',
    4: 'قال رسول الله صلى الله عليه وسلم: المسلم من سلم المسلمون من لسانه ويده. متفق عليه. معناه: المسلم الصادق لا يؤذي أحدًا بكلام سيئ ولا يمد يده بضرب بل ينشر الأمان والمحبة.',
    5: 'قال رسول الله صلى الله عليه وسلم: أحب الأعمال إلى الله تعالى أدومها وإن قل. صحيح مسلم. معناه: القليل الدائم خير من الكثير المنقطع، استمر في قراءة صفحة قرآن وتعلم حرف كل يوم.',
    6: 'قال رسول الله صلى الله عليه وسلم: يا غلام، سمّ الله، وكل بيمينك، وكل مما يليك. متفق عليه. آداب الطعام النبوية: التسمية في أوله، الأكل باليمين، والأكل من القريب.'
  }

  function initHadithSection() {
    document.querySelectorAll('.hadith-listen-action-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        const id = btn.getAttribute('data-hadith-id')
        const txt = HADITHS_DATA[id]
        if (txt) {
          speech.speak(txt)
          progress.addStars(2, false)
        }
      })
    })
  }

  // ─── TAB: SCIENCE & LITTLE EXPLORER ───
  const SCIENCE_DATA = {
    rain: 'كيف يتكون المطر والغيث؟ تسخن حرارة الشمس مياه البحار والأنهار فيتبخر الماء ويصعد إلى السماء. وفي طبقات الجو العليا الباردة يتكثف في سحب بيضاء، وعندما تثقل القطرات تسقط مطرًا عذبًا يسقي الأرض والنبات.',
    stars: 'لماذا تتلألأ النجوم في السماء ليلاً؟ النجوم هي كرات غازية عملاقة شديدة الحرارة والضخامة تشبه شمسنا! لكنها تبعد عنا مسافات شاسعة بملايين السنين، فيصلنا وميضها كأنه نقاط فضية تزين السماء ونهتدي بها.',
    honey: 'عالم النحل وصناعة العسل. أوحى الله إلى النحل أن يتخذ من الجبال بيوتًا سداسية هندسية متقنة تحفظ أكبر قدر من العسل. تطير النحلة لتمتص رحيق آلاف الزهور وتخرج عسلًا شهيًا فيه شفاء للناس.',
    sleep: 'لماذا نحتاج إلى النوم المبكر؟ أثناء نومك يفرز جسمك هرمونات النمو لتصبح أطول وأقوى، ويقوم عقلك بترتيب كل ما تعلمته خلال النهار وحفظه في الذاكرة الدائمة وتجديد نشاط خلاياك.',
    earth: 'تعاقب الليل والنهار. يدور كوكب الأرض حول نفسه دورة كاملة كل أربع وعشرين ساعة. عندما يكون نصف الأرض مواجهًا للشمس يكون نهارًا، بينما يكون النصف الآخر ليلاً للنوم والراحة في نظام بديع.',
    rainbow: 'كيف يتكون قوس قزح؟ ضوء الشمس يتكون من سبعة ألوان بديعة. عندما تسطع الشمس بعد المطر تمر أشعتها عبر قطرات الماء العالقة فتنكسر وتتفصل إلى ألوانها السبعة الساحرة.'
  }

  function initScienceSection() {
    document.querySelectorAll('.science-listen-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        const id = btn.getAttribute('data-science-id')
        const txt = SCIENCE_DATA[id]
        if (txt) {
          speech.speak(txt)
          progress.addStars(2, false)
        }
      })
    })
  }

  // ─── GAME 8: SPACE EXPLORER ───
  const SPACE_QUESTIONS = [
    {
      emoji: '🪐',
      question: 'أي كوكب في مجموعتنا الشمسية يلقب بـ (الكوكب الأحمر)؟',
      choices: ['كوكب المريخ', 'كوكب المشترى', 'كوكب عطارد', 'كوكب الزهرة'],
      correct: 0,
      speech: 'كوكب المريخ هو الكوكب الأحمر لاحتواء تربته على أكاسيد الحديد.'
    },
    {
      emoji: '🌍',
      question: 'ما هو الكوكب المائي الجميل الذي نعيش عليه؟',
      choices: ['كوكب الأرض', 'كوكب زحل', 'كوكب أورانوس', 'كوكب نبتون'],
      correct: 0,
      speech: 'كوكب الأرض هو كوكب الحياة الذي هيأه الله لنا بالماء والهواء.'
    },
    {
      emoji: '☀️',
      question: 'ما هو النجم العملاق الذي يضيء مجموعتنا الشمسية ويمدنا بالدفء؟',
      choices: ['الشمس', 'القمر', 'النجم القطبي', 'شهاب الفضاء'],
      correct: 0,
      speech: 'الشمس هي النجم الأقرب والأكبر الذي يمنح كوكبنا الضوء والحرارة.'
    },
    {
      emoji: '🌙',
      question: 'ما هو التابع الطبيعي الصغير الذي يدور حول الأرض وينير لنا الليل؟',
      choices: ['القمر', 'المريخ', 'المشترى', 'الزهرة'],
      correct: 0,
      speech: 'القمر هو تابع الأرض الذي يتغير شكله من هلال إلى بدر منير.'
    },
    {
      emoji: '🪐',
      question: 'ما هو الكوكب المشهور بحلقاته الجليدية الذهبية البديعة حوله؟',
      choices: ['كوكب زحل', 'كوكب عطارد', 'كوكب الأرض', 'كوكب المريخ'],
      correct: 0,
      speech: 'كوكب زحل يتميز بأجمل حلقات فلكية تدور حوله في منظر ساحر.'
    },
    {
      emoji: '🚀',
      question: 'ما هو الكائن الذي يحلق به العلماء للوصول إلى محطة الفضاء الدولية؟',
      choices: ['الصاروخ الفضائي', 'السيارة', 'القطار السريع', 'المنطاد'],
      correct: 0,
      speech: 'الصاروخ الفضائي ينطلق بقوة دفع هائلة ليخترق الغلاف الجوي.'
    }
  ]
  let spaceRoundIdx = 0
  let spaceScore = 0

  function initSpaceGame() {
    loadSpaceQuestion()
  }

  function loadSpaceQuestion() {
    const q = SPACE_QUESTIONS[spaceRoundIdx]
    const emojiEl = document.getElementById('spacePlanetEmoji')
    const textEl = document.getElementById('spaceQuestionText')
    const grid = document.getElementById('spaceChoicesGrid')
    const roundEl = document.getElementById('spaceGameRound')
    const scoreEl = document.getElementById('spaceGameScore')
    const feedback = document.getElementById('spaceFeedback')

    if (emojiEl) emojiEl.textContent = q.emoji
    if (textEl) textEl.textContent = q.question
    if (roundEl) roundEl.textContent = `المحطة ${spaceRoundIdx + 1} من ${SPACE_QUESTIONS.length}`
    if (scoreEl) scoreEl.textContent = spaceScore
    if (feedback) feedback.textContent = ''
    if (!grid) return

    grid.innerHTML = ''
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'space-choice-btn'
      btn.textContent = choice
      btn.addEventListener('click', () => {
        if (idx === q.correct) {
          btn.classList.add('correct')
          sfx.correct()
          spaceScore += 15
          if (scoreEl) scoreEl.textContent = spaceScore
          feedback.textContent = `إجابة عبقرية يا رائد الفضاء! 🚀 ${q.speech}`
          feedback.className = 'exercise-feedback success'
          progress.addStars(3, false)
          speech.speak('إجابة عبقرية! ' + choice)
          setTimeout(() => {
            spaceRoundIdx = (spaceRoundIdx + 1) % SPACE_QUESTIONS.length
            loadSpaceQuestion()
          }, 2000)
        } else {
          btn.classList.add('wrong')
          sfx.wrong()
          feedback.textContent = 'حاول ثانية يا بطل الفضاء!'
          feedback.className = 'exercise-feedback error'
        }
      })
      grid.appendChild(btn)
    })
  }

  // ─── GAME 9: ANIMAL RIDDLES (من أنا؟) ───
  const ANIMAL_RIDDLES = [
    {
      clue: 'أنا سفينة الصحراء، أتحمل العطش وأمشي على الرمال برفق وذكرني القرآن الكريم، فمن أنا؟',
      options: [
        { name: 'جَمَل', emoji: '🐪', correct: true },
        { name: 'أَسَد', emoji: '🦁', correct: false },
        { name: 'قِرْد', emoji: '🐒', correct: false },
        { name: 'أَرْنَب', emoji: '🐰', correct: false }
      ]
    },
    {
      clue: 'أنا ملك الغابة القوي، أملك زئيراً يهز المكان وشعراً كثيفاً حول عنقي، فمن أنا؟',
      options: [
        { name: 'أَسَد', emoji: '🦁', correct: true },
        { name: 'فِيل', emoji: '🐘', correct: false },
        { name: 'زَرَافَة', emoji: '🦒', correct: false },
        { name: 'حِصَان', emoji: '🐎', correct: false }
      ]
    },
    {
      clue: 'أنا أضخم كائن على اليابسة، أملك خرطوماً طويلاً وأذنين كبيرتين، فمن أنا؟',
      options: [
        { name: 'فِيل', emoji: '🐘', correct: true },
        { name: 'جَمَل', emoji: '🐪', correct: false },
        { name: 'نَمِر', emoji: '🐯', correct: false },
        { name: 'ذِئْب', emoji: '🐺', correct: false }
      ]
    },
    {
      clue: 'أنا طائر جارح حاد البصر، أحلق في أعالي السماء رمزاً للشجاعة والقوة، فمن أنا؟',
      options: [
        { name: 'صَقْر', emoji: '🦅', correct: true },
        { name: 'حَمَامَة', emoji: '🕊️', correct: false },
        { name: 'بَطَّة', emoji: '🦆', correct: false },
        { name: 'عُصْفُور', emoji: '🐦', correct: false }
      ]
    },
    {
      clue: 'أنا حشرة نشيطة، أطير بين الزهور وأصنع لكم العسل اللذيذ المبارك، فمن أنا؟',
      options: [
        { name: 'نَحْلَة', emoji: '🐝', correct: true },
        { name: 'فَرَاشَة', emoji: '🦋', correct: false },
        { name: 'نَمْلَة', emoji: '🐜', correct: false },
        { name: 'دُعْسُوقَة', emoji: '🐞', correct: false }
      ]
    }
  ]
  let riddleIdx = 0
  let riddleScore = 0

  function initAnimalRiddles() {
    const listenBtn = document.getElementById('btnListenRiddle')
    const nextBtn = document.getElementById('btnNextRiddle')

    if (listenBtn) {
      listenBtn.addEventListener('click', () => {
        speech.speak(ANIMAL_RIDDLES[riddleIdx].clue)
      })
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sfx.tap()
        riddleIdx = (riddleIdx + 1) % ANIMAL_RIDDLES.length
        loadRiddle()
      })
    }
    loadRiddle()
  }

  function loadRiddle() {
    const r = ANIMAL_RIDDLES[riddleIdx]
    const clueEl = document.getElementById('riddleClueText')
    const grid = document.getElementById('riddleChoicesGrid')
    const scoreEl = document.getElementById('riddlesScore')
    const feedback = document.getElementById('riddleFeedback')

    if (clueEl) clueEl.textContent = r.clue
    if (scoreEl) scoreEl.textContent = riddleScore
    if (feedback) feedback.textContent = ''
    if (!grid) return

    grid.innerHTML = ''
    r.options.forEach(opt => {
      const card = document.createElement('button')
      card.type = 'button'
      card.className = 'riddle-animal-tile'
      card.innerHTML = `<span class="r-emoji">${opt.emoji}</span><strong>${opt.name}</strong>`
      card.addEventListener('click', () => {
        if (opt.correct) {
          card.classList.add('correct')
          sfx.correct()
          riddleScore += 20
          if (scoreEl) scoreEl.textContent = riddleScore
          feedback.textContent = `أحسنت يا بطل! أنا ${opt.name} ${opt.emoji}!`
          feedback.className = 'exercise-feedback success'
          progress.addStars(2, false)
          speech.speak(`إجابة ممتازة! أنا ${opt.name}`)
          setTimeout(() => {
            riddleIdx = (riddleIdx + 1) % ANIMAL_RIDDLES.length
            loadRiddle()
          }, 1800)
        } else {
          card.classList.add('wrong')
          sfx.wrong()
          feedback.textContent = 'لستُ أنا، فكر مرة ثانية!'
          feedback.className = 'exercise-feedback error'
        }
      })
      grid.appendChild(card)
    })
  }

  // ─── GAME 10: HEALTHY FOOD SORTER ───
  const FOOD_ITEMS = [
    { name: 'تُفَّاح طازج 🍎', hint: 'غني بالألياف والفيتامينات ويحمي الأسنان', healthy: true },
    { name: 'مشروب غازي سكري 🥤', hint: 'يحتوي على سكريات ضارة تضر بالأسنان والمعدة', healthy: false },
    { name: 'حليب كامل الدسم 🥛', hint: 'غني بالكالسيوم لبناء عظام وأسنان قوية', healthy: true },
    { name: 'حلوى ملوثة وملونة 🍭', hint: 'تسبب تسوس الأسنان ولا تفيد الجسم', healthy: false },
    { name: 'سمك مشوي غني بالأوميغا 🐟', hint: 'يقوي الذاكرة والذكاء وصحة القلب', healthy: true },
    { name: 'بطاطس مقلية ممتلئة بالزيوت 🍟', hint: 'دهون غير صحية تثقل المعدة وتسبب الكسل', healthy: false },
    { name: 'جزر مقرمش لذيذ 🥕', hint: 'يقوي النظر ويمد الجسم بفيتامين أ', healthy: true },
    { name: 'دونات مغطاة بالشوكولاتة 🍩', hint: 'سكريات مفرطة تسبب الخمول وزيادة الوزن', healthy: false },
    { name: 'ماء نقي عذب 💧', hint: 'سر الحياة ينظف الجسم ويرطب الخلايا', healthy: true },
    { name: 'بروكلي وخضار طازجة 🥦', hint: 'مضادات أكسدة ومعادن تحمي مناعتنا', healthy: true }
  ]
  let foodIdx = 0
  let foodScore = 0

  function initHealthyFoodGame() {
    const btnHealthy = document.getElementById('btnChooseHealthy')
    const btnJunk = document.getElementById('btnChooseJunk')

    if (btnHealthy) {
      btnHealthy.addEventListener('click', () => checkFoodDecision(true))
    }
    if (btnJunk) {
      btnJunk.addEventListener('click', () => checkFoodDecision(false))
    }
    loadFoodItem()
  }

  function loadFoodItem() {
    const item = FOOD_ITEMS[foodIdx]
    const emojiEl = document.getElementById('foodItemEmoji')
    const nameEl = document.getElementById('foodItemName')
    const hintEl = document.getElementById('foodItemHint')
    const progEl = document.getElementById('foodRoundIndicator')
    const scoreEl = document.getElementById('foodScore')
    const feedback = document.getElementById('foodFeedback')

    if (emojiEl) emojiEl.textContent = item.name.split(' ').pop() || '🍎'
    if (nameEl) nameEl.textContent = item.name
    if (hintEl) hintEl.textContent = item.hint
    if (progEl) progEl.textContent = `العنصر ${foodIdx + 1} من ${FOOD_ITEMS.length}`
    if (scoreEl) scoreEl.textContent = foodScore
    if (feedback) feedback.textContent = ''
  }

  function checkFoodDecision(choseHealthy) {
    const item = FOOD_ITEMS[foodIdx]
    const feedback = document.getElementById('foodFeedback')
    const scoreEl = document.getElementById('foodScore')

    if (choseHealthy === item.healthy) {
      sfx.correct()
      foodScore += 10
      if (scoreEl) scoreEl.textContent = foodScore
      feedback.textContent = choseHealthy ? 'قرار رائع! هذا طعام صحي يبني جسم البطل! 💚' : 'أحسنت! هذا طعام ضار يجب الابتعاد عنه! 👍'
      feedback.className = 'exercise-feedback success'
      progress.addStars(2, false)
      setTimeout(() => {
        foodIdx = (foodIdx + 1) % FOOD_ITEMS.length
        loadFoodItem()
      }, 1500)
    } else {
      sfx.wrong()
      feedback.textContent = item.healthy ? 'بل هذا طعام صحي ومفيد جداً لجسمك!' : 'انتبه، هذا طعام غير صحي وضار بالصحة!'
      feedback.className = 'exercise-feedback error'
    }
  }

  // ─── GAME 11: CLOCK & TIME CHALLENGE ───
  const CLOCK_PUZZLES = [
    {
      digital: '03:00',
      hint: '🕌 موعد صلاة العصر في المسجد',
      options: ['الساعة الثالثة تماماً', 'الساعة الثانية والنصف', 'الساعة الرابعة تماماً', 'الساعة الواحدة والنصف'],
      correct: 0
    },
    {
      digital: '04:30',
      hint: '🌙 أذان صلاة الفجر المباركة',
      options: ['الساعة الرابعة والنصف فجراً', 'الساعة الخامسة تماماً', 'الساعة الثالثة والنصف', 'الساعة السادسة صباحاً'],
      correct: 0
    },
    {
      digital: '12:00',
      hint: '☀️ وقت صلاة الظهر واعتدال الشمس',
      options: ['الساعة الثانية عشرة ظهراً', 'الساعة الحادية عشرة', 'الساعة العاشرة والنصف', 'الساعة الواحدة ظهراً'],
      correct: 0
    },
    {
      digital: '06:00',
      hint: '🌅 الاستيقاظ بنشاط لمدرسة الغد',
      options: ['الساعة السادسة صباحاً', 'الساعة السابعة صباحاً', 'الساعة الثامنة صباحاً', 'الساعة الخامسة تماماً'],
      correct: 0
    },
    {
      digital: '08:30',
      hint: '😴 وقت النوم المبكر للأبطال الصغار',
      options: ['الساعة الثامنة والنصف مساءً', 'الساعة التاسعة تماماً', 'الساعة السابعة والنصف', 'الساعة العاشرة تماماً'],
      correct: 0
    }
  ]
  let clockIdx = 0
  let clockScore = 0

  function initClockGame() {
    const nextBtn = document.getElementById('btnNextClock')
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sfx.tap()
        clockIdx = (clockIdx + 1) % CLOCK_PUZZLES.length
        loadClockPuzzle()
      })
    }
    loadClockPuzzle()
  }

  function loadClockPuzzle() {
    const p = CLOCK_PUZZLES[clockIdx]
    const textEl = document.getElementById('digitalClockText')
    const hintEl = document.getElementById('clockPrayerHint')
    const grid = document.getElementById('clockChoicesGrid')
    const scoreEl = document.getElementById('clockGameScore')
    const feedback = document.getElementById('clockFeedback')

    if (textEl) textEl.textContent = p.digital
    if (hintEl) hintEl.textContent = p.hint
    if (scoreEl) scoreEl.textContent = clockScore
    if (feedback) feedback.textContent = ''
    if (!grid) return

    grid.innerHTML = ''
    p.options.forEach((opt, idx) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'clock-choice-btn'
      btn.textContent = opt
      btn.addEventListener('click', () => {
        if (idx === p.correct) {
          btn.classList.add('correct')
          sfx.correct()
          clockScore += 15
          if (scoreEl) scoreEl.textContent = clockScore
          feedback.textContent = `ممتاز يا ذكي الوقت! ${opt} (${p.digital})!`
          feedback.className = 'exercise-feedback success'
          progress.addStars(2, false)
          speech.speak('صحيح، ' + opt)
          setTimeout(() => {
            clockIdx = (clockIdx + 1) % CLOCK_PUZZLES.length
            loadClockPuzzle()
          }, 1800)
        } else {
          btn.classList.add('wrong')
          sfx.wrong()
          feedback.textContent = 'تأمل الأرقام جيداً وحاول ثانية!'
          feedback.className = 'exercise-feedback error'
        }
      })
      grid.appendChild(btn)
    })
  }

  // ─── GAME 12: ISLAMIC LANDMARKS EXPLORER ───
  const LANDMARKS_DATA = [
    {
      emoji: '🕋',
      title: 'الكعبة المشرفة والمسجد الحرام',
      desc: 'قبلة المسلمين في كل صلاة ويطوف حولها ملايين الحجاج، في أي مدينة مباركة تقع؟',
      options: ['مكة المكرمة بالمملكة العربية السعودية', 'المدينة المنورة', 'القدس الشريف', 'القاهرة المعز'],
      correct: 0
    },
    {
      emoji: '🕌',
      title: 'المسجد النبوي الشريف وقبة رسول الله ﷺ الخضراء',
      desc: 'ثاني أقدس المساجد وفيه روضة شريفة وقبر الحبيب المصطفى ﷺ، أين يقع؟',
      options: ['المدينة المنورة', 'مكة المكرمة', 'دمشق', 'بغداد'],
      correct: 0
    },
    {
      emoji: '🕌',
      title: 'المسجد الأقصى المبارك وقبة الصخرة المشرفة',
      desc: 'أولى القبلتين وثالث الحرمين الشريفين ومسرى نبينا محمد ﷺ، في أي مدينة مباركة يقع؟',
      options: ['مدينة القدس الشريف في فلسطين', 'عمان بالأردن', 'بيروت بلبنان', 'تونس الخضراء'],
      correct: 0
    },
    {
      emoji: '🇪🇬',
      title: 'نهر النيل العذب والأهرامات الشامخة وجامع الأزهر',
      desc: 'أطول أنهار العالم ومنارة العلم في الأزهر الشريف، في أي بلد عريق تقع هذه المعالم؟',
      options: ['جمهورية مصر العربية', 'السودان الشقيق', 'المملكة المغربية', 'الجمهورية الجزائرية'],
      correct: 0
    },
    {
      emoji: '⛰️',
      title: 'جبل أُحُد الذي قال عنه النبي ﷺ: جبل يحبنا ونحبه',
      desc: 'جبل عظيم شهد بطولة الصحابة رضوان الله عليهم في غزوة أحد، أين يقع؟',
      options: ['شمال المدينة المنورة', 'شرق مكة المكرمة', 'في بلاد الشام', 'في صحراء سيناء'],
      correct: 0
    }
  ]
  let landmarkIdx = 0
  let landmarkScore = 0

  function initLandmarksGame() {
    loadLandmarkQuestion()
  }

  function loadLandmarkQuestion() {
    const l = LANDMARKS_DATA[landmarkIdx]
    const emojiEl = document.getElementById('landmarkEmoji')
    const titleEl = document.getElementById('landmarkTitle')
    const descEl = document.getElementById('landmarkDescription')
    const grid = document.getElementById('landmarkChoicesGrid')
    const progEl = document.getElementById('landmarkRound')
    const scoreEl = document.getElementById('landmarkScore')
    const feedback = document.getElementById('landmarkFeedback')

    if (emojiEl) emojiEl.textContent = l.emoji
    if (titleEl) titleEl.textContent = l.title
    if (descEl) descEl.textContent = l.desc
    if (progEl) progEl.textContent = `المعلم ${landmarkIdx + 1} من ${LANDMARKS_DATA.length}`
    if (scoreEl) scoreEl.textContent = landmarkScore
    if (feedback) feedback.textContent = ''
    if (!grid) return

    grid.innerHTML = ''
    l.options.forEach((opt, idx) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'landmark-choice-btn'
      btn.textContent = opt
      btn.addEventListener('click', () => {
        if (idx === l.correct) {
          btn.classList.add('correct')
          sfx.correct()
          landmarkScore += 20
          if (scoreEl) scoreEl.textContent = landmarkScore
          feedback.textContent = `ما شاء الله يا باحث الجغرافيا! إجابة صحيحة: ${opt}! 🌟`
          feedback.className = 'exercise-feedback success'
          progress.addStars(3, false)
          speech.speak('إجابة صحيحة مباركة! ' + opt)
          setTimeout(() => {
            landmarkIdx = (landmarkIdx + 1) % LANDMARKS_DATA.length
            loadLandmarkQuestion()
          }, 2000)
        } else {
          btn.classList.add('wrong')
          sfx.wrong()
          feedback.textContent = 'فكر في الموقع التاريخي والمعلم الجغرافي وحاول مجدداً!'
          feedback.className = 'exercise-feedback error'
        }
      })
      grid.appendChild(btn)
    })
  }

  // ─── TAB 7: OFFICIAL CERTIFICATE MODAL & IMAGE GENERATION ───
  function initCertificate() {
    const openBtn = document.getElementById('btnOpenCertModal')
    const closeBtn = document.getElementById('closeCertModalBtn')
    const closeBg = document.getElementById('closeCertModalBg')
    const cancelBtn = document.getElementById('btnCancelCert')
    const modal = document.getElementById('kidsCertModal')
    const downloadBtn = document.getElementById('btnDownloadCertImage')
    const shareBtn = document.getElementById('btnShareCertImage')
    const datePrint = document.getElementById('certDatePrintVal')
    const starsPrint = document.getElementById('certStarsPrintVal')
    const nameInput = document.getElementById('certChildNameInput')
    const namePreview = document.getElementById('certChildNamePreview')
    const canvas = document.getElementById('kidsCertCanvas')

    // التاريخ الحالي المنسق باللغة العربية
    const todayFormatted = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    if (datePrint) {
      datePrint.textContent = todayFormatted
    }

    // استرجاع اسم البطل المحفوظ مسبقاً إن وجد
    const savedHeroName = (localStorage.getItem('kids_hero_name') || '').trim()
    if (nameInput) {
      if (savedHeroName) {
        nameInput.value = savedHeroName
        if (namePreview) namePreview.textContent = savedHeroName
      }

      nameInput.addEventListener('input', () => {
        const val = nameInput.value.trim()
        if (namePreview) {
          namePreview.textContent = val || 'البطل المتميز'
        }
        try {
          if (val) localStorage.setItem('kids_hero_name', val)
        } catch (_) {}
      })
    }

    function openModal() {
      sfx.star()
      if (modal) modal.style.display = 'flex'
      launchTastefulConfetti(45)

      // تحديث رصيد النقاط المعروض في الشهادة
      const totalStars = (progress && progress.data && progress.data.totalStars) ? progress.data.totalStars : 120
      if (starsPrint) {
        starsPrint.textContent = totalStars + ' نقطة تميز ⭐'
      }

      // توجيه مؤشر الكتابة إلى حقل الاسم ليدخل الطفل اسمه مباشرة
      setTimeout(() => {
        if (nameInput) {
          nameInput.focus()
          if (!nameInput.value) {
            nameInput.placeholder = 'اكتب اسمك هنا يا بطل ليظهر في الشهادة...'
          } else {
            nameInput.select()
          }
        }
      }, 150)
    }

    function closeModal() {
      if (modal) modal.style.display = 'none'
    }

    if (openBtn) openBtn.addEventListener('click', openModal)
    if (closeBtn) closeBtn.addEventListener('click', closeModal)
    if (closeBg) closeBg.addEventListener('click', closeModal)
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal)

    // دالة رسم الشهادة الاحترافية على الكانفاس بدقة فائقة (Ultra-HD 1920x1357)
    function drawCertificateCanvas(childName, totalStars, dateStr) {
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const W = 1920
      const H = 1357

      canvas.width = W
      canvas.height = H
      ctx.clearRect(0, 0, W, H)

      // 1. تدرج الخلفية الفاخر بلون ورق البردي العاجي
      const bgGrad = ctx.createLinearGradient(0, 0, W, H)
      bgGrad.addColorStop(0, '#ffffff')
      bgGrad.addColorStop(0.3, '#fffdf7')
      bgGrad.addColorStop(0.7, '#fefbf2')
      bgGrad.addColorStop(1, '#fcf5e5')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, W, H)

      // 2. نقوش وزخارف خلفية إسلامية رقيقة
      ctx.save()
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)'
      ctx.lineWidth = 1
      for (let x = 70; x < W; x += 80) {
        for (let y = 70; y < H; y += 80) {
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
      ctx.restore()

      // 3. الإطارات الملكية المذهبة
      ctx.save()
      // الإطار الخارجي المذهب المزدوج
      ctx.strokeStyle = '#d4af37'
      ctx.lineWidth = 12
      ctx.strokeRect(36, 36, W - 72, H - 72)

      ctx.strokeStyle = '#b8860b'
      ctx.lineWidth = 3
      ctx.strokeRect(50, 50, W - 100, H - 100)

      // الإطار الزمردي الأنيق
      ctx.strokeStyle = '#0c4a3f'
      ctx.lineWidth = 5
      ctx.strokeRect(66, 66, W - 132, H - 132)

      // الإطار الداخلي الخفيف
      ctx.strokeStyle = '#d4af37'
      ctx.lineWidth = 2
      ctx.strokeRect(78, 78, W - 156, H - 156)

      // زوايا الزخرفة الإسلامية (Corner Medallions)
      function drawCornerMedallion(cx, cy, angle) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(angle)
        ctx.fillStyle = '#d4af37'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(50, 0)
        ctx.lineTo(0, 50)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = '#0c4a3f'
        ctx.beginPath()
        ctx.arc(18, 18, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      drawCornerMedallion(78, 78, 0)
      drawCornerMedallion(W - 78, 78, Math.PI / 2)
      drawCornerMedallion(W - 78, H - 78, Math.PI)
      drawCornerMedallion(78, H - 78, -Math.PI / 2)
      ctx.restore()

      // 4. رأس الشهادة والتاج
      ctx.save()
      ctx.textAlign = 'center'
      ctx.font = '56px "Segoe UI Emoji", Apple Color Emoji, sans-serif'
      ctx.fillText('🌟 👑 🌟', W / 2, 175)

      // اسم المؤسسة
      ctx.fillStyle = '#0c4a3f'
      ctx.font = 'bold 46px "Aref Ruqaa", "Amiri", "Tajawal", serif'
      ctx.fillText('مؤسسة الدكتور عمر هشام الخيرية', W / 2, 250)

      ctx.fillStyle = '#64748b'
      ctx.font = '600 24px "Tajawal", sans-serif'
      ctx.fillText('المشهرة برقم 3115 لسنة 2026 — واحة التعليم القرآني والتربوي للأطفال', W / 2, 296)

      // فاصل زخرفي ذهبي
      ctx.strokeStyle = '#d4af37'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(W / 2 - 420, 326)
      ctx.lineTo(W / 2 + 420, 326)
      ctx.stroke()
      ctx.restore()

      // 5. شريط عنوان الشهادة الملكي
      ctx.save()
      const ribbonW = 680
      const ribbonH = 80
      const ribbonX = (W - ribbonW) / 2
      const ribbonY = 356

      const ribGrad = ctx.createLinearGradient(ribbonX, ribbonY, ribbonX + ribbonW, ribbonY + ribbonH)
      ribGrad.addColorStop(0, '#f59e0b')
      ribGrad.addColorStop(0.5, '#d97706')
      ribGrad.addColorStop(1, '#b45309')
      ctx.fillStyle = ribGrad

      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(ribbonX, ribbonY, ribbonW, ribbonH, 40)
      } else {
        ctx.rect(ribbonX, ribbonY, ribbonW, ribbonH)
      }
      ctx.fill()

      ctx.strokeStyle = '#fef08a'
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.font = 'bold 38px "Tajawal", "Aref Ruqaa", sans-serif'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
      ctx.shadowBlur = 6
      ctx.fillText('★  شَهَادَةُ تَقْدِيرٍ وَتَفَوُّقٍ  ★', W / 2, ribbonY + 54)
      ctx.restore()

      // 6. عبارة التقديم
      ctx.save()
      ctx.textAlign = 'center'
      ctx.fillStyle = '#475569'
      ctx.font = '600 28px "Tajawal", sans-serif'
      ctx.fillText('تَشْهَدُ إِدَارَةُ الْمُؤَسَّسَةِ بِأَنَّ الْبَطَلَ الْمُتَمَيِّزَ / الْبَطَلَةَ الْمُتَمَيِّزَةَ:', W / 2, 505)

      // 7. اسم الطفل بخط عريض وفخم جداً
      const name = (childName && childName.trim()) ? childName.trim() : 'البطل المتميز'
      ctx.fillStyle = '#064e3b'
      ctx.shadowColor = 'rgba(212, 175, 55, 0.4)'
      ctx.shadowBlur = 10
      ctx.shadowOffsetY = 3
      ctx.font = 'bold 66px "Aref Ruqaa", "Amiri", "Tajawal", serif'
      ctx.fillText(name, W / 2, 615)
      ctx.shadowColor = 'transparent'

      // خط زخرفي تحت اسم الطفل مع نجوم
      const textMetrics = ctx.measureText(name)
      const underWidth = Math.max(380, textMetrics.width + 100)
      ctx.strokeStyle = '#d4af37'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(W / 2 - underWidth / 2, 646)
      ctx.lineTo(W / 2 + underWidth / 2, 646)
      ctx.stroke()

      ctx.fillStyle = '#d4af37'
      ctx.font = '24px sans-serif'
      ctx.fillText('◆', W / 2 - underWidth / 2 - 16, 654)
      ctx.fillText('◆', W / 2 + underWidth / 2 + 16, 654)

      // 8. نص التكريم المعتمد
      ctx.fillStyle = '#334155'
      ctx.font = '500 27px "Tajawal", sans-serif'
      ctx.fillText('قَدْ أَتَمَّ بِنَجَاحٍ وَإِتْقَانٍ حِفْظَ قِصَارِ السُّوَرِ بِمُصْحَفِ الْمِنْشَاوِي الْمُعَلِّمِ، وَأَتْقَنَ مَبَادِئَ الْقِرَاءَةِ', W / 2, 735)
      ctx.fillText('وَالْأَدْعِيَةِ الْمَأْثُورَةِ فِي وَاحَةِ أَطْفَالِ الْمُؤَسَّسَةِ، سَائِلِينَ اللَّهَ لَهُ مَزِيداً مِنَ التَّوْفِيقِ وَالسَّدَادِ.', W / 2, 785)

      // خط فاصل قبل التوقيعات
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(220, 850)
      ctx.lineTo(W - 220, 850)
      ctx.stroke()

      // 9. بيانات التوثيق والخاتم
      // اليمين: رصيد الإنجاز
      ctx.textAlign = 'center'
      ctx.fillStyle = '#64748b'
      ctx.font = '600 23px "Tajawal", sans-serif'
      ctx.fillText('الرصيد المنجز:', 420, 935)
      ctx.fillStyle = '#d97706'
      ctx.font = 'bold 34px "Tajawal", sans-serif'
      ctx.fillText(totalStars + ' نقطة تميز ⭐', 420, 988)

      // اليسار: تاريخ الإصدار
      ctx.fillStyle = '#64748b'
      ctx.font = '600 23px "Tajawal", sans-serif'
      ctx.fillText('تاريخ الإصدار والتكريم:', W - 420, 935)
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 29px "Tajawal", sans-serif'
      ctx.fillText(dateStr, W - 420, 988)

      // المنتصف: الختم الرسمي لمؤسسة د. عمر هشام
      ctx.save()
      ctx.translate(W / 2, 960)
      ctx.rotate(-0.09) // انحناء خفيف لمحاكاة الختم الحي
      ctx.strokeStyle = '#b91c1c'
      ctx.lineWidth = 5
      ctx.strokeRect(-135, -60, 270, 120)
      ctx.strokeStyle = '#dc2626'
      ctx.lineWidth = 1.5
      ctx.strokeRect(-126, -51, 252, 102)

      ctx.fillStyle = '#b91c1c'
      ctx.font = 'bold 23px "Tajawal", sans-serif'
      ctx.fillText('خاتم الاعتماد الرسمي', 0, -15)
      ctx.font = 'bold 20px "Tajawal", sans-serif'
      ctx.fillText('مؤسسة د. عمر هشام', 0, 18)
      ctx.font = '700 14px "Tajawal", sans-serif'
      ctx.fillText('★ معتمد رسميًا 2026 ★', 0, 39)
      ctx.restore()

      // شارة أسفل الشهادة
      ctx.fillStyle = '#94a3b8'
      ctx.font = '500 18px "Tajawal", sans-serif'
      ctx.fillText('وثيقة رسمية صادرة إلكترونياً عن واحة أطفال مؤسسة الدكتور عمر هشام الخيرية — جميع الحقوق محفوظة', W / 2, H - 100)
      ctx.restore()
    }

    // تنزيل الشهادة كصورة PNG مباشرة على الهاتف أو الكمبيوتر
    function downloadCertificateImage() {
      const heroName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'البطل المتميز'
      const totalStars = (progress && progress.data && progress.data.totalStars) ? progress.data.totalStars : 120

      drawCertificateCanvas(heroName, totalStars, todayFormatted)

      if (!canvas) return

      // إظهار تأثير حماسي
      sfx.celebrate()
      launchTastefulConfetti(70)

      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob((blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const safeName = heroName.replace(/[/\\?%*:|"<>]/g, '_')
          const a = document.createElement('a')
          a.download = `شهادة_تفوق_البطل_${safeName}.png`
          a.href = url
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          setTimeout(() => URL.revokeObjectURL(url), 4000)

          if (window.showToast) {
            window.showToast(`تم تحميل شهادة البطل (${heroName}) كصورة عالية الدقة بنجاح! 📸🌟`, 'success')
          }
        }, 'image/png')
      } else {
        const url = canvas.toDataURL('image/png')
        const safeName = heroName.replace(/[/\\?%*:|"<>]/g, '_')
        const a = document.createElement('a')
        a.download = `شهادة_تفوق_البطل_${safeName}.png`
        a.href = url
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        if (window.showToast) {
          window.showToast(`تم تحميل شهادة البطل (${heroName}) كصورة عالية الدقة بنجاح! 📸🌟`, 'success')
        }
      }
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', downloadCertificateImage)
    }

    // تفعيل المشاركة المباشرة إذا كانت مدعومة على الهاتف (Web Share API)
    if (shareBtn && typeof navigator.share === 'function') {
      shareBtn.style.display = 'inline-flex'
      shareBtn.addEventListener('click', () => {
        const heroName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'البطل المتميز'
        const totalStars = (progress && progress.data && progress.data.totalStars) ? progress.data.totalStars : 120

        drawCertificateCanvas(heroName, totalStars, todayFormatted)

        if (!canvas) return
        canvas.toBlob(async (blob) => {
          if (!blob) return
          const safeName = heroName.replace(/[/\\?%*:|"<>]/g, '_')
          const file = new File([blob], `شهادة_تفوق_${safeName}.png`, { type: 'image/png' })

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: `شهادة تفوق البطل ${heroName}`,
                text: `شهادة شرف وتفوق معتمدة من مؤسسة الدكتور عمر هشام الخيرية للبطل ${heroName} 🌟`,
                files: [file]
              })
            } catch (_) {}
          } else {
            downloadCertificateImage()
          }
        }, 'image/png')
      })
    }
  }

  // ─── TAB 8: PARENTS DASHBOARD & RESET ───
  function initParentDashboard() {
    const resetBtn = document.getElementById('btnResetChildProgress')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => progress.reset())
    }
  }

  // ─── Bootstrap on DOM Ready ───
  document.addEventListener('DOMContentLoaded', () => {
    initTabs()
    initLetters()
    initQuran()
    initProphetsStories()
    initHadithSection()
    initScienceSection()
    initNumbers()
    initDuas()
    initDrawing()
    initMemoryGame()
    initBalloonGame()
    initMathBlitz()
    initEmojiMatcher()
    initWordScramble()
    initMissingLetterGame()
    initMuslimQuiz()
    initSpaceGame()
    initAnimalRiddles()
    initHealthyFoodGame()
    initClockGame()
    initLandmarksGame()
    initCertificate()
    initParentDashboard()

    progress.updateUI()
  })

})()
