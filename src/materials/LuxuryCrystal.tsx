import { MeshTransmissionMaterial } from '@react-three/drei'

/**
 * Reusable luxury crystal material preset for LuminaForge.
 */
export function LuxuryCrystalMaterial(props: any) {
  return (
    <MeshTransmissionMaterial
      backside
      samples={12}
      resolution={512}
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
      {...props}
    />
  )
}
