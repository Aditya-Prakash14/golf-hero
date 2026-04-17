'use client'

import { useState, useEffect } from 'react'
import { Score } from '@/types/database'
import ScoreCard from '@/components/scores/ScoreCard'
import ScoreForm from '@/components/scores/ScoreForm'
import { PlusCircle, Info, RefreshCw, Loader2, Target } from 'lucide-react'

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // UI State
  const [showForm, setShowForm] = useState(false)
  const [editingScore, setEditingScore] = useState<Score | null>(null)

  const fetchScores = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/scores')
      if (!res.ok) throw new Error('Failed to fetch scores')
      const data = await res.json()
      setScores(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScores()
  }, [])

  const handleCreateOrUpdate = async (data: { score: number; played_date: string }) => {
    setSubmitting(true)
    setError(null)
    
    try {
      const isEditing = !!editingScore
      const url = '/api/scores'
      const method = isEditing ? 'PATCH' : 'POST'
      const body = isEditing 
        ? { id: editingScore.id, score: data.score }
        : data

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to save score')
      }

      await fetchScores()
      setShowForm(false)
      setEditingScore(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this score?')) return
    
    setLoading(true) // Use loading state to show UI updates
    try {
      const res = await fetch('/api/scores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to delete score')
      }
      
      setScores(scores.filter(s => s.id !== id))
    } catch (err: any) {
      setError(err.message)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Scores</h1>
          <p className="text-slate-400 mt-1">Manage your active 5 rolling scores for the draw.</p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center shadow-lg shadow-emerald-500/20"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Score
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-start">
          <Info className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Form Modal / Area */}
      {(showForm || editingScore) && (
        <div className="glass-light p-6 rounded-2xl border border-slate-700 animate-slide-down">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editingScore ? 'Edit Score' : 'Enter New Score'}
          </h2>
          <ScoreForm
            initialData={editingScore}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => {
              setShowForm(false)
              setEditingScore(null)
              setError(null)
            }}
            loading={submitting}
          />
        </div>
      )}

      {/* Info Banner */}
      <div className="glass p-4 rounded-xl flex items-start sm:items-center border border-emerald-500/20 bg-emerald-500/5">
        <RefreshCw className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0 sm:mt-0 mt-1" />
        <p className="text-sm text-slate-300">
          We maintain your <strong className="text-emerald-400 font-semibold">latest 5 scores</strong> for the monthly draw. 
          When you enter a 6th score, your oldest score will be automatically replaced.
        </p>
      </div>

      {/* Scores Grid */}
      {loading && !submitting ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Loading your scores...</p>
        </div>
      ) : scores.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center border-dashed">
          <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No scores logged yet</h3>
          <p className="text-slate-400 mb-6">Enter your first golf score to participate in the upcoming draw.</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Your First Score
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {scores.map((score, index) => (
            <ScoreCard
              key={score.id}
              score={score}
              isLatest={index === 0}
              index={index}
              onEdit={(s) => setEditingScore(s)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
