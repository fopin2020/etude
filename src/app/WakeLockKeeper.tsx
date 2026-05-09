import { useEffect, useRef } from 'react'
import { useTimerStore } from '../store/timer'

interface WakeLockSentinel {
  released: boolean
  release: () => Promise<void>
  addEventListener: (type: 'release', listener: () => void) => void
}

export function WakeLockKeeper() {
  const active = useTimerStore((s) => s.active)
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    const wl = (navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> }
    }).wakeLock
    if (!wl) return

    const acquire = async () => {
      try {
        sentinelRef.current = await wl.request('screen')
      } catch {
        // user gesture may be required; ignore silently
      }
    }
    const release = async () => {
      if (sentinelRef.current && !sentinelRef.current.released) {
        await sentinelRef.current.release().catch(() => {})
      }
      sentinelRef.current = null
    }

    if (active) {
      void acquire()
      const onVis = () => {
        if (document.visibilityState === 'visible' && active && !sentinelRef.current) {
          void acquire()
        }
      }
      document.addEventListener('visibilitychange', onVis)
      return () => {
        document.removeEventListener('visibilitychange', onVis)
        void release()
      }
    } else {
      void release()
    }
  }, [active])

  return null
}
