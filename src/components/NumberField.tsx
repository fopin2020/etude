import { useEffect, useState } from 'react'
import type { InputHTMLAttributes, KeyboardEvent } from 'react'

type NativeProps = InputHTMLAttributes<HTMLInputElement>
type Stripped = Omit<NativeProps, 'value' | 'onChange' | 'min' | 'max' | 'step' | 'type'>

interface Props extends Stripped {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  step?: number  // for ArrowUp / ArrowDown nudges
}

/**
 * Number input that allows the field to be EMPTY during editing.
 *
 * Why: standard `type="number"` clamps and resets the value as soon as you
 * delete a character — meaning if your value is "1" and you select-all-delete,
 * many naive implementations snap it back to the min (often 1), and you can
 * never type a different number cleanly. This component holds a string draft
 * locally; it only commits (clamping to min/max) on blur or Enter.
 *
 * - While focused: external `value` changes do NOT overwrite your draft.
 * - On blur: empty -> falls back to min (or 0 if no min). Otherwise clamp.
 * - ArrowUp / ArrowDown nudge by `step` and commit immediately.
 */
export function NumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = '',
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [draft, setDraft] = useState<string>(String(value))
  const [focused, setFocused] = useState(false)

  // Sync external changes only when not actively editing
  useEffect(() => {
    if (!focused) setDraft(String(value))
  }, [value, focused])

  const commit = () => {
    if (draft === '') {
      const fallback = min ?? 0
      onChange(fallback)
      setDraft(String(fallback))
      return
    }
    const n = parseInt(draft, 10)
    if (Number.isNaN(n)) {
      setDraft(String(value))
      return
    }
    let clamped = n
    if (min !== undefined) clamped = Math.max(min, clamped)
    if (max !== undefined) clamped = Math.min(max, clamped)
    onChange(clamped)
    setDraft(String(clamped))
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      ;(e.target as HTMLInputElement).blur()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const base = parseInt(draft || '0', 10) || 0
      const next = max !== undefined ? Math.min(max, base + step) : base + step
      setDraft(String(next))
      onChange(next)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const base = parseInt(draft || '0', 10) || 0
      const next = min !== undefined ? Math.max(min, base - step) : base - step
      setDraft(String(next))
      onChange(next)
    }
  }

  return (
    <input
      {...rest}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^0-9]/g, '')
        setDraft(cleaned)
      }}
      onFocus={(e) => {
        setFocused(true)
        // Select-all on focus so typing replaces immediately
        e.currentTarget.select()
        onFocus?.(e)
      }}
      onBlur={(e) => {
        commit()
        setFocused(false)
        onBlur?.(e)
      }}
      onKeyDown={handleKey}
      className={['tabular', className].join(' ')}
    />
  )
}
