import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { gsap } from 'gsap'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, User, Eye, Share2, Twitter, Facebook, Linkedin, Loader2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/* ─── SEO injector ───────────────────────────────────────── */
function setBlogPostSEO(blog) {
  const seoTitle  = blog.seoTitle       || blog.title
  const seoDesc   = blog.seoDescription || blog.excerpt
  const ogImage   = blog.ogImage        || blog.coverImage || ''
  const canonical = `${window.location.origin}/blog/${blog.slug}`
  const dateStr   = blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString()

  document.title = `${seoTitle} | BizBackerz Blog`

  const setMeta = (prop, val, attr = 'name') => {
    let el = document.querySelector(`meta[${attr}="${prop}"]`)
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, prop); document.head.appendChild(el) }
    el.content = val
  }

  setMeta('description', seoDesc)
  if (blog.seoKeywords) setMeta('keywords', blog.seoKeywords)
  setMeta('author', blog.author || 'BizBackerz')
  setMeta('robots', 'index, follow')

  // Open Graph
  setMeta('og:type',            'article',     'property')
  setMeta('og:title',           seoTitle,      'property')
  setMeta('og:description',     seoDesc,       'property')
  setMeta('og:url',             canonical,     'property')
  setMeta('og:site_name',       'BizBackerz',  'property')
  if (ogImage) setMeta('og:image', ogImage,    'property')
  setMeta('article:author',     blog.author || 'BizBackerz', 'property')
  setMeta('article:published_time', dateStr,   'property')
  setMeta('article:tag',        blog.tag || 'Business', 'property')

  // Twitter Card
  setMeta('twitter:card',        ogImage ? 'summary_large_image' : 'summary')
  setMeta('twitter:title',       seoTitle)
  setMeta('twitter:description', seoDesc)
  if (ogImage) setMeta('twitter:image', ogImage)

  // Canonical link
  let canon = document.querySelector('link[rel="canonical"]')
  if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon) }
  canon.href = canonical

  // JSON-LD Article schema
  let ld = document.querySelector('#blogpost-ld')
  if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'blogpost-ld'; document.head.appendChild(ld) }
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': seoTitle,
    'description': seoDesc,
    'datePublished': dateStr,
    'dateModified': blog.updatedAt ? new Date(blog.updatedAt).toISOString() : dateStr,
    'author': {
      '@type': 'Organization',
      'name': blog.author || 'BizBackerz',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'BizBackerz',
      'url': window.location.origin,
      'logo': {
        '@type': 'ImageObject',
        'url': `${window.location.origin}/logo.png`,
      },
    },
    ...(ogImage ? { 'image': ogImage } : {}),
    'mainEntityOfPage': { '@type': 'WebPage', '@id': canonical },
    'url': canonical,
    'keywords': blog.seoKeywords || blog.tag || '',
  })

  // BreadcrumbList
  let breadLd = document.querySelector('#blogpost-breadcrumb-ld')
  if (!breadLd) { breadLd = document.createElement('script'); breadLd.type = 'application/ld+json'; breadLd.id = 'blogpost-breadcrumb-ld'; document.head.appendChild(breadLd) }
  breadLd.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: window.location.origin },
      { '@type': 'ListItem', position: 2, name: 'Blog',  item: `${window.location.origin}/blog` },
      { '@type': 'ListItem', position: 3, name: seoTitle, item: canonical },
    ],
  })
}

function cleanupSEO() {
  ['#blogpost-ld', '#blogpost-breadcrumb-ld'].forEach(id => {
    const el = document.querySelector(id)
    if (el) el.remove()
  })
  const canon = document.querySelector('link[rel="canonical"]')
  if (canon) canon.remove()
}

/* ─── Share buttons ──────────────────────────────────────── */
function ShareBar({ title, url }) {
  const enc = encodeURIComponent
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-white/30 font-semibold uppercase tracking-[0.12em]">Share</span>
      {[
        { Icon: Twitter,  href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,        label: 'Twitter' },
        { Icon: Linkedin, href: `https://www.linkedin.com/shareArticle?mini=true&url=${enc(url)}&title=${enc(title)}`, label: 'LinkedIn' },
        { Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, label: 'Facebook' },
      ].map(({ Icon, href, label }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`}
          className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.07] text-white/35 hover:text-brand-400 hover:border-brand-500/25 hover:bg-brand-500/10 flex items-center justify-center transition-all duration-200">
          <Icon className="w-3.5 h-3.5" />
        </a>
      ))}
    </div>
  )
}

/* ─── Related card ───────────────────────────────────────── */
function RelatedCard({ post }) {
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : post.date || ''
  return (
    <Link to={`/blog/${post.slug}`}
      className="group block rounded-2xl p-5 border border-white/[0.07] hover:border-white/[0.14] transition-all duration-400 overflow-hidden relative"
      style={{ background: 'rgba(6,15,29,0.5)', backdropFilter: 'blur(16px)' }}>
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background: `linear-gradient(135deg, ${post.color || '#2a8bff'}14, transparent 60%)` }} />
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full h-28 object-cover rounded-xl mb-3" />
      )}
      <div className="relative">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] mb-3"
          style={{ background: `${post.color || '#2a8bff'}18`, color: post.color || '#2a8bff', border: `1px solid ${post.color || '#2a8bff'}25` }}>
          <Tag className="w-2.5 h-2.5" />{post.tag}
        </span>
        <h3 className="text-[14px] font-display font-semibold text-white/80 group-hover:text-white transition-colors duration-300 leading-snug line-clamp-2 mb-2">
          {post.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-white/25">{date}</span>
          <span className="inline-flex items-center gap-1 text-[12px] text-brand-400 group-hover:gap-2 transition-all duration-300">
            Read <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ─── Main ───────────────────────────────────────────────── */
export default function BlogPost() {
  const { slug }                = useParams()
  const [blog, setBlog]         = useState(null)
  const [related, setRelated]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setNotFound(false)
      try {
        const res  = await fetch(`${API}/api/blogs/${slug}`)
        const data = await res.json()
        if (cancelled) return
        if (data.success) {
          setBlog(data.blog)
          setRelated(data.related || [])
          return
        }
      } catch { /* fallthrough */ }

      if (cancelled) return
      setNotFound(true)
    }
    load().finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  // SEO
  useEffect(() => {
    if (blog) setBlogPostSEO(blog)
    return cleanupSEO
  }, [blog])

  // GSAP
  useEffect(() => {
    if (!blog || window.matchMedia('(pointer: coarse)').matches) return
    gsap.from('[data-bp-header]', { opacity: 0, y: 20, duration: 1.2, stagger: 0.1, delay: 0.2, ease: 'power2.out' })
    gsap.from('[data-bp-body]',   { opacity: 0, y: 16, duration: 1.0, delay: 0.5, ease: 'power2.out' })
  }, [blog])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/50 text-lg mb-4 font-body">Article not found.</p>
        <Link to="/blog" className="text-brand-400 hover:text-brand-300 font-body text-sm">← Back to Blog</Link>
      </div>
    </div>
  )

  const dateFormatted = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : blog.date || ''
  const canonicalURL = `${window.location.origin}/blog/${blog.slug}`
  const isHtmlContent = blog.content?.includes('<')

  return (
    <div className="min-h-screen">

      {/* ── Hero header ── */}
      <section className="relative pt-8 sm:pt-10 pb-14 overflow-hidden">
        {blog.coverImage && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={blog.coverImage} alt="" className="w-full h-full object-cover opacity-10" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(3,9,18,0.5), #030912)' }} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${blog.color || '#2a8bff'}18, transparent 65%)` }} />
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${blog.color || '#2a8bff'}45, transparent)` }} />

        <Container>
          <div className="max-w-3xl mx-auto">
            {/* Breadcrumb */}
            <nav data-bp-header className="flex items-center gap-2 text-[12px] text-white/30 mb-7" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-white/60 transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-white/50 line-clamp-1">{blog.title}</span>
            </nav>

            {/* Meta row */}
            <div data-bp-header className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em]"
                style={{ background: `${blog.color || '#2a8bff'}18`, color: blog.color || '#2a8bff', border: `1px solid ${blog.color || '#2a8bff'}28` }}>
                {blog.tag}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-white/30">
                <Calendar className="w-3 h-3" />{dateFormatted}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-white/30">
                <Clock className="w-3 h-3" />{blog.readTime || 5} min read
              </span>
              {blog.views > 0 && (
                <span className="flex items-center gap-1.5 text-[12px] text-white/30">
                  <Eye className="w-3 h-3" />{blog.views} views
                </span>
              )}
            </div>

            {/* Title */}
            <h1 data-bp-header className="text-3xl sm:text-4xl lg:text-[2.75rem] font-display font-bold text-white leading-[1.1] mb-6 tracking-[-0.03em]">
              {blog.title}
            </h1>

            {/* Excerpt */}
            <p data-bp-header className="text-[16px] sm:text-[17px] text-white/60 leading-[1.85] font-body border-l-2 pl-5 mb-6"
              style={{ borderColor: `${blog.color || '#2a8bff'}60` }}>
              {blog.excerpt}
            </p>

            {/* Author + share */}
            <div data-bp-header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
                  <User className="w-4 h-4 text-brand-400" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{blog.author || 'BizBackerz Team'}</p>
                  {blog.authorBio && <p className="text-[11px] text-white/35">{blog.authorBio}</p>}
                </div>
              </div>
              <ShareBar title={blog.title} url={canonicalURL} />
            </div>
          </div>
        </Container>
      </section>

      {/* ── Article body ── */}
      <section className="py-10 sm:py-14">
        <Container>
          <div className="max-w-3xl mx-auto" data-bp-body>
            {isHtmlContent ? (
              <div className="prose-blog" dangerouslySetInnerHTML={{ __html: blog.content }} />
            ) : (
              <div className="space-y-6">
                {(Array.isArray(blog.content) ? blog.content : [blog.content]).map((para, i) => (
                  <p key={i} className="text-[15px] sm:text-[16px] text-white/65 leading-[1.95] font-body">{para}</p>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ── Q&A ── */}
      {blog.qna?.length > 0 && (
        <section className="py-10 sm:py-12 border-t border-white/[0.06]">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-display font-bold text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {blog.qna.map((item, i) => (
                  item.question && item.answer ? (
                    <details key={i} className="group rounded-xl border border-white/[0.07] overflow-hidden" style={{ background: 'rgba(6,15,29,0.5)' }}>
                      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-[15px] font-semibold text-white select-none">
                        {item.question}
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-500/15 text-brand-400 flex items-center justify-center text-[12px] group-open:rotate-45 transition-transform duration-200">+</span>
                      </summary>
                      <div className="px-5 pb-5 text-[14px] text-white/60 leading-[1.85] font-body border-t border-white/[0.05] pt-4">
                        {item.answer}
                      </div>
                    </details>
                  ) : null
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-10 border-t border-white/[0.06]">
        <Container>
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 rounded-2xl border border-white/[0.07] overflow-hidden relative"
            style={{ background: 'rgba(6,15,29,0.6)', backdropFilter: 'blur(16px)' }}>
            <div className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at bottom right, rgba(42,139,255,0.1), transparent 60%)' }} />
            <div className="relative">
              <h3 className="text-xl font-display font-bold text-white mb-1">Ready to delegate smarter?</h3>
              <p className="text-[14px] text-white/50 font-body">Book a free consultation with BizBackerz and take the first step.</p>
            </div>
            <div className="relative flex-shrink-0">
              <Button size="md" href="/booking">Get Started <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Share bottom ── */}
      <section className="py-6 border-t border-white/[0.04]">
        <Container>
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link to="/blog" className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/45 hover:text-white transition-colors group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Blog
            </Link>
            <ShareBar title={blog.title} url={canonicalURL} />
          </div>
        </Container>
      </section>

      {/* ── Related articles ── */}
      {related.length > 0 && (
        <section className="py-10 sm:py-14 border-t border-white/[0.06]">
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-display font-bold text-white mb-6">Related Articles</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.slice(0, 3).map(post => (
                  <RelatedCard key={post._id || post.slug} post={post} />
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

    </div>
  )
}
