import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Copy, Download, Printer, Check } from 'lucide-react'
import {
  buildReport,
  copyToClipboard,
  defaultWeekRange,
  downloadText,
  printHTML,
  reportToHTML,
  reportToMarkdown,
  type ReportData,
} from '../lib/report'
import { formatDateKo } from '../lib/format'

interface Props {
  open: boolean
  onClose: () => void
}

export function ReportDialog({ open, onClose }: Props) {
  const initial = defaultWeekRange()
  const [start, setStart] = useState<string>(toInputDate(initial.start))
  const [end, setEnd] = useState<string>(toInputDate(initial.end))
  const [data, setData] = useState<ReportData | null>(null)
  const [building, setBuilding] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState<'preview' | 'markdown'>('preview')

  const generate = async () => {
    setBuilding(true)
    try {
      const startD = new Date(start)
      startD.setHours(0, 0, 0, 0)
      const endD = new Date(end)
      endD.setHours(23, 59, 59, 999)
      const r = await buildReport({ start: startD, end: endD })
      setData(r)
    } finally {
      setBuilding(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setData(null)
      setCopied(false)
      return
    }
    void generate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleCopy = async () => {
    if (!data) return
    const ok = await copyToClipboard(reportToMarkdown(data))
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const handleDownloadMd = () => {
    if (!data) return
    const stamp = `${start}_${end}`
    downloadText(`etude-report-${stamp}.md`, reportToMarkdown(data), 'text/markdown')
  }

  const handleDownloadHtml = () => {
    if (!data) return
    const stamp = `${start}_${end}`
    downloadText(`etude-report-${stamp}.html`, reportToHTML(data), 'text/html')
  }

  const handlePrint = () => {
    if (!data) return
    printHTML(reportToHTML(data))
  }

  const setQuickRange = (days: number) => {
    const e = new Date()
    const s = new Date(e)
    s.setDate(s.getDate() - (days - 1))
    setStart(toInputDate(s))
    setEnd(toInputDate(e))
  }

  return (
    <Modal open={open} onClose={onClose} title="주간 리포트" size="lg">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <DateField label="시작일" value={start} onChange={setStart} />
            <DateField label="종료일" value={end} onChange={setEnd} />
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickChip onClick={() => setQuickRange(7)}>최근 7일</QuickChip>
            <QuickChip onClick={() => setQuickRange(14)}>최근 14일</QuickChip>
            <QuickChip onClick={() => setQuickRange(30)}>최근 30일</QuickChip>
            <Button size="sm" onClick={() => void generate()}>
              {building ? '생성 중…' : '다시 생성'}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-ink-200 dark:border-ink-800">
          <TabButton active={tab === 'preview'} onClick={() => setTab('preview')}>미리보기</TabButton>
          <TabButton active={tab === 'markdown'} onClick={() => setTab('markdown')}>Markdown</TabButton>
        </div>

        <div className="bg-ink-50 dark:bg-ink-950 rounded-lg p-4 max-h-[55vh] overflow-y-auto">
          {!data ? (
            <div className="text-sm text-ink-500 dark:text-ink-400">생성 중…</div>
          ) : tab === 'preview' ? (
            <ReportPreview data={data} />
          ) : (
            <pre className="text-xs whitespace-pre-wrap font-mono">{reportToMarkdown(data)}</pre>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={() => void handleCopy()} disabled={!data}>
            {copied ? <><Check size={18} /> 복사됨</> : <><Copy size={18} /> Markdown 복사</>}
          </Button>
          <Button variant="secondary" onClick={handleDownloadMd} disabled={!data}>
            <Download size={18} /> .md
          </Button>
          <Button variant="secondary" onClick={handleDownloadHtml} disabled={!data}>
            <Download size={18} /> .html
          </Button>
          <Button onClick={handlePrint} disabled={!data}>
            <Printer size={18} /> 인쇄 / PDF
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function ReportPreview({ data }: { data: ReportData }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
      <h1 className="text-xl font-bold mb-3">주간 연습 리포트</h1>
      <div className="text-xs text-ink-500 mb-4">
        {formatDateKo(data.range.start.toISOString(), 'yyyy.M.d')} ~ {formatDateKo(data.range.end.toISOString(), 'yyyy.M.d')}
        ({data.totalDays}일)
      </div>

      <Section title="요약">
        <ul className="space-y-0.5 text-sm">
          <li>총 연습 시간: <strong>{Math.round(data.totalSec / 60)}분</strong></li>
          <li>일평균: <strong>{Math.round(data.dailyAverageSec / 60)}분</strong></li>
          <li>연습한 날: <strong>{data.daysWithPractice} / {data.totalDays}일</strong></li>
          {data.goalAchievementPct !== undefined && (
            <li>일일 목표 달성률: <strong>{Math.round(data.goalAchievementPct)}%</strong></li>
          )}
        </ul>
      </Section>

      <Section title="카테고리 분배">
        {data.byCategory.length === 0 ? (
          <div className="text-ink-500">기록 없음</div>
        ) : (
          <ul className="space-y-0.5">
            {data.byCategory.map((c) => (
              <li key={c.category}>
                {c.category}: <strong>{Math.round(c.sec / 60)}분</strong> ({c.pct.toFixed(0)}%)
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`곡별 시간 (${data.byPiece.length})`}>
        {data.byPiece.length === 0 ? (
          <div className="text-ink-500">레퍼토리 연습 없음</div>
        ) : (
          <ul className="space-y-0.5">
            {data.byPiece.map(({ piece, sec, sessionCount }) => (
              <li key={piece.id}>
                <strong>{piece.title}</strong> — {piece.composer}: {Math.round(sec / 60)}분 ({sessionCount}회)
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`도달 BPM 변화 (${data.bpmDelta.length})`}>
        {data.bpmDelta.length === 0 ? (
          <div className="text-ink-500">메트로놈 기록 없음</div>
        ) : (
          <ul className="space-y-0.5">
            {data.bpmDelta.map((b) => (
              <li key={b.piece.id}>
                <strong>{b.piece.title}</strong>: {b.first} → {b.last} BPM
                <span className={b.delta > 0 ? 'text-emerald-600 ml-1' : b.delta < 0 ? 'text-rose-600 ml-1' : 'text-ink-500 ml-1'}>
                  ({b.delta > 0 ? '+' : ''}{b.delta})
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`회고 노트 (${data.notes.length})`}>
        {data.notes.length === 0 ? (
          <div className="text-ink-500">노트 없음</div>
        ) : (
          <div className="space-y-3">
            {data.notes.map((n, i) => (
              <div key={i} className="border-l-2 border-accent-400 dark:border-accent-700 pl-3">
                <div className="text-xs font-medium text-ink-700 dark:text-ink-300 mb-1">
                  {formatDateKo(n.date, 'M/d (eee) HH:mm')} — {n.pieceTitle ?? n.category}
                </div>
                {n.wentWell && <div className="text-xs"><span className="text-emerald-600 font-bold">✓</span> {n.wentWell}</div>}
                {n.needsWork && <div className="text-xs"><span className="text-amber-600 font-bold">!</span> {n.needsWork}</div>}
                {n.nextStart && <div className="text-xs"><span className="text-accent-600 font-bold">→</span> {n.nextStart}</div>}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-accent-700 dark:text-accent-400 mb-1.5">{title}</h3>
      {children}
    </div>
  )
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px] tabular"
      />
    </label>
  )
}

function QuickChip({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs rounded-full bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700"
    >
      {children}
    </button>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition',
        active ? 'border-accent-600 text-accent-700 dark:text-accent-300' : 'border-transparent text-ink-500 hover:text-ink-700',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
