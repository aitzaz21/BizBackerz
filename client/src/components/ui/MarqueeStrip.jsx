import React from 'react'

const row1 = [
  '50+ Trusted Clients', 'Real Estate Support', '3+ Years Experience',
  'Administrative Support', 'Social Media Growth', 'Lead Generation',
  'Content Creation', 'Project Management', 'E-Commerce Services',
]

const row2 = [
  'Marketing Support', 'Accounting Services', 'Customer Support',
  'Delegate to Dominate', 'Business Efficiency', 'Virtual Assistance',
  'Productivity Boost', '95% Satisfaction Rate', 'Florida Based Team',
]

function MarqueeRow({ items, reverse = false, speed = 30 }) {
  const doubled = [...items, ...items]
  return (
    <div className="flex overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
      <div
        className="flex items-center shrink-0 w-max"
        style={{
          animation: `marquee${reverse ? '-reverse' : ''} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-4 px-5">
            <span className={`text-[10px] font-body font-bold tracking-[0.22em] uppercase whitespace-nowrap ${reverse ? 'text-accent-500/20' : 'text-white/18'}`}>
              {item}
            </span>
            <span className={`text-[7px] flex-shrink-0 ${reverse ? 'text-accent-500/15' : 'text-brand-500/20'}`}>◆</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MarqueeStrip() {
  return (
    <div className="relative py-4 overflow-hidden border-y border-white/[0.04] bg-navy-950/70 space-y-3">

      {/* Row 1 → */}
      <MarqueeRow items={row1} reverse={false} speed={35} />

      {/* Thin divider */}
      <div className="h-px bg-white/[0.03] mx-8" />

      {/* Row 2 ← (opposite direction) */}
      <MarqueeRow items={row2} reverse={true}  speed={28} />

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
