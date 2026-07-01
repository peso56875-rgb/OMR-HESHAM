import { Hono } from 'hono'
import { auth } from './auth'
import { campaigns } from './campaigns'
import { donations } from './donations'
import { volunteers } from './volunteers'
import { contacts } from './contacts'
import { news } from './news'
import { events } from './events'
import { stories } from './stories'
import { jobs } from './jobs'

const api = new Hono()

api.route('/auth', auth)
api.route('/campaigns', campaigns)
api.route('/donations', donations)
api.route('/volunteers', volunteers)
api.route('/contacts', contacts)
api.route('/news', news)
api.route('/events', events)
api.route('/stories', stories)
api.route('/jobs', jobs)

export { api }
