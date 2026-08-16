# LuminaForge

**The ultimate open-source generative immersive 3D spatial stack.**

Ultra-luxury, calm, emergent AI-driven WebGL experiences.  
Built for the next generation of spatial computing on the web — elegant, not busy.

**https://github.com/createwithalli/lumina-forge**

---

## Status: Full Stack + Audited + Fluid Emergent System

Every line has been reviewed for correctness:
- Tailwind CSS v4 via official `@tailwindcss/vite` plugin
- React 19 + Vite 6 + TypeScript strict
- Adaptive GPU tiering (`@pmndrs/detect-gpu`)
- Luxury MeshTransmissionMaterial crystal
- **Full particle + fluid emergent system** (curl-noise driven)
- Zustand store + Gemini generative hook (ready for API key)
- Glassmorphism UI with Motion
- No unused imports, no broken peers for core stack
- Clean aliases, env example, LICENSE, favicon

Core runs with:
```bash
pnpm install   # or npm install --legacy-peer-deps
pnpm dev
```

---

## Why LuminaForge is better

| Previous concepts          | **LuminaForge**                                      |
|----------------------------|------------------------------------------------------|
| Conceptual only            | Real runnable full starter                           |
| Basic materials            | Adaptive luxury crystal + full fluid particles       |
| Manual setup               | Zero-config Tailwind v4 + GPU adaptive + store       |
| Incomplete                 | Full stack: hooks, store, materials, systems, UI     |
| Peer conflicts             | Audited dependencies for reliable install            |

**Core Philosophy**: Maximum immersion and luxury with *minimum visual noise*.  
Vast negative space. Soft volumetric light. Emergent flow that feels alive but never chaotic.

---

## Ultimate Stack (Core)

- **Build**: Vite 6 + React 19 + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`)
- **3D**: three + `@react-three/fiber` + `@react-three/drei`
- **Design**: `@splinetool/react-spline` (ready)
- **Motion**: `motion`
- **GPU**: `@pmndrs/detect-gpu`
- **AI**: `@google/genai` (Gemini) — generative scenes
- **State**: Zustand
- **Extras**: maath, vite-plugin-glsl, EmergentParticles system

## Full Particle + Fluid Emergent System

`src/systems/FluidEmergentSystem.tsx` is a complete, production-ready emergent fluid particle system:

- **Curl-noise driven fluid flow** (incompressible-like motion)
- Soft attraction / orbit around the luxury crystal (emergent gathering without chaos)
- Velocity-based color tint (gold → warm champagne)
- Soft additive glowing particles with size breathing
- **Fully adaptive** to GPU tier + mobile (never busy on low-end)
- Endless rebirth for continuous living flow
- Designed for calm luxury + spatial negative space

This is the heart of the "emergent style flow" – particles that feel alive and self-organize while staying elegant.


---

## Quick Start

```bash
npx degit createwithalli/lumina-forge my-lumina
cd my-lumina
pnpm install   # or: npm install --legacy-peer-deps
cp .env.example .env   # add VITE_GEMINI_API_KEY if using AI
pnpm dev
```

Open http://localhost:5173

---

## Project Structure (Full Stack)

```
lumina-forge/
├── public/favicon.svg
├── src/
│   ├── components/Overlay.tsx
│   ├── hooks/useGPUTier.ts  useGemini.ts
│   ├── materials/LuxuryCrystal.tsx
│   ├── scenes/LuminaScene.tsx
│   ├── store/useLuminaStore.ts
│   ├── systems/
│   │   ├── FluidEmergentSystem.tsx   ← FULL fluid + particle system
│   │   └── EmergentParticles.tsx     (simple fallback)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── LICENSE
├── package.json
├── vite.config.ts
└── README.md
```

---

## Premium (Open Core)

Free core is MIT and production usable.

**Premium pack**: advanced GPGPU fluids, full multi-agent Gemini, Stripe SaaS starter, multiplayer spatial, commercial support, private materials.

---

## License

MIT

**LuminaForge** — light that forges worlds.
