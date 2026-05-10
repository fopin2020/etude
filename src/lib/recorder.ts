import { useEffect, useRef, useState } from 'react'
import { db } from '../db/database'
import type { Recording } from '../types'
import { v4 as uuid } from 'uuid'

export const PER_PIECE_RECORDING_CAP = 10

const PREFERRED_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/mp4',
]

export function pickMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  for (const t of PREFERRED_TYPES) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return null
}

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error'

export interface UseRecorderResult {
  state: RecorderState
  errorMessage: string | null
  elapsedSec: number
  resultBlob: Blob | null
  start: () => Promise<void>
  stop: () => void
  reset: () => void
}

export function useRecorder(): UseRecorderResult {
  const [state, setState] = useState<RecorderState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const tickRef = useRef<number | null>(null)

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      cleanupStream()
      if (recRef.current && recRef.current.state !== 'inactive') {
        try { recRef.current.stop() } catch { /* noop */ }
      }
    }
  }, [])

  const start = async () => {
    setErrorMessage(null)
    setResultBlob(null)
    setElapsedSec(0)
    chunksRef.current = []

    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setState('error')
      setErrorMessage('이 브라우저는 녹음을 지원하지 않습니다.')
      return
    }
    const mime = pickMimeType()
    if (!mime) {
      setState('error')
      setErrorMessage('지원되는 오디오 인코더를 찾지 못했습니다.')
      return
    }

    setState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      streamRef.current = stream
      const rec = new MediaRecorder(stream, { mimeType: mime })
      recRef.current = rec
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime })
        setResultBlob(blob)
        setState('stopped')
        cleanupStream()
      }
      rec.onerror = () => {
        setState('error')
        setErrorMessage('녹음 중 오류가 발생했습니다.')
        cleanupStream()
      }
      startTimeRef.current = performance.now()
      rec.start(250)
      setState('recording')
      tickRef.current = window.setInterval(() => {
        setElapsedSec((performance.now() - startTimeRef.current) / 1000)
      }, 200)
    } catch (err) {
      setState('error')
      setErrorMessage(
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? '마이크 권한이 거부되었습니다.'
          : err instanceof Error
            ? err.message
            : '마이크에 접근할 수 없습니다.',
      )
      cleanupStream()
    }
  }

  const stop = () => {
    if (recRef.current && recRef.current.state !== 'inactive') {
      recRef.current.stop()
    }
  }

  const reset = () => {
    cleanupStream()
    setState('idle')
    setErrorMessage(null)
    setElapsedSec(0)
    setResultBlob(null)
    chunksRef.current = []
    recRef.current = null
  }

  return { state, errorMessage, elapsedSec, resultBlob, start, stop, reset }
}

export async function saveRecording(input: {
  pieceId: string
  sessionId?: string
  blob: Blob
  durationSec: number
}): Promise<{ id: string; deletedIds: string[] }> {
  const id = uuid()
  const rec: Recording = {
    id,
    pieceId: input.pieceId,
    sessionId: input.sessionId,
    date: new Date().toISOString(),
    blob: input.blob,
    durationSec: input.durationSec,
  }
  await db.recordings.put(rec)
  const all = await db.recordings.where('pieceId').equals(input.pieceId).sortBy('date')
  const deletedIds: string[] = []
  if (all.length > PER_PIECE_RECORDING_CAP) {
    const overflow = all.slice(0, all.length - PER_PIECE_RECORDING_CAP)
    for (const r of overflow) {
      deletedIds.push(r.id)
      await db.recordings.delete(r.id)
    }
  }
  return { id, deletedIds }
}

export async function deleteRecording(id: string): Promise<void> {
  await db.recordings.delete(id)
}

export async function totalRecordingBytes(): Promise<number> {
  let total = 0
  await db.recordings.each((r) => {
    total += r.blob.size
  })
  return total
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
