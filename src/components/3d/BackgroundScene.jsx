import React, { useRef, useMemo, useEffect, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as THREE from 'three'

/* ─────────────────────────────────────────
   GLSL — Displaced orb vertex shader
   Uses quintic smooth 3D value noise (fbm)
   to warp the sphere surface over time.
───────────────────────────────────────── */
const ORB_VERT = `
  uniform float uTime;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  varying float vNoise;

  float hash3(vec3 p) {
    p = fract(p * vec3(127.1, 311.7, 74.7));
    p += dot(p, p.yxz + 19.19);
    return fract((p.x + p.y) * p.z);
  }

  float smoothNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(
      mix(mix(hash3(i+vec3(0,0,0)), hash3(i+vec3(1,0,0)), f.x),
          mix(hash3(i+vec3(0,1,0)), hash3(i+vec3(1,1,0)), f.x), f.y),
      mix(mix(hash3(i+vec3(0,0,1)), hash3(i+vec3(1,0,1)), f.x),
          mix(hash3(i+vec3(0,1,1)), hash3(i+vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * smoothNoise(p);
      p *= 2.2; a *= 0.5;
    }
    return v;
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

    vec3 pos = position;
    float n = fbm(pos * 0.75 + vec3(uTime * 0.055, uTime * 0.04, uTime * 0.048));
    float disp = (n - 0.48) * uStrength;
    vNoise = n;
    pos += normal * disp;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`

const ORB_FRAG = `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  varying float vNoise;

  void main() {
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel rim
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.8);

    // Key light diffuse
    vec3 keyLight = normalize(vec3(1.4, 1.0, 1.8));
    float diffuse  = max(dot(vNormal, keyLight), 0.0) * 0.35;

    // Fill light
    vec3 fillLight = normalize(vec3(-1.0, 0.5, -0.5));
    float fill = max(dot(vNormal, fillLight), 0.0) * 0.12;

    // Color bands from noise
    float t = vNoise + sin(uTime * 0.35) * 0.12;
    float band = sin(vNoise * 14.0 + uTime * 0.9) * 0.04 + 0.04;

    vec3 color = mix(uColorA, uColorB, t);
    color = mix(color, uColorC, band * 2.0);
    color += vec3(band * 0.08, band * 0.25, band * 0.6);
    color += diffuse * vec3(0.6, 0.8, 1.0) + fill * vec3(0.3, 1.0, 0.7);

    float alpha = fresnel * 0.88 + diffuse * 0.28 + fill * 0.1;
    alpha = clamp(alpha, 0.0, 0.94);

    gl_FragColor = vec4(color, alpha);
  }
`

/* ─────────────────────────────────────────
   GLSL — Atmosphere glow (BackSide sphere)
───────────────────────────────────────── */
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
  uniform float uIntensity;
  void main() {
    float rim = pow(0.58 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.2) * uIntensity;
    gl_FragColor = vec4(glowColor, clamp(rim, 0.0, 0.9));
  }
`


// MAIN GLowing ORB

const GlowingOrb = memo(function GlowingOrb() {
  const meshRef  = useRef()
  const wire1Ref = useRef()
  const wire2Ref = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const ring3Ref = useRef()
  const ring4Ref = useRef()
  const innerRef = useRef()

  const orbUniforms = useMemo(() => ({
    uTime:     { value: 0 },
    uStrength: { value: 0.42 },
    uColorA:   { value: new THREE.Color('#041a4d') },
    uColorB:   { value: new THREE.Color('#0a4d6e') },
    uColorC:   { value: new THREE.Color('#38d9a9') },
  }), [])

  const atmosUniforms = useMemo(() => ({
    glowColor:  { value: new THREE.Color('#2a8bff') },
    uIntensity: { value: 2.1 },
  }), [])

  const mainGeo  = useMemo(() => new THREE.SphereGeometry(2.0, 80, 80), [])
  const wire1Geo = useMemo(() => new THREE.IcosahedronGeometry(2.25, 2), [])
  const wire2Geo = useMemo(() => new THREE.OctahedronGeometry(2.5, 2), [])
  const glowGeo  = useMemo(() => new THREE.SphereGeometry(2.75, 24, 24), [])
  const innerGeo = useMemo(() => new THREE.SphereGeometry(1.5,  16, 16), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    orbUniforms.uTime.value = t

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.05
      meshRef.current.rotation.x = t * 0.025
      const breathe = 1 + Math.sin(t * 0.65) * 0.025
      meshRef.current.scale.setScalar(breathe)
    }
    if (wire1Ref.current) {
      wire1Ref.current.rotation.z += 0.0008
      wire1Ref.current.rotation.x += 0.0003
    }
    if (wire2Ref.current) {
      wire2Ref.current.rotation.y -= 0.0006
      wire2Ref.current.rotation.z -= 0.0004
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.12
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.08
    if (ring3Ref.current) {
      ring3Ref.current.rotation.y = t * 0.06
      ring3Ref.current.rotation.z = -t * 0.04
    }
    if (ring4Ref.current) {
      ring4Ref.current.rotation.z = -t * 0.05
      ring4Ref.current.rotation.x = t * 0.035
    }
    if (innerRef.current) {
      const pulse = 1 + Math.sin(t * 1.2) * 0.08
      innerRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group>
      {/* Displaced orb */}
      <mesh ref={meshRef} geometry={mainGeo}>
        <shaderMaterial
          uniforms={orbUniforms}
          vertexShader={ORB_VERT}
          fragmentShader={ORB_FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Wireframe shells */}
      <mesh ref={wire1Ref} geometry={wire1Geo}>
        <meshBasicMaterial color="#52adff" wireframe transparent opacity={0.055} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={wire2Ref} geometry={wire2Geo}>
        <meshBasicMaterial color="#38d9a9" wireframe transparent opacity={0.035} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Atmosphere glow */}
      <mesh geometry={glowGeo}>
        <shaderMaterial
          uniforms={atmosUniforms}
          vertexShader={ATMOS_VERT}
          fragmentShader={ATMOS_FRAG}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner energy pulse */}
      <mesh ref={innerRef} geometry={innerGeo}>
        <meshBasicMaterial color="#38d9a9" transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Orbital rings — 4 at different angles */}
      <mesh ref={ring1Ref} rotation={[Math.PI * 0.5, 0, 0]}>
        <torusGeometry args={[2.92, 0.013, 8, 96]} />
        <meshBasicMaterial color="#52adff" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[0.55, 0.28, 0]}>
        <torusGeometry args={[3.35, 0.009, 8, 96]} />
        <meshBasicMaterial color="#38d9a9" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI * 0.15, 0.5, 0.3]}>
        <torusGeometry args={[3.75, 0.007, 8, 96]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring4Ref} rotation={[1.1, -0.3, 0.6]}>
        <torusGeometry args={[4.1, 0.005, 8, 80]} />
        <meshBasicMaterial color="#2a8bff" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
})

/* ─────────────────────────────────────────
   SPIRAL GALAXY PARTICLE FIELD
   3 spiral arms, ~1200 points
───────────────────────────────────────── */
const GalaxyDust = memo(function GalaxyDust({ count = 1200 }) {
  const ref = useRef()

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const palette = [
      new THREE.Color('#2a8bff'),
      new THREE.Color('#52adff'),
      new THREE.Color('#38d9a9'),
      new THREE.Color('#20c997'),
      new THREE.Color('#ffffff'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#a78bfa'),
    ]

    for (let i = 0; i < count; i++) {
      const arm    = Math.floor(Math.random() * 3)
      const r      = Math.pow(Math.random(), 0.55) * 9 + 1.5
      const theta  = arm * (Math.PI * 2 / 3) + r * 0.45 + (Math.random() - 0.5) * 0.9

      pos[i * 3]     = Math.cos(theta) * r + (Math.random() - 0.5) * 1.8
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3.0
      pos[i * 3 + 2] = Math.sin(theta) * r + (Math.random() - 0.5) * 1.8

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
    ref.current.rotation.y = t * 0.007
    ref.current.rotation.x = -0.18 + Math.sin(t * 0.12) * 0.03
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.62}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
})

/* ─────────────────────────────────────────
   SATELLITE CRYSTALS (orbiting the orb)
───────────────────────────────────────── */
const SatelliteCrystals = memo(function SatelliteCrystals() {
  const groupRef = useRef()
  const crystals = useMemo(() => [
    { orbit: 3.8, speed: 0.22, phase: 0,                tiltX: 0.4,  tiltZ: 0.1,  color: '#52adff', size: 0.18 },
    { orbit: 4.6, speed: 0.15, phase: Math.PI * 0.66,   tiltX: -0.3, tiltZ: 0.4,  color: '#38d9a9', size: 0.14 },
    { orbit: 5.1, speed: 0.10, phase: Math.PI * 1.32,   tiltX: 0.6,  tiltZ: -0.2, color: '#8b5cf6', size: 0.12 },
    { orbit: 3.4, speed: 0.28, phase: Math.PI * 0.33,   tiltX: -0.5, tiltZ: 0.3,  color: '#2a8bff', size: 0.10 },
  ], [])

  const refs = useRef(crystals.map(() => React.createRef()))

  useFrame((state) => {
    const t = state.clock.elapsedTime
    crystals.forEach((c, i) => {
      const mesh = refs.current[i]?.current
      if (!mesh) return
      const angle = t * c.speed + c.phase
      mesh.position.x = Math.cos(angle) * c.orbit
      mesh.position.y = Math.sin(angle * 0.7 + c.phase) * 0.8
      mesh.position.z = Math.sin(angle) * c.orbit * Math.cos(c.tiltX)
      mesh.rotation.x += 0.012
      mesh.rotation.y += 0.018
    })
  })

  return (
    <group ref={groupRef}>
      {crystals.map((c, i) => (
        <mesh key={i} ref={refs.current[i]}>
          <octahedronGeometry args={[c.size, 0]} />
          <meshBasicMaterial
            color={c.color}
            wireframe
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
})

/* ─────────────────────────────────────────
   MAIN SCENE
───────────────────────────────────────── */
const BackgroundScene = memo(function BackgroundScene() {
  const orbitRef   = useRef()
  const sceneRef   = useRef()
  const mouseRef   = useRef({ x: 0, y: 0 })
  const velRef     = useRef({ x: 0, y: 0 })
  const prevMouse  = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const h = (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5
      const y = (e.clientY / window.innerHeight) - 0.5
      velRef.current.x   = x - prevMouse.current.x
      velRef.current.y   = y - prevMouse.current.y
      prevMouse.current  = { x, y }
      mouseRef.current   = { x, y }
    }
    window.addEventListener('mousemove', h, { passive: true })
    return () => window.removeEventListener('mousemove', h)
  }, [])

  useEffect(() => {
    if (!orbitRef.current) return
    const orb = orbitRef.current
    gsap.set(orb.position, { x: 3.2, y: 0.6, z: -1.2 })

    const posTl = gsap.timeline({
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 5 },
    })
    posTl
      .to(orb.position, { x: -2.4, y: 1.8,  z: 0.5,  duration: 25 })
      .to(orb.position, { x: -1.2, y: 0,    z: 2.0,  duration: 20 })
      .to(orb.position, { x: 3.8,  y: -1.2, z: -2.2, duration: 25 })
      .to(orb.position, { x: 1.2,  y: 0.2,  z: -1.0, duration: 30 })

    const scaleTl = gsap.timeline({
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 5 },
    })
    scaleTl
      .to(orb.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 25 })
      .to(orb.scale, { x: 1.22, y: 1.22, z: 1.22, duration: 20 })
      .to(orb.scale, { x: 0.72, y: 0.72, z: 0.72, duration: 25 })
      .to(orb.scale, { x: 0.88, y: 0.88, z: 0.88, duration: 30 })

    gsap.to(orb.rotation, {
      y: Math.PI * 2, x: Math.PI * 0.7, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 6 },
    })

    return () => ScrollTrigger.getAll().forEach((st) => {
      if (st.vars?.trigger === document.body) st.kill()
    })
  }, [])

  useFrame(() => {
    if (!sceneRef.current) return
    const { x, y } = mouseRef.current
    const v = velRef.current
    sceneRef.current.rotation.y = THREE.MathUtils.lerp(sceneRef.current.rotation.y, x * 0.08 + v.x * 0.4, 0.02)
    sceneRef.current.rotation.x = THREE.MathUtils.lerp(sceneRef.current.rotation.x, -y * 0.05 - v.y * 0.3, 0.02)
    velRef.current.x *= 0.88
    velRef.current.y *= 0.88
  })

  return (
    <>
      <group ref={sceneRef}>
        <group ref={orbitRef}>
          <GlowingOrb />
          <SatelliteCrystals />
        </group>
      </group>
      <GalaxyDust count={1200} />
    </>
  )
})

export default BackgroundScene
