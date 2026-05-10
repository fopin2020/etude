import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { Clock, FileText } from 'lucide-react'
import { db, getOrCreateGoals } from '../db/database'
import { DEFAULT_NEGLECTED_DAYS } from '../types'
import { formatMinutes, formatRelativeKo } from '../lib/format'
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap'
import { HourHeatmap } from '../components/charts/HourHeatmap'
import { CategoryDonut } from '../components/charts/CategoryDonut'
import { PieceCumulativeBar } from '../components/charts/PieceCumulativeBar'
import { computeNeglected, computeStreak } from '../lib/analytics'
import { Button } from '../components/Button'
import { ReportDialog } from '../components/ReportDialog'

export function StatsPage() {
  const [reportOpen, setReportOpen] = useState(false)
  const sessions = useLiveQuery(() => db.sessions.toArray(), []) ?? []
  const pieces = useLiveQuery(() => db.pieces.toArray(), []) ?? []
  const goals = useLiveQuery(() => getOrCreateGoals(), [])

  const total = sessions.reduce((a, s) => a + s.durationSec, 0)
  const longTermSec = (goals?.longTermTotalHours ?? 0) * 3600
  const longTermPct = longTermSec > 0 ? Math.min(100, (total / longTermSec) * 100) : null

  const neglectedThreshold = goals?.neglectedThresholdDays ?? DEFAULT_NEGLECTED_DAYS
  const neglected = computeNeglected(pieces, sessions, neglectedThreshold)
  const piecesById = Object.fromEntries(pieces.map((p) => [p.id, p]))

  const streak = goals
    ? computeStreak(sessions, goals)
    : { current: 0, best: 0, weekRestUsed: 0, weekRestBudget: 0, todaySatisfied: false }

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">통계</h1>
          <div className="text-sm text-ink-500 dark:text-ink-400">연습 패턴과 진척도</div>
        </div>
        <Button variant="secondary" onClick={() => setReportOpen(true)}>
          <FileText size={18} /> 주간 리포트
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="전체 누적" value={formatMinutes(total)} sub={`${sessions.length}회 세션`} />
        <SummaryCard label="현재 연속 기록" value={`${streak.current}일`} sub={streak.weekRestBudget > 0 ? `이번 주 보호일 ${streak.weekRestUsed}/${streak.weekRestBudget}` : ''} />
        <SummaryCard label="최고 연속 기록" value={`${streak.best}일`} sub="" />
        <SummaryCard
          label="장기 목표"
          value={
            goals?.longTermTotalHours
              ? `${Math.round((total / 3600) * 10) / 10} / ${goals.longTermTotalHours}h`
              : '—'
          }
          sub={longTermPct !== null ? `${Math.round(longTermPct)}%` : '미설정'}
        />
      </div>

      <Section title="365일 캘린더 히트맵">
        <CalendarHeatmap sessions={sessions} />
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="요일·시간대 분포">
          <HourHeatmap sessions={sessions} />
        </Section>
        <Section title="카테고리 분배">
          <CategoryDonut sessions={sessions} />
        </Section>
      </div>

      <Section title="곡별 누적 시간 (상위 10)">
        <PieceCumulativeBar sessions={sessions} pieces={pieces} topN={10} />
      </Section>

      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} />

      <Section title={`방치 곡 (${neglectedThreshold}일+ 연습 없음)`}>
        {neglected.length === 0 ? (
          <div className="text-sm text-ink-500 dark:text-ink-400 py-4">
            방치된 곡이 없습니다. 모든 곡이 최근 {neglectedThreshold}일 이내에 다뤄졌습니다.
          </div>
        ) : (
          <ul className="space-y-2">
            {neglected.map((n) => {
              const piece = piecesById[n.pieceId]
              if (!piece) return null
              return (
                <li key={n.pieceId}>
                  <Link
                    to={`/repertoire/${n.pieceId}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-ink-200 dark:border-ink-800 hover:border-amber-400 dark:hover:border-amber-700 transition"
                  >
                    <Clock size={18} className="text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{piece.title}</div>
                      <div className="text-xs text-ink-500 dark:text-ink-400">
                        {piece.composer}
                        {n.lastDate ? ` · 마지막 연습 ${formatRelativeKo(n.lastDate)}` : ' · 아직 연습 없음'}
                      </div>
                    </div>
                    <div className="tabular text-sm font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                      {n.daysSince}일
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-5 lg:p-6">
      <h2 className="text-base font-semibold mb-4">{title}</h2>
      {children}
    </section>
  )
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-5">
      <div className="text-xs text-ink-500 dark:text-ink-400">{label}</div>
      <div className="tabular text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">{sub}</div>}
    </div>
  )
}
