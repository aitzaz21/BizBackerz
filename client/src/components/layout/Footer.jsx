import React from 'react'
import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import { Facebook, Instagram, Linkedin, Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react'

const socials = [
  { Icon: Facebook,  href: 'https://www.facebook.com/BizBackerz',         label: 'Facebook'  },
  { Icon: Instagram, href: 'https://www.instagram.com/bizbackerzltd/',     label: 'Instagram' },
  { Icon: Linkedin,  href: 'https://www.linkedin.com/company/105424987/',  label: 'LinkedIn'  },
]

const navCols = [
  {
    heading: 'Company',
    links: [
      { label: 'Home',     to: '/' },
      { label: 'About Us', to: '/about' },
      { label: 'Services', to: '/services' },
      { label: 'Blog',     to: '/blog' },
      { label: 'Contact',  to: '/contact' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Digital Advertising',      to: '/services/digital-advertising' },
      { label: 'Administrative Support',  to: '/services/administrative-support' },
      { label: 'Social Media Management', to: '/services/social-media-management' },
      { label: 'Lead Generation',         to: '/services/lead-generation' },
      { label: 'Customer Support',        to: '/services/customer-support' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy',     to: '/privacy' },
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'FAQs',               to: '/faq' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative isolate z-[120] mt-20 bg-navy-950 border-t border-white/[0.07] overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/60 via-navy-950 to-[#02070f] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-brand-500/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-brand-500/22 to-transparent" />

      <Container className="relative z-10">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr,1fr,1fr,1fr] gap-12 py-16 lg:py-20">

          {/* Brand column */}
          <div>
            {/* Wordmark — no logo image for now */}
            <Link to="/" className="inline-block mb-6 group">
              <div style={{ lineHeight: 1 }}>
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 800,
                    fontSize: '20px',
                    color: '#f1f5f9',
                    letterSpacing: '0.07em',
                  }}
                >
                  BIZBACKERZ
                </div>
                <div
                  style={{
                    height: 1,
                    margin: '4px 0',
                    background: 'linear-gradient(90deg, rgba(42,139,255,0.65), rgba(56,217,169,0.45), transparent)',
                  }}
                />
                <div
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    fontSize: '8px',
                    color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                  }}
                >
                  Delegate to Dominate
                </div>
              </div>
            </Link>

            <p className="text-white/62 text-[14px] font-body leading-[1.85] mb-7 max-w-[300px]">
              Simplify your operations and get more done with BizBackerz — dedicated virtual
              support that helps your business grow smoothly and efficiently.
            </p>

            {/* Contact links */}
            <div className="space-y-3 mb-7">
              <a
                href="tel:+19046686362"
                className="flex items-center gap-3 text-[13px] font-body text-white/55 hover:text-brand-400 transition-colors duration-300 group"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/18 transition-colors duration-300">
                  <Phone className="w-3.5 h-3.5 text-brand-400" />
                </span>
                (904) 668-6362
              </a>
              <a
                href="https://share.google/yconWqaIeNBaoj4r5"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[13px] font-body text-white/55 hover:text-brand-400 transition-colors duration-300 group"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/18 transition-colors duration-300">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                </span>
                London, UK — View on Map
              </a>
              <Link
                to="/booking"
                className="flex items-center gap-3 text-[13px] font-body text-white/55 hover:text-brand-400 transition-colors duration-300 group"
              >
                <span className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/18 transition-colors duration-300">
                  <Mail className="w-3.5 h-3.5 text-brand-400" />
                </span>
                Book a Free Consultation
              </Link>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/38 hover:text-brand-400 hover:bg-brand-500/12 border border-white/[0.06] hover:border-brand-500/22 transition-all duration-300"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {navCols.map((col) => (
            <div key={col.heading}>
              <h4 className="font-display font-semibold text-white/85 mb-5 text-[11px] tracking-[0.22em] uppercase">
                {col.heading}
              </h4>
              <ul className="space-y-3.5">
                {col.links.map(({ label, to, href }) => {
                  const inner = (
                    <span className="group inline-flex items-center gap-1.5 text-[13.5px] font-body text-white/50 hover:text-white transition-colors duration-300">
                      {label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                    </span>
                  )
                  return (
                    <li key={label}>
                      {to ? (
                        <Link to={to}>{inner}</Link>
                      ) : (
                        <a href={href}>{inner}</a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/[0.06] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/38 text-[12px] font-body">
            © 2026 BizBackerz. All rights reserved.
          </p>
          <p className="text-white/25 text-[12px] font-body">
            Virtual Assistance · Delegate to Dominate
          </p>
        </div>

      </Container>
    </footer>
  )
}
