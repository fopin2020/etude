import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Play, Square, Music2, ChevronDown, Activity } from 'lucide-react'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { BPMControl } from '../components/metronome/BPMControl'
import { TimeSignaturePicker } from '../components/metronome/TimeSignaturePicker'
import { BeatVisualizer } from '../components/metronome/BeatVisualizer'
import { SubdivisionsPicker } from '../components/metronome/SubdivisionsPicker'
import { PolyrhythmPanel } from '../components/metronome/PolyrhythmPanel'
import { AccelerationPanel } from '../components/metronome/AccelerationPanel'
import { useMetronomeStore, getMetronomeEngine } from '../store/metronome'
import { db } from '../db/database'

export function MetronomePage() {
  const [params] = useSearchParams()
  const pieceId = params.get('piece') ?? undefined
  const debug = params.get('debug') === '1'
  const piece = useLiveQuery(async () => (pieceId ? db.pieces.get(pieceId) : undefined), [pieceId])

  const config = useMetronomeStore((s) => s.config)
  const isRunning = useMetronomeStore((s) => s.isRunning)
  const cueLevel = useMetronomeStore((s) => s.cueLevel)
  const currentMeasureIdx = useMetronomeStore((s) => s.currentMeasureIdx)
  const currentBpm = useMetronomeStore((s) => s.currentBpm)
  const start = useMetronomeStore((s) => s.start)
  const stop = useMetronomeStore((s) => s.stop)
  const setConfig = useMetronomeStore((s) => s.setConfig)

  const [showLog, setShowLog] = useState<{ reachedBpm: number } | null>(null)
  const [accuracyReport, setAccuracyReport] = useState<string | null>(null)
  const [accuracyOn, setAccuracyOn] = useState<boolean>(debug)

  // Piece linkage: load piece's last logged BPM if present and not already showing it
  useEffect(() => {
    if (!piece) return
    if (config.pieceId === piece.id) return
    const last = piece.tempoLog.at(-1)
    setConfig({
      pieceId: piece.id,
      bpm: last ? last.bpm : config.bpm,
    })
  }, [piece, config.pieceId, config.bpm, setConfig])

  // Save tempoLog on stop
  useEffect(() => {
    const engine = getMetronomeEngine()
    return engine.on((e) => {
      if (e.type !== 'stopped') return
      if (config.pieceId && e.reachedBpm > 0) {
        setShowLog({ reachedBpm: Math.round(e.reachedBpm) })
      }
      if (accuracyOn) {
        const r = engine.getAccuracyReport()
        if (r) {
          const expected = (r.expectedSec * 1000).toFixed(3)
          const min = (r.minSec * 1000).toFixed(3)
          const max = (r.maxSec * 1000).toFixed(3)
          const avg = (r.avgSec * 1000).toFixed(3)
          const std = (r.stdDevSec * 1000).toFixed(3)
          setAccuracyReport(
            `BPM ${config.bpm} · ${r.count} 박자 측정\n` +
            `기대 박간격: ${expected} ms\n` +
            `평균: ${avg} ms (편차 ${r.deviationPct.toFixed(4)}%)\n` +
            `최소/최대: ${min} / ${max} ms\n` +
            `표준편차: ${std} ms`,
          )
          // eslint-disable-next-line no-console
          console.log('[metronome:accuracy]', r)
        }
      }
    })
  }, [config.pieceId, accuracyOn, config.bpm])

  const handleStartStop = async () => {
    const engine = getMetronomeEngine()
    if (isRunning) {
      stop()
    } else {
      engine.setAccuracyLogging(accuracyOn)
      await start()
    }
  }

  const handleSaveTempo = async (sectionNote?: string) => {
    if (!showLog || !config.pieceId) {
      setShowLog(null)
      return
    }
    await db.pieces
      .where('id')
      .equals(config.pieceId)
      .modify((p) => {
        p.tempoLog.push({
          date: new Date().toISOString(),
          bpm: showLog.reachedBpm,
          section: sectionNote || undefined,
        })
        p.updatedAt = new Date().toISOString()
      })
    setShowLog(null)
  }

  const cueOverlayClass =
    cueLevel === 2
      ? 'ring-8 ring-amber-500/70'
      : cueLevel === 1
        ? 'ring-4 ring-amber-400/40'
        : ''

  return (
    <div className={`px-6 py-6 lg:px-10 lg:py-8 max-w-5xl mx-auto transition-shadow ${cueOverlayClass} rounded-2xl`}>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">메트로놈</h1>
          {piece ? (
            <Link to={`/repertoire/${piece.id}`} className="inline-flex items-center gap-1.5 mt-1 text-sm text-accent-600 dark:text-accent-400">
              <Music2 size={14} />
              {piece.title} <span className="text-ink-500">— {piece.composer}</span>
            </Link>
          ) : (
            <div className="text-sm text-ink-500 dark:text-ink-400">독립 모드 · 곡 카드에서 메트로놈을 열면 자동 연동됩니다</div>
          )}
        </div>
        {isRunning && (
          <div className="text-sm tabular text-ink-600 dark:text-ink-300">
            마디 {currentMeasureIdx + 1} · {Math.round(currentBpm)} BPM
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-6 lg:p-8">
          <BPMControl />
          <div className="mt-6">
            <BeatVisualizer />
          </div>
          <div className="mt-6 flex justify-center">
            {isRunning ? (
              <Button size="lg" variant="danger" onClick={() => void handleStartStop()} className="px-10">
                <Square size={22} fill="currentColor" /> 정지
              </Button>
            ) : (
              <Button size="lg" onClick={() => void handleStartStop()} className="px-10">
                <Play size={22} fill="currentColor" /> 시작
              </Button>
            )}
          </div>
          {accuracyOn && (
            <div className="mt-4 text-xs text-ink-500 dark:text-ink-400 text-center flex items-center justify-center gap-1.5">
              <Activity size={12} /> 정확도 측정 중 — 정지 시 결과 출력
            </div>
          )}
        </section>

        <div className="space-y-4">
          <Card title="박자표">
            <TimeSignaturePicker />
          </Card>
          <Collapsible title="분할 (Subdivisions)" defaultOpen>
            <SubdivisionsPicker />
          </Collapsible>
          <Collapsible title="폴리리듬">
            <PolyrhythmPanel />
          </Collapsible>
          <Collapsible title="점진적 템포 증가">
            <AccelerationPanel />
          </Collapsible>
          <Collapsible title="신호">
            <CuesPanel />
          </Collapsible>
          {debug && (
            <Card title="디버그">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={accuracyOn} onChange={(e) => setAccuracyOn(e.target.checked)} className="w-5 h-5 accent-accent-600" />
                정확도 측정 (콘솔에도 출력)
              </label>
            </Card>
          )}
        </div>
      </div>

      <Modal open={!!showLog} onClose={() => setShowLog(null)} title="템포 기록 저장">
        <SaveTempoForm
          bpm={showLog?.reachedBpm ?? 0}
          pieceTitle={piece?.title}
          onSave={handleSaveTempo}
          onSkip={() => setShowLog(null)}
        />
      </Modal>

      <Modal open={!!accuracyReport} onClose={() => setAccuracyReport(null)} title="정확도 측정 결과">
        <pre className="text-xs whitespace-pre-wrap font-mono bg-ink-50 dark:bg-ink-950 p-4 rounded-lg">
          {accuracyReport}
        </pre>
        <div className="text-xs text-ink-500 dark:text-ink-400 mt-3">
          편차 0.001% 이하면 청각적 박 흔들림이 인지되지 않습니다. Web Audio의 sample-accurate 스케줄링이 적용되어 있어
          시스템 오디오 스택 자체의 지터(보통 ≤1ms)를 제외하면 본 엔진은 마이크로초 단위로 일관된 박을 출력합니다.
        </div>
      </Modal>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-5">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
    </section>
  )
}

function Collapsible({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <section className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800">
      <button
        className="w-full px-5 py-3.5 flex items-center justify-between min-h-[52px]"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold">{title}</span>
        <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </section>
  )
}

function CuesPanel() {
  const config = useMetronomeStore((s) => s.config)
  const setConfig = useMetronomeStore((s) => s.setConfig)
  return (
    <div className="space-y-2">
      <CueRow label="시각 신호 (가속 직전 화면 가장자리 색)" checked={config.cues.visual} onChange={(v) => setConfig({ cues: { ...config.cues, visual: v } })} />
      <CueRow label="청각 신호 (가속 마디의 마지막 박은 차임)" checked={config.cues.audible} onChange={(v) => setConfig({ cues: { ...config.cues, audible: v } })} />
      <div className="text-xs text-ink-500 dark:text-ink-400 pt-1">
        가속 모드가 켜져 있을 때만 작동합니다.
      </div>
    </div>
  )
}

function CueRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-accent-600"
      />
    </label>
  )
}

function SaveTempoForm({
  bpm,
  pieceTitle,
  onSave,
  onSkip,
}: {
  bpm: number
  pieceTitle?: string
  onSave: (section?: string) => void | Promise<void>
  onSkip: () => void
}) {
  const [section, setSection] = useState('')
  return (
    <div className="space-y-4">
      <div className="text-sm">
        <strong className="font-semibold">{pieceTitle ?? '곡'}</strong>의 템포 진척도에
        <span className="tabular font-bold text-accent-600 dark:text-accent-400"> {bpm} BPM</span>을 기록합니다.
      </div>
      <label className="block">
        <span className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">구간 메모 (선택)</span>
        <input
          type="text"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          placeholder="예: A섹션, mm. 24–32"
          className="w-full px-3 py-2.5 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px]"
        />
      </label>
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onSkip}>건너뛰기</Button>
        <Button onClick={() => void onSave(section)}>기록</Button>
      </div>
    </div>
  )
}
