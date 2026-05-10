import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Piece, Session } from '../../types'
import { pieceCumulative } from '../../lib/analytics'
import { formatMinutes } from '../../lib/format'

interface Props {
  sessions: Session[]
  pieces: Piece[]
  topN?: number
}

export function PieceCumulativeBar({ sessions, pieces, topN = 10 }: Props) {
  const data = useMemo(() => {
    const totals = pieceCumulative(sessions)
    const merged = pieces.map((p) => ({ piece: p, sec: totals[p.id] ?? 0 }))
    merged.sort((a, b) => b.sec - a.sec)
    return merged.filter((d) => d.sec > 0).slice(0, topN)
  }, [sessions, pieces, topN])

  if (data.length === 0) {
    return <div className="text-sm text-ink-500 dark:text-ink-400 py-8 text-center">레퍼토리 연습 기록 없음</div>
  }

  const max = data[0]?.sec ?? 0

  return (
    <ul className="space-y-2">
      {data.map(({ piece, sec }) => {
        const ratio = max > 0 ? sec / max : 0
        return (
          <li key={piece.id}>
            <Link to={`/repertoire/${piece.id}`} className="block group">
              <div className="flex justify-between text-xs mb-1">
                <span className="truncate group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                  {piece.title}
                  <span className="text-ink-500"> · {piece.composer}</span>
                </span>
                <span className="tabular text-ink-600 dark:text-ink-300 ml-2 shrink-0">{formatMinutes(sec)}</span>
              </div>
              <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-500 dark:bg-accent-600 transition-all"
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
