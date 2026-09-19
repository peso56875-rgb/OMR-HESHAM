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

let app
if (!getApps().length) {
  app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey })
  })
} else {
  app = getApps()[0]
}

const db = getFirestore(app, 'default')

// Official whitelist of administrators
const OFFICIAL_ADMIN_EMAILS = [
  'dr.omarheshamfoundation@gmail.com',
  'rahmmaaa9900@gmail.com',
  'peso56875@gmail.com',
]

async function cleanseAdminProfiles() {
  console.log('=== Starting Admin Profiles Cleansing ===')
  console.log('Official Admins Whitelist:', OFFICIAL_ADMIN_EMAILS)

  const profilesSnap = await db.collection('profiles').get()
  console.log(`Total profiles in database: ${profilesSnap.size}`)

  let demotedCount = 0
  let preservedCount = 0
  let promotedCount = 0

  for (const doc of profilesSnap.docs) {
    const data = doc.data()
    const email = (data.email || '').trim().toLowerCase()
    const role = data.role

    const isWhitelisted = OFFICIAL_ADMIN_EMAILS.includes(email)

    if (role === 'admin' && !isWhitelisted) {
      console.log(`[DEMOTE] Revoking unauthorized admin role from: ${email} (${doc.id}) -> 'donor'`)
      await doc.ref.update({
        role: 'donor',
        updated_at: new Date().toISOString(),
        security_cleansed_at: new Date().toISOString()
      })
      demotedCount++
    } else if (role === 'admin' && isWhitelisted) {
      console.log(`[PRESERVE] Legitimate admin confirmed: ${email} (${doc.id})`)
      preservedCount++
    } else if (isWhitelisted && role !== 'admin') {
      console.log(`[PROMOTE] Elevating whitelisted admin account: ${email} (${doc.id}) -> 'admin'`)
      await doc.ref.update({
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      promotedCount++
    }
  }

  console.log('=== Cleansing Summary ===')
  console.log(`Demoted unauthorized accounts: ${demotedCount}`)
  console.log(`Preserved official admin accounts: ${preservedCount}`)
  console.log(`Promoted whitelisted admin accounts: ${promotedCount}`)
}

cleanseAdminProfiles()
  .then(() => {
    console.log('Admin profiles cleansing completed successfully.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Error during cleansing:', err)
    process.exit(1)
  })
