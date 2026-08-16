import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { motion } from 'motion/react'
import Scene from './scenes/LuminaScene'
import Overlay from './components/Overlay'
import { useGPUTier } from './hooks/useGPUTier'

export default function App() {
  const { tier, isMobile } = useGPUTier()

  return (
    <div className="relative w-full h-full bg-black">
      {/* 3D Canvas — adaptive based on GPU */}
      <Canvas
        dpr={[1, tier >= 2 ? 2 : 1.5]}
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ 
          antialias: tier >= 2, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Suspense fallback={null}>
          <Scene tier={tier} isMobile={isMobile} />
        </Suspense>
      </Canvas>

      {/* Luxury UI Overlay */}
      <Overlay />
    </div>
  )
}
