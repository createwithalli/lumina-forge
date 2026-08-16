import { Environment, Float, MeshTransmissionMaterial, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

interface Props {
  tier: number
  isMobile: boolean
}

export default function LuminaScene({ tier, isMobile }: Props) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.05
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 8, 25]} />

      {/* Soft volumetric lighting */}
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#fff8e7" castShadow={tier >= 2} />
      <pointLight position={[-4, 2, -4]} intensity={0.8} color="#d4af37" />
      <pointLight position={[4, -1, 3]} intensity={0.4} color="#e5e4e2" />

      {/* Stars for depth — reduced on low tier */}
      <Stars radius={80} depth={40} count={tier >= 2 ? 3000 : 800} factor={3} saturation={0} fade speed={0.4} />

      <group ref={group}>
        {/* Luxury floating crystal architecture */}
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
          <mesh position={[0, 0, 0]} castShadow>
            <icosahedronGeometry args={[1.8, 1]} />
            <MeshTransmissionMaterial
              backside
              samples={tier >= 2 ? 16 : 6}
              thickness={1.2}
              chromaticAberration={0.08}
              anisotropy={0.3}
              distortion={0.2}
              distortionScale={0.4}
              temporalDistortion={0.1}
              iridescence={0.4}
              iridescenceIOR={1.2}
              iridescenceThicknessRange={[100, 600]}
              color="#f5f5f0"
              attenuationColor="#d4af37"
              attenuationDistance={2}
            />
          </mesh>
        </Float>

        {/* Secondary floating elements for spatial luxury */}
        {!isMobile && (
          <>
            <Float speed={0.8} floatIntensity={0.6}>
              <mesh position={[-3.5, 1.2, -2]}>
                <octahedronGeometry args={[0.6, 0]} />
                <meshStandardMaterial color="#e5e4e2" metalness={0.9} roughness={0.1} />
              </mesh>
            </Float>
            <Float speed={1.5} floatIntensity={0.3}>
              <mesh position={[3.2, -0.8, -1.5]}>
                <torusGeometry args={[0.5, 0.12, 16, 48]} />
                <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.15} />
              </mesh>
            </Float>
          </>
        )}
      </group>

      {/* Environment for luxury reflections */}
      <Environment preset="city" environmentIntensity={0.4} />
    </>
  )
}
