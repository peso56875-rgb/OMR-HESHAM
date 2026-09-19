import { readFileSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8')
for (const line of raw.split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
  if (!m) continue
  let v = m[2].trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  if (process.env[m[1]] === undefined) process.env[m[1]] = v.replace(/\\n/g, '\n')
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  })
})

const db = getFirestore(app, 'default')

async function inspect() {
  const pSnap = await db.collection('profiles').get()
  console.log(`Total profiles: ${pSnap.size}`)
  const admins = []
  const others = []
  pSnap.docs.forEach(d => {
    const data = d.data()
    const info = { id: d.id, email: data.email, role: data.role, name: data.full_name, phone: data.phone }
    if (data.role === 'admin') admins.push(info)
    else others.push(info)
  })
  console.log('Admins in DB:', admins)
  console.log('Other profiles count:', others.length)
  if (others.length > 0) {
    console.log('Profiles list:', others)
  }

  const vSnap = await db.collection('volunteers').get()
  console.log(`Total volunteers in DB: ${vSnap.size}`)
  vSnap.docs.forEach(d => {
    const data = d.data()
    console.log(`Volunteer: ${d.id}, code: ${data.volunteer_code}, name: ${data.full_name}, status: ${data.status}, profile_id: ${data.profile_id}, email: ${data.email}, phone: ${data.phone}, avatar_url: ${data.avatar_url}`)
  })
}

inspect().catch(console.error)
