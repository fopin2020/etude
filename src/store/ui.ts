import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  theme: Theme
  setTheme: (t: Theme) => void
  resolvedDark: boolean
  setResolvedDark: (v: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      resolvedDark: false,
      setResolvedDark: (resolvedDark) => set({ resolvedDark }),
    }),
    { name: 'etude-ui', partialize: (s) => ({ theme: s.theme }) },
  ),
)
