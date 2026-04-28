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

/* ── CSS gradient shown when WebGL fails or is unavailable ── */
const SceneCSSFallback = () => (
  <div
    style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      zIndex: 0, pointerEvents: 'none',
      background: [
        'radial-gradient(ellipse 130% 65% at 10% 20%, rgba(42,139,255,0.13) 0%, transparent 50%)',
        'radial-gradient(ellipse 90% 55% at 88% 75%, rgba(56,217,169,0.09) 0%, transparent 50%)',
        'radial-gradient(ellipse 70% 45% at 50% 105%, rgba(139,92,246,0.07) 0%, transparent 50%)',
      ].join(', '),
    }}
  />
)

/* ── Catches WebGL / Three.js runtime errors so the page stays visible ── */
class SceneErrorBoundary extends React.Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(e) { console.warn('[SceneWrapper] render error — falling back to CSS:', e.message) }
  render() {
    if (this.state.failed) return <SceneCSSFallback />
    return this.props.children
  }
}

/* ── Top-level boundary: prevents a completely blank dark screen on any error ── */
class AppErrorBoundary extends React.Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(e, info) { console.error('[App] uncaught render error:', e, info) }
  render() {
    if (this.state.failed) {
      return (
        <div style={{
          minHeight: '100vh', background: '#030912',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', color: '#c8d2de', fontFamily: 'sans-serif' }}>
            <p style={{ fontSize: 16, opacity: 0.6 }}>Something went wrong. Please refresh the page.</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

/* Home is eagerly imported — lazy loading causes a React 18 concurrent Suspense
   race on initial render (removeChild fails when the chunk resolves mid-commit) */
import Home from './pages/Home'

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

  /* ── Lenis smooth scroll — desktop only, native scroll on touch/mobile ── */
  useEffect(() => {
    /* (pointer: coarse) is true on phones/tablets but false on laptops, even
       those with touchscreens — navigator.maxTouchPoints fires false-positives
       on Windows 10/11 machines that have no physical touchscreen. */
    const isCoarseTouch = window.matchMedia('(pointer: coarse)').matches

    if (isCoarseTouch) {
      // On mobile/tablet use native scroll; Lenis smooth-wheel doesn't apply to touch
      const onScroll = () => ScrollTrigger.update()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }

    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
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

  /* ── Scroll-to-top & refresh ScrollTrigger on route change ── */
  useEffect(() => {
    window.scrollTo(0, 0)
    lenisRef.current?.scrollTo(0, { immediate: true })
    // Components handle their own ScrollTrigger cleanup via ctx.revert().
    // Only refresh measurements so triggers recalculate positions after layout settles.
    const t = setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <div className="relative min-h-screen">
      <CustomCursor />
      <FloatingCTA />

      {isHome && (
        <SceneErrorBoundary>
          <Suspense fallback={null}>
            <SceneWrapper />
          </Suspense>
        </SceneErrorBoundary>
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
    <AppErrorBoundary>
      <BrowserRouter>
        {/* Loader shows once on first visit */}
        {!loaded && <SiteLoader onComplete={() => setLoaded(true)} />}
        <AppContent />
      </BrowserRouter>
    </AppErrorBoundary>
  )
}
