import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { ArrowLeft, Trash2, Pencil, Activity, Mic } from 'lucide-react'
import { db } from '../db/database'
import { deletePieceCascade, totalSecondsForPiece } from '../db/queries'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { PieceForm, type PieceFormValues } from '../components/PieceForm'
import { TempoLine } from '../components/charts/TempoLine'
import { RecordingList } from '../components/RecordingList'
import { RecorderModal } from '../components/RecorderModal'
import { MemorizedMeasures } from '../components/MemorizedMeasures'
import { STAGE_LABEL_KO, type Stage } from '../types'
import { formatDateKo, formatMinutes, formatRelativeKo } from '../lib/format'

export function PieceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [recordOpen, setRecordOpen] = useState(false)

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
    if (!confirm(`'${piece.title}'을(를) 삭제하시겠습니까?\n관련 세션의 곡 연결은 끊어지지만 시간 기록은 보존됩니다.\n녹음은 모두 삭제됩니다.`)) return
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
            <h1 className="text-2xl lg:text-3xl font-bold mt-1">{piece.title}</h1>
            {(piece.opus || piece.movement) && (
              <div className="text-sm text-ink-600 dark:text-ink-300 mt-1">
                {piece.opus} {piece.movement && `· ${piece.movement}`}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to={`/metronome?piece=${piece.id}`}>
              <Button>
                <Activity size={18} /> 메트로놈 연동
              </Button>
            </Link>
            <Button variant="secondary" onClick={() => setRecordOpen(true)}>
              <Mic size={18} /> 녹음
            </Button>
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
          <Stat label="난이도" value={piece.difficulty ? `${piece.difficulty} / 10` : '—'} sub="" />
          <Stat
            label="발표회 D-day"
            value={piece.recitalDate ? daysUntil(piece.recitalDate) : '—'}
            sub={piece.recitalDate ? formatDateKo(piece.recitalDate) : ''}
            tone={piece.recitalDate ? recitalTone(piece.recitalDate) : undefined}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <section className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-6">
          <h2 className="text-base font-semibold mb-4">템포 진척도</h2>
          <TempoLine piece={piece} />
        </section>

        <section className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-6">
          <h2 className="text-base font-semibold mb-4">외운 마디</h2>
          <MemorizedMeasures piece={piece} />
        </section>
      </div>

      <section className="mt-6 bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-6">
        <h2 className="text-base font-semibold mb-4">녹음</h2>
        <RecordingList pieceId={piece.id} />
      </section>

      <section className="mt-6 bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-6">
        <h2 className="text-base font-semibold mb-4">최근 세션</h2>
        {sessions.length === 0 ? (
          <div className="text-sm text-ink-500 dark:text-ink-400">아직 이 곡의 연습 기록이 없습니다.</div>
        ) : (
          <ul className="divide-y divide-ink-100 dark:divide-ink-800">
            {sessions.slice(0, 20).map((s) => (
              <li key={s.id} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">{formatDateKo(s.date, 'M월 d일 HH:mm')}</div>
                    <div className="text-xs text-ink-500 dark:text-ink-400">{formatRelativeKo(s.date)}</div>
                  </div>
                  <div className="tabular text-sm">{formatMinutes(s.durationSec)}</div>
                </div>
                {s.notes && (s.notes.wentWell || s.notes.needsWork || s.notes.nextStart) && (
                  <div className="mt-2 ml-1 space-y-1 text-xs text-ink-600 dark:text-ink-300">
                    {s.notes.wentWell && <NoteRow icon="✓" tone="emerald" text={s.notes.wentWell} />}
                    {s.notes.needsWork && <NoteRow icon="!" tone="amber" text={s.notes.needsWork} />}
                    {s.notes.nextStart && <NoteRow icon="→" tone="indigo" text={s.notes.nextStart} />}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="곡 편집" size="lg">
        <PieceForm initial={piece} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} submitLabel="저장" />
      </Modal>

      <RecorderModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        pieceId={piece.id}
        pieceTitle={piece.title}
      />
    </div>
  )
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'urgent' | 'warning' | 'normal' }) {
  const bg =
    tone === 'urgent'
      ? 'bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900'
      : tone === 'warning'
        ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900'
        : 'bg-ink-50 dark:bg-ink-950'
  const valueCls =
    tone === 'urgent' ? 'text-rose-700 dark:text-rose-300' : tone === 'warning' ? 'text-amber-700 dark:text-amber-300' : ''
  return (
    <div className={`${bg} rounded-lg p-3`}>
      <div className="text-[11px] text-ink-500 dark:text-ink-400">{label}</div>
      <div className={`font-semibold text-base mt-0.5 tabular ${valueCls}`}>{value}</div>
      {sub && <div className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function recitalTone(iso: string): 'urgent' | 'warning' | 'normal' {
  const d = Math.round((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (d < 0) return 'normal'
  if (d <= 14) return 'urgent'
  if (d <= 60) return 'warning'
  return 'normal'
}

function NoteRow({ icon, tone, text }: { icon: string; tone: 'emerald' | 'amber' | 'indigo'; text: string }) {
  const cls = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    indigo: 'text-accent-600 dark:text-accent-400',
  }[tone]
  return (
    <div className="flex gap-2">
      <span className={`shrink-0 font-bold ${cls}`}>{icon}</span>
      <span className="whitespace-pre-wrap">{text}</span>
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
