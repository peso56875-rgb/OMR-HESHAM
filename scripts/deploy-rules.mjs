import { readFileSync } from 'node:fs'
import { GoogleAuth } from 'google-auth-library'

const loadEnv = () => {
  let raw
  try {
    raw = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  } catch {
    return
  }
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = v.replace(/\\n/g, '\n')
  }
}

async function deploy() {
  loadEnv()

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase credentials in environment')
    process.exit(1)
  }

  const rulesContent = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8')

  console.log(`Deploying firestore.rules to project: ${projectId}...`)

  const auth = new GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/firebase',
    ],
  })

  const client = await auth.getClient()
  const tokenResponse = await client.getAccessToken()
  const token = tokenResponse.token

  // 1. Create ruleset
  const createRulesetUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/rulesets`
  const rulesetRes = await fetch(createRulesetUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: {
        files: [
          {
            name: 'firestore.rules',
            content: rulesContent,
          },
        ],
      },
    }),
  })

  const rulesetData = await rulesetRes.json()
  if (!rulesetRes.ok) {
    console.error('Failed to create ruleset:', rulesetData)
    process.exit(1)
  }

  console.log(`Ruleset created: ${rulesetData.name}`)

  // List existing releases
  const listReleasesUrl = `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases`
  const listRes = await fetch(listReleasesUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const listData = await listRes.json()
  console.log('Existing releases:', JSON.stringify(listData, null, 2))

  // 2. Update release
  let targetReleaseName = `projects/${projectId}/releases/cloud.firestore`
  if (listData.releases && listData.releases.length > 0) {
    const firestoreRelease = listData.releases.find(r => r.name.includes('firestore'))
    if (firestoreRelease) {
      targetReleaseName = firestoreRelease.name
    }
  }
  console.log(`Targeting release: ${targetReleaseName}`)

  const updateReleaseUrl = `https://firebaserules.googleapis.com/v1/${targetReleaseName}?updateMask=rulesetName`
  const releaseRes = await fetch(updateReleaseUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      release: {
        name: targetReleaseName,
        rulesetName: rulesetData.name,
      },
    }),
  })

  const releaseData = await releaseRes.json()
  if (!releaseRes.ok) {
    console.error('Failed to update release:', releaseData)
    process.exit(1)
  }

  console.log(`✓ Rules deployed successfully! Release updated to: ${releaseData.rulesetName}`)
}

deploy().catch((err) => {
  console.error('Error deploying rules:', err)
  process.exit(1)
})
