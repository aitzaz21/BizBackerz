import React, { useEffect, useRef, useState, Suspense, memo } from 'react'
import { Canvas } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { Phone, Mail, MapPin, Send, ArrowRight, Clock } from 'lucide-react'

/* ─── Minimal particles ─── */
const ContactParticles = memo(function ContactParticles() {
  const ref = useRef()
  const positions = React.useMemo(() => {
    const a = new Float32Array(200 * 3)
    for (let i = 0; i < 200; i++) { a[i*3]=(Math.random()-0.5)*20; a[i*3+1]=(Math.random()-0.5)*15; a[i*3+2]=(Math.random()-0.5)*10 }
    return a
  }, [])
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.002 })
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" count={200} array={positions} itemSize={3} /></bufferGeometry>
      <pointsMaterial size={0.01} color="#50A6B4" transparent opacity={0.3} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
})

/* ─── Contact Info Card ─── */
function InfoCard({ icon: Icon, title, value, href, color }) {
  return (
    <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
      data-contact-card data-cursor="hover"
      className="glass rounded-2xl p-6 flex items-center gap-4 hover:border-white/10 transition-all duration-500 group">
      <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-white/30 font-medium uppercase tracking-[0.1em] mb-0.5">{title}</p>
        <p className="text-sm font-display font-semibold text-white/70 group-hover:text-white transition-colors">{value}</p>
      </div>
    </a>
  )
}

export default function ContactPage() {
  const pageRef = useRef(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const el = pageRef.current; if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('[data-contact-hero]', { opacity: 0, y: 20, filter: 'blur(3px)', duration: 1.4, stagger: 0.12, delay: 0.3, ease: 'power2.out' })
      gsap.utils.toArray('[data-contact-card]').forEach((card, i) => {
        gsap.from(card, { opacity: 0, y: 25, duration: 1.3, ease: 'power2.out', delay: 0.5 + i * 0.1,
          scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play reverse play reverse' } })
      })
      gsap.from('[data-contact-form]', { opacity: 0, y: 30, scale: 0.98, duration: 1.4, ease: 'power2.out',
        scrollTrigger: { trigger: '[data-contact-form]', start: 'top 85%', toggleActions: 'play reverse play reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Would POST to /api/contact in production
    console.log('Contact form:', form)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const inputClass = "w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-brand-500/30 focus:bg-white/[0.05] transition-all duration-300"

  return (
    <div ref={pageRef}>
      {/* Background */}
      <div style={{ position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:0,pointerEvents:'none' }}>
        <Canvas camera={{ position:[0,0,8], fov:50 }} dpr={[1,1.5]} gl={{ antialias:false, alpha:true, powerPreference:'high-performance', stencil:false }}>
          <Suspense fallback={null}><ambientLight intensity={0.08} /><ContactParticles /></Suspense>
        </Canvas>
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <section className="relative pt-28 sm:pt-32 pb-10">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/20 via-navy-950/50 to-navy-950 pointer-events-none" />
          <Container className="relative z-10">
            <div className="max-w-2xl">
              <span data-contact-hero className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-brand-400 text-xs font-semibold uppercase tracking-[0.15em] mb-5">Contact Us</span>
              <h1 data-contact-hero className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-extrabold leading-[1.08] mb-5">
                Get In <span className="text-gradient">Touch</span>
              </h1>
              <p data-contact-hero className="text-base sm:text-lg text-white/40 leading-relaxed max-w-lg">
                Have questions or need assistance? Get in touch with us today! Our team is here to help and ready to provide the support you need.
              </p>
            </div>
          </Container>
        </section>

        {/* Contact Info Cards */}
        <section className="relative py-10">
          <Container>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard icon={Phone} title="Give Us A Call (US)" value="(904) 668-6362" href="tel:+19046686362" color="#3b82f6" />
              <InfoCard icon={Phone} title="Give Us A Call (UK)" value="+44 7366 419570" href="tel:+447366419570" color="#8b5cf6" />
              <InfoCard icon={Mail} title="Send Us A Message" value="Hello@bizbackerz.com" href="mailto:Hello@bizbackerz.com" color="#10b981" />
              <InfoCard icon={Clock} title="Work Hours" value="Mon-Sat: 8AM - 5PM" href="#" color="#f59e0b" />
            </div>
          </Container>
        </section>

        {/* Form */}
        <section className="relative py-10 sm:py-16 pb-24">
          <Container>
            <div className="max-w-2xl mx-auto">
              <div data-contact-form className="glass rounded-2xl p-7 sm:p-10">
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-500/15 flex items-center justify-center mb-4">
                      <Send className="w-6 h-6 text-accent-400" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-sm text-white/40">We'll get back to you shortly.</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-display font-bold text-white/85 mb-6">Send Us A Message</h2>
                    <div className="space-y-4" onSubmit={handleSubmit}>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} className={inputClass} required />
                        <input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} className={inputClass} required />
                      </div>
                      <input type="tel" name="phone" placeholder="Phone Number (optional)" value={form.phone} onChange={handleChange} className={inputClass} />
                      <textarea name="message" placeholder="Your Message" rows={5} value={form.message} onChange={handleChange}
                        className={`${inputClass} resize-none`} required />
                      <Button size="lg" onClick={handleSubmit} className="w-full sm:w-auto">
                        Send Message <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  )
}
