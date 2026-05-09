import { Outlet } from 'react-router-dom'
import { SideNav, MobileTopBar } from './SideNav'
import { ActiveSessionBar } from './ActiveSessionBar'
import { WakeLockKeeper } from '../app/WakeLockKeeper'

export function Layout() {
  return (
    <div className="h-full w-full flex bg-ink-50 dark:bg-ink-950 text-ink-900 dark:text-ink-100">
      <WakeLockKeeper />
      <SideNav />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileTopBar />
        <ActiveSessionBar />
        <main className="flex-1 min-h-0 scroll-y">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
