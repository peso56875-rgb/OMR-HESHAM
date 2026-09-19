import crypto from 'crypto'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
let privateKey = process.env.FIREBASE_PRIVATE_KEY
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, '\n').replace(/^["']|["']$/g, '')
}

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || ''
const apiKey = process.env.CLOUDINARY_API_KEY || ''
const apiSecret = process.env.CLOUDINARY_API_SECRET || ''

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase credentials in .env')
  process.exit(1)
}

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary credentials in .env')
  process.exit(1)
}

const app = getApps()[0] || initializeApp({
  credential: cert({ projectId, clientEmail, privateKey })
})

const db = getFirestore(app, 'default')
const dryRun = process.argv.includes('--dry-run')

function cloudinaryPublicId(rawUrl) {
  let url
  try {
    url = new URL(rawUrl)
  } catch {
    return ''
  }

  if (url.hostname !== 'res.cloudinary.com') return ''
  const parts = url.pathname.split('/').filter(Boolean)
  const uploadIndex = parts.indexOf('upload')
  if (uploadIndex === -1) return ''

  const afterUpload = parts.slice(uploadIndex + 1)
  const versionIndex = afterUpload.findIndex(part => /^v\d+$/.test(part))
  const publicParts = afterUpload.slice(versionIndex >= 0 ? versionIndex + 1 : 0)
  if (!publicParts.length) return ''

  const joined = publicParts.join('/')
  return joined.replace(/\.[A-Za-z0-9]+$/, '')
}

function signDestroy(publicId, timestamp) {
  const payload = `invalidate=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  return crypto.createHash('sha1').update(payload).digest('hex')
}

async function destroyCloudinary(publicId) {
  const timestamp = Math.round(Date.now() / 1000).toString()
  const form = new FormData()
  form.append('invalidate', 'true')
  form.append('public_id', publicId)
  form.append('api_key', apiKey)
  form.append('timestamp', timestamp)
  form.append('signature', signDestroy(publicId, timestamp))

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body: form
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(JSON.stringify(data))
  }
  return data
}

async function deleteOldCloudinaryVolunteerPhotos() {
  const snap = await db.collection('volunteers').get()
  const publicIds = new Map()

  for (const doc of snap.docs) {
    const data = doc.data()
    const previous = String(data.previous_avatar_url || '').trim()
    const current = String(data.avatar_url || '').trim()
    if (!current.startsWith('private-media:')) continue

    const publicId = cloudinaryPublicId(previous)
    if (publicId) publicIds.set(publicId, previous)
  }

  console.log(`Found ${publicIds.size} old Cloudinary volunteer assets. Dry run: ${dryRun}`)

  let deleted = 0
  let missing = 0
  let failed = 0

  for (const [publicId, previousUrl] of publicIds.entries()) {
    try {
      if (dryRun) {
        console.log(`[DRY] ${publicId} <- ${previousUrl.slice(0, 100)}`)
        continue
      }
      const result = await destroyCloudinary(publicId)
      if (result.result === 'ok') {
        deleted++
        console.log(`[DELETED] ${publicId}`)
      } else {
        missing++
        console.log(`[NOT_FOUND_OR_ALREADY_REMOVED] ${publicId}: ${result.result}`)
      }
    } catch (error) {
      failed++
      console.error(`[FAILED] ${publicId}: ${error.message}`)
    }
  }

  console.log('=== Old Cloudinary Volunteer Photos Summary ===')
  console.log(`Deleted: ${deleted}`)
  console.log(`Missing/already removed: ${missing}`)
  console.log(`Failed: ${failed}`)
  if (failed > 0) process.exitCode = 1
}

deleteOldCloudinaryVolunteerPhotos().catch((error) => {
  console.error('Fatal Cloudinary cleanup error:', error)
  process.exit(1)
})
