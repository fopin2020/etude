import { useMemo } from 'react'
import { buildYearGrid } from '../../lib/analytics'
import type { Session } from '../../types'
import { formatDateKo, formatMinutes } from '../../lib/format'

interface Props {
  sessions: Session[]
}

const DOW = ['월', '화', '수', '목', '금', '토', '일']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

export function CalendarHeatmap({ sessions }: Props) {
  const grid = useMemo(() => buildYearGrid(sessions), [sessions])

  const colorFor = (sec: number): string => {
    if (sec === 0) return 'bg-ink-100 dark:bg-ink-800'
    const ratio = grid.maxSec > 0 ? Math.min(1, sec / grid.maxSec) : 0
    if (ratio < 0.2) return 'bg-accent-200 dark:bg-accent-900'
    if (ratio < 0.4) return 'bg-accent-300 dark:bg-accent-800'
    if (ratio < 0.6) return 'bg-accent-400 dark:bg-accent-700'
    if (ratio < 0.8) return 'bg-accent-500 dark:bg-accent-600'
    return 'bg-accent-600 dark:bg-accent-500'
  }

  const monthLabels: Array<{ index: number; label: string }> = []
  let lastMonth = -1
  grid.weeks.forEach((week, i) => {
    const firstDay = week.find((d) => d !== null)
    if (firstDay && firstDay.date.getMonth() !== lastMonth) {
      monthLabels.push({ index: i, label: MONTHS[firstDay.date.getMonth()]! })
      lastMonth = firstDay.date.getMonth()
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-1 mb-2 ml-7 text-[10px] text-ink-500 dark:text-ink-400">
          {grid.weeks.map((_, i) => {
            const m = monthLabels.find((x) => x.index === i)
            return (
              <div key={i} className="w-3" style={{ visibility: m ? 'visible' : 'hidden' }}>
                {m?.label}
              </div>
            )
          })}
        </div>
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 mr-1.5 pt-0.5">
            {DOW.map((d, i) => (
              <div key={d} className="h-3 text-[10px] text-ink-500 dark:text-ink-400 leading-3" style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}>
                {d}
              </div>
            ))}
          </div>
          {grid.weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={[
                    'w-3 h-3 rounded-sm transition-colors',
                    day ? colorFor(day.sec) : 'bg-transparent',
                  ].join(' ')}
                  title={day ? `${formatDateKo(day.date.toISOString(), 'M월 d일 (eee)')} · ${day.sec === 0 ? '연습 없음' : formatMinutes(day.sec)}` : ''}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-ink-500 dark:text-ink-400 justify-end">
          <span>적게</span>
          <div className="w-3 h-3 rounded-sm bg-ink-100 dark:bg-ink-800" />
          <div className="w-3 h-3 rounded-sm bg-accent-200 dark:bg-accent-900" />
          <div className="w-3 h-3 rounded-sm bg-accent-400 dark:bg-accent-700" />
          <div className="w-3 h-3 rounded-sm bg-accent-600 dark:bg-accent-500" />
          <span>많이</span>
        </div>
      </div>
    </div>
  )
}
