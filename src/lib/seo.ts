/**
 * SEO helpers.
 *
 * The canonical URL and og:url have to reflect the page actually being served,
 * but `Layout` is rendered from 21 different call sites. Threading a `path` prop
 * through every one of them would mean 21 edits that all have to stay in sync
 * forever — and any page whose author forgets the prop silently emits a wrong
 * canonical, which is worse than emitting none at all.
 *
 * Instead we read the live request out of Hono's contextStorage
 * (AsyncLocalStorage under the hood), so the component derives it with no
 * call-site changes.
 */
import { tryGetContext } from 'hono/context-storage'

/** Production origin. Used when the request origin can't be determined. */
export const SITE_ORIGIN = 'https://omarhesham.org'

/** Paths that must never be indexed or advertised as canonical. */
const NOINDEX_PREFIXES = ['/dashboard', '/login', '/profile', '/notifications']

export type PageSeo = {
  /** Absolute canonical URL for the current page. */
  canonical: string
  /** True when the page must carry <meta name="robots" content="noindex,…">. */
  noindex: boolean
}

/**
 * Resolves SEO data for the request currently being handled.
 *
 * Falls back to the site root when there is no ambient request context (e.g. a
 * component rendered in isolation by a test), so this never throws mid-render.
 */
export const pageSeo = (): PageSeo => {
  const ctx = tryGetContext()
  if (!ctx) return { canonical: SITE_ORIGIN + '/', noindex: false }

  let pathname = '/'
  let origin = SITE_ORIGIN
  try {
    const url = new URL(ctx.req.url)
    pathname = url.pathname
    // Keep localhost / preview deploys self-consistent, while still hardcoding
    // the production origin for the real domain.
    if (url.hostname === 'localhost' || url.hostname.endsWith('.vercel.app')) {
      origin = url.origin
    }
  } catch {
    /* malformed URL — fall through to the root default */
  }

  // Query strings and trailing slashes create duplicate URLs for identical
  // content; the canonical must collapse them to a single form.
  const normalized = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/'

  return {
    canonical: origin + normalized,
    noindex: NOINDEX_PREFIXES.some(p => normalized === p || normalized.startsWith(p + '/'))
  }
}
