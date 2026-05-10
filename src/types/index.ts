export type Category = 'technique' | 'etude' | 'repertoire' | 'theory'

export const CATEGORIES: Category[] = ['technique', 'etude', 'repertoire', 'theory']

export const CATEGORY_LABEL_KO: Record<Category, string> = {
  technique: '테크닉',
  etude: '에튀드',
  repertoire: '레퍼토리',
  theory: '시창·청음·이론',
}

export type Stage = 1 | 2 | 3

export const STAGE_LABEL_KO: Record<Stage, string> = {
  1: '익히는 중',
  2: '다듬는 중 / 무대 준비',
  3: '유지',
}

export interface Piece {
  id: string
  title: string
  composer: string
  opus?: string
  movement?: string
  difficulty?: number
  stage: Stage
  measuresMemorized?: number[]
  tempoLog: { date: string; bpm: number; section?: string }[]
  difficultSections?: string
  scoreFile?: { type: 'pdf' | 'url'; data: string }
  milestone?: { targetStage: 2 | 3; targetDate: string }
  recitalDate?: string
  createdAt: string
  updatedAt: string
}

export interface SessionNotes {
  wentWell?: string
  needsWork?: string
  nextStart?: string
}

export interface Session {
  id: string
  date: string
  category: Category
  durationSec: number
  pieceId?: string
  notes?: SessionNotes
  audioBlobId?: string
}

export interface Recording {
  id: string
  pieceId: string
  sessionId?: string
  date: string
  blob: Blob
  durationSec: number
}

export interface Goals {
  id: 'singleton'
  dailyMin?: number
  weeklyMin?: number
  monthlyMin?: number
  longTermTotalHours?: number
  protectionDaysPerWeek?: number
  neglectedThresholdDays?: number
  updatedAt: string
}

export const DEFAULT_NEGLECTED_DAYS = 30

export type AccelerationConfig =
  | { mode: 'continuous'; everyMeasures: number; bpmIncrement: number; maxBpm: number }
  | { mode: 'sectional'; measures: number; repetitions: number; bpmIncrement: number; maxBpm: number }

export interface MetronomePreset {
  id: string
  name?: string
  pieceId?: string
  bpm: number
  timeSignature: [number, number]
  subdivisions: number | number[]
  polyrhythm?: { primary: number; secondary: number; splitChannels: boolean }
  acceleration?: AccelerationConfig
  signalCues: { visual: boolean; audible: boolean }
}
