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

    const media = window.matchMedia('(min-width: 1024px)')
    const syncEnabled = () => setEnabled(media.matches)

    syncEnabled()
    media.addEventListener('change', syncEnabled)
    return () => media.removeEventListener('change', syncEnabled)
  }, [])

  if (!enabled) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          background: [
            'radial-gradient(ellipse 130% 65% at 10% 20%, rgba(42,139,255,0.13) 0%, transparent 50%)',
            'radial-gradient(ellipse 90% 55% at 88% 75%, rgba(56,217,169,0.09) 0%, transparent 50%)',
            'radial-gradient(ellipse 70% 45% at 50% 105%, rgba(139,92,246,0.07) 0%, transparent 50%)',
          ].join(', '),
        }}
      />
    )
  }

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
      {/* ── Dimming veil — keeps 3D visible but doesn't fight text ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'rgba(3,9,18,0.62)',
      }} />
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
        onCreated={({ gl }) => {
          /* Switch to CSS fallback if GPU kills the WebGL context.
             Without this, context loss propagates as a React removeChild error. */
          gl.domElement.addEventListener('webglcontextlost', () => {
            setEnabled(false)
          }, { once: true })
        }}
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
