import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import Container from '../ui/Container'
import Button from '../ui/Button'
import { Menu, X, ChevronDown, Phone, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

const navLinks = [
  { label: 'Home',    href: '/' },
  { label: 'About',   href: '/about' },
  {
    label: 'Services', href: '/services',
    children: [
      'Administrative Support', 'Accounting Services', 'Social Media Management',
      'Marketing Support',      'Content Creation',    'Customer Support',
      'Lead Generation',        'Project Management',  'E-Commerce Services',
    ],
  },
  { label: 'Blog',    href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

const socials = [
  { Icon: Facebook,  href: 'https://www.facebook.com/BizBackerz' },
  { Icon: Twitter,   href: 'https://x.com/Bizbackerz' },
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

  return (
    <>
      {/* ── Top bar ── */}
      <div className="hidden lg:block bg-navy-950/90 backdrop-blur-sm border-b border-white/[0.04] relative z-50">
        <Container className="flex items-center justify-between py-2.5">
          <div className="text-[12px] text-white/38 font-body flex items-center gap-2">
            Need Free Consultation?{' '}
            <a
              href="https://calendly.com/oliver-reid-bizbackerz/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
            >
              Book Schedule Now
            </a>
          </div>
          <div className="flex items-center gap-3.5">
            {socials.map(({ Icon, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/25 hover:text-brand-400 transition-colors duration-300"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </Container>
      </div>

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

        <Container className="flex items-center justify-between h-[72px]">

          {/* Wordmark — no logo image for now */}
          <Link to="/" className="relative z-10 group">
            <div style={{ lineHeight: 1 }}>
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 800,
                  fontSize: '16px',
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
                  margin: '3px 0',
                  background: 'linear-gradient(90deg, rgba(42,139,255,0.65), rgba(56,217,169,0.45), transparent)',
                }}
              />
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  fontSize: '7px',
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
              >
                Delegate to Dominate
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isRoute   = link.href.startsWith('/')
              const LinkTag   = isRoute ? Link : 'a'
              const linkProps = isRoute ? { to: link.href } : { href: link.href }

              const isActive = location.pathname === link.href

              return (
                <div key={link.label} className="relative group">
                  <LinkTag
                    {...linkProps}
                    className={`relative flex items-center gap-1 px-4 py-2.5 text-[13px] font-body font-semibold rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'text-white bg-white/[0.06]'
                        : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-300" />
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
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <div className="glass rounded-2xl p-2 min-w-[270px] shadow-2xl shadow-black/40">
                        {link.children.map((child) => (
                          <a
                            key={child}
                            href="/services"
                            className="block px-4 py-2.5 text-[13px] font-body text-white/55 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all duration-200"
                          >
                            {child}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-5">
            <a
              href="tel:9046686362"
              className="flex items-center gap-2 text-[13px] font-body text-white/45 hover:text-white transition-colors duration-300"
            >
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              (904) 668-6362
            </a>
            <Button size="sm" href="https://calendly.com/oliver-reid-bizbackerz/30min">
              Hire Now!
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white relative z-10 transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </Container>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass border-t border-white/[0.05] overflow-hidden"
            >
              <div className="px-5 py-6 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-white/70 hover:text-white font-body font-semibold text-[15px] rounded-xl hover:bg-white/[0.05] transition-all duration-200"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 mt-4 border-t border-white/[0.06]">
                  <Button
                    size="md"
                    href="https://calendly.com/oliver-reid-bizbackerz/30min"
                    className="w-full"
                  >
                    Hire Now!
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
