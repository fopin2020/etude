import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category } from '../types'

export interface ActiveSession {
  startedAt: number
  category: Category
  pieceId?: string
  pausedAccumulatedSec: number
  pausedAt: number | null
}

interface TimerState {
  active: ActiveSession | null
  start: (category: Category, pieceId?: string) => void
  pause: () => void
  resume: () => void
  stop: () => { durationSec: number; category: Category; pieceId?: string } | null
  cancel: () => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      active: null,

      start: (category, pieceId) => {
        if (get().active) return
        set({
          active: {
            startedAt: Date.now(),
            category,
            pieceId,
            pausedAccumulatedSec: 0,
            pausedAt: null,
          },
        })
      },

      pause: () => {
        const a = get().active
        if (!a || a.pausedAt) return
        set({ active: { ...a, pausedAt: Date.now() } })
      },

      resume: () => {
        const a = get().active
        if (!a || !a.pausedAt) return
        const pausedFor = Math.floor((Date.now() - a.pausedAt) / 1000)
        set({
          active: {
            ...a,
            pausedAccumulatedSec: a.pausedAccumulatedSec + pausedFor,
            pausedAt: null,
          },
        })
      },

      stop: () => {
        const a = get().active
        if (!a) return null
        const now = a.pausedAt ?? Date.now()
        const elapsedSec = Math.floor((now - a.startedAt) / 1000) - a.pausedAccumulatedSec
        set({ active: null })
        return {
          durationSec: Math.max(0, elapsedSec),
          category: a.category,
          pieceId: a.pieceId,
        }
      },

      cancel: () => set({ active: null }),
    }),
    { name: 'etude-timer' },
  ),
)

export function computeElapsedSec(active: ActiveSession, now: number = Date.now()): number {
  const end = active.pausedAt ?? now
  return Math.max(0, Math.floor((end - active.startedAt) / 1000) - active.pausedAccumulatedSec)
}
