import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { getCookie } from 'hono/cookie'
import { adminMiddleware, authMiddleware } from './middleware'
import { normalizeMediaUrl, storeMediaFile } from '../lib/storage'

export const volunteers = new Hono()

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
      is_active: true,
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
  const code = c.req.param('code')
  const db = getFirestore(c)

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
    const isRevoked = vol.status === 'revoked' || vol.is_active === false
    const isExpired = Boolean(vol.expires_at && new Date(vol.expires_at) < new Date())

    if (!isApproved && !isRevoked) {
      return c.json({ found: false, message: 'كود المتطوع هذا غير مفعّل أو قيد المراجعة.' })
    }

    return c.json({
      found: true,
      revoked: isRevoked,
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
  const status = body.status as string

  try {
    const volRef = db.collection('volunteers').doc(id)
    const volDoc = await volRef.get()
    if (!volDoc.exists) {
      return c.redirect('/dashboard?view=volunteers&error=not_found')
    }
    const currentVol = volDoc.data()
    const updateData: any = { status }

    if (status === 'approved') {
      updateData.is_active = true
      let newCode = currentVol?.volunteer_code

      if (!newCode) {
        // Generate sequential volunteer code: VOL-1, VOL-2, etc.
        const allApproved = await db.collection('volunteers')
          .where('volunteer_code', '!=', '')
          .get()

        const maxNum = allApproved.docs.reduce((max: number, doc: any) => {
          const code = doc.data().volunteer_code || ''
          const match = code.match(/VOL-(\d+)/)
          return match ? Math.max(max, parseInt(match[1])) : max
        }, 0)

        newCode = `VOL-${maxNum + 1}`
      }

      const now = new Date()
      updateData.volunteer_code = newCode
      if (!currentVol?.rank) updateData.rank = 'متطوع مبادر'
      if (!currentVol?.approved_at) updateData.approved_at = now.toISOString()
      if (!currentVol?.expires_at) {
        const expiresAt = new Date(now)
        expiresAt.setFullYear(expiresAt.getFullYear() + 2) // Default 2-year validity
        updateData.expires_at = expiresAt.toISOString()
      }

      // Sync profile role and avatar if user has a profile_id
      if (currentVol?.profile_id) {
        const profileRef = db.collection('profiles').doc(currentVol.profile_id)
        const profileDoc = await profileRef.get()
        if (profileDoc.exists) {
          const profileData = profileDoc.data()
          const profileUpdate: any = {}
          if (profileData?.role !== 'admin') {
            profileUpdate.role = 'volunteer'
          }
          if (currentVol.avatar_url && !profileData?.avatar_url) {
            profileUpdate.avatar_url = currentVol.avatar_url
          }
          if (Object.keys(profileUpdate).length > 0) {
            await profileRef.update(profileUpdate)
          }
        }
      }
    } else if (status === 'revoked') {
      updateData.is_active = false
    }

    await volRef.update(updateData)
    return c.redirect('/dashboard?view=volunteers&success=1')
  } catch (error: any) {
    console.error('Error updating volunteer status:', error.message)
    return c.redirect('/dashboard?view=volunteers&error=1')
  }
})

// Manage duration & ID validity (Admin only) — renew, set custom expiry, cancel expiry, or revoke ID
volunteers.post('/validity/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()
  const action = body.action as string // 'extend_1yr' | 'extend_2yr' | 'indefinite' | 'set_custom' | 'revoke' | 'activate'
  const customDate = body.expires_at as string

  try {
    const volRef = db.collection('volunteers').doc(id)
    const volDoc = await volRef.get()
    if (!volDoc.exists) {
      return c.redirect('/dashboard?view=volunteers&error=not_found')
    }

    const updateData: any = {}
    const now = new Date()

    if (action === 'extend_1yr') {
      const expiresAt = new Date(now)
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      updateData.expires_at = expiresAt.toISOString()
      updateData.is_active = true
      if (volDoc.data()?.status === 'revoked') updateData.status = 'approved'
    } else if (action === 'extend_2yr') {
      const expiresAt = new Date(now)
      expiresAt.setFullYear(expiresAt.getFullYear() + 2)
      updateData.expires_at = expiresAt.toISOString()
      updateData.is_active = true
      if (volDoc.data()?.status === 'revoked') updateData.status = 'approved'
    } else if (action === 'indefinite' || action === 'cancel_expiry') {
      updateData.expires_at = '' // Clear expiry date = indefinite validity
      updateData.is_active = true
      if (volDoc.data()?.status === 'revoked') updateData.status = 'approved'
    } else if (action === 'set_custom' && customDate) {
      updateData.expires_at = new Date(customDate).toISOString()
      updateData.is_active = true
      if (volDoc.data()?.status === 'revoked') updateData.status = 'approved'
    } else if (action === 'revoke') {
      updateData.status = 'revoked'
      updateData.is_active = false
    } else if (action === 'activate') {
      updateData.status = 'approved'
      updateData.is_active = true
    }

    await volRef.update(updateData)
    return c.redirect('/dashboard?view=volunteers&success=1')
  } catch (error: any) {
    console.error('Error updating volunteer validity:', error.message)
    return c.redirect('/dashboard?view=volunteers&error=1')
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
      return c.redirect('/dashboard?view=volunteers&error=not_found')
    }

    const updateData: any = {
      full_name: body.full_name as string,
      phone: body.phone as string,
      age: body.age ? parseInt(body.age as string) : null,
      city: body.city as string,
      preferred_role: body.preferred_role as string,
      team: (body.team || body.preferred_role) as string,
      skills: body.skills as string,
      rank: body.rank as string,
      hours_count: body.hours_count ? parseInt(body.hours_count as string) : 0,
      volunteer_code: body.volunteer_code as string,
      status: body.status as string,
      is_active: body.status !== 'revoked' && body.is_active !== 'false'
    }

    if (body.expires_at !== undefined) {
      updateData.expires_at = body.expires_at ? new Date(body.expires_at as string).toISOString() : ''
    }

    let newAvatarUrl = body.avatar_url as string
    if (newAvatarUrl) {
      updateData.avatar_url = normalizeMediaUrl(newAvatarUrl)
    }

    // Check if new photo was uploaded via avatar_file
    const avatarFileCandidate = body.avatar_file || body.avatar || body.file
    if (avatarFileCandidate && avatarFileCandidate instanceof File && avatarFileCandidate.size > 0) {
      const stored = await storeMediaFile(avatarFileCandidate, c)
      if (stored.url) {
        updateData.avatar_url = normalizeMediaUrl(stored.url)
      }
    }

    await volRef.update(updateData)
    return c.redirect('/dashboard?view=volunteers&success=1')
  } catch (error: any) {
    console.error('Error editing volunteer details:', error.message)
    return c.redirect('/dashboard?view=volunteers&error=1')
  }
})

// Update volunteer hours (Admin only)
volunteers.post('/update-hours/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  const body = await c.req.parseBody()
  const hours = parseInt(body.hours as string) || 0
  const rank = body.rank as string

  try {
    const updateData: any = { hours_count: hours }
    if (rank) updateData.rank = rank

    await db.collection('volunteers').doc(id).update(updateData)
    return c.redirect('/dashboard?view=volunteers&success=1')
  } catch (error: any) {
    console.error('Error updating volunteer hours:', error.message)
    return c.redirect('/dashboard?view=volunteers&error=1')
  }
})

// Delete volunteer (Admin only)
volunteers.post('/delete/:id', adminMiddleware, async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string
  try {
    await db.collection('volunteers').doc(id).delete()
    return c.redirect('/dashboard?view=volunteers&success=1')
  } catch (error: any) {
    console.error('Error deleting volunteer:', error.message)
    return c.redirect('/dashboard?view=volunteers&error=1')
  }
})
