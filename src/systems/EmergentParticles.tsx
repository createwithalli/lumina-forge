import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  count?: number
  enabled?: boolean
}

/**
 * Soft emergent particle system — calm floating dust / light motes.
 * GPU instanced, low impact. For true emergent flow expand with GPGPU or Gemini rules.
 */
export default function EmergentParticles({ count = 400, enabled = true }: Props) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() => {
    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 18,
        y: (Math.random() - 0.5) * 12,
        z: (Math.random() - 0.5) * 18,
        speed: 0.05 + Math.random() * 0.12,
        offset: Math.random() * Math.PI * 2
      })
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!mesh.current || !enabled) return
    const t = state.clock.elapsedTime
    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.offset) * 0.3,
        p.y + Math.cos(t * p.speed * 0.7 + p.offset) * 0.2,
        p.z
      )
      dummy.scale.setScalar(0.015 + Math.sin(t + p.offset) * 0.008)
      dummy.updateMatrix()
      mesh.current!.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  if (!enabled) return null

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#d4af37" transparent opacity={0.35} depthWrite={false} />
    </instancedMesh>
  )
}
