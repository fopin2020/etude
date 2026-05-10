import type { Session, Goals } from '../types'
import { startOfWeekLocal } from './format'

export interface DayBucket {
  dateKey: string
  date: Date
  sec: number
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function bucketByDay(sessions: Session[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const s of sessions) {
    const d = new Date(s.date)
    const k = dayKey(d)
    out[k] = (out[k] ?? 0) + s.durationSec
  }
  return out
}

export interface HourMatrix {
  matrix: number[][]
  maxSec: number
}

export function bucketByHour(sessions: Session[]): HourMatrix {
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
  let maxSec = 0
  for (const s of sessions) {
    const d = new Date(s.date)
    const dow = (d.getDay() + 6) % 7
    const h = d.getHours()
    matrix[dow]![h] = (matrix[dow]![h] ?? 0) + s.durationSec
    if (matrix[dow]![h]! > maxSec) maxSec = matrix[dow]![h]!
  }
  return { matrix, maxSec }
}

export interface YearGrid {
  weeks: Array<Array<{ dateKey: string; date: Date; sec: number } | null>>
  startDate: Date
  endDate: Date
  maxSec: number
}

export function buildYearGrid(sessions: Session[], end: Date = new Date()): YearGrid {
  const buckets = bucketByDay(sessions)
  const endDate = new Date(end)
  endDate.setHours(0, 0, 0, 0)
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 364)
  // align startDate to Monday so each column is one ISO week (Mon..Sun)
  const offset = (startDate.getDay() + 6) % 7
  startDate.setDate(startDate.getDate() - offset)

  const weeks: YearGrid['weeks'] = []
  const cursor = new Date(startDate)
  let maxSec = 0

  while (cursor <= endDate) {
    const week: YearGrid['weeks'][number] = []
    for (let d = 0; d < 7; d++) {
      if (cursor > endDate) {
        week.push(null)
      } else {
        const k = dayKey(cursor)
        const sec = buckets[k] ?? 0
        if (sec > maxSec) maxSec = sec
        week.push({ dateKey: k, date: new Date(cursor), sec })
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  return { weeks, startDate, endDate, maxSec }
}

export interface NeglectedPiece {
  pieceId: string
  daysSince: number
  lastDate: string | null
}

export function computeNeglected(
  pieces: { id: string; createdAt: string }[],
  sessions: Session[],
  thresholdDays: number,
  ref: Date = new Date(),
): NeglectedPiece[] {
  const lastByPiece: Record<string, string> = {}
  for (const s of sessions) {
    if (!s.pieceId) continue
    const cur = lastByPiece[s.pieceId]
    if (!cur || new Date(s.date) > new Date(cur)) lastByPiece[s.pieceId] = s.date
  }
  const out: NeglectedPiece[] = []
  for (const p of pieces) {
    const last = lastByPiece[p.id] ?? p.createdAt
    const days = Math.floor((ref.getTime() - new Date(last).getTime()) / (1000 * 60 * 60 * 24))
    if (days >= thresholdDays) {
      out.push({ pieceId: p.id, daysSince: days, lastDate: lastByPiece[p.id] ?? null })
    }
  }
  out.sort((a, b) => b.daysSince - a.daysSince)
  return out
}

export interface StreakResult {
  current: number
  best: number
  weekRestUsed: number
  weekRestBudget: number
  todaySatisfied: boolean
}

export function computeStreak(sessions: Session[], goals: Goals, ref: Date = new Date()): StreakResult {
  const buckets = bucketByDay(sessions)
  const dailyGoalSec = goals.dailyMin ? goals.dailyMin * 60 : 1
  const protection = goals.protectionDaysPerWeek ?? 0

  const dayMet = (d: Date): boolean => {
    const k = dayKey(d)
    return (buckets[k] ?? 0) >= dailyGoalSec
  }

  // current streak walking back from yesterday (today not yet "completed")
  const today = new Date(ref)
  today.setHours(0, 0, 0, 0)
  const todaySatisfied = dayMet(today)

  let current = todaySatisfied ? 1 : 0
  let cursor = new Date(today)
  cursor.setDate(cursor.getDate() - 1)
  let weekStart = startOfWeekLocal(cursor)
  let weekRest = 0

  for (let i = 0; i < 365; i++) {
    const ws = startOfWeekLocal(cursor)
    if (ws.getTime() !== weekStart.getTime()) {
      weekStart = ws
      weekRest = 0
    }
    if (dayMet(cursor)) {
      current++
    } else if (weekRest < protection) {
      weekRest++
    } else {
      break
    }
    cursor.setDate(cursor.getDate() - 1)
  }

  // best streak across all history with same rules
  const allDays: string[] = Object.keys(buckets).sort()
  let best = 0
  if (allDays.length > 0) {
    const earliest = new Date(allDays[0]!)
    earliest.setHours(0, 0, 0, 0)
    const cur = new Date(earliest)
    let run = 0
    let bestRun = 0
    let ws = startOfWeekLocal(cur)
    let wr = 0
    while (cur <= today) {
      const cws = startOfWeekLocal(cur)
      if (cws.getTime() !== ws.getTime()) {
        ws = cws
        wr = 0
      }
      if (dayMet(cur)) {
        run++
        if (run > bestRun) bestRun = run
      } else if (wr < protection) {
        wr++
      } else {
        run = 0
      }
      cur.setDate(cur.getDate() + 1)
    }
    best = bestRun
  }

  return {
    current,
    best,
    weekRestUsed: weekRest,
    weekRestBudget: protection,
    todaySatisfied,
  }
}

export function categoryBreakdown(sessions: Session[]): Array<{ name: string; sec: number }> {
  const out: Record<string, number> = {}
  for (const s of sessions) out[s.category] = (out[s.category] ?? 0) + s.durationSec
  return Object.entries(out).map(([name, sec]) => ({ name, sec }))
}

export function pieceCumulative(sessions: Session[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const s of sessions) {
    if (!s.pieceId) continue
    out[s.pieceId] = (out[s.pieceId] ?? 0) + s.durationSec
  }
  return out
}
