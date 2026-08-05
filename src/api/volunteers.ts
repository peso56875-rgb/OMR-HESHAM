import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { getCookie } from 'hono/cookie'
import { adminMiddleware, authMiddleware } from './middleware'
import { normalizeMediaUrl, storeMediaFile } from '../lib/storage'

export const volunteers = new Hono()

/**
 * The dashboard submits these forms over fetch(). Previously every handler
 * answered with c.redirect(), which fetch() follows transparently: the client
 * ended up with a 200 for /dashboard even when the write had failed, so the UI
 * cheerfully reported "تم الحفظ" while nothing had changed. When the request
 * comes from AJAX we now return a real JSON body + status code instead.
 */
const wantsJson = (c: any): boolean => {
  const accept = (c.req.header('accept') || '').toLowerCase()
  return c.req.header('x-requested-with') === 'XMLHttpRequest' || accept.includes('application/json')
}

const ok = (c: any, message: string, extra: Record<string, any> = {}) => {
  if (wantsJson(c)) return c.json({ success: true, message, ...extra })
  return c.redirect('/dashboard?view=volunteers&success=1')
}

const fail = (c: any, message: string, status: number = 400, code: string = '1') => {
  if (wantsJson(c)) return c.json({ error: message }, status as any)
  return c.redirect(`/dashboard?view=volunteers&error=${encodeURIComponent(code)}`)
}

/**
 * Firestore throws "Cannot use undefined as a Firestore value" and rejects the
 * WHOLE update when any single field is undefined. The admin edit form does not
 * post every field, so building the payload blindly from the body aborted every
 * save. Dropping undefined keys turns each update into a genuine partial patch.
 */
const pruneUndefined = <T extends Record<string, any>>(data: T): Partial<T> => {
  const clean: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) clean[key] = value
  }
  return clean as Partial<T>
}

/** Reads a form field only when the client actually submitted it. */
const field = (body: any, key: string): string | undefined => {
  const raw = body[key]
  if (raw === undefined || raw === null) return undefined
  if (typeof raw !== 'string') return undefined
  return raw.trim()
}

/** Parses a date input (YYYY-MM-DD) into an ISO string, or '' for "no expiry". */
const toIsoDate = (raw: string): string => {
  if (!raw) return ''
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString()
}

/**
 * Allocates the next sequential VOL-N code. The old implementation used
 * .where('volunteer_code', '!=', '') which needs a composite index AND silently
 * skips documents where the field is missing, so it could hand out a duplicate.
 */
const nextVolunteerCode = async (db: any): Promise<string> => {
  const snapshot = await db.collection('volunteers').get()
  const maxNumber = snapshot.docs.reduce((max: number, doc: any) => {
    const match = String(doc.data()?.volunteer_code || '').match(/VOL-(\d+)/i)
    return match ? Math.max(max, parseInt(match[1], 10)) : max
  }, 0)
  return `VOL-${maxNumber + 1}`
}

/** Keeps the linked profile's role and avatar in sync with the volunteer record. */
const syncProfile = async (
  db: any,
  profileId: string | undefined | null,
  updates: { role?: string; avatar_url?: string }
): Promise<void> => {
  if (!profileId) return
  try {
    const profileRef = db.collection('profiles').doc(profileId)
    const profileDoc = await profileRef.get()
    if (!profileDoc.exists) return
    const profileData = profileDoc.data() || {}
    const patch: Record<string, any> = {}
    // Never demote an administrator to a volunteer/donor role.
    if (updates.role && profileData.role !== 'admin' && profileData.role !== updates.role) {
      patch.role = updates.role
    }
    if (updates.avatar_url !== undefined && updates.avatar_url !== profileData.avatar_url) {
      patch.avatar_url = updates.avatar_url
    }
    if (Object.keys(patch).length) await profileRef.update(patch)
  } catch (err: any) {
    console.error('Failed to sync volunteer profile:', err?.message)
  }
}

const VALID_STATUSES = ['approved', 'pending', 'rejected', 'revoked']

// Submit a volunteer application (accepts form data from browser or JSON)
volunteers.post('/', async (c) => {
  const db = getFirestore(c)

  // Extract profile ID from cookie if logged in
  let profile_id: string | null = null
  const sessionCookie = getCookie(c, 'fb-session')
  if (sessionCookie) {
    try {
      const payload = JSON.parse(atob(sessionCookie.split('.')[1]))
      profile_id = payload.uid || payload.sub
    } catch(e) {}
  }

  const contentType = c.req.header('content-type') || ''
  let body: any
  if (contentType.includes('application/json')) {
    body = await c.req.json()
  } else {
    body = await c.req.parseBody()
  }

  const full_name = (body.name || body.full_name) as string
  const phone = body.phone as string
  const age = body.age ? parseInt(body.age as string) : null
  const city = body.city as string
  const preferred_role = (body.role || body.preferred_role) as string
  const skills = body.skills as string
  let avatar_url = body.avatar_url ? normalizeMediaUrl(body.avatar_url) : ''

  // Support direct multipart photo upload with the form
  const avatarFileCandidate = body.avatar_file || body.avatar || body.file
  if (avatarFileCandidate && avatarFileCandidate instanceof File && avatarFileCandidate.size > 0) {
    try {
      const stored = await storeMediaFile(avatarFileCandidate, c)
      if (stored.url) {
        avatar_url = normalizeMediaUrl(stored.url)
      }
    } catch (err: any) {
      console.error('Failed to store uploaded volunteer photo:', err?.message)
    }
  }

  // Fallback to logged-in user profile avatar if no custom photo provided
  if (!avatar_url && profile_id) {
    try {
      const profileDoc = await db.collection('profiles').doc(profile_id).get()
      const pData = profileDoc.data()
      if (profileDoc.exists && pData && pData.avatar_url) {
        avatar_url = normalizeMediaUrl(pData.avatar_url)
      }
    } catch (e) {}
  }

  if (!full_name || !phone) {
    if (!contentType.includes('application/json')) {
      return c.redirect('/volunteers?error=missing_fields')
    }
    return c.json({ error: 'الاسم ورقم الهاتف مطلوبان' }, 400)
  }

  try {
    const volData = {
      profile_id,
      full_name,
      age,
      phone,
      city: city || '',
      preferred_role: preferred_role || '',
      skills: skills || '',
      avatar_url,
      status: 'pending',
      volunteer_code: '',
      rank: '',
      hours_count: 0,
      team: preferred_role || '',
      approved_at: '',
      expires_at: '',
      // A pending application has no card yet, so it must not read as "active".
      // The /status and /validity handlers flip this to true on approval.
      is_active: false,
      created_at: new Date().toISOString()
    }

    await db.collection('volunteers').add(volData)

    if (!contentType.includes('application/json')) {
      return c.redirect('/volunteers?success=1#volForm')
    }
    return c.json({ message: 'تم إرسال طلب التطوع بنجاح.' })
  } catch (error: any) {
    console.error('Error submitting volunteer app:', error.message)
    if (!contentType.includes('application/json')) {
      return c.redirect('/volunteers?error=' + encodeURIComponent(error.message))
    }
    return c.json({ error: error.message }, 500)
  }
})

// Get my volunteer applications (Requires Auth)
volunteers.get('/my', authMiddleware, async (c) => {
  const user = (c as any).get('user') as { id: string }
  const db = getFirestore(c)

  try {
    const snapshot = await db.collection('volunteers')
      .where('profile_id', '==', user.id)
      .orderBy('created_at', 'desc')
      .get()

    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
    return c.json({ data })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Public: Verify a volunteer by code
volunteers.get('/verify/:code', async (c) => {
  const code = (c.req.param('code') || '').trim()
  const db = getFirestore(c)

  // Pending records store volunteer_code as '', so an empty query would match an
  // unapproved applicant and expose them as if they held a real card.
  if (!code) {
    return c.json({ found: false, message: 'يرجى إدخال كود المتطوع.' })
  }

  try {
    const snap = await db.collection('volunteers')
      .where('volunteer_code', '==', code.toUpperCase())
      .limit(1)
      .get()

    if (snap.empty) {
      return c.json({ found: false, message: 'لا يوجد متطوع بهذا الكود.' })
    }

    const vol = snap.docs[0].data()
    const isApproved = vol.status === 'approved'
    const isRevoked = vol.status === 'revoked'
    // Only an *approved* card can be frozen. Deriving "revoked" from is_active
    // alone reported every pending applicant as a cancelled card.
    const isFrozen = isApproved && vol.is_active === false
    const isExpired = Boolean(vol.expires_at && new Date(vol.expires_at) < new Date())

    if (!isApproved && !isRevoked) {
      return c.json({ found: false, message: 'كود المتطوع هذا غير مفعّل أو قيد المراجعة.' })
    }

    return c.json({
      found: true,
      revoked: isRevoked || isFrozen,
      expired: isExpired,
      status: vol.status,
      volunteer: {
        id: snap.docs[0].id,
        full_name: vol.full_name,
        volunteer_code: vol.volunteer_code,
        preferred_role: vol.preferred_role,
        team: vol.team || vol.preferred_role,
        rank: vol.rank || 'متطوع مبادر',
        hours_count: vol.hours_count || 0,
        avatar_url: vol.avatar_url || '',
        approved_at: vol.approved_at,
        expires_at: vol.expires_at,
        status: vol.status,
        is_active: vol.is_active !== false
      }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update status (Admin only) — handles approved, rejected, revoked, pending
volunteers.post('/status/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()
  const status = field(body, 'status')

  if (!status || !VALID_STATUSES.includes(status)) {
    return fail(c, 'حالة غير صالحة. القيم المسموح بها: معتمد، قيد المراجعة، مرفوض، ملغاة.')
  }

  try {
    const volRef = db.collection('volunteers').doc(id)
    const volDoc = await volRef.get()
    if (!volDoc.exists) {
      return fail(c, 'لم يتم العثور على هذا المتطوع.', 404, 'not_found')
    }
    const currentVol = volDoc.data() || {}
    const updateData: Record<string, any> = { status }
    let message = 'تم تحديث حالة المتطوع.'

    if (status === 'approved') {
      const now = new Date()
      updateData.is_active = true
      updateData.volunteer_code = currentVol.volunteer_code || await nextVolunteerCode(db)
      if (!currentVol.rank) updateData.rank = 'متطوع مبادر'
      if (!currentVol.approved_at) updateData.approved_at = now.toISOString()
      if (!currentVol.expires_at) {
        const expiresAt = new Date(now)
        expiresAt.setFullYear(expiresAt.getFullYear() + 2) // Default 2-year validity
        updateData.expires_at = expiresAt.toISOString()
      }
      await syncProfile(db, currentVol.profile_id, {
        role: 'volunteer',
        avatar_url: currentVol.avatar_url || undefined
      })
      message = `تم اعتماد المتطوع وإصدار البطاقة برقم ${updateData.volunteer_code}.`
    } else if (status === 'revoked') {
      updateData.is_active = false
      message = 'تم إلغاء / تجميد بطاقة المتطوع.'
    } else {
      // pending / rejected: no valid card, so the card must not read as active.
      updateData.is_active = false
      message = status === 'rejected' ? 'تم رفض طلب التطوع.' : 'تم إرجاع الطلب إلى قيد المراجعة.'
    }

    await volRef.update(updateData)
    return ok(c, message, { status, volunteer_code: updateData.volunteer_code })
  } catch (error: any) {
    console.error('Error updating volunteer status:', error.message)
    return fail(c, `تعذر تحديث الحالة: ${error.message}`, 500)
  }
})

// Manage duration & ID validity (Admin only) — renew, set custom expiry, cancel expiry, or revoke ID
volunteers.post('/validity/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()
  const action = field(body, 'action') // extend_1yr | extend_2yr | indefinite | set_custom | revoke | activate
  const customDate = field(body, 'expires_at') || ''

  if (!action) {
    return fail(c, 'لم يتم تحديد الإجراء المطلوب على البطاقة.')
  }

  try {
    const volRef = db.collection('volunteers').doc(id)
    const volDoc = await volRef.get()
    if (!volDoc.exists) {
      return fail(c, 'لم يتم العثور على هذا المتطوع.', 404, 'not_found')
    }

    const currentVol = volDoc.data() || {}
    const updateData: Record<string, any> = {}
    const now = new Date()
    let message = ''

    // Any positive validity action un-freezes the card, otherwise "تمديد سنة"
    // would extend the expiry of a card that still renders as revoked.
    const reactivate = () => {
      updateData.is_active = true
      if (currentVol.status !== 'approved') updateData.status = 'approved'
    }

    // Extend from the current expiry when it is still in the future, so pressing
    // "تمديد سنة" twice really adds two years instead of resetting to now+1.
    const extendYears = (years: number) => {
      const base = currentVol.expires_at && new Date(currentVol.expires_at) > now
        ? new Date(currentVol.expires_at)
        : new Date(now)
      base.setFullYear(base.getFullYear() + years)
      updateData.expires_at = base.toISOString()
      reactivate()
      message = `تم تمديد صلاحية البطاقة ${years === 1 ? 'سنة' : 'سنتين'} حتى ${base.toLocaleDateString('ar-EG')}.`
    }

    if (action === 'extend_1yr') {
      extendYears(1)
    } else if (action === 'extend_2yr') {
      extendYears(2)
    } else if (action === 'indefinite' || action === 'cancel_expiry') {
      updateData.expires_at = '' // empty expiry = indefinite validity
      reactivate()
      message = 'تم تحويل البطاقة إلى صلاحية مفتوحة (بدون تاريخ انتهاء).'
    } else if (action === 'set_custom') {
      const iso = toIsoDate(customDate)
      if (!iso) {
        // Previously an invalid/empty date fell through to update({}) and the UI
        // reported success while nothing changed.
        return fail(c, 'يرجى إدخال تاريخ انتهاء صحيح للبطاقة.')
      }
      updateData.expires_at = iso
      reactivate()
      message = `تم تعيين تاريخ انتهاء البطاقة إلى ${new Date(iso).toLocaleDateString('ar-EG')}.`
    } else if (action === 'revoke') {
      updateData.status = 'revoked'
      updateData.is_active = false
      message = 'تم إلغاء / تجميد بطاقة المتطوع.'
    } else if (action === 'activate') {
      updateData.status = 'approved'
      updateData.is_active = true
      // A card revoked before it was ever issued still needs a code/rank.
      if (!currentVol.volunteer_code) updateData.volunteer_code = await nextVolunteerCode(db)
      if (!currentVol.rank) updateData.rank = 'متطوع مبادر'
      if (!currentVol.approved_at) updateData.approved_at = now.toISOString()
      await syncProfile(db, currentVol.profile_id, { role: 'volunteer' })
      message = 'تم إعادة تفعيل بطاقة المتطوع.'
    } else {
      // Unknown actions used to reach update({}) => "success" with zero effect.
      return fail(c, `إجراء غير معروف على البطاقة: ${action}`)
    }

    await volRef.update(updateData)
    return ok(c, message, { expires_at: updateData.expires_at, status: updateData.status })
  } catch (error: any) {
    console.error('Error updating volunteer validity:', error.message)
    return fail(c, `تعذر تحديث صلاحية البطاقة: ${error.message}`, 500)
  }
})

// Full update volunteer details (Admin only)
volunteers.post('/update/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()

  try {
    const volRef = db.collection('volunteers').doc(id)
    const volDoc = await volRef.get()
    if (!volDoc.exists) {
      return fail(c, 'لم يتم العثور على هذا المتطوع.', 404, 'not_found')
    }

    const currentVol = volDoc.data() || {}
    const fullName = field(body, 'full_name')
    const phone = field(body, 'phone')
    const status = field(body, 'status')
    const preferredRole = field(body, 'preferred_role')
    const teamRaw = field(body, 'team')
    const ageRaw = field(body, 'age')
    const hoursRaw = field(body, 'hours_count')

    if (fullName !== undefined && !fullName) return fail(c, 'اسم المتطوع مطلوب ولا يمكن تركه فارغاً.')
    if (phone !== undefined && !phone) return fail(c, 'رقم الهاتف مطلوب ولا يمكن تركه فارغاً.')
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return fail(c, 'حالة المتطوع المحددة غير صالحة.')
    }

    // Every value must be either a real value or absent. A single `undefined`
    // (e.g. skills, which had no input in the form) made Firestore reject the
    // ENTIRE update, which is why "any change doesn't actually change".
    const updateData = pruneUndefined({
      full_name: fullName,
      phone,
      city: field(body, 'city'),
      preferred_role: preferredRole,
      team: teamRaw || preferredRole,
      skills: field(body, 'skills'),
      rank: field(body, 'rank'),
      volunteer_code: field(body, 'volunteer_code')?.toUpperCase(),
      status,
      age: ageRaw === undefined ? undefined : (ageRaw === '' ? null : parseInt(ageRaw, 10) || null),
      hours_count: hoursRaw === undefined ? undefined : (parseInt(hoursRaw, 10) || 0)
    }) as Record<string, any>

    // Keep is_active consistent with the status that will be stored.
    const effectiveStatus = status ?? currentVol.status
    updateData.is_active = effectiveStatus === 'approved'

    // Approving through the edit form must issue a card, just like /status does.
    if (status === 'approved') {
      const now = new Date()
      if (!updateData.volunteer_code && !currentVol.volunteer_code) {
        updateData.volunteer_code = await nextVolunteerCode(db)
      }
      if (!updateData.rank && !currentVol.rank) updateData.rank = 'متطوع مبادر'
      if (!currentVol.approved_at) updateData.approved_at = now.toISOString()
    }

    // Only touch the expiry when the form actually submitted the field, so a
    // partial form never silently wipes an existing expiry date.
    const expiresAtRaw = field(body, 'expires_at')
    if (expiresAtRaw !== undefined) {
      updateData.expires_at = toIsoDate(expiresAtRaw)
    }

    // A pasted URL, or an intentionally emptied field to remove the photo.
    const avatarUrlRaw = field(body, 'avatar_url')
    if (avatarUrlRaw !== undefined) {
      updateData.avatar_url = avatarUrlRaw ? normalizeMediaUrl(avatarUrlRaw) : ''
    }

    // An actual uploaded file always wins over the URL field.
    const avatarFileCandidate = body.avatar_file || body.avatar || body.file
    if (avatarFileCandidate && avatarFileCandidate instanceof File && avatarFileCandidate.size > 0) {
      try {
        const stored = await storeMediaFile(avatarFileCandidate, c)
        if (!stored.url) throw new Error('لم يتم إرجاع رابط للصورة المرفوعة')
        updateData.avatar_url = normalizeMediaUrl(stored.url)
      } catch (err: any) {
        // This used to be swallowed, so "تغيير الصورة الشخصية" appeared to work
        // while the old photo stayed in place.
        return fail(c, `تعذر رفع الصورة الشخصية: ${err?.message || 'خطأ غير معروف'}`, 500)
      }
    }

    if (!Object.keys(updateData).length) {
      return fail(c, 'لا توجد بيانات لتحديثها.')
    }

    await volRef.update(updateData)

    // Push the role/photo change to the linked account so the digital ID card on
    // the member's own profile page shows the same picture.
    await syncProfile(db, currentVol.profile_id, {
      role: effectiveStatus === 'approved' ? 'volunteer' : undefined,
      avatar_url: updateData.avatar_url
    })

    return ok(c, 'تم تحديث بيانات المتطوع بنجاح.', { avatar_url: updateData.avatar_url })
  } catch (error: any) {
    console.error('Error editing volunteer details:', error.message)
    return fail(c, `تعذر تحديث بيانات المتطوع: ${error.message}`, 500)
  }
})

// Update volunteer hours (Admin only)
volunteers.post('/update-hours/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()
  const hoursRaw = field(body, 'hours') ?? field(body, 'hours_count')
  const rank = field(body, 'rank')

  try {
    const volRef = db.collection('volunteers').doc(id)
    const volDoc = await volRef.get()
    if (!volDoc.exists) {
      return fail(c, 'لم يتم العثور على هذا المتطوع.', 404, 'not_found')
    }

    const updateData = pruneUndefined({
      hours_count: hoursRaw === undefined ? undefined : (parseInt(hoursRaw, 10) || 0),
      rank: rank || undefined
    }) as Record<string, any>

    if (!Object.keys(updateData).length) {
      return fail(c, 'يرجى إدخال عدد الساعات أو الرتبة.')
    }

    await volRef.update(updateData)
    return ok(c, 'تم تحديث ساعات الخدمة والرتبة.', updateData)
  } catch (error: any) {
    console.error('Error updating volunteer hours:', error.message)
    return fail(c, `تعذر تحديث ساعات الخدمة: ${error.message}`, 500)
  }
})

// Delete volunteer (Admin only)
volunteers.post('/delete/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  try {
    const volRef = db.collection('volunteers').doc(id)
    const volDoc = await volRef.get()
    if (!volDoc.exists) {
      return fail(c, 'لم يتم العثور على هذا المتطوع.', 404, 'not_found')
    }
    const currentVol = volDoc.data() || {}

    await volRef.delete()

    // Otherwise the account keeps the 'volunteer' role (and volunteer-only menu
    // items) forever after its volunteer record is gone.
    if (currentVol.profile_id) {
      try {
        const profileRef = db.collection('profiles').doc(currentVol.profile_id)
        const profileDoc = await profileRef.get()
        if (profileDoc.exists && profileDoc.data()?.role === 'volunteer') {
          await profileRef.update({ role: 'donor' })
        }
      } catch (err: any) {
        console.error('Failed to reset profile role after delete:', err?.message)
      }
    }

    return ok(c, `تم حذف المتطوع ${currentVol.full_name || ''} نهائياً.`)
  } catch (error: any) {
    console.error('Error deleting volunteer:', error.message)
    return fail(c, `تعذر حذف المتطوع: ${error.message}`, 500)
  }
})
