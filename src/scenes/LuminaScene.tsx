import { Environment, Float, MeshTransmissionMaterial, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import FluidEmergentSystem from '../systems/FluidEmergentSystem'

interface Props {
  tier: number
  isMobile: boolean
}

/**
 * Core immersive scene for LuminaForge.
 * Adaptive quality via GPU tier. Calm luxury crystal + full fluid emergent particle system.
 * Vast negative space + soft volumetric light + living fluid flow that never feels busy.
 */
export default function LuminaScene({ tier, isMobile }: Props) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.035
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.07
    }
  })

  const highQuality = tier >= 2 && !isMobile

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 11, 30]} />

      {/* Soft cinematic lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.05}
        color="#fff8e7"
        castShadow={highQuality}
      />
      <pointLight position={[-5, 3, -3]} intensity={0.65} color="#d4af37" distance={22} />
      <pointLight position={[4, -2, 4]} intensity={0.3} color="#e5e4e2" distance={16} />

      {/* Depth stars */}
      <Stars
        radius={95}
        depth={55}
        count={highQuality ? 2400 : 500}
        factor={2.6}
        saturation={0}
        fade
        speed={0.25}
      />

      {/* ========== FULL FLUID + PARTICLE EMERGENT SYSTEM ========== */}
      <FluidEmergentSystem
        count={highQuality ? 900 : 220}
        attraction={0.0007}
        fluidStrength={0.011}
        flowSpeed={0.32}
        enabled={true}
        color="#d4af37"
        colorHot="#f8f0d8"
      />

      <group ref={group}>
        {/* Primary luxury floating crystal */}
        <Float speed={1.0} rotationIntensity={0.12} floatIntensity={0.3}>
          <mesh position={[0, 0, 0]} castShadow={highQuality}>
            <icosahedronGeometry args={[1.7, highQuality ? 1 : 0]} />
            <MeshTransmissionMaterial
              backside
              samples={highQuality ? 10 : 4}
              resolution={highQuality ? 512 : 256}
              thickness={1.05}
              chromaticAberration={0.055}
              anisotropy={0.22}
              distortion={0.12}
              distortionScale={0.3}
              temporalDistortion={0.07}
              iridescence={0.32}
              iridescenceIOR={1.12}
              iridescenceThicknessRange={[100, 450]}
              color="#f8f7f2"
              attenuationColor="#d4af37"
              attenuationDistance={1.7}
              roughness={0.04}
            />
          </mesh>
        </Float>

        {/* Secondary floating accents (high tier only) */}
        {highQuality && (
          <>
            <Float speed={0.65} floatIntensity={0.45}>
              <mesh position={[-3.5, 1.25, -2.1]}>
                <octahedronGeometry args={[0.52, 0]} />
                <meshStandardMaterial
                  color="#e5e4e2"
                  metalness={0.93}
                  roughness={0.07}
                  envMapIntensity={1.15}
                />
              </mesh>
            </Float>
            <Float speed={1.2} floatIntensity={0.22}>
              <mesh position={[3.3, -0.85, -1.7]} rotation={[0.35, 0.15, 0]}>
                <torusGeometry args={[0.46, 0.1, 16, 48]} />
                <meshStandardMaterial
                  color="#d4af37"
                  metalness={1}
                  roughness={0.11}
                  envMapIntensity={1.4}
                />
              </mesh>
            </Float>
          </>
        )}
      </group>

      <Environment preset="city" environmentIntensity={0.32} />
    </>
  )
}
