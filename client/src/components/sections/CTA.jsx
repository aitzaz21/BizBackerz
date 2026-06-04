import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Container from '../ui/Container'
import Button from '../ui/Button'
import KineticStrip from '../ui/KineticStrip'
import { ArrowRight, Zap, Star, ChevronLeft, ChevronRight } from 'lucide-react'

/* ─── Slot-machine counter ─── */
function SlotCounter({ target, suffix = '' }) {
  return <span>{target}{suffix}</span>
}

/* ─── shared mobile check ─── */
const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches

/* ─── Challenge banner ─── */
function ChallengeBanner() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (isTouchDevice()) return
    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0, scale: 0.92, y: 60,
        duration: 1.2, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play reverse play reverse' },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="mb-12 lg:mb-16">
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(56,217,169,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(82,173,255,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")` }} />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-400/35 to-transparent" />
        <div className="relative z-10 px-8 py-12 lg:px-16 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/12 animate-pulse-glow">
              <Zap className="w-8 h-8 text-accent-400" />
            </div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-[0.02em] mb-2">
                We Are Ready To Take On Challenges!
              </h3>
              <p className="text-white/62 font-body text-[15px]">
                We handle tough tasks with expertise, delivering reliable solutions to help your business succeed.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0" data-cursor-label="VIEW">
            <Button variant="accent" size="lg" href="/services">
              View Cases <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Impact Numbers — world-class full-bleed display ─── */
function ImpactNumbers() {
  const ref    = useRef(null)
  const leftRef  = useRef(null)
  const rightRef = useRef(null)

  useEffect(() => {
    const el = ref.current; if (!el) return
    if (isTouchDevice()) return
    const ctx = gsap.context(() => {
      /* heading clip-reveal */
      gsap.from('[data-impact-label]', {
        opacity: 0, y: 20, duration: 0.9, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 68%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-impact-line]', {
        yPercent: 115, duration: 1.4, stagger: 0.1, ease: 'power4.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 66%', toggleActions: 'play reverse play reverse' },
      })

      /* huge numbers burst in */
      gsap.from('[data-impact-num]', {
        scale: 0.5, opacity: 0,
        duration: 1.1, stagger: 0.14, ease: 'expo.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 60%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-impact-sub]', {
        opacity: 0, y: 18, duration: 0.9, stagger: 0.12, ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 58%', toggleActions: 'play reverse play reverse' },
      })

      /* bars */
      gsap.fromTo('[data-impact-bar]', { scaleX: 0, transformOrigin: 'left center' }, {
        scaleX: 1, duration: 1.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 56%', toggleActions: 'play reverse play reverse' },
      })

      /* subtle parallax on side panels */
      gsap.to(leftRef.current, {
        y: -28,
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 2 },
      })
      gsap.to(rightRef.current, {
        y: -14,
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 3 },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  const stats = [
    { num: 95, suffix: '%', label: 'Workflow Optimized',  bar: 0.95, color: '#2a8bff' },
    { num: 90, suffix: '%', label: 'Business Growth',     bar: 0.90, color: '#38d9a9' },
    { num: 98, suffix: '%', label: 'Client Satisfaction', bar: 0.98, color: '#8b5cf6' },
    { num: 50, suffix: '+', label: 'Businesses Served',   bar: 0.75, color: '#f59e0b' },
  ]

  return (
    <div ref={ref} className="mb-12 lg:mb-16">
      {/* Section header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div data-impact-label className="flex justify-center mb-5">
          <span className="section-label">Our Impact</span>
        </div>
        <h2 className="font-display font-bold tracking-[0.02em]">
          <div className="gsap-line-clip" style={{ lineHeight:1.05, paddingBottom:'0.05em' }}>
            <span data-impact-line className="block text-4xl sm:text-5xl lg:text-6xl text-white">We Power Your</span>
          </div>
          <div className="gsap-line-clip" style={{ lineHeight:1.05, paddingBottom:'0.05em' }}>
            <span data-impact-line className="block text-4xl sm:text-5xl lg:text-6xl">
              <span className="text-gradient">Productivity</span> & Success
            </span>
          </div>
        </h2>
      </div>

      {/* Numbers grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] rounded-3xl overflow-hidden">
        {stats.map((s, i) => (
          <div
            key={s.label}
            ref={i === 0 ? leftRef : i === 3 ? rightRef : null}
            className="bg-navy-950 p-5 sm:p-8 lg:p-10 flex flex-col items-center text-center group hover:bg-[#060f1d] transition-colors duration-300"
          >
            <div
              data-impact-num
              className="font-display font-bold leading-none mb-2"
              style={{ fontSize:'clamp(2.5rem,5vw,6rem)', color: s.color }}
            >
              <SlotCounter target={s.num} suffix={s.suffix} />
            </div>
            <p data-impact-sub className="text-[11px] sm:text-[12px] text-white/45 font-body font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] mb-4">{s.label}</p>
            <div className="mt-auto h-px bg-white/[0.06] overflow-hidden w-full">
              <div
                data-impact-bar
                className="h-full origin-left"
                style={{ background: s.color, width: `${s.bar * 100}%`, transform: 'scaleX(0)' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Streamline banner ─── */
function StreamlineBanner() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (isTouchDevice()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-stream-inner]', {
        opacity: 0, scale: 0.93, y: 40,
        duration: 1.1, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 69%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-stream-line]', {
        yPercent: 110, stagger: 0.1, duration: 1.3, ease: 'power4.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 66%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-stream-body]', {
        opacity: 0, y: 22, duration: 1, ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 62%', toggleActions: 'play reverse play reverse' },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="mb-12 lg:mb-16">
      <div data-stream-inner className="panel-blur relative rounded-3xl p-10 lg:p-16 text-center overflow-hidden border border-white/[0.08]"
        style={{ background:'rgba(6,15,29,0.6)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(42,139,255,0.07),transparent_65%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-brand-500/25 to-transparent" />
        <div className="relative z-10">
          <h2 className="font-display font-bold tracking-[0.02em] mb-5">
            <div className="gsap-line-clip" style={{ lineHeight:1.06, paddingBottom:'0.05em' }}>
              <span data-stream-line className="block text-3xl sm:text-4xl lg:text-5xl text-white">Looking To Streamline</span>
            </div>
            <div className="gsap-line-clip" style={{ lineHeight:1.06, paddingBottom:'0.05em' }}>
              <span data-stream-line className="block text-3xl sm:text-4xl lg:text-5xl text-gradient">Your Business Operations?</span>
            </div>
          </h2>
          <p data-stream-body className="text-white/62 max-w-xl mx-auto leading-[1.88] font-body text-[15px]">
            We transform your daily operations with smart virtual solutions, freeing your time
            so you can focus entirely on growing your business.
          </p>
          <div data-stream-body className="mt-8 flex justify-center">
            <Button size="lg" href="/booking">
              Book Free Consultation <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Testimonials ─── */
const testimonials = [
  { text: "Been working with Bizbackerz for 2 months now, and very satisfied!!! They're innovative, they help me come up with marketing ideas, suggestions, they make phone calls, send emails, and Text messages. Anytime a new lead comes in they let me know right away !!! If you want to take your business to the next level you need to hire them !!! Highly recommend — You will be impressed.", name: 'Rocky Mariano',    role: 'Real Estate Agent', initial: 'R' },
  { text: "They have been a game-changer for my workflow. Extremely willing to jump in and get to work immediately, consistently bringing great ideas and high-quality deliverables. Their ability to follow up without being prompted has saved me significant time and energy. The efficiency, creativity, and reliability they provide is an incredible value — truly gears-level ROI.", name: 'Carlos Espejo',    role: 'Real Estate Agent', initial: 'C' },
  { text: "The team is so committed to my business' success. I love that. I highly recommend them. They are really up'ing my social media game and adding a new chapter to my marketing with videos.", name: 'Johnetta Dillard', role: 'Broker',             initial: 'J' },
]

function TestimonialsSection() {
  const [cur, setCur] = useState(0)
  const ref     = useRef(null)
  const quoteRef = useRef(null)

  const go = (next) => {
    if (!quoteRef.current) { setCur(next); return }
    gsap.to(quoteRef.current, {
      opacity: 0, y: 24, duration: 0.28, ease: 'power2.in',
      onComplete: () => {
        setCur(next)
        gsap.fromTo(quoteRef.current,
          { opacity: 0, y: -24 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        )
      },
    })
  }

  const next = () => go((cur + 1) % testimonials.length)
  const prev = () => go((cur - 1 + testimonials.length) % testimonials.length)

  useEffect(() => { const t = setInterval(() => go((cur + 1) % testimonials.length), 9000); return () => clearInterval(t) }, [cur])

  useEffect(() => {
    const el = ref.current; if (!el) return
    if (isTouchDevice()) return
    const ctx = gsap.context(() => {
      gsap.from('[data-test-label]', {
        opacity: 0, x: -20, duration: 1, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 68%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-test-line]', {
        yPercent: 115, duration: 1.4, stagger: 0.1, ease: 'power4.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 66%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-test-body]', {
        opacity: 0, y: 36, scale: 0.97, duration: 1.1, ease: 'power3.out',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 60%', toggleActions: 'play reverse play reverse' },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  const t = testimonials[cur]

  return (
    <div ref={ref} className="mb-12 lg:mb-16">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div data-test-label className="flex justify-center mb-5">
          <span className="section-label">Testimonials</span>
        </div>
        <h2 className="font-display font-bold tracking-[0.02em]">
          <div className="gsap-line-clip" style={{ lineHeight:1.06, paddingBottom:'0.05em' }}>
            <span data-test-line className="block text-3xl sm:text-4xl lg:text-5xl text-white">Transforming Your Business</span>
          </div>
          <div className="gsap-line-clip" style={{ lineHeight:1.06, paddingBottom:'0.05em' }}>
            <span data-test-line className="block text-3xl sm:text-4xl lg:text-5xl">
              Into A <span className="text-gradient">Success Story</span>
            </span>
          </div>
        </h2>
      </div>

      <div data-test-body className="relative max-w-4xl mx-auto">
        <div
          className="panel-blur relative rounded-3xl px-10 py-14 lg:px-16 lg:py-16 text-center overflow-hidden border border-white/[0.08]"
          style={{ background:'rgba(6,15,29,0.6)' }}
        >
          <div className="absolute top-6 left-1/2 -translate-x-1/2 font-display font-bold leading-none select-none pointer-events-none"
            style={{ fontSize:180, color:'rgba(42,139,255,0.04)', lineHeight:0.8 }}>"</div>
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-brand-500/22 to-transparent" />

          <div className="flex justify-center gap-1 mb-8 relative z-10">
            {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
          </div>

          <div ref={quoteRef} className="relative z-10 mb-10">
            <p className="text-white/72 leading-[1.95] font-body text-[15px] sm:text-[17px] max-w-3xl mx-auto">
              &ldquo;{t.text}&rdquo;
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-xl shadow-lg shadow-brand-500/20">
              {t.initial}
            </div>
            <div>
              <p className="font-display font-bold text-white text-[16px]">{t.name}</p>
              <p className="text-[12px] text-white/42 font-body mt-0.5">{t.role}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-5 mt-7">
          <button onClick={prev} className="w-11 h-11 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.18] hover:bg-white/[0.05] transition-all duration-300" aria-label="Previous">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            {testimonials.map((_,i) => (
              <button key={i} onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-400 ${i===cur ? 'w-8 bg-brand-500' : 'w-1.5 bg-white/15 hover:bg-white/30'}`}
                aria-label={`Testimonial ${i+1}`} />
            ))}
          </div>
          <button onClick={next} className="w-11 h-11 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.18] hover:bg-white/[0.05] transition-all duration-300" aria-label="Next">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center mt-10">
        <Button variant="secondary" size="lg" href="/contact">Contact Us <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </div>
  )
}

/* ─── Export ─── */
export default function CTA() {
  return (
    <section className="relative py-12 lg:py-16 overflow-hidden">
      <Container>
        <ChallengeBanner />

        {/* Kinetic strip between banners */}
        <div className="-mx-5 sm:-mx-8 lg:-mx-0 mb-16 -mt-4">
          <KineticStrip
            texts={['95% WORKFLOW OPTIMIZED', '·', '90% BUSINESS GROWTH', '·', '98% SATISFACTION', '·']}
            direction={-1}
            opacity={0.04}
            fontSize="clamp(2.8rem,6vw,7rem)"
            speed={1.2}
          />
        </div>

        <ImpactNumbers />
        <StreamlineBanner />
        <TestimonialsSection />
      </Container>
    </section>
  )
}
