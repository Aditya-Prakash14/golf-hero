'use client'

import { useState, useEffect } from 'react'
import { Score } from '@/types/database'
import { Loader2 } from 'lucide-react'

interface ScoreFormProps {
  initialData?: Score | null
  onSubmit: (data: { score: number; played_date: string }) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function ScoreForm({ initialData, onSubmit, onCancel, loading = false }: ScoreFormProps) {
  const [score, setScore] = useState<number | ''>('')
  const [playedDate, setPlayedDate] = useState('')

  useEffect(() => {
    if (initialData) {
      setScore(initialData.score)
      setPlayedDate(initialData.played_date)
    } else {
      setScore('')
      // Set to today's date in YYYY-MM-DD
      setPlayedDate(new Date().toISOString().split('T')[0])
    }
  }, [initialData])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (typeof score !== 'number' || score < 1 || score > 45) {
      alert('Score must be a number between 1 and 45')
      return
    }
    onSubmit({ score, played_date: playedDate })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="score">
          Stableford Score (1 - 45)
        </label>
        <input
          id="score"
          type="number"
          min="1"
          max="45"
          value={score}
          onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
          className="input-field text-lg font-semibold"
          placeholder="e.g. 36"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="date">
          Date Played
        </label>
        <input
          id="date"
          type="date"
          value={playedDate}
          max={new Date().toISOString().split('T')[0]} // Cannot be in the future
          onChange={(e) => setPlayedDate(e.target.value)}
          className="input-field [color-scheme:dark]" // Forces date picker to match dark mode in some browsers
          required
          disabled={!!initialData} // Usually date cannot be edited, only score
        />
        {initialData && (
          <p className="text-xs text-slate-500 mt-1">Date cannot be changed once entered. Delete and recreate if needed.</p>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || score === '' || !playedDate}
          className="btn-primary flex-1 flex justify-center items-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {initialData ? 'Update Score' : 'Save Score'}
        </button>
      </div>
    </form>
  )
}
