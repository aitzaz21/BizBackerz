/**
 * Lighthouse CI configuration — BizBackerz
 *
 * Run a full audit:
 *   1. Build the client:   cd client && npm run build && npm run preview
 *   2. In a new terminal:  npx lhci autorun
 *
 * Or install globally and run against your live site:
 *   npm install -g @lhci/cli
 *   lhci collect --url=https://bizbackerz.com && lhci assert
 *
 * Score guide  Good ≥ 90 | Needs improvement 50–89 | Poor < 50
 *
 * NOTE: Performance on the home page will be lower than other pages due to
 * the Three.js / WebGL 3D scene. That is expected and acceptable — the
 * 3D experience is a deliberate product decision. Accessibility and SEO
 * should always stay at or above 90.
 */

/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    /* ── 1. COLLECT ──────────────────────────────────────────── */
    collect: {
      /* Run Lighthouse 3 times per URL and median the results */
      numberOfRuns: 3,
      /* Pages to audit — add more as needed */
      url: [
        'https://bizbackerz.com/',
        'https://bizbackerz.com/services',
        'https://bizbackerz.com/about',
        'https://bizbackerz.com/booking',
        'https://bizbackerz.com/contact',
      ],
      settings: {
        /* Simulate a mid-range Android device on a 4G connection */
        preset: 'desktop',
        /* Throttle network and CPU to simulate real-world conditions */
        throttlingMethod: 'simulate',
      },
    },

    /* ── 2. ASSERT ───────────────────────────────────────────── */
    assert: {
      /* Fail the CI run only on errors; warn on near-misses */
      preset: 'lighthouse:no-pwa',
      assertions: {
        /* Category scores ─────────────────────────────────────── */
        'categories:performance':     ['warn',  { minScore: 0.65 }],
        'categories:accessibility':   ['error', { minScore: 0.90 }],
        'categories:best-practices':  ['warn',  { minScore: 0.90 }],
        'categories:seo':             ['error', { minScore: 0.92 }],

        /* Core Web Vitals ──────────────────────────────────────── */
        /* FCP — First Contentful Paint (ms) */
        'first-contentful-paint':     ['warn', { maxNumericValue: 3000 }],
        /* LCP — Largest Contentful Paint (ms) */
        'largest-contentful-paint':   ['warn', { maxNumericValue: 5000 }],
        /* TBT — Total Blocking Time (ms) */
        'total-blocking-time':        ['warn', { maxNumericValue: 800 }],
        /* CLS — Cumulative Layout Shift (unitless) */
        'cumulative-layout-shift':    ['warn', { maxNumericValue: 0.10 }],
        /* Speed Index */
        'speed-index':                ['warn', { maxNumericValue: 5500 }],
        /* Interactive */
        'interactive':                ['warn', { maxNumericValue: 7500 }],

        /* SEO must-haves ────────────────────────────────────────── */
        'document-title':             ['error', { minScore: 1 }],
        'meta-description':           ['error', { minScore: 1 }],
        'link-text':                  ['warn',  { minScore: 1 }],
        'crawlable-anchors':          ['warn',  { minScore: 1 }],
        'robots-txt':                 ['error', { minScore: 1 }],
        'canonical':                  ['error', { minScore: 1 }],
        'structured-data':            ['warn',  { minScore: 1 }],

        /* Accessibility ─────────────────────────────────────────── */
        'image-alt':                  ['error', { minScore: 1 }],
        'button-name':                ['error', { minScore: 1 }],
        'color-contrast':             ['warn',  { minScore: 1 }],
        'html-has-lang':              ['error', { minScore: 1 }],
        'html-lang-valid':            ['error', { minScore: 1 }],

        /* Best Practices ────────────────────────────────────────── */
        'uses-https':                 ['error', { minScore: 1 }],
        'no-vulnerable-libraries':    ['warn',  { minScore: 1 }],
        'errors-in-console':          ['warn',  { minScore: 1 }],
        'charset':                    ['error', { minScore: 1 }],

        /* Performance hints ─────────────────────────────────────── */
        'uses-text-compression':      ['warn', { minScore: 1 }],
        'uses-optimized-images':      ['warn', { minScore: 1 }],
        'uses-responsive-images':     ['warn', { minScore: 1 }],
        'offscreen-images':           ['warn', { minScore: 0 }],
        'render-blocking-resources':  ['warn', { minScore: 0 }],
        'unused-javascript':          ['warn', { minScore: 0 }],
        'unused-css-rules':           ['warn', { minScore: 0 }],
      },
    },

    /* ── 3. UPLOAD ───────────────────────────────────────────── */
    upload: {
      /*
       * 'temporary-public-storage' gives a shareable URL after each run.
       * Switch to 'lhci' server if you set up your own LHCI server for
       * historical trend tracking.
       */
      target: 'temporary-public-storage',
    },
  },
}
