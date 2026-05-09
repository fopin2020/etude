import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { TodayPage } from './pages/TodayPage'
import { RepertoirePage } from './pages/RepertoirePage'
import { PieceDetailPage } from './pages/PieceDetailPage'
import { SessionsPage } from './pages/SessionsPage'
import { MetronomePage } from './pages/MetronomePage'
import { StatsPage } from './pages/StatsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TodayPage />} />
        <Route path="/repertoire" element={<RepertoirePage />} />
        <Route path="/repertoire/:id" element={<PieceDetailPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/metronome" element={<MetronomePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
