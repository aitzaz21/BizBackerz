import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import Container from '../ui/Container'
import Button from '../ui/Button'
import { ArrowRight, Lightbulb, Rocket, Award, Zap, Star, ChevronDown } from 'lucide-react'

/* ─── Character scramble ─── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&'
function scrambleWord(el, delay = 0) {
  el.querySelectorAll('[data-ch]').forEach((span, i) => {
    const target = span.dataset.ch
    if (!target || target === ' ') return
    let iter = 0
    const max = 8 + i
    setTimeout(() => {
      const iv = setInterval(() => {
        span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)]
        if (++iter >= max) { span.textContent = target; clearInterval(iv) }
      }, 35)
    }, delay + i * 20)
  })
}
function ScrambleWord({ text }) {
  return (
    <span className="inline-block">
      {text.split('').map((c, i) => (
        <span key={i} data-ch={c === ' ' ? ' ' : c} style={{ display: 'inline-block' }}>{c}</span>
      ))}
    </span>
  )
}

/* ─── Count-up ─── */
function CountUp({ end, suffix = '' }) {
  return <span>{end}{suffix}</span>
}

/* ─── Canvas neural-network particles ─── */
function NeuralCanvas() {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const mouseRef  = useRef({ x: -9999, y: -9999 })
  const frameRef  = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let particles = []

    const init = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const n = Math.min(Math.floor((canvas.width * canvas.height) / 16000), 55)
      particles = Array.from({ length: n }, () => ({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r:  Math.random() * 1.6 + 0.4,
        a:  Math.random() * 0.45 + 0.12,
        c:  [[42,139,255],[56,217,169],[139,92,246],[255,255,255]][Math.floor(Math.random()*4)],
      }))
    }

    const onMouse = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onTouch = (e) => {
      const rect = canvas.getBoundingClientRect()
      const t = e.touches[0]
      mouseRef.current = { x: t.clientX - rect.left, y: t.clientY - rect.top }
    }
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }

    init()
    window.addEventListener('resize', init)
    canvas.parentElement?.addEventListener('mousemove', onMouse)
    canvas.parentElement?.addEventListener('mouseleave', onLeave)
    canvas.parentElement?.addEventListener('touchmove', onTouch, { passive: true })
    canvas.parentElement?.addEventListener('touchend', onLeave, { passive: true })

    const LINK_DIST  = 110
    const REPEL_DIST = 80

    const draw = () => {
      frameRef.current++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (const p of particles) {
        const dx = p.x - mx, dy = p.y - my
        const d  = Math.hypot(dx, dy)
        if (d < REPEL_DIST) {
          const f = (REPEL_DIST - d) / REPEL_DIST
          p.vx += (dx / d) * f * 0.12
          p.vy += (dy / d) * f * 0.12
        }
        p.vx *= 0.978; p.vy *= 0.978
        p.x += p.vx;   p.y += p.vy
        if (p.x < -8) p.x = canvas.width  + 8
        if (p.x > canvas.width  + 8) p.x = -8
        if (p.y < -8) p.y = canvas.height + 8
        if (p.y > canvas.height + 8) p.y = -8

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${p.a})`
        ctx.fill()
      }

      if (frameRef.current % 2 === 0) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p = particles[i], q = particles[j]
            const d = Math.hypot(p.x - q.x, p.y - q.y)
            if (d < LINK_DIST) {
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(q.x, q.y)
              ctx.strokeStyle = `rgba(42,139,255,${(1 - d / LINK_DIST) * 0.055})`
              ctx.lineWidth   = 0.6
              ctx.stroke()
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', init)
      canvas.parentElement?.removeEventListener('mousemove', onMouse)
      canvas.parentElement?.removeEventListener('mouseleave', onLeave)
      canvas.parentElement?.removeEventListener('touchmove', onTouch)
      canvas.parentElement?.removeEventListener('touchend', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1, opacity: 0.55, pointerEvents: 'none' }}
    />
  )
}

/* ─── 3D Orbital Animation (moved from About page cinematic section) ─── */
function OrbitalVisual() {
  return (
    <div className="relative w-full flex items-center justify-center" style={{ minHeight: 320 }}>
      {/* Deep background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(42,139,255,0.28) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }} />
      </div>

      {/* Orbit ring 1 — slow clockwise */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: 280, height: 280,
          borderRadius: '50%',
          border: '1px dashed rgba(42,139,255,0.14)',
        }}
      />

      {/* Orbit ring 2 — counter-clockwise with glowing dot */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: 210, height: 210,
          borderRadius: '50%',
          border: '1px solid rgba(56,217,169,0.12)',
        }}
      >
        <div style={{
          position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: '#38d9a9',
          boxShadow: '0 0 14px #38d9a9, 0 0 32px rgba(56,217,169,0.55)',
        }} />
      </motion.div>

      {/* Orbit ring 3 — innermost, blue dot */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          width: 145, height: 145,
          borderRadius: '50%',
          border: '1px solid rgba(42,139,255,0.10)',
        }}
      >
        <div style={{
          position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
          width: 8, height: 8, borderRadius: '50%',
          background: '#2a8bff',
          boxShadow: '0 0 10px #2a8bff, 0 0 22px rgba(42,139,255,0.55)',
        }} />
      </motion.div>

      {/* Central content */}
      <div className="relative z-10 text-center">
        <div
          className="font-display font-black text-gradient"
          style={{ fontSize: 'clamp(4rem, 10vw, 6.5rem)', lineHeight: 0.88, letterSpacing: '-0.06em' }}
        >
          3+
        </div>
        <p className="text-[9px] font-body font-bold uppercase tracking-[0.42em] text-white/28 mt-3">
          Years of Combined Excellence
        </p>
      </div>

      {/* Badge chips around orbit */}
      <div className="absolute top-4 right-4">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="panel-blur flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-accent-500/25"
          style={{ background: 'rgba(56,217,169,0.08)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse flex-shrink-0" />
          <span className="text-[9px] font-body font-bold text-accent-400/80 uppercase tracking-[0.18em]">Live</span>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-4">
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="text-center"
        >
          <div className="text-[1.1rem] font-display font-bold text-gradient leading-none">98%</div>
          <p className="text-[7px] text-white/28 font-body font-bold uppercase tracking-[0.16em] mt-0.5">Satisfaction</p>
        </motion.div>
      </div>

      <div className="absolute bottom-4 right-4">
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          className="text-center"
        >
          <div className="text-[1.1rem] font-display font-bold text-gradient leading-none">50+</div>
          <p className="text-[7px] text-white/28 font-body font-bold uppercase tracking-[0.16em] mt-0.5">Clients</p>
        </motion.div>
      </div>
    </div>
  )
}

/* ─── Hero ─── */
export default function Hero() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const isMobile = window.matchMedia('(pointer: coarse)').matches

    const spot = el.querySelector('[data-spotlight]')
    const onMove = (e) => {
      if (!spot) return
      const r = el.getBoundingClientRect()
      gsap.to(spot, { x: e.clientX - r.left - 400, y: e.clientY - r.top - 400, duration: 1.6, ease: 'power2.out' })
    }
    const onTouchMove = (e) => {
      if (!spot) return
      const r = el.getBoundingClientRect()
      const t = e.touches[0]
      gsap.to(spot, { x: t.clientX - r.left - 400, y: t.clientY - r.top - 400, duration: 1.6, ease: 'power2.out' })
    }
    if (!isMobile) el.addEventListener('mousemove', onMove)
    el.addEventListener('touchmove', onTouchMove, { passive: true })

    if (isMobile) {
      return () => el.removeEventListener('touchmove', onTouchMove)
    }

    const ctx = gsap.context(() => {
      gsap.set('[data-hero-label]',     { opacity: 0, x: -30 })
      gsap.set('[data-hero-line]',      { yPercent: 115 })
      gsap.set('[data-hero-sub]',       { opacity: 0, y: 18 })
      gsap.set('[data-hero-desc]',      { opacity: 0, y: 18 })
      gsap.set('[data-hero-cta]',       { opacity: 0, y: 22, scale: 0.93 })
      gsap.set('[data-hero-stats]',     { opacity: 0, y: 24 })
      gsap.set('[data-hero-card]',      { opacity: 0, x: 80, rotateY: 15, scale: 0.95 })
      gsap.set('[data-hero-draw]',      { scaleX: 0, transformOrigin: 'left center' })
      gsap.set('[data-hero-bg]',        { opacity: 0 })
      gsap.set('[data-hero-ticker]',    { opacity: 0, y: 12 })
      gsap.set('[data-hero-ring]',      { scale: 0.6, opacity: 0 })
      gsap.set('[data-hero-scroll]',    { opacity: 0, y: -10 })
      gsap.set('[data-hero-orbital]',   { opacity: 0, scale: 0.85, rotateY: 12 })

      const tl = gsap.timeline({ delay: 0.15 })

      tl.to('[data-hero-label]',  { opacity: 1, x: 0,     duration: 1.2, ease: 'power3.out' })
      tl.to('[data-hero-draw]',   { scaleX: 1,            duration: 1.3, ease: 'power3.inOut' }, '-=0.8')
      tl.to('[data-hero-ring]',   { scale: 1, opacity: 1, duration: 1.6, ease: 'power3.out', stagger: 0.2 }, '-=1')

      el.querySelectorAll('[data-hero-line]').forEach((line, i) => {
        const word = line.querySelector('[data-word]')
        tl.to(line, {
          yPercent: 0, duration: 1.5, ease: 'power4.out',
          onStart: () => { if (word) scrambleWord(word, 0) },
        }, i === 0 ? '-=0.9' : '-=1.2')
      })

      tl.to('[data-hero-sub]',    { opacity: 1, y: 0,     duration: 1.2,   ease: 'power3.out' }, '-=1')
      tl.to('[data-hero-desc]',   { opacity: 1, y: 0,     duration: 1.2,   ease: 'power3.out' }, '-=1.0')
      tl.to('[data-hero-cta]',    { opacity: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.15, ease: 'back.out(1.4)' }, '-=0.9')
      tl.to('[data-hero-stats]',  { opacity: 1, y: 0,     duration: 1, stagger: 0.12, ease: 'power3.out' }, '-=0.8')
      tl.to('[data-hero-ticker]', { opacity: 1, y: 0,     duration: 1, ease: 'power3.out' }, '-=0.6')
      tl.to('[data-hero-scroll]', { opacity: 1, y: 0,     duration: 0.8, ease: 'power2.out' }, '-=0.4')
      tl.to('[data-hero-bg]',     { opacity: 1,           duration: 2.2, ease: 'power1.out' }, '-=2.4')
      tl.to('[data-hero-orbital]',{ opacity: 1, scale: 1, rotateY: 0, duration: 1.8, ease: 'power4.out', transformPerspective: 1000 }, '-=2.2')

      gsap.to('[data-hero-card]', {
        opacity: 1, x: 0, rotateY: 0, scale: 1,
        duration: 1.8, stagger: 0.15, delay: 0.8, ease: 'power4.out', transformPerspective: 1000,
      })

      /* scroll parallax */
      gsap.to('[data-hero-heading]', {
        y: -80, opacity: 0.15,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 2.5 },
      })
      gsap.to('[data-hero-right]', {
        y: -40,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 4 },
      })
      gsap.to('[data-hero-bg]', {
        y: -70, x: 25,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 7 },
      })
      gsap.to('[data-hero-ring]', {
        scale: 1.08,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 3 },
      })
    }, el)

    return () => {
      ctx.revert()
      if (!isMobile) el.removeEventListener('mousemove', onMove)
      el.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  const features = [
    { icon: Lightbulb, title: 'Advice & Guides', text: 'Step-by-step guidance from industry experts.', color: '#2a8bff', tag: 'Expert Insight' },
    { icon: Rocket,    title: 'Great Solutions', text: 'Practical fixes for daily bottlenecks, fast.', color: '#20c997', tag: 'Growth Focused' },
    { icon: Zap,       title: 'Fast Execution',  text: 'We treat your deadlines as commitments.', color: '#f59e0b', tag: 'Speed & Quality' },
  ]

  const tickerItems = [
    'Delegate to Dominate', 'Virtual Assistance', 'Premium Support',
    'Business Growth', 'Clear Communication', 'Operational Excellence',
  ]

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-start overflow-hidden"
    >
      {/* Neural canvas */}
      <NeuralCanvas />

      {/* Mouse spotlight */}
      <div
        data-spotlight
        className="pointer-events-none absolute z-[2]"
        style={{
          width: 800, height: 800, top: 0, left: 0, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(42,139,255,0.06) 0%, transparent 65%)',
          willChange: 'transform',
        }}
      />

      {/* Pulsing rings */}
      {[600, 900, 1220].map((sz, i) => (
        <div
          key={sz}
          data-hero-ring
          className="absolute pointer-events-none"
          style={{
            width: sz, height: sz,
            borderRadius: '50%',
            border: `1px solid rgba(42,139,255,${0.05 - i * 0.012})`,
            top: '46%', left: '32%',
            transform: 'translate(-50%, -50%)',
            animation: `hero-ring-pulse 6s ease-in-out ${i * 2}s infinite`,
            zIndex: 1,
          }}
        />
      ))}

      {/* BG oversized text */}
      <div
        data-hero-bg
        className="absolute pointer-events-none select-none"
        style={{ right: '-3%', top: '8%', zIndex: 1, opacity: 0 }}
      >
        <span
          className="font-display font-bold"
          style={{
            fontSize: 'clamp(10rem, 20vw, 23rem)',
            color: 'rgba(42,139,255,0.018)',
            lineHeight: 1, letterSpacing: '-0.05em',
          }}
        >
          VA
        </span>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-950/20 to-navy-950 z-[2] pointer-events-none" />

      {/* Glow orbs */}
      <div className="hero-glow-orb absolute top-[-15%] left-[10%]  w-[280px] h-[280px] md:w-[550px] md:h-[550px] lg:w-[800px] lg:h-[800px] bg-brand-500/7  rounded-full blur-[70px] md:blur-[130px] lg:blur-[200px] z-[1] pointer-events-none animate-float-slow" />
      <div className="hero-glow-orb absolute bottom-[0%]  right-[-6%] w-[200px] h-[200px] md:w-[360px] md:h-[360px] lg:w-[520px] lg:h-[520px] bg-accent-500/6 rounded-full blur-[50px] md:blur-[100px] lg:blur-[160px] z-[1] pointer-events-none hero-glow-orb-float" />
      <div className="hero-glow-orb absolute top-[30%]   left-[-6%]  w-[160px] h-[160px] md:w-[250px] md:h-[250px] lg:w-[360px] lg:h-[360px] bg-brand-700/5  rounded-full blur-[40px] md:blur-[70px] lg:blur-[120px] z-[1] pointer-events-none" />

      {/* Grain */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.02,
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(42,139,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(42,139,255,0.022) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Vertical accent lines */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {[34, 42].map((pct, i) => (
          <div key={i} className="absolute top-0 bottom-0"
            style={{
              right: `${pct}%`,
              width: '1px',
              background: `linear-gradient(180deg, transparent, rgba(42,139,255,${0.065 - i * 0.03}) 25%, rgba(42,139,255,${0.065 - i * 0.03}) 75%, transparent)`,
            }}
          />
        ))}
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <Container className="relative z-10 pt-8 pb-12 lg:pt-10 lg:pb-14 w-full">
        <div className="grid lg:grid-cols-12 gap-14 lg:gap-10 items-start">

          {/* LEFT */}
          <div className="lg:col-span-7" data-hero-heading>

            {/* Label */}
            <div data-hero-label className="flex items-center gap-2 sm:gap-4 mb-7 sm:mb-9">
              <span className="section-label">
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse flex-shrink-0" />
                Talk To An Expert
              </span>
              <div data-hero-draw className="h-px max-w-[80px] flex-1"
                style={{ background: 'linear-gradient(90deg, rgba(42,139,255,0.55), transparent)' }} />
              <a href="tel:+19046686362"
                className="hidden sm:block text-white/20 text-[11px] font-body font-semibold tracking-[0.18em] hover:text-white/55 transition-colors duration-300">
                (904) 668-6362
              </a>
            </div>

            {/* Giant heading */}
            <div className="mb-7">
              <h1 className="font-display font-bold tracking-[-0.045em]">
                <div className="gsap-line-clip" style={{ lineHeight: 1.0, paddingBottom: '0.05em' }}>
                  <span data-hero-line className="block text-[2.5rem] sm:text-5xl lg:text-[5.5rem] xl:text-[7.5rem]" style={{ color: '#f1f5f9' }}>
                    <span data-word><ScrambleWord text="Dedicated" /></span>
                  </span>
                </div>
                <div className="gsap-line-clip" style={{ lineHeight: 1.0, paddingBottom: '0.05em' }}>
                  <span data-hero-line className="block text-[2.5rem] sm:text-5xl lg:text-[5.5rem] xl:text-[7.5rem]" style={{ color: 'rgba(241,245,249,0.68)' }}>
                    <span data-word><ScrambleWord text="Virtual" /></span>
                  </span>
                </div>
                <div className="gsap-line-clip" style={{ lineHeight: 1.0, paddingBottom: '0.05em' }}>
                  <span data-hero-line className="block text-[2.5rem] sm:text-5xl lg:text-[5.5rem] xl:text-[7.5rem] text-gradient">
                    <span data-word><ScrambleWord text="Assistance." /></span>
                  </span>
                </div>
              </h1>
            </div>

            {/* Sub-divider */}
            <div data-hero-sub className="flex items-center gap-5 mb-8">
              <div className="h-px w-16 flex-shrink-0 bg-gradient-to-r from-brand-500/55 to-transparent" />
              <p className="text-white/28 text-[11px] font-body font-bold tracking-[0.3em] uppercase">Defining Success</p>
              <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
            </div>

            {/* Description */}
            <p data-hero-desc className="text-[16px] sm:text-[17px] text-white/40 leading-[1.9] max-w-lg mb-9 font-body">
              Focus on what truly matters while we handle the rest. BizBackerz offers
              dedicated virtual support — from admin to client follow-up — keeping your
              operations running with precision and care.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <div data-hero-cta>
                <Button size="lg" href="/booking" data-cursor-label="BOOK">
                  Hire Now! <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div data-hero-cta>
                <Button variant="secondary" size="lg" href="/booking" data-cursor-label="BOOK">
                  Book Schedule Now
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="pt-6 border-t border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                {[
                  { end: 3,   suffix: '+', label: 'Years Experience' },
                  { end: 500, suffix: '+', label: 'Tasks Completed' },
                  { end: 98,  suffix: '%', label: 'Satisfaction Rate' },
                ].map((s) => (
                  <div key={s.label} data-hero-stats>
                    <div className="font-display font-bold text-[2.1rem] leading-none text-gradient-animated">
                      <CountUp end={s.end} suffix={s.suffix} />
                    </div>
                    <p className="text-[10px] text-white/25 font-body font-bold uppercase tracking-[0.22em] mt-1.5">{s.label}</p>
                  </div>
                ))}

                <div data-hero-stats className="ml-auto flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/18 to-accent-500/18 flex items-center justify-center border border-white/8 glow-sm">
                      <Award className="w-5 h-5 text-brand-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-500 border-2 border-navy-950 flex items-center justify-center">
                      <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#030912" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 font-body font-bold uppercase tracking-[0.18em]">Verified & Trusted</p>
                    <p className="text-[12px] text-white/45 font-body mt-0.5">By 50+ businesses</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Infinite ticker */}
            <div data-hero-ticker className="mt-8 overflow-hidden relative">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-500/20 to-transparent mb-4" />
              <div className="flex items-center gap-0" style={{ animation: 'marquee 22s linear infinite' }}>
                {[...tickerItems, ...tickerItems].map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-4 px-5 flex-shrink-0">
                    <span className="text-[10px] font-body font-bold uppercase tracking-[0.25em] text-white/18 whitespace-nowrap">{item}</span>
                    <span style={{ color: '#38d9a9', fontSize: 8 }}>◆</span>
                  </span>
                ))}
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-500/20 to-transparent mt-4" />
            </div>
          </div>

          {/* RIGHT — 3D Orbital Animation + Feature Cards */}
          <div className="lg:col-span-5" data-hero-right>

            <div data-hero-card className="flex items-center justify-between mb-5">
              <p className="section-label">Expert Team</p>
              <span className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-white/18">Est. 2024</span>
            </div>

            {/* ─── Orbital 3D Animation ─── */}
            <div
              data-hero-orbital
              className="panel-blur relative rounded-3xl overflow-hidden mb-5 border border-white/[0.07]"
              style={{ background: 'rgba(6,15,29,0.55)' }}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(42,139,255,0.45), transparent)' }} />
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage: 'linear-gradient(rgba(42,139,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(42,139,255,0.1) 1px,transparent 1px)',
                  backgroundSize: '32px 32px',
                  pointerEvents: 'none',
                }} />
              <OrbitalVisual />
            </div>

            {/* Feature cards — compact below orbital */}
            <div className="space-y-2.5">
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  data-hero-card
                  whileHover={{ y: -2, scale: 1.008 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                  className="group glass card-glow rounded-xl p-4 cursor-default relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${f.color}1e, transparent 65%)` }}
                  />
                  <div
                    className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `linear-gradient(180deg, transparent, ${f.color}70, transparent)` }}
                  />
                  <div className="flex items-center gap-3 relative z-10">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${f.color}26, ${f.color}08)`,
                        border: `1px solid ${f.color}25`,
                        boxShadow: `0 4px 16px ${f.color}14`,
                      }}
                    >
                      <f.icon className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" style={{ color: f.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-white text-[13px] leading-snug">{f.title}</h3>
                      <p className="text-[11px] text-white/38 mt-0.5 leading-snug font-body">{f.text}</p>
                      <span className="inline-block text-[9px] font-body font-bold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded-full mt-1"
                        style={{ color: f.color, background: `${f.color}12`, border: `1px solid ${f.color}20` }}>
                        {f.tag}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social proof */}
            <motion.div
              data-hero-card
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="mt-3 flex items-center gap-4 px-4 py-3 rounded-2xl cursor-default"
              style={{ background: 'rgba(42,139,255,0.045)', border: '1px solid rgba(42,139,255,0.09)' }}
            >
              <div className="flex -space-x-2 flex-shrink-0">
                {['O','M','S','A'].map((l, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-navy-950 flex items-center justify-center text-[9px] font-bold font-display"
                    style={{
                      background: `linear-gradient(135deg, ${['#2a8bff','#20c997','#f59e0b','#8b5cf6'][i]}35, ${['#2a8bff','#20c997','#f59e0b','#8b5cf6'][i]}15)`,
                      color: ['#2a8bff','#20c997','#f59e0b','#8b5cf6'][i],
                    }}>{l}</div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" style={{ color: '#f59e0b' }} />)}
                </div>
                <p className="text-[11px] text-white/30 font-body">Trusted by 50+ business owners</p>
              </div>
            </motion.div>

            {/* Scroll cue */}
            <div data-hero-scroll className="hidden lg:flex flex-col items-center gap-1.5 mt-8 opacity-0">
              <p className="text-[9px] font-body font-bold uppercase tracking-[0.28em] text-white/20">Scroll</p>
              <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-float" />
              <ChevronDown className="w-3 h-3 text-white/15" />
            </div>
          </div>

        </div>
      </Container>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-navy-950 to-transparent z-[3] pointer-events-none" />
    </section>
  )
}
