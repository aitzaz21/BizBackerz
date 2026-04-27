import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '../ui/Container'
import Button from '../ui/Button'
import { ArrowRight, Zap, Star, ChevronLeft, ChevronRight, FileText } from 'lucide-react'

/* ════════════════════════════════════════════
   Animated Counter — GSAP powered
   ════════════════════════════════════════════ */
function AnimatedCounter({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref     = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        gsap.to({ v: 0 }, {
          v: target, duration: 2.4, ease: 'power2.out',
          onUpdate() { setVal(Math.floor(this.targets()[0].v)) },
        })
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target])

  return <span ref={ref}>{val}{suffix}</span>
}

/* ════════════════════════════════════════════
   Challenge Banner
   ════════════════════════════════════════════ */
function ChallengeBanner() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const ctx = gsap.context(() => {
      gsap.from(el, {
        opacity: 0, scale: 0.93, y: 50, filter: 'blur(10px)',
        duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play reverse play reverse' },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="mb-24 lg:mb-32">
      <div className="relative rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(56,217,169,0.2),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(82,173,255,0.15),transparent_55%)]" />
        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")` }} />
        {/* Bottom shimmer line */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-400/35 to-transparent" />

        <div className="relative z-10 px-8 py-12 lg:px-16 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10 backdrop-blur-sm animate-pulse-glow">
              <Zap className="w-8 h-8 text-accent-400" />
            </div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-[-0.03em] mb-1.5">
                We Are Ready To Take On Challenges!
              </h3>
              <p className="text-white/52 font-body text-[15px]">
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

/* ════════════════════════════════════════════
   Stats Section — kinetic numbers
   ════════════════════════════════════════════ */
function StatsSection() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const ctx = gsap.context(() => {
      gsap.from('[data-stat-label]', {
        opacity: 0, x: -20, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-stat-line]', {
        yPercent: 115, duration: 1.3, stagger: 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-stat-desc]', {
        opacity: 0, y: 18, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 78%', toggleActions: 'play reverse play reverse' },
      })
      // Cards slam in from sides with overshoot
      gsap.from('[data-stat-left]', {
        opacity: 0, x: -80, rotateY: -8, filter: 'blur(10px)',
        duration: 1.3, ease: 'power3.out', transformPerspective: 1000,
        scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-stat-right]', {
        opacity: 0, x: 80, rotateY: 8, filter: 'blur(10px)',
        duration: 1.3, ease: 'power3.out', transformPerspective: 1000,
        scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play reverse play reverse' },
      })
      gsap.fromTo('[data-bar-1]', { scaleX: 0 }, {
        scaleX: 0.95, duration: 2.4, ease: 'power2.out',
        scrollTrigger: { trigger: '[data-stat-left]', start: 'top 68%', toggleActions: 'play reverse play reverse' },
      })
      gsap.fromTo('[data-bar-2]', { scaleX: 0 }, {
        scaleX: 0.90, duration: 2.4, ease: 'power2.out',
        scrollTrigger: { trigger: '[data-stat-right]', start: 'top 68%', toggleActions: 'play reverse play reverse' },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="mb-24 lg:mb-32">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div data-stat-label className="flex justify-center mb-6">
          <span className="section-label">Our Impact</span>
        </div>
        <h2 className="font-display font-bold tracking-[-0.04em] mb-6">
          <div style={{ overflow: 'hidden', lineHeight: 1.08, paddingBottom: '0.05em' }}>
            <span data-stat-line className="block text-3xl sm:text-4xl lg:text-5xl text-white">We Power Your</span>
          </div>
          <div style={{ overflow: 'hidden', lineHeight: 1.08, paddingBottom: '0.05em' }}>
            <span data-stat-line className="block text-3xl sm:text-4xl lg:text-5xl">
              <span className="text-gradient">Productivity</span> & Success
            </span>
          </div>
        </h2>
        <p data-stat-desc className="text-white/40 leading-[1.85] font-body">
          Expert virtual support designed to streamline your daily operations, reduce workload,
          and save valuable time — so you can focus on growing your business.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Left stat */}
        <motion.div data-stat-left
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          className="glass card-glow rounded-3xl p-8 lg:p-10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/12 transition-all duration-700 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-[5rem] lg:text-[6rem] font-display font-bold text-gradient leading-none mb-3 tabular-nums">
              <AnimatedCounter target={95} suffix="%" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2 tracking-[-0.02em]">
              We Help Optimize Your Daily Workflow
            </h3>
            <p className="text-white/38 leading-[1.85] font-body text-[14px]">
              We streamline your tasks and processes, saving time and making your daily
              operations smoother and more efficient.
            </p>
          </div>
          <div className="mt-7 h-px bg-white/5 overflow-hidden">
            <div data-bar-1 className="h-full bg-gradient-to-r from-brand-600 to-brand-400 origin-left" style={{ transform: 'scaleX(0)' }} />
          </div>
        </motion.div>

        {/* Right stat */}
        <motion.div data-stat-right
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          className="glass card-glow rounded-3xl p-8 lg:p-10 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-500/5 rounded-full blur-3xl group-hover:bg-accent-500/12 transition-all duration-700 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-[5rem] lg:text-[6rem] font-display font-bold leading-none mb-3 tabular-nums">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-accent-500">
                <AnimatedCounter target={90} suffix="%" />
              </span>
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2 tracking-[-0.02em]">
              We Help Businesses Reach New Heights
            </h3>
            <p className="text-white/38 leading-[1.85] font-body text-[14px]">
              Expert support and strategies that empower your business to grow, succeed,
              and achieve long-term goals with confidence.
            </p>
          </div>
          <div className="mt-7 h-px bg-white/5 overflow-hidden">
            <div data-bar-2 className="h-full bg-gradient-to-r from-accent-600 to-accent-400 origin-left" style={{ transform: 'scaleX(0)' }} />
          </div>
        </motion.div>
      </div>

      <div className="text-center mt-10">
        <Button size="lg" href="https://calendly.com/oliver-reid-bizbackerz/30min" data-cursor-label="BOOK">
          Start Consultation <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   Streamline Banner
   ════════════════════════════════════════════ */
function StreamlineBanner() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const ctx = gsap.context(() => {
      gsap.from('[data-stream-inner]', {
        opacity: 0, scale: 0.92, y: 35,
        duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className="mb-24 lg:mb-32">
      <div data-stream-inner className="relative glass rounded-3xl p-10 lg:p-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(42,139,255,0.07),transparent_65%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-brand-500/22 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-accent-500/14 to-transparent" />
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-[-0.04em] mb-4">
            Looking To Streamline Your Business Operations?
          </h2>
          <p className="text-white/40 max-w-xl mx-auto leading-[1.85] font-body">
            We transform your daily operations with smart solutions, freeing your time
            so you can focus on growing your business.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   Full-Width Testimonials
   ════════════════════════════════════════════ */
const testimonials = [
  {
    text: "Been working with Bizbackerz for 2 months now, and very satisfied!!! They're innovative, they help me come up with marketing ideas, suggestions, they make phone calls, send emails, and Text messages. Anytime a new lead comes in they let me know right away !!! If you want to take your business to the next level you need to hire them !!! Highly recommend — You will be impressed.",
    name: 'Rocky Mariano', role: 'Real Estate Agent', initial: 'R',
  },
  {
    text: "They have been a game-changer for my workflow. Extremely willing to jump in and get to work immediately, consistently bringing great ideas and high-quality deliverables. Their ability to follow up without being prompted has saved me significant time and energy. The efficiency, creativity, and reliability they provide is an incredible value — truly gears-level ROI for my business.",
    name: 'Carlos Espejo', role: 'Real Estate Agent', initial: 'C',
  },
  {
    text: "The team is so committed to my business' success. I love that. I highly recommend them. They are really up'ing my social media game and adding a new chapter to my marketing with videos.",
    name: 'Johnetta Dillard', role: 'Broker', initial: 'J',
  },
]

function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const ref = useRef(null)
  const quoteRef = useRef(null)

  const navigate = (next) => {
    if (!quoteRef.current) { setCurrent(next); return }
    gsap.to(quoteRef.current, {
      opacity: 0, y: 20, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        setCurrent(next)
        gsap.fromTo(quoteRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        )
      },
    })
  }

  const next = () => navigate((current + 1) % testimonials.length)
  const prev = () => navigate((current - 1 + testimonials.length) % testimonials.length)

  useEffect(() => { const t = setInterval(next, 9000); return () => clearInterval(t) }, [current])

  useEffect(() => {
    const el = ref.current; if (!el) return
    const ctx = gsap.context(() => {
      gsap.from('[data-test-label]', {
        opacity: 0, x: -20, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-test-line]', {
        yPercent: 115, duration: 1.3, stagger: 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-test-body]', {
        opacity: 0, y: 30, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 72%', toggleActions: 'play reverse play reverse' },
      })
    }, el)
    return () => ctx.revert()
  }, [])

  const t = testimonials[current]

  return (
    <div ref={ref} className="mb-24 lg:mb-32">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div data-test-label className="flex justify-center mb-6">
          <span className="section-label">Testimonials</span>
        </div>
        <h2 className="font-display font-bold tracking-[-0.04em] mb-6">
          <div style={{ overflow: 'hidden', lineHeight: 1.08, paddingBottom: '0.05em' }}>
            <span data-test-line className="block text-3xl sm:text-4xl lg:text-5xl text-white">
              Transforming Your Business
            </span>
          </div>
          <div style={{ overflow: 'hidden', lineHeight: 1.08, paddingBottom: '0.05em' }}>
            <span data-test-line className="block text-3xl sm:text-4xl lg:text-5xl">
              Into A <span className="text-gradient">Success Story</span>
            </span>
          </div>
        </h2>
        <p data-test-label className="text-white/40 leading-[1.85] font-body">
          Trusted by businesses everywhere — hear from those who've experienced growth with BizBackerz.
        </p>
      </div>

      {/* Full-width quote card */}
      <div data-test-body className="relative max-w-4xl mx-auto">
        <div className="glass card-glow rounded-3xl px-10 py-14 lg:px-16 lg:py-16 relative overflow-hidden text-center">

          {/* Large background quotation mark */}
          <div
            className="absolute top-6 left-1/2 -translate-x-1/2 font-display font-bold leading-none select-none pointer-events-none"
            style={{ fontSize: 180, color: 'rgba(42,139,255,0.04)', lineHeight: 0.8 }}
          >
            "
          </div>

          {/* Top shimmer line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-brand-500/25 to-transparent" />

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-8 relative z-10">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>

          {/* Quote text — large and breathing */}
          <div ref={quoteRef} className="relative z-10 mb-10">
            <p className="text-white/70 leading-[1.95] font-body text-[15px] sm:text-[17px] lg:text-[18px] max-w-3xl mx-auto">
              &ldquo;{t.text}&rdquo;
            </p>
          </div>

          {/* Author */}
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-xl shadow-lg shadow-brand-500/20">
              {t.initial}
            </div>
            <div>
              <p className="font-display font-bold text-white tracking-[-0.01em] text-[16px]">{t.name}</p>
              <p className="text-[12px] text-white/32 font-body mt-0.5">{t.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-5 mt-7">
          <button
            onClick={prev}
            className="w-11 h-11 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all duration-300"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => navigate(i)}
                className={`h-1.5 rounded-full transition-all duration-400 ${i === current ? 'w-8 bg-brand-500' : 'w-1.5 bg-white/15 hover:bg-white/30'}`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-11 h-11 rounded-xl glass flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 transition-all duration-300"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center mt-10">
        <Button variant="secondary" size="lg" href="/contact">
          Contact Us <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   Blog Section
   ════════════════════════════════════════════ */
function BlogSection() {
  const ref = useRef(null)

  const blogs = [
    { title: 'How Virtual Assistant Services for Small Businesses Can Save you 20+ hours a Week (And Actually Scale your Business)', date: 'March 31, 2026', num: '01' },
    { title: 'Boost Your Business in 2026 with Amazon and Real Estate Virtual Assistant Services', date: 'March 26, 2026', num: '02' },
    { title: 'Mojo Dialer: The Sales Tool That Turns Calls Into Closed Deals', date: 'October 22, 2025', num: '03' },
  ]

  useEffect(() => {
    const el = ref.current; if (!el) return
    const ctx = gsap.context(() => {
      gsap.from('[data-blog-label]', {
        opacity: 0, x: -20, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-blog-line]', {
        yPercent: 115, duration: 1.3, stagger: 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-blog-desc]', {
        opacity: 0, y: 18, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 78%', toggleActions: 'play reverse play reverse' },
      })

      const cards = el.querySelectorAll('[data-blog-card]')
      cards.forEach((card, i) => {
        const dir = i === 0 ? -55 : i === 2 ? 55 : 0
        gsap.from(card, {
          opacity: 0, x: dir, y: i === 1 ? 50 : 32,
          rotateY: i === 0 ? -5 : i === 2 ? 5 : 0,
          filter: 'blur(8px)', transformPerspective: 1000,
          duration: 1.5, ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play reverse play reverse' },
        })
        gsap.to(card, {
          y: i === 1 ? -22 : -12, ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 2.5 + i * 0.4 },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} id="blog">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div data-blog-label className="flex justify-center mb-6">
          <span className="section-label">Our Blog</span>
        </div>
        <h2 className="font-display font-bold tracking-[-0.04em] mb-6">
          <div style={{ overflow: 'hidden', lineHeight: 1.08, paddingBottom: '0.05em' }}>
            <span data-blog-line className="block text-3xl sm:text-4xl lg:text-5xl text-white">
              Latest Blog &
            </span>
          </div>
          <div style={{ overflow: 'hidden', lineHeight: 1.08, paddingBottom: '0.05em' }}>
            <span data-blog-line className="block text-3xl sm:text-4xl lg:text-5xl text-gradient">
              Articles
            </span>
          </div>
        </h2>
        <p data-blog-desc className="text-white/40 leading-[1.85] font-body">
          Stay informed with the latest insights, tips, and updates to help your business grow.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {blogs.map((blog, i) => (
          <motion.div
            key={i}
            data-blog-card
            data-cursor-label="READ"
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="group glass card-glow rounded-2xl overflow-hidden cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="aspect-video relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/22 via-navy-800 to-accent-500/12" />
              <div className="absolute inset-0 group-hover:bg-brand-500/5 transition-colors duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-white/7 flex items-center justify-center border border-white/7 group-hover:scale-115 group-hover:bg-white/12 transition-all duration-500">
                  <FileText className="w-5 h-5 text-brand-400" />
                </div>
              </div>
              {/* Watermark number */}
              <div className="absolute top-3 left-4 font-display font-bold text-[3.5rem] leading-none text-white/[0.045] select-none">
                {blog.num}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-1 rounded-full bg-brand-500/55 flex-shrink-0" />
                <span className="text-[11px] text-brand-400/75 font-body font-bold tracking-[0.14em] uppercase">
                  {blog.date}
                </span>
              </div>
              <h3 className="text-[14px] font-display font-semibold text-white/85 leading-snug line-clamp-3 group-hover:text-white transition-colors duration-300 mb-4">
                {blog.title}
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-display font-semibold text-white/28 group-hover:text-brand-400 transition-colors duration-300">
                Read More <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-300" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   Main CTA Export
   ════════════════════════════════════════════ */
export default function CTA() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <Container>
        <ChallengeBanner />
        <StatsSection />
        <StreamlineBanner />
        <TestimonialsSection />
        <BlogSection />
      </Container>
    </section>
  )
}
