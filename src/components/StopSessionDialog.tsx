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
  const [wentWell, setWentWell] = useState('')
  const [needsWork, setNeedsWork] = useState('')
  const [nextStart, setNextStart] = useState('')

  useEffect(() => {
    if (!open || !active) return
    setPreviewSec(computeElapsedSec(active))
    setWentWell('')
    setNeedsWork('')
    setNextStart('')
  }, [open, active])

  if (!active) return null

  const handleSave = async () => {
    const result = stop()
    if (!result || result.durationSec < 1) {
      onClose()
      return
    }
    const notes =
      wentWell.trim() || needsWork.trim() || nextStart.trim()
        ? {
            wentWell: wentWell.trim() || undefined,
            needsWork: needsWork.trim() || undefined,
            nextStart: nextStart.trim() || undefined,
          }
        : undefined
    await createSession({
      category: result.category,
      durationSec: result.durationSec,
      pieceId: result.pieceId,
      notes,
    })
    onClose()
  }

  const handleDiscard = () => {
    if (!confirm('이 세션을 저장하지 않고 버립니다. 진행하시겠습니까?')) return
    cancel()
    onClose()
  }

  const inputCls =
    'w-full px-3 py-2 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm resize-none'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="연습 종료"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>계속하기</Button>
          <Button variant="secondary" onClick={handleDiscard}>버리기</Button>
          <Button onClick={handleSave}>저장</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-center py-5 bg-accent-50 dark:bg-accent-950 rounded-xl">
          <div className="text-sm text-ink-600 dark:text-ink-400 mb-1">총 연습 시간</div>
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

        <div className="border-t border-ink-200 dark:border-ink-800 pt-4 space-y-3">
          <div className="text-xs font-medium text-ink-500 dark:text-ink-400 uppercase tracking-wide">
            짧은 회고 (선택)
          </div>
          <NoteField
            label="오늘 잘 된 것"
            value={wentWell}
            onChange={setWentWell}
            placeholder="예: 페달링이 더 자연스러워졌다"
            inputCls={inputCls}
          />
          <NoteField
            label="오늘 안 된 것"
            value={needsWork}
            onChange={setNeedsWork}
            placeholder="예: mm. 24의 옥타브 도약, 손가락이 따라가지 못함"
            inputCls={inputCls}
          />
          <NoteField
            label="내일의 시작점"
            value={nextStart}
            onChange={setNextStart}
            placeholder="예: 그 옥타브 부분을 느린 BPM으로 다섯 번부터"
            inputCls={inputCls}
          />
        </div>
      </div>
    </Modal>
  )
}

function NoteField({
  label,
  value,
  onChange,
  placeholder,
  inputCls,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  inputCls: string
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1">{label}</span>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </label>
  )
}
