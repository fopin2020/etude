import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export interface DialItem {
  id: string
  label: string
  hint?: string         // small subtext (e.g. composer years)
}

interface Props {
  items: DialItem[]
  value: string | null
  onChange: (id: string) => void
  label?: string         // shown above the dial
  disabled?: boolean
  emptyHint?: string     // shown when items is empty (e.g. "작곡가를 먼저 선택")
  highlight?: boolean    // visually emphasize this dial as the next-action focus
}

// Tunable layout constants
const ITEM_HEIGHT = 52
const VISIBLE_COUNT = 5  // odd number — center is selected
const PAD = ((VISIBLE_COUNT - 1) / 2) * ITEM_HEIGHT

/**
 * Vertical wheel-picker. Scroll, click, or arrow keys to choose.
 *
 * Behavior:
 * - Center row is the selected item.
 * - Items above/below fade and shrink slightly.
 * - Touching/scrolling moves the wheel; release snaps to nearest item.
 * - Tapping any visible item snaps it to center (and selects it).
 * - When focused, ↑/↓ keys move by one item.
 */
export function Dial({ items, value, onChange, label, disabled, emptyHint, highlight }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const programmaticScroll = useRef(false)
  const scrollTimer = useRef<number | null>(null)
  const [centerIdx, setCenterIdx] = useState(0)

  // Sync center index from external value
  useEffect(() => {
    if (!items.length || !scrollerRef.current) return
    const idx = Math.max(0, items.findIndex((it) => it.id === value))
    if (idx !== centerIdx) setCenterIdx(idx)
    programmaticScroll.current = true
    scrollerRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' })
    const t = window.setTimeout(() => { programmaticScroll.current = false }, 350)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, items])

  const handleScroll = useCallback(() => {
    if (!scrollerRef.current || !items.length) return
    const top = scrollerRef.current.scrollTop
    const idx = Math.max(0, Math.min(items.length - 1, Math.round(top / ITEM_HEIGHT)))
    setCenterIdx(idx)

    if (programmaticScroll.current) return

    // Debounce scroll-end then commit selection
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current)
    scrollTimer.current = window.setTimeout(() => {
      const finalTop = scrollerRef.current!.scrollTop
      const finalIdx = Math.max(0, Math.min(items.length - 1, Math.round(finalTop / ITEM_HEIGHT)))
      const target = items[finalIdx]
      if (target && target.id !== value) onChange(target.id)
    }, 120)
  }, [items, onChange, value])

  const goTo = (idx: number) => {
    if (!scrollerRef.current || !items[idx]) return
    programmaticScroll.current = true
    scrollerRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' })
    onChange(items[idx].id)
    setCenterIdx(idx)
    setTimeout(() => { programmaticScroll.current = false }, 350)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || !items.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      goTo(Math.min(items.length - 1, centerIdx + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      goTo(Math.max(0, centerIdx - 1))
    } else if (e.key === 'Home') {
      e.preventDefault(); goTo(0)
    } else if (e.key === 'End') {
      e.preventDefault(); goTo(items.length - 1)
    }
  }

  const empty = !items.length

  return (
    <div className="flex flex-col">
      {label && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className={[
            'text-xs uppercase tracking-widest font-semibold',
            highlight ? 'text-accent-700 dark:text-accent-300' : 'text-ink-500 dark:text-ink-400',
          ].join(' ')}>
            {label}
          </div>
          {highlight && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" aria-hidden />
          )}
        </div>
      )}

      <div
        className={[
          'relative rounded-xl overflow-hidden border bg-white dark:bg-ink-900 transition-all',
          highlight
            ? 'border-accent-300 dark:border-accent-700 shadow-[0_0_0_4px_rgba(212,165,116,0.15)]'
            : 'border-ink-200 dark:border-ink-800',
          disabled || empty ? 'opacity-50 pointer-events-none' : '',
        ].join(' ')}
        style={{ height: ITEM_HEIGHT * VISIBLE_COUNT }}
        onKeyDown={onKeyDown}
        tabIndex={disabled || empty ? -1 : 0}
        role="listbox"
        aria-label={label}
      >
        {/* Center selection band */}
        <div
          className="pointer-events-none absolute left-2 right-2 border-y border-accent-300 dark:border-accent-700 bg-accent-50/60 dark:bg-accent-950/40"
          style={{ top: PAD, height: ITEM_HEIGHT, borderRadius: 8 }}
          aria-hidden
        />

        {/* Up / down chevrons */}
        {!empty && (
          <>
            <button
              type="button"
              onClick={() => goTo(Math.max(0, centerIdx - 1))}
              disabled={centerIdx === 0}
              className="absolute right-1 top-1 z-10 w-7 h-7 rounded-md flex items-center justify-center text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100 disabled:opacity-30"
              aria-label="이전"
              tabIndex={-1}
            >
              <ChevronUp size={18} />
            </button>
            <button
              type="button"
              onClick={() => goTo(Math.min(items.length - 1, centerIdx + 1))}
              disabled={centerIdx === items.length - 1}
              className="absolute right-1 bottom-1 z-10 w-7 h-7 rounded-md flex items-center justify-center text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100 disabled:opacity-30"
              aria-label="다음"
              tabIndex={-1}
            >
              <ChevronDown size={18} />
            </button>
          </>
        )}

        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll scrollbar-none scroll-smooth"
          style={{
            scrollSnapType: 'y mandatory',
            paddingTop: PAD,
            paddingBottom: PAD,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {empty ? (
            <div className="flex items-center justify-center h-full text-sm text-ink-400 dark:text-ink-500">
              {emptyHint ?? '항목 없음'}
            </div>
          ) : (
            items.map((it, i) => {
              const dist = Math.abs(i - centerIdx)
              const isCenter = dist === 0
              const opacity = isCenter ? 1 : dist === 1 ? 0.55 : 0.25
              const scale = isCenter ? 1 : dist === 1 ? 0.95 : 0.88
              return (
                <div
                  key={it.id}
                  onClick={() => goTo(i)}
                  className={[
                    'flex items-center justify-center text-center cursor-pointer select-none',
                    isCenter
                      ? 'text-accent-800 dark:text-accent-200 font-semibold'
                      : 'text-ink-700 dark:text-ink-300',
                  ].join(' ')}
                  style={{
                    height: ITEM_HEIGHT,
                    scrollSnapAlign: 'center',
                    opacity,
                    transform: `scale(${scale})`,
                    transition: 'opacity 0.18s, transform 0.18s',
                  }}
                  role="option"
                  aria-selected={isCenter}
                >
                  <div className="px-3">
                    <div className="leading-tight">{it.label}</div>
                    {it.hint && (
                      <div className="text-[10px] text-ink-400 dark:text-ink-500 leading-tight mt-0.5">
                        {it.hint}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Top + bottom fade overlays */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white dark:from-ink-900 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white dark:from-ink-900 to-transparent" aria-hidden />
      </div>

      {!empty && (
        <div className="text-[10px] text-ink-400 dark:text-ink-500 text-center mt-1.5">
          {centerIdx + 1} / {items.length}
        </div>
      )}
    </div>
  )
}
