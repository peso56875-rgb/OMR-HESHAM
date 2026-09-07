import { icon, Layout, SectionHead, CampaignCard, cssBackground } from './shared'
import { defaultPrograms, defaultCampaigns, defaultNews } from '../defaults'
import type { UserSession } from '../types'

export function Home({ campaigns = [], programs = [], news = [], stories = [], user }: { campaigns?: any[], programs?: any[], news?: any[], stories?: any[], user?: UserSession }) {
  const renderNews = news.length > 0 ? news : defaultNews

  return <Layout user={user} showFooter>
    <section class="hero" id="hero-section">
      <div class="hero-pattern"></div><div class="hero-halo halo-one"></div><div class="hero-halo halo-two"></div>
      <div class="hero-copy reveal"><div class="hero-badge"><span></span>صدقة جارية على روح الدكتور عمر هشام</div><h1>حين يرحلُ الجسد،<br /><em>يبقى الخيرُ حيًّا.</em></h1><p>نُكمل حلم طبيبٍ شاب أراد أن يداوي الناس، فنحوّل عطاءكم إلى دواءٍ وأملٍ وعلمٍ يصل إلى من يستحق.</p><div class="hero-actions"><a class="primary-btn magnetic" href="/donate">ابدأ أثرًا الآن {icon('fa-arrow-left')}</a><a class="story-link" href="/about"><i class="fa-solid fa-play"></i><span><small>اكتشف</small>حكاية عمر</span></a></div><div class="trust-row"><span>{icon('fa-circle-check')} جهة رسمية مرخصة</span><span class="trust-reg">{icon('fa-file-contract')} تشهير رقم <b>3115</b> لسنة 2026</span><span>{icon('fa-location-dot')} كفر العنانية، الدقهلية</span></div></div>
      <div class="hero-art reveal">
        <div class="orbit orbit-a"><i></i><span>{icon('fa-heart-pulse')}</span></div><div class="orbit orbit-b"><i></i><span>{icon('fa-book-open')}</span></div>
        <div class="logo-sanctuary"><div class="arch"></div><img src="/static/foundation-logo.png" alt="مؤسسة الدكتور عمر هشام الخيرية" /><span class="spark s1">✦</span><span class="spark s2">✦</span><span class="spark s3">✦</span></div>
        <div class="floating-note"><i class="fa-solid fa-infinity"></i><span><small>عطاء</small>لا ينقطع</span></div>
      </div>
      <a href="#impact" class="scroll-cue"><span>اكتشف الأثر</span><i></i></a>
    </section>

    <section class="impact-ribbon" id="impact"><div><b class="counter" data-target="50">0</b><span>أسرة وصل إليها الدعم</span></div><i></i><div><b class="counter" data-target="80000">0</b><span>جنيه دعم مباشر</span></div><i></i><div><b>6</b><span>مسارات لصناعة الخير</span></div><i></i><div><b>∞</b><span>أثر نرجو ألا ينقطع</span></div></section>

    <section class="story-section section-pad">
      <div class="story-portrait reveal"><div class="portrait-frame"><img src="/static/omar-portrait.jpg" alt="الدكتور عمر هشام" /><span class="portrait-shine"></span></div><div class="portrait-caption"><i class="fa-solid fa-stethoscope"></i><p>كان يحلم<br /><strong>أن يداوي الناس</strong></p></div><span class="year-mark">رحمه الله</span></div>
      <article class="story-copy reveal"><p class="eyebrow"><span></span>الحكاية التي بدأت منها الرحلة</p><h2>حلمُ طبيبٍ شاب،<br />صار <em>مؤسسةً للرحمة.</em></h2><blockquote>«عمر لم يكن مجرد ابن، كان طالب طب نابغًا يحلم بعلاج الناس… فأردتُ أن يستمر حلمه وألا ينقطع عمله الصالح.»</blockquote><p>أسّس المهندس هشام صبري هذه المؤسسة كصدقة جارية على روح ابنه، لتبقى يده ممتدة إلى كل مريض ومحتاج.</p><a class="text-arrow" href="/about">اقرأ الحكاية كاملة <i class="fa-solid fa-arrow-left-long"></i></a></article>
    </section>

    {/* ===== News — first, directly under Dr. Omar's story ===== */}
    <section class="news-section section-pad">
      <div class="head-row">
        <SectionHead kicker="يوميات الرحمة" title={'أخبارٌ لا تُقرأ فقط،<br/><em>بل تُشعرك أن الخير قريب.</em>'} />
        <a class="text-arrow" href="/news">كل الأخبار {icon('fa-arrow-left-long')}</a>
      </div>
      <div class="news-pro-grid">
        {renderNews.slice(0, 3).map((n) => {
          const isDoc = typeof n.id !== 'undefined'
          const title = isDoc ? n.title : n[0]
          const cat = isDoc ? (n.category || 'أخبار') : n[1]
          const excerpt = isDoc ? n.excerpt : n[2]
          const ic = isDoc ? (n.icon || 'fa-newspaper') : n[3]
          const date = isDoc ? new Date(n.publish_date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) : '١٢ يوليو ٢٠٢٦'
          const img = isDoc ? String(n.image_url || '').trim() : ''
          const href = isDoc ? `/news/${n.id}` : '/news'

          return <article class="news-pro-card reveal">
            <a href={href} class="news-pro-art" style={img ? `${cssBackground(img)}color:transparent;` : ''}>
              {!img && icon(ic)}
              <span class="news-chip on-art">{cat}</span>
            </a>
            <div class="news-pro-body">
              <time>{icon('fa-calendar-day')} {date}</time>
              <h4>{title}</h4>
              <p>{excerpt}</p>
              <a href={href} class="news-pro-link">اقرأ المزيد {icon('fa-arrow-left')}</a>
            </div>
          </article>
        })}
      </div>
    </section>

    <section class="programs section-pad">
      <SectionHead kicker="مساحات العطاء" title={'ستةُ أبواب،<br/><em>ووجهةٌ واحدة: الإنسان.</em>'} text="نصل إلى الإنسان في صحته وتعليمه وغذائه وروحه؛ لأن التنمية الحقيقية لا تترك جانبًا من الحياة خلفها." />
      <div class="program-grid">
        {programs.length > 0 ? (
          programs.map((p: any, i: number) => {
            const tone = p.tone || 'gold'
            const ic = p.icon || 'fa-hand-holding-heart'
            const link = p.link || '/campaigns'
            const num = String(p.order ?? i + 1).padStart(2, '0')
            return <article class={`program-card reveal tone-${tone}`} style={`--delay:${i * 70}ms`}>
              <span class="program-index">{num}</span>
              <div class="program-icon">{icon(ic)}</div>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <a href={link} aria-label={`اعرف المزيد عن ${p.title}`}><i class="fa-solid fa-arrow-left"></i></a>
            </article>
          })
        ) : (
          <div style="grid-column:1/-1; text-align:center; padding:3.5rem 1.5rem; background:var(--paper); border:1px dashed var(--line); border-radius:var(--radius)">
            <div style="width:56px; height:56px; border-radius:16px; background:rgba(214,166,75,0.12); color:var(--gold); display:grid; place-items:center; font-size:1.6rem; margin:0 auto 1rem">
              {icon('fa-door-open')}
            </div>
            {user?.role === 'admin' ? (
              <>
                <h4 style="margin:0 0 8px; font-size:1.2rem">لم تُضف أي أبواب أو مسارات بعد</h4>
                <p style="color:var(--muted); max-width:500px; margin:0 auto 1.5rem; font-size:.92rem">
                  تم إخلاء الصفحة الرئيسية من البيانات التجريبية كما طلبت. يمكنك الآن إضافة الأبواب الحقيقية أو استيراد الأبواب الستة بنقرة واحدة من لوحة التحكم.
                </p>
                <a class="primary-btn" href="/dashboard?view=programs" style="display:inline-flex; align-items:center; gap:8px">
                  {icon('fa-plus')} إدارة أبواب العطاء من لوحة التحكم
                </a>
              </>
            ) : (
              <>
                <h4 style="margin:0 0 8px; font-size:1.15rem">أبواب العطاء ومساحات الخير</h4>
                <p style="color:var(--muted); margin:0; font-size:.95rem">
                  نصل إلى الإنسان في صحته وتعليمه وغذائه وروحه — ترقبوا تفاصيل برامجنا قريبًا.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>

    <section class="verse-break"><div class="verse-stars"></div><p class="reveal">﴿ مَثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ ﴾</p><span>البقرة — ٢٦١</span></section>

    <section class="campaigns-preview section-pad">
      <div class="head-row">
        <SectionHead kicker="الأثر ينتظرك" title={'اختر القصة التي<br/><em>تريد أن تغيّر نهايتها.</em>'} />
        {campaigns.length > 0 && <a class="outline-btn" href="/campaigns">كل الحملات {icon('fa-arrow-left')}</a>}
      </div>
      <div class="campaign-grid">
        {campaigns.length > 0 ? (
          campaigns.slice(0, 3).map(c => <CampaignCard c={c} />)
        ) : (
          <div style="grid-column:1/-1; width:100%; text-align:center; padding:3.5rem 1.5rem; background:var(--paper); border:1px dashed var(--line); border-radius:var(--radius)">
            <div style="width:56px; height:56px; border-radius:16px; background:rgba(67,160,71,0.12); color:var(--emerald-600); display:grid; place-items:center; font-size:1.6rem; margin:0 auto 1rem">
              {icon('fa-bullseye')}
            </div>
            {user?.role === 'admin' ? (
              <>
                <h4 style="margin:0 0 8px; font-size:1.2rem">لا توجد حملات منشورة حاليًا</h4>
                <p style="color:var(--muted); max-width:500px; margin:0 auto 1.5rem; font-size:.92rem">
                  تم إخلاء الصفحة الرئيسية من الحملات التجريبية. يمكنك الآن نشر أول حملة حقيقية بالاسم والهدف والأيقونة من لوحة التحكم.
                </p>
                <a class="primary-btn" href="/dashboard?view=campaigns" style="display:inline-flex; align-items:center; gap:8px">
                  {icon('fa-plus')} إضافة حملة جديدة من لوحة التحكم
                </a>
              </>
            ) : (
              <>
                <h4 style="margin:0 0 8px; font-size:1.15rem">حملات الأثر القادمة</h4>
                <p style="color:var(--muted); margin:0; font-size:.95rem">
                  نعمل حاليًا على إعداد وتوثيق الحالات الجديدة — ترقبوا إطلاق حملاتنا قريبًا.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </section>

    <section class="process section-pad"><div class="process-bg-word">أثر</div><SectionHead kicker="من يدك إلى مستحقه" title={'طريقٌ واضح،<br/><em>وأمانةٌ محفوظة.</em>'} /><div class="steps">{[['fa-hand-holding-heart', 'تتبرّع', 'اختر المسار والمبلغ الذي يناسبك.'], ['fa-magnifying-glass-chart', 'نبحث', 'ندرس الحالات ميدانيًا بعناية.'], ['fa-box-open', 'نُوصل', 'نقدم الدعم بكرامة وخصوصية.'], ['fa-chart-line', 'نُوثّق', 'نشاركك أين وكيف صُنع الأثر.']].map((s, i) => <article class="step reveal"><span>0{i + 1}</span><div>{icon(s[0])}</div><h3>{s[1]}</h3><p>{s[2]}</p>{i < 3 && <i class="step-line"></i>}</article>)}</div></section>

    <section class="quote-section section-pad"><div class="quote-mark">“</div><blockquote class="reveal">لسنا نمنحُ الناس مساعدةً عابرة،<br />بل نقول لهم: <em>أنتم لستم وحدكم.</em></blockquote><div class="quote-person"><span>هـ ص</span><p><b>المهندس هشام صبري</b><small>المؤسس ورئيس مجلس الإدارة</small></p></div></section>

    <section class="final-cta"><div class="cta-rays"></div><img src="/static/foundation-logo.png" alt="" /><p class="eyebrow">قد تكون أنت الإجابة عن دعاء شخصٍ ما</p><h2>ازرع خيرًا اليوم،<br /><em>ودعه يُزهر إلى الأبد.</em></h2><div><a class="light-btn magnetic" href="/donate">تبرّع الآن {icon('fa-heart')}</a><a href="/volunteers">أو شارك بوقتك <i class="fa-solid fa-arrow-left"></i></a></div></section>
  </Layout>
}
