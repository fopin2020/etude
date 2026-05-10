import { db } from '../db/database'
import type { Goals, Piece, Session } from '../types'
import { CATEGORY_LABEL_KO } from '../types'
import { dayKey } from './analytics'
import { formatDateKo, formatMinutes } from './format'

export interface ReportRange {
  start: Date
  end: Date
}

export function defaultWeekRange(ref: Date = new Date()): ReportRange {
  const end = new Date(ref)
  end.setHours(23, 59, 59, 999)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  start.setHours(0, 0, 0, 0)
  return { start, end }
}

export interface ReportData {
  range: ReportRange
  totalSec: number
  daysWithPractice: number
  totalDays: number
  dailyAverageSec: number
  goalDailyMin?: number
  goalAchievementPct?: number
  byDay: Array<{ date: Date; sec: number }>
  byCategory: Array<{ category: string; sec: number; pct: number }>
  byPiece: Array<{ piece: Piece; sec: number; sessionCount: number }>
  bpmDelta: Array<{ piece: Piece; first: number; last: number; delta: number; entries: number }>
  notes: Array<{
    date: string
    pieceTitle?: string
    category: string
    wentWell?: string
    needsWork?: string
    nextStart?: string
  }>
}

export async function buildReport(range: ReportRange): Promise<ReportData> {
  const [allSessions, allPieces, goals] = await Promise.all([
    db.sessions.toArray(),
    db.pieces.toArray(),
    db.goals.get('singleton'),
  ])
  const piecesById = new Map(allPieces.map((p) => [p.id, p]))

  const inRange = (s: Session) => {
    const d = new Date(s.date)
    return d >= range.start && d <= range.end
  }
  const sessions = allSessions.filter(inRange)
  const totalSec = sessions.reduce((a, s) => a + s.durationSec, 0)

  const byDayMap: Record<string, { date: Date; sec: number }> = {}
  const totalDays = Math.round((range.end.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const cur = new Date(range.start)
  for (let i = 0; i < totalDays; i++) {
    byDayMap[dayKey(cur)] = { date: new Date(cur), sec: 0 }
    cur.setDate(cur.getDate() + 1)
  }
  for (const s of sessions) {
    const k = dayKey(new Date(s.date))
    if (byDayMap[k]) byDayMap[k].sec += s.durationSec
  }
  const byDay = Object.values(byDayMap).sort((a, b) => a.date.getTime() - b.date.getTime())
  const daysWithPractice = byDay.filter((d) => d.sec > 0).length

  const catMap: Record<string, number> = {}
  for (const s of sessions) catMap[s.category] = (catMap[s.category] ?? 0) + s.durationSec
  const byCategory = Object.entries(catMap)
    .map(([category, sec]) => ({
      category,
      sec,
      pct: totalSec > 0 ? (sec / totalSec) * 100 : 0,
    }))
    .sort((a, b) => b.sec - a.sec)

  const pieceMap: Record<string, { sec: number; count: number }> = {}
  for (const s of sessions) {
    if (!s.pieceId) continue
    const slot = pieceMap[s.pieceId] ?? { sec: 0, count: 0 }
    slot.sec += s.durationSec
    slot.count++
    pieceMap[s.pieceId] = slot
  }
  const byPiece = Object.entries(pieceMap)
    .map(([id, v]) => ({
      piece: piecesById.get(id)!,
      sec: v.sec,
      sessionCount: v.count,
    }))
    .filter((d) => d.piece)
    .sort((a, b) => b.sec - a.sec)

  const bpmDelta: ReportData['bpmDelta'] = []
  for (const piece of allPieces) {
    const inRangeLogs = piece.tempoLog.filter((p) => {
      const d = new Date(p.date)
      return d >= range.start && d <= range.end
    })
    if (inRangeLogs.length === 0) continue
    inRangeLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const first = inRangeLogs[0]!.bpm
    const last = inRangeLogs[inRangeLogs.length - 1]!.bpm
    bpmDelta.push({ piece, first, last, delta: last - first, entries: inRangeLogs.length })
  }
  bpmDelta.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))

  const notes = sessions
    .filter((s) => s.notes && (s.notes.wentWell || s.notes.needsWork || s.notes.nextStart))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((s) => ({
      date: s.date,
      pieceTitle: s.pieceId ? piecesById.get(s.pieceId)?.title : undefined,
      category: s.category,
      wentWell: s.notes?.wentWell,
      needsWork: s.notes?.needsWork,
      nextStart: s.notes?.nextStart,
    }))

  const goalAchievementPct = goalAchievement(byDay, goals)

  return {
    range,
    totalSec,
    daysWithPractice,
    totalDays,
    dailyAverageSec: totalDays > 0 ? totalSec / totalDays : 0,
    goalDailyMin: goals?.dailyMin,
    goalAchievementPct,
    byDay,
    byCategory,
    byPiece,
    bpmDelta,
    notes,
  }
}

function goalAchievement(byDay: Array<{ sec: number }>, goals: Goals | undefined): number | undefined {
  if (!goals?.dailyMin) return undefined
  const goalSec = goals.dailyMin * 60
  const days = byDay.length
  if (days === 0) return 0
  const avg = byDay.reduce((a, d) => a + d.sec, 0) / days
  return (avg / goalSec) * 100
}

export function reportToMarkdown(r: ReportData): string {
  const fmtRange = `${formatDateKo(r.range.start.toISOString(), 'yyyy년 M월 d일')} ~ ${formatDateKo(r.range.end.toISOString(), 'yyyy년 M월 d일')}`
  const lines: string[] = []
  lines.push(`# 주간 연습 리포트`)
  lines.push('')
  lines.push(`**기간**: ${fmtRange} (${r.totalDays}일)`)
  lines.push('')

  lines.push(`## 요약`)
  lines.push(`- **총 연습 시간**: ${formatMinutes(r.totalSec)}`)
  lines.push(`- **일평균**: ${formatMinutes(Math.round(r.dailyAverageSec))}`)
  lines.push(`- **연습한 날**: ${r.daysWithPractice} / ${r.totalDays}일`)
  if (r.goalAchievementPct !== undefined && r.goalDailyMin) {
    lines.push(`- **일일 목표 달성률**: ${Math.round(r.goalAchievementPct)}% (목표 ${r.goalDailyMin}분)`)
  }
  lines.push('')

  lines.push(`## 일자별 연습 시간`)
  for (const d of r.byDay) {
    const label = formatDateKo(d.date.toISOString(), 'M/d (eee)')
    const v = d.sec > 0 ? formatMinutes(d.sec) : '—'
    lines.push(`- **${label}**: ${v}`)
  }
  lines.push('')

  lines.push(`## 카테고리 분배`)
  if (r.byCategory.length === 0) {
    lines.push('- 기록 없음')
  } else {
    for (const c of r.byCategory) {
      const label = CATEGORY_LABEL_KO[c.category as keyof typeof CATEGORY_LABEL_KO] ?? c.category
      lines.push(`- **${label}**: ${formatMinutes(c.sec)} (${c.pct.toFixed(0)}%)`)
    }
  }
  lines.push('')

  lines.push(`## 곡별 시간`)
  if (r.byPiece.length === 0) {
    lines.push('- 레퍼토리 연습 기록 없음')
  } else {
    for (const p of r.byPiece) {
      lines.push(`- **${p.piece.title}** — ${p.piece.composer}: ${formatMinutes(p.sec)} (${p.sessionCount}회)`)
    }
  }
  lines.push('')

  lines.push(`## 도달 BPM 변화`)
  if (r.bpmDelta.length === 0) {
    lines.push('- 메트로놈 기록 없음')
  } else {
    for (const b of r.bpmDelta) {
      const arrow = b.delta > 0 ? '↑' : b.delta < 0 ? '↓' : '·'
      const sign = b.delta > 0 ? '+' : ''
      lines.push(`- **${b.piece.title}**: ${b.first} → ${b.last} BPM (${arrow} ${sign}${b.delta}, ${b.entries}회 측정)`)
    }
  }
  lines.push('')

  lines.push(`## 회고 노트`)
  if (r.notes.length === 0) {
    lines.push('_노트가 없습니다._')
  } else {
    for (const n of r.notes) {
      const head = `${formatDateKo(n.date, 'M/d (eee) HH:mm')} — ${n.pieceTitle ?? CATEGORY_LABEL_KO[n.category as keyof typeof CATEGORY_LABEL_KO] ?? n.category}`
      lines.push(`### ${head}`)
      if (n.wentWell) lines.push(`- ✓ **잘 된 것**: ${n.wentWell}`)
      if (n.needsWork) lines.push(`- ! **안 된 것**: ${n.needsWork}`)
      if (n.nextStart) lines.push(`- → **내일의 시작점**: ${n.nextStart}`)
      lines.push('')
    }
  }

  lines.push('---')
  lines.push(`_Étude로 생성됨 · ${new Date().toLocaleString('ko-KR')}_`)
  return lines.join('\n')
}

export function reportToHTML(r: ReportData): string {
  const md = reportToMarkdown(r)
  const html = mdLikeToHTML(md)
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>주간 연습 리포트 — ${formatDateKo(r.range.start.toISOString(), 'M/d')}~${formatDateKo(r.range.end.toISOString(), 'M/d')}</title>
<style>
  body { max-width: 720px; margin: 2rem auto; padding: 0 1rem; font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif; color: #1e293b; line-height: 1.55; }
  h1 { font-size: 1.75rem; border-bottom: 2px solid #4f46e5; padding-bottom: 0.5rem; }
  h2 { font-size: 1.25rem; margin-top: 2rem; color: #4f46e5; }
  h3 { font-size: 1rem; margin-top: 1.5rem; color: #334155; }
  ul { padding-left: 1.25rem; }
  li { margin-bottom: 0.25rem; }
  hr { border: none; border-top: 1px solid #cbd5e1; margin: 2rem 0 1rem; }
  em { color: #94a3b8; font-size: 0.85rem; }
  strong { color: #0f172a; }
  @media print {
    body { margin: 0; }
    h2 { break-before: auto; }
  }
</style>
</head>
<body>
${html}
</body>
</html>`
}

function escapeHTML(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inlineMd(s: string): string {
  return escapeHTML(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/_(.+?)_/g, '<em>$1</em>')
}

function mdLikeToHTML(md: string): string {
  const lines = md.split('\n')
  const out: string[] = []
  let inList = false
  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.startsWith('### ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h3>${inlineMd(line.slice(4))}</h3>`)
    } else if (line.startsWith('## ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h2>${inlineMd(line.slice(3))}</h2>`)
    } else if (line.startsWith('# ')) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h1>${inlineMd(line.slice(2))}</h1>`)
    } else if (line.startsWith('- ')) {
      if (!inList) { out.push('<ul>'); inList = true }
      out.push(`<li>${inlineMd(line.slice(2))}</li>`)
    } else if (line === '---') {
      if (inList) { out.push('</ul>'); inList = false }
      out.push('<hr>')
    } else if (line === '') {
      if (inList) { out.push('</ul>'); inList = false }
    } else {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<p>${inlineMd(line)}</p>`)
    }
  }
  if (inList) out.push('</ul>')
  return out.join('\n')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function printHTML(html: string): void {
  const w = window.open('', '_blank', 'width=900,height=900')
  if (!w) {
    alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용한 뒤 다시 시도해 주세요.')
    return
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}
