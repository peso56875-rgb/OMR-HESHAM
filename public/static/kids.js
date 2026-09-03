/**
 * واحة أطفال المؤسسة — Kids Learning Hub v2.0
 * Comprehensive Client-Side Interactive Engine
 * Al-Minshawi Teacher Recitation + Arabic Speech Synthesis + Canvas Tracer + Drawing Studio + Educational Games
 */

;(function () {
  'use strict'

  // ─── Web Audio Chimes & Sound Synthesizer (Reliable, Zero External Lag) ───
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
      this.voice = voices.find(v => v.lang && v.lang.startsWith('ar')) || null
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
        utterance.rate = 0.88
        utterance.pitch = 1.05
        if (onEnd) {
          utterance.onend = onEnd
        }
        this.synth.speak(utterance)
      } catch (e) {
        console.warn('Speech synthesis error:', e)
      }
    }
  }

  const speech = new KidsSpeech()

  // ─── Tasteful Confetti Particle Generator ───
  function launchTastefulConfetti(count = 45) {
    const container = document.getElementById('kidsConfettiOverlay')
    if (!container) return
    sfx.celebrate()
    container.innerHTML = ''
    const colors = ['#0c4a3f', '#168a70', '#d97706', '#2563eb', '#7c3aed', '#f59e0b']

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div')
      piece.className = 'confetti-piece'
      const startX = Math.random() * 100
      const endX = startX + (Math.random() * 30 - 15)
      const color = colors[Math.floor(Math.random() * colors.length)]
      const size = Math.random() * 9 + 6
      const duration = Math.random() * 1.8 + 1.6

      piece.style.cssText = `
        position: fixed;
        top: -15px;
        left: ${startX}vw;
        width: ${size}px;
        height: ${size * 0.7}px;
        background: ${color};
        opacity: 0.85;
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

  // ─── Progress & Achievements Manager ───
  class ProgressManager {
    constructor() {
      this.STORAGE_KEY = 'omar_kids_progress_v2'
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

    addStars(count = 1, celebrate = true) {
      this.data.stars = (this.data.stars || 0) + count
      sfx.star()
      if (celebrate && count >= 3) {
        launchTastefulConfetti(count * 6)
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

      // Header indicators
      const heroStars = document.getElementById('totalStarsCounter')
      if (heroStars) heroStars.textContent = starsCount

      const heroLetters = document.getElementById('lettersLearnedCounter')
      if (heroLetters) heroLetters.textContent = `${lettersCount} / 28`

      const heroSurahs = document.getElementById('surahsLearnedCounter')
      if (heroSurahs) heroSurahs.textContent = `${surahsCount} / 37`

      const rankTitle = document.getElementById('currentRankTitle')
      if (rankTitle) {
        if (starsCount >= 100) rankTitle.textContent = 'فارس القرآن المتقن'
        else if (starsCount >= 50) rankTitle.textContent = 'شبل واحة الخير'
        else if (starsCount >= 20) rankTitle.textContent = 'طالب نجيب'
        else rankTitle.textContent = 'بطل مجتهد'
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
        speech.speak('مرحباً بكم في واحة أطفال مؤسسة الدكتور عمر هشام الخيرية. نرحب بكم لتعلم القرآن الكريم بصوت الشيخ المنشاوي المعلم وترديد الأطفال، والقراءة والأرقام والرسم الهادف.')
      })
    }
  }

  // ─── TAB 1: LETTERS & READING ───
  // Letter data mapping
  const LETTERS_DATA = [
    { letter: 'أ', name: 'ألف', word: 'أَسَد', initial: { char: 'أَ', word: 'أَسَد' }, medial: { char: 'ـأَ', word: 'فَأْر' }, final: { char: 'ـأ', word: 'نَبَأ' } },
    { letter: 'ب', name: 'باء', word: 'بَاب', initial: { char: 'بـ', word: 'بَيْت' }, medial: { char: 'ـبـ', word: 'حَبْل' }, final: { char: 'ـب', word: 'عِنَب' } },
    { letter: 'ت', name: 'تاء', word: 'تَاج', initial: { char: 'تـ', word: 'تَمْر' }, medial: { char: 'ـتـ', word: 'كِتَاب' }, final: { char: 'ـت', word: 'بِنْت' } },
    { letter: 'ث', name: 'ثاء', word: 'ثَمَر', initial: { char: 'ثـ', word: 'ثَوْب' }, medial: { char: 'ـثـ', word: 'عُثْمَان' }, final: { char: 'ـث', word: 'أَثَاث' } },
    { letter: 'ج', name: 'جيم', word: 'جَبَل', initial: { char: 'جـ', word: 'جَمَل' }, medial: { char: 'ـجـ', word: 'شَجَرَة' }, final: { char: 'ـج', word: 'بُرْج' } },
    { letter: 'ح', name: 'حاء', word: 'حَدِيقَة', initial: { char: 'حـ', word: 'حَقِيبَة' }, medial: { char: 'ـحـ', word: 'بَحْر' }, final: { char: 'ـح', word: 'مِفْتَاح' } },
    { letter: 'خ', name: 'خاء', word: 'خَيْر', initial: { char: 'خـ', word: 'خُبْز' }, medial: { char: 'ـخـ', word: 'نَخْلَة' }, final: { char: 'ـخ', word: 'مَطْبَخ' } },
    { letter: 'د', name: 'دال', word: 'دَرْب', initial: { char: 'د', word: 'دَفْتَر' }, medial: { char: 'ـد', word: 'مَدْرَسَة' }, final: { char: 'ـد', word: 'مَسْجِد' } },
    { letter: 'ذ', name: 'ذال', word: 'ذَهَب', initial: { char: 'ذ', word: 'ذُرَة' }, medial: { char: 'ـذ', word: 'بَذْرَة' }, final: { char: 'ـذ', word: 'مُعَاذ' } },
    { letter: 'ر', name: 'راء', word: 'رَحْمَة', initial: { char: 'ر', word: 'رَسُول' }, medial: { char: 'ـر', word: 'قُرْآن' }, final: { char: 'ـر', word: 'نَهْر' } },
    { letter: 'ز', name: 'زاي', word: 'زَيْتُون', initial: { char: 'ز', word: 'زَهْرَة' }, medial: { char: 'ـز', word: 'مَزْرَعَة' }, final: { char: 'ـز', word: 'خُبْز' } },
    { letter: 'س', name: 'سين', word: 'سَلَام', initial: { char: 'سـ', word: 'سَمَاء' }, medial: { char: 'ـسـ', word: 'مَسْجِد' }, final: { char: 'ـس', word: 'شَمْس' } },
    { letter: 'ش', name: 'شين', word: 'شَمْس', initial: { char: 'شـ', word: 'شَجَرَة' }, medial: { char: 'ـشـ', word: 'مِشْكَاة' }, final: { char: 'ـش', word: 'عُشّ' } },
    { letter: 'ص', name: 'صاد', word: 'صَلَاة', initial: { char: 'صـ', word: 'صَبَاح' }, medial: { char: 'ـصـ', word: 'مِصْبَاح' }, final: { char: 'ـص', word: 'قَفَص' } },
    { letter: 'ض', name: 'ضاد', word: 'ضِيَاء', initial: { char: 'ضـ', word: 'ضَوْء' }, medial: { char: 'ـضـ', word: 'رَمَضَان' }, final: { char: 'ـض', word: 'أَرْض' } },
    { letter: 'ط', name: 'طاء', word: 'طَيْر', initial: { char: 'طـ', word: 'طَالِب' }, medial: { char: 'ـطـ', word: 'مَطَر' }, final: { char: 'ـط', word: 'خَيْط' } },
    { letter: 'ظ', name: 'ظاء', word: 'ظِلّ', initial: { char: 'ظـ', word: 'ظَرْف' }, medial: { char: 'ـظـ', word: 'نَظَافَة' }, final: { char: 'ـظ', word: 'حَافِظ' } },
    { letter: 'ع', name: 'عين', word: 'عِلْم', initial: { char: 'عـ', word: 'عَيْن' }, medial: { char: 'ـعـ', word: 'مُعَلِّم' }, final: { char: 'ـع', word: 'شَارِع' } },
    { letter: 'غ', name: 'غين', word: 'غَيْم', initial: { char: 'غـ', word: 'غَابَة' }, medial: { char: 'ـغـ', word: 'صَغِير' }, final: { char: 'ـغ', word: 'صِمَاغ' } },
    { letter: 'ف', name: 'فاء', word: 'فَجْر', initial: { char: 'فـ', word: 'فَانُوس' }, medial: { char: 'ـفـ', word: 'طِفْل' }, final: { char: 'ـف', word: 'مُصْحَف' } },
    { letter: 'ق', name: 'قاف', word: 'قُرْآن', initial: { char: 'قـ', word: 'قَلَم' }, medial: { char: 'ـقـ', word: 'حَقِيبَة' }, final: { char: 'ـق', word: 'شُرُوق' } },
    { letter: 'ك', name: 'كاف', word: 'كِتَاب', initial: { char: 'كـ', word: 'كَعْبَة' }, medial: { char: 'ـكـ', word: 'مَكْتَبَة' }, final: { char: 'ـك', word: 'مَلِك' } },
    { letter: 'ل', name: 'لام', word: 'لَوْحَة', initial: { char: 'لـ', word: 'لَيْل' }, medial: { char: 'ـلـ', word: 'قَلَم' }, final: { char: 'ـل', word: 'جَمَل' } },
    { letter: 'م', name: 'ميم', word: 'مَسْجِد', initial: { char: 'مـ', word: 'مِئْذَنَة' }, medial: { char: 'ـمـ', word: 'شَمْس' }, final: { char: 'ـم', word: 'قَلَم' } },
    { letter: 'ن', name: 'نون', word: 'نُور', initial: { char: 'نـ', word: 'نَخْلَة' }, medial: { char: 'ـنـ', word: 'مِنْبَر' }, final: { char: 'ـن', word: 'مُؤْمِن' } },
    { letter: 'هـ', name: 'هاء', word: 'هِدَايَة', initial: { char: 'هـ', word: 'هِلَال' }, medial: { char: 'ـهـ', word: 'زَهْرَة' }, final: { char: 'ـه', word: 'وَجْه' } },
    { letter: 'و', name: 'واو', word: 'وُضُوء', initial: { char: 'و', word: 'وَطَن' }, medial: { char: 'ـو', word: 'نُور' }, final: { char: 'ـو', word: 'دَلْو' } },
    { letter: 'ي', name: 'ياء', word: 'يَقِين', initial: { char: 'يـ', word: 'يَد' }, medial: { char: 'ـيـ', word: 'إِيمَان' }, final: { char: 'ـي', word: 'أَخِي' } }
  ]

  let activeLetterObj = LETTERS_DATA[0]

  function initLetters() {
    const letterCards = document.querySelectorAll('.refined-letter-card')
    const spotlight = document.getElementById('letterSpotlight')
    const charEl = document.getElementById('spotlightChar')
    const titleEl = document.getElementById('spotlightTitle')
    const wordEl = document.getElementById('spotlightWord')
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

    // Letter Positions Explorer
    const posSelect = document.getElementById('posLetterSelect')
    if (posSelect) {
      posSelect.addEventListener('change', (e) => {
        sfx.tap()
        renderPositionsForLetter(e.target.value)
      })
      renderPositionsForLetter(posSelect.value || 'أ')
    }

    // Tashkeel dynamic interactive controls
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

    // Init Words Catalog
    initWordsCatalog()

    // Init Sentences Karaoke
    initSentencesKaraoke()

    // Init Quiz
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
        <div class="pos-word-example">
          <strong>${item.initial.word}</strong>
        </div>
        <button type="button" class="listen-pos-btn" data-speak="${item.initial.word}">
          <i class="fa-solid fa-volume-high"></i> استمع للمثال
        </button>
      </div>

      <div class="pos-card-item">
        <span class="pos-tag">في وسط الكلمة</span>
        <div class="pos-char-visual">${item.medial.char}</div>
        <div class="pos-word-example">
          <strong>${item.medial.word}</strong>
        </div>
        <button type="button" class="listen-pos-btn" data-speak="${item.medial.word}">
          <i class="fa-solid fa-volume-high"></i> استمع للمثال
        </button>
      </div>

      <div class="pos-card-item">
        <span class="pos-tag">في آخر الكلمة</span>
        <div class="pos-char-visual">${item.final.char}</div>
        <div class="pos-word-example">
          <strong>${item.final.word}</strong>
        </div>
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

  // ─── First Words Catalog ───
  const WORDS_CATALOG = {
    family: [
      { text: 'أَبِي', sub: 'السند والعطاء', letters: 'أ - ب - ي' },
      { text: 'أُمِّي', sub: 'ينبوع الحنان', letters: 'أ - م - ي' },
      { text: 'أَخِي', sub: 'رفيق دربي', letters: 'أ - خ - ي' },
      { text: 'أُخْتِي', sub: 'نور دارنا', letters: 'أ - خ - ت - ي' },
      { text: 'جَدِّي', sub: 'بركة البيت', letters: 'ج - د - ي' },
      { text: 'بَيْتِي', sub: 'سكن وأمان', letters: 'ب - ي - ت - ي' }
    ],
    nature: [
      { text: 'شَمْس', sub: 'ضياء ودفء', letters: 'ش - م - س' },
      { text: 'قَمَر', sub: 'نور في السماء', letters: 'ق - م - ر' },
      { text: 'نَجْم', sub: 'يهتدي به الساري', letters: 'ن - ج - م' },
      { text: 'سَحَاب', sub: 'يحمل المطر', letters: 'س - ح - ا - ب' },
      { text: 'مَطَر', sub: 'غيث ورحمة', letters: 'م - ط - ر' },
      { text: 'شَجَرَة', sub: 'ظل وثمر', letters: 'ش - ج - ر - ة' }
    ],
    school: [
      { text: 'كِتَاب', sub: 'كنز المعرفة', letters: 'ك - ت - ا - ب' },
      { text: 'قَلَم', sub: 'يكتب المستقبل', letters: 'ق - ل - م' },
      { text: 'دَفْتَر', sub: 'أدون فيه علمي', letters: 'د - ف - ت - ر' },
      { text: 'مُعَلِّم', sub: 'يبني العقول', letters: 'م - ع - ل - م' },
      { text: 'طَالِب', sub: 'يسعى للنجاح', letters: 'ط - ا - ل - ب' },
      { text: 'مَدْرَسَة', sub: 'بيتي الثاني', letters: 'م - د - ر - س - ة' }
    ],
    islamic: [
      { text: 'مَسْجِد', sub: 'بيت الله المبارك', letters: 'م - س - ج - د' },
      { text: 'مُصْحَف', sub: 'كتاب الله الكريم', letters: 'م - ص - ح - ف' },
      { text: 'صَلَاة', sub: 'صلتي بربي', letters: 'ص - ل - ا - ة' },
      { text: 'كَعْبَة', sub: 'قبلة المسلمين', letters: 'ك - ع - ب - ة' },
      { text: 'دُعَاء', sub: 'سلاح المؤمن', letters: 'د - ع - ا - ء' },
      { text: 'إِحْسَان', sub: 'طريق المحبة', letters: 'إ - ح - س - ا - ن' }
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

  // ─── First Sentences with Karaoke Highlighting ───
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

    if (playBtn) {
      playBtn.addEventListener('click', playCurrentSentence)
    }

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
          setTimeout(speakNextWord, 200)
        })
      } else {
        wordSpans.forEach(sp => sp.classList.remove('speaking'))
        progress.addStars(2, false)
      }
    }
    speakNextWord()
  }

  // ─── Letter Tracer with Canvas ───
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

    // Chips
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

  // ─── Listen & Choose Quiz ───
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
      btn.textContent = item.letter
      btn.addEventListener('click', () => {
        if (item.letter === quizCurrentLetter.letter) {
          btn.classList.add('correct')
          sfx.correct()
          quizScore += 10
          progress.addStars(2, false)
          const scoreEl = document.getElementById('quizScoreVal')
          if (scoreEl) scoreEl.textContent = quizScore
          banner.textContent = `أحسنت! هذا حرف ${quizCurrentLetter.name} (${quizCurrentLetter.letter})!`
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

  // ─── TAB 2: QURAN MEMORIZATION (AL-MINSHAWI TEACHER WITH CHILDREN REPETITION) ───
  let currentSurahId = 1
  let currentSurahName = 'الفاتحة'
  let currentVerses = []
  let currentPlayingVerseIdx = 0
  let isVersePlaying = false
  let verseAudio = new Audio()
  let isMaskMode = false
  let verseRepeatTarget = 3
  let currentVerseRepeatCount = 1
  let quranPlaybackMode = 'ayah' // 'ayah' (with child repetition) or 'full' (continuous surah)

  // Built-in offline Quran texts for key short surahs
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
      { num: 4, text: 'وَمَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ' }
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
        verseAudio.pause()
        isVersePlaying = false
        updatePlayButtonIcon()
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
        speech.speak(`مبارك يا بطل! تم تثبيت حفظك لسورة ${currentSurahName}`)
      })
    }

    verseAudio.addEventListener('ended', onVerseAudioEnded)

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
      bismillah.style.display = (id === 1 || id === 9) ? 'none' : 'block'
    }

    const list = document.getElementById('versesInteractiveList')
    if (list) {
      list.innerHTML = '<div class="verses-loading-state"><i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل آيات السورة المباركة...</div>'
    }

    if (OFFLINE_SURAHS[id]) {
      currentVerses = OFFLINE_SURAHS[id]
      renderVerses()
      return
    }

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
        <button type="button" class="verse-single-play-btn" title="الاستماع لهذه الآية بترديد الأطفال"><i class="fa-solid fa-volume-high"></i></button>
      `

      row.querySelector('.verse-single-play-btn').addEventListener('click', (e) => {
        e.stopPropagation()
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

  function getAyahAudioUrl(surah, ayah) {
    // Sheikh Al-Minshawi Teacher (with child repetition) on EveryAyah CDN: 3 digits surah + 3 digits ayah
    const s = String(surah).padStart(3, '0')
    const a = String(ayah).padStart(3, '0')
    return `https://everyayah.com/data/Minshawy_Teacher_128kbps/${s}${a}.mp3`
  }

  function playVerseAudio(idx) {
    if (!currentVerses[idx]) return
    currentPlayingVerseIdx = idx

    document.querySelectorAll('.verse-unit-row').forEach((r, i) => {
      r.classList.toggle('active-reading', i === idx)
      if (i === idx) {
        r.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
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
      // Fallback to speech if audio blocked
      speech.speak(target.text, onVerseAudioEnded)
      isVersePlaying = true
      updatePlayButtonIcon()
    })
  }

  function playFullSurahAudio() {
    const sStr = String(currentSurahId).padStart(3, '0')
    const fullUrl = `https://server10.mp3quran.net/minsh/${sStr}.mp3`
    verseAudio.src = fullUrl
    verseAudio.play().then(() => {
      isVersePlaying = true
      updatePlayButtonIcon()
      const label = document.getElementById('currentPlayingVerseLabel')
      if (label) label.textContent = `تلاوة سورة ${currentSurahName} كاملة متصلة`
    }).catch(() => {})
  }

  function onVerseAudioEnded() {
    if (quranPlaybackMode === 'full') {
      isVersePlaying = false
      updatePlayButtonIcon()
      sfx.celebrate()
      launchTastefulConfetti(40)
      return
    }

    if (currentVerseRepeatCount < verseRepeatTarget) {
      currentVerseRepeatCount++
      updateRepeatIndicator()
      setTimeout(() => {
        verseAudio.currentTime = 0
        verseAudio.play().catch(() => {})
      }, 500)
    } else {
      currentVerseRepeatCount = 1
      if (currentPlayingVerseIdx < currentVerses.length - 1) {
        currentPlayingVerseIdx++
        playVerseAudio(currentPlayingVerseIdx)
      } else {
        isVersePlaying = false
        updatePlayButtonIcon()
        sfx.celebrate()
        launchTastefulConfetti(50)
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
      label.textContent = `الآية ${currentVerses[currentPlayingVerseIdx].num} من سورة ${currentSurahName} (المنشاوي المعلم)`
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
          <div class="digit-name">${NUMBER_NAMES[i]}</div>
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

  // Number Comparison: > < =
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
          feedback.textContent = `إجابة صحيحة! ${compA} ${op} ${compB}`
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
    // 20% chance of equality
    if (Math.random() < 0.2) compB = compA

    aEl.textContent = `${compA} (${ARABIC_DIGITS[compA] || compA})`
    bEl.textContent = `${compB} (${ARABIC_DIGITS[compB] || compB})`
  }

  // Visual Math (Addition/Subtraction)
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
          feedback.textContent = `إجابة صحيحة! ${mathA} ${mathMode === 'add' ? '+' : '-'} ${mathB} = ${answer}`
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

  // Missing Number Sequence
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
    const missingIdx = Math.floor(Math.random() * 4) // 0 to 3
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
          feedback.textContent = `أحسنت! الرقم المفقود هو ${seqAnswer}`
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

    // Ethical quiz
    document.querySelectorAll('.manner-option-btn').forEach(opt => {
      opt.addEventListener('click', () => {
        const isCorrect = opt.getAttribute('data-correct') === 'true'
        const feedback = document.getElementById('mannersFeedback')
        if (isCorrect) {
          sfx.correct()
          opt.classList.add('correct')
          feedback.textContent = 'أحسنت صنعاً! هذا أدب إسلامي نبيل يرضي الله ورسوله.'
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

  // ─── TAB 5: DRAWING STUDIO & COLORING ───
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
        link.download = `لوحة_مؤسسة_عمر_هشام_${Date.now()}.png`
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

    initColoringBook()
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

  // Coloring Book SVGs
  let activeColoringColor = '#168a70'
  const COLORING_SVGS = {
    mosque: `
      <svg viewBox="0 0 400 320" class="clean-coloring-svg">
        <rect x="0" y="0" width="400" height="320" fill="#f8fafc" class="color-part"/>
        <path d="M140 180 C140 100, 260 100, 260 180 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <path d="M195 90 A12 12 0 1 0 205 75 A10 10 0 1 1 195 90 Z" fill="#ffffff" stroke="#1e293b" stroke-width="2" class="color-part"/>
        <rect x="120" y="180" width="160" height="110" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <path d="M175 290 L175 230 C175 210, 225 210, 225 230 L225 290 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <rect x="70" y="90" width="30" height="200" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <path d="M65 90 L85 45 L105 90 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <rect x="300" y="90" width="30" height="200" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <path d="M295 90 L315 45 L335 90 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <rect x="0" y="290" width="400" height="30" fill="#ffffff" stroke="#1e293b" stroke-width="2" class="color-part"/>
      </svg>
    `,
    crescent: `
      <svg viewBox="0 0 400 320" class="clean-coloring-svg">
        <rect x="0" y="0" width="400" height="320" fill="#f8fafc" class="color-part"/>
        <path d="M180 60 A90 90 0 1 0 250 230 A110 110 0 1 1 180 60 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <polygon points="270,110 282,138 312,138 288,155 297,184 270,166 243,184 252,155 228,138 258,138" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
      </svg>
    `,
    fish: `
      <svg viewBox="0 0 400 320" class="clean-coloring-svg">
        <rect x="0" y="0" width="400" height="320" fill="#f8fafc" class="color-part"/>
        <path d="M80 160 C120 70, 260 70, 300 160 C260 250, 120 250, 80 160 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <polygon points="80,160 30,100 30,220" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <circle cx="260" cy="140" r="14" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <circle cx="264" cy="140" r="5" fill="#1e293b"/>
        <path d="M170 160 C180 110, 220 130, 210 170 Z" fill="#ffffff" stroke="#1e293b" stroke-width="2" class="color-part"/>
      </svg>
    `,
    flower: `
      <svg viewBox="0 0 400 320" class="clean-coloring-svg">
        <rect x="0" y="0" width="400" height="320" fill="#f8fafc" class="color-part"/>
        <rect x="195" y="160" width="10" height="130" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <ellipse cx="160" cy="220" rx="35" ry="16" transform="rotate(-30 160 220)" fill="#ffffff" stroke="#1e293b" stroke-width="2" class="color-part"/>
        <ellipse cx="240" cy="220" rx="35" ry="16" transform="rotate(30 240 220)" fill="#ffffff" stroke="#1e293b" stroke-width="2" class="color-part"/>
        <circle cx="200" cy="100" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <circle cx="150" cy="130" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <circle cx="160" cy="190" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <circle cx="240" cy="190" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <circle cx="250" cy="130" r="35" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <circle cx="200" cy="150" r="26" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
      </svg>
    `,
    tree: `
      <svg viewBox="0 0 400 320" class="clean-coloring-svg">
        <rect x="0" y="0" width="400" height="320" fill="#f8fafc" class="color-part"/>
        <path d="M180 290 L185 160 L215 160 L220 290 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <circle cx="150" cy="130" r="45" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <circle cx="250" cy="130" r="45" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <circle cx="200" cy="80" r="50" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
        <circle cx="200" cy="140" r="40" fill="#ffffff" stroke="#1e293b" stroke-width="3" class="color-part"/>
      </svg>
    `
  }

  function initColoringBook() {
    const container = document.getElementById('coloringSvgContainer')
    const palette = document.getElementById('coloringPalette')
    const tplButtons = document.querySelectorAll('#coloringTemplatesBar .tpl-btn')

    if (palette) {
      palette.querySelectorAll('.color-swatch-bubble').forEach(swatch => {
        swatch.addEventListener('click', () => {
          sfx.tap()
          palette.querySelectorAll('.color-swatch-bubble').forEach(s => s.classList.remove('active'))
          swatch.classList.add('active')
          activeColoringColor = swatch.getAttribute('data-color')
        })
      })
    }

    tplButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sfx.tap()
        tplButtons.forEach(b => b.classList.remove('active'))
        btn.classList.add('active')
        loadColoringTemplate(btn.getAttribute('data-shape'))
      })
    })

    const resetBtn = document.getElementById('btnResetColoring')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        sfx.tap()
        const activeBtn = document.querySelector('#coloringTemplatesBar .tpl-btn.active')
        if (activeBtn) {
          loadColoringTemplate(activeBtn.getAttribute('data-shape'))
        }
      })
    }

    const saveColoringBtn = document.getElementById('btnSaveColoring')
    if (saveColoringBtn) {
      saveColoringBtn.addEventListener('click', () => {
        sfx.star()
        progress.addStars(3, true)
        alert('تم اعتماد تلوينتك الرائعة وحصلت على 3 نقاط تميز.')
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

  // Drawing Lessons
  const DRAWING_LESSONS = [
    {
      title: 'كيف ترسم مسجداً إسلامياً مباركاً',
      steps: [
        '١. ارسم قاعدة مستطيلة للمسجد على سطر مستقيم.',
        '٢. ارسم نصف دائرة مقوسة فوق المنتصف لتشكل القبة الرئيسية.',
        '٣. أضف مستطيلين رأسيين على الجانبين للمئذنتين الشامختين.',
        '٤. توّج المئذنتين بمثلثين صغيرين وهلال في قمة القبة.',
        '٥. ارسم قوساً جميلاً لباب المسجد ولوّن لوحتك باللون الزمردي والذهبي.'
      ]
    },
    {
      title: 'كيف ترسم سمكة سابحة في الأعماق',
      steps: [
        '١. ارسم شكلاً بيضاوياً أفقياً لجسم السمكة.',
        '٢. ارسم مثلثاً متصلاً بالجهة الخلفية لعمل الذيل.',
        '٣. أضف عيناً صغيرة واضحة وانحناءة الفم الباسم.',
        '٤. أضف زعنفة علوية وزعنفة سفلية لتوجيه السباحة.',
        '٥. ارسم خطوطاً مقوسة رقيقة تمثل الحراشف وفقاعات ماء تعلوها.'
      ]
    },
    {
      title: 'كيف ترسم زهرة ربيعية متفتحة',
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
        <h3><i class="fa-solid fa-paintbrush"></i> ${lesson.title}</h3>
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

  // ─── TAB 6: INTELLECTUAL GAMES ───
  // Memory Card Match
  let memoryCards = []
  let flippedCards = []
  let matchedPairs = 0
  let flipsCount = 0

  const MEMORY_ITEMS = [
    { val: 'أ', name: 'ألف' },
    { val: 'ب', name: 'باء' },
    { val: 'ت', name: 'تاء' },
    { val: 'ج', name: 'جيم' },
    { val: 'س', name: 'سين' },
    { val: 'م', name: 'ميم' }
  ]

  function initMemoryGame() {
    const restartBtn = document.getElementById('btnRestartMemory')
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        sfx.tap()
        startMemoryRound()
      })
    }
    startMemoryRound()
  }

  function startMemoryRound() {
    const board = document.getElementById('memoryCardsBoard')
    const flipsLabel = document.getElementById('memFlipsCount')
    const matchesLabel = document.getElementById('memMatchesCount')
    if (!board) return

    matchedPairs = 0
    flipsCount = 0
    flippedCards = []
    if (flipsLabel) flipsLabel.textContent = '0'
    if (matchesLabel) matchesLabel.textContent = '0 / 6'

    const deck = []
    MEMORY_ITEMS.forEach((item, pairIdx) => {
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
          <div class="card-side back"><i class="fa-solid fa-question"></i></div>
          <div class="card-side front">
            <span class="card-char">${item.val}</span>
            <small>${item.name}</small>
          </div>
        </div>
      `
      card.addEventListener('click', () => onCardClicked(card, item))
      board.appendChild(card)
    })
  }

  function onCardClicked(cardEl, item) {
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
        setTimeout(() => {
          sfx.correct()
          c1.cardEl.classList.add('matched')
          c2.cardEl.classList.add('matched')
          matchedPairs++
          const matchesLabel = document.getElementById('memMatchesCount')
          if (matchesLabel) matchesLabel.textContent = `${matchedPairs} / 6`
          speech.speak(`حرف ${c1.item.name}`)
          flippedCards = []

          if (matchedPairs === 6) {
            sfx.celebrate()
            launchTastefulConfetti(50)
            progress.data.gamesWon = (progress.data.gamesWon || 0) + 1
            progress.addStars(4, true)
            speech.speak('أحسنت يا بطل! اكتملت الجولة بنجاح تام.')
          }
        }, 350)
      } else {
        setTimeout(() => {
          sfx.wrong()
          c1.cardEl.classList.remove('flipped')
          c2.cardEl.classList.remove('flipped')
          flippedCards = []
        }, 850)
      }
    }
  }

  // Word Scramble
  const SCRAMBLE_WORDS = [
    { word: 'قَلَم', letters: ['ق', 'ل', 'م'], hint: 'أداة الكتابة والعلم' },
    { word: 'كِتَاب', letters: ['ك', 'ت', 'ا', 'ب'], hint: 'كنز المعرفة' },
    { word: 'مَسْجِد', letters: ['م', 'س', 'ج', 'د'], hint: 'بيت الله المبارك' },
    { word: 'نُور', letters: ['ن', 'و', 'ر'], hint: 'ضياء يبدد الظلام' },
    { word: 'سَمَاء', letters: ['س', 'م', 'ا', 'ء'], hint: 'فوقنا تتزين بالنجوم' }
  ]
  let currentScrambleIdx = 0
  let userPlacedLetters = []

  function initWordScramble() {
    const checkBtn = document.getElementById('btnCheckScramble')
    const nextBtn = document.getElementById('btnNextScramble')
    if (checkBtn) checkBtn.addEventListener('click', checkScrambleAnswer)
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sfx.tap()
        currentScrambleIdx = (currentScrambleIdx + 1) % SCRAMBLE_WORDS.length
        loadScramble()
      })
    }
    loadScramble()
  }

  function loadScramble() {
    const target = SCRAMBLE_WORDS[currentScrambleIdx]
    const slotsRow = document.getElementById('scrambleSlotsRow')
    const tilesRow = document.getElementById('scrambleTilesRow')
    const promptEl = document.getElementById('scramblePrompt')
    const feedback = document.getElementById('scrambleFeedback')

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
    const target = SCRAMBLE_WORDS[currentScrambleIdx]
    const feedback = document.getElementById('scrambleFeedback')
    const answer = userPlacedLetters.join('')

    if (answer === target.letters.join('')) {
      sfx.correct()
      if (feedback) {
        feedback.textContent = `أحسنت صنعاً! الكلمة هي "${target.word}"`
        feedback.className = 'exercise-feedback success'
      }
      progress.addStars(3, false)
      speech.speak(`أحسنت، كلمة ${target.word}`)
      setTimeout(() => {
        currentScrambleIdx = (currentScrambleIdx + 1) % SCRAMBLE_WORDS.length
        loadScramble()
      }, 1400)
    } else {
      sfx.wrong()
      if (feedback) {
        feedback.textContent = 'الترتيب غير مطابق، حاول إعادة ترتيب الحروف'
        feedback.className = 'exercise-feedback error'
      }
      setTimeout(loadScramble, 1000)
    }
  }

  // Missing Letter Game
  const MISSING_WORDS = [
    { full: 'كِتَاب', missing: 'كـ', choices: ['كـ', 'مـ', 'سـ', 'فـ'], display: '؟ـتَاب', hint: 'مصدر العلم والقراءة' },
    { full: 'مَسْجِد', missing: 'مـ', choices: ['مـ', 'نـ', 'بـ', 'لـ'], display: '؟ـسْجِد', hint: 'دار العبادة والصلاة' },
    { full: 'قَلَم', missing: 'قـ', choices: ['قـ', 'فـ', 'عـ', 'طـ'], display: '؟ـلَم', hint: 'نكتب به العلم' },
    { full: 'شَمْس', missing: 'شـ', choices: ['شـ', 'سـ', 'صـ', 'ضـ'], display: '؟ـمْس', hint: 'تشرق في الصباح' }
  ]
  let currentMissingIdx = 0

  function initMissingLetterGame() {
    loadMissingQuestion()
  }

  function loadMissingQuestion() {
    const target = MISSING_WORDS[currentMissingIdx]
    const displayEl = document.getElementById('missingWordDisplay')
    const choicesRow = document.getElementById('missingChoicesRow')
    const feedback = document.getElementById('missingFeedback')

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
            feedback.textContent = `إجابة صحيحة! الكلمة كاملة هي: "${target.full}"`
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

  // ─── TAB 7: OFFICIAL CERTIFICATE MODAL & PRINTING ───
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
      launchTastefulConfetti(35)
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

  // ─── TAB 8: PARENTS DASHBOARD & RESET ───
  function initParentDashboard() {
    const resetBtn = document.getElementById('btnResetChildProgress')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => progress.reset())
    }
  }

  // ─── Bootstrap on Ready ───
  document.addEventListener('DOMContentLoaded', () => {
    initTabs()
    initLetters()
    initQuran()
    initNumbers()
    initDuas()
    initDrawing()
    initMemoryGame()
    initWordScramble()
    initMissingLetterGame()
    initCertificate()
    initParentDashboard()

    progress.updateUI()
  })

})()
