import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * SITE LOADER
 * Two curtain panels (top 50vh / bottom 50vh) that split open
 * revealing the page beneath.
 *
 * Flow:
 *   1. Brand mark + counter animate in
 *   2. Counter increments 000 → 100 over ~2s
 *   3. Both panels slide off screen (up / down) simultaneously
 *   4. onComplete fires — parent removes the loader
 */
export default function SiteLoader({ onComplete }) {
  const loaderRef = useRef(null)
  const topRef    = useRef(null)
  const botRef    = useRef(null)
  const ctrRef    = useRef(null)
  const barRef    = useRef(null)
  const logoRef   = useRef(null)
  const labelRef  = useRef(null)

  useEffect(() => {
    /* Skip loader on repeat visits within the same session — 0ms blocked LCP */
    if (sessionStorage.getItem('bb_loaded')) {
      onComplete?.()
      return
    }
    sessionStorage.setItem('bb_loaded', '1')

    /* Safety: force-complete after 4s if GSAP stalls (tab backgrounded, RAF paused) */
    const safetyTimer = setTimeout(() => onComplete?.(), 4000)

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    /* ── 1. Logo + label appear — faster ── */
    tl.from(logoRef.current, { scale: 0.75, opacity: 0, duration: 0.35 })
    tl.from(labelRef.current, { opacity: 0, y: 8, duration: 0.3 }, '-=0.2')

    /* ── 2. Counter 000 → 100 — reduced from 2.0s to 0.8s ── */
    const counter = { val: 0 }
    tl.to(counter, {
      val: 100,
      duration: 0.8,
      ease: 'power2.inOut',
      onUpdate() {
        const v = Math.round(counter.val)
        if (ctrRef.current) ctrRef.current.textContent = v.toString().padStart(3, '0')
        if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`
      },
    }, '-=0.25')

    /* ── 3. Curtain splits — reduced from 1.05s to 0.55s ── */
    tl.to(
      [topRef.current, botRef.current],
      {
        yPercent: (i) => (i === 0 ? -100 : 100),
        duration: 0.55,
        ease: 'power4.inOut',
        stagger: 0,
        onComplete: () => {
          onComplete?.()
          gsap.set(loaderRef.current, { display: 'none' })
        },
      },
      '+=0.05'
    )

    return () => {
      tl.kill()
      clearTimeout(safetyTimer)
    }
  }, [onComplete])

  const panel = {
    position: 'absolute', left: 0, right: 0,
    background: '#030912',
  }

  return (
    <div
      ref={loaderRef}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 1000000,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── Top curtain: brand ── */}
      <div
        ref={topRef}
        style={{
          ...panel, top: 0, height: '50vh',
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', paddingBottom: '2.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* Brand wordmark — no logo image for now */}
        <div ref={logoRef} style={{ textAlign: 'center' }}>
          <div ref={labelRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: 28,
                color: '#f1f5f9',
                letterSpacing: '0.08em',
                lineHeight: 1,
              }}
            >
              BIZBACKERZ
            </span>
            <div
              style={{
                height: 1,
                width: 140,
                margin: '7px 0',
                background: 'linear-gradient(90deg, transparent, rgba(42,139,255,0.7), rgba(56,217,169,0.5), transparent)',
              }}
            />
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                fontSize: 9,
                color: 'rgba(255,255,255,0.32)',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
              }}
            >
              Delegate to Dominate
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom curtain: counter ── */}
      <div
        ref={botRef}
        style={{
          ...panel, bottom: 0, height: '50vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-start',
          paddingTop: '2.5rem', gap: '1.25rem',
        }}
      >
        {/* Progress bar */}
        <div
          style={{
            width: 180, height: 1,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            ref={barRef}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg,#2a8bff,#20c997)',
              transformOrigin: 'left center',
              transform: 'scaleX(0)',
            }}
          />
        </div>

        {/* Counter */}
        <div
          style={{
            fontFamily: '"Clash Display", sans-serif',
            fontWeight: 700,
            fontSize: 56,
            letterSpacing: '-0.06em',
            lineHeight: 1,
            color: 'rgba(255,255,255,0.07)',
          }}
        >
          <span ref={ctrRef}>000</span>
        </div>
      </div>
    </div>
  )
}
