import { motion } from 'motion/react'

/**
 * Luxury glassmorphism overlay UI.
 * Calm, minimal, elegant. No visual noise.
 */
export default function Overlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 md:p-10 lg:p-12">
      {/* Top bar */}
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
            Generative Spatial
          </p>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.9 }}
          className="hidden md:flex gap-7 text-xs tracking-[0.15em] text-white/45 pointer-events-auto"
        >
          <a href="#experience" className="hover:text-white/90 transition-colors duration-300">
            Experience
          </a>
          <a href="#stack" className="hover:text-white/90 transition-colors duration-300">
            Stack
          </a>
          <a
            href="https://github.com/createwithalli/lumina-forge"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/90 transition-colors duration-300"
          >
            GitHub
          </a>
        </motion.nav>
      </div>

      {/* Bottom info card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-sm md:max-w-md"
      >
        <div className="glass rounded-3xl p-5 md:p-7 pointer-events-auto">
          <p className="text-sm md:text-[15px] text-white/65 leading-relaxed font-light">
            Ultra-luxury immersive 3D. Emergent AI-driven flow.
            <br className="hidden sm:block" />
            Calm spatial experiences powered by React Three Fiber,
            Spline, Gemini & WebGPU.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="px-5 py-2.5 rounded-full bg-[#d4af37]/12 border border-[#d4af37]/35 text-[#d4af37] text-[11px] tracking-[0.2em] uppercase hover:bg-[#d4af37]/20 transition-all duration-300"
            >
              Enter
            </button>
            <a
              href="https://github.com/createwithalli/lumina-forge"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full border border-white/10 text-white/50 text-[11px] tracking-[0.2em] uppercase hover:border-white/30 hover:text-white/80 transition-all duration-300 inline-flex items-center"
            >
              Star on GitHub
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
