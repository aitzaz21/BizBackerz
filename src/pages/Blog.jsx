import React, { useEffect, useRef, Suspense, memo } from 'react'
import { Canvas } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import Container from '../components/ui/Container'
import { Calendar, ArrowRight, Clock } from 'lucide-react'

/* ═══════════════════════════════════
   BLOG DATA (extracted from site)
   ═══════════════════════════════════ */
const blogs = [
  {
    title: 'How Virtual Assistant Services for Small Businesses Can Save you 20+ hours a Week (And Actually Scale your Business)',
    date: 'March 31, 2026',
    excerpt: 'Discover how delegating routine tasks to a skilled virtual assistant can free up 20+ hours every week, allowing you to focus on strategy and growth.',
    tag: 'Productivity',
    color: '#3b82f6',
  },
  {
    title: 'Boost Your Business in 2026 with Amazon and Real Estate Virtual Assistant Services',
    date: 'March 26, 2026',
    excerpt: 'Learn how specialized virtual assistants for Amazon sellers and real estate agents can transform your operations and drive revenue.',
    tag: 'Growth',
    color: '#10b981',
  },
  {
    title: 'Mojo Dialer: The Sales Tool That Turns Calls Into Closed Deals',
    date: 'October 22, 2025',
    excerpt: 'An in-depth look at how Mojo Dialer combined with dedicated virtual support can supercharge your outbound sales process.',
    tag: 'Sales',
    color: '#f59e0b',
  },
]

/* ═══════════════════════════════════
   LIGHT STARFIELD BACKGROUND
   ═══════════════════════════════════ */
const BlogStars = memo(function BlogStars() {
  const ref = useRef()

  const positions = React.useMemo(() => {
    const arr = new Float32Array(400 * 3)
    for (let i = 0; i < 400; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 15
    }
    return arr
  }, [])

  useFrame((s) => {
    if (!ref.current) return
    ref.current.rotation.y = s.clock.elapsedTime * 0.003
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={400} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#50A6B4" transparent opacity={0.4} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
})

/* ═══════════════════════════════════
   BLOG CARD
   ═══════════════════════════════════ */
function BlogCard({ blog, index }) {
  return (
    <div data-blog-item data-cursor="hover"
      className="group glass rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-500">
      {/* Image placeholder */}
      <div className="aspect-[16/10] relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${blog.color}15, ${blog.color}05, rgba(3,9,18,0.8))` }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-white/6 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
            style={{ boxShadow: `0 0 30px ${blog.color}10` }}>
            <span className="text-lg font-display font-bold" style={{ color: blog.color }}>
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
        {/* Tag */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ background: `${blog.color}18`, color: blog.color, border: `1px solid ${blog.color}20` }}>
            {blog.tag}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 text-white/25 text-xs mb-3">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{blog.date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />5 min read</span>
        </div>
        <h3 className="text-base font-display font-bold text-white/80 mb-3 leading-snug group-hover:text-white transition-colors duration-300 line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-[13px] text-white/30 leading-[1.7] mb-4 line-clamp-2">
          {blog.excerpt}
        </p>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-400 group-hover:gap-2.5 transition-all duration-300">
          Read Article <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════
   BLOG PAGE
   ═══════════════════════════════════ */
export default function BlogPage() {
  const pageRef = useRef(null)

  useEffect(() => {
    const el = pageRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.from('[data-blog-header]', {
        opacity: 0, y: 20, filter: 'blur(3px)',
        duration: 1.4, stagger: 0.12, delay: 0.3, ease: 'power2.out',
      })

      gsap.utils.toArray('[data-blog-item]').forEach((item, i) => {
        gsap.from(item, {
          opacity: 0, y: 30, scale: 0.97,
          duration: 1.3, ease: 'power2.out', delay: i * 0.12,
          scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play reverse play reverse' },
        })
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={pageRef}>
      {/* Starfield */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false }}>
          <Suspense fallback={null}><BlogStars /></Suspense>
        </Canvas>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <section className="relative pt-28 sm:pt-32 pb-14">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/20 via-navy-950/60 to-navy-950 pointer-events-none" />
          <Container className="relative z-10">
            <div className="max-w-xl">
              <span data-blog-header className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-brand-400 text-xs font-semibold uppercase tracking-[0.15em] mb-5">
                Our Blog
              </span>
              <h1 data-blog-header className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold leading-[1.08] mb-5">
                Latest Blog & <span className="text-gradient">Articles</span>
              </h1>
              <p data-blog-header className="text-base text-white/40 leading-relaxed max-w-md">
                Stay informed with the latest insights, tips, and updates to help your business grow and stay ahead.
              </p>
            </div>
          </Container>
        </section>

        {/* Blog Grid */}
        <section className="relative py-10 sm:py-16 pb-24">
          <Container>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {blogs.map((blog, i) => (
                <BlogCard key={blog.title} blog={blog} index={i} />
              ))}
            </div>
          </Container>
        </section>
      </div>
    </div>
  )
}
