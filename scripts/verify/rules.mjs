// فحص ما هو منشور فعلياً من قواعد Firestore على الإنتاج
// الاستخدام: node scripts/verify/rules.mjs
// لا يكتب أي شيء — قراءة فقط من واجهة Firebase Rules API
import { readFileSync } from 'node:fs'
import { GoogleAuth } from 'google-auth-library'

const loadEnv = () => {
  let raw
  try {
    raw = readFileSync(new URL('../../.env', import.meta.url), 'utf8')
  } catch {
    return
  }
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
  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase credentials in environment')
    process.exit(1)
  }

  const auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/firebase', 'https://www.googleapis.com/auth/cloud-platform'],
  })
  const client = await auth.getClient()
  const token = (await client.getAccessToken()).token

  // 1) الاستعلام عن كل الـ releases للعثور على release قاعدة بيانات Firestore الفعلي
  const listRes = await fetch(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const listData = await listRes.json()
  if (!listRes.ok) {
    console.error('Failed to list releases:', listData)
    process.exit(1)
  }
  const releases = (listData.releases || []).filter((r) => r.name.includes('firestore'))
  if (releases.length === 0) {
    console.error('No firestore release found. Releases:', JSON.stringify(listData, null, 2))
    process.exit(1)
  }
  const release = releases[0]
  console.log(`Release: ${release.name}`)
  console.log(`Ruleset : ${release.rulesetName}\n`)

  // 2) جلب محتوى الـ ruleset المنشور
  const rulesetRes = await fetch(`https://firebaserules.googleapis.com/v1/${release.rulesetName}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const rulesetData = await rulesetRes.json()
  if (!rulesetRes.ok) {
    console.error('Failed to fetch ruleset:', rulesetData)
    process.exit(1)
  }
  const source = (rulesetData.source.files || []).map((f) => f.content || '').join('\n')

  // 3) استخراج الأسطر الحرجة (المسارات + allow) للمجموعات الحساسة
  const lines = source.split('\n')
  let show = false
  console.log('--- الأسطر الحرجة في القواعد المنشورة ---')
  for (const line of lines) {
    const t = line.trim()
    if (/^match \/databases\/\{database\}\/documents/.test(t) && t.includes('/')) show = true
    if (t.startsWith('match') || t.startsWith('allow') || t === '}') {
      if (show) console.log(line)
    }
  }
  console.log('-----------------------------------------')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})