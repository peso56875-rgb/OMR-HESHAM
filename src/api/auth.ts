import { Hono } from 'hono'
import { getSupabaseFromContext } from '../lib/supabase'

import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

export const auth = new Hono()

auth.get('/google', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  // Create a redirect URL that points to our callback route
  const redirectUrl = new URL('/api/auth/callback', new URL(c.req.url).origin).href

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl
    }
  })

  if (error || !data.url) {
    console.error('Google OAuth error:', error?.message)
    return c.redirect('/login?error=oauth_failed')
  }

  // Redirect the user to Google's consent screen
  return c.redirect(data.url)
})

auth.get('/callback', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const code = c.req.query('code')
  const error = c.req.query('error')

  // If the user canceled the login or there was an OAuth error
  if (error) {
    return c.redirect('/login?error=cancelled')
  }

  // Exchange the code for a session
  if (code) {
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!sessionError && data.session) {
      setCookie(c, 'sb-access-token', data.session.access_token, { path: '/', maxAge: 604800, httpOnly: true })
      setCookie(c, 'sb-refresh-token', data.session.refresh_token, { path: '/', maxAge: 604800, httpOnly: true })
    }
  }

  return c.redirect('/dashboard')
})

auth.get('/logout', async (c) => {
  deleteCookie(c, 'sb-access-token', { path: '/' })
  deleteCookie(c, 'sb-refresh-token', { path: '/' })
  return c.redirect('/login')
})
