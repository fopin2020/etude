import { useState, type KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'
import { db } from '../db/database'
import type { Piece } from '../types'

interface Props {
  piece: Piece
}

export function MemorizedMeasures({ piece }: Props) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const measures = (piece.measuresMemorized ?? []).slice().sort((a, b) => a - b)

  const persist = async (next: number[]) => {
    const dedup = Array.from(new Set(next)).sort((a, b) => a - b)
    await db.pieces.update(piece.id, {
      measuresMemorized: dedup,
      updatedAt: new Date().toISOString(),
    })
  }

  const parseInput = (s: string): number[] | string => {
    const parts = s.split(/[,\s]+/).filter(Boolean)
    const acc: number[] = []
    for (const p of parts) {
      const range = p.match(/^(\d+)\s*[-~]\s*(\d+)$/)
      if (range) {
        const a = Number(range[1])
        const b = Number(range[2])
        if (a <= 0 || b <= 0 || a > 9999 || b > 9999) return `유효한 마디 번호가 아닙니다: ${p}`
        const lo = Math.min(a, b)
        const hi = Math.max(a, b)
        if (hi - lo > 200) return `한 번에 추가할 수 있는 범위는 200마디까지입니다: ${p}`
        for (let i = lo; i <= hi; i++) acc.push(i)
      } else {
        const n = Number(p)
        if (!Number.isInteger(n) || n <= 0 || n > 9999) return `유효한 마디 번호가 아닙니다: ${p}`
        acc.push(n)
      }
    }
    return acc
  }

  const handleAdd = async () => {
    if (!input.trim()) return
    const parsed = parseInput(input.trim())
    if (typeof parsed === 'string') {
      setError(parsed)
      return
    }
    setError(null)
    await persist([...measures, ...parsed])
    setInput('')
  }

  const handleRemove = async (n: number) => {
    await persist(measures.filter((m) => m !== n))
  }

  const handleClearAll = async () => {
    if (!confirm('이 곡의 외운 마디 기록을 모두 지울까요?')) return
    await persist([])
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleAdd()
    }
  }

  const ranges = compactRanges(measures)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <strong className="tabular">{measures.length}</strong>
          <span className="text-ink-500 dark:text-ink-400">마디 외움</span>
          {ranges.length > 0 && (
            <span className="ml-2 text-xs text-ink-500 dark:text-ink-400">({ranges.join(', ')})</span>
          )}
        </div>
        {measures.length > 0 && (
          <button
            onClick={() => void handleClearAll()}
            className="text-xs text-ink-500 hover:text-rose-600 underline"
          >
            모두 지우기
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(null) }}
          onKeyDown={onKeyDown}
          placeholder="예: 24  또는  24-32  또는  24, 28, 60-72"
          className="flex-1 px-3 py-2.5 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px] tabular"
          aria-label="마디 번호 입력"
        />
        <button
          onClick={() => void handleAdd()}
          className="px-4 min-h-[44px] rounded-lg bg-accent-600 hover:bg-accent-700 text-white inline-flex items-center gap-1.5 text-sm font-medium"
        >
          <Plus size={18} /> 추가
        </button>
      </div>

      {error && <div className="text-xs text-rose-600 dark:text-rose-400">{error}</div>}

      {measures.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {measures.map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs tabular"
            >
              {m}
              <button
                onClick={() => void handleRemove(m)}
                className="ml-0.5 inline-flex items-center justify-center w-5 h-5 rounded-sm hover:bg-emerald-200 dark:hover:bg-emerald-800"
                aria-label={`마디 ${m} 제거`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function compactRanges(nums: number[]): string[] {
  if (nums.length === 0) return []
  const out: string[] = []
  let lo = nums[0]!
  let hi = nums[0]!
  for (let i = 1; i < nums.length; i++) {
    const n = nums[i]!
    if (n === hi + 1) {
      hi = n
    } else {
      out.push(lo === hi ? `${lo}` : `${lo}–${hi}`)
      lo = n
      hi = n
    }
  }
  out.push(lo === hi ? `${lo}` : `${lo}–${hi}`)
  return out
}
