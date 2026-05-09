import { useEffect, useRef, useState } from 'react'
import { Sun, Moon, Monitor, Download, Upload, AlertTriangle } from 'lucide-react'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { useUIStore } from '../store/ui'
import { db, getOrCreateGoals } from '../db/database'
import { downloadExport, importFromFile, type ImportOptions, type ImportResult } from '../lib/exportImport'

export function SettingsPage() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  const [dailyMin, setDailyMin] = useState<number | ''>('')
  const [weeklyMin, setWeeklyMin] = useState<number | ''>('')
  const [monthlyMin, setMonthlyMin] = useState<number | ''>('')
  const [protectionDays, setProtectionDays] = useState<number | ''>('')
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    void getOrCreateGoals().then((g) => {
      setDailyMin(g.dailyMin ?? '')
      setWeeklyMin(g.weeklyMin ?? '')
      setMonthlyMin(g.monthlyMin ?? '')
      setProtectionDays(g.protectionDaysPerWeek ?? '')
    })
  }, [])

  const saveGoals = async () => {
    await db.goals.put({
      id: 'singleton',
      dailyMin: dailyMin === '' ? undefined : Number(dailyMin),
      weeklyMin: weeklyMin === '' ? undefined : Number(weeklyMin),
      monthlyMin: monthlyMin === '' ? undefined : Number(monthlyMin),
      protectionDaysPerWeek: protectionDays === '' ? undefined : Number(protectionDays),
      updatedAt: new Date().toISOString(),
    })
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 1500)
  }

  // Import flow
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setPendingFile(f)
    setImportResult(null)
    setImportError(null)
    e.target.value = ''
  }

  const runImport = async (mode: ImportOptions['mode']) => {
    if (!pendingFile) return
    try {
      const result = await importFromFile(pendingFile, { mode })
      setImportResult(result)
      setImportError(null)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : String(err))
    }
  }

  const inputCls =
    'w-full px-3 py-2.5 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[44px] tabular'

  return (
    <div className="px-6 py-6 lg:px-10 lg:py-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold">설정</h1>

      <Section title="모양">
        <div className="grid grid-cols-3 gap-2">
          <ThemeButton current={theme} value="light" onClick={() => setTheme('light')} icon={<Sun size={18} />} label="라이트" />
          <ThemeButton current={theme} value="dark" onClick={() => setTheme('dark')} icon={<Moon size={18} />} label="다크" />
          <ThemeButton current={theme} value="system" onClick={() => setTheme('system')} icon={<Monitor size={18} />} label="시스템" />
        </div>
      </Section>

      <Section title="목표 시간 (분)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="일일 목표">
            <input type="number" min={0} className={inputCls} value={dailyMin} onChange={(e) => setDailyMin(e.target.value === '' ? '' : Number(e.target.value))} placeholder="예: 60" />
          </Field>
          <Field label="주간 목표">
            <input type="number" min={0} className={inputCls} value={weeklyMin} onChange={(e) => setWeeklyMin(e.target.value === '' ? '' : Number(e.target.value))} placeholder="예: 360" />
          </Field>
          <Field label="월간 목표">
            <input type="number" min={0} className={inputCls} value={monthlyMin} onChange={(e) => setMonthlyMin(e.target.value === '' ? '' : Number(e.target.value))} placeholder="예: 1500" />
          </Field>
          <Field label="주당 보호일 (휴식 가능 일수)">
            <input type="number" min={0} max={7} className={inputCls} value={protectionDays} onChange={(e) => setProtectionDays(e.target.value === '' ? '' : Number(e.target.value))} placeholder="예: 1" />
          </Field>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={saveGoals}>저장</Button>
          {savedFlash && <span className="text-sm text-emerald-600 dark:text-emerald-400">저장되었습니다</span>}
        </div>
      </Section>

      <Section title="데이터">
        <div className="text-sm text-ink-600 dark:text-ink-300 mb-4">
          모든 데이터는 이 기기 안에만 저장됩니다. 정기적으로 JSON으로 내보내 백업해 두세요.
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void downloadExport()}>
            <Download size={18} /> JSON 내보내기
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload size={18} /> JSON 가져오기
          </Button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onPickFile} />
        </div>
      </Section>

      <Modal
        open={!!pendingFile && !importResult && !importError}
        onClose={() => setPendingFile(null)}
        title="가져오기 방식 선택"
      >
        <div className="space-y-4">
          <div className="text-sm text-ink-600 dark:text-ink-300">
            <strong>{pendingFile?.name}</strong>에서 데이터를 가져옵니다.
          </div>
          <div className="space-y-2">
            <RadioCard
              checked={importMode === 'merge'}
              onClick={() => setImportMode('merge')}
              title="병합"
              desc="기존 데이터를 보존하고, 같은 ID는 덮어씁니다 (안전)."
            />
            <RadioCard
              checked={importMode === 'replace'}
              onClick={() => setImportMode('replace')}
              title="전체 교체"
              desc="현재 모든 데이터를 지우고 백업으로 대체합니다."
              danger
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setPendingFile(null)}>취소</Button>
            <Button onClick={() => void runImport(importMode)}>가져오기</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!importResult}
        onClose={() => {
          setImportResult(null)
          setPendingFile(null)
        }}
        title="가져오기 완료"
      >
        {importResult && (
          <ul className="text-sm space-y-1">
            <li>곡: {importResult.pieces}개</li>
            <li>세션: {importResult.sessions}개</li>
            <li>목표: {importResult.goals}개</li>
            <li>메트로놈 프리셋: {importResult.metronomePresets}개</li>
            <li>녹음: {importResult.recordings}개</li>
          </ul>
        )}
      </Modal>

      <Modal open={!!importError} onClose={() => { setImportError(null); setPendingFile(null) }} title="가져오기 실패">
        <div className="flex gap-3 items-start">
          <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
          <div className="text-sm">{importError}</div>
        </div>
      </Modal>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 p-6">
      <h2 className="text-base font-semibold mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-600 dark:text-ink-300 mb-1.5">{label}</span>
      {children}
    </label>
  )
}

function ThemeButton({
  current,
  value,
  onClick,
  icon,
  label,
}: {
  current: string
  value: string
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  const active = current === value
  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-lg border-2 min-h-[80px] transition',
        active
          ? 'border-accent-600 bg-accent-50 dark:bg-accent-950 text-accent-700 dark:text-accent-300'
          : 'border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300',
      ].join(' ')}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

function RadioCard({
  checked,
  onClick,
  title,
  desc,
  danger,
}: {
  checked: boolean
  onClick: () => void
  title: string
  desc: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left px-4 py-3 rounded-lg border-2 transition min-h-[60px]',
        checked
          ? danger
            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950'
            : 'border-accent-600 bg-accent-50 dark:bg-accent-950'
          : 'border-ink-200 dark:border-ink-700',
      ].join(' ')}
    >
      <div className="font-medium">{title}</div>
      <div className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">{desc}</div>
    </button>
  )
}
