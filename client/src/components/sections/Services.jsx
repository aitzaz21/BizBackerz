import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Container from '../ui/Container'
import {
  ClipboardList, Headphones, Share2, PenTool, UserPlus,
  FolderKanban, Calculator, Megaphone, ShoppingCart,
  ArrowRight, Trophy, Star, Shield, Zap, BarChart2,
} from 'lucide-react'

const services = [
  { icon: BarChart2,     slug: 'digital-advertising',       title: 'Digital Advertising',       text: 'We manage Google Local Service Ads, AI Max, and Performance Max campaigns that drive qualified leads at lower cost — with full reporting clarity.',              color: '#f97316', metric: '25% More Leads'   },
  { icon: ClipboardList, slug: 'administrative-support',    title: 'Administrative Support',    text: 'We handle your routine tasks with precision, from calendars to inbox flow, so your day runs cleanly and without friction.',          color: '#3b82f6', metric: 'Saves 10+ hrs/wk' },
  { icon: Headphones,    slug: 'customer-support',          title: 'Customer Support',          text: 'Keep every interaction professional and fast with dependable support that protects your reputation and saves your time.',             color: '#8b5cf6', metric: 'Avg 2hr Response' },
  { icon: Share2,        slug: 'social-media-management',   title: 'Social Media Management',   text: 'We help you stay visible with consistent content, active engagement, and a sharper digital brand presence.',                       color: '#ec4899', metric: '3× Engagement' },
  { icon: PenTool,       slug: 'content-creation',          title: 'Content Creation',          text: 'From written content to campaign copy, we shape messaging that feels on-brand, clear, and commercially useful.',                   color: '#f59e0b', metric: '8+ Pieces/Month' },
  { icon: UserPlus,      slug: 'lead-generation',           title: 'Lead Generation',           text: 'Targeted outreach and steady follow-up help you keep the pipeline active without draining your calendar.',                         color: '#10b981', metric: '30+ Leads/Month' },
  { icon: FolderKanban,  slug: 'project-management',        title: 'Project Management',        text: 'We keep deadlines, priorities, and moving parts under control so execution stays steady and visible.',                             color: '#0ea5e9', metric: '100% On-Time' },
  { icon: Calculator,    slug: 'accounting-services',       title: 'Accounting Services',       text: 'Reliable bookkeeping, invoicing, and reporting support that gives you cleaner numbers and better operating clarity.',              color: '#14b8a6', metric: 'Books Up to Date' },
  { icon: Megaphone,     slug: 'marketing-support',         title: 'Marketing Support',         text: 'Support across campaigns, collateral, and execution so your growth efforts feel more organized and more effective.',               color: '#d946ef', metric: '2× Campaign Output' },
  { icon: ShoppingCart,  slug: 'e-commerce-services',       title: 'E-Commerce Services',       text: 'We simplify store operations across listings, inventory, and support so your online business stays responsive.',                   color: '#6366f1', metric: 'Same-Day Updates' },
]

const awards = [
  { icon: Trophy, label: 'Top Rated',   sub: 'VA Service 2024', color: '#f59e0b' },
  { icon: Star,   label: '5.0 Stars',   sub: '50+ Reviews',     color: '#2a8bff' },
  { icon: Shield, label: 'NDA Safe',    sub: 'Full Privacy',     color: '#20c997' },
  { icon: Zap,    label: '48hr Setup',  sub: 'Start Fast',       color: '#8b5cf6' },
]

const trusted = ['50+ Business Owners', 'Real Estate Agents', 'Amazon Sellers', 'E-Commerce Brands', 'Agency Founders']

/* ─────────────────────────────────────────
   SERVICE CARD
───────────────────────────────────────── */
function ServiceCard({ service, index }) {
  const [hovered, setHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const Icon = service.icon
  const ease = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  const c    = service.color

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setTilt({
      x: ((e.clientY - r.top)  / r.height - 0.5) * -6,
      y: ((e.clientX - r.left) / r.width  - 0.5) *  6,
    })
  }

  return (
    <Link
      to={`/services/${service.slug}`}
      className="flex-shrink-0"
      style={{ display: 'block', textDecoration: 'none' }}
    >
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }) }}
      onMouseMove={onMove}
      style={{
        width: 210, height: 270, cursor: 'pointer',
        transform: `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: `transform 0.3s ${ease}`,
      }}
    >
      <div
        className="relative flex h-full w-full flex-col overflow-hidden"
        style={{
          borderRadius: 20,
          background: 'linear-gradient(160deg, rgba(11,21,40,0.97), rgba(4,11,24,0.92))',
          border: `1px solid ${hovered ? c + '58' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: hovered
            ? `0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px ${c}22, 0 0 48px ${c}14`
            : '0 8px 30px rgba(0,0,0,0.32)',
          transition: 'border-color 0.4s, box-shadow 0.45s',
        }}
      >
        {/* Full colour fill */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `linear-gradient(148deg, ${c}2e 0%, ${c}16 42%, ${c}05 100%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.48s ease',
        }} />

        {/* Top highlight */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: `linear-gradient(90deg, transparent, ${c}88, transparent)`,
          opacity: hovered ? 1 : 0, transition: 'opacity 0.4s', pointerEvents: 'none',
        }} />

        {/* Left accent bar */}
        <div style={{
          position: 'absolute', left: 0, top: '12%', bottom: '12%', width: 2,
          borderRadius: '0 2px 2px 0',
          background: `linear-gradient(180deg, transparent, ${c}ee, transparent)`,
          opacity: hovered ? 1 : 0, transition: 'opacity 0.4s',
        }} />

        <div className="relative z-10 flex h-full flex-col p-[18px]">

          {/* Top row — index + glow dot */}
          <div className="flex items-center justify-between mb-[14px]">
            <span style={{
              fontSize: 9, fontFamily: '"Cabinet Grotesk",sans-serif',
              fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: hovered ? c : 'rgba(255,255,255,0.2)', transition: 'color 0.32s',
            }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: c,
              opacity: hovered ? 1 : 0.28,
              boxShadow: hovered ? `0 0 10px ${c}, 0 0 24px ${c}66` : 'none',
              transition: 'opacity 0.32s, box-shadow 0.32s',
            }} />
          </div>

          {/* Icon */}
          <div style={{
            width: 46, height: 46, borderRadius: 13,
            background: `linear-gradient(135deg, ${c}2e, ${c}0c)`,
            border: `1px solid ${c}${hovered ? '52' : '28'}`,
            boxShadow: hovered ? `0 0 30px ${c}3c, inset 0 1px 0 ${c}30` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
            transition: `all 0.4s ${ease}`,
          }}>
            <Icon style={{ color: c, width: 20, height: 20 }} />
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: '"Clash Display",sans-serif',
            fontWeight: 700, fontSize: 13.5, letterSpacing: '-0.03em', lineHeight: 1.18,
            color: hovered ? '#fff' : '#dce8f8',
            marginBottom: 8, transition: 'color 0.3s',
          }}>
            {service.title}
          </h3>

          {/* Expanding divider */}
          <div style={{
            height: 1,
            background: `linear-gradient(90deg, ${c}88, ${c}33, transparent)`,
            width: hovered ? '100%' : '30%',
            transition: `width 0.55s ${ease}`,
            marginBottom: 10,
          }} />

          {/* Description */}
          <p style={{
            fontFamily: '"Cabinet Grotesk",sans-serif',
            fontSize: 11, lineHeight: 1.6, flex: 1,
            color: hovered ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.3)',
            display: '-webkit-box',
            WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', transition: 'color 0.4s',
          }}>
            {service.text}
          </p>

          {/* Bottom: metric + explore */}
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontFamily: '"Cabinet Grotesk",sans-serif',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: hovered ? c : 'rgba(255,255,255,0.18)', transition: 'color 0.3s',
            }}>
              {service.metric}
            </span>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontFamily: '"Clash Display",sans-serif',
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: c,
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
                transition: `opacity 0.25s ${hovered ? '0.08s' : '0s'}, transform 0.3s ${hovered ? '0.06s' : '0s'} ${ease}`,
              }}
            >
              Explore <ArrowRight size={9} />
            </span>
          </div>
        </div>

        {/* Bottom accent */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${c}66, transparent)`,
          opacity: hovered ? 1 : 0, transition: 'opacity 0.5s',
        }} />
      </div>
    </div>
    </Link>
  )
}

/* ─────────────────────────────────────────
   DESKTOP SERVICES  —  2-column layout
   LEFT: fixed heading panel
   RIGHT: horizontal-scrolling cards panel
   A vertical divider between them prevents any merging.
───────────────────────────────────────── */
function DesktopServices() {
  const wrapperRef  = useRef(null)
  const sectionRef  = useRef(null)
  const viewportRef = useRef(null)   // right panel container
  const trackRef    = useRef(null)   // scrolling cards track

  useEffect(() => {
    const wrapper  = wrapperRef.current
    const section  = sectionRef.current
    const viewport = viewportRef.current
    const track    = trackRef.current
    if (!wrapper || !section || !viewport || !track) return

    const REVEAL = 100   // px of scroll for left-panel entry animations

    const getDistance = () => Math.max(0, track.scrollWidth - viewport.clientWidth)
    const updateHeight = () => {
      wrapper.style.height = `${window.innerHeight + REVEAL + getDistance() + 180}px`
    }
    updateHeight()

    const ctx = gsap.context(() => {
      /* Left panel entry animations */
      gsap.from('[data-svc-label]', {
        opacity: 0, x: -20, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: wrapper, start: 'top top', end: `+=${REVEAL}`, toggleActions: 'play none none reverse' },
      })
      gsap.from('[data-svc-line]', {
        yPercent: 115, duration: 1.4, stagger: 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: wrapper, start: 'top top', end: `+=${REVEAL}`, toggleActions: 'play none none reverse' },
      })
      gsap.from('[data-svc-sub]', {
        opacity: 0, y: 12, duration: 0.9, stagger: 0.07, ease: 'power2.out',
        scrollTrigger: { trigger: wrapper, start: 'top top', end: `+=${REVEAL}`, toggleActions: 'play none none reverse' },
      })

      /* Cards horizontal scrub */
      gsap.set(track, { x: 0 })
      gsap.to(track, {
        x: () => -getDistance(), ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: () => `top+=${REVEAL} top`,
          end:   () => `top+=${REVEAL + getDistance() + 180} top`,
          scrub: 1.2,
          invalidateOnRefresh: true,
          onRefresh: updateHeight,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <section
        ref={sectionRef}
        id="services"
        style={{
          height: '100vh', position: 'sticky', top: 0,
          overflow: 'hidden', display: 'flex',
          background: 'rgba(3,9,18,1)',
        }}
      >
        {/* Atmosphere blobs (behind both panels) */}
        <div style={{ position: 'absolute', top: '30%', right: '-4%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(56,217,169,0.05)', filter: 'blur(160px)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '30%', left: '-4%', width: 450, height: 450, borderRadius: '50%', background: 'rgba(42,139,255,0.05)', filter: 'blur(160px)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Top + bottom seals so adjacent sections don't bleed in */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 56, background: 'linear-gradient(to bottom, rgba(3,9,18,1), transparent)', pointerEvents: 'none', zIndex: 40 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, background: 'linear-gradient(to top, rgba(3,9,18,1), transparent)', pointerEvents: 'none', zIndex: 40 }} />

        {/* ── LEFT PANEL — pinned heading ── */}
        <div
          style={{
            width: '32%', flexShrink: 0, position: 'relative', zIndex: 10,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '0 36px 0 clamp(24px, 4.5vw, 72px)',
            background: 'linear-gradient(to right, rgba(3,9,18,1) 70%, rgba(4,12,26,0.96) 100%)',
            borderRight: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Vertical accent line along the divider */}
          <div style={{ position: 'absolute', right: -1, top: '15%', bottom: '15%', width: 1, background: 'linear-gradient(to bottom, transparent, rgba(42,139,255,0.35), rgba(56,217,169,0.22), transparent)', pointerEvents: 'none' }} />

          <div data-svc-label style={{ marginBottom: 8 }}>
            <span className="section-label">Our Services</span>
            <p style={{ marginTop: 4, fontSize: 8.5, fontFamily: '"Cabinet Grotesk",sans-serif', fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>
              {services.length} Premium Services
            </p>
          </div>

          <h2 style={{ fontFamily: '"Clash Display",sans-serif', fontWeight: 700, letterSpacing: '-0.048em', lineHeight: 1.0, marginBottom: 8 }}>
            <div style={{ overflow: 'hidden' }}>
              <span data-svc-line style={{ display: 'block', fontSize: 'clamp(1.5rem, 2.4vw, 2.2rem)', color: '#fff' }}>
                Everything
              </span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <span data-svc-line className="text-gradient" style={{ display: 'block', fontSize: 'clamp(1.5rem, 2.4vw, 2.2rem)' }}>
                Your Business
              </span>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <span data-svc-line style={{ display: 'block', fontSize: 'clamp(1.5rem, 2.4vw, 2.2rem)', color: '#fff' }}>
                Needs to Scale.
              </span>
            </div>
          </h2>

          <p data-svc-sub style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', fontFamily: '"Cabinet Grotesk",sans-serif', lineHeight: 1.6, marginBottom: 10 }}>
            Delegate the routine. Dominate the strategic. Our virtual assistants handle operations so you focus on growth.
          </p>

          {/* Award pills */}
          <div data-svc-sub style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
            {awards.map((a) => (
              <div key={a.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '3px 9px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(6,15,29,0.7)', width: 'fit-content' }}>
                <a.icon style={{ width: 10, height: 10, color: a.color, flexShrink: 0 }} />
                <span style={{ fontSize: 8.5, fontFamily: '"Cabinet Grotesk",sans-serif', fontWeight: 600, color: 'rgba(255,255,255,0.42)', whiteSpace: 'nowrap' }}>
                  {a.label} <span style={{ color: 'rgba(255,255,255,0.22)' }}>—</span> <span style={{ color: a.color }}>{a.sub}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Trusted-by tags */}
          <div data-svc-sub style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 12 }}>
            {trusted.map((tag) => (
              <span key={tag} style={{ padding: '2px 6px', borderRadius: 99, fontSize: 7.5, fontFamily: '"Cabinet Grotesk",sans-serif', color: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {tag}
              </span>
            ))}
          </div>

          <div data-svc-sub>
            <Link to="/services" className="group" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 9.5, fontFamily: '"Clash Display",sans-serif', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2a8bff', textDecoration: 'none' }}>
              View All Services
              <ArrowRight style={{ width: 11, height: 11 }} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {/* Scroll hint at bottom */}
          <div style={{ position: 'absolute', bottom: 24, left: 'clamp(24px, 4.5vw, 72px)', display: 'flex', alignItems: 'center', gap: 7, opacity: 0.2 }}>
            <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.5)' }} />
            <span style={{ fontSize: 7.5, fontFamily: '"Cabinet Grotesk",sans-serif', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>Scroll to explore</span>
            <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.5)' }} />
          </div>
        </div>

        {/* ── RIGHT PANEL — horizontally scrolling cards ── */}
        <div
          ref={viewportRef}
          style={{
            flex: 1, overflow: 'hidden', position: 'relative', zIndex: 10,
            /* Soft left fade where panel meets divider; hard right is handled by section overflow:hidden */
            maskImage: 'linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)',
          }}
        >
          {/* Subtle background tint for the cards zone */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(4,11,24,0.35) 0%, rgba(7,17,35,0.5) 50%, rgba(4,11,24,0.35) 100%)', pointerEvents: 'none' }} />

          <div
            ref={trackRef}
            style={{
              display: 'flex', alignItems: 'center',
              height: '100%', gap: 16,
              paddingLeft: '7%', paddingRight: '10%',
            }}
          >
            {services.map((service, index) => (
              <ServiceCard key={service.title} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

/* ─────────────────────────────────────────
   MOBILE SERVICES
───────────────────────────────────────── */
function MobileServices() {
  return (
    <section id="services" className="relative overflow-hidden py-10 sm:py-12">
      <Container>
        <div className="mb-8 max-w-xl">
          <span className="section-label mb-5 block">Our Services</span>
          <h2 className="mt-5 mb-3 text-3xl font-display font-bold tracking-[-0.04em] sm:text-4xl">
            Everything Your Business <span className="text-gradient">Needs to Scale</span>
          </h2>
          <p className="max-w-md text-[14px] leading-relaxed text-white/35 font-body">
            Delegate the routine. Dominate the strategic.
          </p>
        </div>

        {/* Mobile award badges */}
        <div className="flex flex-wrap gap-2 mb-8">
          {awards.map((a) => (
            <div key={a.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.07]"
              style={{ background: 'rgba(6,15,29,0.6)' }}>
              <a.icon className="w-3 h-3" style={{ color: a.color }} />
              <span className="text-[9.5px] font-body font-bold text-white/50">{a.label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <div
                key={service.title}
                className="relative overflow-hidden rounded-xl p-4 border border-white/[0.07]"
                style={{ background: 'rgba(6,15,29,0.7)', backdropFilter: 'blur(20px)' }}
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
                    <h3 className="mb-1 text-[13px] font-display font-bold leading-snug text-white/90">
                      {service.title}
                    </h3>
                    <p className="text-[11px] leading-relaxed text-white/32 font-body mb-1.5">
                      {service.text}
                    </p>
                    <span className="text-[9px] font-body font-bold uppercase tracking-[0.14em]" style={{ color: service.color }}>
                      {service.metric}
                    </span>
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
