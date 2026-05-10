import { useEffect, useState } from 'react'
import { useMetronomeStore } from '../../store/metronome'
import { detectHeadphones, onDeviceChange, type HeadphoneStatus } from '../../metronome/detectHeadphones'

export function PolyrhythmPanel() {
  const config = useMetronomeStore((s) => s.config)
  const setConfig = useMetronomeStore((s) => s.setConfig)
  const enabled = !!config.polyrhythm
  const [headphones, setHeadphones] = useState<HeadphoneStatus>('unknown')

  useEffect(() => {
    let cancelled = false
    const refresh = async () => {
      const status = await detectHeadphones()
      if (!cancelled) setHeadphones(status)
    }
    void refresh()
    const off = onDeviceChange(() => void refresh())
    return () => {
      cancelled = true
      off()
    }
  }, [])

  useEffect(() => {
    if (!enabled || !config.polyrhythm) return
    if (headphones === 'present' && !config.polyrhythm.splitChannels) {
      setConfig({ polyrhythm: { ...config.polyrhythm, splitChannels: true } })
    } else if (headphones === 'absent' && config.polyrhythm.splitChannels) {
      setConfig({ polyrhythm: { ...config.polyrhythm, splitChannels: false } })
    }
  }, [headphones, enabled, config.polyrhythm, setConfig])

  const toggle = (on: boolean) => {
    if (on) {
      setConfig({ polyrhythm: { primary: 3, secondary: 4, splitChannels: headphones === 'present' } })
    } else {
      setConfig({ polyrhythm: null })
    }
  }

  const update = (patch: Partial<{ primary: number; secondary: number; splitChannels: boolean }>) => {
    if (!config.polyrhythm) return
    setConfig({ polyrhythm: { ...config.polyrhythm, ...patch } })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">폴리리듬</div>
          <div className="text-xs text-ink-500 dark:text-ink-400">두 분할을 동시에 재생</div>
        </div>
        <Toggle checked={enabled} onChange={toggle} />
      </div>

      {enabled && config.polyrhythm && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <NumField label="기본 (왼손 / L)" value={config.polyrhythm.primary} onChange={(v) => update({ primary: v })} />
            <NumField label="보조 (오른손 / R)" value={config.polyrhythm.secondary} onChange={(v) => update({ secondary: v })} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-800">
            <div>
              <div className="text-sm font-medium">좌우 채널 분리</div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                {headphones === 'present'
                  ? '이어폰 감지됨 — 자동으로 켜짐'
                  : headphones === 'absent'
                    ? '이어폰 미감지 — 기본 OFF'
                    : '이어폰 감지 불가 — 수동 토글 (브라우저 권한이 없으면 라벨이 비어 있어 자동 감지가 안 됩니다)'}
              </div>
            </div>
            <Toggle
              checked={config.polyrhythm.splitChannels}
              onChange={(v) => update({ splitChannels: v })}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-ink-500 dark:text-ink-400 self-center">자주 쓰는 조합:</span>
            {([
              [3, 4], [4, 3], [4, 5], [5, 4], [5, 6], [3, 5], [2, 3],
            ] as Array<[number, number]>).map(([p, s]) => (
              <button
                key={`${p}-${s}`}
                onClick={() => update({ primary: p, secondary: s })}
                className="px-2.5 py-1 text-xs rounded-md bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700"
              >
                {p}:{s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">{label}</span>
      <input
        type="number"
        min={2}
        max={9}
        value={value}
        onChange={(e) => onChange(Math.min(9, Math.max(2, Number(e.target.value))))}
        className="w-full px-3 py-2.5 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-center tabular text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px]"
      />
    </label>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-7 w-12 items-center rounded-full transition shrink-0',
        checked ? 'bg-accent-600' : 'bg-ink-300 dark:bg-ink-700',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-5 w-5 rounded-full bg-white shadow transform transition',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}
