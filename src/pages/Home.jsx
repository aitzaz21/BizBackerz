import React from 'react'
import Hero        from '../components/sections/Hero'
import About       from '../components/sections/About'
import Services    from '../components/sections/Services'
import VideoSection from '../components/sections/VideoSection'
import CTA         from '../components/sections/CTA'
import MarqueeStrip   from '../components/ui/MarqueeStrip'
import KineticStrip   from '../components/ui/KineticStrip'
import ScrollProgress from '../components/ui/ScrollProgress'

export default function Home() {
  return (
    <>
      <ScrollProgress />

      <Hero />
      <MarqueeStrip />

      {/* Kinetic 1 — slides RIGHT while you scroll down */}
      <KineticStrip
        texts={['DELEGATE', '·', 'TO DOMINATE', '·', 'VIRTUAL EXCELLENCE', '·', 'PREMIUM SUPPORT', '·']}
        direction={-1}
        opacity={0.042}
        fontSize="clamp(3.8rem,8.5vw,9.5rem)"
        speed={1.5}
      />

      <About />

      {/* Kinetic 2 — slides LEFT (opposite) */}
      <KineticStrip
        texts={['OPERATIONAL DISCIPLINE', '·', 'CLIENT FIRST', '·', 'SINCE 2019', '·', 'BIZBACKERZ', '·']}
        direction={1}
        opacity={0.038}
        fontSize="clamp(3.8rem,8.5vw,9.5rem)"
        speed={1.2}
      />

      <Services />

      {/* Kinetic 3 — breather strip between Services and Video */}
      <KineticStrip
        texts={['TRUSTED BY 50+ CLIENTS', '·', 'DELEGATE TO DOMINATE', '·', 'PREMIUM EXECUTION', '·', 'SINCE 2024', '·']}
        direction={-1}
        opacity={0.038}
        fontSize="clamp(3.8rem,8.5vw,9.5rem)"
        speed={1.1}
      />

      <VideoSection />
      <CTA />
    </>
  )
}
