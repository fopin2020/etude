import { useMetronomeStore } from '../../store/metronome'

const COMMON: Array<[number, number]> = [
  [2, 4], [3, 4], [4, 4], [6, 8], [9, 8], [12, 8], [5, 8], [7, 8], [5, 4], [7, 4],
]

export function TimeSignaturePicker() {
  const config = useMetronomeStore((s) => s.config)
  const setConfig = useMetronomeStore((s) => s.setConfig)
  const [num, denom] = config.timeSignature

  const setBeats = (n: number) => {
    const clamped = Math.min(32, Math.max(1, n))
    let nextSubs = config.subdivisions
    if (Array.isArray(nextSubs)) {
      const arr = [...nextSubs]
      if (arr.length < clamped) {
        const fill = arr[0] ?? 1
        while (arr.length < clamped) arr.push(fill)
      } else if (arr.length > clamped) {
        arr.length = clamped
      }
      nextSubs = arr
    }
    setConfig({ timeSignature: [clamped, denom], subdivisions: nextSubs })
  }
  const setUnit = (d: number) => setConfig({ timeSignature: [num, d] satisfies [number, number] })

  const inputCls = 'w-20 text-center px-2 py-2 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 tabular text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px]'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3">
        <input type="number" min={1} max={32} value={num} onChange={(e) => setBeats(Number(e.target.value))} className={inputCls} />
        <span className="text-2xl text-ink-400">/</span>
        <select value={denom} onChange={(e) => setUnit(Number(e.target.value))} className={inputCls + ' w-24'}>
          {[2, 4, 8, 16].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {COMMON.map(([n, d]) => {
          const active = n === num && d === denom
          const onPreset = () => {
            let nextSubs = config.subdivisions
            if (Array.isArray(nextSubs)) {
              const arr = [...nextSubs]
              while (arr.length < n) arr.push(arr[0] ?? 1)
              arr.length = n
              nextSubs = arr
            }
            setConfig({ timeSignature: [n, d], subdivisions: nextSubs })
          }
          return (
            <button
              key={`${n}/${d}`}
              onClick={onPreset}
              className={[
                'px-3 py-2 rounded-md text-sm tabular min-h-[40px]',
                active
                  ? 'bg-accent-600 text-white'
                  : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700',
              ].join(' ')}
            >
              {n}/{d}
            </button>
          )
        })}
      </div>
    </div>
  )
}
