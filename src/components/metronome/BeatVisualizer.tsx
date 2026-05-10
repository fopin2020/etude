import { useEffect, useState } from 'react'
import { useMetronomeStore } from '../../store/metronome'
import { subsForBeat } from '../../metronome/types'

export function BeatVisualizer() {
  const config = useMetronomeStore((s) => s.config)
  const isRunning = useMetronomeStore((s) => s.isRunning)
  const flashSeq = useMetronomeStore((s) => s.flashSeq)
  const currentBeatIdx = useMetronomeStore((s) => s.currentBeatIdx)
  const currentSubIdx = useMetronomeStore((s) => s.currentSubIdx)
  const [, setTick] = useState(0)

  useEffect(() => {
    if (flashSeq === 0) return
    setTick((n) => n + 1)
  }, [flashSeq])

  const [beats] = config.timeSignature

  return (
    <div
      className="flex items-end justify-center gap-1.5 md:gap-2.5 select-none"
      role="img"
      aria-label={isRunning ? `메트로놈 진행 중 — ${beats}박 중 ${currentBeatIdx + 1}박` : `${beats}박`}
    >
      {Array.from({ length: beats }).map((_, b) => {
        const subs = config.polyrhythm
          ? config.polyrhythm.primary
          : subsForBeat(config.subdivisions, b, beats)
        const isCurrentBeat = isRunning && currentBeatIdx === b
        return (
          <div
            key={b}
            className={[
              'flex flex-col items-center gap-1 px-2 py-3 rounded-lg transition-colors',
              isCurrentBeat ? 'bg-accent-50 dark:bg-accent-950' : '',
            ].join(' ')}
          >
            <div className="flex items-end gap-1 h-12 md:h-16">
              {Array.from({ length: subs }).map((_, i) => {
                const isHead = i === 0
                const isDownbeat = b === 0 && i === 0
                const isLit = isCurrentBeat && currentSubIdx === i
                return (
                  <div
                    key={i}
                    className={[
                      'transition-all duration-75',
                      isHead ? 'w-3 md:w-4' : 'w-1.5 md:w-2',
                      isHead ? 'h-12 md:h-16' : 'h-6 md:h-8',
                      'rounded-sm',
                      isLit
                        ? isDownbeat
                          ? 'bg-accent-600 shadow-lg shadow-accent-500/60 scale-110'
                          : isHead
                            ? 'bg-accent-500 shadow-lg shadow-accent-400/50 scale-105'
                            : 'bg-accent-400 scale-105'
                        : isDownbeat
                          ? 'bg-ink-400 dark:bg-ink-600'
                          : isHead
                            ? 'bg-ink-300 dark:bg-ink-700'
                            : 'bg-ink-200 dark:bg-ink-800',
                    ].join(' ')}
                  />
                )
              })}
            </div>
            <div className="text-[11px] tabular text-ink-500 dark:text-ink-400">{b + 1}</div>
          </div>
        )
      })}
    </div>
  )
}
