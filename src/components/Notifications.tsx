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

/** 1. جرس الإشعارات مع القائمة المنسدلة (يُستخدم في الهيدر والداشبورد) */
export function NotificationBell({ user, isDashboard = false }: { user?: UserSession; isDashboard?: boolean }) {
  return (
    <div class="notif-bell-container" id={isDashboard ? 'dashNotifBellContainer' : 'notifBellContainer'}>
      <button
        type="button"
        class={`notif-bell-btn ${isDashboard ? 'dash-bell-btn' : 'header-bell-btn'}`}
        id={isDashboard ? 'dashNotifBellBtn' : 'notifBellBtn'}
        aria-label="مركز الإشعارات"
        aria-expanded="false"
        aria-haspopup="true"
      >
        <i class="fa-solid fa-bell notif-bell-icon" aria-hidden="true"></i>
        <span class="notif-badge" id={isDashboard ? 'dashNotifBadge' : 'notifBadge'} style="display:none" aria-label="إشعارات غير مقروءة">0</span>
      </button>

      <div class="notif-dropdown" id={isDashboard ? 'dashNotifDropdown' : 'notifDropdown'} aria-hidden="true" role="region" aria-label="قائمة الإشعارات">
        <div class="notif-dropdown-header">
          <div class="notif-header-title">
            <i class="fa-solid fa-bell"></i>
            <span>الإشعارات</span>
            <span class="notif-header-unread-count" id={isDashboard ? 'dashNotifHeaderUnreadCount' : 'notifHeaderUnreadCount'}>0 جديدة</span>
          </div>
          <div class="notif-header-actions">
            {user && (
              <button type="button" class="notif-mark-all-btn" id={isDashboard ? 'dashDropdownMarkAllBtn' : 'notifMarkAllBtn'} title="تحديد الكل كمقروء">
                <i class="fa-solid fa-check-double"></i>
                <span>قراءة الكل</span>
              </button>
            )}
            <a href="/notifications" class="notif-settings-link" title="عرض كل الإشعارات">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
            <button type="button" class="notif-close-mobile-btn" aria-label="إغلاق الإشعارات">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Push opt-in banner on mobile/desktop */}
        <div class="notif-push-optin-box" id="notifPushOptinBox" style="display:none">
          <div class="notif-push-optin-content">
            <i class="fa-solid fa-tower-broadcast"></i>
            <div>
              <strong>تفعيل إشعارات المتصفح</strong>
              <small>لتصلك تنبيهات الحالات العاجلة وأخبار التبرعات فوراً</small>
            </div>
          </div>
          <button type="button" class="notif-push-optin-action-btn" id="notifDropdownEnablePushBtn">
            <span>تفعيل</span>
            <i class="fa-solid fa-bell"></i>
          </button>
        </div>

        <div class="notif-dropdown-tabs">
          <button type="button" class="notif-tab active" data-tab="all">الكل</button>
          <button type="button" class="notif-tab" data-tab="unread">غير المقروءة</button>
        </div>

        <div class="notif-dropdown-list" id={isDashboard ? 'dashNotifDropdownList' : 'notifDropdownList'}>
          <div class="notif-loading-state" id={isDashboard ? 'dashNotifLoadingState' : 'notifLoadingState'}>
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            <span>جارٍ تحميل الإشعارات...</span>
          </div>
          <div class="notif-empty-state" id={isDashboard ? 'dashNotifEmptyState' : 'notifEmptyState'} style="display:none">
            <div class="notif-empty-icon"><i class="fa-solid fa-bell-slash"></i></div>
            <p>لا توجد إشعارات جديدة</p>
            <small>ستظهر التحديثات والإشعارات المهمة هنا فور وصولها.</small>
          </div>
          <div class="notif-items-wrapper" id={isDashboard ? 'dashNotifItemsWrapper' : 'notifItemsWrapper'}></div>
        </div>

        <div class="notif-dropdown-footer">
          <a href="/notifications" class="notif-view-all-link">
            <span>عرض كافة الإشعارات في صفحة مستقلة</span>
            <i class="fa-solid fa-arrow-left"></i>
          </a>
        </div>
      </div>
    </div>
  )
}

/** 2. الصفحة المستقلة الكاملة للإشعارات (/notifications) */
export function NotificationsPage({
  user,
  items = [],
  unreadCount = 0,
  pushAvailable = false,
  selectedCategory = ''
}: {
  user?: UserSession
  items: any[]
  unreadCount: number
  pushAvailable: boolean
  selectedCategory?: string
}) {
  const categories = Object.entries(CATEGORY_LABELS) as [NotificationCategory, string][]

  return (
    <Layout user={user} title="مركز الإشعارات | مؤسسة الدكتور عمر هشام">
      <PageHero
        kicker="مركز التنبيهات"
        title={'إشعاراتك وتحديثاتك<br/><em>كن دائمًا في قلب الأثر.</em>'}
        text="متابعة فورية لجميع التبرعات، المستجدات، حالة طلبات التطوع، وتحديثات حسابك في مكان واحد."
      />

      <section class="section-pad notif-page-section" style="padding-top: 0">
        <div class="notif-page-container">
          
          {/* شريط الإحصائيات والإجراءات العلوية */}
          <div class="notif-page-hero-bar reveal">
            <div class="notif-page-stats">
              <div class="notif-stat-pill">
                <i class="fa-solid fa-bell"></i>
                <span>إجمالي الإشعارات: <b>{items.length.toLocaleString('ar-EG')}</b></span>
              </div>
              <div class="notif-stat-pill unread-pill">
                <i class="fa-solid fa-circle-dot"></i>
                <span>غير المقروءة: <b id="notifPageUnreadTotal">{unreadCount.toLocaleString('ar-EG')}</b></span>
              </div>
            </div>

            <div class="notif-page-quick-actions">
              <button type="button" class="notif-page-btn mark-all-page-btn" id="notifPageMarkAll">
                <i class="fa-solid fa-check-double"></i>
                <span>تحديد الكل كمقروء</span>
              </button>
              <button type="button" class="notif-page-btn push-enable-btn" id="notifEnablePushBtn">
                <i class="fa-solid fa-mobile-screen-button"></i>
                <span>تفعيل التنبيهات على هذا الجهاز</span>
              </button>
            </div>
          </div>

          {/* فلاتر التصنيفات */}
          <div class="notif-category-filters reveal">
            <a
              href="/notifications"
              class={`notif-filter-chip ${!selectedCategory ? 'active' : ''}`}
            >
              <i class="fa-solid fa-layer-group"></i>
              <span>كافة التصنيفات</span>
            </a>
            {categories.map(([key, label]) => {
              const defIcon = NOTIFICATION_TYPES[`${key}_new`]?.icon || 'fa-tag'
              return (
                <a
                  href={`/notifications?category=${key}`}
                  class={`notif-filter-chip ${selectedCategory === key ? 'active' : ''}`}
                >
                  <i class={`fa-solid ${defIcon}`}></i>
                  <span>{label}</span>
                </a>
              )
            })}
          </div>

          {/* قائمة الإشعارات الرئيسية */}
          <div class="notif-page-list-card reveal">
            {items.length === 0 ? (
              <div class="notif-page-empty">
                <div class="notif-page-empty-icon">
                  <i class="fa-solid fa-envelope-open-text"></i>
                </div>
                <h3>صندوق الإشعارات فارغ</h3>
                <p>لا توجد أي إشعارات مسجلة لك في هذا القسم حاليًا.</p>
                <a href="/" class="primary-btn" style="margin-top: 1rem">
                  العودة للرئيسية <i class="fa-solid fa-house"></i>
                </a>
              </div>
            ) : (
              <div class="notif-feed-list">
                {items.map((item) => {
                  const isRead = Boolean(item.is_read)
                  const link = item.link || '#'
                  const iconName = item.icon || 'fa-bell'
                  const catLabel = CATEGORY_LABELS[item.category as NotificationCategory] || 'عام'

                  return (
                    <article
                      class={`notif-feed-item ${isRead ? 'is-read' : 'is-unread'} priority-${item.priority || 'normal'}`}
                      data-id={item.id}
                      data-link={item.link || ''}
                    >
                      <div class="notif-feed-icon-wrap">
                        <i class={`fa-solid ${iconName}`}></i>
                        {!isRead && <span class="notif-item-unread-dot" title="إشعار غير مقروء"></span>}
                      </div>

                      <div class="notif-feed-content">
                        <div class="notif-feed-top">
                          <span class="notif-feed-cat-badge">{catLabel}</span>
                          {item.priority === 'high' && <span class="notif-feed-prio-badge">هام</span>}
                          <time class="notif-feed-time" datetime={item.created_at}>
                            {timeAgo(item.created_at)}
                          </time>
                        </div>

                        <h4 class="notif-feed-title">
                          <a href={link} class="notif-feed-link">
                            {item.title}
                          </a>
                        </h4>

                        {item.body && <p class="notif-feed-body">{item.body}</p>}

                        {item.actor_name && (
                          <div class="notif-feed-actor">
                            <i class="fa-solid fa-user-shield"></i>
                            <span>بواسطة: {item.actor_name}</span>
                          </div>
                        )}
                      </div>

                      <div class="notif-feed-actions">
                        {!isRead && (
                          <button
                            type="button"
                            class="notif-single-read-btn"
                            data-id={item.id}
                            title="تحديد كمقروء"
                          >
                            <i class="fa-solid fa-check"></i>
                          </button>
                        )}
                        {item.link && (
                          <a href={item.link} class="notif-feed-arrow-link" title="انتقال">
                            <i class="fa-solid fa-arrow-left"></i>
                          </a>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>

          {/* قسم التفضيلات أو دعوة تسجيل الدخول للزوار */}
          <div class="notif-page-prefs-wrapper reveal" style="margin-top: 2rem">
            {user ? (
              <NotificationPrefsSection user={user} pushAvailable={pushAvailable} />
            ) : (
              <div class="profile-card-modern notif-guest-callout">
                <div class="notif-guest-callout-icon">
                  <i class="fa-solid fa-bell-concierge"></i>
                </div>
                <div class="notif-guest-callout-text">
                  <h3>سجّل دخولك لمتابعة إشعاراتك الشخصية</h3>
                  <p>تصلك إشعارات وتحديثات فورية عن تبرعاتك، تقارير الحالات التي ساهمت بها، وحالة طلبات التطوع عند تسجيل الدخول.</p>
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
