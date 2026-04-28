import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Container from '../ui/Container'
import {
  ClipboardList,
  Headphones,
  Share2,
  PenTool,
  UserPlus,
  FolderKanban,
  Calculator,
  Megaphone,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react'

const services = [
  {
    icon: ClipboardList,
    slug: 'administrative-support',
    title: 'Administrative Support',
    text: 'We handle your routine tasks with precision, from calendars to inbox flow, so your day runs cleanly and without friction.',
    color: '#3b82f6',
  },
  {
    icon: Headphones,
    slug: 'customer-support',
    title: 'Customer Support',
    text: 'Keep every interaction professional and fast with dependable support that protects your reputation and saves your time.',
    color: '#8b5cf6',
  },
  {
    icon: Share2,
    slug: 'social-media-management',
    title: 'Social Media Management',
    text: 'We help you stay visible with consistent content, active engagement, and a sharper digital brand presence.',
    color: '#ec4899',
  },
  {
    icon: PenTool,
    slug: 'content-creation',
    title: 'Content Creation',
    text: 'From written content to campaign copy, we shape messaging that feels on-brand, clear, and commercially useful.',
    color: '#f59e0b',
  },
  {
    icon: UserPlus,
    slug: 'lead-generation',
    title: 'Lead Generation',
    text: 'Targeted outreach and steady follow-up help you keep the pipeline active without draining your calendar.',
    color: '#10b981',
  },
  {
    icon: FolderKanban,
    slug: 'project-management',
    title: 'Project Management',
    text: 'We keep deadlines, priorities, and moving parts under control so execution stays steady and visible.',
    color: '#0ea5e9',
  },
  {
    icon: Calculator,
    slug: 'accounting-services',
    title: 'Accounting Services',
    text: 'Reliable bookkeeping, invoicing, and reporting support that gives you cleaner numbers and better operating clarity.',
    color: '#14b8a6',
  },
  {
    icon: Megaphone,
    slug: 'marketing-support',
    title: 'Marketing Support',
    text: 'Support across campaigns, collateral, and execution so your growth efforts feel more organized and more effective.',
    color: '#d946ef',
  },
  {
    icon: ShoppingCart,
    slug: 'e-commerce-services',
    title: 'E-Commerce Services',
    text: 'We simplify store operations across listings, inventory, and support so your online business stays responsive.',
    color: '#6366f1',
  },
]

function ServiceCard({ service, index }) {
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const Icon = service.icon
  const ease = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  const c = service.color

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -6,
      y: ((e.clientX - r.left) / r.width - 0.5) * 6,
    })
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setTilt({ x: 0, y: 0 })
      }}
      onMouseMove={onMove}
      data-cursor-label="EXPLORE"
      className="flex-shrink-0"
      style={{
        width: 228,
        height: 276,
        transform: `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: `transform 0.38s ${ease}`,
      }}
    >
      <div
        className="relative flex h-full w-full flex-col overflow-hidden rounded-[22px]"
        style={{
          background: 'linear-gradient(180deg, rgba(10,20,35,0.86), rgba(6,15,29,0.74))',
          backdropFilter: 'blur(28px) saturate(160%)',
          border: `1px solid ${hovered ? c + '40' : 'rgba(255,255,255,0.06)'}`,
          boxShadow: hovered
            ? `0 26px 72px rgba(0,0,0,0.42), 0 0 0 1px ${c}22, inset 0 1px 0 rgba(255,255,255,0.08)`
            : '0 12px 38px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.04)',
          transition: 'border-color 0.5s, box-shadow 0.5s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `linear-gradient(180deg, transparent 0%, ${c}10 45%, ${c}18 100%)`,
            clipPath: hovered ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)',
            transition: `clip-path 0.75s ${ease}`,
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(ellipse at 50% 0%, ${c}1f, transparent 68%)`,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.6s',
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: -4,
            bottom: -10,
            fontFamily: '"Clash Display", sans-serif',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.06em',
            userSelect: 'none',
            pointerEvents: 'none',
            fontSize: hovered ? 84 : 52,
            color: hovered ? `${c}14` : 'rgba(255,255,255,0.028)',
            transition: `font-size 0.75s ${ease}, color 0.6s`,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>

        <div className="relative z-10 flex h-full flex-col p-3">
          <div className="mb-2 flex items-center justify-between">
            <span
              style={{
                fontFamily: '"Cabinet Grotesk", sans-serif',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: hovered ? c : 'rgba(255,255,255,0.2)',
                transition: 'color 0.4s',
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: c,
                opacity: hovered ? 1 : 0.28,
                boxShadow: hovered ? `0 0 14px ${c}, 0 0 28px ${c}50` : 'none',
                transition: 'opacity 0.4s, box-shadow 0.4s',
              }}
            />
          </div>

          <div className="mb-auto flex items-start">
            <div
              style={{
                width: hovered ? 42 : 34,
                height: hovered ? 42 : 34,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${c}28, ${c}08)`,
                border: `1px solid ${c}${hovered ? '38' : '22'}`,
                boxShadow: hovered
                  ? `0 0 36px ${c}38, 0 8px 24px ${c}18, inset 0 1px 0 ${c}30`
                  : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: `width 0.55s ${ease}, height 0.55s ${ease}, box-shadow 0.55s, border-color 0.4s`,
              }}
            >
              <Icon
                style={{
                  color: c,
                  width: hovered ? 17 : 14,
                  height: hovered ? 17 : 14,
                  transition: `width 0.45s ${ease}, height 0.45s ${ease}`,
                }}
              />
            </div>
          </div>

          <h3
            style={{
              fontFamily: '"Clash Display", sans-serif',
              fontWeight: 700,
              fontSize: 12,
              color: '#f1f5f9',
              letterSpacing: '-0.025em',
              lineHeight: 1.18,
              marginBottom: 7,
            }}
          >
            {service.title}
          </h3>

          <div
            style={{
              height: 1,
              background: `linear-gradient(90deg, ${c}70, ${c}20, transparent)`,
              width: hovered ? '100%' : '28%',
              transition: `width 0.65s ${ease}`,
              marginBottom: 5,
            }}
          />

          <div
            style={{
              overflow: 'hidden',
              maxHeight: hovered ? 62 : 0,
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(14px)',
              marginBottom: hovered ? 7 : 0,
              transition: `max-height 0.65s ${ease}, opacity 0.45s ${hovered ? '0.12s' : '0s'}, transform 0.55s ${hovered ? '0.08s' : '0s'} ${ease}, margin-bottom 0.65s ${ease}`,
            }}
          >
            <p
              style={{
                fontFamily: '"Cabinet Grotesk", sans-serif',
                fontSize: 10,
                lineHeight: 1.48,
                color: 'rgba(255,255,255,0.48)',
              }}
            >
              {service.text}
            </p>
          </div>

          <a
            href={`/services#${service.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: hovered ? 10 : 6,
              fontFamily: '"Clash Display", sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: c,
              transition: 'gap 0.3s',
              textDecoration: 'none',
            }}
          >
            <span>Read More</span>
            <ArrowRight
              size={12}
              style={{
                transform: hovered ? 'translateX(3px)' : 'translateX(0)',
                transition: 'transform 0.3s',
              }}
            />
          </a>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${c}60, transparent)`,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.5s',
          }}
        />
      </div>
    </div>
  )
}

function DesktopServices() {
  /* wrapperRef creates the scroll space that GSAP pin used to create via .pin-spacer.
     Using CSS position:sticky on the section instead of GSAP pin avoids the pin-spacer
     wrapper div that GSAP inserts into the DOM — which breaks React's removeChild calls. */
  const wrapperRef  = useRef(null)
  const sectionRef  = useRef(null)
  const viewportRef = useRef(null)
  const trackRef    = useRef(null)

  useEffect(() => {
    const wrapper  = wrapperRef.current
    const section  = sectionRef.current
    const viewport = viewportRef.current
    const track    = trackRef.current
    if (!wrapper || !section || !viewport || !track) return

    const getDistance = () => Math.max(0, track.scrollWidth - viewport.clientWidth)
    const updateWrapperHeight = () => {
      wrapper.style.height = `${window.innerHeight + getDistance() + 220}px`
    }
    updateWrapperHeight()

    const ctx = gsap.context(() => {
      gsap.from('[data-svc-label]', {
        opacity: 0,
        x: -20,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: wrapper, start: 'top 54%', toggleActions: 'play reverse play reverse' },
      })

      gsap.from('[data-svc-line]', {
        yPercent: 115,
        duration: 2.8,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: wrapper, start: 'top 50%', toggleActions: 'play reverse play reverse' },
      })

      gsap.set(track, { x: 0 })

      gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: () => `+=${getDistance() + 220}`,
          scrub: 1.35,
          invalidateOnRefresh: true,
          onRefresh: updateWrapperHeight,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
    <section ref={sectionRef} id="services" className="relative" style={{ height: '100vh', position: 'sticky', top: 0 }}>
      <div className="absolute top-[18%] right-0 h-[480px] w-[480px] rounded-full bg-accent-500/3 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[18%] left-0 h-[430px] w-[430px] rounded-full bg-brand-500/3 blur-[150px] pointer-events-none" />

      <div className="flex h-screen flex-col">
        <div className="px-5 pt-24 sm:px-8 lg:px-0">
          <Container>
            <div className="flex items-end justify-center">
              <div className="max-w-none text-center">
                <div data-svc-label className="mb-4">
                  <span className="section-label">Our Services</span>
                </div>
                <h2 className="font-display font-bold tracking-[-0.045em]">
                  <div style={{ overflow: 'hidden', lineHeight: 1.02, paddingBottom: '0.05em' }}>
                    <span data-svc-line className="block text-[2.2rem] sm:text-[2.7rem] lg:text-[3rem] text-white whitespace-nowrap">
                      What Services <span className="text-gradient">We Offer</span>
                    </span>
                  </div>
                </h2>
              </div>
            </div>
          </Container>
        </div>

        <div className="flex min-h-0 flex-1 items-center pt-8 pb-12">
          <div ref={viewportRef} className="mx-auto w-full max-w-[1000px] overflow-hidden px-5 sm:px-8 lg:px-0">
            <div
              ref={trackRef}
              className="flex w-max items-center gap-4"
            >
              {services.map((service, index) => (
                <ServiceCard key={service.title} service={service} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}

function MobileServices() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.from('[data-mob-card]', {
        opacity: 0,
        y: 30,
        filter: 'blur(6px)',
        duration: 0.8,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play reverse play reverse' },
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <section id="services" ref={ref} className="relative overflow-hidden py-20 sm:py-24">
      <Container>
        <div className="mb-10 max-w-xl">
          <span className="section-label mb-5 block">Our Services</span>
          <h2 className="mt-5 mb-4 text-3xl font-display font-bold tracking-[-0.04em] sm:text-4xl">
            What Services <span className="text-gradient">We Offer</span>
          </h2>
          <p className="max-w-md text-[14px] leading-relaxed text-white/35 font-body">
            We make it easier for business owners to manage their day-to-day tasks.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <div
                key={service.title}
                data-mob-card
                className="relative overflow-hidden rounded-xl p-4"
                style={{
                  background: 'rgba(6,15,29,0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 0% 0%, ${service.color}12, transparent 60%)` }}
                />
                <div className="relative z-10 flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: `linear-gradient(135deg,${service.color}22,${service.color}06)`,
                      border: `1px solid ${service.color}22`,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" style={{ color: service.color }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-1.5 text-[13px] font-display font-bold leading-snug text-white/90">
                      {service.title}
                    </h3>
                    <p className="text-[11px] leading-relaxed text-white/32 font-body">
                      {service.text}
                    </p>
                  </div>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${service.color}35, transparent)` }}
                />
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

export default function Services() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile ? <MobileServices /> : <DesktopServices />
}
