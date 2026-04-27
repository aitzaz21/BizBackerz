import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar } from 'lucide-react'

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true)
    }

    const threshold = window.innerHeight * 0.75
    const onScroll = () => setVisible(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.88 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{    opacity: 0, y: 20, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          className="fixed bottom-7 right-7 z-[9000]"
          style={{ cursor: isTouch ? undefined : 'none' }}
        >
          <a
            href="https://calendly.com/oliver-reid-bizbackerz/30min"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-label="BOOK"
            className="group relative flex items-center gap-3 pl-4 pr-5 py-3.5 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #2a8bff, #1a6fd8)',
              boxShadow: '0 12px 40px rgba(42,139,255,0.35), 0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
            {/* Shimmer */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12), transparent 50%, rgba(56,217,169,0.12))',
              }}
            />

            {/* Pulsing dot */}
            <span className="relative flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-accent-400 block animate-pulse" />
              <span
                className="absolute inset-0 rounded-full bg-accent-400/40 animate-ping"
                style={{ animationDuration: '1.8s' }}
              />
            </span>

            <span
              className="relative text-white font-display font-bold text-[13px] tracking-[-0.01em] whitespace-nowrap"
            >
              Hire Now!
            </span>

            <Calendar className="relative w-4 h-4 text-white/75 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
