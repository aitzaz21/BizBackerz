import React, { Suspense, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import Container from '../ui/Container'
import Button from '../ui/Button'
import AboutBackground from './AboutBackground'
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  Layers,
  MessageCircle,
  Orbit,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserCog,
  Users,
} from 'lucide-react'

/* ── CountUp ── */
function CountUp({ end, duration = 2, suffix = '' }) {
  const ref = useRef(null)
  const hasRun = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true
        const obj = { val: 0 }
        gsap.to(obj, {
          val: end, duration, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val) + suffix },
        })
      }
    }, { threshold: 0.4 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration, suffix])
  return <span ref={ref}>0{suffix}</span>
}

/* ── Feature Card ── */
function FeatureCard({ icon: Icon, eyebrow, title, text, color = '#2a8bff', className = '', dataAttr }) {
  return (
    <div
      {...(dataAttr ? { [dataAttr]: '' } : {})}
      className={`group glass card-glow relative overflow-hidden rounded-2xl p-6 cursor-default ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${color}12, transparent 40%, rgba(56,217,169,0.08))` }}
      />
      <div className="relative z-10">
        <div className="mb-4 flex items-start gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 transition-all duration-500 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${color}22, ${color}08)`,
              border: `1px solid ${color}22`,
              boxShadow: `0 4px 20px ${color}12`,
            }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-[11px] font-body font-bold uppercase tracking-[0.22em] text-white/24">{eyebrow}</p>
              <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-white/12 group-hover:text-white/45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            </div>
            <h3 className="mb-2 font-display font-semibold text-white text-[15px] leading-snug">{title}</h3>
            <p className="text-[13px] text-white/32 leading-relaxed font-body">{text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const pageRef = useRef(null)
  const [showCanvas, setShowCanvas] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const media = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)')
    const syncCanvas = () => setShowCanvas(media.matches)
    syncCanvas()
    media.addEventListener('change', syncCanvas)
    return () => media.removeEventListener('change', syncCanvas)
  }, [])

  useEffect(() => {
    const el = pageRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      /* ── Initial states ── */
      gsap.set('[data-hero-kicker]',         { opacity: 0, y: 18 })
      gsap.set('[data-hero-line]',           { yPercent: 110 })
      gsap.set('[data-hero-body]',           { opacity: 0, y: 24 })
      gsap.set('[data-hero-board]',          { opacity: 0, y: 34, scale: 0.98, filter: 'blur(10px)' })
      gsap.set('[data-story-shell]',         { opacity: 0, y: 40 })
      gsap.set('[data-chapter]',             { opacity: 0, x: 60, y: 28, rotateZ: 1.4, rotateX: -10, scale: 0.94, filter: 'blur(8px)' })
      gsap.set('[data-manifesto-line]',      { scaleY: 0, transformOrigin: 'top center' })
      gsap.set('[data-manifesto-quote]',     { opacity: 0, y: 50 })
      gsap.set('[data-manifesto-attr]',      { opacity: 0 })
      gsap.set('[data-stat-card]',           { opacity: 0, y: 54, scale: 0.9, rotateX: -12, filter: 'blur(12px)' })
      gsap.set('[data-metric-card]',         { opacity: 0, y: 54, scale: 0.9, rotateX: -12, filter: 'blur(12px)' })
      gsap.set('[data-values-heading]',      { opacity: 0, y: 28 })
      gsap.set('[data-value-card]',          { opacity: 0, y: 44, scale: 0.92, filter: 'blur(8px)' })
      gsap.set('[data-principle-heading]',   { opacity: 0, y: 28 })
      gsap.set('[data-principle]',           { opacity: 0, y: 54, scale: 0.9, rotateX: -12, filter: 'blur(12px)' })
      gsap.set('[data-proof-heading]',       { opacity: 0, y: 28 })
      gsap.set('[data-quote-card]',          { opacity: 0, y: 54, scale: 0.9, rotateX: -10, filter: 'blur(12px)' })
      gsap.set('[data-final-cta]',           { opacity: 0, y: 46, scale: 0.9, rotateX: -10, filter: 'blur(10px)' })
      gsap.set('[data-big-number]',          { opacity: 0 })

      /* ── Hero entrance ── */
      const heroTl = gsap.timeline({ delay: 0.15 })
      heroTl
        .to('[data-hero-kicker]', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
        .to('[data-hero-line]',   { yPercent: 0, duration: 1.35, stagger: 0.12, ease: 'power4.out' }, '-=0.2')
        .to('[data-hero-body]',   { opacity: 1, y: 0, duration: 0.85, stagger: 0.12, ease: 'power2.out' }, '-=0.72')
        .to('[data-hero-board]',  { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' }, '-=0.45')
        .to('[data-big-number]',  { opacity: 1, duration: 2, ease: 'power1.out' }, '-=1.6')

      /* ── Hero parallax ── */
      gsap.to('[data-hero-panel]', {
        y: -80,
        scrollTrigger: { trigger: '[data-hero-section]', start: 'top top', end: 'bottom top', scrub: 2.2 },
      })
      gsap.to('[data-hero-art]', {
        y: -35,
        scrollTrigger: { trigger: '[data-hero-section]', start: 'top top', end: 'bottom top', scrub: 3.2 },
      })

      /* ── Story shell ── */
      gsap.to('[data-story-shell]', {
        opacity: 1, y: 0, duration: 1.05, ease: 'power2.out',
        scrollTrigger: { trigger: '[data-story-section]', start: 'top 78%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Chapters ── */
      gsap.utils.toArray('[data-chapter]').forEach((item, index) => {
        gsap.to(item, {
          keyframes: [
            { opacity: 1, x: 0, y: 0, rotateZ: 0, rotateX: 0, scale: 1.035, filter: 'blur(0px)', duration: 0.82, ease: 'power4.out' },
            { scale: 1, duration: 0.34, ease: 'back.out(1.8)' },
          ],
          scrollTrigger: { trigger: item, start: 'top 84%', toggleActions: 'play reverse play reverse' },
          delay: index * 0.06,
        })
      })

      /* ── Manifesto ── */
      gsap.to('[data-manifesto-line]', {
        scaleY: 1, duration: 1.2, ease: 'power3.inOut',
        scrollTrigger: { trigger: '[data-manifesto-section]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })
      gsap.to('[data-manifesto-quote]', {
        opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: '[data-manifesto-section]', start: 'top 75%', toggleActions: 'play reverse play reverse' },
      })
      gsap.to('[data-manifesto-attr]', {
        opacity: 1, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: '[data-manifesto-section]', start: 'top 68%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Stat cards ── */
      gsap.to('[data-stat-card]', {
        keyframes: [
          { opacity: 1, y: -8, scale: 1.03, rotateX: 0, filter: 'blur(0px)', duration: 0.82, ease: 'power4.out' },
          { y: 0, scale: 1, duration: 0.32, ease: 'back.out(2)' },
        ],
        stagger: 0.09,
        scrollTrigger: { trigger: '[data-stats-section]', start: 'top 80%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Metric cards ── */
      gsap.to('[data-metric-card]', {
        keyframes: [
          { opacity: 1, y: -10, scale: 1.04, rotateX: 0, filter: 'blur(0px)', duration: 0.88, ease: 'power4.out' },
          { y: 0, scale: 1, duration: 0.34, ease: 'back.out(2)' },
        ],
        stagger: 0.1,
        scrollTrigger: { trigger: '[data-metrics-section]', start: 'top 80%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Values ── */
      gsap.to('[data-values-heading]', {
        opacity: 1, y: 0, duration: 0.95, ease: 'power2.out',
        scrollTrigger: { trigger: '[data-values-section]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })
      gsap.to('[data-value-card]', {
        keyframes: [
          { opacity: 1, y: -6, scale: 1.02, filter: 'blur(0px)', duration: 0.78, ease: 'power4.out' },
          { y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' },
        ],
        stagger: 0.08,
        scrollTrigger: { trigger: '[data-values-grid]', start: 'top 84%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Principles ── */
      gsap.to('[data-principle-heading]', {
        opacity: 1, y: 0, duration: 0.95, ease: 'power2.out',
        scrollTrigger: { trigger: '[data-principles-section]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })
      gsap.to('[data-principle]', {
        keyframes: [
          { opacity: 1, y: -12, scale: 1.04, rotateX: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power4.out' },
          { y: 0, scale: 1, duration: 0.34, ease: 'back.out(2)' },
        ],
        stagger: 0.12,
        scrollTrigger: { trigger: '[data-principles-grid]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Proof ── */
      gsap.to('[data-proof-heading]', {
        opacity: 1, y: 0, duration: 0.95, ease: 'power2.out',
        scrollTrigger: { trigger: '[data-proof-section]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })
      gsap.to('[data-quote-card]', {
        keyframes: [
          { opacity: 1, y: -12, scale: 1.04, rotateX: 0, filter: 'blur(0px)', duration: 0.88, ease: 'power4.out' },
          { y: 0, scale: 1, duration: 0.36, ease: 'back.out(2.1)' },
        ],
        stagger: 0.1,
        scrollTrigger: { trigger: '[data-proof-grid]', start: 'top 84%', toggleActions: 'play reverse play reverse' },
      })
      gsap.to('[data-final-cta]', {
        keyframes: [
          { opacity: 1, y: -10, scale: 1.03, rotateX: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power4.out' },
          { y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' },
        ],
        scrollTrigger: { trigger: '[data-proof-section]', start: 'top 72%', toggleActions: 'play reverse play reverse' },
      })
    }, el)

    return () => ctx.revert()
  }, [])

  const chapters = [
    {
      number: '01',
      title: 'We run behind-the-scenes work with front-row discipline.',
      text: 'Administrative execution, communication, and follow-through are treated as client-facing quality, not invisible support work.',
      color: '#2a8bff',
    },
    {
      number: '02',
      title: 'We build operating rhythm, not just task completion.',
      text: 'The value is in consistency: clear updates, predictable output, and systems that keep momentum even when your day gets crowded.',
      color: '#20c997',
    },
    {
      number: '03',
      title: 'We make growth feel lighter, not louder.',
      text: 'Our best work gives founders more calm, more control, and more room to focus on revenue, leadership, and the bigger picture.',
      color: '#f59e0b',
    },
  ]

  const values = [
    {
      icon: Target,
      title: 'Precision',
      text: 'Every task delivered as if it\'s client-facing. No cut corners, no half-measures.',
      color: '#2a8bff',
    },
    {
      icon: ShieldCheck,
      title: 'Reliability',
      text: 'Consistent output, clear updates, no surprises. You always know where things stand.',
      color: '#20c997',
    },
    {
      icon: TrendingUp,
      title: 'Growth',
      text: 'We scale with your business. Our support evolves as your needs evolve.',
      color: '#f59e0b',
    },
    {
      icon: Eye,
      title: 'Transparency',
      text: 'No hidden processes, no guesswork. Open communication at every step.',
      color: '#8b5cf6',
    },
  ]

  const principles = [
    {
      icon: MessageCircle,
      eyebrow: '01',
      title: 'Clear Communication',
      text: 'Fast responses, clean updates, and zero ambiguity around ownership or next steps.',
      color: '#2a8bff',
    },
    {
      icon: UserCog,
      eyebrow: '02',
      title: 'Tailored Support',
      text: 'We shape workflows around how your business actually runs instead of forcing generic templates.',
      color: '#20c997',
    },
  ]

  const proofCards = [
    {
      icon: ShieldCheck,
      eyebrow: 'Client Proof',
      title: 'Responsive enough to protect momentum.',
      text: 'Clients consistently highlight proactive follow-up, fast updates, and the feeling that nothing is being dropped.',
      color: '#2a8bff',
    },
    {
      icon: Orbit,
      eyebrow: 'Client Proof',
      title: 'Structured enough to feel premium.',
      text: 'The value is not just getting tasks done. It is the calmer, more reliable operating rhythm that founders feel around the work.',
      color: '#20c997',
    },
  ]

  return (
    <div ref={pageRef} className="about-page-shell relative overflow-hidden bg-navy-950">

      {/* ── Global background layer ── */}
      <div className="pointer-events-none absolute inset-0">
        {showCanvas && (
          <div className="absolute inset-0 opacity-70">
            <Canvas
              camera={{ position: [0, 0, 12], fov: 54 }}
              dpr={1}
              frameloop="always"
              gl={{ antialias: false, alpha: true, powerPreference: 'default', stencil: false }}
              style={{ background: 'transparent' }}
            >
              <Suspense fallback={null}>
                <AboutBackground />
              </Suspense>
            </Canvas>
          </div>
        )}
        <div className="about-ambient-blob absolute -left-24 top-0 h-[38rem] w-[38rem] rounded-full blur-[140px]" style={{ background: 'rgba(42,139,255,0.14)' }} />
        <div className="about-ambient-blob absolute right-[-8rem] top-[16rem] h-[34rem] w-[34rem] rounded-full blur-[150px]" style={{ background: 'rgba(56,217,169,0.12)' }} />
        <div className="about-ambient-blob absolute bottom-[10rem] left-[20%] h-[24rem] w-[24rem] rounded-full blur-[130px]" style={{ background: 'rgba(82,173,255,0.10)' }} />
        <div
          className="absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage: 'linear-gradient(rgba(42,139,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(42,139,255,0.04) 1px, transparent 1px)',
            backgroundSize: '88px 88px',
            maskImage: 'linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)',
          }}
        />
        <div className="about-radial-sweep absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-950/18 to-navy-950/90" />
      </div>

      <div className="relative z-10">

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section data-hero-section className="relative overflow-hidden pb-16 pt-8 sm:pb-20 sm:pt-10 lg:min-h-screen lg:pt-12">

          {/* Decorative big background number */}
          <div
            data-big-number
            className="absolute right-[-4%] top-[10%] select-none pointer-events-none"
            style={{ opacity: 0 }}
          >
            <span
              className="font-display font-bold"
              style={{
                fontSize: 'clamp(10rem, 18vw, 22rem)',
                color: 'rgba(42,139,255,0.016)',
                lineHeight: 1,
                letterSpacing: '-0.05em',
              }}
            >
              20+
            </span>
          </div>

          <Container>
            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7" data-hero-panel>
                <div data-hero-kicker className="mb-7 flex flex-wrap items-center gap-5">
                  <span className="section-label">
                    <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse flex-shrink-0" />
                    About BizBackerz
                  </span>
                  <span className="text-[11px] font-body font-bold uppercase tracking-[0.22em] text-white/22">
                    Distinct by design
                  </span>
                </div>

                <div className="mb-8 sm:mb-10">
                  <h1 className="font-display font-bold tracking-[-0.045em] text-white">
                    <div style={{ overflow: 'hidden', lineHeight: 0.96, paddingBottom: '0.08em' }}>
                      <span data-hero-line className="block text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[7.5rem]">
                        20+ Years
                      </span>
                    </div>
                    <div style={{ overflow: 'hidden', lineHeight: 0.96, paddingBottom: '0.08em' }}>
                      <span data-hero-line className="block text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[7.5rem] text-white/66">
                        of Combined
                      </span>
                    </div>
                    <div style={{ overflow: 'hidden', lineHeight: 0.96, paddingBottom: '0.08em' }}>
                      <span data-hero-line className="text-gradient block text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[7.5rem]">
                        Operational Taste.
                      </span>
                    </div>
                  </h1>
                </div>

                <p data-hero-body className="mb-5 max-w-2xl text-[16px] leading-[1.95] text-white/42 sm:text-[17px]">
                  BizBackerz was built on a simple belief — that world-class execution
                  shouldn't be reserved for Fortune 500 companies. We bring the same
                  discipline, clarity, and responsiveness to growing businesses that want
                  to feel and operate like industry leaders.
                </p>
                <p data-hero-body className="mb-9 max-w-xl text-[15px] leading-[1.9] text-white/30 sm:text-[16px]">
                  We support founders with the kind of structure, responsiveness, and
                  client judgment that usually comes only after years of hard operational work.
                </p>

                <div data-hero-body className="flex flex-wrap items-center gap-4">
                  <Button size="lg" href="/contact">
                    Start a Conversation <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="glass card-glow flex items-center gap-3 rounded-2xl px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(42,139,255,0.12)' }}>
                      <Sparkles className="h-4 w-4" style={{ color: '#38d9a9' }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-body font-bold uppercase tracking-[0.22em] text-white/25">Positioning</p>
                      <p className="text-sm text-white/52">Premium support with a different rhythm.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5" data-hero-art>
                <div
                  data-hero-board
                  className="glass card-glow relative overflow-hidden rounded-3xl p-6 sm:p-7 lg:mt-8"
                  style={{
                    background: 'linear-gradient(180deg, rgba(18,28,43,0.92) 0%, rgba(6,12,20,0.90) 100%)',
                    boxShadow: '0 30px 90px rgba(0,0,0,0.28)',
                  }}
                >
                  <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at top right, rgba(42,139,255,0.22), transparent 30%)' }} />
                  <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full border border-white/8" />
                  <div className="pointer-events-none absolute -right-8 top-16 h-32 w-32 rounded-full border border-white/8" />

                  <div className="relative z-10 mb-10">
                    <p className="mb-3 text-[11px] font-body font-bold uppercase tracking-[0.24em] text-white/26">Editorial brief</p>
                    <div className="max-w-sm font-display text-xl font-semibold leading-[1.08] text-white sm:text-[1.7rem]">
                      Built to feel like a <span className="text-gradient">signature page</span>, not a duplicate section.
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: 'Combined Experience', value: '20+', detail: 'years shaping client workflows and execution standards' },
                      { label: 'Founder Relief',      value: 'Daily', detail: 'support that removes friction from operations and follow-up' },
                    ].map((item) => (
                      <div key={item.label} className="glass-light rounded-2xl p-4">
                        <p className="mb-2 text-[11px] font-body font-bold uppercase tracking-[0.22em] text-white/22">{item.label}</p>
                        <div className="mb-2 font-display text-2xl font-bold text-white">{item.value}</div>
                        <p className="text-sm leading-[1.7] text-white/38">{item.detail}</p>
                      </div>
                    ))}
                  </div>

                  {/* Star rating */}
                  <div className="mt-5 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" style={{ color: '#f59e0b' }} />
                      ))}
                    </div>
                    <p className="text-[12px] text-white/35 font-body">Rated 5/5 by business owners</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2" style={{ opacity: 0.25 }}>
            <span className="text-[9px] font-body font-bold uppercase tracking-[0.28em] text-white">Explore</span>
            <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent animate-float" />
          </div>
        </section>

        {/* ══════════════════════════════════════
            MARQUEE
        ══════════════════════════════════════ */}
        <section className="relative overflow-hidden border-y border-white/[0.05] bg-black/10 py-4">
          <div className="marquee-track">
            {[...Array(2)].flatMap((_, repeat) => (
              ['20+ Years Combined Experience', 'Premium Virtual Operations', 'Clear Communication', 'Founder-Focused Support', 'Operational Discipline', 'Client Experience First'].map((item) => (
                <div key={`${repeat}-${item}`} className="mx-6 flex items-center gap-6">
                  <span className="text-[11px] font-body font-bold uppercase tracking-[0.28em] text-white/22">{item}</span>
                  <span style={{ color: '#38d9a9' }}>◆</span>
                </div>
              ))
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════
            MANIFESTO
        ══════════════════════════════════════ */}
        <section data-manifesto-section className="relative py-20 sm:py-28 overflow-hidden">
          {/* Horizontal rules */}
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/12 to-transparent" />
          <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/12 to-transparent" />

          <Container>
            <div className="relative flex flex-col items-center text-center max-w-5xl mx-auto">

              {/* Top vertical line */}
              <div data-manifesto-line className="w-px h-14 mb-10" style={{ background: 'linear-gradient(180deg, transparent, rgba(42,139,255,0.45))' }} />

              {/* Decorative quote mark */}
              <div
                className="absolute -top-6 left-1/2 -translate-x-1/2 select-none pointer-events-none font-display font-bold leading-none"
                style={{ fontSize: '14rem', color: 'rgba(42,139,255,0.04)', lineHeight: 1 }}
              >
                "
              </div>

              <blockquote data-manifesto-quote>
                <p className="font-display font-bold tracking-[-0.04em] text-white leading-[1.02]" style={{ fontSize: 'clamp(2rem, 5vw, 4.2rem)' }}>
                  We don't just manage tasks.
                </p>
                <p className="font-display font-bold tracking-[-0.04em] text-gradient leading-[1.02] mt-2" style={{ fontSize: 'clamp(2rem, 5vw, 4.2rem)' }}>
                  We protect your momentum.
                </p>
              </blockquote>

              <div data-manifesto-attr className="mt-8 flex items-center gap-5">
                <div className="h-px w-14 bg-gradient-to-r from-transparent to-brand-500/40" />
                <p className="text-[11px] font-body font-bold uppercase tracking-[0.28em] text-white/25">
                  The BizBackerz Standard
                </p>
                <div className="h-px w-14 bg-gradient-to-l from-transparent to-brand-500/40" />
              </div>

              {/* Bottom vertical line */}
              <div data-manifesto-line className="w-px h-14 mt-10" style={{ background: 'linear-gradient(180deg, rgba(42,139,255,0.45), transparent)' }} />
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            STORY / CHAPTERS
        ══════════════════════════════════════ */}
        <section data-story-section className="relative py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-4" data-story-shell>
                <div className="lg:sticky lg:top-28">
                  <div className="mb-5">
                    <span className="section-label">The Story</span>
                  </div>
                  <h2 className="mb-5 max-w-sm text-3xl font-display font-bold leading-[1.04] text-white sm:text-4xl">
                    We treat support work like brand work.
                  </h2>
                  <p className="max-w-sm text-[15px] leading-[1.9] text-white/38">
                    That is what makes the service feel different. The invisible systems
                    still carry visible standards.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="space-y-5">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.number}
                      data-chapter
                      className="group glass card-glow relative overflow-hidden rounded-3xl p-7 sm:p-8 lg:p-10"
                    >
                      <div
                        className="pointer-events-none absolute inset-y-0 left-0 w-1"
                        style={{ background: `linear-gradient(180deg, ${chapter.color}cc, transparent)` }}
                      />
                      <div className="grid gap-6 sm:grid-cols-[110px,1fr] sm:gap-8">
                        <div>
                          <div
                            className="mb-4 inline-flex rounded-full border px-4 py-2 text-[11px] font-body font-bold uppercase tracking-[0.24em]"
                            style={{
                              borderColor: `${chapter.color}28`,
                              color: chapter.color,
                              background: `${chapter.color}0c`,
                            }}
                          >
                            Chapter {chapter.number}
                          </div>
                          <div
                            className="font-display text-6xl font-semibold leading-none"
                            style={{ color: `${chapter.color}18` }}
                          >
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <h3 className="mb-3 max-w-xl text-xl font-display font-semibold leading-[1.1] text-white sm:text-2xl">
                            {chapter.title}
                          </h3>
                          <p className="mb-6 max-w-2xl text-[15px] leading-[1.9] text-white/40">{chapter.text}</p>
                          <div className="flex items-center gap-2 text-[11px] font-body font-bold uppercase tracking-[0.22em] text-white/24">
                            Read the standard
                            <ChevronRight className="h-4 w-4" style={{ color: chapter.color }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            BY THE NUMBERS — Animated Stats
        ══════════════════════════════════════ */}
        <section data-stats-section className="relative py-16 sm:py-20">
          <Container>
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <span className="section-label mb-4 inline-flex justify-center">By The Numbers</span>
              <h2 className="text-3xl font-display font-bold leading-[1.04] text-white sm:text-4xl mt-4">
                Numbers that tell the story before we do.
              </h2>
            </div>

            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[
                { end: 20,  suffix: '+', label: 'Years Combined\nExperience',  color: '#2a8bff' },
                { end: 500, suffix: '+', label: 'Tasks\nCompleted',            color: '#20c997' },
                { end: 50,  suffix: '+', label: 'Satisfied\nClients',          color: '#f59e0b' },
                { end: 98,  suffix: '%', label: 'Client\nRetention Rate',      color: '#8b5cf6' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  data-stat-card
                  className="glass card-glow rounded-2xl p-6 text-center group hover:scale-[1.02] transition-transform duration-300"
                >
                  <div
                    className="font-display font-bold text-[3.2rem] sm:text-[3.8rem] leading-none mb-3"
                    style={{ color: stat.color }}
                  >
                    <CountUp end={stat.end} suffix={stat.suffix} duration={2.2} />
                  </div>
                  <p
                    className="text-[11px] text-white/28 font-body font-bold uppercase tracking-[0.18em] leading-[1.8]"
                    style={{ whiteSpace: 'pre-line' }}
                  >
                    {stat.label}
                  </p>
                  {/* Bottom accent line */}
                  <div
                    className="mt-4 h-px w-10 mx-auto rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: stat.color }}
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            EXPERIENCE ARCHITECTURE
        ══════════════════════════════════════ */}
        <section data-metrics-section className="relative py-16 sm:py-20">
          <Container>
            <div className="glass card-glow mb-8 rounded-[2rem] p-8 sm:p-10 lg:p-12 overflow-hidden relative">
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at top left, rgba(42,139,255,0.1), transparent 50%)' }}
              />
              <div className="grid items-end gap-8 lg:grid-cols-12 relative z-10">
                <div className="lg:col-span-7">
                  <div className="mb-4">
                    <span className="section-label">Experience Architecture</span>
                  </div>
                  <div className="font-display text-[4.2rem] font-semibold leading-none text-white/8 sm:text-[5.8rem] lg:text-[8rem]">
                    20+
                  </div>
                  <h2 className="mt-3 max-w-2xl text-3xl font-display font-bold leading-[1.04] text-white sm:text-4xl">
                    Years of combined experience shaping how support should feel.
                  </h2>
                </div>
                <div className="lg:col-span-5">
                  <p className="max-w-md text-[15px] leading-[1.9] text-white/38">
                    The point is not age for its own sake. It is judgment: what to
                    prioritize, how to communicate, how to stay calm under client pressure,
                    and how to make execution feel premium every single time.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FeatureCard
                dataAttr="data-metric-card"
                icon={Clock}
                eyebrow="20+ Years"
                title="Operational intuition shaped by long-term client work."
                text="Experience shows up in prioritization, communication, and calmer execution under pressure."
                color="#2a8bff"
              />
              <FeatureCard
                dataAttr="data-metric-card"
                icon={Users}
                eyebrow="Trusted Support"
                title="Dependable help that gives founders more room to focus."
                text="Less time stuck in follow-up, admin, and coordination means more time for revenue and leadership."
                color="#20c997"
              />
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            WHAT WE STAND FOR — Values
        ══════════════════════════════════════ */}
        <section data-values-section className="relative py-16 sm:py-20">
          <Container>
            <div data-values-heading className="mb-10 max-w-2xl">
              <div className="mb-4">
                <span className="section-label">What We Stand For</span>
              </div>
              <h2 className="mb-4 text-3xl font-display font-bold leading-[1.04] text-white sm:text-4xl">
                Built on values that show in every interaction.
              </h2>
              <p className="text-[15px] leading-[1.9] text-white/38">
                Our work is shaped by four core commitments that define how we operate,
                communicate, and deliver results for every client, every time.
              </p>
            </div>

            <div data-values-grid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <motion.div
                  key={v.title}
                  data-value-card
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="glass card-glow rounded-2xl p-6 group cursor-default"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 flex-shrink-0 transition-all duration-500 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${v.color}22, ${v.color}08)`,
                      border: `1px solid ${v.color}20`,
                      boxShadow: `0 4px 16px ${v.color}10`,
                    }}
                  >
                    <v.icon className="w-4 h-4" style={{ color: v.color }} />
                  </div>
                  <h3 className="font-display font-semibold text-white text-[16px] mb-2 leading-snug">{v.title}</h3>
                  <p className="text-[13px] text-white/35 leading-relaxed font-body">{v.text}</p>
                  <div
                    className="mt-4 h-px w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-12"
                    style={{ background: v.color }}
                  />
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            OPERATING PRINCIPLES
        ══════════════════════════════════════ */}
        <section data-principles-section className="relative py-16 sm:py-20">
          <Container>
            <div data-principle-heading className="mb-10 max-w-2xl">
              <div className="mb-4">
                <span className="section-label">Operating Principles</span>
              </div>
              <h2 className="mb-4 text-3xl font-display font-bold leading-[1.04] text-white sm:text-4xl">
                How we show up, every single time.
              </h2>
              <p className="text-[15px] leading-[1.9] text-white/38">
                Two principles guide every engagement, every update, and every deliverable
                we produce on your behalf.
              </p>
            </div>

            <div data-principles-grid className="grid gap-4 lg:grid-cols-2">
              {principles.map((item) => (
                <motion.div
                  key={item.title}
                  data-principle
                  whileHover={{ y: -7, scale: 1.018 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <FeatureCard
                    icon={item.icon}
                    eyebrow={item.eyebrow}
                    title={item.title}
                    text={item.text}
                    color={item.color}
                  />
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            CLIENT PROOF
        ══════════════════════════════════════ */}
        <section data-proof-section className="relative py-16 sm:py-20">
          <Container>
            <div data-proof-heading className="mb-10 max-w-2xl">
              <div className="mb-4">
                <span className="section-label">Client Proof</span>
              </div>
              <h2 className="mb-4 text-3xl font-display font-bold leading-[1.04] text-white sm:text-4xl">
                Premium only matters if clients can feel it.
              </h2>
              <p className="text-[15px] leading-[1.9] text-white/38">
                The recurring pattern in feedback is not just speed. It is relief,
                reliability, and the sense that someone serious is handling the moving parts.
              </p>
            </div>

            <div data-proof-grid className="grid gap-4 lg:grid-cols-2">
              {proofCards.map((item) => (
                <FeatureCard
                  key={item.title}
                  dataAttr="data-quote-card"
                  icon={item.icon}
                  eyebrow={item.eyebrow}
                  title={item.title}
                  text={item.text}
                  color={item.color}
                />
              ))}
            </div>

            {/* Final CTA */}
            <div
              data-final-cta
              className="glass card-glow mt-10 relative overflow-hidden rounded-3xl p-7 sm:p-10"
              style={{
                background: 'linear-gradient(135deg, rgba(18,28,43,0.95), rgba(6,12,20,0.92))',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at bottom right, rgba(42,139,255,0.14), transparent 60%)' }}
              />
              <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div className="max-w-xl">
                  <div className="mb-3">
                    <span className="section-label">Next Step</span>
                  </div>
                  <h3 className="text-xl font-display font-semibold leading-tight text-white sm:text-[1.9rem] sm:leading-[1.08]">
                    Ready to run your business with less friction and more focus?
                  </h3>
                  <p className="mt-3 text-[14px] text-white/36 leading-[1.8] font-body max-w-md">
                    One conversation is all it takes to discover what's possible when you
                    have the right support behind you.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:items-end flex-shrink-0">
                  <Button size="lg" href="/contact">
                    Contact Us <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 text-[11px] font-body font-bold uppercase tracking-[0.22em] text-white/24">
                    <CheckCircle className="h-4 w-4" style={{ color: '#38d9a9' }} />
                    Ready for tailored support
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

      </div>
    </div>
  )
}
