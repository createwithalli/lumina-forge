# LuminaForge

**The ultimate open-source generative immersive 3D spatial stack.**

Ultra-luxury, calm, emergent AI-driven WebGL experiences.  
Built for the next generation of spatial computing on the web — elegant, not busy.

**https://github.com/createwithalli/lumina-forge**

---

## Status: Full Stack + Full Fluid Emergent System (v2) + GPGPU

- Tailwind CSS v4 (`@tailwindcss/vite`)
- React 19 + Vite 6 + TypeScript
- Adaptive GPU tiering
- Luxury MeshTransmissionMaterial crystal
- **Full dual-layer particle + fluid emergent system**
  - Curl-noise fluid flow
  - Soft crystal attraction / orbit
  - **Real-time mouse force field**
  - **Gemini / store force fields** (attract, repel, vortex)
  - Fine secondary particle layer
  - Adaptive high counts on high-end GPUs
  - Velocity color + soft glow + breathing
- **GPGPU path (tier ≥ 3)**: 65 536 – 262 144 particles via FBO ping-pong compute shaders
- Zustand store + live force injection
- Glassmorphism UI with interactive controls

```bash
npx degit createwithalli/lumina-forge my-lumina
cd my-lumina
pnpm install   # or npm install --legacy-peer-deps
cp .env.example .env
pnpm dev
```

Move mouse over the canvas → fluid reacts.  
Use the Vortex / Attract / Gemini Force buttons to inject living force fields.

---

## Core Philosophy

Maximum immersion and luxury with **minimum visual noise**.  
Vast negative space. Soft volumetric light. Emergent flow that feels alive but never chaotic.

---

## Full Particle + Fluid Emergent System

### Adaptive architecture
- **High-end GPUs (tier ≥ 3)**: `GPGPUFluidSystem` — pure GPU FBO ping-pong compute style, **65 536 particles** (size=256) or 262k (size=512)
- **Mid / low**: `FluidEmergentSystem` dual-layer CPU with mouse + Gemini force fields

Both share the same calm luxury look, mouse interaction, and force-field API.


`src/systems/FluidEmergentSystem.tsx` + `src/systems/GPGPUFluidSystem.tsx`

| Feature | Description |
|---------|-------------|
| Curl noise fluid | Incompressible-like living streams |
| Crystal orbit | Soft attract + repel for elegant gathering |
| Mouse interaction | Real-time soft force field from pointer |
| Gemini / Store | Inject attract / repel / vortex force fields |
| Dual layer / GPGPU | Main fluid + fine secondary particles / 65k+ GPU |
| Adaptive | 160–262k particles based on GPU tier + mobile |
| Calm luxury | Heavy damping, soft additive glow, velocity tint |

This is the heart of the “emergent style flow”.

---

## Stack

- Vite 6 + React 19 + TypeScript + Tailwind v4
- three + @react-three/fiber + @react-three/drei
- @pmndrs/detect-gpu
- motion
- @google/genai (Gemini)
- zustand
- maath + custom curl noise + GPGPU FBO shaders

---

## License

MIT

**LuminaForge** — light that forges worlds.
