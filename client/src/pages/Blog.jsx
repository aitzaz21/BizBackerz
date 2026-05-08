import React, { useEffect, useRef, useState, Suspense, memo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Link, useSearchParams } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'
import Container from '../components/ui/Container'
import { Calendar, ArrowRight, Clock, Search, Tag, X, Loader2, BookOpen, TrendingUp, Star } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/* ─── SEO helper ─────────────────────────────────────────── */
function setBlogSEO() {
  document.title = 'Blog & Insights | BizBackerz — Virtual Assistant Tips & Business Growth'
  let desc = document.querySelector('meta[name="description"]')
  if (!desc) { desc = document.createElement('meta'); desc.name = 'description'; document.head.appendChild(desc) }
  desc.content = 'Explore BizBackerz blog for expert insights on virtual assistant services, business productivity, delegation strategies, and operational efficiency. Updated regularly.'

  const metas = [
    ['og:title',       'Blog & Insights | BizBackerz'],
    ['og:description', 'Expert insights on virtual assistant services, business productivity, and operational efficiency.'],
    ['og:type',        'website'],
    ['og:url',         window.location.href],
    ['og:site_name',   'BizBackerz'],
    ['twitter:card',   'summary_large_image'],
    ['twitter:title',  'Blog & Insights | BizBackerz'],
    ['twitter:description', 'Expert insights on VA services and business growth.'],
  ]
  metas.forEach(([name, content]) => {
    const prop = name.startsWith('og:') ? 'property' : 'name'
    let el = document.querySelector(`meta[${prop}="${name}"]`)
    if (!el) { el = document.createElement('meta'); el.setAttribute(prop, name); document.head.appendChild(el) }
    el.content = content
  })

  // JSON-LD breadcrumb
  let ld = document.querySelector('#blog-ld')
  if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'blog-ld'; document.head.appendChild(ld) }
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'BizBackerz Blog',
    'description': 'Expert insights on virtual assistant services, business productivity, and operational efficiency.',
    'url': `${window.location.origin}/blog`,
    'publisher': {
      '@type': 'Organization',
      'name': 'BizBackerz',
      'url': window.location.origin,
    },
  })
}

/* ─── Starfield ─────────────────────────────────────────── */
const BlogStars = memo(function BlogStars() {
  const ref = useRef()
  const positions = React.useMemo(() => {
    const arr = new Float32Array(400 * 3)
    for (let i = 0; i < 400; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 30
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 15
    }
    return arr
  }, [])
  useFrame(s => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.003 })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={400} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color="#50A6B4" transparent opacity={0.4} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
})

/* ─── Blog Card ─────────────────────────────────────────── */
function BlogCard({ blog, index }) {
  const date = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    : blog.date || ''

  return (
    <Link to={`/blog/${blog.slug}`} data-blog-item data-cursor="hover"
      className="group glass rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-500 block relative">

      {/* Featured badge */}
      {blog.featured && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em]"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Star className="w-2.5 h-2.5 fill-current" /> Featured
        </div>
      )}

      {/* Cover image or gradient placeholder */}
      <div className="aspect-[16/10] relative overflow-hidden">
        {blog.coverImage ? (
          <img src={blog.coverImage} alt={blog.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${blog.color}20, ${blog.color}08, rgba(3,9,18,0.85))` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030912]/60 via-transparent to-transparent" />
        {!blog.coverImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-white/6 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
              style={{ boxShadow: `0 0 30px ${blog.color}18` }}>
              <span className="text-lg font-display font-bold" style={{ color: blog.color }}>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
        {/* Tag */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ background: `${blog.color}20`, color: blog.color, border: `1px solid ${blog.color}25` }}>
            {blog.tag}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 text-white/40 text-xs mb-3">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime || 5} min read</span>
          {blog.views > 0 && <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{blog.views}</span>}
        </div>
        <h3 className="text-base font-display font-bold text-white/80 mb-3 leading-snug group-hover:text-white transition-colors duration-300 line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-[13px] text-white/50 leading-[1.7] mb-4 line-clamp-2">{blog.excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-400 group-hover:gap-2.5 transition-all duration-300">
            Read Article <ArrowRight className="w-3.5 h-3.5" />
          </span>
          {blog.author && blog.author !== 'BizBackerz Team' && (
            <span className="text-[11px] text-white/40">{blog.author}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function BlogPage() {
  const pageRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const [blogs, setBlogs]         = useState([])
  const [tags, setTags]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState(searchParams.get('search') || '')
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || 'all')
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const searchRef = useRef(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      const params = {}
      if (search)            params.search = search
      if (activeTag !== 'all') params.tag  = activeTag
      setSearchParams(params, { replace: true })
    }, 350)
    return () => clearTimeout(t)
  }, [search, activeTag])

  // Fetch from API or fall back to static
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page, limit: 9 })
        if (search)              params.set('search', search)
        if (activeTag !== 'all') params.set('tag',    activeTag)
        const res  = await fetch(`${API}/api/blogs?${params}`)
        const data = await res.json()
        if (cancelled) return
        if (data.success) {
          setBlogs(data.blogs || [])
          setTags(['all', ...(data.tags || [])])
          setTotalPages(data.pages || 1)
          return
        }
      } catch { /* API unavailable */ }
    }
    load().finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [search, activeTag, page])

  // SEO
  useEffect(() => { setBlogSEO() }, [])

  // GSAP
  useEffect(() => {
    const el = pageRef.current
    if (!el || window.matchMedia('(pointer: coarse)').matches) return
    const ctx = gsap.context(() => {
      gsap.from('[data-blog-header]', { opacity: 0, y: 20, filter: 'blur(3px)', duration: 1.4, stagger: 0.12, delay: 0.3, ease: 'power2.out' })
    }, el)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (loading || window.matchMedia('(pointer: coarse)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-blog-item]').forEach((item, i) => {
        gsap.from(item, {
          opacity: 0, y: 30, scale: 0.97, duration: 1.2, ease: 'power2.out', delay: i * 0.07,
          scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play reverse play reverse' },
        })
      })
    })
    return () => ctx.revert()
  }, [blogs, loading])

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
        <section className="relative pt-8 sm:pt-10 pb-10">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/20 via-navy-950/60 to-navy-950 pointer-events-none" />
          <Container className="relative z-10">
            <div className="max-w-2xl">
              <span data-blog-header className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-light text-brand-400 text-xs font-semibold uppercase tracking-[0.15em] mb-5">
                <BookOpen className="w-3 h-3" /> Our Blog
              </span>
              <h1 data-blog-header className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold leading-[1.08] mb-5">
                Insights & <span className="text-gradient">Articles</span>
              </h1>
              <p data-blog-header className="text-base text-white/55 leading-relaxed max-w-md">
                Expert insights on delegation, productivity, virtual support, and building a business that runs without you.
              </p>
            </div>
          </Container>
        </section>

        {/* Search + filter bar */}
        <section className="blog-sticky-bar sticky top-0 z-40 border-b border-white/[0.06] py-4" style={{ background: 'rgba(3,9,18,0.88)' }}>
          <Container>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  ref={searchRef}
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search articles…"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-9 py-2.5 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-brand-500/40 focus:bg-white/[0.06] transition-all duration-200"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Tag filter chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {tags.map(t => (
                  <button key={t} onClick={() => { setActiveTag(t); setPage(1) }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 ${
                      activeTag === t
                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                        : 'bg-white/[0.04] text-white/40 border border-white/[0.07] hover:text-white/70 hover:bg-white/[0.07]'
                    }`}>
                    {t === 'all' ? 'All' : t}
                  </button>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Blog Grid */}
        <section className="relative py-10 sm:py-16 pb-24">
          <Container>
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-24 text-white/30">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-25" />
                <p className="text-[15px] font-semibold mb-2">No articles found</p>
                <p className="text-[13px]">Try a different search term or tag.</p>
                <button onClick={() => { setSearch(''); setActiveTag('all') }}
                  className="mt-5 px-5 py-2 rounded-xl text-[13px] font-semibold text-brand-400 border border-brand-500/25 hover:bg-brand-500/10 transition-all duration-200">
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {blogs.map((blog, i) => (
                    <BlogCard key={blog._id || blog.slug} blog={blog} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 disabled:opacity-30 transition-all duration-200">
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                          p === page ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-white/40 border border-white/[0.07] hover:text-white'
                        }`}>{p}</button>
                    ))}
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 disabled:opacity-30 transition-all duration-200">
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </Container>
        </section>
      </div>
    </div>
  )
}
