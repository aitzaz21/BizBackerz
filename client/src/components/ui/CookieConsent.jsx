import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie } from 'lucide-react'

const CONSENT_KEY = 'bb_consent'

function updateGtagConsent(granted) {
  if (typeof window.gtag !== 'function') return
  const v = granted ? 'granted' : 'denied'
  window.gtag('consent', 'update', {
    analytics_storage:  v,
    ad_storage:         v,
    ad_user_data:       v,
    ad_personalization: v,
  })
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY)
    if (saved) {
      updateGtagConsent(saved === 'granted')
    } else {
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'granted')
    updateGtagConsent(true)
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'denied')
    updateGtagConsent(false)
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-[340px] z-[9999]"
        >
          <div className="glass-premium rounded-2xl border border-white/[0.08] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.65)] relative overflow-hidden">
            {/* top glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent pointer-events-none" />

            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
                <Cookie className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <p className="text-[14px] font-display font-bold text-white/90 leading-tight">We use cookies</p>
                <p className="text-[11px] text-white/35 font-body mt-0.5 uppercase tracking-[0.08em]">Ads &amp; analytics</p>
              </div>
            </div>

            <p className="text-[12.5px] text-white/50 font-body leading-relaxed mb-4">
              We use cookies to run ads and measure performance. Read our{' '}
              <a href="/privacy" className="text-brand-400 hover:text-brand-300 underline underline-offset-2 transition-colors duration-200">
                Privacy Policy
              </a>.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={accept}
                className="flex-1 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white text-[13px] font-body font-bold py-2.5 px-3 rounded-xl transition-all duration-300 shadow-[0_4px_16px_rgba(42,139,255,0.3)]"
              >
                Accept All
              </button>
              <button
                onClick={decline}
                className="flex-1 text-white/45 hover:text-white/75 text-[13px] font-body font-semibold py-2.5 px-3 rounded-xl border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.04] transition-all duration-300"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
