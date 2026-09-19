import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import crypto from 'crypto'

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

const CODE_SUFFIX_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomCodeSuffix() {
  const bytes = crypto.randomBytes(4)
  let suffix = ''
  for (let i = 0; i < bytes.length; i++) {
    suffix += CODE_SUFFIX_ALPHABET[bytes[i] % CODE_SUFFIX_ALPHABET.length]
  }
  return suffix
}

async function hardenVolunteerCodes() {
  console.log('=== Starting Volunteer Codes Hardening ===')
  const snap = await db.collection('volunteers').get()
  console.log(`Found ${snap.size} total volunteer records.`)

  let updatedCount = 0
  let alreadySecureCount = 0
  let noCodeCount = 0

  for (const doc of snap.docs) {
    const data = doc.data()
    const code = String(data.volunteer_code || '').trim()

    if (!code) {
      noCodeCount++
      continue
    }

    // Check if code is purely sequential e.g. VOL-1, VOL-4, VOL-51
    const isSequential = /^VOL-\d+$/i.test(code)

    if (isSequential) {
      const suffix = randomCodeSuffix()
      const hardenedCode = `${code.toUpperCase()}-${suffix}`
      console.log(`[HARDEN] Migrating ${doc.id} (${data.full_name || 'No name'}): ${code} -> ${hardenedCode}`)
      
      await doc.ref.update({
        volunteer_code: hardenedCode,
        code_hardened_at: new Date().toISOString(),
        previous_sequential_code: code
      })
      updatedCount++
    } else {
      alreadySecureCount++
    }
  }

  console.log('=== Volunteer Hardening Summary ===')
  console.log(`Migrated sequential codes to CSPRNG: ${updatedCount}`)
  console.log(`Already randomized/secure: ${alreadySecureCount}`)
  console.log(`Records without code (pending/unapproved): ${noCodeCount}`)
}

hardenVolunteerCodes()
  .then(() => {
    console.log('Volunteer code hardening completed successfully.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Error hardening volunteer codes:', err)
    process.exit(1)
  })
