import React, { useEffect, useRef, useState, Suspense, memo } from 'react'
import { Canvas } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import { useLocation } from 'react-router-dom'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import {
  ClipboardList, Headphones, Share2, PenTool, UserPlus,
  FolderKanban, Calculator, Megaphone, ShoppingCart,
  ArrowRight, Zap,
} from 'lucide-react'

const services = [
  { icon: ClipboardList, slug: 'administrative-support', title: 'Administrative Support', text: 'We handle your routine tasks with ease, from managing schedules to organizing emails, so your day runs smoothly. Focus on what matters most while we take care of the rest.', color: '#3b82f6' },
  { icon: Headphones, slug: 'customer-support', title: 'Customer Support', text: 'Keep your customers happy with our friendly and reliable customer support team. We handle every interaction with care and efficiency, so you can focus on growing your business.', color: '#8b5cf6' },
  { icon: Share2, slug: 'social-media-management', title: 'Social Media Management', text: 'Grow your brand with the help of our social media experts. We craft content that connects with your audience and keeps them engaged. Let us help you build a thriving online community.', color: '#ec4899' },
  { icon: PenTool, slug: 'content-creation', title: 'Content Creation', text: 'Create content that grabs attention and speaks to your audience. From blog posts to product descriptions, we craft messages that match your brand and connect through powerful storytelling.', color: '#f59e0b' },
  { icon: UserPlus, slug: 'lead-generation', title: 'Lead Generation', text: 'BizBackerz lead generation services are designed to help you fill your pipeline with qualified prospects. We focus on targeted outreach to find potential customers who are the right fit for your business.', color: '#10b981' },
  { icon: FolderKanban, slug: 'project-management', title: 'Project Management', text: 'Keep your projects on track with our expert project management support. We handle tasks, deadlines, and team coordination, ensuring everything runs smoothly. You can focus on the big picture while we take care of the details.', color: '#0ea5e9' },
  { icon: Calculator, slug: 'accounting-services', title: 'Accounting Services', text: 'Keep your finances in check with our reliable accounting support. We handle bookkeeping, invoicing, and financial reporting to keep you organized. With clear financial insights, you can make smarter decisions for your business.', color: '#14b8a6' },
  { icon: Megaphone, slug: 'marketing-support', title: 'Marketing Support', text: 'Grow your business with our expert marketing support. We help with campaigns, branding, and analytics to increase your visibility. Let us assist you in reaching and engaging your target audience more effectively.', color: '#d946ef' },
  { icon: ShoppingCart, slug: 'e-commerce-services', title: 'E-Commerce Services', text: 'Simplify your online store with our expert E-Commerce services. We handle product listings, inventory, and customer support to keep your business running smoothly. With our help, you can boost sales, and enhance customer experience.', color: '#6366f1' },
]

/* ─── Subtle floating dots ─── */
const FloatingDots = memo(function FloatingDots() {
  const ref = useRef()
  const positions = React.useMemo(() => {
    const a = new Float32Array(300 * 3)
    for (let i = 0; i < 300; i++) { a[i*3]=(Math.random()-0.5)*25; a[i*3+1]=(Math.random()-0.5)*18; a[i*3+2]=(Math.random()-0.5)*12 }
    return a
  }, [])
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.004 })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={300} array={positions} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.01} color="#2a8bff" transparent opacity={0.35} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
})

/* ─── Counter ─── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null); const started = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        gsap.to({ v: 0 }, { v: target, duration: 2, ease: 'power2.out', onUpdate() { setCount(Math.floor(this.targets()[0].v)) } })
      }
    }, { threshold: 0.5 }); obs.observe(el); return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{count}{suffix}</span>
}

/* ─── Service Card ─── */
function ServiceCard({ service, index }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const Icon = service.icon
  const handleMove = (e) => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: ((e.clientY-r.top)/r.height-0.5)*-5, y: ((e.clientX-r.left)/r.width-0.5)*5 }) }
  return (
    <div id={service.slug} data-cursor="hover" data-svc-item onMouseMove={handleMove} onMouseLeave={() => setTilt({x:0,y:0})}
      style={{ transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 0.3s ease-out' }}
      className="group glass rounded-2xl p-7 hover:border-white/10 transition-all duration-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${service.color}10, transparent 70%)` }} />
      <div className="absolute top-6 right-6 text-[10px] font-display font-bold text-white/6 tracking-widest">{String(index+1).padStart(2,'0')}</div>
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-500"
          style={{ background: `linear-gradient(135deg, ${service.color}18, ${service.color}08)` }}>
          <Icon className="w-5 h-5" style={{ color: service.color }} />
        </div>
        <h3 className="text-lg font-display font-bold text-white/85 mb-3 leading-snug">{service.title}</h3>
        <p className="text-[13px] text-white/35 leading-[1.75] mb-5">{service.text}</p>
        <a href={`/services/${service.slug}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all duration-300 group-hover:gap-2" style={{ color: service.color, textDecoration: 'none' }}>
          Read More <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const pageRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const el = pageRef.current; if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('[data-svc-hero]', { opacity: 0, y: 20, filter: 'blur(3px)', duration: 1.4, stagger: 0.12, delay: 0.3, ease: 'power2.out' })
      gsap.utils.toArray('[data-svc-item]').forEach((item, i) => {
        gsap.from(item, { opacity: 0, y: 30, scale: 0.97, duration: 1.3, ease: 'power2.out', delay: i * 0.06,
          scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play reverse play reverse' } })
      })
      gsap.from('[data-svc-banner]', { opacity: 0, scale: 0.95, y: 25, duration: 1.3, ease: 'power2.out',
        scrollTrigger: { trigger: '[data-svc-banner]', start: 'top 85%', toggleActions: 'play reverse play reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.slice(1)
    const timer = setTimeout(() => {
      const target = document.getElementById(id)
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
    return () => clearTimeout(timer)
  }, [location.hash])

  return (
    <div ref={pageRef}>
      <div style={{ position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:0,pointerEvents:'none' }}>
        <Canvas camera={{ position:[0,0,8], fov:50 }} dpr={[1,1.5]} gl={{ antialias:false, alpha:true, powerPreference:'high-performance', stencil:false }}>
          <Suspense fallback={null}><ambientLight intensity={0.1} /><FloatingDots /></Suspense>
        </Canvas>
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <section className="relative pt-28 sm:pt-32 pb-14">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/20 via-navy-950/50 to-navy-950 pointer-events-none" />
          <Container className="relative z-10">
            <div className="max-w-2xl">
              <span data-svc-hero className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-brand-400 text-xs font-semibold uppercase tracking-[0.15em] mb-5">Our Services</span>
              <h1 data-svc-hero className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-extrabold leading-[1.08] mb-5">
                What Services <span className="text-gradient">We Offer</span>
              </h1>
              <p data-svc-hero className="text-base sm:text-lg text-white/40 leading-relaxed max-w-lg">
                We make it easier for business owners to manage their day-to-day tasks so they can focus on growing and succeeding.
              </p>
            </div>
          </Container>
        </section>

        {/* Grid */}
        <section className="relative py-10 sm:py-16">
          <Container>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s, i) => <ServiceCard key={s.title} service={s} index={i} />)}
            </div>
          </Container>
        </section>

        {/* Challenge Banner */}
        <section className="relative py-14 sm:py-20">
          <Container>
            <div data-svc-banner className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800" />
              <div className="relative z-10 px-8 py-10 lg:px-14 lg:py-14 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><Zap className="w-6 h-6 text-accent-400" /></div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-display font-bold text-white">We Are Ready To Take On Challenges!</h3>
                    <p className="text-white/50 text-sm mt-1">We handle tough tasks with expertise, delivering reliable solutions to help your business succeed.</p>
                  </div>
                </div>
                <Button variant="accent" size="lg" href="https://calendly.com/oliver-reid-bizbackerz/30min">Start Consultation <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Stats */}
        <section className="relative py-14 sm:py-20 pb-24">
          <Container>
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold leading-[1.08] mb-4">
                We Power Your <span className="text-gradient">Productivity</span>
              </h2>
              <p className="text-sm text-white/35">We provide expert virtual support designed to streamline your daily operations and save valuable time.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="glass rounded-2xl p-7 text-center">
                <div className="text-4xl font-display font-extrabold text-gradient mb-2"><Counter target={95} suffix="%" /></div>
                <h3 className="text-sm font-display font-bold text-white/70 mb-2">We Help Optimize Your Daily Workflow</h3>
                <p className="text-xs text-white/30">We streamline your tasks and processes, saving time and making your daily operations smoother.</p>
              </div>
              <div className="glass rounded-2xl p-7 text-center">
                <div className="text-4xl font-display font-extrabold mb-2"><span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-accent-500"><Counter target={90} suffix="%" /></span></div>
                <h3 className="text-sm font-display font-bold text-white/70 mb-2">We Help Businesses Reach New Heights</h3>
                <p className="text-xs text-white/30">We provide expert support and strategies that empower your business to grow and succeed.</p>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  )
}
