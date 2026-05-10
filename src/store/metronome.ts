import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getEngine } from '../metronome/engine'
import { DEFAULT_CONFIG, type MetronomeConfig } from '../metronome/types'
import type { EngineEvent } from '../metronome/types'

interface VisibleState {
  config: MetronomeConfig
  isRunning: boolean
  currentBeatIdx: number
  currentSubIdx: number
  totalSubsInBeat: number
  currentMeasureIdx: number
  currentBpm: number
  cueLevel: 0 | 1 | 2
  flashSeq: number
}

interface Actions {
  start: () => Promise<void>
  stop: () => void
  setConfig: (patch: Partial<MetronomeConfig>) => void
  resetConfig: () => void
}

type MetronomeStore = VisibleState & Actions

const initialVisible: VisibleState = {
  config: DEFAULT_CONFIG,
  isRunning: false,
  currentBeatIdx: 0,
  currentSubIdx: 0,
  totalSubsInBeat: 1,
  currentMeasureIdx: 0,
  currentBpm: DEFAULT_CONFIG.bpm,
  cueLevel: 0,
  flashSeq: 0,
}

export const useMetronomeStore = create<MetronomeStore>()(
  persist(
    (set, get) => {
      const engine = getEngine(DEFAULT_CONFIG)

      engine.on((e: EngineEvent) => {
        if (e.type === 'tick') {
          set((s) => ({
            currentBeatIdx: e.beatIdx,
            currentSubIdx: e.subIdx,
            totalSubsInBeat: e.totalSubsInBeat,
            flashSeq: s.flashSeq + 1,
          }))
        } else if (e.type === 'measure') {
          set({
            currentMeasureIdx: e.measureIdx,
            currentBpm: e.bpm,
            cueLevel: e.cueLevel,
          })
        } else if (e.type === 'bpm-change') {
          set({ currentBpm: e.newBpm })
        } else if (e.type === 'stopped') {
          set({ isRunning: false, cueLevel: 0 })
        }
      })

      return {
        ...initialVisible,

        start: async () => {
          const cfg = get().config
          engine.setConfig(cfg)
          await engine.start()
          set({ isRunning: true, currentBpm: cfg.bpm, currentMeasureIdx: 0, cueLevel: 0 })
        },

        stop: () => {
          engine.stop()
          set({ isRunning: false, cueLevel: 0 })
        },

        setConfig: (patch) => {
          const next = { ...get().config, ...patch }
          set({ config: next })
          engine.setConfig(patch)
          if (!get().isRunning) {
            set({ currentBpm: next.bpm })
          }
        },

        resetConfig: () => {
          engine.setConfig(DEFAULT_CONFIG)
          set({ config: DEFAULT_CONFIG, currentBpm: DEFAULT_CONFIG.bpm })
        },
      }
    },
    {
      name: 'etude-metronome',
      partialize: (s) => ({ config: s.config }),
    },
  ),
)

export function getMetronomeEngine() {
  return getEngine(DEFAULT_CONFIG)
}
