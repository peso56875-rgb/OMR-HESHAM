#!/usr/bin/env node
/**
 * Post-build script for Vercel Build Output API.
 *
 * The Hono Vercel adapter builds the serverless function with `firebase-admin`
 * marked as external (bundling it breaks due to __dirname/proto file loading
 * inside protobufjs / google-gax). Because the Build Output API deploys ONLY
 * the contents of `.vercel/output/functions/__hono.func/`, the external
 * package must physically exist inside that folder's node_modules, otherwise
 * the function crashes at runtime with ERR_MODULE_NOT_FOUND.
 *
 * This script walks the full transitive dependency tree of the external
 * packages and copies them from the root node_modules into the function dir.
 */
import { existsSync, mkdirSync, readFileSync, cpSync, rmSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ROOT_NM = join(ROOT, 'node_modules')
const FUNC_DIR = join(ROOT, '.vercel', 'output', 'functions', '__hono.func')
const FUNC_NM = join(FUNC_DIR, 'node_modules')

// Packages that the built function imports at runtime (kept external by Vite)
const EXTERNAL_PACKAGES = ['firebase-admin']

if (!existsSync(FUNC_DIR)) {
  console.error(`✗ Function directory not found: ${FUNC_DIR}`)
  console.error('  Run `vite build` first.')
  process.exit(1)
}

const readPkgJson = (dir) => {
  try {
    return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'))
  } catch {
    return null
  }
}

/**
 * Resolve a package directory the same way Node does for a flat npm tree:
 * check nested node_modules of the dependent first, then the root.
 */
const resolvePkgDir = (pkgName, fromDir) => {
  const nested = join(fromDir, 'node_modules', pkgName)
  if (existsSync(join(nested, 'package.json'))) return nested
  const root = join(ROOT_NM, pkgName)
  if (existsSync(join(root, 'package.json'))) return root
  return null
}

// Walk the transitive dependency tree
const toCopy = new Map() // relative name -> absolute source dir
const queue = EXTERNAL_PACKAGES.map((name) => ({ name, fromDir: ROOT }))
const missing = []

while (queue.length > 0) {
  const { name, fromDir } = queue.shift()
  if (toCopy.has(name)) continue

  const pkgDir = resolvePkgDir(name, fromDir)
  if (!pkgDir) {
    missing.push(name)
    continue
  }
  toCopy.set(name, pkgDir)

  const pkg = readPkgJson(pkgDir)
  if (!pkg) continue

  const deps = { ...(pkg.dependencies || {}), ...(pkg.optionalDependencies || {}) }
  for (const depName of Object.keys(deps)) {
    if (!toCopy.has(depName)) {
      queue.push({ name: depName, fromDir: pkgDir })
    }
  }
}

if (missing.length > 0) {
  // Optional deps may legitimately be absent — warn but don't fail
  console.warn(`⚠ Skipped (not installed, likely optional): ${missing.join(', ')}`)
}

// Fresh copy every build
rmSync(FUNC_NM, { recursive: true, force: true })
mkdirSync(FUNC_NM, { recursive: true })

let count = 0
for (const [name, srcDir] of toCopy) {
  const destDir = join(FUNC_NM, name)
  mkdirSync(dirname(destDir), { recursive: true })
  cpSync(srcDir, destDir, { recursive: true, dereference: true })
  count++
}

console.log(`✓ Copied ${count} packages into ${FUNC_NM}`)
console.log(`  Externals bundled for runtime: ${EXTERNAL_PACKAGES.join(', ')}`)
