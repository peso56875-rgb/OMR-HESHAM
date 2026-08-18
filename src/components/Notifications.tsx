/**
 * مركز الإشعارات — Notification centre UI
 *
 * ثلاثة مكوّنات:
 *  1. NotificationBell  — الجرس + اللوحة المنسدلة (تُركَّب في الهيدر واللوحة)
 *  2. DashNotifications — الصفحة الكاملة داخل لوحة التحكم
 *  3. NotificationPrefsCard — بطاقة التفضيلات في صفحة الحساب
 *
 * قرار معماري: كل المحتوى الديناميكي يُحمَّل من /api/notifications عبر
 * public/static/notifications.js، والسيرفر يرسل الهيكل الفارغ فقط.
 *
 * السبب: نفس الجرس يظهر على كل صفحة في الموقع. لو كان السيرفر يجلب
 * الإشعارات مع كل طلب صفحة، لأضفنا استعلامَي Firestore إلى **كل** زيارة
 * لأي صفحة — بما فيها الصفحات العامة التي يزورها من لا يملك إشعارات أصلًا.
 * التحميل من العميل يعني استعلامًا واحدًا عند فتح اللوحة فعليًا.
 */
import { icon } from './shared'
import { CATEGORY_LABELS } from '../lib/notifications'

/**
 * الجرس + اللوحة المنسدلة.
 *
 * data-notif-bell هو ما يبحث عنه notifications.js للتركيب، فلا يجوز حذفه.
 * aria-live على العدّاد يجعل قارئ الشاشة ينطق وصول إشعار جديد بدون
 * أن يسحب التركيز من المستخدم.
 */
export function NotificationBell() {
  return <div class="notif-wrap" data-notif-bell>
    <button
      type="button"
      class="notif-bell"
      id="notif-bell-btn"
      aria-label="الإشعارات"
      aria-expanded="false"
      aria-haspopup="true"
    >
      {icon('fa-bell')}
      {/* العدّاد مخفي افتراضيًا (hidden) ويُظهره السكربت عند وجود غير مقروء.
          لو بدأ ظاهرًا بصفر لظهر «٠» لجزء من الثانية على كل تحميل صفحة. */}
      <span class="notif-count" data-notif-count hidden aria-live="polite" aria-atomic="true"></span>
    </button>

    <div class="notif-panel" data-notif-panel hidden role="dialog" aria-label="لوحة الإشعارات">
      <header class="notif-panel-head">
        <h3>الإشعارات</h3>
        <div class="notif-head-actions">
          <button type="button" class="notif-read-all" data-notif-read-all hidden>
            {icon('fa-check-double')} تعليم الكل كمقروء
          </button>
          <button type="button" class="notif-close" data-notif-close aria-label="إغلاق">
            {icon('fa-xmark')}
          </button>
        </div>
      </header>

      <div class="notif-list" data-notif-list>
        <p class="notif-loading">{icon('fa-spinner')} جارٍ التحميل…</p>
      </div>

      <footer class="notif-panel-foot">
        <a href="/notifications">عرض كل الإشعارات {icon('fa-arrow-left')}</a>
      </footer>
    </div>
  </div>
}

const CATEGORY_FILTERS: Array<[string, string]> = [
  ['', 'الكل'],
  ...(Object.entries(CATEGORY_LABELS) as Array<[string, string]>)
]

/**
 * صفحة الإشعارات الكاملة.
 *
 * تُستخدم في مكانين: داخل لوحة التحكم (view=notifications) وكصفحة مستقلة
 * على /notifications لغير المشرفين، لأن المتطوع والمتبرع لا يدخلان اللوحة
 * أصلًا — ومع ذلك هما أهم مستقبِلَي الإشعارات (قبول التطوّع، الترقية،
 * تأكيد التبرع). ولو لم توجد صفحة عامة لهم لكان مركز الإشعارات حصرًا
 * للمشرفين، وهو عكس الغرض.
 */
export function DashNotifications({ pushAvailable = false, isAdmin = false }: { pushAvailable?: boolean; isAdmin?: boolean }) {
  return <section class="dash-table notif-page" data-notif-page>
    <header style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px">
      <h3>الإشعارات</h3>
      <div class="notif-page-actions">
        {/* زر تفعيل الـ Push يظهر فقط لو النظام مُهيّأ فعلًا.
            بدون هذا الشرط كان المستخدم يضغط زرًا لا يفعل شيئًا لأن
            FIREBASE_VAPID_KEY غير موجود — والفشل صامت في المتصفح. */}
        {pushAvailable && (
          <button type="button" class="outline-btn notif-act" data-notif-push-toggle>
            {icon('fa-bell')} <span data-notif-push-label>تفعيل إشعارات الجهاز</span>
          </button>
        )}
        {isAdmin && (
          <button type="button" class="outline-btn notif-act" data-notif-test>
            {icon('fa-paper-plane')} إشعار تجريبي
          </button>
        )}
        <button type="button" class="outline-btn notif-act" data-notif-read-all>
          {icon('fa-check-double')} تعليم الكل كمقروء
        </button>
      </div>
    </header>

    {!pushAvailable && (
      <p class="notif-hint">
        {icon('fa-circle-info')}
        إشعارات الجهاز (Push) غير مُهيّأة على السيرفر. الإشعارات تصل داخل هذه الصفحة
        وعلى البريد الإلكتروني بشكل طبيعي.
      </p>
    )}

    <div class="notif-filters" role="tablist" aria-label="تصنيفات الإشعارات">
      {CATEGORY_FILTERS.map(([value, label], i) => (
        <button
          type="button"
          role="tab"
          class={i === 0 ? 'notif-filter active' : 'notif-filter'}
          data-notif-filter={value}
          aria-selected={i === 0 ? 'true' : 'false'}
        >
          {label}
        </button>
      ))}
      <label class="notif-unread-only">
        <input type="checkbox" data-notif-unread-only /> غير المقروءة فقط
      </label>
    </div>

    <div class="notif-page-list" data-notif-page-list>
      <p class="notif-loading">{icon('fa-spinner')} جارٍ التحميل…</p>
    </div>
  </section>
}

/**
 * بطاقة تفضيلات الإشعارات — تُركَّب في صفحة الحساب.
 *
 * تصنيفا account و system غير معروضين للإيقاف: تعيينك مديرًا أو تجميد
 * كارنيهك أو خطأ في النظام أحداث لا يصحّ أن يفوتها المستخدم لأنه أوقف
 * تصنيفًا مرة. الطبقة الخلفية (notify) تتجاهل التفضيلات لهذين التصنيفين
 * أصلًا، وإظهار مفتاح لا أثر له كان سيكون كذبًا على المستخدم.
 */
export function NotificationPrefsCard({ pushAvailable = false }: { pushAvailable?: boolean }) {
  const toggleable = (Object.entries(CATEGORY_LABELS) as Array<[string, string]>)
    .filter(([key]) => key !== 'account' && key !== 'system')

  return <section class="profile-card notif-prefs" data-notif-prefs>
    <header>
      <h3>{icon('fa-sliders')} تفضيلات الإشعارات</h3>
      <p>اختر ما يصلك، وعلى أي قناة.</p>
    </header>

    <div class="notif-prefs-group">
      <h4>القنوات</h4>
      <label class="notif-switch">
        <input type="checkbox" data-notif-pref="email" checked />
        <span>البريد الإلكتروني</span>
      </label>
      <label class="notif-switch">
        <input type="checkbox" data-notif-pref="push" checked disabled={!pushAvailable} />
        <span>
          إشعارات الجهاز (Push)
          {!pushAvailable && <em class="notif-muted"> — غير مُهيّأة حاليًا</em>}
        </span>
      </label>
    </div>

    <div class="notif-prefs-group">
      <h4>التصنيفات</h4>
      {toggleable.map(([key, label]) => (
        <label class="notif-switch">
          <input type="checkbox" data-notif-pref-category={key} checked />
          <span>{label}</span>
        </label>
      ))}
      <p class="notif-muted">
        إشعارات الحساب والصلاحيات والنظام تصل دائمًا — لأهميتها لا يمكن إيقافها.
      </p>
    </div>

    <footer>
      <button type="button" class="primary-btn" data-notif-prefs-save>حفظ التفضيلات</button>
      <span class="notif-prefs-status" data-notif-prefs-status aria-live="polite"></span>
    </footer>
  </section>
}
