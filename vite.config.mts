import { defineConfig, type Plugin } from 'vite'
import build from '@hono/vite-build/vercel'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/node'
// @ts-ignore
import { copyExternalsIntoFunction } from './scripts/copy-externals.mjs'

const devAllowedHosts = [
  'localhost',
  '127.0.0.1',
  'omarhesham-foundation.com',
  'www.omarhesham-foundation.com',
  'omarhesham.org',
  'www.omarhesham.org'
]

// Copies firebase-admin (+ full dependency tree) into the Vercel function
// folder after the bundle is written. Without this, the deployed function
// crashes with ERR_MODULE_NOT_FOUND because Vercel's Build Output API does
// not install node_modules for prebuilt functions.
const copyExternalsPlugin = (): Plugin => ({
  name: 'copy-externals-into-vercel-function',
  apply: 'build',
  enforce: 'post',
  closeBundle() {
    copyExternalsIntoFunction(process.cwd())
  }
})

export default defineConfig({
  server: {
    allowedHosts: devAllowedHosts
  },
  plugins: [
    build({
      entry: 'src/index.tsx'
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    }),
    copyExternalsPlugin()
  ],
  ssr: {
    external: ['firebase-admin', 'googleapis', 'firebase']
  }
})
