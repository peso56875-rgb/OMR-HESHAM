// Content data for Omar Hesham Foundation — Arabic
// Real data based on foundation's actual information.

export const img = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`

// Stats — Real numbers from the foundation
export const stats = [
  { icon: 'fa-family', num: 50, suffix: '+', label: 'أسرة مستفيدة' },
  { icon: 'fa-hand-holding-medical', num: 80000, suffix: '+', label: 'ج.م دعم مالي' },
  { icon: 'fa-mosque', num: 0, suffix: '+', label: 'حلقة تحفيظ' },
  { icon: 'fa-location-dot', num: 1, suffix: '', label: 'كفر العنانية' },
]

export const programs = [
  { icon: 'fa-cow', cls: 'ic-gold', title: 'مشروع الأضاحي', desc: 'توزيع اللحوم والأضاحي على الأسر الأولى بالرعاية في المواسم والأعياد لإدخال الفرحة ومشاركة البركة.', href: '/donate' },
  { icon: 'fa-utensils', cls: 'ic-emerald', title: 'إطعام الطعام', desc: 'توزيع كراتين رمضان والوجبات الغذائية المطهية على الأسر المحتاجة والعمالة غير المنتظمة.', href: '/donate' },
  { icon: 'fa-stethoscope', cls: 'ic-blue', title: 'الدعم الصحي', desc: 'دعم المستشفيات، وصرف علاجات شهرية، ومساندة مرضى السرطان، والمساهمة في العمليات الجراحية.', href: '/donate' },
  { icon: 'fa-book-quran', cls: 'ic-crimson', title: 'مسابقات القرآن الكريم', desc: 'حلقات تحفيظ للأطفال ومسابقات قرآنية بجوائز قيمة لتحفيز أبنائنا على حفظ كتاب الله وتدبره.', href: '/donate' },
  { icon: 'fa-graduation-cap', cls: 'ic-gold', title: 'الدعم التعليمي', desc: 'تكريم المتفوقين، ودفع مصاريف الطلبة غير القادرين، وتوفير المستلزمات المدرسية الكاملة.', href: '/donate' },
  { icon: 'fa-shirt', cls: 'ic-emerald', title: 'المبادرات المجتمعية', desc: 'توزيع ملابس العيد، وتنظيم مسابقات في الشوارع، وتوزيع هدايا على الأطفال، وخدمة الأهالي.', href: '/donate' },
]

// Campaigns — placeholder structure, will come from Supabase campaigns table
export const campaigns: { img: string; title: string; cat: string; urgent: boolean; raised: number; goal: number; desc: string }[] = []

// Achievements — Real data
export const achievements = [
  { year: '٢٠٢٥', title: 'دعم ٥٠ أسرة محتاجة', desc: 'تم صرف دعم مالي بإجمالي ٦٠,٠٠٠ ج.م للأسر المحتاجة، بالإضافة إلى دعم المرضى بمبلغ ٢٠,٠٠٠ ج.م.' },
  { year: '٢٠٢٥', title: 'دعم مستشفى كفر العنانية', desc: 'دعم المستشفى بعيادة أنف وأذن وحنجرة لخدمة المرضى، وتطوير أعمال الكهرباء لتحسين الخدمات.' },
  { year: '٢٠٢٥', title: 'مسابقات القرآن الكريم', desc: 'مشاركة واسعة من الأبناء والبنات في مختلف الأعمار في مسابقات الحفظ والتلاوة والتجويد مع جوائز قيمة.' },
  { year: '٢٠٢٥', title: 'دعم المنظومة التعليمية', desc: 'تكريم الطلبة المتفوقين وتوفير المستلزمات المدرسية الكاملة ودفع مصاريف الطلبة غير القادرين.' },
]

// News — will come from Supabase news table
export const news: { img: string; cat: string; date: string; title: string; excerpt: string }[] = []

// Events — will come from Supabase events table
export const events: { d: string; m: string; title: string; place: string; type: string }[] = []

// Stories — will come from Supabase stories table
export const stories: { name: string; role: string; avatar: string; text: string; rating: number }[] = []

export const partners: string[] = []

export const faqs = [
  { q: 'كيف أتبرع للمؤسسة؟', a: 'يمكنك التبرع عبر إنستاباي بالتحويل البنكي للبنك الزراعي المصري (حساب رقم 10010397596901014)، أو عبر إنستاباي أو فودافون كاش على الرقم 01060920249، أو التبرع المباشر نقدياً عبر الأستاذ جمال عبد الخالق.' },
  { q: 'ما هي مجالات عمل المؤسسة؟', a: 'نعمل في مجالات متعددة تشمل: الدعم الصحي، وإطعام الطعام، ودعم التعليم، ومسابقات القرآن الكريم، والمشاريع الإنتاجية، ومصارف الزكاة والصدقات، والمشاريع المجتمعية.' },
  { q: 'أين يقع مقر المؤسسة؟', a: 'مقر المؤسسة في كفر العنانية، جمهورية مصر العربية.' },
  { q: 'هل المؤسسة مرخّصة رسميًا؟', a: 'نعم، المؤسسة مسجّلة ومرخّصة لدى الجهات المختصة وتعمل بشفافية كاملة.' },
  { q: 'كم سعر صك الأضحية؟', a: 'صك الصدقة: ٥٠٠ جنيه، وصك الأضحية الكامل: ١١,٠٠٠ جنيه. تقبل الله منا ومنكم صالح الأعمال.' },
  { q: 'كيف يمكنني التأكد من وصول تبرعي؟', a: 'تلتزم المؤسسة بأعلى معايير الشفافية، وننشر تقارير الصرف والإنجازات بشكل مستمر على منصتنا.' },
]

export const values = [
  { icon: 'fa-heart', cls: 'ic-crimson', title: 'الإخلاص', desc: 'نُخلص في العمل لوجه الله تعالى، ونجعل كل ما نقدمه خالصاً لوجهه الكريم.' },
  { icon: 'fa-eye', cls: 'ic-blue', title: 'الشفافية', desc: 'نلتزم بالوضوح في كل ما نقدمه ونعمل بأعلى معايير الأمانة والمسؤولية.' },
  { icon: 'fa-shield-halved', cls: 'ic-emerald', title: 'المسؤولية', desc: 'نتحمل مسؤوليتنا تجاه المجتمع ونعمل بجد لتحقيق أثر حقيقي ومستدام.' },
  { icon: 'fa-hand-holding-heart', cls: 'ic-gold', title: 'الرحمة', desc: 'نقف مع المحتاجين بعطف ورحمة، ونؤمن أن التكافل والتراحم أساس بناء المجتمع.' },
  { icon: 'fa-handshake', cls: 'ic-blue', title: 'الشراكة', desc: 'نعمل مع شركائنا من أجل أثر أكبر ونؤمن أن العمل الجماعي يصنع الفارق.' },
]
