import { useEffect, useState } from 'react'
import { getGPUTier } from '@pmndrs/detect-gpu'

export interface GPUTierResult {
  tier: number
  isMobile: boolean
  fps?: number
  gpu?: string
}

/**
 * Adaptive GPU detection for true immersion across devices.
 * Tier 0-1: low, 2: medium, 3: high.
 */
export function useGPUTier(): GPUTierResult {
  const [result, setResult] = useState<GPUTierResult>({
    tier: 2,
    isMobile: false
  })

  useEffect(() => {
    let mounted = true
    getGPUTier()
      .then((r) => {
        if (mounted) {
          setResult({
            tier: r.tier,
            isMobile: !!r.isMobile,
            fps: r.fps,
            gpu: r.gpu
          })
          console.log('[LuminaForge] GPU Tier:', r)
        }
      })
      .catch(() => {
        console.warn('[LuminaForge] GPU detection failed, using defaults')
      })
    return () => {
      mounted = false
    }
  }, [])

  return result
}
