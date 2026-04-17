'use client'

import { useState, useEffect } from 'react'
import { Score } from '@/types/database'
import { Loader2, AlertCircle } from 'lucide-react'

interface ScoreFormProps {
  initialData?: Score | null
  onSubmit: (data: { score: number; played_date: string }) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function ScoreForm({ initialData, onSubmit, onCancel, loading = false }: ScoreFormProps) {
  const [score, setScore] = useState<number | ''>('')
  const [playedDate, setPlayedDate] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setScore(initialData.score)
      setPlayedDate(initialData.played_date)
    } else {
      setScore('')
      // Set to today's date in YYYY-MM-DD
      setPlayedDate(new Date().toISOString().split('T')[0])
    }
    setValidationError(null)
  }, [initialData])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError(null)
    
    if (typeof score !== 'number' || score < 1 || score > 45) {
      setValidationError('Score must be a valid number between 1 and 45')
      return
    }
    onSubmit({ score, played_date: playedDate })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {validationError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-center text-sm animate-slide-down">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {validationError}
        </div>
      )}

      <div className="bg-background/50 p-6 rounded-2xl border border-glass shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-500 mb-2" htmlFor="score">
            Stableford Score (1 - 45)
          </label>
          <input
            id="score"
            type="number"
            min="1"
            max="45"
            value={score}
            onChange={(e) => {
              setScore(e.target.value === '' ? '' : Number(e.target.value))
              if (validationError) setValidationError(null)
            }}
            className="input-field text-3xl font-bold py-4 text-center tracking-tight transition-all duration-300 focus:scale-[1.02] focus:shadow-emerald-500/20"
            placeholder="e.g. 36"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-500 mb-2" htmlFor="date">
            Date Played
          </label>
          <input
            id="date"
            type="date"
            value={playedDate}
            max={new Date().toISOString().split('T')[0]} // Cannot be in the future
            onChange={(e) => setPlayedDate(e.target.value)}
            className="input-field py-3 transition-colors dark:[color-scheme:dark]"
            required
            disabled={!!initialData} // Usually date cannot be edited, only score
          />
          {initialData && (
            <p className="text-xs text-amber-500/70 mt-2 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Date cannot be changed once entered. Delete and recreate if needed.
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1 py-3 text-base"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || score === '' || !playedDate}
          className="btn-primary flex-1 flex justify-center items-center py-3 text-base shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          {initialData ? 'Update Score' : 'Save Score'}
        </button>
      </div>
    </form>
  )
}
