import React, { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─── GLSL: Energy Core shader ─── */
const CORE_VERT = `
  uniform float uTime;
  varying vec3 vNormal;
  varying float vNoise;

  float hash(vec3 p) {
    p = fract(p * vec3(127.1, 311.7, 74.7));
    p += dot(p, p.yxz + 19.19);
    return fract((p.x + p.y) * p.z);
  }
  float noise(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x), mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;
    float n = noise(pos * 1.6 + uTime * 0.07);
    pos += normal * (n - 0.5) * 0.28;
    vNoise = n;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`
const CORE_FRAG = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vNormal;
  varying float vNoise;

  void main() {
    vec3 view = vec3(0.0, 0.0, 1.0);
    float rim  = pow(1.0 - abs(dot(vNormal, view)), 3.5);
    float band = sin(vNoise * 10.0 + uTime * 1.1) * 0.05 + 0.05;
    vec3 color = uColor + vec3(0.0, band * 0.5, band * 1.2);
    float alpha = rim * 0.85 + band;
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.92));
  }
`

const ATMOS_VERT = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const ATMOS_FRAG = `
  varying vec3 vNormal;
  uniform vec3 glowColor;
  void main() {
    float rim = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0) * 2.4;
    gl_FragColor = vec4(glowColor, clamp(rim, 0.0, 0.88));
  }
`

/* ─── Scroll progress hook ─── */
function useScrollProgress(ref) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const h = () => {
      const max = document.body.scrollHeight - window.innerHeight || 1
      ref.current = window.scrollY / max
    }
    h()
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [ref])
}

/* ─── Enhanced Energy Core ─── */
function EnergyCore() {
  const groupRef = useRef()
  const innerRef = useRef()
  const wire1Ref = useRef()
  const wire2Ref = useRef()
  const glowRef  = useRef()

  const coreUniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uColor: { value: new THREE.Color('#0a4d80') },
  }), [])
  const atmosUniforms = useMemo(() => ({
    glowColor: { value: new THREE.Color('#38d9a9') },
  }), [])

  const mainGeo = useMemo(() => new THREE.SphereGeometry(1.1, 48, 48), [])
  const icoGeo  = useMemo(() => new THREE.IcosahedronGeometry(1.35, 1), [])
  const octGeo  = useMemo(() => new THREE.OctahedronGeometry(1.55, 1), [])
  const glowGeo = useMemo(() => new THREE.SphereGeometry(1.75, 16, 16), [])

  useFrame((s) => {
    const t = s.clock.elapsedTime
    coreUniforms.uTime.value = t
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.22
      groupRef.current.rotation.x = t * 0.11
    }
    if (wire1Ref.current) {
      wire1Ref.current.rotation.z += 0.008
      wire1Ref.current.rotation.x += 0.005
    }
    if (wire2Ref.current) {
      wire2Ref.current.rotation.y -= 0.006
      wire2Ref.current.rotation.z -= 0.004
    }
    if (innerRef.current) {
      const pulse = 1 + Math.sin(t * 1.4) * 0.09
      innerRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={groupRef} position={[2.2, 0.4, -2.4]}>
      <mesh ref={innerRef} geometry={mainGeo}>
        <shaderMaterial
          uniforms={coreUniforms}
          vertexShader={CORE_VERT}
          fragmentShader={CORE_FRAG}
          transparent depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={wire1Ref} geometry={icoGeo}>
        <meshBasicMaterial color="#52adff" wireframe transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={wire2Ref} geometry={octGeo}>
        <meshBasicMaterial color="#38d9a9" wireframe transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={glowRef} geometry={glowGeo}>
        <shaderMaterial
          uniforms={atmosUniforms}
          vertexShader={ATMOS_VERT}
          fragmentShader={ATMOS_FRAG}
          transparent side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

/* ─── DNA Helix ─── */
function DNAHelix({ count = 100 }) {
  const groupRef = useRef()

  const { posA, posB, crossPos, crossCount } = useMemo(() => {
    const pA = new Float32Array(count * 3)
    const pB = new Float32Array(count * 3)
    const crossN = Math.floor(count / 5)
    const pC = new Float32Array(crossN * 6)
    let ci = 0

    for (let i = 0; i < count; i++) {
      const t     = i / count
      const angle = t * Math.PI * 6   // 3 full helical turns
      const y     = (t - 0.5) * 10

      pA[i * 3]     = Math.cos(angle) * 0.75
      pA[i * 3 + 1] = y
      pA[i * 3 + 2] = Math.sin(angle) * 0.75

      pB[i * 3]     = Math.cos(angle + Math.PI) * 0.75
      pB[i * 3 + 1] = y
      pB[i * 3 + 2] = Math.sin(angle + Math.PI) * 0.75

      if (i % 5 === 0 && ci < crossN) {
        pC[ci * 6]     = Math.cos(angle) * 0.75
        pC[ci * 6 + 1] = y
        pC[ci * 6 + 2] = Math.sin(angle) * 0.75
        pC[ci * 6 + 3] = Math.cos(angle + Math.PI) * 0.75
        pC[ci * 6 + 4] = y
        pC[ci * 6 + 5] = Math.sin(angle + Math.PI) * 0.75
        ci++
      }
    }

    return { posA: pA, posB: pB, crossPos: pC, crossCount: crossN }
  }, [count])

  useFrame((s) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = s.clock.elapsedTime * 0.14
    }
  })

  return (
    <group ref={groupRef} position={[-5.2, 0.0, -3.5]}>
      {/* Strand A — blue */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={posA} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#2a8bff" transparent opacity={0.65} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      {/* Strand B — teal */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={posB} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#38d9a9" transparent opacity={0.65} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      {/* Cross-link rungs */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={crossCount * 2} array={crossPos} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#8b5cf6" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}

/* ─── Enhanced Orbit Rings ─── */
function OrbitRings() {
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const ring3Ref = useRef()
  const ring4Ref = useRef()

  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.09
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.07
    if (ring3Ref.current) { ring3Ref.current.rotation.z = -t * 0.05; ring3Ref.current.rotation.x = t * 0.03 }
    if (ring4Ref.current) { ring4Ref.current.rotation.y = t * 0.04; ring4Ref.current.rotation.z = t * 0.025 }
  })

  return (
    <group>
      <mesh ref={ring1Ref} rotation={[0.9, 0.2, 0]}>
        <torusGeometry args={[6.2, 0.022, 10, 80]} />
        <meshBasicMaterial color="#2a8bff" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[1.25, -0.4, 0.5]}>
        <torusGeometry args={[9.0, 0.016, 10, 90]} />
        <meshBasicMaterial color="#38d9a9" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[0.5, 0.8, -0.3]}>
        <torusGeometry args={[7.4, 0.012, 10, 80]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.10} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring4Ref} rotation={[1.6, 0.2, 0.7]}>
        <torusGeometry args={[11.0, 0.009, 8, 80]} />
        <meshBasicMaterial color="#52adff" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

/* ─── Enhanced Star Cluster ─── */
function StarCluster({ count = 400 }) {
  const ref = useRef()
  const scrollRef = useRef(0)
  useScrollProgress(scrollRef)

  const { positions, colors, sizes } = useMemo(() => {
    const pos  = new Float32Array(count * 3)
    const col  = new Float32Array(count * 3)
    const palette = [
      new THREE.Color('#52adff'),
      new THREE.Color('#2a8bff'),
      new THREE.Color('#38d9a9'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#8b5cf6'),
    ]

    for (let i = 0; i < count; i++) {
      const r     = 4 + Math.pow(Math.random(), 0.65) * 14
      const angle = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)

      pos[i * 3]     = r * Math.sin(phi) * Math.cos(angle)
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.5 + (Math.random() - 0.5) * 4
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(angle)

      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3]     = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    return { positions: pos, colors: col }
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.009 + scrollRef.current * 0.65
    ref.current.rotation.x = -0.22 + Math.sin(t * 0.14) * 0.04
    ref.current.position.y = Math.sin(t * 0.1) * 0.22 - scrollRef.current * 0.5
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.055}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/* ─── Nebula Clouds ─── */
function NebulaSphere({ position, color, scale = 1.5, opacity = 0.03, speed = 0.06 }) {
  const ref = useRef()
  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime
    ref.current.rotation.y = t * speed
    ref.current.rotation.z = t * speed * 0.6
    ref.current.position.y = position[1] + Math.sin(t * speed * 1.8) * 0.22
  })
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  )
}

/* ─── Floating Data Points ─── */
function DataGrid({ count = 48 }) {
  const ref = useRef()
  const { positions } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const col = i % 8
      const row = Math.floor(i / 8)
      pos[i * 3]     = (col - 3.5) * 1.2 + (Math.random() - 0.5) * 0.4
      pos[i * 3 + 1] = (row - 3.0) * 1.2 + (Math.random() - 0.5) * 0.4
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5
    }
    return { positions: pos }
  }, [count])

  useFrame((s) => {
    if (!ref.current) return
    const t = s.clock.elapsedTime
    ref.current.rotation.z = Math.sin(t * 0.08) * 0.08
    ref.current.rotation.y = t * 0.018
    ref.current.position.x = Math.sin(t * 0.12) * 0.3
  })

  return (
    <points ref={ref} position={[5.5, 0.5, -5]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#52adff" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  )
}

/* ─── Main Export ─── */
export default function AboutBackground() {
  const groupRef = useRef()
  const mouseRef = useRef({ x: 0, y: 0 })
  const scrollRef = useRef(0)

  useScrollProgress(scrollRef)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const h = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) - 0.5
      mouseRef.current.y = (e.clientY / window.innerHeight) - 0.5
    }
    window.addEventListener('mousemove', h, { passive: true })
    return () => window.removeEventListener('mousemove', h)
  }, [])

  useFrame((state) => {
    if (!groupRef.current) return
    const t     = state.clock.elapsedTime
    const mouse = mouseRef.current
    const scroll = scrollRef.current

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouse.x * 0.14 + scroll * 0.22, 0.03)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouse.y * 0.09 - 0.08, 0.03)
    groupRef.current.position.y = Math.sin(t * 0.22) * 0.16 - scroll * 0.55
  })

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.10} />
      <pointLight position={[4, 4, 5]}   intensity={0.9} color="#52adff" />
      <pointLight position={[-6, -2, 4]} intensity={0.7} color="#38d9a9" />
      <pointLight position={[0, 5, -6]}  intensity={0.4} color="#ffffff" />
      <pointLight position={[3, -4, 2]}  intensity={0.3} color="#8b5cf6" />

      <EnergyCore />
      <DNAHelix count={100} />
      <OrbitRings />
      <StarCluster count={400} />
      <DataGrid count={48} />

      <NebulaSphere position={[-4.5, 0.8,  -7]}  color="#2a8bff" scale={3.4}  opacity={0.026} speed={0.038} />
      <NebulaSphere position={[5.2,  -1.5, -8]}  color="#38d9a9" scale={2.8}  opacity={0.022} speed={0.052} />
      <NebulaSphere position={[0.4,  2.4,  -9]}  color="#8b5cf6" scale={4.0}  opacity={0.018} speed={0.032} />
      <NebulaSphere position={[-1.8, -2.0, -6]}  color="#52adff" scale={2.2}  opacity={0.020} speed={0.045} />
    </group>
  )
}
