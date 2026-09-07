import { icon, Layout, PageHero } from './shared'
import type { UserSession } from '../types'
import {
  NOTIFICATION_TYPES,
  CATEGORY_LABELS,
  type NotificationCategory,
  type NotificationTypeDef
} from '../lib/notifications'

/**
 * ═══════════════════════ مكونات واجهة الإشعارات ═══════════════════════
 *
 * يحتوي هذا الملف على جميع المكونات البصرية لنظام الإشعارات:
 *  1. زر وجرس الإشعارات والقائمة المنسدلة (NotificationBell)
 *  2. الصفحة المستقلة للإشعارات للمستخدمين (/notifications)
 *  3. شاشة إدارة الإشعارات والتشخيص للوحة التحكم (DashNotifications)
 *  4. بطاقة إدارة التفضيلات والساعات الهادئة (NotificationPrefsSection)
 */

/** مساعد صياغة التاريخ النسبي بالعربية */
export function timeAgo(dateString: string): string {
  if (!dateString) return 'منذ قليل'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'منذ قليل'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSec < 45) return 'الآن'
  if (diffMin < 60) return `منذ ${diffMin.toLocaleString('ar-EG')} دقيقة`
  if (diffHours < 24) {
    if (diffHours === 1) return 'منذ ساعة'
    if (diffHours === 2) return 'منذ ساعتين'
    if (diffHours >= 3 && diffHours <= 10) return `منذ ${diffHours.toLocaleString('ar-EG')} ساعات`
    return `منذ ${diffHours.toLocaleString('ar-EG')} ساعة`
  }
  if (diffDays === 1) return 'أمس'
  if (diffDays === 2) return 'منذ يومين'
  if (diffDays <= 7) return `منذ ${diffDays.toLocaleString('ar-EG')} أيام`
  
  return date.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

/** 1. جرس الإشعارات (ينقل مباشرة وفوراً إلى صفحة الإشعارات /notifications دون نوافذ منبثقة) */
export function NotificationBell({ user, isDashboard = false }: { user?: UserSession; isDashboard?: boolean }) {
  return (
    <div class="notif-bell-container" id={isDashboard ? 'dashNotifBellContainer' : 'notifBellContainer'}>
      <a
        href="/notifications"
        class={`notif-bell-btn ${isDashboard ? 'dash-bell-btn' : 'header-bell-btn'}`}
        id={isDashboard ? 'dashNotifBellBtn' : 'notifBellBtn'}
        aria-label="مركز الإشعارات والتنبيهات"
        title="الانتقال إلى مركز الإشعارات"
      >
        <i class="fa-solid fa-bell notif-bell-icon" aria-hidden="true"></i>
        <span class="notif-badge" id={isDashboard ? 'dashNotifBadge' : 'notifBadge'} style="display:none" aria-label="إشعارات غير مقروءة">0</span>
      </a>
    </div>
  )
}

/** 2. الصفحة المطورة الشاملة لمركز الإشعارات (/notifications) */
export function NotificationsPage({
  user,
  items = [],
  totalCount = 0,
  unreadCount = 0,
  highCount = 0,
  catCounts = {},
  pushAvailable = false,
  selectedCategory = '',
  selectedFilter = 'all',
  searchQuery = ''
}: {
  user?: UserSession
  items: any[]
  totalCount?: number
  unreadCount?: number
  highCount?: number
  catCounts?: Record<string, number>
  pushAvailable?: boolean
  selectedCategory?: string
  selectedFilter?: string
  searchQuery?: string
}) {
  const categories = Object.entries(CATEGORY_LABELS) as [NotificationCategory, string][]
  const effectiveTotal = totalCount || items.length

  return (
    <Layout user={user} title="مركز الإشعارات والتنبيهات | مؤسسة الدكتور عمر هشام">
      <PageHero
        kicker="مركز التنبيهات المباشر"
        title={'إشعاراتك وتحديثاتك<br/><em>كن دائمًا في قلب الأثر والخير.</em>'}
        text="متابعة حية وشاملة لجميع تبرعاتك، وتقارير الحالات، وإنجازات وساعات التطوع، وآخر مستجدات المؤسسة فور حدوثها."
      />

      <section class="section-pad notif-page-section" style="padding-top: 0">
        <div class="notif-page-container">
          
          {/* ══════ شريط الحالة اللحظية وبطاقات المؤشرات (KPIs) ══════ */}
          <div class="notif-kpi-banner reveal">
            <div class="notif-live-status-chip">
              <span class="status-pulse-dot"></span>
              <span>مزامنة الإشعارات نشطة لحظياً</span>
            </div>

            <div class="notif-kpis-row">
              {/* إجمالي الإشعارات */}
              <div class="notif-kpi-box kpi-total">
                <div class="notif-kpi-icon">{icon('fa-envelope-open-text')}</div>
                <div class="notif-kpi-meta">
                  <span class="notif-kpi-title">إجمالي الإشعارات</span>
                  <b class="notif-kpi-num" id="notifTotalNum">{effectiveTotal.toLocaleString('ar-EG')}</b>
                </div>
              </div>

              {/* غير المقروءة */}
              <div class="notif-kpi-box kpi-unread">
                <div class="notif-kpi-icon">{icon('fa-circle-dot')}</div>
                <div class="notif-kpi-meta">
                  <span class="notif-kpi-title">غير المقروءة</span>
                  <b class="notif-kpi-num unread-text" id="notifPageUnreadTotal">{unreadCount.toLocaleString('ar-EG')}</b>
                </div>
              </div>

              {/* عاجلة وهامة */}
              <div class="notif-kpi-box kpi-high">
                <div class="notif-kpi-icon">{icon('fa-bolt')}</div>
                <div class="notif-kpi-meta">
                  <span class="notif-kpi-title">عاجل وهام</span>
                  <b class="notif-kpi-num high-text" id="notifHighNum">{highCount.toLocaleString('ar-EG')}</b>
                </div>
              </div>

              {/* إشعارات الشاشة Push */}
              <div class="notif-kpi-box kpi-push">
                <div class="notif-kpi-icon">{icon('fa-tower-broadcast')}</div>
                <div class="notif-kpi-meta">
                  <span class="notif-kpi-title">إشعارات الشاشة (Push)</span>
                  <b class="notif-kpi-num push-status-text" id="notifPushStatusLabel">
                    {pushAvailable ? 'متاحة للتفعيل' : 'نشطة'}
                  </b>
                </div>
              </div>
            </div>
          </div>

          {/* ══════ شريط الأدوات والبحث والإجراءات السريعة ══════ */}
          <div class="notif-page-toolbar reveal">
            {/* البحث الحي الفوري */}
            <div class="notif-search-wrapper">
              <span class="notif-search-icon">{icon('fa-magnifying-glass')}</span>
              <input
                type="text"
                id="notifSearchInput"
                class="notif-search-input"
                placeholder="ابحث فوراً في الإشعارات (العنوان، النص، المرسل)..."
                value={searchQuery}
                aria-label="البحث في الإشعارات"
              />
              <button
                type="button"
                id="notifSearchClear"
                class="notif-search-clear-btn"
                title="مسح البحث"
                style={searchQuery ? 'display:flex' : 'display:none'}
              >
                {icon('fa-xmark')}
              </button>
            </div>

            {/* الأزرار التفاعلية السريعة */}
            <div class="notif-toolbar-actions">
              <button
                type="button"
                class="notif-tool-btn mark-all-btn"
                id="notifPageMarkAll"
                title="تحديد كل الإشعارات كمقروءة"
              >
                {icon('fa-check-double')}
                <span>قراءة الكل</span>
              </button>

              <button
                type="button"
                class="notif-tool-btn clear-read-btn"
                id="notifPageClearRead"
                title="تفريغ وحذف الإشعارات المقروءة"
              >
                {icon('fa-trash-can')}
                <span>تفريغ المقروء</span>
              </button>

              <button
                type="button"
                class="notif-tool-btn push-toggle-btn"
                id="notifEnablePushBtn"
                title="تفعيل إشعارات المتصفح والهاتف"
              >
                {icon('fa-mobile-screen-button')}
                <span>إشعارات الشاشة</span>
              </button>

              {user?.role === 'admin' && (
                <a
                  href="/dashboard?view=notifications"
                  class="notif-tool-btn admin-broadcast-btn"
                  title="الانتقال إلى لوحة بث الإشعارات الإدارية"
                >
                  {icon('fa-paper-plane')}
                  <span>لوحة البث (إدارة)</span>
                </a>
              )}
            </div>
          </div>

          {/* ══════ فلاتر التبويبات والتصنيفات ══════ */}
          <div class="notif-tabs-bar reveal">
            <div class="notif-filters-scroll" id="notifFiltersContainer">
              {/* تبويب: الكل */}
              <a
                href="/notifications"
                class={`notif-filter-tab ${!selectedCategory && selectedFilter === 'all' ? 'active' : ''}`}
                data-filter="all"
              >
                {icon('fa-layer-group')}
                <span>كافة الإشعارات</span>
                <span class="filter-count-badge">{effectiveTotal}</span>
              </a>

              {/* تبويب: غير المقروءة */}
              <a
                href="/notifications?filter=unread"
                class={`notif-filter-tab ${selectedFilter === 'unread' ? 'active' : ''}`}
                data-filter="unread"
              >
                {icon('fa-circle-dot')}
                <span>غير المقروءة</span>
                <span class="filter-count-badge unread-badge">{unreadCount}</span>
              </a>

              {/* تبويب: عاجل وهام */}
              <a
                href="/notifications?filter=high"
                class={`notif-filter-tab ${selectedFilter === 'high' ? 'active' : ''}`}
                data-filter="high"
              >
                {icon('fa-bolt')}
                <span>عاجل وهام</span>
                <span class="filter-count-badge high-badge">{highCount}</span>
              </a>

              {/* تصنيفات المنصة */}
              {categories.map(([key, label]) => {
                const defIcon = NOTIFICATION_TYPES[`${key}_new`]?.icon || 'fa-tag'
                const count = catCounts[key] || 0
                return (
                  <a
                    href={`/notifications?category=${key}`}
                    class={`notif-filter-tab ${selectedCategory === key ? 'active' : ''}`}
                    data-category={key}
                  >
                    <i class={`fa-solid ${defIcon}`}></i>
                    <span>{label}</span>
                    {count > 0 && <span class="filter-count-badge">{count}</span>}
                  </a>
                )
              })}
            </div>
          </div>

          {/* ══════ صندوق عرض نتائج البحث الصفرية ══════ */}
          <div id="notifZeroSearch" class="notif-zero-search" style="display:none">
            <div class="notif-zero-icon">{icon('fa-magnifying-glass')}</div>
            <h3>لم نعثر على أي إشعارات مطابقة</h3>
            <p>لا توجد إشعارات تتضمن كلمة البحث الحالية. جرب البحث بكلمات أخرى أو أعد ضبط البحث.</p>
            <button type="button" class="notif-reset-search-btn" id="notifResetSearchBtn">
              {icon('fa-arrows-rotate')} إظهار جميع الإشعارات
            </button>
          </div>

          {/* ══════ قائمة بطاقات الإشعارات الرئيسية ══════ */}
          <div class="notif-page-list-card reveal" id="notifListCard">
            {items.length === 0 ? (
              <div class="notif-page-empty">
                <div class="notif-page-empty-icon">
                  <i class="fa-solid fa-envelope-open-text"></i>
                </div>
                <h3>صندوق الإشعارات فارغ</h3>
                <p>لا توجد أي إشعارات مسجلة لك حالياً في هذا القسم. ستظهر هنا كافة التحديثات أولاً بأول.</p>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:1.25rem">
                  <a href="/campaigns" class="primary-btn">
                    <span>استكشف حملات الخير</span> <i class="fa-solid fa-heart"></i>
                  </a>
                  <a href="/quran" class="notif-page-btn" style="padding:10px 20px; font-size:.9rem">
                    <span>واحة القرآن الكريم</span> <i class="fa-solid fa-book-quran"></i>
                  </a>
                </div>
              </div>
            ) : (
              <div class="notif-feed-list" id="notifFeedList">
                {items.map((item) => {
                  const isRead = Boolean(item.is_read)
                  const link = item.link || ''
                  const iconName = item.icon || 'fa-bell'
                  const catLabel = CATEGORY_LABELS[item.category as NotificationCategory] || 'عام'
                  const isHigh = item.priority === 'high'
                  const fullDate = item.created_at ? new Date(item.created_at).toLocaleString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

                  return (
                    <article
                      class={`notif-feed-item ${isRead ? 'is-read' : 'is-unread'} priority-${item.priority || 'normal'} cat-${item.category || 'general'}`}
                      data-id={item.id}
                      data-category={item.category || ''}
                      data-priority={item.priority || 'normal'}
                      data-read={isRead ? '1' : '0'}
                      data-link={link}
                    >
                      {/* أيقونة الإشعار مع شارة النبض */}
                      <div class="notif-feed-icon-wrap" title={catLabel}>
                        <i class={`fa-solid ${iconName}`}></i>
                        {!isRead && <span class="notif-item-unread-dot" title="إشعار غير مقروء"></span>}
                      </div>

                      {/* المحتوى النصي */}
                      <div class="notif-feed-content">
                        <div class="notif-feed-top">
                          <span class="notif-feed-cat-badge">{catLabel}</span>
                          {isHigh && (
                            <span class="notif-feed-prio-badge">
                              {icon('fa-bolt')} عاجل
                            </span>
                          )}
                          <time class="notif-feed-time" datetime={item.created_at} title={fullDate}>
                            {icon('fa-clock')} {timeAgo(item.created_at)}
                          </time>
                        </div>

                        <h4 class="notif-feed-title">
                          {link ? (
                            <a href={link} class="notif-feed-link">
                              {item.title}
                            </a>
                          ) : (
                            <span>{item.title}</span>
                          )}
                        </h4>

                        {item.body && <p class="notif-feed-body">{item.body}</p>}

                        <div class="notif-feed-footer-meta">
                          {item.actor_name && (
                            <span class="notif-feed-actor">
                              {icon('fa-shield-halved')}
                              <span>بواسطة: {item.actor_name}</span>
                            </span>
                          )}
                          {link && (
                            <a href={link} class="notif-inline-cta">
                              <span>عرض التفاصيل</span>
                              {icon('fa-arrow-left')}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* أزرار الإجراءات التفاعلية على مستوى البطاقة */}
                      <div class="notif-feed-actions">
                        {/* زر تبديل حالة القراءة */}
                        <button
                          type="button"
                          class={`notif-action-btn notif-toggle-read-btn ${isRead ? 'is-read-btn' : 'is-unread-btn'}`}
                          data-id={item.id}
                          data-status={isRead ? 'read' : 'unread'}
                          title={isRead ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                          aria-label={isRead ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                        >
                          {isRead ? icon('fa-envelope') : icon('fa-check')}
                        </button>

                        {/* زر حذف الإشعار */}
                        <button
                          type="button"
                          class="notif-action-btn notif-delete-card-btn"
                          data-id={item.id}
                          title="حذف هذا الإشعار نهائياً"
                          aria-label="حذف الإشعار"
                        >
                          {icon('fa-trash-can')}
                        </button>

                        {/* زر الانتقال للرابط إذا وجد */}
                        {link && (
                          <a
                            href={link}
                            class="notif-action-btn notif-feed-arrow-link"
                            title="الانتقال إلى الرابط"
                            aria-label="الانتقال إلى الرابط"
                          >
                            {icon('fa-arrow-left')}
                          </a>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          {/* ══════ قسم التفضيلات أو دعوة تسجيل الدخول للزوار ══════ */}
          <div class="notif-page-prefs-wrapper reveal" style="margin-top: 2.5rem">
            {user ? (
              <NotificationPrefsSection user={user} pushAvailable={pushAvailable} />
            ) : (
              <div class="profile-card-modern notif-guest-callout">
                <div class="notif-guest-callout-icon">
                  <i class="fa-solid fa-bell-concierge"></i>
                </div>
                <div class="notif-guest-callout-text">
                  <h3>سجّل دخولك لمتابعة إشعاراتك وتفضيلاتك الشخصية</h3>
                  <p>تصلك إشعارات فورية عن تبرعاتك وساعات تطوعك، مع إمكانية تخصيص التنبيهات وتفعيل الساعات الهادئة بسهولة.</p>
                </div>
                <div class="notif-guest-callout-actions">
                  <a href="/login" class="primary-btn">
                    <span>تسجيل الدخول</span>
                    <i class="fa-solid fa-right-to-bracket"></i>
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>
    </Layout>
  )
}

/** 3. شاشة إدارة الإشعارات داخل لوحة التحكم (DashNotifications) */
export function DashNotifications({
  list = [],
  stats = {},
  pushConfigured = false,
  user
}: {
  list: any[]
  stats: any
  pushConfigured: boolean
  user: UserSession
}) {
  const total = list.length
  const unread = list.filter((i) => !i.is_read).length
  const devices = stats.devices || 0

  return (
    <div class="dash-notifications-wrapper">
      {/* رأس الصفحة مع الإحصائيات والأزرار السريعة */}
      <div class="dash-notif-hero-card">
        <div class="dash-notif-hero-content">
          <div class="dash-notif-badge">
            {icon('fa-tower-broadcast')} مركز البث والتنبيهات المباشرة
          </div>
          <h2>إدارة الإشعارات وبث التنبيهات الفورية</h2>
          <p>
            أرسل إشعارات مخصصة وبث عام لكافة المستخدمين أو المتطوعين أو المتبرعين، مع إمكانية الإرسال الفوري كإشعارات شاشة (Web Push) والتسجيل في مركز الإشعارات الداخلي.
          </p>
        </div>

        <div class="dash-notif-hero-actions">
          <button
            type="button"
            id="dashOpenSendModalBtn"
            class="dash-notif-action-btn primary-broadcast-btn"
          >
            {icon('fa-paper-plane')} <span>+ إرسال إشعار جديد</span>
          </button>
          <button
            type="button"
            id="dashSendTestNotifBtn"
            class="dash-notif-action-btn test-btn"
            title="فحص عمل إشعارات الشاشة والنظام"
          >
            {icon('fa-flask')} <span>إشعار تجريبي</span>
          </button>
          <button
            type="button"
            id="dashMarkAllNotifRead"
            class="dash-notif-action-btn neutral-btn"
          >
            {icon('fa-check-double')} <span>قراءة الكل</span>
          </button>
          <button
            type="button"
            id="dashClearReadNotifsBtn"
            class="dash-notif-action-btn clean-btn"
            title="تفريغ الإشعارات المقروءة القديمة"
          >
            {icon('fa-trash-can')} <span>تفريغ المقروء</span>
          </button>
        </div>
      </div>

      {/* بطاقات المؤشرات (KPIs) */}
      <div class="dash-notif-kpis-grid">
        <article class="dash-notif-kpi-card gold-kpi">
          <div class="kpi-icon-wrap">
            {icon('fa-bell')}
          </div>
          <div class="kpi-info">
            <span class="kpi-label">إجمالي الإشعارات المسجلة</span>
            <b class="kpi-val">{total.toLocaleString('ar-EG')}</b>
          </div>
        </article>

        <article class="dash-notif-kpi-card rose-kpi">
          <div class="kpi-icon-wrap">
            {icon('fa-circle-dot')}
          </div>
          <div class="kpi-info">
            <span class="kpi-label">غير المقروءة بالإدارة</span>
            <b class="kpi-val">{unread.toLocaleString('ar-EG')}</b>
          </div>
        </article>

        <article class="dash-notif-kpi-card emerald-kpi">
          <div class="kpi-icon-wrap">
            {icon('fa-mobile-screen-button')}
          </div>
          <div class="kpi-info">
            <span class="kpi-label">أجهزة الـ Web Push المشتركة</span>
            <b class="kpi-val">{devices.toLocaleString('ar-EG')} جهاز</b>
          </div>
        </article>

        <article class="dash-notif-kpi-card blue-kpi">
          <div class="kpi-icon-wrap">
            {icon('fa-shield-halved')}
          </div>
          <div class="kpi-info">
            <span class="kpi-label">حالة خدمة FCM Push</span>
            <b class="kpi-val" style={`color:${pushConfigured ? 'var(--emerald-600)' : '#f59e0b'}`}>
              {pushConfigured ? 'مفعّل وجاهز ✅' : 'يحتاج ضبط ⚠️'}
            </b>
          </div>
        </article>
      </div>

      {/* نافذة الإرسال المنبثقة (Custom Broadcast & Notification Modal) */}
      <div id="sendNotificationModal" class="dash-notif-modal" aria-hidden="true" style="display:none">
        <div class="dash-notif-modal-backdrop" id="dashModalBackdrop"></div>
        <div class="dash-notif-modal-dialog">
          <div class="dash-notif-modal-header">
            <div class="modal-title-box">
              <span class="modal-header-icon">{icon('fa-bullhorn')}</span>
              <div>
                <h3>إنشاء وبث إشعار جديد</h3>
                <p>صياغة وتوجيه إشعار مخصص لفئة معينة أو لكافة مستخدمي المنصة</p>
              </div>
            </div>
            <button type="button" class="dash-notif-modal-close" id="dashCloseSendModalBtn">
              {icon('fa-xmark')}
            </button>
          </div>

          <form id="sendCustomNotificationForm" action="/api/notifications/send-custom" method="post" class="dash-notif-modal-form">
            <div class="modal-body-layout">
              {/* القسم الأيمن: حقول النموذج */}
              <div class="modal-form-fields">
                {/* القوالب السريعة */}
                <div class="form-group-notif">
                  <label for="notifPresetSelect">
                    {icon('fa-wand-magic-sparkles')} اختر قالباً جاهزاً (اختياري):
                  </label>
                  <select id="notifPresetSelect" class="form-select-notif">
                    <option value="">-- صياغة إشعار مخصص --</option>
                    <option value="urgent_campaign">تذكير بحملة خيرية عاجلة 🚨</option>
                    <option value="volunteer_thanks">شكر وتقدير لفريق المتطوعين 🤝</option>
                    <option value="new_event">إعلان فعالية ميدانية جديدة 📅</option>
                    <option value="management_update">تحديث وتصريح من مجلس الإدارة 📢</option>
                    <option value="donation_drive">نداء مساهمة في مشاريع الإطعام والكساء 🍲</option>
                  </select>
                </div>

                {/* الفئة المستهدفة */}
                <div class="form-group-notif">
                  <label for="notifAudienceSelect">
                    {icon('fa-users')} الفئة المستهدفة (الجمهور):
                  </label>
                  <select id="notifAudienceSelect" name="audience" class="form-select-notif">
                    <option value="all">👥 جميع المستخدمين والزوار المشتركين (بث عام)</option>
                    <option value="volunteers">🤝 فريق المتطوعين المعتمدين فقط</option>
                    <option value="donors">💚 المتبرعون والداعمون المسجلون</option>
                    <option value="admins">👑 المشرفون وفريق الإدارة فقط</option>
                    <option value="single">👤 مستخدم محدد (بالبريد أو المعرف)</option>
                  </select>
                </div>

                {/* حقل تحديد المستخدم الفردي */}
                <div id="targetUserWrap" class="form-group-notif" style="display:none">
                  <label for="targetUserInput">
                    {icon('fa-user')} البريد الإلكتروني أو معرّف المستخدم (UID):
                  </label>
                  <input
                    type="text"
                    id="targetUserInput"
                    name="target_user"
                    placeholder="مثال: user@example.com أو المعرف"
                    class="form-input-notif"
                  />
                </div>

                {/* عنوان الإشعار */}
                <div class="form-group-notif">
                  <label for="notifCustomTitle">
                    {icon('fa-heading')} عنوان الإشعار <span style="color:#f43f5e">*</span>:
                  </label>
                  <input
                    type="text"
                    id="notifCustomTitle"
                    name="title"
                    required
                    placeholder="مثال: إطلاق قافلة الخير في قرى الصعيد..."
                    class="form-input-notif"
                    maxlength={150}
                  />
                </div>

                {/* نص الرسالة */}
                <div class="form-group-notif">
                  <label for="notifCustomBody">
                    {icon('fa-align-right')} نص الإشعار وتفاصيل الرسالة:
                  </label>
                  <textarea
                    id="notifCustomBody"
                    name="body"
                    rows={3}
                    placeholder="اكتب نص الإشعار الموجز والمباشر هنا..."
                    class="form-textarea-notif"
                    maxlength={400}
                  ></textarea>
                </div>

                {/* خيارات التصنيف والأولوية والرابط في صف واحد */}
                <div class="form-row-notif">
                  <div class="form-group-notif flex-1">
                    <label for="notifCustomCategory">
                      {icon('fa-tag')} التصنيف:
                    </label>
                    <select id="notifCustomCategory" name="category" class="form-select-notif">
                      <option value="content">محتوى وأخبار</option>
                      <option value="financial">تبرعات ومالية</option>
                      <option value="volunteers">شؤون المتطوعين</option>
                      <option value="account">الحسابات والأعضاء</option>
                      <option value="system">تنبيهات النظام</option>
                    </select>
                  </div>

                  <div class="form-group-notif flex-1">
                    <label for="notifCustomPriority">
                      {icon('fa-flag')} الأولوية:
                    </label>
                    <select id="notifCustomPriority" name="priority" class="form-select-notif">
                      <option value="normal">عادي (Normal)</option>
                      <option value="high">عاجل وهام (High)</option>
                    </select>
                  </div>
                </div>

                {/* رابط التحويل عند النقر */}
                <div class="form-group-notif">
                  <label for="notifCustomLink">
                    {icon('fa-link')} رابط التحويل عند النقر (مسار الموقع أو رابط خارجي):
                  </label>
                  <input
                    type="text"
                    id="notifCustomLink"
                    name="link"
                    placeholder="مثال: /campaigns أو /events أو /volunteer"
                    value="/notifications"
                    class="form-input-notif"
                  />
                </div>

                {/* قنوات الإرسال المحددة */}
                <div class="form-group-notif channels-group">
                  <label>{icon('fa-satellite-dish')} قنوات الإرسال والتوصيل:</label>
                  <div class="channels-checkboxes">
                    <label class="channel-check-label">
                      <input type="checkbox" name="send_in_app" value="1" checked />
                      <span>{icon('fa-bell')} مركز إشعارات الموقع</span>
                    </label>
                    <label class="channel-check-label">
                      <input type="checkbox" name="send_push" value="1" checked />
                      <span>{icon('fa-mobile-screen-button')} إشعار الشاشة الفوري (Web Push)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* القسم الأيسر: المعاينة الحية (Live Real-time Preview) */}
              <div class="modal-preview-panel">
                <h4>{icon('fa-eye')} معاينة حية للإشعار:</h4>
                <div class="phone-preview-frame">
                  <div class="phone-preview-header">
                    <span class="phone-time">الآن</span>
                    <span class="phone-brand">مؤسسة د. عمر هشام الخيرية</span>
                  </div>
                  <div class="phone-notification-card" id="previewPhoneCard">
                    <div class="phone-notif-icon">
                      <i class="fa-solid fa-bullhorn" id="previewIcon"></i>
                    </div>
                    <div class="phone-notif-text">
                      <div class="phone-notif-top">
                        <strong id="previewTitle">عنوان الإشعار يظهر هنا</strong>
                        <span class="phone-notif-badge" id="previewPriorityBadge">عاجل</span>
                      </div>
                      <p id="previewBody">تفاصيل ونص الرسالة ستظهر هنا مباشرة للمستخدم في شاشة القفل وإشعارات النظام.</p>
                      <small class="phone-notif-link" id="previewLink">اضغط لفتح: /notifications</small>
                    </div>
                  </div>
                </div>

                <div class="preview-bell-box">
                  <small style="color:var(--muted); font-weight:700; display:block; margin-bottom:6px">
                    معاينة داخل جرس الموقع:
                  </small>
                  <div class="bell-item-preview">
                    <div class="bell-item-preview-icon">
                      <i class="fa-solid fa-bullhorn"></i>
                    </div>
                    <div>
                      <strong id="previewBellTitle" style="display:block; font-size:.85rem; color:var(--text)">عنوان الإشعار</strong>
                      <small id="previewBellBody" style="color:var(--muted); font-size:.75rem">تفاصيل الإشعار في القائمة...</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="dash-notif-modal-footer">
              <button type="button" class="cancel-modal-btn" id="dashCancelSendModalBtn">
                إلغاء
              </button>
              <button type="submit" class="submit-broadcast-btn" id="submitBroadcastBtn">
                {icon('fa-paper-plane')} إرسال الإشعار الآن
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* قسم جدول الإشعارات مع الفلاتر والبحث */}
      <div class="dash-notif-table-card">
        <div class="dash-notif-table-header">
          <div class="table-header-title">
            <h3>{icon('fa-list-ul')} سجل الإشعارات والتنبيهات الموجهة</h3>
            <span class="records-count">{total.toLocaleString('ar-EG')} سجل</span>
          </div>

          <div class="table-header-filters">
            {/* شريط البحث المباشر */}
            <div class="notif-search-box">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                id="notifDashSearchInput"
                placeholder="ابحث في العنوان، النص، المشرف..."
              />
            </div>

            {/* فلاتر التبويبات السريعة */}
            <div class="dash-notif-tabs" id="dashNotifTabs">
              <button type="button" class="dash-tab-btn active" data-filter="all">الكل</button>
              <button type="button" class="dash-tab-btn" data-filter="unread">غير المقروءة</button>
              <button type="button" class="dash-tab-btn" data-filter="financial">المالية</button>
              <button type="button" class="dash-tab-btn" data-filter="volunteers">التطوع</button>
              <button type="button" class="dash-tab-btn" data-filter="content">المحتوى</button>
              <button type="button" class="dash-tab-btn" data-filter="system">النظام</button>
            </div>
          </div>
        </div>

        <div class="dash-table-responsive">
          <table class="dash-custom-table" id="dashNotificationsTable">
            <thead>
              <tr>
                <th style="width: 140px">النوع والتصنيف</th>
                <th>العنوان والبيان</th>
                <th style="width: 100px">الأولوية</th>
                <th style="width: 130px">المرسل / المشرف</th>
                <th style="width: 120px">التاريخ</th>
                <th style="width: 90px">الحالة</th>
                <th style="width: 130px; text-align:center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((n: any) => {
                const isRead = Boolean(n.is_read)
                const def = NOTIFICATION_TYPES[n.type] || { label: n.type, icon: 'fa-bell', category: 'system' }
                const catKey = (n.category || def.category || 'system')
                const catLabel = CATEGORY_LABELS[catKey as NotificationCategory] || catKey

                return (
                  <tr
                    class={`notif-row ${!isRead ? 'is-unread-row' : ''}`}
                    data-category={catKey}
                    data-read={isRead ? 'read' : 'unread'}
                    data-search={`${n.title} ${n.body || ''} ${n.actor_name || ''} ${catLabel}`.toLowerCase()}
                  >
                    <td>
                      <div class="notif-type-tag">
                        <span class="notif-type-icon-box">
                          <i class={`fa-solid ${n.icon || def.icon}`}></i>
                        </span>
                        <div class="notif-type-text">
                          <strong>{def.label || n.type}</strong>
                          <small>{catLabel}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div class="notif-content-cell">
                        <span class="notif-row-title">{n.title}</span>
                        {n.body && <p class="notif-row-body">{n.body}</p>}
                        {n.meta?.broadcast && (
                          <span class="broadcast-tag">
                            {icon('fa-bullhorn')} بث عام: {n.meta.audience === 'admins' ? 'المشرفين' : n.meta.audience === 'volunteers' ? 'المتطوعين' : 'الجميع'}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span class={`prio-pill prio-${n.priority || 'normal'}`}>
                        {n.priority === 'high' ? 'عاجل ✦' : 'عادي'}
                      </span>
                    </td>

                    <td>
                      <div class="actor-cell">
                        <i class="fa-solid fa-user-shield"></i>
                        <span>{n.actor_name || 'النظام التلقائي'}</span>
                      </div>
                    </td>

                    <td>
                      <time class="notif-time-cell" datetime={n.created_at}>
                        {timeAgo(n.created_at)}
                      </time>
                    </td>

                    <td>
                      <span class={`status-pill ${isRead ? 'status-read' : 'status-unread'}`}>
                        {isRead ? 'مقروء' : 'جديد'}
                      </span>
                    </td>

                    <td>
                      <div class="notif-row-actions">
                        {n.link && (
                          <a
                            href={n.link}
                            class="row-action-btn view-btn"
                            title="فتح الرابط المستهدف"
                            target="_blank"
                          >
                            {icon('fa-arrow-up-right-from-square')}
                          </a>
                        )}
                        {!isRead && (
                          <button
                            type="button"
                            class="row-action-btn read-btn dash-single-read-btn"
                            data-id={n.id}
                            title="تحديد كمقروء"
                          >
                            {icon('fa-check')}
                          </button>
                        )}
                        <button
                          type="button"
                          class="row-action-btn delete-btn dash-single-delete-btn"
                          data-id={n.id}
                          title="حذف هذا الإشعار"
                        >
                          {icon('fa-trash-can')}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {list.length === 0 && (
                <tr id="noNotifsRow">
                  <td colSpan={7} class="table-empty-td">
                    <div class="table-empty-wrap">
                      <i class="fa-solid fa-bell-slash"></i>
                      <h4>سجل الإشعارات فارغ حالياً</h4>
                      <p>لم يتم تسجيل أو إرسال أي إشعارات حتى الآن.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/** 4. قسم تفضيلات الإشعارات والساعات الهادئة (يُدمج في الملف الشخصي وإعدادات الحساب) */
export function NotificationPrefsSection({ user, pushAvailable = false }: { user: UserSession; pushAvailable?: boolean }) {
  const categories = Object.entries(CATEGORY_LABELS) as [NotificationCategory, string][]

  return (
    <div class="profile-card-modern notif-prefs-card">
      <div class="profile-card-head">
        <div class="profile-card-title-wrap">
          <span class="profile-card-icon" style="background:rgba(59,130,246,.12); color:#3b82f6">
            {icon('fa-sliders')}
          </span>
          <div>
            <h3>تفضيلات وقنوات الإشعارات</h3>
            <p>تحكم كامل في كيفية ومواعيد وصول التنبيهات لجهازك وبريدك</p>
          </div>
        </div>
      </div>

      <form id="notifPrefsForm" action="/api/notifications/prefs" method="post" class="notif-prefs-form">
        
        {/* قنوات التوصيل */}
        <div class="notif-prefs-group">
          <h4 class="notif-prefs-group-title">
            <i class="fa-solid fa-tower-broadcast"></i> قنوات الاستقبال
          </h4>
          
          <div class="notif-toggle-row">
            <div class="notif-toggle-info">
              <strong>إشعارات المتصفح والشاشة (Web Push)</strong>
              <p>استقبال تنبيهات فورية على شاشة الموبايل أو الكمبيوتر حتى لو كان الموقع مغلقًا.</p>
            </div>
            <label class="switch-toggle">
              <input type="checkbox" name="push_enabled" id="pref_push_enabled" checked />
              <span class="slider-round"></span>
            </label>
          </div>

          <div class="notif-toggle-row">
            <div class="notif-toggle-info">
              <strong>رسائل البريد الإلكتروني (Email Alerts)</strong>
              <p>استلام إيصالات التبرعات الرسمية وقرارات التطوع وتقارير الحساب عبر البريد.</p>
            </div>
            <label class="switch-toggle">
              <input type="checkbox" name="email_enabled" id="pref_email_enabled" checked />
              <span class="slider-round"></span>
            </label>
          </div>
        </div>

        {/* تصنيفات الإشعارات المسموحة */}
        <div class="notif-prefs-group">
          <h4 class="notif-prefs-group-title">
            <i class="fa-solid fa-list-check"></i> التصنيفات المسموحة
          </h4>
          <div class="notif-categories-grid">
            {categories.map(([key, label]) => {
              const isEssential = key === 'account' || key === 'system'
              return (
                <div class="notif-category-toggle-item">
                  <label class="checkbox-container">
                    <input
                      type="checkbox"
                      name={`cat_${key}`}
                      id={`pref_cat_${key}`}
                      checked
                      disabled={isEssential}
                    />
                    <span class="checkmark"></span>
                    <span class="checkbox-label-text">
                      <b>{label}</b>
                      {isEssential && <small class="essential-badge">أساسي</small>}
                    </span>
                  </label>
                </div>
              )
            })}
          </div>
        </div>

        {/* الساعات الهادئة (Quiet Hours) */}
        <div class="notif-prefs-group">
          <h4 class="notif-prefs-group-title">
            <i class="fa-solid fa-moon"></i> الساعات الهادئة (Quiet Hours)
          </h4>
          <p class="notif-prefs-group-desc">
            تأجيل إشعارات الشاشة العادية خلال فترة راحتك (بتوقيت القاهرة)، مع استمرار استقبال الإشعارات الحرجة فقط.
          </p>

          <div class="notif-toggle-row" style="border-bottom:none; padding-bottom:0">
            <div class="notif-toggle-info">
              <strong>تفعيل وضع الساعات الهادئة</strong>
            </div>
            <label class="switch-toggle">
              <input type="checkbox" name="quiet_enabled" id="pref_quiet_enabled" />
              <span class="slider-round"></span>
            </label>
          </div>

          <div class="notif-quiet-hours-inputs" id="quietHoursInputs" style="display:flex; gap:1rem; margin-top:1rem; flex-wrap:wrap">
            <label style="flex:1; min-width:140px">
              <span style="font-size:.82rem; font-weight:700; color:var(--muted)">من الساعة:</span>
              <input type="time" name="quiet_from" id="pref_quiet_from" value="23:00" style="padding:10px; border-radius:10px; border:1px solid var(--border); width:100%" />
            </label>
            <label style="flex:1; min-width:140px">
              <span style="font-size:.82rem; font-weight:700; color:var(--muted)">إلى الساعة:</span>
              <input type="time" name="quiet_to" id="pref_quiet_to" value="07:00" style="padding:10px; border-radius:10px; border:1px solid var(--border); width:100%" />
            </label>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; margin-top:1.5rem">
          <button type="submit" class="primary-btn" style="padding:10px 24px">
            {icon('fa-floppy-disk')} حفظ التفضيلات
          </button>
        </div>
      </form>
    </div>
  )
}
