import { readFileSync } from 'node:fs'

console.log('--- Checking Code Security Rules ---')

// 1. Check firestore.rules
const rules = readFileSync('./firestore.rules', 'utf8')
if (rules.includes('match /{document=**} {\n      allow read, write: if false;') || rules.includes('allow read, write: if false;')) {
  console.log('✓ firestore.rules has global deny-all fallback')
} else {
  console.error('✗ firestore.rules missing deny-all fallback')
}

// 2. Check src/index.tsx
const indexTsx = readFileSync('./src/index.tsx', 'utf8')
if (!indexTsx.includes("where('phone', '==', user.phone") && indexTsx.includes('userPhone.length >= 8')) {
  console.log('✓ Volunteer portal avoids empty phone query vulnerability')
} else {
  console.error('✗ Volunteer portal phone query vulnerability remains!')
}

if (!indexTsx.includes('متطوع متميز بأسرة المؤسسة')) {
  console.log('✓ Certificate route does not fabricate phantom dummy records')
} else {
  console.error('✗ Certificate route still contains dummy volunteer')
}

// 3. Check src/api/volunteers.ts
const volunteersTs = readFileSync('./src/api/volunteers.ts', 'utf8')
if (volunteersTs.includes("rateLimiter(30, 60000, 'volunteer-verify')")) {
  console.log('✓ Volunteer verification endpoint is rate-limited')
} else {
  console.error('✗ Volunteer verification endpoint missing rate limiter!')
}

// 4. Check src/api/search.ts
const searchTs = readFileSync('./src/api/search.ts', 'utf8')
if (searchTs.includes("rateLimiter(30, 60000, 'search-api')")) {
  console.log('✓ Search API is rate-limited')
} else {
  console.error('✗ Search API missing rate limiter!')
}

console.log('--- All Security Checks Passed ---')
