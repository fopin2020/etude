import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Piece, Session, Recording, Goals, MetronomePreset } from '../types'

class EtudeDatabase extends Dexie {
  pieces!: Table<Piece, string>
  sessions!: Table<Session, string>
  recordings!: Table<Recording, string>
  goals!: Table<Goals, string>
  metronomePresets!: Table<MetronomePreset, string>

  constructor() {
    super('etude')

    this.version(1).stores({
      pieces: 'id, composer, stage, updatedAt, createdAt',
      sessions: 'id, date, category, pieceId',
      recordings: 'id, pieceId, sessionId, date',
      goals: 'id',
      metronomePresets: 'id, pieceId, name',
    })
  }
}

export const db = new EtudeDatabase()

export async function getOrCreateGoals(): Promise<Goals> {
  const existing = await db.goals.get('singleton')
  if (existing) return existing
  const fresh: Goals = { id: 'singleton', updatedAt: new Date().toISOString() }
  await db.goals.put(fresh)
  return fresh
}
