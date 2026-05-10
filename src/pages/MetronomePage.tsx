import { useEffect, useRef, useState } from 'react'
import { Play, Square, Minus, Plus } from 'lucide-react'
import { Button } from '../components/Button'
import { NumberField } from '../components/NumberField'
import { MetronomeEngine, type AccelConfig } from '../lib/metronome'

export function MetronomePage() {
  const engineRef = useRef<MetronomeEngine | null>(null)
  if (!engineRef.current) engineRef.current = new MetronomeEngine()
  const engine = engineRef.current

  const [, force] = useState(0)
  const rerender = () => force((n) => n + 1)
  const [activeBeat, setActiveBeat] = useState<number>(-1)
  const [activeSubdiv, setActiveSubdiv] = useState<number>(-1)

  // accel UI state — independent of engine until committed via effect below
  const [accelMode, setAccelMode] = useState<AccelConfig['mode']>('off')
  const [contEvery, setContEvery] = useState(2)
  const [contInc, setContInc] = useState(2)
  const [contMax, setContMax] = useState(200)
  const [secMeasures, setSecMeasures] = useState(4)
  const [secReps, setSecReps] = useState(5)
  const [secInc, setSecInc] = useState(10)
  const [secMax, setSecMax] = useState(200)

  useEffect(() => {
    engine.onStateChange = rerender
    engine.onTick = (e) => {
      setActiveBeat(e.beatIdx)
      setActiveSubdiv(e.subdivIdx)
    }
    return () => {
      engine.onStateChange = null
      engine.onTick = null
      engine.stop()
    }
  }, [engine])

  // Keep engine in sync with accel UI
  useEffect(() => {
    if (accelMode === 'off') {
      engine.setAccel({ mode: 'off' })
    } else if (accelMode === 'continuous') {
      engine.setAccel({ mode: 'continuous', everyMeasures: contEvery, bpmIncrement: contInc, maxBpm: contMax })
    } else {
      engine.setAccel({ mode: 'sectional', measures: secMeasures, repetitions: secReps, bpmIncrement: secInc, maxBpm: secMax })
    }
  }, [engine, accelMode, contEvery, contInc, contMax, secMeasures, secReps, secInc, secMax])

  const handleBpm = (n: number) => engine.setBpm(n)
  const handleBeats = (n: number) => engine.setBeatsPerMeasure(n)
  const handleSubdiv = (n: number) => engine.setSubdivision(n)

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-10 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-1">메트로놈</h1>
        <div className="text-sm text-ink-500 dark:text-ink-400">정밀 스케줄러 · 분할 · 점진적 가속</div>
      </div>

      {/* HERO: BPM + transport + beat indicator */}
      <section className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 shadow-sm p-8 lg:p-10 mb-6">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
          {/* BPM control */}
          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400 mb-3">Tempo · BPM</div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleBpm(engine.bpm - 1)}
                aria-label="BPM 감소"
                className="w-11 h-11 rounded-full border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center justify-center transition shrink-0"
              >
                <Minus size={18} />
              </button>
              <NumberField
                value={engine.bpm}
                onChange={handleBpm}
                min={30}
                max={500}
                aria-label="BPM 직접 입력"
                className="font-serif text-7xl lg:text-8xl font-bold w-44 lg:w-52 text-center bg-transparent outline-none focus:bg-ink-50 dark:focus:bg-ink-800 rounded-xl px-2 py-1 text-accent-700 dark:text-accent-300 caret-accent-500"
              />
              <button
                onClick={() => handleBpm(engine.bpm + 1)}
                aria-label="BPM 증가"
                className="w-11 h-11 rounded-full border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 flex items-center justify-center transition shrink-0"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="text-xs text-ink-400 dark:text-ink-500 mt-2 ml-1">30 – 500 · 숫자를 직접 입력하거나 ↑↓ 화살표로 조정</div>
          </div>

          {/* Transport */}
          <div className="lg:w-56">
            {engine.isRunning ? (
              <Button size="lg" variant="danger" className="w-full" onClick={() => engine.stop()}>
                <Square size={22} fill="currentColor" />정지
              </Button>
            ) : (
              <Button size="lg" className="w-full" onClick={() => engine.start()}>
                <Play size={22} fill="currentColor" />시작
              </Button>
            )}
          </div>
        </div>

        {/* Beat indicator */}
        <div className="mt-10 flex items-end justify-center gap-2">
          {Array.from({ length: engine.beatsPerMeasure }).map((_, i) => (
            <BeatLamp key={i} active={engine.isRunning && activeBeat === i} downbeat={i === 0} />
          ))}
        </div>
        {engine.subdivision > 1 && (
          <div className="mt-3 flex items-center justify-center gap-1 text-[11px] tabular text-ink-500 dark:text-ink-400">
            <span className="opacity-70">박당 분할:</span>
            <span className="text-accent-600 dark:text-accent-300 font-semibold">{engine.subdivision}</span>
            {engine.isRunning && activeSubdiv >= 0 && (
              <span className="opacity-70">· 현재 {activeSubdiv + 1}/{engine.subdivision}</span>
            )}
          </div>
        )}
      </section>

      {/* Time signature & subdivision */}
      <section className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 shadow-sm p-6 lg:p-8 mb-6">
        <h2 className="font-serif text-xl font-semibold mb-1">박자 · 분할</h2>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">한 마디의 박 수, 한 박을 몇 등분할지.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="한 마디 박 수" hint="1 – 16">
            <NumberField
              value={engine.beatsPerMeasure}
              onChange={handleBeats}
              min={1}
              max={16}
              className={inputCls}
            />
          </Field>
          <Field label="박당 분할 수" hint="1 = 정박 / 2 = 8분 / 3 = 셋잇단 / 4 = 16분 / 6 = 6잇단">
            <NumberField
              value={engine.subdivision}
              onChange={handleSubdiv}
              min={1}
              max={9}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {/* Acceleration */}
      <section className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 shadow-sm p-6 lg:p-8">
        <h2 className="font-serif text-xl font-semibold mb-1">점진적 템포 증가</h2>
        <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">
          정해둔 마디가 지나면 자동으로 BPM을 올려가며 연습합니다. 빈 칸으로 두면 입력 후 자동 보정됩니다.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { v: 'off' as const, l: '끄기' },
            { v: 'continuous' as const, l: '매 N마디마다 +M' },
            { v: 'sectional' as const, l: '구간 N회 반복 후 +M' },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setAccelMode(v)}
              className={[
                'px-4 py-2 rounded-full text-sm font-medium border transition min-h-[40px]',
                accelMode === v
                  ? 'bg-accent-500 text-white border-accent-500 shadow-sm'
                  : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800',
              ].join(' ')}
            >
              {l}
            </button>
          ))}
        </div>

        {accelMode === 'continuous' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="N마디마다" hint="이만큼의 마디가 지나면">
              <NumberField value={contEvery} onChange={setContEvery} min={1} max={64} className={inputCls} />
            </Field>
            <Field label="+ BPM 증가" hint="이만큼 BPM 상승">
              <NumberField value={contInc} onChange={setContInc} min={1} max={50} className={inputCls} />
            </Field>
            <Field label="최대 BPM" hint="이 BPM에서 가속 멈춤">
              <NumberField value={contMax} onChange={setContMax} min={60} max={500} className={inputCls} />
            </Field>
          </div>
        )}

        {accelMode === 'sectional' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <Field label="구간 마디 수" hint="한 구간의 길이">
              <NumberField value={secMeasures} onChange={setSecMeasures} min={1} max={64} className={inputCls} />
            </Field>
            <Field label="반복 횟수" hint="한 BPM에서 몇 번 반복">
              <NumberField value={secReps} onChange={setSecReps} min={1} max={50} className={inputCls} />
            </Field>
            <Field label="+ BPM 증가" hint="반복 끝에 이만큼 상승">
              <NumberField value={secInc} onChange={setSecInc} min={1} max={50} className={inputCls} />
            </Field>
            <Field label="최대 BPM" hint="이 BPM에서 가속 멈춤">
              <NumberField value={secMax} onChange={setSecMax} min={60} max={500} className={inputCls} />
            </Field>
          </div>
        )}

        {accelMode !== 'off' && (
          <div className="mt-5 px-4 py-3 rounded-lg bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-900 text-sm text-accent-800 dark:text-accent-200">
            {accelMode === 'continuous'
              ? `현재 설정: 매 ${contEvery}마디마다 +${contInc} BPM, 최대 ${contMax} BPM`
              : `현재 설정: ${secMeasures}마디 × ${secReps}회 반복마다 +${secInc} BPM, 최대 ${secMax} BPM`}
          </div>
        )}
      </section>
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2.5 rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 ' +
  'tabular text-lg text-center focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink-700 dark:text-ink-200 mb-1.5">{label}</label>
      {children}
      {hint && <div className="text-[11px] text-ink-400 dark:text-ink-500 mt-1.5 ml-0.5">{hint}</div>}
    </div>
  )
}

function BeatLamp({ active, downbeat }: { active: boolean; downbeat: boolean }) {
  return (
    <div
      className={[
        'rounded-full transition-all duration-100',
        downbeat ? 'h-4 w-12' : 'h-3 w-7',
        active
          ? downbeat
            ? 'bg-accent-500 shadow-[0_0_18px_rgba(190,138,82,0.6)]'
            : 'bg-accent-400 shadow-[0_0_12px_rgba(212,165,116,0.5)]'
          : 'bg-ink-200 dark:bg-ink-800',
      ].join(' ')}
    />
  )
}
