import { create } from 'zustand'

interface LuminaState {
  isEntered: boolean
  scenePrompt: string
  setEntered: (v: boolean) => void
  setScenePrompt: (p: string) => void
}

/**
 * Global state for LuminaForge experiences.
 * Expand for multiplayer, AI sessions, premium flags, etc.
 */
export const useLuminaStore = create<LuminaState>((set) => ({
  isEntered: false,
  scenePrompt: 'calm luxury floating crystal in deep void with soft gold light',
  setEntered: (v) => set({ isEntered: v }),
  setScenePrompt: (p) => set({ scenePrompt: p })
}))
