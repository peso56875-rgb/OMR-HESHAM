import { getStorage } from 'firebase-admin/storage'
import { getFirebaseAdminApp, getFirestore } from './firebase-admin'
import { uploadToCloudinary } from './cloudinary'

/**
 * Media storage with layered fallbacks so that uploading an image from the
 * dashboard always works:
 *
 *   1. Cloudinary        — preferred when CLOUDINARY_* env vars are present.
 *                          It is a purpose-built CDN and it is what this
 *                          project actually has configured.
 *   2. Firebase Storage  — used when Cloudinary is not configured (or fails)
 *                          and the Storage bucket really exists.
 *   3. Firestore chunks  — last-resort fallback, needs zero configuration.
 *
 * Originally Cloudinary was the *only* backend, so a project without
 * Cloudinary keys failed on every single upload. Now every layer is optional.
 */

export type MediaProvider = 'firebase-storage' | 'cloudinary' | 'firestore'

export interface StoredMedia {
  url: string
  provider: MediaProvider
  warnings: string[]
}

/** Firestore documents are limited to ~1MB, so keep raw chunks well below it. */
const FIRESTORE_CHUNK_SIZE = 480 * 1024
const FIRESTORE_MAX_BYTES = FIRESTORE_CHUNK_SIZE * 12 // ≈ 5.6MB
export const MEDIA_COLLECTION = 'media'

const readEnv = (c: any, key: string): string => {
  const glob = globalThis as any
  const env = c?.env || {}
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env : {}
  return env[key] || procEnv[key] || ''
}

/** Bucket names to try, in order. Firebase changed the default suffix in 2024. */
export const storageBucketCandidates = (c?: any): string[] => {
  const explicit = readEnv(c, 'FIREBASE_STORAGE_BUCKET')
  const projectId = readEnv(c, 'FIREBASE_PROJECT_ID')
  const candidates = [
    explicit,
    projectId ? `${projectId}.firebasestorage.app` : '',
    projectId ? `${projectId}.appspot.com` : '',
  ]
  return candidates.filter((name, index) => name && candidates.indexOf(name) === index)
}

const safeFileName = (name: string): string => {
  const cleaned = String(name || 'file')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return cleaned.slice(-80) || 'file'
}

const randomId = (): string =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`

/**
 * Buckets that answered "does not exist" — Firebase Storage may simply never
 * have been enabled for the project. Remembering them avoids paying a failed
 * round trip on every single upload.
 */
const missingBuckets = new Set<string>()

export const cloudinaryConfigured = (c?: any): boolean =>
  Boolean(readEnv(c, 'CLOUDINARY_CLOUD_NAME') && readEnv(c, 'CLOUDINARY_API_KEY') && readEnv(c, 'CLOUDINARY_API_SECRET'))

/**
 * Uploads to Firebase Storage and returns a token based public download URL.
 * Token URLs keep working even when the bucket uses uniform bucket-level
 * access (where `makePublic()` throws), which is the default for new buckets.
 */
async function uploadToFirebaseStorage(
  buffer: Buffer,
  contentType: string,
  fileName: string,
  c?: any
): Promise<string> {
  const app = getFirebaseAdminApp(c)
  if (!app) throw new Error('Firebase Admin SDK is not initialised')

  const buckets = storageBucketCandidates(c).filter(name => !missingBuckets.has(name))
  if (!buckets.length) {
    throw new Error(
      'No usable storage bucket. Enable Firebase Storage for the project or set FIREBASE_STORAGE_BUCKET.'
    )
  }

  const objectPath = `uploads/${new Date().toISOString().slice(0, 10)}/${randomId()}-${safeFileName(fileName)}`
  const downloadToken = randomId() + randomId()
  const errors: string[] = []

  for (const bucketName of buckets) {
    try {
      const bucket = getStorage(app).bucket(bucketName)
      const file = bucket.file(objectPath)

      await file.save(buffer, {
        resumable: false,
        contentType,
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000, immutable',
          metadata: { firebaseStorageDownloadTokens: downloadToken },
        },
      })

      return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`
    } catch (error: any) {
      const message = String(error?.message || error)
      if (/does not exist|notFound|404/i.test(message)) {
        missingBuckets.add(bucketName)
      }
      errors.push(`${bucketName}: ${message}`)
    }
  }

  throw new Error(`Firebase Storage upload failed — ${errors.join(' | ')}`)
}

/**
 * Stores the bytes as base64 chunks in Firestore. The parent document is
 * written last so a partially uploaded file is never served.
 */
async function uploadToFirestore(
  buffer: Buffer,
  contentType: string,
  fileName: string,
  c?: any
): Promise<string> {
  if (buffer.length > FIRESTORE_MAX_BYTES) {
    throw new Error(
      `الملف أكبر من الحد المسموح للتخزين الاحتياطي (${Math.floor(FIRESTORE_MAX_BYTES / (1024 * 1024))} ميجابايت). فضلاً اضبط FIREBASE_STORAGE_BUCKET أو ارفع صورة أصغر.`
    )
  }

  const db = getFirestore(c)
  if (!db) throw new Error('Firestore is not available')

  const docRef = db.collection(MEDIA_COLLECTION).doc()
  const chunksRef = docRef.collection('chunks')

  const total = Math.ceil(buffer.length / FIRESTORE_CHUNK_SIZE) || 1
  for (let index = 0; index < total; index++) {
    const slice = buffer.subarray(index * FIRESTORE_CHUNK_SIZE, (index + 1) * FIRESTORE_CHUNK_SIZE)
    await chunksRef.doc(String(index).padStart(4, '0')).set({
      index,
      data: slice.toString('base64'),
    })
  }

  await docRef.set({
    file_name: safeFileName(fileName),
    content_type: contentType,
    size: buffer.length,
    chunk_count: total,
    chunk_size: FIRESTORE_CHUNK_SIZE,
    created_at: new Date().toISOString(),
  })

  return `/api/media/${docRef.id}`
}

/** Reads back a file previously stored with the Firestore fallback. */
export async function readStoredMedia(
  id: string,
  c?: any
): Promise<{ bytes: Uint8Array; contentType: string; size: number } | null> {
  const db = getFirestore(c)
  if (!db) return null

  const docRef = db.collection(MEDIA_COLLECTION).doc(id)
  const snapshot = await docRef.get()
  if (!snapshot.exists) return null

  const meta = snapshot.data() as any
  const chunkDocs = await docRef.collection('chunks').orderBy('index').get()
  if (chunkDocs.empty) return null

  const parts = chunkDocs.docs.map(doc => Buffer.from(String((doc.data() as any).data || ''), 'base64'))
  const bytes = Buffer.concat(parts)

  return {
    bytes: new Uint8Array(bytes),
    contentType: meta?.content_type || 'application/octet-stream',
    size: bytes.length,
  }
}

/**
 * Persists an uploaded file, trying each backend in turn. Warnings describe the
 * backends that failed so the dashboard can surface a helpful message.
 */
export async function storeMediaFile(file: File, c?: any): Promise<StoredMedia> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const contentType = file.type || 'application/octet-stream'
  const fileName = (file as any).name || 'upload'
  const warnings: string[] = []

  // 1) Cloudinary — the configured, purpose-built media CDN.
  if (cloudinaryConfigured(c)) {
    try {
      const url = await uploadToCloudinary(file, c)
      if (url) return { url, provider: 'cloudinary', warnings }
      warnings.push('Cloudinary: لم يتم إرجاع رابط')
    } catch (error: any) {
      warnings.push(`Cloudinary: ${error?.message || error}`)
    }
  }

  // 2) Firebase Storage — only if the bucket actually exists.
  try {
    const url = await uploadToFirebaseStorage(buffer, contentType, fileName, c)
    return { url, provider: 'firebase-storage', warnings }
  } catch (error: any) {
    warnings.push(`Firebase Storage: ${error?.message || error}`)
  }

  // 3) Firestore — always available, so an upload never hard-fails.
  const url = await uploadToFirestore(buffer, contentType, fileName, c)
  return { url, provider: 'firestore', warnings }
}

/**
 * Normalises an image URL coming from a form. Admins often paste a URL with
 * surrounding quotes/spaces or without a scheme; without this the value was
 * stored as-is and the browser refused to load it.
 */
export function normalizeMediaUrl(raw: any): string {
  let value = String(raw ?? '').trim()
  if (!value) return ''

  // Strip wrapping quotes and any stray whitespace/newlines from copy & paste.
  value = value.replace(/^['"]+|['"]+$/g, '').replace(/\s+/g, ' ').trim()
  if (!value) return ''

  if (value.startsWith('/') || value.startsWith('data:image/')) return value
  if (/^https?:\/\//i.test(value)) return value
  if (/^\/\//.test(value)) return `https:${value}`

  // Bare domain such as "example.com/a.jpg" — assume https.
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(value)) return `https://${value}`

  return value
}
