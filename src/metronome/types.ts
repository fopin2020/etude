export type Subdivisions = number | number[]

export type AccelerationMode =
  | { mode: 'continuous'; everyMeasures: number; bpmIncrement: number; maxBpm: number }
  | { mode: 'sectional'; measures: number; repetitions: number; bpmIncrement: number; maxBpm: number }

export interface PolyrhythmConfig {
  primary: number
  secondary: number
  splitChannels: boolean
}

export interface MetronomeConfig {
  bpm: number
  timeSignature: [number, number]
  subdivisions: Subdivisions
  polyrhythm: PolyrhythmConfig | null
  acceleration: AccelerationMode | null
  cues: { visual: boolean; audible: boolean }
  pieceId?: string
}

export interface BeatTickEvent {
  type: 'tick'
  beatIdx: number
  subIdx: number
  totalSubsInBeat: number
  isDownbeat: boolean
  isBeatHead: boolean
  audioTime: number
}

export interface MeasureEvent {
  type: 'measure'
  measureIdx: number
  bpm: number
  cueLevel: 0 | 1 | 2
}

export interface BpmChangeEvent {
  type: 'bpm-change'
  oldBpm: number
  newBpm: number
  measureIdx: number
}

export interface StoppedEvent {
  type: 'stopped'
  reachedBpm: number
  totalMeasures: number
  totalElapsedSec: number
}

export type EngineEvent = BeatTickEvent | MeasureEvent | BpmChangeEvent | StoppedEvent

export const DEFAULT_CONFIG: MetronomeConfig = {
  bpm: 90,
  timeSignature: [4, 4],
  subdivisions: 1,
  polyrhythm: null,
  acceleration: null,
  cues: { visual: true, audible: true },
}

export function subsForBeat(s: Subdivisions, beatIdx: number, beatsPerMeasure: number): number {
  if (typeof s === 'number') return s
  if (s.length === 0) return 1
  return s[beatIdx % beatsPerMeasure] ?? s[0] ?? 1
}
