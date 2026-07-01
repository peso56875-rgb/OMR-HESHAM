import { Hono } from 'hono'
import { getSupabaseFromContext } from '../lib/supabase'

export const donations = new Hono()

// Create a new donation
donations.post('/', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  // Set user context if logged in
  const authHeader = c.req.header('Authorization')
  let profile_id = null
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user) {
      profile_id = user.id
      await supabase.auth.setSession({ access_token: token, refresh_token: '' })
    }
  }

  const body = await c.req.json()
  const { amount, donation_type, campaign_id, donor_name, donor_phone, donor_email, payment_method } = body

  if (!amount || !donor_name || !donor_phone || !payment_method) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const { data, error } = await supabase
    .from('donations')
    .insert([{
      profile_id,
      campaign_id: campaign_id || null,
      amount,
      donation_type: donation_type || 'once',
      donor_name,
      donor_phone,
      donor_email,
      payment_method,
      status: 'pending' // Initially pending until payment gateway confirms
    }])
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data, message: 'Donation created successfully. Proceed to payment.' })
})

// Get my donations (Requires Auth)
donations.get('/my', async (c) => {
  const supabase = getSupabaseFromContext(c)
  
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
    
  const token = authHeader.replace('Bearer ', '')
  await supabase.auth.setSession({ access_token: token, refresh_token: '' })

  const { data, error } = await supabase
    .from('donations')
    .select('*, campaigns(title, category)')
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Accept donation from the public donate page (HTML form)
donations.post('/add', async (c) => {
  const supabase = getSupabaseFromContext(c)
  const body = await c.req.parseBody()

  const amount = Number(body.amount) || 0
  const donor_name = (body.donor_name as string || '').trim()
  const donor_phone = (body.donor_phone as string || '').trim()

  if (!amount || !donor_name || !donor_phone) {
    return c.redirect('/donate?error=missing')
  }

  const { error } = await supabase
    .from('donations')
    .insert([{
      amount,
      donation_type: body.donation_type || 'once',
      donor_name,
      donor_phone,
      donor_email: body.donor_email || null,
      payment_method: body.payment_method || 'card',
      status: 'completed'
    }])

  if (error) {
    console.error('Donation insert error:', error.message)
    return c.redirect('/donate?error=db')
  }

  return c.redirect('/donate?success=1')
})
