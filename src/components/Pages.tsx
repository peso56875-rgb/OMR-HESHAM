import { icon, Layout, PageHero, SectionHead } from './shared'
import type { UserSession } from '../types'

export function Achievements({ user }: { user?: UserSession }) {
  const governorates = [
    {
      id: 'all',
      name: 'كافة المحافظات والنطاقات',
      badge: 'إجمالي أثر الخير',
      center: 'جمهورية مصر العربية',
      isHQ: false,
      beneficiaries: '٥٬٣٤٠+',
      convoys: '٥٤ قافلة',
      medicalDevices: '١٠٤ أجهزة',
      mealsAndBoxes: '٨٬٨٠٠+',
      directAid: '١٬٢٥٠٬٠٠٠ ج.م',
      description: 'يمتد أثر مؤسسة الدكتور عمر هشام الخيرية ليشمل محافظات الدلتا والقاهرة الكبرى وصولاً إلى قرى صعيد مصر الأكثر احتياجاً، بمزيج متوازن بين الرعاية الصحية التخصصية والإطعام والتكافل المجتمعي.',
      keyProjects: [
        'بنك الأجهزة الطبية والتنفسية المجاني لإعارة مولدات الأكسجين والكراسي المتحركة',
        'عيادة الأنف والأذن التخصصية ودعم المرضى غير القادرين بالدواء والعمليات',
        'قوافل الإطعام وكراتين رمضان ولحوم الأضاحي السنوية',
        'مسابقة حفظ وتجويد القرآن الكريم وتكريم حفظة كتاب الله',
        'قوافل الشتاء وترميم أسقف المنازل وتأمين المياه النقية بالصعيد'
      ]
    },
    {
      id: 'dakahlia',
      name: 'محافظة الدقهلية',
      badge: 'المقر الرئيسي ومركز العمليات',
      center: 'كفر العنانية — السنبلاوين — المنصورة',
      isHQ: true,
      beneficiaries: '٢٬١٥٠+',
      convoys: '٢٤ قافلة',
      medicalDevices: '٤٢ جهاز طبي',
      mealsAndBoxes: '٤٬٨٠٠ كرتونة ووجبة',
      directAid: '٣٨٠٬٠٠٠ ج.م',
      description: 'النواة الرئيسية والمقر الدائم للمؤسسة المشهرة برقم 3115 لسنة 2026. انطلقت منها مسيرة العطاء لروح الدكتور عمر هشام، وتضم المستودع المركزي لبنك الأجهزة الطبية والعيادة التخصصية.',
      keyProjects: [
        'المستودع الرئيسي لبنك الأجهزة الطبية والتنفسية المجاني',
        'تطوير الشبكة الكهربائية بمستشفى كفر العنانية والعيادات',
        'صرف أدوية وعلاج شهري لأكثر من ٨٥ مريضاً بالأمراض المزمنة والأورام',
        'توزيع كراتين الخير ولحوم الأضاحي ووجبات الإطعام الساخنة بانتظام',
        'تكريم سنوي لأكثر من ١٢٠ طالباً من حفظة كتاب الله والمتفوقين'
      ]
    },
    {
      id: 'damietta',
      name: 'محافظة دمياط',
      badge: 'قوافل طبية وتنفسية',
      center: 'دمياط — رأس البر — كفر البطيخ',
      isHQ: false,
      beneficiaries: '٦٢٠+',
      convoys: '٨ قوافل',
      medicalDevices: '١٨ جهاز طبي',
      mealsAndBoxes: '١٬٢٠٠ كرتونة',
      directAid: '١١٠٬٠٠٠ ج.م',
      description: 'امتداد ميداني سريع لخدمة أسر الصيادين والمناطق الساحلية، وتوفير أجهزة تنفسية فورية لحالات العناية المركزة المنزلية وأمراض الصدر والحساسية.',
      keyProjects: [
        'توفير مولدات أكسجين لمرضى حساسية الصدر والرعاية المنزلية',
        'قوافل إطعام موسمية موجهة لأسر الصيادين في فترات النوات',
        'كفالات تعليمية وسداد مصروفات مدرسية لأبناء الأسر المتعففة'
      ]
    },
    {
      id: 'sharqia',
      name: 'محافظة الشرقية',
      badge: 'قوافل إطعام وكسوة',
      center: 'الزقازيق — فاقوس — بلبيس',
      isHQ: false,
      beneficiaries: '٨٥٠+',
      convoys: '١١ قافلة',
      medicalDevices: '١٢ جهاز طبي',
      mealsAndBoxes: '١٬٩٥٠ كرتونة',
      directAid: '١٤٥٬٠٠٠ ج.م',
      description: 'تغطية قرى ريفية مترامية بمبادرات إطعام شاملة وتوزيع كسوة العيد للأيتام وتأمين مستلزمات المدارس لأبناء القرى الأكثر احتياجاً.',
      keyProjects: [
        'توزيع كراتين تموينية ولحوم طازجة في القرى الأكثر احتياجاً',
        'كسوة شتوية ومعارض ملابس مجانية للأطفال الأيتام بالمدارس',
        'إعارة كراسي متحركة وأسرّة رعاية طبية لكبار السن المتعففين'
      ]
    },
    {
      id: 'gharbia',
      name: 'محافظة الغربية',
      badge: 'دعم جراحي وتحويلات تخصصية',
      center: 'طنطا — المحلة الكبرى',
      isHQ: false,
      beneficiaries: '٤٣٠+',
      convoys: '٦ قوافل',
      medicalDevices: '٩ أجهزة طبية',
      mealsAndBoxes: '٨٠٠ وجبة وكرتونة',
      directAid: '١٦٠٬٠٠٠ ج.م',
      description: 'مركز ارتكاز طبي حيوي للتنسيق مع المراكز الجامعية والمستشفيات التخصصية بطنطا لإجراء العمليات الجراحية الدقيقة ودعم مرضى الأورام.',
      keyProjects: [
        'المساهمة في نفقات العمليات الجراحية الدقيقة والتحاليل والأشعة',
        'توفير مستلزمات طبية وأدوية سريرية باهظة التكلفة',
        'إعارة أجهزة شفط بلغم وأسرّة طبية متحركة'
      ]
    },
    {
      id: 'cairo',
      name: 'القاهرة الكبرى',
      badge: 'المستشفيات الجامعية والأورام',
      center: 'مستشفيات أبو الريش — الحسين — معهد الأورام',
      isHQ: false,
      beneficiaries: '٥١٠+',
      convoys: 'متابعة دورية',
      medicalDevices: '١٥ جهاز طبي',
      mealsAndBoxes: '٦٥٠ كرتونة',
      directAid: '٢٦٥٬٠٠٠ ج.م',
      description: 'متابعة مباشرة للحالات المحولة من المحافظات إلى معاهد الأورام ومستشفيات الأطفال بالقاهرة، وسداد نفقات العلاج المؤقت وتأمين الإقامة للمرافقين.',
      keyProjects: [
        'كفالة إقامة وانتقالات مرافقي المرضى القادمين من القرى النائية',
        'شراء الأدوية النادرة وجرعات الكيماوي للحالات المستعجلة',
        'توفير أجهزة قياس التنفس ومولدات أكسجين للحالات الحرجة'
      ]
    },
    {
      id: 'upper_egypt',
      name: 'صعيد مصر (قنا — سوهاج — أسيوط)',
      badge: 'قوافل الشتاء وترميم الأسقف',
      center: 'قرى قنا وسوهاج وأسيوط الأكثر احتياجاً',
      isHQ: false,
      beneficiaries: '٧٨٠+',
      convoys: '٥ قوافل كبرى',
      medicalDevices: '٨ أجهزة طبية',
      mealsAndBoxes: '١٬٦٠٠ كرتونة وبطانية',
      directAid: '١٩٠٬٠٠٠ ج.م',
      description: 'قوافل سنوية مركزة تركز على ستر البيوت وترميم الأسقف وتوزيع بطاطين الشتاء وكسوة الدفء بالتعاون مع الجمعيات القاعدية الموثوقة.',
      keyProjects: [
        'مبادرة "دفء وأمان": توزيع بطاطين وألحفة شتوية للأسر غير المقتدرة',
        'تسقيف منازل وتأمين وصلات مياه نقية للأسر الأكثر ضعفاً',
        'قوافل لحوم الأضاحي وتوصيل المساعدات يداً بيد بكرامة'
      ]
    }
  ]

  return (
    <Layout
      user={user}
      title="الإنجازات وخريطة أثر الخير | مؤسسة الدكتور عمر هشام الخيرية"
      description="استعرض خريطة أثر الخير التفاعلية بمحافظات مصر، وأرقام الشفافية الموثقة لإنجازات مؤسسة الدكتور عمر هشام الخيرية المشهرة برقم 3115."
    >
      {/* ─── Hero Section ─── */}
      <PageHero
        kicker="أثرنا بالأرقام والتوثيق"
        title={'لا نعدُ بالكثير،<br/><em>نُريك ما تحقق على الأرض.</em>'}
        text="الشفافية عندنا ليست صفحة في الموقع؛ إنها منهج العمل اليومي الذي يحفظ أمانة كل متبرع ويوصل كل جنيه لمستحقه بكرامة."
      />

      {/* ─── Grand KPI Showcase ─── */}
      <section class="section-pad" style="padding-top:0; padding-bottom: 2rem">
        <div class="impact-kpi-grid">
          <article class="impact-kpi-card reveal">
            <div class="kpi-icon-box tone-emerald">{icon('fa-people-roof')}</div>
            <div class="kpi-content">
              <span>أكثر من</span>
              <b>٥٬٣٤٠+</b>
              <p>أسرة وفرد نالهم الدعم المباشر</p>
            </div>
          </article>

          <article class="impact-kpi-card reveal" style="--delay:100ms">
            <div class="kpi-icon-box tone-gold">{icon('fa-coins')}</div>
            <div class="kpi-content">
              <span>إجمالي التدخلات</span>
              <b>١٫٢٥ مليون</b>
              <p>جنيه وُجهت للحالات والمشاريع</p>
            </div>
          </article>

          <article class="impact-kpi-card reveal" style="--delay:200ms">
            <div class="kpi-icon-box tone-blue">{icon('fa-stethoscope')}</div>
            <div class="kpi-content">
              <span>بنك الأجهزة الطبية</span>
              <b>١٠٤</b>
              <p>أجهزة طبية وتنفسية معارة مجاناً</p>
            </div>
          </article>

          <article class="impact-kpi-card reveal" style="--delay:300ms">
            <div class="kpi-icon-box tone-coral">{icon('fa-truck-fast')}</div>
            <div class="kpi-content">
              <span>قوافل الخير</span>
              <b>٥٤</b>
              <p>قافلة ميدانية غذائية وعلاجية</p>
            </div>
          </article>

          <article class="impact-kpi-card reveal" style="--delay:400ms">
            <div class="kpi-icon-box tone-violet">{icon('fa-clock-rotate-left')}</div>
            <div class="kpi-content">
              <span>عطاء المتطوعين</span>
              <b>١٬٨٠٠+</b>
              <p>ساعة عمل ميدانية موثقة</p>
            </div>
          </article>
        </div>
      </section>

      {/* ─── Interactive Egypt Impact Map ─── */}
      <section class="section-pad impact-map-section" id="impact-map-anchor">
        <div class="impact-map-container">
          <div class="map-section-head text-center">
            <span class="map-badge">{icon('fa-map-location-dot')} الانتشار الجغرافي لأثر الخير</span>
            <h2>خريطة أثر الخير التفاعلية <span>بمحافظات مصر</span></h2>
            <p>انقر على أي محافظة أو اختر من القائمة لتستعرض المشروعات المنفذة وأعداد المستفيدين وتفاصيل القوافل الميدانية.</p>
          </div>

          {/* Quick Governorates Selector Pills */}
          <div class="gov-pills-bar">
            {governorates.map(gov => (
              <button
                type="button"
                class={`gov-pill-btn ${gov.id === 'dakahlia' ? 'active' : ''}`}
                data-gov-id={gov.id}
              >
                {gov.isHQ && <i class="fa-solid fa-crown hq-icon" title="المقر الرئيسي"></i>}
                <span>{gov.name}</span>
              </button>
            ))}
          </div>

          {/* Map Grid Layout: SVG Map + Info Card */}
          <div class="impact-map-layout">
            {/* SVG Visual Map */}
            <div class="map-visual-card">
              <div class="map-visual-header">
                <span class="map-live-tag"><i class="fa-solid fa-satellite-dish"></i> نطاق العمليات الميدانية</span>
                <span class="map-hint"><i class="fa-solid fa-hand-pointer"></i> اضغط على أي نقطة لاكتشاف الأثر</span>
              </div>

              <div class="svg-map-wrapper">
                <svg
                  viewBox="0 0 600 500"
                  class="egypt-svg-map"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="خريطة أثر الخير بمصر"
                >
                  <defs>
                    <linearGradient id="nileGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
                      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.9" />
                    </linearGradient>
                    <radialGradient id="hqGlow">
                      <stop offset="0%" stop-color="#10b981" stop-opacity="0.8" />
                      <stop offset="50%" stop-color="#10b981" stop-opacity="0.3" />
                      <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
                    </radialGradient>
                    <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="rgba(0,0,0,0.25)" />
                    </filter>
                  </defs>

                  {/* Stylized Egypt Landmass Outline */}
                  <path
                    class="egypt-landmass"
                    d="M 120,40 L 490,40 L 510,70 L 540,85 L 560,110 L 580,180 L 520,240 L 530,300 L 510,380 L 530,460 L 120,460 L 120,40 Z"
                    fill="var(--card-bg, #ffffff)"
                    stroke="var(--border, rgba(0,0,0,0.12))"
                    stroke-width="1.5"
                    filter="url(#shadowFilter)"
                  />

                  {/* Mediterranean & Red Sea Accents */}
                  <path
                    class="sea-coast sea-med"
                    d="M 120,40 Q 280,30 380,45 T 480,55 L 520,65"
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.4)"
                    stroke-width="3"
                    stroke-dasharray="4,4"
                  />
                  <text x="240" y="28" class="map-water-label">البحر الأبيض المتوسط</text>

                  <path
                    class="sea-coast sea-red"
                    d="M 520,180 Q 480,240 500,340 T 520,450"
                    fill="none"
                    stroke="rgba(56, 189, 248, 0.35)"
                    stroke-width="2.5"
                    stroke-dasharray="3,3"
                  />
                  <text x="525" y="320" class="map-water-label" transform="rotate(45 525,320)">البحر الأحمر</text>

                  {/* Stylized Nile River & Delta */}
                  {/* Delta branches */}
                  <path
                    class="nile-branch"
                    d="M 370,180 Q 355,120 330,60"
                    fill="none"
                    stroke="url(#nileGrad)"
                    stroke-width="3.5"
                    stroke-linecap="round"
                  />
                  <path
                    class="nile-branch"
                    d="M 370,180 Q 385,120 405,65"
                    fill="none"
                    stroke="url(#nileGrad)"
                    stroke-width="3.5"
                    stroke-linecap="round"
                  />
                  {/* Main Nile Valley */}
                  <path
                    class="nile-river"
                    d="M 370,180 Q 375,230 380,280 Q 420,330 400,370 Q 390,400 410,460"
                    fill="none"
                    stroke="url(#nileGrad)"
                    stroke-width="4.5"
                    stroke-linecap="round"
                  />

                  {/* ─── Interactive Region Nodes ─── */}

                  {/* 1. Dakahlia (HQ) */}
                  <g class="map-pin-group active" data-pin-id="dakahlia" transform="translate(378, 85)">
                    <circle class="pin-radar-outer" r="28" fill="url(#hqGlow)" />
                    <circle class="pin-pulse" r="14" fill="rgba(16, 185, 129, 0.3)" />
                    <circle class="pin-core hq-core" r="8" fill="#10b981" stroke="#ffffff" stroke-width="2.5" />
                    <g transform="translate(0, -16)">
                      <rect class="pin-tag-bg" x="-45" y="-12" width="90" height="20" rx="10" fill="#10b981" />
                      <text class="pin-tag-text" x="0" y="2" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">★ الدقهلية (المقر)</text>
                    </g>
                  </g>

                  {/* 2. Damietta */}
                  <g class="map-pin-group" data-pin-id="damietta" transform="translate(412, 60)">
                    <circle class="pin-pulse" r="12" fill="rgba(14, 165, 233, 0.25)" />
                    <circle class="pin-core" r="6.5" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
                    <g transform="translate(18, 4)">
                      <rect class="pin-tag-bg mini" x="-5" y="-10" width="48" height="18" rx="9" fill="rgba(2,132,199,0.9)" />
                      <text class="pin-tag-text" x="19" y="3" text-anchor="middle" fill="#ffffff" font-size="9.5">دمياط</text>
                    </g>
                  </g>

                  {/* 3. Sharqia */}
                  <g class="map-pin-group" data-pin-id="sharqia" transform="translate(415, 120)">
                    <circle class="pin-pulse" r="12" fill="rgba(217, 119, 6, 0.25)" />
                    <circle class="pin-core" r="6.5" fill="#d97706" stroke="#ffffff" stroke-width="2" />
                    <g transform="translate(20, 3)">
                      <rect class="pin-tag-bg mini" x="-5" y="-10" width="50" height="18" rx="9" fill="rgba(217,119,6,0.9)" />
                      <text class="pin-tag-text" x="20" y="3" text-anchor="middle" fill="#ffffff" font-size="9.5">الشرقية</text>
                    </g>
                  </g>

                  {/* 4. Gharbia */}
                  <g class="map-pin-group" data-pin-id="gharbia" transform="translate(340, 115)">
                    <circle class="pin-pulse" r="12" fill="rgba(99, 102, 241, 0.25)" />
                    <circle class="pin-core" r="6.5" fill="#6366f1" stroke="#ffffff" stroke-width="2" />
                    <g transform="translate(-55, 3)">
                      <rect class="pin-tag-bg mini" x="-5" y="-10" width="50" height="18" rx="9" fill="rgba(99,102,241,0.9)" />
                      <text class="pin-tag-text" x="20" y="3" text-anchor="middle" fill="#ffffff" font-size="9.5">الغربية</text>
                    </g>
                  </g>

                  {/* 5. Cairo */}
                  <g class="map-pin-group" data-pin-id="cairo" transform="translate(370, 185)">
                    <circle class="pin-pulse" r="13" fill="rgba(239, 68, 68, 0.25)" />
                    <circle class="pin-core" r="7" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
                    <g transform="translate(-75, 4)">
                      <rect class="pin-tag-bg mini" x="-5" y="-10" width="70" height="18" rx="9" fill="rgba(239,68,68,0.9)" />
                      <text class="pin-tag-text" x="30" y="3" text-anchor="middle" fill="#ffffff" font-size="9.5">القاهرة الكبرى</text>
                    </g>
                  </g>

                  {/* 6. Upper Egypt */}
                  <g class="map-pin-group" data-pin-id="upper_egypt" transform="translate(415, 350)">
                    <circle class="pin-pulse" r="14" fill="rgba(168, 85, 247, 0.25)" />
                    <circle class="pin-core" r="7" fill="#9333ea" stroke="#ffffff" stroke-width="2" />
                    <g transform="translate(20, 3)">
                      <rect class="pin-tag-bg mini" x="-5" y="-10" width="95" height="20" rx="10" fill="rgba(147,51,234,0.9)" />
                      <text class="pin-tag-text" x="42" y="4" text-anchor="middle" fill="#ffffff" font-size="9.5">الصعيد (قنا/سوهاج)</text>
                    </g>
                  </g>
                </svg>
              </div>

              <div class="map-legend">
                <span class="legend-item"><span class="legend-dot hq-dot"></span> المقر الرئيسي والعمليات الدائمة</span>
                <span class="legend-item"><span class="legend-dot active-dot"></span> نطاقات القوافل والتدخلات النشطة</span>
              </div>
            </div>

            {/* Dynamic Details Card for Selected Governorate */}
            <div class="gov-details-card" id="govDetailsCard">
              <div class="gov-card-header">
                <div>
                  <span class="gov-badge-tag" id="govBadgeTag">المقر الرئيسي ومركز العمليات</span>
                  <h3 id="govTitle">محافظة الدقهلية</h3>
                  <p class="gov-center-text" id="govCenterText">
                    <i class="fa-solid fa-location-dot"></i> <span>كفر العنانية — السنبلاوين — المنصورة</span>
                  </p>
                </div>
                <div class="gov-hq-badge" id="govHqBadge" style="display:inline-flex">
                  <i class="fa-solid fa-award"></i> المركز الأم
                </div>
              </div>

              <p class="gov-desc" id="govDesc">
                النواة الرئيسية والمقر الدائم للمؤسسة المشهرة برقم 3115 لسنة 2026. انطلقت منها مسيرة العطاء لروح الدكتور عمر هشام، وتضم المستودع المركزي لبنك الأجهزة الطبية والعيادة التخصصية.
              </p>

              {/* KPI Chips Grid */}
              <div class="gov-stats-grid">
                <div class="gov-stat-item">
                  <small>المستفيدين</small>
                  <strong id="statBeneficiaries">٢٬١٥٠+</strong>
                </div>
                <div class="gov-stat-item">
                  <small>القوافل الميدانية</small>
                  <strong id="statConvoys">٢٤ قافلة</strong>
                </div>
                <div class="gov-stat-item">
                  <small>الأجهزة الطبية</small>
                  <strong id="statMedical">٤٢ جهاز</strong>
                </div>
                <div class="gov-stat-item">
                  <small>كراتين وإطعام</small>
                  <strong id="statMeals">٤٬٨٠٠+</strong>
                </div>
              </div>

              {/* Key Initiatives Checklist */}
              <div class="gov-projects-box">
                <h4>{icon('fa-circle-check')} أبرز المشروعات والتدخلات المنجزة:</h4>
                <ul id="govProjectsList">
                  <li>المستودع الرئيسي لبنك الأجهزة الطبية والتنفسية المجاني</li>
                  <li>تطوير الشبكة الكهربائية بمستشفى كفر العنانية والعيادات</li>
                  <li>صرف أدوية وعلاج شهري لأكثر من ٨٥ مريضاً بالأمراض المزمنة والأورام</li>
                  <li>توزيع كراتين الخير ولحوم الأضاحي ووجبات الإطعام الساخنة بانتظام</li>
                  <li>تكريم سنوي لأكثر من ١٢٠ طالباً من حفظة كتاب الله والمتفوقين</li>
                </ul>
              </div>

              <div class="gov-card-footer">
                <a href="/donate" class="primary-btn" id="govDonateBtn">
                  <span>ساهم في استمرار قوافل الخير</span> {icon('fa-heart')}
                </a>
                <a href="/transparency" class="outline-btn">
                  <span>الاعتماد والشفافية</span> {icon('fa-shield-halved')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Financial Transparency & Allocations ─── */}
      <section class="section-pad transparency-allocations-section">
        <div class="allocations-container">
          <div class="text-center" style="margin-bottom:2.5rem">
            <span class="map-badge">{icon('fa-scale-balanced')} أمانة كل جنيه</span>
            <h2>أوجه الصرف والشفافية <span>المالية المعتمدة</span></h2>
            <p>خاضعون لمتابعة وزارة التضامن الاجتماعي والجهات الرقابية، ونلتزم بنشر قنوات الصرف الدقيقة لكل مساهمة.</p>
          </div>

          <div class="allocations-grid">
            <div class="alloc-card">
              <div class="alloc-bar-wrap">
                <div class="alloc-bar tone-emerald" style="width: 45%"></div>
              </div>
              <div class="alloc-info">
                <div class="alloc-header">
                  <strong>٤٥٪ الرعاية الصحية وبنك الأجهزة</strong>
                  <span class="alloc-percent">٤٥٪</span>
                </div>
                <p>إعارة أجهزة التنفس ومولدات الأكسجين، شراء الأدوية الشهرية، ودعم العمليات الجراحية العاجلة لمرضى السرطان والأطفال.</p>
              </div>
            </div>

            <div class="alloc-card">
              <div class="alloc-bar-wrap">
                <div class="alloc-bar tone-gold" style="width: 25%"></div>
              </div>
              <div class="alloc-info">
                <div class="alloc-header">
                  <strong>٢٥٪ الإطعام وكراتين الخير</strong>
                  <span class="alloc-percent">٢٥٪</span>
                </div>
                <p>تأمين المواد التموينية والوجبات الساخنة وتوزيع لحوم الأضاحي والصدقات على الأسر المتعففة في بيوتها بكرامة.</p>
              </div>
            </div>

            <div class="alloc-card">
              <div class="alloc-bar-wrap">
                <div class="alloc-bar tone-blue" style="width: 15%"></div>
              </div>
              <div class="alloc-info">
                <div class="alloc-header">
                  <strong>١٥٪ التعليم والقرآن الكريم</strong>
                  <span class="alloc-percent">١٥٪</span>
                </div>
                <p>كفالات الطلاب، سداد المصروفات والمستلزمات الدراسية، وتنظيم مسابقات حفظ القرآن الكريم وتكريم الأوائل.</p>
              </div>
            </div>

            <div class="alloc-card">
              <div class="alloc-bar-wrap">
                <div class="alloc-bar tone-coral" style="width: 10%"></div>
              </div>
              <div class="alloc-info">
                <div class="alloc-header">
                  <strong>١٠٪ الحالات الطارئة وستر البيوت</strong>
                  <span class="alloc-percent">١٠٪</span>
                </div>
                <p>تفريج الكرب العاجلة، تسقيف المنازل غير الآمنة، وصلات المياه النقية، وكسوة الشتاء للأيتام والمحتاجين.</p>
              </div>
            </div>

            <div class="alloc-card">
              <div class="alloc-bar-wrap">
                <div class="alloc-bar tone-muted" style="width: 5%"></div>
              </div>
              <div class="alloc-info">
                <div class="alloc-header">
                  <strong>٥٪ تشغيل مباشر ونقل</strong>
                  <span class="alloc-percent">٥٪</span>
                </div>
                <p>الوقود اللازم لسيارات القوافل وتوصيل الأجهزة الطبية لمنازل المرضى بالمحافظات، وصيانة الأجهزة والمستودعات.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tracks Grid: ما وراء الأرقام ─── */}
      <section class="achievement-tracks section-pad">
        <SectionHead
          kicker="ما وراء الأرقام"
          title={'أعمالٌ تلمس<br/><em>كل جانب من الحياة الإنسانية.</em>'}
        />
        <div class="track-grid">
          {[
            ['fa-heart-pulse', 'الصحة وبنك الأجهزة', 'عيادة أنف وأذن، تطوير كهرباء المستشفى، دواء شهري، دعم مرضى السرطان، إعارة أسطوانات ومولدات الأكسجين.'],
            ['fa-graduation-cap', 'التعليم والتفوق', 'ماكينات تصوير للمدارس، تكريم المتفوقين، سداد مصروفات وأدوات مدرسية ومتابعة مستمرة طوال العام.'],
            ['fa-book-quran', 'القرآن الكريم', 'حلقات للأطفال بمناهج محكمة، معلمون مؤهلون، مسابقات سنوية في الحفظ والتجويد وجوائز قيّمة.'],
            ['fa-bowl-rice', 'الغذاء والكرامة', 'لحوم طازجة، كراتين رمضان التموينية، كسوة العيد، ووجبات ساخنة تصل إلى بيوت المتعففين بتعفف وصون لكرامتهم.']
          ].map(t => (
            <article class="track-card reveal">
              <div>{icon(t[0])}</div>
              <h3>{t[1]}</h3>
              <p>{t[2]}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Donor Annual Statement Callout Card ─── */}
      <section class="section-pad" style="padding-top:0">
        <div class="statement-callout-card reveal">
          <div class="statement-callout-graphic">
            <div class="statement-a4-preview">
              <div class="a4-strip"></div>
              <div class="a4-seal-watermark">{icon('fa-certificate')}</div>
              <div class="a4-line"></div>
              <div class="a4-line short"></div>
              <div class="a4-badge">A4 رسمي</div>
            </div>
          </div>
          <div class="statement-callout-body">
            <span class="callout-kicker">{icon('fa-file-invoice-dollar')} خدمة المتبرعين المعتمدة</span>
            <h3>هل أنت من شركاء الخير هذا العام؟</h3>
            <p>
              يمكنك الآن استخراج <strong>«شهادة العطاء السنوية وكشف حساب التبرعات»</strong> الرسمية المعتمدة برقم التشهير 3115، تشمل جدول كافة مساهماتك وتبرعاتك بالأرقام والتفقيط العربي جاهزة للطباعة فوراً.
            </p>
            <div class="statement-callout-actions">
              <a href="/donor-statement" class="primary-btn">
                <span>استخراج كشف حسابك السنوي</span> {icon('fa-arrow-left')}
              </a>
              <a href="/donate" class="outline-btn">
                <span>تبرع الآن</span> {icon('fa-heart')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Scoped Component Styles & Interactions ─── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Grand KPI Grid */
        .impact-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .impact-kpi-card {
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border, rgba(0,0,0,0.08));
          border-radius: 18px;
          padding: 20px 18px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }
        .impact-kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border-color: var(--emerald, #10b981);
        }
        .kpi-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          font-size: 1.35rem;
          flex-shrink: 0;
        }
        .kpi-icon-box.tone-emerald { background: rgba(16,185,129,0.12); color: #059669; }
        .kpi-icon-box.tone-gold { background: rgba(217,119,6,0.12); color: #d97706; }
        .kpi-icon-box.tone-blue { background: rgba(14,165,233,0.12); color: #0284c7; }
        .kpi-icon-box.tone-coral { background: rgba(244,63,94,0.12); color: #e11d48; }
        .kpi-icon-box.tone-violet { background: rgba(139,92,246,0.12); color: #7c3aed; }
        .kpi-content span { font-size: .75rem; color: var(--muted, #64748b); font-weight: 600; display: block; }
        .kpi-content b { font-size: 1.5rem; color: var(--heading, #0f172a); font-weight: 900; display: block; line-height: 1.2; margin: 2px 0; }
        .kpi-content p { font-size: .8rem; color: var(--text, #334155); margin: 0; }

        /* Impact Map Section */
        .impact-map-section {
          background: linear-gradient(180deg, rgba(16,185,129,0.02) 0%, rgba(2,132,199,0.03) 100%);
          border-top: 1px solid var(--border, rgba(0,0,0,0.06));
          border-bottom: 1px solid var(--border, rgba(0,0,0,0.06));
        }
        .map-section-head { max-width: 700px; margin: 0 auto 2rem; }
        .map-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(16,185,129,0.1);
          color: #059669;
          font-weight: 700;
          font-size: .82rem;
          margin-bottom: 12px;
        }
        .map-section-head h2 { font-size: 2rem; color: var(--heading, #0f172a); margin-bottom: 10px; font-weight: 900; }
        .map-section-head h2 span { color: var(--emerald, #10b981); }
        .map-section-head p { color: var(--muted, #64748b); font-size: .98rem; }

        /* Gov Pills Bar */
        .gov-pills-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        .gov-pill-btn {
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border, rgba(0,0,0,0.1));
          border-radius: 999px;
          padding: 8px 18px;
          font-size: .88rem;
          font-weight: 700;
          color: var(--text, #334155);
          cursor: pointer;
          transition: all .2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .gov-pill-btn:hover {
          border-color: var(--emerald, #10b981);
          color: var(--emerald, #10b981);
          transform: translateY(-1px);
        }
        .gov-pill-btn.active {
          background: var(--emerald, #10b981);
          color: #ffffff;
          border-color: var(--emerald, #10b981);
          box-shadow: 0 4px 14px rgba(16,185,129,0.3);
        }
        .gov-pill-btn .hq-icon { color: #fbbf24; }
        .gov-pill-btn.active .hq-icon { color: #ffffff; }

        /* Layout Grid: Map + Details Card */
        .impact-map-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: stretch;
        }
        @media (max-width: 960px) {
          .impact-map-layout { grid-template-columns: 1fr; }
        }

        /* SVG Map Visual */
        .map-visual-card {
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border, rgba(0,0,0,0.08));
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 6px 24px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .map-visual-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: .8rem;
          font-weight: 700;
        }
        .map-live-tag { color: var(--emerald, #10b981); display: flex; align-items: center; gap: 6px; }
        .map-hint { color: var(--muted, #64748b); display: flex; align-items: center; gap: 6px; }
        .svg-map-wrapper { width: 100%; aspect-ratio: 600/500; display: flex; align-items: center; justify-content: center; }
        .egypt-svg-map { width: 100%; height: auto; max-height: 440px; }
        .map-water-label { font-size: 11px; fill: rgba(56,189,248,0.7); font-weight: bold; }
        
        /* Map Pins */
        .map-pin-group {
          cursor: pointer;
          transition: transform .25s ease;
        }
        .map-pin-group:hover, .map-pin-group.active {
          transform: scale(1.18);
        }
        .pin-radar-outer {
          animation: mapPulse 2s infinite ease-in-out;
        }
        @keyframes mapPulse {
          0% { r: 16; opacity: 0.8; }
          50% { r: 32; opacity: 0.2; }
          100% { r: 16; opacity: 0.8; }
        }
        .pin-tag-text { font-family: inherit; }
        .map-legend {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid var(--border, rgba(0,0,0,0.06));
          font-size: .78rem;
          color: var(--muted, #64748b);
          flex-wrap: wrap;
        }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
        .hq-dot { background: #10b981; box-shadow: 0 0 6px #10b981; }
        .active-dot { background: #0284c7; }

        /* Dynamic Governorate Details Card */
        .gov-details-card {
          background: var(--card-bg, #ffffff);
          border: 1.5px solid var(--border, rgba(0,0,0,0.08));
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .gov-details-card::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 6px;
          height: 100%;
          background: linear-gradient(180deg, var(--emerald, #10b981), var(--gold-500, #f59e0b));
        }
        .gov-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }
        .gov-badge-tag {
          font-size: .75rem;
          font-weight: 700;
          color: #059669;
          background: rgba(16,185,129,0.1);
          padding: 3px 10px;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 6px;
        }
        .gov-card-header h3 {
          font-size: 1.55rem;
          font-weight: 900;
          color: var(--heading, #0f172a);
          margin: 0 0 4px;
        }
        .gov-center-text {
          font-size: .85rem;
          color: var(--muted, #64748b);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .gov-hq-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: .78rem;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 10px rgba(16,185,129,0.25);
          flex-shrink: 0;
        }
        .gov-desc {
          font-size: .92rem;
          line-height: 1.65;
          color: var(--text, #334155);
          margin-bottom: 20px;
        }
        .gov-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .gov-stat-item {
          background: var(--bg-surface, rgba(0,0,0,0.02));
          border: 1px solid var(--border, rgba(0,0,0,0.06));
          border-radius: 12px;
          padding: 12px 14px;
        }
        .gov-stat-item small { font-size: .75rem; color: var(--muted, #64748b); display: block; margin-bottom: 2px; }
        .gov-stat-item strong { font-size: 1.25rem; font-weight: 900; color: var(--heading, #0f172a); display: block; }

        .gov-projects-box {
          background: rgba(16,185,129,0.03);
          border: 1px dashed rgba(16,185,129,0.25);
          border-radius: 14px;
          padding: 16px 18px;
          margin-bottom: 24px;
        }
        .gov-projects-box h4 {
          font-size: .9rem;
          font-weight: 800;
          color: #059669;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .gov-projects-box ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .gov-projects-box li {
          font-size: .84rem;
          color: var(--text, #334155);
          position: relative;
          padding-right: 18px;
          line-height: 1.45;
        }
        .gov-projects-box li::before {
          content: "•";
          position: absolute;
          right: 4px;
          color: #10b981;
          font-weight: bold;
        }
        .gov-card-footer {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        /* Allocations Grid */
        .allocations-container { max-width: 900px; margin: 0 auto; }
        .allocations-grid { display: flex; flex-direction: column; gap: 14px; }
        .alloc-card {
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border, rgba(0,0,0,0.08));
          border-radius: 14px;
          padding: 16px 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .alloc-bar-wrap {
          height: 6px;
          background: rgba(0,0,0,0.06);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .alloc-bar { height: 100%; border-radius: 999px; }
        .alloc-bar.tone-emerald { background: #10b981; }
        .alloc-bar.tone-gold { background: #d97706; }
        .alloc-bar.tone-blue { background: #0284c7; }
        .alloc-bar.tone-coral { background: #e11d48; }
        .alloc-bar.tone-muted { background: #64748b; }
        .alloc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .alloc-header strong { font-size: 1rem; color: var(--heading, #0f172a); }
        .alloc-percent { font-size: 1.05rem; font-weight: 900; color: var(--emerald, #10b981); }
        .alloc-info p { margin: 0; font-size: .84rem; color: var(--muted, #64748b); line-height: 1.5; }

        /* Statement Callout Card */
        .statement-callout-card {
          background: linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(217,119,6,0.08) 100%);
          border: 1.5px solid rgba(16,185,129,0.25);
          border-radius: 24px;
          padding: 32px 36px;
          display: flex;
          align-items: center;
          gap: 32px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        }
        @media (max-width: 768px) {
          .statement-callout-card { flex-direction: column; text-align: center; padding: 24px 20px; }
        }
        .statement-callout-graphic { flex-shrink: 0; }
        .statement-a4-preview {
          width: 90px;
          height: 125px;
          background: #ffffff;
          border: 2px solid #059669;
          border-radius: 8px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          padding: 8px;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .a4-strip { height: 4px; background: #059669; border-radius: 2px; }
        .a4-line { height: 3px; background: rgba(0,0,0,0.1); border-radius: 2px; }
        .a4-line.short { width: 60%; }
        .a4-seal-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 2.2rem;
          color: rgba(16,185,129,0.2);
        }
        .a4-badge {
          position: absolute;
          bottom: 6px;
          left: 6px;
          right: 6px;
          background: #059669;
          color: #ffffff;
          font-size: 9px;
          font-weight: bold;
          text-align: center;
          border-radius: 4px;
          padding: 2px 0;
        }
        .callout-kicker {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #059669;
          font-size: .85rem;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .statement-callout-body h3 { font-size: 1.6rem; color: var(--heading, #0f172a); margin: 0 0 10px; font-weight: 900; }
        .statement-callout-body p { color: var(--text, #334155); font-size: .95rem; line-height: 1.6; margin-bottom: 20px; }
        .statement-callout-actions { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
      ` }} />

      {/* ─── Client-Side Map Interaction Script ─── */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var govData = ${JSON.stringify(governorates)};
          var dataMap = {};
          govData.forEach(function(g) { dataMap[g.id] = g; });

          var pillBtns = document.querySelectorAll('.gov-pill-btn');
          var pinGroups = document.querySelectorAll('.map-pin-group');

          var titleEl = document.getElementById('govTitle');
          var badgeEl = document.getElementById('govBadgeTag');
          var centerEl = document.querySelector('#govCenterText span');
          var hqBadgeEl = document.getElementById('govHqBadge');
          var descEl = document.getElementById('govDesc');
          var benEl = document.getElementById('statBeneficiaries');
          var conEl = document.getElementById('statConvoys');
          var medEl = document.getElementById('statMedical');
          var mealEl = document.getElementById('statMeals');
          var listEl = document.getElementById('govProjectsList');

          function selectGov(id) {
            var g = dataMap[id];
            if (!g) return;

            // Update pills
            pillBtns.forEach(function(b) {
              b.classList.toggle('active', b.getAttribute('data-gov-id') === id);
            });

            // Update pins
            pinGroups.forEach(function(p) {
              p.classList.toggle('active', p.getAttribute('data-pin-id') === id);
            });

            // Update card DOM
            if (titleEl) titleEl.textContent = g.name;
            if (badgeEl) badgeEl.textContent = g.badge;
            if (centerEl) centerEl.textContent = g.center;
            if (descEl) descEl.textContent = g.description;
            if (benEl) benEl.textContent = g.beneficiaries;
            if (conEl) conEl.textContent = g.convoys;
            if (medEl) medEl.textContent = g.medicalDevices;
            if (mealEl) mealEl.textContent = g.mealsAndBoxes;

            if (hqBadgeEl) {
              hqBadgeEl.style.display = g.isHQ ? 'inline-flex' : 'none';
            }

            if (listEl && g.keyProjects) {
              listEl.innerHTML = g.keyProjects.map(function(item) {
                return '<li>' + item + '</li>';
              }).join('');
            }
          }

          // Attach pill clicks
          pillBtns.forEach(function(b) {
            b.addEventListener('click', function() {
              var id = this.getAttribute('data-gov-id');
              selectGov(id);
            });
          });

          // Attach pin clicks
          pinGroups.forEach(function(p) {
            p.addEventListener('click', function() {
              var id = this.getAttribute('data-pin-id');
              selectGov(id);
            });
          });
        })();
      ` }} />
    </Layout>
  )
}

export function Volunteers({ user, stats }: { user?: UserSession, stats?: any }) {
  const roles = [
    ['fa-people-carry-box', 'تطوع ميداني', 'المشاركة في القوافل الإنسانية وتوزيع المساعدات على الأسر الأولى بالرعاية.', 'tone-emerald'],
    ['fa-user-doctor', 'تطوع طبي', 'دعم العيادات والقوافل الطبية وتقديم الاستشارات الصحية المجانية.', 'tone-blue'],
    ['fa-laptop-code', 'تطوع رقمي', 'المساهمة في تطوير المنصات الرقمية والتصميم والتوثيق الإعلامي.', 'tone-violet'],
    ['fa-chalkboard-user', 'تطوع تعليمي', 'تعليم الأطفال ومحو الأمية ودعم حلقات تحفيظ القرآن الكريم.', 'tone-gold'],
    ['fa-bullhorn', 'توعية وحملات', 'تنظيم حملات التوعية المجتمعية والمشاركة في الفعاليات.', 'tone-coral'],
    ['fa-people-roof', 'رعاية أسر', 'كفالة ومتابعة الأسر المحتاجة وتوصيل الدعم بانتظام.', 'tone-cyan']
  ]
  const totalVols = stats?.total || 0
  const totalHours = stats?.totalHours || 0

  return <Layout user={user} title="تطوع معنا | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="كن جزءًا من الحكاية" title={'قد لا تتبرع بالمال،<br/><em>لكن وقتك ثروة.</em>'} text="موهبتك، خبرتك، أو حتى ساعتان من يومك قد تصنع فرقًا حقيقيًا في حياة إنسان." />

    {/* Volunteer Impact Stats */}
    <section class="vol-impact section-pad" style="padding-bottom:0">
      <div class="vol-impact-grid">
        <article class="vol-impact-card reveal">
          <div class="vol-impact-icon">{icon('fa-users')}</div>
          <b>{totalVols > 0 ? totalVols : '٢٥'}+</b>
          <span>متطوع نشط</span>
        </article>
        <article class="vol-impact-card reveal" style="--delay:100ms">
          <div class="vol-impact-icon">{icon('fa-clock')}</div>
          <b>{totalHours > 0 ? totalHours : '٥٠٠'}+</b>
          <span>ساعة خدمة تطوعية</span>
        </article>
        <article class="vol-impact-card reveal" style="--delay:200ms">
          <div class="vol-impact-icon">{icon('fa-id-badge')}</div>
          <b>VOL</b>
          <span>بطاقة هوية رقمية</span>
        </article>
        <article class="vol-impact-card reveal" style="--delay:300ms">
          <div class="vol-impact-icon">{icon('fa-award')}</div>
          <b>٤</b>
          <span>رتب تطوعية</span>
        </article>
      </div>
    </section>

    {/* ID Verification Tool */}
    <section class="vol-verify-section section-pad reveal">
      <div class="vol-verify-box">
        <div class="vol-verify-header">
          <div class="vol-verify-icon-wrap">{icon('fa-shield-halved')}</div>
          <div>
            <h3>التحقق من هوية المتطوع</h3>
            <p>أدخل كود المتطوع للتأكد من صلاحية بطاقة الهوية واعتماده رسمياً من المؤسسة.</p>
          </div>
        </div>
        <div class="vol-verify-input-row">
          <input type="text" id="volVerifyInput" placeholder="أدخل الكود مثلاً VOL-1" autocomplete="off" />
          <button type="button" id="volVerifyBtn" class="primary-btn">{icon('fa-magnifying-glass')} تحقق الآن</button>
        </div>
        <div id="volVerifyResult" class="vol-verify-result" style="display:none"></div>
      </div>
    </section>

    {/* Volunteer Roles */}
    <section class="vol-roles section-pad">
      <div class="section-head"><p class="eyebrow">مسارات التطوع</p><h2>اختر مسارك<br/><em>واصنع أثرك.</em></h2></div>
      <div class="vol-role-grid">
        {roles.map((r, i) => <article class={`vol-role-card ${r[3]} reveal`} style={`--delay:${i * 80}ms`}>
          <div class="vol-role-icon">{icon(r[0])}</div>
          <h3>{r[1]}</h3>
          <p>{r[2]}</p>
        </article>)}
      </div>
    </section>

    {/* Volunteer ID Benefits */}
    <section class="vol-id-benefits section-pad" style="background:var(--ink);color:white">
      <div class="section-head"><p class="eyebrow" style="color:var(--gold-2)">بطاقة هوية المتطوع الرقمية</p><h2 style="color:white">كل متطوعٍ معتمد<br/><em style="color:var(--gold-2)">يحمل هويّته الرسمية.</em></h2></div>
      <div class="vol-benefits-grid">
        {[
          ['fa-fingerprint', 'كود فريد', 'كل متطوع يحصل على كود خاص (VOL-1, VOL-2...) يُعرّفه رسمياً.'],
          ['fa-calendar-check', 'صلاحية سنتين', 'البطاقة صالحة لمدة عامين كاملين من تاريخ الاعتماد.'],
          ['fa-star', 'رتب تطوعية', 'متطوع مبادر ← فعّال ← قائد ميداني ← سفير العطاء.'],
          ['fa-download', 'قابلة للتحميل', 'بطاقة احترافية يمكن تحميلها ومشاركتها بفخر.']
        ].map((b, i) => <article class="vol-benefit-card reveal" style={`--delay:${i * 100}ms`}>
          <div>{icon(b[0])}</div>
          <h4>{b[1]}</h4>
          <p>{b[2]}</p>
        </article>)}
      </div>
    </section>

    {/* Enhanced Luxury Application Form */}
    <section class="roles section-pad">
      <form class="vol-application-form ajax-form reveal" data-endpoint="/api/volunteers" method="post" id="volForm">
        <div class="vol-form-header">
          <span class="vol-form-badge">{icon('fa-hand-holding-heart')} بوابتك للعطاء</span>
          <h2>انضم إلى عائلة المتطوعين</h2>
          <p>قدّم طلبك الآن وسيقوم فريق الإدارة بمراجعته. بعد الاعتماد، ستتحول عضويتك تلقائياً إلى <strong>"متطوع رسمي"</strong> وستحصل على **بطاقة هويّة رقمية معتمدة** بكود خاص بك.</p>
        </div>

        {/* Photo Upload Box */}
        <div class="vol-form-avatar-section">
          <div class="vol-avatar-preview" id="volAvatarPreview">
            {icon('fa-camera')}
          </div>
          <div class="vol-avatar-text">
            <label class="vol-avatar-label primary-btn" id="volAvatarLabel" style="padding:10px 20px;font-size:.85rem">
              {icon('fa-cloud-arrow-up')} اختر صورة شخصية للبطاقة
              <input type="file" name="avatar_file" accept="image/*" id="volAvatarInput" style="display:none" />
            </label>
            <small style="color:var(--muted);display:block;margin-top:8px">الصورة ستظهر بشكل رسمي على بطاقة الهوية الرقمية (اختياري)</small>
          </div>
          <input type="hidden" name="avatar_url" id="volAvatarUrl" />
        </div>

        {/* Form Inputs Grid */}
        <div class="vol-input-grid">
          <div class="vol-input-group">
            <label>{icon('fa-user')} الاسم الكامل <span class="req">*</span></label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-user input-icon"></i>
              <input name="name" required placeholder="أدخل اسمك الرباعي هنا..." />
            </div>
          </div>

          <div class="vol-input-group">
            <label>{icon('fa-phone')} رقم الهاتف <span class="req">*</span></label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-phone input-icon"></i>
              <input name="phone" required placeholder="01xxxxxxxxx" dir="ltr" style="text-align:right" />
            </div>
          </div>

          <div class="vol-input-group">
            <label>{icon('fa-cake-candles')} العمر</label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-cake-candles input-icon"></i>
              <input name="age" type="number" min="16" max="90" placeholder="مثلاً 22" />
            </div>
          </div>

          <div class="vol-input-group">
            <label>{icon('fa-location-dot')} المدينة / المحافظة</label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-location-dot input-icon"></i>
              <input name="city" placeholder="مثلاً المنصورة، كفر العنانية..." />
            </div>
          </div>

          <div class="vol-input-group">
            <label>{icon('fa-envelope')} البريد الإلكتروني</label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-envelope input-icon"></i>
              <input
                name="email"
                type="email"
                placeholder="لإرسال تأكيد استلام طلبك (اختياري)"
                dir="ltr"
                style="text-align:right"
              />
            </div>
          </div>

          <div class="vol-input-group vol-full-width">
            <label>{icon('fa-briefcase')} مجال التطوع المفضل <span class="req">*</span></label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-layer-group input-icon"></i>
              <select name="role" required>
                {roles.map(r => <option value={r[1]}>{r[1]} — {r[2]}</option>)}
              </select>
            </div>
          </div>

          <div class="vol-input-group vol-full-width">
            <label>{icon('fa-wand-magic-sparkles')} الخبرات والمهارات الحالية</label>
            <div class="vol-input-wrapper">
              <i class="fa-solid fa-star input-icon"></i>
              <input name="skills" placeholder="مثلاً: قيادة سيارة، تصوير، برمجة، تنظيم، تدريس..." />
            </div>
          </div>
        </div>

        <div class="vol-form-footer">
          <button class="primary-btn submit-btn" type="submit" style="width:100%;justify-content:center;padding:18px;font-size:1.05rem">
            تقديم طلب التطوع الآن {icon('fa-paper-plane')}
          </button>
          <p class="vol-privacy-note">{icon('fa-lock')} بياناتك محفوظة ومحميّة بالكامل وفق أعلى معايير الخصوصية في المؤسسة.</p>
        </div>
      </form>
    </section>
  </Layout>
}

export function FAQ({ user }: { user?: UserSession }) {
  const qs = [
    ['كيف يمكنني التبرع للمؤسسة؟', 'يمكنك التبرع عبر إنستاباي بتحويل بنكي إلى البنك الزراعي المصري، حساب 10010397596901014، أو عبر إنستاباي/فودافون كاش على 01060920249، أو التبرع النقدي المباشر بالتنسيق مع الأستاذ جمال عبد الخالق.'],
    ['ما مجالات عمل المؤسسة؟', 'نعمل في الدعم الصحي، وتوزيع الغذاء، ودعم التعليم، ومسابقات القرآن، والمشروعات الإنتاجية، وقنوات الزكاة والصدقة، والمشروعات المجتمعية.'],
    ['أين يقع مقر المؤسسة؟', 'يقع مقر المؤسسة في كفر العنانية، محافظة الدقهلية، جمهورية مصر العربية.'],
    ['هل المؤسسة مرخصة رسميًا؟', 'نعم، المؤسسة مشهرة برقم 3115 لسنة 2026 وخاضعة لإشراف وزارة التضامن الاجتماعي والجهات الرقابية المختصة، وتعمل بكامل الشفافية والتوثيق.'],
    ['ما سعر صك الأضحية؟', 'الصك الخيري: 500 جنيه، والأضحية الكاملة: 11,000 جنيه. تقبل الله منا ومنكم.'],
    ['كيف أتأكد من وصول تبرعي؟', 'نلتزم بأعلى معايير الشفافية، وننشر تقارير الإنفاق والإنجازات باستمرار على منصتنا.']
  ]
  return <Layout user={user} title="الأسئلة الشائعة | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="أسئلة شائعة" title={'الوضوح أولُ<br/><em>خطوات الثقة.</em>'} text="جمعنا أكثر الأسئلة التي تصلنا. وإن لم تجد إجابتك، نحن على بُعد رسالة." />
    <section class="faq-list section-pad">{qs.map((q, i) => <details class="faq-item reveal" open={i === 0}><summary><span>0{i + 1}</span><h3>{q[0]}</h3><i class="fa-solid fa-plus"></i></summary><p>{q[1]}</p></details>)}</section>
  </Layout>
}

export function Contact({ user }: { user?: UserSession }) {
  return <Layout user={user} title="تواصل معنا | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="نحن قريبون" title={'رسالتك تصلُ<br/><em>إلى قلبٍ يسمع.</em>'} text="لا تتردد في السؤال أو الاقتراح أو طلب الشراكة. نحن هنا لخدمتكم." />
    <section class="contact-layout section-pad">
      <aside class="contact-info reveal">
        <p class="eyebrow">بيانات التواصل</p>
        <h2>بابنا مفتوح،<br />وقلوبنا كذلك.</h2>
        <a href="tel:01060920249">{icon('fa-phone')}<span><small>اتصل بنا</small><b dir="ltr">01060920249</b></span></a>
        <a href="mailto:info@omarhesham.org">{icon('fa-envelope')}<span><small>راسلنا</small><b>info@omarhesham.org</b></span></a>
        <div>{icon('fa-location-dot')}<span><small>تفضل بزيارتنا</small><b>كفر العنانية، الدقهلية، مصر</b></span></div>
        <div>{icon('fa-clock')}<span><small>مواعيد العمل</small><b>متاحون لخدمتكم — الجمعة إجازة</b></span></div>
      </aside>
      <form class="contact-form ajax-form reveal" data-endpoint="/api/contacts" method="post">
        <div class="form-grid">
          <label>الاسم<input name="name" required /></label>
          <label>البريد الإلكتروني<input name="email" type="email" required /></label>
          <label>الهاتف<input name="phone" /></label>
          <label>الموضوع<select name="subject"><option>استفسار عام</option><option>شراكة</option><option>شكوى أو اقتراح</option><option>إعلام وصحافة</option></select></label>
        </div>
        <label>رسالتك<textarea name="message" rows={6} required placeholder="اكتب رسالتك هنا..."></textarea></label>
        <button class="primary-btn">إرسال الرسالة {icon('fa-paper-plane')}</button>
      </form>
    </section>
  </Layout>
}

export function Transparency({ user }: { user?: UserSession }) {
  return <Layout user={user} title="الشفافية المالية | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="الشفافية المالية" title={'كل جنيهٍ أمانة،<br/><em>وكل خطوة موثّقة.</em>'} text="ثقتكم هي رأس مالنا الحقيقي؛ لذلك نلتزم بالوضوح من لحظة استلام التبرع حتى وصوله." />
    <section class="legal-credentials section-pad">
      <article class="legal-credentials-card reveal">
        <div class="legal-credentials-seal">{icon('fa-certificate')}</div>
        <h3>الاعتماد الرسمي والقانوني</h3>
        <ul>
          <li>{icon('fa-file-contract')}<span>مؤسسة أهلية مشهرة برقم <b>3115 لسنة 2026</b></span></li>
          <li>{icon('fa-building-columns')}<span>خاضعة لإشراف <b>وزارة التضامن الاجتماعي</b></span></li>
          <li>{icon('fa-scale-balanced')}<span>ملتزمون بأحكام <b>قانون تنظيم ممارسة العمل الأهلي رقم 149 لسنة 2019</b></span></li>
          <li>{icon('fa-landmark')}<span>الحسابات البنكية للمؤسسة خاضعة لمتابعة <b>الجهات الرقابية والمالية المختصة</b></span></li>
          <li>{icon('fa-file-invoice')}<span>سجلات مالية موثّقة وتقارير دورية قابلة للمراجعة</span></li>
        </ul>
      </article>
    </section>
    <section class="methodology section-pad">{[['fa-file-shield', 'توثيق التبرعات', 'نسجّل كل مساهمة ونربطها بالمسار الذي اختاره المتبرع.'], ['fa-magnifying-glass-chart', 'مراجعة داخلية', 'مراجعة دورية للمصروفات والمستندات وحالات الاستحقاق.'], ['fa-scale-balanced', 'إنفاق مسؤول', 'توجيه الموارد للأولوية والأكثر أثرًا مع تقليل التكلفة التشغيلية.']].map((m, i) => <article class="method-card reveal"><span>0{i + 1}</span>{icon(m[0])}<h3>{m[1]}</h3><p>{m[2]}</p></article>)}</section>
    <section class="promise section-pad"><p class="eyebrow">وعدنا للمتبرع</p><h2>لن نطلب ثقتك فقط،<br /><em>سنستحقّها كل يوم.</em></h2><p>نعمل على إصدار تقارير دورية أكثر تفصيلًا تشمل أبواب الصرف، أعداد المستفيدين، ونسب الإنجاز في كل حملة.</p></section>
  </Layout>
}

export function Gallery({ user, items }: { user?: UserSession, items?: any[] }) {
  const defaultItems = [
    { title: 'قافلة الدفء والإطعام', location: 'كفر العنانية', img: '/static/img/gallery-1.jpg', tag: 'غذاء' },
    { title: 'مستلزمات مدرسية للأطفال', location: 'الدقهلية', img: '/static/img/gallery-2.jpg', tag: 'تعليم' },
    { title: 'الرعاية الطبية والدواء', location: 'مستشفى كفر العنانية', img: '/static/img/gallery-3.jpg', tag: 'صحة' },
    { title: 'تكريم حفظة القرآن الكريم', location: 'المؤسسة', img: '/static/img/gallery-4.jpg', tag: 'قرآن' },
    { title: 'كسوة العيد للأسر الأولى بالرعاية', location: 'كفر العنانية', img: '/static/img/gallery-5.jpg', tag: 'مجتمع' },
    { title: 'فرحة العطاء في الميدان', location: 'الدقهلية', img: '/static/img/gallery-6.jpg', tag: 'تطوع' },
    { title: 'مشروع الأضاحي السنوي', location: 'كفر العنانية', img: '/static/img/gallery-7.jpg', tag: 'موسمي' },
    { title: 'زيارات ودية وتكريم الأوائل', location: 'منازل الطلاب', img: '/static/img/gallery-8.jpg', tag: 'تعليم' }
  ]

  const displayItems = (items && items.length > 0)
    ? items.map((it: any) => ({
        title: it.title,
        location: it.location || 'المؤسسة',
        img: it.image_url || it.img || '/static/img/gallery-1.jpg',
        tag: it.tag || 'عام'
      }))
    : defaultItems

  // Extract unique categories for filter tabs
  const rawCategories = Array.from(new Set(displayItems.map((i: any) => i.tag))).filter(Boolean)
  const categories = ['الكل', ...rawCategories]

  return <Layout user={user} title="معرض الصور | مؤسسة الدكتور عمر هشام">
    <PageHero kicker="معرض الصور" title={'وجوهٌ ومواقف،<br/><em>تقول ما لا تقوله الأرقام.</em>'} text="لقطات من الميدان، صُنعت فيها الفرحة بأيدي المتطوعين وقلوب المتبرعين." />
    
    <section class="gallery-section section-pad">
      {/* Category Filter Tabs */}
      <div class="gallery-filters">
        {categories.map((cat, idx) => (
          <button
            type="button"
            class={`gallery-filter-btn ${idx === 0 ? 'active' : ''}`}
            data-filter={cat === 'الكل' ? 'all' : cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Professional Photo Cards Grid */}
      <div class="gallery-cards-grid">
        {displayItems.map((item, i) => (
          <article class="gallery-card reveal" data-category={item.tag} data-img={item.img} data-title={item.title} data-location={item.location}>
            <div class="gallery-card-image-wrap">
              <img src={item.img} alt={item.title} class="gallery-card-img" loading="lazy" />
              <span class="gallery-card-tag">{item.tag}</span>
              <div class="gallery-card-overlay">
                <span class="gallery-zoom-icon">{icon('fa-magnifying-glass-plus')} تكبير الصورة</span>
              </div>
            </div>
            <div class="gallery-card-body">
              <h3 class="gallery-card-title">{item.title}</h3>
              <p class="gallery-card-location">{icon('fa-location-dot')} <span>{item.location}</span></p>
            </div>
          </article>
        ))}
      </div>
    </section>

    {/* Lightbox Preview Modal */}
    <div id="gallery-lightbox" class="gallery-lightbox" aria-hidden="true">
      <div class="gallery-lightbox-backdrop"></div>
      <div class="gallery-lightbox-content">
        <button id="gallery-lightbox-close" type="button" class="gallery-lightbox-close" aria-label="إغلاق المعاينة">
          {icon('fa-xmark')}
        </button>
        <div class="gallery-lightbox-img-box">
          <img id="gallery-lightbox-img" src="" alt="" />
        </div>
        <div class="gallery-lightbox-caption">
          <span id="gallery-lightbox-tag" class="gallery-card-tag"></span>
          <h3 id="gallery-lightbox-title"></h3>
          <p id="gallery-lightbox-location">{icon('fa-location-dot')} <span></span></p>
        </div>
      </div>
    </div>
  </Layout>
}

export function GenericNotFound({ user, title, message }: { user?: UserSession, title?: string, message?: string }) {
  return <Layout user={user} title={`${title || 'الصفحة غير موجودة'} | مؤسسة الدكتور عمر هشام`}>
    <section class="empty-state section-pad" style="min-height:70vh; display:flex; flex-direction:column; justify-content:center; align-items:center">
      <div>{icon('fa-compass')}<span></span></div>
      <h2>{title || 'عذرًا، الصفحة غير موجودة (404)'}</h2>
      <p>{message || 'قد يكون الرابط خاطئًا أو تم نقل الصفحة إلى مكان آخر.'}</p>
      <a class="primary-btn" href="/">العودة للرئيسية {icon('fa-arrow-left')}</a>
    </section>
  </Layout>
}
