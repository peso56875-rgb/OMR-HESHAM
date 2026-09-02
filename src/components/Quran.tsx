import { Layout, icon } from './shared'
import type { UserSession } from '../types'

export function QuranHub({ user, initialSurah }: { user?: UserSession, initialSurah?: string }) {
  return (
    <Layout
      user={user}
      title="واحة القرآن الكريم والأذكار والورد اليومي | مؤسسة الدكتور عمر هشام الخيرية"
      description="مصحف إلكتروني متكامل، تلاوات بأصوات كبار القراء، أذكار الصباح والمساء، سبحة إلكترونية ذكية، أدعية مأثورة، وحاسبة للورد اليومي وختمة القرآن."
      image="/static/img/og-image.png"
    >
      {/* ─── Hero Section ─── */}
      <section class="page-hero quran-hero">
        <div class="quran-hero-pattern"></div>
        <div class="hero-glow"></div>
        <div class="quran-hero-content">
          <p class="eyebrow reveal">{icon('fa-book-quran')} الواحة الإيمانية والقرآنية</p>
          <h1 class="reveal">القرآن الكريم <span>والأذكار</span></h1>
          <p class="reveal quran-hero-subtitle">
            "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ" — تلاوة وقراءة وتدبر، أذكار اليوم والليلة، سبحة ذكية، وأدعية مباركة صدقةً جارية لروح د. عمر هشام وموتى المسلمين.
          </p>

          {/* Quick Stats / Highlights */}
          <div class="quran-hero-badges reveal">
            <div class="quran-badge-pill">
              {icon('fa-book-open')} <span>١١٤ سورة كاملة</span>
            </div>
            <div class="quran-badge-pill">
              {icon('fa-headphones')} <span>تلاوات كبار القراء</span>
            </div>
            <div class="quran-badge-pill">
              {icon('fa-sun')} <span>أذكار وحصن المسلم</span>
            </div>
            <div class="quran-badge-pill">
              {icon('fa-fingerprint')} <span>سبحة إلكترونية ذكية</span>
            </div>
            <div class="quran-badge-pill">
              {icon('fa-tower-broadcast')} <span>بث إذاعة القرآن</span>
            </div>
          </div>
        </div>

        {/* Daily Quran Verse Banner */}
        <div class="daily-ayah-card reveal" id="dailyAyahCard">
          <div class="daily-ayah-header">
            <span class="daily-ayah-tag">{icon('fa-star-and-crescent')} آية وتأمل اليوم</span>
            <span class="daily-ayah-ref" id="dailyAyahRef">سورة البقرة • آية ٢٨٦</span>
          </div>
          <blockquote class="daily-ayah-text" id="dailyAyahText">
            "رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ"
          </blockquote>
          <div class="daily-ayah-actions">
            <button type="button" class="ayah-action-btn" id="copyDailyAyahBtn" title="نسخ الآية">
              {icon('fa-copy')} <span>نسخ</span>
            </button>
            <button type="button" class="ayah-action-btn" id="shareDailyAyahBtn" title="مشاركة على واتساب">
              {icon('fa-share-nodes')} <span>مشاركة</span>
            </button>
            <button type="button" class="ayah-action-btn" id="playDailyAyahBtn" title="استماع للآية">
              {icon('fa-play')} <span>استماع</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Main Section with Navigation Tabs ─── */}
      <section class="section-pad quran-section-wrap">
        <div class="quran-container">

          {/* Navigation Tabs Bar */}
          <div class="quran-nav-tabs" role="tablist" aria-label="أقسام الواحة القرآنية">
            <button class="quran-tab-btn active" data-tab="mushaf" role="tab" aria-selected="true">
              {icon('fa-book-open')}
              <span>المصحف والتلاوات</span>
            </button>
            <button class="quran-tab-btn" data-tab="adhkar" role="tab" aria-selected="false">
              {icon('fa-hands-praying')}
              <span>حصن المسلم والأذكار</span>
            </button>
            <button class="quran-tab-btn" data-tab="tasbeeh" role="tab" aria-selected="false">
              {icon('fa-fingerprint')}
              <span>السبحة الذكية</span>
            </button>
            <button class="quran-tab-btn" data-tab="duas" role="tab" aria-selected="false">
              {icon('fa-heart-pulse')}
              <span>الأدعية المأثورة</span>
            </button>
            <button class="quran-tab-btn" data-tab="khatmah" role="tab" aria-selected="false">
              {icon('fa-calendar-check')}
              <span>الورد والختمة</span>
            </button>
            <button class="quran-tab-btn" data-tab="radio" role="tab" aria-selected="false">
              {icon('fa-radio')}
              <span>إذاعات القرآن</span>
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              TAB 1: المصحف الشريف والتلاوات (Quran Mushaf & Recitations)
              ════════════════════════════════════════════════════════════════════ */}
          <div class="quran-tab-pane active" id="tab-mushaf">
            
            {/* Top Toolbar: Search, Reciter Select, Last Read Resume */}
            <div class="mushaf-toolbar">
              <div class="mushaf-search-box">
                {icon('fa-magnifying-glass')}
                <input type="text" id="surahSearchInput" placeholder="ابحث باسم السورة، رقمها، أو مكان النزول..." autocomplete="off" />
                <button type="button" class="clear-search-btn" id="clearSurahSearch" aria-label="مسح البحث" style="display: none;">
                  {icon('fa-xmark')}
                </button>
              </div>

              <div class="mushaf-reciter-selector">
                <label for="reciterSelect">{icon('fa-microphone-lines')} القارئ:</label>
                <select id="reciterSelect" class="reciter-dropdown">
                  <option value="minshawi" selected>الشيخ محمد صديق المنشاوي (مرتل)</option>
                  <option value="minshawi_mujawwad">الشيخ محمد صديق المنشاوي (مجود)</option>
                  <option value="abdulbasit">الشيخ عبد الباسط عبد الصمد (مرتل)</option>
                  <option value="abdulbasit_mujawwad">الشيخ عبد الباسط عبد الصمد (مجود)</option>
                  <option value="yasser">الشيخ ياسر الدوسري</option>
                  <option value="husary">الشيخ محمود خليل الحصري</option>
                  <option value="afs">الشيخ مشاري راشد العفاسي</option>
                  <option value="ghamadi">الشيخ سعد الغامدي</option>
                  <option value="maher">الشيخ ماهر المعيقلي</option>
                  <option value="ajmy">الشيخ أحمد العجمي</option>
                  <option value="shuraim">الشيخ سعود الشريم</option>
                  <option value="hudhaify">الشيخ علي الحذيفي</option>
                </select>
              </div>

              {/* Bookmark Quick Resume */}
              <div class="mushaf-bookmark-resume" id="bookmarkResumeBox" style="display: none;">
                <button type="button" class="resume-read-btn" id="resumeReadBtn">
                  {icon('fa-bookmark')}
                  <span>متابعة القراءة: <b id="bookmarkSurahName">-</b> (آية <span id="bookmarkAyahNum">١</span>)</span>
                </button>
              </div>
            </div>

            {/* Surah Filter Chips */}
            <div class="surah-filter-chips">
              <button type="button" class="surah-chip active" data-filter="all">جميع السور (١١٤)</button>
              <button type="button" class="surah-chip" data-filter="meccan">مكية (٨٦)</button>
              <button type="button" class="surah-chip" data-filter="medinan">مدنية (٢٨)</button>
              <button type="button" class="surah-chip" data-filter="favorites">{icon('fa-heart')} المفضلة</button>
            </div>

            {/* Surahs Grid */}
            <div class="surahs-grid" id="surahsGrid">
              {/* Rendered dynamically with JS for fast search and offline support */}
              <div class="quran-loading-box">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <p>جاري تحميل فهرس القرآن الكريم والتلاوات...</p>
              </div>
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════════════
              TAB 2: الأذكار وحصن المسلم (Adhkar & Fortress of the Muslim)
              ════════════════════════════════════════════════════════════════════ */}
          <div class="quran-tab-pane" id="tab-adhkar">
            
            {/* Adhkar Categories Bar */}
            <div class="adhkar-categories-nav" id="adhkarCategoriesNav">
              <button class="adhkar-cat-btn active" data-cat="morning">
                {icon('fa-sun')} <span>أذكار الصباح</span>
              </button>
              <button class="adhkar-cat-btn" data-cat="evening">
                {icon('fa-moon')} <span>أذكار المساء</span>
              </button>
              <button class="adhkar-cat-btn" data-cat="after_prayer">
                {icon('fa-mosque')} <span>أذكار بعد الصلاة</span>
              </button>
              <button class="adhkar-cat-btn" data-cat="sleep">
                {icon('fa-bed')} <span>أذكار النوم والاستيقاظ</span>
              </button>
              <button class="adhkar-cat-btn" data-cat="waking">
                {icon('fa-cloud-sun')} <span>أدعية الاستيقاظ</span>
              </button>
              <button class="adhkar-cat-btn" data-cat="food_travel">
                {icon('fa-utensils')} <span>الطعام والسفر والمنزل</span>
              </button>
              <button class="adhkar-cat-btn" data-cat="ruqyah">
                {icon('fa-shield-halved')} <span>الرقية الشرعية</span>
              </button>
            </div>

            {/* Adhkar Progress & Quick Reset Header */}
            <div class="adhkar-status-card">
              <div class="adhkar-status-info">
                <h3 id="adhkarCurrentTitle">أذكار الصباح</h3>
                <p id="adhkarSubtitle">حصنك اليومي وبركة يومك — اضغط على كل ذكر لإنقاص العداد</p>
              </div>
              <div class="adhkar-status-meta">
                <div class="adhkar-progress-pill">
                  <span>تم إنجاز:</span>
                  <strong id="adhkarDoneCount">٠</strong> من <span id="adhkarTotalCount">٢٤</span>
                </div>
                <button type="button" class="adhkar-reset-btn" id="resetAdhkarBtn" title="إعادة تعيين العدادات">
                  {icon('fa-rotate-right')} <span>إعادة البدء</span>
                </button>
              </div>
            </div>

            {/* Adhkar Cards List */}
            <div class="adhkar-cards-list" id="adhkarCardsList">
              {/* Dynamic adhkar items populated by quran.js */}
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════════════
              TAB 3: السبحة الإلكترونية الذكية (Digital Smart Tasbeeh)
              ════════════════════════════════════════════════════════════════════ */}
          <div class="quran-tab-pane" id="tab-tasbeeh">
            <div class="tasbeeh-layout-wrapper">
              
              {/* Main Tasbeeh Counter Circle */}
              <div class="tasbeeh-card-main">
                
                {/* Zikr Heading Display */}
                <div class="tasbeeh-zikr-badge">
                  <span class="tasbeeh-icon">{icon('fa-gem')}</span>
                  <h3 id="activeTasbeehText">سُبْحَانَ اللَّهِ وَبِحَمْدِهِ</h3>
                </div>

                {/* Interactive Big Circle */}
                <div class="tasbeeh-circle-container" id="tasbeehTriggerBtn" role="button" tabIndex={0} aria-label="اضغط للتسبيح">
                  <svg class="tasbeeh-svg-ring" viewBox="0 0 240 240">
                    <circle class="ring-track" cx="120" cy="120" r="105" />
                    <circle class="ring-progress" id="tasbeehProgressRing" cx="120" cy="120" r="105" />
                  </svg>

                  <div class="tasbeeh-inner-display">
                    <span class="tasbeeh-sublabel">التسبيحات الحالية</span>
                    <span class="tasbeeh-counter-number" id="tasbeehCount">٠</span>
                    <span class="tasbeeh-target-hint">الهدف: <b id="tasbeehTargetDisplay">٣٣</b></span>
                    <span class="tasbeeh-tap-hint">{icon('fa-hand-pointer')} اضغط للتسبيح</span>
                  </div>
                </div>

                {/* Tasbeeh Quick Controls */}
                <div class="tasbeeh-controls-row">
                  <button type="button" class="tasbeeh-btn-secondary" id="tasbeehResetBtn" title="تصفير العداد">
                    {icon('fa-rotate-left')} <span>تصفير</span>
                  </button>

                  <button type="button" class="tasbeeh-btn-secondary" id="tasbeehHapticToggle" title="كتم/تفعيل الاهتزاز">
                    <i class="fa-solid fa-mobile-screen" id="hapticIcon"></i>
                    <span id="hapticLabel">الاهتزاز: مفعّل</span>
                  </button>

                  <button type="button" class="tasbeeh-btn-secondary" id="tasbeehSoundToggle" title="كتم/تفعيل الصوت">
                    <i class="fa-solid fa-volume-high" id="soundIcon"></i>
                    <span id="soundLabel">الصوت: مفعّل</span>
                  </button>
                </div>

                {/* Target Selector */}
                <div class="tasbeeh-targets-bar">
                  <span>اختر الهدف:</span>
                  <div class="target-pills">
                    <button type="button" class="target-pill active" data-target="33">٣٣</button>
                    <button type="button" class="target-pill" data-target="100">١٠٠</button>
                    <button type="button" class="target-pill" data-target="1000">١٠٠٠</button>
                    <button type="button" class="target-pill" data-target="0">مفتوح ∞</button>
                  </div>
                </div>

              </div>

              {/* Side Panel: Zikr Presets & Stats */}
              <div class="tasbeeh-side-panel">
                
                {/* Stats Widget */}
                <div class="tasbeeh-stats-card">
                  <h4>{icon('fa-chart-pie')} إحصائياتك الإيمانية</h4>
                  <div class="tasbeeh-stats-grid">
                    <div class="stat-box">
                      <span class="stat-label">تسبيحات اليوم</span>
                      <strong class="stat-val" id="todayTasbeehTotal">٠</strong>
                    </div>
                    <div class="stat-box">
                      <span class="stat-label">إجمالي كل التسبيحات</span>
                      <strong class="stat-val" id="allTimeTasbeehTotal">٠</strong>
                    </div>
                    <div class="stat-box">
                      <span class="stat-label">أهداف أُنجزت</span>
                      <strong class="stat-val" id="completedTargetsCount">٠</strong>
                    </div>
                  </div>
                </div>

                {/* Famous Azkar List Picker */}
                <div class="tasbeeh-presets-card">
                  <h4>{icon('fa-list-check')} اختر صيغة الذكر والتسبيح</h4>
                  <div class="tasbeeh-presets-list" id="tasbeehPresetsList">
                    {/* Dynamic Azkar list in quran.js */}
                  </div>

                  {/* Add Custom Zikr */}
                  <div class="custom-zikr-form">
                    <input type="text" id="customZikrInput" placeholder="أضف ذكراً أو دعاءً خاصاً..." maxLength={80} />
                    <button type="button" id="addCustomZikrBtn">{icon('fa-plus')} إضافة</button>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              TAB 4: الأدعية المأثورة ومناجاة (Duas & Supplications)
              ════════════════════════════════════════════════════════════════════ */}
          <div class="quran-tab-pane" id="tab-duas">
            
            {/* Dedicated Hero Card for Dr. Omar Hesham Memorial Duas */}
            <div class="deceased-dua-hero-card">
              <div class="deceased-dua-ribbon">
                {icon('fa-heart')} <span>صدقة جارية ودعاء للمرحوم بإذن الله</span>
              </div>
              <h3>دعاء للمرحوم د. عمر هشام وموتى المسلمين جميعاً</h3>
              <p class="deceased-dua-intro">
                "إِذَا مَاتَ ابنُ آدَمَ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ: صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ"
              </p>
              <div class="deceased-dua-box">
                <blockquote id="omarMemorialDua">
                  "اللَّهُمَّ اغْفِرْ لِعَبْدِكَ د. عُمَرَ هِشَامٍ، وَارْفَعْ دَرَجَتَهُ فِي الْمَهْدِيِّينَ، وَاخْلُفْهُ فِي عَقِبِهِ فِي الْغَابِرِينَ، وَاغْفِرْ لَنَا وَلَهُ يَا رَبَّ الْعَالَمِينَ، وَافْسَحْ لَهُ فِي قَبْرِهِ وَنَوِّرْ لَهُ فِيهِ. اللَّهُمَّ اجْعَلْ كُلَّ صَدَقَةٍ وَعِلْمٍ وَنَفْعٍ فِي مِيزَانِ حَسَنَاتِهِ، وَاجْمَعْنَا بِهِ فِي جَنَّاتِ النَّعِيمِ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ وَالصَّالِحِينَ."
                </blockquote>
                <div class="dua-card-actions">
                  <button type="button" class="dua-btn copy-btn" data-copy="omarMemorialDua">
                    {icon('fa-copy')} <span>نسخ الدعاء</span>
                  </button>
                  <button type="button" class="dua-btn share-btn" data-share="omarMemorialDua">
                    {icon('fa-share-nodes')} <span>مشاركة الأجر</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Duas Category Tabs */}
            <div class="duas-category-nav" id="duasCategoryNav">
              <button class="dua-cat-pill active" data-cat="all">الكل</button>
              <button class="dua-cat-pill" data-cat="quranic">{icon('fa-book-quran')} أدعية قرآنية</button>
              <button class="dua-cat-pill" data-cat="prophetic">{icon('fa-hands')} أدعية نبوية</button>
              <button class="dua-cat-pill" data-cat="relief">{icon('fa-sun')} تفريج الكرب والهم</button>
              <button class="dua-cat-pill" data-cat="healing">{icon('fa-heart-pulse')} الشفاء والعافية</button>
              <button class="dua-cat-pill" data-cat="rizq">{icon('fa-seedling')} الرزق والبركة</button>
              <button class="dua-cat-pill" data-cat="forgiveness">{icon('fa-water')} المغفرة والتوبة</button>
              <button class="dua-cat-pill" data-cat="khatm">{icon('fa-book')} دعاء ختم القرآن</button>
            </div>

            {/* Duas Grid */}
            <div class="duas-grid" id="duasGrid">
              {/* Dynamic Dua Cards generated in quran.js */}
            </div>

          </div>

          {/* ════════════════════════════════════════════════════════════════════
              TAB 5: الورد اليومي ومتابع الختمة (Daily Wird & Khatmah Planner)
              ════════════════════════════════════════════════════════════════════ */}
          <div class="quran-tab-pane" id="tab-khatmah">
            <div class="khatmah-grid-layout">
              
              {/* Left: Khatmah Plan Calculator */}
              <div class="khatmah-calculator-card">
                <div class="card-head-pill">
                  {icon('fa-calculator')} <span>حاسبة ختمة القرآن</span>
                </div>
                <h3>خطط لختمتك القادمة</h3>
                <p>حدد المدة الزمنية التي ترغب بختم القرآن الكريم خلالها وسنقوم بحساب وردك اليومي بدقة:</p>

                <div class="khatmah-plans-selector">
                  <div class="plan-card active" data-days="30">
                    <span class="plan-duration">٣٠ يوماً</span>
                    <span class="plan-detail">جزء كامل يومياً (٤ صفحات بعد كل صلاة)</span>
                  </div>
                  <div class="plan-card" data-days="60">
                    <span class="plan-duration">٦٠ يوماً</span>
                    <span class="plan-detail">نصف جزء يومياً (صفحتان بعد كل صلاة)</span>
                  </div>
                  <div class="plan-card" data-days="15">
                    <span class="plan-duration">١٥ يوماً</span>
                    <span class="plan-detail">جزآن يومياً (٨ صفحات بعد كل صلاة)</span>
                  </div>
                  <div class="plan-card" data-days="10">
                    <span class="plan-duration">١٠ أيام (رمضان/عشر ذي الحجة)</span>
                    <span class="plan-detail">٣ أجزاء يومياً</span>
                  </div>
                </div>

                {/* Khatmah Progress Visualizer */}
                <div class="khatmah-progress-box">
                  <div class="khatmah-progress-head">
                    <span>نسبة إنجاز الختمة الحالية:</span>
                    <strong id="khatmahPercent">٠٪</strong>
                  </div>
                  <div class="khatmah-progress-bar">
                    <div class="khatmah-progress-fill" id="khatmahProgressFill" style="width: 0%"></div>
                  </div>
                  <div class="khatmah-progress-footer">
                    <span>تم قراءة <b id="khatmahJuzDone">٠</b> من ٣٠ جزء</span>
                    <button type="button" class="khatmah-action-btn" id="updateKhatmahProgressBtn">
                      {icon('fa-pen-to-square')} تسجيل التقدم
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Daily Spiritual Checklist */}
              <div class="daily-wird-card">
                <div class="card-head-pill">
                  {icon('fa-calendar-check')} <span>جدول الورد اليومي</span>
                </div>
                <h3>مهام اليوم الإيمانية</h3>
                <p>قائمة يومية تتجدد تلقائياً لمساعدتك على المداومة والاستقامة:</p>

                <div class="wird-tasks-list" id="dailyWirdTasksList">
                  <label class="wird-task-item">
                    <input type="checkbox" data-task="fajr_wird" />
                    <span class="custom-check"></span>
                    <div class="task-info">
                      <strong>ورد الفجر القرآني</strong>
                      <small>قراءة ٤ صفحات مع تدبر الآيات</small>
                    </div>
                  </label>

                  <label class="wird-task-item">
                    <input type="checkbox" data-task="morning_adhkar" />
                    <span class="custom-check"></span>
                    <div class="task-info">
                      <strong>أذكار الصباح</strong>
                      <small>حصن اليوم والبركة في الرزق</small>
                    </div>
                  </label>

                  <label class="wird-task-item">
                    <input type="checkbox" data-task="duha_prayer" />
                    <span class="custom-check"></span>
                    <div class="task-info">
                      <strong>صلاة الضحى</strong>
                      <small>صلاة الأوابين (ركعتان على الأقل)</small>
                    </div>
                  </label>

                  <label class="wird-task-item">
                    <input type="checkbox" data-task="dhuhr_wird" />
                    <span class="custom-check"></span>
                    <div class="task-info">
                      <strong>ورد الظهر والعصر</strong>
                      <small>قراءة ٤ صفحات ومتابعة الختمة</small>
                    </div>
                  </label>

                  <label class="wird-task-item">
                    <input type="checkbox" data-task="evening_adhkar" />
                    <span class="custom-check"></span>
                    <div class="task-info">
                      <strong>أذكار المساء</strong>
                      <small>حفظ وأمان حتى تصبح</small>
                    </div>
                  </label>

                  <label class="wird-task-item">
                    <input type="checkbox" data-task="tasbeeh_daily" />
                    <span class="custom-check"></span>
                    <div class="task-info">
                      <strong>١٠٠ تسبيحة واستغفار</strong>
                      <small>سبحان الله وبحمده ١٠٠ مرة</small>
                    </div>
                  </label>

                  <label class="wird-task-item">
                    <input type="checkbox" data-task="salawat" />
                    <span class="custom-check"></span>
                    <div class="task-info">
                      <strong>الصلاة على النبي ﷺ</strong>
                      <small>١٠٠ مرة من الصلاة الإبراهيمية</small>
                    </div>
                  </label>

                  <label class="wird-task-item">
                    <input type="checkbox" data-task="night_dua" />
                    <span class="custom-check"></span>
                    <div class="task-info">
                      <strong>قيام الليل أو الشفع والوتر</strong>
                      <small>دعاء صادق في جوف الليل</small>
                    </div>
                  </label>
                </div>

                <div class="wird-completion-banner" id="wirdCompletionBanner" style="display: none;">
                  {icon('fa-circle-check')}
                  <span>ما شاء الله! أتممت جميع مهامك الإيمانية لليوم. تقبل الله طاعاتكم.</span>
                </div>
              </div>

            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              TAB 6: إذاعات القرآن الكريم المباشرة (Quran Radios)
              ════════════════════════════════════════════════════════════════════ */}
          <div class="quran-tab-pane" id="tab-radio">
            <div class="radio-section-header">
              <h3>{icon('fa-radio')} إذاعات القرآن الكريم على مدار الساعة</h3>
              <p>استمع إلى البث المباشر لإذاعة القرآن الكريم والتلاوات الخاشعة بجودة صوتية فائقة:</p>
            </div>

            <div class="radios-grid" id="radiosGrid">
              {/* Radio Stations rendered in quran.js */}
            </div>
          </div>

        </div>
      </section>

      {/* ─── Modern Full-Page Quran Reading Sanctuary (المصحف التفاعلي الكامل) ─── */}
      <div class="quran-reader-modal fullscreen-sanctuary" id="quranReaderModal" aria-hidden="true">
        <div class="quran-reader-backdrop" id="quranReaderBackdrop"></div>
        <div class="quran-reader-dialog">

          {/* Reading Progress Line */}
          <div class="reader-progress-track">
            <div class="reader-progress-bar" id="readerProgressBar"></div>
          </div>
          
          {/* Reader Top Command Bar */}
          <header class="reader-header">
            <div class="reader-header-right">
              {/* Surah Quick Jump Dropdown */}
              <div class="reader-surah-picker">
                <select id="readerSurahSelect" aria-label="اختر السورة" title="انتقال سريع لسورة أخرى">
                  {/* Surahs populated in quran.js */}
                </select>
                <i class="fa-solid fa-chevron-down"></i>
              </div>

              {/* Surah Title & Meta */}
              <div class="reader-title-info">
                <h2 id="readerSurahTitle">سورة الفاتحة</h2>
                <div class="reader-meta-chips">
                  <span class="reader-meta-badge" id="readerSurahMeta">مكية • ٧ آيات</span>
                  <span class="reader-juz-badge" id="readerJuzBadge">الجزء ١</span>
                  <span class="reader-page-badge" id="readerPageBadge">صفحة ١</span>
                </div>
              </div>

              {/* Jump to Ayah */}
              <div class="reader-ayah-jump">
                <input type="number" id="readerAyahJumpInput" min="1" max="286" placeholder="رقم الآية" title="انتقل إلى رقم الآية" />
                <button type="button" id="readerAyahJumpBtn" title="انتقال للآية">{icon('fa-magnifying-glass')}</button>
              </div>
            </div>

            <div class="reader-header-actions">
              {/* Font Family Selector */}
              <div class="reader-font-family-box">
                <i class="fa-solid fa-font"></i>
                <select id="readerFontFamilySelect" title="تغيير خط المصحف الشريف" aria-label="نوع الخط">
                  <option value="font-amiri-quran" selected>مصحف حفص (Amiri Quran)</option>
                  <option value="font-noto-naskh">النسخ الواضح (Noto Naskh)</option>
                  <option value="font-scheherazade">الخط العثماني (Scheherazade)</option>
                  <option value="font-amiri">النسخ الكلاسيكي (Amiri)</option>
                </select>
              </div>

              {/* Font Size controls */}
              <div class="reader-font-controls">
                <button type="button" id="fontDecreaseBtn" title="تصغير حجم الخط (Ctrl -)">{icon('fa-minus')}</button>
                <span id="fontSizeDisplay">28px</span>
                <button type="button" id="fontIncreaseBtn" title="تكبير حجم الخط (Ctrl +)">{icon('fa-plus')}</button>
              </div>

              {/* Theme Toggle (Parchment, Dark Emerald, Pure White, Soft Sage) */}
              <div class="reader-theme-controls" title="اختر مظهر القراءة المريح">
                <button type="button" class="theme-dot parchment active" data-theme="parchment" title="ورق مصحف كلاسيكي عاجي"></button>
                <button type="button" class="theme-dot dark" data-theme="dark" title="قراءة ليلية خضراء داكنة"></button>
                <button type="button" class="theme-dot white" data-theme="white" title="أبيض ناصع عالي التباين"></button>
                <button type="button" class="theme-dot sage" data-theme="sage" title="أخضر نباتي هادئ للعين"></button>
              </div>

              {/* Auto Scroll */}
              <button type="button" class="reader-util-btn" id="autoScrollBtn" title="بدء / إيقاف التمرير التلقائي البطيء للقراءة بدون لمس الشاشة">
                <i class="fa-solid fa-angles-down"></i> <span class="btn-text-sm">تمرير تلقائي</span>
              </button>

              {/* Screen Wake Lock */}
              <button type="button" class="reader-util-btn" id="screenWakeLockBtn" title="إبقاء الشاشة مضيئة أثناء القراءة (منع القفل التلقائي)">
                <i class="fa-solid fa-sun"></i>
              </button>

              {/* Fullscreen Toggle */}
              <button type="button" class="reader-util-btn" id="fullScreenToggleBtn" title="ملء الشاشة">
                <i class="fa-solid fa-expand"></i>
              </button>

              {/* Close Button */}
              <button type="button" class="reader-close-btn" id="closeReaderBtn" aria-label="إغلاق المصحف" title="إغلاق (Esc)">
                {icon('fa-xmark')}
              </button>
            </div>
          </header>

          {/* Reader Body / Ayahs Container */}
          <div class="reader-body" id="readerBody">
            <div class="mushaf-page-frame">
              
              {/* Decorative Surah Banner */}
              <div class="surah-ornate-banner" id="surahOrnateBanner">
                <div class="ornate-corner top-right"></div>
                <div class="ornate-corner top-left"></div>
                <h3 id="bannerSurahTitle">سورة الفاتحة</h3>
                <p id="bannerSurahDetails">مكية • ٧ آيات • نزلت بعد سورة المدثر</p>
                <div class="ornate-corner bottom-right"></div>
                <div class="ornate-corner bottom-left"></div>
              </div>

              {/* Bismillah Banner */}
              <div class="bismillah-banner" id="readerBismillah">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </div>

              {/* Ayahs Stream */}
              <div class="ayahs-stream font-amiri-quran" id="ayahsStream">
                {/* Ayahs loaded dynamically */}
              </div>

              {/* End of Surah Decoration */}
              <div class="surah-end-ornament" id="surahEndOrnament">
                <svg viewBox="0 0 200 40" class="end-svg">
                  <path d="M 10 20 Q 50 5 100 20 Q 150 35 190 20" fill="none" stroke="currentColor" stroke-width="1.5" />
                  <circle cx="100" cy="20" r="5" fill="currentColor" />
                </svg>
                <span>صدق الله العظيم</span>
              </div>

            </div>
          </div>

          {/* Reader Footer Controls (Audio, Timeline, Download & Navigation Bar) */}
          <footer class="reader-footer">
            <div class="reader-footer-top">
              <div class="reader-audio-controls">
                <button type="button" class="reader-audio-btn main-play" id="readerPlaySurahBtn" title="تشغيل تلاوة السورة">
                  {icon('fa-play')} <span id="readerPlaySurahLabel">استماع للسورة</span>
                </button>
                <div class="reader-reciter-dropdown">
                  <select id="readerReciterSelect" title="اختر القارئ">
                    {/* Populated in JS */}
                  </select>
                  <i class="fa-solid fa-microphone-lines"></i>
                </div>
              </div>

              {/* Real-time Audio Seek Bar & Timeline */}
              <div class="reader-audio-timeline" id="readerAudioTimeline">
                <span class="reader-time-current" id="readerCurrentTime">00:00</span>
                <div class="reader-scrubber-track">
                  <input type="range" class="reader-scrubber" id="readerScrubber" min="0" max="100" value="0" step="0.1" aria-label="شريط تقديم وترجيع التلاوة" />
                </div>
                <span class="reader-time-total" id="readerTotalTime">00:00</span>
                <div class="reader-skip-actions">
                  <button type="button" class="reader-skip-btn" id="readerRewindBtn" title="ترجيع ١٠ ثوانٍ">
                    <i class="fa-solid fa-rotate-left"></i> <span>١٠ث-</span>
                  </button>
                  <button type="button" class="reader-skip-btn" id="readerForwardBtn" title="تقديم ١٠ ثوانٍ">
                    <i class="fa-solid fa-rotate-right"></i> <span>+١٠ث</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="reader-footer-bottom">
              <div class="reader-quick-actions">
                <button type="button" class="reader-action-pill download-btn" id="readerDownloadSurahBtn" title="تحميل ملف التلاوة بصوت القارئ المختار">
                  <i class="fa-solid fa-download"></i> <span>تحميل السورة</span>
                </button>
                <button type="button" class="reader-action-pill" id="readerBookmarkBtn" title="حفظ علامة مرجعية هنا">
                  <i class="fa-regular fa-bookmark"></i> <span>حفظ المكان</span>
                </button>
                <button type="button" class="reader-action-pill" id="readerShareSurahBtn" title="مشاركة السورة عبر واتساب">
                  <i class="fa-brands fa-whatsapp"></i> <span>مشاركة</span>
                </button>
              </div>

              <div class="reader-nav-buttons">
                <button type="button" class="reader-nav-btn" id="prevSurahBtn" title="السورة السابقة">
                  {icon('fa-arrow-right')} <span>السورة السابقة</span>
                </button>
                <button type="button" class="reader-nav-btn" id="nextSurahBtn" title="السورة التالية">
                  <span>السورة التالية</span> {icon('fa-arrow-left')}
                </button>
              </div>
            </div>
          </footer>

        </div>
      </div>

      {/* ─── Interactive Ayah Actions Modal / Bottom Sheet ─── */}
      <div class="ayah-action-modal" id="ayahActionModal" aria-hidden="true">
        <div class="ayah-action-backdrop" id="ayahActionBackdrop"></div>
        <div class="ayah-action-dialog">
          <div class="ayah-action-header">
            <h4 id="ayahActionTitle">الآية رقم ١</h4>
            <button type="button" class="ayah-action-close" id="closeAyahActionBtn">{icon('fa-xmark')}</button>
          </div>
          <blockquote class="ayah-action-quote" id="ayahActionText"></blockquote>
          <div class="ayah-action-grid">
            <button type="button" class="ayah-act-item" id="ayahActTafsirBtn">
              <i class="fa-solid fa-book-open"></i>
              <span>التفسير الميسر</span>
            </button>
            <button type="button" class="ayah-act-item" id="ayahActCopyBtn">
              <i class="fa-solid fa-copy"></i>
              <span>نسخ الآية</span>
            </button>
            <button type="button" class="ayah-act-item" id="ayahActShareBtn">
              <i class="fa-brands fa-whatsapp"></i>
              <span>مشاركة واتساب</span>
            </button>
            <button type="button" class="ayah-act-item" id="ayahActBookmarkBtn">
              <i class="fa-solid fa-bookmark"></i>
              <span>علامة مرجعية</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tafsir & Ayah Detail Modal ─── */}
      <div class="tafsir-modal" id="tafsirModal" aria-hidden="true">
        <div class="tafsir-backdrop" id="tafsirBackdrop"></div>
        <div class="tafsir-dialog">
          <div class="tafsir-header">
            <div class="tafsir-header-text">
              <h4 id="tafsirAyahTitle">التفسير الميسر</h4>
              <span class="tafsir-source-badge">مجمع الملك فهد لطباعة المصحف الشريف</span>
            </div>
            <button type="button" class="tafsir-close-btn" id="closeTafsirBtn">{icon('fa-xmark')}</button>
          </div>
          <div class="tafsir-body">
            <blockquote class="tafsir-ayah-quote font-amiri-quran" id="tafsirAyahText"></blockquote>
            <div class="tafsir-explanation" id="tafsirExplanationText">
              <i class="fa-solid fa-spinner fa-spin"></i> جاري جلب التفسير الميسر...
            </div>
          </div>
          <div class="tafsir-footer">
            <button type="button" class="primary-btn" id="tafsirDoneBtn">تم الاستفادة بحمد الله</button>
          </div>
        </div>
      </div>

      {/* ─── Floating Persistent Audio Player Bar ─── */}
      <div class="quran-floating-player" id="quranFloatingPlayer" style="display: none;">
        <div class="floating-player-inner">
          <div class="player-track-info">
            <div class="player-icon-pulse">
              {icon('fa-compact-disc')}
            </div>
            <div class="player-text">
              <strong id="floatingPlayerSurah">سورة الفاتحة</strong>
              <small id="floatingPlayerReciter">الشيخ محمد صديق المنشاوي</small>
            </div>
          </div>

          <div class="player-controls">
            <button type="button" class="player-ctrl-btn" id="floatingPrevBtn" title="السابق">
              {icon('fa-backward-step')}
            </button>
            <button type="button" class="player-ctrl-btn play-pause-btn" id="floatingPlayPauseBtn" title="تشغيل / إيقاف">
              {icon('fa-play')}
            </button>
            <button type="button" class="player-ctrl-btn" id="floatingNextBtn" title="التالي">
              {icon('fa-forward-step')}
            </button>
          </div>

          <div class="player-timeline">
            <span class="time-current" id="floatingCurrentTime">00:00</span>
            <input type="range" class="player-scrubber" id="floatingScrubber" min="0" max="100" value="0" />
            <span class="time-total" id="floatingTotalTime">00:00</span>
          </div>

          <div class="player-actions">
            <button type="button" class="player-vol-btn" id="floatingMuteBtn" title="كتم الصوت">
              {icon('fa-volume-high')}
            </button>
            <button type="button" class="player-close-btn" id="floatingCloseBtn" title="إغلاق المشغل">
              {icon('fa-xmark')}
            </button>
          </div>
        </div>
      </div>

      {/* Script for Quran functionality */}
      <script src="/static/quran.js?v=4.2"></script>
    </Layout>
  )
}
