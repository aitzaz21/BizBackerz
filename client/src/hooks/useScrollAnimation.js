import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Core GSAP ScrollTrigger hook.
 * Creates bidirectional animations that play on scroll down and REVERSE on scroll up.
 *
 * @param {Function} animationFactory - receives (element, tl) → build timeline
 * @param {Object} options - ScrollTrigger config overrides
 */
export function useScrollAnimation(animationFactory, options = {}) {
  const ref = useRef(null)
  const tlRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Make visible
    gsap.set(el, { visibility: 'visible' })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: options.start || 'top 85%',
        end: options.end || 'bottom 20%',
        toggleActions: options.toggleActions || 'play reverse play reverse',
        ...options,
      },
    })

    animationFactory(el, tl)
    tlRef.current = tl

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return ref
}

/**
 * Staggered children reveal — bidirectional.
 * Fades + translates children elements.
 */
export function useStaggerReveal(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const children = el.querySelectorAll('[data-animate]')
    if (!children.length) return

    gsap.set(el, { visibility: 'visible' })
    gsap.set(children, {
      opacity: 0,
      y: options.y ?? 50,
      x: options.x ?? 0,
      rotateX: options.rotateX ?? 0,
    })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: options.start || 'top 80%',
        end: options.end || 'bottom 20%',
        toggleActions: 'play reverse play reverse',
      },
    })

    tl.to(children, {
      opacity: 1,
      y: 0,
      x: 0,
      rotateX: 0,
      duration: options.duration || 1.2,
      stagger: options.stagger || 0.12,
      ease: options.ease || 'power2.out',
    })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return ref
}

/**
 * Floating cards system — cards move independently based on scroll.
 * Left cards drift right, right cards drift left, with depth shift.
 */
export function useFloatingCards() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const cards = el.querySelectorAll('[data-float]')
    if (!cards.length) return

    gsap.set(el, { visibility: 'visible' })

    cards.forEach((card, i) => {
      const direction = card.dataset.float || 'left'
      const depth = parseFloat(card.dataset.depth || '0')
      const xStart = direction === 'left' ? -80 : 80
      const rotateStart = direction === 'left' ? -8 : 8

      gsap.set(card, {
        opacity: 0,
        x: xStart,
        z: depth * -50,
        rotateY: rotateStart,
        transformPerspective: 1000,
      })

      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          end: 'bottom 10%',
          toggleActions: 'play reverse play reverse',
          scrub: 0.8,
        },
        opacity: 1,
        x: 0,
        z: 0,
        rotateY: 0,
        duration: 1,
        ease: 'power2.out',
        delay: i * 0.05,
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (el.contains(st.trigger)) st.kill()
      })
    }
  }, [])

  return ref
}

/**
 * Parallax layers — elements move at different speeds.
 */
export function useParallaxLayer(speed = 0.3) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    gsap.to(el, {
      y: () => speed * -200,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === el) st.kill()
      })
    }
  }, [speed])

  return ref
}

/**
 * Pinned section — stays fixed while content animates inside.
 */
export function usePinnedSection(animationFactory, options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    gsap.set(el, { visibility: 'visible' })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: options.end || '+=150%',
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        ...options,
      },
    })

    animationFactory(el, tl)

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return ref
}
