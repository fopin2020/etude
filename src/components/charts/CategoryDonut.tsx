import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { CATEGORY_LABEL_KO, type Category } from '../../types'
import type { Session } from '../../types'
import { categoryBreakdown } from '../../lib/analytics'
import { formatMinutes } from '../../lib/format'

interface Props {
  sessions: Session[]
}

const COLORS: Record<Category, string> = {
  technique: '#6366f1',
  etude: '#8b5cf6',
  repertoire: '#06b6d4',
  theory: '#f59e0b',
}

export function CategoryDonut({ sessions }: Props) {
  const data = categoryBreakdown(sessions).map((d) => ({
    ...d,
    label: CATEGORY_LABEL_KO[d.name as Category] ?? d.name,
    color: COLORS[d.name as Category] ?? '#94a3b8',
  }))
  const total = data.reduce((a, d) => a + d.sec, 0)

  if (total === 0) {
    return <div className="text-sm text-ink-500 dark:text-ink-400 py-8 text-center">기록 없음</div>
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="w-44 h-44 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="sec"
              nameKey="label"
              innerRadius={48}
              outerRadius={80}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [formatMinutes(typeof v === 'number' ? v : Number(v) || 0), '시간']}
              contentStyle={{ borderRadius: 8, border: '1px solid rgb(203 213 225)', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="tabular text-lg font-semibold leading-none">{formatMinutes(total)}</div>
          <div className="text-[10px] text-ink-500 dark:text-ink-400 mt-0.5">총합</div>
        </div>
      </div>
      <ul className="flex-1 space-y-2 text-sm">
        {data
          .sort((a, b) => b.sec - a.sec)
          .map((d) => (
            <li key={d.name} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: d.color }} />
              <span className="flex-1">{d.label}</span>
              <span className="tabular text-ink-600 dark:text-ink-300">{formatMinutes(d.sec)}</span>
              <span className="tabular text-ink-500 dark:text-ink-400 text-xs w-10 text-right">
                {Math.round((d.sec / total) * 100)}%
              </span>
            </li>
          ))}
      </ul>
    </div>
  )
}
