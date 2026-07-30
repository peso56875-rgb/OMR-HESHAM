import crypto from 'crypto'

/**
 * Uploads a file (Hono's File/Blob) to Cloudinary and returns its secure URL.
 * Credentials are read from environment variables (never hardcoded).
 */
export async function uploadToCloudinary(file: File, c?: any): Promise<string> {
  const glob = globalThis as any
  const env = c?.env || {}
  const procEnv = typeof glob.process !== 'undefined' ? glob.process.env : {}

  const cloudName = env.CLOUDINARY_CLOUD_NAME || procEnv.CLOUDINARY_CLOUD_NAME || ''
  const apiKey = env.CLOUDINARY_API_KEY || procEnv.CLOUDINARY_API_KEY || ''
  const apiSecret = env.CLOUDINARY_API_SECRET || procEnv.CLOUDINARY_API_SECRET || ''

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env')
  }

  const timestamp = Math.round(Date.now() / 1000)
  const folder = env.CLOUDINARY_FOLDER || procEnv.CLOUDINARY_FOLDER || 'omar-hesham'

  // Every parameter sent with the request (except file, api_key and
  // resource_type) must be part of the signature, otherwise Cloudinary
  // answers 401 "Invalid Signature".
  const params: Record<string, string> = {
    folder,
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
  formData.append('folder', folder)
  formData.append('timestamp', timestamp.toString())
  formData.append('signature', signature)

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorText = await response.text()
    // Surface Cloudinary's own message so misconfiguration is obvious.
    let detail = errorText
    try {
      detail = JSON.parse(errorText)?.error?.message || errorText
    } catch (_e) {
      // keep raw text
    }
    throw new Error(`Cloudinary upload failed (${response.status}): ${detail}`)
  }

  const result = await response.json()
  return result.secure_url
}
