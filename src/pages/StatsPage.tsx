import { BarChart3 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { CATEGORY_LABEL_KO } from '../types'
import { formatMinutes } from '../lib/format'

export function StatsPage() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? []
  const total = sessions.reduce((a, s) => a + s.durationSec, 0)

  const byCategory: Record<string, number> = {}
  for (const s of sessions) {
    byCategory[s.category] = (byCategory[s.category] ?? 0) + s.durationSec
  }

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-1">통계</h1>
      <div className="text-sm text-ink-500 dark:text-ink-400 mb-6">캘린더 히트맵·차트는 Phase 3에서 추가됩니다</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-5">
          <div className="text-xs text-ink-500 dark:text-ink-400">전체 누적 시간</div>
          <div className="tabular text-3xl font-bold mt-1">{formatMinutes(total)}</div>
          <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">{sessions.length}개 세션</div>
        </div>
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-5">
          <div className="text-xs text-ink-500 dark:text-ink-400 mb-3">카테고리 분배</div>
          {Object.keys(byCategory).length === 0 ? (
            <div className="text-sm text-ink-500 dark:text-ink-400">기록 없음</div>
          ) : (
            <ul className="space-y-1.5">
              {Object.entries(byCategory).map(([cat, sec]) => (
                <li key={cat} className="flex justify-between text-sm">
                  <span>{CATEGORY_LABEL_KO[cat as keyof typeof CATEGORY_LABEL_KO]}</span>
                  <span className="tabular text-ink-600 dark:text-ink-300">{formatMinutes(sec)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ink-100 dark:bg-ink-800 mb-4">
          <BarChart3 size={28} className="text-ink-400" />
        </div>
        <div className="font-semibold mb-1">상세 시각화 (Phase 3)</div>
        <div className="text-sm text-ink-500 dark:text-ink-400">
          캘린더 히트맵, 시간대 매트릭스, 도넛 차트, 곡별 누적 막대, 템포 진척도 라인,<br />
          방치 곡 알림 영역 — 모두 Phase 3에서 추가됩니다.
        </div>
      </div>
    </div>
  )
}
