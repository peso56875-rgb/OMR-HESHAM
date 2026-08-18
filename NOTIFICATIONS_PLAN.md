# خطة تنفيذ نظام الإشعارات المتكامل
## مؤسسة الدكتور عمر هشام الخيرية

> **حالة المستند:** مقترح للمراجعة والموافقة — **لم يُنفّذ منه أي سطر بعد.**
> مبني على فحص فعلي للكود الحالي (16,483 سطر، 20 وحدة API، 81 نقطة نهاية).

---

## 1. الملخّص في 60 ثانية

المطلوب: نظام إشعارات كامل من 3 طبقات تعمل من نفس المصدر:

| الطبقة | الوصف | تعمل حتى لو الموقع مقفول؟ |
|---|---|---|
| **1. مركز إشعارات داخلي** | جرس في الهيدر + لوحة التحكم، فيه العدّاد وقائمة الإشعارات | ❌ لا — لازم الموقع مفتوح |
| **2. Push Notifications** | إشعار على شاشة الموبايل/الديسكتوب عبر FCM | ✅ نعم |
| **3. البريد الإلكتروني** | **موجود بالفعل** (`src/lib/email.ts` — Resend) | ✅ نعم |

**القرار المعماري الأساسي:** الطبقات التلاتة تُستدعى من **مكان واحد** — دالة `notify()` في `src/lib/notifications.ts`. أي حدث في الموقع ينادي `notify()` مرة واحدة، والدالة هي اللي تقرّر: تكتب في قاعدة البيانات + تبعت push + تبعت بريد، حسب تفضيلات المستخدم.

**ليه واحدة مش تلاتة؟** لأن الشكل التاني (نداء منفصل لكل طبقة في كل نقطة) هو بالظبط اللي بيخلّي بعد شهرين تلاقي حدث بيبعت بريد ومابيبعتش إشعار داخلي، وحدث تاني بالعكس — وده الوضع اللي بيخلي المستخدم يفقد الثقة في الجرس أصلًا. نفس المنطق المستخدم فعلًا في `src/lib/audit.ts` (وسيط واحد عام بدل 60 نداء يدوي).

---

## 2. اللي موجود فعلًا وهنبني عليه (مش هنكرره)

فحصت الكود، ودي الأصول الجاهزة:

| الأصل | الملف | هنستخدمه في |
|---|---|---|
| نظام بريد كامل بـ 10 قوالب RTL | `src/lib/email.ts` | الطبقة التالتة — بدون أي تعديل جوهري |
| `sendInBackground()` مع `waitUntil` | `src/lib/email.ts:195` | إرسال الـpush بدون تأخير استجابة المستخدم |
| Toast داخلي بـ 11 نوع | `public/static/app.js:5` + `style.css:50` | إظهار الإشعار الفوري لما الصفحة مفتوحة |
| `authMiddleware` / `adminMiddleware` | `src/api/middleware.ts` | تأمين نقاط الإشعارات |
| `rateLimiter(max, window, bucket)` | `src/api/middleware.ts:180` | حماية نقاط الإشعارات من الإغراق |
| وسيط التدقيق العام | `src/lib/audit.ts` | ⚠️ **محتاج استثناء** — شوف بند 8.3 |
| `firebase-admin` (فيه `messaging` جوّاه) | `node_modules/firebase-admin/lib/messaging` | إرسال FCM من السيرفر — **صفر حزم جديدة** |
| نمط استيراد Firebase SDK من CDN | `src/components/Auth.tsx:175` | تحميل `firebase/messaging` في المتصفح |
| `scripts/verify/*.mjs` | مجلد verify | نمط ملفات التحقق (مفيش Vitest في المشروع) |

**استنتاج مهم:** `firebase-admin` مثبّت بالفعل ومنسوخ لدالة Vercel عبر `scripts/copy-externals.mjs`، و`firebase-admin/messaging` جزء من نفس الحزمة → **مش محتاجين نضيف أي dependency جديدة للسيرفر.** ده أهم حاجة، لأن `package.json` بيتنشر كـ prebuilt function وVercel مابيشغّلش `npm install`.

---

## 3. كتالوج الأحداث — كل حاجة "جديدة" هيوصل عنها إشعار

دي القائمة الكاملة. كل صف = حدث، والأعمدة توضّح مين بيستقبله وبأي طبقة.

### 3.1 أحداث تخصّ الإدارة (Admins)

| # | الحدث | المصدر (نقطة النهاية الفعلية) | داخلي | Push | بريد |
|---|---|---|---|---|---|
| A1 | تبرع جديد وصل | `POST /api/donations` | ✅ | ✅ | ✅ موجود |
| A2 | طلب تطوع جديد | `POST /api/volunteers` | ✅ | ✅ | ✅ موجود |
| A3 | رسالة تواصل جديدة | `POST /api/contacts` | ✅ | ✅ | ✅ موجود |
| A4 | طلب توظيف جديد | `POST /api/jobs/apply` | ✅ | ✅ | ✅ موجود |
| A5 | مشترك جديد في النشرة | `POST /api/newsletter` | ✅ | ❌ صامت | — |
| A6 | حركة خزنة كبيرة (> حد معيّن) | `POST /api/treasury/income\|expense/add` | ✅ | ✅ | ➕ جديد |
| A7 | مستخدم جديد سجّل | `POST /api/auth/session` (أول مرة) | ✅ | ❌ صامت | — |
| A8 | حملة وصلت هدفها 100% | يُحسب عند تأكيد تبرع | ✅ | ✅ | ➕ جديد |
| A9 | بطاقة متطوع على وشك تنتهي (30 يوم) | مهمة مجدولة (Cron) | ✅ | ❌ | ➕ جديد |
| A10 | فشل رفع ملف / خطأ تخزين متكرر | `src/lib/storage.ts` | ✅ | ❌ | — |

### 3.2 أحداث تخصّ المستخدم/المتبرع

| # | الحدث | المصدر | داخلي | Push | بريد |
|---|---|---|---|---|---|
| U1 | تبرعك اتأكّد + إيصالك جاهز | `POST /api/donations/status/:id` | ✅ | ✅ | ✅ موجود |
| U2 | تبرعك اتلغى | نفس النقطة | ✅ | ✅ | ➕ جديد |
| U3 | **ترقيتك لمشرف (Admin)** | `POST /api/users/role/:id` | ✅ | ✅ | ➕ جديد |
| U4 | **إزالة صلاحية المشرف عنك** | نفس النقطة | ✅ | ✅ | ➕ جديد |
| U5 | خبر/حملة جديدة نُشرت (اختياري بالاشتراك) | `POST /api/news/add`, `campaigns/add` | ✅ | ✅ | ❌ |
| U6 | فعالية جديدة قرّبت | `POST /api/events/add` + Cron | ✅ | ✅ | ❌ |
| U7 | ردّ الإدارة على رسالتك | `POST /api/contacts/status/:id` | ✅ | ✅ | ➕ جديد |

### 3.3 أحداث تخصّ المتطوعين ⭐ (المطلوب صريحًا)

| # | الحدث | المصدر | داخلي | Push | بريد |
|---|---|---|---|---|---|
| V1 | **طلب تطوعك اتقبل + بطاقتك صدرت** | `POST /api/volunteers/status/:id` → `approved` | ✅ | ✅ | ✅ موجود |
| V2 | طلب تطوعك مرفوض | نفس النقطة → `rejected` | ✅ | ✅ | ➕ جديد |
| V3 | **ترقيتك لرتبة جديدة** | `POST /api/volunteers/update-hours/:id` (حقل `rank`) | ✅ | ✅ | ➕ جديد |
| V4 | **ترقية رتبة عبر نموذج التعديل** | `POST /api/volunteers/update/:id` (حقل `rank`) | ✅ | ✅ | ➕ جديد |
| V5 | تحديث ساعات خدمتك | `POST /api/volunteers/update-hours/:id` (حقل `hours`) | ✅ | ❌ صامت | ❌ |
| V6 | بطاقتك اتجمّدت / اتلغت | `POST /api/volunteers/validity/:id` | ✅ | ✅ | ➕ جديد |
| V7 | بطاقتك قربت تنتهي (30/7 يوم) | Cron | ✅ | ✅ | ➕ جديد |
| V8 | بطاقتك اتجدّدت | `POST /api/volunteers/validity/:id` | ✅ | ✅ | ➕ جديد |

> **ملاحظة على V3/V4 — تفصيلة اكتشفتها في الكود:**
> الترقية في الرتبة مش بتحصل من نقطة واحدة. فيه **تلات مسارات** بيقدروا يغيّروا `rank`:
> `/update-hours/:id` (سطر 650)، `/update/:id` (سطر 576)، و`/status/:id` بيحدّد رتبة ابتدائية `'متطوع مبادر'` عند القبول (سطر 422).
> لو ربطنا الإشعار بنقطة واحدة بس، الأدمن اللي بيرقّي من نموذج التعديل مش هيبعت إشعار — والمتطوع مش هيعرف إنه اترقّى.
> **الحل:** دالة مساعدة `detectRankChange(before, after)` تُنادى في التلاتة، وتبعت الإشعار **فقط لو الرتبة اتغيّرت فعلًا** (مش مع كل حفظ). كذلك تمنع الإشعار لو الرتبة اتحددت لأول مرة عند القبول، لأن إشعار V1 بيغطّيها.

> **ملاحظة على U3 — الترقية لأدمن:**
> `POST /api/users/role/:id` حاليًا بيعمل `profileRef.update({ role: newRole })` وخلاص. مفيش أي إشعار.
> المستخدم اللي بقى أدمن مش بيعرف إلا لو لاحظ رابط "التحكم" ظهر في الهيدر. الإشعار هنا مش رفاهية — ده أهم تغيير صلاحية في النظام كله ولازم يتسجّل ويُعلَن للطرفين (المستخدم + بقية الأدمنز، لأن ترقية أدمن حاجة كل الإدارة تعرفها).

---

## 4. نموذج البيانات (Firestore)

### 4.1 `notifications` — الإشعار الواحد

```
notifications/{id}
├── user_id: string | null      // null = إشعار لكل الأدمنز (broadcast)
├── audience: 'user' | 'admins' // يحدد طريقة الاستعلام
├── type: string                // 'donation_new' | 'volunteer_rank_up' | 'role_promoted' …
├── category: 'financial' | 'volunteers' | 'content' | 'system' | 'account'
├── title: string               // "ترقية في فريق المتطوعين 🎉"
├── body: string                // "تمت ترقيتك إلى رتبة: منسّق ميداني"
├── link: string                // '/profile' | '/dashboard?view=donations'
├── icon: string                // 'fa-medal' (FontAwesome — نفس نظام الموقع)
├── priority: 'low'|'normal'|'high'
├── is_read: boolean
├── read_at: string | null
├── actor_id / actor_name       // مين عمل الإجراء (للشفافية)
├── meta: object                // { volunteer_code, amount, old_rank, new_rank … }
├── push_sent: boolean          // للتشخيص
└── created_at: string (ISO)
```

**قرارات تستحق التوثيق:**

1. **`audience: 'admins'` بدل نسخة لكل أدمن.** لو المؤسسة عندها 6 أدمنز، تبرع واحد بيولّد 6 مستندات لو عملنا fan-out. مع 50 تبرع/يوم = 300 مستند/يوم = 9,000/شهر لحدث واحد. بدل كده: مستند واحد بـ `audience:'admins'`، وحالة "مقروء" تتخزّن في مجموعة منفصلة خفيفة `notification_reads/{notifId}_{userId}`. توفير ~83% في الكتابات والقراءات.

2. **`link` مخزّن مع الإشعار مش محسوب في الواجهة.** لو الواجهة هي اللي تحسب الرابط من `type`، أي `type` جديد يُضاف في السيرفر هيبقى إشعار **مش قابل للنقر** لحد ما الواجهة تتحدّث. تخزين الرابط يخلي السيرفر مصدر الحقيقة الوحيد.

3. **`icon` بـ FontAwesome مش emoji.** الموقع كله على FontAwesome (`icon()` في `shared.tsx`)، والاتساق البصري أهم من التنويع.

### 4.2 `push_tokens` — أجهزة المستخدمين

```
push_tokens/{token}              // الـtoken نفسه هو معرّف المستند
├── user_id: string
├── platform: 'web'|'android'|'ios'
├── user_agent: string (مقصوص 200 حرف)
├── created_at / last_seen_at
└── is_active: boolean
```

**ليه الـtoken هو معرّف المستند؟** لأن FCM token فريد عالميًا. لو استخدمنا معرّف تلقائي، نفس الجهاز لو سجّل مرتين (مسح الكوكيز، إعادة تسجيل) هيعمل صفّين، وهنبعت نفس الإشعار مرتين لنفس الشاشة. الـtoken كمعرّف يخلي العملية **idempotent** بالتصميم.

### 4.3 `notification_prefs` — التفضيلات

```
notification_prefs/{user_id}
├── push_enabled: boolean
├── email_enabled: boolean
├── categories: { financial: bool, volunteers: bool, content: bool, system: bool }
└── quiet_hours: { enabled: bool, from: '23:00', to: '07:00' }  // بتوقيت القاهرة
```

**`quiet_hours` مش رفاهية:** الإدارة بتستقبل إشعار عند كل تبرع. تبرع الساعة 3 فجرًا بيرن على موبايل الأدمن. أول أسبوع هيقفل الإشعارات بالكامل — وساعتها النظام كله ملغي فعليًا. الساعات الهادئة هي اللي تخلّي النظام يعيش. الإشعارات في الوقت الهادئ **تُخزّن داخليًا وتتأخّر في الـpush**، مش تُلغى.

### 4.4 قواعد Firestore (`firestore.rules`)

```javascript
// الإشعارات — قراءة من السيرفر فقط (Admin SDK بيتخطى القواعد)
match /notifications/{document} { allow read, write: if false; }
match /notification_reads/{document} { allow read, write: if false; }
match /notification_prefs/{document} { allow read, write: if false; }
// الـtokens حسّاسة: token مسروق = قدرة على إرسال إشعار مزيّف باسم المؤسسة
match /push_tokens/{document} { allow read, write: if false; }
```

كلها `deny-all` — نفس نمط `audit_logs` و`counters` الموجود بالفعل. الوصول كله يمرّ من الـAPI بعد التحقق من الهوية، وده يمنع مستخدم يقرأ إشعارات غيره أو يسرق token جهاز تاني.

### 4.5 فهارس مركّبة (`firestore.indexes.json` — ملف جديد)

```
notifications: (user_id ASC, created_at DESC)
notifications: (user_id ASC, is_read ASC, created_at DESC)
notifications: (audience ASC, created_at DESC)
push_tokens:   (user_id ASC, is_active ASC)
```

⚠️ **مهم:** Firestore بيرفض `where('user_id','==',x).orderBy('created_at','desc')` بدون فهرس مركّب — بيرجّع خطأ فيه رابط لإنشائه. لو مانشرناش الفهارس، **مركز الإشعارات هيرجّع خطأ 500 من أول استعلام.** الملف ده لازم يُنشر بـ `firebase deploy --only firestore:indexes` قبل تشغيل الميزة.

---

## 5. الملفات — الجديد والمعدّل

### 5.1 ملفات جديدة (10)

| الملف | السطور (تقديري) | الوظيفة |
|---|---|---|
| `src/lib/notifications.ts` | ~420 | **قلب النظام.** `notify()`, `notifyAdmins()`, كتالوج الأنواع، التفضيلات، الساعات الهادئة |
| `src/lib/push.ts` | ~230 | FCM: `sendToUser()`, `sendToAdmins()`, تنظيف الـtokens الميتة، تقسيم الدفعات (500) |
| `src/api/notifications.ts` | ~260 | 7 نقاط نهاية (بند 6) |
| `src/components/Notifications.tsx` | ~300 | مكوّن الجرس + اللوحة المنسدلة + صفحة `/notifications` |
| `public/firebase-messaging-sw.js` | ~90 | Service Worker — يستقبل الـpush والموقع مقفول |
| `public/static/notifications.js` | ~340 | منطق الواجهة: طلب الإذن، تسجيل الـtoken، جلب العدّاد، فتح اللوحة |
| `public/manifest.webmanifest` | ~30 | **إلزامي للـpush على iPhone** (بند 9.1) |
| `firestore.indexes.json` | ~40 | الفهارس المركّبة |
| `scripts/verify/notifications.mjs` | ~200 | ملف تحقق على نمط `verify/audit.mjs` |
| `scripts/cron/notification-digest.mjs` | ~130 | مهمة يومية: انتهاء البطاقات + تنظيف قديم |

### 5.2 ملفات معدّلة (14)

| الملف | التعديل | حجم التعديل |
|---|---|---|
| `src/api/index.ts` | `api.route('/notifications', notifications)` | +2 سطر |
| `src/api/users.ts` | **U3/U4** — إشعار الترقية لأدمن | +25 سطر |
| `src/api/volunteers.ts` | **V1–V8** — القبول/الرفض/الرتبة/الصلاحية (3 نقاط) | +80 سطر |
| `src/api/donations.ts` | A1, U1, U2, A8 | +45 سطر |
| `src/api/contacts.ts` | A3, U7 | +20 سطر |
| `src/api/jobs.ts` | A4 | +12 سطر |
| `src/api/newsletter.ts` | A5 | +10 سطر |
| `src/api/treasury.ts` | A6 | +22 سطر |
| `src/api/news.ts` + `campaigns.ts` + `events.ts` | U5, U6 | +30 سطر |
| `src/api/profile.ts` | حفظ التفضيلات | +30 سطر |
| `src/components/shared.tsx` | الجرس في `Header` + وسم `manifest` + سكربت | +12 سطر |
| `src/components/Dashboard.tsx` | الجرس في `dash-topbar` + بند "الإشعارات" في القائمة الجانبية | +18 سطر |
| `src/components/Auth.tsx` | قسم التفضيلات في `/profile` | +70 سطر |
| `src/lib/security-headers.ts` | ⚠️ **CSP** — بند 8.1 | +6 سطر |
| `src/lib/audit.ts` | ⚠️ **استثناء + أفعال** — بند 8.3 | +5 سطر |
| `public/static/app.js` | ⚠️ **ربط الجرس بـ SPA** — بند 8.2 | +8 سطر |
| `public/static/style.css` | أنماط الجرس واللوحة (فاتح + داكن) | +180 سطر |
| `firestore.rules` | 4 مجموعات جديدة | +12 سطر |
| `.env.example` | `FIREBASE_VAPID_KEY` + شرح | +18 سطر |
| `src/types.ts` | `Notification`, `PushToken`, `NotificationPrefs` | +45 سطر |
| `README.md` + `DEVELOPMENT_PLAN.md` | تحديث الحالة | +60 سطر |

### 5.3 حذف

- `public/static/presence.js` — **كود ميت.** بيقرأ `config.supabaseUrl` و`window.supabase`، والمشروع اتحول لـFirebase خلاص ومفيش `/api/config` أصلًا. مش محمّل في أي صفحة. حذفه ينظّف تشويش على أي حد يقرأ الكود بعدين (وبالأخص إنه بيوحي إن فيه realtime شغّال والواقع لأ).

---

## 6. واجهة الـAPI

| الطريقة | المسار | الحماية | الوظيفة |
|---|---|---|---|
| `GET` | `/api/notifications` | `authMiddleware` | قائمة مرقّمة (`?limit=20&cursor=…&filter=unread`) |
| `GET` | `/api/notifications/count` | `authMiddleware` + `rateLimiter(120,60s)` | `{ unread: 5 }` — **الأخف، بيتنادى دوريًا** |
| `POST` | `/api/notifications/read/:id` | `authMiddleware` | تعليم واحد كمقروء |
| `POST` | `/api/notifications/read-all` | `authMiddleware` | تعليم الكل |
| `POST` | `/api/notifications/subscribe` | `authMiddleware` + `rateLimiter(10,60s)` | تسجيل FCM token |
| `POST` | `/api/notifications/unsubscribe` | `authMiddleware` | إلغاء token (عند تسجيل الخروج) |
| `POST` | `/api/notifications/prefs` | `authMiddleware` | حفظ التفضيلات |
| `POST` | `/api/notifications/test` | `adminMiddleware` | **إشعار تجريبي** — للتشخيص بعد النشر |

`/notifications/test` مش زيادة: بعد النشر، لو الـpush مش شغّال، فيه 6 أسباب محتملة (VAPID غلط، إذن مرفوض، SW مش مسجّل، token مش محفوظ، CSP بيحجب، HTTPS). زرار تجربة في اللوحة يقصّر التشخيص من ساعة لدقيقة.

---

## 7. التحديث الفوري — القرار الصريح

**السؤال:** لما تبرع يوصل والأدمن فاتح اللوحة، الجرس يتحدّث لوحده إزاي؟

**الاختيارات المدروسة:**

| الطريقة | الحكم |
|---|---|
| SSE / WebSocket | ❌ **مرفوض.** المشروع منشور على Vercel كـ serverless function. الاتصال المفتوح بيخلّي الدالة شغّالة طول الوقت → الفاتورة بتنفجر، وVercel بيقطع الاتصال بعد مدة أصلًا |
| Firestore `onSnapshot` من المتصفح | ❌ **مرفوض.** يستلزم فتح قواعد `notifications` للقراءة من العميل، وده يهدم نموذج الأمان في بند 4.4 |
| **Polling + Push** | ✅ **المختار** |

**التنفيذ:**
- `GET /api/notifications/count` كل **60 ثانية** + **فورًا عند `visibilitychange`** (رجوع للتاب).
- إيقاف الـpolling والتاب مخفي → صفر طلبات وهمية.
- الـ**push** هو اللي يغطّي "الفورية" الحقيقية (بيوصل خلال ثواني والموقع مقفول).
- تكلفة: طلب واحد كل دقيقة لكل أدمن نشط = ~1 قراءة Firestore. مع 6 أدمنز و8 ساعات عمل ≈ 2,880 قراءة/يوم — داخل الحد المجاني (50k/يوم) بفارق كبير.

**الصراحة المطلوبة:** ده معناه إن الجرس قد يتأخر لحد 60 ثانية. ومقبول، لأن الـpush وصل فورًا على الموبايل.

---

## 8. ⚠️ أربع نقاط لو اتجاهلت، النظام هيفشل بصمت

دي أهم قسم في المستند. كل نقطة منها لقيتها بقراءة الكود الحالي.

### 8.1 CSP هتحجب FCM بالكامل

`src/lib/security-headers.ts` فيه `connectSrc` محدود بقائمة hosts. FCM بيتصل بـ endpoints **مش موجودة فيها**:

```diff
  connectSrc: ["'self'", ...FIREBASE_APIS, 'https://api.cloudinary.com',
+   'https://fcmregistrations.googleapis.com',   // تسجيل الـtoken
+   'https://fcm.googleapis.com'                 // قناة الاستقبال
  ],
+ workerSrc: ["'self'"],   // بدونها الـService Worker مش هيسجّل
```

**بدون ده:** طلب تسجيل الـtoken هيفشل في المتصفح برسالة CSP في الكونسول، والمستخدم هيشوف "تم تفعيل الإشعارات" بينما مفيش أي token اتسجّل. فشل صامت من النوع الأسوأ.

### 8.2 الجرس هيموت عند التنقل في لوحة التحكم

اللوحة شبه-SPA: `loadDashboardView()` في `app.js:1176` بيعمل:
```js
dashMain.innerHTML = newDashMain.innerHTML
rebindDashboardHandlers()
```
والجرس مكانه في `.dash-topbar` اللي **جوّه `.dash-main`** → بيتمسح ويُعاد بناؤه من HTML جديد، فيفقد كل الـevent listeners.

**النتيجة لو اتجاهلت:** الجرس يشتغل في "نظرة عامة"، وبعد أول نقلة لأي قسم يبقى شكل بلا وظيفة. والأسوأ: الـpolling `setInterval` القديم يفضل شغّال على عنصر محذوف → تسريب ذاكرة.

**الحل:** `initNotificationBell()` تُنادى من `rebindDashboardHandlers()`، مع `clearInterval` للمؤقّت القديم قبل إنشاء الجديد.

### 8.3 وسيط التدقيق هيغرق سجل التدقيق

`auditMiddleware` مركّب **عالميًا** على كل الـAPI (`src/api/index.ts:51`) ويسجّل **كل POST ناجح**.

`POST /api/notifications/read/:id` بيحصل مع كل نقرة على إشعار. أدمن بيقرأ 30 إشعار/يوم = **30 سطر تدقيق يومي بلا أي قيمة رقابية**. بعد شهر، السجل اللي المراجع المالي بيقرأه هيبقى 90% "قرأ إشعار".

وده يضرب حاجة أهم: `DashAudit` بيعرض **آخر 100 سطر بس** (`src/index.tsx:441`). الضجيج مش هيثقّل السجل — **هو هيدفن التغييرات المالية الحقيقية خارج نافذة العرض.**

```diff
  if (path.includes('/auth/') || path.includes('/newsletter/subscribe')) return
+ // قراءة إشعار مش تغيير في بيانات المؤسسة. التسجيل هيدفن التغييرات
+ // المالية خارج نافذة الـ100 سطر المعروضة في اللوحة.
+ if (path.includes('/notifications/read') ||
+     path.includes('/notifications/subscribe') ||
+     path.includes('/notifications/count')) return
```

⚠️ **`/notifications/prefs` يفضل مسجّل** — تغيير تفضيلات إشعار حدث يستحق أثر.

كذلك `parseTarget` عندها قائمة `VERBS` (سطر 111) لتمييز الأفعال من المعرّفات. لازم تضاف: `'read'`, `'read-all'`, `'subscribe'`, `'unsubscribe'`, `'prefs'`, `'count'` — وإلا `/notifications/read-all` هيتسجّل وكأن `read-all` معرّف مستند، وهي نفس المشكلة الموثّقة في تعليق الكود إن `add` اتسجّلت كمعرّف قبل كده.

### 8.4 التكرار في الترقيات (idempotency)

`POST /api/volunteers/update-hours/:id` بيحدّث الساعات **والرتبة** في نفس النموذج. الأدمن بيحفظ 3 مرات وهو بيعدّل الساعات → 3 إشعارات "تمت ترقيتك" بنفس الرتبة.

**الحل:** المقارنة قبل/بعد إلزامية:
```ts
if (before.rank !== after.rank && after.rank) → notify V3
```
ونفس المنطق لـ `status`, `role`, `payment_status`. الإشعار على **التغيّر** مش على **الحفظ**.

---

## 9. متطلبات المنصّات — الحقائق غير السارّة

### 9.1 iPhone: الـpush محتاج تثبيت الموقع كتطبيق

iOS Safari بيدعم Web Push من 16.4، لكن **بشرطين**:
1. الموقع مثبّت على الشاشة الرئيسية (Add to Home Screen).
2. عنده `manifest.webmanifest` صالح مع `display: standalone`.

المشروع **مفيش عنده manifest** حاليًا. فحصت `public/` — فيه `robots.txt` والصور بس.

**النتيجة:** بدون manifest، الـpush مش هيشتغل على أي iPhone. وده مؤثّر جدًا في مصر.
**الحل:** إضافة `public/manifest.webmanifest` + وسم `<link rel="manifest">` + شريط لطيف يقترح على مستخدم iOS يضيف الموقع للشاشة الرئيسية علشان يستقبل الإشعارات.

### 9.2 مفتاح VAPID غير موجود في الـ.env المرسل

فحصت الملف المرسل: فيه `FIREBASE_API_KEY`, `AUTH_DOMAIN`, `MESSAGING_SENDER_ID`, `APP_ID` — كلها موجودة ✅. لكن **`FIREBASE_VAPID_KEY` مش موجود** وهو إلزامي للـWeb Push.

**محتاج منك:** من Firebase Console → ⚙️ Project Settings → **Cloud Messaging** → قسم **Web Push certificates** → زرار **Generate key pair** → انسخ المفتاح (بيبدأ بـ `B...` وطوله ~88 حرف).

مفيش بديل لده — المفتاح ده هو اللي بيثبت للمتصفح إن الإشعار جاي من سيرفرك مش من حد تاني.

### 9.3 متغيرات البيئة الجديدة

```bash
# مفتاح VAPID — إلزامي للـpush. من Firebase Console › Cloud Messaging › Web Push certificates
FIREBASE_VAPID_KEY=

# الحد اللي فوقه حركة الخزنة تولّد إشعار للإدارة (جنيه). افتراضي 5000
NOTIFY_TREASURY_THRESHOLD=5000

# الساعات الهادئة الافتراضية للأدمنز الجدد (توقيت القاهرة). فاضي = معطّلة
NOTIFY_QUIET_HOURS=23:00-07:00

# سر حماية مهمة الـCron. openssl rand -hex 32
CRON_SECRET=
```

كلها **اختيارية ما عدا VAPID**: بدون `FIREBASE_VAPID_KEY` النظام يعمل كامل بالطبقة الداخلية + البريد، والـpush بيتخطّى بصمت مع سطر في اللوج — **نفس فلسفة `RESEND_API_KEY` الموجودة بالفعل**، والموقع مايكسرش.

---

## 10. مراحل التنفيذ

كل مرحلة **قابلة للنشر لوحدها** وبتضيف قيمة. مش لازم نستنى المرحلة 5 علشان حد يستفيد.

### المرحلة 1 — الأساس + المطلوب صريحًا ⭐ (~7 ساعات)
> **دي المرحلة اللي فيها اللي طلبته بالنص: إشعار الترقية لأدمن، وإشعار ترقية المتطوع.**

- [ ] `src/lib/notifications.ts` — `notify()` + الكتالوج
- [ ] `src/api/notifications.ts` — 7 نقاط
- [ ] `firestore.rules` + `firestore.indexes.json`
- [ ] **U3/U4** — إشعار الترقية/إزالة صلاحية الأدمن في `users.ts`
- [ ] **V1–V4, V6, V8** — قبول/رفض/رتبة/صلاحية في `volunteers.ts` (التلات مسارات)
- [ ] `detectRankChange()` مع منطق المقارنة قبل/بعد (بند 8.4)
- [ ] استثناء وسيط التدقيق + أفعال `parseTarget` (بند 8.3)
- [ ] `scripts/verify/notifications.mjs`

**بعدها:** الإشعارات مخزّنة وصحيحة، بس لسه مفيش واجهة تعرضها.

### المرحلة 2 — مركز الإشعارات (الواجهة) (~7 ساعات)
- [ ] `Notifications.tsx` — الجرس + اللوحة + صفحة `/notifications`
- [ ] `notifications.js` — polling + `visibilitychange` + تعليم كمقروء
- [ ] الجرس في `shared.tsx` (عام) و`Dashboard.tsx` (لوحة)
- [ ] **ربط `initNotificationBell()` بـ `rebindDashboardHandlers()`** (بند 8.2)
- [ ] `style.css` — أنماط كاملة للوضعين الفاتح والداكن

**بعدها:** النظام مرئي وشغّال بالكامل داخليًا. **ده أقل نطاق يستحق النشر.**

### المرحلة 3 — Push Notifications (~7 ساعات)
- [ ] `src/lib/push.ts` — FCM + تنظيف tokens + دفعات 500
- [ ] `public/firebase-messaging-sw.js`
- [ ] `public/manifest.webmanifest` + وسم manifest (بند 9.1)
- [ ] **تعديل CSP** (بند 8.1)
- [ ] تدفق طلب الإذن (بعد تفاعل من المستخدم، مش عند التحميل)
- [ ] `POST /notifications/test` + زرار تجربة في اللوحة
- [ ] شريط اقتراح التثبيت لمستخدمي iOS

### المرحلة 4 — تغطية بقية الأحداث + التفضيلات (~6 ساعات)
- [ ] A1–A8, U1, U2, U5–U7, V5 — ربط بقية النقاط
- [ ] قوالب البريد الجديدة (7 قوالب في `email.ts`)
- [ ] لوحة التفضيلات في `/profile` + الساعات الهادئة
- [ ] بند "الإشعارات" في القائمة الجانبية للوحة

### المرحلة 5 — المجدولة والصيانة (~4 ساعات)
- [ ] `scripts/cron/notification-digest.mjs` — انتهاء البطاقات (V7, A9)
- [ ] تنظيف الإشعارات المقروءة > 90 يوم
- [ ] تنظيف الـtokens غير النشطة > 180 يوم
- [ ] إعداد Vercel Cron + حماية بـ `CRON_SECRET`
- [ ] تحديث `README.md` و`DEVELOPMENT_PLAN.md` (بند 11 → ✅)

**الإجمالي: ~31 ساعة عمل.**
(للمقارنة: `DEVELOPMENT_PLAN.md` كان مقدّر "مركز إشعارات داخلي" بـ6 ساعات — لأنه ما كان بيشمل الـpush ولا الـSW ولا التفضيلات ولا المجدولة ولا الـ8 نقاط الحرجة أعلاه.)

---

## 11. المخاطر والتخفيف

| الخطر | الاحتمال | التخفيف |
|---|---|---|
| نسيان نشر الفهارس → 500 من أول استعلام | **عالي** | `firestore.indexes.json` في المستودع + خطوة صريحة في README + رسالة خطأ عربية واضحة بدل 500 صامت |
| CSP تحجب FCM (فشل صامت) | **عالي** | بند 8.1 في نفس الـPR، + `/notifications/test` للتحقق بعد النشر |
| الجرس يموت في SPA اللوحة | **عالي** | بند 8.2 — `initNotificationBell()` في `rebindDashboardHandlers()` |
| إغراق سجل التدقيق | **مؤكد لو اتجاهل** | بند 8.3 |
| إشعارات مكرّرة مع كل حفظ | **عالي** | بند 8.4 — مقارنة قبل/بعد |
| الأدمن يقفل الإشعارات من كتر الرنّة | **متوسط** | الساعات الهادئة + التصنيفات + الأحداث الصامتة (A5, A7, V5 داخلي بس) |
| فاتورة Firestore | **منخفض** | `audience:'admins'` بدل fan-out + تنظيف تلقائي + polling موقوف والتاب مخفي |
| الـpush مش شغّال على iPhone | **مؤكد بدون manifest** | بند 9.1 |
| tokens ميتة بتفشّل الإرسال | **متوسط** | حذف تلقائي عند `registration-token-not-registered` من FCM |
| فشل الإشعار يفشّل التبرع | **حرج لو حصل** | `notify()` **مابترميش استثناء أبدًا** — نفس عقد `writeAudit()` و`deliver()`. فقدان إشعار أهون من فقدان تبرع |

---

## 12. معايير القبول — إزاي نتأكد إنه شغّال

بعد كل مرحلة، الاختبارات دي لازم تنجح:

**المرحلة 1:**
- [ ] أرقّي مستخدم لأدمن → مستند إشعار موجود في Firestore بـ `type:'role_promoted'` و`link:'/dashboard'`
- [ ] أرقّي متطوع لرتبة جديدة → إشعار واحد بس، فيه `meta.old_rank` و`meta.new_rank`
- [ ] أحفظ نموذج المتطوع **بدون** تغيير الرتبة → **صفر إشعارات**
- [ ] أقبل متطوع → إشعار V1 واحد (مش V1 + V3 مع بعض)
- [ ] `sqlite`… يعني `audit_logs` **مافيهاش** أي سطر `/notifications/read`
- [ ] `npx tsc --noEmit` نظيف
- [ ] `node scripts/verify/notifications.mjs` كل الفحوص ✓

**المرحلة 2:**
- [ ] الجرس يعرض العدّاد الصح + شارة حمراء
- [ ] أنقل بين 5 أقسام في اللوحة → الجرس لسه شغّال، ومفيش أكتر من `setInterval` واحد
- [ ] النقر على إشعار → يعلّمه مقروء وينقل للرابط
- [ ] الوضع الداكن سليم
- [ ] موبايل 360px: اللوحة مش بتطلع بره الشاشة

**المرحلة 3:**
- [ ] Android Chrome: الإذن → token في `push_tokens` → إشعار يوصل والمتصفح مقفول
- [ ] Desktop Chrome + Firefox: نفس السيناريو
- [ ] iPhone بعد التثبيت من الشاشة الرئيسية: يوصل
- [ ] كونسول المتصفح: **صفر أخطاء CSP**
- [ ] أشيل `FIREBASE_VAPID_KEY` → الموقع يعمل كامل والـpush يتخطّى بصمت (مايكسرش)

**المرحلة 4–5:**
- [ ] أقفل تصنيف "المالية" → تبرع جديد مايبعتش لي، وطلب تطوع يبعت
- [ ] ساعات هادئة مفعّلة → الإشعار مخزّن، الـpush متأخّر
- [ ] الـCron بدون `CRON_SECRET` → 401

---

## 13. اللي محتاجه منك قبل البدء

| # | المطلوب | إلزامي؟ | ملاحظة |
|---|---|---|---|
| 1 | **`FIREBASE_VAPID_KEY`** | ✅ للـpush | Firebase Console › Project Settings › Cloud Messaging › Web Push certificates › Generate key pair |
| 2 | تأكيد إن **Cloud Messaging API (V1)** مفعّل | ✅ للـpush | نفس الصفحة — لو مش مفعّل فيه زرار تفعيل |
| 3 | موافقتك على **كتالوج الأحداث** (بند 3) | ✅ | تحب تشيل أو تضيف حدث؟ تحب A5/A7 يبعتوا push كمان؟ |
| 4 | موافقتك على **قرار Polling مش SSE** (بند 7) | ✅ | معناه تأخير لحد 60 ثانية في الجرس، والـpush فوري |
| 5 | `NOTIFY_TREASURY_THRESHOLD` | ⬜ | فوق كام جنيه تحب حركة الخزنة تولّد إشعار؟ (افتراضي 5000) |
| 6 | الساعات الهادئة الافتراضية | ⬜ | افتراضي 23:00–07:00 بتوقيت القاهرة |
| 7 | موافقتك على **حذف `presence.js`** | ⬜ | كود Supabase ميت غير محمّل في أي صفحة |

---

## 14. ملاحظة أخيرة على الفلسفة

النظام ده مبني على 3 عقود ثابتة، مأخوذة من اللي موجود فعلًا وشغّال في المشروع (`writeAudit`, `deliver`):

1. **الإشعار مابيفشّلش العملية أبدًا.** لو الإشعار وقع، أسوأ حاجة إن حد مايعرفش خبر. لو التبرع وقع، المؤسسة خسرت فلوس وثقة. الأولوية واضحة.
2. **الإشعار على التغيّر، مش على الحفظ.** أي إشعار بيتبعت مع كل حفظ هو إشعار المستخدم هيقفله بعد أسبوع.
3. **السيرفر هو مصدر الحقيقة.** العنوان والنص والرابط والأيقونة كلهم مخزّنين مع الإشعار، مش محسوبين في الواجهة — علشان أي نوع جديد يشتغل فورًا بدون تحديث الواجهة.

---

**في انتظار موافقتك على الخطة (أو تعديلاتك عليها) قبل كتابة أي كود.**
