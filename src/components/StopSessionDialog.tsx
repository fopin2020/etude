import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { useTimerStore, computeElapsedSec } from '../store/timer'
import { CATEGORY_LABEL_KO } from '../types'
import { formatDuration } from '../lib/format'
import { createSession } from '../db/queries'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'

interface Props {
  open: boolean
  onClose: () => void
}

export function StopSessionDialog({ open, onClose }: Props) {
  const active = useTimerStore((s) => s.active)
  const stop = useTimerStore((s) => s.stop)
  const cancel = useTimerStore((s) => s.cancel)
  const piece = useLiveQuery(
    async () => (active?.pieceId ? db.pieces.get(active.pieceId) : undefined),
    [active?.pieceId],
  )
  const [previewSec, setPreviewSec] = useState(0)

  useEffect(() => {
    if (!open || !active) return
    setPreviewSec(computeElapsedSec(active))
  }, [open, active])

  if (!active) return null

  const handleSave = async () => {
    const result = stop()
    if (!result || result.durationSec < 1) {
      onClose()
      return
    }
    await createSession({
      category: result.category,
      durationSec: result.durationSec,
      pieceId: result.pieceId,
    })
    onClose()
  }

  const handleDiscard = () => {
    if (!confirm('이 세션을 저장하지 않고 버립니다. 진행하시겠습니까?')) return
    cancel()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="연습 종료"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            계속하기
          </Button>
          <Button variant="secondary" onClick={handleDiscard}>
            버리기
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-center py-6 bg-accent-50 dark:bg-accent-950 rounded-xl">
          <div className="text-sm text-ink-600 dark:text-ink-400 mb-2">총 연습 시간</div>
          <div className="tabular text-5xl font-bold text-accent-700 dark:text-accent-300">
            {formatDuration(previewSec)}
          </div>
        </div>
        <div className="text-sm space-y-1 text-ink-600 dark:text-ink-300">
          <div>
            <span className="text-ink-500 dark:text-ink-400">카테고리: </span>
            {CATEGORY_LABEL_KO[active.category]}
          </div>
          {piece && (
            <div>
              <span className="text-ink-500 dark:text-ink-400">곡: </span>
              {piece.title} <span className="text-ink-500">— {piece.composer}</span>
            </div>
          )}
        </div>
        <div className="text-xs text-ink-500 dark:text-ink-400 pt-2 border-t border-ink-200 dark:border-ink-800">
          정성 노트(잘 된 것 / 안 된 것 / 내일의 시작점)는 Phase 3에서 추가됩니다.
        </div>
      </div>
    </Modal>
  )
}
