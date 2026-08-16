import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGPUTier } from '../hooks/useGPUTier'

/**
 * Full Particle + Fluid Emergent System for LuminaForge
 * ----------------------------------------------------
 * Calm luxury fluid-like particle flow driven by curl noise + soft attraction.
 * Adaptive density and quality based on GPU tier.
 * Emergent: self-organizing gentle streams that feel alive without ever becoming busy.
 * Designed for spatial immersion + negative space.
 *
 * Future: Gemini can inject force fields / attractors / color rules.
 */

// Simple 3D simplex-style noise (lightweight, no extra deps beyond maath if needed)
// We implement a compact hash + gradient noise for fluid curl.
function hash(n: number) {
  return Math.sin(n) * 43758.5453123 % 1
}

function noise3(x: number, y: number, z: number) {
  const X = Math.floor(x)
  const Y = Math.floor(y)
  const Z = Math.floor(z)
  const fx = x - X
  const fy = y - Y
  const fz = z - Z

  const u = fx * fx * (3 - 2 * fx)
  const v = fy * fy * (3 - 2 * fy)
  const w = fz * fz * (3 - 2 * fz)

  const n000 = hash(X + Y * 57 + Z * 113)
  const n100 = hash(X + 1 + Y * 57 + Z * 113)
  const n010 = hash(X + (Y + 1) * 57 + Z * 113)
  const n110 = hash(X + 1 + (Y + 1) * 57 + Z * 113)
  const n001 = hash(X + Y * 57 + (Z + 1) * 113)
  const n101 = hash(X + 1 + Y * 57 + (Z + 1) * 113)
  const n011 = hash(X + (Y + 1) * 57 + (Z + 1) * 113)
  const n111 = hash(X + 1 + (Y + 1) * 57 + (Z + 1) * 113)

  const nx00 = n000 * (1 - u) + n100 * u
  const nx10 = n010 * (1 - u) + n110 * u
  const nx01 = n001 * (1 - u) + n101 * u
  const nx11 = n011 * (1 - u) + n111 * u

  const nxy0 = nx00 * (1 - v) + nx10 * v
  const nxy1 = nx01 * (1 - v) + nx11 * v

  return nxy0 * (1 - w) + nxy1 * w
}

// Approximate curl of a noise field for incompressible fluid-like motion
function curlNoise(x: number, y: number, z: number, t: number, scale = 0.15) {
  const e = 0.01
  const n1 = noise3(x * scale, y * scale, z * scale + t * 0.08)
  const n2 = noise3(x * scale + 31.4, y * scale, z * scale + t * 0.08)
  const n3 = noise3(x * scale, y * scale + 47.2, z * scale + t * 0.08)

  // Finite difference curl
  const dx = (noise3((x + e) * scale, y * scale, z * scale + t * 0.08) - n1) / e
  const dy = (noise3(x * scale, (y + e) * scale, z * scale + t * 0.08) - n2) / e
  const dz = (noise3(x * scale, y * scale, (z + e) * scale + t * 0.08) - n3) / e

  // Curl components (simplified for nice flow)
  return new THREE.Vector3(
    dy - dz,
    dz - dx,
    dx - dy
  ).normalize()
}

interface Particle {
  pos: THREE.Vector3
  vel: THREE.Vector3
  life: number
  size: number
  phase: number
}

interface Props {
  /** Base particle count (scaled by GPU tier) */
  count?: number
  /** Soft attraction strength toward center (crystal) */
  attraction?: number
  /** Fluid noise strength */
  fluidStrength?: number
  /** Overall speed of emergent flow (keep low for calm) */
  flowSpeed?: number
  enabled?: boolean
  /** Color of the fluid particles */
  color?: string
  /** Soft secondary color for velocity tint */
  colorHot?: string
}

export default function FluidEmergentSystem({
  count = 800,
  attraction = 0.0008,
  fluidStrength = 0.012,
  flowSpeed = 0.35,
  enabled = true,
  color = '#d4af37',
  colorHot = '#f5e6c8'
}: Props) {
  const pointsRef = useRef<THREE.Points>(null)
  const { tier, isMobile } = useGPUTier()

  // Adaptive count – never busy, always elegant
  const adaptiveCount = useMemo(() => {
    if (!enabled) return 0
    if (isMobile || tier <= 1) return Math.min(180, Math.floor(count * 0.25))
    if (tier === 2) return Math.min(450, Math.floor(count * 0.6))
    return count
  }, [count, tier, isMobile, enabled])

  // Pre-allocate particles + geometry
  const { particles, geometry, material } = useMemo(() => {
    const parts: Particle[] = []
    const positions = new Float32Array(adaptiveCount * 3)
    const sizes = new Float32Array(adaptiveCount)
    const colors = new Float32Array(adaptiveCount * 3)
    const c = new THREE.Color(color)
    const cHot = new THREE.Color(colorHot)

    for (let i = 0; i < adaptiveCount; i++) {
      const r = 4 + Math.random() * 9
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = (Math.random() - 0.5) * 6
      const z = r * Math.sin(phi) * Math.sin(theta)

      parts.push({
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        life: Math.random(),
        size: 0.8 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2
      })

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      sizes[i] = parts[i].size
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Soft additive glowing particles – luxury look
    const mat = new THREE.PointsMaterial({
      size: 0.12,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: createSoftCircleTexture()
    })

    return { particles: parts, geometry: geo, material: mat }
  }, [adaptiveCount, color, colorHot])

  // Soft circle texture for elegant particles
  function createSoftCircleTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.25, 'rgba(255,255,255,0.6)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.15)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }

  // Cleanup
  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
      if (material.map) material.map.dispose()
    }
  }, [geometry, material])

  useFrame((state, delta) => {
    if (!pointsRef.current || !enabled || adaptiveCount === 0) return

    const t = state.clock.elapsedTime * flowSpeed
    const posAttr = geometry.attributes.position as THREE.BufferAttribute
    const sizeAttr = geometry.attributes.size as THREE.BufferAttribute
    const colorAttr = geometry.attributes.color as THREE.BufferAttribute
    const c = new THREE.Color(color)
    const cHot = new THREE.Color(colorHot)
    const center = new THREE.Vector3(0, 0, 0)

    for (let i = 0; i < adaptiveCount; i++) {
      const p = particles[i]

      // 1. Fluid curl force (emergent flow)
      const curl = curlNoise(p.pos.x, p.pos.y, p.pos.z, t, 0.12)
      p.vel.addScaledVector(curl, fluidStrength * delta * 60)

      // 2. Soft attraction toward crystal (emergent gathering without chaos)
      const toCenter = center.clone().sub(p.pos)
      const dist = toCenter.length()
      if (dist > 1.5) {
        p.vel.addScaledVector(toCenter.normalize(), attraction * (dist * 0.4) * delta * 60)
      } else {
        // Soft repulsion near center so particles orbit elegantly
        p.vel.addScaledVector(toCenter.normalize(), -attraction * 1.8 * delta * 60)
      }

      // 3. Damping for calm luxury feel
      p.vel.multiplyScalar(0.985)

      // 4. Integrate
      p.pos.addScaledVector(p.vel, delta * 60 * 0.016)

      // Soft boundary wrap / rebirth for endless emergent
      if (p.pos.length() > 16) {
        p.pos.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 8
        )
        p.vel.set(0, 0, 0)
      }

      // Write back
      posAttr.setXYZ(i, p.pos.x, p.pos.y, p.pos.z)

      // Size pulse – gentle breath
      const pulse = 0.85 + 0.25 * Math.sin(t * 1.5 + p.phase)
      sizeAttr.setX(i, p.size * pulse)

      // Velocity-based color tint (emergent heat)
      const speed = p.vel.length()
      const mix = Math.min(1, speed * 18)
      colorAttr.setXYZ(
        i,
        c.r * (1 - mix) + cHot.r * mix,
        c.g * (1 - mix) + cHot.g * mix,
        c.b * (1 - mix) + cHot.b * mix
      )
    }

    posAttr.needsUpdate = true
    sizeAttr.needsUpdate = true
    colorAttr.needsUpdate = true
  })

  if (!enabled || adaptiveCount === 0) return null

  return (
    <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
  )
}
