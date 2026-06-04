import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import PageSEO from '../components/ui/PageSEO'
import RobotCursorTracker from '../components/ui/RobotCursorTracker'
import { Phone, Mail, MapPin, Send, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/* ── Floating Label Input ─────────────────────────────────── */
function FloatingInput({ label, name, type = 'text', value, onChange, required, onFocus, onBlur }) {
  const [focused, setFocused] = useState(false)
  const filled = value && value.length > 0

  return (
    <div className="relative">
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-250 z-10 font-body
          ${focused || filled
            ? 'top-2 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-400'
            : 'top-4 text-[14px] text-white/35'
          }`}
      >
        {label}{required && <span className="text-brand-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        required={required}
        onChange={onChange}
        onFocus={() => { setFocused(true); onFocus?.() }}
        onBlur={() => { setFocused(false); onBlur?.() }}
        className="w-full pt-6 pb-3 px-4 text-[14px] text-white bg-white/[0.03] border border-white/[0.08] rounded-xl
          focus:outline-none focus:border-brand-500/50 focus:bg-white/[0.05]
          hover:border-white/[0.14] transition-all duration-300"
      />
      <motion.div
        initial={false}
        animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ originX: 0 }}
        className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-brand-400 via-brand-300 to-transparent rounded-b-xl pointer-events-none"
      />
    </div>
  )
}

function FloatingTextarea({ label, name, value, onChange, required, rows = 5, onFocus, onBlur }) {
  const [focused, setFocused] = useState(false)
  const filled = value && value.length > 0

  return (
    <div className="relative">
      <label
        className={`absolute left-4 pointer-events-none transition-all duration-250 z-10 font-body
          ${focused || filled
            ? 'top-2 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-400'
            : 'top-4 text-[14px] text-white/35'
          }`}
      >
        {label}{required && <span className="text-brand-400 ml-0.5">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        rows={rows}
        required={required}
        onChange={onChange}
        onFocus={() => { setFocused(true); onFocus?.() }}
        onBlur={() => { setFocused(false); onBlur?.() }}
        className="w-full pt-7 pb-3 px-4 text-[14px] text-white bg-white/[0.03] border border-white/[0.08] rounded-xl resize-none
          focus:outline-none focus:border-brand-500/50 focus:bg-white/[0.05]
          hover:border-white/[0.14] transition-all duration-300"
      />
      <motion.div
        initial={false}
        animate={{ scaleX: focused ? 1 : 0, opacity: focused ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ originX: 0 }}
        className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-brand-400 via-brand-300 to-transparent rounded-b-xl pointer-events-none"
      />
    </div>
  )
}

/* ── Info Card ─────────────────────────────────────────────── */
function InfoCard({ icon: Icon, title, value, href, color, delay = 0, className = '' }) {
  return (
    <motion.a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className={`group relative overflow-hidden rounded-xl p-3.5 flex flex-col gap-2.5 cursor-pointer ${className}`}
      style={{ background: 'rgba(8,16,34,0.8)', border: `1px solid ${color}25` }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
        style={{ background: `linear-gradient(90deg, ${color}85, ${color}30, transparent 70%)` }}
      />
      {/* Hover glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(130% 110% at 0% 0%, ${color}14 0%, transparent 60%)` }}
      />

      {/* Row 1 — icon + arrow */}
      <div className="relative flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}16`, border: `1px solid ${color}28` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <ArrowUpRight
          className="w-3 h-3 opacity-0 group-hover:opacity-55 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
          style={{ color }}
        />
      </div>

      {/* Row 2 — label + value */}
      <div className="relative">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: `${color}cc` }}>
          {title}
        </p>
        <p className="text-[13px] font-semibold text-white leading-snug">
          {value}
        </p>
      </div>
    </motion.a>
  )
}

/* ── Ambient mesh orb ─────────────────────────────────────── */
function MeshOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: '65vw', height: '65vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(42,139,255,0.08) 0%, transparent 60%)',
      }}/>
      <div style={{
        position: 'absolute', bottom: '-5%', left: '-15%',
        width: '55vw', height: '55vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(32,201,151,0.06) 0%, transparent 60%)',
        animation: 'float 18s ease-in-out 3s infinite',
      }}/>
      <div style={{
        position: 'absolute', top: '40%', left: '35%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 60%)',
        animation: 'float 22s ease-in-out 8s infinite',
      }}/>
      <div className="absolute inset-0 bg-gradient-to-b from-[#030912]/10 via-transparent to-[#030912]/80 pointer-events-none"/>
    </div>
  )
}

/* ── Scan line decoration ─────────────────────────────────── */
function ScanLine() {
  return (
    <div className="absolute left-0 right-0 h-px pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(42,139,255,0.4), transparent)', animation: 'glow-line 4s ease-in-out infinite' }}/>
    </div>
  )
}

/* ── Robot speech bubble ──────────────────────────────────── */
function RobotBubble({ mood, submitted }) {
  const messages = {
    idle:     "Hey! I'm BAXZ.\nHow can I help you?",
    thinking: "I see you're\ntyping… go on!",
    happy:    "Message sent!\nWe'll be in touch 🎉",
  }
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mood}
        initial={{ opacity: 0, scale: 0.88, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: -8 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative mb-4 mx-auto"
        style={{ maxWidth: 200 }}
      >
        <div className="glass rounded-2xl rounded-bl-sm px-4 py-3 text-center">
          <p className="text-[12.5px] font-body text-white/75 leading-relaxed whitespace-pre-line">{messages[mood]}</p>
        </div>
        {/* tail */}
        <div style={{
          position: 'absolute', bottom: -6, left: 24,
          width: 12, height: 12,
          background: 'rgba(255,255,255,0.05)',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}/>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ContactPage() {
  const pageRef = useRef(null)
  const [form, setForm]       = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')
  const [robotMood, setRobotMood] = useState('idle')
  const [anyFocused, setAnyFocused] = useState(false)

  /* Mood logic */
  useEffect(() => {
    if (submitted) { setRobotMood('happy'); return }
    const hasContent = Object.values(form).some(v => v.length > 0)
    setRobotMood(anyFocused || hasContent ? 'thinking' : 'idle')
  }, [form, submitted, anyFocused])

  /* GSAP entrance */
  useEffect(() => {
    const el = pageRef.current; if (!el) return
    const ctx = gsap.context(() => {
      gsap.from('[data-ch]', {
        opacity: 0, y: 22, filter: 'blur(3px)',
        duration: 1.2, stagger: 0.1, delay: 0.25, ease: 'power2.out',
      })
    }, el)
    return () => ctx.revert()
  }, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  const handleFocus  = () => setAnyFocused(true)
  const handleBlur   = () => setAnyFocused(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res  = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); return }
      setSubmitted(true)
      setForm({ name: '', email: '', phone: '', message: '' })
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', { send_to: 'AW-17270402441/9Dr9CL3t_6McEInblatA' })
      }
      setTimeout(() => { setSubmitted(false); setRobotMood('idle') }, 7000)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-hidden bg-[#02050a]">
      <PageSEO
        title="Contact BizBackerz – Hire a Virtual Assistant"
        description="Get in touch with BizBackerz to hire a dedicated virtual assistant. Call (904) 668-6362 or email Hello@bizbackerz.com. Available Mon–Fri, 11:00 AM – 8:00 PM ET."
        canonical="https://bizbackerz.com/contact"
      />
      <MeshOrbs />

      <div className="relative z-10">
        {/* ── Hero header ─────────────────────────────────── */}
        <section className="relative pt-8 sm:pt-10 pb-6">
          <Container>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <span data-ch className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-brand-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"/>
                  Let's Connect
                </span>
                <h1 data-ch className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold leading-[1.07] mb-4">
                  Get In{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
                    Touch
                  </span>
                </h1>
                <p data-ch className="text-[15px] sm:text-[17px] text-white/40 leading-relaxed max-w-md">
                  Have a project in mind? Our team is ready to help you scale, grow, and succeed.
                </p>
              </div>

              {/* Info pill row — desktop */}
              <div data-ch className="hidden lg:flex items-center gap-3 pb-1">
                <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"/>
                  <span className="text-[12px] font-body font-normal text-white/55">Mon – Fri{' · '}11:00 AM – 8:00 PM ET</span>
                </div>
                <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-400"/>
                  <span className="text-[12px] font-body font-normal text-white/55">London, UK{' · '}Remote Global</span>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ── Main content ─────────────────────────────────── */}
        <section className="relative pt-4 pb-28">
          <Container>
            <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-8 xl:gap-12 items-start">

              {/* ── LEFT: Form ──────────────────────────────── */}
              <div data-ch>
                {/* Info cards — mobile (above form) */}
                <div className="grid grid-cols-2 gap-3 mb-6 lg:hidden">
                  <InfoCard icon={Phone} title="US Phone" value="(904) 668-6362" href="tel:+19046686362" color="#3b82f6" delay={0.1}/>
                  <InfoCard icon={Phone} title="UK Phone" value="+44 7366 419570" href="tel:+447366419570" color="#8b5cf6" delay={0.15}/>
                  <InfoCard icon={Mail} title="Email Us" value="Hello@bizbackerz.com" href="mailto:Hello@bizbackerz.com" color="#10b981" delay={0.2}/>
                  <InfoCard icon={Clock} title="Office Hours" value="Mon–Fri · 11:00 AM – 8:00 PM ET" href="/booking" color="#f59e0b" delay={0.25}/>
                </div>

                {/* Form card */}
                <div className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                  {/* Top glow line */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent pointer-events-none"/>
                  <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-brand-500/10 blur-[80px] pointer-events-none"/>

                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                        className="py-12 text-center"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1, type: 'spring', stiffness: 250, damping: 18 }}
                          className="w-16 h-16 mx-auto rounded-2xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(32,201,151,0.3)]"
                        >
                          <CheckCircle2 className="w-7 h-7 text-accent-400"/>
                        </motion.div>
                        <h3 className="text-2xl font-display font-bold text-white mb-2">Message Sent!</h3>
                        <p className="text-[14px] text-white/45 font-body">We'll be in touch with you very soon.</p>
                      </motion.div>
                    ) : (
                      <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex items-center gap-3 mb-7">
                          <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
                            <Send className="w-4 h-4 text-brand-400"/>
                          </div>
                          <div>
                            <h2 className="text-[16px] font-display font-bold text-white/90">Send Us A Message</h2>
                            <p className="text-[11px] text-white/35 font-body">Usually replies within 2 hours</p>
                          </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FloatingInput label="Your Name" name="name" value={form.name} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur}/>
                            <FloatingInput label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required onFocus={handleFocus} onBlur={handleBlur}/>
                          </div>
                          <FloatingInput label="Phone Number (optional)" name="phone" type="tel" value={form.phone} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur}/>
                          <FloatingTextarea label="Your Message" name="message" value={form.message} onChange={handleChange} required rows={5} onFocus={handleFocus} onBlur={handleBlur}/>

                          <AnimatePresence>
                            {error && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                              >
                                {error}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <div className="flex items-center gap-4 pt-2">
                            <Button size="lg" type="submit" disabled={submitting} className="group relative overflow-hidden">
                              {submitting ? (
                                <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"/><span>Sending…</span></>
                              ) : (
                                <><span>Send Message</span><Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"/></>
                              )}
                            </Button>
                            <p className="text-[11px] text-white/25 font-body leading-tight">
                              No spam,<br/>ever.
                            </p>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Location bar */}
                <motion.a
                  href="https://share.google/yconWqaIeNBaoj4r5"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  whileHover={{ y: -1 }}
                  className="mt-4 glass rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 group cursor-pointer block"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.07))' }}>
                      <MapPin className="w-4 h-4 text-red-400"/>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 font-body font-medium uppercase tracking-[0.1em] mb-0.5">Our Location</p>
                      <p className="text-[13px] font-display font-semibold text-white/65 group-hover:text-white transition-colors">
                        London, United Kingdom
                        <span className="text-white/35 font-body font-normal text-[12px] ml-2">· Remote operations worldwide</span>
                      </p>
                    </div>
                  </div>
                  <span className="flex-shrink-0 inline-flex items-center gap-1.5 text-[11px] font-body font-medium text-brand-400 group-hover:gap-2 transition-all duration-300 uppercase tracking-[0.1em]">
                    Maps
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
                  </span>
                </motion.a>
              </div>

              {/* ── RIGHT: Robot + Info Cards ─────────────── */}
              <div data-ch className="flex flex-col items-center gap-6 sticky top-24 self-start">

                {/* Info cards — desktop */}
                <div className="hidden lg:grid grid-cols-2 gap-3 w-full">
                  <InfoCard icon={Phone} title="US Phone" value="(904) 668-6362" href="tel:+19046686362" color="#3b82f6" delay={0.2}/>
                  <InfoCard icon={Phone} title="UK Phone" value="+44 7366 419570" href="tel:+447366419570" color="#8b5cf6" delay={0.25}/>
                  <InfoCard icon={Mail} title="Email Us" value="Hello@bizbackerz.com" href="mailto:Hello@bizbackerz.com" color="#10b981" delay={0.3}/>
                  <InfoCard icon={Clock} title="Office Hours" value="Mon–Fri · 11:00 AM – 8:00 PM ET" href="/booking" color="#f59e0b" delay={0.35}/>
                </div>

                {/* Robot mascot */}
                <div className="hidden lg:flex flex-col items-center relative">
                  {/* Glow pool under robot */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(42,139,255,0.25) 0%, transparent 70%)', filter: 'blur(12px)' }}/>

                  {/* Speech bubble */}
                  <RobotBubble mood={robotMood} submitted={submitted}/>

                  {/* Robot */}
                  <RobotCursorTracker mood={robotMood} size={1.25} />

                  {/* BAXZ label */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse"/>
                    <span className="text-[11px] font-body font-medium text-white/35 uppercase tracking-[0.15em]">BAXZ{' · '}BizBackerz AI</span>
                  </div>
                </div>

                {/* Mobile robot — smaller, centered above form on lg- */}
                <div className="flex lg:hidden flex-col items-center mt-2">
                  <RobotBubble mood={robotMood} submitted={submitted}/>
                  <RobotCursorTracker mood={robotMood} size={0.82} />
                </div>

              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  )
}
