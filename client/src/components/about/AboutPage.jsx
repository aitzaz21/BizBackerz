import React, { Suspense, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useInView } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import Button from '../ui/Button'
import AboutBackground from './AboutBackground'
import KineticStrip from '../ui/KineticStrip'
import ScrollProgress from '../ui/ScrollProgress'
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  ChevronRight,
  Clock,
  Eye,
  ExternalLink,
  MapPin,
  MessageCircle,
  Orbit,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  UserCog,
  Users,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/* ─── CountUp ─── */
function CountUp({ end, duration = 2, suffix = '' }) {
  const ref = useRef(null)
  const ran = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true
        const obj = { v: 0 }
        gsap.to(obj, { v: end, duration, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(obj.v) + suffix } })
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [end, duration, suffix])
  return <span ref={ref}>0{suffix}</span>
}

/* ─── Animated progress bar ─── */
function ProgressBar({ pct, color, delay = 0 }) {
  const ref = useRef(null)
  const ran = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ran.current) {
        ran.current = true
        gsap.to(el, { width: `${pct}%`, duration: 1.6, ease: 'power3.out', delay })
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [pct, delay])
  return (
    <div className="w-full h-px bg-white/8 rounded-full overflow-hidden mt-3">
      <div ref={ref} className="h-full rounded-full" style={{ width: '0%', background: color }} />
    </div>
  )
}

/* ─── Word-reveal ─── */
function SplitWords({ text, className = '', delay = 0, as: Tag = 'span', style }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <Tag ref={ref} className={className} style={{ display: 'block', ...style }}>
      {text.split(' ').map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '105%', opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.05 }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/* ─── Inline-text accent block ─── */
function AccentPara({ children, className = '' }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      className={`border-l-2 border-brand-500/40 pl-5 text-[15px] sm:text-[16px] leading-[1.9] text-white/72 font-body ${className}`}
    >
      {children}
    </motion.p>
  )
}

/* ─── Section label ─── */
function Label({ children }) {
  return (
    <span className="section-label mb-5 inline-flex">
      <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse flex-shrink-0" />
      {children}
    </span>
  )
}

export default function AboutPage() {
  const pageRef    = useRef(null)
  const [canvas, setCanvas] = useState(false)
  const [team, setTeam] = useState([])
  const [teamReady, setTeamReady] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/team`)
      .then(r => r.json())
      .then(data => { if (data.success && data.members?.length) setTeam(data.members) })
      .catch(() => {})
      .finally(() => setTeamReady(true))
  }, [])

  useEffect(() => {
    const m = window.matchMedia('(min-width:1024px) and (prefers-reduced-motion:no-preference)')
    const sync = () => setCanvas(m.matches)
    sync(); m.addEventListener('change', sync)
    return () => m.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const el = pageRef.current
    if (!el) return

    /* Skip all GSAP on touch devices — content is visible by default */
    if (window.matchMedia('(pointer: coarse)').matches) return

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el)

      /* ── HERO ENTRANCE ─────────────────────────────────────────── */
      gsap.set('[data-ah-label]',  { opacity: 0, y: 16 })
      gsap.set('[data-ah-line]',   { yPercent: 110 })
      gsap.set('[data-ah-body]',   { opacity: 0, y: 22 })
      gsap.set('[data-ah-stats]',  { opacity: 0, y: 20 })
      gsap.set('[data-ah-cta]',    { opacity: 0, y: 18, scale: 0.95 })
      gsap.set('[data-ah-bignum]', { opacity: 0 })

      const heroTl = gsap.timeline({ delay: 0.15 })
      heroTl
        .to('[data-ah-label]',  { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
        .to('[data-ah-line]',   { yPercent: 0, stagger: 0.1, duration: 1.3, ease: 'power4.out' }, '-=0.15')
        .to('[data-ah-body]',   { opacity: 1, y: 0, stagger: 0.1, duration: 0.85, ease: 'power2.out' }, '-=0.7')
        .to('[data-ah-cta]',    { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power2.out' }, '-=0.55')
        .to('[data-ah-stats]',  { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: 'power2.out' }, '-=0.5')
        .to('[data-ah-bignum]', { opacity: 1, duration: 2, ease: 'power1.out' }, '-=1.8')

      /* ── PARALLAX ─────────────────────────────────────────────── */
      gsap.to('[data-ah-panel]',   { y: -60,  scrollTrigger: { trigger: '[data-ah-section]', start: 'top top', end: 'bottom top', scrub: 2 } })
      gsap.to('[data-blob-left]',  { y: -100, scrollTrigger: { trigger: el, start: 'top top', end: '80% bottom', scrub: 3 } })
      gsap.to('[data-blob-right]', { y: 80,   scrollTrigger: { trigger: el, start: 'top top', end: '80% bottom', scrub: 4 } })

      /* ── SECTION H2 / DESC — each triggers itself independently ── */
      q('[data-sec-h2]').forEach((h2) => {
        gsap.from(h2, {
          opacity: 0, y: 30, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: h2, start: 'top 87%', toggleActions: 'play reverse play reverse' },
        })
      })
      q('[data-sec-desc]').forEach((p) => {
        gsap.from(p, {
          opacity: 0, y: 22, duration: 0.85, ease: 'power2.out',
          scrollTrigger: { trigger: p, start: 'top 88%', toggleActions: 'play reverse play reverse' },
        })
      })

      /* ── MANIFESTO — glyph drop + text reveal + scrub ─────────── */
      gsap.from('[data-manifesto-glyph]', {
        opacity: 0, y: 45, scale: 0.7, duration: 1.4, ease: 'power3.out',
        scrollTrigger: { trigger: '[data-manifesto-section]', start: 'top 80%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-manifesto-text]', {
        opacity: 0, y: 65, scale: 0.97, duration: 1.15, ease: 'power3.out',
        scrollTrigger: { trigger: '[data-manifesto-section]', start: 'top 80%', toggleActions: 'play reverse play reverse' },
      })
      /* Subtle scrub parallax — drifts up as section passes */
      gsap.to('[data-manifesto-inner]', {
        y: -35,
        scrollTrigger: { trigger: '[data-manifesto-section]', start: 'top bottom', end: 'bottom top', scrub: 1.8 },
      })

      /* ── STORY CHAPTERS — alternate left / right ─────────────── */
      q('[data-ch]').forEach((ch, i) => {
        gsap.from(ch, {
          opacity: 0, x: i % 2 === 0 ? -55 : 55, y: 20, scale: 0.965,
          duration: 0.95, ease: 'power3.out',
          scrollTrigger: { trigger: ch, start: 'top 86%', toggleActions: 'play reverse play reverse' },
        })
      })

      /* ── PROCESS STEPS — slide up with depth ────────────────── */
      gsap.from('[data-process-item]', {
        opacity: 0, y: 55, scale: 0.93, stagger: 0.09, duration: 0.92, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: '[data-process-section]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })

      /* ── STATS — back.out bounce ─────────────────────────────── */
      gsap.from('[data-stat-item]', {
        opacity: 0, y: 60, scale: 0.87, stagger: 0.12, duration: 1.0, ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '[data-stats-section]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })

      /* ── VALUES — staggered fan up ───────────────────────────── */
      gsap.from('[data-value-item]', {
        opacity: 0, y: 40, scale: 0.93, stagger: 0.09, duration: 0.82, ease: 'power3.out',
        scrollTrigger: { trigger: '[data-values-section]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })

      /* ── PRINCIPLES — left col slides from left, items from right ─ */
      gsap.from('[data-principles-left]', {
        opacity: 0, x: -48, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: '[data-principles-section]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })
      q('[data-principle-item]').forEach((item, i) => {
        gsap.from(item, {
          opacity: 0, x: 42, y: 14, duration: 0.85, ease: 'power3.out', delay: i * 0.12,
          scrollTrigger: { trigger: '[data-principles-section]', start: 'top 80%', toggleActions: 'play reverse play reverse' },
        })
      })

      /* ── TEAM — alternating rotateY depth flip ───────────────── */
      q('[data-team-item]').forEach((item, i) => {
        gsap.from(item, {
          opacity: 0, y: 36, scale: 0.94, rotateY: i % 2 === 0 ? -9 : 9,
          duration: 0.85, ease: 'power3.out', delay: i * 0.09,
          scrollTrigger: { trigger: '[data-team-section]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
        })
      })

      /* ── CINEMATIC ORBITAL SECTION ───────────────────────────── */
      gsap.from('[data-cinematic-core]', {
        opacity: 0, scale: 0.5, duration: 1.5, ease: 'power3.out',
        scrollTrigger: { trigger: '[data-cinematic-section]', start: 'top 75%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-cinematic-stat]', {
        opacity: 0, y: 28, scale: 0.88, stagger: 0.09, duration: 0.82, ease: 'power3.out',
        scrollTrigger: { trigger: '[data-cinematic-section]', start: 'top 65%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-cinematic-badges]', {
        opacity: 0, y: 24, duration: 0.88, ease: 'power2.out',
        scrollTrigger: { trigger: '[data-cinematic-section]', start: 'top 55%', toggleActions: 'play reverse play reverse' },
      })
      /* Scrub: core drifts upward as you scroll past */
      gsap.to('[data-cinematic-core]', {
        y: -55,
        scrollTrigger: { trigger: '[data-cinematic-section]', start: 'top bottom', end: 'bottom top', scrub: 2 },
      })

      /* ── CLIENT PROOF ────────────────────────────────────────── */
      gsap.from('[data-proof-item]', {
        opacity: 0, y: 44, scale: 0.94, stagger: 0.1, duration: 0.92, ease: 'power3.out',
        scrollTrigger: { trigger: '[data-proof-section]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })

      /* ── TESTIMONIALS ────────────────────────────────────────── */
      gsap.from('[data-testimonial-item]', {
        opacity: 0, y: 40, scale: 0.93, stagger: 0.1, duration: 0.88, ease: 'power3.out',
        scrollTrigger: { trigger: '[data-testimonials-section]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })

      /* ── OUTRO ────────────────────────────────────────────────── */
      const outroTl = gsap.timeline({
        scrollTrigger: { trigger: '[data-outro-section]', start: 'top 78%', toggleActions: 'play reverse play reverse' },
      })
      outroTl
        .from('[data-outro-pin]',   { y: -32, opacity: 0, scale: 0.55, duration: 0.9, ease: 'back.out(1.8)' })
        .from('[data-outro-title]', { y: 58, opacity: 0, stagger: 0.1, duration: 1.15, ease: 'power3.out' }, '-=0.55')
        .from('[data-outro-card]',  { y: 44, opacity: 0, scale: 0.95, stagger: 0.12, duration: 1.0, ease: 'power2.out' }, '-=0.75')
        .from('[data-outro-bar]',   { scaleX: 0, duration: 1.3, ease: 'power3.inOut' }, '-=0.95')

    }, el)
    return () => ctx.revert()
  }, [])

  const processSteps = [
    { n: '01', title: 'Discovery Call',   body: 'We learn your goals, pain points, and current workflow in a focused 30-minute session — no generic intake forms.',              color: '#2a8bff', icon: MessageCircle },
    { n: '02', title: 'Match & Onboard',  body: 'We match you with the right assistant and configure tools, access, and communication channels within 48 hours.',               color: '#20c997', icon: UserCog },
    { n: '03', title: 'Start Executing',  body: 'Your assistant begins work immediately. Daily updates, clear task logs, and proactive flags — no babysitting required.',        color: '#f59e0b', icon: TrendingUp },
    { n: '04', title: 'Scale With You',   body: 'Add hours, expand scope, or bring in specialists as your business grows. Our support evolves as your needs evolve.',            color: '#8b5cf6', icon: Orbit },
  ]

  const testimonials = [
    { name: 'Michael Torres', role: 'CEO, RealtyCore',        quote: 'BizBackerz gave us back 20+ hours a week. The quality feels like a full in-house hire — not outsourced support.',         rating: 5, color: '#2a8bff' },
    { name: 'Lisa Hammond',   role: 'Founder, ShopPeak',      quote: 'Onboarding was seamless and the assistant was fully up to speed within days. That rarely happens with any VA service.',    rating: 5, color: '#20c997' },
    { name: 'David Chen',     role: 'Director, Propello',     quote: 'The communication discipline here is on another level. Clear updates, zero dropped balls, and real operational instinct.',  rating: 5, color: '#f59e0b' },
  ]

  const chapters = [
    { n: '01', title: 'We run behind-the-scenes work with front-row discipline.', body: 'Administrative execution, communication, and follow-through are treated as client-facing quality — not invisible support work.', color: '#2a8bff' },
    { n: '02', title: 'We build operating rhythm, not just task completion.',       body: 'Clear updates, predictable output, and systems that keep momentum even when your day gets crowded.',                              color: '#20c997' },
    { n: '03', title: 'We make growth feel lighter, not louder.',                   body: 'Our best work gives founders more calm, more control, and more room to focus on revenue, leadership, and the bigger picture.',    color: '#f59e0b' },
    { n: '04', title: 'We align our skills with your long-term vision.',            body: 'Whether it is scaling your operations or managing specialized projects, we integrate seamlessly with your internal goals.',         color: '#8b5cf6' },
  ]

  const values = [
    { icon: Target,      title: 'Precision',     body: 'Every task delivered as if it\'s client-facing. No cut corners, no half-measures.',              color: '#2a8bff' },
    { icon: ShieldCheck, title: 'Reliability',   body: 'Consistent output, clear updates, no surprises. You always know where things stand.',             color: '#20c997' },
    { icon: TrendingUp,  title: 'Growth',        body: 'We scale with your business. Our support evolves as your needs evolve.',                          color: '#f59e0b' },
    { icon: Eye,         title: 'Transparency',  body: 'No hidden processes, no guesswork. Open communication at every step.',                            color: '#8b5cf6' },
  ]

  const principles = [
    { icon: MessageCircle, n: '01', title: 'Clear Communication',   body: 'Fast responses, clean updates, and zero ambiguity around ownership or next steps. You always know what is happening and why.',            color: '#2a8bff' },
    { icon: UserCog,       n: '02', title: 'Tailored Support',      body: 'We shape workflows around how your business actually runs — not generic templates. Every engagement is built from scratch around you.',  color: '#20c997' },
    { icon: ShieldCheck,   n: '03', title: 'Proactive Ownership',   body: 'We flag issues before they become problems and move on your behalf without being asked. You never have to chase — we come to you.',      color: '#f59e0b' },
    { icon: Orbit,         n: '04', title: 'Continuous Refinement', body: 'We do not just execute; we optimize. We constantly look for ways to improve your workflows, eliminate bottlenecks, and elevate efficiency.', color: '#8b5cf6' },
  ]

  const proofCards = [
    { icon: ShieldCheck, title: 'Responsive enough to protect momentum.', body: 'Clients highlight proactive follow-up, fast updates, and the feeling that nothing is ever dropped.',  color: '#2a8bff' },
    { icon: Orbit,       title: 'Structured enough to feel premium.',     body: 'It is not just tasks done — it is the calmer, more reliable operating rhythm founders feel around us.', color: '#20c997' },
    { icon: Target,      title: 'Precision in every detail.',             body: 'From email management to data entry, we execute with absolute accuracy so you never have to double-check our work.', color: '#f59e0b' },
  ]

  return (
    <div ref={pageRef} className="about-page-shell relative overflow-hidden bg-navy-950">
      <ScrollProgress />

      {/* ── Global BG ── */}
      <div className="pointer-events-none absolute inset-0">
        {canvas && (
          <div className="absolute inset-0 opacity-65">
            <Canvas camera={{ position: [0,0,12], fov: 54 }} dpr={1} frameloop="always"
              gl={{ antialias: false, alpha: true, powerPreference: 'default', stencil: false }}
              style={{ background: 'transparent' }}>
              <Suspense fallback={null}><AboutBackground /></Suspense>
            </Canvas>
          </div>
        )}
        <div data-blob-left className="about-ambient-blob absolute -left-24 top-0 h-[36rem] w-[36rem] rounded-full blur-[140px]" style={{ background: 'rgba(42,139,255,0.12)' }} />
        <div data-blob-right className="about-ambient-blob absolute right-[-6rem] top-[14rem] h-[32rem] w-[32rem] rounded-full blur-[150px]" style={{ background: 'rgba(56,217,169,0.10)' }} />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: 'linear-gradient(rgba(42,139,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(42,139,255,0.04) 1px,transparent 1px)',
            backgroundSize: '88px 88px',
            maskImage: 'linear-gradient(to bottom,transparent,black 12%,black 88%,transparent)',
          }}
        />
        <div className="about-radial-sweep absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-950/15 to-navy-950/85" />
      </div>

      <div className="relative z-10">

        {/* ══════════════════════════════════════
            HERO  — full-width editorial, no competing card
        ══════════════════════════════════════ */}
        <section data-ah-section className="relative overflow-hidden pt-6 pb-6 sm:pt-8 sm:pb-8 lg:pt-8 lg:pb-10">

          {/* faint oversized number behind */}
          <div data-ah-bignum className="absolute right-[-2%] top-[5%] select-none pointer-events-none" style={{ opacity: 0 }}>
            <span className="font-display font-bold" style={{ fontSize: 'clamp(8rem,16vw,18rem)', color: 'rgba(42,139,255,0.014)', lineHeight: 1, letterSpacing: '-0.05em' }}>
              3+
            </span>
          </div>

          <Container>
            <div data-ah-panel className="max-w-5xl">

              {/* kicker */}
              <div data-ah-label className="flex flex-wrap items-center gap-5 mb-8">
                <Label>About BizBackerz</Label>
                <div className="h-px w-16 bg-gradient-to-r from-brand-500/40 to-transparent" />
                <span className="text-[11px] font-body font-bold uppercase tracking-[0.22em] text-white/35">Distinct by design</span>
              </div>

              {/* heading — 3 lines, fits above fold */}
              <div className="mb-8 sm:mb-10">
                <h1 className="font-display font-bold tracking-[-0.045em] text-white">
                  {[
                    { text: '3+ Years',             cls: '' },
                    { text: 'of Combined',          cls: 'text-white/60' },
                    { text: 'Operational Taste.',   cls: 'text-gradient' },
                  ].map(({ text, cls }) => (
                    <div key={text} style={{ overflow: 'hidden', lineHeight: 0.96, paddingBottom: '0.07em' }}>
                      <span data-ah-line className={`block text-[2.8rem] sm:text-5xl lg:text-[4.2rem] xl:text-[5.2rem] ${cls}`}>
                        {text}
                      </span>
                    </div>
                  ))}
                </h1>
              </div>

              {/* body — higher opacity, accent border */}
              <div className="max-w-3xl space-y-5 mb-10">
                <p data-ah-body className="text-[16px] sm:text-[17px] leading-[1.9] text-white/72 font-body">
                  We deliver the operational backbone that ambitious businesses need to scale. By combining elite-level administrative discipline with an intuitive understanding of your goals, we clear the noise so you can focus on building what matters.
                </p>
                <p data-ah-body className="border-l-2 border-brand-500/40 pl-5 text-[15px] leading-[1.9] text-white/60 font-body">
                  We support founders with the structure and judgment that usually only comes
                  after years of hard operational work. When you partner with us, you are not just getting an assistant; you are gaining a dedicated operational ally who treats your business's success as their own.
                </p>
              </div>

              {/* CTA row */}
              <div data-ah-cta className="flex flex-wrap items-center gap-4 mb-12">
                <Button size="lg" href="/contact">
                  Start a Conversation <ArrowRight className="h-4 w-4" />
                </Button>
                <span className="text-[12px] text-white/35 font-body">★★★★★ &nbsp;Rated 5/5 by business owners</span>
              </div>

              {/* Stats strip — horizontal */}
              <div className="border-t border-white/[0.07] pt-8 grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4">
                {[
                  { end: 3,   suffix: '+', label: 'Years Experience',   color: '#2a8bff' },
                  { end: 500, suffix: '+', label: 'Tasks Completed',    color: '#20c997' },
                  { end: 50,  suffix: '+', label: 'Satisfied Clients',  color: '#f59e0b' },
                  { end: 98,  suffix: '%', label: 'Client Retention',   color: '#8b5cf6' },
                ].map((s, i) => (
                  <div key={s.label} data-ah-stats>
                    <div className="font-display font-bold text-[2.2rem] leading-none" style={{ color: s.color }}>
                      <CountUp end={s.end} suffix={s.suffix} duration={2} />
                    </div>
                    <p className="text-[10px] text-white/40 font-body font-bold uppercase tracking-[0.2em] mt-1.5">{s.label}</p>
                    <ProgressBar pct={[85,92,78,98][i]} color={s.color} delay={i * 0.12} />
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            MARQUEE
        ══════════════════════════════════════ */}
        <section className="relative overflow-hidden border-y border-white/[0.05] bg-black/12 py-3.5">
          <div className="marquee-track">
            {[...Array(2)].flatMap((_, r) =>
              ['3+ Years Experience','Premium Virtual Operations','Clear Communication',
               'Founder-Focused Support','Operational Discipline','Client Experience First'].map(item => (
                <div key={`${r}-${item}`} className="mx-6 flex items-center gap-5">
                  <span className="text-[10px] font-body font-bold uppercase tracking-[0.28em] text-white/28">{item}</span>
                  <span style={{ color: '#38d9a9', fontSize: 8 }}>◆</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Kinetic strip — slides opposite to marquee */}
        <KineticStrip
          texts={['3+ YEARS', '·', 'OPERATIONAL EXCELLENCE', '·', 'DELEGATE TO DOMINATE', '·', 'PREMIUM SUPPORT', '·']}
          direction={1}
          opacity={0.075}
          fontSize="clamp(3.2rem,7vw,8rem)"
          speed={1.3}
        />

        {/* ══════════════════════════════════════
            MANIFESTO
        ══════════════════════════════════════ */}
        <section data-manifesto-section className="relative py-8 sm:py-12 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(42,139,255,0.06), transparent)' }} />
          <div className="absolute left-0 right-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(42,139,255,0.18) 30%,rgba(42,139,255,0.18) 70%,transparent)' }} />
          <div className="absolute left-0 right-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(42,139,255,0.18) 30%,rgba(42,139,255,0.18) 70%,transparent)' }} />
          {/* Soft side glows */}
          <div className="absolute left-0 top-0 bottom-0 w-1/3 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(42,139,255,0.04), transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none" style={{ background: 'linear-gradient(-90deg, rgba(56,217,169,0.04), transparent)' }} />

          <Container>
            <div data-manifesto-inner className="text-center max-w-4xl mx-auto">
              {/* decorative quote glyph */}
              <div data-manifesto-glyph className="font-display font-bold select-none pointer-events-none mb-[-1.5rem]"
                style={{ fontSize: 'clamp(6rem,14vw,11rem)', lineHeight: 1, color: 'rgba(42,139,255,0.07)' }}>"</div>

              <div data-manifesto-text>
                <SplitWords
                  text="We don't just manage tasks."
                  as="p"
                  delay={0}
                  className="font-display font-bold tracking-[-0.045em] text-white"
                  style={{ fontSize: 'clamp(2.1rem,5vw,4.2rem)', lineHeight: 1.04 }}
                />
                <SplitWords
                  text="We protect your momentum."
                  as="p"
                  delay={0.3}
                  className="font-display font-bold tracking-[-0.045em] text-gradient mt-1"
                  style={{ fontSize: 'clamp(2.1rem,5vw,4.2rem)', lineHeight: 1.04 }}
                />
              </div>

              <p className="text-[15px] text-white/50 font-body leading-[1.85] max-w-2xl mx-auto mt-8">
                The BizBackerz Standard isn't just a promise; it's the precise operational rhythm behind every task, update, and strategic execution we handle on your behalf. We believe premium support should feel invisible yet indispensable. Every action is calculated to give you back your time and protect your peace of mind.
              </p>

              <div className="flex items-center justify-center gap-5 mt-8">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-brand-500/50" />
                <span className="text-[9px] font-body font-bold uppercase tracking-[0.3em] text-white/30">The BizBackerz Standard</span>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-brand-500/50" />
              </div>
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            STORY / CHAPTERS
        ══════════════════════════════════════ */}
        <section data-story-section className="relative py-6 sm:py-10">
          <Container>
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">

              {/* sticky left */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <Label>The Story</Label>
                  <h2 data-sec-h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mb-5 mt-2">
                    We treat support work like brand work.
                  </h2>
                  <p data-sec-desc className="text-[15px] leading-[1.9] text-white/62 font-body max-w-sm">
                    The invisible systems still carry visible standards. That is what makes the
                    service feel different from the very first interaction.
                  </p>
                </div>
              </div>

              {/* chapters */}
              <div className="lg:col-span-8 space-y-4">
                {chapters.map((c) => (
                  <div
                    key={c.n}
                    data-ch
                    className="group relative rounded-2xl p-7 sm:p-8 border border-white/[0.07] hover:border-white/[0.14] transition-all duration-500 overflow-hidden"
                    style={{ background: 'rgba(6,15,29,0.55)', backdropFilter: 'blur(20px)' }}
                  >
                    {/* full-card colour fill on hover */}
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                      style={{ background: `linear-gradient(135deg,${c.color}14 0%,${c.color}06 50%,transparent 100%)` }} />

                    {/* top highlight border */}
                    <div className="absolute top-0 left-0 right-0 h-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(90deg,transparent,${c.color}60,transparent)` }} />

                    {/* colour bar — left edge */}
                    <div className="absolute inset-y-0 left-0 w-[2px] rounded-l-2xl transition-all duration-500"
                      style={{ background: `linear-gradient(180deg,${c.color}ee,${c.color}30,transparent)` }} />

                    {/* ghost chapter number — huge, back */}
                    <div className="absolute right-4 bottom-[-0.5rem] font-display font-bold leading-none pointer-events-none select-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                      style={{ fontSize: 'clamp(4.5rem,9vw,7rem)', color: `${c.color}0c`, letterSpacing: '-0.05em' }}>
                      {parseInt(c.n)}
                    </div>

                    <div className="relative grid sm:grid-cols-[96px,1fr] gap-6 items-start">
                      {/* left col — badge + ghost num */}
                      <div className="flex flex-col gap-3">
                        <span className="inline-flex self-start rounded-full px-3 py-1.5 text-[10px] font-body font-bold uppercase tracking-[0.22em] transition-all duration-400 group-hover:scale-105"
                          style={{ border: `1px solid ${c.color}35`, color: c.color, background: `${c.color}12` }}>
                          {c.n}
                        </span>
                        <div className="font-display text-[3.2rem] font-bold leading-none transition-all duration-500"
                          style={{ color: `${c.color}22` }}>{parseInt(c.n)}</div>
                      </div>

                      {/* right col — text */}
                      <div>
                        <h3 className="text-[1.1rem] sm:text-[1.2rem] font-display font-semibold text-white leading-[1.2] mb-3 group-hover:text-white transition-colors duration-300">{c.title}</h3>
                        <p className="text-[14px] sm:text-[15px] text-white/62 leading-[1.9] font-body group-hover:text-white/72 transition-colors duration-300">{c.body}</p>
                        <div className="flex items-center gap-2 mt-5 text-[10px] font-body font-bold uppercase tracking-[0.22em]"
                          style={{ color: `${c.color}80` }}>
                          <span className="group-hover:text-white/50 transition-colors duration-300">Read the standard</span>
                          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" style={{ color: c.color }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            HOW WE WORK — 4-step process
        ══════════════════════════════════════ */}
        <section data-process-section className="relative py-6 sm:py-10 border-t border-white/[0.06]">
          <Container>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <Label>How We Work</Label>
                <h2 data-sec-h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mt-2 max-w-md">
                  Four steps from handshake to output.
                </h2>
              </div>
              <p data-sec-desc className="text-[14px] text-white/50 font-body max-w-sm leading-[1.8]">
                Structured onboarding means you feel productive from day one — not week three. We don't believe in long-winded setup processes; we handle the heavy lifting so you can start delegating immediately.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {processSteps.map((step, i) => (
                <div key={step.n} data-process-item
                  className="group relative rounded-2xl p-6 border border-white/[0.07] hover:border-white/[0.14] transition-all duration-500 overflow-hidden"
                  style={{ background: 'rgba(6,15,29,0.55)', backdropFilter: 'blur(20px)' }}
                >
                  {/* fill */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(148deg,${step.color}16 0%,${step.color}07 55%,transparent 100%)` }} />
                  {/* top accent */}
                  <div className="absolute top-0 left-0 right-0 h-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg,transparent,${step.color}55,transparent)` }} />
                  {/* connector line — right edge, desktop only */}
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-9 right-0 w-4 h-px"
                      style={{ background: `linear-gradient(90deg,${step.color}40,transparent)` }} />
                  )}

                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-400 group-hover:scale-110"
                        style={{ background: `${step.color}16`, border: `1px solid ${step.color}28` }}>
                        <step.icon className="w-5 h-5" style={{ color: step.color }} />
                      </div>
                      <span className="font-display font-bold text-[2rem] leading-none"
                        style={{ color: `${step.color}18` }}>{step.n}</span>
                    </div>
                    <h3 className="font-display font-semibold text-white text-[16px] mb-2.5 leading-snug group-hover:text-white transition-colors duration-300">{step.title}</h3>
                    <p className="text-[13px] text-white/55 leading-[1.85] font-body group-hover:text-white/68 transition-colors duration-300">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Kinetic 2 — reverses direction */}
        <KineticStrip
          texts={['CLEAR COMMUNICATION', '·', 'FOUNDER FOCUSED', '·', 'CLIENT FIRST', '·', 'BIZBACKERZ', '·']}
          direction={-1}
          opacity={0.07}
          fontSize="clamp(3.2rem,7vw,8rem)"
          speed={1.5}
        />

        {/* ══════════════════════════════════════
            BY THE NUMBERS
        ══════════════════════════════════════ */}
        <section data-stats-section className="relative py-6 sm:py-10">
          <Container>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <Label>By The Numbers</Label>
                <h2 data-sec-h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mt-2 max-w-lg">
                  Numbers that tell the story before we do.
                </h2>
              </div>
              <p data-sec-desc className="text-[14px] text-white/55 font-body max-w-sm leading-[1.8]">
                Experience, output, and client trust — measured. Our growth isn't just measured in tasks, but in the tangible time and momentum we've returned to founders.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
              {[
                { end: 3,   suffix: '+', label: 'Years Experience',      color: '#2a8bff', pct: 85 },
                { end: 500, suffix: '+', label: 'Tasks Completed',        color: '#20c997', pct: 92 },
                { end: 50,  suffix: '+', label: 'Satisfied Clients',      color: '#f59e0b', pct: 78 },
                { end: 98,  suffix: '%', label: 'Client Retention Rate',  color: '#8b5cf6', pct: 98 },
              ].map((s, i) => (
                <div key={s.label} data-stat-item
                  className="bg-navy-950 p-8 flex flex-col gap-2 group hover:bg-[#060f1d] transition-colors duration-300">
                  <div className="font-display font-bold text-[3rem] sm:text-[3.5rem] leading-none" style={{ color: s.color }}>
                    <CountUp end={s.end} suffix={s.suffix} duration={2.2} />
                  </div>
                  <p className="text-[11px] text-white/42 font-body font-bold uppercase tracking-[0.18em] leading-[1.6]">{s.label}</p>
                  <ProgressBar pct={s.pct} color={s.color} delay={i * 0.12} />
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            WHAT WE STAND FOR — no cards, clean text
        ══════════════════════════════════════ */}
        <section data-values-section className="relative py-6 sm:py-10">
          <Container>
            <div className="mb-6">
              <Label>What We Stand For</Label>
              <h2 data-sec-h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mt-2 max-w-xl">
                Built on values that show in every interaction.
              </h2>
              <p data-sec-desc className="text-[15px] text-white/60 font-body max-w-2xl mt-4">
                We believe that premium support is rooted in a steadfast commitment to our core values. These principles guide our decision-making, shape our client relationships, and ensure that every deliverable exceeds expectations.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {values.map((v) => (
                <div key={v.title} data-value-item
                  className="group relative rounded-2xl p-6 border border-white/[0.07] hover:border-white/[0.14] transition-all duration-500 overflow-hidden"
                  style={{ background: 'rgba(6,15,29,0.5)', backdropFilter: 'blur(16px)' }}
                >
                  {/* full-card fill on hover */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(148deg,${v.color}16 0%,${v.color}07 55%,transparent 100%)` }} />

                  {/* top highlight */}
                  <div className="absolute top-0 left-0 right-0 h-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg,transparent,${v.color}55,transparent)` }} />

                  <div className="relative">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-400 group-hover:scale-110"
                      style={{ background: `${v.color}16`, border: `1px solid ${v.color}28` }}
                    >
                      <v.icon className="w-5 h-5" style={{ color: v.color }} />
                    </div>
                    <h3 className="font-display font-semibold text-white text-[17px] mb-2.5 group-hover:text-white transition-colors duration-300">{v.title}</h3>
                    <p className="text-[13px] text-white/58 leading-[1.85] font-body group-hover:text-white/70 transition-colors duration-300">{v.body}</p>
                    {/* animated accent line */}
                    <div className="mt-5 h-px w-0 group-hover:w-8 transition-all duration-500 rounded-full" style={{ background: v.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            OPERATING PRINCIPLES — text-first, no cards
        ══════════════════════════════════════ */}
        <section data-principles-section className="relative py-6 sm:py-10">
          <Container>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
              <div data-principles-left>
                <Label>Operating Principles</Label>
                <h2 data-sec-h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mt-2 mb-6">
                  How we show up, every single time.
                </h2>
                <p data-sec-desc className="text-[15px] text-white/62 leading-[1.9] font-body">
                  Four core principles guide every engagement, every update, and every deliverable
                  we produce on your behalf. Not policies — habits that are built into how we work.
                </p>
              </div>

              <div className="space-y-10">
                {principles.map((p) => (
                  <div key={p.title} data-principle-item className="flex gap-6 group">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                        style={{ background: `${p.color}14`, border: `1px solid ${p.color}22` }}>
                        <p.icon className="w-4 h-4" style={{ color: p.color }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-body font-bold uppercase tracking-[0.24em] mb-2" style={{ color: p.color }}>{p.n}</p>
                      <h3 className="font-display font-semibold text-white text-[18px] mb-2 leading-snug">{p.title}</h3>
                      <p className="text-[14px] text-white/62 leading-[1.9] font-body">{p.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            TEAM — only renders when API returns members
        ══════════════════════════════════════ */}
        {teamReady && team.length > 0 && (
        <section data-team-section className="relative py-6 sm:py-10 border-t border-white/[0.06]">
          <Container>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <Label>The Team</Label>
                <h2 data-sec-h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mt-2 max-w-md">
                  People who treat your work like their own.
                </h2>
              </div>
              <p data-sec-desc className="text-[14px] text-white/50 font-body max-w-sm leading-[1.8]">
                Experienced operators, not order-takers. Our team is meticulously selected for their problem-solving skills, operational instinct, and dedication to excellence.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {team.map((member) => (
                <div key={member._id || member.name} data-team-item
                  className="group relative rounded-2xl p-6 border border-white/[0.07] hover:border-white/[0.14] transition-all duration-500 overflow-hidden"
                  style={{ background: 'rgba(6,15,29,0.55)', backdropFilter: 'blur(20px)' }}
                >
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(148deg,${member.color}14 0%,${member.color}06 55%,transparent 100%)` }} />
                  <div className="absolute top-0 left-0 right-0 h-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg,transparent,${member.color}50,transparent)` }} />

                  <div className="relative">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name}
                        className="w-14 h-14 rounded-2xl object-cover mb-5 transition-all duration-400 group-hover:scale-105"
                        style={{ border: `1px solid ${member.color}30` }} />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-[17px] font-display font-bold transition-all duration-400 group-hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${member.color}28, ${member.color}10)`,
                          border: `1px solid ${member.color}30`,
                          color: member.color,
                        }}>
                        {member.initials || member.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <h3 className="font-display font-semibold text-white text-[16px] mb-0.5 group-hover:text-white transition-colors duration-300">{member.name}</h3>
                    <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] mb-3" style={{ color: member.color }}>{member.position}</p>
                    <p className="text-[13px] text-white/55 leading-[1.85] font-body group-hover:text-white/68 transition-colors duration-300">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
        )}

        {/* ══════════════════════════════════════
            CINEMATIC EXPERIENCE SHOWCASE
        ══════════════════════════════════════ */}
        <section data-cinematic-section className="relative py-12 sm:py-16 overflow-hidden">
          {/* Deep dark background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(1,4,12,0.98) 0%, rgba(3,9,18,0.96) 100%)' }} />

          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.035]" style={{
            backgroundImage: 'linear-gradient(rgba(42,139,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(42,139,255,0.5) 1px,transparent 1px)',
            backgroundSize: '72px 72px',
          }} />

          {/* Corner atmospheric glows */}
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[200px] pointer-events-none"
            style={{ background: 'rgba(42,139,255,0.1)' }} />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[200px] pointer-events-none"
            style={{ background: 'rgba(56,217,169,0.07)' }} />

          {/* Top/bottom edge fades */}
          <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, rgba(3,9,18,1), transparent)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(3,9,18,1), transparent)' }} />

          <Container>
            <div className="text-center relative">

              {/* Section label with flanking lines */}
              <div className="flex items-center justify-center gap-5 mb-8">
                <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-brand-500/40" />
                <Label>Operational Experience</Label>
                <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-brand-500/40" />
              </div>

              {/* ── Giant centrepiece ── */}
              <div data-cinematic-core className="relative inline-flex items-center justify-center mb-6">
                {/* Orbit ring 1 — slow clockwise */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: 380, height: 380,
                    borderRadius: '50%',
                    border: '1px dashed rgba(42,139,255,0.1)',
                  }}
                />
                {/* Orbit ring 2 — faster counter-clockwise, with a dot marker */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: 280, height: 280,
                    borderRadius: '50%',
                    border: '1px solid rgba(56,217,169,0.08)',
                  }}
                >
                  {/* Glowing dot on the ring */}
                  <div style={{
                    position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#38d9a9',
                    boxShadow: '0 0 12px #38d9a9, 0 0 28px rgba(56,217,169,0.5)',
                  }} />
                </motion.div>
                {/* Orbit ring 3 — innermost */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: 190, height: 190,
                    borderRadius: '50%',
                    border: '1px solid rgba(42,139,255,0.06)',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#2a8bff',
                    boxShadow: '0 0 10px #2a8bff, 0 0 24px rgba(42,139,255,0.5)',
                  }} />
                </motion.div>

                {/* Core glow behind number */}
                <div style={{
                  position: 'absolute',
                  width: 160, height: 160, borderRadius: '50%',
                  background: 'radial-gradient(ellipse, rgba(42,139,255,0.22) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }} />

                {/* THE NUMBER */}
                <div className="relative z-10 text-center">
                  <div
                    className="font-display font-black text-gradient"
                    style={{ fontSize: 'clamp(6.5rem,18vw,13rem)', lineHeight: 0.88, letterSpacing: '-0.06em' }}
                  >
                    3+
                  </div>
                  <p className="text-[9px] font-body font-bold uppercase tracking-[0.42em] text-white/25 mt-4">
                    Years of Combined Excellence
                  </p>
                </div>
              </div>

              {/* Founding badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/[0.09] mb-10"
                style={{ background: 'rgba(42,139,255,0.06)', backdropFilter: 'blur(12px)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse flex-shrink-0" />
                <span className="text-[11px] font-body font-bold uppercase tracking-[0.24em] text-white/48">
                  Founded 2024 · Registered &amp; Operating
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8">
                {[
                  { n: '50+',  label: 'Clients Served',   color: '#2a8bff', pct: 78 },
                  { n: '500+', label: 'Tasks Completed',  color: '#20c997', pct: 92 },
                  { n: '98%',  label: 'Retention Rate',   color: '#f59e0b', pct: 98 },
                  { n: '9',    label: 'Service Areas',    color: '#8b5cf6', pct: 85 },
                ].map((s) => (
                  <div key={s.label} data-cinematic-stat
                    className="group relative rounded-2xl p-5 border border-white/[0.07] hover:border-white/[0.14] overflow-hidden transition-all duration-400"
                    style={{ background: 'rgba(6,15,29,0.65)', backdropFilter: 'blur(18px)' }}
                  >
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                      style={{ background: `radial-gradient(ellipse at top left, ${s.color}14, transparent 60%)` }} />
                    <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                      style={{ background: `linear-gradient(90deg,transparent,${s.color}50,transparent)` }} />
                    <div className="font-display font-black leading-none mb-2" style={{ fontSize: '2.6rem', color: s.color }}>{s.n}</div>
                    <p className="text-[9.5px] font-body font-bold uppercase tracking-[0.2em] text-white/38">{s.label}</p>
                    <div className="w-full h-[1.5px] bg-white/6 rounded-full overflow-hidden mt-3">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.pct}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Horizontal achievement strip */}
              <div data-cinematic-badges className="flex flex-wrap items-center justify-center gap-3">
                {[
                  { icon: ShieldCheck, text: 'NDA Protected',          color: '#20c997' },
                  { icon: Clock,       text: '48hr Onboarding',        color: '#2a8bff' },
                  { icon: TrendingUp,  text: 'Scales With You',        color: '#f59e0b' },
                  { icon: Users,       text: '50+ Happy Clients',      color: '#8b5cf6' },
                  { icon: Target,      text: '98% Retention Rate',     color: '#ec4899' },
                  { icon: Eye,         text: 'Full Transparency',      color: '#10b981' },
                ].map((item) => (
                  <div key={item.text}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.07]"
                    style={{ background: 'rgba(6,15,29,0.5)' }}>
                    <item.icon className="w-3 h-3 flex-shrink-0" style={{ color: item.color }} />
                    <span className="text-[10px] font-body font-semibold text-white/45">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            CLIENT PROOF
        ══════════════════════════════════════ */}
        <section data-proof-section className="relative py-6 sm:py-10 border-t border-white/[0.06]">
          <Container>
            <div className="mb-6">
              <Label>Client Proof</Label>
              <h2 data-sec-h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mt-2 max-w-2xl">
                Premium only matters if clients can feel it.
              </h2>
              <p data-sec-desc className="mt-4 text-[15px] text-white/62 leading-[1.9] font-body max-w-xl">
                The recurring pattern in feedback is not just speed — it is relief, reliability,
                and the sense that someone serious is handling the moving parts.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-10">
              {proofCards.map((item) => (
                <div key={item.title} data-proof-item
                  className="group relative rounded-2xl p-7 border border-white/[0.07] hover:border-white/[0.14] transition-all duration-500 overflow-hidden"
                  style={{ background: 'rgba(6,15,29,0.55)', backdropFilter: 'blur(20px)' }}
                >
                  {/* full-card fill */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg,${item.color}18 0%,${item.color}08 50%,transparent 100%)` }} />

                  <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg,transparent,${item.color}55,transparent)` }} />

                  {/* bottom glow */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                    style={{ background: `linear-gradient(0deg,${item.color}06,transparent)` }} />

                  <div className="relative">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-400 group-hover:scale-110"
                        style={{ background: `${item.color}16`, border: `1px solid ${item.color}28` }}>
                        <item.icon className="w-5 h-5" style={{ color: item.color }} />
                      </div>
                      <p className="text-[10px] font-body font-bold uppercase tracking-[0.22em] text-white/30">Client Proof</p>
                    </div>
                    <h3 className="font-display font-semibold text-white text-[18px] leading-snug mb-3 group-hover:text-white transition-colors duration-300">{item.title}</h3>
                    <p className="text-[14px] text-white/62 leading-[1.9] font-body group-hover:text-white/72 transition-colors duration-300">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div data-testimonials-section className="mb-6">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <Label>Client Voices</Label>
                  <h3 data-sec-h2 className="text-2xl sm:text-3xl font-display font-bold text-white leading-[1.06] mt-2">
                    What business owners actually say.
                  </h3>
                </div>
                {/* Google rating badge */}
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.08]"
                  style={{ background: 'rgba(6,15,29,0.6)', backdropFilter: 'blur(12px)' }}>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />)}
                  </div>
                  <span className="text-[13px] font-display font-bold text-white">5.0</span>
                  <span className="text-[11px] text-white/35 font-body">on Google</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {testimonials.map((t) => (
                  <div key={t.name} data-testimonial-item
                    className="group relative rounded-2xl p-6 border border-white/[0.07] hover:border-white/[0.14] transition-all duration-500 overflow-hidden"
                    style={{ background: 'rgba(6,15,29,0.55)', backdropFilter: 'blur(20px)' }}
                  >
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(135deg,${t.color}14 0%,${t.color}06 55%,transparent 100%)` }} />
                    <div className="absolute top-0 left-0 right-0 h-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `linear-gradient(90deg,transparent,${t.color}50,transparent)` }} />

                    <div className="relative">
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-4">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <span key={i} className="text-[13px]" style={{ color: t.color }}>★</span>
                        ))}
                      </div>
                      {/* Quote */}
                      <p className="text-[14px] text-white/72 leading-[1.85] font-body mb-5 group-hover:text-white/80 transition-colors duration-300">
                        "{t.quote}"
                      </p>
                      {/* Author */}
                      <div className="flex items-center gap-3 border-t border-white/[0.06] pt-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-display font-bold flex-shrink-0"
                          style={{ background: `${t.color}20`, border: `1px solid ${t.color}28`, color: t.color }}>
                          {t.name.split(' ').map(w => w[0]).join('')}
                        </div>
                        <div>
                          <p className="text-[13px] font-display font-semibold text-white leading-none">{t.name}</p>
                          <p className="text-[10px] text-white/35 font-body mt-0.5">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Reviews CTA */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-white/[0.07]"
                style={{ background: 'rgba(6,15,29,0.45)', backdropFilter: 'blur(16px)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.25)' }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-display font-semibold text-white">See all our Google Reviews</p>
                    <p className="text-[11px] text-white/38 font-body mt-0.5">Rated 5.0 ★★★★★ by our clients</p>
                  </div>
                </div>
                <Link
                  to="/reviews"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-body font-semibold text-white border border-white/[0.12] hover:border-brand-500/50 hover:bg-brand-500/10 transition-all duration-300 flex-shrink-0"
                >
                  View All Reviews
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* CTA */}
            <div data-proof-item
              className="relative rounded-3xl p-8 sm:p-10 border border-white/[0.07] overflow-hidden"
              style={{ background: 'rgba(6,15,29,0.6)', backdropFilter: 'blur(20px)' }}
            >
              <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom right,rgba(42,139,255,0.1),transparent 60%)' }} />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-7">
                <div>
                  <Label>Next Step</Label>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white leading-snug mt-2 max-w-lg">
                    Ready to run your business with less friction and more focus?
                  </h3>
                  <p className="mt-3 text-[14px] text-white/55 leading-[1.8] font-body max-w-md">
                    One conversation is all it takes to discover what's possible when you have the right support behind you.
                  </p>
                </div>
                <div className="flex flex-col gap-3 flex-shrink-0">
                  <Button size="lg" href="/contact">
                    Contact Us <ArrowRight className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2 text-[10px] font-body font-bold uppercase tracking-[0.22em] text-white/30">
                    <CheckCircle className="h-3.5 w-3.5" style={{ color: '#38d9a9' }} />
                    Ready for tailored support
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            OUTRO — Location · Hours · Final CTA
        ══════════════════════════════════════ */}
        <section
          data-outro-section
          className="relative overflow-hidden border-t border-white/[0.06]"
          style={{ background: 'linear-gradient(175deg, rgba(1,4,12,0.99) 0%, #000306 100%)' }}
        >
          {/* Animated background grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.026]"
            style={{
              backgroundImage: 'linear-gradient(rgba(42,139,255,0.9) 1px,transparent 1px),linear-gradient(90deg,rgba(42,139,255,0.9) 1px,transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />

          {/* Corner atmospheric glows */}
          <div className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full"
            style={{ background: 'rgba(42,139,255,0.15)', filter: 'blur(150px)' }} />
          <div className="pointer-events-none absolute -bottom-40 -right-40 w-[440px] h-[440px] rounded-full"
            style={{ background: 'rgba(56,217,169,0.09)', filter: 'blur(150px)' }} />

          {/* Animated horizontal scan lines */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute left-0 right-0 h-px"
                style={{ top: `${18 + i * 22}%`, background: 'rgba(42,139,255,0.06)' }}
                animate={{ opacity: [0.1, 0.7, 0.1], x: ['-3%', '3%', '-3%'] }}
                transition={{ duration: 4.5 + i * 0.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.55 }}
              />
            ))}
          </div>

          {/* Animated vertical accent lines on sides */}
          <motion.div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(42,139,255,0.18), transparent)' }}
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(56,217,169,0.14), transparent)' }}
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Ghost company name behind */}
          <div
            className="pointer-events-none select-none absolute right-[-4%] top-1/2 -translate-y-1/2"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(9rem, 24vw, 22rem)',
              color: 'rgba(42,139,255,0.02)',
              lineHeight: 1,
              letterSpacing: '-0.06em',
            }}
          >
            BIZ
          </div>

          <Container className="relative z-10 py-20 sm:py-28">

            {/* ── Header ── */}
            <div className="mb-12 sm:mb-14">
              <div data-outro-title className="flex items-center gap-5 mb-7">
                <Label>Where We Operate</Label>
                <div
                  data-outro-bar
                  className="flex-1 max-w-[180px] h-px"
                  style={{
                    background: 'linear-gradient(90deg, rgba(42,139,255,0.5), transparent)',
                    transformOrigin: 'left',
                  }}
                />
              </div>

              <div data-outro-title>
                <SplitWords
                  text="Remote. Global."
                  as="h2"
                  className="font-display font-black text-white tracking-[-0.055em]"
                  style={{ fontSize: 'clamp(2.6rem, 7.5vw, 6.5rem)', lineHeight: 0.92 }}
                />
                <SplitWords
                  text="Always On."
                  as="h2"
                  delay={0.18}
                  className="font-display font-black text-gradient tracking-[-0.055em]"
                  style={{ fontSize: 'clamp(2.6rem, 7.5vw, 6.5rem)', lineHeight: 0.92 }}
                />
              </div>
            </div>

            {/* ── Three-card grid ── */}
            <div className="grid lg:grid-cols-3 gap-5 mb-10">

              {/* Location card — links to Google Maps */}
              <a
                data-outro-card
                href="https://share.google/yconWqaIeNBaoj4r5"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl p-7 border border-white/[0.07] hover:border-brand-500/40 transition-all duration-500 overflow-hidden block"
                style={{ background: 'rgba(6,15,29,0.78)', backdropFilter: 'blur(28px)' }}
              >
                {/* Card hover fill */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(135deg, rgba(42,139,255,0.14) 0%, rgba(42,139,255,0.05) 55%, transparent 100%)' }}
                />
                <div
                  className="pointer-events-none absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(42,139,255,0.7), transparent)' }}
                />
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 w-[2px] rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(180deg, rgba(42,139,255,0.8), rgba(42,139,255,0.2), transparent)' }}
                />

                {/* Live pulse badge */}
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="relative w-2.5 h-2.5 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-accent-400 animate-ping opacity-55" />
                    <div className="relative w-2.5 h-2.5 rounded-full bg-accent-400" />
                  </div>
                  <span className="text-[10px] font-body font-bold uppercase tracking-[0.28em] text-accent-400">
                    Live &amp; Operating
                  </span>
                </div>

                {/* Icon with drop animation target */}
                <div data-outro-pin className="mb-5">
                  <MapPin
                    className="w-10 h-10 text-brand-400 group-hover:scale-110 transition-transform duration-400"
                    style={{ filter: 'drop-shadow(0 0 0px rgba(42,139,255,0))' }}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = 'drop-shadow(0 0 14px rgba(42,139,255,0.75))' }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = 'drop-shadow(0 0 0px rgba(42,139,255,0))' }}
                  />
                </div>

                <h3 className="font-display font-bold text-white text-xl mb-2 group-hover:text-white transition-colors duration-300">
                  Our Location
                </h3>
                <p className="text-[13.5px] text-white/50 font-body leading-[1.75] mb-6">
                  London, United Kingdom<br />
                  <span className="text-white/32">Remote operations — serving clients worldwide</span>
                </p>

                <span className="inline-flex items-center gap-2 text-[12px] font-body font-bold uppercase tracking-[0.14em] text-brand-400 group-hover:gap-3 transition-all duration-300">
                  View on Google Maps
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </span>
              </a>

              {/* Operating hours card */}
              <div
                data-outro-card
                className="relative rounded-2xl p-7 border border-white/[0.07] overflow-hidden"
                style={{ background: 'rgba(6,15,29,0.78)', backdropFilter: 'blur(28px)' }}
              >
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(32,201,151,0.32), transparent)' }}
                />
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 w-[1px]"
                  style={{ background: 'linear-gradient(180deg, transparent, rgba(32,201,151,0.12), transparent)' }}
                />

                <Clock className="w-10 h-10 mb-5" style={{ color: '#20c997' }} />
                <h3 className="font-display font-bold text-white text-xl mb-5">Operating Hours</h3>

                <div className="space-y-4">
                  {[
                    { day: 'Monday – Friday', hours: '11:00 AM – 8:00 PM ET', active: true },
                    { day: 'Saturday',        hours: 'Closed',                 active: false },
                    { day: 'Sunday',          hours: 'Closed',                 active: false },
                  ].map((r) => (
                    <div key={r.day} className="flex items-center justify-between gap-4">
                      <span className="text-[13px] font-body text-white/45">{r.day}</span>
                      <span className={`text-[12px] font-body font-semibold ${r.active ? 'text-accent-400' : 'text-white/22'}`}>
                        {r.hours}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-white/28 font-body mt-5 pt-4 border-t border-white/[0.05] leading-[1.7]">
                  All times in Eastern Time (ET) &middot; Response within 24 hrs guaranteed
                </p>
              </div>

              {/* Final CTA card */}
              <div
                data-outro-card
                className="relative rounded-2xl p-7 border border-brand-500/24 overflow-hidden flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(148deg, rgba(42,139,255,0.13) 0%, rgba(42,139,255,0.04) 50%, rgba(6,15,29,0.88) 100%)',
                  backdropFilter: 'blur(28px)',
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse at top left, rgba(42,139,255,0.2), transparent 60%)' }}
                />
                <motion.div
                  className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px]"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(42,139,255,0.7), transparent)' }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />

                <div className="relative">
                  <Label>Ready to start?</Label>
                  <h3 className="font-display font-bold text-white text-2xl leading-snug mt-3 mb-3">
                    Start delegating today.
                  </h3>
                  <p className="text-[14px] text-white/52 font-body leading-[1.8] mb-7">
                    One conversation is all it takes. Book a free discovery call and find out what's possible.
                  </p>
                </div>

                <div className="relative flex flex-col gap-3">
                  <Button size="lg" href="/booking" className="w-full justify-center">
                    Book Free Call <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Link
                    to="/contact"
                    className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-xl text-[13px] font-body font-semibold border border-white/[0.1] text-white/55 hover:text-white hover:border-white/[0.24] transition-all duration-300"
                  >
                    Send a Message
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Bottom strip ── */}
            <div
              data-outro-bar
              className="flex flex-wrap items-center justify-between gap-4 pt-7 border-t border-white/[0.05]"
              style={{ transformOrigin: 'left' }}
            >
              <p className="text-[11px] font-body text-white/22 uppercase tracking-[0.22em]">
                BizBackerz Ltd &middot; London, UK &middot; Est. 2024
              </p>
              <div className="flex items-center gap-6">
                {[
                  { label: 'LinkedIn',  href: 'https://www.linkedin.com/company/105424987/' },
                  { label: 'Instagram', href: 'https://www.instagram.com/bizbackerzltd/' },
                  { label: 'Facebook',  href: 'https://www.facebook.com/BizBackerz' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-body text-white/28 hover:text-white/60 transition-colors duration-300 uppercase tracking-[0.18em]"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

          </Container>
        </section>

      </div>
    </div>
  )
}
