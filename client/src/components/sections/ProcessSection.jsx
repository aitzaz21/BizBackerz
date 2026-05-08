import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Container from '../ui/Container'
import { MessageCircle, UserCog, TrendingUp, Orbit } from 'lucide-react'

const processSteps = [
  { n: '01', title: 'Discovery Call',   body: 'We learn your goals, pain points, and current workflow in a focused 30-minute session.', color: '#2a8bff', icon: MessageCircle },
  { n: '02', title: 'Match & Onboard',  body: 'We match you with the right assistant and configure tools within 48 hours.',              color: '#20c997', icon: UserCog },
  { n: '03', title: 'Start Executing',  body: 'Your assistant begins work immediately with daily updates and proactive communication.',     color: '#f59e0b', icon: TrendingUp },
  { n: '04', title: 'Scale With You',   body: 'Add hours, expand scope, or bring in specialists as your business grows.',                 color: '#8b5cf6', icon: Orbit },
]

export default function ProcessSection() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (isMobile) return

    const ctx = gsap.context(() => {
      // Label fade
      gsap.from('[data-process-label] .section-label', {
        opacity: 0, x: -20, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play reverse play reverse' },
      })
      
      // Masked text reveal for heading
      gsap.from('[data-process-line]', {
        yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play reverse play reverse' },
      })

      // Paragraph fade
      gsap.from('[data-process-desc]', {
        opacity: 0, y: 20, duration: 1, delay: 0.3, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play reverse play reverse' },
      })

      // 3D Staggered Cards
      gsap.from('[data-process-item]', {
        opacity: 0,
        y: 60,
        rotateX: -15,
        scale: 0.9,
        stagger: 0.15,
        duration: 1.2,
        ease: 'power3.out',
        transformPerspective: 1000,
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play reverse play reverse' },
      })

      // Line drawing for connectors
      gsap.from('[data-process-connector]', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.5,
        stagger: 0.15,
        ease: 'power3.inOut',
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 65%', toggleActions: 'play reverse play reverse' },
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-12 lg:py-16 bg-navy-950 overflow-hidden border-t border-white/[0.06]">
      <Container>
        <div className="mb-10 text-center max-w-2xl mx-auto" data-process-label>
          <span className="section-label mb-4 inline-block">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mb-4">
            <div className="gsap-line-clip" style={{ paddingBottom: '0.05em' }}>
              <span data-process-line className="block">Four steps from handshake</span>
            </div>
            <div className="gsap-line-clip" style={{ paddingBottom: '0.05em' }}>
              <span data-process-line className="block">to <span className="text-gradient">output.</span></span>
            </div>
          </h2>
          <p data-process-desc className="text-[15px] text-white/60 font-body leading-[1.8]">
            Structured onboarding means you feel productive from day one — not week three. 
            We handle the heavy lifting so you can start delegating immediately.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {processSteps.map((step, i) => (
            <div key={step.n} data-process-item
              className="panel-blur group relative rounded-2xl p-6 border border-white/[0.07] hover:border-white/[0.14] transition-all duration-500 overflow-hidden"
              style={{ background: 'rgba(6,15,29,0.55)' }}
            >
              {/* fill */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(148deg,${step.color}16 0%,${step.color}07 55%,transparent 100%)` }} />
              {/* top accent */}
              <div className="absolute top-0 left-0 right-0 h-px pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg,transparent,${step.color}55,transparent)` }} />
              {/* connector line — right edge, desktop only */}
              {i < processSteps.length - 1 && (
                <div data-process-connector className="hidden lg:block absolute top-9 right-0 w-4 h-px"
                  style={{ background: `linear-gradient(90deg,${step.color}40,transparent)` }} />
              )}

              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg,${step.color}22,${step.color}06)`, borderColor: `${step.color}22` }}>
                    <step.icon className="w-4 h-4" style={{ color: step.color }} />
                  </div>
                  <span className="font-display font-bold text-2xl text-white/10 group-hover:text-white/20 transition-colors duration-500 select-none">
                    {step.n}
                  </span>
                </div>
                <h3 className="text-[15px] font-display font-bold text-white mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-[13px] text-white/65 leading-[1.8] font-body transition-colors duration-500 group-hover:text-white/70">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
