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

  // Create exactly 5 slots for visual tracker
  const MAX_SCORES = 5
  const scoreSlots = Array.from({ length: MAX_SCORES }).map((_, index) => scores[index] || null)

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Your Scores</h1>
          <p className="text-slate-500 mt-1">Manage your active {MAX_SCORES} rolling scores for the draw.</p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Score
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-start animate-fade-in">
          <Info className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Form Modal / Area */}
      {(showForm || editingScore) && (
        <div className="glass-light p-6 rounded-2xl border border-slate-700 animate-slide-down relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
            {editingScore ? (
              <>Edit Score Entry</>
            ) : (
              <>Log New Score</>
            )}
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
      <div className="glass p-5 rounded-2xl flex items-start sm:items-center border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 animate-shimmer" />
        <RefreshCw className="w-6 h-6 text-emerald-400 mr-4 flex-shrink-0 sm:mt-0 mt-1 animate-pulse-soft" />
        <p className="text-sm text-foreground/70 leading-relaxed">
          We maintain your <strong className="text-emerald-500 font-semibold">latest {MAX_SCORES} scores</strong> for the monthly draw. 
          When you enter a 6th score, your oldest score will be automatically replaced. Fill all slots to maximize your chances!
        </p>
      </div>

      {/* Scores Grid */}
      {loading && !submitting ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Loading your score history...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in relative">
          {scoreSlots.map((score, index) => {
            if (score) {
              return (
                <ScoreCard
                  key={score.id}
                  score={score}
                  isLatest={index === 0}
                  index={index}
                  onEdit={(s) => setEditingScore(s)}
                  onDelete={handleDelete}
                />
              )
            } else {
              return (
                <div 
                  key={`empty-${index}`} 
                  className={`glass rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-700/50 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer group`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setShowForm(true)}
                >
                  <div className="w-12 h-12 rounded-full glass-light flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all shadow-sm">
                    <PlusCircle className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground/60 group-hover:text-emerald-500 transition-colors">Empty Slot {index + 1}</h3>
                  <p className="text-xs text-slate-400 mt-2">Click to log score</p>
                </div>
              )
            }
          })}
        </div>
      )}
    </div>
  )
}
