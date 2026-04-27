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
  const ctrRef    = useRef(null)   // counter text
  const barRef    = useRef(null)   // progress bar fill
  const logoRef   = useRef(null)
  const labelRef  = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    /* ── 1. Logo + label appear ── */
    tl.from(logoRef.current, { scale: 0.75, opacity: 0, duration: 0.9 })
    tl.from(labelRef.current, { opacity: 0, y: 10, duration: 0.7 }, '-=0.4')

    /* ── 2. Counter  000 → 100 (runs alongside logo) ── */
    const counter = { val: 0 }
    tl.to(counter, {
      val: 100,
      duration: 2.0,
      ease: 'power2.inOut',
      onUpdate() {
        const v = Math.round(counter.val)
        if (ctrRef.current) {
          ctrRef.current.textContent = v.toString().padStart(3, '0')
        }
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${v / 100})`
        }
      },
    }, '-=0.6')

    /* ── 3. Brief pause, then curtain splits ── */
    tl.to(
      [topRef.current, botRef.current],
      {
        yPercent: (i) => (i === 0 ? -100 : 100),
        duration: 1.05,
        ease: 'power4.inOut',
        stagger: 0,
        onComplete: () => {
          onComplete?.()
          gsap.set(loaderRef.current, { display: 'none' })
        },
      },
      '+=0.15'
    )

    return () => tl.kill()
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
        <div style={{ textAlign: 'center' }}>
          {/* Logo image */}
          <div
            ref={logoRef}
            style={{
              margin: '0 auto 16px', width: 76, height: 76,
              borderRadius: 18,
              background: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 6,
              boxShadow: '0 0 50px rgba(42,139,255,0.55), 0 8px 28px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <img
              src="/logo/navbar.png"
              alt="BizBackerz"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Brand name + tagline */}
          <div ref={labelRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800, fontSize: 22,
                color: '#f1f5f9', letterSpacing: '0.08em',
                lineHeight: 1,
              }}
            >
              BIZBACKERZ
            </span>
            <div style={{
              height: '1px', width: '120px', margin: '5px 0',
              background: 'linear-gradient(90deg, transparent, rgba(42,139,255,0.7), rgba(56,217,169,0.5), transparent)',
            }} />
            <span
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500, fontSize: 9,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.28em', textTransform: 'uppercase',
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
