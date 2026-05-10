import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { ArrowLeft, Trash2, Pencil } from 'lucide-react'
import { db } from '../db/database'
import { deletePieceCascade, totalSecondsForPiece } from '../db/queries'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { PieceForm, type PieceFormValues } from '../components/PieceForm'
import { STAGE_LABEL_KO, type Stage } from '../types'
import { formatDateKo, formatMinutes, formatRelativeKo } from '../lib/format'

export function PieceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)

  const piece = useLiveQuery(async () => (id ? db.pieces.get(id) : undefined), [id])
  const totalSec = useLiveQuery(async () => (id ? totalSecondsForPiece(id) : 0), [id]) ?? 0
  const sessions = useLiveQuery(
    async () => (id ? db.sessions.where('pieceId').equals(id).reverse().sortBy('date') : []),
    [id],
  ) ?? []

  if (!piece) {
    return (
      <div className="p-6">
        <Link to="/repertoire" className="text-accent-600 underline text-sm">레퍼토리로 돌아가기</Link>
        <div className="mt-4">곡을 찾을 수 없습니다.</div>
      </div>
    )
  }

  const handleEdit = async (v: PieceFormValues) => {
    await db.pieces.update(piece.id, {
      ...v,
      updatedAt: new Date().toISOString(),
    })
    setEditOpen(false)
  }

  const handleDelete = async () => {
    if (!confirm(`'${piece.title}'을(를) 삭제하시겠습니까?\n관련 세션의 곡 연결은 끊어지지만 시간 기록은 보존됩니다.`)) return
    await deletePieceCascade(piece.id)
    navigate('/repertoire')
  }

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8 max-w-5xl mx-auto">
      <Link
        to="/repertoire"
        className="inline-flex items-center gap-1 text-sm text-ink-500 dark:text-ink-400 hover:text-accent-600 mb-4"
      >
        <ArrowLeft size={16} /> 레퍼토리
      </Link>

      <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="text-sm text-ink-500 dark:text-ink-400">{piece.composer}</div>
            <h1 className="font-serif text-3xl lg:text-4xl font-bold mt-1">{piece.title}</h1>
            {(piece.opus || piece.movement) && (
              <div className="text-sm text-ink-600 dark:text-ink-300 mt-1">
                {piece.opus} {piece.movement && `· ${piece.movement}`}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil size={18} /> 편집
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 size={18} /> 삭제
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Stat label="단계" value={`${piece.stage}단계`} sub={STAGE_LABEL_KO[piece.stage as Stage]} />
          <Stat label="누적 연습 시간" value={formatMinutes(totalSec)} sub={`${sessions.length}회 세션`} />
          <Stat
            label="난이도"
            value={piece.difficulty ? `${piece.difficulty} / 10` : '—'}
            sub=""
          />
          <Stat
            label="발표회 D-day"
            value={piece.recitalDate ? daysUntil(piece.recitalDate) : '—'}
            sub={piece.recitalDate ? formatDateKo(piece.recitalDate) : ''}
          />
        </div>

        {piece.difficultSections && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-ink-600 dark:text-ink-300 mb-2">어려운 구간 메모</h2>
            <div className="bg-ink-50 dark:bg-ink-950 rounded-lg p-4 text-sm whitespace-pre-wrap">
              {piece.difficultSections}
            </div>
          </section>
        )}
      </div>

      <section className="mt-6 bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-6">
        <h2 className="text-base font-semibold mb-4">최근 세션</h2>
        {sessions.length === 0 ? (
          <div className="text-sm text-ink-500 dark:text-ink-400">아직 이 곡의 연습 기록이 없습니다.</div>
        ) : (
          <ul className="divide-y divide-ink-100 dark:divide-ink-800">
            {sessions.slice(0, 20).map((s) => (
              <li key={s.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">{formatDateKo(s.date, 'M월 d일 HH:mm')}</div>
                  <div className="text-xs text-ink-500 dark:text-ink-400">{formatRelativeKo(s.date)}</div>
                </div>
                <div className="tabular text-sm">{formatMinutes(s.durationSec)}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 text-xs text-ink-500 dark:text-ink-400">
        템포 진척도 라인 차트, 마디 단위 암보, 녹음 비교는 Phase 2/3에서 추가됩니다.
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="곡 편집" size="lg">
        <PieceForm initial={piece} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} submitLabel="저장" />
      </Modal>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-ink-50 dark:bg-ink-950 rounded-lg p-3">
      <div className="text-[11px] text-ink-500 dark:text-ink-400">{label}</div>
      <div className="font-semibold text-base mt-0.5 tabular">{value}</div>
      {sub && <div className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function daysUntil(iso: string): string {
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'D-day'
  if (diff > 0) return `D-${diff}`
  return `D+${Math.abs(diff)}`
}
