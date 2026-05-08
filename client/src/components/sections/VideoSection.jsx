import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Container from '../ui/Container'
import { Play, Pause } from 'lucide-react'
import { motion } from 'framer-motion'

export default function VideoSection() {
  const sectionRef    = useRef(null)
  const videoRef      = useRef(null)
  const containerRef  = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const section   = sectionRef.current
    const container = containerRef.current
    if (!section || !container) return

    const isMobile = window.matchMedia('(pointer: coarse)').matches

    const ctx = gsap.context(() => {
      if (!isMobile) {
        /* ── Header label ── */
        gsap.from('[data-vid-label]', {
          opacity: 0, x: -20,
          duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 75%', toggleActions: 'play reverse play reverse' },
        })

        /* ── Heading clip-path reveal ── */
        gsap.from('[data-vid-line]', {
          yPercent: 112,
          duration: 1.3, stagger: 0.1, ease: 'power4.out',
          scrollTrigger: { trigger: section, start: 'top 72%', toggleActions: 'play reverse play reverse' },
        })

        gsap.from('[data-vid-desc]', {
          opacity: 0, y: 18,
          duration: 1, ease: 'power2.out',
          scrollTrigger: { trigger: section, start: 'top 68%', toggleActions: 'play reverse play reverse' },
        })

        /* ── Video zoom-in on scroll — tighter window for a crisper pop ── */
        gsap.fromTo(container,
          { scale: 0.82, opacity: 0, filter: 'blur(10px)', borderRadius: '3rem' },
          {
            scale: 1, opacity: 1, filter: 'blur(0px)', borderRadius: '1.5rem',
            ease: 'power1.out',
            scrollTrigger: {
              trigger: container, start: 'top 85%', end: 'top 18%', scrub: 1.4,
            },
          }
        )

        /* ── Parallax on scroll past ── */
        gsap.to(container, {
          y: -55,
          ease: 'none',
          scrollTrigger: {
            trigger: container, start: 'top center', end: 'bottom top', scrub: 2,
          },
        })
      }
    }, section)

    /* ── Auto-play when in view ── */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {})
          setIsPlaying(true)
        } else {
          videoRef.current?.pause()
          setIsPlaying(false)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(section)

    return () => { ctx.revert(); observer.disconnect() }
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false) }
    else           { videoRef.current.play();  setIsPlaying(true) }
  }

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <Container>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div data-vid-label className="flex justify-center mb-6">
            <span className="section-label">See Us In Action</span>
          </div>

          <h2 className="font-display font-bold tracking-[-0.04em] mb-5">
            <div className="gsap-line-clip" style={{ lineHeight: 1.08, paddingBottom: '0.06em' }}>
              <span data-vid-line className="block text-3xl sm:text-4xl lg:text-5xl text-white">
                Meet and approve
              </span>
            </div>
            <div className="gsap-line-clip" style={{ lineHeight: 1.08, paddingBottom: '0.06em' }}>
              <span data-vid-line className="block text-3xl sm:text-4xl lg:text-5xl text-gradient">
                your assistant
              </span>
            </div>
          </h2>

          <p data-vid-desc className="text-white/42 leading-[1.85] font-body">
            Get in touch with your assistant to see if they're the right fit.
            Once you approve, you'll be ready to start working together.
          </p>
        </div>

        {/* Video container */}
        <div ref={containerRef} className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden">

          {/* Border overlay */}
          <div className="absolute inset-0 rounded-3xl border border-white/8 z-20 pointer-events-none" />

          <div className="relative aspect-video bg-navy-800 rounded-3xl overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              loop muted playsInline preload="metadata"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230a1628'/%3E%3Cstop offset='50%25' stop-color='%230654e8' stop-opacity='0.3'/%3E%3Cstop offset='100%25' stop-color='%2338d9a9' stop-opacity='0.2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='1920' height='1080'/%3E%3C/svg%3E"
            >
              <source src="https://cdn.coverr.co/videos/coverr-team-working-in-an-office-1584/1080p.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/65 via-transparent to-navy-950/25 z-10" />

            {/* Play / Pause button */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer group"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              <motion.div
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.93 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isPlaying
                    ? 'bg-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100'
                    : 'bg-brand-500/90 backdrop-blur-sm glow-brand animate-pulse-glow'
                }`}
              >
                {isPlaying
                  ? <Pause className="w-8 h-8 text-white" />
                  : <Play  className="w-8 h-8 text-white ml-1" />
                }
              </motion.div>
            </button>

            {/* Bottom info strip */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-6 lg:p-8">
              <div className="glass-light rounded-2xl px-6 py-4 flex items-center justify-between max-w-md">
                <div>
                  <p className="font-display font-semibold text-white text-sm tracking-[-0.01em]">
                    BizBackerz Team
                  </p>
                  <p className="text-white/45 text-xs font-body mt-0.5">
                    Your dedicated virtual assistants
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500/40 to-accent-500/40 border-2 border-navy-950 flex items-center justify-center"
                    >
                      <span className="text-[10px] font-display font-bold text-white/80">{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Outer glow */}
          <div className="absolute -inset-5 bg-brand-500/4 rounded-[2rem] blur-3xl -z-10" />
        </div>
      </Container>
    </section>
  )
}
