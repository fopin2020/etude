import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent-600 hover:bg-accent-700 text-white shadow-sm',
  secondary: 'bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-900 dark:text-ink-100',
  ghost: 'hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-200',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-base min-h-[44px]',
  lg: 'px-5 py-3 text-lg min-h-[52px]',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={[
        'rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
