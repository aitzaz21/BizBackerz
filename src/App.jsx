import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CustomCursor from './components/ui/CustomCursor'
import SiteLoader from './components/ui/SiteLoader'
import FloatingCTA from './components/ui/FloatingCTA'

const Home        = lazy(() => import('./pages/Home'))
const AboutPage   = lazy(() => import('./components/about/AboutPage'))
const BlogPage    = lazy(() => import('./pages/Blog'))
const ServicesPage= lazy(() => import('./pages/ServicesPage'))
const ContactPage = lazy(() => import('./pages/Contact'))
const SceneWrapper= lazy(() => import('./components/3d/SceneWrapper'))

function SuspenseFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )
}

function AppContent({ onLoaded }) {
  const location = useLocation()
  const isHome   = location.pathname === '/'
  const lenisRef = useRef(null)

  /* ── Lenis smooth scroll — created once, lives for app lifetime ── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const rafFn = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(rafFn)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(rafFn)
      lenis.destroy()
    }
  }, [])

  /* ── Kill & refresh ScrollTrigger on route change ── */
  useEffect(() => {
    ScrollTrigger.getAll().forEach((st) => st.kill())
    window.scrollTo(0, 0)
    lenisRef.current?.scrollTo(0, { immediate: true })
    const t = setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <div className="relative min-h-screen">
      <CustomCursor />
      <FloatingCTA />

      {isHome && (
        <Suspense fallback={null}>
          <SceneWrapper />
        </Suspense>
      )}

      <div className="relative z-10">
        <Navbar />
        <main>
          <Suspense fallback={<SuspenseFallback />} >
            <Routes>
              <Route path="/"        element={<Home />} />
              <Route path="/about"   element={<AboutPage />} />
              <Route path="/services"element={<ServicesPage />} />
              <Route path="/blog"    element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <BrowserRouter>
      {/* Loader shows once on first visit */}
      {!loaded && <SiteLoader onComplete={() => setLoaded(true)} />}
      <AppContent />
    </BrowserRouter>
  )
}
