/**
 * واحة القرآن الكريم والأذكار والسبحة الإلكترونية ومتابع الورد والختمات
 * مؤسسة الدكتور عمر هشام الخيرية
 */

(function () {
  'use strict';

  // ────────────────────────── بيانات السور الـ ١١٤ كاملة ──────────────────────────
  var SURAHS = [
    { n: 1, name: 'الفاتحة', en: 'Al-Fatihah', verses: 7, type: 'مكية', juz: 1, page: 1 },
    { n: 2, name: 'البقرة', en: 'Al-Baqarah', verses: 286, type: 'مدنية', juz: 1, page: 2 },
    { n: 3, name: 'آل عمران', en: 'Ali \'Imran', verses: 200, type: 'مدنية', juz: 3, page: 50 },
    { n: 4, name: 'النساء', en: 'An-Nisa', verses: 176, type: 'مدنية', juz: 4, page: 77 },
    { n: 5, name: 'المائدة', en: 'Al-Ma\'idah', verses: 120, type: 'مدنية', juz: 6, page: 106 },
    { n: 6, name: 'الأنعام', en: 'Al-An\'am', verses: 165, type: 'مكية', juz: 7, page: 128 },
    { n: 7, name: 'الأعراف', en: 'Al-A\'raf', verses: 206, type: 'مكية', juz: 8, page: 151 },
    { n: 8, name: 'الأنفال', en: 'Al-Anfal', verses: 75, type: 'مدنية', juz: 9, page: 177 },
    { n: 9, name: 'التوبة', en: 'At-Tawbah', verses: 129, type: 'مدنية', juz: 10, page: 187 },
    { n: 10, name: 'يونس', en: 'Yunus', verses: 109, type: 'مكية', juz: 11, page: 208 },
    { n: 11, name: 'هود', en: 'Hud', verses: 123, type: 'مكية', juz: 11, page: 221 },
    { n: 12, name: 'يوسف', en: 'Yusuf', verses: 111, type: 'مكية', juz: 12, page: 235 },
    { n: 13, name: 'الرعد', en: 'Ar-Ra\'d', verses: 43, type: 'مدنية', juz: 13, page: 249 },
    { n: 14, name: 'إبراهيم', en: 'Ibrahim', verses: 52, type: 'مكية', juz: 13, page: 255 },
    { n: 15, name: 'الحجر', en: 'Al-Hijr', verses: 99, type: 'مكية', juz: 14, page: 262 },
    { n: 16, name: 'النحل', en: 'An-Nahl', verses: 128, type: 'مكية', juz: 14, page: 267 },
    { n: 17, name: 'الإسراء', en: 'Al-Isra', verses: 111, type: 'مكية', juz: 15, page: 282 },
    { n: 18, name: 'الكهف', en: 'Al-Kahf', verses: 110, type: 'مكية', juz: 15, page: 293 },
    { n: 19, name: 'مريم', en: 'Maryam', verses: 98, type: 'مكية', juz: 16, page: 305 },
    { n: 20, name: 'طه', en: 'Taha', verses: 135, type: 'مكية', juz: 16, page: 312 },
    { n: 21, name: 'الأنبياء', en: 'Al-Anbiya', verses: 112, type: 'مكية', juz: 17, page: 322 },
    { n: 22, name: 'الحج', en: 'Al-Hajj', verses: 78, type: 'مدنية', juz: 17, page: 332 },
    { n: 23, name: 'المؤمنون', en: 'Al-Mu\'minun', verses: 118, type: 'مكية', juz: 18, page: 342 },
    { n: 24, name: 'النور', en: 'An-Nur', verses: 64, type: 'مدنية', juz: 18, page: 350 },
    { n: 25, name: 'الفرقان', en: 'Al-Furqan', verses: 77, type: 'مكية', juz: 18, page: 359 },
    { n: 26, name: 'الشعراء', en: 'Ash-Shu\'ara', verses: 227, type: 'مكية', juz: 19, page: 367 },
    { n: 27, name: 'النمل', en: 'An-Naml', verses: 93, type: 'مكية', juz: 19, page: 377 },
    { n: 28, name: 'القصص', en: 'Al-Qasas', verses: 88, type: 'مكية', juz: 20, page: 385 },
    { n: 29, name: 'العنكبوت', en: 'Al-\'Ankabut', verses: 69, type: 'مكية', juz: 20, page: 396 },
    { n: 30, name: 'الروم', en: 'Ar-Rum', verses: 60, type: 'مكية', juz: 21, page: 404 },
    { n: 31, name: 'لقمان', en: 'Luqman', verses: 34, type: 'مكية', juz: 21, page: 411 },
    { n: 32, name: 'السجدة', en: 'As-Sajdah', verses: 30, type: 'مكية', juz: 21, page: 415 },
    { n: 33, name: 'الأحزاب', en: 'Al-Ahzab', verses: 73, type: 'مدنية', juz: 21, page: 418 },
    { n: 34, name: 'سبأ', en: 'Saba', verses: 54, type: 'مكية', juz: 22, page: 428 },
    { n: 35, name: 'فاطر', en: 'Fatir', verses: 45, type: 'مكية', juz: 22, page: 434 },
    { n: 36, name: 'يس', en: 'Ya-Sin', verses: 83, type: 'مكية', juz: 22, page: 440 },
    { n: 37, name: 'الصافات', en: 'As-Saffat', verses: 182, type: 'مكية', juz: 23, page: 446 },
    { n: 38, name: 'ص', en: 'Sad', verses: 88, type: 'مكية', juz: 23, page: 453 },
    { n: 39, name: 'الزمر', en: 'Az-Zumar', verses: 75, type: 'مكية', juz: 23, page: 458 },
    { n: 40, name: 'غافر', en: 'Ghafir', verses: 85, type: 'مكية', juz: 24, page: 467 },
    { n: 41, name: 'فصلت', en: 'Fussilat', verses: 54, type: 'مكية', juz: 24, page: 477 },
    { n: 42, name: 'الشورى', en: 'Ash-Shura', verses: 53, type: 'مكية', juz: 25, page: 483 },
    { n: 43, name: 'الزخرف', en: 'Az-Zukhruf', verses: 89, type: 'مكية', juz: 25, page: 489 },
    { n: 44, name: 'الدخان', en: 'Ad-Dukhan', verses: 59, type: 'مكية', juz: 25, page: 496 },
    { n: 45, name: 'الجاثية', en: 'Al-Jathiyah', verses: 37, type: 'مكية', juz: 25, page: 499 },
    { n: 46, name: 'الأحقاف', en: 'Al-Ahqaf', verses: 35, type: 'مكية', juz: 26, page: 502 },
    { n: 47, name: 'محمد', en: 'Muhammad', verses: 38, type: 'مدنية', juz: 26, page: 507 },
    { n: 48, name: 'الفتح', en: 'Al-Fath', verses: 29, type: 'مدنية', juz: 26, page: 511 },
    { n: 49, name: 'الحجرات', en: 'Al-Hujurat', verses: 18, type: 'مدنية', juz: 26, page: 515 },
    { n: 50, name: 'ق', en: 'Qaf', verses: 45, type: 'مكية', juz: 26, page: 518 },
    { n: 51, name: 'الذاريات', en: 'Adh-Dhariyat', verses: 60, type: 'مكية', juz: 26, page: 520 },
    { n: 52, name: 'الطور', en: 'At-Tur', verses: 49, type: 'مكية', juz: 27, page: 523 },
    { n: 53, name: 'النجم', en: 'An-Najm', verses: 62, type: 'مكية', juz: 27, page: 526 },
    { n: 54, name: 'القمر', en: 'Al-Qamar', verses: 55, type: 'مكية', juz: 27, page: 528 },
    { n: 55, name: 'الرحمن', en: 'Ar-Rahman', verses: 78, type: 'مدنية', juz: 27, page: 531 },
    { n: 56, name: 'الواقعة', en: 'Al-Waqi\'ah', verses: 96, type: 'مكية', juz: 27, page: 534 },
    { n: 57, name: 'الحديد', en: 'Al-Hadid', verses: 29, type: 'مدنية', juz: 27, page: 537 },
    { n: 58, name: 'المجادلة', en: 'Al-Mujadilah', verses: 22, type: 'مدنية', juz: 28, page: 542 },
    { n: 59, name: 'الحشر', en: 'Al-Hashr', verses: 24, type: 'مدنية', juz: 28, page: 545 },
    { n: 60, name: 'الممتحنة', en: 'Al-Mumtahanah', verses: 13, type: 'مدنية', juz: 28, page: 549 },
    { n: 61, name: 'الصف', en: 'As-Saff', verses: 14, type: 'مدنية', juz: 28, page: 551 },
    { n: 62, name: 'الجمعة', en: 'Al-Jumu\'ah', verses: 11, type: 'مدنية', juz: 28, page: 553 },
    { n: 63, name: 'المنافقون', en: 'Al-Munafiqun', verses: 11, type: 'مدنية', juz: 28, page: 554 },
    { n: 64, name: 'التغابن', en: 'At-Taghabun', verses: 18, type: 'مدنية', juz: 28, page: 556 },
    { n: 65, name: 'الطلاق', en: 'At-Talaq', verses: 12, type: 'مدنية', juz: 28, page: 558 },
    { n: 66, name: 'التحريم', en: 'At-Tahrim', verses: 12, type: 'مدنية', juz: 28, page: 560 },
    { n: 67, name: 'الملك', en: 'Al-Mulk', verses: 30, type: 'مكية', juz: 29, page: 562 },
    { n: 68, name: 'القلم', en: 'Al-Qalam', verses: 52, type: 'مكية', juz: 29, page: 564 },
    { n: 69, name: 'الحاقة', en: 'Al-Haqqah', verses: 52, type: 'مكية', juz: 29, page: 566 },
    { n: 70, name: 'المعارج', en: 'Al-Ma\'arij', verses: 44, type: 'مكية', juz: 29, page: 568 },
    { n: 71, name: 'نوح', en: 'Nuh', verses: 28, type: 'مكية', juz: 29, page: 570 },
    { n: 72, name: 'الجن', en: 'Al-Jinn', verses: 28, type: 'مكية', juz: 29, page: 572 },
    { n: 73, name: 'المزمل', en: 'Al-Muzzammil', verses: 20, type: 'مكية', juz: 29, page: 574 },
    { n: 74, name: 'المدثر', en: 'Al-Muddaththir', verses: 56, type: 'مكية', juz: 29, page: 575 },
    { n: 75, name: 'القيامة', en: 'Al-Qiyamah', verses: 40, type: 'مكية', juz: 29, page: 577 },
    { n: 76, name: 'الإنسان', en: 'Al-Insan', verses: 31, type: 'مدنية', juz: 29, page: 578 },
    { n: 77, name: 'المرسلات', en: 'Al-Mursalat', verses: 50, type: 'مكية', juz: 29, page: 580 },
    { n: 78, name: 'النبأ', en: 'An-Naba', verses: 40, type: 'مكية', juz: 30, page: 582 },
    { n: 79, name: 'النازعات', en: 'An-Nazi\'at', verses: 46, type: 'مكية', juz: 30, page: 583 },
    { n: 80, name: 'عبس', en: '\'Abasa', verses: 42, type: 'مكية', juz: 30, page: 585 },
    { n: 81, name: 'التكوير', en: 'At-Takwir', verses: 29, type: 'مكية', juz: 30, page: 586 },
    { n: 82, name: 'الانفطار', en: 'Al-Infitar', verses: 19, type: 'مكية', juz: 30, page: 587 },
    { n: 83, name: 'المطففين', en: 'Al-Mutaffifin', verses: 36, type: 'مكية', juz: 30, page: 587 },
    { n: 84, name: 'الانشقاق', en: 'Al-Inshiqaq', verses: 25, type: 'مكية', juz: 30, page: 589 },
    { n: 85, name: 'البروج', en: 'Al-Buruj', verses: 22, type: 'مكية', juz: 30, page: 590 },
    { n: 86, name: 'الطارق', en: 'At-Tariq', verses: 17, type: 'مكية', juz: 30, page: 591 },
    { n: 87, name: 'الأعلى', en: 'Al-A\'la', verses: 19, type: 'مكية', juz: 30, page: 591 },
    { n: 88, name: 'الغاشية', en: 'Al-Ghashiyah', verses: 26, type: 'مكية', juz: 30, page: 592 },
    { n: 89, name: 'الفجر', en: 'Al-Fajr', verses: 30, type: 'مكية', juz: 30, page: 593 },
    { n: 90, name: 'البلد', en: 'Al-Balad', verses: 20, type: 'مكية', juz: 30, page: 594 },
    { n: 91, name: 'الشمس', en: 'Ash-Shams', verses: 15, type: 'مكية', juz: 30, page: 595 },
    { n: 92, name: 'الليل', en: 'Al-Layl', verses: 21, type: 'مكية', juz: 30, page: 595 },
    { n: 93, name: 'الضحى', en: 'Ad-Duha', verses: 11, type: 'مكية', juz: 30, page: 596 },
    { n: 94, name: 'الشرح', en: 'Ash-Sharh', verses: 8, type: 'مكية', juz: 30, page: 596 },
    { n: 95, name: 'التين', en: 'At-Tin', verses: 8, type: 'مكية', juz: 30, page: 597 },
    { n: 96, name: 'العلق', en: 'Al-\'Alaq', verses: 19, type: 'مكية', juz: 30, page: 597 },
    { n: 97, name: 'القدر', en: 'Al-Qadr', verses: 5, type: 'مكية', juz: 30, page: 598 },
    { n: 98, name: 'البينة', en: 'Al-Bayyinah', verses: 8, type: 'مدنية', juz: 30, page: 598 },
    { n: 99, name: 'الزلزلة', en: 'Az-Zalzalah', verses: 8, type: 'مدنية', juz: 30, page: 599 },
    { n: 100, name: 'العاديات', en: 'Al-\'Adiyat', verses: 11, type: 'مكية', juz: 30, page: 599 },
    { n: 101, name: 'القارعة', en: 'Al-Qari\'ah', verses: 11, type: 'مكية', juz: 30, page: 600 },
    { n: 102, name: 'التكاثر', en: 'At-Takathur', verses: 8, type: 'مكية', juz: 30, page: 600 },
    { n: 103, name: 'العصر', en: 'Al-\'Asr', verses: 3, type: 'مكية', juz: 30, page: 601 },
    { n: 104, name: 'الهمزة', en: 'Al-Humazah', verses: 9, type: 'مكية', juz: 30, page: 601 },
    { n: 105, name: 'الفيل', en: 'Al-Fil', verses: 5, type: 'مكية', juz: 30, page: 601 },
    { n: 106, name: 'قريش', en: 'Quraysh', verses: 4, type: 'مكية', juz: 30, page: 602 },
    { n: 107, name: 'الماعون', en: 'Al-Ma\'un', verses: 7, type: 'مكية', juz: 30, page: 602 },
    { n: 108, name: 'الكوثر', en: 'Al-Kawthar', verses: 3, type: 'مكية', juz: 30, page: 602 },
    { n: 109, name: 'الكافرون', en: 'Al-Kafirun', verses: 6, type: 'مكية', juz: 30, page: 603 },
    { n: 110, name: 'النصر', en: 'An-Nasr', verses: 3, type: 'مدنية', juz: 30, page: 603 },
    { n: 111, name: 'المسد', en: 'Al-Masad', verses: 5, type: 'مكية', juz: 30, page: 603 },
    { n: 112, name: 'الإخلاص', en: 'Al-Ikhlas', verses: 4, type: 'مكية', juz: 30, page: 604 },
    { n: 113, name: 'الفلق', en: 'Al-Falaq', verses: 5, type: 'مكية', juz: 30, page: 604 },
    { n: 114, name: 'الناس', en: 'An-Nas', verses: 6, type: 'مكية', juz: 30, page: 604 }
  ];

  // خوادم تلاوات القراء مع روابط احتياطية عالية الاعتمادية
  var RECITERS = {
    minshawi: {
      name: 'الشيخ محمد صديق المنشاوي (مرتل)',
      urls: [
        'https://server10.mp3quran.net/minsh/',
        'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/',
        '/api/quran/audio/minshawi/'
      ]
    },
    minshawi_mujawwad: {
      name: 'الشيخ محمد صديق المنشاوي (مجود)',
      urls: [
        'https://server10.mp3quran.net/minsh/Almusshaf-Al-Mojawwad/',
        'https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee_mujawwad/',
        '/api/quran/audio/minshawi_mujawwad/'
      ]
    },
    abdulbasit: {
      name: 'الشيخ عبد الباسط عبد الصمد (مرتل)',
      urls: [
        'https://server7.mp3quran.net/basit/',
        'https://download.quranicaudio.com/quran/abdul_basit_murattal/',
        '/api/quran/audio/abdulbasit/'
      ]
    },
    abdulbasit_mujawwad: {
      name: 'الشيخ عبد الباسط عبد الصمد (مجود)',
      urls: [
        'https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/',
        'https://download.quranicaudio.com/quran/abdulbaset_mujawwad/',
        '/api/quran/audio/abdulbasit_mujawwad/'
      ]
    },
    yasser: {
      name: 'الشيخ ياسر الدوسري',
      urls: [
        'https://server11.mp3quran.net/yasser/',
        'https://download.quranicaudio.com/quran/yasser_ad-dussary/',
        '/api/quran/audio/yasser/'
      ]
    },
    husary: {
      name: 'الشيخ محمود خليل الحصري',
      urls: [
        'https://server13.mp3quran.net/husr/',
        'https://download.quranicaudio.com/quran/mahmood_khaleel_al-husaree/',
        '/api/quran/audio/husary/'
      ]
    },
    afs: {
      name: 'الشيخ مشاري راشد العفاسي',
      urls: [
        'https://server8.mp3quran.net/afs/',
        'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/',
        '/api/quran/audio/afs/'
      ]
    },
    ghamadi: {
      name: 'الشيخ سعد الغامدي',
      urls: [
        'https://server7.mp3quran.net/s_gmd/',
        'https://download.quranicaudio.com/quran/sa3d_al-ghaamidee/complete/',
        '/api/quran/audio/ghamadi/'
      ]
    },
    maher: {
      name: 'الشيخ ماهر المعيقلي',
      urls: [
        'https://server12.mp3quran.net/maher/',
        'https://download.quranicaudio.com/quran/maher_2/',
        '/api/quran/audio/maher/'
      ]
    },
    ajmy: {
      name: 'الشيخ أحمد العجمي',
      urls: [
        'https://server10.mp3quran.net/ajm/',
        'https://download.quranicaudio.com/quran/ahmed_ibn_3ali_al-3ajamy/',
        '/api/quran/audio/ajmy/'
      ]
    },
    shuraim: {
      name: 'الشيخ سعود الشريم',
      urls: [
        'https://server7.mp3quran.net/shur/',
        'https://download.quranicaudio.com/quran/sa3ood_ash-shuraym/',
        '/api/quran/audio/shuraim/'
      ]
    },
    hudhaify: {
      name: 'الشيخ علي الحذيفي',
      urls: [
        'https://server9.mp3quran.net/hthfi/',
        'https://download.quranicaudio.com/quran/ali_alhuthaify/',
        '/api/quran/audio/hudhaify/'
      ]
    }
  };

  // بيانات الأذكار
  var ADHKAR_DATA = {
    morning: [
      {
        id: 'm1',
        text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
        count: 1,
        virtue: 'حفظ وبركة طوال اليوم واعتراف بتوحيد الله وفضله.'
      },
      {
        id: 'm2',
        text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.',
        count: 1,
        virtue: 'تفويض الأمر لله والتوكل عليه في صباح كل يوم.'
      },
      {
        id: 'm3',
        text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
        count: 1,
        virtue: 'سيد الاستغفار: من قالها موقناً بها حين يصبح فمات من يومه دخل الجنة.'
      },
      {
        id: 'm4',
        text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
        count: 3,
        virtue: 'لم يضره شيء حتى يمسي.'
      },
      {
        id: 'm5',
        text: 'رَضِيتُ بِاللَّهِ رَبّاً، وَبِالْإِسْلَامِ دِيناً، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيّاً.',
        count: 3,
        virtue: 'كان حقاً على الله أن يرضيه يوم القيامة.'
      },
      {
        id: 'm6',
        text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.',
        count: 3,
        virtue: 'طلب الرعاية الإلهية في جميع شؤون الحياة.'
      },
      {
        id: 'm7',
        text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.',
        count: 7,
        virtue: 'كفاه الله ما أهمه من أمر دنياه وآخرته.'
      },
      {
        id: 'm8',
        text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.',
        count: 3,
        virtue: 'تعدل عبادة ساعات طويلة في الثواب والأجر.'
      },
      {
        id: 'm9',
        text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ.',
        count: 3,
        virtue: 'سؤال العافية والسلامة في الجسد والحواس والدين.'
      },
      {
        id: 'm10',
        text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.',
        count: 100,
        virtue: 'حُطت خطاياه وإن كانت مثل زبد البحر، ولم يأتِ أحد يوم القيامة بأفضل مما جاء به.'
      }
    ],
    evening: [
      {
        id: 'e1',
        text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
        count: 1,
        virtue: 'حفظ وأمان وتسليم لله في المساء.'
      },
      {
        id: 'e2',
        text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.',
        count: 1,
        virtue: 'استحضار عظمة الخالق مع غياب شمس كل يوم.'
      },
      {
        id: 'e3',
        text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',
        count: 1,
        virtue: 'سيد الاستغفار: من قالها حين يمسي فمات دخل الجنة.'
      },
      {
        id: 'e4',
        text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
        count: 3,
        virtue: 'لم يضره شيء ولدغة حشرة أو دابة في ليلته.'
      },
      {
        id: 'e5',
        text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
        count: 3,
        virtue: 'حفظ من كل سوء وفجأة بلاء.'
      },
      {
        id: 'e6',
        text: 'رَضِيتُ بِاللَّهِ رَبّاً، وَبِالْإِسْلَامِ دِيناً، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيّاً.',
        count: 3,
        virtue: 'رضوان الله عز وجل.'
      },
      {
        id: 'e7',
        text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.',
        count: 7,
        virtue: 'كفاية الله من الهموم والغموم.'
      }
    ],
    after_prayer: [
      {
        id: 'p1',
        text: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ. اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.',
        count: 1,
        virtue: 'سنة النبي ﷺ عقب التسليم من كل فريضة.'
      },
      {
        id: 'p2',
        text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ.',
        count: 1,
        virtue: 'توحيد الخالق وتفويض الأمر له وحده.'
      },
      {
        id: 'p3',
        text: 'سُبْحَانَ اللَّهِ (٣٣)، الْحَمْدُ لِلَّهِ (٣٣)، اللَّهُ أَكْبَرُ (٣٣)، ثُمَّ تَمَامَ الْمِائَةِ: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
        count: 1,
        virtue: 'غُفرت خطاياه وإن كانت مثل زبد البحر.'
      },
      {
        id: 'p4',
        text: 'قراءة آية الكرسي: ﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...﴾',
        count: 1,
        virtue: 'من قرأها دبر كل صلاة لم يمنعه من دخول الجنة إلا أن يموت.'
      }
    ],
    sleep: [
      {
        id: 's1',
        text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.',
        count: 1,
        virtue: 'حفظ النفس أثناء النوم والتوكل على الله.'
      },
      {
        id: 's2',
        text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.',
        count: 3,
        virtue: 'سنة النبي ﷺ عند وضع اليد اليمنى تحت الخد.'
      },
      {
        id: 's3',
        text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.',
        count: 1,
        virtue: 'ذكر النوم النبوي.'
      }
    ],
    waking: [
      {
        id: 'w1',
        text: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.',
        count: 1,
        virtue: 'شكر الله على نعمة الحياة واليقظة.'
      },
      {
        id: 'w2',
        text: 'الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ.',
        count: 1,
        virtue: 'حمد الله على العافية ورد الروح.'
      }
    ],
    food_travel: [
      {
        id: 'ft1',
        text: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ. اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ.',
        count: 1,
        virtue: 'دعاء ركوب الدابة والسفر.'
      },
      {
        id: 'ft2',
        text: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَٰذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ.',
        count: 1,
        virtue: 'غُفر له ما تقدم من ذنبه.'
      },
      {
        id: 'ft3',
        text: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ.',
        count: 1,
        virtue: 'يُقال له: كُفيت ووُقيت وهُديت وتنحى عنه الشيطان.'
      }
    ],
    ruqyah: [
      {
        id: 'rq1',
        text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ.',
        count: 3,
        virtue: 'رقية النبي ﷺ للحسن والحسين عليهما السلام.'
      },
      {
        id: 'rq2',
        text: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ.',
        count: 7,
        virtue: 'شفاء من كل داء ومرض بإذن الله.'
      },
      {
        id: 'rq3',
        text: 'بِسْمِ اللَّهِ أَرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللَّهُ يَشْفِيكَ، بِسْمِ اللَّهِ أَرْقِيكَ.',
        count: 3,
        virtue: 'رقية جبريل عليه السلام للنبي ﷺ.'
      }
    ]
  };

  // بيانات الأدعية المأثورة
  var DUAS_DATA = [
    {
      cat: 'quranic',
      title: 'دعاء الهداية والرحمة',
      text: '﴿رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ﴾',
      source: 'سورة آل عمران — آية ٨'
    },
    {
      cat: 'quranic',
      title: 'دعاء الصبر والفرج',
      text: '﴿رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ﴾',
      source: 'سورة البقرة — آية ٢٥٠'
    },
    {
      cat: 'quranic',
      title: 'دعاء الوالدين والمغفرة',
      text: '﴿رَّبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَن دَخَلَ بَيْتِيَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ﴾',
      source: 'سورة نوح — آية ٢٨'
    },
    {
      cat: 'prophetic',
      title: 'جوامع الدعاء النبوي',
      text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنَ الْخَيْرِ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ، وَأَعُوذُ بِكَ مِنَ الشَّرِّ كُلِّهِ عَاجِلِهِ وَآجِلِهِ، مَا عَلِمْتُ مِنْهُ وَمَا لَمْ أَعْلَمْ.',
      source: 'صحيح ابن ماجه'
    },
    {
      cat: 'relief',
      title: 'دعاء ذي النون لتفريج الكرب',
      text: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ.',
      source: 'ما دعا بها مسلم في كرب إلا استجاب الله له'
    },
    {
      cat: 'relief',
      title: 'دعاء إزالة الهم والحزن',
      text: 'اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي.',
      source: 'مسند أحمد — أذهب الله همه وبدله مكانه فرحاً'
    },
    {
      cat: 'healing',
      title: 'دعاء الشفاء للمريض',
      text: 'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا.',
      source: 'صحيح البخاري ومسلم'
    },
    {
      cat: 'rizq',
      title: 'دعاء الرزق وسداد الدين',
      text: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ.',
      source: 'سنن الترمذي'
    },
    {
      cat: 'forgiveness',
      title: 'دعاء الاستغفار العظيم',
      text: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي.',
      source: 'دعاء ليلة القدر — سنن الترمذي'
    },
    {
      cat: 'khatm',
      title: 'دعاء ختم القرآن المبارك',
      text: 'اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً، اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ، وَارْزُقْنِي تِلَاوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ، وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ.',
      source: 'المأثور في ختم المصحف الشريف'
    }
  ];

  // إذاعات القرآن الكريم المباشرة
  var RADIOS_DATA = [
    {
      id: 'cairo',
      name: 'إذاعة القرآن الكريم من القاهرة',
      tagline: 'البث الحي والمباشر على مدار ٢٤ ساعة',
      urls: [
        'https://stream.radiojar.com/8s5u5tpdtwzuv',
        'https://stream.zeno.fm/f3wvbbqmdg8uv',
        'https://n0a.radiojar.com/8s5u5tpdtwzuv'
      ],
      icon: 'fa-tower-broadcast'
    },
    {
      id: 'dosari_radio',
      name: 'إذاعة الشيخ ياسر الدوسري',
      tagline: 'تلاوات خاشعة ومؤثرة بصوت الشيخ الدوسري',
      urls: [
        'https://backup.qurango.net/radio/yasser_aldosari',
        'https://qurango.net/radio/yasser_aldosari'
      ],
      icon: 'fa-microphone-lines'
    },
    {
      id: 'minshawi_radio',
      name: 'إذاعة الشيخ محمد صديق المنشاوي',
      tagline: 'المصحف المرتل والمجود بنقاء فائق',
      urls: [
        'https://backup.qurango.net/radio/mohammed_siddiq_alminshawi',
        'https://qurango.net/radio/mohammed_siddiq_alminshawi'
      ],
      icon: 'fa-microphone-lines'
    },
    {
      id: 'abdulbasit_radio',
      name: 'إذاعة الشيخ عبد الباسط عبد الصمد',
      tagline: 'تلاوات خاشعة من الزمن الجميل',
      urls: [
        'https://backup.qurango.net/radio/abdulbasit_abdulsamad_mojawwad',
        'https://backup.qurango.net/radio/abdulbasit_abdulsamad_murattal'
      ],
      icon: 'fa-volume-high'
    },
    {
      id: 'husary_radio',
      name: 'إذاعة الشيخ محمود خليل الحصري',
      tagline: 'معلم الأجيال والتلاوة المتقنة',
      urls: [
        'https://backup.qurango.net/radio/mahmoud_khalil_alhussary',
        'https://qurango.net/radio/mahmoud_khalil_alhussary'
      ],
      icon: 'fa-book-quran'
    },
    {
      id: 'afs_radio',
      name: 'إذاعة الشيخ مشاري راشد العفاسي',
      tagline: 'تلاوات خاشعة وعذبة بصوت العفاسي',
      urls: [
        'https://backup.qurango.net/radio/mishary_alafasi',
        'https://qurango.net/radio/mishary_alafasi'
      ],
      icon: 'fa-headphones'
    },
    {
      id: 'maher_radio',
      name: 'إذاعة الشيخ ماهر المعيقلي',
      tagline: 'تلاوات الحرم المكي الشريف الخاشعة',
      urls: [
        'https://backup.qurango.net/radio/maher',
        'https://qurango.net/radio/maher'
      ],
      icon: 'fa-kaaba'
    },
    {
      id: 'ghamdi_radio',
      name: 'إذاعة الشيخ سعد الغامدي',
      tagline: 'المصحف المرتل برواية حفص عن عاصم',
      urls: [
        'https://backup.qurango.net/radio/saad_alghamdi',
        'https://qurango.net/radio/saad_alghamdi'
      ],
      icon: 'fa-microphone'
    },
    {
      id: 'tarateel',
      name: 'إذاعة تراتيل وتلاوات خاشعة',
      tagline: 'مختارات من روائع التلاوات لكبار القراء',
      urls: [
        'https://backup.qurango.net/radio/tarateel',
        'https://qurango.net/radio/tarateel'
      ],
      icon: 'fa-headphones'
    },
    {
      id: 'tafseer_radio',
      name: 'إذاعة تفسير القرآن الكريم',
      tagline: 'خواطر وتدبر آيات الذكر الحكيم للشيخ الشعراوي',
      urls: [
        'https://backup.qurango.net/radio/tafseer',
        'https://qurango.net/radio/tafseer'
      ],
      icon: 'fa-book-open-reader'
    },
    {
      id: 'ruqyah_radio',
      name: 'إذاعة الرقية الشرعية',
      tagline: 'آيات الحفظ والشفاء والسكينة والتحصين',
      urls: [
        'https://backup.qurango.net/radio/roqiah',
        'https://qurango.net/radio/roqiah'
      ],
      icon: 'fa-shield-halved'
    }
  ];

  // صيغ التسبيح الافتراضية للسبحة الذكية
  var TASBEEH_PRESETS = [
    { text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', target: 33 },
    { text: 'سُبْحَانَ اللَّهِ الْعَظِيمِ', target: 33 },
    { text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', target: 33 },
    { text: 'لَا إِلَهَ إِلَّا اللَّهُ', target: 100 },
    { text: 'اللَّهُ أَكْبَرُ كَبِيرًا', target: 33 },
    { text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', target: 100 },
    { text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ', target: 100 },
    { text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ', target: 33 },
    { text: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', target: 40 },
    { text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', target: 100 }
  ];

  // ────────────────────────── الحالة العامة (State) ──────────────────────────
  var state = {
    activeTab: 'mushaf',
    currentSurah: null,
    currentReciter: 'minshawi',
    fontSize: 28,
    fontFamily: 'font-amiri-quran',
    theme: 'parchment',
    audioElement: new Audio(),
    radioAudio: new Audio(),
    isPlayingAudio: false,
    isPlayingRadio: false,
    activeRadioId: null,
    isAutoScrolling: false,
    autoScrollTimer: null,
    wakeLock: null,
    activeAyahModalData: { surah: null, ayah: null, text: '' },
    // Tasbeeh
    tasbeehCount: 0,
    tasbeehTarget: 33,
    activeZikrText: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    hapticEnabled: true,
    soundEnabled: true,
    todayTasbeeh: 0,
    allTimeTasbeeh: 0,
    targetsDone: 0,
    // Adhkar
    currentAdhkarCat: 'morning',
    adhkarCounters: {},
    // Khatmah
    khatmahDays: 30,
    khatmahJuz: 0,
    // Favorites
    favoriteSurahs: []
  };

  // ────────────────────────── الدوال المساعدة (Helpers) ──────────────────────────
  function toArabicDigits(num) {
    if (num === null || num === undefined) return '';
    var str = String(num);
    var arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, function (w) {
      return arabic[+w];
    });
  }

  function playClickSound() {
    if (!state.soundEnabled) return;
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (_) {}
  }

  function triggerHaptic(duration) {
    if (!state.hapticEnabled || !('vibrate' in navigator)) return;
    try {
      navigator.vibrate(duration || 30);
    } catch (_) {}
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  // ────────────────────────── تخزين واسترجاع البيانات ──────────────────────────
  function loadPersistedState() {
    try {
      var savedTasbeeh = localStorage.getItem('omar_quran_tasbeeh');
      if (savedTasbeeh) {
        var parsed = JSON.parse(savedTasbeeh);
        state.todayTasbeeh = parsed.today || 0;
        state.allTimeTasbeeh = parsed.allTime || 0;
        state.targetsDone = parsed.targetsDone || 0;
        state.hapticEnabled = parsed.haptic !== false;
        state.soundEnabled = parsed.sound !== false;
      }

      var savedKhatmah = localStorage.getItem('omar_quran_khatmah');
      if (savedKhatmah) {
        var kParsed = JSON.parse(savedKhatmah);
        state.khatmahDays = kParsed.days || 30;
        state.khatmahJuz = kParsed.juz || 0;
      }

      var savedFavs = localStorage.getItem('omar_quran_favs');
      if (savedFavs) {
        state.favoriteSurahs = JSON.parse(savedFavs);
      }

      var savedTheme = localStorage.getItem('omar_quran_reader_theme');
      if (savedTheme) state.theme = savedTheme;

      var savedFont = localStorage.getItem('omar_quran_reader_fontsize');
      if (savedFont) state.fontSize = parseInt(savedFont, 10) || 28;

      var savedFontFamily = localStorage.getItem('omar_quran_font_family');
      if (savedFontFamily) state.fontFamily = savedFontFamily;
    } catch (_) {}
  }

  function savePersistedTasbeeh() {
    try {
      localStorage.setItem('omar_quran_tasbeeh', JSON.stringify({
        today: state.todayTasbeeh,
        allTime: state.allTimeTasbeeh,
        targetsDone: state.targetsDone,
        haptic: state.hapticEnabled,
        sound: state.soundEnabled
      }));
    } catch (_) {}
  }

  function savePersistedKhatmah() {
    try {
      localStorage.setItem('omar_quran_khatmah', JSON.stringify({
        days: state.khatmahDays,
        juz: state.khatmahJuz
      }));
    } catch (_) {}
  }

  // ────────────────────────── 1. تبويبات الواحة الرئيسية ──────────────────────────
  function initTabNavigation() {
    var tabs = document.querySelectorAll('.quran-tab-btn');
    var panes = document.querySelectorAll('.quran-tab-pane');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        state.activeTab = target;

        tabs.forEach(function (t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        panes.forEach(function (p) { p.classList.remove('active'); });

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        var targetPane = document.getElementById('tab-' + target);
        if (targetPane) {
          targetPane.classList.add('active');
        }

        // تحديث الرابط بدون إعادة تحميل
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', '#tab=' + target);
        }
      });
    });

    // قراءة التبويب من الـ URL hash إن وجد
    if (window.location.hash) {
      var match = window.location.hash.match(/tab=([a-z]+)/);
      if (match && match[1]) {
        var autoTab = document.querySelector('.quran-tab-btn[data-tab="' + match[1] + '"]');
        if (autoTab) autoTab.click();
      }
    }
  }

  // ────────────────────────── 2. المصحف الشريف والسور ──────────────────────────
  function renderSurahsGrid(filter, search) {
    var grid = document.getElementById('surahsGrid');
    if (!grid) return;

    var filtered = SURAHS.filter(function (s) {
      if (filter === 'meccan' && s.type !== 'مكية') return false;
      if (filter === 'medinan' && s.type !== 'مدنية') return false;
      if (filter === 'favorites' && state.favoriteSurahs.indexOf(s.n) === -1) return false;

      if (search) {
        var q = search.trim().toLowerCase();
        var matchName = s.name.toLowerCase().indexOf(q) !== -1;
        var matchEn = s.en.toLowerCase().indexOf(q) !== -1;
        var matchNum = String(s.n) === q;
        var matchJuz = ('جزء ' + s.juz).indexOf(q) !== -1;
        return matchName || matchEn || matchNum || matchJuz;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="quran-empty-state"><i class="fa-solid fa-magnifying-glass"></i><p>لا توجد سور مطابقة لبحثك</p></div>';
      return;
    }

    var html = '';
    filtered.forEach(function (s) {
      var isFav = state.favoriteSurahs.indexOf(s.n) !== -1;
      html += '<div class="surah-card" data-num="' + s.n + '">';
      html += '  <div class="surah-number-badge">';
      html += '    <svg viewBox="0 0 40 40" class="surah-num-frame"><polygon points="20,2 38,20 20,38 2,20" /></svg>';
      html += '    <span>' + toArabicDigits(s.n) + '</span>';
      html += '  </div>';
      html += '  <div class="surah-card-info">';
      html += '    <h3 class="surah-card-name">' + s.name + '</h3>';
      html += '    <div class="surah-card-sub">';
      html += '      <span class="surah-type-badge ' + (s.type === 'مكية' ? 'meccan' : 'medinan') + '">' + s.type + '</span>';
      html += '      <span class="surah-verses-count">' + toArabicDigits(s.verses) + ' آيات</span>';
      html += '      <span class="surah-juz-tag">الجزء ' + toArabicDigits(s.juz) + '</span>';
      html += '    </div>';
      html += '  </div>';
      html += '  <div class="surah-card-actions">';
      html += '    <button type="button" class="surah-act-btn play-surah-btn" data-num="' + s.n + '" title="استماع للسورة">' +
              '      <i class="fa-solid fa-play"></i>' +
              '    </button>';
      html += '    <button type="button" class="surah-act-btn read-surah-btn" data-num="' + s.n + '" title="قراءة وتدبر">' +
              '      <i class="fa-solid fa-book-open"></i>' +
              '    </button>';
      html += '    <button type="button" class="surah-act-btn download-surah-btn" data-num="' + s.n + '" title="تحميل التلاوة">' +
              '      <i class="fa-solid fa-download"></i>' +
              '    </button>';
      html += '    <button type="button" class="surah-act-btn fav-surah-btn ' + (isFav ? 'is-fav' : '') + '" data-num="' + s.n + '" title="إضافة للمفضلة">' +
              '      <i class="fa-' + (isFav ? 'solid' : 'regular') + ' fa-heart"></i>' +
              '    </button>';
      html += '  </div>';
      html += '</div>';
    });

    grid.innerHTML = html;

    // ربط أزرار السور
    grid.querySelectorAll('.read-surah-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var num = parseInt(btn.getAttribute('data-num'), 10);
        openQuranReader(num);
      });
    });

    grid.querySelectorAll('.play-surah-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var num = parseInt(btn.getAttribute('data-num'), 10);
        playSurahAudio(num);
      });
    });

    grid.querySelectorAll('.download-surah-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var num = parseInt(btn.getAttribute('data-num'), 10);
        downloadSurahAudio(num, state.currentReciter);
      });
    });

    grid.querySelectorAll('.fav-surah-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var num = parseInt(btn.getAttribute('data-num'), 10);
        toggleFavoriteSurah(num, btn);
      });
    });

    grid.querySelectorAll('.surah-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var num = parseInt(card.getAttribute('data-num'), 10);
        openQuranReader(num);
      });
    });
  }

  function toggleFavoriteSurah(num, btn) {
    var idx = state.favoriteSurahs.indexOf(num);
    if (idx === -1) {
      state.favoriteSurahs.push(num);
      if (btn) {
        btn.classList.add('is-fav');
        btn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      }
      if (window.showToast) window.showToast('تمت إضافة السورة إلى المفضلة ❤️', 'success');
    } else {
      state.favoriteSurahs.splice(idx, 1);
      if (btn) {
        btn.classList.remove('is-fav');
        btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      }
      if (window.showToast) window.showToast('تمت إزالة السورة من المفضلة', 'info');
    }
    try {
      localStorage.setItem('omar_quran_favs', JSON.stringify(state.favoriteSurahs));
    } catch (_) {}
  }

  function initSurahDirectory() {
    var searchInput = document.getElementById('surahSearchInput');
    var clearBtn = document.getElementById('clearSurahSearch');
    var chips = document.querySelectorAll('.surah-chip');
    var reciterSelect = document.getElementById('reciterSelect');

    var currentFilter = 'all';

    renderSurahsGrid(currentFilter, '');

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        var val = searchInput.value;
        if (clearBtn) clearBtn.style.display = val ? 'inline-flex' : 'none';
        renderSurahsGrid(currentFilter, val);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        clearBtn.style.display = 'none';
        renderSurahsGrid(currentFilter, '');
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        currentFilter = chip.getAttribute('data-filter') || 'all';
        renderSurahsGrid(currentFilter, searchInput ? searchInput.value : '');
      });
    });

    if (reciterSelect) {
      reciterSelect.addEventListener('change', function () {
        state.currentReciter = reciterSelect.value;
        var rName = (RECITERS[state.currentReciter] && RECITERS[state.currentReciter].name) || '';
        var rLabel = document.getElementById('readerReciterName');
        if (rLabel) rLabel.textContent = 'بصوت ' + rName;
      });
    }

    // تحقق من وجود علامة مرجعية محفوظة
    checkBookmarkDisplay();
  }

  function checkBookmarkDisplay() {
    try {
      var savedBm = localStorage.getItem('omar_quran_bookmark');
      var resumeBox = document.getElementById('bookmarkResumeBox');
      var nameEl = document.getElementById('bookmarkSurahName');
      var ayahEl = document.getElementById('bookmarkAyahNum');
      var resumeBtn = document.getElementById('resumeReadBtn');

      if (savedBm && resumeBox && nameEl && ayahEl) {
        var bm = JSON.parse(savedBm);
        var sObj = SURAHS.find(function (s) { return s.n === bm.surah; });
        if (sObj) {
          nameEl.textContent = sObj.name;
          ayahEl.textContent = toArabicDigits(bm.ayah || 1);
          resumeBox.style.display = 'inline-flex';

          if (resumeBtn) {
            resumeBtn.onclick = function () {
              openQuranReader(bm.surah, bm.ayah);
            };
          }
        }
      }
    } catch (_) {}
  }

  // ────────────────────────── 3. قارئ المصحف الشريف الكامل (Quran Sanctuary Reader) ──────────────────────────
  function populateSurahAndReciterPickers() {
    var surahSelect = document.getElementById('readerSurahSelect');
    var reciterSelect = document.getElementById('readerReciterSelect');

    if (surahSelect && surahSelect.options.length === 0) {
      var sHtml = '';
      SURAHS.forEach(function (s) {
        sHtml += '<option value="' + s.n + '">' + toArabicDigits(s.n) + '. سورة ' + s.name + ' (' + toArabicDigits(s.verses) + ' آية - ج' + toArabicDigits(s.juz) + ')</option>';
      });
      surahSelect.innerHTML = sHtml;
    }

    if (reciterSelect && reciterSelect.options.length === 0) {
      var rHtml = '';
      for (var k in RECITERS) {
        if (RECITERS.hasOwnProperty(k)) {
          rHtml += '<option value="' + k + '">' + RECITERS[k].name + '</option>';
        }
      }
      reciterSelect.innerHTML = rHtml;
    }
  }

  async function openQuranReader(surahNumber, scrollToAyah) {
    var modal = document.getElementById('quranReaderModal');
    var titleEl = document.getElementById('readerSurahTitle');
    var bannerTitle = document.getElementById('bannerSurahTitle');
    var bannerDetails = document.getElementById('bannerSurahDetails');
    var metaEl = document.getElementById('readerSurahMeta');
    var juzBadge = document.getElementById('readerJuzBadge');
    var pageBadge = document.getElementById('readerPageBadge');
    var streamEl = document.getElementById('ayahsStream');
    var bismillahEl = document.getElementById('readerBismillah');
    var surahSelect = document.getElementById('readerSurahSelect');
    var reciterSelect = document.getElementById('readerReciterSelect');
    var progressBar = document.getElementById('readerProgressBar');
    var readerBody = document.getElementById('readerBody');

    if (!modal || !streamEl) return;

    populateSurahAndReciterPickers();

    var surah = SURAHS.find(function (s) { return s.n === surahNumber; });
    if (!surah) return;

    state.currentSurah = surah;

    if (titleEl) titleEl.textContent = 'سورة ' + surah.name;
    if (bannerTitle) bannerTitle.textContent = 'سورة ' + surah.name;
    if (bannerDetails) {
      bannerDetails.textContent = surah.type + ' • ' + toArabicDigits(surah.verses) + ' آيات • الجزء ' + toArabicDigits(surah.juz) + ' • الصفحة ' + toArabicDigits(surah.page);
    }
    if (metaEl) metaEl.textContent = surah.type + ' • ' + toArabicDigits(surah.verses) + ' آيات';
    if (juzBadge) juzBadge.textContent = 'الجزء ' + toArabicDigits(surah.juz);
    if (pageBadge) pageBadge.textContent = 'صفحة ' + toArabicDigits(surah.page);

    if (surahSelect) surahSelect.value = String(surah.n);
    if (reciterSelect) reciterSelect.value = state.currentReciter || 'minshawi';

    if (bismillahEl) {
      // سورة التوبة لا تبدأ بالبسملة
      bismillahEl.style.display = (surah.n === 9) ? 'none' : 'block';
    }

    if (progressBar) progressBar.style.width = '0%';

    // تطبيق الثيم وحجم ونوع الخط
    applyReaderStyles();

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // حفظ كآخر سورة تمت قراءتها للورد والاستئناف
    try {
      localStorage.setItem('omar_quran_bookmark', JSON.stringify({
        surah: surah.n,
        ayah: scrollToAyah || 1,
        time: Date.now()
      }));
      checkBookmarkDisplay();
    } catch (_) {}

    // تحميل آيات السورة
    streamEl.innerHTML = '<div class="quran-reader-loading"><i class="fa-solid fa-spinner fa-spin"></i><p>جاري تحميل نص سورة ' + surah.name + ' بالرسم العثماني المبارك...</p></div>';

    if (readerBody) readerBody.scrollTop = 0;

    try {
      var ayahs = await fetchSurahAyahs(surah.n);
      renderAyahs(ayahs, scrollToAyah);
    } catch (err) {
      console.warn('Failed to load surah text:', err);
      streamEl.innerHTML = '<div class="quran-reader-error" style="text-align:center;padding:50px 20px">' +
        '<i class="fa-solid fa-triangle-exclamation" style="font-size:2.4rem;color:var(--coral);margin-bottom:14px;display:block"></i>' +
        '<p style="font-size:1.15rem;margin:0 0 16px;color:var(--text);font-weight:600">تعذر تحميل نص السورة الكريمة حالياً</p>' +
        '<button type="button" class="primary-btn" id="retryLoadSurahBtn" style="padding:10px 26px;font-size:0.92rem;cursor:pointer">' +
        '<i class="fa-solid fa-rotate-right"></i> إعادة المحاولة الآن' +
        '</button>' +
        '</div>';
      var retryBtn = document.getElementById('retryLoadSurahBtn');
      if (retryBtn) {
        retryBtn.onclick = function () {
          openQuranReader(surah.n, scrollToAyah);
        };
      }
    }
  }

  function closeQuranReader() {
    var modal = document.getElementById('quranReaderModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
    stopAutoScroll();
  }

  async function fetchSurahAyahs(surahNum) {
    var cacheKey = 'omar_surah_text_' + surahNum;
    try {
      var cached = localStorage.getItem(cacheKey);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}

    // Tier 1: Internal API (Fast, Cached on Server, Zero CORS issues)
    try {
      var localRes = await fetch('/api/quran/surah/' + surahNum, { signal: AbortSignal.timeout(6000) });
      if (localRes.ok) {
        var localJson = await localRes.json();
        if (localJson && localJson.success && Array.isArray(localJson.ayahs) && localJson.ayahs.length > 0) {
          try { localStorage.setItem(cacheKey, JSON.stringify(localJson.ayahs)); } catch (_) {}
          return localJson.ayahs;
        }
      }
    } catch (e) {
      console.warn('Local quran API fallback triggered:', e);
    }

    // Tier 2: Quran.com API v4
    try {
      var qdcRes = await fetch('https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=' + surahNum, { signal: AbortSignal.timeout(6000) });
      if (qdcRes.ok) {
        var qdcJson = await qdcRes.json();
        if (qdcJson && Array.isArray(qdcJson.verses) && qdcJson.verses.length > 0) {
          var ayahs = qdcJson.verses.map(function (v, idx) {
            return { numberInSurah: idx + 1, text: v.text_uthmani };
          });
          if (surahNum !== 1 && ayahs.length > 0) {
            var bStr = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
            if (ayahs[0].text.indexOf(bStr) === 0) ayahs[0].text = ayahs[0].text.replace(bStr, '').trim();
          }
          try { localStorage.setItem(cacheKey, JSON.stringify(ayahs)); } catch (_) {}
          return ayahs;
        }
      }
    } catch (e) {
      console.warn('Quran.com API fallback triggered:', e);
    }

    // Tier 3: Al-Quran Cloud API
    try {
      var aqcRes = await fetch('https://api.alquran.cloud/v1/surah/' + surahNum + '/quran-uthmani', { signal: AbortSignal.timeout(6000) });
      if (aqcRes.ok) {
        var aqcJson = await aqcRes.json();
        if (aqcJson && aqcJson.data && Array.isArray(aqcJson.data.ayahs) && aqcJson.data.ayahs.length > 0) {
          var aqcAyahs = aqcJson.data.ayahs.map(function (a) {
            return { numberInSurah: a.numberInSurah, text: a.text };
          });
          if (surahNum !== 1 && aqcAyahs.length > 0) {
            var bStr2 = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
            if (aqcAyahs[0].text.indexOf(bStr2) === 0) aqcAyahs[0].text = aqcAyahs[0].text.replace(bStr2, '').trim();
          }
          try { localStorage.setItem(cacheKey, JSON.stringify(aqcAyahs)); } catch (_) {}
          return aqcAyahs;
        }
      }
    } catch (e) {
      console.warn('Al-Quran Cloud fallback triggered:', e);
    }

    throw new Error('All Quran API sources failed');
  }

  function renderAyahs(ayahs, targetAyah) {
    var streamEl = document.getElementById('ayahsStream');
    if (!streamEl) return;

    var html = '';
    ayahs.forEach(function (a) {
      var numInSurah = a.numberInSurah;
      html += '<span class="ayah-item" data-ayah-num="' + numInSurah + '" id="ayah-' + numInSurah + '" title="انقر لعرض الخيارات والتفسير">';
      html += '  <span class="ayah-text">' + a.text + '</span>';
      html += '  <span class="ayah-ornament" title="آية ' + toArabicDigits(numInSurah) + '" data-ayah="' + numInSurah + '">';
      html += '    <i class="ayah-marker-icon">﴿' + toArabicDigits(numInSurah) + '﴾</i>';
      html += '  </span>';
      html += '</span> ';
    });

    streamEl.innerHTML = html;

    // أحداث النقر على الآيات لفتح قائمة الإجراءات السريعة والتفسير
    streamEl.querySelectorAll('.ayah-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var aNum = parseInt(el.getAttribute('data-ayah-num'), 10);
        var text = el.querySelector('.ayah-text').textContent;
        openAyahActionModal(state.currentSurah.n, aNum, text);
      });
    });

    if (targetAyah) {
      setTimeout(function () {
        var targetEl = document.getElementById('ayah-' + targetAyah);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl.classList.add('ayah-highlight');
          setTimeout(function () { targetEl.classList.remove('ayah-highlight'); }, 3000);
        }
      }, 250);
    }
  }

  // ────────────────────────── قائمة إجراءات الآية التفاعلية ──────────────────────────
  function openAyahActionModal(surahNum, ayahNum, ayahText) {
    var modal = document.getElementById('ayahActionModal');
    var titleEl = document.getElementById('ayahActionTitle');
    var quoteEl = document.getElementById('ayahActionText');

    if (!modal) return;

    state.activeAyahModalData = {
      surah: surahNum,
      ayah: ayahNum,
      text: ayahText
    };

    var surahName = state.currentSurah ? state.currentSurah.name : '';
    if (titleEl) titleEl.textContent = 'سورة ' + surahName + ' • آية ' + toArabicDigits(ayahNum);
    if (quoteEl) quoteEl.textContent = '﴿' + ayahText + '﴾';

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeAyahActionModal() {
    var modal = document.getElementById('ayahActionModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function initAyahActionModal() {
    var closeBtn = document.getElementById('closeAyahActionBtn');
    var backdrop = document.getElementById('ayahActionBackdrop');
    var tafsirBtn = document.getElementById('ayahActTafsirBtn');
    var copyBtn = document.getElementById('ayahActCopyBtn');
    var shareBtn = document.getElementById('ayahActShareBtn');
    var bookmarkBtn = document.getElementById('ayahActBookmarkBtn');

    if (closeBtn) closeBtn.onclick = closeAyahActionModal;
    if (backdrop) backdrop.onclick = closeAyahActionModal;

    if (tafsirBtn) {
      tafsirBtn.onclick = function () {
        closeAyahActionModal();
        if (state.activeAyahModalData.surah) {
          showAyahTafsir(state.activeAyahModalData.surah, state.activeAyahModalData.ayah, state.activeAyahModalData.text);
        }
      };
    }

    if (copyBtn) {
      copyBtn.onclick = function () {
        if (state.activeAyahModalData.text) {
          var surahName = state.currentSurah ? state.currentSurah.name : '';
          var fullText = '﴿' + state.activeAyahModalData.text + '﴾ [سورة ' + surahName + ': ' + state.activeAyahModalData.ayah + ']';
          navigator.clipboard.writeText(fullText).then(function () {
            if (window.showToast) window.showToast('تم نسخ نص الآية الكريمة 📋', 'success');
            closeAyahActionModal();
          });
        }
      };
    }

    if (shareBtn) {
      shareBtn.onclick = function () {
        if (state.activeAyahModalData.text) {
          var surahName = state.currentSurah ? state.currentSurah.name : '';
          var text = '﴿' + state.activeAyahModalData.text + '﴾\n[سورة ' + surahName + ' - الآية ' + state.activeAyahModalData.ayah + ']\n\n— واحة القرآن | مؤسسة د. عمر هشام الخيرية\n' + window.location.origin + '/quran';
          window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
          closeAyahActionModal();
        }
      };
    }

    if (bookmarkBtn) {
      bookmarkBtn.onclick = function () {
        if (state.activeAyahModalData.surah) {
          try {
            localStorage.setItem('omar_quran_bookmark', JSON.stringify({
              surah: state.activeAyahModalData.surah,
              ayah: state.activeAyahModalData.ayah,
              time: Date.now()
            }));
            checkBookmarkDisplay();
            if (window.showToast) window.showToast('تم حفظ العلامة المرجعية عند الآية ' + toArabicDigits(state.activeAyahModalData.ayah) + ' 🔖', 'success');
            closeAyahActionModal();
          } catch (_) {}
        }
      };
    }
  }

  async function showAyahTafsir(surahNum, ayahNum, ayahText) {
    var modal = document.getElementById('tafsirModal');
    var titleEl = document.getElementById('tafsirAyahTitle');
    var quoteEl = document.getElementById('tafsirAyahText');
    var expEl = document.getElementById('tafsirExplanationText');

    if (!modal) return;

    if (titleEl) titleEl.textContent = 'تفسير الآية (' + toArabicDigits(ayahNum) + ') من سورة ' + (state.currentSurah ? state.currentSurah.name : '');
    if (quoteEl) quoteEl.textContent = '﴿' + ayahText + '﴾';
    if (expEl) expEl.innerHTML = '<div style="text-align:center;padding:25px 0"><i class="fa-solid fa-spinner fa-spin" style="color:var(--emerald);font-size:1.5rem"></i><p style="margin-top:10px;color:var(--muted)">جاري جلب التفسير الميسر...</p></div>';

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    var cacheKey = 'omar_tafsir_' + surahNum + '_' + ayahNum;
    try {
      var cached = localStorage.getItem(cacheKey);
      if (cached) {
        if (expEl) expEl.innerHTML = '<p class="tafsir-paragraph">' + cached + '</p>';
        return;
      }
    } catch (_) {}

    var tafsirText = '';

    // Tier 1: Internal API
    try {
      var localRes = await fetch('/api/quran/tafsir/' + surahNum + '/' + ayahNum, { signal: AbortSignal.timeout(5000) });
      if (localRes.ok) {
        var localJson = await localRes.json();
        if (localJson && localJson.success && localJson.tafsir) {
          tafsirText = localJson.tafsir;
        }
      }
    } catch (_) {}

    // Tier 2: QuranEnc
    if (!tafsirText) {
      try {
        var qeRes = await fetch('https://quranenc.com/api/v1/translation/aya/arabic_moyassar/' + surahNum + '/' + ayahNum, { signal: AbortSignal.timeout(5000) });
        if (qeRes.ok) {
          var qeJson = await qeRes.json();
          if (qeJson && qeJson.result && qeJson.result.translation) {
            tafsirText = qeJson.result.translation;
          }
        }
      } catch (_) {}
    }

    // Tier 3: Al-Quran Cloud
    if (!tafsirText) {
      try {
        var aqcRes = await fetch('https://api.alquran.cloud/v1/ayah/' + surahNum + ':' + ayahNum + '/ar.muyassar', { signal: AbortSignal.timeout(5000) });
        if (aqcRes.ok) {
          var aqcJson = await aqcRes.json();
          if (aqcJson && aqcJson.data && aqcJson.data.text) {
            tafsirText = aqcJson.data.text;
          }
        }
      } catch (_) {}
    }

    if (tafsirText) {
      try { localStorage.setItem(cacheKey, tafsirText); } catch (_) {}
      if (expEl) expEl.innerHTML = '<p class="tafsir-paragraph">' + tafsirText + '</p>';
    } else {
      if (expEl) expEl.innerHTML = '<p class="tafsir-paragraph" style="color:var(--coral)">تعذر تحميل التفسير في الوقت الحالي، يرجى المحاولة لاحقاً.</p>';
    }
  }

  function applyReaderStyles() {
    var dialog = document.querySelector('.quran-reader-dialog');
    var fontDisplay = document.getElementById('fontSizeDisplay');
    var streamEl = document.getElementById('ayahsStream');
    var familySelect = document.getElementById('readerFontFamilySelect');

    if (fontDisplay) fontDisplay.textContent = state.fontSize + 'px';
    if (streamEl) {
      streamEl.style.fontSize = state.fontSize + 'px';
      // تطبيق نوع الخط المختار
      streamEl.classList.remove('font-amiri-quran', 'font-noto-naskh', 'font-scheherazade', 'font-amiri');
      streamEl.classList.add(state.fontFamily || 'font-amiri-quran');
    }

    if (familySelect) {
      familySelect.value = state.fontFamily || 'font-amiri-quran';
    }

    if (dialog) {
      dialog.classList.remove('theme-parchment', 'theme-dark', 'theme-white', 'theme-sage');
      dialog.classList.add('theme-' + (state.theme || 'parchment'));
    }

    document.querySelectorAll('.theme-dot').forEach(function (dot) {
      if (dot.getAttribute('data-theme') === state.theme) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // ────────────────────────── ميزات القراءة المتقدمة (Auto-Scroll & WakeLock) ──────────────────────────
  function toggleAutoScroll() {
    var btn = document.getElementById('autoScrollBtn');
    var readerBody = document.getElementById('readerBody');
    if (!readerBody) return;

    if (state.isAutoScrolling) {
      stopAutoScroll();
    } else {
      state.isAutoScrolling = true;
      if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fa-solid fa-pause"></i> <span class="btn-text-sm">إيقاف التمرير</span>';
      }
      state.autoScrollTimer = setInterval(function () {
        if (readerBody.scrollTop + readerBody.clientHeight >= readerBody.scrollHeight - 5) {
          stopAutoScroll();
        } else {
          readerBody.scrollTop += 1;
        }
      }, 40);
      if (window.showToast) window.showToast('تم تفعيل التمرير التلقائي الهادئ 📜', 'info');
    }
  }

  function stopAutoScroll() {
    var btn = document.getElementById('autoScrollBtn');
    if (state.autoScrollTimer) {
      clearInterval(state.autoScrollTimer);
      state.autoScrollTimer = null;
    }
    state.isAutoScrolling = false;
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '<i class="fa-solid fa-angles-down"></i> <span class="btn-text-sm">تمرير تلقائي</span>';
    }
  }

  async function toggleScreenWakeLock() {
    var btn = document.getElementById('screenWakeLockBtn');
    if ('wakeLock' in navigator) {
      try {
        if (!state.wakeLock) {
          state.wakeLock = await navigator.wakeLock.request('screen');
          if (btn) btn.classList.add('active');
          if (window.showToast) window.showToast('تم تفعيل إبقاء الشاشة مضيئة أثناء القراءة 💡', 'success');
          state.wakeLock.addEventListener('release', function () {
            state.wakeLock = null;
            if (btn) btn.classList.remove('active');
          });
        } else {
          await state.wakeLock.release();
          state.wakeLock = null;
          if (btn) btn.classList.remove('active');
          if (window.showToast) window.showToast('تم إلغاء قفل الشاشة', 'info');
        }
      } catch (err) {
        console.warn('Wake Lock error:', err);
      }
    } else {
      if (window.showToast) window.showToast('ميزة إبقاء الشاشة غير مدعومة على متصفحك', 'info');
    }
  }

  function toggleFullScreenReader() {
    var modal = document.getElementById('quranReaderModal');
    var btn = document.getElementById('fullScreenToggleBtn');
    if (!modal) return;

    if (!document.fullscreenElement) {
      if (modal.requestFullscreen) {
        modal.requestFullscreen().catch(function () {});
      } else if (modal.webkitRequestFullscreen) {
        modal.webkitRequestFullscreen();
      }
      if (btn) btn.innerHTML = '<i class="fa-solid fa-compress"></i>';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
      if (btn) btn.innerHTML = '<i class="fa-solid fa-expand"></i>';
    }
  }

  function initReaderControls() {
    var closeBtn = document.getElementById('closeReaderBtn');
    var backdrop = document.getElementById('quranReaderBackdrop');
    var fontDec = document.getElementById('fontDecreaseBtn');
    var fontInc = document.getElementById('fontIncreaseBtn');
    var fontSelect = document.getElementById('readerFontFamilySelect');
    var themeDots = document.querySelectorAll('.theme-dot');
    var prevBtn = document.getElementById('prevSurahBtn');
    var nextBtn = document.getElementById('nextSurahBtn');
    var playSurahBtn = document.getElementById('readerPlaySurahBtn');
    var closeTafsir = document.getElementById('closeTafsirBtn');
    var tafsirDoneBtn = document.getElementById('tafsirDoneBtn');
    var tafsirBackdrop = document.getElementById('tafsirBackdrop');
    var surahSelect = document.getElementById('readerSurahSelect');
    var reciterSelect = document.getElementById('readerReciterSelect');
    var ayahJumpBtn = document.getElementById('readerAyahJumpBtn');
    var ayahJumpInput = document.getElementById('readerAyahJumpInput');
    var autoScrollBtn = document.getElementById('autoScrollBtn');
    var wakeLockBtn = document.getElementById('screenWakeLockBtn');
    var fullScreenBtn = document.getElementById('fullScreenToggleBtn');
    var bookmarkBtn = document.getElementById('readerBookmarkBtn');
    var shareSurahBtn = document.getElementById('readerShareSurahBtn');
    var readerBody = document.getElementById('readerBody');
    var progressBar = document.getElementById('readerProgressBar');

    if (closeBtn) closeBtn.onclick = closeQuranReader;
    if (backdrop) backdrop.onclick = closeQuranReader;

    // تتبع شريط تقدم القراءة في السورة
    if (readerBody && progressBar) {
      readerBody.addEventListener('scroll', function () {
        var totalScroll = readerBody.scrollHeight - readerBody.clientHeight;
        if (totalScroll > 0) {
          var pct = Math.min(100, Math.max(0, (readerBody.scrollTop / totalScroll) * 100));
          progressBar.style.width = pct + '%';
        }
      });
    }

    // الانتقال السريع لسورة أخرى
    if (surahSelect) {
      surahSelect.addEventListener('change', function () {
        var targetNum = parseInt(surahSelect.value, 10);
        if (targetNum) openQuranReader(targetNum);
      });
    }

    // الانتقال لرقم آية
    function jumpToAyahHandler() {
      if (ayahJumpInput && ayahJumpInput.value) {
        var val = parseInt(ayahJumpInput.value, 10);
        if (val > 0) {
          var targetEl = document.getElementById('ayah-' + val);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetEl.classList.add('ayah-highlight');
            setTimeout(function () { targetEl.classList.remove('ayah-highlight'); }, 3000);
          } else {
            if (window.showToast) window.showToast('رقم الآية غير موجود في هذه السورة', 'warning');
          }
        }
      }
    }
    if (ayahJumpBtn) ayahJumpBtn.onclick = jumpToAyahHandler;
    if (ayahJumpInput) {
      ayahJumpInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') jumpToAyahHandler();
      });
    }

    // تبديل نوع الخط
    if (fontSelect) {
      fontSelect.addEventListener('change', function () {
        state.fontFamily = fontSelect.value;
        applyReaderStyles();
        try { localStorage.setItem('omar_quran_font_family', state.fontFamily); } catch (_) {}
      });
    }

    // تبديل القارئ من داخل المصحف
    if (reciterSelect) {
      reciterSelect.addEventListener('change', function () {
        state.currentReciter = reciterSelect.value;
        try { localStorage.setItem('omar_quran_reciter', state.currentReciter); } catch (_) {}
        if (state.isPlayingAudio && state.currentSurah) {
          playSurahAudio(state.currentSurah.n, 0);
        }
      });
    }

    // تحكم حجم الخط
    if (fontDec) {
      fontDec.onclick = function () {
        if (state.fontSize > 18) {
          state.fontSize -= 2;
          applyReaderStyles();
          try { localStorage.setItem('omar_quran_reader_fontsize', state.fontSize); } catch (_) {}
        }
      };
    }

    if (fontInc) {
      fontInc.onclick = function () {
        if (state.fontSize < 54) {
          state.fontSize += 2;
          applyReaderStyles();
          try { localStorage.setItem('omar_quran_reader_fontsize', state.fontSize); } catch (_) {}
        }
      };
    }

    // تغيير الثيمات
    themeDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        state.theme = dot.getAttribute('data-theme') || 'parchment';
        applyReaderStyles();
        try { localStorage.setItem('omar_quran_reader_theme', state.theme); } catch (_) {}
      });
    });

    if (autoScrollBtn) autoScrollBtn.onclick = toggleAutoScroll;
    if (wakeLockBtn) wakeLockBtn.onclick = toggleScreenWakeLock;
    if (fullScreenBtn) fullScreenBtn.onclick = toggleFullScreenReader;

    // حفظ علامة مرجعية ومشاركة
    if (bookmarkBtn) {
      bookmarkBtn.onclick = function () {
        if (state.currentSurah) {
          try {
            localStorage.setItem('omar_quran_bookmark', JSON.stringify({
              surah: state.currentSurah.n,
              ayah: 1,
              time: Date.now()
            }));
            checkBookmarkDisplay();
            if (window.showToast) window.showToast('تم حفظ سورة ' + state.currentSurah.name + ' كعلامة مرجعية 🔖', 'success');
          } catch (_) {}
        }
      };
    }

    if (shareSurahBtn) {
      shareSurahBtn.onclick = function () {
        if (state.currentSurah) {
          var text = 'سورة ' + state.currentSurah.name + ' (' + state.currentSurah.type + ' • ' + toArabicDigits(state.currentSurah.verses) + ' آيات)\n\n— اقرأ واستمع في واحة القرآن بمؤسسة د. عمر هشام:\n' + window.location.origin + '/quran#surah=' + state.currentSurah.n;
          window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
        }
      };
    }

    if (prevBtn) {
      prevBtn.onclick = function () {
        if (state.currentSurah && state.currentSurah.n > 1) {
          openQuranReader(state.currentSurah.n - 1);
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = function () {
        if (state.currentSurah && state.currentSurah.n < 114) {
          openQuranReader(state.currentSurah.n + 1);
        }
      };
    }

    var readerScrubber = document.getElementById('readerScrubber');
    var readerCurTime = document.getElementById('readerCurrentTime');
    var readerTotTime = document.getElementById('readerTotalTime');
    var readerRewindBtn = document.getElementById('readerRewindBtn');
    var readerForwardBtn = document.getElementById('readerForwardBtn');
    var readerDownloadBtn = document.getElementById('readerDownloadSurahBtn');

    // شريط التقديم والترجيع في الفوتر
    if (readerScrubber) {
      readerScrubber.addEventListener('input', function () {
        isUserSeeking = true;
        if (state.audioElement.duration && !isNaN(state.audioElement.duration)) {
          var previewSec = (parseFloat(readerScrubber.value) / 100) * state.audioElement.duration;
          var formatted = formatTime(previewSec);
          if (readerCurTime) readerCurTime.textContent = formatted;
          var fCurTime = document.getElementById('floatingCurrentTime');
          if (fCurTime) fCurTime.textContent = formatted;
        }
      });

      readerScrubber.addEventListener('change', function () {
        if (state.audioElement.duration && !isNaN(state.audioElement.duration)) {
          var targetSec = (parseFloat(readerScrubber.value) / 100) * state.audioElement.duration;
          applySeekToAudio(targetSec);
        }
        clearTimeout(seekReleaseTimer);
        seekReleaseTimer = setTimeout(function () {
          isUserSeeking = false;
        }, 350);
      });
    }

    // تقديم وترجيع ١٠ ثوانٍ
    if (readerRewindBtn) {
      readerRewindBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (state.audioElement.src) {
          var cur = state.audioElement.currentTime || 0;
          applySeekToAudio(cur - 10);
        }
      };
    }

    if (readerForwardBtn) {
      readerForwardBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (state.audioElement.src) {
          var cur = state.audioElement.currentTime || 0;
          applySeekToAudio(cur + 10);
        }
      };
    }

    // تحميل السورة بصوت القارئ المختار
    if (readerDownloadBtn) {
      readerDownloadBtn.onclick = function () {
        if (state.currentSurah) {
          downloadSurahAudio(state.currentSurah.n, state.currentReciter);
        }
      };
    }

    if (playSurahBtn) {
      playSurahBtn.onclick = function () {
        if (state.currentSurah) {
          if (state.isPlayingAudio && currentAudioSurahNum === state.currentSurah.n) {
            state.audioElement.pause();
          } else if (!state.isPlayingAudio && currentAudioSurahNum === state.currentSurah.n && state.audioElement.src) {
            state.audioElement.play().catch(function () {
              playSurahAudio(state.currentSurah.n, 0);
            });
          } else {
            playSurahAudio(state.currentSurah.n, 0);
          }
        }
      };
    }

    // إغلاق مودال التفسير
    if (closeTafsir) {
      closeTafsir.onclick = function () {
        var tm = document.getElementById('tafsirModal');
        if (tm) tm.classList.remove('open');
      };
    }
    if (tafsirDoneBtn) {
      tafsirDoneBtn.onclick = function () {
        var tm = document.getElementById('tafsirModal');
        if (tm) tm.classList.remove('open');
      };
    }
    if (tafsirBackdrop) {
      tafsirBackdrop.onclick = function () {
        var tm = document.getElementById('tafsirModal');
        if (tm) tm.classList.remove('open');
      };
    }

    // إغلاق عبر زر الهروب Esc
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var am = document.getElementById('ayahActionModal');
        if (am && am.classList.contains('open')) {
          closeAyahActionModal();
          return;
        }
        var tm = document.getElementById('tafsirModal');
        if (tm && tm.classList.contains('open')) {
          tm.classList.remove('open');
          return;
        }
        var qm = document.getElementById('quranReaderModal');
        if (qm && qm.classList.contains('open')) {
          closeQuranReader();
        }
      }
    });

    initAyahActionModal();
  }

  // ────────────────────────── 4. مشغل الصوتيات والتلاوة ──────────────────────────
  var currentAudioCdnIndex = 0;
  var currentAudioSurahNum = 0;
  var isUserSeeking = false;
  var seekReleaseTimer = null;

  function applySeekToAudio(targetSeconds) {
    if (!state.audioElement || !state.audioElement.src) return;
    var dur = state.audioElement.duration;
    if (!dur || isNaN(dur) || !isFinite(dur)) return;

    var safeTime = Math.max(0, Math.min(dur - 0.2, targetSeconds));
    try {
      state.audioElement.currentTime = safeTime;
    } catch (e) {
      console.warn('Seek error:', e);
    }

    var pct = (safeTime / dur) * 100;
    var formatted = formatTime(safeTime);
    var formattedTot = formatTime(dur);

    var rScrubber = document.getElementById('readerScrubber');
    var rCurTime = document.getElementById('readerCurrentTime');
    var rTotTime = document.getElementById('readerTotalTime');
    var fScrubber = document.getElementById('floatingScrubber');
    var fCurTime = document.getElementById('floatingCurrentTime');
    var fTotTime = document.getElementById('floatingTotalTime');

    if (rScrubber) rScrubber.value = pct;
    if (rCurTime) rCurTime.textContent = formatted;
    if (rTotTime) rTotTime.textContent = formattedTot;
    if (fScrubber) fScrubber.value = pct;
    if (fCurTime) fCurTime.textContent = formatted;
    if (fTotTime) fTotTime.textContent = formattedTot;
  }

  function updateAllAudioButtons(isPlaying, isBuffering) {
    var floatingBtn = document.getElementById('floatingPlayPauseBtn');
    var readerBtn = document.getElementById('readerPlaySurahBtn');

    var iconHtml = isBuffering
      ? '<i class="fa-solid fa-spinner fa-spin"></i>'
      : (isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>');

    if (floatingBtn) floatingBtn.innerHTML = iconHtml;
    if (readerBtn) {
      var text = isBuffering ? 'جاري التحميل...' : (isPlaying ? 'إيقاف مؤقت' : 'استماع للسورة');
      readerBtn.innerHTML = iconHtml + ' <span>' + text + '</span>';
    }

    // تحديث أزرار بطاقات السور في الفهرس
    document.querySelectorAll('.play-surah-btn').forEach(function (b) {
      var num = parseInt(b.getAttribute('data-num'), 10);
      if (num === currentAudioSurahNum && isPlaying) {
        b.innerHTML = '<i class="fa-solid fa-pause"></i>';
        b.classList.add('active');
      } else {
        b.innerHTML = '<i class="fa-solid fa-play"></i>';
        b.classList.remove('active');
      }
    });
  }

  function playSurahAudio(surahNum, cdnIndex) {
    var surah = SURAHS.find(function (s) { return s.n === surahNum; });
    if (!surah) return;

    cdnIndex = cdnIndex || 0;
    currentAudioCdnIndex = cdnIndex;
    currentAudioSurahNum = surahNum;
    state.currentSurah = surah;

    var reciterKey = state.currentReciter || 'minshawi';
    var reciterObj = RECITERS[reciterKey] || RECITERS.minshawi;
    var urlsList = reciterObj.urls || [reciterObj.url];
    var baseUrl = urlsList[cdnIndex % urlsList.length];

    var numStr = (surah.n < 10 ? '00' : (surah.n < 100 ? '0' : '')) + surah.n;
    var audioUrl = baseUrl.startsWith('/')
      ? baseUrl + numStr
      : baseUrl + numStr + '.mp3';

    // إيقاف بث الإذاعة إذا كانت تعمل
    stopRadio();

    var floatingBar = document.getElementById('quranFloatingPlayer');
    var titleEl = document.getElementById('floatingPlayerSurah');
    var reciterEl = document.getElementById('floatingPlayerReciter');

    if (titleEl) titleEl.textContent = 'سورة ' + surah.name;
    if (reciterEl) reciterEl.textContent = reciterObj.name + (cdnIndex > 0 ? ' (خادم ' + (cdnIndex + 1) + ')' : '');
    if (floatingBar) floatingBar.style.display = 'block';

    updateAllAudioButtons(false, true);

    try {
      state.audioElement.pause();
    } catch (_) {}

    // عدم استخدام crossOrigin لمنع حظر الوسائط من خوادم التلاوات
    state.audioElement.removeAttribute('crossorigin');
    state.audioElement.src = audioUrl;

    state.audioElement.oncanplay = function () {
      if (reciterEl) reciterEl.textContent = reciterObj.name;
    };

    state.audioElement.onplaying = function () {
      state.isPlayingAudio = true;
      updateAllAudioButtons(true, false);
      if (reciterEl) reciterEl.textContent = reciterObj.name;
    };

    state.audioElement.onwaiting = function () {
      updateAllAudioButtons(state.isPlayingAudio, true);
    };

    state.audioElement.onpause = function () {
      state.isPlayingAudio = false;
      updateAllAudioButtons(false, false);
    };

    state.audioElement.onerror = function () {
      console.warn('Audio play error on source:', audioUrl);
      if (cdnIndex + 1 < urlsList.length) {
        console.log('Failing over to next audio CDN:', cdnIndex + 1);
        playSurahAudio(surahNum, cdnIndex + 1);
      } else {
        state.isPlayingAudio = false;
        updateAllAudioButtons(false, false);
        if (reciterEl) reciterEl.textContent = 'تعذر تشغيل الصوت';
        if (window.showToast) window.showToast('تعذر تشغيل التلاوة، يرجى اختيار قارئ آخر', 'warning');
      }
    };

    state.audioElement.onended = function () {
      state.isPlayingAudio = false;
      updateAllAudioButtons(false, false);
      if (surah.n < 114) {
        playSurahAudio(surah.n + 1, 0);
      }
    };

    var playPromise = state.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.then(function () {
        state.isPlayingAudio = true;
        updateAllAudioButtons(true, false);
      }).catch(function (e) {
        console.warn('Audio play promise error:', e);
        if (cdnIndex + 1 < urlsList.length) {
          playSurahAudio(surahNum, cdnIndex + 1);
        }
      });
    }
  }

  function downloadSurahAudio(surahNum, reciterKey) {
    surahNum = surahNum || (state.currentSurah ? state.currentSurah.n : 1);
    reciterKey = reciterKey || state.currentReciter || 'minshawi';
    var surah = SURAHS.find(function (s) { return s.n === surahNum; }) || { n: surahNum, name: 'السورة' };
    var reciterObj = RECITERS[reciterKey] || RECITERS.minshawi;
    var reciterName = reciterObj.name.split('(')[0].trim();
    var numStr = (surah.n < 10 ? '00' : (surah.n < 100 ? '0' : '')) + surah.n;

    var downloadUrl = '/api/quran/audio/' + encodeURIComponent(reciterKey) + '/' + numStr + '?download=1';
    var fileName = 'سورة_' + surah.name.replace(/\s+/g, '_') + '_' + reciterName.replace(/\s+/g, '_') + '.mp3';

    if (window.showToast) {
      window.showToast('جاري بدء تحميل سورة ' + surah.name + ' بصوت ' + reciterName + ' 📥', 'info');
    }

    var a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 1000);
  }

  function initFloatingPlayer() {
    var playPauseBtn = document.getElementById('floatingPlayPauseBtn');
    var scrubber = document.getElementById('floatingScrubber');
    var curTime = document.getElementById('floatingCurrentTime');
    var totTime = document.getElementById('floatingTotalTime');
    var closeBtn = document.getElementById('floatingCloseBtn');
    var muteBtn = document.getElementById('floatingMuteBtn');
    var prevBtn = document.getElementById('floatingPrevBtn');
    var nextBtn = document.getElementById('floatingNextBtn');

    if (playPauseBtn) {
      playPauseBtn.onclick = function () {
        if (state.isPlayingAudio) {
          state.audioElement.pause();
        } else {
          if (state.audioElement.src) {
            state.audioElement.play().catch(function () {
              if (currentAudioSurahNum) {
                playSurahAudio(currentAudioSurahNum, currentAudioCdnIndex);
              }
            });
          } else if (currentAudioSurahNum) {
            playSurahAudio(currentAudioSurahNum, 0);
          } else {
            playSurahAudio(1, 0);
          }
        }
      };
    }

    state.audioElement.ontimeupdate = function () {
      if (isUserSeeking) return;
      if (state.audioElement.duration && !isNaN(state.audioElement.duration)) {
        var cur = state.audioElement.currentTime || 0;
        var dur = state.audioElement.duration;
        var pct = (cur / dur) * 100;
        var formattedCurrent = formatTime(cur);
        var formattedTotal = formatTime(dur);

        // Floating Player
        if (scrubber) scrubber.value = pct;
        if (curTime) curTime.textContent = formattedCurrent;
        if (totTime) totTime.textContent = formattedTotal;

        // Reader Footer Timeline
        var rScrubber = document.getElementById('readerScrubber');
        var rCurTime = document.getElementById('readerCurrentTime');
        var rTotTime = document.getElementById('readerTotalTime');
        if (rScrubber) rScrubber.value = pct;
        if (rCurTime) rCurTime.textContent = formattedCurrent;
        if (rTotTime) rTotTime.textContent = formattedTotal;
      }
    };

    if (scrubber) {
      scrubber.addEventListener('input', function () {
        isUserSeeking = true;
        if (state.audioElement.duration && !isNaN(state.audioElement.duration)) {
          var previewSec = (parseFloat(scrubber.value) / 100) * state.audioElement.duration;
          var formatted = formatTime(previewSec);
          if (curTime) curTime.textContent = formatted;
          var rCurTime = document.getElementById('readerCurrentTime');
          if (rCurTime) rCurTime.textContent = formatted;
        }
      });

      scrubber.addEventListener('change', function () {
        if (state.audioElement.duration && !isNaN(state.audioElement.duration)) {
          var targetSec = (parseFloat(scrubber.value) / 100) * state.audioElement.duration;
          applySeekToAudio(targetSec);
        }
        clearTimeout(seekReleaseTimer);
        seekReleaseTimer = setTimeout(function () {
          isUserSeeking = false;
        }, 350);
      });
    }

    if (muteBtn) {
      muteBtn.onclick = function () {
        state.audioElement.muted = !state.audioElement.muted;
        muteBtn.innerHTML = state.audioElement.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
      };
    }

    if (prevBtn) {
      prevBtn.onclick = function () {
        if (currentAudioSurahNum > 1) {
          playSurahAudio(currentAudioSurahNum - 1, 0);
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = function () {
        if (currentAudioSurahNum < 114) {
          playSurahAudio(currentAudioSurahNum + 1, 0);
        }
      };
    }

    if (closeBtn) {
      closeBtn.onclick = function () {
        try { state.audioElement.pause(); } catch (_) {}
        state.isPlayingAudio = false;
        updateAllAudioButtons(false, false);
        var floatingBar = document.getElementById('quranFloatingPlayer');
        if (floatingBar) floatingBar.style.display = 'none';
      };
    }
  }

  // ────────────────────────── 5. الأذكار وحصن المسلم ──────────────────────────
  function renderAdhkarList() {
    var container = document.getElementById('adhkarCardsList');
    var titleEl = document.getElementById('adhkarCurrentTitle');
    var subtitleEl = document.getElementById('adhkarSubtitle');
    var doneEl = document.getElementById('adhkarDoneCount');
    var totalEl = document.getElementById('adhkarTotalCount');

    if (!container) return;

    var list = ADHKAR_DATA[state.currentAdhkarCat] || [];
    var titles = {
      morning: 'أذكار الصباح المباركة',
      evening: 'أذكار المساء وحصن الليل',
      after_prayer: 'أذكار ما بعد الصلوات المفروضة',
      sleep: 'أذكار النوم والسكينة',
      waking: 'أدعية الاستيقاظ من النوم',
      food_travel: 'أذكار الطعام والشراب والسفر',
      ruqyah: 'آيات وأدعية الرقية الشرعية'
    };

    if (titleEl) titleEl.textContent = titles[state.currentAdhkarCat] || 'الأذكار';
    if (totalEl) totalEl.textContent = toArabicDigits(list.length);

    var doneCount = 0;
    var html = '';

    list.forEach(function (item) {
      var currentRem = state.adhkarCounters[item.id] !== undefined ? state.adhkarCounters[item.id] : item.count;
      var isCompleted = currentRem <= 0;
      if (isCompleted) doneCount++;

      html += '<div class="adhkar-item-card ' + (isCompleted ? 'completed' : '') + '" id="adhkar-card-' + item.id + '">';
      html += '  <div class="adhkar-text-box">';
      html += '    <p class="adhkar-main-text">' + item.text + '</p>';
      if (item.virtue) {
        html += '    <div class="adhkar-virtue-tag"><i class="fa-solid fa-star-and-crescent"></i> <span>' + item.virtue + '</span></div>';
      }
      html += '  </div>';
      html += '  <div class="adhkar-action-box">';
      html += '    <button type="button" class="adhkar-count-btn ' + (isCompleted ? 'done' : '') + '" data-id="' + item.id + '" data-target="' + item.count + '">';
      html += '      <span class="count-curr">' + toArabicDigits(currentRem) + '</span>';
      html += '      <span class="count-sub">' + (isCompleted ? 'تم بحمد الله' : 'اضغط للتكرار') + '</span>';
      html += '    </button>';
      html += '  </div>';
      html += '</div>';
    });

    container.innerHTML = html;
    if (doneEl) doneEl.textContent = toArabicDigits(doneCount);

    // ربط نقرات عدادات الأذكار
    container.querySelectorAll('.adhkar-count-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var target = parseInt(btn.getAttribute('data-target'), 10);
        var rem = state.adhkarCounters[id] !== undefined ? state.adhkarCounters[id] : target;

        if (rem > 0) {
          rem--;
          state.adhkarCounters[id] = rem;
          playClickSound();
          triggerHaptic(25);

          var currSpan = btn.querySelector('.count-curr');
          var subSpan = btn.querySelector('.count-sub');
          var card = document.getElementById('adhkar-card-' + id);

          if (currSpan) currSpan.textContent = toArabicDigits(rem);

          if (rem === 0) {
            btn.classList.add('done');
            if (card) card.classList.add('completed');
            if (subSpan) subSpan.textContent = 'تم بحمد الله';
            triggerHaptic(100);
            updateAdhkarDoneSummary();
          }
        }
      });
    });
  }

  function updateAdhkarDoneSummary() {
    var list = ADHKAR_DATA[state.currentAdhkarCat] || [];
    var doneCount = 0;
    list.forEach(function (i) {
      if (state.adhkarCounters[i.id] === 0) doneCount++;
    });
    var doneEl = document.getElementById('adhkarDoneCount');
    if (doneEl) doneEl.textContent = toArabicDigits(doneCount);

    if (doneCount === list.length && list.length > 0) {
      if (window.showToast) window.showToast('هنيئاً لك! أتممت جميع أذكار هذه القائمة تقبل الله منك 🤲', 'success');
    }
  }

  function initAdhkarSection() {
    var catBtns = document.querySelectorAll('.adhkar-cat-btn');
    var resetBtn = document.getElementById('resetAdhkarBtn');

    catBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        catBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.currentAdhkarCat = btn.getAttribute('data-cat') || 'morning';
        renderAdhkarList();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        var list = ADHKAR_DATA[state.currentAdhkarCat] || [];
        list.forEach(function (i) {
          state.adhkarCounters[i.id] = i.count;
        });
        renderAdhkarList();
        if (window.showToast) window.showToast('تمت إعادة تعيين عدادات الأذكار', 'info');
      });
    }

    renderAdhkarList();
  }

  // ────────────────────────── 6. السبحة الإلكترونية الذكية ──────────────────────────
  function updateTasbeehDisplay() {
    var countEl = document.getElementById('tasbeehCount');
    var targetEl = document.getElementById('tasbeehTargetDisplay');
    var activeZikrEl = document.getElementById('activeTasbeehText');
    var ring = document.getElementById('tasbeehProgressRing');
    var todayEl = document.getElementById('todayTasbeehTotal');
    var allTimeEl = document.getElementById('allTimeTasbeehTotal');
    var targetsEl = document.getElementById('completedTargetsCount');

    if (countEl) countEl.textContent = toArabicDigits(state.tasbeehCount);
    if (targetEl) targetEl.textContent = state.tasbeehTarget > 0 ? toArabicDigits(state.tasbeehTarget) : 'مفتوح ∞';
    if (activeZikrEl) activeZikrEl.textContent = state.activeZikrText;

    if (todayEl) todayEl.textContent = toArabicDigits(state.todayTasbeeh);
    if (allTimeEl) allTimeEl.textContent = toArabicDigits(state.allTimeTasbeeh);
    if (targetsEl) targetsEl.textContent = toArabicDigits(state.targetsDone);

    // تحديث الدائرة التقدمية SVG
    if (ring) {
      var radius = 105;
      var circumference = 2 * Math.PI * radius;
      var progress = state.tasbeehTarget > 0 ? (state.tasbeehCount % state.tasbeehTarget) / state.tasbeehTarget : 1;
      if (state.tasbeehTarget > 0 && state.tasbeehCount > 0 && state.tasbeehCount % state.tasbeehTarget === 0) progress = 1;
      var offset = circumference - (progress * circumference);
      ring.style.strokeDasharray = circumference;
      ring.style.strokeDashoffset = offset;
    }
  }

  function incrementTasbeeh() {
    state.tasbeehCount++;
    state.todayTasbeeh++;
    state.allTimeTasbeeh++;

    playClickSound();
    triggerHaptic(35);

    // التحقق من إتمام الهدف
    if (state.tasbeehTarget > 0 && state.tasbeehCount % state.tasbeehTarget === 0) {
      state.targetsDone++;
      triggerHaptic(150);
      if (window.showToast) window.showToast('ما شاء الله! أتممت دورة التسبيح (' + toArabicDigits(state.tasbeehTarget) + ') 🌟', 'success');
    }

    updateTasbeehDisplay();
    savePersistedTasbeeh();
  }

  function initTasbeehSection() {
    var triggerBtn = document.getElementById('tasbeehTriggerBtn');
    var resetBtn = document.getElementById('tasbeehResetBtn');
    var hapticBtn = document.getElementById('tasbeehHapticToggle');
    var soundBtn = document.getElementById('tasbeehSoundToggle');
    var targetPills = document.querySelectorAll('.target-pill');
    var presetsList = document.getElementById('tasbeehPresetsList');
    var addCustomBtn = document.getElementById('addCustomZikrBtn');
    var customInput = document.getElementById('customZikrInput');

    if (triggerBtn) {
      triggerBtn.addEventListener('click', incrementTasbeeh);
      triggerBtn.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          incrementTasbeeh();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state.tasbeehCount = 0;
        updateTasbeehDisplay();
        triggerHaptic(50);
        if (window.showToast) window.showToast('تم تصفير عداد السبحة', 'info');
      });
    }

    if (hapticBtn) {
      hapticBtn.addEventListener('click', function () {
        state.hapticEnabled = !state.hapticEnabled;
        var icon = document.getElementById('hapticIcon');
        var label = document.getElementById('hapticLabel');
        if (icon) icon.className = state.hapticEnabled ? 'fa-solid fa-mobile-screen' : 'fa-solid fa-mobile-screen-button';
        if (label) label.textContent = 'الاهتزاز: ' + (state.hapticEnabled ? 'مفعّل' : 'معطّل');
        savePersistedTasbeeh();
      });
    }

    if (soundBtn) {
      soundBtn.addEventListener('click', function () {
        state.soundEnabled = !state.soundEnabled;
        var icon = document.getElementById('soundIcon');
        var label = document.getElementById('soundLabel');
        if (icon) icon.className = state.soundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        if (label) label.textContent = 'الصوت: ' + (state.soundEnabled ? 'مفعّل' : 'معطّل');
        savePersistedTasbeeh();
      });
    }

    targetPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        targetPills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        state.tasbeehTarget = parseInt(pill.getAttribute('data-target'), 10) || 0;
        updateTasbeehDisplay();
      });
    });

    // توليد قائمة الأذكار الجاهزة
    if (presetsList) {
      var html = '';
      TASBEEH_PRESETS.forEach(function (preset, idx) {
        html += '<button type="button" class="preset-zikr-item ' + (idx === 0 ? 'active' : '') + '" data-text="' + preset.text + '" data-target="' + preset.target + '">';
        html += '  <span class="preset-text">' + preset.text + '</span>';
        html += '  <span class="preset-target-tag">' + toArabicDigits(preset.target) + '</span>';
        html += '</button>';
      });
      presetsList.innerHTML = html;

      presetsList.querySelectorAll('.preset-zikr-item').forEach(function (item) {
        item.addEventListener('click', function () {
          presetsList.querySelectorAll('.preset-zikr-item').forEach(function (it) { it.classList.remove('active'); });
          item.classList.add('active');
          state.activeZikrText = item.getAttribute('data-text');
          state.tasbeehTarget = parseInt(item.getAttribute('data-target'), 10) || 33;
          state.tasbeehCount = 0;
          updateTasbeehDisplay();
        });
      });
    }

    if (addCustomBtn && customInput) {
      addCustomBtn.addEventListener('click', function () {
        var text = customInput.value.trim();
        if (text) {
          state.activeZikrText = text;
          state.tasbeehCount = 0;
          customInput.value = '';
          updateTasbeehDisplay();
          if (window.showToast) window.showToast('تم تعيين الذكر المخصص للسبحة بنجاح', 'success');
        }
      });
    }

    updateTasbeehDisplay();
  }

  // ────────────────────────── 7. الأدعية المأثورة ومناجاة ──────────────────────────
  function renderDuasGrid(category) {
    var grid = document.getElementById('duasGrid');
    if (!grid) return;

    var filtered = DUAS_DATA.filter(function (d) {
      if (category && category !== 'all') {
        return d.cat === category;
      }
      return true;
    });

    var html = '';
    filtered.forEach(function (d, idx) {
      html += '<div class="dua-card">';
      html += '  <div class="dua-card-header">';
      html += '    <h4>' + d.title + '</h4>';
      html += '    <span class="dua-src-badge">' + d.source + '</span>';
      html += '  </div>';
      html += '  <blockquote class="dua-card-body" id="dua-text-' + idx + '">' + d.text + '</blockquote>';
      html += '  <div class="dua-card-actions">';
      html += '    <button type="button" class="dua-action-btn copy-dua-btn" data-target="dua-text-' + idx + '">';
      html += '      <i class="fa-solid fa-copy"></i> <span>نسخ</span>';
      html += '    </button>';
      html += '    <button type="button" class="dua-action-btn share-dua-btn" data-target="dua-text-' + idx + '" data-title="' + d.title + '">';
      html += '      <i class="fa-solid fa-share-nodes"></i> <span>مشاركة</span>';
      html += '    </button>';
      html += '  </div>';
      html += '</div>';
    });

    grid.innerHTML = html;

    // أحداث النسخ والمشاركة
    grid.querySelectorAll('.copy-dua-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tid = btn.getAttribute('data-target');
        var el = document.getElementById(tid);
        if (el) {
          navigator.clipboard.writeText(el.textContent).then(function () {
            if (window.showToast) window.showToast('تم نسخ الدعاء إلى الحافظة بنجاح 📋', 'success');
          });
        }
      });
    });

    grid.querySelectorAll('.share-dua-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tid = btn.getAttribute('data-target');
        var title = btn.getAttribute('data-title');
        var el = document.getElementById(tid);
        if (el) {
          var shareText = title + ':\n\n' + el.textContent + '\n\n— واحة القرآن | مؤسسة د. عمر هشام الخيرية\n' + window.location.origin + '/quran';
          var waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(shareText);
          window.open(waUrl, '_blank');
        }
      });
    });
  }

  function initDuasSection() {
    var catPills = document.querySelectorAll('.dua-cat-pill');

    catPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        catPills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        var cat = pill.getAttribute('data-cat') || 'all';
        renderDuasGrid(cat);
      });
    });

    // زر نسخ ومشاركة دعاء د. عمر هشام
    var omarCopyBtn = document.querySelector('.dua-btn.copy-btn[data-copy="omarMemorialDua"]');
    var omarShareBtn = document.querySelector('.dua-btn.share-btn[data-share="omarMemorialDua"]');

    if (omarCopyBtn) {
      omarCopyBtn.onclick = function () {
        var el = document.getElementById('omarMemorialDua');
        if (el) {
          navigator.clipboard.writeText(el.textContent).then(function () {
            if (window.showToast) window.showToast('تم نسخ دعاء المرحوم د. عمر هشام إلى الحافظة 🤲', 'success');
          });
        }
      };
    }

    if (omarShareBtn) {
      omarShareBtn.onclick = function () {
        var el = document.getElementById('omarMemorialDua');
        if (el) {
          var text = 'دعاء للمرحوم د. عمر هشام وموتى المسلمين:\n\n' + el.textContent + '\n\n— صدقة جارية | مؤسسة د. عمر هشام الخيرية\n' + window.location.origin + '/quran';
          window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
        }
      };
    }

    renderDuasGrid('all');
  }

  // ────────────────────────── 8. الورد اليومي ومتابع الختمة ──────────────────────────
  function updateKhatmahDisplay() {
    var pctEl = document.getElementById('khatmahPercent');
    var fillEl = document.getElementById('khatmahProgressFill');
    var juzEl = document.getElementById('khatmahJuzDone');

    var pct = Math.min(100, Math.round((state.khatmahJuz / 30) * 100));

    if (pctEl) pctEl.textContent = toArabicDigits(pct) + '٪';
    if (fillEl) fillEl.style.width = pct + '%';
    if (juzEl) juzEl.textContent = toArabicDigits(state.khatmahJuz);
  }

  function initKhatmahSection() {
    var planCards = document.querySelectorAll('.plan-card');
    var updateBtn = document.getElementById('updateKhatmahProgressBtn');
    var taskCheckboxes = document.querySelectorAll('.wird-task-item input[type="checkbox"]');
    var completionBanner = document.getElementById('wirdCompletionBanner');

    planCards.forEach(function (card) {
      card.addEventListener('click', function () {
        planCards.forEach(function (c) { c.classList.remove('active'); });
        card.classList.add('active');
        state.khatmahDays = parseInt(card.getAttribute('data-days'), 10) || 30;
        savePersistedKhatmah();
      });
    });

    if (updateBtn) {
      updateBtn.onclick = function () {
        var input = prompt('أدخل عدد الأجزاء التي أتممت قراءتها من القرآن (من ١ إلى ٣٠):', state.khatmahJuz);
        if (input !== null) {
          var val = parseInt(input, 10);
          if (!isNaN(val) && val >= 0 && val <= 30) {
            state.khatmahJuz = val;
            updateKhatmahDisplay();
            savePersistedKhatmah();
            if (window.showToast) window.showToast('تم تحديث تقدم الختمة بنجاح 📖', 'success');
          }
        }
      };
    }

    // استرجاع مهام الورد اليومية المحفوظة
    var todayKey = 'omar_wird_tasks_' + new Date().toISOString().slice(0, 10);
    var savedTasks = {};
    try {
      savedTasks = JSON.parse(localStorage.getItem(todayKey) || '{}');
    } catch (_) {}

    function checkAllWirdDone() {
      var allChecked = true;
      taskCheckboxes.forEach(function (cb) {
        if (!cb.checked) allChecked = false;
      });
      if (completionBanner) completionBanner.style.display = allChecked ? 'flex' : 'none';
    }

    taskCheckboxes.forEach(function (cb) {
      var key = cb.getAttribute('data-task');
      if (savedTasks[key]) {
        cb.checked = true;
      }

      cb.addEventListener('change', function () {
        savedTasks[key] = cb.checked;
        try {
          localStorage.setItem(todayKey, JSON.stringify(savedTasks));
        } catch (_) {}

        if (cb.checked) {
          playClickSound();
          triggerHaptic(30);
        }
        checkAllWirdDone();
      });
    });

    checkAllWirdDone();
    updateKhatmahDisplay();
  }

  // ────────────────────────── 9. إذاعات القرآن الكريم ──────────────────────────
  var currentRadioUrlIndex = 0;

  function stopRadio() {
    try {
      state.radioAudio.pause();
      state.radioAudio.removeAttribute('src');
    } catch (_) {}
    state.isPlayingRadio = false;
    state.activeRadioId = null;

    document.querySelectorAll('.radio-card').forEach(function (c) {
      c.classList.remove('is-playing');
      var btn = c.querySelector('.radio-play-btn');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i> <span>تشغيل الإذاعة</span>';
    });
  }

  function playRadioStation(radio, urlIdx) {
    urlIdx = urlIdx || 0;
    currentRadioUrlIndex = urlIdx;

    if (state.isPlayingRadio && state.activeRadioId === radio.id && urlIdx === 0) {
      stopRadio();
      return;
    }

    // إيقاف أي تلاوة مسجلة
    try {
      state.audioElement.pause();
      state.isPlayingAudio = false;
      updateAllAudioButtons(false, false);
    } catch (_) {}

    stopRadio();

    var urls = radio.urls || [radio.url];
    var streamUrl = urls[urlIdx % urls.length];

    state.activeRadioId = radio.id;
    var card = document.getElementById('radio-card-' + radio.id);
    if (card) {
      card.classList.add('is-playing');
      var btn = card.querySelector('.radio-play-btn');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري الاتصال بالبث...</span>';
    }

    state.radioAudio.removeAttribute('crossorigin');
    state.radioAudio.src = streamUrl;
    try { state.radioAudio.load(); } catch (_) {}

    state.radioAudio.onplaying = function () {
      state.isPlayingRadio = true;
      if (card) {
        var btn = card.querySelector('.radio-play-btn');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i> <span>إيقاف البث</span>';
      }
      if (window.showToast) window.showToast('أنت الآن تستمع إلى: ' + radio.name + ' 📻', 'info');
    };

    state.radioAudio.onerror = function () {
      console.warn('Radio stream error on source:', streamUrl);
      if (urlIdx + 1 < urls.length) {
        console.log('Failing over to next radio stream URL:', urlIdx + 1);
        playRadioStation(radio, urlIdx + 1);
      } else {
        stopRadio();
        if (window.showToast) window.showToast('تعذر تشغيل بث الإذاعة في الوقت الحالي، يرجى المحاولة لاحقاً', 'warning');
      }
    };

    var playPromise = state.radioAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(function (err) {
        console.warn('Radio play promise error:', err);
        if (urlIdx + 1 < urls.length) {
          playRadioStation(radio, urlIdx + 1);
        }
      });
    }
  }

  function initRadiosSection() {
    var grid = document.getElementById('radiosGrid');
    if (!grid) return;

    var html = '';
    RADIOS_DATA.forEach(function (r) {
      html += '<div class="radio-card" id="radio-card-' + r.id + '">';
      html += '  <div class="radio-icon-box"><i class="fa-solid ' + r.icon + '"></i></div>';
      html += '  <div class="radio-info">';
      html += '    <h4>' + r.name + '</h4>';
      html += '    <p>' + r.tagline + '</p>';
      html += '  </div>';
      html += '  <button type="button" class="radio-play-btn" data-id="' + r.id + '">';
      html += '    <i class="fa-solid fa-play"></i> <span>تشغيل الإذاعة</span>';
      html += '  </button>';
      html += '</div>';
    });

    grid.innerHTML = html;

    grid.querySelectorAll('.radio-play-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rid = btn.getAttribute('data-id');
        var rObj = RADIOS_DATA.find(function (r) { return r.id === rid; });
        if (rObj) {
          playRadioStation(rObj, 0);
        }
      });
    });
  }

  // ────────────────────────── 10. آية وتأمل اليوم ──────────────────────────
  function initDailyAyah() {
    var copyBtn = document.getElementById('copyDailyAyahBtn');
    var shareBtn = document.getElementById('shareDailyAyahBtn');
    var playBtn = document.getElementById('playDailyAyahBtn');
    var textEl = document.getElementById('dailyAyahText');
    var refEl = document.getElementById('dailyAyahRef');

    if (copyBtn && textEl) {
      copyBtn.onclick = function () {
        navigator.clipboard.writeText(textEl.textContent.trim() + ' (' + (refEl ? refEl.textContent : '') + ')').then(function () {
          if (window.showToast) window.showToast('تم نسخ آية اليوم المباركة 📋', 'success');
        });
      };
    }

    if (shareBtn && textEl) {
      shareBtn.onclick = function () {
        var text = 'آية وتأمل اليوم:\n\n' + textEl.textContent.trim() + '\n\n' + (refEl ? refEl.textContent : '') + '\n\n— واحة القرآن | مؤسسة د. عمر هشام الخيرية\n' + window.location.origin + '/quran';
        window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
      };
    }

    if (playBtn) {
      playBtn.onclick = function () {
        // تشغيل سورة البقرة
        playSurahAudio(2);
      };
    }
  }

  // ────────────────────────── الدالة التأسيسية (Init) ──────────────────────────
  function init() {
    loadPersistedState();
    initTabNavigation();
    initSurahDirectory();
    initReaderControls();
    initFloatingPlayer();
    initAdhkarSection();
    initTasbeehSection();
    initDuasSection();
    initKhatmahSection();
    initRadiosSection();
    initDailyAyah();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
