import React from 'react'
import Container from '../ui/Container'
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Phone } from 'lucide-react'

const socialLinks = [
  { Icon: Facebook, href: 'https://www.facebook.com/BizBackerz' },
  { Icon: Twitter, href: 'https://x.com/Bizbackerz' },
  { Icon: Instagram, href: 'https://www.instagram.com/bizbackerzltd/' },
  { Icon: Youtube, href: 'https://www.youtube.com/@BIZBACKERZ' },
  { Icon: Linkedin, href: 'https://www.linkedin.com/company/105424987/' },
]

const quickLinks = [
  { label: 'About Us', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Contact', href: '/contact' },
]

const colHead = 'font-display font-semibold text-white/80 mb-5 text-[11px] tracking-[0.2em] uppercase'
const linkCls = 'text-white/40 hover:text-brand-400 text-[14px] font-body transition-colors duration-300'

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative isolate z-[120] mt-24 min-h-[360px] bg-navy-950/95 border-t border-white/[0.06] overflow-hidden backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/85 via-navy-950/96 to-[#02070f] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[280px] bg-brand-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-brand-500/18 to-transparent" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 py-16 lg:py-20">
          <div data-animate>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center font-bold text-white font-display text-lg shadow-lg shadow-brand-500/20">
                B
              </div>
              <span className="text-[20px] font-display font-bold tracking-[-0.03em] text-white">
                Biz<span className="text-gradient">Backerz</span>
              </span>
            </div>
            <p className="text-white/38 text-[14px] font-body leading-[1.85] mb-6">
              Simplify your operations and get more done with BizBackerz. We&apos;re here to provide
              the dedicated support you need to help your business grow smoothly and efficiently.
            </p>
            <div className="flex items-center gap-2.5">
              {socialLinks.map(({ Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/30 hover:text-brand-400 hover:bg-brand-500/10 border border-white/[0.04] transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div data-animate>
            <h4 className={colHead}>Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={linkCls}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div data-animate>
            <h4 className={colHead}>Useful Links</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms and Conditions', 'FAQs'].map((label) => (
                <li key={label}>
                  <a href="#" className={linkCls}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div data-animate>
            <h4 className={colHead}>Work Hours</h4>
            <p className="text-white/38 text-[14px] font-body mb-5 leading-relaxed">
              8 AM - 5 PM
              <br />
              Monday - Saturday
            </p>
            <a
              href="tel:9046686362"
              className="inline-flex items-center gap-2.5 text-brand-400 hover:text-brand-300 font-body font-semibold text-[14px] transition-colors duration-300"
            >
              <span className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </span>
              Call Us Today
            </a>
          </div>
        </div>

        <div className="border-t border-white/[0.04] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-[13px] font-body">
            Virtual Assistance by{' '}
            <a href="/#hero" className="text-white/40 hover:text-brand-400 transition-colors">
              BizBackerz
            </a>
          </p>
          <p className="text-white/25 text-[13px] font-body">Copyright © 2026. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  )
}
