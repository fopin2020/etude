import { useState } from 'react'
import { useMetronomeStore } from '../../store/metronome'

const PRESET_LABELS: Record<number, string> = {
  1: '없음', 2: '8분', 3: '셋잇단', 4: '16분', 5: '5잇단', 6: '6잇단', 7: '7잇단', 8: '32분', 9: '9잇단',
}

export function SubdivisionsPicker() {
  const config = useMetronomeStore((s) => s.config)
  const setConfig = useMetronomeStore((s) => s.setConfig)
  const isPolyOn = !!config.polyrhythm
  const [perBeatMode, setPerBeatMode] = useState<boolean>(Array.isArray(config.subdivisions))
  const [beats] = config.timeSignature

  if (isPolyOn) {
    return (
      <div className="text-sm text-ink-500 dark:text-ink-400 italic">
        폴리리듬 모드에서는 분할 설정이 비활성화됩니다.
      </div>
    )
  }

  const setUniform = (n: number) => setConfig({ subdivisions: n })
  const setPerBeat = (idx: number, n: number) => {
    let arr = Array.isArray(config.subdivisions)
      ? [...config.subdivisions]
      : Array(beats).fill(typeof config.subdivisions === 'number' ? config.subdivisions : 1)
    while (arr.length < beats) arr.push(arr[0] ?? 1)
    arr[idx] = n
    setConfig({ subdivisions: arr })
  }

  const togglePerBeat = (on: boolean) => {
    setPerBeatMode(on)
    if (on) {
      const base = typeof config.subdivisions === 'number' ? config.subdivisions : (config.subdivisions[0] ?? 1)
      setConfig({ subdivisions: Array(beats).fill(base) })
    } else {
      const base = Array.isArray(config.subdivisions) ? (config.subdivisions[0] ?? 1) : config.subdivisions
      setConfig({ subdivisions: base })
    }
  }

  const uniformValue = typeof config.subdivisions === 'number' ? config.subdivisions : null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-ink-600 dark:text-ink-300">
          {perBeatMode ? '박별로 다르게' : '모든 박 동일'}
        </div>
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={perBeatMode}
            onChange={(e) => togglePerBeat(e.target.checked)}
            className="w-5 h-5 accent-accent-600"
          />
          <span>박별 다른 분할</span>
        </label>
      </div>

      {!perBeatMode ? (
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => setUniform(n)}
              className={[
                'min-h-[52px] rounded-lg border-2 text-center px-2 py-2',
                uniformValue === n
                  ? 'border-accent-600 bg-accent-50 dark:bg-accent-950 text-accent-700 dark:text-accent-300'
                  : 'border-ink-200 dark:border-ink-700',
              ].join(' ')}
            >
              <div className="text-lg font-semibold tabular">{n}</div>
              <div className="text-[10px] text-ink-500">{PRESET_LABELS[n]}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: beats }).map((_, b) => {
            const arr = Array.isArray(config.subdivisions) ? config.subdivisions : []
            const value = arr[b] ?? 1
            return (
              <div key={b} className="rounded-lg border border-ink-200 dark:border-ink-800 p-3">
                <div className="text-[11px] text-ink-500 mb-2">박 {b + 1}</div>
                <select
                  value={value}
                  onChange={(e) => setPerBeat(b, Number(e.target.value))}
                  className="w-full px-2 py-2 rounded-md border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 tabular focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n}>{n} ({PRESET_LABELS[n]})</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
