import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function ScrollProgress() {
  const fillRef   = useRef(null)
  const wrapRef   = useRef(null)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const fill = fillRef.current
    if (!fill) return

    /* Scrub-based fill */
    gsap.to(fill, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0,
        onUpdate: (self) => setPct(Math.round(self.progress * 100)),
      },
    })

    /* Fade in after slight delay */
    gsap.fromTo(wrapRef.current,
      { opacity: 0, x: 10 },
      { opacity: 1, x: 0, duration: 1.2, ease: 'power2.out', delay: 1.2 }
    )
  }, [])

  return (
    <div
      ref={wrapRef}
      className="fixed right-5 top-1/2 -translate-y-1/2 z-[80] hidden xl:flex flex-col items-center gap-3 pointer-events-none"
      style={{ opacity: 0 }}
    >
      {/* Percentage */}
      <span
        className="font-display font-bold text-[10px] text-white/20"
        style={{ fontVariantNumeric: 'tabular-nums', minWidth: 28, textAlign: 'center' }}
      >
        {pct}
      </span>

      {/* Track */}
      <div className="relative w-px h-28 bg-white/[0.07] rounded-full overflow-hidden">
        <div
          ref={fillRef}
          className="absolute inset-x-0 top-0 rounded-full origin-top"
          style={{
            height: '100%',
            background: 'linear-gradient(180deg,#2a8bff,#38d9a9)',
            transform: 'scaleY(0)',
            boxShadow: '0 0 8px rgba(42,139,255,0.4)',
          }}
        />
      </div>

      {/* Label */}
      <span
        className="text-[7px] font-body font-bold uppercase tracking-[0.25em] text-white/18"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        Scroll
      </span>
    </div>
  )
}
