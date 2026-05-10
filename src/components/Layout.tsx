import { Outlet } from 'react-router-dom'
import { TopNav } from './SideNav'
import { ActiveSessionBar } from './ActiveSessionBar'
import { WakeLockKeeper } from '../app/WakeLockKeeper'

export function Layout() {
  return (
    <div className="h-full w-full flex flex-col bg-ink-50 dark:bg-ink-950 text-ink-900 dark:text-ink-100">
      <WakeLockKeeper />
      <TopNav />
      <ActiveSessionBar />
      <main className="flex-1 min-h-0 scroll-y">
        <Outlet />
      </main>
    </div>
  )
}
