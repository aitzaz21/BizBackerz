import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import Container from '../ui/Container'
import Button from '../ui/Button'
import { ArrowRight, Lightbulb, Rocket, Award, ArrowUpRight, Zap, Star } from 'lucide-react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&'

function scrambleWord(containerEl, delay = 0) {
  const spans = containerEl.querySelectorAll('[data-ch]')
  spans.forEach((span, i) => {
    const target = span.dataset.ch
    if (!target || target === ' ') return
    let iter = 0
    const maxIter = 7 + i
    setTimeout(() => {
      const iv = setInterval(() => {
        span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)]
        iter++
        if (iter >= maxIter) { span.textContent = target; clearInterval(iv) }
      }, 35)
    }, delay + i * 22)
  })
}

function ScrambleWord({ text, className = '' }) {
  return (
    <span className={`inline-block ${className}`}>
      {text.split('').map((char, i) => (
        <span key={i} data-ch={char === ' ' ? ' ' : char} style={{ display: 'inline-block' }}>
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  )
}

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
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration, suffix])
  return <span ref={ref}>0{suffix}</span>
}

export default function Hero() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const spotlight = el.querySelector('[data-spotlight]')
    const handleMouse = (e) => {
      if (!spotlight) return
      const rect = el.getBoundingClientRect()
      gsap.to(spotlight, {
        x: e.clientX - rect.left - 400,
        y: e.clientY - rect.top - 400,
        duration: 1.6, ease: 'power2.out',
      })
    }
    el.addEventListener('mousemove', handleMouse)

    const ctx = gsap.context(() => {
      gsap.set('[data-hero-label]',     { opacity: 0, x: -30 })
      gsap.set('[data-hero-line]',      { yPercent: 115 })
      gsap.set('[data-hero-sub]',       { opacity: 0, y: 18 })
      gsap.set('[data-hero-desc]',      { opacity: 0, y: 18 })
      gsap.set('[data-hero-cta]',       { opacity: 0, y: 20, scale: 0.94 })
      gsap.set('[data-hero-stats]',     { opacity: 0, y: 24 })
      gsap.set('[data-hero-card]',      { opacity: 0, x: 55, filter: 'blur(12px)' })
      gsap.set('[data-hero-line-draw]', { scaleX: 0, transformOrigin: 'left center' })
      gsap.set('[data-hero-bg-text]',   { opacity: 0 })

      const tl = gsap.timeline({ delay: 0.1 })

      tl.to('[data-hero-label]', { opacity: 1, x: 0, duration: 1.2, ease: 'power3.out' })
      tl.to('[data-hero-line-draw]', { scaleX: 1, duration: 1.3, ease: 'power3.inOut' }, '-=0.8')

      const lines = el.querySelectorAll('[data-hero-line]')
      lines.forEach((line, i) => {
        const wordEl = line.querySelector('[data-word]')
        tl.to(line, {
          yPercent: 0, duration: 1.5, ease: 'power4.out',
          onStart: () => { if (wordEl) scrambleWord(wordEl, 0) },
        }, i === 0 ? '-=0.9' : '-=1.2')
      })

      tl.to('[data-hero-sub]',  { opacity: 1, y: 0, duration: 1,   ease: 'power2.out' }, '-=0.9')
      tl.to('[data-hero-desc]', { opacity: 1, y: 0, duration: 1,   ease: 'power2.out' }, '-=0.8')
      tl.to('[data-hero-cta]',  { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.16, ease: 'power2.out' }, '-=0.75')
      tl.to('[data-hero-stats]',{ opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power2.out' }, '-=0.5')
      tl.to('[data-hero-bg-text]', { opacity: 1, duration: 2, ease: 'power1.out' }, '-=1.4')

      gsap.to('[data-hero-card]', {
        opacity: 1, x: 0, filter: 'blur(0px)',
        duration: 1.6, stagger: 0.18, delay: 0.5, ease: 'power3.out',
      })

      gsap.to('[data-hero-heading]', {
        y: -90, opacity: 0.2,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 2.5 },
      })
      gsap.to('[data-hero-right]', {
        y: -45,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 4 },
      })
      gsap.to('[data-hero-bg-text]', {
        y: -80, x: 30,
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 7 },
      })
    }, el)

    return () => { ctx.revert(); el.removeEventListener('mousemove', handleMouse) }
  }, [])

  const features = [
    {
      icon: Lightbulb,
      title: 'Advice & Guides',
      text: 'Receive step-by-step guidance from industry experts, ensuring you make informed decisions with confidence at every stage.',
      color: '#2a8bff',
      tag: 'Expert Insight',
    },
    {
      icon: Rocket,
      title: 'Great Solutions',
      text: 'Discover innovative, practical fixes for your daily bottlenecks so you can focus entirely on scaling your business.',
      color: '#20c997',
      tag: 'Growth Focused',
    },
    {
      icon: Zap,
      title: 'Fast Execution',
      text: 'Quick turnarounds and reliable delivery. We treat your deadlines as commitments, not suggestions.',
      color: '#f59e0b',
      tag: 'Speed & Quality',
    },
  ]

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-start overflow-hidden"
    >
      {/* Mouse-follow spotlight */}
      <div
        data-spotlight
        className="pointer-events-none absolute z-[1]"
        style={{
          width: '800px', height: '800px',
          top: 0, left: 0,
          background: 'radial-gradient(circle, rgba(42,139,255,0.055) 0%, transparent 65%)',
          borderRadius: '50%',
          willChange: 'transform',
        }}
      />

      {/* Background oversized text */}
      <div
        data-hero-bg-text
        className="absolute pointer-events-none select-none z-[1]"
        style={{ right: '-2%', top: '5%', opacity: 0 }}
      >
        <span
          className="font-display font-bold"
          style={{
            fontSize: 'clamp(10rem, 20vw, 24rem)',
            color: 'rgba(42,139,255,0.016)',
            lineHeight: 1,
            letterSpacing: '-0.05em',
            whiteSpace: 'nowrap',
          }}
        >
          VA
        </span>
      </div>

      {/* Atmospheric gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-950/25 to-navy-950 z-[1] pointer-events-none" />

      {/* Glow orbs */}
      <div className="absolute top-[-18%] left-[12%] w-[850px] h-[850px] bg-brand-500/6 rounded-full blur-[200px] z-[1] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[0%] right-[-8%] w-[550px] h-[550px] bg-accent-500/5 rounded-full blur-[160px] z-[1] pointer-events-none" style={{ animation: 'float 7s ease-in-out 1.5s infinite' }} />
      <div className="absolute top-[35%] left-[-8%] w-[380px] h-[380px] bg-brand-700/4 rounded-full blur-[130px] z-[1] pointer-events-none" />
      <div className="absolute top-[18%] right-[24%] w-[180px] h-[180px] bg-accent-400/4 rounded-full blur-[80px] z-[1] pointer-events-none animate-float" style={{ animationDelay: '3s' }} />

      {/* Grain texture */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.022,
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(42,139,255,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(42,139,255,0.025) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Decorative vertical accent lines */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute top-0 bottom-0"
          style={{ right: '34%', width: '1px', background: 'linear-gradient(180deg, transparent, rgba(42,139,255,0.065) 20%, rgba(42,139,255,0.065) 80%, transparent)' }}
        />
        <div className="absolute top-0 bottom-0"
          style={{ right: '41%', width: '1px', background: 'linear-gradient(180deg, transparent, rgba(42,139,255,0.03) 20%, rgba(42,139,255,0.03) 80%, transparent)' }}
        />
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <Container className="relative z-10 pt-8 pb-12 lg:pt-10 lg:pb-14 w-full">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-10 items-center">

          {/* ════ LEFT ════ */}
          <div className="lg:col-span-7" data-hero-heading>

            {/* Label row */}
            <div data-hero-label className="flex items-center gap-4 mb-10">
              <span className="section-label">
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse flex-shrink-0" />
                Talk To An Expert
              </span>
              <div
                data-hero-line-draw
                className="h-px max-w-[80px] flex-1"
                style={{ background: 'linear-gradient(90deg, rgba(42,139,255,0.5), transparent)' }}
              />
              <a
                href="tel:9046686362"
                className="text-white/20 text-[11px] font-body font-semibold tracking-[0.18em] hover:text-white/50 transition-colors duration-300"
              >
                (904) 668-6362
              </a>
            </div>

            {/* Giant heading */}
            <div className="mb-7">
              <h1 className="font-display font-bold tracking-[-0.045em]">
                <div style={{ overflow: 'hidden', lineHeight: 1.0, paddingBottom: '0.06em' }}>
                  <span data-hero-line className="block text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[7.5rem]" style={{ color: '#f1f5f9' }}>
                    <span data-word><ScrambleWord text="Dedicated" /></span>
                  </span>
                </div>
                <div style={{ overflow: 'hidden', lineHeight: 1.0, paddingBottom: '0.06em' }}>
                  <span data-hero-line className="block text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[7.5rem]" style={{ color: 'rgba(241,245,249,0.7)' }}>
                    <span data-word><ScrambleWord text="Virtual" /></span>
                  </span>
                </div>
                <div style={{ overflow: 'hidden', lineHeight: 1.0, paddingBottom: '0.06em' }}>
                  <span data-hero-line className="block text-5xl sm:text-6xl lg:text-[5.5rem] xl:text-[7.5rem] text-gradient">
                    <span data-word><ScrambleWord text="Assistance." /></span>
                  </span>
                </div>
              </h1>
            </div>

            {/* Sub-divider */}
            <div data-hero-sub className="flex items-center gap-5 mb-9">
              <div className="h-px flex-shrink-0 w-16 bg-gradient-to-r from-brand-500/50 to-transparent" />
              <p className="text-white/28 text-[11px] font-body font-bold tracking-[0.3em] uppercase">
                Defining Success
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
            </div>

            {/* Description */}
            <p data-hero-desc className="text-[16px] sm:text-[17px] text-white/40 leading-[1.9] max-w-lg mb-10 font-body">
              Focus on what truly matters while we handle the rest. BizBackerz offers
              dedicated virtual support — from admin to client follow-up — keeping your
              day running with precision.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-11">
              <div data-hero-cta>
                <Button size="lg" href="https://calendly.com/oliver-reid-bizbackerz/30min" data-cursor-label="BOOK">
                  Hire Now! <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div data-hero-cta>
                <Button variant="secondary" size="lg" href="https://calendly.com/oliver-reid-bizbackerz/30min" data-cursor-label="BOOK">
                  Book Schedule Now
                </Button>
              </div>
            </div>

            {/* Stats row */}
            <div className="pt-7 border-t border-white/[0.055]">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
                {[
                  { end: 5,   suffix: '+', label: 'Years Experience' },
                  { end: 500, suffix: '+', label: 'Tasks Completed' },
                  { end: 98,  suffix: '%', label: 'Satisfaction Rate' },
                ].map((stat) => (
                  <div key={stat.label} data-hero-stats className="flex flex-col">
                    <div className="font-display font-bold text-[2rem] leading-none text-gradient-animated">
                      <CountUp end={stat.end} suffix={stat.suffix} />
                    </div>
                    <p className="text-[10px] text-white/25 font-body font-bold uppercase tracking-[0.22em] mt-1.5">
                      {stat.label}
                    </p>
                  </div>
                ))}

                {/* Verified badge */}
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
                    <p className="text-[10px] text-white/30 font-body font-bold uppercase tracking-[0.18em]">
                      Verified & Trusted
                    </p>
                    <p className="text-[12px] text-white/45 font-body mt-0.5">By 50+ businesses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ════ RIGHT ════ */}
          <div className="lg:col-span-5" data-hero-right>

            <p data-hero-card className="section-label mb-6">
              Guidance From Our Expert Team
            </p>

            <p data-hero-card className="text-white/33 text-[14px] leading-[1.9] mb-8 font-body">
              Every detail handled with precision and care, letting you focus on
              what truly moves the needle for your business.
            </p>

            <div className="space-y-3.5">
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  data-hero-card
                  data-cursor-label="VIEW"
                  whileHover={{ y: -6, scale: 1.016 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  className="group glass card-glow rounded-2xl p-5 cursor-default"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg,${f.color}22,${f.color}06)`,
                        border: `1px solid ${f.color}20`,
                        boxShadow: `0 4px 20px ${f.color}10`,
                      }}
                    >
                      <f.icon className="w-5 h-5" style={{ color: f.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-display font-semibold text-white text-[14px] leading-snug">
                            {f.title}
                          </h3>
                          <span
                            className="inline-block text-[9px] font-body font-bold uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-full mt-0.5"
                            style={{
                              color: f.color,
                              background: `${f.color}10`,
                              border: `1px solid ${f.color}18`,
                            }}
                          >
                            {f.tag}
                          </span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 flex-shrink-0 text-white/12 group-hover:text-white/45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 mt-0.5" />
                      </div>
                      <p className="text-[12px] text-white/28 leading-relaxed font-body">{f.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social proof strip */}
            <div
              data-hero-card
              className="mt-4 flex items-center gap-4 px-4 py-3 rounded-2xl"
              style={{
                background: 'rgba(42,139,255,0.04)',
                border: '1px solid rgba(42,139,255,0.08)',
              }}
            >
              <div className="flex -space-x-2 flex-shrink-0">
                {['O','M','S','A'].map((letter, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-navy-950 flex items-center justify-center text-[9px] font-bold font-display"
                    style={{
                      background: `linear-gradient(135deg, ${['#2a8bff','#20c997','#f59e0b','#8b5cf6'][i]}35, ${['#2a8bff','#20c997','#f59e0b','#8b5cf6'][i]}15)`,
                      color: ['#2a8bff','#20c997','#f59e0b','#8b5cf6'][i],
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-current" style={{ color: '#f59e0b' }} />
                  ))}
                </div>
                <p className="text-[11px] text-white/30 font-body">Trusted by 50+ business owners</p>
              </div>
            </div>
          </div>

        </div>
      </Container>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-navy-950 to-transparent z-[3] pointer-events-none" />
    </section>
  )
}
