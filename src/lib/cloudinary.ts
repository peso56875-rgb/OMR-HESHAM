import crypto from 'crypto'

const CLOUDINARY_CLOUD_NAME = 'dtekkty3j'
const CLOUDINARY_API_KEY = '397594679349495'
const CLOUDINARY_API_SECRET = '7T_Qleu5HsO2FjTQGTuBQOx8o2E'

/**
 * Uploads a file (Hono's File/Blob) to Cloudinary and returns its secure URL.
 */
export async function uploadToCloudinary(file: File, c?: any): Promise<string> {
  const glob = globalThis as any
  const env = c?.env || {}
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env : {}

  const cloudName = env.CLOUDINARY_CLOUD_NAME || procEnv.CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME
  const apiKey = env.CLOUDINARY_API_KEY || procEnv.CLOUDINARY_API_KEY || CLOUDINARY_API_KEY
  const apiSecret = env.CLOUDINARY_API_SECRET || procEnv.CLOUDINARY_API_SECRET || CLOUDINARY_API_SECRET

  const timestamp = Math.round(Date.now() / 1000)

  // Parameters to sign
  const params: Record<string, string> = {
    timestamp: timestamp.toString(),
  }

  // Generate SHA-1 signature
  const sortedKeys = Object.keys(params).sort()
  const parameterString = sortedKeys.map(key => `${key}=${params[key]}`).join('&')
  const toSign = parameterString + apiSecret
  const signature = crypto.createHash('sha1').update(toSign).digest('hex')

  // Build multipart form data
  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp.toString())
  formData.append('signature', signature)

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Cloudinary upload failed: ${response.status} - ${errorText}`)
  }

  const result = await response.json()
  return result.secure_url
}
