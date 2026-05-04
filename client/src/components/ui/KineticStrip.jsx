import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Horizontal text that slides left/right driven by vertical scroll.
 * direction:  1 = slides left as you scroll down
 *            -1 = slides right as you scroll down
 */
export default function KineticStrip({
  texts    = ['BIZBACKERZ', '·', 'DELEGATE TO DOMINATE', '·'],
  direction = 1,
  opacity   = 0.045,
  fontSize  = 'clamp(3.5rem,8vw,9rem)',
  speed     = 1.4,
  className = '',
}) {
  const trackRef   = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const track   = trackRef.current
    const section = sectionRef.current
    if (!track || !section) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        track,
        { xPercent: direction > 0 ? 4  : -44 },
        {
          xPercent: direction > 0 ? -44 : 4,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end:   'bottom top',
            scrub: speed,
          },
        }
      )
    })

    return () => ctx.revert()
  }, [direction, speed])

  const pool = [...texts, ...texts, ...texts, ...texts]

  return (
    <div
      ref={sectionRef}
      className={`overflow-hidden select-none pointer-events-none py-2 ${className}`}
    >
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap"
        style={{ willChange: 'transform' }}
      >
        {pool.map((t, i) => (
          <span
            key={i}
            className="font-display font-bold flex-shrink-0"
            style={{
              fontSize,
              color: `rgba(255,255,255,${opacity})`,
              letterSpacing: '-0.04em',
              paddingRight: '0.45em',
              lineHeight: 1,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
