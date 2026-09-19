import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

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
const dryRun = process.argv.includes('--dry-run')
const snap = await db.collection('volunteers').get()

let scrubbed = 0

for (const doc of snap.docs) {
  const data = doc.data()
  const hasPrevious = Object.prototype.hasOwnProperty.call(data, 'previous_avatar_url')
  const hasPrivateMarker = Object.prototype.hasOwnProperty.call(data, 'avatar_private_migrated_at')
  if (!hasPrevious && !hasPrivateMarker) continue

  console.log(`[SCRUB] ${doc.id} ${data.full_name || ''}`)
  if (!dryRun) {
    await doc.ref.update({
      previous_avatar_url: FieldValue.delete(),
      avatar_private_migrated_at: FieldValue.delete()
    })
  }
  scrubbed++
}

console.log(JSON.stringify({ dryRun, scrubbed }, null, 2))
