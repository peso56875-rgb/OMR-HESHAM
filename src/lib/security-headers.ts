/**
 * Security headers for the whole site.
 *
 * Built on Hono's `secureHeaders()` middleware, with the defaults overridden
 * where this specific site needs it. Every deviation from a stricter value is
 * commented, because "why is this loosened?" is the question a future reader
 * will actually have.
 *
 * ── Why the CSP allows 'unsafe-inline' ────────────────────────────────────
 * Removing it is a real improvement, but it is not a header change — it is a
 * refactor of the templates:
 *   • ~440 `style="…"` attributes across the JSX components (inline styles are
 *     blocked by `style-src` without 'unsafe-inline' or a hash/nonce).
 *   • 5 `dangerouslySetInnerHTML` blocks that emit <script> tags (the JSON-LD in
 *     shared.tsx and the Firebase bootstrap in Auth.tsx).
 * Shipping a nonce-based CSP today would blank the site's styling and break
 * login. So the CSP is deployed in its useful-but-honest form: it locks down
 * *which hosts* may serve script/style/frames/connections — which is what stops
 * an injected `<script src="https://attacker.example">` or a data-exfiltration
 * beacon — while inline execution stays permitted until the templates are
 * migrated. Tightening this is tracked as a follow-up in DEVELOPMENT_PLAN.md.
 */
import { secureHeaders } from 'hono/secure-headers'

/** Firebase Auth + Firestore endpoints the browser SDK talks to directly. */
const FIREBASE_APIS = [
  'https://identitytoolkit.googleapis.com',
  'https://securetoken.googleapis.com',
  'https://firestore.googleapis.com',
  'https://www.googleapis.com'
]

/** Where user-uploaded and remote media can legitimately come from. */
const MEDIA_HOSTS = [
  'https://res.cloudinary.com',
  'https://firebasestorage.googleapis.com',
  'https://storage.googleapis.com',
  'https://lh3.googleusercontent.com' // Google account avatars after OAuth login
]

export const securityHeaders = () =>
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],

      // 'unsafe-inline' → see the module header. www.gstatic.com serves the
      // Firebase JS SDK (dynamically imported in Auth.tsx); apis.google.com is
      // used by the Google sign-in popup flow.
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://www.gstatic.com',
        'https://apis.google.com',
        'https://cdn.jsdelivr.net'
      ],

      // fonts.googleapis.com serves the Tajawal / Aref Ruqaa / Manrope
      // stylesheets; jsdelivr serves the FontAwesome stylesheet.
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],

      // data: is required — FontAwesome and some webfont builds inline glyphs.
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],

      // blob: covers client-side previews of a file the user has just picked,
      // before it has been uploaded anywhere.
      imgSrc: ["'self'", 'data:', 'blob:', ...MEDIA_HOSTS],

      connectSrc: ["'self'", ...FIREBASE_APIS, 'https://api.cloudinary.com'],

      // The Google/Firebase sign-in flow renders a helper iframe on the
      // project's authDomain, so frames must be allowed from those origins —
      // but from nowhere else.
      frameSrc: ["'self'", 'https://accounts.google.com', 'https://*.firebaseapp.com'],

      // Forms may only post back to us. Blocks an injected form that would
      // otherwise silently POST donor details to a third-party collector.
      formAction: ["'self'"],

      // No Flash/Java/embed objects, and <base> cannot be hijacked to re-point
      // every relative URL on the page at an attacker's host.
      objectSrc: ["'none'"],
      baseUri: ["'self'"],

      // Defence in depth alongside X-Frame-Options for older browsers.
      frameAncestors: ["'none'"],

      upgradeInsecureRequests: []
    },

    // Hono defaults to 'no-referrer'. Analytics and inbound-link attribution
    // then lose all origin information; strict-origin-when-cross-origin still
    // never leaks the full path (which on this site can contain record IDs)
    // and never sends anything over plain HTTP.
    referrerPolicy: 'strict-origin-when-cross-origin',

    // 1 year. `preload` is deliberately omitted: submitting to the HSTS preload
    // list is an effectively irreversible commitment that *every* current and
    // future subdomain serves valid HTTPS, and that is an operations decision,
    // not a code one.
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',

    // Stricter than Hono's SAMEORIGIN default — nothing here is meant to be
    // embedded, so clickjacking the donation form is off the table.
    xFrameOptions: 'DENY',

    // Firebase's signInWithPopup needs to talk back to window.opener. Hono's
    // default 'same-origin' severs that reference and the popup hangs without
    // ever completing the login, so the allow-popups variant is required.
    crossOriginOpenerPolicy: 'same-origin-allow-popups',

    // Hono's default is 'same-origin', which would stop other sites hotlinking
    // our images — but it also breaks legitimate embedding of the logo / OG
    // image in link previews on social platforms.
    crossOriginResourcePolicy: 'cross-origin',

    xContentTypeOptions: 'nosniff',

    // The site asks for none of these; denying them up front means an injected
    // script cannot silently prompt the visitor for camera or location access.
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
      usb: [],
      magnetometer: [],
      gyroscope: []
    }
  })
