/**
 * Reports Core Web Vitals to GA4 as custom events.
 * Called once at app startup — metrics are sent when they become available
 * (some, like LCP and CLS, fire on page hide / user interaction, not on load).
 *
 * GA4 dashboard path:
 *   Reports → Realtime → Events  (look for CLS, FCP, INP, LCP, TTFB)
 *
 * Thresholds (Google's "Good" range):
 *   LCP  ≤ 2.5 s    |  INP ≤ 200 ms    |  CLS ≤ 0.1
 *   FCP  ≤ 1.8 s    |  TTFB ≤ 800 ms
 */
export function reportWebVitals() {
  if (typeof window === 'undefined') return

  import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
    const send = ({ name, value, id, rating }) => {
      if (typeof window.gtag !== 'function') return
      window.gtag('event', name, {
        /* CLS is unitless (0-1), scale to integers so GA4 stores it correctly */
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        event_category: 'Web Vitals',
        event_label: id,
        non_interaction: true,
        metric_rating: rating,        // 'good' | 'needs-improvement' | 'poor'
      })
    }

    onCLS(send)
    onFCP(send)
    onINP(send)
    onLCP(send)
    onTTFB(send)
  }).catch(() => { /* web-vitals is enhancement-only — never crash the app */ })
}
