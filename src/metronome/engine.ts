import { buildSampleBank, type SampleBank } from './synth'
import {
  type MetronomeConfig,
  type EngineEvent,
  type AccelerationMode,
  subsForBeat,
} from './types'

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_SEC = 0.1
const SUB_GAIN = 0.55

function createSchedulerWorker(): Worker | null {
  try {
    return new Worker(new URL('./schedulerWorker.ts', import.meta.url), { type: 'module' })
  } catch {
    return null
  }
}

interface ScheduledClick {
  time: number
  buffer: AudioBuffer
  pan: number
  gain: number
}

interface VisualEvent {
  time: number
  beatIdx: number
  subIdx: number
  totalSubsInBeat: number
  isDownbeat: boolean
  isBeatHead: boolean
}

interface MeasureBoundary {
  time: number
  measureIdx: number
  bpm: number
  cueLevel: 0 | 1 | 2
}

interface BpmEdge {
  time: number
  oldBpm: number
  newBpm: number
  measureIdx: number
}

type Listener = (e: EngineEvent) => void

interface AccuracyLog {
  enabled: boolean
  intervals: number[]
  lastBeatHeadTime: number | null
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi)
}

function cycleLength(accel: AccelerationMode): number {
  return accel.mode === 'continuous' ? accel.everyMeasures : accel.measures * accel.repetitions
}

function effectiveBpm(baseBpm: number, accel: AccelerationMode | null, measureSinceBaseline: number): number {
  if (!accel) return baseBpm
  const K = cycleLength(accel)
  if (K <= 0) return baseBpm
  const cycles = Math.floor(measureSinceBaseline / K)
  const bpm = baseBpm + cycles * accel.bpmIncrement
  return Math.min(bpm, accel.maxBpm)
}

export class MetronomeEngine {
  private ctx: AudioContext | null = null
  private bank: SampleBank | null = null
  private masterGain: GainNode | null = null
  private listeners = new Set<Listener>()

  private config: MetronomeConfig
  private running = false
  private timerId: number | null = null
  private worker: Worker | null = null
  private rafId: number | null = null

  private nextBeatTime = 0
  private currentBeatIdx = 0
  private currentMeasureIdx = 0
  private accelBaselineMeasure = 0
  private startedAtSec = 0

  private visualQueue: VisualEvent[] = []
  private measureQueue: MeasureBoundary[] = []
  private bpmEdgeQueue: BpmEdge[] = []

  private accuracy: AccuracyLog = { enabled: false, intervals: [], lastBeatHeadTime: null }
  private maxBpmReached = 0

  constructor(initial: MetronomeConfig) {
    this.config = { ...initial }
  }

  on(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(e: EngineEvent) {
    for (const l of this.listeners) l(e)
  }

  getConfig(): MetronomeConfig {
    return { ...this.config }
  }

  setConfig(patch: Partial<MetronomeConfig>) {
    const prevBpm = this.config.bpm
    this.config = { ...this.config, ...patch }
    if (this.running && patch.bpm !== undefined && patch.bpm !== prevBpm) {
      this.accelBaselineMeasure = this.currentMeasureIdx
    }
    if (this.running && patch.acceleration !== undefined) {
      this.accelBaselineMeasure = this.currentMeasureIdx
    }
  }

  isRunning(): boolean {
    return this.running
  }

  getCurrentBpm(): number {
    return effectiveBpm(this.config.bpm, this.config.acceleration, this.currentMeasureIdx - this.accelBaselineMeasure)
  }

  setAccuracyLogging(enabled: boolean) {
    this.accuracy = { enabled, intervals: [], lastBeatHeadTime: null }
  }

  getAccuracyReport(): { count: number; expectedSec: number; minSec: number; maxSec: number; avgSec: number; stdDevSec: number; deviationPct: number } | null {
    const xs = this.accuracy.intervals
    if (xs.length < 2) return null
    const expected = 60 / this.config.bpm
    const min = Math.min(...xs)
    const max = Math.max(...xs)
    const avg = xs.reduce((a, b) => a + b, 0) / xs.length
    const variance = xs.reduce((acc, x) => acc + (x - avg) ** 2, 0) / xs.length
    const stdDev = Math.sqrt(variance)
    return {
      count: xs.length,
      expectedSec: expected,
      minSec: min,
      maxSec: max,
      avgSec: avg,
      stdDevSec: stdDev,
      deviationPct: ((avg - expected) / expected) * 100,
    }
  }

  async start(): Promise<void> {
    if (this.running) return
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx({ latencyHint: 'interactive' })
      this.bank = buildSampleBank(this.ctx)
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 1
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }

    this.currentBeatIdx = 0
    this.currentMeasureIdx = 0
    this.accelBaselineMeasure = 0
    this.nextBeatTime = this.ctx.currentTime + 0.05
    this.startedAtSec = this.ctx.currentTime
    this.visualQueue = []
    this.measureQueue = []
    this.bpmEdgeQueue = []
    this.maxBpmReached = this.config.bpm
    if (this.accuracy.enabled) {
      this.accuracy = { enabled: true, intervals: [], lastBeatHeadTime: null }
    }

    this.running = true
    if (!this.worker) this.worker = createSchedulerWorker()
    if (this.worker) {
      this.worker.onmessage = () => this.scheduler()
      this.worker.postMessage({ cmd: 'start', intervalMs: LOOKAHEAD_MS })
    } else {
      this.timerId = window.setInterval(() => this.scheduler(), LOOKAHEAD_MS)
    }
    this.rafId = requestAnimationFrame(() => this.drainVisual())
  }

  stop(): void {
    if (!this.running) return
    this.running = false
    if (this.worker) {
      this.worker.postMessage({ cmd: 'stop' })
    }
    if (this.timerId !== null) {
      window.clearInterval(this.timerId)
      this.timerId = null
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    const elapsed = this.ctx ? this.ctx.currentTime - this.startedAtSec : 0
    this.emit({
      type: 'stopped',
      reachedBpm: this.maxBpmReached,
      totalMeasures: this.currentMeasureIdx,
      totalElapsedSec: Math.max(0, elapsed),
    })
  }

  private scheduler() {
    if (!this.ctx || !this.bank) return
    const ctx = this.ctx
    while (this.nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD_SEC) {
      this.scheduleBeat()
    }
  }

  private scheduleBeat() {
    if (!this.ctx || !this.bank) return
    const ctx = this.ctx
    const bank = this.bank

    const [beatsPerMeasure] = this.config.timeSignature
    const bpm = effectiveBpm(this.config.bpm, this.config.acceleration, this.currentMeasureIdx - this.accelBaselineMeasure)
    const beatDur = 60 / bpm

    if (bpm > this.maxBpmReached) this.maxBpmReached = bpm

    const isFirstBeatOfMeasure = this.currentBeatIdx === 0
    const isLastBeatOfMeasure = this.currentBeatIdx === beatsPerMeasure - 1

    const accel = this.config.acceleration
    let nextMeasureBpm = bpm
    if (accel) {
      nextMeasureBpm = effectiveBpm(this.config.bpm, accel, this.currentMeasureIdx + 1 - this.accelBaselineMeasure)
    }
    const accelHere = isLastBeatOfMeasure && nextMeasureBpm !== bpm

    const cueLevel: 0 | 1 | 2 = (() => {
      if (!accel) return 0
      const K = cycleLength(accel)
      const m = this.currentMeasureIdx + 1 - this.accelBaselineMeasure
      const next = effectiveBpm(this.config.bpm, accel, m)
      const nextNext = effectiveBpm(this.config.bpm, accel, m + 1)
      if (next !== bpm) return 2
      if (nextNext !== bpm && K > 1) return 1
      return 0
    })()

    if (isFirstBeatOfMeasure) {
      this.measureQueue.push({
        time: this.nextBeatTime,
        measureIdx: this.currentMeasureIdx,
        bpm,
        cueLevel,
      })
    }

    const beatStart = this.nextBeatTime

    if (this.config.polyrhythm) {
      const { primary: P, secondary: S, splitChannels } = this.config.polyrhythm
      const panL = splitChannels ? -1 : 0
      const panR = splitChannels ? 1 : 0

      for (let i = 0; i < P; i++) {
        const t = beatStart + (beatDur * i) / P
        let buf: AudioBuffer
        let gain = SUB_GAIN
        if (i === 0) {
          if (accelHere && this.config.cues.audible) {
            buf = bank.cue
            gain = 0.95
          } else if (isFirstBeatOfMeasure) {
            buf = bank.downbeat
            gain = 1.0
          } else {
            buf = bank.beat
            gain = 0.85
          }
        } else {
          buf = bank.sub
        }
        this.playClick(ctx, { time: t, buffer: buf, pan: panL, gain })
        this.visualQueue.push({
          time: t,
          beatIdx: this.currentBeatIdx,
          subIdx: i,
          totalSubsInBeat: P,
          isDownbeat: isFirstBeatOfMeasure && i === 0,
          isBeatHead: i === 0,
        })
      }

      for (let j = 0; j < S; j++) {
        const t = beatStart + (beatDur * j) / S
        const buf = j === 0 ? bank.polySecondary : bank.sub
        const gain = j === 0 ? 0.85 : SUB_GAIN
        this.playClick(ctx, { time: t, buffer: buf, pan: panR, gain })
      }
    } else {
      const N = subsForBeat(this.config.subdivisions, this.currentBeatIdx, beatsPerMeasure)
      for (let i = 0; i < N; i++) {
        const t = beatStart + (beatDur * i) / N
        let buf: AudioBuffer
        let gain = SUB_GAIN
        if (i === 0) {
          if (accelHere && this.config.cues.audible) {
            buf = bank.cue
            gain = 0.95
          } else if (isFirstBeatOfMeasure) {
            buf = bank.downbeat
            gain = 1.0
          } else {
            buf = bank.beat
            gain = 0.85
          }
        } else {
          buf = bank.sub
        }
        this.playClick(ctx, { time: t, buffer: buf, pan: 0, gain })
        this.visualQueue.push({
          time: t,
          beatIdx: this.currentBeatIdx,
          subIdx: i,
          totalSubsInBeat: N,
          isDownbeat: isFirstBeatOfMeasure && i === 0,
          isBeatHead: i === 0,
        })
      }
    }

    if (this.accuracy.enabled) {
      const last = this.accuracy.lastBeatHeadTime
      if (last !== null) this.accuracy.intervals.push(beatStart - last)
      this.accuracy.lastBeatHeadTime = beatStart
    }

    this.nextBeatTime = beatStart + beatDur
    this.currentBeatIdx++
    if (this.currentBeatIdx >= beatsPerMeasure) {
      this.currentBeatIdx = 0
      this.currentMeasureIdx++
      const newBpm = effectiveBpm(this.config.bpm, accel, this.currentMeasureIdx - this.accelBaselineMeasure)
      if (newBpm !== bpm) {
        this.bpmEdgeQueue.push({
          time: this.nextBeatTime,
          oldBpm: bpm,
          newBpm,
          measureIdx: this.currentMeasureIdx,
        })
      }
    }
  }

  private playClick(ctx: AudioContext, c: ScheduledClick) {
    const src = ctx.createBufferSource()
    src.buffer = c.buffer
    const gain = ctx.createGain()
    gain.gain.value = clamp(c.gain, 0, 1.5)

    let outputNode: AudioNode = gain
    if (c.pan !== 0 && typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner()
      panner.pan.value = clamp(c.pan, -1, 1)
      gain.connect(panner)
      outputNode = panner
    }
    src.connect(gain)
    outputNode.connect(this.masterGain ?? ctx.destination)
    src.start(c.time)
  }

  private drainVisual = () => {
    if (!this.running || !this.ctx) return
    const now = this.ctx.currentTime

    while (this.measureQueue.length > 0 && this.measureQueue[0]!.time <= now) {
      const m = this.measureQueue.shift()!
      this.emit({ type: 'measure', measureIdx: m.measureIdx, bpm: m.bpm, cueLevel: m.cueLevel })
    }
    while (this.visualQueue.length > 0 && this.visualQueue[0]!.time <= now) {
      const v = this.visualQueue.shift()!
      this.emit({
        type: 'tick',
        beatIdx: v.beatIdx,
        subIdx: v.subIdx,
        totalSubsInBeat: v.totalSubsInBeat,
        isDownbeat: v.isDownbeat,
        isBeatHead: v.isBeatHead,
        audioTime: v.time,
      })
    }
    while (this.bpmEdgeQueue.length > 0 && this.bpmEdgeQueue[0]!.time <= now) {
      const e = this.bpmEdgeQueue.shift()!
      this.emit({ type: 'bpm-change', oldBpm: e.oldBpm, newBpm: e.newBpm, measureIdx: e.measureIdx })
    }

    this.rafId = requestAnimationFrame(this.drainVisual)
  }
}

let singleton: MetronomeEngine | null = null

export function getEngine(initial: MetronomeConfig): MetronomeEngine {
  if (!singleton) singleton = new MetronomeEngine(initial)
  return singleton
}
