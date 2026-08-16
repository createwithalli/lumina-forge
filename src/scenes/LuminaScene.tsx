import { Environment, Float, MeshTransmissionMaterial, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import EmergentParticles from '../systems/EmergentParticles'

interface Props {
  tier: number
  isMobile: boolean
}

/**
 * Core immersive scene for LuminaForge.
 * Adaptive quality via GPU tier. Calm luxury crystal with soft emergent motion.
 * Vast negative space + soft volumetric light. Every prop audited for current drei/fiber.
 */
export default function LuminaScene({ tier, isMobile }: Props) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.04
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.08
    }
  })

  const highQuality = tier >= 2 && !isMobile

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 10, 28]} />

      <ambientLight intensity={0.12} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.1}
        color="#fff8e7"
        castShadow={highQuality}
      />
      <pointLight position={[-5, 3, -3]} intensity={0.7} color="#d4af37" distance={20} />
      <pointLight position={[4, -2, 4]} intensity={0.35} color="#e5e4e2" distance={15} />

      <Stars
        radius={90}
        depth={50}
        count={highQuality ? 2800 : 600}
        factor={2.8}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Soft emergent particles */}
      <EmergentParticles count={highQuality ? 350 : 120} enabled={true} />

      <group ref={group}>
        <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.35}>
          <mesh position={[0, 0, 0]} castShadow={highQuality}>
            <icosahedronGeometry args={[1.75, highQuality ? 1 : 0]} />
            <MeshTransmissionMaterial
              backside
              samples={highQuality ? 12 : 4}
              resolution={highQuality ? 512 : 256}
              thickness={1.1}
              chromaticAberration={0.06}
              anisotropy={0.25}
              distortion={0.15}
              distortionScale={0.35}
              temporalDistortion={0.08}
              iridescence={0.35}
              iridescenceIOR={1.15}
              iridescenceThicknessRange={[120, 480]}
              color="#f8f7f2"
              attenuationColor="#d4af37"
              attenuationDistance={1.8}
              roughness={0.05}
            />
          </mesh>
        </Float>

        {highQuality && (
          <>
            <Float speed={0.7} floatIntensity={0.5}>
              <mesh position={[-3.6, 1.3, -2.2]}>
                <octahedronGeometry args={[0.55, 0]} />
                <meshStandardMaterial
                  color="#e5e4e2"
                  metalness={0.92}
                  roughness={0.08}
                  envMapIntensity={1.2}
                />
              </mesh>
            </Float>
            <Float speed={1.3} floatIntensity={0.25}>
              <mesh position={[3.4, -0.9, -1.8]} rotation={[0.4, 0.2, 0]}>
                <torusGeometry args={[0.48, 0.11, 16, 64]} />
                <meshStandardMaterial
                  color="#d4af37"
                  metalness={1}
                  roughness={0.12}
                  envMapIntensity={1.5}
                />
              </mesh>
            </Float>
          </>
        )}
      </group>

      <Environment preset="city" environmentIntensity={0.35} />
    </>
  )
}
