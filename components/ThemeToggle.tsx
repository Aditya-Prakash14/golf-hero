'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch by waiting for mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl glass-light border border-white/5 flex items-center justify-center opacity-50">
        <Sun className="h-5 w-5" />
      </div>
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-10 h-10 rounded-xl glass-light border border-white/5 flex items-center justify-center transition-all hover:scale-110 hover:border-emerald-500/30 group relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-400 transition-transform duration-500 group-hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600 transition-transform duration-500 group-hover:-rotate-12" />
      )}
    </button>
  )
}
