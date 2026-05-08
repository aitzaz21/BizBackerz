import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '../ui/Container'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    q: 'How fast can a virtual assistant start working for me?',
    a: 'Our standard onboarding takes less than 48 hours. After our initial discovery call, we match you with the right assistant and immediately begin configuring your tools and communication channels so they can start executing tasks right away.',
  },
  {
    q: 'Do I need to sign a long-term contract?',
    a: 'No. We believe our quality should be the reason you stay, not a piece of paper. We offer flexible month-to-month plans that you can scale up, down, or cancel as your business needs evolve.',
  },
  {
    q: 'How do you ensure my business data remains secure?',
    a: 'Security is paramount. Every BizBackerz assistant signs a strict Non-Disclosure Agreement (NDA) before their first client contact. We also utilize secure password managers and adhere to industry-standard data protection protocols to ensure your sensitive information remains completely private.',
  },
  {
    q: 'What if the virtual assistant isn’t a good fit?',
    a: 'While our matching process is highly rigorous, if you ever feel your assistant isn’t the perfect fit, we will immediately step in to assess the situation and provide a replacement at no additional cost or disruption to your workflow.',
  },
  {
    q: 'Can my assistant handle specialized tasks like bookkeeping or CRM management?',
    a: 'Yes. Beyond general administrative support, our roster includes specialists trained in bookkeeping, marketing execution, CRM management, and customer support. We match you with an assistant who has the specific operational background your business requires.',
  },
]

function FAQItem({ q, a, i, isOpen, toggle }) {
  return (
    <div 
      className="border-b border-white/[0.06] last:border-0"
      data-faq-item
    >
      <button
        onClick={() => toggle(i)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <h3 className={`text-[15px] md:text-[17px] font-display font-semibold transition-colors duration-300 pr-8 ${isOpen ? 'text-white' : 'text-white/70 group-hover:text-white/90'}`}>
          {q}
        </h3>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 border ${isOpen ? 'bg-brand-500/10 border-brand-500/30' : 'bg-white/[0.02] border-white/[0.05] group-hover:bg-white/[0.05]'}`}>
          {isOpen ? (
            <Minus className="w-4 h-4 text-brand-400" />
          ) : (
            <Plus className="w-4 h-4 text-white/50 group-hover:text-white/80" />
          )}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[14px] md:text-[15px] font-body leading-[1.8] text-white/50 max-w-3xl pr-8">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const isMobile = window.matchMedia('(pointer: coarse)').matches
    if (isMobile) return

    const ctx = gsap.context(() => {
      // Label fade
      gsap.from('[data-faq-label] .section-label', {
        opacity: 0, x: -20, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play reverse play reverse' },
      })

      // Masked heading lines
      gsap.from('[data-faq-line]', {
        yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play reverse play reverse' },
      })

      // Description fade
      gsap.from('[data-faq-desc]', {
        opacity: 0, y: 20, duration: 1, delay: 0.3, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play reverse play reverse' },
      })

      // FAQ Items
      gsap.from('[data-faq-item]', {
        opacity: 0, y: 40, x: 20, stagger: 0.12, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play reverse play reverse' },
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-12 lg:py-16 bg-navy-950 overflow-hidden border-t border-white/[0.06]">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[150px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      
      <Container>
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32" data-faq-label>
            <span className="section-label mb-4 inline-block">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-[1.06] mb-5">
              <div className="gsap-line-clip" style={{ paddingBottom: '0.05em' }}>
                <span data-faq-line className="block">Answers to your</span>
              </div>
              <div className="gsap-line-clip" style={{ paddingBottom: '0.05em' }}>
                <span data-faq-line className="block text-gradient">frequent questions.</span>
              </div>
            </h2>
            <p data-faq-desc className="text-[15px] text-white/60 font-body leading-[1.8] max-w-sm">
              We believe in total transparency. If you have a question that isn't answered here, reach out to our team directly.
            </p>
          </div>
          
          <div className="lg:col-span-7">
            <div className="border-t border-white/[0.06]">
              {faqs.map((faq, i) => (
                <FAQItem 
                  key={i} 
                  {...faq} 
                  i={i} 
                  isOpen={openIndex === i} 
                  toggle={(idx) => setOpenIndex(openIndex === idx ? -1 : idx)} 
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
