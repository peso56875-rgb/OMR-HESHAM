import { Hono } from 'hono'
import { getFirestore } from '../lib/firebase-admin'
import { adminMiddleware } from './middleware'
import {
  getNotifyConfig,
  notifyAdmins,
  notifyInBackground,
  notifyMoney,
  dashLink
} from '../lib/notifications'

export const treasury = new Hono()

treasury.use('*', adminMiddleware)

// ───────── INCOME ─────────

// Add income record
treasury.post('/income/add', async (c) => {
  const db = getFirestore(c)
  const user = (c as any).get('user')

  let body: any
  const contentType = c.req.header('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      body = await c.req.json()
    } else {
      body = await c.req.parseBody()
    }
  } catch {
    return c.redirect('/dashboard?view=income&error=invalid_data')
  }

  const amount = Number(body.amount)
  if (!amount || amount <= 0) {
    return c.redirect('/dashboard?view=income&error=invalid_amount')
  }

  const source = (body.source || '').toString().trim()
  if (!source) {
    return c.redirect('/dashboard?view=income&error=missing_source')
  }

  const date = (body.date || '').toString().trim()
  if (!date) {
    return c.redirect('/dashboard?view=income&error=missing_date')
  }

  try {
    // Resolve campaign title if campaign_id provided
    let campaign_title = null
    const campaign_id = (body.campaign_id || '').toString().trim() || null
    if (campaign_id) {
      const campDoc = await db.collection('campaigns').doc(campaign_id).get()
      if (campDoc.exists) {
        campaign_title = campDoc.data()?.title || null
      }
    }

    const incomeData = {
      amount,
      source,
      donor_name: (body.donor_name || '').toString().trim() || null,
      donor_phone: (body.donor_phone || '').toString().trim() || null,
      campaign_id,
      campaign_title,
      description: (body.description || '').toString().trim() || null,
      receipt_url: (body.receipt_url || '').toString().trim() || null,
      date,
      recorded_by: user.name,
      recorded_by_id: user.id,
      created_at: new Date().toISOString()
    }

    const ref = await db.collection('treasury_income').add(incomeData)

    // A6 — إشعار الإدارة بحركة مالية كبيرة في الخزنة
    const cfg = getNotifyConfig(c)
    if (amount >= cfg.treasuryThreshold) {
      await notifyInBackground(c, async () => {
        await notifyAdmins(c, {
          type: 'treasury_large',
          title: `إيراد مالي كبير في الخزنة: ${notifyMoney(amount)}`,
          body: `المصدر: ${source} — المسجل: ${user.name || 'مشرف'}`,
          link: dashLink('income'),
          meta: { income_id: ref.id, amount, source, date }
        })
      })
    }

    return c.redirect('/dashboard?view=income&success=1')
  } catch (error: any) {
    console.error('Error adding income:', error.message)
    return c.redirect('/dashboard?view=income&error=1')
  }
})

// Edit income record
treasury.post('/income/edit/:id', async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string

  let body: any
  const contentType = c.req.header('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      body = await c.req.json()
    } else {
      body = await c.req.parseBody()
    }
  } catch {
    return c.redirect('/dashboard?view=income&error=invalid_data')
  }

  try {
    const docRef = db.collection('treasury_income').doc(id)
    const doc = await docRef.get()
    if (!doc.exists) {
      return c.redirect('/dashboard?view=income&error=not_found')
    }

    // Resolve campaign title if campaign_id provided
    let campaign_title = null
    const campaign_id = (body.campaign_id || '').toString().trim() || null
    if (campaign_id) {
      const campDoc = await db.collection('campaigns').doc(campaign_id).get()
      if (campDoc.exists) {
        campaign_title = campDoc.data()?.title || null
      }
    }

    const updateData: any = {}
    if (body.amount) updateData.amount = Number(body.amount)
    if (body.source) updateData.source = body.source.toString().trim()
    if (body.date) updateData.date = body.date.toString().trim()
    if (body.donor_name !== undefined) updateData.donor_name = body.donor_name.toString().trim() || null
    if (body.donor_phone !== undefined) updateData.donor_phone = body.donor_phone.toString().trim() || null
    if (body.description !== undefined) updateData.description = body.description.toString().trim() || null
    if (body.receipt_url !== undefined) updateData.receipt_url = body.receipt_url.toString().trim() || null
    if (campaign_id !== undefined) {
      updateData.campaign_id = campaign_id
      updateData.campaign_title = campaign_title
    }

    await docRef.update(updateData)
    return c.redirect('/dashboard?view=income&success=1')
  } catch (error: any) {
    console.error('Error editing income:', error.message)
    return c.redirect('/dashboard?view=income&error=1')
  }
})

// Delete income record
treasury.post('/income/delete/:id', async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string

  try {
    await db.collection('treasury_income').doc(id).delete()
    return c.redirect('/dashboard?view=income&success=deleted')
  } catch (error: any) {
    console.error('Error deleting income:', error.message)
    return c.redirect('/dashboard?view=income&error=1')
  }
})

// ───────── EXPENSES ─────────

// Add expense record
treasury.post('/expense/add', async (c) => {
  const db = getFirestore(c)
  const user = (c as any).get('user')

  let body: any
  const contentType = c.req.header('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      body = await c.req.json()
    } else {
      body = await c.req.parseBody()
    }
  } catch {
    return c.redirect('/dashboard?view=expenses&error=invalid_data')
  }

  const amount = Number(body.amount)
  if (!amount || amount <= 0) {
    return c.redirect('/dashboard?view=expenses&error=invalid_amount')
  }

  const category = (body.category || '').toString().trim()
  const beneficiary = (body.beneficiary || '').toString().trim()
  const description = (body.description || '').toString().trim()
  const date = (body.date || '').toString().trim()

  if (!category || !beneficiary || !description || !date) {
    return c.redirect('/dashboard?view=expenses&error=missing_fields')
  }

  try {
    let campaign_title = null
    const campaign_id = (body.campaign_id || '').toString().trim() || null
    if (campaign_id) {
      const campDoc = await db.collection('campaigns').doc(campaign_id).get()
      if (campDoc.exists) {
        campaign_title = campDoc.data()?.title || null
      }
    }

    const expenseData = {
      amount,
      category,
      beneficiary,
      campaign_id,
      campaign_title,
      description,
      receipt_url: (body.receipt_url || '').toString().trim() || null,
      date,
      recorded_by: user.name,
      recorded_by_id: user.id,
      created_at: new Date().toISOString()
    }

    const ref = await db.collection('treasury_expenses').add(expenseData)

    // A6 — إشعار الإدارة بمصروف مالي كبير في الخزنة
    const cfg = getNotifyConfig(c)
    if (amount >= cfg.treasuryThreshold) {
      await notifyInBackground(c, async () => {
        await notifyAdmins(c, {
          type: 'treasury_large',
          title: `مصروف مالي كبير في الخزنة: ${notifyMoney(amount)}`,
          body: `البند: ${category} — الجهة: ${beneficiary} — المسجل: ${user.name || 'مشرف'}`,
          link: dashLink('expenses'),
          meta: { expense_id: ref.id, amount, category, beneficiary, date }
        })
      })
    }

    return c.redirect('/dashboard?view=expenses&success=1')
  } catch (error: any) {
    console.error('Error adding expense:', error.message)
    return c.redirect('/dashboard?view=expenses&error=1')
  }
})

// Edit expense record
treasury.post('/expense/edit/:id', async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string

  let body: any
  const contentType = c.req.header('content-type') || ''
  try {
    if (contentType.includes('application/json')) {
      body = await c.req.json()
    } else {
      body = await c.req.parseBody()
    }
  } catch {
    return c.redirect('/dashboard?view=expenses&error=invalid_data')
  }

  try {
    const docRef = db.collection('treasury_expenses').doc(id)
    const doc = await docRef.get()
    if (!doc.exists) {
      return c.redirect('/dashboard?view=expenses&error=not_found')
    }

    let campaign_title = null
    const campaign_id = (body.campaign_id || '').toString().trim() || null
    if (campaign_id) {
      const campDoc = await db.collection('campaigns').doc(campaign_id).get()
      if (campDoc.exists) {
        campaign_title = campDoc.data()?.title || null
      }
    }

    const updateData: any = {}
    if (body.amount) updateData.amount = Number(body.amount)
    if (body.category) updateData.category = body.category.toString().trim()
    if (body.beneficiary) updateData.beneficiary = body.beneficiary.toString().trim()
    if (body.description !== undefined) updateData.description = body.description.toString().trim()
    if (body.date) updateData.date = body.date.toString().trim()
    if (body.receipt_url !== undefined) updateData.receipt_url = body.receipt_url.toString().trim() || null
    if (campaign_id !== undefined) {
      updateData.campaign_id = campaign_id
      updateData.campaign_title = campaign_title
    }

    await docRef.update(updateData)
    return c.redirect('/dashboard?view=expenses&success=1')
  } catch (error: any) {
    console.error('Error editing expense:', error.message)
    return c.redirect('/dashboard?view=expenses&error=1')
  }
})

// Delete expense record
treasury.post('/expense/delete/:id', async (c) => {
  const db = getFirestore(c)
  const id = c.req.param('id') as string

  try {
    await db.collection('treasury_expenses').doc(id).delete()
    return c.redirect('/dashboard?view=expenses&success=deleted')
  } catch (error: any) {
    console.error('Error deleting expense:', error.message)
    return c.redirect('/dashboard?view=expenses&error=1')
  }
})

// ───────── SUMMARY ─────────

treasury.get('/summary', async (c) => {
  const db = getFirestore(c)

  try {
    const [incomeSnap, expenseSnap] = await Promise.all([
      db.collection('treasury_income').get(),
      db.collection('treasury_expenses').get()
    ])

    const totalIncome = incomeSnap.docs.reduce((sum: number, doc: any) => sum + Number(doc.data().amount || 0), 0)
    const totalExpenses = expenseSnap.docs.reduce((sum: number, doc: any) => sum + Number(doc.data().amount || 0), 0)

    // Monthly breakdown (current month)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    let monthlyIncome = 0
    let monthlyExpenses = 0
    let monthlyTransactions = 0

    incomeSnap.docs.forEach((doc: any) => {
      const d = doc.data()
      if (d.date >= monthStart || d.created_at >= monthStart) {
        monthlyIncome += Number(d.amount || 0)
        monthlyTransactions++
      }
    })

    expenseSnap.docs.forEach((doc: any) => {
      const d = doc.data()
      if (d.date >= monthStart || d.created_at >= monthStart) {
        monthlyExpenses += Number(d.amount || 0)
        monthlyTransactions++
      }
    })

    return c.json({
      balance: totalIncome - totalExpenses,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      monthly_income: monthlyIncome,
      monthly_expenses: monthlyExpenses,
      monthly_transactions: monthlyTransactions
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})
