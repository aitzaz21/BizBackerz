import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

const MotionLink = motion(Link)

const variants = {
  primary:   'bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 hover:from-brand-400 hover:to-brand-600',
  secondary: 'bg-transparent border border-brand-500/25 text-brand-400 hover:bg-brand-500/8 hover:border-brand-500/50 scan-effect',
  accent:    'bg-gradient-to-r from-accent-500 to-accent-600 text-navy-950 font-bold shadow-lg shadow-accent-500/20 hover:shadow-accent-500/35',
  ghost:     'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10',
}

const sizes = {
  sm: 'px-5 py-2.5 text-[13px]',
  md: 'px-7 py-3.5 text-sm',
  lg: 'px-9 py-4 text-[15px]',
}

function MagneticWrapper({ children, strength = 0.38, disabled = false }) {
  const wrapRef = useRef(null)
  const xTo     = useRef(null)
  const yTo     = useRef(null)

  useEffect(() => {
    if (disabled) return
    const el = wrapRef.current
    if (!el) return
    xTo.current = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' })
    yTo.current = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' })
    return () => { gsap.set(el, { x: 0, y: 0 }) }
  }, [disabled])

  const onMove = (e) => {
    if (disabled || !wrapRef.current) return
    const r  = wrapRef.current.getBoundingClientRect()
    const cx = r.left + r.width  / 2
    const cy = r.top  + r.height / 2
    xTo.current?.((e.clientX - cx) * strength)
    yTo.current?.((e.clientY - cy) * strength)
  }

  const onLeave = () => {
    if (disabled) return
    xTo.current?.(0)
    yTo.current?.(0)
  }

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ display: 'inline-block', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}

export default function Button({
  children,
  variant   = 'primary',
  size      = 'md',
  href,
  type      = 'button',
  className = '',
  onClick,
  magnetic  = true,
  disabled  = false,
}) {
  const isExternal = href?.startsWith('http')
  const isInternal = href && !isExternal

  const cls = `inline-flex items-center justify-center gap-2 font-display font-semibold tracking-[-0.01em] rounded-xl transition-all duration-300 cursor-pointer select-none btn-shimmer ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`

  const spring = {
    whileHover: disabled ? {} : { scale: 1.035, y: -2 },
    whileTap:   disabled ? {} : { scale: 0.965 },
    transition: { type: 'spring', stiffness: 420, damping: 18 },
  }

  const inner = href ? (
    isExternal ? (
      <motion.a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...spring}>
        {children}
      </motion.a>
    ) : (
      <MotionLink to={href} className={cls} {...spring}>
        {children}
      </MotionLink>
    )
  ) : (
    <motion.button type={type} className={cls} onClick={onClick} disabled={disabled} {...spring}>
      {children}
    </motion.button>
  )

  if (!magnetic || typeof window === 'undefined') return inner

  return <MagneticWrapper disabled={disabled}>{inner}</MagneticWrapper>
}
