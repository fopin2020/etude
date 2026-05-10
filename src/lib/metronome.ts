/**
 * Metronome engine — Web Audio API with lookahead scheduling
 * (Chris Wilson's "A Tale of Two Clocks" pattern).
 *
 * - 30..500 BPM, 1..16 beats per measure, 1..9 subdivisions per beat
 * - Two acceleration modes: continuous (every N measures +M) or sectional
 *   (X measures × N repetitions then +M)
 */

export type AccelConfig =
  | { mode: 'off' }
  | { mode: 'continuous'; everyMeasures: number; bpmIncrement: number; maxBpm: number }
  | { mode: 'sectional'; measures: number; repetitions: number; bpmIncrement: number; maxBpm: number }

export interface TickEvent {
  beatIdx: number       // 0..(beatsPerMeasure-1)
  subdivIdx: number     // 0..(subdivision-1)
  isMainBeat: boolean   // first subdivision of a beat
  isDownbeat: boolean   // first beat of a measure
  measureIdx: number
  bpm: number
}

export class MetronomeEngine {
  private audioCtx: AudioContext | null = null

  bpm = 80
  beatsPerMeasure = 4
  subdivision = 1
  accel: AccelConfig = { mode: 'off' }
  isRunning = false

  onStateChange: (() => void) | null = null
  onTick: ((e: TickEvent) => void) | null = null

  private scheduleAheadTime = 0.1   // seconds to schedule into the future
  private lookahead = 25            // ms between scheduler runs
  private nextNoteTime = 0
  private currentSubdivIdx = 0
  private currentBeatIdx = 0
  private currentMeasure = 0
  private sectionRepetition = 0
  private timerId: number | null = null

  setBpm(n: number) {
    const clamped = Math.max(30, Math.min(500, n))
    if (clamped !== this.bpm) {
      this.bpm = clamped
      this.onStateChange?.()
    }
  }

  setBeatsPerMeasure(n: number) {
    this.beatsPerMeasure = Math.max(1, Math.min(16, n))
    if (this.currentBeatIdx >= this.beatsPerMeasure) this.currentBeatIdx = 0
    this.onStateChange?.()
  }

  setSubdivision(n: number) {
    this.subdivision = Math.max(1, Math.min(9, n))
    if (this.currentSubdivIdx >= this.subdivision) this.currentSubdivIdx = 0
    this.onStateChange?.()
  }

  setAccel(a: AccelConfig) {
    this.accel = a
    this.sectionRepetition = 0
    this.onStateChange?.()
  }

  start() {
    if (this.isRunning) return
    if (!this.audioCtx) {
      const Ctor: typeof AudioContext =
        (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!
      this.audioCtx = new Ctor()
    }
    if (this.audioCtx.state === 'suspended') void this.audioCtx.resume()
    this.currentSubdivIdx = 0
    this.currentBeatIdx = 0
    this.currentMeasure = 0
    this.sectionRepetition = 0
    this.nextNoteTime = this.audioCtx.currentTime + 0.05
    this.isRunning = true
    this.onStateChange?.()
    this.scheduler()
  }

  stop() {
    if (!this.isRunning) return
    this.isRunning = false
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId)
      this.timerId = null
    }
    this.onStateChange?.()
  }

  toggle() { this.isRunning ? this.stop() : this.start() }

  private scheduler = () => {
    if (!this.audioCtx || !this.isRunning) return
    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.nextNoteTime)
      this.advance()
    }
    this.timerId = window.setTimeout(this.scheduler, this.lookahead)
  }

  private scheduleNote(time: number) {
    if (!this.audioCtx) return
    const isMainBeat = this.currentSubdivIdx === 0
    const isDownbeat = isMainBeat && this.currentBeatIdx === 0

    let freq = 600
    let amp = 0.18
    if (isDownbeat) { freq = 1400; amp = 0.45 }
    else if (isMainBeat) { freq = 900; amp = 0.32 }

    const osc = this.audioCtx.createOscillator()
    const gain = this.audioCtx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, time)
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(amp, time + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05)
    osc.connect(gain).connect(this.audioCtx.destination)
    osc.start(time)
    osc.stop(time + 0.06)

    this.onTick?.({
      beatIdx: this.currentBeatIdx,
      subdivIdx: this.currentSubdivIdx,
      isMainBeat,
      isDownbeat,
      measureIdx: this.currentMeasure,
      bpm: this.bpm,
    })
  }

  private advance() {
    const subdivPerBeat = Math.max(1, this.subdivision)
    const secondsPerBeat = 60 / this.bpm
    const secondsPerSubdiv = secondsPerBeat / subdivPerBeat
    this.nextNoteTime += secondsPerSubdiv

    this.currentSubdivIdx++
    if (this.currentSubdivIdx >= subdivPerBeat) {
      this.currentSubdivIdx = 0
      this.currentBeatIdx++
      if (this.currentBeatIdx >= this.beatsPerMeasure) {
        this.currentBeatIdx = 0
        this.currentMeasure++
        this.onMeasureComplete()
      }
    }
  }

  private onMeasureComplete() {
    if (this.accel.mode === 'continuous') {
      const a = this.accel
      if (a.everyMeasures > 0 && this.currentMeasure % a.everyMeasures === 0) {
        const next = Math.min(a.maxBpm, this.bpm + a.bpmIncrement)
        if (next !== this.bpm) this.setBpm(next)
      }
    } else if (this.accel.mode === 'sectional') {
      const a = this.accel
      if (a.measures > 0 && this.currentMeasure % a.measures === 0) {
        this.sectionRepetition++
        if (this.sectionRepetition >= a.repetitions) {
          this.sectionRepetition = 0
          const next = Math.min(a.maxBpm, this.bpm + a.bpmIncrement)
          if (next !== this.bpm) this.setBpm(next)
        }
      }
    }
  }
}
