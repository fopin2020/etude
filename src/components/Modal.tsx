import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const widthCls =
    size === 'sm' ? 'max-w-md'
    : size === 'lg' ? 'max-w-3xl'
    : size === 'xl' ? 'max-w-5xl'
    : 'max-w-xl'

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`bg-white dark:bg-ink-900 w-full ${widthCls} md:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200 dark:border-ink-800">
            <h2 className="text-lg font-semibold">{title}</h2>
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
        {footer && <div className="px-6 py-4 border-t border-ink-200 dark:border-ink-800 flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  )
}
