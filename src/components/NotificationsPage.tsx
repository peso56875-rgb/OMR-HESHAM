/**
 * صفحة الإشعارات المستقلة — /notifications
 *
 * تخدم المتطوّع والمتبرّع والمستخدم العادي، أي كل من لا يستطيع دخول
 * لوحة التحكم. تعيد استخدام DashNotifications نفسها بدل تكرار الواجهة،
 * فأي تحسين في القائمة أو الفلاتر يظهر في المكانين تلقائيًا.
 */
import { Layout, PageHero } from './shared'
import { DashNotifications, NotificationPrefsCard } from './Notifications'
import type { UserSession } from '../types'

export function NotificationsPage({ user, pushAvailable = false, pushConfig = null }: { user: UserSession; pushAvailable?: boolean; pushConfig?: Record<string, string> | null }) {
  return <Layout
    user={user}
    pushConfig={pushConfig}
    title="الإشعارات | مؤسسة الدكتور عمر هشام الخيرية"
    description="كل ما يخصّك من تحديثات المؤسسة في مكان واحد."
  >
    <PageHero
      kicker="الإشعارات"
      title="كل ما <span>يخصّك</span> في مكان واحد"
      text="تأكيد تبرّعاتك، حالة تطوّعك، ترقياتك، وردود الإدارة على رسائلك."
    />

    <section class="section-pad notif-page-wrap">
      <div class="notif-page-inner">
        {/* isAdmin=false دائمًا هنا: زر الإشعار التجريبي أداة تشخيص إداري،
            ونقطة /api/notifications/test محمية بـ adminMiddleware أصلًا،
            فإظهار الزر لغير المشرف يعني زرًا يفشل بـ 403. */}
        <DashNotifications pushAvailable={pushAvailable} isAdmin={false} />
        <NotificationPrefsCard pushAvailable={pushAvailable} />
      </div>
    </section>
  </Layout>
}
