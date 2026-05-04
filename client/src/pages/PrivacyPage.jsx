import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import { ArrowLeft, Shield } from 'lucide-react'

const sections = [
  {
    title: '1. Information We Collect',
    body: `We collect information you provide directly when you use our services, including:

• Contact information: name, email address, phone number, and country of residence
• Business information: company name, service requirements, and operational details
• Communication data: messages, emails, and any information you share during consultations
• Booking information: appointment details, timezone preferences, and scheduling data
• Usage data: how you interact with our website, including pages visited and features used

We do not collect sensitive personal information such as government ID numbers, payment card data, or health information through this website.`,
  },
  {
    title: '2. How We Use Your Information',
    body: `We use the information we collect to:

• Provide and improve our virtual assistant services
• Communicate with you about your bookings, inquiries, and service updates
• Send confirmation emails, appointment reminders, and follow-up messages
• Respond to your questions and provide customer support
• Personalise your experience and tailor our services to your business needs
• Analyse usage patterns to improve our website and services
• Comply with applicable legal obligations

We will not sell, rent, or trade your personal information to third parties for their marketing purposes.`,
  },
  {
    title: '3. Information Sharing',
    body: `We may share your information with:

• Service providers who assist us in operating our business (email delivery, scheduling software, analytics)
• Professional advisors such as lawyers and accountants where required
• Law enforcement or government authorities when legally required

All third parties we work with are contractually obligated to handle your information securely and only for the purposes we specify.`,
  },
  {
    title: '4. Data Retention',
    body: `We retain your personal information for as long as necessary to provide our services and fulfil the purposes described in this policy. Booking records are typically retained for 3 years for business and legal purposes. You may request deletion of your data at any time by contacting us at Hello@bizbackerz.com.`,
  },
  {
    title: '5. Your Rights',
    body: `Depending on your location, you may have the right to:

• Access the personal information we hold about you
• Request correction of inaccurate or incomplete data
• Request deletion of your personal information
• Object to or restrict our processing of your data
• Withdraw consent where processing is based on consent
• Data portability — receive your data in a structured, machine-readable format

To exercise any of these rights, please contact us at Hello@bizbackerz.com. We will respond within 30 days.`,
  },
  {
    title: '6. Cookies & Tracking',
    body: `Our website uses cookies and similar tracking technologies to enhance your browsing experience, analyse website traffic, and understand user behaviour. We use:

• Essential cookies: required for the website to function properly
• Analytics cookies: help us understand how visitors use our site
• Preference cookies: remember your settings and choices

You can control cookies through your browser settings. Disabling certain cookies may affect website functionality.`,
  },
  {
    title: '7. Security',
    body: `We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. These include encrypted data transmission (HTTPS), access controls, and regular security reviews. However, no internet transmission is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '8. International Transfers',
    body: `BizBackerz operates from the United Kingdom and serves clients globally. Your information may be transferred to and processed in countries outside your home country. We ensure appropriate safeguards are in place for any such transfers in compliance with applicable data protection laws.`,
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on our website with an updated effective date. Your continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '10. Contact Us',
    body: `If you have any questions about this Privacy Policy or our data practices, please contact us:

Email: Hello@bizbackerz.com
Phone: (904) 668-6362
Address: London, United Kingdom

We take all privacy inquiries seriously and aim to respond within 5 business days.`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-navy-950 overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-[30rem] w-[30rem] rounded-full blur-[150px]"
          style={{ background: 'rgba(42,139,255,0.07)' }} />
        <div className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: 'linear-gradient(rgba(42,139,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(42,139,255,0.04) 1px,transparent 1px)',
            backgroundSize: '88px 88px',
          }} />
      </div>

      <div className="relative z-10">
        <Container className="pt-6 pb-10 sm:pt-8 sm:pb-16">

          <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-body font-semibold text-white/45 hover:text-white transition-colors duration-300 mb-10 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(42,139,255,0.12)', border: '1px solid rgba(42,139,255,0.22)' }}>
                <Shield className="w-5 h-5 text-brand-400" />
              </div>
              <span className="section-label">Legal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-[15px] text-white/55 font-body leading-[1.85] max-w-2xl mb-3">
              Your privacy matters to us. This policy explains how BizBackerz collects, uses, and protects your personal information.
            </p>
            <p className="text-[12px] text-white/35 font-body mb-12">
              Effective date: 1 January 2026 &nbsp;·&nbsp; Last updated: 1 May 2026
            </p>
          </motion.div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mb-12" />

          <div className="max-w-3xl space-y-10">
            {sections.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="relative rounded-2xl p-7 border border-white/[0.06]"
                style={{ background: 'rgba(6,15,29,0.45)', backdropFilter: 'blur(16px)' }}
              >
                <h2 className="text-[17px] font-display font-bold text-white mb-4">{s.title}</h2>
                <p className="text-[14px] text-white/65 font-body leading-[1.9] whitespace-pre-line">{s.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <p className="text-[13px] text-white/38 font-body mb-4">
              Questions about our privacy practices?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-body font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors duration-300"
            >
              Contact Us
            </Link>
          </div>

        </Container>
      </div>
    </div>
  )
}
