import React from 'react'

export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.08} color="#060f1d" />
      {/* Main key light */}
      <pointLight position={[5, 5, 5]}    intensity={1.4}  color="#ffffff" />
      {/* Blue fill — left */}
      <pointLight position={[-7, 3, -3]}  intensity={0.90} color="#2a8bff" distance={26} />
      {/* Teal accent — bottom */}
      <pointLight position={[0, -7, 4]}   intensity={0.65} color="#38d9a9" distance={22} />
      {/* Purple rim — back */}
      <pointLight position={[2, 5, -12]}  intensity={0.40} color="#8b5cf6" distance={30} />
      {/* Warm side rim */}
      <pointLight position={[8, -2, 2]}   intensity={0.30} color="#52adff" distance={20} />
      {/* Subtle top bounce */}
      <hemisphereLight skyColor="#0d2060" groundColor="#020810" intensity={0.30} />
    </>
  )
}
