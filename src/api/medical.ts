import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware, rateLimiter } from './middleware'
import { notifyAdmins, notifyInBackground, dashLink } from '../lib/notifications'
import { getEmailConfig, sendInBackground, contactAlert } from '../lib/email'

export const medical = new Hono()

// القائمة الافتراضية للأجهزة الطبية المتاحة للإعارة الخيرية
export const defaultMedicalEquipment = [
  {
    id: 'med_oxy_10l_01',
    name: 'جهاز مولد أكسجين طبي 10 لتر (Oxygen Concentrator)',
    category: 'respiratory',
    category_name: 'أجهزة تنفسية وأكسجين',
    code: 'OXY-10L-01',
    description: 'مولد أكسجين رقمي عالي الكفاءة يعمل بالكهرباء لتوفير الأكسجين النقي المستمر لمرضى الرعاية المنزلية دون الحاجة لتغيير أسطوانات.',
    status: 'available',
    condition: 'ممتازة — فحص دوري',
    total_loans_count: 14,
    image_icon: 'fa-lungs',
    is_available: true
  },
  {
    id: 'med_oxy_cyl_02',
    name: 'أسطوانة أكسجين طبي كبرى مع المنظم والماسك',
    category: 'respiratory',
    category_name: 'أجهزة تنفسية وأكسجين',
    code: 'OXY-CYL-02',
    description: 'أسطوانة أكسجين سعة 40 لتر ممتلئة مع منظم هيدروليكي وماسك نيبولايزر لحالات الطوارئ والتنقل الحرجة.',
    status: 'available',
    condition: 'ممتازة',
    total_loans_count: 26,
    image_icon: 'fa-bottle-water',
    is_available: true
  },
  {
    id: 'med_wheelchair_elec_03',
    name: 'كرسي متحرك كهربائي ذكي قابل للطي',
    category: 'mobility',
    category_name: 'كراسي متحركة وأجهزة حركية',
    code: 'WCH-EL-03',
    description: 'كرسي كهربائي ببطارية ليثيوم طويلة الأمد مع تحكم سلس لتمكين ذوي الإعاقة وكبار السن من الحركة باستقلالية تامة وكرامة.',
    status: 'available',
    condition: 'ممتازة',
    total_loans_count: 8,
    image_icon: 'fa-wheelchair',
    is_available: true
  },
  {
    id: 'med_wheelchair_std_04',
    name: 'كرسي متحرك طبي مريح وخفيف الوزن',
    category: 'mobility',
    category_name: 'كراسي متحركة وأجهزة حركية',
    code: 'WCH-STD-04',
    description: 'كرسي متحرك صلب قابل للطي مع مساند للقدمين ومكابح أمان ومقعد مبطن ومضاد للبلل.',
    status: 'available',
    condition: 'جيدة جداً',
    total_loans_count: 42,
    image_icon: 'fa-wheelchair-move',
    is_available: true
  },
  {
    id: 'med_hospital_bed_05',
    name: 'سرير رعاية طبية منزلي هيدروليكي 3 حركات بالمرتبة',
    category: 'beds',
    category_name: 'أسرّة طبية ومستلزمات',
    code: 'BED-HYD-05',
    description: 'سرير عناية منزلية مزود بمقابض تحكم في زوايا الظهر والقدمين وارتفاع السرير مع جوانب حماية من السقوط وحامل محاليل.',
    status: 'available',
    condition: 'ممتازة',
    total_loans_count: 11,
    image_icon: 'fa-bed-pulse',
    is_available: true
  },
  {
    id: 'med_air_mattress_06',
    name: 'مرتبة هوائية طبية ذات ضغط متناوب مضادة لقرح الفراش',
    category: 'beds',
    category_name: 'أسرّة طبية ومستلزمات',
    code: 'AIR-MAT-06',
    description: 'مرتبة هوائية مع مضخة صامتة تعمل على توزيع الضغط التناوبي باستمرار لحماية المرضى طريحي الفراش وكبار السن من قرح الفراش.',
    status: 'available',
    condition: 'جديدة',
    total_loans_count: 31,
    image_icon: 'fa-mattress-pillow',
    is_available: true
  },
  {
    id: 'med_suction_unit_07',
    name: 'جهاز شفط بلغم وسوائل جراحي متنقل (Phlegm Suction)',
    category: 'respiratory',
    category_name: 'أجهزة تنفسية وأكسجين',
    code: 'SUC-07',
    description: 'جهاز شفط إفرازات بلغم كهربائي هادئ لمرضى الشلل الرباعي وجلطات المخ وأصحاب الفتحات الحنجرية.',
    status: 'available',
    condition: 'ممتازة ومُعقَّم',
    total_loans_count: 19,
    image_icon: 'fa-lungs-virus',
    is_available: true
  },
  {
    id: 'med_vitals_kit_08',
    name: 'حقيبة قياس المؤشرات الحيوية المنزلية الشاملة',
    category: 'diagnostics',
    category_name: 'أجهزة قياس وفحص منزلي',
    code: 'VIT-KIT-08',
    description: 'حقيبة متكاملة تضم: جهاز قياس الضغط الإلكتروني، مقياس نسبة تشبع الأكسجين بالدم ونبض القلب (Pulse Oximeter)، جهاز قياس السكر بالدم بشرائطه، ومقياس حرارة رقمي.',
    status: 'available',
    condition: 'جديدة',
    total_loans_count: 54,
    image_icon: 'fa-heart-pulse',
    is_available: true
  }
]

// 1. تقديم طلب استعارة جهاز طبي مجاناً (Public form)
medical.post('/request', rateLimiter(5, 60000, 'med-request'), async (c) => {
  try {
    const body = await c.req.parseBody()
    const patient_name = String(body.patient_name || '').trim()
    const patient_national_id = String(body.patient_national_id || '').trim()
    const requester_name = String(body.requester_name || patient_name).trim()
    const requester_phone = String(body.requester_phone || '').trim()
    const alt_phone = String(body.alt_phone || '').trim()
    const city = String(body.city || '').trim()
    const address = String(body.address || '').trim()
    const equipment_type = String(body.equipment_type || '').trim()
    const expected_duration = String(body.expected_duration || 'شهر واحد').trim()
    const diagnosis = String(body.diagnosis || '').trim()
    const medical_report_url = String(body.medical_report_url || '').trim()

    if (!patient_name || !requester_phone || !equipment_type || !address) {
      return c.json({ error: 'يرجى استكمال الحقول الإلزامية (اسم المريض، الهاتف، الجهاز، العنوان)' }, 400)
    }

    const db = getFirestore(c)
    const requestData = {
      patient_name,
      patient_national_id,
      requester_name,
      requester_phone,
      alt_phone,
      city,
      address,
      equipment_type,
      expected_duration,
      diagnosis,
      medical_report_url,
      status: 'pending', // pending | approved | active_loan | returned | rejected
      created_at: new Date().toISOString()
    }

    const docRef = await db.collection('medical_requests').add(requestData)
    const record = { id: docRef.id, ...requestData }

    // إشعار الإدارة فوراً
    await notifyInBackground(c, async () => {
      await notifyAdmins(c, {
        type: 'medical_request_new',
        title: `طلب استعارة جهاز طبي: ${equipment_type}`,
        body: `المريض: ${patient_name} — المحافظة: ${city || 'غير محددة'} — الهاتف: ${requester_phone}`,
        link: dashLink('medical'),
        meta: {
          request_id: record.id,
          equipment_type,
          patient_name
        }
      })

      const cfg = getEmailConfig(c)
      await contactAlert(cfg, {
        name: `طلب جهاز: ${requester_name} (للمريض: ${patient_name})`,
        phone: requester_phone,
        email: 'info@omarhesham.org',
        subject: `طلب استعارة جهاز طبي عاجل: ${equipment_type}`,
        message: `الجهاز المطلوب: ${equipment_type}\nاسم المريض: ${patient_name}\nالعنوان: ${city} - ${address}\nالتشخيص: ${diagnosis}\nالمدة المتوقعة: ${expected_duration}`
      })
    })

    return c.json({
      success: true,
      message: 'تم استلام طلب استعارة الجهاز الطبي بنجاح! سيقوم فريق الرعاية والتنسيق الميداني بالتواصل معك خلال ساعات للمراجعة والتسليم بكرامة ويسر.'
    })
  } catch (e: any) {
    console.error('[Medical Request Error]', e)
    return c.json({ error: 'حدث خطأ في تسجيل الطلب، يرجى المحاولة لاحقاً' }, 500)
  }
})

// 2. تحديث حالة طلب الاستعارة (Admin only)
medical.post('/requests/status/:id', adminMiddleware, async (c) => {
  try {
    const id = c.req.param('id') as string
    const body = await c.req.parseBody()
    const newStatus = String(body.status || '').trim()
    const notes = String(body.notes || '').trim()

    if (!['pending', 'approved', 'active_loan', 'returned', 'rejected'].includes(newStatus)) {
      return c.redirect('/dashboard?view=medical&error=invalid_status')
    }

    const db = getFirestore(c)
    await db.collection('medical_requests').doc(id).update({
      status: newStatus,
      admin_notes: notes,
      updated_at: new Date().toISOString()
    })

    return c.redirect('/dashboard?view=medical&success=status_updated')
  } catch (e: any) {
    console.error('[Medical Status Update Error]', e)
    return c.redirect('/dashboard?view=medical&error=server')
  }
})

// 3. إضافة وحدة جهاز طبي جديدة لأسطول المؤسسة (Admin only)
medical.post('/items/add', adminMiddleware, async (c) => {
  try {
    const body = await c.req.parseBody()
    const name = String(body.name || '').trim()
    const category = String(body.category || 'respiratory').trim()
    const category_name = String(body.category_name || '').trim()
    const code = String(body.code || '').trim()
    const description = String(body.description || '').trim()
    const condition = String(body.condition || 'ممتازة').trim()
    const image_icon = String(body.image_icon || 'fa-heart-pulse').trim()

    if (!name) {
      return c.redirect('/dashboard?view=medical&error=missing_name')
    }

    const db = getFirestore(c)
    await db.collection('medical_equipment').add({
      name,
      category,
      category_name: category_name || (category === 'respiratory' ? 'أجهزة تنفسية وأكسجين' : category === 'mobility' ? 'كراسي متحركة' : 'أسرّة ومستلزمات طبية'),
      code: code || `MED-${Math.floor(100 + Math.random() * 900)}`,
      description,
      status: 'available',
      condition,
      image_icon,
      total_loans_count: 0,
      is_available: true,
      created_at: new Date().toISOString()
    })

    return c.redirect('/dashboard?view=medical&success=device_added')
  } catch (e: any) {
    console.error('[Medical Add Item Error]', e)
    return c.redirect('/dashboard?view=medical&error=server')
  }
})

// 4. تبديل حالة الجهاز (متاح / صيانة)
medical.post('/items/toggle/:id', adminMiddleware, async (c) => {
  try {
    const id = c.req.param('id') as string
    const db = getFirestore(c)
    const docRef = db.collection('medical_equipment').doc(id)
    const doc = await docRef.get()
    if (doc.exists) {
      const cur = doc.data()?.status || 'available'
      const nextStatus = cur === 'available' ? 'maintenance' : 'available'
      await docRef.update({
        status: nextStatus,
        is_available: nextStatus === 'available',
        updated_at: new Date().toISOString()
      })
    }
    return c.redirect('/dashboard?view=medical&success=device_toggled')
  } catch (e: any) {
    return c.redirect('/dashboard?view=medical&error=server')
  }
})

// 5. حذف جهاز من الأسطول (Admin only)
medical.post('/items/delete/:id', adminMiddleware, async (c) => {
  try {
    const id = c.req.param('id') as string
    const db = getFirestore(c)
    await db.collection('medical_equipment').doc(id).delete()
    return c.redirect('/dashboard?view=medical&success=device_deleted')
  } catch (e: any) {
    console.error('[Medical Delete Item Error]', e)
    return c.redirect('/dashboard?view=medical&error=server')
  }
})
