import React, { useRef, useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Particles = memo(function Particles({ count = 900 }) {
  const pointsRef = useRef()
  const scrollRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const baseRotation = useRef(0)

  useMemo(() => {
    if (typeof window === 'undefined') return
    const onScroll = () => { scrollRef.current = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1) }
    const onMouse = (e) => { mouseRef.current.x = (e.clientX / window.innerWidth) - 0.5; mouseRef.current.y = (e.clientY / window.innerHeight) - 0.5 }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMouse, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse) }
  }, [])

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const c1 = new THREE.Color('#0056b3')
    const c2 = new THREE.Color('#50A6B4')
    const c3 = new THREE.Color('#94a3b8')
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14
      const t = Math.random()
      const c = t < 0.35 ? c1 : t < 0.55 ? c2 : c3
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    }
    return { positions: pos, colors: col }
  }, [count])

  useFrame(() => {
    if (!pointsRef.current) return
    const m = pointsRef.current
    baseRotation.current += 0.0003
    const targetX = mouseRef.current.y * 0.2
    const targetY = baseRotation.current + mouseRef.current.x * 0.2 + scrollRef.current * Math.PI * 0.3
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, targetX, 0.012)
    m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, targetY, 0.012)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.013} vertexColors transparent opacity={0.42} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
})

export default Particles
