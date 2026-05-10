import { NavLink } from 'react-router-dom'
import { Home, Library, History, Activity, BarChart3, Settings } from 'lucide-react'
import type { ComponentType } from 'react'

interface Item {
  to: string
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
}

const items: Item[] = [
  { to: '/', label: '오늘', icon: Home },
  { to: '/repertoire', label: '레퍼토리', icon: Library },
  { to: '/sessions', label: '연습 기록', icon: History },
  { to: '/metronome', label: '메트로놈', icon: Activity },
  { to: '/stats', label: '통계', icon: BarChart3 },
  { to: '/settings', label: '설정', icon: Settings },
]

export function TopNav() {
  return (
    <header className="shrink-0 sticky top-0 z-20 border-b border-ink-200 dark:border-ink-800 bg-ink-50/85 dark:bg-ink-950/85 backdrop-blur-md">
      <div className="flex items-center px-4 lg:px-8 h-16 gap-4 lg:gap-8">
        {/* Brand */}
        <div className="flex items-baseline gap-2.5 shrink-0">
          <div className="font-serif text-2xl lg:text-[28px] font-bold text-accent-600 dark:text-accent-300 leading-none tracking-tight">
            Étude
          </div>
          <div className="hidden md:block text-[11px] uppercase tracking-widest text-ink-400 dark:text-ink-500">
            Piano Practice
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex-1 flex gap-1 overflow-x-auto scrollbar-none -my-px" role="tablist">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'group relative flex items-center gap-2 px-3 lg:px-4 h-16 whitespace-nowrap text-sm font-medium transition-colors',
                  isActive
                    ? 'text-accent-700 dark:text-accent-300'
                    : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
                  <span>{label}</span>
                  <span
                    className={[
                      'absolute left-3 right-3 -bottom-px h-[2px] rounded-full transition-all',
                      isActive ? 'bg-accent-500 dark:bg-accent-400' : 'bg-transparent group-hover:bg-ink-300 dark:group-hover:bg-ink-700',
                    ].join(' ')}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block text-[11px] tabular text-ink-400 dark:text-ink-500 shrink-0">
          v0.1
        </div>
      </div>
    </header>
  )
}
