import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore as getFirestoreAdmin } from 'firebase-admin/firestore'
import { getAuth as getAuthAdmin } from 'firebase-admin/auth'

// Load .env file for local development
const glob = globalThis as any
if (typeof glob.process !== 'undefined') {
  try {
    if (typeof glob.process.loadEnvFile === 'function') {
      glob.process.loadEnvFile()
    }
  } catch (_e) {
    // .env file might not exist (e.g. on Vercel)
  }
}

export const getFirebaseAdminApp = (c?: any) => {
  const env = c?.env || {}
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env : {}

  const projectId = env.FIREBASE_PROJECT_ID || procEnv.FIREBASE_PROJECT_ID || ''
  const clientEmail = env.FIREBASE_CLIENT_EMAIL || procEnv.FIREBASE_CLIENT_EMAIL || ''
  let privateKey = env.FIREBASE_PRIVATE_KEY || procEnv.FIREBASE_PRIVATE_KEY || ''

  if (privateKey) {
    // Remove surrounding quotes if present
    privateKey = privateKey.replace(/^"|"$/g, '')
    // Convert literal \n to actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n')
    privateKey = privateKey.trim()
  }

  const apps = getApps()
  if (apps.length > 0) {
    return apps[0]
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Firebase Admin SDK: Missing credentials. Check your .env or environment variables.')
    console.error('  projectId:', projectId ? '✓' : '✗ MISSING')
    console.error('  clientEmail:', clientEmail ? '✓' : '✗ MISSING')
    console.error('  privateKey:', privateKey ? '✓' : '✗ MISSING')
    return undefined as any
  }

  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  } catch (error: any) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message)
    return undefined as any
  }
}

export const getFirestore = (c?: any) => {
  const app = getFirebaseAdminApp(c)
  // Explicitly specify 'default' database ID as listing projects shows the ID is 'default' (not '(default)')
  return getFirestoreAdmin(app, 'default')
}

export const getAuth = (c?: any) => {
  const app = getFirebaseAdminApp(c)
  return getAuthAdmin(app)
}
