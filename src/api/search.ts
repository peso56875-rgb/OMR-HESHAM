import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'

export const searchApi = new Hono()

interface SearchResult {
  id: string
  title: string
  snippet: string
  category: string
  type: 'campaign' | 'news' | 'event' | 'story' | 'job' | 'page'
  url: string
  icon: string
}

// Static Core Pages for Fast Lookup
const staticPages: SearchResult[] = [
  {
    id: 'page_about',
    title: 'قصة الدكتور عمر هشام ورسالة المؤسسة',
    snippet: 'تعرف على قصة الدكتور عمر هشام ورسالة المؤسسة الإنسانية في تفريج الكرب ودعم المرضى ونشر العلم.',
    category: 'عن المؤسسة',
    type: 'page',
    url: '/about',
    icon: 'fa-book-open'
  },
  {
    id: 'page_zakat',
    title: 'حاسبة الزكاة والصدقات الذكية',
    snippet: 'احسب زكاة أموالك وذهبك وتجارتك وأسهمك وكفارات الصيام وفق الضوابط الشرعية المعتمدة.',
    category: 'الخدمات الشرعية',
    type: 'page',
    url: '/zakat-calculator',
    icon: 'fa-scale-balanced'
  },
  {
    id: 'page_donate',
    title: 'تبرّع الآن وساهم في صناعة الأثر',
    snippet: 'طرق التبرع السريع عبر إنستاباي، فودافون كاش، الحسابات البنكية، والبطاقات لدعم المحتاجين.',
    category: 'التبرعات',
    type: 'page',
    url: '/donate',
    icon: 'fa-heart'
  },
  {
    id: 'page_volunteers',
    title: 'انضم لأسرة المتطوعين وكن صانع أثر',
    snippet: 'برامج التطوع الميداني، رتب المتطوعين، واكتساب الخبرات وساعات الخدمة المجتمعية المعتمدة.',
    category: 'التطوع',
    type: 'page',
    url: '/volunteers',
    icon: 'fa-hands-holding-child'
  },
  {
    id: 'page_transparency',
    title: 'الشفافية المالية والتقارير المعتمدة',
    snippet: 'التراخيص الرسمية، رقم التشهير 3115 لسنة 2026، وإيصالات التبرع الرسمية وسجلات الصرف.',
    category: 'الشفافية',
    type: 'page',
    url: '/transparency',
    icon: 'fa-file-shield'
  },
  {
    id: 'page_faq',
    title: 'الأسئلة الشائعة وإجاباتها',
    snippet: 'كل ما تود معرفته عن مصارف التبرع، التحقق من الإيصالات، وتوثيق المساعدات.',
    category: 'المساعدة',
    type: 'page',
    url: '/faq',
    icon: 'fa-circle-question'
  },
  {
    id: 'page_contact',
    title: 'تواصل معنا واستفسر عن الحالات',
    snippet: 'عناوين مقرات المؤسسة، أرقام الهاتف، والبريد الإلكتروني المباشر لفريق العمل.',
    category: 'التواصل',
    type: 'page',
    url: '/contact',
    icon: 'fa-phone-volume'
  }
]

searchApi.get('/', async (c) => {
  const query = (c.req.query('q') || '').trim().toLowerCase()
  if (!query || query.length < 2) {
    return c.json({ results: [], query })
  }

  const results: SearchResult[] = []

  // 1. Search in static core pages
  for (const p of staticPages) {
    if (p.title.toLowerCase().includes(query) || p.snippet.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)) {
      results.push(p)
    }
  }

  try {
    const db = getFirestore(c)
    const [cSnap, nSnap, eSnap, sSnap, jSnap] = await Promise.all([
      db.collection('campaigns').where('is_published', '==', true).limit(20).get().catch(() => ({ docs: [] })),
      db.collection('news').where('is_published', '==', true).limit(20).get().catch(() => ({ docs: [] })),
      db.collection('events').where('is_published', '==', true).limit(20).get().catch(() => ({ docs: [] })),
      db.collection('stories').where('is_published', '==', true).limit(20).get().catch(() => ({ docs: [] })),
      db.collection('jobs').where('is_published', '==', true).limit(10).get().catch(() => ({ docs: [] }))
    ])

    // Campaigns
    for (const doc of cSnap.docs || []) {
      const d = doc.data() || {}
      const text = `${d.title || ''} ${d.description || ''} ${d.category || ''}`.toLowerCase()
      if (text.includes(query)) {
        results.push({
          id: doc.id,
          title: d.title || 'حملة خيرية',
          snippet: d.description ? (d.description.slice(0, 95) + '...') : (d.category || 'حملة إغاثية'),
          category: d.category || 'حملات الخير',
          type: 'campaign',
          url: `/campaigns/${doc.id}`,
          icon: d.icon || 'fa-seedling'
        })
      }
    }

    // News
    for (const doc of nSnap.docs || []) {
      const d = doc.data() || {}
      const text = `${d.title || ''} ${d.excerpt || ''} ${d.content || ''} ${d.category || ''}`.toLowerCase()
      if (text.includes(query)) {
        results.push({
          id: doc.id,
          title: d.title || 'خبر من المؤسسة',
          snippet: d.excerpt || (d.content ? d.content.slice(0, 95) + '...' : ''),
          category: d.category || 'الأخبار الميدانية',
          type: 'news',
          url: `/news/${doc.id}`,
          icon: 'fa-newspaper'
        })
      }
    }

    // Events
    for (const doc of eSnap.docs || []) {
      const d = doc.data() || {}
      const text = `${d.title || ''} ${d.description || ''} ${d.place || ''}`.toLowerCase()
      if (text.includes(query)) {
        results.push({
          id: doc.id,
          title: d.title || 'فعالية تطوعية',
          snippet: `${d.place || ''} — ${d.description ? d.description.slice(0, 80) + '...' : ''}`,
          category: d.type || 'الفعاليات',
          type: 'event',
          url: `/events/${doc.id}`,
          icon: 'fa-calendar-check'
        })
      }
    }

    // Stories
    for (const doc of sSnap.docs || []) {
      const d = doc.data() || {}
      const text = `${d.name || ''} ${d.content || ''} ${d.role || ''}`.toLowerCase()
      if (text.includes(query)) {
        results.push({
          id: doc.id,
          title: `قصة أثر: ${d.name || 'مستفيد'}`,
          snippet: d.content ? (d.content.slice(0, 95) + '...') : '',
          category: d.role || 'قصص النجاح',
          type: 'story',
          url: '/success-stories',
          icon: 'fa-quote-right'
        })
      }
    }

    // Jobs
    for (const doc of jSnap.docs || []) {
      const d = doc.data() || {}
      const text = `${d.title || ''} ${d.description || ''} ${d.department || ''}`.toLowerCase()
      if (text.includes(query)) {
        results.push({
          id: doc.id,
          title: `وظيفة شاغرة: ${d.title || ''}`,
          snippet: `${d.department || ''} · ${d.location || 'مصر'} — ${d.description ? d.description.slice(0, 80) + '...' : ''}`,
          category: 'فرص التوظيف',
          type: 'job',
          url: '/careers',
          icon: 'fa-briefcase'
        })
      }
    }
  } catch (e: any) {
    console.error('[Search API Error]:', e.message)
  }

  return c.json({
    results: results.slice(0, 15),
    total: results.length,
    query
  })
})
