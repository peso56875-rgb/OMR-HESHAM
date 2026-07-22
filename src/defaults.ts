export const defaultPrograms = [
  ['fa-cow', 'مشروع الأضاحي', 'فرحة تصل إلى البيوت المستحقة في المواسم والأعياد.', 'gold'],
  ['fa-bowl-food', 'إطعام الطعام', 'كراتين رمضان ووجبات ساخنة تحفظ كرامة الأسرة.', 'coral'],
  ['fa-heart-pulse', 'الدعم الصحي', 'دواء وعلاج وعمليات لمن أثقل المرض كاهلهم.', 'blue'],
  ['fa-book-quran', 'مسابقات القرآن', 'حلقات ومسابقات تغرس نور القرآن في قلوب الأطفال.', 'emerald'],
  ['fa-graduation-cap', 'الدعم التعليمي', 'مصروفات وأدوات ورعاية تفتح أبواب المستقبل.', 'violet'],
  ['fa-people-roof', 'مبادرات المجتمع', 'كسوة وهدايا ومبادرات تصنع مجتمعًا أكثر رحمة.', 'cyan'],
]

export const defaultCampaigns = [
  { id: 'medicine', cat: 'صحة', title: 'دواء كل شهر', text: 'ساهم في توفير العلاج الشهري لمرضى لا يملكون ثمن الدواء.', raised: 32000, goal: 50000, icon: 'fa-capsules', urgent: true },
  { id: 'food', cat: 'غذاء', title: 'مائدة تكفي بيتًا', text: 'كراتين غذائية متكاملة تكفي الأسرة وتصل إليها بكرامة.', raised: 18500, goal: 30000, icon: 'fa-basket-shopping', urgent: false },
  { id: 'school', cat: 'تعليم', title: 'حقيبة تفتح بابًا', text: 'أدوات ومصروفات مدرسية تساعد طفلًا على استكمال تعليمه.', raised: 12400, goal: 25000, icon: 'fa-school', urgent: false },
  { id: 'surgery', cat: 'صحة', title: 'عملية تنقذ حياة', text: 'مساهمة عاجلة في تكاليف العمليات للحالات غير القادرة.', raised: 41000, goal: 60000, icon: 'fa-stethoscope', urgent: true },
  { id: 'quran', cat: 'قرآن', title: 'جيل يحمل النور', text: 'دعم حلقات التحفيظ والمسابقات وجوائز المتفوقين.', raised: 9000, goal: 20000, icon: 'fa-book-open', urgent: false },
  { id: 'eid', cat: 'مجتمع', title: 'كسوة وفرحة عيد', text: 'ملابس جديدة وهدايا تجعل العيد أجمل في عيون الأطفال.', raised: 15000, goal: 22000, icon: 'fa-gift', urgent: false },
]

export const defaultNews = [
  ['دعم مستشفى كفر العنانية', 'الصحة', 'تجهيز عيادة الأنف والأذن وتحسين البنية الكهربائية لخدمة المرضى بأمان.', 'fa-hospital'],
  ['زيارة أوائل الطلبة في بيوتهم', 'التعليم', 'لحظات تقدير حقيقية تشجع أبناءنا وتشارك أسرهم فرحة النجاح.', 'fa-medal'],
  ['قافلة دفء إلى الأسر الأولى بالرعاية', 'المجتمع', 'متطوعونا يصلون بالمساعدات إلى البيوت في القرى الأكثر احتياجًا.', 'fa-hands-holding-child']
]

export const routeNames: Record<string, string> = {
  '/about': 'من نحن', '/campaigns': 'الحملات', '/achievements': 'الإنجازات', '/success-stories': 'قصص النجاح',
  '/events': 'الفعاليات', '/gallery': 'معرض الصور', '/donate': 'تبرّع الآن', '/volunteers': 'التطوع', '/careers': 'الوظائف',
  '/news': 'الأخبار', '/transparency': 'الشفافية المالية', '/faq': 'الأسئلة الشائعة', '/contact': 'تواصل معنا',
  '/login': 'تسجيل الدخول', '/profile': 'حسابي', '/dashboard': 'لوحة التحكم'
}
