import React, { useRef, useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Particles = memo(function Particles({ count = 600 }) {
  const pointsRef  = useRef()
  const ring1Ref   = useRef()
  const ring2Ref   = useRef()
  const scrollRef  = useRef(0)
  const mouseRef   = useRef({ x: 0, y: 0 })
  const baseRot    = useRef(0)
  const lastT      = useRef(0)

  useMemo(() => {
    if (typeof window === 'undefined') return
    const onScroll = () => {
      scrollRef.current = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1)
    }
    const onMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) - 0.5
      mouseRef.current.y = (e.clientY / window.innerHeight) - 0.5
    }
    window.addEventListener('scroll',    onScroll, { passive: true })
    window.addEventListener('mousemove', onMouse,  { passive: true })
    return () => {
      window.removeEventListener('scroll',    onScroll)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  /* ── Galaxy-style distribution with 2 spiral arms ── */
  const { positions, colors, sizes } = useMemo(() => {
    const pos  = new Float32Array(count * 3)
    const col  = new Float32Array(count * 3)
    const siz  = new Float32Array(count)

    const palette = [
      new THREE.Color('#2a8bff'),
      new THREE.Color('#52adff'),
      new THREE.Color('#38d9a9'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#94a3b8'),
    ]

    for (let i = 0; i < count; i++) {
      /* spiral arm distribution */
      const arm    = Math.floor(Math.random() * 2)
      const r      = Math.pow(Math.random(), 0.6) * 14 + 1.8
      const theta  = arm * Math.PI + r * 0.42 + (Math.random() - 0.5) * 1.2

      pos[i * 3]     = Math.cos(theta) * r + (Math.random() - 0.5) * 2.2
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = Math.sin(theta) * r + (Math.random() - 0.5) * 2.2

      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3]     = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b

      siz[i] = Math.random() * 0.016 + 0.004
    }

    return { positions: pos, colors: col, sizes: siz }
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime
    if (t - lastT.current < 0.033) return
    lastT.current = t
    const m = pointsRef.current
    baseRot.current += 0.00018
    const tx = mouseRef.current.y * 0.18
    const ty = baseRot.current + mouseRef.current.x * 0.18 + scrollRef.current * Math.PI * 0.28
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, tx, 0.01)
    m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, ty, 0.01)

    /* Subtle depth drift on scroll */
    m.position.z = THREE.MathUtils.lerp(m.position.z, scrollRef.current * -1.5, 0.04)

    if (ring1Ref.current) ring1Ref.current.rotation.z += 0.0006
    if (ring2Ref.current) ring2Ref.current.rotation.z -= 0.0004
  })

  return (
    <>
      {/* Main particle field */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.016}
          vertexColors
          transparent
          opacity={0.50}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Two large sweeping rings in the particle field */}
      <mesh ref={ring1Ref} rotation={[Math.PI * 0.12, 0.4, 0]}>
        <torusGeometry args={[7.5, 0.018, 6, 64]} />
        <meshBasicMaterial
          color="#2a8bff" transparent opacity={0.10}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI * 0.08, -0.3, 0.5]}>
        <torusGeometry args={[11.0, 0.012, 6, 64]} />
        <meshBasicMaterial
          color="#38d9a9" transparent opacity={0.07}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>
    </>
  )
})

export default Particles
