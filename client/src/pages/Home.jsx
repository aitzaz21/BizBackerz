import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import PageSEO from '../components/ui/PageSEO'
import Hero        from '../components/sections/Hero'
import About       from '../components/sections/About'
import Services    from '../components/sections/Services'
import CTA         from '../components/sections/CTA'
import ProcessSection from '../components/sections/ProcessSection'
import FAQSection     from '../components/sections/FAQSection'
import MarqueeStrip   from '../components/ui/MarqueeStrip'
import KineticStrip   from '../components/ui/KineticStrip'
import ScrollProgress from '../components/ui/ScrollProgress'
import Container      from '../components/ui/Container'

const VideoSection = lazy(() => import('../components/sections/VideoSection'))

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/* ─── Mini blog card for home page ──────────────────────── */
function HomeBlogCard({ blog }) {
  const date = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : blog.date || ''
  const color = blog.color || '#2a8bff'

  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group glass rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-500 block relative"
    >
      {/* Cover */}
      <div className="aspect-[16/9] relative overflow-hidden">
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${color}22, ${color}08, rgba(3,9,18,0.88))` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030912]/65 via-transparent to-transparent" />
        {blog.tag && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-0.5 rounded-full text-[9px] font-body font-semibold uppercase tracking-[0.14em]"
              style={{ background: `${color}20`, color, border: `1px solid ${color}28` }}
            >
              {blog.tag}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-3 text-white/25 text-[11px] mb-2.5">
          {date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>}
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime || 5} min read</span>
        </div>
        <h3 className="text-[14px] font-display font-bold text-white/82 mb-2 leading-snug group-hover:text-white transition-colors duration-300 line-clamp-2">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="text-[12px] text-white/30 leading-[1.7] mb-3.5 line-clamp-2">{blog.excerpt}</p>
        )}
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-400 group-hover:gap-2.5 transition-all duration-300">
          Read Article <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  )
}

/* ─── Blog section — only renders when API returns posts ── */
function HomeBlogsSection() {
  const [blogs, setBlogs]   = useState([])
  const [ready, setReady]   = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(`${API}/api/blogs?limit=3&page=1`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.success && data.blogs?.length) {
          setBlogs(data.blogs.slice(0, 3))
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [])

  if (!ready || blogs.length === 0) return null

  return (
    <section className="relative py-16 sm:py-20">
      <Container>
        {/* Header row */}
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <span className="section-label mb-3 inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse flex-shrink-0" />
              From The Blog
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white leading-[1.06] mt-2">
              Insights &amp; <span className="text-gradient">Articles</span>
            </h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[13px] font-body font-semibold text-brand-400 hover:text-brand-300 transition-colors duration-300 flex-shrink-0 whitespace-nowrap"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {blogs.map(blog => (
            <HomeBlogCard key={blog._id || blog.slug} blog={blog} />
          ))}
        </div>
      </Container>
    </section>
  )
}

const HOME_SCHEMA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://bizbackerz.com/#organization',
    name: 'BizBackerz',
    alternateName: 'BizBackerz Virtual Assistance',
    url: 'https://bizbackerz.com',
    logo: {
      '@type': 'ImageObject',
      '@id': 'https://bizbackerz.com/#logo',
      url: 'https://bizbackerz.com/logo/navbar.png',
      width: 200,
      height: 60,
      caption: 'BizBackerz – Virtual Assistance Agency',
    },
    image: 'https://bizbackerz.com/og-image.jpg',
    description: 'BizBackerz is a virtual assistance agency headquartered in London, UK, helping 50+ businesses in the US and UK delegate operational tasks to expert virtual assistants. Services include digital advertising, administrative support, social media management, lead generation, customer support, content creation, project management, accounting, marketing support, and e-commerce management.',
    slogan: 'Delegate to Dominate',
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      name: 'London, United Kingdom',
    },
    email: 'Hello@bizbackerz.com',
    telephone: '+1-904-668-6362',
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 10 },
    areaServed: [
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'United Kingdom' },
    ],
    address: [
      { '@type': 'PostalAddress', addressLocality: 'London', addressCountry: 'GB' },
      { '@type': 'PostalAddress', addressRegion: 'Florida', addressCountry: 'US' },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
      opens: '11:00',
      closes: '20:00',
    },
    knowsAbout: [
      'Virtual Assistance',
      'Digital Advertising',
      'Google Local Service Ads',
      'AI Max Search Campaigns',
      'Performance Max Advertising',
      'Administrative Support',
      'Social Media Management',
      'Lead Generation',
      'Customer Support',
      'Content Creation',
      'Project Management',
      'Bookkeeping and Accounting',
      'Marketing Support',
      'E-Commerce Management',
      'Business Process Delegation',
      'Generative Engine Optimization',
      'B2B Lead Generation',
    ],
    knowsLanguage: [{ '@type': 'Language', name: 'English' }],
    brand: {
      '@type': 'Brand',
      name: 'BizBackerz',
      slogan: 'Delegate to Dominate',
      logo: 'https://bizbackerz.com/logo/navbar.png',
    },
    sameAs: [
      'https://www.facebook.com/BizBackerz',
      'https://www.instagram.com/bizbackerzltd/',
      'https://www.linkedin.com/company/105424987/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-904-668-6362',
      contactType: 'customer service',
      availableLanguage: ['English'],
      areaServed: ['US', 'GB'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
        opens: '11:00',
        closes: '20:00',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '6',
      bestRating: '5',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Virtual Assistant Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Digital Advertising', url: 'https://bizbackerz.com/services/digital-advertising' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Administrative Support', url: 'https://bizbackerz.com/services/administrative-support' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Customer Support', url: 'https://bizbackerz.com/services/customer-support' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Social Media Management', url: 'https://bizbackerz.com/services/social-media-management' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Content Creation', url: 'https://bizbackerz.com/services/content-creation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Lead Generation', url: 'https://bizbackerz.com/services/lead-generation' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Project Management', url: 'https://bizbackerz.com/services/project-management' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Accounting Services', url: 'https://bizbackerz.com/services/accounting-services' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Marketing Support', url: 'https://bizbackerz.com/services/marketing-support' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'E-Commerce Services', url: 'https://bizbackerz.com/services/e-commerce-services' } },
      ],
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://bizbackerz.com/#website',
    name: 'BizBackerz',
    url: 'https://bizbackerz.com',
    publisher: { '@id': 'https://bizbackerz.com/#organization' },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://bizbackerz.com/blog?search={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://bizbackerz.com/#webpage',
    url: 'https://bizbackerz.com/',
    name: 'BizBackerz – Virtual Assistant Services | Delegate to Dominate',
    isPartOf: { '@id': 'https://bizbackerz.com/#website' },
    about: { '@id': 'https://bizbackerz.com/#organization' },
    description: 'BizBackerz provides dedicated virtual assistant services for US and UK businesses — admin support, digital advertising, social media management, lead generation, and customer support.',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-hero-desc]', '[data-hero-sub]'],
    },
  },
]

export default function Home() {
  return (
    <>
      <PageSEO
        title="BizBackerz – Virtual Assistant Services | Delegate to Dominate"
        description="BizBackerz provides dedicated virtual assistant services — admin support, digital advertising, social media management, lead generation, and customer support. Start delegating today."
        canonical="https://bizbackerz.com/"
        schema={HOME_SCHEMA}
      />
      <ScrollProgress />

      <Hero />
      <MarqueeStrip />

      {/* Kinetic 1 — slides RIGHT while you scroll down */}
      <KineticStrip
        texts={['DELEGATE', '·', 'TO DOMINATE', '·', 'UNCOMPROMISING QUALITY', '·', 'PREMIUM SUPPORT', '·']}
        direction={-1}
        opacity={0.042}
        fontSize="clamp(3.8rem,8.5vw,9.5rem)"
        speed={1.5}
      />

      <About />

      {/* Kinetic 2 — slides LEFT (opposite) */}
      <KineticStrip
        texts={['OPERATIONAL DISCIPLINE', '·', 'YOUR GROWTH PARTNER', '·', 'SINCE 2024', '·', 'BIZBACKERZ', '·']}
        direction={1}
        opacity={0.038}
        fontSize="clamp(3.8rem,8.5vw,9.5rem)"
        speed={1.2}
      />

      <ProcessSection />
      <Services />

      {/* Kinetic 3 — breather strip between Services and Video */}
      <KineticStrip
        texts={['TRUSTED BY 50+ CLIENTS', '·', 'DELEGATE TO DOMINATE', '·', 'ELITE EXECUTION', '·', 'SINCE 2024', '·']}
        direction={-1}
        opacity={0.038}
        fontSize="clamp(3.8rem,8.5vw,9.5rem)"
        speed={1.1}
      />

      <Suspense fallback={null}>
        <VideoSection />
      </Suspense>
      <HomeBlogsSection />
      <FAQSection />
      <CTA />
    </>
  )
}
