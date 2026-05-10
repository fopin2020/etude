import { useEffect, useMemo, useState } from 'react'
import { Pencil, Sparkles, BookOpen } from 'lucide-react'
import { Button } from './Button'
import { Dial, type DialItem } from './Dial'
import {
  sortedComposers,
  categoriesOf,
  opusesOf,
  piecesOf,
  resolveSelection,
} from '../data/repertoire'
import type { PieceFormValues } from './PieceForm'
import { STAGE_LABEL_KO, type Stage } from '../types'

interface Props {
  onSubmit: (values: PieceFormValues) => void | Promise<void>
  onCancel: () => void
  onSwitchToManual: () => void
}

export function PiecePickerWizard({ onSubmit, onCancel, onSwitchToManual }: Props) {
  const composers = useMemo(() => sortedComposers(), [])

  const [composerId, setComposerId] = useState<string | null>(composers[0]?.id ?? null)
  const [category, setCategory] = useState<string | null>(null)
  const [workId, setWorkId] = useState<string | null>(null)
  const [pieceId, setPieceId] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>(1)

  // ----- derived item lists -----
  const composerItems: DialItem[] = useMemo(
    () => composers.map((c) => ({ id: c.id, label: c.name, hint: `${c.era} · ${c.years}` })),
    [composers],
  )

  const categoryItems: DialItem[] = useMemo(() => {
    if (!composerId) return []
    return categoriesOf(composerId).map((cat) => ({ id: cat, label: cat }))
  }, [composerId])

  const opusItems: DialItem[] = useMemo(() => {
    if (!composerId || !category) return []
    return opusesOf(composerId, category).map((o) => ({ id: o.workId, label: o.label }))
  }, [composerId, category])

  const pieceItems: DialItem[] = useMemo(() => {
    if (!workId) return []
    return piecesOf(workId).map((p) => ({
      id: p.id,
      label: p.label,
      hint: p.nickname ? `“${p.nickname}”` : undefined,
    }))
  }, [workId])

  // ----- cascade reset / auto-select -----
  // When composer changes, reset category onward
  useEffect(() => {
    if (categoryItems.length === 0) {
      setCategory(null)
    } else if (!category || !categoryItems.find((it) => it.id === category)) {
      setCategory(categoryItems[0].id)
    }
  }, [composerId, categoryItems, category])

  useEffect(() => {
    if (opusItems.length === 0) {
      setWorkId(null)
    } else if (!workId || !opusItems.find((it) => it.id === workId)) {
      setWorkId(opusItems[0].id)
    }
  }, [composerId, category, opusItems, workId])

  useEffect(() => {
    if (pieceItems.length === 0) {
      setPieceId(null)
    } else if (!pieceId || !pieceItems.find((it) => it.id === pieceId)) {
      setPieceId(pieceItems[0].id)
    }
  }, [workId, pieceItems, pieceId])

  // ----- resolution & preview -----
  const resolved =
    composerId && workId && pieceId ? resolveSelection(composerId, workId, pieceId) : null

  const handleAdd = () => {
    if (!resolved) return
    const { composer, work, piece } = resolved

    // Build human-friendly title and movement strings
    const titleParts: string[] = []
    if (piece.fullTitle) {
      titleParts.push(piece.fullTitle)
    } else {
      titleParts.push(`${work.category} · ${work.opusLabel}`)
      if (piece.label && piece.id !== 'all') titleParts.push(piece.label)
    }
    const title = titleParts.join(' — ')

    void onSubmit({
      title,
      composer: composer.name,
      opus: work.opusLabel,
      movement: piece.id === 'all' ? undefined : piece.label,
      difficulty: piece.difficulty,
      stage,
      difficultSections: piece.difficultSections,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header strip with switch-to-manual escape */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-ink-500 dark:text-ink-400">
          작곡가 → 분류 → 작품번호 → 곡 순으로 다이얼을 돌려 선택
        </div>
        <button
          type="button"
          onClick={onSwitchToManual}
          className="text-xs text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 inline-flex items-center gap-1 underline-offset-2 hover:underline"
        >
          <Pencil size={13} /> 직접 입력
        </button>
      </div>

      {/* Four-dial cascade */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Dial
          label="작곡가"
          items={composerItems}
          value={composerId}
          onChange={setComposerId}
          highlight={!composerId}
        />
        <Dial
          label="분류"
          items={categoryItems}
          value={category}
          onChange={setCategory}
          emptyHint="작곡가를 먼저 선택"
          highlight={!!composerId && !category}
        />
        <Dial
          label="작품번호"
          items={opusItems}
          value={workId}
          onChange={setWorkId}
          emptyHint="분류를 먼저 선택"
          highlight={!!category && !workId}
        />
        <Dial
          label="곡"
          items={pieceItems}
          value={pieceId}
          onChange={setPieceId}
          emptyHint="작품을 먼저 선택"
          highlight={!!workId && !pieceId}
        />
      </div>

      {/* Preview */}
      {resolved && (
        <div className="rounded-xl border border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-950 p-5 lg:p-6">
          <div className="flex items-start gap-2 mb-4">
            <BookOpen size={18} className="text-accent-600 dark:text-accent-400 mt-1 shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-ink-500 dark:text-ink-400">
                {resolved.composer.name} · {resolved.composer.era} ({resolved.composer.years})
              </div>
              <div className="font-serif text-xl lg:text-2xl font-bold mt-0.5 leading-tight">
                {resolved.work.category} {resolved.work.opusLabel}
              </div>
              {resolved.piece.id !== 'all' && (
                <div className="text-base text-ink-700 dark:text-ink-200 mt-0.5">
                  {resolved.piece.label}
                  {resolved.piece.nickname && (
                    <span className="text-ink-500 dark:text-ink-400 ml-2">“{resolved.piece.nickname}”</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Difficulty bar (Henle) */}
          {typeof resolved.piece.difficulty === 'number' && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400">Henle 난이도</div>
                <div className="text-sm tabular font-semibold text-accent-700 dark:text-accent-300">
                  {resolved.piece.difficulty} / 9
                </div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className={[
                      'flex-1 h-2 rounded-sm',
                      i < resolved.piece.difficulty!
                        ? i < 3
                          ? 'bg-emerald-500/70'
                          : i < 6
                          ? 'bg-accent-400'
                          : 'bg-rose-500/80'
                        : 'bg-ink-200 dark:bg-ink-800',
                    ].join(' ')}
                  />
                ))}
              </div>
              <div className="text-[10px] text-ink-400 dark:text-ink-500 mt-1 text-right">
                1–3 입문 · 4–6 중급 · 7–9 고급
              </div>
            </div>
          )}

          {/* Difficult sections (consensus passage notes) */}
          {resolved.piece.difficultSections && (
            <div className="mb-4">
              <div className="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400 mb-1.5">
                자주 지적되는 난구간
              </div>
              <div className="text-sm leading-relaxed text-ink-800 dark:text-ink-200">
                {resolved.piece.difficultSections}
              </div>
            </div>
          )}

          {/* General consensus note */}
          {resolved.piece.notes && (
            <div className="mb-4">
              <div className="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400 mb-1.5 flex items-center gap-1">
                <Sparkles size={11} /> 보편적 평가
              </div>
              <div className="text-sm leading-relaxed text-ink-800 dark:text-ink-200">
                {resolved.piece.notes}
              </div>
            </div>
          )}

          <div className="text-[11px] text-ink-400 dark:text-ink-500 italic mt-3 pt-3 border-t border-ink-200 dark:border-ink-800">
            ※ 난이도와 난구간은 학계의 보편적 의견을 정리한 참고용 정보입니다. 곡 추가 후 본인 메모로 자유롭게 편집하실 수 있습니다.
          </div>
        </div>
      )}

      {/* Stage picker */}
      {resolved && (
        <div>
          <div className="text-xs uppercase tracking-widest text-ink-500 dark:text-ink-400 mb-2">단계</div>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as Stage[]).map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setStage(s)}
                className={[
                  'px-3 py-3 rounded-lg border-2 text-sm transition min-h-[52px]',
                  stage === s
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-950 text-accent-700 dark:text-accent-300'
                    : 'border-ink-200 dark:border-ink-700 hover:border-ink-300 dark:hover:border-ink-600',
                ].join(' ')}
              >
                <div className="font-semibold">{s}단계</div>
                <div className="text-[11px] mt-0.5 text-ink-500 dark:text-ink-400">{STAGE_LABEL_KO[s]}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>취소</Button>
        <Button type="button" onClick={handleAdd} disabled={!resolved}>레퍼토리에 추가</Button>
      </div>
    </div>
  )
}
