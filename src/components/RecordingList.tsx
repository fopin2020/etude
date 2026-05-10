import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { Trash2, Download, GitCompare } from 'lucide-react'
import { deleteRecording, formatBytes } from '../lib/recorder'
import { formatDateKo, formatDuration, formatRelativeKo } from '../lib/format'

interface Props {
  pieceId: string
}

export function RecordingList({ pieceId }: Props) {
  const recordings = useLiveQuery(
    async () => db.recordings.where('pieceId').equals(pieceId).reverse().sortBy('date'),
    [pieceId],
  ) ?? []

  const [urls, setUrls] = useState<Record<string, string>>({})
  const [compareMode, setCompareMode] = useState(false)
  const [pickA, setPickA] = useState<string | null>(null)
  const [pickB, setPickB] = useState<string | null>(null)

  useEffect(() => {
    const next: Record<string, string> = {}
    for (const r of recordings) next[r.id] = URL.createObjectURL(r.blob)
    setUrls(next)
    return () => {
      for (const u of Object.values(next)) URL.revokeObjectURL(u)
    }
  }, [recordings])

  const totalBytes = useMemo(
    () => recordings.reduce((acc, r) => acc + r.blob.size, 0),
    [recordings],
  )

  if (recordings.length === 0) {
    return (
      <div className="text-sm text-ink-500 dark:text-ink-400 p-4 bg-ink-50 dark:bg-ink-950 rounded-lg">
        아직 이 곡의 녹음이 없습니다.
      </div>
    )
  }

  const oldest = recordings[recordings.length - 1]!
  const newest = recordings[0]!
  const a = pickA ? recordings.find((r) => r.id === pickA) : null
  const b = pickB ? recordings.find((r) => r.id === pickB) : null

  const handleDelete = async (id: string) => {
    if (!confirm('이 녹음을 삭제할까요?')) return
    await deleteRecording(id)
    if (pickA === id) setPickA(null)
    if (pickB === id) setPickB(null)
  }

  const handleDownload = (id: string) => {
    const r = recordings.find((x) => x.id === id)
    if (!r) return
    const url = urls[id]!
    const a = document.createElement('a')
    a.href = url
    a.download = `etude-recording-${r.date.replace(/[:.]/g, '-')}.${r.blob.type.includes('webm') ? 'webm' : 'audio'}`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
        <span>{recordings.length}개 · {formatBytes(totalBytes)}</span>
        {recordings.length >= 2 && (
          <button
            onClick={() => {
              setCompareMode((v) => !v)
              if (!compareMode) {
                setPickA(newest.id)
                setPickB(oldest.id)
              }
            }}
            className="inline-flex items-center gap-1 text-accent-600 dark:text-accent-400 hover:underline"
          >
            <GitCompare size={14} />
            {compareMode ? '비교 닫기' : '비교 청취'}
          </button>
        )}
      </div>

      {compareMode && a && b && (
        <div className="bg-accent-50 dark:bg-accent-950 rounded-xl p-4 space-y-3 border border-accent-200 dark:border-accent-900">
          <ComparePicker
            label="A"
            recordings={recordings}
            value={pickA}
            onChange={setPickA}
          />
          <audio controls src={urls[a.id]} className="w-full" />
          <ComparePicker
            label="B"
            recordings={recordings}
            value={pickB}
            onChange={setPickB}
          />
          <audio controls src={urls[b.id]} className="w-full" />
        </div>
      )}

      <ul className="divide-y divide-ink-100 dark:divide-ink-800">
        {recordings.map((r, i) => (
          <li key={r.id} className="py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {i === 0 && <span className="inline-block px-1.5 py-0.5 mr-1.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-semibold">최신</span>}
                {formatDateKo(r.date, 'M월 d일 HH:mm')}
              </div>
              <div className="text-xs text-ink-500 dark:text-ink-400">
                {formatRelativeKo(r.date)} · {formatDuration(Math.round(r.durationSec))} · {formatBytes(r.blob.size)}
              </div>
              {urls[r.id] && (
                <audio controls src={urls[r.id]} className="w-full mt-2 h-9" preload="metadata" />
              )}
            </div>
            <button
              onClick={() => handleDownload(r.id)}
              aria-label="다운로드"
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-md text-ink-500 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => handleDelete(r.id)}
              aria-label="삭제"
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-md text-ink-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ComparePicker({
  label,
  recordings,
  value,
  onChange,
}: {
  label: string
  recordings: { id: string; date: string }[]
  value: string | null
  onChange: (id: string) => void
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-accent-700 dark:text-accent-300 mb-1">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md border border-accent-300 dark:border-accent-800 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[40px]"
      >
        {recordings.map((r) => (
          <option key={r.id} value={r.id}>
            {formatDateKo(r.date, 'yyyy-MM-dd HH:mm')}
          </option>
        ))}
      </select>
    </label>
  )
}
