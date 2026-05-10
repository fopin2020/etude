import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TodayPage } from './pages/TodayPage'
import { RepertoirePage } from './pages/RepertoirePage'

const PieceDetailPage = lazy(() => import('./pages/PieceDetailPage').then((m) => ({ default: m.PieceDetailPage })))
const SessionsPage = lazy(() => import('./pages/SessionsPage').then((m) => ({ default: m.SessionsPage })))
const MetronomePage = lazy(() => import('./pages/MetronomePage').then((m) => ({ default: m.MetronomePage })))
const StatsPage = lazy(() => import('./pages/StatsPage').then((m) => ({ default: m.StatsPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })))

function PageFallback() {
  return (
    <div className="px-6 py-8 text-sm text-ink-500 dark:text-ink-400">로드 중…</div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TodayPage />} />
        <Route path="/repertoire" element={<RepertoirePage />} />
        <Route
          path="/repertoire/:id"
          element={<Suspense fallback={<PageFallback />}><PieceDetailPage /></Suspense>}
        />
        <Route
          path="/sessions"
          element={<Suspense fallback={<PageFallback />}><SessionsPage /></Suspense>}
        />
        <Route
          path="/metronome"
          element={<Suspense fallback={<PageFallback />}><MetronomePage /></Suspense>}
        />
        <Route
          path="/stats"
          element={<Suspense fallback={<PageFallback />}><StatsPage /></Suspense>}
        />
        <Route
          path="/settings"
          element={<Suspense fallback={<PageFallback />}><SettingsPage /></Suspense>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
