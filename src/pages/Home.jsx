import React from 'react'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Services from '../components/sections/Services'
import VideoSection from '../components/sections/VideoSection'
import CTA from '../components/sections/CTA'
import MarqueeStrip from '../components/ui/MarqueeStrip'

export default function Home() {
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <About />
      <Services />
      <VideoSection />
      <CTA />
    </>
  )
}
