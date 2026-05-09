import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { CATEGORIES, CATEGORY_LABEL_KO, type Category } from '../types'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useTimerStore } from '../store/timer'

interface Props {
  open: boolean
  onClose: () => void
}

export function StartSessionDialog({ open, onClose }: Props) {
  const [category, setCategory] = useState<Category | null>(null)
  const [pieceId, setPieceId] = useState<string | null>(null)
  const start = useTimerStore((s) => s.start)
  const pieces = useLiveQuery(() => db.pieces.orderBy('updatedAt').reverse().toArray(), []) ?? []

  const handleClose = () => {
    setCategory(null)
    setPieceId(null)
    onClose()
  }

  const canStart = category !== null && (category !== 'repertoire' || !!pieceId)

  const handleStart = () => {
    if (!canStart || category === null) return
    start(category, pieceId ?? undefined)
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="연습 시작"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleStart} disabled={!canStart}>
            시작
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <div className="text-sm font-medium text-ink-600 dark:text-ink-300 mb-3">카테고리</div>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={[
                  'px-4 py-4 rounded-lg border-2 text-left transition min-h-[60px]',
                  category === c
                    ? 'border-accent-600 bg-accent-50 dark:bg-accent-950 text-accent-700 dark:text-accent-300'
                    : 'border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600',
                ].join(' ')}
              >
                <div className="font-medium">{CATEGORY_LABEL_KO[c]}</div>
              </button>
            ))}
          </div>
        </div>

        {category === 'repertoire' && (
          <div>
            <div className="text-sm font-medium text-ink-600 dark:text-ink-300 mb-3">곡 선택 *</div>
            {pieces.length === 0 ? (
              <div className="text-sm text-ink-500 dark:text-ink-400 p-4 bg-ink-100 dark:bg-ink-800 rounded-lg">
                레퍼토리에 등록된 곡이 없습니다. 먼저 레퍼토리에서 곡을 추가하세요.
              </div>
            ) : (
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {pieces.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPieceId(p.id)}
                    className={[
                      'w-full text-left px-4 py-3 rounded-lg border-2 transition',
                      pieceId === p.id
                        ? 'border-accent-600 bg-accent-50 dark:bg-accent-950'
                        : 'border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600',
                    ].join(' ')}
                  >
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-ink-500 dark:text-ink-400">
                      {p.composer}
                      {p.opus ? ` · ${p.opus}` : ''}
                      {p.movement ? ` · ${p.movement}` : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
