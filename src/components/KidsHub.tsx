import { Layout, icon } from './shared'
import type { UserSession } from '../types'

// All 28 Arabic letters with complete position examples (initial, medial, final)
export const ARABIC_LETTERS = [
  {
    letter: 'أ', name: 'ألف', word: 'أَسَد', icon: 'fa-feather', color: '#0c4a3f',
    initial: { char: 'أَ', word: 'أَسَد' },
    medial: { char: 'ـأَ', word: 'فَأْر' },
    final: { char: 'ـأ', word: 'نَبَأ' }
  },
  {
    letter: 'ب', name: 'باء', word: 'بَاب', icon: 'fa-door-open', color: '#168a70',
    initial: { char: 'بـ', word: 'بَيْت' },
    medial: { char: 'ـبـ', word: 'حَبْل' },
    final: { char: 'ـب', word: 'عِنَب' }
  },
  {
    letter: 'ت', name: 'تاء', word: 'تَاج', icon: 'fa-crown', color: '#d97706',
    initial: { char: 'تـ', word: 'تَمْر' },
    medial: { char: 'ـتـ', word: 'كِتَاب' },
    final: { char: 'ـت', word: 'بِنْت' }
  },
  {
    letter: 'ث', name: 'ثاء', word: 'ثَمَر', icon: 'fa-apple-whole', color: '#7c3aed',
    initial: { char: 'ثـ', word: 'ثَوْب' },
    medial: { char: 'ـثـ', word: 'عُثْمَان' },
    final: { char: 'ـث', word: 'أَثَاث' }
  },
  {
    letter: 'ج', name: 'جيم', word: 'جَبَل', icon: 'fa-mountain', color: '#0284c7',
    initial: { char: 'جـ', word: 'جَمَل' },
    medial: { char: 'ـجـ', word: 'شَجَرَة' },
    final: { char: 'ـج', word: 'بُرْج' }
  },
  {
    letter: 'ح', name: 'حاء', word: 'حَدِيقَة', icon: 'fa-tree', color: '#059669',
    initial: { char: 'حـ', word: 'حَقِيبَة' },
    medial: { char: 'ـحـ', word: 'بَحْر' },
    final: { char: 'ـح', word: 'مِفْتَاح' }
  },
  {
    letter: 'خ', name: 'خاء', word: 'خَيْر', icon: 'fa-hand-holding-heart', color: '#b45309',
    initial: { char: 'خـ', word: 'خُبْز' },
    medial: { char: 'ـخـ', word: 'نَخْلَة' },
    final: { char: 'ـخ', word: 'مَطْبَخ' }
  },
  {
    letter: 'د', name: 'دال', word: 'دَرْب', icon: 'fa-route', color: '#2563eb',
    initial: { char: 'د', word: 'دَفْتَر' },
    medial: { char: 'ـد', word: 'مَدْرَسَة' },
    final: { char: 'ـد', word: 'مَسْجِد' }
  },
  {
    letter: 'ذ', name: 'ذال', word: 'ذَهَب', icon: 'fa-coins', color: '#ea580c',
    initial: { char: 'ذ', word: 'ذُرَة' },
    medial: { char: 'ـذ', word: 'بَذْرَة' },
    final: { char: 'ـذ', word: 'مُعَاذ' }
  },
  {
    letter: 'ر', name: 'راء', word: 'رَحْمَة', icon: 'fa-heart', color: '#dc2626',
    initial: { char: 'ر', word: 'رَسُول' },
    medial: { char: 'ـر', word: 'قُرْآن' },
    final: { char: 'ـر', word: 'نَهْر' }
  },
  {
    letter: 'ز', name: 'زاي', word: 'زَيْتُون', icon: 'fa-leaf', color: '#0d9488',
    initial: { char: 'ز', word: 'زَهْرَة' },
    medial: { char: 'ـز', word: 'مَزْرَعَة' },
    final: { char: 'ـز', word: 'خُبْز' }
  },
  {
    letter: 'س', name: 'سين', word: 'سَلَام', icon: 'fa-dove', color: '#4f46e5',
    initial: { char: 'سـ', word: 'سَمَاء' },
    medial: { char: 'ـسـ', word: 'مَسْجِد' },
    final: { char: 'ـس', word: 'شَمْس' }
  },
  {
    letter: 'ش', name: 'شين', word: 'شَمْس', icon: 'fa-sun', color: '#d97706',
    initial: { char: 'شـ', word: 'شَجَرَة' },
    medial: { char: 'ـشـ', word: 'مِشْكَاة' },
    final: { char: 'ـش', word: 'عُشّ' }
  },
  {
    letter: 'ص', name: 'صاد', word: 'صَلَاة', icon: 'fa-hands-praying', color: '#059669',
    initial: { char: 'صـ', word: 'صَبَاح' },
    medial: { char: 'ـصـ', word: 'مِصْبَاح' },
    final: { char: 'ـص', word: 'قَفَص' }
  },
  {
    letter: 'ض', name: 'ضاد', word: 'ضِيَاء', icon: 'fa-lightbulb', color: '#15803d',
    initial: { char: 'ضـ', word: 'ضَوْء' },
    medial: { char: 'ـضـ', word: 'رَمَضَان' },
    final: { char: 'ـض', word: 'أَرْض' }
  },
  {
    letter: 'ط', name: 'طاء', word: 'طَيْر', icon: 'fa-feather-pointed', color: '#0284c7',
    initial: { char: 'طـ', word: 'طَالِب' },
    medial: { char: 'ـطـ', word: 'مَطَر' },
    final: { char: 'ـط', word: 'خَيْط' }
  },
  {
    letter: 'ظ', name: 'ظاء', word: 'ظِلّ', icon: 'fa-cloud-sun', color: '#9333ea',
    initial: { char: 'ظـ', word: 'ظَرْف' },
    medial: { char: 'ـظـ', word: 'نَظَافَة' },
    final: { char: 'ـظ', word: 'حَافِظ' }
  },
  {
    letter: 'ع', name: 'عين', word: 'عِلْم', icon: 'fa-graduation-cap', color: '#c026d3',
    initial: { char: 'عـ', word: 'عَيْن' },
    medial: { char: 'ـعـ', word: 'مُعَلِّم' },
    final: { char: 'ـع', word: 'شَارِع' }
  },
  {
    letter: 'غ', name: 'غين', word: 'غَيْم', icon: 'fa-cloud', color: '#e11d48',
    initial: { char: 'غـ', word: 'غَابَة' },
    medial: { char: 'ـغـ', word: 'صَغِير' },
    final: { char: 'ـغ', word: 'صِمَاغ' }
  },
  {
    letter: 'ف', name: 'فاء', word: 'فَجْر', icon: 'fa-sun-plant-wilt', color: '#0369a1',
    initial: { char: 'فـ', word: 'فَانُوس' },
    medial: { char: 'ـفـ', word: 'طِفْل' },
    final: { char: 'ـف', word: 'مُصْحَف' }
  },
  {
    letter: 'ق', name: 'قاف', word: 'قُرْآن', icon: 'fa-book-quran', color: '#6d28d9',
    initial: { char: 'قـ', word: 'قَلَم' },
    medial: { char: 'ـقـ', word: 'حَقِيبَة' },
    final: { char: 'ـق', word: 'شُرُوق' }
  },
  {
    letter: 'ك', name: 'كاف', word: 'كِتَاب', icon: 'fa-book-open', color: '#047857',
    initial: { char: 'كـ', word: 'كَعْبَة' },
    medial: { char: 'ـكـ', word: 'مَكْتَبَة' },
    final: { char: 'ـك', word: 'مَلِك' }
  },
  {
    letter: 'ل', name: 'لام', word: 'لَوْحَة', icon: 'fa-palette', color: '#b45309',
    initial: { char: 'لـ', word: 'لَيْل' },
    medial: { char: 'ـلـ', word: 'قَلَم' },
    final: { char: 'ـل', word: 'جَمَل' }
  },
  {
    letter: 'م', name: 'ميم', word: 'مَسْجِد', icon: 'fa-mosque', color: '#0c4a3f',
    initial: { char: 'مـ', word: 'مِئْذَنَة' },
    medial: { char: 'ـمـ', word: 'شَمْس' },
    final: { char: 'ـم', word: 'قَلَم' }
  },
  {
    letter: 'ن', name: 'نون', word: 'نُور', icon: 'fa-star', color: '#d97706',
    initial: { char: 'نـ', word: 'نَخْلَة' },
    medial: { char: 'ـنـ', word: 'مِنْبَر' },
    final: { char: 'ـن', word: 'مُؤْمِن' }
  },
  {
    letter: 'هـ', name: 'هاء', word: 'هِدَايَة', icon: 'fa-compass', color: '#0284c7',
    initial: { char: 'هـ', word: 'هِلَال' },
    medial: { char: 'ـهـ', word: 'زَهْرَة' },
    final: { char: 'ـه', word: 'وَجْه' }
  },
  {
    letter: 'و', name: 'واو', word: 'وُضُوء', icon: 'fa-droplet', color: '#e11d48',
    initial: { char: 'و', word: 'وَطَن' },
    medial: { char: 'ـو', word: 'نُور' },
    final: { char: 'ـو', word: 'دَلْو' }
  },
  {
    letter: 'ي', name: 'ياء', word: 'يَقِين', icon: 'fa-hand-peace', color: '#7c3aed',
    initial: { char: 'يـ', word: 'يَد' },
    medial: { char: 'ـيـ', word: 'إِيمَان' },
    final: { char: 'ـي', word: 'أَخِي' }
  }
]

// Vocabulary categories for First Words
export const WORD_CATEGORIES = [
  {
    id: 'family', name: 'الأسرة والبيت', icon: 'fa-people-roof',
    words: [
      { text: 'أَبِي', sub: 'السند والعطاء', letters: 'أ - ب - ي' },
      { text: 'أُمِّي', sub: 'ينبوع الحنان', letters: 'أ - م - ي' },
      { text: 'أَخِي', sub: 'رفيق دربي', letters: 'أ - خ - ي' },
      { text: 'أُخْتِي', sub: 'نور دارنا', letters: 'أ - خ - ت - ي' },
      { text: 'جَدِّي', sub: 'بركة البيت', letters: 'ج - د - ي' },
      { text: 'بَيْتِي', sub: 'سكن وأمان', letters: 'ب - ي - ت - ي' }
    ]
  },
  {
    id: 'nature', name: 'الطبيعة والكون', icon: 'fa-earth-africa',
    words: [
      { text: 'شَمْس', sub: 'ضياء ودفء', letters: 'ش - م - س' },
      { text: 'قَمَر', sub: 'نور في السماء', letters: 'ق - م - ر' },
      { text: 'نَجْم', sub: 'يهتدي به الساري', letters: 'ن - ج - م' },
      { text: 'سَحَاب', sub: 'يحمل المطر', letters: 'س - ح - ا - ب' },
      { text: 'مَطَر', sub: 'غيث ورحمة', letters: 'م - ط - ر' },
      { text: 'شَجَرَة', sub: 'ظل وثمر', letters: 'ش - ج - ر - ة' }
    ]
  },
  {
    id: 'school', name: 'المدرسة والعلم', icon: 'fa-graduation-cap',
    words: [
      { text: 'كِتَاب', sub: 'كنز المعرفة', letters: 'ك - ت - ا - ب' },
      { text: 'قَلَم', sub: 'يكتب المستقبل', letters: 'ق - ل - م' },
      { text: 'دَفْتَر', sub: 'أدون فيه علمي', letters: 'د - ف - ت - ر' },
      { text: 'مُعَلِّم', sub: 'يبني العقول', letters: 'م - ع - ل - م' },
      { text: 'طَالِب', sub: 'يسعى للنجاح', letters: 'ط - ا - ل - ب' },
      { text: 'مَدْرَسَة', sub: 'بيتي الثاني', letters: 'م - د - ر - س - ة' }
    ]
  },
  {
    id: 'islamic', name: 'معاني وإيمانيات', icon: 'fa-mosque',
    words: [
      { text: 'مَسْجِد', sub: 'بيت الله المبارك', letters: 'م - س - ج - د' },
      { text: 'مُصْحَف', sub: 'كتاب الله الكريم', letters: 'م - ص - ح - ف' },
      { text: 'صَلَاة', sub: 'صلتي بربي', letters: 'ص - ل - ا - ة' },
      { text: 'كَعْبَة', sub: 'قبلة المسلمين', letters: 'ك - ع - ب - ة' },
      { text: 'دُعَاء', sub: 'سلاح المؤمن', letters: 'د - ع - ا - ء' },
      { text: 'إِحْسَان', sub: 'طريق المحبة', letters: 'إ - ح - س - ا - ن' }
    ]
  }
]

// First Sentences for Karaoke Read-Along
export const FIRST_SENTENCES = [
  { id: 1, full: 'اللَّهُ رَبِّي وَالْإِسْلَامُ دِينِي', words: ['اللَّهُ', 'رَبِّي', 'وَالْإِسْلَامُ', 'دِينِي'], meaning: 'شهادة التوحيد واعتزاز بالدين' },
  { id: 2, full: 'الْقُرْآنُ الْكَرِيمُ كِتَابِي وَنُورِي', words: ['الْقُرْآنُ', 'الْكَرِيمُ', 'كِتَابِي', 'وَنُورِي'], meaning: 'منهج هداية وسعادة' },
  { id: 3, full: 'بِرُّ الْوَالِدَيْنِ مِنْ أَعْظَمِ الْقُرُبَاتِ', words: ['بِرُّ', 'الْوَالِدَيْنِ', 'مِنْ', 'أَعْظَمِ', 'الْقُرُبَاتِ'], meaning: 'طاعة الأب والأم ورعايتهما' },
  { id: 4, full: 'أَنَا طِفْلٌ نَشِيطٌ أُحِبُّ الْعِلْمَ', words: ['أَنَا', 'طِفْلٌ', 'نَشِيطٌ', 'أُحِبُّ', 'الْعِلْمَ'], meaning: 'همة واجتهاد في طلب العلم' },
  { id: 5, full: 'الصِّدْقُ خُلُقٌ جَمِيلٌ يَهْدِي إِلَى الْجَنَّةِ', words: ['الصِّدْقُ', 'خُلُقٌ', 'جَمِيلٌ', 'يَهْدِي', 'إِلَى', 'الْجَنَّةِ'], meaning: 'التحلي بالصدق في القول والعمل' }
]

// Complete Juz Amma Surahs for Kids Memorization
export const JUZ_AMMA_SURAHS = [
  { id: 1, name: 'الفاتحة', count: 7, level: 'ميسر جداً', type: 'مكية' },
  { id: 114, name: 'الناس', count: 6, level: 'ميسر', type: 'مكية' },
  { id: 113, name: 'الفلق', count: 5, level: 'ميسر', type: 'مكية' },
  { id: 112, name: 'الإخلاص', count: 4, level: 'ميسر', type: 'مكية' },
  { id: 111, name: 'المسد', count: 5, level: 'ميسر', type: 'مكية' },
  { id: 110, name: 'النصر', count: 3, level: 'ميسر', type: 'مدنية' },
  { id: 109, name: 'الكافرون', count: 6, level: 'ميسر', type: 'مكية' },
  { id: 108, name: 'الكوثر', count: 3, level: 'ميسر', type: 'مكية' },
  { id: 107, name: 'الماعون', count: 7, level: 'ميسر', type: 'مكية' },
  { id: 106, name: 'قريش', count: 4, level: 'ميسر', type: 'مكية' },
  { id: 105, name: 'الفيل', count: 5, level: 'ميسر', type: 'مكية' },
  { id: 104, name: 'الهمزة', count: 9, level: 'متوسط', type: 'مكية' },
  { id: 103, name: 'العصر', count: 3, level: 'ميسر', type: 'مكية' },
  { id: 102, name: 'التكاثر', count: 8, level: 'متوسط', type: 'مكية' },
  { id: 101, name: 'القارعة', count: 11, level: 'متوسط', type: 'مكية' },
  { id: 100, name: 'العاديات', count: 11, level: 'متوسط', type: 'مكية' },
  { id: 99, name: 'الزلزلة', count: 8, level: 'متوسط', type: 'مدنية' },
  { id: 98, name: 'البينة', count: 8, level: 'متقدم', type: 'مدنية' },
  { id: 97, name: 'القدر', count: 5, level: 'ميسر', type: 'مكية' },
  { id: 96, name: 'العلق', count: 19, level: 'متقدم', type: 'مكية' },
  { id: 95, name: 'التين', count: 8, level: 'ميسر', type: 'مكية' },
  { id: 94, name: 'الشرح', count: 8, level: 'ميسر', type: 'مكية' },
  { id: 93, name: 'الضحى', count: 11, level: 'متوسط', type: 'مكية' },
  { id: 92, name: 'الليل', count: 21, level: 'متقدم', type: 'مكية' },
  { id: 91, name: 'الشمس', count: 15, level: 'متوسط', type: 'مكية' },
  { id: 90, name: 'البلد', count: 20, level: 'متقدم', type: 'مكية' },
  { id: 89, name: 'الفجر', count: 30, level: 'متقدم', type: 'مكية' },
  { id: 88, name: 'الغاشية', count: 26, level: 'متقدم', type: 'مكية' },
  { id: 87, name: 'الأعلى', count: 19, level: 'متوسط', type: 'مكية' },
  { id: 86, name: 'الطارق', count: 17, level: 'متوسط', type: 'مكية' },
  { id: 85, name: 'البروج', count: 22, level: 'متقدم', type: 'مكية' },
  { id: 84, name: 'الانشقاق', count: 25, level: 'متقدم', type: 'مكية' },
  { id: 83, name: 'المطففين', count: 36, level: 'متقدم', type: 'مكية' },
  { id: 82, name: 'الانفطار', count: 19, level: 'متوسط', type: 'مكية' },
  { id: 81, name: 'التكوير', count: 29, level: 'متقدم', type: 'مكية' },
  { id: 80, name: 'عبس', count: 42, level: 'متقدم', type: 'مكية' },
  { id: 79, name: 'النازعات', count: 46, level: 'متقدم', type: 'مكية' },
  { id: 78, name: 'النبأ', count: 40, level: 'متقدم', type: 'مكية' }
]

// 20 Complete Daily Duas for Young Muslims
export const KIDS_DUAS_LIST = [
  { id: 1, title: 'دعاء الاستيقاظ من النوم', text: 'الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', category: 'الصباح والمساء', icon: 'fa-sun' },
  { id: 2, title: 'دعاء النوم وراحة الجسد', text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا', category: 'الصباح والمساء', icon: 'fa-moon' },
  { id: 3, title: 'التسمية قبل الطعام', text: 'بِسْمِ اللَّهِ، وَإِنْ نَسِيتُ أَقُولُ: بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ', category: 'الطعام والشراب', icon: 'fa-utensils' },
  { id: 4, title: 'حمد الله بعد الفراغ من الطعام', text: 'الحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', category: 'الطعام والشراب', icon: 'fa-bowl-rice' },
  { id: 5, title: 'دعاء الخروج من المنزل', text: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', category: 'اليوم والليلة', icon: 'fa-shoe-prints' },
  { id: 6, title: 'دعاء دخول المنزل بسلام', text: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا، ثُمَّ أُسَلِّمُ عَلَى أَهْلِي', category: 'اليوم والليلة', icon: 'fa-house' },
  { id: 7, title: 'دعاء دخول المسجد', text: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', category: 'المسجد والصلاة', icon: 'fa-mosque' },
  { id: 8, title: 'دعاء الخروج من المسجد', text: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', category: 'المسجد والصلاة', icon: 'fa-person-walking-arrow-right' },
  { id: 9, title: 'الدعاء الصادق للوالدين', text: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ، رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', category: 'بر الوالدين', icon: 'fa-hands-holding-child' },
  { id: 10, title: 'دعاء الاستذكار وطلب العلم', text: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا، رَبِّ زِدْنِي عِلْمًا', category: 'العلم والدراسة', icon: 'fa-book-open-reader' },
  { id: 11, title: 'دعاء لبس الثوب الجديد', text: 'الحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ', category: 'اليوم والليلة', icon: 'fa-shirt' },
  { id: 12, title: 'دعاء ركوب السيارة أو الحافلة', text: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ', category: 'السفر والتنقل', icon: 'fa-car' },
  { id: 13, title: 'أدب العطاس وشكر المنعم', text: 'أَقُولُ إِذَا عَطَسْتُ: «الحَمْدُ لِلَّهِ»، فَيَقُولُ لِي أَخِي: «يَرْحَمُكَ اللَّهُ»، فَأَرُدُّ: «يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ»', category: 'الآداب النبوية', icon: 'fa-face-smile' },
  { id: 14, title: 'دعاء نزول الغيث والمطر', text: 'اللَّهُمَّ صَيِّبًا نَافِعًا، مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ', category: 'الكون والطبيعة', icon: 'fa-cloud-rain' },
  { id: 15, title: 'دعاء رؤية الهلال والمواسم', text: 'اللَّهُ أَكْبَرُ، اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ', category: 'الكون والطبيعة', icon: 'fa-moon' },
  { id: 16, title: 'دعاء كفارة المجلس', text: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ', category: 'الآداب النبوية', icon: 'fa-users' },
  { id: 17, title: 'دعاء عيادة المريض والدعاء له', text: 'لَا بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ، أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', category: 'الرحمة والمواساة', icon: 'fa-heart-pulse' },
  { id: 18, title: 'دعاء الغضب والاستعاذة', text: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ، وَأَتَوَضَّأُ لِيَسْكُنَ غَضَبِي', category: 'الآداب النبوية', icon: 'fa-shield-halved' },
  { id: 19, title: 'سيد الاستغفار للأشبال', text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ', category: 'الذكر والاستغفار', icon: 'fa-hands-praying' },
  { id: 20, title: 'دعاء رد الجميل لمن صنع إليك معروفاً', text: 'جَزَاكَ اللَّهُ خَيْرًا، وَبَارَكَ فِيكَ وَفِي أَهْلِكَ', category: 'الآداب النبوية', icon: 'fa-handshake-angle' }
]

export function KidsHub({ user }: { user?: UserSession }) {
  return (
    <Layout
      user={user}
      title="واحة أطفال المؤسسة | تعليم القراءة والقرآن والرسم | مؤسسة د. عمر هشام الخيرية"
      description="منصة تفاعلية تعليمية وتربوية متكاملة لتعليم الأطفال القراءة والكتابة، المصحف المعلم بصوت الشيخ المنشاوي وترديد الأطفال، الأرقام، مرسم الصغار، والأدعية المأثورة."
      image="/static/img/og-image.png"
    >
      {/* ─── Hero Section: Clean, Refined, Noble Arabic Aesthetic ─── */}
      <section class="kids-hero-refined">
        <div class="kids-hero-art-bg">
          <div class="geometric-halo"></div>
        </div>

        <div class="kids-hero-inner">
          <div class="kids-pre-badge">
            <i class="fa-solid fa-graduation-cap"></i>
            <span>منصة الإتقان والتربية • صدقة جارية لروح د. عمر هشام</span>
          </div>

          <h1 class="kids-hero-heading">
            واحة <span>أطفال المؤسسة</span>
          </h1>

          <p class="kids-hero-sub">
            بيئة تفاعلية رائدة تغرس نور القرآن الكريم بصوت <strong>الشيخ المنشاوي المعلم وترديد الأطفال</strong>، وتعلّم الحروف والقراءة والأرقام، وتطلق مواهب الرسم والفكر بأسلوب تربوي رصين ومحبب.
          </p>

          {/* Quick Balanced Counters Bar */}
          <div class="kids-metrics-ribbon">
            <div class="metric-chip">
              <span class="chip-ico gold"><i class="fa-solid fa-award"></i></span>
              <div class="chip-data">
                <strong id="totalStarsCounter">0</strong>
                <small>رصيد النقاط</small>
              </div>
            </div>

            <div class="metric-chip">
              <span class="chip-ico emerald"><i class="fa-solid fa-book-open"></i></span>
              <div class="chip-data">
                <strong id="lettersLearnedCounter">0 / 28</strong>
                <small>الحروف المتقنة</small>
              </div>
            </div>

            <div class="metric-chip">
              <span class="chip-ico blue"><i class="fa-solid fa-quran"></i></span>
              <div class="chip-data">
                <strong id="surahsLearnedCounter">0 / 37</strong>
                <small>سور جزء عم</small>
              </div>
            </div>

            <div class="metric-chip">
              <span class="chip-ico purple"><i class="fa-solid fa-crown"></i></span>
              <div class="chip-data">
                <strong id="currentRankTitle">بطل مجتهد</strong>
                <small>المستوى الحالي</small>
              </div>
            </div>

            <button type="button" class="kids-welcome-voice-btn" id="kidsAudioGuideBtn" title="الاستماع للإرشاد الصوتي للواحة">
              <i class="fa-solid fa-volume-high"></i>
              <span>إرشاد صوتي للواحة</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Navigation Tabs Bar ─── */}
      <nav class="kids-main-nav-bar" aria-label="أقسام واحة الأطفال">
        <div class="kids-tabs-track" role="tablist">
          <button class="kids-nav-tab active" data-tab="letters" role="tab" aria-selected="true">
            <i class="fa-solid fa-spell-check"></i>
            <span>القراءة والحروف</span>
          </button>
          <button class="kids-nav-tab" data-tab="quran" role="tab" aria-selected="false">
            <i class="fa-solid fa-book-quran"></i>
            <span>تحفيظ القرآن (المنشاوي المعلم)</span>
          </button>
          <button class="kids-nav-tab" data-tab="numbers" role="tab" aria-selected="false">
            <i class="fa-solid fa-arrow-down-1-9"></i>
            <span>الأرقام والحساب</span>
          </button>
          <button class="kids-nav-tab" data-tab="duas" role="tab" aria-selected="false">
            <i class="fa-solid fa-hands-praying"></i>
            <span>الأدعية والآداب</span>
          </button>
          <button class="kids-nav-tab" data-tab="drawing" role="tab" aria-selected="false">
            <i class="fa-solid fa-palette"></i>
            <span>مرسم الصغار</span>
          </button>
          <button class="kids-nav-tab" data-tab="games" role="tab" aria-selected="false">
            <i class="fa-solid fa-brain"></i>
            <span>ألعاب الذكاء</span>
          </button>
          <button class="kids-nav-tab" data-tab="stars" role="tab" aria-selected="false">
            <i class="fa-solid fa-certificate"></i>
            <span>لوحة الشرف والشهادة</span>
          </button>
          <button class="kids-nav-tab" data-tab="parents" role="tab" aria-selected="false">
            <i class="fa-solid fa-user-shield"></i>
            <span>متابعة ولي الأمر</span>
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          TAB 1: LETTERS & READING
      ══════════════════════════════════════════════════════ */}
      <section class="kids-tab-view active" id="panel-letters">
        <header class="section-title-wrap">
          <span class="sub-kicker"><i class="fa-solid fa-book"></i> اللغة العربية لغة القرآن</span>
          <h2>تعلم القراءة <span>والحروف ومواضعها</span></h2>
          <p>استمع لصوت الحرف الفصيح، وتعرف على أشكاله في أول ووسط وآخر الكلمة بأمثلة حقيقية، واكتشف الحركات والكلمات الأولى.</p>
        </header>

        {/* Sub-modes bar */}
        <div class="sub-mode-row">
          <button class="sub-tab-chip active" data-sub="letters-grid"><i class="fa-solid fa-border-all"></i> شبكة الحروف الـ 28</button>
          <button class="sub-tab-chip" data-sub="letters-positions"><i class="fa-solid fa-arrows-split-up-and-left"></i> مواضع الحرف (أول/وسط/آخر)</button>
          <button class="sub-tab-chip" data-sub="letters-tashkeel"><i class="fa-solid fa-sliders"></i> الحركات والتشكيل</button>
          <button class="sub-tab-chip" data-sub="letters-words"><i class="fa-solid fa-layer-group"></i> الكلمات الأولى والمفردات</button>
          <button class="sub-tab-chip" data-sub="letters-sentences"><i class="fa-solid fa-microphone-lines"></i> الجمل الأولى والقراءة المسموعة</button>
          <button class="sub-tab-chip" data-sub="letters-tracer"><i class="fa-solid fa-pen-nib"></i> مرسم تتبع الحرف</button>
          <button class="sub-tab-chip" data-sub="letters-quiz"><i class="fa-solid fa-circle-question"></i> اختبار الأذن الذكية</button>
        </div>

        {/* Subview 1: Grid */}
        <div class="sub-panel active" id="subview-letters-grid">
          <div class="letters-cards-matrix">
            {ARABIC_LETTERS.map((item, idx) => (
              <div
                class="refined-letter-card"
                data-letter={item.letter}
                data-name={item.name}
                data-word={item.word}
                data-idx={idx}
                style={`--card-accent: ${item.color}`}
              >
                <span class="card-sound-pill" title="انقر للاستماع"><i class="fa-solid fa-volume-high"></i></span>
                <span class="letter-symbol">{item.letter}</span>
                <div class="letter-meta">
                  <span class="letter-name">{item.name}</span>
                  <span class="letter-sample-word"><i class={`fa-solid ${item.icon}`}></i> {item.word}</span>
                </div>
                <div class="positions-mini-preview">
                  <span title={`في أول الكلمة: ${item.initial.word}`}>{item.initial.char}</span>
                  <span title={`في وسط الكلمة: ${item.medial.word}`}>{item.medial.char}</span>
                  <span title={`في آخر الكلمة: ${item.final.word}`}>{item.final.char}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Letter Spotlight Drawer */}
          <div class="letter-dock-spotlight" id="letterSpotlight">
            <div class="dock-header">
              <div class="dock-letter-large" id="spotlightChar">أ</div>
              <div class="dock-text">
                <h3 id="spotlightTitle">حرف الألف — أ</h3>
                <p id="spotlightExample">مثال: <strong id="spotlightWord">أَسَد</strong></p>
              </div>
              <button type="button" class="dock-close-btn" id="closeSpotlightBtn" aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="dock-actions">
              <button type="button" class="dock-action-btn primary" id="playLetterSoundBtn"><i class="fa-solid fa-play"></i> نطق الحرف</button>
              <button type="button" class="dock-action-btn" id="playWordSoundBtn"><i class="fa-solid fa-volume-high"></i> نطق الكلمة</button>
              <button type="button" class="dock-action-btn gold" id="goToPositionsBtn"><i class="fa-solid fa-arrows-split-up-and-left"></i> مواضع الحرف</button>
              <button type="button" class="dock-action-btn emerald" id="goToTraceBtn"><i class="fa-solid fa-pen-nib"></i> تتبع بالرسم</button>
            </div>
          </div>
        </div>

        {/* Subview 2: Letter Positions with Real Words */}
        <div class="sub-panel" id="subview-letters-positions">
          <div class="positions-explorer-box">
            <div class="positions-selector-row">
              <label for="posLetterSelect">اختر الحرف لاستكشاف مواضعه في الكلمات:</label>
              <select id="posLetterSelect" class="clean-select">
                {ARABIC_LETTERS.map(item => (
                  <option value={item.letter}>حرف {item.name} ({item.letter})</option>
                ))}
              </select>
            </div>

            <div class="positions-cards-trio" id="positionsCardsTrio">
              {/* Populated dynamically */}
            </div>
          </div>
        </div>

        {/* Subview 3: Tashkeel */}
        <div class="sub-panel" id="subview-letters-tashkeel">
          <div class="tashkeel-refined-panel">
            <div class="tashkeel-cards-grid">
              <div class="tashkeel-card-box" data-tashkeel="fatha">
                <div class="tashkeel-tag">الفَتْحَة ( َ )</div>
                <div class="tashkeel-symbol-big">بَ</div>
                <p class="tashkeel-rule">فتح الفم بالأعلى: مثل <strong>بَيْت</strong>، <strong>بَقَرَة</strong></p>
                <button type="button" class="listen-tashkeel-btn" data-sound="بَ، فَتْحَة، بَ"><i class="fa-solid fa-volume-high"></i> استمع للنطق</button>
              </div>

              <div class="tashkeel-card-box" data-tashkeel="damma">
                <div class="tashkeel-tag">الضَّمَّة ( ُ )</div>
                <div class="tashkeel-symbol-big">بُ</div>
                <p class="tashkeel-rule">ضم الشفتين للأمام: مثل <strong>بُرْتُقَال</strong>، <strong>بُرْج</strong></p>
                <button type="button" class="listen-tashkeel-btn" data-sound="بُ، ضَمَّة، بُ"><i class="fa-solid fa-volume-high"></i> استمع للنطق</button>
              </div>

              <div class="tashkeel-card-box" data-tashkeel="kasra">
                <div class="tashkeel-tag">الكَسْرَة ( ِ )</div>
                <div class="tashkeel-symbol-big">بِ</div>
                <p class="tashkeel-rule">كسر الصوت للأسفل: مثل <strong>بِنْت</strong>، <strong>بِلَاد</strong></p>
                <button type="button" class="listen-tashkeel-btn" data-sound="بِ، كَسْرَة، بِ"><i class="fa-solid fa-volume-high"></i> استمع للنطق</button>
              </div>

              <div class="tashkeel-card-box" data-tashkeel="sukun">
                <div class="tashkeel-tag">السُّكُون ( ْ )</div>
                <div class="tashkeel-symbol-big">أَبْ</div>
                <p class="tashkeel-rule">الوقف والهدوء فوق الحرف: مثل <strong>أَبْ</strong>، <strong>حَبْل</strong></p>
                <button type="button" class="listen-tashkeel-btn" data-sound="أَبْ، سُكُون"><i class="fa-solid fa-volume-high"></i> استمع للنطق</button>
              </div>
            </div>

            <div class="tashkeel-try-custom">
              <h4>جرّب تشكيل أي حرف بالصوت الحي:</h4>
              <div class="tashkeel-interactive-controls">
                <select id="tashkeelCustomSelect" class="clean-select">
                  {ARABIC_LETTERS.map(item => (
                    <option value={item.letter}>حرف {item.name} ({item.letter})</option>
                  ))}
                </select>
                <div class="vocal-buttons-strip" id="vocalButtonsStrip">
                  {/* Generated by JS */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subview 4: First Words */}
        <div class="sub-panel" id="subview-letters-words">
          <div class="words-catalog-section">
            <div class="category-filter-chips" id="wordsCategoryFilters">
              {WORD_CATEGORIES.map((cat, i) => (
                <button class={`cat-chip ${i === 0 ? 'active' : ''}`} data-cat={cat.id}>
                  <i class={`fa-solid ${cat.icon}`}></i> {cat.name}
                </button>
              ))}
            </div>

            <div class="words-cards-grid" id="wordsCardsGrid">
              {/* Dynamic word cards */}
            </div>
          </div>
        </div>

        {/* Subview 5: First Sentences with Karaoke */}
        <div class="sub-panel" id="subview-letters-sentences">
          <div class="sentences-karaoke-panel">
            <div class="karaoke-card-main">
              <span class="karaoke-badge"><i class="fa-solid fa-headphones"></i> القراءة المسموعة كلمة بكلمة</span>
              <div class="sentence-text-display" id="sentenceWordsContainer">
                {/* Words highlighted dynamically */}
              </div>
              <p class="sentence-meaning-sub" id="sentenceMeaningText"></p>
              <div class="karaoke-actions">
                <button type="button" class="primary-btn" id="btnPlaySentenceAudio"><i class="fa-solid fa-play"></i> استمع للجملة كاملة</button>
                <button type="button" class="outline-btn" id="btnNextSentence">الجملة التالية <i class="fa-solid fa-arrow-left"></i></button>
              </div>
            </div>
          </div>
        </div>

        {/* Subview 6: Letter Tracer */}
        <div class="sub-panel" id="subview-letters-tracer">
          <div class="tracer-layout-clean">
            <div class="tracer-controls-card">
              <h3>مرسم تتبع الحروف بالقلم ✍️</h3>
              <p>اختر الحرف، ثم تتبعه بدقة بيدك أو الماوس ليصبح خطك متقناً وجميلاً.</p>

              <div class="tracer-selector-chips" id="tracerLetterChips">
                {ARABIC_LETTERS.map((item, idx) => (
                  <button type="button" class={`tracer-chip ${idx === 0 ? 'active' : ''}`} data-letter={item.letter}>{item.letter}</button>
                ))}
              </div>

              <div class="tracer-action-buttons">
                <button type="button" class="outline-btn" id="clearTracerBtn"><i class="fa-solid fa-rotate-left"></i> مسح وإعادة</button>
                <button type="button" class="primary-btn" id="evaluateTracerBtn"><i class="fa-solid fa-check"></i> قيّم كتابتي</button>
              </div>

              <div class="tracer-eval-feedback" id="tracerScoreBox" style="display:none;">
                <div class="stars-row">⭐⭐⭐</div>
                <p id="tracerFeedback">أحسنت يا بطل! خطك جميل ومتقن!</p>
              </div>
            </div>

            <div class="tracer-canvas-box">
              <canvas id="letterTraceCanvas" width="500" height="500"></canvas>
            </div>
          </div>
        </div>

        {/* Subview 7: Listen & Quiz */}
        <div class="sub-panel" id="subview-letters-quiz">
          <div class="clean-quiz-wrapper">
            <div class="quiz-top-bar">
              <span class="quiz-tag"><i class="fa-solid fa-ear-listen"></i> استمع جيداً واختر الحرف</span>
              <span class="quiz-score-badge">النقاط: <strong id="quizScoreVal">0</strong></span>
            </div>

            <div class="quiz-interactive-card">
              <button type="button" class="primary-btn big-listen-btn" id="playQuizAudioBtn">
                <i class="fa-solid fa-volume-high"></i> انقر للاستماع لصوت الحرف المطلوب
              </button>

              <div class="quiz-choices-matrix" id="quizOptionsGrid">
                {/* 4 choices populated by JS */}
              </div>

              <div class="quiz-feedback-box" id="quizResultBanner" style="display:none;"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TAB 2: QURAN MEMORIZATION (AL-MINSHAWI TEACHER)
      ══════════════════════════════════════════════════════ */}
      <section class="kids-tab-view" id="panel-quran">
        <header class="section-title-wrap">
          <span class="sub-kicker emerald"><i class="fa-solid fa-book-quran"></i> المصحف المعلم للأشبال</span>
          <h2>تحفيظ القرآن الكريم <span>بصوت الشيخ المنشاوي وترديد الأطفال</span></h2>
          <p>تلاوة مباركة بصوت فضيلة الشيخ <strong>محمد صديق المنشاوي</strong> مع جوقة من الأطفال يرددون خلفه آية آية، لترسيخ مخارج الحروف وأحكام التجويد في صدر الطفل الصغير.</p>
        </header>

        {/* Prominent Minshawi Recitation Banner */}
        <div class="minshawi-spotlight-banner">
          <div class="sheikh-avatar-badge">
            <i class="fa-solid fa-microphone-lines"></i>
          </div>
          <div class="sheikh-info">
            <h3>المصحف المعلم • الشيخ محمد صديق المنشاوي (مع ترديد الأطفال)</h3>
            <p>استمع لترديد الأطفال بعد الشيخ، وكرر الآية لتثبيتها، وجرّب وضع الإخفاء التدريجي للتسميع الذاتي.</p>
          </div>
          <div class="sheikh-mode-switches">
            <button type="button" class="mode-toggle-chip active" id="btnModeAyahByAyah">
              <i class="fa-solid fa-repeat"></i> آية بآية مع الترديد
            </button>
            <button type="button" class="mode-toggle-chip" id="btnModeFullSurah">
              <i class="fa-solid fa-play"></i> السورة كاملة متصلة
            </button>
          </div>
        </div>

        {/* Quran Layout */}
        <div class="quran-studio-grid">
          {/* Surahs Sidebar */}
          <aside class="surahs-selection-panel">
            <div class="surah-search-input-wrap">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="kidsSurahSearch" placeholder="ابحث باسم السورة (الفاتحة، الناس...)" />
            </div>

            <div class="surahs-scroll-container" id="kidsSurahsList">
              {JUZ_AMMA_SURAHS.map((s, i) => (
                <div class={`surah-item-card ${i === 0 ? 'selected' : ''}`} data-surahid={s.id} data-surahname={s.name} data-verses={s.count}>
                  <span class="surah-idx-pill">{s.id}</span>
                  <div class="surah-desc">
                    <strong>سورة {s.name}</strong>
                    <small>{s.count} آيات • {s.type}</small>
                  </div>
                  <span class="memorized-badge" id={`memBadge_${s.id}`}>لم تبدأ</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Memorization Arena */}
          <main class="memorization-workspace">
            {/* Arena Header */}
            <div class="workspace-header">
              <div class="surah-heading-meta">
                <h3 id="currentSurahName">سورة الفاتحة</h3>
                <span id="currentSurahMeta">٧ آيات • مكية</span>
              </div>

              <div class="workspace-action-tools">
                <button type="button" class="tool-pill" id="btnToggleMaskMode" title="إخفاء بعض الكلمات لاختبار التسميع">
                  <i class="fa-solid fa-eye-slash"></i> <span>وضع الإخفاء الذكي</span>
                </button>

                <div class="repeat-select-wrap">
                  <label for="verseRepeatSelect">تكرار الآية:</label>
                  <select id="verseRepeatSelect" class="clean-select compact">
                    <option value="1">مرة واحدة</option>
                    <option value="2">مرتان</option>
                    <option value="3" selected>٣ مرات (تثبيت)</option>
                    <option value="5">٥ مرات (إتقان)</option>
                    <option value="10">١٠ مرات (حفظ راسخ)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bismillah */}
            <div class="bismillah-calligraphy" id="bismillahBanner">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>

            {/* Verses List */}
            <div class="interactive-verses-board" id="versesInteractiveList">
              <div class="verses-loading-state">
                <i class="fa-solid fa-spinner fa-spin"></i> جاري تحميل آيات السورة المباركة...
              </div>
            </div>

            {/* Prominent Al-Minshawi Audio Player Bar */}
            <div class="minshawi-player-dock" id="minshawiPlayerDock">
              <div class="player-left-meta">
                <span class="reciter-tag"><i class="fa-solid fa-user"></i> فضيلة الشيخ المنشاوي مع الأطفال</span>
                <strong id="currentPlayingVerseLabel">الآية ١ من سورة الفاتحة</strong>
              </div>

              <div class="player-center-controls">
                <button type="button" class="ctrl-btn" id="btnPrevVerse" title="الآية السابقة"><i class="fa-solid fa-forward-step"></i></button>
                <button type="button" class="ctrl-btn main-play" id="btnPlayPauseVerse" title="تشغيل / إيقاف"><i class="fa-solid fa-play"></i></button>
                <button type="button" class="ctrl-btn" id="btnNextVerse" title="الآية التالية"><i class="fa-solid fa-backward-step"></i></button>
              </div>

              <div class="player-right-actions">
                <span class="repeat-stat" id="repeatCounterIndicator">التكرار: ١ من ٣</span>
                <button type="button" class="save-memorized-action" id="btnMarkSurahDone">
                  <i class="fa-solid fa-check-double"></i> تم حفظ السورة كاملة
                </button>
              </div>
            </div>
          </main>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TAB 3: NUMBERS & MATH
      ══════════════════════════════════════════════════════ */}
      <section class="kids-tab-view" id="panel-numbers">
        <header class="section-title-wrap">
          <span class="sub-kicker gold"><i class="fa-solid fa-arrow-down-1-9"></i> الحساب والرياضيات الذكية</span>
          <h2>تعلم الأرقام <span>والعمليات البسيطة</span></h2>
          <p>الأرقام العربية والمشرقية من 0 إلى 20 مع النطق الصحيح، ومقارنة الأعداد، ومسائل الجمع والطرح الميسرة.</p>
        </header>

        <div class="sub-mode-row">
          <button class="sub-tab-chip active" data-sub="num-grid"><i class="fa-solid fa-1"></i> الأرقام (0 - 20)</button>
          <button class="sub-tab-chip" data-sub="num-compare"><i class="fa-solid fa-scale-balanced"></i> مقارنة الأعداد (أكبر / أصغر / يساوي)</button>
          <button class="sub-tab-chip" data-sub="num-math"><i class="fa-solid fa-calculator"></i> الجمع والطرح المصور</button>
          <button class="sub-tab-chip" data-sub="num-sequence"><i class="fa-solid fa-arrow-up-right-dots"></i> أكمل الرقم الناقص</button>
        </div>

        {/* Subview 1: Numbers Grid */}
        <div class="sub-panel active" id="subview-num-grid">
          <div class="numbers-matrix" id="numbersGridContainer">
            {/* Populated by JS */}
          </div>
        </div>

        {/* Subview 2: Number Comparison */}
        <div class="sub-panel" id="subview-num-compare">
          <div class="comparison-exercise-card">
            <span class="exercise-badge">أي العددين أكبر أو أصغر؟</span>
            <div class="comparison-equation-row">
              <div class="compare-val-box" id="compValA">7</div>
              <div class="compare-operator-box" id="compOperatorBox">؟</div>
              <div class="compare-val-box" id="compValB">4</div>
            </div>
            <p class="compare-prompt">اختر الرمز الصحيح:</p>
            <div class="compare-buttons-row">
              <button type="button" class="comp-btn" data-op=">">&gt; (أكبر من)</button>
              <button type="button" class="comp-btn" data-op="=">= (يساوي)</button>
              <button type="button" class="comp-btn" data-op="<">&lt; (أصغر من)</button>
            </div>
            <div class="exercise-feedback" id="compFeedback"></div>
          </div>
        </div>

        {/* Subview 3: Visual Math */}
        <div class="sub-panel" id="subview-num-math">
          <div class="math-calculator-card">
            <div class="math-mode-tabs">
              <button type="button" class="math-pill active" id="btnModeAdd"><i class="fa-solid fa-plus"></i> عملية الجمع</button>
              <button type="button" class="math-pill" id="btnModeSub"><i class="fa-solid fa-minus"></i> عملية الطرح</button>
            </div>

            <div class="math-equation-display" id="mathVisualEquation">
              <div class="math-operand-box" id="mathGroupA">
                <span class="math-dot-units"></span>
                <strong class="math-val">3</strong>
              </div>
              <span class="math-sign" id="mathOperator">+</span>
              <div class="math-operand-box" id="mathGroupB">
                <span class="math-dot-units"></span>
                <strong class="math-val">2</strong>
              </div>
              <span class="math-sign">=</span>
              <div class="math-result-box">؟</div>
            </div>

            <div class="math-choices-matrix" id="mathOptionsRow">
              {/* Choices */}
            </div>
            <div class="exercise-feedback" id="mathFeedback"></div>
          </div>
        </div>

        {/* Subview 4: Missing Number Sequence */}
        <div class="sub-panel" id="subview-num-sequence">
          <div class="sequence-exercise-card">
            <span class="exercise-badge">أكمل تسلسل الأرقام بالترتيب:</span>
            <div class="sequence-numbers-row" id="sequenceRow">
              {/* Populated by JS */}
            </div>
            <div class="sequence-choices-row" id="sequenceChoicesRow">
              {/* Choices */}
            </div>
            <div class="exercise-feedback" id="sequenceFeedback"></div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TAB 4: DUAS & ISLAMIC MANNERS
      ══════════════════════════════════════════════════════ */}
      <section class="kids-tab-view" id="panel-duas">
        <header class="section-title-wrap">
          <span class="sub-kicker purple"><i class="fa-solid fa-hands-praying"></i> حصن المسلم الصغير</span>
          <h2>أدعية وآداب <span>الطفل المسلم (20 دعاء)</span></h2>
          <p>مجموعة مباركة من الأدعية المأثورة الصحيحة مقسمة حسب أوقات اليوم، مع النطق الصوتي وتوضيح الفضل والمعنى.</p>
        </header>

        <div class="duas-collection-grid">
          {KIDS_DUAS_LIST.map(dua => (
            <article class="refined-dua-card">
              <div class="dua-header-line">
                <span class="dua-category-chip"><i class={`fa-solid ${dua.icon}`}></i> {dua.category}</span>
                <span class="dua-number-chip">#{dua.id}</span>
              </div>
              <h3 class="dua-title">{dua.title}</h3>
              <blockquote class="dua-content">"{dua.text}"</blockquote>
              <div class="dua-footer-actions">
                <button type="button" class="dua-play-btn" data-text={dua.text}>
                  <i class="fa-solid fa-volume-high"></i> استمع للدعاء
                </button>
                <button type="button" class="dua-copy-icon-btn" data-copy={dua.text} title="نسخ نص الدعاء">
                  <i class="fa-solid fa-copy"></i>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Ethical Choices Quiz */}
        <div class="ethical-quiz-card">
          <div class="ethical-quiz-header">
            <span class="quiz-badge-pill"><i class="fa-solid fa-shield-heart"></i> مسابقة السلوك القويم</span>
            <h3>ما هو التصرف الصحيح في هذا الموقف؟</h3>
          </div>
          <p class="ethical-scenario" id="mannersQuestion">إذا أردت دخول غرفة والديك أو معلمك، ما هو الأدب الإسلامي المطلوب؟</p>
          <div class="ethical-options-list" id="mannersChoices">
            <button type="button" class="manner-option-btn" data-correct="true">أستأذن بالدق الخفيف أو الاستئذان ثلاثاً قبل الدخول</button>
            <button type="button" class="manner-option-btn" data-correct="false">أفتح الباب وأدخل فوراً دون استئذان</button>
            <button type="button" class="manner-option-btn" data-correct="false">أنادي بصوت مرتفع جداً حتى يسمعوني</button>
          </div>
          <div class="exercise-feedback" id="mannersFeedback"></div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TAB 5: DRAWING & COLORING STUDIO
      ══════════════════════════════════════════════════════ */}
      <section class="kids-tab-view" id="panel-drawing">
        <header class="section-title-wrap">
          <span class="sub-kicker red"><i class="fa-solid fa-palette"></i> مرسم الصغار</span>
          <h2>لوحة الرسم <span>والتلوين الإبداعي</span></h2>
          <p>لوحة رسم رقمية راقية تتيح للطفل التعبير بالرسم الحر، أو تلوين النماذج الإسلامية والطبيعية، وحفظ لوحاته وطباعتها.</p>
        </header>

        <div class="sub-mode-row">
          <button class="sub-tab-chip active" data-sub="draw-free"><i class="fa-solid fa-paintbrush"></i> لوحة الرسم الحر</button>
          <button class="sub-tab-chip" data-sub="draw-coloring"><i class="fa-solid fa-fill-drip"></i> دفتر التلوين الجاهز</button>
          <button class="sub-tab-chip" data-sub="draw-lessons"><i class="fa-solid fa-chalkboard-user"></i> دروس ارسم معي خطوة بخطوة</button>
          <button class="sub-tab-chip" data-sub="draw-gallery"><i class="fa-solid fa-images"></i> معرض رسوماتي (<span id="galleryCountLabel">0</span>)</button>
        </div>

        {/* Free Drawing Studio */}
        <div class="sub-panel active" id="subview-draw-free">
          <div class="canvas-studio-wrap">
            {/* Toolbar */}
            <div class="refined-draw-toolbar">
              <div class="tool-section">
                <span class="tool-label">الأداة:</span>
                <button type="button" class="tool-icon-btn active" id="toolPencil" title="فرشاة رسم"><i class="fa-solid fa-paintbrush"></i></button>
                <button type="button" class="tool-icon-btn" id="toolEraser" title="ممحاة"><i class="fa-solid fa-eraser"></i></button>
              </div>

              <div class="tool-section">
                <span class="tool-label">السُمك:</span>
                <input type="range" id="brushSizeRange" min="2" max="36" value="8" />
                <span class="brush-size-tag" id="brushSizeVal">8px</span>
              </div>

              <div class="tool-section color-section">
                <span class="tool-label">اللون:</span>
                <div class="palette-swatches-strip" id="colorsPalette">
                  {['#0c4a3f', '#168a70', '#d97706', '#2563eb', '#dc2626', '#7c3aed', '#0284c7', '#17342f', '#ffffff'].map((hex, i) => (
                    <button type="button" class={`palette-swatch ${i === 0 ? 'active' : ''}`} data-color={hex} style={`background: ${hex}`}></button>
                  ))}
                  <input type="color" id="customColorPicker" value="#0c4a3f" title="منتقي ألوان مخصص" />
                </div>
              </div>

              <div class="tool-section actions-section">
                <button type="button" class="draw-action-btn" id="btnUndoDraw" title="تراجع"><i class="fa-solid fa-rotate-left"></i> تراجع</button>
                <button type="button" class="draw-action-btn" id="btnClearDraw" title="مسح اللوحة"><i class="fa-solid fa-trash-can"></i> مسح</button>
                <button type="button" class="draw-action-btn save" id="btnSaveDraw"><i class="fa-solid fa-floppy-disk"></i> حفظ بالمعرض</button>
                <button type="button" class="draw-action-btn download" id="btnDownloadDraw"><i class="fa-solid fa-download"></i> تنزيل الصورة</button>
              </div>
            </div>

            {/* Canvas */}
            <div class="main-canvas-frame">
              <canvas id="kidsDrawingCanvas" width="900" height="520"></canvas>
            </div>
          </div>
        </div>

        {/* Ready to Color SVGs */}
        <div class="sub-panel" id="subview-draw-coloring">
          <div class="coloring-studio-card">
            <div class="coloring-templates-strip" id="coloringTemplatesBar">
              <button class="tpl-btn active" data-shape="mosque"><i class="fa-solid fa-mosque"></i> مسجد مبارك</button>
              <button class="tpl-btn" data-shape="crescent"><i class="fa-solid fa-moon"></i> هلال ونجمة</button>
              <button class="tpl-btn" data-shape="fish"><i class="fa-solid fa-fish"></i> سمكة في البحر</button>
              <button class="tpl-btn" data-shape="flower"><i class="fa-solid fa-spa"></i> زهرة جميلة</button>
              <button class="tpl-btn" data-shape="tree"><i class="fa-solid fa-tree"></i> شجرة خضراء</button>
            </div>

            <div class="coloring-work-arena">
              <div class="coloring-palette-strip" id="coloringPalette">
                {['#0c4a3f', '#168a70', '#d97706', '#2563eb', '#dc2626', '#7c3aed', '#0284c7', '#059669', '#ea580c', '#475569'].map((c, i) => (
                  <button type="button" class={`color-swatch-bubble ${i === 0 ? 'active' : ''}`} data-color={c} style={`background:${c}`}></button>
                ))}
              </div>

              <div class="coloring-svg-viewport" id="coloringSvgContainer">
                {/* SVG dynamically loaded */}
              </div>

              <div class="coloring-bottom-actions">
                <button type="button" class="outline-btn" id="btnResetColoring"><i class="fa-solid fa-rotate-left"></i> مسح الألوان</button>
                <button type="button" class="primary-btn" id="btnSaveColoring"><i class="fa-solid fa-check"></i> اعتماد التلوينة وإضافتها للمعرض</button>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Drawing Lessons */}
        <div class="sub-panel" id="subview-draw-lessons">
          <div class="drawing-lessons-grid" id="drawingLessonsGrid">
            {/* Populated by JS */}
          </div>
        </div>

        {/* Saved Gallery */}
        <div class="sub-panel" id="subview-draw-gallery">
          <div class="saved-gallery-container">
            <div class="gallery-empty-banner" id="galleryEmptyState">
              <i class="fa-solid fa-palette empty-icon"></i>
              <h3>معرض رسوماتك في انتظار لوحتك الأولى!</h3>
              <p>قم برسم أي لوحة في قسم الرسم أو لوّن شكلاً جاهزاً واضغط على "حفظ بالمعرض" وستجدها هنا دائماً.</p>
            </div>
            <div class="gallery-tiles-grid" id="galleryCardsGrid">
              {/* Dynamic gallery cards */}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TAB 6: INTELLECTUAL GAMES
      ══════════════════════════════════════════════════════ */}
      <section class="kids-tab-view" id="panel-games">
        <header class="section-title-wrap">
          <span class="sub-kicker indigo"><i class="fa-solid fa-brain"></i> الذكاء وقوة الملاحظة</span>
          <h2>ألعاب تعليمية <span>تنمي التفكير</span></h2>
          <p>ألعاب هادفة وممتعة تقوي الذاكرة وتثري الحصيلة اللغوية العربية للطفل بأسلوب تنافسي راقٍ.</p>
        </header>

        <div class="sub-mode-row">
          <button class="sub-tab-chip active" data-sub="game-memory"><i class="fa-solid fa-clone"></i> لعبة الذاكرة (مطابقة الحروف)</button>
          <button class="sub-tab-chip" data-sub="game-scramble"><i class="fa-solid fa-puzzle-piece"></i> ترتيب حروف الكلمات</button>
          <button class="sub-tab-chip" data-sub="game-missing"><i class="fa-solid fa-magnifying-glass"></i> اكتشف الحرف الناقص</button>
        </div>

        {/* Game 1: Memory */}
        <div class="sub-panel active" id="subview-game-memory">
          <div class="memory-game-panel">
            <div class="game-stats-header">
              <span>المحاولات: <strong id="memFlipsCount">0</strong></span>
              <span>الأزواج المتطابقة: <strong id="memMatchesCount">0 / 6</strong></span>
              <button type="button" class="outline-btn compact" id="btnRestartMemory"><i class="fa-solid fa-rotate"></i> جولة جديدة</button>
            </div>
            <div class="memory-cards-grid" id="memoryCardsBoard">
              {/* 12 cards */}
            </div>
          </div>
        </div>

        {/* Game 2: Word Scramble */}
        <div class="sub-panel" id="subview-game-scramble">
          <div class="scramble-game-panel">
            <div class="scramble-cue-box">
              <span class="scramble-icon-badge" id="scrambleIconBadge"><i class="fa-solid fa-book"></i></span>
              <h3 id="scramblePrompt">رتّب حروف هذه الكلمة بشكل صحيح:</h3>
            </div>

            <div class="scramble-slots-line" id="scrambleSlotsRow">
              {/* Slots */}
            </div>

            <div class="scramble-tiles-line" id="scrambleTilesRow">
              {/* Tiles */}
            </div>

            <div class="scramble-buttons-row">
              <button type="button" class="primary-btn" id="btnCheckScramble"><i class="fa-solid fa-check"></i> تحقق من الترتيب</button>
              <button type="button" class="outline-btn" id="btnNextScramble">الكلمة التالية <i class="fa-solid fa-arrow-left"></i></button>
            </div>
            <div class="exercise-feedback" id="scrambleFeedback"></div>
          </div>
        </div>

        {/* Game 3: Missing Letter */}
        <div class="sub-panel" id="subview-game-missing">
          <div class="missing-letter-panel">
            <div class="missing-cue-header">
              <span class="missing-icon-badge" id="missingIconBadge"><i class="fa-solid fa-apple-whole"></i></span>
              <h3>ما هو الحرف المناسب لإكمال الكلمة؟</h3>
            </div>

            <div class="missing-word-representation" id="missingWordDisplay">
              {/* Missing word */}
            </div>

            <div class="missing-choices-strip" id="missingChoicesRow">
              {/* 4 choices */}
            </div>
            <div class="exercise-feedback" id="missingFeedback"></div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TAB 7: HONOR BOARD & CERTIFICATE
      ══════════════════════════════════════════════════════ */}
      <section class="kids-tab-view" id="panel-stars">
        <header class="section-title-wrap">
          <span class="sub-kicker gold"><i class="fa-solid fa-award"></i> الشرف والإنجاز</span>
          <h2>لوحة التميز <span>والشهادة المعتمدة</span></h2>
          <p>تكريماً لجهود البطل الصغير في حفظ آيات كتاب الله وتعلم لغة القرآن والإبداع في مرسم الواحة.</p>
        </header>

        <div class="honor-board-layout">
          <div class="honor-summary-card">
            <div class="honor-crown"><i class="fa-solid fa-crown"></i></div>
            <h3>شهادة تقدير وإنجاز معتمدة</h3>
            <p>يمكنك استعراض وطباعة شهادة شرف رسمية باسم طفلك معتمدة من المؤسسة تقديراً لما أتمه وحفظه.</p>

            <div class="honor-points-display">
              <span class="points-num" id="certStarsTotal">0</span>
              <span class="points-label">نقطة إنجاز تراكمية</span>
            </div>

            <button type="button" class="primary-btn cert-open-btn" id="btnOpenCertModal">
              <i class="fa-solid fa-file-invoice"></i> عرض وطباعة شهادة التفوق الرسمية
            </button>
          </div>

          <div class="honor-trophies-grid" id="badgesTrophiesGrid">
            <div class="trophy-tile" data-badge="letters_10">
              <div class="trophy-icon-wrap"><i class="fa-solid fa-book-bookmark"></i></div>
              <h4>قارئ مبتدئ</h4>
              <p>إتقان أول 10 حروف عربية</p>
              <span class="badge-status-pill" id="badge_letters_10">قيد الإنجاز</span>
            </div>

            <div class="trophy-tile" data-badge="letters_all">
              <div class="trophy-icon-wrap"><i class="fa-solid fa-medal"></i></div>
              <h4>بطل الحروف العربية</h4>
              <p>إتقان الـ 28 حرفاً كاملاً</p>
              <span class="badge-status-pill" id="badge_letters_all">قيد الإنجاز</span>
            </div>

            <div class="trophy-tile" data-badge="quran_fatiha">
              <div class="trophy-icon-wrap"><i class="fa-solid fa-book-quran"></i></div>
              <h4>حافظ الفاتحة</h4>
              <p>حفظ سورة الفاتحة المباركة</p>
              <span class="badge-status-pill" id="badge_quran_fatiha">قيد الإنجاز</span>
            </div>

            <div class="trophy-tile" data-badge="quran_5">
              <div class="trophy-icon-wrap"><i class="fa-solid fa-trophy"></i></div>
              <h4>حافظ الصغار (5 سور)</h4>
              <p>إتمام حفظ 5 سور من جزء عم</p>
              <span class="badge-status-pill" id="badge_quran_5">قيد الإنجاز</span>
            </div>

            <div class="trophy-tile" data-badge="draw_first">
              <div class="trophy-icon-wrap"><i class="fa-solid fa-palette"></i></div>
              <h4>الفنان الصغير</h4>
              <p>حفظ أول لوحة في المعرض</p>
              <span class="badge-status-pill" id="badge_draw_first">قيد الإنجاز</span>
            </div>

            <div class="trophy-tile" data-badge="game_champ">
              <div class="trophy-icon-wrap"><i class="fa-solid fa-brain"></i></div>
              <h4>العبقري الصغير</h4>
              <p>الفوز في 5 جولات ذكاء</p>
              <span class="badge-status-pill" id="badge_game_champ">قيد الإنجاز</span>
            </div>
          </div>
        </div>

        {/* Printable Official Certificate Modal */}
        <div class="official-cert-modal" id="kidsCertModal" style="display:none;">
          <div class="cert-backdrop" id="closeCertModalBg"></div>
          <div class="cert-dialog-box">
            <button class="cert-dialog-close" id="closeCertModalBtn" aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></button>

            <div class="cert-print-document" id="certPrintArea">
              <div class="cert-outer-border">
                <div class="cert-inner-border">
                  <header class="cert-inst-header">
                    <img src="/static/foundation-logo.png" alt="شعار المؤسسة" class="cert-emblem" />
                    <h2>مؤسسة الدكتور عمر هشام الخيرية</h2>
                    <p>المشهرة برقم 3115 لسنة 2026 — واحة التعليم القرآني والتربوي</p>
                  </header>

                  <div class="cert-ribbon-title">
                    <span>شَهَادَةُ تَقْدِيرٍ وَتَفَوُّقٍ</span>
                  </div>

                  <p class="cert-intro-text">تَشْهَدُ إِدَارَةُ الْمُؤَسَّسَةِ بِأَنَّ الْبَطَلَ الْمُتَمَيِّزَ / الْبَطَلَةَ الْمُتَمَيِّزَةَ:</p>

                  <div class="cert-recipient-field">
                    <input type="text" id="certChildNameInput" placeholder="اكتب اسم الطالب هنا" value="أحمد محمود" />
                  </div>

                  <p class="cert-body-statement">
                    قَدْ أَتَمَّ بِنَجَاحٍ وَإِتْقَانٍ حِفْظَ قِصَارِ السُّوَرِ بِمُصْحَفِ الْمِنْشَاوِي الْمُعَلِّمِ، وَأَتْقَنَ مَبَادِئَ الْقِرَاءَةِ وَالْأَدْعِيَةِ الْمَأْثُورَةِ فِي وَاحَةِ أَطْفَالِ الْمُؤَسَّسَةِ، سَائِلِينَ اللَّهَ لَهُ مَزِيداً مِنَ التَّوْفِيقِ وَالسَّدَادِ.
                  </p>

                  <footer class="cert-signatures-row">
                    <div class="sig-col">
                      <small>الرصيد المنجز:</small>
                      <strong id="certStarsPrintVal">120 نقطة تميز</strong>
                    </div>
                    <div class="sig-col">
                      <small>تاريخ الإصدار:</small>
                      <strong id="certDatePrintVal">سبتمبر 2026</strong>
                    </div>
                    <div class="sig-col seal-col">
                      <span class="official-foundation-seal">خاتم الاعتماد الرسمي<br />مؤسسة د. عمر هشام</span>
                    </div>
                  </footer>
                </div>
              </div>
            </div>

            <div class="cert-dialog-actions">
              <button type="button" class="primary-btn" id="btnPrintCert"><i class="fa-solid fa-print"></i> طباعة الشهادة / حفظ PDF</button>
              <button type="button" class="outline-btn" id="btnCancelCert">إغلاق</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TAB 8: PARENT'S PROGRESS & PRIVACY
      ══════════════════════════════════════════════════════ */}
      <section class="kids-tab-view" id="panel-parents">
        <header class="section-title-wrap">
          <span class="sub-kicker slate"><i class="fa-solid fa-user-shield"></i> متابعة ولي الأمر</span>
          <h2>سجل أداء وتقدم <span>الطفل</span></h2>
          <p>لوحة تحكم خاصة بولي الأمر للاطلاع على حصيلة تعلم الطفل ومتابعة تقدمه في الحفظ والقراءة دون أي مشاركة لبياناته مع أطراف خارجية.</p>
        </header>

        <div class="parents-kpi-row">
          <div class="kpi-glass-card">
            <span class="kpi-icon-square gold"><i class="fa-solid fa-award"></i></span>
            <div class="kpi-details">
              <small>إجمالي نقاط الإنجاز</small>
              <strong id="parentTotalStars">0</strong>
            </div>
          </div>

          <div class="kpi-glass-card">
            <span class="kpi-icon-square emerald"><i class="fa-solid fa-spell-check"></i></span>
            <div class="kpi-details">
              <small>الحروف المكتشفة والمتقنة</small>
              <strong id="parentLettersProgress">0 / 28</strong>
            </div>
          </div>

          <div class="kpi-glass-card">
            <span class="kpi-icon-square blue"><i class="fa-solid fa-book-quran"></i></span>
            <div class="kpi-details">
              <small>السور المحفوظة من جزء عم</small>
              <strong id="parentSurahsProgress">0 / 37</strong>
            </div>
          </div>

          <div class="kpi-glass-card">
            <span class="kpi-icon-square purple"><i class="fa-solid fa-palette"></i></span>
            <div class="kpi-details">
              <small>الرسومات المحفوظة بالمعرض</small>
              <strong id="parentDrawingsCount">0</strong>
            </div>
          </div>
        </div>

        <div class="parents-guidance-card">
          <h3><i class="fa-solid fa-lightbulb"></i> إرشادات وتوصيات تربوية لولي الأمر:</h3>
          <ul class="guidance-points-list">
            <li><strong>تثبيت الحفظ بالاستماع المتكرر:</strong> دع تلاوة الشيخ المنشاوي المعلم تعمل في مسكنك أوقات الإفطار أو الاسترخاء، فالأذن تلتقط التجويد قبل اللسان.</li>
            <li><strong>المكافأة المعنوية:</strong> عند إتمام الطفل لسورة من جزء عم، افتح معه "لوحة الشرف والشهادة" واطبع له شهادة التقدير وعلقها في غرفته كحافز معنوي كبير.</li>
            <li><strong>التدرج الصبور:</strong> يكفي الطفل آية واحدة أو آيتان يومياً مع التكرار الخماسي؛ فالقليل الدائم خير من الكثير المنقطع.</li>
          </ul>

          <div class="parent-reset-bar">
            <button type="button" class="reset-progress-btn" id="btnResetChildProgress">
              <i class="fa-solid fa-rotate-left"></i> تصفير سجل التقدم والبدء من جديد
            </button>
            <span class="privacy-assurance-note"><i class="fa-solid fa-lock"></i> جميع بيانات التقدم مخزنة محلياً في جهازك (localStorage) ولا تسجل على خوادم خارجية.</span>
          </div>
        </div>
      </section>

      {/* Confetti Overlay */}
      <div id="kidsConfettiOverlay" class="confetti-overlay" pointer-events="none"></div>

      {/* Interactive Script */}
      <script src="/static/kids.js?v=2.0"></script>
    </Layout>
  )
}
