export interface UserSession {
  id: string
  email: string
  name: string
  avatar: string
  role: 'admin' | 'donor' | 'user'
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
  role: 'admin' | 'donor'
  avatar_url?: string
  created_at?: string
}
