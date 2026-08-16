import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useFBO } from '@react-three/drei'
import { useGPUTier } from '../hooks/useGPUTier'
import { useLuminaStore } from '../store/useLuminaStore'

/**
 * GPGPU Fluid Emergent System — ultra-high particle counts
 * -------------------------------------------------------
 * Dual FBO ping-pong (position + velocity) driven entirely on GPU
 * via fragment shaders. Designed for high-end GPUs (tier >= 3).
 * 256² = 65 536 particles by default. Set size={512} for 262 144.
 * Mouse + Gemini force fields fully supported.
 * Calm luxury aesthetic: soft gold, gentle curl, heavy damping.
 */

const DEFAULT_SIZE = 256 // 65k particles

const simVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const posFragment = /* glsl */ `
  uniform sampler2D uPosition;
  uniform sampler2D uVelocity;
  uniform float uDelta;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec4 pos = texture2D(uPosition, vUv);
    vec4 vel = texture2D(uVelocity, vUv);
    pos.xyz += vel.xyz * uDelta * 0.016;

    float d = length(pos.xyz);
    if (d > 18.0) {
      float h  = fract(sin(dot(vUv, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
      float h2 = fract(sin(dot(vUv + 0.13, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
      float h3 = fract(sin(dot(vUv + 0.27, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
      pos.xyz = vec3((h - 0.5) * 8.0, (h2 - 0.5) * 4.0, (h3 - 0.5) * 8.0);
    }
    gl_FragColor = pos;
  }
`

const velFragment = /* glsl */ `
  uniform sampler2D uPosition;
  uniform sampler2D uVelocity;
  uniform float uTime;
  uniform float uDelta;
  uniform float uFluidStrength;
  uniform float uAttraction;
  uniform vec3 uMouse;
  uniform float uMouseStrength;
  uniform float uHasMouse;
  uniform vec3 uForcePos0;
  uniform float uForceStr0;
  uniform float uForceRad0;
  uniform float uForceType0;
  uniform vec3 uForcePos1;
  uniform float uForceStr1;
  uniform float uForceRad1;
  uniform float uForceType1;
  uniform float uForceCount;
  varying vec2 vUv;

  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash(i);
    float n100 = hash(i + vec3(1,0,0));
    float n010 = hash(i + vec3(0,1,0));
    float n110 = hash(i + vec3(1,1,0));
    float n001 = hash(i + vec3(0,0,1));
    float n101 = hash(i + vec3(1,0,1));
    float n011 = hash(i + vec3(0,1,1));
    float n111 = hash(i + vec3(1,1,1));
    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);
  }

  vec3 curlNoise(vec3 p) {
    float e = 0.015;
    float n1 = noise(p);
    float n2 = noise(p + vec3(31.4, 0.0, 0.0));
    float n3 = noise(p + vec3(0.0, 47.2, 0.0));
    float dx = (noise(p + vec3(e,0,0)) - n1) / e;
    float dy = (noise(p + vec3(0,e,0)) - n2) / e;
    float dz = (noise(p + vec3(0,0,e)) - n3) / e;
    return normalize(vec3(dy - dz, dz - dx, dx - dy));
  }

  void applyForce(inout vec3 v, vec3 p, vec3 fpos, float fstr, float frad, float ftype, float dt) {
    vec3 toF = fpos - p;
    float fd = length(toF);
    if (fd < frad && fd > 0.15) {
      float fall = 1.0 - fd / frad;
      if (ftype < 0.5) {
        v += normalize(toF) * fstr * fall * dt * 60.0;
      } else if (ftype < 1.5) {
        v += normalize(toF) * (-fstr) * fall * dt * 60.0;
      } else {
        vec3 tang = normalize(vec3(-toF.y, toF.x, toF.z * 0.1));
        v += tang * fstr * fall * dt * 60.0;
        v += normalize(toF) * (-fstr * 0.3) * fall * dt * 60.0;
      }
    }
  }

  void main() {
    vec4 pos = texture2D(uPosition, vUv);
    vec4 vel = texture2D(uVelocity, vUv);
    float t = uTime * 0.28;
    vec3 p = pos.xyz;

    // Curl fluid
    vec3 curl = curlNoise(p * 0.11 + vec3(0.0, 0.0, t * 0.07));
    vel.xyz += curl * uFluidStrength * uDelta * 60.0;

    // Crystal soft attract / orbit
    vec3 toCenter = -p;
    float dist = length(toCenter);
    if (dist > 1.6) {
      vel.xyz += normalize(toCenter) * uAttraction * (dist * 0.35) * uDelta * 60.0;
    } else {
      vel.xyz += normalize(toCenter) * (-uAttraction * 1.6) * uDelta * 60.0;
    }

    // Mouse
    if (uHasMouse > 0.5) {
      vec3 toM = uMouse - p;
      float md = length(toM);
      if (md < 5.5 && md > 0.2) {
        float fall = 1.0 - md / 5.5;
        vel.xyz += normalize(toM) * uMouseStrength * fall * uDelta * 60.0;
        vel.xyz += normalize(vec3(-toM.y, toM.x, 0.0)) * 0.004 * uDelta * 60.0;
      }
    }

    // Force fields
    if (uForceCount > 0.5) applyForce(vel.xyz, p, uForcePos0, uForceStr0, uForceRad0, uForceType0, uDelta);
    if (uForceCount > 1.5) applyForce(vel.xyz, p, uForcePos1, uForceStr1, uForceRad1, uForceType1, uDelta);

    // Damping
    vel.xyz *= 0.982;

    gl_FragColor = vel;
  }
`

const particleVertex = /* glsl */ `
  uniform sampler2D uPosition;
  uniform float uSize;
  uniform float uTime;
  attribute vec2 aUv;
  varying float vPulse;
  varying vec3 vColor;

  void main() {
    vec4 posData = texture2D(uPosition, aUv);
    vec3 pos = posData.xyz;
    float pulse = 0.82 + 0.28 * sin(uTime * 1.4 + aUv.x * 23.0 + aUv.y * 17.0);
    vPulse = pulse;
    vColor = mix(vec3(0.831, 0.686, 0.216), vec3(0.973, 0.941, 0.847), pulse * 0.55);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * pulse * (280.0 / max(-mvPosition.z, 0.1));
    gl_Position = projectionMatrix * mvPosition;
  }
`

const particleFragment = /* glsl */ `
  varying float vPulse;
  varying vec3 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.12, d) * 0.52 * vPulse;
    gl_FragColor = vec4(vColor, alpha);
  }
`

interface Props {
  size?: number
  fluidStrength?: number
  attraction?: number
  mouseStrength?: number
  enabled?: boolean
}

export default function GPGPUFluidSystem({
  size = DEFAULT_SIZE,
  fluidStrength = 0.0105,
  attraction = 0.00065,
  mouseStrength = 0.018,
  enabled = true
}: Props) {
  const { gl, camera, size: viewSize } = useThree()
  const { tier, isMobile } = useGPUTier()
  const { forceFields, mouseWorld, setMouseWorld } = useLuminaStore()

  const useGPGPU = enabled && !isMobile && tier >= 3

  const posA = useFBO(size, size, { type: THREE.FloatType, format: THREE.RGBAFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter })
  const posB = useFBO(size, size, { type: THREE.FloatType, format: THREE.RGBAFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter })
  const velA = useFBO(size, size, { type: THREE.FloatType, format: THREE.RGBAFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter })
  const velB = useFBO(size, size, { type: THREE.FloatType, format: THREE.RGBAFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter })

  const ping = useRef({ pos: posA, vel: velA, nextPos: posB, nextVel: velB })

  const simScene = useMemo(() => new THREE.Scene(), [])
  const simCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])

  const { posInit, velInit } = useMemo(() => {
    const n = size * size
    const pd = new Float32Array(n * 4)
    const vd = new Float32Array(n * 4)
    for (let i = 0; i < n; i++) {
      const r = 3.5 + Math.random() * 10
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      pd[i * 4] = r * Math.sin(ph) * Math.cos(th)
      pd[i * 4 + 1] = (Math.random() - 0.5) * 7
      pd[i * 4 + 2] = r * Math.sin(ph) * Math.sin(th)
      pd[i * 4 + 3] = 1
      vd[i * 4] = (Math.random() - 0.5) * 0.01
      vd[i * 4 + 1] = (Math.random() - 0.5) * 0.01
      vd[i * 4 + 2] = (Math.random() - 0.5) * 0.01
      vd[i * 4 + 3] = 0
    }
    const pTex = new THREE.DataTexture(pd, size, size, THREE.RGBAFormat, THREE.FloatType)
    pTex.needsUpdate = true
    const vTex = new THREE.DataTexture(vd, size, size, THREE.RGBAFormat, THREE.FloatType)
    vTex.needsUpdate = true
    return { posInit: pTex, velInit: vTex }
  }, [size])

  const posMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uPosition: { value: null },
      uVelocity: { value: null },
      uDelta: { value: 0.016 },
      uTime: { value: 0 }
    },
    vertexShader: simVertex,
    fragmentShader: posFragment
  }), [])

  const velMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uPosition: { value: null },
      uVelocity: { value: null },
      uTime: { value: 0 },
      uDelta: { value: 0.016 },
      uFluidStrength: { value: fluidStrength },
      uAttraction: { value: attraction },
      uMouse: { value: new THREE.Vector3() },
      uMouseStrength: { value: mouseStrength },
      uHasMouse: { value: 0 },
      uForcePos0: { value: new THREE.Vector3() },
      uForceStr0: { value: 0 },
      uForceRad0: { value: 0 },
      uForceType0: { value: 0 },
      uForcePos1: { value: new THREE.Vector3() },
      uForceStr1: { value: 0 },
      uForceRad1: { value: 0 },
      uForceType1: { value: 0 },
      uForceCount: { value: 0 }
    },
    vertexShader: simVertex,
    fragmentShader: velFragment
  }), [fluidStrength, attraction, mouseStrength])

  const simMesh = useMemo(() => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), posMat)
    return m
  }, [posMat])

  const particlesGeo = useMemo(() => {
    const n = size * size
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(n * 3)
    const uvs = new Float32Array(n * 2)
    for (let i = 0; i < n; i++) {
      uvs[i * 2] = ((i % size) + 0.5) / size
      uvs[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aUv', new THREE.BufferAttribute(uvs, 2))
    return geo
  }, [size])

  const particleMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uPosition: { value: null },
      uSize: { value: 0.12 },
      uTime: { value: 0 }
    },
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }), [])

  const seeded = useRef(false)

  useEffect(() => {
    if (!useGPGPU || seeded.current) return
    const sc = new THREE.Scene()
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const mat = new THREE.MeshBasicMaterial({ map: posInit })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
    sc.add(mesh)
    gl.setRenderTarget(posA)
    gl.render(sc, cam)
    gl.setRenderTarget(posB)
    gl.render(sc, cam)
    mat.map = velInit
    gl.setRenderTarget(velA)
    gl.render(sc, cam)
    gl.setRenderTarget(velB)
    gl.render(sc, cam)
    gl.setRenderTarget(null)
    seeded.current = true
  }, [useGPGPU, gl, posInit, velInit, posA, posB, velA, velB])

  useEffect(() => {
    simScene.add(simMesh)
    return () => { simScene.remove(simMesh) }
  }, [simScene, simMesh])

  // Mouse
  useEffect(() => {
    if (!useGPGPU) return
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / viewSize.width) * 2 - 1
      const y = -(e.clientY / viewSize.height) * 2 + 1
      const vec = new THREE.Vector3(x, y, 0.5)
      vec.unproject(camera)
      const dir = vec.sub(camera.position).normalize()
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
  }, [useGPGPU, camera, gl, viewSize, setMouseWorld])

  useFrame((state, delta) => {
    if (!useGPGPU || !seeded.current) return

    const dt = Math.min(delta, 0.033)
    const t = state.clock.elapsedTime
    const cur = ping.current

    // Velocity uniforms
    velMat.uniforms.uPosition.value = cur.pos.texture
    velMat.uniforms.uVelocity.value = cur.vel.texture
    velMat.uniforms.uTime.value = t
    velMat.uniforms.uDelta.value = dt
    velMat.uniforms.uFluidStrength.value = fluidStrength
    velMat.uniforms.uAttraction.value = attraction
    velMat.uniforms.uMouseStrength.value = mouseStrength
    if (mouseWorld) {
      velMat.uniforms.uMouse.value.set(mouseWorld[0], mouseWorld[1], mouseWorld[2])
      velMat.uniforms.uHasMouse.value = 1
    } else {
      velMat.uniforms.uHasMouse.value = 0
    }
    velMat.uniforms.uForceCount.value = Math.min(forceFields.length, 2)
    if (forceFields[0]) {
      const f = forceFields[0]
      velMat.uniforms.uForcePos0.value.set(...f.position)
      velMat.uniforms.uForceStr0.value = f.strength
      velMat.uniforms.uForceRad0.value = f.radius
      velMat.uniforms.uForceType0.value = f.type === 'attract' ? 0 : f.type === 'repel' ? 1 : 2
    }
    if (forceFields[1]) {
      const f = forceFields[1]
      velMat.uniforms.uForcePos1.value.set(...f.position)
      velMat.uniforms.uForceStr1.value = f.strength
      velMat.uniforms.uForceRad1.value = f.radius
      velMat.uniforms.uForceType1.value = f.type === 'attract' ? 0 : f.type === 'repel' ? 1 : 2
    }

    simMesh.material = velMat
    gl.setRenderTarget(cur.nextVel)
    gl.render(simScene, simCam)

    // Position pass
    posMat.uniforms.uPosition.value = cur.pos.texture
    posMat.uniforms.uVelocity.value = cur.nextVel.texture
    posMat.uniforms.uDelta.value = dt
    posMat.uniforms.uTime.value = t
    simMesh.material = posMat
    gl.setRenderTarget(cur.nextPos)
    gl.render(simScene, simCam)

    gl.setRenderTarget(null)

    // Swap
    const tp = cur.pos
    const tv = cur.vel
    cur.pos = cur.nextPos
    cur.vel = cur.nextVel
    cur.nextPos = tp
    cur.nextVel = tv

    particleMat.uniforms.uPosition.value = cur.pos.texture
    particleMat.uniforms.uTime.value = t
  })

  if (!useGPGPU) return null

  return (
    <points geometry={particlesGeo} material={particleMat} frustumCulled={false} />
  )
}
