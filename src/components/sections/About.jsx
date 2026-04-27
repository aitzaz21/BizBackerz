import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Container from '../ui/Container'
import { CheckCircle, Users, Target, Sparkles } from 'lucide-react'

export default function About() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const ctx = gsap.context(() => {

      /* ── Left visual: slides from left with 3D flip ── */
      gsap.from('[data-about-left]', {
        opacity: 0, x: -90, rotateY: -10, filter: 'blur(12px)',
        duration: 1.3, ease: 'power3.out', transformPerspective: 1000,
        scrollTrigger: { trigger: el, start: 'top 78%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Right section label ── */
      gsap.from('[data-about-label]', {
        opacity: 0, x: -20,
        duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Heading lines: clip-path reveal ── */
      gsap.from('[data-about-line]', {
        yPercent: 112,
        duration: 1.3,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 72%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Paragraphs + checklist stagger ── */
      gsap.from('[data-about-body]', {
        opacity: 0, y: 22,
        duration: 1, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 65%', toggleActions: 'play reverse play reverse' },
      })

      /* ── Vision / Mission cards ── */
      gsap.from('[data-card-left]', {
        opacity: 0, x: -70, rotateY: -8, filter: 'blur(8px)',
        duration: 1, ease: 'power3.out', transformPerspective: 1000,
        scrollTrigger: { trigger: '[data-about-cards]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })
      gsap.from('[data-card-right]', {
        opacity: 0, x: 70, rotateY: 8, filter: 'blur(8px)',
        duration: 1, delay: 0.15, ease: 'power3.out', transformPerspective: 1000,
        scrollTrigger: { trigger: '[data-about-cards]', start: 'top 82%', toggleActions: 'play reverse play reverse' },
      })

    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="about" className="relative py-24 lg:py-36 overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-[-5%] -translate-y-1/2 w-[550px] h-[550px] bg-brand-500/4 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-[-5%] w-[350px] h-[350px] bg-accent-500/3 rounded-full blur-[130px] pointer-events-none" />

      <Container>

        {/* ═══ Top grid: visual + text ═══ */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-24 lg:mb-32">

          {/* Left: Visual card */}
          <div data-about-left className="relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">

              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/18 via-navy-800 to-accent-500/18" />

              {/* Center stat */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-28 h-28 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-brand-500/25 to-accent-500/25 flex items-center justify-center border border-white/8 glow-sm">
                    <Users className="w-14 h-14 text-brand-400" />
                  </div>
                  <div className="text-[4rem] font-display font-bold text-gradient leading-none mb-2">50+</div>
                  <p className="text-white/40 text-[11px] font-body font-bold uppercase tracking-[0.22em]">
                    Trusted Clients
                  </p>
                </div>
              </div>

              {/* Floating badge top-right */}
              <div className="absolute top-5 right-5 w-14 h-14 rounded-2xl bg-accent-500/10 border border-accent-500/18 flex items-center justify-center animate-float">
                <Sparkles className="w-6 h-6 text-accent-400" />
              </div>

              {/* Bottom left tag */}
              <div className="absolute bottom-5 left-5">
                <div className="glass-light rounded-xl px-4 py-2.5">
                  <p className="text-[10px] font-body font-bold text-white/35 uppercase tracking-[0.18em]">Since 2019</p>
                </div>
              </div>

              {/* Decorative number */}
              <div className="absolute top-4 left-4 font-display font-bold text-[6rem] leading-none text-white/[0.025] select-none pointer-events-none">
                01
              </div>
            </div>

            {/* Outer glow ring */}
            <div className="absolute -inset-4 bg-brand-500/4 rounded-[2rem] blur-2xl -z-10" />
          </div>

          {/* Right: Text content */}
          <div>
            {/* Label */}
            <div data-about-label className="mb-6">
              <span className="section-label">About Us</span>
            </div>

            {/* Heading with clip-path reveal */}
            <h2 className="font-display font-bold tracking-[-0.04em] mb-8">
              <div style={{ overflow: 'hidden', lineHeight: 1.08, paddingBottom: '0.06em' }}>
                <span data-about-line className="block text-3xl sm:text-4xl lg:text-5xl text-white">
                  Helping Business Owners
                </span>
              </div>
              <div style={{ overflow: 'hidden', lineHeight: 1.08, paddingBottom: '0.06em' }}>
                <span data-about-line className="block text-3xl sm:text-4xl lg:text-5xl">
                  Focus on <span className="text-gradient">What Matters Most</span>
                </span>
              </div>
            </h2>

            {/* Body text */}
            <p data-about-body className="text-white/45 leading-[1.85] mb-4 font-body">
              We take the hassle out of managing everyday tasks so you can focus on growing your business.
              From administrative support to social media management, our reliable virtual assistants are
              here to make your life easier and your business run smoother.
            </p>
            <p data-about-body className="text-white/45 leading-[1.85] mb-9 font-body">
              Running a business doesn't have to be overwhelming. BizBackerz provides skilled virtual
              assistants to handle your routine tasks, giving you more time to focus on your goals.
            </p>

            {/* Checklist */}
            <div data-about-body className="space-y-3.5">
              {['Constant Improvement', 'Commitment to Customers', 'Best Quality You Can Get'].map((item) => (
                <div key={item} className="flex items-center gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-accent-500/15 border border-accent-500/25 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-accent-400" />
                  </div>
                  <span className="text-white/65 font-body font-semibold text-[15px]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ Vision & Mission cards ═══ */}
        <div data-about-cards className="grid md:grid-cols-2 gap-5">

          <motion.div
            data-card-left
            whileHover={{ y: -7, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="group glass card-glow rounded-3xl p-8 lg:p-10 cursor-default"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/18 to-brand-700/12 flex items-center justify-center mb-6 border border-brand-500/18 group-hover:scale-110 transition-transform duration-500">
              <Target className="w-6 h-6 text-brand-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2 leading-snug">
              Build Business In A Solid Way And Grow More
            </h3>
            <h4 className="text-sm font-display font-semibold text-brand-400 mb-4 tracking-[-0.01em]">
              Our Vision & Mission
            </h4>
            <p className="text-white/42 leading-[1.85] font-body text-[14px]">
              We aim to transform how businesses operate by delivering dependable virtual solutions
              that inspire productivity, innovation, and lasting success.
            </p>
          </motion.div>

          <motion.div
            data-card-right
            whileHover={{ y: -7, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="group glass card-glow rounded-3xl p-8 lg:p-10 cursor-default"
            style={{ '--hover-color': 'rgba(56,217,169,0.08)' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-500/18 to-accent-600/12 flex items-center justify-center mb-6 border border-accent-500/18 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-6 h-6 text-accent-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-4 leading-snug">
              Inspiration
            </h3>
            <p className="text-white/42 leading-[1.85] font-body text-[14px]">
              Driven by passion and progress, we help businesses move forward with confidence
              and creativity — turning challenges into opportunities for lasting growth.
            </p>
          </motion.div>

        </div>
      </Container>
    </section>
  )
}
