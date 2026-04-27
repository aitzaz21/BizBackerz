import React, { Suspense, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useInView } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
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
  MessageCircle,
  Orbit,
  ShieldCheck,
  Target,
  TrendingUp,
  UserCog,
  Users,
} from 'lucide-react'

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
function SplitWords({ text, className = '', delay = 0, as: Tag = 'span' }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <Tag ref={ref} className={className} style={{ display: 'block' }}>
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

  useEffect(() => {
    const m = window.matchMedia('(min-width:1024px) and (prefers-reduced-motion:no-preference)')
    const sync = () => setCanvas(m.matches)
    sync(); m.addEventListener('change', sync)
    return () => m.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const el = pageRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      /* hero */
      gsap.set('[data-ah-label]',   { opacity: 0, y: 16 })
      gsap.set('[data-ah-line]',    { yPercent: 110 })
      gsap.set('[data-ah-body]',    { opacity: 0, y: 22 })
      gsap.set('[data-ah-stats]',   { opacity: 0, y: 20 })
      gsap.set('[data-ah-cta]',     { opacity: 0, y: 18, scale: 0.95 })
      gsap.set('[data-ah-bignum]',  { opacity: 0 })

      const tl = gsap.timeline({ delay: 0.1 })
      tl.to('[data-ah-label]',  { opacity: 1, y: 0,     duration: 0.9, ease: 'power3.out' })
      tl.to('[data-ah-line]',   { yPercent: 0, stagger: 0.1, duration: 1.3, ease: 'power4.out' }, '-=0.15')
      tl.to('[data-ah-body]',   { opacity: 1, y: 0, stagger: 0.1, duration: 0.85, ease: 'power2.out' }, '-=0.7')
      tl.to('[data-ah-cta]',    { opacity: 1, y: 0, scale: 1,   duration: 0.8, ease: 'power2.out' }, '-=0.55')
      tl.to('[data-ah-stats]',  { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      tl.to('[data-ah-bignum]', { opacity: 1, duration: 2, ease: 'power1.out' }, '-=1.8')

      /* hero parallax */
      gsap.to('[data-ah-panel]', { y: -60, scrollTrigger: { trigger: '[data-ah-section]', start: 'top top', end: 'bottom top', scrub: 2 } })

      /* ── Scroll reveals — ALL with scroll-BACK (play reverse play reverse) ── */
      const reveal = (sel, trigger, opts = {}) =>
        gsap.from(sel, {
          opacity: 0, y: 40, ...opts,
          scrollTrigger: { trigger, start: 'top 82%', toggleActions: 'play reverse play reverse' },
        })

      reveal('[data-ch]', '[data-story-section]', { x: 50, y: 20, scale: 0.96, filter: 'blur(6px)', stagger: 0.08, duration: 0.95, ease: 'power3.out' })
      reveal('[data-manifesto-text]', '[data-manifesto-section]', { y: 70, scale: 0.97, filter: 'blur(8px)', duration: 1.15, ease: 'power3.out' })
      reveal('[data-stat-item]', '[data-stats-section]', { y: 50, scale: 0.94, filter: 'blur(8px)', stagger: 0.1, duration: 0.9, ease: 'power3.out' })
      reveal('[data-value-item]', '[data-values-section]', { y: 36, opacity: 0, stagger: 0.08, duration: 0.75, ease: 'power2.out' })
      reveal('[data-principle-item]', '[data-principles-section]', { x: 30, y: 20, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' })
      reveal('[data-proof-item]', '[data-proof-section]', { y: 40, scale: 0.96, filter: 'blur(6px)', stagger: 0.1, duration: 0.85, ease: 'power3.out' })
    }, el)
    return () => ctx.revert()
  }, [])

  const chapters = [
    { n: '01', title: 'We run behind-the-scenes work with front-row discipline.', body: 'Administrative execution, communication, and follow-through are treated as client-facing quality — not invisible support work.', color: '#2a8bff' },
    { n: '02', title: 'We build operating rhythm, not just task completion.',       body: 'Clear updates, predictable output, and systems that keep momentum even when your day gets crowded.',                              color: '#20c997' },
    { n: '03', title: 'We make growth feel lighter, not louder.',                   body: 'Our best work gives founders more calm, more control, and more room to focus on revenue, leadership, and the bigger picture.',    color: '#f59e0b' },
  ]

  const values = [
    { icon: Target,      title: 'Precision',     body: 'Every task delivered as if it\'s client-facing. No cut corners, no half-measures.',              color: '#2a8bff' },
    { icon: ShieldCheck, title: 'Reliability',   body: 'Consistent output, clear updates, no surprises. You always know where things stand.',             color: '#20c997' },
    { icon: TrendingUp,  title: 'Growth',        body: 'We scale with your business. Our support evolves as your needs evolve.',                          color: '#f59e0b' },
    { icon: Eye,         title: 'Transparency',  body: 'No hidden processes, no guesswork. Open communication at every step.',                            color: '#8b5cf6' },
  ]

  const principles = [
    { icon: MessageCircle, n: '01', title: 'Clear Communication', body: 'Fast responses, clean updates, and zero ambiguity around ownership or next steps.',                         color: '#2a8bff' },
    { icon: UserCog,       n: '02', title: 'Tailored Support',    body: 'We shape workflows around how your business actually runs — not generic templates.',                        color: '#20c997' },
  ]

  const proofCards = [
    { icon: ShieldCheck, title: 'Responsive enough to protect momentum.', body: 'Clients highlight proactive follow-up, fast updates, and the feeling that nothing is ever dropped.',  color: '#2a8bff' },
    { icon: Orbit,       title: 'Structured enough to feel premium.',     body: 'It is not just tasks done — it is the calmer, more reliable operating rhythm founders feel around us.', color: '#20c997' },
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
        <div className="about-ambient-blob absolute -left-24 top-0 h-[36rem] w-[36rem] rounded-full blur-[140px]" style={{ background: 'rgba(42,139,255,0.12)' }} />
        <div className="about-ambient-blob absolute right-[-6rem] top-[14rem] h-[32rem] w-[32rem] rounded-full blur-[150px]" style={{ background: 'rgba(56,217,169,0.10)' }} />
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
        <section data-ah-section className="relative overflow-hidden pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-20">

          {/* faint oversized number behind */}
          <div data-ah-bignum className="absolute right-[-2%] top-[5%] select-none pointer-events-none" style={{ opacity: 0 }}>
            <span className="font-display font-bold" style={{ fontSize: 'clamp(8rem,16vw,18rem)', color: 'rgba(42,139,255,0.014)', lineHeight: 1, letterSpacing: '-0.05em' }}>
              20+
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
                    { text: '20+ Years',           cls: '' },
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
              <div className="max-w-2xl space-y-5 mb-10">
                <p data-ah-body className="text-[16px] sm:text-[17px] leading-[1.9] text-white/72 font-body">
                  BizBackerz was built on a simple belief — world-class execution shouldn't be
                  reserved for Fortune 500 companies. We bring the same discipline, clarity, and
                  responsiveness to growing businesses that want to operate like industry leaders.
                </p>
                <p data-ah-body className="border-l-2 border-brand-500/40 pl-5 text-[15px] leading-[1.9] text-white/60 font-body">
                  We support founders with the structure and judgment that usually only comes
                  after years of hard operational work.
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
                  { end: 20,  suffix: '+', label: 'Years Experience',   color: '#2a8bff' },
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
              ['20+ Years Combined Experience','Premium Virtual Operations','Clear Communication',
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
          texts={['20+ YEARS', '·', 'OPERATIONAL EXCELLENCE', '·', 'DELEGATE TO DOMINATE', '·', 'PREMIUM SUPPORT', '·']}
          direction={1}
          opacity={0.04}
          fontSize="clamp(3.2rem,7vw,8rem)"
          speed={1.3}
        />

        {/* ══════════════════════════════════════
            MANIFESTO
        ══════════════════════════════════════ */}
        <section data-manifesto-section className="relative py-20 sm:py-28 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%,rgba(42,139,255,0.045),transparent)' }} />
          <div className="absolute left-0 right-0 top-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(42,139,255,0.14) 30%,rgba(42,139,255,0.14) 70%,transparent)' }} />
          <div className="absolute left-0 right-0 bottom-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(42,139,255,0.14) 30%,rgba(42,139,255,0.14) 70%,transparent)' }} />

          <Container>
            <div className="text-center max-w-4xl mx-auto">
              {/* decorative quote glyph */}
              <div className="text-[10rem] leading-none font-display font-bold select-none pointer-events-none mb-[-2rem]"
                style={{ color: 'rgba(42,139,255,0.06)' }}>"</div>

              <div data-manifesto-text>
                <SplitWords
                  text="We don't just manage tasks."
                  as="p"
                  delay={0}
                  className="font-display font-bold tracking-[-0.04em] text-white leading-[1.04]"
                  style={{ fontSize: 'clamp(1.9rem,4.5vw,3.8rem)' }}
                />
                <SplitWords
                  text="We protect your momentum."
                  as="p"
                  delay={0.28}
                  className="font-display font-bold tracking-[-0.04em] text-gradient leading-[1.04] mt-1"
                  style={{ fontSize: 'clamp(1.9rem,4.5vw,3.8rem)' }}
                />
              </div>

              <div className="flex items-center justify-center gap-5 mt-10">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-brand-500/45" />
                <p className="text-[10px] font-body font-bold uppercase tracking-[0.28em] text-white/35">The BizBackerz Standard</p>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-brand-500/45" />
              </div>
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            STORY / CHAPTERS
        ══════════════════════════════════════ */}
        <section data-story-section className="relative py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">

              {/* sticky left */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <Label>The Story</Label>
                  <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mb-5 mt-2">
                    We treat support work like brand work.
                  </h2>
                  <p className="text-[15px] leading-[1.9] text-white/62 font-body max-w-sm">
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
                    className="group relative rounded-2xl p-7 sm:p-8 border border-white/[0.07] hover:border-white/[0.12] transition-colors duration-500"
                    style={{ background: 'rgba(6,15,29,0.5)', backdropFilter: 'blur(16px)' }}
                  >
                    {/* color bar */}
                    <div className="absolute inset-y-0 left-0 w-[2px] rounded-l-2xl" style={{ background: `linear-gradient(180deg,${c.color}cc,transparent)` }} />
                    <div className="grid sm:grid-cols-[90px,1fr] gap-6">
                      <div>
                        <span className="inline-flex rounded-full px-3 py-1.5 text-[10px] font-body font-bold uppercase tracking-[0.22em]"
                          style={{ border: `1px solid ${c.color}25`, color: c.color, background: `${c.color}0c` }}>
                          {c.n}
                        </span>
                        <div className="mt-3 font-display text-5xl font-bold leading-none" style={{ color: `${c.color}15` }}>{parseInt(c.n)}</div>
                      </div>
                      <div>
                        <h3 className="text-[1.1rem] sm:text-xl font-display font-semibold text-white leading-[1.15] mb-3">{c.title}</h3>
                        <p className="text-[14px] sm:text-[15px] text-white/62 leading-[1.9] font-body">{c.body}</p>
                        <div className="flex items-center gap-2 mt-5 text-[10px] font-body font-bold uppercase tracking-[0.22em] text-white/30">
                          Read the standard
                          <ChevronRight className="h-3.5 w-3.5" style={{ color: c.color }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Kinetic 2 — reverses direction */}
        <KineticStrip
          texts={['CLEAR COMMUNICATION', '·', 'FOUNDER FOCUSED', '·', 'CLIENT FIRST', '·', 'BIZBACKERZ', '·']}
          direction={-1}
          opacity={0.038}
          fontSize="clamp(3.2rem,7vw,8rem)"
          speed={1.5}
        />

        {/* ══════════════════════════════════════
            BY THE NUMBERS
        ══════════════════════════════════════ */}
        <section data-stats-section className="relative py-16 sm:py-20">
          <Container>
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <Label>By The Numbers</Label>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mt-2 max-w-lg">
                  Numbers that tell the story before we do.
                </h2>
              </div>
              <p className="text-[14px] text-white/55 font-body max-w-xs leading-[1.8]">
                Experience, output, and client trust — measured.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
              {[
                { end: 20,  suffix: '+', label: 'Years Combined Experience', color: '#2a8bff', pct: 85 },
                { end: 500, suffix: '+', label: 'Tasks Completed',           color: '#20c997', pct: 92 },
                { end: 50,  suffix: '+', label: 'Satisfied Clients',         color: '#f59e0b', pct: 78 },
                { end: 98,  suffix: '%', label: 'Client Retention Rate',     color: '#8b5cf6', pct: 98 },
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
        <section data-values-section className="relative py-16 sm:py-20">
          <Container>
            <div className="mb-12">
              <Label>What We Stand For</Label>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mt-2 max-w-xl">
                Built on values that show in every interaction.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
              {values.map((v) => (
                <div key={v.title} data-value-item className="group">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${v.color}14`, border: `1px solid ${v.color}22` }}
                  >
                    <v.icon className="w-4 h-4" style={{ color: v.color }} />
                  </div>
                  <h3 className="font-display font-semibold text-white text-[17px] mb-2">{v.title}</h3>
                  <p className="text-[14px] text-white/62 leading-[1.85] font-body">{v.body}</p>
                  {/* animated underline on hover */}
                  <div className="mt-4 h-px w-0 group-hover:w-10 transition-all duration-500 rounded-full" style={{ background: v.color }} />
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            OPERATING PRINCIPLES — text-first, no cards
        ══════════════════════════════════════ */}
        <section data-principles-section className="relative py-16 sm:py-20">
          <Container>
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
              <div>
                <Label>Operating Principles</Label>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mt-2 mb-6">
                  How we show up, every single time.
                </h2>
                <p className="text-[15px] text-white/62 leading-[1.9] font-body">
                  Two principles guide every engagement, every update, and every deliverable
                  we produce on your behalf. Not policies — habits.
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
            EXPERIENCE ARCHITECTURE — minimal
        ══════════════════════════════════════ */}
        <section className="relative py-16 sm:py-20 border-t border-white/[0.06]">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-end">
              <div>
                <Label>Experience Architecture</Label>
                <div className="font-display font-bold leading-none text-white/6 mt-4 mb-[-0.5rem]"
                  style={{ fontSize: 'clamp(5rem,12vw,10rem)' }}>20+</div>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] max-w-lg">
                  Years of combined experience shaping how support should feel.
                </h2>
              </div>
              <div className="space-y-8">
                {[
                  { icon: Clock,  label: '20+ Years', title: 'Operational intuition shaped by long-term client work.', body: 'Experience shows up in prioritization, communication, and calmer execution under pressure.',          color: '#2a8bff' },
                  { icon: Users,  label: 'Trusted',   title: 'Dependable help that gives founders room to focus.',     body: 'Less time in follow-up and admin means more time for revenue, leadership, and vision.',                color: '#20c997' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-5 group">
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: `${item.color}14`, border: `1px solid ${item.color}22` }}>
                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-body font-bold uppercase tracking-[0.22em] mb-1.5" style={{ color: item.color }}>{item.label}</p>
                      <h3 className="font-display font-semibold text-white text-[16px] mb-2 leading-snug">{item.title}</h3>
                      <p className="text-[14px] text-white/60 leading-[1.9] font-body">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ══════════════════════════════════════
            CLIENT PROOF
        ══════════════════════════════════════ */}
        <section data-proof-section className="relative py-16 sm:py-20 border-t border-white/[0.06]">
          <Container>
            <div className="mb-12">
              <Label>Client Proof</Label>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mt-2 max-w-2xl">
                Premium only matters if clients can feel it.
              </h2>
              <p className="mt-4 text-[15px] text-white/62 leading-[1.9] font-body max-w-xl">
                The recurring pattern in feedback is not just speed — it is relief, reliability,
                and the sense that someone serious is handling the moving parts.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-10">
              {proofCards.map((item) => (
                <div key={item.title} data-proof-item
                  className="group relative rounded-2xl p-7 border border-white/[0.07] hover:border-white/[0.13] transition-all duration-500"
                  style={{ background: 'rgba(6,15,29,0.5)', backdropFilter: 'blur(16px)' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[1px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg,transparent,${item.color}40,transparent)` }} />
                  <div className="flex gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${item.color}14`, border: `1px solid ${item.color}22` }}>
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <p className="text-[10px] font-body font-bold uppercase tracking-[0.22em] text-white/30 mt-2">Client Proof</p>
                  </div>
                  <h3 className="font-display font-semibold text-white text-[17px] leading-snug mb-3">{item.title}</h3>
                  <p className="text-[14px] text-white/62 leading-[1.9] font-body">{item.body}</p>
                </div>
              ))}
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

      </div>
    </div>
  )
}
