import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth'
import { campaigns } from './campaigns'
import { donations } from './donations'
import { volunteers } from './volunteers'
import { contacts } from './contacts'
import { news } from './news'
import { events } from './events'
import { stories } from './stories'
import { jobs } from './jobs'
import { newsletter } from './newsletter'
import { profile } from './profile'
import { users } from './users'
import { upload } from './upload'
import { exportApi } from './export'

const api = new Hono()

// Global CORS middleware
api.use('*', cors({
  origin: ['https://omarhesham.org', 'https://www.omarhesham.org', 'http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}))

// Global error handler
api.onError((err, c) => {
  console.error('[API Error]', err.message, err.stack)
  return c.json({ error: 'حدث خطأ داخلي في الخادم' }, 500)
})

// Request logging
api.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  console.log(`[${c.req.method}] ${c.req.path} — ${c.res.status} (${ms}ms)`)
})

// Health check
api.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Mount routes
api.route('/auth', auth)
api.route('/campaigns', campaigns)
api.route('/donations', donations)
api.route('/volunteers', volunteers)
api.route('/contacts', contacts)
api.route('/news', news)
api.route('/events', events)
api.route('/stories', stories)
api.route('/jobs', jobs)
api.route('/newsletter', newsletter)
api.route('/profile', profile)
api.route('/users', users)
api.route('/upload', upload)
api.route('/export', exportApi)

export { api }
