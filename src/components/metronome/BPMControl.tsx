import { Minus, Plus } from 'lucide-react'
import { useMetronomeStore } from '../../store/metronome'

export function BPMControl() {
  const config = useMetronomeStore((s) => s.config)
  const setConfig = useMetronomeStore((s) => s.setConfig)
  const currentBpm = useMetronomeStore((s) => s.currentBpm)
  const isRunning = useMetronomeStore((s) => s.isRunning)

  const bpm = config.bpm
  const setBpm = (v: number) => setConfig({ bpm: Math.min(500, Math.max(30, Math.round(v))) })

  const displayBpm = isRunning ? currentBpm : bpm
  const showRuntime = isRunning && currentBpm !== bpm

  return (
    <div className="select-none">
      <div className="flex items-baseline justify-center gap-3 mb-3">
        <div className="tabular text-7xl md:text-8xl font-bold leading-none">
          {Math.round(displayBpm)}
        </div>
        <div className="text-xl text-ink-500 dark:text-ink-400">BPM</div>
      </div>
      {showRuntime && (
        <div className="text-center text-xs text-ink-500 dark:text-ink-400 mb-2">
          기준 {bpm} → 가속 중
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mb-3">
        <BumpButton onClick={() => setBpm(bpm - 5)} label="-5" />
        <BumpButton onClick={() => setBpm(bpm - 1)} icon={<Minus size={20} />} />
        <BumpButton onClick={() => setBpm(bpm + 1)} icon={<Plus size={20} />} />
        <BumpButton onClick={() => setBpm(bpm + 5)} label="+5" />
      </div>

      <input
        type="range"
        min={30}
        max={500}
        step={1}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
        className="w-full accent-accent-600 h-2 cursor-pointer"
        aria-label="BPM"
      />
      <div className="flex justify-between text-[11px] text-ink-500 dark:text-ink-400 mt-1">
        <span>30</span>
        <span>120</span>
        <span>240</span>
        <span>360</span>
        <span>500</span>
      </div>
    </div>
  )
}

function BumpButton({ onClick, label, icon }: { onClick: () => void; label?: string; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="min-w-[52px] min-h-[52px] px-3 rounded-lg bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-800 dark:text-ink-100 text-base font-semibold flex items-center justify-center"
    >
      {icon ?? label}
    </button>
  )
}
