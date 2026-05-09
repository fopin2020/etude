import { db } from '../db/database'
import type { Goals, MetronomePreset, Piece, Recording, Session } from '../types'

const SCHEMA_VERSION = 1

export interface ExportPayload {
  schema: number
  exportedAt: string
  app: 'etude'
  pieces: Piece[]
  sessions: Session[]
  goals: Goals[]
  metronomePresets: MetronomePreset[]
  recordings: Array<Omit<Recording, 'blob'> & { blobBase64?: string; mime?: string }>
}

async function blobToBase64(blob: Blob): Promise<{ data: string; mime: string }> {
  const buf = await blob.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return { data: btoa(bin), mime: blob.type || 'application/octet-stream' }
}

function base64ToBlob(b64: string, mime: string): Blob {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export async function exportAll(): Promise<ExportPayload> {
  const [pieces, sessions, goals, metronomePresets, recordingsRaw] = await Promise.all([
    db.pieces.toArray(),
    db.sessions.toArray(),
    db.goals.toArray(),
    db.metronomePresets.toArray(),
    db.recordings.toArray(),
  ])

  const recordings = await Promise.all(
    recordingsRaw.map(async (r) => {
      const enc = await blobToBase64(r.blob)
      const { blob, ...rest } = r
      void blob
      return { ...rest, blobBase64: enc.data, mime: enc.mime }
    }),
  )

  return {
    schema: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'etude',
    pieces,
    sessions,
    goals,
    metronomePresets,
    recordings,
  }
}

export async function downloadExport(): Promise<void> {
  const payload = await exportAll()
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  a.href = url
  a.download = `etude-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export interface ImportOptions {
  mode: 'merge' | 'replace'
}

export interface ImportResult {
  pieces: number
  sessions: number
  goals: number
  metronomePresets: number
  recordings: number
}

export async function importFromPayload(
  payload: ExportPayload,
  opts: ImportOptions,
): Promise<ImportResult> {
  if (payload.app !== 'etude') throw new Error('이 파일은 Étude 백업이 아닙니다.')
  if (payload.schema !== SCHEMA_VERSION) {
    throw new Error(`지원하지 않는 스키마 버전입니다: ${payload.schema}`)
  }

  const recordingsToWrite: Recording[] = (payload.recordings ?? []).map((r) => ({
    id: r.id,
    pieceId: r.pieceId,
    sessionId: r.sessionId,
    date: r.date,
    durationSec: r.durationSec,
    blob: r.blobBase64 ? base64ToBlob(r.blobBase64, r.mime ?? 'audio/webm') : new Blob(),
  }))

  await db.transaction(
    'rw',
    [db.pieces, db.sessions, db.goals, db.metronomePresets, db.recordings],
    async () => {
      if (opts.mode === 'replace') {
        await Promise.all([
          db.pieces.clear(),
          db.sessions.clear(),
          db.goals.clear(),
          db.metronomePresets.clear(),
          db.recordings.clear(),
        ])
      }
      await db.pieces.bulkPut(payload.pieces ?? [])
      await db.sessions.bulkPut(payload.sessions ?? [])
      await db.goals.bulkPut(payload.goals ?? [])
      await db.metronomePresets.bulkPut(payload.metronomePresets ?? [])
      await db.recordings.bulkPut(recordingsToWrite)
    },
  )

  return {
    pieces: payload.pieces?.length ?? 0,
    sessions: payload.sessions?.length ?? 0,
    goals: payload.goals?.length ?? 0,
    metronomePresets: payload.metronomePresets?.length ?? 0,
    recordings: recordingsToWrite.length,
  }
}

export async function importFromFile(file: File, opts: ImportOptions): Promise<ImportResult> {
  const text = await file.text()
  const payload = JSON.parse(text) as ExportPayload
  return importFromPayload(payload, opts)
}
