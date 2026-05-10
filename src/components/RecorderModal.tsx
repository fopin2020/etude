import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Mic, Square, RotateCcw } from 'lucide-react'
import { useRecorder, saveRecording, PER_PIECE_RECORDING_CAP } from '../lib/recorder'
import { formatDuration } from '../lib/format'

interface Props {
  open: boolean
  onClose: () => void
  pieceId: string
  pieceTitle?: string
  sessionId?: string
}

export function RecorderModal({ open, onClose, pieceId, pieceTitle, sessionId }: Props) {
  const r = useRecorder()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [evictNotice, setEvictNotice] = useState<number>(0)

  useEffect(() => {
    if (r.resultBlob) {
      const url = URL.createObjectURL(r.resultBlob)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(null)
  }, [r.resultBlob])

  useEffect(() => {
    if (!open) {
      r.reset()
      setEvictNotice(0)
    }
  }, [open, r])

  const handleClose = () => {
    if (r.state === 'recording') r.stop()
    onClose()
  }

  const handleSave = async () => {
    if (!r.resultBlob) return
    const { deletedIds } = await saveRecording({
      pieceId,
      sessionId,
      blob: r.resultBlob,
      durationSec: r.elapsedSec,
    })
    setEvictNotice(deletedIds.length)
    setTimeout(() => onClose(), deletedIds.length > 0 ? 1800 : 200)
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={pieceTitle ? `녹음 — ${pieceTitle}` : '녹음'}
      footer={
        r.state === 'stopped' ? (
          <>
            <Button variant="ghost" onClick={() => r.reset()}><RotateCcw size={18} /> 다시 녹음</Button>
            <Button onClick={() => void handleSave()}>저장</Button>
          </>
        ) : null
      }
    >
      <div className="space-y-4">
        {(r.state === 'idle' || r.state === 'requesting') && (
          <div className="text-center py-8">
            <button
              onClick={() => void r.start()}
              disabled={r.state === 'requesting'}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 transition shadow-lg shadow-rose-500/30"
              aria-label="녹음 시작"
            >
              <Mic size={36} className="text-white" />
            </button>
            <div className="mt-4 text-sm text-ink-500 dark:text-ink-400">
              {r.state === 'requesting' ? '마이크 준비 중…' : '버튼을 눌러 녹음을 시작하세요'}
            </div>
          </div>
        )}

        {r.state === 'recording' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-rose-500 animate-pulse shadow-lg shadow-rose-500/40 mb-4">
              <span className="block w-6 h-6 bg-white rounded-sm" />
            </div>
            <div className="tabular text-4xl font-bold mb-2">{formatDuration(Math.floor(r.elapsedSec))}</div>
            <div className="text-xs text-ink-500 dark:text-ink-400 mb-5">녹음 중</div>
            <Button variant="danger" size="lg" onClick={() => r.stop()}>
              <Square size={20} fill="currentColor" /> 정지
            </Button>
          </div>
        )}

        {r.state === 'stopped' && previewUrl && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="tabular text-3xl font-bold">{formatDuration(Math.floor(r.elapsedSec))}</div>
              <div className="text-xs text-ink-500 dark:text-ink-400 mt-1">미리듣기 후 저장하세요</div>
            </div>
            <audio controls src={previewUrl} className="w-full" />
            <div className="text-xs text-ink-500 dark:text-ink-400">
              곡당 {PER_PIECE_RECORDING_CAP}개를 초과하면 가장 오래된 녹음이 자동으로 삭제됩니다.
            </div>
            {evictNotice > 0 && (
              <div className="text-xs text-amber-600 dark:text-amber-400">
                저장됨. 가장 오래된 녹음 {evictNotice}개가 자동 삭제되었습니다.
              </div>
            )}
          </div>
        )}

        {r.state === 'error' && (
          <div className="text-sm text-rose-600 dark:text-rose-400 p-4 bg-rose-50 dark:bg-rose-950 rounded-lg">
            {r.errorMessage}
            <div className="mt-3">
              <Button size="sm" variant="secondary" onClick={() => r.reset()}>다시 시도</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
