import { readFileSync } from 'node:fs'
import { GoogleAuth } from 'google-auth-library'

const loadEnv = () => {
  const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (process.env[m[1]] === undefined) process.env[m[1]] = v.replace(/\\n/g, '\n')
  }
}

async function main() {
  loadEnv()
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/devstorage.full_control'],
  })
  const client = await auth.getClient()
  const token = (await client.getAccessToken()).token

  // 1) List buckets in Google Cloud Storage
  const gcsRes = await fetch(`https://storage.googleapis.com/storage/v1/b?project=${projectId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const gcsData = await gcsRes.json()
  console.log('GCS BUCKETS:', JSON.stringify(gcsData, null, 2))

  // 2) If buckets exist, check objects in the bucket
  if (gcsData.items && gcsData.items.length > 0) {
    for (const b of gcsData.items) {
      console.log(`Checking bucket: ${b.name}...`)
      const objRes = await fetch(`https://storage.googleapis.com/storage/v1/b/${b.name}/o`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const objData = await objRes.json()
      console.log(`Objects in ${b.name}:`, (objData.items || []).length, 'items')
      if (objData.items) {
        console.log(objData.items.slice(0, 10).map(i => ({ name: i.name, mediaLink: i.mediaLink })))
      }

      // Check if unauthenticated public list is allowed
      const pubRes = await fetch(`https://firebasestorage.googleapis.com/v0/b/${b.name}/o`)
      console.log(`Public unauth access to ${b.name}: HTTP`, pubRes.status)
      const pubData = await pubRes.json().catch(() => ({}))
      console.log(`Public unauth body:`, pubData)
    }
  }
}
main()
