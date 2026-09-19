import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
let privateKey = process.env.FIREBASE_PRIVATE_KEY
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '')
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

const OFFICIAL_ADMIN_EMAILS = [
  'dr.omarheshamfoundation@gmail.com',
  'rahmmaaa9900@gmail.com',
  'peso56875@gmail.com'
]

async function verifySecurityPosture() {
  console.log('====================================================')
  console.log('🛡️  RUNNING COMPREHENSIVE CYBERSECURITY AUDIT & TESTS')
  console.log('====================================================\n')

  let passedTests = 0
  let failedTests = 0

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`)
      passedTests++
    } else {
      console.error(`❌ [FAIL] ${testName}`)
      failedTests++
    }
  }

  // TEST 1: Database Admin Roles Audit
  console.log('--- Test 1: Verifying Firestore Admin Profiles ---')
  const profilesSnap = await db.collection('profiles').get()
  const adminProfiles = []
  for (const doc of profilesSnap.docs) {
    const data = doc.data()
    if (data.role === 'admin') {
      adminProfiles.push({ id: doc.id, email: (data.email || '').toLowerCase() })
    }
  }

  console.log(`Found ${adminProfiles.length} admin accounts in Firestore:`, adminProfiles.map(a => a.email))
  const unauthorizedAdmins = adminProfiles.filter(a => !OFFICIAL_ADMIN_EMAILS.includes(a.email))
  assert(unauthorizedAdmins.length === 0, `Zero unauthorized admin profiles exist in Firestore (Found: ${unauthorizedAdmins.length})`)

  // TEST 2: Volunteer Codes Unpredictability Check
  console.log('\n--- Test 2: Verifying Volunteer Codes Hardening ---')
  const volunteersSnap = await db.collection('volunteers').get()
  let sequentialCount = 0
  let secureRandomizedCount = 0

  for (const doc of volunteersSnap.docs) {
    const code = String(doc.data()?.volunteer_code || '').trim()
    if (!code) continue
    if (/^VOL-\d+$/i.test(code)) {
      sequentialCount++
    } else if (/^VOL-\d+-[A-Z0-9]{4}$/i.test(code) || code.length > 8) {
      secureRandomizedCount++
    }
  }

  assert(sequentialCount === 0, `No predictable sequential volunteer codes remain (Sequential: ${sequentialCount}, Randomized: ${secureRandomizedCount})`)

  // TEST 3: Check Whitelisted Admin Accounts Status
  console.log('\n--- Test 3: Verifying Whitelisted Admins Active Status ---')
  for (const email of OFFICIAL_ADMIN_EMAILS) {
    const userSnap = await db.collection('profiles').where('email', '==', email).limit(1).get()
    if (!userSnap.empty) {
      const uData = userSnap.docs[0].data()
      assert(uData.role === 'admin', `Official admin account ${email} has role: 'admin'`)
    } else {
      console.log(`ℹ️ [INFO] Whitelisted admin ${email} has not registered a profile document yet.`)
    }
  }

  console.log('\n====================================================')
  console.log(`AUDIT RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`)
  console.log('====================================================\n')

  if (failedTests > 0) {
    process.exit(1)
  }
}

verifySecurityPosture()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Audit script encountered error:', err)
    process.exit(1)
  })
