import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { getAuth, getFirestore } from '../lib/firebase-admin'

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

    // Get user profile from Firestore to fetch role and full name
    const db = getFirestore(c)
    const profileDoc = await db.collection('profiles').doc(decodedClaims.uid).get()
    const profileData = profileDoc.exists ? profileDoc.data() : {}

    const sessionUser = {
      id: decodedClaims.uid,
      email: decodedClaims.email,
      name: profileData?.full_name || decodedClaims.name || decodedClaims.email,
      avatar: profileData?.avatar_url || decodedClaims.picture || '',
      role: profileData?.role || 'user'
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

    // Check admin role from Firestore profiles collection
    const db = getFirestore(c)
    const profileDoc = await db.collection('profiles').doc(decodedClaims.uid).get()
    
    if (!profileDoc.exists || profileDoc.data()?.role !== 'admin') {
      return c.json({ error: 'ليس لديك صلاحية للقيام بهذا الإجراء' }, 403)
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
 */
const rateLimitMap = new Map<string, { count: number; reset: number }>()

export const rateLimiter = (maxRequests: number = 30, windowMs: number = 60000) => {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown'
    const now = Date.now()
    const entry = rateLimitMap.get(ip)

    if (entry && now < entry.reset) {
      entry.count++
      if (entry.count > maxRequests) {
        return c.json({ error: 'عدد كبير من الطلبات. يرجى الانتظار.' }, 429)
      }
    } else {
      rateLimitMap.set(ip, { count: 1, reset: now + windowMs })
    }

    // Cleanup old entries periodically
    if (rateLimitMap.size > 10000) {
      for (const [key, val] of rateLimitMap) {
        if (now > val.reset) rateLimitMap.delete(key)
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
