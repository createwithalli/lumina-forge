import { motion } from 'motion/react'

export default function Overlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12">
      {/* Top bar */}
      <div className="flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-2xl px-6 py-3 pointer-events-auto"
        >
          <h1 className="text-xl md:text-2xl font-light tracking-widest text-white/90">
            LUMINA<span className="text-[#d4af37]">FORGE</span>
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-white/40 mt-1 uppercase">
            Generative Spatial
          </p>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="hidden md:flex gap-8 text-sm tracking-wider text-white/50 pointer-events-auto"
        >
          <a href="#" className="hover:text-white/90 transition-colors">Experience</a>
          <a href="#" className="hover:text-white/90 transition-colors">Stack</a>
          <a href="#" className="hover:text-white/90 transition-colors">Premium</a>
        </motion.nav>
      </div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1.2 }}
        className="max-w-md"
      >
        <div className="glass rounded-3xl p-6 md:p-8 pointer-events-auto">
          <p className="text-sm md:text-base text-white/70 leading-relaxed font-light">
            Ultra-luxury immersive 3D. Emergent AI-driven flow.  
            Calm spatial experiences powered by React Three Fiber,  
            Spline, Gemini & WebGPU.
          </p>
          <div className="mt-6 flex gap-4">
            <button className="px-5 py-2.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs tracking-widest uppercase hover:bg-[#d4af37]/20 transition-all">
              Enter
            </button>
            <button className="px-5 py-2.5 rounded-full border border-white/10 text-white/50 text-xs tracking-widest uppercase hover:border-white/30 hover:text-white/80 transition-all">
              GitHub
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
