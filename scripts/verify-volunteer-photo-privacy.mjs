import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
let privateKey = process.env.FIREBASE_PRIVATE_KEY
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '')
}

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase credentials in .env')
  process.exit(1)
}

const app = getApps()[0] || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey })
})

const db = getFirestore(app, 'default')
const snap = await db.collection('volunteers').get()

let privateRefs = 0
let publicUrls = 0
let empty = 0
let legacyFields = 0

for (const doc of snap.docs) {
  const data = doc.data() || {}
  const avatarUrl = String(data.avatar_url || '').trim()
  if (
    Object.prototype.hasOwnProperty.call(data, 'previous_avatar_url') ||
    Object.prototype.hasOwnProperty.call(data, 'avatar_private_migrated_at')
  ) {
    legacyFields++
    console.log(`LEGACY_FIELD_LEFT ${doc.id}`)
  }

  if (!avatarUrl) {
    empty++
  } else if (avatarUrl.startsWith('private-media:')) {
    privateRefs++
  } else {
    publicUrls++
    console.log(`PUBLIC_LEFT ${doc.id} ${avatarUrl.slice(0, 120)}`)
  }
}

console.log(JSON.stringify({
  total: snap.size,
  privateRefs,
  publicUrls,
  empty,
  legacyFields
}, null, 2))

if (publicUrls > 0 || legacyFields > 0) process.exit(1)
