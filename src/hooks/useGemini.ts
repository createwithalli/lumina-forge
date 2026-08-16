import { useCallback, useState } from 'react'
import { GoogleGenAI } from '@google/genai'

/**
 * Gemini generative engine for emergent scenes.
 * Requires VITE_GEMINI_API_KEY in .env
 * Ready for text-to-scene, particle rules, lighting prompts.
 */
export function useGemini() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<string | null>(null)

  const generate = useCallback(async (prompt: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!apiKey) {
      setError('Missing VITE_GEMINI_API_KEY')
      return null
    }

    setLoading(true)
    setError(null)
    try {
      const ai = new GoogleGenAI({ apiKey })
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `You are LuminaForge generative engine. Respond with a short, elegant 3D scene description or JSON config for a calm luxury immersive experience. Prompt: ${prompt}`
      })
      const text = response.text ?? ''
      setLastResponse(text)
      return text
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Generation failed'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { generate, loading, error, lastResponse }
}
