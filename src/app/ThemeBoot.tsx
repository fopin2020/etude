import { useEffect } from 'react'
import { useUIStore } from '../store/ui'

export function ThemeBoot() {
  const theme = useUIStore((s) => s.theme)
  const setResolvedDark = useUIStore((s) => s.setResolvedDark)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mql.matches)
      document.documentElement.classList.toggle('dark', isDark)
      setResolvedDark(isDark)
    }
    apply()
    if (theme === 'system') {
      mql.addEventListener('change', apply)
      return () => mql.removeEventListener('change', apply)
    }
  }, [theme, setResolvedDark])

  return null
}
