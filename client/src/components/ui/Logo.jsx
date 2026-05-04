import React, { useRef } from 'react'

let _uid = 0

/**
 * BizBackerz "B" mark — gradient SVG, no white background needed.
 * Works on any dark surface. Each instance gets a unique gradient ID.
 */
export function BizBackerzMark({ size = 40, className = '' }) {
  const id  = useRef(`bz${++_uid}`).current
  const h   = Math.round(size * 1.1)

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 80 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BizBackerz"
    >
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="80" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#52adff" />
          <stop offset="50%"  stopColor="#2a8bff" />
          <stop offset="100%" stopColor="#38d9a9" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="80" y2="88" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#2a8bff" />
          <stop offset="100%" stopColor="#20c997" />
        </linearGradient>
        {/* Glow filter */}
        <filter id={`${id}f`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── B spine (left vertical bar) ── */}
      <rect x="9" y="4" width="15" height="80" rx="7.5" fill={`url(#${id}g)`} />

      {/* ── Upper bowl of B ── */}
      <path
        d="M24 4 C24 4 63 4 63 24 C63 44 24 44 24 44"
        stroke={`url(#${id}g)`}
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Lower bowl of B (wider, teal) ── */}
      <path
        d="M24 44 C24 44 69 44 69 64 C69 84 24 84 24 84"
        stroke={`url(#${id}l)`}
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Subtle inner glow dots at bowl tips ── */}
      <circle cx="63" cy="24" r="4" fill="#52adff" opacity="0.5" />
      <circle cx="69" cy="64" r="4" fill="#38d9a9" opacity="0.4" />
    </svg>
  )
}

/**
 * Full wordmark: mark + "BIZBACKERZ" in Poppins ExtraBold + tagline
 */
export function BizBackerzWordmark({ markSize = 40, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <BizBackerzMark size={markSize} />
      <div style={{ lineHeight: 1 }}>
        <div style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 800,
          fontSize: markSize * 0.4,
          color: '#f1f5f9',
          letterSpacing: '0.07em',
        }}>
          BIZBACKERZ
        </div>
        <div style={{
          height: 1,
          margin: '3px 0',
          background: 'linear-gradient(90deg, rgba(42,139,255,0.7), rgba(56,217,169,0.5), transparent)',
        }} />
        <div style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 500,
          fontSize: markSize * 0.175,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}>
          Delegate to Dominate
        </div>
      </div>
    </div>
  )
}
