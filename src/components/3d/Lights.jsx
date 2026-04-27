import React from 'react'

/* Light rig — toned way down so 3D doesn't wash out page text */
export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.04} />
      <pointLight position={[5, 5, 5]}    intensity={0.55} color="#ffffff" />
      <pointLight position={[-7, 3, -3]}  intensity={0.38} color="#2a8bff" distance={24} />
      <pointLight position={[0, -7, 4]}   intensity={0.28} color="#38d9a9" distance={20} />
      <pointLight position={[2, 5, -12]}  intensity={0.18} color="#8b5cf6" distance={28} />
      <pointLight position={[8, -2, 2]}   intensity={0.14} color="#52adff" distance={18} />
      <hemisphereLight skyColor="#0a1628" groundColor="#020810" intensity={0.12} />
    </>
  )
}
