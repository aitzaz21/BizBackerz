import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import Container from '../ui/Container'
import Button from '../ui/Button'
import { Menu, X, ChevronDown, ChevronRight, Phone, Facebook, Linkedin, Instagram } from 'lucide-react'

const navLinks = [
  { label: 'Home',    href: '/' },
  { label: 'About',   href: '/about' },
  {
    label: 'Services', href: '/services',
    children: [
      { label: 'Administrative Support',  href: '/services/administrative-support' },
      { label: 'Accounting Services',     href: '/services/accounting-services' },
      { label: 'Social Media Management', href: '/services/social-media-management' },
      { label: 'Marketing Support',       href: '/services/marketing-support' },
      { label: 'Content Creation',        href: '/services/content-creation' },
      { label: 'Customer Support',        href: '/services/customer-support' },
      { label: 'Lead Generation',         href: '/services/lead-generation' },
      { label: 'Project Management',      href: '/services/project-management' },
      { label: 'E-Commerce Services',     href: '/services/e-commerce-services' },
    ],
  },
  { label: 'Blog',    href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

const socials = [
  { Icon: Facebook,  href: 'https://www.facebook.com/BizBackerz' },
  { Icon: Linkedin,  href: 'https://www.linkedin.com/company/105424987/' },
  { Icon: Instagram, href: 'https://www.instagram.com/bizbackerzltd/' },
]

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const barRef   = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 30)
      if (barRef.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight
        barRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  /* Close mobile menu on route change */
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <>
      {/* ── Main nav ── */}
      <motion.header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-lg shadow-black/25 border-b border-white/[0.04]'
            : 'bg-transparent'
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 22 }}
      >
        {/* Scroll progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/[0.04] overflow-hidden">
          <div
            ref={barRef}
            className="h-full w-full origin-left"
            style={{
              background: 'linear-gradient(90deg, #2a8bff, #38d9a9)',
              transform: 'scaleX(0)',
            }}
          />
        </div>

        <Container className="flex items-center justify-between h-[52px]">

          {/* Wordmark */}
          <Link to="/" className="relative z-10 group flex-shrink-0">
            <div style={{ lineHeight: 1 }}>
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 800,
                  fontSize: '14px',
                  color: '#f1f5f9',
                  letterSpacing: '0.07em',
                  transition: 'color 0.3s',
                }}
                className="group-hover:text-brand-300"
              >
                BIZBACKERZ
              </div>
              <div
                style={{
                  height: 1,
                  margin: '2px 0',
                  background: 'linear-gradient(90deg, rgba(42,139,255,0.65), rgba(56,217,169,0.45), transparent)',
                }}
              />
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  fontSize: '6.5px',
                  color: 'rgba(255,255,255,0.32)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
              >
                Delegate to Dominate
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0">
            {navLinks.map((link) => {
              const isRoute   = link.href.startsWith('/')
              const LinkTag   = isRoute ? Link : 'a'
              const linkProps = isRoute ? { to: link.href } : { href: link.href }
              const isActive  = location.pathname === link.href

              return (
                <div key={link.label} className="relative group">
                  <LinkTag
                    {...linkProps}
                    className={`relative flex items-center gap-1 px-3 py-2 text-[12px] font-body font-semibold rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'text-white bg-white/[0.06]'
                        : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-300" />
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </LinkTag>

                  {link.children && (
                    <div className="absolute top-full left-0 pt-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <div className="glass rounded-2xl p-1.5 min-w-[260px] shadow-2xl shadow-black/40">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            className="block px-3.5 py-2 text-[12px] font-body text-white/55 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all duration-200"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+19046686362"
              className="flex items-center gap-1.5 text-[12px] font-body text-white/40 hover:text-white transition-colors duration-300"
            >
              <Phone className="w-3 h-3 text-brand-400" />
              (904) 668-6362
            </a>
            <Button size="sm" href="/booking">
              Hire Now!
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white relative z-10 transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </Container>
      </motion.header>

      {/* ── Mobile full-screen overlay (outside header so it covers viewport) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(3,9,18,0.75)', backdropFilter: 'blur(8px)' }}
            />

            {/* Slide-in panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 36 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 z-50 flex flex-col"
              style={{
                width: 'min(82vw, 320px)',
                background: 'rgba(4,11,24,0.98)',
                backdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <Link to="/" onClick={() => setMobileOpen(false)}>
                  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: 13, color: '#f1f5f9', letterSpacing: '0.07em' }}>
                    BIZBACKERZ
                  </div>
                  <div style={{ height: 1, margin: '2px 0', background: 'linear-gradient(90deg, rgba(42,139,255,0.6), rgba(56,217,169,0.4), transparent)' }} />
                  <div style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Delegate to Dominate
                  </div>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/45 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                {navLinks.map((link, i) => {
                  const isActive = location.pathname === link.href
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.055, duration: 0.3 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 mb-0.5"
                        style={{
                          background: isActive ? 'rgba(42,139,255,0.08)' : 'transparent',
                          borderLeft: isActive ? '2px solid rgba(42,139,255,0.5)' : '2px solid transparent',
                        }}
                      >
                        <span style={{
                          fontFamily: '"Cabinet Grotesk",sans-serif',
                          fontWeight: 700,
                          fontSize: 15,
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                        }}>
                          {link.label}
                        </span>
                        <ChevronRight
                          className="w-3.5 h-3.5"
                          style={{ color: isActive ? 'rgba(42,139,255,0.7)' : 'rgba(255,255,255,0.2)' }}
                        />
                      </Link>
                    </motion.div>
                  )
                })}

                {/* Phone */}
                <div className="mt-4 pt-4 border-t border-white/[0.05]">
                  <a
                    href="tel:+19046686362"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/45 hover:text-white transition-colors duration-200"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                    <span style={{ fontFamily: '"Cabinet Grotesk",sans-serif', fontSize: 13.5, fontWeight: 600 }}>
                      (904) 668-6362
                    </span>
                  </a>
                </div>
              </nav>

              {/* Footer: socials + CTA */}
              <div className="px-4 py-5 border-t border-white/[0.06]">
                {/* Socials */}
                <div className="flex items-center gap-2.5 mb-4">
                  {socials.map(({ Icon, href }) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/38 hover:text-white hover:border-white/[0.18] transition-all duration-200"
                      style={{ background: 'rgba(6,15,29,0.7)' }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  size="md"
                  href="/booking"
                  className="w-full justify-center"
                >
                  Hire Now!
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
