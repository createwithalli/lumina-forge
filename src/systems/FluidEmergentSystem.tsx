import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGPUTier } from '../hooks/useGPUTier'
import { useLuminaStore } from '../store/useLuminaStore'

/**
 * FULL Particle + Fluid Emergent System (v2)
 * ------------------------------------------
 * - Curl-noise fluid flow (emergent living streams)
 * - Soft attraction / orbit around crystal
 * - Real-time mouse force field (attract / gentle push)
 * - Gemini / store force fields (vortex, attract, repel)
 * - Dual layer: main fluid + fine secondary particles
 * - Adaptive GPU count + quality (never busy)
 * - Velocity color, soft glow, size breathing
 * - Calm luxury spatial aesthetic
 */

function hash(n: number) {
  return (Math.sin(n) * 43758.5453123) % 1
}

function noise3(x: number, y: number, z: number) {
  const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z)
  const fx = x - X, fy = y - Y, fz = z - Z
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

function curlNoise(x: number, y: number, z: number, t: number, scale = 0.13) {
  const e = 0.012
  const n1 = noise3(x * scale, y * scale, z * scale + t * 0.07)
  const n2 = noise3(x * scale + 31.4, y * scale, z * scale + t * 0.07)
  const n3 = noise3(x * scale, y * scale + 47.2, z * scale + t * 0.07)
  const dx = (noise3((x + e) * scale, y * scale, z * scale + t * 0.07) - n1) / e
  const dy = (noise3(x * scale, (y + e) * scale, z * scale + t * 0.07) - n2) / e
  const dz = (noise3(x * scale, y * scale, (z + e) * scale + t * 0.07) - n3) / e
  return new THREE.Vector3(dy - dz, dz - dx, dx - dy).normalize()
}

function createSoftTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.2, 'rgba(255,255,255,0.7)')
  g.addColorStop(0.55, 'rgba(255,255,255,0.18)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const tex = new THREE.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

interface Particle {
  pos: THREE.Vector3
  vel: THREE.Vector3
  size: number
  phase: number
}

interface Props {
  count?: number
  fineCount?: number
  attraction?: number
  fluidStrength?: number
  flowSpeed?: number
  mouseStrength?: number
  enabled?: boolean
  color?: string
  colorHot?: string
  fineColor?: string
}

export default function FluidEmergentSystem({
  count = 1100,
  fineCount = 600,
  attraction = 0.00065,
  fluidStrength = 0.0105,
  flowSpeed = 0.30,
  mouseStrength = 0.018,
  enabled = true,
  color = '#d4af37',
  colorHot = '#f8f0d8',
  fineColor = '#e8d5a3'
}: Props) {
  const mainRef = useRef<THREE.Points>(null)
  const fineRef = useRef<THREE.Points>(null)
  const { tier, isMobile } = useGPUTier()
  const { forceFields, mouseWorld, setMouseWorld } = useLuminaStore()
  const { camera, gl, size } = useThree()

  // Adaptive counts – high on desktop high-tier, calm on mobile
  const mainCount = useMemo(() => {
    if (!enabled) return 0
    if (isMobile || tier <= 1) return Math.min(160, Math.floor(count * 0.18))
    if (tier === 2) return Math.min(520, Math.floor(count * 0.55))
    return count // high-end: full count
  }, [count, tier, isMobile, enabled])

  const fineN = useMemo(() => {
    if (!enabled || isMobile || tier <= 1) return 0
    if (tier === 2) return Math.min(280, Math.floor(fineCount * 0.5))
    return fineCount
  }, [fineCount, tier, isMobile, enabled])

  // Main fluid layer
  const main = useMemo(() => {
    const parts: Particle[] = []
    const positions = new Float32Array(mainCount * 3)
    const sizes = new Float32Array(mainCount)
    const colors = new Float32Array(mainCount * 3)
    const c = new THREE.Color(color)
    for (let i = 0; i < mainCount; i++) {
      const r = 3.5 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = (Math.random() - 0.5) * 7
      const z = r * Math.sin(phi) * Math.sin(theta)
      parts.push({
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.015, (Math.random() - 0.5) * 0.015, (Math.random() - 0.5) * 0.015),
        size: 0.9 + Math.random() * 1.6,
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
    const mat = new THREE.PointsMaterial({
      size: 0.14,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: createSoftTexture()
    })
    return { parts, geo, mat }
  }, [mainCount, color])

  // Fine secondary layer (subtle dust / ribbons feel)
  const fine = useMemo(() => {
    if (fineN === 0) return null
    const parts: Particle[] = []
    const positions = new Float32Array(fineN * 3)
    const sizes = new Float32Array(fineN)
    const colors = new Float32Array(fineN * 3)
    const c = new THREE.Color(fineColor)
    for (let i = 0; i < fineN; i++) {
      const r = 2 + Math.random() * 12
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = (Math.random() - 0.5) * 8
      const z = r * Math.sin(phi) * Math.sin(theta)
      parts.push({
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3(0, 0, 0),
        size: 0.35 + Math.random() * 0.7,
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
    const mat = new THREE.PointsMaterial({
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: createSoftTexture()
    })
    return { parts, geo, mat }
  }, [fineN, fineColor])

  // Mouse → world position (soft force)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / size.width) * 2 - 1
      const y = -(e.clientY / size.height) * 2 + 1
      const vec = new THREE.Vector3(x, y, 0.5)
      vec.unproject(camera)
      const dir = vec.sub(camera.position).normalize()
      // Project to a plane in front of crystal (z ≈ 0)
      const dist = -camera.position.z / dir.z
      const world = camera.position.clone().add(dir.multiplyScalar(dist * 0.65))
      setMouseWorld([world.x, world.y, world.z])
    }
    const onLeave = () => setMouseWorld(null)
    const el = gl.domElement
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [camera, gl, size, setMouseWorld])

  useEffect(() => {
    return () => {
      main.geo.dispose()
      main.mat.dispose()
      if (main.mat.map) main.mat.map.dispose()
      if (fine) {
        fine.geo.dispose()
        fine.mat.dispose()
        if (fine.mat.map) fine.mat.map.dispose()
      }
    }
  }, [main, fine])

  useFrame((state, delta) => {
    if (!enabled || mainCount === 0) return
    const t = state.clock.elapsedTime * flowSpeed
    const dt = Math.min(delta, 0.033) * 60

    // --- Main fluid layer ---
    const pos = main.geo.attributes.position as THREE.BufferAttribute
    const sz = main.geo.attributes.size as THREE.BufferAttribute
    const col = main.geo.attributes.color as THREE.BufferAttribute
    const cBase = new THREE.Color(color)
    const cHot = new THREE.Color(colorHot)
    const center = new THREE.Vector3(0, 0, 0)

    for (let i = 0; i < mainCount; i++) {
      const p = main.parts[i]

      // Curl fluid force
      const curl = curlNoise(p.pos.x, p.pos.y, p.pos.z, t, 0.11)
      p.vel.addScaledVector(curl, fluidStrength * dt)

      // Crystal soft attraction / orbit
      const toC = center.clone().sub(p.pos)
      const d = toC.length()
      if (d > 1.6) {
        p.vel.addScaledVector(toC.normalize(), attraction * (d * 0.35) * dt)
      } else {
        p.vel.addScaledVector(toC.normalize(), -attraction * 1.6 * dt)
      }

      // Mouse force field (real-time interaction)
      if (mouseWorld) {
        const m = new THREE.Vector3(...mouseWorld)
        const toM = m.clone().sub(p.pos)
        const md = toM.length()
        if (md < 5.5 && md > 0.2) {
          // Soft attract with slight swirl
          p.vel.addScaledVector(toM.normalize(), (mouseStrength * (1 - md / 5.5)) * dt)
          p.vel.add(new THREE.Vector3(-toM.y, toM.x, 0).normalize().multiplyScalar(0.004 * dt))
        }
      }

      // Gemini / store force fields
      for (const f of forceFields) {
        const fp = new THREE.Vector3(...f.position)
        const toF = fp.clone().sub(p.pos)
        const fd = toF.length()
        if (fd < f.radius && fd > 0.15) {
          const fall = 1 - fd / f.radius
          if (f.type === 'attract') {
            p.vel.addScaledVector(toF.normalize(), f.strength * fall * dt)
          } else if (f.type === 'repel') {
            p.vel.addScaledVector(toF.normalize(), -f.strength * fall * dt)
          } else if (f.type === 'vortex') {
            const tang = new THREE.Vector3(-toF.y, toF.x, toF.z * 0.1).normalize()
            p.vel.addScaledVector(tang, f.strength * fall * dt)
            p.vel.addScaledVector(toF.normalize(), -f.strength * 0.3 * fall * dt)
          }
        }
      }

      // Damping (calm)
      p.vel.multiplyScalar(0.982)
      p.pos.addScaledVector(p.vel, dt * 0.016)

      // Soft rebirth
      if (p.pos.length() > 17) {
        p.pos.set((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 7)
        p.vel.set(0, 0, 0)
      }

      pos.setXYZ(i, p.pos.x, p.pos.y, p.pos.z)
      const pulse = 0.82 + 0.28 * Math.sin(t * 1.4 + p.phase)
      sz.setX(i, p.size * pulse)
      const speed = p.vel.length()
      const mix = Math.min(1, speed * 16)
      col.setXYZ(i, cBase.r * (1 - mix) + cHot.r * mix, cBase.g * (1 - mix) + cHot.g * mix, cBase.b * (1 - mix) + cHot.b * mix)
    }
    pos.needsUpdate = true
    sz.needsUpdate = true
    col.needsUpdate = true

    // --- Fine secondary layer (lighter motion) ---
    if (fine && fineN > 0) {
      const fpos = fine.geo.attributes.position as THREE.BufferAttribute
      const fsz = fine.geo.attributes.size as THREE.BufferAttribute
      for (let i = 0; i < fineN; i++) {
        const p = fine.parts[i]
        const curl = curlNoise(p.pos.x * 1.3, p.pos.y * 1.3, p.pos.z * 1.3, t * 1.2, 0.18)
        p.vel.addScaledVector(curl, fluidStrength * 0.55 * dt)
        if (mouseWorld) {
          const m = new THREE.Vector3(...mouseWorld)
          const toM = m.clone().sub(p.pos)
          const md = toM.length()
          if (md < 4) p.vel.addScaledVector(toM.normalize(), mouseStrength * 0.4 * (1 - md / 4) * dt)
        }
        p.vel.multiplyScalar(0.97)
        p.pos.addScaledVector(p.vel, dt * 0.014)
        if (p.pos.length() > 15) {
          p.pos.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 9)
          p.vel.set(0, 0, 0)
        }
        fpos.setXYZ(i, p.pos.x, p.pos.y, p.pos.z)
        fsz.setX(i, p.size * (0.9 + 0.2 * Math.sin(t * 2 + p.phase)))
      }
      fpos.needsUpdate = true
      fsz.needsUpdate = true
    }
  })

  if (!enabled || mainCount === 0) return null

  return (
    <group>
      <points ref={mainRef} geometry={main.geo} material={main.mat} frustumCulled={false} />
      {fine && fineN > 0 && (
        <points ref={fineRef} geometry={fine.geo} material={fine.mat} frustumCulled={false} />
      )}
    </group>
  )
}
