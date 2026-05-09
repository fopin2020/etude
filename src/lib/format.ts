import { format, formatDistanceToNowStrict } from 'date-fns'
import { ko } from 'date-fns/locale'

export function formatDuration(sec: number): string {
  if (sec < 0) sec = 0
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatMinutes(sec: number): string {
  const m = Math.round(sec / 60)
  if (m < 60) return `${m}분`
  const h = Math.floor(m / 60)
  const r = m % 60
  if (r === 0) return `${h}시간`
  return `${h}시간 ${r}분`
}

export function formatDateKo(iso: string, fmt = 'M월 d일 (eee)'): string {
  return format(new Date(iso), fmt, { locale: ko })
}

export function formatRelativeKo(iso: string): string {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true, locale: ko })
}

export function todayDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function isSameLocalDay(isoOrDate: string, ref: Date = new Date()): boolean {
  const d = new Date(isoOrDate)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
}

export function startOfWeekLocal(ref: Date = new Date()): Date {
  const d = new Date(ref)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function startOfMonthLocal(ref: Date = new Date()): Date {
  const d = new Date(ref.getFullYear(), ref.getMonth(), 1)
  d.setHours(0, 0, 0, 0)
  return d
}
