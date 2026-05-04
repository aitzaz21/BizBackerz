import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '../components/ui/Container'
import { ArrowLeft, ChevronDown, HelpCircle, ArrowRight } from 'lucide-react'

const faqs = [
  {
    category: 'Getting Started',
    color: '#2a8bff',
    questions: [
      {
        q: 'What is a virtual assistant and how does BizBackerz work?',
        a: 'A virtual assistant (VA) is a skilled remote professional who handles specific business tasks on your behalf. BizBackerz matches you with a dedicated VA who integrates seamlessly into your workflow. After a free 30-minute discovery call, we identify your biggest bottlenecks, match you with the right assistant, set up communication channels and tool access, and you start delegating within 48 hours.',
      },
      {
        q: 'How quickly can I get started?',
        a: 'Our onboarding is designed to move fast. After your initial discovery call and a signed service agreement, your assistant is fully briefed and ready to begin work within 48 hours. Most clients delegate their first tasks on day one.',
      },
      {
        q: 'Do I need to sign a long-term contract?',
        a: 'No long-term contracts required. We offer flexible monthly arrangements. However, clients who commit to 3+ months consistently report better results because the assistant develops deeper familiarity with your business and workflows.',
      },
      {
        q: 'What types of businesses do you work with?',
        a: 'We work with founders, solopreneurs, and growing businesses across many industries — including real estate, e-commerce, SaaS, agencies, consulting firms, and professional services. If you have tasks that consume your time and could be delegated, BizBackerz can help.',
      },
    ],
  },
  {
    category: 'Services & Capabilities',
    color: '#20c997',
    questions: [
      {
        q: 'What tasks can my virtual assistant handle?',
        a: 'Our VAs handle a wide range of tasks including email and calendar management, customer support, social media management, content creation, lead generation, data entry, research, project coordination, e-commerce operations, accounting support, and much more. During onboarding we build a custom task list tailored to your specific business needs.',
      },
      {
        q: 'Can my assistant handle specialised or technical tasks?',
        a: 'Yes. Our team includes specialists in different domains. If your requirements involve technical tools, niche platforms, or specialised knowledge, we match you with an assistant who has the relevant background. Specialised skills may affect pricing.',
      },
      {
        q: 'What software and tools does BizBackerz support?',
        a: 'Our assistants are proficient in a wide range of tools including Google Workspace, Microsoft Office, Slack, Asana, Trello, HubSpot, Salesforce, Shopify, WordPress, QuickBooks, Xero, Canva, and many more. If you use a specific tool, let us know during onboarding and we will confirm compatibility.',
      },
      {
        q: 'Can I have more than one virtual assistant?',
        a: 'Absolutely. Many of our growing clients start with one assistant and scale to a team as their needs expand. We can provide specialists for different areas — for example, one assistant for admin and one for social media management.',
      },
    ],
  },
  {
    category: 'Communication & Availability',
    color: '#f59e0b',
    questions: [
      {
        q: 'What are your operating hours?',
        a: 'Our primary operating hours are Monday to Friday, 11:00 AM – 8:00 PM Eastern Time (ET), with Saturday availability from 11:00 AM to 5:00 PM ET. For clients in different time zones, we can accommodate flexible scheduling. Response times within business hours are guaranteed within 2 hours.',
      },
      {
        q: 'How do I communicate with my assistant?',
        a: 'We adapt to your preferred communication style. Most clients use email, Slack, WhatsApp, or a project management tool like Asana or Notion. We set up your preferred channels during onboarding and stick to them consistently so nothing falls through the cracks.',
      },
      {
        q: 'Will I always have the same assistant?',
        a: 'Yes. We believe continuity is critical for quality. You will be assigned a dedicated assistant who becomes your consistent point of contact and develops deep familiarity with your business, preferences, and workflow over time.',
      },
      {
        q: 'What happens if my assistant is unavailable?',
        a: 'In the rare event your primary assistant is unavailable, we have a trained backup system in place. Your assigned assistant maintains detailed task logs so that any cover can pick up seamlessly without disruption to your business.',
      },
    ],
  },
  {
    category: 'Pricing & Billing',
    color: '#8b5cf6',
    questions: [
      {
        q: 'How is pricing structured?',
        a: 'Pricing is based on the scope and complexity of your requirements, the number of hours needed per week, and whether specialist skills are involved. We offer flexible hourly packages and monthly retainer plans. Book a free discovery call to discuss your needs and receive a personalised quote.',
      },
      {
        q: 'Is the initial consultation really free?',
        a: 'Yes, completely free and with no obligation. Our 30-minute strategy call is designed purely to understand your business challenges and explore whether BizBackerz is the right fit. There is no pressure and no sales pitch — just an honest conversation.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept bank transfers, PayPal, and major credit/debit cards. Invoices are issued monthly and are due within 14 days. For clients outside the UK or US, we work with international payment platforms to make the process straightforward.',
      },
    ],
  },
  {
    category: 'Security & Privacy',
    color: '#10b981',
    questions: [
      {
        q: 'Is my business information kept confidential?',
        a: 'Absolutely. Confidentiality is one of our core commitments. All team members sign strict confidentiality agreements. We never share client information, data, or business details with any third party. We are also happy to sign a mutual NDA before onboarding.',
      },
      {
        q: 'How do you handle access to my business accounts and systems?',
        a: 'We use secure access protocols and recommend using shared access features (like Google Workspace user management or 1Password Teams) rather than sharing personal passwords. All access is logged, and we revoke credentials immediately upon end of engagement.',
      },
      {
        q: 'Is my data stored securely?',
        a: 'Yes. We use industry-standard encryption for data in transit and at rest. We comply with applicable data protection regulations including GDPR. Please review our Privacy Policy for full details on how we handle personal data.',
      },
    ],
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="text-[15px] font-display font-semibold text-white/85 group-hover:text-white transition-colors duration-300 leading-snug">
          {q}
        </span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-white/35 transition-transform duration-300 mt-0.5 ${open ? 'rotate-180 text-brand-400' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[14px] text-white/62 font-body leading-[1.9]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="relative min-h-screen bg-navy-950 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-[36rem] w-[36rem] rounded-full blur-[150px]"
          style={{ background: 'rgba(42,139,255,0.09)' }} />
        <div className="absolute right-[-6rem] bottom-[10rem] h-[28rem] w-[28rem] rounded-full blur-[150px]"
          style={{ background: 'rgba(56,217,169,0.07)' }} />
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(42,139,255,0.12)', border: '1px solid rgba(42,139,255,0.22)' }}>
                <HelpCircle className="w-5 h-5 text-brand-400" />
              </div>
              <span className="section-label">Support</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-[15px] text-white/55 font-body leading-[1.85] max-w-2xl">
              Everything you need to know about working with BizBackerz. Can't find your answer here? Reach out directly — we're happy to help.
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((cat, ci) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: ci * 0.07 }}
                className="relative rounded-2xl overflow-hidden border border-white/[0.07]"
                style={{ background: 'rgba(6,15,29,0.5)', backdropFilter: 'blur(20px)' }}
              >
                {/* Category header */}
                <div className="flex items-center gap-3 px-7 pt-6 pb-4 border-b border-white/[0.06]">
                  <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                  <h2 className="text-[11px] font-body font-bold uppercase tracking-[0.24em]" style={{ color: cat.color }}>
                    {cat.category}
                  </h2>
                </div>

                <div className="px-7">
                  {cat.questions.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 relative rounded-2xl p-7 sm:p-10 border border-brand-500/20 overflow-hidden text-center"
            style={{
              background: 'linear-gradient(148deg, rgba(42,139,255,0.1) 0%, rgba(42,139,255,0.03) 50%, rgba(6,15,29,0.8) 100%)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(42,139,255,0.6), transparent)' }} />
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">
              Still have questions?
            </h2>
            <p className="text-[14px] text-white/52 font-body leading-[1.8] max-w-md mx-auto mb-7">
              Our team is here to help. Book a free call or send us a message and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/booking"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-body font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors duration-300"
              >
                Book a Free Call <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-body font-semibold text-white/55 border border-white/[0.1] hover:text-white hover:border-white/25 transition-all duration-300"
              >
                Send a Message
              </Link>
            </div>
          </motion.div>

        </Container>
      </div>
    </div>
  )
}
