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

export function SideNav() {
  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-64 shrink-0 border-r border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900">
      <div className="px-5 py-6">
        <div className="font-serif text-3xl font-bold text-accent-600 dark:text-accent-400 leading-none">Étude</div>
        <div className="mt-1 text-xs text-ink-500 dark:text-ink-400">피아노 연습 기록</div>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-3 rounded-lg text-base transition',
                'min-h-[44px]',
                isActive
                  ? 'bg-accent-600 text-white shadow-sm'
                  : 'text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800',
              ].join(' ')
            }
          >
            <Icon size={20} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 text-[11px] text-ink-400 dark:text-ink-500 border-t border-ink-200 dark:border-ink-800">
        v0.1 · Phase 1
      </div>
    </aside>
  )
}

export function MobileTopBar() {
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900">
      <div className="font-serif text-xl font-bold text-accent-600 dark:text-accent-400">Étude</div>
      <nav className="flex gap-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={label}
            className={({ isActive }) =>
              [
                'p-2 rounded-md min-w-[44px] min-h-[44px] flex items-center justify-center',
                isActive ? 'bg-accent-600 text-white' : 'text-ink-600 dark:text-ink-300',
              ].join(' ')
            }
          >
            <Icon size={20} />
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
