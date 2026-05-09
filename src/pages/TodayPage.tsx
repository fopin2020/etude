import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Play, Square } from 'lucide-react'
import { Button } from '../components/Button'
import { StartSessionDialog } from '../components/StartSessionDialog'
import { StopSessionDialog } from '../components/StopSessionDialog'
import { useTimerStore, computeElapsedSec } from '../store/timer'
import { db, getOrCreateGoals } from '../db/database'
import { CATEGORY_LABEL_KO } from '../types'
import { formatDuration, formatMinutes, isSameLocalDay, formatDateKo, startOfWeekLocal } from '../lib/format'

function useNow(refreshing: boolean): number {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!refreshing) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [refreshing])
  return now
}

export function TodayPage() {
  const [startOpen, setStartOpen] = useState(false)
  const [stopOpen, setStopOpen] = useState(false)
  const active = useTimerStore((s) => s.active)
  const now = useNow(!!active)

  const goals = useLiveQuery(() => getOrCreateGoals(), [])
  const todaySessions = useLiveQuery(async () => {
    const all = await db.sessions.toArray()
    return all.filter((s) => isSameLocalDay(s.date, new Date()))
  }, [])

  const todayCompletedSec = (todaySessions ?? []).reduce((acc, s) => acc + s.durationSec, 0)
  const liveSec = active ? computeElapsedSec(active, now) : 0
  const todayTotalSec = todayCompletedSec + liveSec

  const dailyGoalMin = goals?.dailyMin
  const dailyGoalSec = dailyGoalMin ? dailyGoalMin * 60 : null
  const progressPct =
    dailyGoalSec && dailyGoalSec > 0 ? Math.min(100, (todayTotalSec / dailyGoalSec) * 100) : null

  const weekSec = useLiveQuery(async () => {
    const since = startOfWeekLocal()
    const all = await db.sessions.toArray()
    return all.filter((s) => new Date(s.date) >= since).reduce((a, s) => a + s.durationSec, 0)
  }, []) ?? 0

  const recentByCategory: Record<string, number> = {}
  for (const s of todaySessions ?? []) {
    recentByCategory[s.category] = (recentByCategory[s.category] ?? 0) + s.durationSec
  }

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">{formatDateKo(new Date().toISOString(), 'M월 d일 (eee)')}</h1>
        <div className="text-sm text-ink-500 dark:text-ink-400">오늘의 연습</div>
      </div>

      <section className="bg-white dark:bg-ink-900 rounded-2xl p-6 lg:p-8 shadow-sm border border-ink-200 dark:border-ink-800">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
          <div className="flex-1">
            <div className="text-sm text-ink-500 dark:text-ink-400 mb-2">오늘 연습한 시간</div>
            <div className="tabular text-5xl lg:text-6xl font-bold mb-3">{formatDuration(todayTotalSec)}</div>
            {dailyGoalSec ? (
              <>
                <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400 mb-1">
                  <span>일일 목표 {dailyGoalMin}분</span>
                  <span className="tabular">{Math.round(progressPct!)}%</span>
                </div>
                <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-600 transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="text-xs text-ink-500 dark:text-ink-400">
                <a href="/settings" className="underline">설정에서 일일 목표를 정하면</a> 진행 바가 나타납니다.
              </div>
            )}
          </div>

          <div className="lg:w-64">
            {active ? (
              <Button size="lg" variant="danger" className="w-full" onClick={() => setStopOpen(true)}>
                <Square size={22} fill="currentColor" />
                연습 종료
              </Button>
            ) : (
              <Button size="lg" className="w-full" onClick={() => setStartOpen(true)}>
                <Play size={22} fill="currentColor" />
                연습 시작
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <section className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-ink-200 dark:border-ink-800">
          <h2 className="text-base font-semibold mb-4">이번 주</h2>
          <div className="tabular text-3xl font-bold mb-1">{formatMinutes(weekSec)}</div>
          {goals?.weeklyMin ? (
            <div className="text-xs text-ink-500 dark:text-ink-400">
              주간 목표 {goals.weeklyMin}분 중 {Math.round((weekSec / 60 / goals.weeklyMin) * 100)}%
            </div>
          ) : (
            <div className="text-xs text-ink-500 dark:text-ink-400">주간 목표 미설정</div>
          )}
        </section>

        <section className="bg-white dark:bg-ink-900 rounded-2xl p-6 border border-ink-200 dark:border-ink-800">
          <h2 className="text-base font-semibold mb-4">오늘의 카테고리 분배</h2>
          {Object.keys(recentByCategory).length === 0 ? (
            <div className="text-sm text-ink-500 dark:text-ink-400">아직 오늘 기록이 없습니다.</div>
          ) : (
            <ul className="space-y-2">
              {Object.entries(recentByCategory).map(([cat, sec]) => (
                <li key={cat} className="flex justify-between text-sm">
                  <span>{CATEGORY_LABEL_KO[cat as keyof typeof CATEGORY_LABEL_KO]}</span>
                  <span className="tabular text-ink-600 dark:text-ink-300">{formatMinutes(sec)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <StartSessionDialog open={startOpen} onClose={() => setStartOpen(false)} />
      <StopSessionDialog open={stopOpen} onClose={() => setStopOpen(false)} />
    </div>
  )
}
