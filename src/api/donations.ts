import { Hono } from 'hono'
import { getSupabaseFromContext, getSupabaseAdminFromContext } from '../lib/supabase'
import { adminMiddleware, authMiddleware } from './middleware'

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
    }
  }

  const body = await c.req.json()
  const { amount, donation_type, campaign_id, donor_name, donor_phone, donor_email, payment_method } = body

  if (!amount || !donor_name || !donor_phone || !payment_method) {
    return c.json({ error: 'الحقول المطلوبة غير مكتملة' }, 400)
  }

  const { data, error } = await supabase
    .from('donations')
    .insert([{
      profile_id,
      campaign_id: campaign_id || null,
      amount: Number(amount),
      donation_type: donation_type || 'once',
      donor_name,
      donor_phone,
      donor_email: donor_email || null,
      payment_method,
      payment_status: 'pending',
      status: 'pending'
    }])
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data, message: 'تم التبرع بنجاح. شكرًا لك!' })
})

// Get my donations (Requires Auth)
donations.get('/my', authMiddleware, async (c) => {
  const user = (c as any).get('user')
  const supabase = getSupabaseAdminFromContext(c) // Use admin to bypass restricted SELECT if user isn't fully synced yet, but filter by user.id
  
  const { data, error } = await supabase
    .from('donations')
    .select('*, campaigns(title, category)')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ data })
})

// Accept donation from the public donate page (HTML form)
donations.post('/add', async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
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
      payment_status: 'pending',
      status: 'pending'
    }])

  if (error) {
    console.error('Donation insert error:', error.message)
    return c.redirect('/donate?error=db')
  }

  return c.redirect('/donate?success=1')
})

// Update status (Admin only)
donations.post('/status/:id', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  
  const { error } = await supabase
    .from('donations')
    .update({ status: body.status })
    .eq('id', id)

  if (error) return c.redirect('/dashboard/donations?error=1')
  return c.redirect('/dashboard/donations?success=1')
})

// Get donation stats (Admin only)
donations.get('/stats', adminMiddleware, async (c) => {
  const supabase = getSupabaseAdminFromContext(c)
  
  const [{ count: cDonors }, { count: cCampaigns }, { count: cVolunteers }, { data: sumData }] = await Promise.all([
    supabase.from('donations').select('*', { count: 'exact', head: true }),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }),
    supabase.from('volunteers').select('*', { count: 'exact', head: true }),
    supabase.from('donations').select('amount')
  ])

  const totalAmount = (sumData || []).reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0)

  return c.json({
    total_donations: totalAmount,
    total_campaigns: cCampaigns || 0,
    total_donors: cDonors || 0,
    total_volunteers: cVolunteers || 0
  })
})
