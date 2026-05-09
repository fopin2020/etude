import { useState, type FormEvent } from 'react'
import { Button } from './Button'
import type { Piece, Stage } from '../types'
import { STAGE_LABEL_KO } from '../types'

interface Props {
  initial?: Partial<Piece>
  onSubmit: (input: PieceFormValues) => void | Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export interface PieceFormValues {
  title: string
  composer: string
  opus?: string
  movement?: string
  difficulty?: number
  stage: Stage
  difficultSections?: string
  recitalDate?: string
}

export function PieceForm({ initial, onSubmit, onCancel, submitLabel = '저장' }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [composer, setComposer] = useState(initial?.composer ?? '')
  const [opus, setOpus] = useState(initial?.opus ?? '')
  const [movement, setMovement] = useState(initial?.movement ?? '')
  const [difficulty, setDifficulty] = useState<number | ''>(initial?.difficulty ?? '')
  const [stage, setStage] = useState<Stage>(initial?.stage ?? 1)
  const [difficultSections, setDifficultSections] = useState(initial?.difficultSections ?? '')
  const [recitalDate, setRecitalDate] = useState(initial?.recitalDate?.slice(0, 10) ?? '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !composer.trim()) return
    void onSubmit({
      title: title.trim(),
      composer: composer.trim(),
      opus: opus.trim() || undefined,
      movement: movement.trim() || undefined,
      difficulty: typeof difficulty === 'number' ? difficulty : undefined,
      stage,
      difficultSections: difficultSections.trim() || undefined,
      recitalDate: recitalDate ? new Date(recitalDate).toISOString() : undefined,
    })
  }

  const inputCls =
    'w-full px-3 py-2.5 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px]'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="제목 *">
          <input
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="예: 에튀드 Op.10 No.4"
          />
        </Field>
        <Field label="작곡가 *">
          <input
            className={inputCls}
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            required
            placeholder="예: 쇼팽"
          />
        </Field>
        <Field label="작품번호 (Opus)">
          <input
            className={inputCls}
            value={opus}
            onChange={(e) => setOpus(e.target.value)}
            placeholder="Op.10 No.4"
          />
        </Field>
        <Field label="악장 / 부제">
          <input
            className={inputCls}
            value={movement}
            onChange={(e) => setMovement(e.target.value)}
            placeholder="예: 1악장"
          />
        </Field>
      </div>

      <Field label="단계">
        <div className="grid grid-cols-3 gap-2">
          {([1, 2, 3] as Stage[]).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setStage(s)}
              className={[
                'px-3 py-3 rounded-lg border-2 text-sm transition min-h-[52px]',
                stage === s
                  ? 'border-accent-600 bg-accent-50 dark:bg-accent-950 text-accent-700 dark:text-accent-300'
                  : 'border-ink-200 dark:border-ink-700',
              ].join(' ')}
            >
              <div className="font-semibold">{s}단계</div>
              <div className="text-[11px] mt-0.5 text-ink-500 dark:text-ink-400">{STAGE_LABEL_KO[s]}</div>
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="난이도 (1–10)">
          <input
            type="number"
            min={1}
            max={10}
            className={inputCls}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </Field>
        <Field label="발표회 / 콩쿠르 D-day">
          <input type="date" className={inputCls} value={recitalDate} onChange={(e) => setRecitalDate(e.target.value)} />
        </Field>
      </div>

      <Field label="어려운 구간 메모">
        <textarea
          className={inputCls + ' min-h-[100px] resize-y'}
          value={difficultSections}
          onChange={(e) => setDifficultSections(e.target.value)}
          placeholder="예: mm. 24–32 왼손 도약, mm. 60 트릴 후 옥타브 진입"
        />
      </Field>

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">{label}</span>
      {children}
    </label>
  )
}
