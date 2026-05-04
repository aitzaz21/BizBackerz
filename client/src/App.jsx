import React, { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CustomCursor from './components/ui/CustomCursor'
import SiteLoader from './components/ui/SiteLoader'
import FloatingCTA from './components/ui/FloatingCTA'

gsap.registerPlugin(ScrollTrigger)

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

/* Strips trailing slashes so /about-us/ matches the /about-us redirect route */
function TrailingSlashHandler() {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname.endsWith('/')) {
      navigate(
        location.pathname.slice(0, -1) + location.search + location.hash,
        { replace: true }
      )
    }
  }, [location.pathname])
  return null
}

/* Home is eagerly imported — lazy loading causes a React 18 concurrent Suspense
   race on initial render (removeChild fails when the chunk resolves mid-commit) */
import Home from './pages/Home'

const AboutPage         = lazy(() => import('./components/about/AboutPage'))
const BlogPage          = lazy(() => import('./pages/Blog'))
const BlogPost          = lazy(() => import('./pages/BlogPost'))
const ServicesPage      = lazy(() => import('./pages/ServicesPage'))
const ServiceDetailPage = lazy(() => import('./pages/services/ServiceDetailPage'))
const ContactPage       = lazy(() => import('./pages/Contact'))
const BookingPage       = lazy(() => import('./pages/BookingPage'))
const ReviewsPage       = lazy(() => import('./pages/ReviewsPage'))
const PrivacyPage       = lazy(() => import('./pages/PrivacyPage'))
const TermsPage         = lazy(() => import('./pages/TermsPage'))
const FAQPage           = lazy(() => import('./pages/FAQPage'))
const SceneWrapper      = lazy(() => import('./components/3d/SceneWrapper'))
const AdminLogin        = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'))

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="font-display font-bold text-[6rem] sm:text-[8rem] leading-none text-gradient mb-4">404</div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">Page not found</h1>
        <p className="text-white/45 font-body text-[15px] mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-body font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-colors duration-300"
          >
            Go Home
          </a>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-body font-semibold text-white/60 border border-white/[0.12] hover:text-white hover:border-white/25 transition-all duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}

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
      <TrailingSlashHandler />
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
              <Route path="/"                    element={<Home />} />
              <Route path="/about"               element={<AboutPage />} />
              <Route path="/services"            element={<ServicesPage />} />
              <Route path="/services/:slug"      element={<ServiceDetailPage />} />
              <Route path="/blog"                element={<BlogPage />} />
              <Route path="/blog/:slug"          element={<BlogPost />} />
              <Route path="/contact"             element={<ContactPage />} />
              <Route path="/booking"             element={<BookingPage />} />
              <Route path="/reviews"             element={<ReviewsPage />} />
              <Route path="/privacy"             element={<PrivacyPage />} />
              <Route path="/terms"               element={<TermsPage />} />
              <Route path="/faq"                 element={<FAQPage />} />

              {/* ── Legacy WordPress permalink redirects (client-side fallback) ── */}

              {/* Pages */}
              <Route path="/about-us"            element={<Navigate to="/about"   replace />} />
              <Route path="/contact-us"          element={<Navigate to="/contact" replace />} />
              <Route path="/privacy-policy"      element={<Navigate to="/privacy" replace />} />
              <Route path="/terms-of-service"    element={<Navigate to="/terms"   replace />} />
              <Route path="/faqs"                element={<Navigate to="/faq"     replace />} />

              {/* Services */}
              <Route path="/administrative-support"  element={<Navigate to="/services/administrative-support"  replace />} />
              <Route path="/accounting-services"     element={<Navigate to="/services/accounting-services"     replace />} />
              <Route path="/social-media-management" element={<Navigate to="/services/social-media-management" replace />} />
              <Route path="/marketing-support"       element={<Navigate to="/services/marketing-support"       replace />} />
              <Route path="/content-creation"        element={<Navigate to="/services/content-creation"        replace />} />
              <Route path="/customer-support"        element={<Navigate to="/services/customer-support"        replace />} />
              <Route path="/lead-generation"         element={<Navigate to="/services/lead-generation"         replace />} />
              <Route path="/project-management"      element={<Navigate to="/services/project-management"      replace />} />
              <Route path="/e-commerce-services"     element={<Navigate to="/services/e-commerce-services"     replace />} />

              {/* Blog posts */}
              <Route path="/how-virtual-assistant-services-for-small-businesses-can-save-you-20-hours-a-week" element={<Navigate to="/blog/virtual-assistant-small-business-save-20-hours"       replace />} />
              <Route path="/how-an-amazon-virtual-assistant"   element={<Navigate to="/blog/amazon-real-estate-virtual-assistant-services-2026" replace />} />
              <Route path="/10-tasks-you-should-outsource"     element={<Navigate to="/blog" replace />} />

              {/* WordPress system paths */}
              <Route path="/wp-admin"            element={<Navigate to="/admin"   replace />} />
              <Route path="/wp-admin/*"          element={<Navigate to="/admin"   replace />} />
              <Route path="/wp-login.php"        element={<Navigate to="/admin"   replace />} />
              <Route path="/feed"                element={<Navigate to="/blog"    replace />} />
              <Route path="/feed/*"              element={<Navigate to="/blog"    replace />} />
              <Route path="/category/*"          element={<Navigate to="/blog"    replace />} />
              <Route path="/tag/*"               element={<Navigate to="/blog"    replace />} />
              <Route path="/author/*"            element={<Navigate to="/"        replace />} />
              <Route path="/page/:n"             element={<Navigate to="/blog"    replace />} />

              <Route path="*"                    element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  )
}

function AdminRoutes() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Routes>
        <Route path="/admin"           element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <AdminRouteGate
          fallback={
            <>
              {!loaded && <SiteLoader onComplete={() => setLoaded(true)} />}
              <AppContent />
            </>
          }
        />
      </BrowserRouter>
    </AppErrorBoundary>
  )
}

/* Renders admin shell on /admin/* paths, public site otherwise */
function AdminRouteGate({ fallback }) {
  const location = useLocation()
  const isAdmin  = location.pathname === '/admin' || location.pathname.startsWith('/admin/')
  if (isAdmin) return <AdminRoutes />
  return fallback
}
