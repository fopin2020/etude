import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { Piece } from '../../types'
import { formatDateKo } from '../../lib/format'

interface Props {
  piece: Piece
}

export function TempoLine({ piece }: Props) {
  const log = piece.tempoLog
  if (log.length === 0) {
    return (
      <div className="text-sm text-ink-500 dark:text-ink-400 p-4 bg-ink-50 dark:bg-ink-950 rounded-lg">
        템포 진척도 기록이 없습니다. 메트로놈을 곡과 연동해 사용하면 정지 시 자동으로 기록됩니다.
      </div>
    )
  }

  const data = log
    .map((p) => ({ ts: new Date(p.date).getTime(), bpm: p.bpm, section: p.section }))
    .sort((a, b) => a.ts - b.ts)

  const minBpm = Math.min(...data.map((d) => d.bpm))
  const maxBpm = Math.max(...data.map((d) => d.bpm))
  const pad = Math.max(5, Math.round((maxBpm - minBpm) * 0.1))

  return (
    <div className="w-full h-56">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
          <XAxis
            dataKey="ts"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t) => formatDateKo(new Date(t).toISOString(), 'M/d')}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            stroke="rgba(100,116,139,0.5)"
          />
          <YAxis
            domain={[Math.max(0, minBpm - pad), maxBpm + pad]}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            stroke="rgba(100,116,139,0.5)"
            width={36}
          />
          <Tooltip
            labelFormatter={(t) => formatDateKo(new Date(t as number).toISOString(), 'yyyy년 M월 d일 HH:mm')}
            formatter={(v, _name, item) => {
              const payload = (item as { payload?: { section?: string } } | undefined)?.payload
              const sec = payload?.section
              return [`${v} BPM${sec ? ` · ${sec}` : ''}`, '도달 BPM']
            }}
            contentStyle={{ borderRadius: 8, border: '1px solid rgb(203 213 225)', fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="bpm"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4, fill: '#6366f1' }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
