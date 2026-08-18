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
  if (!user) return null

  return (
    <div class="notif-bell-container" id="notifBellContainer">
      <button
        type="button"
        class={`notif-bell-btn ${isDashboard ? 'dash-bell-btn' : 'header-bell-btn'}`}
        id="notifBellBtn"
        aria-label="مركز الإشعارات"
        aria-expanded="false"
        aria-haspopup="true"
      >
        <i class="fa-solid fa-bell notif-bell-icon" aria-hidden="true"></i>
        <span class="notif-badge" id="notifBadge" style="display:none" aria-label="إشعارات غير مقروءة">0</span>
      </button>

      <div class="notif-dropdown" id="notifDropdown" aria-hidden="true" role="region" aria-label="قائمة الإشعارات">
        <div class="notif-dropdown-header">
          <div class="notif-header-title">
            <i class="fa-solid fa-bell"></i>
            <span>الإشعارات</span>
            <span class="notif-header-unread-count" id="notifHeaderUnreadCount">0 جديدة</span>
          </div>
          <div class="notif-header-actions">
            <button type="button" class="notif-mark-all-btn" id="notifMarkAllBtn" title="تحديد الكل كمقروء">
              <i class="fa-solid fa-check-double"></i>
              <span>قراءة الكل</span>
            </button>
            <a href="/notifications" class="notif-settings-link" title="عرض كل الإشعارات">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        </div>

        <div class="notif-dropdown-tabs">
          <button type="button" class="notif-tab active" data-tab="all">الكل</button>
          <button type="button" class="notif-tab" data-tab="unread">غير المقروءة</button>
        </div>

        <div class="notif-dropdown-list" id="notifDropdownList">
          <div class="notif-loading-state" id="notifLoadingState">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            <span>جارٍ تحميل الإشعارات...</span>
          </div>
          <div class="notif-empty-state" id="notifEmptyState" style="display:none">
            <div class="notif-empty-icon"><i class="fa-solid fa-bell-slash"></i></div>
            <p>لا توجد إشعارات جديدة</p>
            <small>ستظهر التحديثات والإشعارات المهمة هنا فور وصولها.</small>
          </div>
          <div class="notif-items-wrapper" id="notifItemsWrapper"></div>
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
  user: UserSession
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

          {/* قسم التفضيلات السريعة في أسفل الصفحة */}
          <div class="notif-page-prefs-wrapper reveal" style="margin-top: 2rem">
            <NotificationPrefsSection user={user} pushAvailable={pushAvailable} />
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

  return (
    <>
      <div class="dash-section-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem">
        <div>
          <h2 style="font-size:1.6rem; font-weight:900; color:var(--text); display:flex; align-items:center; gap:10px">
            {icon('fa-bell')} مركز إدارة الإشعارات والتنبيهات
          </h2>
          <p style="color:var(--muted); font-size:.86rem; margin-top:4px">
            مراقبة التدفق الإداري، تشخيص الإرسال الفوري (Web Push)، واختبار إشعارات النظام.
          </p>
        </div>

        <div style="display:flex; gap:.8rem; flex-wrap:wrap">
          <button
            type="button"
            id="dashSendTestNotifBtn"
            class="primary-btn"
            style="background:var(--emerald-600); font-size:.85rem; padding:8px 16px"
          >
            {icon('fa-flask')} إرسال إشعار تجريبي
          </button>
          <button
            type="button"
            id="dashMarkAllNotifRead"
            class="primary-btn"
            style="background:var(--surface-2); color:var(--text); border:1px solid var(--border); font-size:.85rem; padding:8px 16px"
          >
            {icon('fa-check-double')} قراءة كل الإشعارات
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin-bottom: 1.5rem">
        <article style="background:var(--paper); border:1px solid var(--line); border-radius:18px; padding:1.2rem">
          <div style="display:flex; align-items:center; justify-content:space-between">
            <span style="font-size:1.4rem; color:var(--gold-600)">{icon('fa-bell')}</span>
            <small style="color:var(--muted); font-size:.78rem; font-weight:700">إجمالي الإشعارات المسجلة</small>
          </div>
          <b style="font-size:1.6rem; margin-top:.8rem; display:block; color:var(--gold-600)">{total.toLocaleString('ar-EG')}</b>
        </article>

        <article style="background:var(--paper); border:1px solid var(--line); border-radius:18px; padding:1.2rem">
          <div style="display:flex; align-items:center; justify-content:space-between">
            <span style="font-size:1.4rem; color:#f43f5e">{icon('fa-circle-dot')}</span>
            <small style="color:var(--muted); font-size:.78rem; font-weight:700">غير المقروءة</small>
          </div>
          <b style="font-size:1.6rem; margin-top:.8rem; display:block; color:#f43f5e">{unread.toLocaleString('ar-EG')}</b>
        </article>

        <article style="background:var(--paper); border:1px solid var(--line); border-radius:18px; padding:1.2rem">
          <div style="display:flex; align-items:center; justify-content:space-between">
            <span style="font-size:1.4rem; color:var(--emerald-600)">{icon('fa-mobile-screen')}</span>
            <small style="color:var(--muted); font-size:.78rem; font-weight:700">حالة Web Push (FCM)</small>
          </div>
          <b style={`font-size:1.1rem; margin-top:.8rem; display:block; color:${pushConfigured ? 'var(--emerald-600)' : '#f59e0b'}`}>
            {pushConfigured ? 'مفعّل وجاهز ✅' : 'يحتاج مفتاح VAPID ⚠️'}
          </b>
        </article>
      </div>

      {/* تنبيه حالة Push إذا كانت غير مهيأة */}
      {!pushConfigured && (
        <div style="background:rgba(245,158,11,.1); border:1px solid rgba(245,158,11,.3); padding:1rem 1.4rem; border-radius:14px; margin-bottom:1.5rem; display:flex; align-items:center; gap:12px">
          <i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b; font-size:1.4rem"></i>
          <div style="font-size:.88rem; color:var(--text)">
            <b>إشعارات Push غير مهيأة بعد:</b> المركز الداخلي والبريد يعملان بالكامل. لتفعيل إشعارات شاشة الجوال/الديسكتوب، يرجى إضافة <code>FIREBASE_VAPID_KEY</code> في متغيرات البيئة من Firebase Console.
          </div>
        </div>
      )}

      {/* جدول الإشعارات الإدارية */}
      <section class="dash-table">
        <header style="display:flex; justify-content:space-between; align-items:center">
          <h3>سجل الإشعارات والتنبيهات الواردة</h3>
        </header>
        <table>
          <thead>
            <tr>
              <th>النوع</th>
              <th>العنوان والبيان</th>
              <th>التصنيف</th>
              <th>الأولوية</th>
              <th>المرسل/المشرف</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {list.map((n: any) => {
              const isRead = Boolean(n.is_read)
              const def = NOTIFICATION_TYPES[n.type] || { label: n.type, icon: 'fa-bell', category: 'system' }
              return (
                <tr style={!isRead ? 'background:rgba(214,166,75,0.06)' : ''}>
                  <td>
                    <span style="display:inline-flex; align-items:center; gap:6px; font-weight:700">
                      <i class={`fa-solid ${n.icon || def.icon}`} style="color:var(--gold-600)"></i>
                      <span>{def.label || n.type}</span>
                    </span>
                  </td>
                  <td>
                    <div style="font-weight:700; color:var(--text)">{n.title}</div>
                    {n.body && <small style="color:var(--muted); display:block; max-width:280px; white-space:pre-wrap">{n.body}</small>}
                  </td>
                  <td>
                    <span style="background:var(--surface-2); padding:3px 8px; border-radius:6px; font-size:.78rem; font-weight:700">
                      {CATEGORY_LABELS[n.category as NotificationCategory] || n.category}
                    </span>
                  </td>
                  <td>
                    <span style={`padding:2px 8px; border-radius:4px; font-size:.75rem; font-weight:800; ${n.priority === 'high' ? 'background:rgba(244,63,94,.15); color:#f43f5e' : 'background:rgba(16,185,129,.1); color:var(--emerald-600)'}`}>
                      {n.priority === 'high' ? 'عالي' : 'عادي'}
                    </span>
                  </td>
                  <td>{n.actor_name || 'النظام'}</td>
                  <td><small>{timeAgo(n.created_at)}</small></td>
                  <td>
                    <span style={`padding:2px 8px; border-radius:4px; font-size:.75rem; font-weight:700; ${isRead ? 'color:var(--muted)' : 'color:var(--gold-600); background:rgba(214,166,75,.15)'}`}>
                      {isRead ? 'مقروء' : 'جديد ✦'}
                    </span>
                  </td>
                  <td>
                    <div style="display:flex; gap:6px">
                      {n.link && (
                        <a href={n.link} class="dash-edit-btn" style="text-decoration:none">
                          {icon('fa-arrow-up-right-from-square')} فتح
                        </a>
                      )}
                      {!isRead && (
                        <button
                          type="button"
                          class="dash-single-read-btn"
                          data-id={n.id}
                          style="background:none; border:1px solid var(--border); border-radius:6px; padding:4px 8px; cursor:pointer; font-size:.78rem"
                          title="تحديد كمقروء"
                        >
                          {icon('fa-check')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={8} style="text-align:center; color:var(--muted); padding:2.5rem 0">
                  لا توجد أي إشعارات في السجل حتى الآن
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
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
