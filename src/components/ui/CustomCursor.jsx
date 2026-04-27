import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

/**
 * AWWWARDS-LEVEL CURSOR SYSTEM
 *
 * Architecture:
 *   1. Exclusion Ring  — white circle, mix-blend-mode: exclusion
 *                        Creates natural color inversion wherever it hovers.
 *                        Grows on interactive elements, shrinks on click.
 *   2. Dot             — tiny bright point, instant tracking
 *   3. Ripple Canvas   — expanding rings at cursor trail (velocity-based)
 *   4. Context Label   — text fades inside ring on elements with [data-cursor-label]
 *
 * The white + exclusion technique:
 *   dark bg  (#030912) → ring area appears near-white
 *   blue text          → ring area inverts to orange
 *   white text         → ring area appears dark
 * This creates an organic, content-aware cursor.
 */

const MAX_RIPPLES = 20
const pool = Array.from({ length: MAX_RIPPLES }, () => ({
  x: 0, y: 0, r: 0, maxR: 0, a: 0, active: false, spd: 0,
}))

function spawnRipple(x, y, intensity = 1) {
  for (let i = 0; i < MAX_RIPPLES; i++) {
    if (!pool[i].active) {
      Object.assign(pool[i], {
        x, y, r: 0,
        maxR: 45 + intensity * 35,
        a: 0.18 + intensity * 0.1,
        active: true,
        spd: 1 + intensity * 0.6,
      })
      return
    }
  }
}

export default function CustomCursor() {
  const canvasRef = useRef(null)
  const ringRef   = useRef(null)
  const dotRef    = useRef(null)
  const labelRef  = useRef(null)
  const pos       = useRef({ x: -200, y: -200 })
  const prevPos   = useRef({ x: -200, y: -200 })
  const ringPos   = useRef({ x: -200, y: -200 })
  const state     = useRef({ hover: false, click: false, label: '' })
  const ripTimer  = useRef(0)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true)
      return
    }
    const onTouch = () => setIsTouch(true)
    window.addEventListener('touchstart', onTouch, { passive: true })

    document.documentElement.style.cursor = 'none'

    /* ── Canvas ── */
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    let dpr = Math.min(window.devicePixelRatio, 2)

    const resize = () => {
      if (!canvas) return
      dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width  = window.innerWidth  * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width  = window.innerWidth  + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx?.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    /* ── Mouse handlers ── */
    const onMove = (e) => {
      pos.current.x = e.clientX
      pos.current.y = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`
      }

      // Detect interactive + label
      const target = e.target
      const interactive = target.closest('a,button,[data-cursor],[role="button"],.group')
      const labelEl = target.closest('[data-cursor-label]')
      const newLabel = labelEl?.dataset.cursorLabel || ''
      state.current.hover = !!interactive
      state.current.label = newLabel
    }
    const onDown = () => { state.current.click = true }
    const onUp   = () => { state.current.click = false }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup',   onUp)

    /* ── Animation loop via GSAP ticker ── */
    const tick = () => {
      ripTimer.current++

      /* Ring lerp */
      const lerp = 0.12
      ringPos.current.x += (pos.current.x - ringPos.current.x) * lerp
      ringPos.current.y += (pos.current.y - ringPos.current.y) * lerp

      const { hover, click, label } = state.current

      /* ── Ring ── */
      if (ringRef.current) {
        const size = click ? 22 : hover ? 72 : 40
        const half = size / 2
        ringRef.current.style.transform  = `translate(${ringPos.current.x}px,${ringPos.current.y}px)`
        ringRef.current.style.width      = size + 'px'
        ringRef.current.style.height     = size + 'px'
        ringRef.current.style.marginLeft = -half + 'px'
        ringRef.current.style.marginTop  = -half + 'px'
        ringRef.current.style.opacity    = click ? '0.6' : '1'
      }

      /* ── Label ── */
      if (labelRef.current) {
        labelRef.current.style.opacity = (hover && label) ? '1' : '0'
        if (label) labelRef.current.textContent = label
      }

      /* ── Dot ── */
      if (dotRef.current) {
        const ds = click ? 3 : hover ? 5 : 5
        dotRef.current.style.width      = ds + 'px'
        dotRef.current.style.height     = ds + 'px'
        dotRef.current.style.marginLeft = -ds / 2 + 'px'
        dotRef.current.style.marginTop  = -ds / 2 + 'px'
        dotRef.current.style.opacity    = hover ? '0' : '1'
      }

      /* ── Ripples ── */
      const dx  = pos.current.x - prevPos.current.x
      const dy  = pos.current.y - prevPos.current.y
      const spd = Math.sqrt(dx * dx + dy * dy)
      if (spd > 4 && ripTimer.current % 3 === 0) {
        spawnRipple(pos.current.x, pos.current.y, hover ? 1.4 : Math.min(spd / 25, 1))
      }
      if (state.current.click && ripTimer.current % 8 === 0) {
        spawnRipple(pos.current.x, pos.current.y, 2)
      }
      prevPos.current.x = pos.current.x
      prevPos.current.y = pos.current.y

      /* ── Draw ripples ── */
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
        for (let i = 0; i < MAX_RIPPLES; i++) {
          const r = pool[i]
          if (!r.active) continue
          r.r += r.spd
          r.a -= 0.005
          if (r.a <= 0 || r.r >= r.maxR) { r.active = false; continue }
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255,255,255,${r.a * 0.5})`
          ctx.lineWidth   = 0.8
          ctx.stroke()
        }
      }
    }

    gsap.ticker.add(tick)

    return () => {
      document.documentElement.style.cursor = ''
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mousedown',  onDown)
      window.removeEventListener('mouseup',    onUp)
      window.removeEventListener('resize',     resize)
      window.removeEventListener('touchstart', onTouch)
      gsap.ticker.remove(tick)
    }
  }, [])

  if (isTouch) return null

  return (
    <>
      {/* Ripple canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 99990, pointerEvents: 'none',
        }}
      />

      {/* Dot — tiny instant tracker */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 5, height: 5, borderRadius: '50%',
          background: '#fff',
          zIndex: 99999, pointerEvents: 'none',
          willChange: 'transform',
          transition: 'width .15s, height .15s, opacity .2s',
          mixBlendMode: 'exclusion',
        }}
      />

      {/* Exclusion ring — the Awwwards cursor */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 40, height: 40, borderRadius: '50%',
          background: 'white',
          mixBlendMode: 'exclusion',
          zIndex: 99998, pointerEvents: 'none',
          willChange: 'transform, width, height',
          transition: 'width .35s cubic-bezier(.25,.46,.45,.94), height .35s cubic-bezier(.25,.46,.45,.94), opacity .25s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Context label inside ring */}
        <span
          ref={labelRef}
          style={{
            fontFamily: '"Clash Display", sans-serif',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#030912',
            mixBlendMode: 'normal',
            opacity: 0,
            transition: 'opacity .25s',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </div>

      <style>{`*, a, button, [role="button"] { cursor: none !important; }`}</style>
    </>
  )
}
