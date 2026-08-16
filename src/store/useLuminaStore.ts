import { create } from 'zustand'
import * as THREE from 'three'

interface ForceField {
  position: [number, number, number]
  strength: number
  radius: number
  type: 'attract' | 'repel' | 'vortex'
}

interface LuminaState {
  isEntered: boolean
  scenePrompt: string
  /** Live force fields that the fluid system reacts to (mouse + Gemini) */
  forceFields: ForceField[]
  mouseWorld: [number, number, number] | null
  setEntered: (v: boolean) => void
  setScenePrompt: (p: string) => void
  setForceFields: (fields: ForceField[]) => void
  addForceField: (field: ForceField) => void
  setMouseWorld: (pos: [number, number, number] | null) => void
  clearForceFields: () => void
}

/**
 * Global state for LuminaForge.
 * Supports real-time mouse + Gemini-driven force fields for emergent fluid.
 */
export const useLuminaStore = create<LuminaState>((set) => ({
  isEntered: false,
  scenePrompt: 'calm luxury floating crystal in deep void with soft gold light and living fluid particles',
  forceFields: [],
  mouseWorld: null,
  setEntered: (v) => set({ isEntered: v }),
  setScenePrompt: (p) => set({ scenePrompt: p }),
  setForceFields: (fields) => set({ forceFields: fields }),
  addForceField: (field) => set((s) => ({ forceFields: [...s.forceFields, field] })),
  setMouseWorld: (pos) => set({ mouseWorld: pos }),
  clearForceFields: () => set({ forceFields: [] })
}))
