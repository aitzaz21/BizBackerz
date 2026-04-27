import React, { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import BackgroundScene from './BackgroundScene'
import Particles from './Particles'
import Lights from './Lights'

/**
 * Global 3D Canvas — Matches original HTML's #bg-canvas behavior:
 *   position: fixed, top: 0, left: 0, width: 100%, height: 100vh,
 *   z-index: 0, pointer-events: none
 *
 * ORIGINAL: PerspectiveCamera(75, aspect, 0.1, 1000), position.z = 5
 * OURS: fov 60 (less distortion), position.z = 6 (slightly pulled back)
 *
 * PERFORMANCE:
 *   - DPR capped at 1.5 (original used devicePixelRatio uncapped)
 *   - stencil disabled
 *   - resize debounced
 */
export default function SceneWrapper() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const media = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)')
    const syncEnabled = () => setEnabled(media.matches)

    syncEnabled()
    media.addEventListener('change', syncEnabled)
    return () => media.removeEventListener('change', syncEnabled)
  }, [])

  if (!enabled) return null

  return (
    <div
      id="bg-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={1}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'default',
          stencil: false,
        }}
        style={{ background: 'transparent' }}
        resize={{ debounce: 100 }}
      >
        <Suspense fallback={null}>
          <Lights />
          <BackgroundScene />
          <Particles count={900} />
        </Suspense>
      </Canvas>
    </div>
  )
}
