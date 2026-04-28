import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Container from '../ui/Container'
import { CheckCircle, Users, Target, Sparkles, ArrowRight } from 'lucide-react'

const checks = [
  'Constant Improvement',
  'Commitment to Customers',
  'Best Quality You Can Get',
]

export default function About() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    /* Skip all GSAP on touch devices — content is visible by default */
    if (window.matchMedia('(pointer: coarse)').matches) return

    const ctx = gsap.context(() => {
      /* ── Label slide ── */
      gsap.from('[data-ab-label]', {
        opacity: 0, x: -24, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 78%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Heading lines: clip-reveal upward ── */
      gsap.from('[data-ab-line]', {
        yPercent: 110, duration: 1.4, stagger: 0.11, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Body text + checklist ── */
      gsap.from('[data-ab-body]', {
        opacity: 0, y: 28, duration: 1, stagger: 0.1, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 68%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Left visual: depth reveal ── */
      gsap.from('[data-ab-visual]', {
        opacity: 0, x: -80, rotateY: -12, scale: 0.96,
        duration: 1.4, ease: 'power3.out', transformPerspective: 1000,
        scrollTrigger: { trigger: el, start: 'top 76%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Stat number pop on visual ── */
      gsap.from('[data-ab-stat]', {
        scale: 0.7, opacity: 0,
        duration: 1, ease: 'back.out(1.7)', delay: 0.4,
        scrollTrigger: { trigger: el, start: 'top 70%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Cards: slam in from sides ── */
      gsap.from('[data-ab-card-l]', {
        opacity: 0, x: -70, rotateY: -8,
        duration: 1.2, ease: 'power3.out', transformPerspective: 1000,
        scrollTrigger: { trigger: '[data-ab-cards]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-ab-card-r]', {
        opacity: 0, x: 70, rotateY: 8,
        duration: 1.2, delay: 0.12, ease: 'power3.out', transformPerspective: 1000,
        scrollTrigger: { trigger: '[data-ab-cards]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Scroll-driven horizontal line that grows ── */
      gsap.fromTo('[data-ab-rule]', { scaleX: 0, transformOrigin: 'left center' }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'center 40%', scrub: 1.5 },
      })

      /* ── Subtle counter on the 50+ number ── */
      const counterEl = el.querySelector('[data-ab-count]')
      if (counterEl) {
        let ran = false
        ScrollTrigger.create({
          trigger: counterEl, start: 'top 80%',
          onEnter: () => {
            if (ran) return; ran = true
            const obj = { v: 0 }
            gsap.to(obj, {
              v: 50, duration: 1.8, ease: 'power2.out',
              onUpdate: () => { counterEl.textContent = Math.round(obj.v) + '+' },
            })
          },
        })
      }
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="about" className="relative py-24 lg:py-36 overflow-hidden">

      {/* Atmosphere */}
      <div className="absolute top-1/2 left-[-5%] -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-[-5%] w-[340px] h-[340px] bg-accent-500/4 rounded-full blur-[130px] pointer-events-none" />

      {/* Animated horizontal rule — GSAP scrub */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none overflow-hidden">
        <div data-ab-rule className="h-full bg-gradient-to-r from-brand-500/25 via-accent-500/18 to-transparent" />
      </div>

      <Container>
        {/* ═══ Top grid ═══ */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-24 lg:mb-32">

          {/* LEFT — Visual card */}
          <div data-ab-visual className="relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
              {/* Layered gradient background */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, rgba(42,139,255,0.18) 0%, rgba(3,9,18,0.88) 45%, rgba(56,217,169,0.14) 100%)',
              }} />

              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage: 'linear-gradient(rgba(42,139,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(42,139,255,0.1) 1px,transparent 1px)',
                  backgroundSize: '36px 36px',
                }} />

              {/* Radial glow at center */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(42,139,255,0.08), transparent)' }} />

              {/* Center stat */}
              <div data-ab-stat className="absolute inset-0 flex items-center justify-center">
                <div className="text-center relative">
                  {/* Decorative rings */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full border border-brand-500/10 pointer-events-none" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-brand-500/6 pointer-events-none" />

                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center border border-white/12"
                    style={{
                      background: 'linear-gradient(135deg, rgba(42,139,255,0.28), rgba(56,217,169,0.18))',
                      boxShadow: '0 8px 32px rgba(42,139,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}>
                    <Users className="w-10 h-10 text-brand-400" />
                  </div>
                  <div className="text-[3.5rem] font-display font-bold text-gradient leading-none mb-1">
                    <span data-ab-count>50+</span>
                  </div>
                  <p className="text-white/45 text-[10px] font-body font-bold uppercase tracking-[0.24em]">
                    Trusted Clients
                  </p>
                </div>
              </div>

              {/* Top-left mini stat */}
              <div className="absolute top-5 left-5">
                <div className="text-[1.4rem] font-display font-bold text-gradient leading-none">3+</div>
                <p className="text-[8px] text-white/32 font-body font-bold uppercase tracking-[0.18em] mt-0.5">Yrs Exp.</p>
              </div>

              {/* Float badge */}
              <div className="absolute top-5 right-5 w-11 h-11 rounded-2xl border border-accent-500/22 flex items-center justify-center animate-float"
                style={{ background: 'rgba(56,217,169,0.1)' }}>
                <Sparkles className="w-4.5 h-4.5 text-accent-400" />
              </div>

              {/* Bottom-right mini stat */}
              <div className="absolute bottom-5 right-5 text-right">
                <div className="text-[1.4rem] font-display font-bold text-gradient leading-none">98%</div>
                <p className="text-[8px] text-white/32 font-body font-bold uppercase tracking-[0.18em] mt-0.5">Satisfaction</p>
              </div>

              {/* Tag */}
              <div className="absolute bottom-5 left-5">
                <div className="rounded-xl px-3 py-1.5 border border-white/8"
                  style={{ background: 'rgba(42,139,255,0.08)' }}>
                  <p className="text-[9px] font-body font-bold text-white/45 uppercase tracking-[0.2em]">Since 2024</p>
                </div>
              </div>
            </div>

            {/* Outer glow ring */}
            <div className="absolute -inset-5 bg-brand-500/6 rounded-[2.5rem] blur-2xl -z-10" />
          </div>

          {/* RIGHT — Text */}
          <div>
            <div data-ab-label className="mb-6">
              <span className="section-label">About Us</span>
            </div>

            <h2 className="font-display font-bold tracking-[-0.04em] mb-8">
              <div style={{ overflow: 'hidden', lineHeight: 1.08, paddingBottom: '0.06em' }}>
                <span data-ab-line className="block text-3xl sm:text-4xl lg:text-5xl text-white">
                  Helping Business Owners
                </span>
              </div>
              <div style={{ overflow: 'hidden', lineHeight: 1.08, paddingBottom: '0.06em' }}>
                <span data-ab-line className="block text-3xl sm:text-4xl lg:text-5xl">
                  Focus on <span className="text-gradient">What Matters Most</span>
                </span>
              </div>
            </h2>

            <p data-ab-body className="text-white/68 leading-[1.88] mb-4 font-body text-[15px]">
              We take the hassle out of managing everyday tasks so you can focus on growing your
              business. From administrative support to social media management, our reliable virtual
              assistants are here to make your life easier.
            </p>
            <p data-ab-body className="text-white/58 leading-[1.88] mb-9 font-body text-[15px]">
              Running a business doesn't have to be overwhelming. BizBackerz provides skilled
              virtual assistants to handle routine tasks — giving you more time to focus on what
              moves the needle.
            </p>

            {/* Checklist */}
            <div data-ab-body className="space-y-3.5 mb-10">
              {checks.map((item) => (
                <div key={item} className="flex items-center gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-accent-500/15 border border-accent-500/25 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-accent-400" />
                  </div>
                  <span className="text-white/75 font-body font-semibold text-[15px]">{item}</span>
                </div>
              ))}
            </div>

            <div data-ab-body>
              <a
                href="/about"
                className="inline-flex items-center gap-2.5 text-[13px] font-body font-bold uppercase tracking-[0.15em] text-brand-400 hover:text-brand-300 transition-colors duration-300 group"
              >
                Learn more about us
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>

        {/* ═══ Vision & Mission ═══ */}
        <div data-ab-cards className="grid md:grid-cols-2 gap-5">
          <motion.div
            data-ab-card-l
            whileHover={{ y: -8, scale: 1.012 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="group relative rounded-3xl p-8 lg:p-10 cursor-default overflow-hidden border border-white/[0.07] hover:border-white/[0.13] transition-colors duration-500"
            style={{ background: 'rgba(6,15,29,0.55)', backdropFilter: 'blur(20px)' }}
          >
            {/* top highlight on hover */}
            <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(42,139,255,0.5),transparent)' }} />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/18 to-brand-700/12 flex items-center justify-center mb-6 border border-brand-500/18 group-hover:scale-110 transition-transform duration-500">
              <Target className="w-6 h-6 text-brand-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2 leading-snug">
              Build Business In A Solid Way And Grow More
            </h3>
            <p className="text-[10px] font-body font-bold uppercase tracking-[0.2em] text-brand-400/75 mb-4">Our Vision & Mission</p>
            <p className="text-white/62 leading-[1.88] font-body text-[14px]">
              We aim to transform how businesses operate by delivering dependable virtual solutions
              that inspire productivity, innovation, and lasting success.
            </p>
          </motion.div>

          <motion.div
            data-ab-card-r
            whileHover={{ y: -8, scale: 1.012 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="group relative rounded-3xl p-8 lg:p-10 cursor-default overflow-hidden border border-white/[0.07] hover:border-accent-500/[0.2] transition-colors duration-500"
            style={{ background: 'rgba(6,15,29,0.55)', backdropFilter: 'blur(20px)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(56,217,169,0.5),transparent)' }} />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500/18 to-accent-600/12 flex items-center justify-center mb-6 border border-accent-500/18 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-6 h-6 text-accent-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-4 leading-snug">Inspiration</h3>
            <p className="text-white/62 leading-[1.88] font-body text-[14px]">
              Driven by passion and progress, we help businesses move forward with confidence
              and creativity — turning challenges into opportunities for lasting growth.
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
