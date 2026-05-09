import { Activity } from 'lucide-react'

export function MetronomePage() {
  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl lg:text-3xl font-bold mb-1">메트로놈</h1>
      <div className="text-sm text-ink-500 dark:text-ink-400 mb-6">정밀 스케줄러 · 폴리리듬 · 점진적 가속</div>

      <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ink-100 dark:bg-ink-800 mb-4">
          <Activity size={28} className="text-ink-400" />
        </div>
        <div className="font-semibold mb-1">Phase 2에서 구현됩니다</div>
        <div className="text-sm text-ink-500 dark:text-ink-400">
          Web Audio API 기반 lookahead 스케줄러, 30–500 BPM, 분할/폴리리듬, 두 가지 가속 모드,<br />
          시각·청각 신호, 곡과의 자동 연동.
        </div>
      </div>
    </div>
  )
}
