import React, { useRef, useEffect, useState, useCallback } from 'react'

/*
  BAXZ — BizBackerz AI mascot robot
  Head tracks cursor via RAF+lerp (no framer-motion dependency).
  Eyes (DOM elements) follow cursor within eye sockets.
  Blinks randomly. Mood changes expression (eyebrows + mouth).
*/

/* ── Eye socket element ─────────────────────────────────────
   Defined outside the main component so React never
   unmounts / remounts it on parent re-renders.              */
function Eye({ S, eyeOff, blinking, ex, ey, ew, eh }) {
  const irisD  = Math.round(20 * S)
  const pupilD = Math.round(9  * S)
  return (
    <div style={{
      position:       'absolute',
      top:            Math.round(ey * S),
      left:           Math.round(ex * S),
      width:          Math.round(ew * S),
      height:         Math.round(eh * S),
      overflow:       'hidden',
      borderRadius:   Math.round(8 * S),
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
    }}>
      {/* Tracking container */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        width:          irisD,
        height:         irisD,
        transform:      `translate(${eyeOff.x * S}px, ${eyeOff.y * S}px)`,
        transition:     'transform 0.07s ease-out',
        willChange:     'transform',
      }}>
        {/* Iris */}
        <div style={{
          width:          irisD,
          height:         blinking ? Math.round(2 * S) : irisD,
          borderRadius:   '50%',
          flexShrink:     0,
          background:     'radial-gradient(circle at 35% 35%, #90d0ff 0%, #2a8bff 40%, #0a4aaa 75%, #040d20 100%)',
          boxShadow:      `0 0 ${10*S}px rgba(42,139,255,1), 0 0 ${4*S}px rgba(140,210,255,0.4)`,
          transition:     'height 0.08s ease',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          {/* Pupil */}
          <div style={{
            width:        pupilD,
            height:       blinking ? Math.round(1 * S) : pupilD,
            borderRadius: '50%',
            background:   '#020a18',
            flexShrink:   0,
            transition:   'height 0.08s ease',
          }} />
        </div>
      </div>
      {/* Specular dot */}
      <div style={{
        position:     'absolute',
        top:          Math.round(eh * 0.2 * S),
        left:         Math.round(ew * 0.3 * S),
        width:        Math.round(4 * S),
        height:       Math.round(4 * S),
        borderRadius: '50%',
        background:   'rgba(255,255,255,0.55)',
        pointerEvents:'none',
        opacity:      blinking ? 0 : 1,
        transition:   'opacity 0.08s ease',
      }} />
    </div>
  )
}

/* ── Eye socket geometry in head-SVG space ─────────────── */
const L_EYE = { x: 26, y: 34, w: 46, h: 32 }
const R_EYE = { x: 88, y: 34, w: 46, h: 32 }

/* ── Main component ─────────────────────────────────────── */
export default function RobotCursorTracker({
  mood      = 'idle',   // idle | happy | thinking | winking
  size      = 1,
  className = '',
}) {
  const containerRef = useRef(null)
  const headRef      = useRef(null)
  const targetRot    = useRef({ x: 0, y: 0 })
  const currentRot   = useRef({ x: 0, y: 0 })
  const rafId        = useRef(null)

  const [eyeOff,   setEyeOff]   = useState({ x: 0, y: 0 })
  const [blinking, setBlinking] = useState(false)

  const S = size

  /* ── RAF lerp loop for smooth head rotation ──────────── */
  useEffect(() => {
    const animate = () => {
      const ease = 0.085
      currentRot.current.x += (targetRot.current.x - currentRot.current.x) * ease
      currentRot.current.y += (targetRot.current.y - currentRot.current.y) * ease

      if (headRef.current) {
        headRef.current.style.transform =
          `rotateX(${currentRot.current.x.toFixed(3)}deg) rotateY(${currentRot.current.y.toFixed(3)}deg)`
      }
      rafId.current = requestAnimationFrame(animate)
    }
    rafId.current = requestAnimationFrame(animate)
    return () => { if (rafId.current) cancelAnimationFrame(rafId.current) }
  }, [])

  /* ── Mouse → target rotation + eye offset ───────────── */
  useEffect(() => {
    const isTouch = typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches
    if (isTouch) return

    const onMove = (e) => {
      if (!containerRef.current) return
      const r   = containerRef.current.getBoundingClientRect()
      const hcx = r.left + r.width  * 0.5
      const hcy = r.top  + r.height * 0.25

      const dx = e.clientX - hcx
      const dy = e.clientY - hcy

      targetRot.current.y = Math.max(-30, Math.min(30, (dx / window.innerWidth)  * 60))
      targetRot.current.x = Math.max(-16, Math.min(16, (dy / window.innerHeight) * 32))

      setEyeOff({
        x: Math.max(-5.5, Math.min(5.5, (dx / window.innerWidth)  * 18)),
        y: Math.max(-3.5, Math.min(3.5, (dy / window.innerHeight) * 11)),
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  /* ── Blink timer ─────────────────────────────────────── */
  useEffect(() => {
    let timer
    const loop = () => {
      timer = setTimeout(() => {
        setBlinking(true)
        setTimeout(() => { setBlinking(false); loop() }, 140)
      }, 2600 + Math.random() * 2800)
    }
    loop()
    return () => clearTimeout(timer)
  }, [])

  /* ── Mood → mouth LED colours ────────────────────────── */
  const moodColors = {
    idle:     { a: '#2a8bff', b: '#52adff' },
    happy:    { a: '#20c997', b: '#38d9a9' },
    thinking: { a: '#f59e0b', b: '#fbbf24' },
    winking:  { a: '#8b5cf6', b: '#a78bfa' },
  }
  const mc = moodColors[mood] || moodColors.idle

  /* ── Mood → eyebrow Y positions ──────────────────────── */
  const brow = {
    idle:     { lY1: 12, lY2: 12, rY1: 12, rY2: 12 },
    happy:    { lY1: 10, lY2: 14, rY1: 14, rY2: 10 },
    thinking: { lY1:  8, lY2: 14, rY1: 14, rY2:  8 },
    winking:  { lY1: 12, lY2: 12, rY1: 10, rY2: 10 },
  }[mood] || { lY1: 12, lY2: 12, rY1: 12, rY2: 12 }

  const W    = Math.round(240 * S)
  const H    = Math.round(360 * S)
  const HD_W = 160
  const HD_H = 120
  const HD_X = Math.round((240 - HD_W) / 2 * S)   // 40*S
  const HD_T = Math.round(6 * S)

  return (
    <div
      ref={containerRef}
      className={`relative select-none pointer-events-none ${className}`}
      style={{ width: W, height: H }}
      aria-hidden="true"
    >
      {/* ══════════════════════════════════════════
          STATIC BODY SVG
      ══════════════════════════════════════════ */}
      <svg
        width={W} height={H}
        viewBox="0 0 240 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <linearGradient id={`rb-body-${S}`}  x1="0" y1="0" x2="0"   y2="1">
            <stop offset="0%"   stopColor="#1d2e50"/>
            <stop offset="100%" stopColor="#101d38"/>
          </linearGradient>
          <linearGradient id={`rb-arm-${S}`}   x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%"   stopColor="#162240"/>
            <stop offset="100%" stopColor="#0e1930"/>
          </linearGradient>
          <linearGradient id={`rb-leg-${S}`}   x1="0" y1="0" x2="0"   y2="1">
            <stop offset="0%"   stopColor="#162240"/>
            <stop offset="100%" stopColor="#0b1428"/>
          </linearGradient>
          <radialGradient id={`rb-chest-${S}`} cx="50%" cy="40%" r="55%">
            <stop offset="0%"   stopColor="rgba(42,139,255,0.18)"/>
            <stop offset="100%" stopColor="transparent"/>
          </radialGradient>
          <filter id={`rb-led-${S}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="120" cy="348" rx="80" ry="9" fill="rgba(0,0,0,0.4)"/>

        {/* ── LEGS ── */}
        <rect x="66"  y="244" width="46" height="62" rx="13" fill={`url(#rb-leg-${S})`} stroke="rgba(42,139,255,0.18)" strokeWidth="1.2"/>
        <rect x="128" y="244" width="46" height="62" rx="13" fill={`url(#rb-leg-${S})`} stroke="rgba(42,139,255,0.18)" strokeWidth="1.2"/>
        <line x1="80"  y1="254" x2="80"  y2="298" stroke="rgba(42,139,255,0.1)" strokeWidth="1"/>
        <line x1="160" y1="254" x2="160" y2="298" stroke="rgba(42,139,255,0.1)" strokeWidth="1"/>

        {/* ── FEET ── */}
        <rect x="60"  y="298" width="54" height="22" rx="11" fill="#182640" stroke="rgba(42,139,255,0.2)" strokeWidth="1"/>
        <rect x="126" y="298" width="54" height="22" rx="11" fill="#182640" stroke="rgba(42,139,255,0.2)" strokeWidth="1"/>
        <rect x="64"  y="301" width="44" height="15" rx="7" fill="rgba(42,139,255,0.04)"/>
        <rect x="130" y="301" width="44" height="15" rx="7" fill="rgba(42,139,255,0.04)"/>

        {/* ── TORSO ── */}
        <rect x="44" y="130" width="152" height="118" rx="22" fill={`url(#rb-body-${S})`} stroke="rgba(42,139,255,0.28)" strokeWidth="1.5"/>
        <rect x="44" y="130" width="152" height="2.5"  rx="1.2" fill="rgba(255,255,255,0.07)"/>
        <rect x="44" y="130" width="152" height="118" rx="22" fill={`url(#rb-chest-${S})`}/>

        {/* ── ARMS ── */}
        <rect x="10"  y="130" width="38" height="92" rx="15" fill={`url(#rb-arm-${S})`} stroke="rgba(42,139,255,0.2)" strokeWidth="1.2"/>
        <rect x="17"  y="140" width="24" height="58" rx="9"  fill="rgba(0,0,0,0.25)"/>
        <circle cx="29" cy="168" r="9"   fill="rgba(42,139,255,0.06)" stroke="rgba(42,139,255,0.18)" strokeWidth="1"/>
        <circle cx="29" cy="168" r="4.5" fill="rgba(42,139,255,0.25)"/>
        <rect x="192" y="130" width="38" height="92" rx="15" fill={`url(#rb-arm-${S})`} stroke="rgba(42,139,255,0.2)" strokeWidth="1.2"/>
        <rect x="199" y="140" width="24" height="58" rx="9"  fill="rgba(0,0,0,0.25)"/>
        <circle cx="211" cy="168" r="9"   fill="rgba(42,139,255,0.06)" stroke="rgba(42,139,255,0.18)" strokeWidth="1"/>
        <circle cx="211" cy="168" r="4.5" fill="rgba(42,139,255,0.25)"/>

        {/* Hands */}
        <rect x="8"   y="218" width="42" height="26" rx="11" fill="#182640" stroke="rgba(42,139,255,0.2)" strokeWidth="1"/>
        <rect x="190" y="218" width="42" height="26" rx="11" fill="#182640" stroke="rgba(42,139,255,0.2)" strokeWidth="1"/>

        {/* Corner brackets */}
        <path d="M48 150 L48 136 L62 136" stroke="rgba(42,139,255,0.4)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M192 150 L192 136 L178 136" stroke="rgba(42,139,255,0.4)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M48 228 L48 242 L62 242" stroke="rgba(42,139,255,0.22)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M192 228 L192 242 L178 242" stroke="rgba(42,139,255,0.22)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>

        {/* ── CHEST PANEL ── */}
        <rect x="82" y="140" width="76" height="64" rx="12" fill="#0c1626" stroke="rgba(42,139,255,0.25)" strokeWidth="1"/>
        <line x1="82" y1="140" x2="158" y2="140" stroke="rgba(42,139,255,0.35)" strokeWidth="1"/>
        <text x="120" y="180" textAnchor="middle" fill="rgba(42,139,255,0.7)" fontSize="24" fontWeight="800"
          fontFamily="'Cabinet Grotesk',sans-serif" letterSpacing="-0.05em">BB</text>
        <line x1="100" y1="186" x2="140" y2="186" stroke="rgba(42,139,255,0.25)" strokeWidth="1" strokeLinecap="round"/>

        {/* ── LEDs ── */}
        <circle cx="89"  cy="214" r="3.8" fill="#20c997" filter={`url(#rb-led-${S})`}/>
        <circle cx="103" cy="214" r="3.8" fill="#2a8bff" filter={`url(#rb-led-${S})`}/>
        <circle cx="117" cy="214" r="3.8" fill="#2a8bff" filter={`url(#rb-led-${S})`}/>
        <circle cx="131" cy="214" r="3.8" fill="#f59e0b" filter={`url(#rb-led-${S})`}/>
        <circle cx="145" cy="214" r="3.8" fill="#2a8bff" filter={`url(#rb-led-${S})`}/>

        {/* ── VENT SLOTS ── */}
        {[222, 230, 238].map((y, i) => (
          <rect key={i} x="66" y={y} width="108" height="3.5" rx="1.8"
            fill="rgba(42,139,255,0.05)" stroke="rgba(42,139,255,0.13)" strokeWidth="0.6"/>
        ))}

        {/* ── NECK ── */}
        <path d="M 86 120 L 90 130 L 150 130 L 154 120 Z" fill="#152038" stroke="rgba(42,139,255,0.22)" strokeWidth="1"/>
        {[100,108,116,124,132,140].map(x => (
          <line key={x} x1={x} y1="122" x2={x} y2="128" stroke="rgba(42,139,255,0.14)" strokeWidth="1"/>
        ))}

        {/* Antenna base */}
        <rect x="114" y="10" width="12" height="8" rx="3" fill="#162240" stroke="rgba(42,139,255,0.3)" strokeWidth="1"/>
      </svg>

      {/* ══════════════════════════════════════════
          HEAD — 3-D ROTATING LAYER
      ══════════════════════════════════════════ */}
      <div style={{
        position:         'absolute',
        top:               HD_T,
        left:              HD_X,
        width:             HD_W * S,
        height:            HD_H * S,
        perspective:       `${550 * S}px`,
        perspectiveOrigin: '50% 90%',
      }}>
        {/* headRef receives the CSS transform from the RAF loop */}
        <div
          ref={headRef}
          style={{
            width:          '100%',
            height:         '100%',
            transformStyle: 'preserve-3d',
            transformOrigin:'50% 90%',
            willChange:     'transform',
          }}
        >
          {/* ── Head SVG chrome ── */}
          <svg
            width={HD_W * S}
            height={HD_H * S}
            viewBox="0 0 160 120"
            fill="none"
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          >
            <defs>
              <linearGradient id={`rh-head-${S}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#212f52"/>
                <stop offset="100%" stopColor="#141f3a"/>
              </linearGradient>
              <linearGradient id={`rh-face-${S}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#101828"/>
                <stop offset="100%" stopColor="#080f1c"/>
              </linearGradient>
              <radialGradient id={`rh-glow-${S}`} cx="50%" cy="60%" r="60%">
                <stop offset="0%"   stopColor="rgba(42,139,255,0.07)"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>
              <filter id={`rh-ant-${S}`}  x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
              <filter id={`rh-led-${S}`}  x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feComposite in="SourceGraphic" in2="blur" operator="over"/>
              </filter>
            </defs>

            {/* Antenna */}
            <line x1="80" y1="2" x2="80" y2="14" stroke="rgba(42,139,255,0.75)" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="80" cy="7" r="5.5" fill="#2a8bff" filter={`url(#rh-ant-${S})`} opacity="0.95"/>
            <circle cx="80" cy="7" r="2.5" fill="white"   opacity="0.7"/>

            {/* Head shell */}
            <rect x="10" y="12" width="140" height="100" rx="20" fill={`url(#rh-head-${S})`} stroke="rgba(42,139,255,0.45)" strokeWidth="1.8"/>
            <rect x="10" y="12" width="140" height="3"   rx="1.5" fill="rgba(255,255,255,0.08)"/>
            <rect x="10" y="108" width="140" height="4"  rx="2"   fill="rgba(0,0,0,0.3)"/>

            {/* Face plate */}
            <rect x="22" y="20" width="116" height="84" rx="14" fill={`url(#rh-face-${S})`} stroke="rgba(42,139,255,0.18)" strokeWidth="1"/>
            <rect x="22" y="20" width="116" height="84" rx="14" fill={`url(#rh-glow-${S})`}/>

            {/* Side panels */}
            <rect x="10"  y="32" width="15" height="55" rx="6" fill="#111d38" stroke="rgba(42,139,255,0.2)" strokeWidth="1"/>
            <circle cx="17.5" cy="44" r="3.2" fill="#2a8bff" filter={`url(#rh-led-${S})`} opacity="0.85"/>
            <circle cx="17.5" cy="55" r="3.2" fill="#20c997" filter={`url(#rh-led-${S})`} opacity="0.75"/>
            <circle cx="17.5" cy="66" r="3.2" fill="#2a8bff" opacity="0.3"/>
            <circle cx="17.5" cy="77" r="3.2" fill="#8b5cf6" opacity="0.25"/>

            <rect x="135" y="32" width="15" height="55" rx="6" fill="#111d38" stroke="rgba(42,139,255,0.2)" strokeWidth="1"/>
            <circle cx="142.5" cy="44" r="3.2" fill="#2a8bff" filter={`url(#rh-led-${S})`} opacity="0.85"/>
            <circle cx="142.5" cy="55" r="3.2" fill="#20c997" filter={`url(#rh-led-${S})`} opacity="0.75"/>
            <circle cx="142.5" cy="66" r="3.2" fill="#2a8bff" opacity="0.3"/>
            <circle cx="142.5" cy="77" r="3.2" fill="#8b5cf6" opacity="0.25"/>

            {/* Eye sockets */}
            <rect x={L_EYE.x} y={L_EYE.y} width={L_EYE.w} height={L_EYE.h} rx="8" fill="#060d1c" stroke="rgba(42,139,255,0.4)" strokeWidth="1.3"/>
            <rect x={L_EYE.x} y={L_EYE.y} width={L_EYE.w} height="2" rx="1" fill="rgba(42,139,255,0.18)"/>
            <rect x={R_EYE.x} y={R_EYE.y} width={R_EYE.w} height={R_EYE.h} rx="8" fill="#060d1c" stroke="rgba(42,139,255,0.4)" strokeWidth="1.3"/>
            <rect x={R_EYE.x} y={R_EYE.y} width={R_EYE.w} height="2" rx="1" fill="rgba(42,139,255,0.18)"/>

            {/* Nose */}
            <circle cx="80" cy="72" r="2.5" fill="rgba(42,139,255,0.25)" stroke="rgba(42,139,255,0.3)" strokeWidth="0.8"/>

            {/* Mouth slot */}
            <rect x="38" y="80" width="84" height="10" rx="5" fill="#060d1c" stroke="rgba(42,139,255,0.22)" strokeWidth="1"/>

            {/* Corner accents */}
            <path d="M24 26 L24 22 L28 22"   stroke="rgba(42,139,255,0.45)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M136 26 L136 22 L132 22" stroke="rgba(42,139,255,0.45)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M24 100 L24 104 L28 104"   stroke="rgba(42,139,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d="M136 100 L136 104 L132 104" stroke="rgba(42,139,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>

          {/* ── Eye irises (DOM, outside component body) ── */}
          <Eye S={S} eyeOff={eyeOff} blinking={blinking} ex={L_EYE.x} ey={L_EYE.y} ew={L_EYE.w} eh={L_EYE.h} />
          <Eye S={S} eyeOff={eyeOff} blinking={blinking} ex={R_EYE.x} ey={R_EYE.y} ew={R_EYE.w} eh={R_EYE.h} />

          {/* ── Mouth LED strip ── */}
          <div style={{
            position:     'absolute',
            top:          Math.round(80 * S),
            left:         Math.round(38 * S),
            width:        Math.round(84 * S),
            height:       Math.round(10 * S),
            borderRadius: Math.round(5 * S),
            overflow:     'hidden',
            zIndex:       3,
          }}>
            <div style={{
              width:      '200%',
              height:     '100%',
              background: `linear-gradient(90deg, ${mc.a}, ${mc.b}, ${mc.a})`,
              opacity:    0.9,
              animation:  'gradient-shift 2.2s linear infinite',
            }} />
            <div style={{
              position:       'absolute',
              inset:          0,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-evenly',
              padding:        `0 ${Math.round(5 * S)}px`,
            }}>
              {[0,1,2,3,4,5,6,7].map(i => (
                <div key={i} style={{
                  width:        Math.round(2.8 * S),
                  height:       Math.round(2.8 * S),
                  borderRadius: '50%',
                  background:   'rgba(255,255,255,0.65)',
                  flexShrink:   0,
                }} />
              ))}
            </div>
          </div>

          {/* ── Eyebrows (mood) ── */}
          <svg
            width={HD_W * S}
            height={Math.round(22 * S)}
            viewBox="0 0 160 22"
            style={{ position: 'absolute', top: Math.round(16 * S), left: 0, zIndex: 4 }}
          >
            <line x1="30" y1={brow.lY1} x2="64" y2={brow.lY2}
              stroke="rgba(82,173,255,0.6)" strokeWidth="3" strokeLinecap="round"/>
            <line x1="96" y1={brow.rY1} x2="130" y2={brow.rY2}
              stroke="rgba(82,173,255,0.6)" strokeWidth="3" strokeLinecap="round"/>
          </svg>

        </div>
      </div>
    </div>
  )
}
