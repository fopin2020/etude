import { useMetronomeStore } from '../../store/metronome'
import type { AccelerationMode } from '../../metronome/types'

export function AccelerationPanel() {
  const config = useMetronomeStore((s) => s.config)
  const setConfig = useMetronomeStore((s) => s.setConfig)
  const enabled = !!config.acceleration
  const accel = config.acceleration

  const toggle = (on: boolean) => {
    if (on) {
      setConfig({
        acceleration: { mode: 'continuous', everyMeasures: 4, bpmIncrement: 5, maxBpm: Math.min(500, config.bpm + 60) },
      })
    } else {
      setConfig({ acceleration: null })
    }
  }

  const setMode = (mode: 'continuous' | 'sectional') => {
    if (mode === 'continuous') {
      setConfig({
        acceleration: { mode: 'continuous', everyMeasures: 4, bpmIncrement: 5, maxBpm: Math.min(500, config.bpm + 60) },
      })
    } else {
      setConfig({
        acceleration: { mode: 'sectional', measures: 4, repetitions: 3, bpmIncrement: 10, maxBpm: Math.min(500, config.bpm + 60) },
      })
    }
  }

  const update = (patch: Partial<AccelerationMode>) => {
    if (!accel) return
    setConfig({ acceleration: { ...accel, ...patch } as AccelerationMode })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">점진적 템포 증가</div>
          <div className="text-xs text-ink-500 dark:text-ink-400">가속 직전 1–2마디에 시각·청각 신호</div>
        </div>
        <Toggle checked={enabled} onChange={toggle} />
      </div>

      {enabled && accel && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <ModeButton
              active={accel.mode === 'continuous'}
              onClick={() => setMode('continuous')}
              title="연속 가속 (모드 A)"
              desc="N마디마다 +X BPM"
            />
            <ModeButton
              active={accel.mode === 'sectional'}
              onClick={() => setMode('sectional')}
              title="구간 반복 가속 (모드 B)"
              desc="X마디 N회 반복 → +Y BPM"
            />
          </div>

          {accel.mode === 'continuous' ? (
            <div className="grid grid-cols-3 gap-3">
              <NumField label="매 N마디" value={accel.everyMeasures} min={1} max={64}
                onChange={(v) => update({ everyMeasures: v })} />
              <NumField label="+X BPM" value={accel.bpmIncrement} min={1} max={50}
                onChange={(v) => update({ bpmIncrement: v })} />
              <NumField label="상한 BPM" value={accel.maxBpm} min={config.bpm} max={500}
                onChange={(v) => update({ maxBpm: v })} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <NumField label="구간 길이 (마디)" value={accel.measures} min={1} max={32}
                onChange={(v) => update({ measures: v })} />
              <NumField label="반복 횟수" value={accel.repetitions} min={1} max={20}
                onChange={(v) => update({ repetitions: v })} />
              <NumField label="+Y BPM" value={accel.bpmIncrement} min={1} max={50}
                onChange={(v) => update({ bpmIncrement: v })} />
              <NumField label="상한 BPM" value={accel.maxBpm} min={config.bpm} max={500}
                onChange={(v) => update({ maxBpm: v })} />
            </div>
          )}

          <div className="text-xs text-ink-500 dark:text-ink-400 italic">
            현재 설정: {summarizeAccel(accel, config.bpm)}
          </div>
        </>
      )}
    </div>
  )
}

function summarizeAccel(a: AccelerationMode, baseBpm: number): string {
  if (a.mode === 'continuous') {
    return `${baseBpm}부터 매 ${a.everyMeasures}마디마다 +${a.bpmIncrement}, 최대 ${a.maxBpm} BPM까지`
  }
  return `${baseBpm}부터 ${a.measures}마디 ${a.repetitions}회 반복 후 +${a.bpmIncrement}, 최대 ${a.maxBpm} BPM까지`
}

function NumField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
        className="w-full px-3 py-2.5 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-center tabular focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px]"
      />
    </label>
  )
}

function ModeButton({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={[
        'text-left px-4 py-3 rounded-lg border-2 transition min-h-[64px]',
        active
          ? 'border-accent-600 bg-accent-50 dark:bg-accent-950 text-accent-700 dark:text-accent-300'
          : 'border-ink-200 dark:border-ink-700',
      ].join(' ')}
    >
      <div className="font-medium text-sm">{title}</div>
      <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{desc}</div>
    </button>
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
