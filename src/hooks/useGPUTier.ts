import { useEffect, useState } from 'react'
import { getGPUTier } from '@pmndrs/detect-gpu'

export function useGPUTier() {
  const [tier, setTier] = useState(2)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    getGPUTier().then((result) => {
      setTier(result.tier)
      setIsMobile(!!result.isMobile)
      console.log('[LuminaForge] GPU Tier:', result)
    })
  }, [])

  return { tier, isMobile }
}
