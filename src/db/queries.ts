import { db } from './database'
import type { Session, Piece, SessionNotes } from '../types'
import { v4 as uuid } from 'uuid'
import { isSameLocalDay, startOfMonthLocal, startOfWeekLocal } from '../lib/format'

export async function createSession(input: {
  category: Session['category']
  durationSec: number
  pieceId?: string
  notes?: SessionNotes
  date?: string
}): Promise<string> {
  const id = uuid()
  const session: Session = {
    id,
    date: input.date ?? new Date().toISOString(),
    category: input.category,
    durationSec: input.durationSec,
    pieceId: input.pieceId,
    notes: input.notes,
  }
  await db.sessions.put(session)
  if (input.pieceId) {
    await db.pieces
      .where('id')
      .equals(input.pieceId)
      .modify((p) => {
        p.updatedAt = new Date().toISOString()
      })
  }
  return id
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id)
}

export async function totalSecondsForPiece(pieceId: string): Promise<number> {
  const all = await db.sessions.where('pieceId').equals(pieceId).toArray()
  return all.reduce((acc, s) => acc + s.durationSec, 0)
}

export async function aggregatedSecondsByPiece(): Promise<Record<string, number>> {
  const out: Record<string, number> = {}
  await db.sessions.each((s) => {
    if (!s.pieceId) return
    out[s.pieceId] = (out[s.pieceId] ?? 0) + s.durationSec
  })
  return out
}

export async function todaySeconds(): Promise<number> {
  let total = 0
  const now = new Date()
  await db.sessions.each((s) => {
    if (isSameLocalDay(s.date, now)) total += s.durationSec
  })
  return total
}

export async function rangeSecondsSince(since: Date): Promise<number> {
  let total = 0
  await db.sessions.each((s) => {
    if (new Date(s.date) >= since) total += s.durationSec
  })
  return total
}

export async function weekSeconds(): Promise<number> {
  return rangeSecondsSince(startOfWeekLocal())
}

export async function monthSeconds(): Promise<number> {
  return rangeSecondsSince(startOfMonthLocal())
}

export function newPiece(input: Partial<Piece> & { title: string; composer: string }): Piece {
  const now = new Date().toISOString()
  return {
    id: uuid(),
    title: input.title,
    composer: input.composer,
    opus: input.opus,
    movement: input.movement,
    difficulty: input.difficulty,
    stage: input.stage ?? 1,
    measuresMemorized: input.measuresMemorized ?? [],
    tempoLog: input.tempoLog ?? [],
    difficultSections: input.difficultSections,
    scoreFile: input.scoreFile,
    milestone: input.milestone,
    recitalDate: input.recitalDate,
    createdAt: now,
    updatedAt: now,
  }
}

export async function deletePieceCascade(pieceId: string): Promise<void> {
  await db.transaction('rw', db.pieces, db.sessions, db.recordings, async () => {
    await db.pieces.delete(pieceId)
    await db.sessions.where('pieceId').equals(pieceId).modify({ pieceId: undefined })
    await db.recordings.where('pieceId').equals(pieceId).delete()
  })
}
