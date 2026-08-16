import { Environment, Float, MeshTransmissionMaterial, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import FluidEmergentSystem from '../systems/FluidEmergentSystem'
import GPGPUFluidSystem from '../systems/GPGPUFluidSystem'

interface Props {
  tier: number
  isMobile: boolean
}

/**
 * LuminaScene — calm luxury crystal + adaptive fluid emergent systems.
 * - High-end (tier >= 3): GPGPU 65k+ particle fluid (compute-style FBO)
 * - Mid / low: dual-layer CPU fluid with mouse + Gemini forces
 */
export default function LuminaScene({ tier, isMobile }: Props) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.032
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.06
    }
  })

  const highQuality = tier >= 2 && !isMobile
  const ultra = tier >= 3 && !isMobile

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 12, 32]} />

      <ambientLight intensity={0.09} />
      <directionalLight position={[6, 10, 4]} intensity={1.0} color="#fff8e7" castShadow={highQuality} />
      <pointLight position={[-5, 3, -3]} intensity={0.6} color="#d4af37" distance={24} />
      <pointLight position={[4, -2, 4]} intensity={0.28} color="#e5e4e2" distance={18} />

      <Stars radius={100} depth={60} count={highQuality ? 2200 : 450} factor={2.5} saturation={0} fade speed={0.22} />

      {/* Adaptive fluid systems */}
      {ultra ? (
        <GPGPUFluidSystem
          size={256}
          fluidStrength={0.0105}
          attraction={0.00065}
          mouseStrength={0.02}
          enabled={true}
        />
      ) : (
        <FluidEmergentSystem
          count={highQuality ? 1200 : 240}
          fineCount={highQuality ? 700 : 0}
          attraction={0.0006}
          fluidStrength={0.01}
          flowSpeed={0.28}
          mouseStrength={0.02}
          enabled={true}
          color="#d4af37"
          colorHot="#f8f0d8"
          fineColor="#e8d5a3"
        />
      )}

      <group ref={group}>
        <Float speed={0.95} rotationIntensity={0.1} floatIntensity={0.28}>
          <mesh position={[0, 0, 0]} castShadow={highQuality}>
            <icosahedronGeometry args={[1.65, highQuality ? 1 : 0]} />
            <MeshTransmissionMaterial
              backside
              samples={highQuality ? 10 : 4}
              resolution={highQuality ? 512 : 256}
              thickness={1.0}
              chromaticAberration={0.05}
              anisotropy={0.2}
              distortion={0.1}
              distortionScale={0.28}
              temporalDistortion={0.06}
              iridescence={0.3}
              iridescenceIOR={1.1}
              iridescenceThicknessRange={[90, 420]}
              color="#f8f7f2"
              attenuationColor="#d4af37"
              attenuationDistance={1.6}
              roughness={0.04}
            />
          </mesh>
        </Float>

        {highQuality && (
          <>
            <Float speed={0.6} floatIntensity={0.4}>
              <mesh position={[-3.4, 1.2, -2.0]}>
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color="#e5e4e2" metalness={0.94} roughness={0.06} envMapIntensity={1.1} />
              </mesh>
            </Float>
            <Float speed={1.15} floatIntensity={0.2}>
              <mesh position={[3.2, -0.8, -1.6]} rotation={[0.3, 0.1, 0]}>
                <torusGeometry args={[0.44, 0.095, 16, 48]} />
                <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.1} envMapIntensity={1.35} />
              </mesh>
            </Float>
          </>
        )}
      </group>

      <Environment preset="city" environmentIntensity={0.3} />
    </>
  )
}
