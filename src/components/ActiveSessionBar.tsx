import { useEffect, useState } from 'react'
import { useTimerStore, computeElapsedSec } from '../store/timer'
import { CATEGORY_LABEL_KO } from '../types'
import { formatDuration } from '../lib/format'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { Pause, Play } from 'lucide-react'

export function ActiveSessionBar() {
  const active = useTimerStore((s) => s.active)
  const pause = useTimerStore((s) => s.pause)
  const resume = useTimerStore((s) => s.resume)
  const piece = useLiveQuery(
    async () => (active?.pieceId ? db.pieces.get(active.pieceId) : undefined),
    [active?.pieceId],
  )

  const [, force] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => force((n) => n + 1), 1000)
    return () => window.clearInterval(id)
  }, [active])

  if (!active) return null
  const elapsed = computeElapsedSec(active)
  const isPaused = !!active.pausedAt

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-accent-600 text-white">
      <span className={`inline-block w-2 h-2 rounded-full ${isPaused ? 'bg-white/50' : 'bg-emerald-300 animate-pulse'}`} />
      <span className="text-sm font-medium">
        연습 중 · {CATEGORY_LABEL_KO[active.category]}
        {piece ? ` · ${piece.title}` : ''}
      </span>
      <span className="ml-auto tabular text-lg font-semibold">{formatDuration(elapsed)}</span>
      <button
        onClick={isPaused ? resume : pause}
        className="ml-2 p-2 min-w-[44px] min-h-[44px] rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center"
        aria-label={isPaused ? '재개' : '일시정지'}
      >
        {isPaused ? <Play size={18} /> : <Pause size={18} />}
      </button>
    </div>
  )
}
