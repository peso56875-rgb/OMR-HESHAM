export interface UserSession {
  id: string
  email: string
  name: string
  avatar: string
  role: 'admin' | 'donor' | 'user' | 'volunteer'
  phone?: string
}

export interface Campaign {
  id?: string
  title: string
  category: string
  cat?: string
  goal: number
  raised?: number
  image_url?: string
  icon?: string
  is_urgent?: boolean
  urgent?: boolean
  is_published?: boolean
  description?: string
  text?: string
  created_at?: string
}

export interface Donation {
  id?: string
  profile_id?: string | null
  campaign_id?: string | null
  campaign_title?: string | null
  campaign_category?: string | null
  amount: number
  donation_type?: string
  donor_name: string
  donor_phone: string
  donor_email?: string | null
  payment_method: string
  payment_status?: string
  status: 'pending' | 'completed' | 'cancelled'
  created_at?: string
}

export interface Volunteer {
  id?: string
  profile_id?: string | null
  full_name: string
  age?: number | null
  phone: string
  city?: string
  preferred_role?: string
  skills?: string
  status: 'pending' | 'approved' | 'rejected'
  volunteer_code?: string
  rank?: string
  hours_count?: number
  team?: string
  avatar_url?: string
  approved_at?: string
  expires_at?: string
  created_at?: string
}

export interface NewsItem {
  id?: string
  title: string
  category: string
  excerpt: string
  content?: string
  image_url?: string
  icon?: string
  is_published?: boolean
  publish_date?: string
  created_at?: string
}

export interface EventItem {
  id?: string
  title: string
  type: string
  place: string
  event_date: string
  description?: string
  image_url?: string
  is_published?: boolean
  created_at?: string
}

export interface Story {
  id?: string
  name: string
  role: string
  rating?: number
  content: string
  image_url?: string
  is_published?: boolean
  created_at?: string
}

export interface Job {
  id?: string
  title: string
  department: string
  job_type: string
  location: string
  description: string
  is_active: boolean
  is_published?: boolean
  created_at?: string
}

export interface JobApplication {
  id?: string
  job_id?: string | null
  job_title?: string
  full_name: string
  email: string
  phone: string
  bio?: string
  cv_url?: string
  status?: string
  created_at?: string
}

export interface ContactMessage {
  id?: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'unread' | 'read'
  created_at?: string
}

export interface NewsletterSubscriber {
  id?: string
  email: string
  status: 'subscribed' | 'unsubscribed'
  created_at?: string
}

export interface UserProfile {
  id?: string
  full_name: string
  email: string
  phone?: string
  role: 'admin' | 'donor' | 'volunteer'
  avatar_url?: string
  created_at?: string
}

export interface TreasuryIncome {
  id?: string
  amount: number
  source: string
  donor_name?: string
  donor_phone?: string
  campaign_id?: string | null
  campaign_title?: string | null
  description?: string
  receipt_url?: string
  date: string
  recorded_by: string
  recorded_by_id: string
  created_at?: string
}

export interface TreasuryExpense {
  id?: string
  amount: number
  category: string
  beneficiary: string
  campaign_id?: string | null
  campaign_title?: string | null
  description: string
  receipt_url?: string
  date: string
  recorded_by: string
  recorded_by_id: string
  created_at?: string
}

/* ────────────────────────── نظام الإشعارات ────────────────────────── */

export type NotificationCategory = 'financial' | 'volunteers' | 'content' | 'system' | 'account'
export type NotificationPriority = 'low' | 'normal' | 'high'

/**
 * 'user'   = إشعار موجّه لمستخدم واحد (user_id مطلوب، حالة القراءة داخله).
 * 'admins' = سجل واحد مشترك لكل المشرفين (user_id = null، وحالة القراءة
 *            لكل مشرف في notification_reads). النسخ لكل مشرف كان سيضاعف
 *            الكتابات بعدد المشرفين لكل حدث.
 * 'all'    = بث عام لكل مستخدم مسجَّل (user_id = null، وحالة القراءة في
 *            notification_reads كذلك). يُستخدم لنشر الأخبار والحملات
 *            والفعاليات: سجل واحد بدل مستند لكل مستخدم.
 */
export type NotificationAudience = 'user' | 'admins' | 'all'

export interface AppNotification {
  id?: string
  user_id: string | null
  audience: NotificationAudience
  type: string
  category: NotificationCategory
  title: string
  body: string
  link: string | null
  icon: string
  priority: NotificationPriority
  /** يُستخدم لإشعارات 'user' فقط؛ المشتركة تُقاس بـ notification_reads. */
  is_read: boolean
  read_at: string | null
  actor_id: string | null
  actor_name: string | null
  meta: Record<string, unknown>
  push_sent: boolean
  created_at: string
}

/** معرّف المستند = `${notification_id}__${user_id}` — قراءة مباشرة بلا استعلام. */
export interface NotificationRead {
  notification_id: string
  user_id: string
  read_at: string
}

/** معرّف المستند = التوكن نفسه، فإعادة التسجيل تحدّث الصف ولا تُنشئ نسخة. */
export interface PushToken {
  user_id: string
  platform: string
  user_agent: string
  created_at: string
  last_seen_at: string
  is_active: boolean
}

/** معرّف المستند = معرّف المستخدم. الغياب = كل شيء مفعّل. */
export interface NotificationPrefs {
  push_enabled: boolean
  email_enabled: boolean
  categories: Partial<Record<NotificationCategory, boolean>>
  /** ساعات الهدوء بتوقيت القاهرة؛ الأولوية 'high' تتجاوزها. */
  quiet_hours?: { enabled: boolean; from: string; to: string }
  updated_at?: string
}
