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

const PRIVATE_MEDIA_PREFIX = 'private-media:'
const PRIVATE_MEDIA_COLLECTION = 'private_media'
const PRIVATE_MEDIA_NAMESPACE = 'volunteer_photos'
const CHUNK_SIZE = 480 * 1024
const MAX_BYTES = 5 * 1024 * 1024

function safeFileName(name) {
  const cleaned = String(name || 'volunteer-photo')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned.slice(-80) || 'volunteer-photo'
}

function sniffImage(buffer) {
  if (!buffer || buffer.length < 12) return ''
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer.length >= 8 && buffer.readUInt32BE(0) === 0x89504e47 && buffer.readUInt32BE(4) === 0x0d0a1a0a) return 'image/png'
  const gif = buffer.subarray(0, 6).toString('latin1')
  if (gif === 'GIF87a' || gif === 'GIF89a') return 'image/gif'
  if (buffer.toString('latin1', 0, 4) === 'RIFF' && buffer.toString('latin1', 8, 12) === 'WEBP') return 'image/webp'
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) return 'image/bmp'
  if (buffer.toString('latin1', 4, 8) === 'ftyp') {
    const brand = buffer.toString('latin1', 8, 12)
    if (brand === 'avif' || brand === 'avis') return 'image/avif'
  }
  return ''
}

function shouldSkipUrl(url) {
  if (!url) return true
  if (url.startsWith(PRIVATE_MEDIA_PREFIX)) return true
  return false
}

async function fetchImage(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { Accept: 'image/*' }
  })
  if (!response.ok) {
    throw new Error(`fetch failed ${response.status}`)
  }

  const declaredSize = Number(response.headers.get('content-length') || 0)
  if (declaredSize > MAX_BYTES) {
    throw new Error(`image too large by content-length: ${declaredSize}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length > MAX_BYTES) {
    throw new Error(`image too large: ${buffer.length}`)
  }

  const type = sniffImage(buffer)
  if (!type) {
    throw new Error('downloaded file is not a supported image')
  }

  return { buffer, type }
}

async function storePrivateImage(buffer, contentType, fileName) {
  const docRef = db.collection(PRIVATE_MEDIA_COLLECTION).doc()
  const chunksRef = docRef.collection('chunks')
  const total = Math.ceil(buffer.length / CHUNK_SIZE) || 1

  for (let index = 0; index < total; index++) {
    const slice = buffer.subarray(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
    await chunksRef.doc(String(index).padStart(4, '0')).set({
      index,
      data: slice.toString('base64')
    })
  }

  await docRef.set({
    namespace: PRIVATE_MEDIA_NAMESPACE,
    file_name: safeFileName(fileName),
    content_type: contentType,
    size: buffer.length,
    chunk_count: total,
    chunk_size: CHUNK_SIZE,
    created_at: new Date().toISOString()
  })

  return `${PRIVATE_MEDIA_PREFIX}${docRef.id}`
}

async function privatizeVolunteerPhotos() {
  const dryRun = process.argv.includes('--dry-run')
  const snap = await db.collection('volunteers').get()
  console.log(`Found ${snap.size} volunteer records. Dry run: ${dryRun}`)

  let skipped = 0
  let migrated = 0
  let failed = 0

  for (const doc of snap.docs) {
    const data = doc.data()
    const currentUrl = String(data.avatar_url || '').trim()
    if (shouldSkipUrl(currentUrl)) {
      skipped++
      continue
    }

    try {
      const { buffer, type } = await fetchImage(currentUrl)
      const privateRef = dryRun
        ? `${PRIVATE_MEDIA_PREFIX}dry-run-${doc.id}`
        : await storePrivateImage(buffer, type, `${data.full_name || doc.id}.${type.split('/')[1] || 'jpg'}`)

      console.log(`[MIGRATE] ${doc.id} ${data.full_name || ''}: ${currentUrl.slice(0, 80)} -> ${privateRef}`)
      if (!dryRun) {
        await doc.ref.update({
          avatar_url: privateRef,
          previous_avatar_url: currentUrl,
          avatar_private_migrated_at: new Date().toISOString()
        })
      }
      migrated++
    } catch (error) {
      console.error(`[FAILED] ${doc.id} ${data.full_name || ''}: ${error.message}`)
      failed++
    }
  }

  console.log('=== Volunteer Photo Privacy Summary ===')
  console.log(`Migrated: ${migrated}`)
  console.log(`Skipped: ${skipped}`)
  console.log(`Failed: ${failed}`)

  if (failed > 0) process.exitCode = 1
}

privatizeVolunteerPhotos().catch((error) => {
  console.error('Fatal migration error:', error)
  process.exit(1)
})
