import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { getAuth, getFirestore } from '../lib/firebase-admin'
import { isPlatformAdmin } from '../lib/admin-check'

/**
 * Authentication middleware — verifies user is logged in via Firebase session cookie.
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const sessionCookie = getCookie(c, 'fb-session')
  const authHeader = c.req.header('Authorization')
  const bearerToken = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : undefined
  const token = sessionCookie || bearerToken

  if (!token) {
    return c.json({ error: 'غير مصرّح: يرجى تسجيل الدخول أولاً' }, 401)
  }

  try {
    const auth = getAuth(c)
    let decodedClaims: any

    if (sessionCookie) {
      // Verify session cookie
      decodedClaims = await auth.verifySessionCookie(sessionCookie, true)
    } else if (bearerToken) {
      // Verify ID token (Bearer)
      decodedClaims = await auth.verifyIdToken(bearerToken)
    }

    if (!decodedClaims) {
      return c.json({ error: 'جلسة غير صالحة: يرجى إعادة تسجيل الدخول' }, 401)
    }

    const email = decodedClaims.email || ''
    const isAdmin = isPlatformAdmin(email, decodedClaims.uid)

    // Get user profile from Firestore to fetch role and full name (with graceful fallback)
    let profileData: any = null
    try {
      const db = getFirestore(c)
      const profileDoc = await db.collection('profiles').doc(decodedClaims.uid).get()
      profileData = profileDoc.exists ? profileDoc.data() : null
    } catch (dbErr: any) {
      console.warn('[Auth Middleware] Firestore read bypassed:', dbErr.message)
    }

    const sessionUser = {
      id: decodedClaims.uid,
      email: email,
      name: profileData?.full_name || decodedClaims.name || email.split('@')[0] || 'عضو',
      avatar: profileData?.avatar_url || decodedClaims.picture || '',
      role: (profileData?.role === 'admin' || isAdmin) ? 'admin' : (profileData?.role || 'user')
    }

    c.set('user', sessionUser)
    c.set('token', token)
    await next()
  } catch (err: any) {
    console.error('[Auth Middleware Error]', err.message)
    return c.json({ error: 'خطأ في التحقق من الهوية' }, 401)
  }
}

/**
 * Admin middleware — verifies user is an admin.
 * Must be used AFTER authMiddleware or independently.
 */
export const adminMiddleware = async (c: Context, next: Next) => {
  const sessionCookie = getCookie(c, 'fb-session')
  const authHeader = c.req.header('Authorization')
  const bearerToken = authHeader?.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : undefined
  const token = sessionCookie || bearerToken

  if (!token) {
    return c.json({ error: 'غير مصرّح: يرجى تسجيل الدخول أولاً' }, 401)
  }

  try {
    const auth = getAuth(c)
    let decodedClaims: any

    if (sessionCookie) {
      decodedClaims = await auth.verifySessionCookie(sessionCookie, true)
    } else if (bearerToken) {
      decodedClaims = await auth.verifyIdToken(bearerToken)
    }

    if (!decodedClaims) {
      return c.json({ error: 'جلسة غير صالحة' }, 401)
    }

    const email = decodedClaims.email || ''
    const isAdmin = isPlatformAdmin(email, decodedClaims.uid)

    // Check admin role from Firestore profiles collection (with graceful fallback for admin emails)
    let profileData: any = null
    try {
      const db = getFirestore(c)
      const profileDoc = await db.collection('profiles').doc(decodedClaims.uid).get()
      profileData = profileDoc.exists ? profileDoc.data() : null
    } catch (dbErr: any) {
      console.warn('[Admin Middleware] Firestore read bypassed:', dbErr.message)
    }

    const role = (profileData?.role === 'admin' || isAdmin) ? 'admin' : (profileData?.role || 'user')
    if (role !== 'admin') {
      return c.json({ error: 'ليس لديك صلاحية للقيام بهذا الإجراء' }, 403)
    }

    const sessionUser = {
      id: decodedClaims.uid,
      email: email,
      name: profileData?.full_name || decodedClaims.name || email.split('@')[0] || 'المشرف',
      avatar: profileData?.avatar_url || decodedClaims.picture || '',
      role: 'admin'
    }

    c.set('user', sessionUser)
    c.set('token', token)
    await next()
  } catch (err: any) {
    console.error('[Admin Middleware Error]', err.message)
    return c.json({ error: 'خطأ في التحقق من الصلاحيات' }, 401)
  }
}

/**
 * Admin guard for HTML pages — redirects to login if not admin.
 */
export const adminPageGuard = async (c: Context, next: Next) => {
  const sessionCookie = getCookie(c, 'fb-session')

  if (!sessionCookie) {
    return c.redirect('/login?error=unauthorized')
  }

  try {
    const auth = getAuth(c)
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true)

    if (!decodedClaims) {
      return c.redirect('/login?error=unauthorized')
    }

    const db = getFirestore(c)
    const profileDoc = await db.collection('profiles').doc(decodedClaims.uid).get()

    if (!profileDoc.exists || profileDoc.data()?.role !== 'admin') {
      return c.redirect('/login?error=not_admin')
    }

    const profileData = profileDoc.data()
    const sessionUser = {
      id: decodedClaims.uid,
      email: decodedClaims.email,
      name: profileData?.full_name || decodedClaims.name || decodedClaims.email,
      avatar: profileData?.avatar_url || decodedClaims.picture || '',
      role: 'admin'
    }

    c.set('user', sessionUser)
    await next()
  } catch (err) {
    return c.redirect('/login?error=unauthorized')
  }
}

/**
 * Simple in-memory rate limiter.
 *
 * NOTE ON SERVERLESS: state lives in the memory of a single function instance.
 * Vercel may run several instances concurrently, so the effective limit is
 * (maxRequests × instances). This is deliberately accepted: the goal is to blunt
 * naive floods from one IP, not to be an exact global quota. A shared store
 * (Redis / Firestore counters) is the follow-up if precise limits are needed.
 */
const rateLimitMap = new Map<string, { count: number; reset: number }>()

/**
 * Resolves the caller's IP. X-Forwarded-For is a comma-separated chain
 * (client, proxy1, proxy2…) so only the FIRST entry is the real client — using
 * the raw header would bucket every visitor behind one proxy into one counter.
 */
const clientIp = (c: Context): string => {
  const forwarded = c.req.header('X-Forwarded-For') || ''
  return c.req.header('CF-Connecting-IP') || forwarded.split(',')[0].trim() || 'unknown'
}

/**
 * @param maxRequests max allowed requests per window
 * @param windowMs    window length in milliseconds
 * @param bucket      optional namespace. Without it every endpoint shares one
 *                    counter per IP, so a burst of donations would lock the
 *                    visitor out of the contact form too.
 */
export const rateLimiter = (maxRequests: number = 30, windowMs: number = 60000, bucket?: string) => {
  return async (c: Context, next: Next) => {
    const key = `${bucket || c.req.path}|${clientIp(c)}`
    const now = Date.now()
    const entry = rateLimitMap.get(key)

    if (entry && now < entry.reset) {
      entry.count++
      if (entry.count > maxRequests) {
        const retryAfter = Math.max(1, Math.ceil((entry.reset - now) / 1000))
        c.header('Retry-After', String(retryAfter))
        return c.json({
          error: `عدد كبير من الطلبات. يرجى المحاولة بعد ${retryAfter} ثانية.`,
          retry_after: retryAfter
        }, 429)
      }
    } else {
      rateLimitMap.set(key, { count: 1, reset: now + windowMs })
    }

    // Sweep expired entries. Threshold kept low because a serverless instance
    // has a small memory budget and gets recycled often anyway.
    if (rateLimitMap.size > 5000) {
      for (const [k, val] of rateLimitMap) {
        if (now > val.reset) rateLimitMap.delete(k)
      }
    }

    await next()
  }
}

/**
 * Validate request body against a schema.
 */
export type ValidationRule = {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'email'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  message?: string
}

export type ValidationSchema = Record<string, ValidationRule>

export const validateBody = (schema: ValidationSchema) => {
  return async (c: Context, next: Next) => {
    let body: any
    const contentType = c.req.header('content-type') || ''

    try {
      if (contentType.includes('application/json')) {
        body = await c.req.json()
      } else {
        body = await c.req.parseBody()
      }
    } catch (err) {
      return c.json({ error: 'بيانات الطلب غير صالحة' }, 400)
    }

    const errors: string[] = []

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field]

      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors.push(rules.message || `الحقل "${field}" مطلوب`)
        continue
      }

      if (value !== undefined && value !== null && value !== '') {
        if (rules.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(String(value))) {
            errors.push(`البريد الإلكتروني غير صالح`)
          }
        }

        if (rules.type === 'number') {
          const num = Number(value)
          if (isNaN(num)) {
            errors.push(`الحقل "${field}" يجب أن يكون رقمًا`)
          } else {
            if (rules.min !== undefined && num < rules.min) {
              errors.push(`الحقل "${field}" يجب أن يكون ${rules.min} على الأقل`)
            }
            if (rules.max !== undefined && num > rules.max) {
              errors.push(`الحقل "${field}" يجب ألا يتجاوز ${rules.max}`)
            }
          }
        }

        if (rules.type === 'string' || !rules.type) {
          const str = String(value)
          if (rules.minLength && str.length < rules.minLength) {
            errors.push(`الحقل "${field}" يجب أن يكون ${rules.minLength} حروف على الأقل`)
          }
          if (rules.maxLength && str.length > rules.maxLength) {
            errors.push(`الحقل "${field}" يجب ألا يتجاوز ${rules.maxLength} حرف`)
          }
          if (rules.pattern && !rules.pattern.test(str)) {
            errors.push(rules.message || `الحقل "${field}" بصيغة غير صالحة`)
          }
        }
      }
    }

    if (errors.length > 0) {
      return c.json({ error: errors[0], errors }, 400)
    }

    c.set('validatedBody', body)
    await next()
  }
}
