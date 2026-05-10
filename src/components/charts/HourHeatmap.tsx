import { useMemo } from 'react'
import { bucketByHour } from '../../lib/analytics'
import type { Session } from '../../types'
import { formatMinutes } from '../../lib/format'

interface Props {
  sessions: Session[]
}

const DOW = ['월', '화', '수', '목', '금', '토', '일']

export function HourHeatmap({ sessions }: Props) {
  const data = useMemo(() => bucketByHour(sessions), [sessions])

  const colorFor = (sec: number): string => {
    if (sec === 0) return 'bg-ink-100 dark:bg-ink-800'
    const ratio = data.maxSec > 0 ? Math.min(1, sec / data.maxSec) : 0
    if (ratio < 0.2) return 'bg-accent-200 dark:bg-accent-900'
    if (ratio < 0.4) return 'bg-accent-300 dark:bg-accent-800'
    if (ratio < 0.6) return 'bg-accent-400 dark:bg-accent-700'
    if (ratio < 0.8) return 'bg-accent-500 dark:bg-accent-600'
    return 'bg-accent-600 dark:bg-accent-500'
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex gap-px ml-8">
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="w-5 text-[10px] text-ink-500 dark:text-ink-400 text-center" style={{ visibility: h % 3 === 0 ? 'visible' : 'hidden' }}>
              {h}
            </div>
          ))}
        </div>
        {data.matrix.map((row, dow) => (
          <div key={dow} className="flex items-center gap-px">
            <div className="w-7 text-[11px] text-ink-500 dark:text-ink-400 text-right pr-2">{DOW[dow]}</div>
            {row.map((sec, h) => (
              <div
                key={h}
                className={[
                  'w-5 h-5 my-px rounded-sm transition-colors',
                  colorFor(sec),
                ].join(' ')}
                title={`${DOW[dow]}요일 ${h}시 · ${sec === 0 ? '연습 없음' : formatMinutes(sec)}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
