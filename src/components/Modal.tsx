import { type ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, children, footer, size = 'md' }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActive = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousActive.current = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    if (dialog) {
      const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE)
      const first = focusables[0]
      if (first) first.focus()
      else dialog.focus()
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'Tab' && dialog) {
        const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null,
        )
        if (focusables.length === 0) return
        const first = focusables[0]!
        const last = focusables[focusables.length - 1]!
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previousActive.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  const widthCls = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl'

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={`bg-white dark:bg-ink-900 w-full ${widthCls} md:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col outline-none`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 dark:border-ink-800">
            <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md hover:bg-ink-100 dark:hover:bg-ink-800"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-ink-200 dark:border-ink-800 flex gap-3 justify-end flex-wrap">{footer}</div>}
      </div>
    </div>
  )
}
