import { Layout, icon } from './shared'
import type { UserSession } from '../types'

// All 28 Arabic letters with examples, phonetics, colors, and word positions
export const ARABIC_LETTERS = [
  { letter: 'أ', name: 'ألف', word: 'أَسَد', emoji: '🦁', color: '#f59e0b', initial: 'أَ', medial: 'ـأَ', final: 'ـأ' },
  { letter: 'ب', name: 'باء', word: 'بَطَّة', emoji: '🦆', color: '#10b981', initial: 'بـ', medial: 'ـبـ', final: 'ـب' },
  { letter: 'ت', name: 'تاء', word: 'تُفَّاح', emoji: '🍎', color: '#ef4444', initial: 'تـ', medial: 'ـتـ', final: 'ـت' },
  { letter: 'ث', name: 'ثاء', word: 'ثَعْلَب', emoji: '🦊', color: '#8b5cf6', initial: 'ثـ', medial: 'ـثـ', final: 'ـث' },
  { letter: 'ج', name: 'جيم', word: 'جَمَل', emoji: '🐪', color: '#06b6d4', initial: 'جـ', medial: 'ـجـ', final: 'ـج' },
  { letter: 'ح', name: 'حاء', word: 'حِصَان', emoji: '🐎', color: '#f97316', initial: 'حـ', medial: 'ـحـ', final: 'ـح' },
  { letter: 'خ', name: 'خاء', word: 'خَرُوف', emoji: '🐑', color: '#84cc16', initial: 'خـ', medial: 'ـخـ', final: 'ـخ' },
  { letter: 'د', name: 'دال', word: 'دُبّ', emoji: '🐻', color: '#3b82f6', initial: 'د', medial: 'ـد', final: 'ـد' },
  { letter: 'ذ', name: 'ذال', word: 'ذِئْب', emoji: '🐺', color: '#ec4899', initial: 'ذ', medial: 'ـذ', final: 'ـذ' },
  { letter: 'ر', name: 'راء', word: 'رُمَّان', emoji: '🫐', color: '#eab308', initial: 'ر', medial: 'ـر', final: 'ـر' },
  { letter: 'ز', name: 'زاي', word: 'زَرَافَة', emoji: '🦒', color: '#14b8a6', initial: 'ز', medial: 'ـز', final: 'ـز' },
  { letter: 'س', name: 'سين', word: 'سَمَكَة', emoji: '🐟', color: '#6366f1', initial: 'سـ', medial: 'ـسـ', final: 'ـس' },
  { letter: 'ش', name: 'شين', word: 'شَمْس', emoji: '☀️', color: '#f59e0b', initial: 'شـ', medial: 'ـشـ', final: 'ـش' },
  { letter: 'ص', name: 'صاد', word: 'صَقْر', emoji: '🦅', color: '#10b981', initial: 'صـ', medial: 'ـصـ', final: 'ـص' },
  { letter: 'ض', name: 'ضاد', word: 'ضِفْدَع', emoji: '🐸', color: '#22c55e', initial: 'ضـ', medial: 'ـضـ', final: 'ـض' },
  { letter: 'ط', name: 'طاء', word: 'طَيَّارَة', emoji: '✈️', color: '#0ea5e9', initial: 'طـ', medial: 'ـطـ', final: 'ـط' },
  { letter: 'ظ', name: 'ظاء', word: 'ظَبْي', emoji: '🦌', color: '#a855f7', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ' },
  { letter: 'ع', name: 'عين', word: 'عَيْن', emoji: '👁️', color: '#d946ef', initial: 'عـ', medial: 'ـعـ', final: 'ـع' },
  { letter: 'غ', name: 'غين', word: 'غَزَال', emoji: '🦌', color: '#f43f5e', initial: 'غـ', medial: 'ـغـ', final: 'ـغ' },
  { letter: 'ف', name: 'فاء', word: 'فِيل', emoji: '🐘', color: '#0284c7', initial: 'فـ', medial: 'ـفـ', final: 'ـف' },
  { letter: 'ق', name: 'قاف', word: 'قَمَر', emoji: '🌙', color: '#8b5cf6', initial: 'قـ', medial: 'ـقـ', final: 'ـق' },
  { letter: 'ك', name: 'كاف', word: 'كِتَاب', emoji: '📖', color: '#059669', initial: 'كـ', medial: 'ـكـ', final: 'ـك' },
  { letter: 'ل', name: 'لام', word: 'لَيْمُون', emoji: '🍋', color: '#ca8a04', initial: 'لـ', medial: 'ـلـ', final: 'ـل' },
  { letter: 'م', name: 'ميم', word: 'مَسْجِد', emoji: '🕌', color: '#16a34a', initial: 'مـ', medial: 'ـمـ', final: 'ـم' },
  { letter: 'ن', name: 'نون', word: 'نَجْمَة', emoji: '⭐', color: '#f59e0b', initial: 'نـ', medial: 'ـنـ', final: 'ـن' },
  { letter: 'هـ', name: 'هاء', word: 'هِلال', emoji: '🌙', color: '#38bdf8', initial: 'هـ', medial: 'ـهـ', final: 'ـه' },
  { letter: 'و', name: 'واو', word: 'وَرْدَة', emoji: '🌹', color: '#f43f5e', initial: 'و', medial: 'ـو', final: 'ـو' },
  { letter: 'ي', name: 'ياء', word: 'يَد', emoji: '🖐️', color: '#a855f7', initial: 'يـ', medial: 'ـيـ', final: 'ـي' }
]

// Juz Amma Surahs for Kids Memorization
export const JUZ_AMMA_SURAHS = [
  { id: 1, name: 'الفاتحة', count: 7, level: 'easy', type: 'مكية' },
  { id: 114, name: 'الناس', count: 6, level: 'easy', type: 'مكية' },
  { id: 113, name: 'الفلق', count: 5, level: 'easy', type: 'مكية' },
  { id: 112, name: 'الإخلاص', count: 4, level: 'easy', type: 'مكية' },
  { id: 111, name: 'المسد', count: 5, level: 'easy', type: 'مكية' },
  { id: 110, name: 'النصر', count: 3, level: 'easy', type: 'مدنية' },
  { id: 109, name: 'الكافرون', count: 6, level: 'easy', type: 'مكية' },
  { id: 108, name: 'الكوثر', count: 3, level: 'easy', type: 'مكية' },
  { id: 107, name: 'الماعون', count: 7, level: 'easy', type: 'مكية' },
  { id: 106, name: 'قريش', count: 4, level: 'easy', type: 'مكية' },
  { id: 105, name: 'الفيل', count: 5, level: 'easy', type: 'مكية' },
  { id: 104, name: 'الهمزة', count: 9, level: 'medium', type: 'مكية' },
  { id: 103, name: 'العصر', count: 3, level: 'easy', type: 'مكية' },
  { id: 102, name: 'التكاثر', count: 8, level: 'medium', type: 'مكية' },
  { id: 101, name: 'القارعة', count: 11, level: 'medium', type: 'مكية' },
  { id: 100, name: 'العاديات', count: 11, level: 'medium', type: 'مكية' },
  { id: 99, name: 'الزلزلة', count: 8, level: 'medium', type: 'مدنية' },
  { id: 98, name: 'البينة', count: 8, level: 'hard', type: 'مدنية' },
  { id: 97, name: 'القدر', count: 5, level: 'easy', type: 'مكية' },
  { id: 96, name: 'العلق', count: 19, level: 'hard', type: 'مكية' },
  { id: 95, name: 'التين', count: 8, level: 'easy', type: 'مكية' },
  { id: 94, name: 'الشرح', count: 8, level: 'easy', type: 'مكية' },
  { id: 93, name: 'الضحى', count: 11, level: 'medium', type: 'مكية' },
  { id: 92, name: 'الليل', count: 21, level: 'hard', type: 'مكية' },
  { id: 91, name: 'الشمس', count: 15, level: 'medium', type: 'مكية' },
  { id: 90, name: 'البلد', count: 20, level: 'hard', type: 'مكية' },
  { id: 89, name: 'الفجر', count: 30, level: 'hard', type: 'مكية' },
  { id: 88, name: 'الغاشية', count: 26, level: 'hard', type: 'مكية' },
  { id: 87, name: 'الأعلى', count: 19, level: 'medium', type: 'مكية' },
  { id: 86, name: 'الطارق', count: 17, level: 'medium', type: 'مكية' },
  { id: 85, name: 'البروج', count: 22, level: 'hard', type: 'مكية' },
  { id: 84, name: 'الانشقاق', count: 25, level: 'hard', type: 'مكية' },
  { id: 83, name: 'المطففين', count: 36, level: 'hard', type: 'مكية' },
  { id: 82, name: 'الانفطار', count: 19, level: 'medium', type: 'مكية' },
  { id: 81, name: 'التكوير', count: 29, level: 'hard', type: 'مكية' },
  { id: 80, name: 'عبس', count: 42, level: 'hard', type: 'مكية' },
  { id: 79, name: 'النازعات', count: 46, level: 'hard', type: 'مكية' },
  { id: 78, name: 'النبأ', count: 40, level: 'hard', type: 'مكية' }
]

// Daily Duas for Young Muslims
export const KIDS_DUAS = [
  { id: 'wake', title: 'دعاء الاستيقاظ من النوم', text: 'الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', icon: 'fa-sun', color: '#f59e0b', tag: 'صباحاً' },
  { id: 'sleep', title: 'دعاء النوم', text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا', icon: 'fa-moon', color: '#6366f1', tag: 'مساءً' },
  { id: 'eat_before', title: 'دعاء قبل تناول الطعام', text: 'بِسْمِ اللَّهِ، وَإِنْ نَسِيتُ أَقُولُ: بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ', icon: 'fa-utensils', color: '#10b981', tag: 'طعام' },
  { id: 'eat_after', title: 'دعاء بعد الفراغ من الطعام', text: 'الحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلا قُوَّةٍ', icon: 'fa-bowl-rice', color: '#14b8a6', tag: 'طعام' },
  { id: 'parents', title: 'دعاء للوالدين الغاليين', text: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', icon: 'fa-heart', color: '#ef4444', tag: 'بر الوالدين' },
  { id: 'study', title: 'دعاء طلب العلم والمذاكرة', text: 'رَبِّ زِدْنِي عِلْمًا، وَيَسِّرْ لِي أَمْرِي، وَاشْرَحْ لِي صَدْرِي', icon: 'fa-book-open', color: '#3b82f6', tag: 'مذاكرة' },
  { id: 'enter_home', title: 'دعاء دخول المنزل', text: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا', icon: 'fa-door-open', color: '#f97316', tag: 'منزل' },
  { id: 'leave_home', title: 'دعاء الخروج من المنزل', text: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ', icon: 'fa-shoe-prints', color: '#8b5cf6', tag: 'خروج' },
  { id: 'sneezing', title: 'أدب العطاس وشكر الله', text: 'أَقُولُ: الحَمْدُ لِلَّهِ، وَيَقُولُ أَخِي: يَرْحَمُكَ اللَّهُ، فَأَرُدُّ: يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ', icon: 'fa-face-smile', color: '#06b6d4', tag: 'آداب' },
  { id: 'mosque_enter', title: 'دعاء دخول المسجد', text: 'بِسْمِ اللَّهِ، وَالصَّلاةُ وَالسَّلامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', icon: 'fa-mosque', color: '#059669', tag: 'مسجد' }
]

export function KidsHub({ user }: { user?: UserSession }) {
  return (
    <Layout
      user={user}
      title="واحة أطفال المؤسسة | تعلم القراءة، القرآن، الأرقام والرسم الممتع"
      description="منصة تفاعلية مجانية متكاملة لتعليم الأطفال القراءة والكتابة بالصوت، تحفيظ جزء عم بالترديد التفاعلي، تعلم الأرقام والحساب، مرسم الصغار، والأدعية الإسلامية المصورة."
      image="/static/img/og-image.png"
    >
      {/* ─── Playful Kids Hero ─── */}
      <section class="kids-hero-wrap">
        <div class="kids-bubble b1"></div>
        <div class="kids-bubble b2"></div>
        <div class="kids-bubble b3"></div>
        <div class="kids-bubble b4"></div>
        <div class="kids-star-particle sp1">⭐</div>
        <div class="kids-star-particle sp2">✨</div>
        <div class="kids-star-particle sp3">🌟</div>
        <div class="kids-star-particle sp4">🎨</div>
        <div class="kids-star-particle sp5">📖</div>

        <div class="kids-hero-container">
          <div class="kids-hero-badge">
            <span class="kids-pulse-dot"></span>
            <span>صدقة جارية • واحة التعليم التفاعلي والمرح</span>
            <span class="kids-badge-sparkle">🎉</span>
          </div>

          <h1 class="kids-main-title">
            واحة <span>أطفال المؤسسة</span>
          </h1>

          <p class="kids-hero-desc">
            مرحباً بك يا بطل! 🌟 هنا ستتعلم قراءة الحروف بالصوت، تحفظ قصار السور بإتقان، تلون وترسم أروع اللوحات، وتجمع النجوم والكؤوس لتصبح نجماً ساطعاً!
          </p>

          {/* Quick interactive counters & Audio Guide */}
          <div class="kids-hero-stats-bar">
            <div class="kids-stat-box" id="heroStarsBox">
              <span class="kids-stat-icon">⭐</span>
              <div>
                <b id="totalStarsCounter">0</b>
                <small>نجوم الشجاعة</small>
              </div>
            </div>

            <div class="kids-stat-box" id="heroLettersBox">
              <span class="kids-stat-icon">🔤</span>
              <div>
                <b id="lettersLearnedCounter">0 / 28</b>
                <small>حرفاً أتقنته</small>
              </div>
            </div>

            <div class="kids-stat-box" id="heroSurahsBox">
              <span class="kids-stat-icon">🕌</span>
              <div>
                <b id="surahsLearnedCounter">0 / 37</b>
                <small>سورة حُفظت</small>
              </div>
            </div>

            <div class="kids-stat-box" id="heroRankBox">
              <span class="kids-stat-icon">🏆</span>
              <div>
                <b id="currentRankTitle">بطل مبتدئ</b>
                <small>لقبك الحالي</small>
              </div>
            </div>

            <button type="button" class="kids-sound-guide-btn" id="kidsAudioGuideBtn" title="انقر لتشغيل صوت الترحيب">
              <i class="fa-solid fa-volume-high"></i>
              <span>مرحباً يا بطل! استمع لي 🎙️</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Navigation Tabs ─── */}
      <section class="kids-nav-section">
        <div class="kids-tabs-scroll" role="tablist" aria-label="أقسام واحة الأطفال">
          <button class="kids-tab-btn active" data-tab="letters" role="tab" aria-selected="true">
            <span class="tab-emoji">📖</span>
            <span class="tab-text">الحروف والقراءة</span>
          </button>
          <button class="kids-tab-btn" data-tab="numbers" role="tab" aria-selected="false">
            <span class="tab-emoji">🔢</span>
            <span class="tab-text">الأرقام والحساب</span>
          </button>
          <button class="kids-tab-btn" data-tab="quran" role="tab" aria-selected="false">
            <span class="tab-emoji">🕌</span>
            <span class="tab-text">تحفيظ القرآن</span>
          </button>
          <button class="kids-tab-btn" data-tab="duas" role="tab" aria-selected="false">
            <span class="tab-emoji">🤲</span>
            <span class="tab-text">الأدعية والآداب</span>
          </button>
          <button class="kids-tab-btn" data-tab="drawing" role="tab" aria-selected="false">
            <span class="tab-emoji">🎨</span>
            <span class="tab-text">مرسم الصغار</span>
          </button>
          <button class="kids-tab-btn" data-tab="games" role="tab" aria-selected="false">
            <span class="tab-emoji">🎮</span>
            <span class="tab-text">ألعاب الذكاء</span>
          </button>
          <button class="kids-tab-btn" data-tab="stars" role="tab" aria-selected="false">
            <span class="tab-emoji">⭐</span>
            <span class="tab-text">كؤوسي والشهادة</span>
          </button>
          <button class="kids-tab-btn" data-tab="parents" role="tab" aria-selected="false">
            <span class="tab-emoji">👨‍👩‍👧</span>
            <span class="tab-text">لوحة ولي الأمر</span>
          </button>
        </div>
      </section>

      {/* ─── TAB 1: LETTERS & READING ─── */}
      <section class="kids-tab-panel active" id="panel-letters">
        <div class="kids-section-head">
          <span class="kids-pill-badge">قسم الحروف والقراءة التفاعلية</span>
          <h2>تعلم الحروف العربية <span>بالصوت والصورة</span></h2>
          <p>اضغط على أي حرف لتسمع صوته الجميل، واكتشف كيف يُكتب في أول ووسط وآخر الكلمة، وتتبعه بيدك لتتقن رسمه!</p>
        </div>

        {/* Sub-modes bar: Letters Grid | Letter Tracer | Formations (Tashkeel) | Word Quiz */}
        <div class="letters-submode-bar">
          <button class="submode-pill active" data-sub="grid">
            <i class="fa-solid fa-border-all"></i> الحروف الـ 28
          </button>
          <button class="submode-pill" data-sub="tashkeel">
            <i class="fa-solid fa-shapes"></i> الحركات والتشكيل
          </button>
          <button class="submode-pill" data-sub="tracer">
            <i class="fa-solid fa-pencil"></i> تتبع الحرف بيدك ✍️
          </button>
          <button class="submode-pill" data-sub="quiz">
            <i class="fa-solid fa-circle-question"></i> لعبة اسمع واكتشف
          </button>
        </div>

        {/* Sub-view 1: Letters Grid */}
        <div class="subview-content active" id="subview-letters-grid">
          <div class="letters-grid-wrap">
            {ARABIC_LETTERS.map((item, idx) => (
              <div
                class="kids-letter-card"
                data-letter={item.letter}
                data-name={item.name}
                data-word={item.word}
                data-emoji={item.emoji}
                data-idx={idx}
                style={`--card-color: ${item.color}`}
              >
                <div class="card-sound-icon"><i class="fa-solid fa-volume-high"></i></div>
                <div class="letter-char">{item.letter}</div>
                <div class="letter-word-row">
                  <span class="word-emoji">{item.emoji}</span>
                  <span class="word-text">{item.word}</span>
                </div>
                <div class="letter-positions">
                  <span title="في أول الكلمة">{item.initial}</span>
                  <span title="في وسط الكلمة">{item.medial}</span>
                  <span title="في آخر الكلمة">{item.final}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Letter Detail Modal / Preview Floating Box */}
          <div class="letter-active-spotlight" id="letterSpotlight">
            <div class="spotlight-header">
              <span class="spotlight-title">استمع وتعلّم كيف تنطق وتكتب</span>
              <button class="spotlight-close" id="closeSpotlightBtn"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="spotlight-body">
              <div class="spotlight-big-char" id="spotlightChar">أ</div>
              <div class="spotlight-info">
                <h3 id="spotlightWord">أَسَد 🦁</h3>
                <p id="spotlightDesc">حرف الألف هو أول حروف لغتنا العربية الجميلة!</p>
                <div class="spotlight-audio-controls">
                  <button type="button" class="btn-sound-play" id="playLetterSoundBtn">
                    <i class="fa-solid fa-play"></i> نطق الحرف
                  </button>
                  <button type="button" class="btn-sound-play secondary" id="playWordSoundBtn">
                    <i class="fa-solid fa-volume-low"></i> نطق الكلمة
                  </button>
                  <button type="button" class="btn-trace-link" id="goToTraceBtn">
                    <i class="fa-solid fa-pencil"></i> تتبع هذا الحرف الآن
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-view 2: Tashkeel (Fatha, Damma, Kasra, Sukun, Tanween) */}
        <div class="subview-content" id="subview-letters-tashkeel">
          <div class="tashkeel-container">
            <div class="tashkeel-intro">
              <h3>ما هي الحركات القصيرة؟ 🎶</h3>
              <p>الحركات تجعل الحرف يبتسم (فتحة َ)، أو يضم شفتيه (ضمة ُ)، أو يبتسم للأسفل (كسرة ِ)، أو يقف ساكناً (سكون ْ)!</p>
            </div>

            <div class="tashkeel-cards-row">
              <div class="tashkeel-card" data-mark="fatha">
                <div class="tashkeel-badge">الفَتْحَة</div>
                <div class="tashkeel-example">بَ</div>
                <p class="tashkeel-pronounce">نفتح فمنا: "بَـ..." مثل <strong>بَقَرَة</strong></p>
                <button type="button" class="tashkeel-listen-btn" data-text="بَ، فَتْحة، بَ"><i class="fa-solid fa-volume-high"></i> استمع</button>
              </div>

              <div class="tashkeel-card" data-mark="damma">
                <div class="tashkeel-badge">الضَّمَّة</div>
                <div class="tashkeel-example">بُ</div>
                <p class="tashkeel-pronounce">نضم شفتينا: "بُـ..." مثل <strong>بُرْتُقَال</strong></p>
                <button type="button" class="tashkeel-listen-btn" data-text="بُ، ضَمّة، بُ"><i class="fa-solid fa-volume-high"></i> استمع</button>
              </div>

              <div class="tashkeel-card" data-mark="kasra">
                <div class="tashkeel-badge">الكَسْرَة</div>
                <div class="tashkeel-example">بِ</div>
                <p class="tashkeel-pronounce">نكسر صوتنا: "بِـ..." مثل <strong>بِنْت</strong></p>
                <button type="button" class="tashkeel-listen-btn" data-text="بِ، كَسْرة، بِ"><i class="fa-solid fa-volume-high"></i> استمع</button>
              </div>

              <div class="tashkeel-card" data-mark="sukun">
                <div class="tashkeel-badge">السُّكُون</div>
                <div class="tashkeel-example">أَبْ</div>
                <p class="tashkeel-pronounce">نقف على الحرف بهدوء: "أَبْ"</p>
                <button type="button" class="tashkeel-listen-btn" data-text="أَبْ، سُكون"><i class="fa-solid fa-volume-high"></i> استمع</button>
              </div>
            </div>

            {/* Interactive Tashkeel Changer */}
            <div class="tashkeel-interactive-box">
              <h4>جرب تشكيل أي حرف بنفسك:</h4>
              <div class="tashkeel-selector-row">
                <label>اختر حرفاً: </label>
                <select id="tashkeelLetterSelect" class="kids-select">
                  {ARABIC_LETTERS.map(item => (
                    <option value={item.letter}>{item.letter} - {item.name}</option>
                  ))}
                </select>
              </div>
              <div class="tashkeel-demo-buttons" id="tashkeelDemoButtons">
                {/* Dynamically populated */}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-view 3: Letter Tracer Canvas */}
        <div class="subview-content" id="subview-letters-tracer">
          <div class="tracer-container">
            <div class="tracer-sidebar">
              <h3>مرسم تتبع الحروف ✍️</h3>
              <p>حرّك إصبعك أو الماوس فوق الحرف المنقط لتتعلم كيف ترسمه بدقة!</p>

              <div class="tracer-letter-picker">
                <label>اختر الحرف للتتبع:</label>
                <div class="mini-letter-chips" id="tracerChips">
                  {ARABIC_LETTERS.slice(0, 14).map(item => (
                    <button type="button" class="chip-btn" data-letter={item.letter}>{item.letter}</button>
                  ))}
                </div>
                <div class="mini-letter-chips" id="tracerChips2">
                  {ARABIC_LETTERS.slice(14).map(item => (
                    <button type="button" class="chip-btn" data-letter={item.letter}>{item.letter}</button>
                  ))}
                </div>
              </div>

              <div class="tracer-tools">
                <button type="button" class="tracer-btn clear" id="clearTracerBtn">
                  <i class="fa-solid fa-rotate-left"></i> امسح وابدأ من جديد
                </button>
                <button type="button" class="tracer-btn check" id="evaluateTracerBtn">
                  <i class="fa-solid fa-wand-magic-sparkles"></i> كيف هو خطي؟ 🌟
                </button>
              </div>

              <div class="tracer-score-box" id="tracerScoreBox" style="display:none;">
                <div class="score-stars">⭐⭐⭐</div>
                <p id="tracerFeedback">أحسنت يا بطل! خطك رائع وجميل!</p>
              </div>
            </div>

            <div class="tracer-canvas-wrap">
              <canvas id="letterTraceCanvas" width="500" height="500"></canvas>
              <div class="tracer-guide-badge">تتبع الحرف بإصبعك 👆</div>
            </div>
          </div>
        </div>

        {/* Sub-view 4: Listen & Choose Quiz */}
        <div class="subview-content" id="subview-letters-quiz">
          <div class="quiz-container" id="lettersQuizContainer">
            <div class="quiz-header">
              <span class="quiz-badge">تحدي الأذن الذكية 🎧</span>
              <div class="quiz-score">النقاط: <strong id="quizScoreVal">0</strong> ⭐</div>
            </div>

            <div class="quiz-card">
              <p class="quiz-prompt">استمع للصوت ثم اضغط على الحرف المطابق:</p>
              <button type="button" class="quiz-listen-btn" id="playQuizAudioBtn">
                <i class="fa-solid fa-volume-high"></i> انقر للاستماع للصوت 🔊
              </button>

              <div class="quiz-options-grid" id="quizOptionsGrid">
                {/* Dynamically inserted 4 choices */}
              </div>

              <div class="quiz-result-banner" id="quizResultBanner" style="display:none;"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TAB 2: NUMBERS & MATH ─── */}
      <section class="kids-tab-panel" id="panel-numbers">
        <div class="kids-section-head">
          <span class="kids-pill-badge" style="background:#fef3c7;color:#d97706;">قسم الأرقام والرياضيات الممتعة</span>
          <h2>تعلم الأرقام <span>والعد الذكي</span></h2>
          <p>من الصفر حتى العشرين بالأشكال العربية والهندية، مع تمارين الجمع والطرح بالصور والفواكه الشهية!</p>
        </div>

        <div class="numbers-submode-bar">
          <button class="submode-pill active" data-sub="num-grid">
            <i class="fa-solid fa-1"></i> بطاقات الأرقام (0 - 20)
          </button>
          <button class="submode-pill" data-sub="num-count">
            <i class="fa-solid fa-apple-whole"></i> عد الأشياء 🍎
          </button>
          <button class="submode-pill" data-sub="num-math">
            <i class="fa-solid fa-plus-minus"></i> الجمع والطرح المصور
          </button>
        </div>

        {/* Numbers Grid */}
        <div class="subview-content active" id="subview-num-grid">
          <div class="numbers-grid" id="numbersGridContainer">
            {/* Populated dynamically from 0 to 20 */}
          </div>
        </div>

        {/* Counting objects */}
        <div class="subview-content" id="subview-num-count">
          <div class="counting-game-card">
            <div class="count-game-header">
              <h3>كم عدد هذه الأشياء يا ذكي؟ 🤔</h3>
              <span class="count-level-badge">المستوى: <b id="countLevelNum">1</b></span>
            </div>
            <div class="counting-items-display" id="countingItemsDisplay">
              {/* Items like 🍎 🍎 🍎 rendered dynamically */}
            </div>
            <p class="counting-question">اختر الرقم الصحيح:</p>
            <div class="counting-choices-row" id="countingChoicesRow">
              {/* 4 choices */}
            </div>
            <div class="counting-feedback" id="countingFeedback"></div>
          </div>
        </div>

        {/* Visual Addition / Subtraction */}
        <div class="subview-content" id="subview-num-math">
          <div class="math-game-card">
            <div class="math-mode-switch">
              <button class="math-mode-btn active" id="btnModeAdd">➕ عملية الجمع (معاً)</button>
              <button class="math-mode-btn" id="btnModeSub">➖ عملية الطرح (الباقي)</button>
            </div>

            <div class="math-visual-equation" id="mathVisualEquation">
              <div class="math-group" id="mathGroupA">
                <span class="math-items">🐱🐱🐱</span>
                <b class="math-num">3</b>
              </div>
              <div class="math-operator" id="mathOperator">+</div>
              <div class="math-group" id="mathGroupB">
                <span class="math-items">🐱🐱</span>
                <b class="math-num">2</b>
              </div>
              <div class="math-operator">=</div>
              <div class="math-group question-mark">
                <span class="math-box-unknown">❓</span>
              </div>
            </div>

            <div class="math-options-row" id="mathOptionsRow">
              {/* Choices */}
            </div>
            <div class="math-feedback" id="mathFeedback"></div>
          </div>
        </div>
      </section>

      {/* ─── TAB 3: QURAN MEMORIZATION ─── */}
      <section class="kids-tab-panel" id="panel-quran">
        <div class="kids-section-head">
          <span class="kids-pill-badge" style="background:#dcfce7;color:#15803d;">تحفيظ القرآن للصغار</span>
          <h2>حلقات تحفيظ <span>جزء عم المبارك</span></h2>
          <p>احفظ آية آية بصوت الشيخ المنشاوي معلم الأطفال، كرر واستمع، وجرب ميزة "الإخفاء التدريجي" لتختبر قوة حفظك!</p>
        </div>

        <div class="quran-kids-layout">
          {/* Surah List Sidebar */}
          <div class="quran-surahs-sidebar">
            <div class="surah-search-box">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="kidsSurahSearch" placeholder="ابحث عن السورة (مثلاً: الفاتحة، الإخلاص...)" />
            </div>

            <div class="surahs-cards-list" id="kidsSurahsList">
              {JUZ_AMMA_SURAHS.map((s, i) => (
                <div class={`surah-pill-card ${i === 0 ? 'selected' : ''}`} data-surahid={s.id} data-surahname={s.name} data-verses={s.count}>
                  <div class="surah-num">{s.id}</div>
                  <div class="surah-info">
                    <strong>سورة {s.name}</strong>
                    <small>{s.count} آيات • {s.type}</small>
                  </div>
                  <span class="surah-mem-badge" id={`memBadge_${s.id}`}>⚪ لم تبدأ</span>
                </div>
              ))}
            </div>
          </div>

          {/* Memorization Arena */}
          <div class="quran-memorize-arena">
            <div class="arena-header">
              <div class="arena-surah-title">
                <h3 id="currentSurahName">سورة الفاتحة</h3>
                <span id="currentSurahMeta">٧ آيات • مكية</span>
              </div>
              <div class="arena-top-actions">
                <button type="button" class="action-pill-btn" id="btnToggleMaskMode" title="إخفاء بعض الكلمات لاختبار الحفظ">
                  <i class="fa-solid fa-eye-slash"></i> <span>وضع الإخفاء الذكي</span>
                </button>
                <div class="repeat-counter-select">
                  <label>تكرار الآية:</label>
                  <select id="verseRepeatSelect">
                    <option value="1">مرة واحدة</option>
                    <option value="3" selected>٣ مرات (حفظ)</option>
                    <option value="5">٥ مرات (تثبيت)</option>
                    <option value="10">١٠ مرات (إتقان)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bismillah Banner */}
            <div class="bismillah-kids" id="bismillahBanner">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>

            {/* Verses Container */}
            <div class="verses-interactive-list" id="versesInteractiveList">
              {/* Populated by JS */}
              <div class="verses-loading-placeholder">
                <i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل آيات السورة المباركة...
              </div>
            </div>

            {/* Floating Audio Player for Kids */}
            <div class="kids-audio-player-strip" id="kidsAudioPlayerStrip">
              <div class="player-verse-label" id="currentPlayingVerseLabel">الآية ١</div>
              <div class="player-controls">
                <button type="button" class="player-btn prev" id="btnPrevVerse" title="الآية السابقة"><i class="fa-solid fa-forward-step"></i></button>
                <button type="button" class="player-btn play-main" id="btnPlayPauseVerse" title="تشغيل / إيقاف"><i class="fa-solid fa-play"></i></button>
                <button type="button" class="player-btn next" id="btnNextVerse" title="الآية التالية"><i class="fa-solid fa-backward-step"></i></button>
              </div>
              <div class="player-repeat-indicator" id="repeatCounterIndicator">التكرار: ١ / ٣</div>
              <button type="button" class="mark-memorized-btn" id="btnMarkSurahDone">
                <i class="fa-solid fa-check"></i> حفظت هذه السورة! 🎉
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TAB 4: DUAS & MANNERS ─── */}
      <section class="kids-tab-panel" id="panel-duas">
        <div class="kids-section-head">
          <span class="kids-pill-badge" style="background:#fae8ff;color:#a855f7;">حصن المسلم الصغير</span>
          <h2>أدعية وآداب <span>الطفل المسلم</span></h2>
          <p>أدعية اليوم والليلة، وآداب الطعام والنوم والمسجد، بأصوات نقية ورسوم توضيحية محببة لقلوب الصغار!</p>
        </div>

        <div class="duas-cards-grid">
          {KIDS_DUAS.map(dua => (
            <div class="kids-dua-card" style={`--dua-color: ${dua.color}`}>
              <div class="dua-top-row">
                <span class="dua-tag">{dua.tag}</span>
                <span class="dua-icon-box">{icon(dua.icon)}</span>
              </div>
              <h3 class="dua-card-title">{dua.title}</h3>
              <blockquote class="dua-card-text">"{dua.text}"</blockquote>
              <div class="dua-actions">
                <button type="button" class="dua-listen-btn" data-text={dua.text}>
                  <i class="fa-solid fa-volume-high"></i> استمع للدعاء
                </button>
                <button type="button" class="dua-copy-btn" data-copy={dua.text} title="نسخ الدعاء">
                  <i class="fa-solid fa-copy"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Islamic Manners Quiz: What would you do? */}
        <div class="manners-quiz-card">
          <div class="manners-badge">مسابقة الآداب: ماذا تفعل؟ 🌟</div>
          <h3 id="mannersQuestion">عندما تجلس مع أسرتك لتناول الطعام، ما أول شيء تقوله؟</h3>
          <div class="manners-choices" id="mannersChoices">
            <button type="button" class="manner-choice" data-correct="true">أقول "بِسْمِ اللَّهِ" وآكل بيدي اليمنى</button>
            <button type="button" class="manner-choice" data-correct="false">أبدأ الأكل مباشرة دون كلام</button>
            <button type="button" class="manner-choice" data-correct="false">أشرب وأنا واقف بسرعة</button>
          </div>
          <div class="manners-feedback" id="mannersFeedback"></div>
        </div>
      </section>

      {/* ─── TAB 5: DRAWING & COLORING ─── */}
      <section class="kids-tab-panel" id="panel-drawing">
        <div class="kids-section-head">
          <span class="kids-pill-badge" style="background:#fee2e2;color:#ef4444;">مرسم الفنان الصغير</span>
          <h2>لوحة الرسم <span>والتلوين الإبداعي</span></h2>
          <p>أطلق العنان لموهبتك! ارسم بحرية، لوّن المساجد والزهور، أو اتبع دروس "ارسم معي خطوة بخطوة"، واحفظ لوحاتك في معرضك الخاص!</p>
        </div>

        <div class="drawing-submode-bar">
          <button class="submode-pill active" data-sub="draw-free">
            <i class="fa-solid fa-palette"></i> الرسم الحر
          </button>
          <button class="submode-pill" data-sub="draw-coloring">
            <i class="fa-solid fa-fill-drip"></i> تلوين الرسوم الجاهزة
          </button>
          <button class="submode-pill" data-sub="draw-lessons">
            <i class="fa-solid fa-chalkboard-user"></i> دروس ارسم معي خطوة بخطوة 🎨
          </button>
          <button class="submode-pill" data-sub="draw-gallery">
            <i class="fa-solid fa-images"></i> معرض رسوماتي (<span id="galleryCountLabel">0</span>)
          </button>
        </div>

        {/* Free Drawing Studio */}
        <div class="subview-content active" id="subview-draw-free">
          <div class="drawing-studio-container">
            {/* Toolbar */}
            <div class="drawing-toolbar">
              <div class="tool-group">
                <span class="group-label">الأداة:</span>
                <button type="button" class="tool-btn active" id="toolPencil" title="فرشاة رسم"><i class="fa-solid fa-paintbrush"></i></button>
                <button type="button" class="tool-btn" id="toolEraser" title="ممحاة"><i class="fa-solid fa-eraser"></i></button>
              </div>

              <div class="tool-group">
                <span class="group-label">سُمك الخط:</span>
                <input type="range" id="brushSizeRange" min="2" max="40" value="8" />
                <span id="brushSizeVal">8px</span>
              </div>

              <div class="tool-group colors-palette">
                <span class="group-label">الألوان:</span>
                <div class="colors-row" id="colorsPalette">
                  {['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#17342f', '#ffffff'].map((hex, i) => (
                    <button type="button" class={`color-swatch ${i === 0 ? 'active' : ''}`} data-color={hex} style={`background: ${hex}`}></button>
                  ))}
                  <input type="color" id="customColorPicker" value="#ef4444" title="اختر أي لون تريده" />
                </div>
              </div>

              <div class="tool-group actions-group">
                <button type="button" class="action-btn-draw" id="btnUndoDraw" title="تراجع"><i class="fa-solid fa-rotate-left"></i></button>
                <button type="button" class="action-btn-draw" id="btnClearDraw" title="مسح اللوحة"><i class="fa-solid fa-trash-can"></i> مسح</button>
                <button type="button" class="action-btn-draw success" id="btnSaveDraw" title="حفظ في معرضي"><i class="fa-solid fa-cloud-arrow-up"></i> حفظ بالمعرض</button>
                <button type="button" class="action-btn-draw primary" id="btnDownloadDraw" title="تنزيل اللوحة كصورة"><i class="fa-solid fa-download"></i> تنزيل الصورة</button>
              </div>
            </div>

            {/* Drawing Canvas */}
            <div class="canvas-board-wrapper">
              <canvas id="kidsDrawingCanvas" width="900" height="520"></canvas>
            </div>
          </div>
        </div>

        {/* Ready to Color SVGs */}
        <div class="subview-content" id="subview-draw-coloring">
          <div class="coloring-arena">
            <div class="coloring-templates-bar" id="coloringTemplatesBar">
              <button class="template-choice active" data-shape="mosque">🕌 مسجد مبارك</button>
              <button class="template-choice" data-shape="crescent">🌙 هلال ونجمة</button>
              <button class="template-choice" data-shape="fish">🐟 سمكة مائية</button>
              <button class="template-choice" data-shape="flower">🌸 وردة جميلة</button>
              <button class="template-choice" data-shape="tree">🌳 شجرة خضراء</button>
            </div>

            <div class="coloring-workspace">
              <div class="coloring-palette" id="coloringPalette">
                {/* 12 vibrant colors */}
                {['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6', '#10b981', '#84cc16', '#eab308', '#f97316', '#78350f'].map((c, i) => (
                  <button type="button" class={`color-swatch-big ${i === 0 ? 'active' : ''}`} data-color={c} style={`background:${c}`}></button>
                ))}
              </div>

              <div class="coloring-svg-container" id="coloringSvgContainer">
                {/* Dynamically replaced with selected SVG */}
              </div>

              <div class="coloring-actions-row">
                <button type="button" class="action-btn-draw" id="btnResetColoring"><i class="fa-solid fa-rotate-left"></i> إعادة التلوين</button>
                <button type="button" class="action-btn-draw success" id="btnSaveColoring"><i class="fa-solid fa-camera"></i> حفظ هذه التلوينة 🖼️</button>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-step Lessons */}
        <div class="subview-content" id="subview-draw-lessons">
          <div class="drawing-lessons-grid" id="drawingLessonsGrid">
            {/* Populated by JS: How to draw a mosque, a ship, a cat, a car, a flower */}
          </div>
        </div>

        {/* My Saved Drawings Gallery */}
        <div class="subview-content" id="subview-draw-gallery">
          <div class="gallery-saved-wrap">
            <div class="gallery-empty-state" id="galleryEmptyState">
              <span class="empty-icon">🎨</span>
              <h3>معرضك ما زال ينتظر إبداعك!</h3>
              <p>ارسم أي لوحة في قسم الرسم الحر أو لوّن شكلاً واضغط على "حفظ بالمعرض" وستراها هنا دائماً!</p>
            </div>
            <div class="gallery-cards-grid" id="galleryCardsGrid">
              {/* Dynamic cards with delete/download buttons */}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TAB 6: EDUCATIONAL GAMES ─── */}
      <section class="kids-tab-panel" id="panel-games">
        <div class="kids-section-head">
          <span class="kids-pill-badge" style="background:#e0e7ff;color:#4338ca;">ألعاب تنمية الذكاء</span>
          <h2>العب <span>وتعلّم وامرح</span></h2>
          <p>ألعاب ممتعة تقوي الذاكرة وتثري لغتك العربية وحصيلتك الذكية!</p>
        </div>

        <div class="games-submode-bar">
          <button class="submode-pill active" data-sub="game-memory">
            <i class="fa-solid fa-clone"></i> لعبة الذاكرة (تطابق الحروف) 🧠
          </button>
          <button class="submode-pill" data-sub="game-scramble">
            <i class="fa-solid fa-puzzle-piece"></i> رتّب حروف الكلمة 🧩
          </button>
          <button class="submode-pill" data-sub="game-missing">
            <i class="fa-solid fa-magnifying-glass"></i> أين الحرف الناقص؟ 🔍
          </button>
        </div>

        {/* Game 1: Memory Cards */}
        <div class="subview-content active" id="subview-game-memory">
          <div class="memory-game-card">
            <div class="memory-status-bar">
              <div>المحاولات: <b id="memFlipsCount">0</b></div>
              <div>الأزواج المكتشفة: <b id="memMatchesCount">0 / 6</b></div>
              <button type="button" class="btn-restart-game" id="btnRestartMemory"><i class="fa-solid fa-rotate"></i> لعبة جديدة</button>
            </div>
            <div class="memory-cards-board" id="memoryCardsBoard">
              {/* 12 cards (6 pairs) generated dynamically */}
            </div>
          </div>
        </div>

        {/* Game 2: Word Scramble */}
        <div class="subview-content" id="subview-game-scramble">
          <div class="scramble-game-card">
            <div class="scramble-header">
              <span class="scramble-img" id="scrambleEmoji">🦁</span>
              <h3 id="scramblePrompt">رتّب الحروف لتكوين الكلمة المطابقة للصورة:</h3>
            </div>

            <div class="scramble-slots-row" id="scrambleSlotsRow">
              {/* Empty drop slots */}
            </div>

            <div class="scramble-tiles-row" id="scrambleTilesRow">
              {/* Shuffled letters */}
            </div>

            <div class="scramble-actions">
              <button type="button" class="submode-pill" id="btnCheckScramble">تحقق من الترتيب ✨</button>
              <button type="button" class="submode-pill" id="btnNextScramble">كلمة تالية ➡️</button>
            </div>
            <div class="scramble-feedback" id="scrambleFeedback"></div>
          </div>
        </div>

        {/* Game 3: Missing Letter */}
        <div class="subview-content" id="subview-game-missing">
          <div class="missing-game-card">
            <div class="missing-header">
              <span id="missingEmoji">🍎</span>
              <h3>ما هو الحرف الناقص في هذه الكلمة؟</h3>
            </div>
            <div class="missing-word-display" id="missingWordDisplay">
              <span>تُـ</span><span class="missing-placeholder">؟</span><span>ـاح</span>
            </div>
            <div class="missing-choices-row" id="missingChoicesRow">
              {/* 4 choices */}
            </div>
            <div class="missing-feedback" id="missingFeedback"></div>
          </div>
        </div>
      </section>

      {/* ─── TAB 7: STAR BOARD & CERTIFICATE ─── */}
      <section class="kids-tab-panel" id="panel-stars">
        <div class="kids-section-head">
          <span class="kids-pill-badge" style="background:#fef9c3;color:#ca8a04;">لوحة الشرف والإنجازات</span>
          <h2>نجومك وكؤوسك <span>وشهادة تفوقك</span></h2>
          <p>كل حرف تتعلمه، وسورة تحفظها، ورسمة تبدعها، تمنحك نجوماً وكؤوساً لتطبع شهادة تفوقك باسمك الصغير!</p>
        </div>

        <div class="star-board-wrap">
          <div class="star-hero-card">
            <div class="star-crown-badge">👑</div>
            <h3 id="certPlayerName">بطل واحة الدكتور عمر هشام</h3>
            <p id="certPlayerSub">أنجزت خطوات عظيمة في طلب العلم والقرآن والإبداع!</p>
            <div class="star-big-counter">
              <span class="star-icon">⭐</span>
              <span class="star-number" id="certStarsTotal">0</span>
              <span class="star-label">نجمة متلألئة</span>
            </div>
            <div class="certificate-generate-action">
              <button type="button" class="primary-btn kids-cert-btn" id="btnOpenCertModal">
                <i class="fa-solid fa-award"></i> عرض وطباعة شهادة التفوق باسمي 📜
              </button>
            </div>
          </div>

          <div class="badges-grid-trophies" id="badgesTrophiesGrid">
            <div class="trophy-card" data-badge="letters_10">
              <div class="trophy-icon">🔤</div>
              <h4>قارئ مبتدئ</h4>
              <p>تعلم أول 10 حروف بنجاح</p>
              <span class="badge-status" id="badge_letters_10">🔒 قيد الإنجاز</span>
            </div>
            <div class="trophy-card" data-badge="letters_all">
              <div class="trophy-icon">🏅</div>
              <h4>بطل الحروف العربية</h4>
              <p>أتقن جميع الـ 28 حرفاً</p>
              <span class="badge-status" id="badge_letters_all">🔒 قيد الإنجاز</span>
            </div>
            <div class="trophy-card" data-badge="quran_fatiha">
              <div class="trophy-icon">🕌</div>
              <h4>حافظ الفاتحة</h4>
              <p>إتمام حفظ سورة الفاتحة المباركة</p>
              <span class="badge-status" id="badge_quran_fatiha">🔒 قيد الإنجاز</span>
            </div>
            <div class="trophy-card" data-badge="quran_5">
              <div class="trophy-icon">🏆</div>
              <h4>حافظ الصغار (5 سور)</h4>
              <p>حفظ 5 سور من قصار السور</p>
              <span class="badge-status" id="badge_quran_5">🔒 قيد الإنجاز</span>
            </div>
            <div class="trophy-card" data-badge="draw_first">
              <div class="trophy-icon">🎨</div>
              <h4>الفنان الصغير</h4>
              <p>حفظ أول لوحة في معرضك</p>
              <span class="badge-status" id="badge_draw_first">🔒 قيد الإنجاز</span>
            </div>
            <div class="trophy-card" data-badge="game_champ">
              <div class="trophy-icon">🧠</div>
              <h4>العبقري الصغير</h4>
              <p>الفوز في 5 ألعاب ذكاء</p>
              <span class="badge-status" id="badge_game_champ">🔒 قيد الإنجاز</span>
            </div>
          </div>
        </div>

        {/* Printable Certificate Modal */}
        <div class="kids-cert-modal" id="kidsCertModal" style="display:none;">
          <div class="cert-modal-backdrop" id="closeCertModalBg"></div>
          <div class="cert-sheet-container">
            <button class="cert-close-btn" id="closeCertModalBtn"><i class="fa-solid fa-xmark"></i></button>
            <div class="cert-printable-box" id="certPrintArea">
              <div class="cert-frame-outer">
                <div class="cert-frame-inner">
                  <div class="cert-corner c-tl"></div>
                  <div class="cert-corner c-tr"></div>
                  <div class="cert-corner c-bl"></div>
                  <div class="cert-corner c-br"></div>

                  <div class="cert-header">
                    <img src="/static/foundation-logo.png" alt="شعار المؤسسة" class="cert-logo" />
                    <h2>مؤسسة الدكتور عمر هشام الخيرية</h2>
                    <p class="cert-foundation-sub">واحة التعليم القرآني والتربوي للبراعم</p>
                  </div>

                  <div class="cert-badge-ribbon">⭐ شهادة تفوق وتقدير ⭐</div>

                  <p class="cert-grant-text">تسر إدارة المؤسسة أن تمنح هذه الشهادة المعتمدة للبطل المتميز:</p>

                  <div class="cert-name-input-row">
                    <input type="text" id="certChildNameInput" placeholder="اكتب اسمك هنا (مثلاً: أحمد محمود)" value="البطل المتميز" />
                  </div>

                  <p class="cert-statement">
                    تقديراً لجهده الرائع وتميزه في تعلّم القراءة والقرآن الكريم والإبداع في واحة أطفال المؤسسة، مع تمنياتنا له بمستقبل زاهر وأن يجعله الله قرة عين لوالديه ونفعاً لأمته.
                  </p>

                  <div class="cert-meta-row">
                    <div class="meta-item">
                      <small>الرصيد المنجز:</small>
                      <strong id="certStarsPrintVal">⭐ 120 نجمة</strong>
                    </div>
                    <div class="meta-item">
                      <small>التاريخ:</small>
                      <strong id="certDatePrintVal">2026</strong>
                    </div>
                    <div class="meta-item">
                      <small>الختم والاعتماد:</small>
                      <span class="cert-stamp">مؤسسة د. عمر هشام</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="cert-actions-footer">
              <button type="button" class="primary-btn" id="btnPrintCert"><i class="fa-solid fa-print"></i> طباعة الشهادة / حفظ PDF</button>
              <button type="button" class="outline-btn" id="btnCancelCert">إغلاق</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TAB 8: PARENT'S DASHBOARD ─── */}
      <section class="kids-tab-panel" id="panel-parents">
        <div class="kids-section-head">
          <span class="kids-pill-badge" style="background:#f1f5f9;color:#334155;">متابعة ولي الأمر</span>
          <h2>تقرير أداء وتقدم <span>طفلك العزيز</span></h2>
          <p>تابع تقدم طفلك في حفظ القرآن، وإتقان الحروف، والأدعية، ورسوماته المحفوظة بكل سهولة وخصوصية تامة محفوظة على جهازك.</p>
        </div>

        <div class="parents-stats-grid">
          <div class="parent-kpi-card">
            <div class="kpi-icon-box" style="background:rgba(245,158,11,0.15);color:#d97706;">⭐</div>
            <div>
              <p>مجموع النجوم المحصلة</p>
              <b id="parentTotalStars">0</b>
            </div>
          </div>

          <div class="parent-kpi-card">
            <div class="kpi-icon-box" style="background:rgba(16,185,129,0.15);color:#059669;">🔤</div>
            <div>
              <p>الحروف التي تم التفاعل معها</p>
              <b id="parentLettersProgress">0 / 28</b>
            </div>
          </div>

          <div class="parent-kpi-card">
            <div class="kpi-icon-box" style="background:rgba(59,130,246,0.15);color:#2563eb;">🕌</div>
            <div>
              <p>السور المحفوظة من جزء عم</p>
              <b id="parentSurahsProgress">0 / 37</b>
            </div>
          </div>

          <div class="parent-kpi-card">
            <div class="kpi-icon-box" style="background:rgba(239,68,68,0.15);color:#dc2626;">🎨</div>
            <div>
              <p>الرسومات المحفوظة بالمعرض</p>
              <b id="parentDrawingsCount">0</b>
            </div>
          </div>
        </div>

        <div class="parent-tips-card">
          <h3>💡 نصائح تربوية لتشجيع طفلك:</h3>
          <ul>
            <li>✨ <strong>التشجيع الإيجابي:</strong> امدح جهد طفلك وتكراره وليس فقط النتيجة. عندما يحفظ آية كافئه بابتسامة وعناق.</li>
            <li>🎧 <strong>الاستماع المتكرر:</strong> دع تلاوة السور القصيرة تعمل في خلفية المنزل بهدوء لترسيخها في ذاكرة الطفل السمعية.</li>
            <li>🎨 <strong>الربط بين التعلم واللعب:</strong> شجعه على رسم ما يتعلمه (رسم مسجد، رسم نخلة، رسم هلال) لترسيخ المعاني الجميلة.</li>
            <li>⏱️ <strong>فترات قصيرة ومستمرة:</strong> 15 دقيقة يومياً أفضل بكثير من ساعة واحدة متقطعة في الأسبوع.</li>
          </ul>

          <div class="parent-reset-row">
            <button type="button" class="danger-btn-outline" id="btnResetChildProgress">
              <i class="fa-solid fa-arrows-rotate"></i> تصفير بيانات التقدم والبدء من جديد
            </button>
            <small>ملاحظة: البيانات محفوظة محلياً في متصفحك (localStorage) ولا تُشارك مع أي طرف آخر حفاظاً على خصوصيتكم.</small>
          </div>
        </div>
      </section>

      {/* Confetti Container */}
      <div id="kidsConfettiOverlay" class="confetti-overlay" pointer-events="none"></div>

      {/* Script for Kids Learning Hub */}
      <script src="/static/kids.js?v=1.0"></script>
    </Layout>
  )
}
