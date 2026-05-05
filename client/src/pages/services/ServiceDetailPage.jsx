import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Container from '../../components/ui/Container'
import Button from '../../components/ui/Button'
import { getServiceBySlug } from '../../data/servicesData'
import {
  Calendar, CalendarDays, Mail, Database, FileText, Phone, RefreshCw,
  MessageSquare, MessageCircle, Users, Star, CheckCircle, ClipboardList,
  Share2, TrendingUp, Image, Target, PenTool, FolderKanban,
  Search, Globe, Sparkles, UserPlus, BarChart2,
  CheckSquare, Clock, AlertCircle,
  DollarSign, Receipt, Calculator, CreditCard,
  Megaphone, Package, Headphones, ShoppingCart,
  MapPin, Cpu, Shield,
  ArrowRight, ArrowLeft, Zap, ChevronDown, Quote,
} from 'lucide-react'

/* ─── Brand palette ─── */
const B  = '#2a8bff'          // primary blue
const T  = '#38d9a9'          // accent teal
const Bh = 'rgba(42,139,255,' // helper prefix

/* ─── All icons used across feature data ─── */
const ICONS = {
  Calendar, CalendarDays, Mail, Database, FileText, Phone, RefreshCw,
  MessageSquare, MessageCircle, Users, Star, CheckCircle, ClipboardList,
  Share2, TrendingUp, Image, Target, PenTool, FolderKanban,
  Search, Globe, Sparkles, UserPlus, BarChart2,
  CheckSquare, Clock, AlertCircle,
  DollarSign, Receipt, Calculator, CreditCard,
  Megaphone, Package, Headphones, ShoppingCart,
  MapPin, Cpu, Shield,
  Zap,
}

/* ─── Main hero icon per service ─── */
const HERO_ICONS = {
  'digital-advertising':     BarChart2,
  'administrative-support':  ClipboardList,
  'customer-support':        Headphones,
  'social-media-management': Share2,
  'content-creation':        PenTool,
  'lead-generation':         UserPlus,
  'project-management':      FolderKanban,
  'accounting-services':     Calculator,
  'marketing-support':       Megaphone,
  'e-commerce-services':     ShoppingCart,
}

/* ══════════════════════════════════════════
   Animated counter
══════════════════════════════════════════ */
function Counter({ target, suffix = '' }) {
  return <span>{target}{suffix}</span>
}

/* ══════════════════════════════════════════
   FAQ Item (Framer accordion)
══════════════════════════════════════════ */
function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ delay: index * 0.12, duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="border-b"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="font-display font-semibold text-[15px] leading-snug transition-colors duration-300"
          style={{ color: open ? '#fff' : 'rgba(255,255,255,0.68)' }}>
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.28 }}
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-colors duration-300"
          style={{ borderColor: open ? `${Bh}0.4)` : 'rgba(255,255,255,0.1)', background: open ? `${Bh}0.12)` : 'transparent' }}>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: open ? B : 'rgba(255,255,255,0.35)' }} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden">
            <p className="text-[14px] text-white/45 leading-[1.8] pb-6 font-body pr-8">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function ServiceDetailPage() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const pageRef   = useRef(null)
  const service   = getServiceBySlug(slug)
  const HeroIcon  = HERO_ICONS[slug] || Zap

  useEffect(() => { if (!service) navigate('/services') }, [service, navigate])

  useEffect(() => {
    const el = pageRef.current
    if (!el || !service || window.matchMedia('(pointer: coarse)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('[data-sd-hero]', { opacity: 0, y: 32, filter: 'blur(6px)', duration: 1.7, stagger: 0.16, delay: 0.3, ease: 'power3.out' })
      gsap.from('[data-sd-herocard]', { opacity: 0, x: 48, rotateY: -10, duration: 1.9, delay: 0.65, ease: 'power3.out', transformPerspective: 1000 })
    }, el)
    return () => ctx.revert()
  }, [slug, service])

  if (!service) return null

  return (
    <div ref={pageRef} style={{ background: 'rgba(3,9,18,1)', minHeight: '100vh' }}>

      {/* ══════════════════════════════════════
          § 1  HERO
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-8 pb-0 lg:pt-10">

        {/* Atmospheric depth */}
        <div style={{ position:'absolute', top:'-15%', right:'-8%', width:800, height:800, borderRadius:'50%', background:`radial-gradient(circle, ${Bh}0.13) 0%, transparent 65%)`, filter:'blur(80px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'0%', left:'-6%', width:500, height:500, borderRadius:'50%', background:'rgba(56,217,169,0.06)', filter:'blur(120px)', pointerEvents:'none' }} />

        {/* Fine grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:`linear-gradient(${Bh}0.04) 1px,transparent 1px),linear-gradient(90deg,${Bh}0.04) 1px,transparent 1px)`, backgroundSize:'64px 64px' }} />

        {/* Top seal */}
        <div className="absolute top-0 inset-x-0 h-20 pointer-events-none" style={{ background:'linear-gradient(to bottom,rgba(3,9,18,1),transparent)' }} />

        <Container className="relative z-10 pb-0">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 xl:gap-16 items-center min-h-[88vh] pb-16">

            {/* ── LEFT ── */}
            <div>
              {/* Breadcrumb */}
              <div data-sd-hero className="flex items-center gap-2 mb-7 flex-wrap">
                {[['Home','/'],['Services','/services'],[service.title,null]].map(([label,href],i,arr) => (
                  <React.Fragment key={label}>
                    {href ? <Link to={href} className="text-[11px] font-body font-semibold text-white/28 hover:text-white/55 transition-colors uppercase tracking-[0.16em]">{label}</Link>
                          : <span className="text-[11px] font-body font-semibold uppercase tracking-[0.16em]" style={{ color:B }}>{label}</span>}
                    {i < arr.length-1 && <span className="text-white/15 text-[10px]">/</span>}
                  </React.Fragment>
                ))}
              </div>

              {/* Badge */}
              <div data-sd-hero className="mb-6">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-body font-bold uppercase tracking-[0.22em] border"
                  style={{ color:B, borderColor:`${Bh}0.3)`, background:`${Bh}0.08)` }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:B }} />
                  {service.category}
                </span>
              </div>

              {/* Heading */}
              <div data-sd-hero className="mb-5">
                <h1 className="font-display font-bold leading-[0.95] tracking-[-0.045em]">
                  <div style={{ overflow:'hidden', paddingBottom:'0.04em' }}>
                    <span className="block text-4xl sm:text-5xl lg:text-[3.8rem] xl:text-[4.6rem] text-white">{service.title}</span>
                  </div>
                  <div style={{ overflow:'hidden', paddingBottom:'0.04em' }}>
                    <span className="block text-2xl sm:text-3xl lg:text-[2.4rem] xl:text-[2.8rem] text-gradient leading-[1.2]">{service.tagline}</span>
                  </div>
                </h1>
              </div>

              {/* Description */}
              <p data-sd-hero className="text-[15.5px] sm:text-[16.5px] text-white/42 leading-[1.88] max-w-xl mb-9 font-body">
                {service.heroDescription}
              </p>

              {/* Stat pills */}
              <div data-sd-hero className="flex flex-wrap gap-3 mb-9">
                {service.heroStats.map((s,i) => (
                  <div key={i} className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border"
                    style={{ borderColor:`${Bh}0.22)`, background:`${Bh}0.07)` }}>
                    <span className="font-display font-bold text-[1.25rem] leading-none" style={{ color:B }}>{s.value}</span>
                    <span className="text-[10.5px] font-body font-semibold text-white/35 uppercase tracking-[0.14em] leading-tight whitespace-nowrap">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div data-sd-hero className="flex flex-wrap items-center gap-4">
                <Button size="lg" href="/booking">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
                <Link to="/services" className="inline-flex items-center gap-2 text-[12px] font-body font-bold uppercase tracking-[0.15em] text-white/35 hover:text-white/70 transition-colors duration-300 group">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-300" />
                  All Services
                </Link>
              </div>
            </div>

            {/* ── RIGHT: Service showcase card ── */}
            <div data-sd-herocard className="hidden lg:block">
              <motion.div
                whileHover={{ y:-8, scale:1.018 }}
                transition={{ type:'spring', stiffness:260, damping:24 }}
                className="relative rounded-3xl overflow-hidden border"
                style={{ background:'linear-gradient(145deg,rgba(8,20,42,0.95),rgba(4,12,28,0.98))', borderColor:`${Bh}0.18)`, boxShadow:`0 40px 100px rgba(0,0,0,0.5),0 0 0 1px ${Bh}0.1),0 0 80px ${Bh}0.06)` }}
              >
                {/* Inner grid */}
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:`linear-gradient(${Bh}0.04) 1px,transparent 1px),linear-gradient(90deg,${Bh}0.04) 1px,transparent 1px)`, backgroundSize:'28px 28px' }} />
                {/* Glow blob */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background:`radial-gradient(circle at 70% 20%,${Bh}0.12),transparent 65%)`, filter:'blur(40px)' }} />
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background:`linear-gradient(90deg,transparent,${B},transparent)`, opacity:0.4 }} />

                <div className="relative z-10 p-9">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ background:`linear-gradient(135deg,${Bh}0.28),${Bh}0.10))`, border:`1px solid ${Bh}0.3)`, boxShadow:`0 8px 32px ${Bh}0.2),inset 0 1px 0 ${Bh}0.2)` }}>
                    <HeroIcon className="w-8 h-8" style={{ color:B }} />
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-white text-[1.25rem] leading-snug mb-1">{service.title}</h3>
                  <p className="text-[12px] font-body text-white/32 mb-7 leading-snug">{service.category} · BizBackerz</p>

                  {/* Feature list */}
                  <div className="space-y-3.5 mb-8">
                    {service.features.slice(0,4).map((f,i) => {
                      const FI = ICONS[f.icon] || Zap
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                            style={{ background:`${Bh}0.12)`, border:`1px solid ${Bh}0.2)` }}>
                            <FI className="w-3.5 h-3.5" style={{ color:B }} />
                          </div>
                          <div>
                            <p className="text-[12.5px] font-display font-semibold text-white/80 leading-snug">{f.title}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-7 pt-6 border-t" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                    {service.heroStats.map((s,i) => (
                      <div key={i} className="text-center">
                        <div className="font-display font-bold text-[1.4rem] leading-none mb-1" style={{ color:B }}>{s.value}</div>
                        <div className="text-[9px] font-body text-white/28 uppercase tracking-[0.14em] leading-tight">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mini CTA */}
                  <Link to="/booking"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-display font-bold text-[12.5px] uppercase tracking-[0.14em] text-white transition-all duration-300 hover:shadow-lg"
                    style={{ background:`linear-gradient(135deg,${B},#1a7ae8)`, boxShadow:`0 4px 24px ${Bh}0.3)` }}>
                    Book Free Consultation <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Bottom bar */}
                <div className="px-9 py-3.5 border-t flex items-center gap-2" style={{ borderColor:'rgba(255,255,255,0.05)', background:'rgba(42,139,255,0.04)' }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background:T }} />
                  <span className="text-[10px] font-body text-white/28 uppercase tracking-[0.18em]">3+ Years Delivering Results</span>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>

        {/* Bottom fade into next section */}
        <div className="h-20" style={{ background:'linear-gradient(to bottom,transparent,rgba(3,9,18,1))' }} />
      </section>

      {/* ══════════════════════════════════════
          § 2  FEATURES — "What We Handle"
      ══════════════════════════════════════ */}
      <section className="relative py-20 lg:py-28">
        <Container>
          {/* Header */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-14">
            <div>
              <motion.div initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.0, ease:'easeOut' }} className="mb-4">
                <span className="section-label">What We Do</span>
              </motion.div>
              <motion.h2 initial={{ opacity:0,y:22 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.1,delay:0.12, ease:'easeOut' }}
                className="font-display font-bold tracking-[-0.04em] text-3xl sm:text-4xl lg:text-[2.9rem] leading-[1.06] text-white">
                What We Handle <span className="text-gradient">For You</span>
              </motion.h2>
            </div>
            <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.0,delay:0.24, ease:'easeOut' }}
              className="text-white/35 text-[13.5px] leading-relaxed font-body max-w-xs lg:text-right hidden lg:block">
              Every task. Every detail. Covered completely.
            </motion.p>
          </div>

          {/* Bento grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {service.features.map((f, i) => {
              const FI = ICONS[f.icon] || Zap
              return (
                <motion.div key={i}
                  initial={{ opacity:0, y:36 }}
                  whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:false, amount:0.15 }}
                  transition={{ delay:i*0.1, duration:1.1, ease:'easeOut' }}
                  whileHover={{ y:-7, scale:1.016, transition:{ type:'spring', stiffness:280, damping:24 } }}
                  className="group relative rounded-2xl p-7 border overflow-hidden cursor-default"
                  style={{ borderColor:'rgba(255,255,255,0.07)', background:'linear-gradient(155deg,rgba(7,17,36,0.95),rgba(4,11,24,0.98))' }}
                >
                  {/* Hover fill */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background:`radial-gradient(ellipse at 0% 0%,${Bh}0.1),transparent 60%)` }} />
                  {/* Top highlight line */}
                  <div className="absolute top-0 left-[12%] right-[12%] h-px opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                    style={{ background:`linear-gradient(90deg,transparent,${B},transparent)` }} />
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-[14%] bottom-[14%] w-[2px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                    style={{ background:`linear-gradient(180deg,transparent,${B}cc,transparent)` }} />
                  {/* Ghost index */}
                  <div className="absolute top-5 right-5 font-display font-bold text-[11px] tracking-widest select-none"
                    style={{ color:`${Bh}0.12)` }}>
                    {String(i+1).padStart(2,'0')}
                  </div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-400 group-hover:scale-110 group-hover:shadow-lg"
                      style={{ background:`linear-gradient(135deg,${Bh}0.2),${Bh}0.07))`, border:`1px solid ${Bh}0.22)`,
                        boxShadow:`0 0 0 0 ${Bh}0)` }}>
                      <FI className="w-5 h-5" style={{ color:B }} />
                    </div>

                    {/* Expanding divider */}
                    <div className="h-px mb-4 transition-all duration-500"
                      style={{ background:`linear-gradient(90deg,${B}88,transparent)`, width:'30%' }}
                      ref={el => { if(el) el.style.width = '' }}
                      onMouseEnter={e => e.currentTarget.style.width='100%'}
                      onMouseLeave={e => e.currentTarget.style.width='30%'}
                    />

                    <h3 className="font-display font-bold text-[15px] text-white/90 mb-2.5 leading-snug group-hover:text-white transition-colors duration-300">{f.title}</h3>
                    <p className="text-[12.5px] text-white/32 leading-[1.72] font-body group-hover:text-white/50 transition-colors duration-400">{f.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          § 3  BENEFITS — dark strip
      ══════════════════════════════════════ */}
      <section className="relative py-20 lg:py-28 overflow-hidden"
        style={{ background:'linear-gradient(180deg,rgba(3,9,18,1) 0%,rgba(5,14,30,0.97) 50%,rgba(3,9,18,1) 100%)' }}>
        {/* Atmospheric glow */}
        <div style={{ position:'absolute', top:'20%', right:'-6%', width:600, height:600, borderRadius:'50%', background:`${Bh}0.06)`, filter:'blur(150px)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'10%', left:'-8%', width:500, height:500, borderRadius:'50%', background:'rgba(56,217,169,0.04)', filter:'blur(130px)', pointerEvents:'none' }} />

        {/* Section separator line top */}
        <div className="absolute top-0 inset-x-0 h-px" style={{ background:`linear-gradient(90deg,transparent,${Bh}0.18),transparent)` }} />
        <div className="absolute bottom-0 inset-x-0 h-px" style={{ background:`linear-gradient(90deg,transparent,${Bh}0.12),transparent)` }} />

        <Container className="relative z-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.0, ease:'easeOut' }} className="mb-4 flex justify-center">
              <span className="section-label">Why BizBackerz</span>
            </motion.div>
            <motion.h2 initial={{ opacity:0,y:22 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.1,delay:0.12, ease:'easeOut' }}
              className="font-display font-bold tracking-[-0.04em] text-3xl sm:text-4xl lg:text-[2.9rem] leading-[1.06] text-white">
              Built for Results, <span className="text-gradient">Not Just Tasks</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {service.benefits.map((b, i) => {
              const BI = ICONS[b.icon] || Zap
              return (
                <motion.div key={i}
                  initial={{ opacity:0, y:36 }}
                  whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:false, amount:0.15 }}
                  transition={{ delay:i*0.22, duration:1.2, ease:'easeOut' }}
                  className="relative group"
                >
                  {/* Ghost large number */}
                  <div className="absolute -top-4 -left-2 font-display font-bold text-[6rem] leading-none select-none pointer-events-none"
                    style={{ color:`${Bh}0.055)`, letterSpacing:'-0.05em' }}>
                    {String(i+1).padStart(2,'0')}
                  </div>

                  <div className="relative rounded-2xl p-8 border h-full transition-all duration-500 group-hover:border-opacity-30"
                    style={{ border:`1px solid ${Bh}0.1)`, background:`linear-gradient(155deg,rgba(8,20,42,0.6),rgba(4,12,26,0.8))` }}>
                    {/* Top accent */}
                    <div className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background:`linear-gradient(90deg,transparent,${B}66,transparent)` }} />

                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                      style={{ background:`linear-gradient(135deg,${Bh}0.2),${Bh}0.07))`, border:`1px solid ${Bh}0.22)` }}>
                      <BI className="w-6 h-6" style={{ color:B }} />
                    </div>

                    <h3 className="font-display font-bold text-[18px] text-white mb-3 leading-snug">{b.title}</h3>
                    <p className="text-[13.5px] text-white/38 leading-[1.82] font-body">{b.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          § 4  PROCESS — horizontal timeline
      ══════════════════════════════════════ */}
      <section className="relative py-20 lg:py-28">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-16">
            <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.0, ease:'easeOut' }} className="mb-4 flex justify-center">
              <span className="section-label">Process</span>
            </motion.div>
            <motion.h2 initial={{ opacity:0,y:22 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.1,delay:0.12, ease:'easeOut' }}
              className="font-display font-bold tracking-[-0.04em] text-3xl sm:text-4xl lg:text-[2.9rem] leading-[1.06] text-white mb-4">
              How It <span className="text-gradient">Works</span>
            </motion.h2>
            <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.0,delay:0.24, ease:'easeOut' }}
              className="text-white/35 text-[14px] font-body leading-relaxed">
              Simple onboarding. Fast setup. Immediate results.
            </motion.p>
          </div>

          <div className="relative">
            {/* Horizontal connector — desktop */}
            <div className="hidden lg:block absolute top-[38px] left-[12.5%] right-[12.5%] h-px"
              style={{ background:`linear-gradient(90deg,transparent,${Bh}0.28),${Bh}0.35),${Bh}0.35),${Bh}0.28),transparent)`, borderTop:'1px dashed transparent' }} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
              {service.process.map((step, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, y:30 }}
                  whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:false, amount:0.2 }}
                  transition={{ delay:i*0.2, duration:1.1, ease:'easeOut' }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step circle */}
                  <div className="relative mb-6 z-10">
                    <div className="w-[76px] h-[76px] rounded-full flex items-center justify-center relative"
                      style={{ background:`linear-gradient(135deg,${Bh}0.18),${Bh}0.07))`, border:`2px solid ${Bh}0.3)` }}>
                      {/* Outer pulse ring */}
                      <div className="absolute inset-[-7px] rounded-full border" style={{ borderColor:`${Bh}0.1)` }} />
                      <span className="font-display font-bold text-[22px] text-gradient">{step.number}</span>
                    </div>
                    {/* Connector dot */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{ background:B }} />
                  </div>

                  <h3 className="font-display font-bold text-[15px] text-white mb-2 leading-snug">{step.title}</h3>
                  <p className="text-[12px] text-white/35 leading-[1.75] font-body max-w-[190px]">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          § 5  RESULTS — full-width dark panel
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background:`linear-gradient(135deg,rgba(5,20,55,0.95) 0%,rgba(3,9,18,1) 40%,rgba(3,14,35,0.95) 100%)` }}>
        {/* Top/bottom borders */}
        <div className="absolute top-0 inset-x-0 h-px" style={{ background:`linear-gradient(90deg,transparent,${B}55,transparent)` }} />
        <div className="absolute bottom-0 inset-x-0 h-px" style={{ background:`linear-gradient(90deg,transparent,${Bh}0.25),transparent)` }} />

        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:`linear-gradient(${Bh}0.04) 1px,transparent 1px),linear-gradient(90deg,${Bh}0.04) 1px,transparent 1px)`, backgroundSize:'48px 48px', opacity:0.6 }} />

        {/* Glow */}
        <div style={{ position:'absolute', top:'10%', left:'50%', transform:'translateX(-50%)', width:700, height:400, borderRadius:'50%', background:`radial-gradient(ellipse,${Bh}0.1),transparent 65%)`, filter:'blur(60px)', pointerEvents:'none' }} />

        <Container className="relative z-10 py-20 lg:py-24">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.0, ease:'easeOut' }} className="mb-4 flex justify-center">
              <span className="section-label">Results</span>
            </motion.div>
            <motion.h2 initial={{ opacity:0,y:22 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.1,delay:0.12, ease:'easeOut' }}
              className="font-display font-bold tracking-[-0.04em] text-3xl sm:text-4xl lg:text-[2.9rem] leading-[1.06] text-white">
              The Numbers <span className="text-gradient">Speak For Themselves</span>
            </motion.h2>
          </div>

          {/* Stats row with dividers */}
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" style={{ '--tw-divide-opacity':1, borderColor:`${Bh}0.1)` }}
            ref={el => { if(el) { const dividers = el.querySelectorAll(':scope > *:not(:first-child)'); dividers.forEach(d => d.style.borderColor=`${Bh}0.1)`) } }}>
            {service.results.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity:0, scale:0.9 }}
                whileInView={{ opacity:1, scale:1 }}
                viewport={{ once:false, amount:0.2 }}
                transition={{ delay:i*0.22, duration:1.2, ease:'easeOut' }}
                className="text-center px-8 py-10 lg:py-12 relative group"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background:`radial-gradient(ellipse at 50% 50%,${Bh}0.08),transparent 65%)` }} />

                <div className="relative z-10">
                  {/* Big number */}
                  <div className="font-display font-bold leading-none mb-3 text-gradient"
                    style={{ fontSize:'clamp(3.5rem,6vw,5.5rem)', letterSpacing:'-0.04em' }}>
                    <Counter target={r.target} suffix={r.suffix} />
                  </div>
                  <h3 className="font-display font-semibold text-[15px] text-white mb-1.5">{r.label}</h3>
                  <p className="text-[11.5px] text-white/30 font-body">{r.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          § 6  TESTIMONIAL
      ══════════════════════════════════════ */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div style={{ position:'absolute', top:'30%', left:'-5%', width:500, height:500, borderRadius:'50%', background:`${Bh}0.06)`, filter:'blur(130px)', pointerEvents:'none' }} />

        <Container className="relative z-10">
          <motion.div
            initial={{ opacity:0, y:40 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:false, amount:0.15 }}
            transition={{ duration:1.4, ease:'easeOut' }}
            className="relative max-w-3xl mx-auto rounded-3xl overflow-hidden border"
            style={{ borderColor:`${Bh}0.18)`, background:'linear-gradient(155deg,rgba(8,20,44,0.92),rgba(4,11,26,0.97))' }}
          >
            {/* Top border glow */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px" style={{ background:`linear-gradient(90deg,transparent,${B}66,transparent)` }} />
            {/* Corner glow */}
            <div style={{ position:'absolute', top:'-30px', right:'-30px', width:200, height:200, borderRadius:'50%', background:`${Bh}0.1)`, filter:'blur(60px)', pointerEvents:'none' }} />
            {/* Grid */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:`linear-gradient(${Bh}0.04) 1px,transparent 1px),linear-gradient(90deg,${Bh}0.04) 1px,transparent 1px)`, backgroundSize:'32px 32px', opacity:0.5 }} />

            <div className="relative z-10 px-8 py-12 lg:px-14 lg:py-16">
              {/* Quote icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8"
                style={{ background:`${Bh}0.15)`, border:`1px solid ${Bh}0.28)` }}>
                <Quote className="w-5 h-5" style={{ color:B }} />
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 fill-current" style={{ color:'#f59e0b' }} />)}
              </div>

              {/* Quote text */}
              <p className="text-[18px] sm:text-[20px] text-white/80 leading-[1.78] font-body italic mb-10">
                &ldquo;{service.testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-display font-bold flex-shrink-0"
                  style={{ background:`linear-gradient(135deg,${Bh}0.3),${Bh}0.12))`, border:`2px solid ${Bh}0.3)`, color:B }}>
                  {service.testimonial.initials}
                </div>
                <div>
                  <p className="font-display font-bold text-[15px] text-white">{service.testimonial.name}</p>
                  <p className="text-[12px] text-white/35 font-body">{service.testimonial.role}</p>
                </div>
                <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ borderColor:`${Bh}0.2)`, background:`${Bh}0.08)` }}>
                  <CheckCircle className="w-3 h-3" style={{ color:B }} />
                  <span className="text-[9.5px] font-body font-semibold text-white/40 uppercase tracking-[0.16em]">Verified Client</span>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          § 7  FAQ — sticky 2-col
      ══════════════════════════════════════ */}
      <section className="relative py-20 lg:py-28">
        <div style={{ position:'absolute', bottom:'15%', right:'-5%', width:500, height:500, borderRadius:'50%', background:`${Bh}0.05)`, filter:'blur(130px)', pointerEvents:'none' }} />

        <Container className="relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-start">
            {/* Left — sticky */}
            <div className="lg:sticky lg:top-28">
              <motion.div initial={{ opacity:0,x:-24 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.0, ease:'easeOut' }} className="mb-4">
                <span className="section-label">FAQ</span>
              </motion.div>
              <motion.h2 initial={{ opacity:0,y:22 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.1,delay:0.12, ease:'easeOut' }}
                className="font-display font-bold tracking-[-0.04em] text-3xl lg:text-[2.4rem] leading-[1.1] text-white mb-5">
                Frequently <br /><span className="text-gradient">Asked Questions</span>
              </motion.h2>
              <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.0,delay:0.24, ease:'easeOut' }}
                className="text-white/35 text-[13.5px] leading-relaxed font-body mb-8">
                Everything you need to know before getting started with {service.title.toLowerCase()}.
              </motion.p>
              <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:false, amount:0.3 }} transition={{ duration:1.0,delay:0.36, ease:'easeOut' }}>
                <Button size="md" href="/booking">
                  Book a Free Call <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            </div>

            {/* Right — accordion */}
            <div className="pt-2">
              {service.faqs.map((faq,i) => <FAQItem key={i} q={faq.question} a={faq.answer} index={i} />)}
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════
          § 8  CTA BANNER
      ══════════════════════════════════════ */}
      <section className="relative py-20 lg:py-24 pb-28">
        <Container>
          <motion.div
            initial={{ opacity:0, scale:0.94, y:24 }}
            whileInView={{ opacity:1, scale:1, y:0 }}
            viewport={{ once:false, amount:0.15 }}
            transition={{ duration:1.4, ease:'easeOut' }}
            className="relative rounded-3xl overflow-hidden px-8 py-16 lg:px-16 lg:py-20 text-center"
            style={{ background:'linear-gradient(135deg,rgba(5,25,65,0.97) 0%,rgba(3,9,18,0.98) 50%,rgba(4,16,42,0.96) 100%)' }}
          >
            {/* Borders */}
            <div className="absolute inset-0 rounded-3xl border pointer-events-none" style={{ borderColor:`${Bh}0.2)` }} />
            {/* Top highlight */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px" style={{ background:`linear-gradient(90deg,transparent,${B}88,transparent)` }} />
            {/* Bottom accent */}
            <div className="absolute bottom-0 left-[20%] right-[20%] h-px" style={{ background:`linear-gradient(90deg,transparent,rgba(56,217,169,0.4),transparent)` }} />

            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:`linear-gradient(${Bh}0.05) 1px,transparent 1px),linear-gradient(90deg,${Bh}0.05) 1px,transparent 1px)`, backgroundSize:'52px 52px' }} />

            {/* Glow blobs */}
            <div style={{ position:'absolute', top:'-40px', left:'15%', width:320, height:320, borderRadius:'50%', background:`${Bh}0.12)`, filter:'blur(90px)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:'-40px', right:'15%', width:280, height:280, borderRadius:'50%', background:'rgba(56,217,169,0.08)', filter:'blur(80px)', pointerEvents:'none' }} />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="flex justify-center mb-5">
                <span className="section-label">Get Started</span>
              </div>

              <h2 className="font-display font-bold tracking-[-0.04em] text-3xl sm:text-4xl lg:text-[3.2rem] leading-[1.05] text-white mb-5">
                Ready to <span className="text-gradient">Delegate</span> and Dominate?
              </h2>
              <p className="text-white/42 text-[15.5px] leading-relaxed font-body mb-9 max-w-xl mx-auto">
                Book a free consultation and discover exactly how our {service.title.toLowerCase()} support can transform your business — starting this week.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                <Button size="lg" href="/booking">
                  Book Free Consultation <ArrowRight className="w-4 h-4" />
                </Button>
                <Link to="/services" className="inline-flex items-center gap-2 text-[12px] font-body font-bold uppercase tracking-[0.15em] text-white/35 hover:text-white/65 transition-colors duration-300 group">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  All Services
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 pt-7 border-t" style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                {['No Long Contracts','NDA Protected','48h Setup','50+ Happy Clients'].map((item,i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color:T }} />
                    <span className="text-[11px] font-body font-semibold text-white/32 whitespace-nowrap">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

    </div>
  )
}
