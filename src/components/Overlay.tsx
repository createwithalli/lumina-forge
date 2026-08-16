import { motion } from 'motion/react'
import { useLuminaStore } from '../store/useLuminaStore'
import { useGemini } from '../hooks/useGemini'

/**
 * Luxury glassmorphism overlay + live emergent controls.
 * Mouse already drives the fluid; buttons let Gemini inject force fields.
 */
export default function Overlay() {
  const { addForceField, clearForceFields, forceFields } = useLuminaStore()
  const { generate, loading } = useGemini()

  const injectVortex = () => {
    addForceField({
      position: [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 3],
      strength: 0.025 + Math.random() * 0.02,
      radius: 4 + Math.random() * 3,
      type: 'vortex'
    })
  }

  const injectAttract = () => {
    addForceField({
      position: [(Math.random() - 0.5) * 3, 0.5, (Math.random() - 0.5) * 2],
      strength: 0.03,
      radius: 5,
      type: 'attract'
    })
  }

  const askGemini = async () => {
    const text = await generate('Suggest one elegant force field for a calm luxury fluid particle system around a crystal. Reply only with a short description of type and feel.')
    // Simple heuristic demo – in production parse Gemini JSON
    if (text) {
      injectVortex()
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 md:p-10 lg:p-12">
      <div className="flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-2xl px-5 py-2.5 md:px-6 md:py-3 pointer-events-auto"
        >
          <h1 className="text-lg md:text-xl lg:text-2xl font-light tracking-[0.2em] text-white/90">
            LUMINA<span className="text-[#d4af37]">FORGE</span>
          </h1>
          <p className="text-[9px] md:text-[10px] tracking-[0.35em] text-white/35 mt-0.5 uppercase">
            Generative Spatial · Fluid Emergent
          </p>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.9 }}
          className="hidden md:flex gap-7 text-xs tracking-[0.15em] text-white/45 pointer-events-auto"
        >
          <a href="https://github.com/createwithalli/lumina-forge" target="_blank" rel="noopener noreferrer" className="hover:text-white/90 transition-colors duration-300">
            GitHub
          </a>
        </motion.nav>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md"
      >
        <div className="glass rounded-3xl p-5 md:p-7 pointer-events-auto">
          <p className="text-sm md:text-[15px] text-white/65 leading-relaxed font-light">
            Move your mouse — the fluid reacts in real time.
            <br className="hidden sm:block" />
            Dual-layer emergent particles + curl-noise fluid.
            Gemini can inject living force fields.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={injectVortex}
              className="px-4 py-2 rounded-full bg-[#d4af37]/12 border border-[#d4af37]/35 text-[#d4af37] text-[10px] tracking-[0.15em] uppercase hover:bg-[#d4af37]/22 transition-all"
            >
              Vortex
            </button>
            <button
              type="button"
              onClick={injectAttract}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-white/60 text-[10px] tracking-[0.15em] uppercase hover:border-white/30 transition-all"
            >
              Attract
            </button>
            <button
              type="button"
              onClick={askGemini}
              disabled={loading}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/15 text-white/60 text-[10px] tracking-[0.15em] uppercase hover:border-white/30 transition-all disabled:opacity-40"
            >
              {loading ? '…' : 'Gemini Force'}
            </button>
            {forceFields.length > 0 && (
              <button
                type="button"
                onClick={clearForceFields}
                className="px-4 py-2 rounded-full border border-white/10 text-white/40 text-[10px] tracking-[0.15em] uppercase hover:text-white/70 transition-all"
              >
                Clear ({forceFields.length})
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
