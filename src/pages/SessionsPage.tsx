import { useLiveQuery } from 'dexie-react-hooks'
import { Trash2 } from 'lucide-react'
import { db } from '../db/database'
import { deleteSession } from '../db/queries'
import { CATEGORY_LABEL_KO, type Session } from '../types'
import { formatDateKo, formatDuration } from '../lib/format'
import { Link } from 'react-router-dom'

export function SessionsPage() {
  const sessions = useLiveQuery(() => db.sessions.orderBy('date').reverse().toArray(), []) ?? []
  const piecesById = useLiveQuery(async () => {
    const all = await db.pieces.toArray()
    return Object.fromEntries(all.map((p) => [p.id, p]))
  }, []) ?? {}

  const handleDelete = async (id: string) => {
    if (!confirm('이 세션을 삭제할까요?')) return
    await deleteSession(id)
  }

  const grouped = groupByDate(sessions)

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-1">연습 기록</h1>
      <div className="text-sm text-ink-500 dark:text-ink-400 mb-6">총 {sessions.length}개 세션</div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800">
          <div className="text-sm text-ink-500 dark:text-ink-400">
            아직 기록된 세션이 없습니다. <Link to="/" className="text-accent-600 underline">연습을 시작</Link>해 보세요.
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ dateKey, items, totalSec }) => (
            <div key={dateKey} className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 overflow-hidden">
              <div className="flex justify-between items-center px-5 py-3 border-b border-ink-100 dark:border-ink-800 bg-ink-50/60 dark:bg-ink-950/40">
                <div className="font-semibold">{formatDateKo(items[0].date, 'M월 d일 (eee)')}</div>
                <div className="tabular text-sm text-ink-600 dark:text-ink-300">합계 {formatDuration(totalSec)}</div>
              </div>
              <ul className="divide-y divide-ink-100 dark:divide-ink-800">
                {items.map((s: Session) => {
                  const piece = s.pieceId ? piecesById[s.pieceId] : undefined
                  return (
                    <li key={s.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {CATEGORY_LABEL_KO[s.category]}
                          {piece && <span className="text-ink-500 dark:text-ink-400"> · {piece.title}</span>}
                        </div>
                        <div className="text-xs text-ink-500 dark:text-ink-400">
                          {formatDateKo(s.date, 'HH:mm')}
                        </div>
                      </div>
                      <div className="tabular text-sm font-medium">{formatDuration(s.durationSec)}</div>
                      <button
                        aria-label="삭제"
                        onClick={() => handleDelete(s.id)}
                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-ink-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function groupByDate(sessions: Session[]) {
  const map = new Map<string, { dateKey: string; items: Session[]; totalSec: number }>()
  for (const s of sessions) {
    const d = new Date(s.date)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    const slot = map.get(key) ?? { dateKey: key, items: [] as Session[], totalSec: 0 }
    slot.items.push(s)
    slot.totalSec += s.durationSec
    map.set(key, slot)
  }
  return Array.from(map.values())
}
