import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Multi-layer parallax — each layer moves at a different speed.
 * @param {Array<{selector: string, speed: number}>} layers
 */
export function useMultiParallax(layers) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    layers.forEach(({ selector, speed }) => {
      const targets = el.querySelectorAll(selector)
      if (!targets.length) return

      gsap.to(targets, {
        y: () => speed * -150,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (el.contains(st.trigger) || st.trigger === el) st.kill()
      })
    }
  }, [])

  return ref
}

/**
 * Mouse parallax — shifts element based on cursor position.
 * Lightweight, uses requestAnimationFrame internally via GSAP.
 */
export function useMouseParallax(intensity = 0.02) {
  const ref = useRef(null)
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }

    window.addEventListener('mousemove', onMove, { passive: true })

    gsap.ticker.add(() => {
      gsap.to(el, {
        x: mouse.current.x * intensity * 100,
        y: mouse.current.y * intensity * 100,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
    }
  }, [intensity])

  return ref
}
