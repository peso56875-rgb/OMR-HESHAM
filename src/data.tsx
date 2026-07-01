// Content data for Omar Hesham Foundation — Arabic
// This file contains PLACEHOLDER structure only.
// Real data will be loaded dynamically from Supabase in production.
// All fake numbers have been removed. Zeros indicate "to be filled from DB".

export const img = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`

// Stats — will be fetched live from /api/stats in production
export const stats = [
  { icon: 'fa-hand-holding-heart', num: 0, suffix: '+', label: 'مستفيد ومستفيدة' },
  { icon: 'fa-bullhorn', num: 0, suffix: '+', label: 'حملة إنسانية' },
  { icon: 'fa-hands-helping', num: 0, suffix: '+', label: 'متطوّع نشط' },
  { icon: 'fa-globe', num: 0, suffix: '', label: 'محافظة نخدمها' },
]

export const programs = [
  { icon: 'fa-utensils', cls: 'ic-emerald', title: 'الإغاثة الغذائية', desc: 'توزيع السلال الغذائية ووجبات الإفطار على الأسر المتعففة في مختلف المناطق.', href: '/campaigns' },
  { icon: 'fa-stethoscope', cls: 'ic-blue', title: 'الرعاية الصحية', desc: 'قوافل طبية، وتغطية تكاليف العمليات والأدوية للمرضى غير القادرين.', href: '/campaigns' },
  { icon: 'fa-graduation-cap', cls: 'ic-gold', title: 'التعليم والمنح', desc: 'كفالة الطلاب، وتوفير الأدوات الدراسية، ومنح للمتفوقين من غير القادرين.', href: '/campaigns' },
  { icon: 'fa-house-chimney', cls: 'ic-crimson', title: 'الإسكان والكساء', desc: 'ترميم المنازل الآيلة للسقوط وتوفير الملابس والكساء للأسر المحتاجة.', href: '/campaigns' },
  { icon: 'fa-child', cls: 'ic-emerald', title: 'كفالة الأيتام', desc: 'برنامج كفالة شامل يضمن للأيتام التعليم والرعاية والحياة الكريمة.', href: '/campaigns' },
  { icon: 'fa-droplet', cls: 'ic-blue', title: 'مشاريع المياه', desc: 'حفر الآبار وإنشاء محطات تحلية وتوفير المياه النظيفة للقرى.', href: '/campaigns' },
]

// Campaigns — placeholder structure, will come from Supabase campaigns table
export const campaigns: { img: string; title: string; cat: string; urgent: boolean; raised: number; goal: number; desc: string }[] = []

// Achievements — static timeline, can be managed from CMS later
export const achievements = [
  { year: '٢٠٢٤', title: 'يتم التحديث قريبًا', desc: 'سيتم إضافة الإنجازات الفعلية عند تجهيز المحتوى.' },
]

// News — will come from Supabase news table
export const news: { img: string; cat: string; date: string; title: string; excerpt: string }[] = []

// Events — will come from Supabase events table
export const events: { d: string; m: string; title: string; place: string; type: string }[] = []

// Stories — will come from Supabase stories table
export const stories: { name: string; role: string; avatar: string; text: string; rating: number }[] = []

export const partners: string[] = []

export const faqs = [
  { q: 'كيف أتأكد من وصول تبرّعي إلى مستحقيه؟', a: 'تلتزم المؤسسة بأعلى معايير الشفافية، حيث نصدر تقارير دورية مفصّلة عن أوجه الصرف، ويمكنك متابعة أثر تبرّعك من خلال لوحة المتبرّع أو صفحة الشفافية المالية.' },
  { q: 'هل يمكنني تخصيص تبرّعي لحملة معيّنة؟', a: 'نعم، بإمكانك اختيار الحملة التي ترغب بدعمها عند التبرّع، كما يمكنك التبرّع للصندوق العام لتوجيهه إلى الأولويات الأكثر احتياجًا.' },
  { q: 'كيف يمكنني الانضمام كمتطوّع؟', a: 'يمكنك التسجيل عبر صفحة التطوّع باختيار المجال الذي يناسب مهاراتك ووقتك، وسيتواصل معك فريقنا لإتمام إجراءات الانضمام.' },
  { q: 'هل المؤسسة مرخّصة رسميًا؟', a: 'نعم، المؤسسة مسجّلة ومرخّصة لدى الجهات المختصة وتخضع لمراجعة مالية مستقلة سنويًا.' },
  { q: 'هل يمكنني الحصول على إيصال للتبرّع؟', a: 'بالتأكيد، يصلك إيصال إلكتروني رسمي فور إتمام التبرّع، ويمكنك تنزيل جميع إيصالاتك من لوحة المتبرّع.' },
  { q: 'ما هي طرق التبرّع المتاحة؟', a: 'نوفّر التبرّع الإلكتروني بالبطاقات البنكية، والتحويل المصرفي، والمحافظ الإلكترونية، بالإضافة إلى التبرّع العيني.' },
]

export const values = [
  { icon: 'fa-handshake-angle', cls: 'ic-emerald', title: 'الأمانة', desc: 'نتعامل مع كل تبرّع كأمانة في أعناقنا توصَل إلى مستحقيها كاملةً.' },
  { icon: 'fa-eye', cls: 'ic-blue', title: 'الشفافية', desc: 'تقارير دورية واضحة عن كل جنيه يُنفق، فلا مكان للغموض في عملنا.' },
  { icon: 'fa-bolt', cls: 'ic-gold', title: 'الأثر', desc: 'نقيس أثرنا بالأرواح التي نلامسها، لا بحجم الأرقام فحسب.' },
  { icon: 'fa-heart', cls: 'ic-crimson', title: 'الرحمة', desc: 'نضع كرامة الإنسان في صميم كل خدمة نقدّمها بحبّ وإحسان.' },
]
