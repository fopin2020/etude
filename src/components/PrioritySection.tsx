import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarClock, ChevronRight } from 'lucide-react'
import { db } from '../db/database'
import type { Piece } from '../types'
import { formatDateKo } from '../lib/format'

export function PrioritySection() {
  const pieces = useLiveQuery(() => db.pieces.toArray(), []) ?? []
  const upcoming = useMemo(() => {
    const now = Date.now()
    return pieces
      .filter((p): p is Piece & { recitalDate: string } => !!p.recitalDate && new Date(p.recitalDate).getTime() >= now)
      .map((p) => {
        const days = Math.round((new Date(p.recitalDate).getTime() - now) / (1000 * 60 * 60 * 24))
        return { piece: p, days }
      })
      .filter((x) => x.days <= 90)
      .sort((a, b) => a.days - b.days)
      .slice(0, 5)
  }, [pieces])

  if (upcoming.length === 0) return null

  return (
    <section className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-ink-200 dark:border-ink-800 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock size={18} className="text-accent-600 dark:text-accent-400" />
        <h2 className="text-base font-semibold">곧 다가오는 무대</h2>
      </div>
      <ul className="space-y-2">
        {upcoming.map(({ piece, days }) => {
          const tone = days <= 14 ? 'rose' : days <= 30 ? 'amber' : 'accent'
          const colors = {
            rose: 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
            amber: 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
            accent: 'border-accent-300 dark:border-accent-800 bg-accent-50/50 dark:bg-accent-950/30 text-accent-700 dark:text-accent-300',
          }[tone]
          return (
            <li key={piece.id}>
              <Link
                to={`/repertoire/${piece.id}`}
                className={`flex items-center gap-3 p-3 rounded-lg border ${colors} hover:opacity-90 transition`}
              >
                <div className="tabular text-xl font-bold shrink-0 w-14 text-center">D-{days}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-ink-900 dark:text-ink-100">{piece.title}</div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">
                    {piece.composer} · {formatDateKo(piece.recitalDate)}
                  </div>
                </div>
                <ChevronRight size={16} className="text-ink-400 shrink-0" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
