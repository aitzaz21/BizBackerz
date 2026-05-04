import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import { ArrowLeft, FileText } from 'lucide-react'

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using BizBackerz services, website, or booking system, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services. These terms apply to all visitors, clients, and users of our services.`,
  },
  {
    title: '2. Services Description',
    body: `BizBackerz provides professional virtual assistant services including but not limited to:

• Administrative support and task management
• Customer support and communication management
• Social media management and content creation
• Lead generation and CRM management
• Project management and coordination
• Accounting support and bookkeeping assistance
• E-commerce operations and product management
• Marketing support and campaign coordination

The specific scope, deliverables, and pricing of services will be agreed upon in a separate service agreement between BizBackerz and the client.`,
  },
  {
    title: '3. Booking & Consultations',
    body: `Free strategy consultations (30-minute Zoom calls) are offered to prospective clients at no charge. By booking a consultation, you agree to:

• Provide accurate contact and business information
• Attend or cancel the appointment with at least 24 hours' notice
• Use the consultation genuinely to explore our services

BizBackerz reserves the right to decline consultation requests at its discretion. Confirmation of a booking requires you to click the confirmation link sent to your email within 24 hours.`,
  },
  {
    title: '4. Client Obligations',
    body: `Clients engaging BizBackerz services agree to:

• Provide clear and timely communication regarding tasks and expectations
• Grant necessary access to systems, accounts, and information required to perform services
• Review and provide feedback on work within agreed timeframes
• Pay invoices in accordance with the agreed payment schedule
• Treat all BizBackerz team members with respect and professionalism
• Not share confidential BizBackerz processes or methodologies with third parties`,
  },
  {
    title: '5. Confidentiality',
    body: `BizBackerz treats all client information as strictly confidential. We will not disclose, share, or use your business information, data, or trade secrets for any purpose other than providing our services to you. Upon request, we are happy to sign a mutual Non-Disclosure Agreement (NDA).

Clients agree to maintain the confidentiality of any proprietary BizBackerz processes, pricing, and operational methods disclosed during the engagement.`,
  },
  {
    title: '6. Intellectual Property',
    body: `All work product created by BizBackerz specifically for a client — including documents, content, graphics, and data — becomes the property of the client upon full payment of applicable fees. General methodologies, frameworks, templates, and internal processes remain the intellectual property of BizBackerz.

The BizBackerz name, logo, and brand materials are protected trademarks and may not be used without express written permission.`,
  },
  {
    title: '7. Limitation of Liability',
    body: `To the maximum extent permitted by law, BizBackerz shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. Our total liability for any claim arising from our services shall not exceed the amount paid by you to BizBackerz in the three months preceding the claim.

We do not guarantee specific business outcomes, revenue increases, or operational results from our services.`,
  },
  {
    title: '8. Payment Terms',
    body: `Payment terms, rates, and billing cycles are specified in individual service agreements. Standard terms include:

• Invoices are due within 14 days of issue unless otherwise agreed
• Late payments may incur a 1.5% monthly interest charge
• Services may be paused for accounts overdue by more than 30 days
• Refunds are assessed on a case-by-case basis at BizBackerz discretion`,
  },
  {
    title: '9. Termination',
    body: `Either party may terminate an ongoing service engagement with 14 days' written notice. BizBackerz reserves the right to terminate immediately if a client violates these terms, fails to make payment, or engages in abusive or inappropriate conduct. Upon termination, BizBackerz will deliver all work completed up to the termination date and return any client-provided materials.`,
  },
  {
    title: '10. Governing Law',
    body: `These Terms & Conditions are governed by the laws of England and Wales. Any disputes arising from these terms or our services shall be subject to the exclusive jurisdiction of the courts of England and Wales. We will always attempt to resolve disputes amicably before pursuing formal legal action.`,
  },
  {
    title: '11. Changes to These Terms',
    body: `We may update these Terms & Conditions from time to time. Significant changes will be communicated to active clients via email. Continued use of our services after changes become effective constitutes acceptance of the revised terms.`,
  },
  {
    title: '12. Contact',
    body: `For questions about these terms, please contact us:

Email: Hello@bizbackerz.com
Phone: (904) 668-6362
Address: London, United Kingdom`,
  },
]

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-navy-950 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[30rem] w-[30rem] rounded-full blur-[150px]"
          style={{ background: 'rgba(56,217,169,0.06)' }} />
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
                style={{ background: 'rgba(56,217,169,0.12)', border: '1px solid rgba(56,217,169,0.22)' }}>
                <FileText className="w-5 h-5 text-accent-400" />
              </div>
              <span className="section-label">Legal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight mb-4">
              Terms & Conditions
            </h1>
            <p className="text-[15px] text-white/55 font-body leading-[1.85] max-w-2xl mb-3">
              Please read these terms carefully before using BizBackerz services. By engaging with us, you agree to these conditions.
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
            <p className="text-[13px] text-white/38 font-body mb-4">Questions about these terms?</p>
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
