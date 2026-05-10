import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { Plus, Music } from 'lucide-react'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { PieceForm, type PieceFormValues } from '../components/PieceForm'
import { PiecePickerWizard } from '../components/PiecePickerWizard'
import { db } from '../db/database'
import { aggregatedSecondsByPiece, newPiece } from '../db/queries'
import { STAGE_LABEL_KO, type Stage } from '../types'
import { formatMinutes, formatRelativeKo } from '../lib/format'

const STAGE_PILL: Record<Stage, string> = {
  1: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300',
  2: 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300',
  3: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
}

export function RepertoirePage() {
  const [filter, setFilter] = useState<'all' | Stage>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [createMode, setCreateMode] = useState<'wizard' | 'manual'>('wizard')
  const pieces = useLiveQuery(() => db.pieces.orderBy('updatedAt').reverse().toArray(), []) ?? []
  const totals = useLiveQuery(() => aggregatedSecondsByPiece(), []) ?? {}

  const filtered = useMemo(
    () => (filter === 'all' ? pieces : pieces.filter((p) => p.stage === filter)),
    [pieces, filter],
  )

  const counts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0 } as Record<Stage, number>
    for (const p of pieces) c[p.stage]++
    return c
  }, [pieces])

  const handleCreate = async (v: PieceFormValues) => {
    const piece = newPiece({ ...v })
    await db.pieces.put(piece)
    setCreateOpen(false)
  }

  const openCreate = () => {
    setCreateMode('wizard')
    setCreateOpen(true)
  }

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold">레퍼토리</h1>
          <div className="text-sm text-ink-500 dark:text-ink-400">{pieces.length}곡 등록됨</div>
        </div>
        <Button onClick={openCreate}>
          <Plus size={20} />
          곡 추가
        </Button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          전체 <span className="opacity-60">({pieces.length})</span>
        </FilterChip>
        {([1, 2, 3] as Stage[]).map((s) => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
            {s}단계 · {STAGE_LABEL_KO[s]} <span className="opacity-60">({counts[s]})</span>
          </FilterChip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState onAdd={openCreate} hasAny={pieces.length > 0} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const totalSec = totals[p.id] ?? 0
            return (
              <Link
                key={p.id}
                to={`/repertoire/${p.id}`}
                className="block bg-white dark:bg-ink-900 rounded-2xl p-5 border border-ink-200 dark:border-ink-800 hover:border-accent-400 dark:hover:border-accent-700 transition shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-semibold text-base leading-tight">{p.title}</div>
                  <span className={`shrink-0 text-[11px] font-medium px-2 py-1 rounded-full ${STAGE_PILL[p.stage]}`}>
                    {p.stage}단계
                  </span>
                </div>
                <div className="text-sm text-ink-600 dark:text-ink-300">
                  {p.composer}
                  {p.opus && <span className="text-ink-500"> · {p.opus}</span>}
                </div>
                {p.movement && <div className="text-xs text-ink-500 mt-0.5">{p.movement}</div>}
                <div className="mt-4 flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
                  <span>누적 {formatMinutes(totalSec)}</span>
                  <span>{formatRelativeKo(p.updatedAt)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={createMode === 'wizard' ? '새 곡 추가' : '새 곡 추가 — 직접 입력'}
        size={createMode === 'wizard' ? 'xl' : 'lg'}
      >
        {createMode === 'wizard' ? (
          <PiecePickerWizard
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
            onSwitchToManual={() => setCreateMode('manual')}
          />
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setCreateMode('wizard')}
              className="text-xs text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 underline-offset-2 hover:underline"
            >
              ← 다이얼로 선택하기
            </button>
            <PieceForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} submitLabel="추가" />
          </div>
        )}
      </Modal>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap min-h-[40px] transition',
        active
          ? 'bg-accent-600 text-white'
          : 'bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function EmptyState({ onAdd, hasAny }: { onAdd: () => void; hasAny: boolean }) {
  return (
    <div className="text-center py-16 bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ink-100 dark:bg-ink-800 mb-4">
        <Music size={28} className="text-ink-400" />
      </div>
      <div className="font-semibold mb-1">{hasAny ? '이 단계에 해당하는 곡이 없습니다' : '아직 곡이 없습니다'}</div>
      <div className="text-sm text-ink-500 dark:text-ink-400 mb-5">
        연습 중인 곡을 추가하면 누적 시간과 진척도를 자동으로 추적합니다.
      </div>
      <Button onClick={onAdd}>
        <Plus size={18} />첫 곡 추가
      </Button>
    </div>
  )
}
