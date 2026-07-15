/**
 * Copies externalized server packages (firebase-admin + full transitive
 * dependency tree) into the Vercel function directory so they exist at
 * runtime in /var/task.  Exported as a function so it can run both as a
 * Vite plugin hook (closeBundle) and as a standalone postbuild script.
 *
 * Strategy: walk the source node_modules tree starting from each EXTERNAL
 * package, resolving dependencies *exactly* as npm laid them out (including
 * nested node_modules for deduplication-resistant copies). Each resolved
 * source path is mapped to its corresponding destination path so the
 * on-disk layout in the function mirrors the project's node_modules.
 */
import { existsSync, mkdirSync, readFileSync, cpSync, rmSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, relative, sep } from 'node:path'

export const EXTERNAL_PACKAGES = ['firebase-admin']

export function copyExternalsIntoFunction(rootDir, log = console.log) {
  const ROOT_NM = join(rootDir, 'node_modules')
  const FUNC_DIR = join(rootDir, '.vercel', 'output', 'functions', '__hono.func')
  const FUNC_NM = join(FUNC_DIR, 'node_modules')

  if (!existsSync(FUNC_DIR)) {
    log(`✗ Function directory not found: ${FUNC_DIR} — skipping externals copy`)
    return false
  }

  const readPkgJson = (dir) => {
    try {
      return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'))
    } catch {
      return null
    }
  }

  // Walk up from `fromDir` to find `pkgName` — mirrors Node's resolution.
  // Returns the absolute path to the package directory, or null.
  const resolvePkgDir = (pkgName, fromDir) => {
    let dir = fromDir
    while (true) {
      const candidate = join(dir, 'node_modules', pkgName)
      if (existsSync(join(candidate, 'package.json'))) return candidate
      const parent = dirname(dir)
      if (parent === dir) break          // filesystem root
      if (!parent.startsWith(rootDir)) break  // don't escape project
      dir = parent
    }
    return null
  }

  // --- Collect every (srcDir → relative destPath) pair ---
  // Key: absolute source path, Value: relative path inside FUNC_NM
  const copyMap = new Map()   // srcAbsPath → destRelPath
  const visited = new Set()   // absolute source paths already queued

  // Queue items carry: package name, the directory to resolve from, and
  // the destination prefix (so nested node_modules are preserved).
  const queue = EXTERNAL_PACKAGES.map((name) => ({
    name,
    resolveFrom: rootDir,
    destPrefix: '',     // top-level inside FUNC_NM
  }))
  const missing = []

  while (queue.length > 0) {
    const { name, resolveFrom, destPrefix } = queue.shift()

    const pkgDir = resolvePkgDir(name, resolveFrom)
    if (!pkgDir) {
      missing.push(name)
      continue
    }
    if (visited.has(pkgDir)) continue
    visited.add(pkgDir)

    // Compute the relative path from ROOT_NM so nested deps keep their
    // nesting structure, e.g. google-auth-library/node_modules/node-fetch
    const relFromRootNM = relative(ROOT_NM, pkgDir)
    copyMap.set(pkgDir, relFromRootNM)

    const pkg = readPkgJson(pkgDir)
    if (!pkg) continue

    const deps = { ...(pkg.dependencies || {}), ...(pkg.optionalDependencies || {}) }
    for (const depName of Object.keys(deps)) {
      queue.push({ name: depName, resolveFrom: pkgDir, destPrefix: '' })
    }
  }

  if (missing.length > 0) {
    log(`⚠ Skipped (not installed, likely optional): ${missing.join(', ')}`)
  }

  // --- Wipe & recreate, then copy ---
  rmSync(FUNC_NM, { recursive: true, force: true })
  mkdirSync(FUNC_NM, { recursive: true })

  let count = 0
  for (const [srcDir, relPath] of copyMap) {
    const destDir = join(FUNC_NM, relPath)
    mkdirSync(dirname(destDir), { recursive: true })
    cpSync(srcDir, destDir, { recursive: true, dereference: true })
    count++
  }

  log(`✓ Copied ${count} packages into ${FUNC_NM}`)
  log(`  Externals bundled for runtime: ${EXTERNAL_PACKAGES.join(', ')}`)
  return true
}
