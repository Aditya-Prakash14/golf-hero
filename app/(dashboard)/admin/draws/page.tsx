'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTable from '@/components/admin/AdminTable'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Loader2, Plus, Play, CheckCircle } from 'lucide-react'
import { Draw } from '@/types/database'

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [runningAction, setRunningAction] = useState<string | null>(null)
  
  // New Draw state
  const [showNewDraw, setShowNewDraw] = useState(false)
  const [newDrawDate, setNewDrawDate] = useState('')
  const [newDrawType, setNewDrawType] = useState<'random' | 'algorithmic'>('random')

  const supabase = createClient()

  useEffect(() => {
    fetchDraws()
  }, [])

  async function fetchDraws() {
    setLoading(true)
    const { data, error } = await supabase
      .from('draws')
      .select('*')
      .order('draw_month', { ascending: false })
    
    if (data) setDraws(data as Draw[])
    setLoading(false)
  }

  async function handleCreateDraw(e: React.FormEvent) {
    e.preventDefault()
    setRunningAction('create')
    
    const { data, error } = await supabase.from('draws').insert({
      draw_month: newDrawDate,
      draw_type: newDrawType,
      status: 'pending' // pending -> simulated -> published
    }).select().single()

    if (error) alert(error.message)
    else {
      setDraws([data as Draw, ...draws])
      setShowNewDraw(false)
    }
    setRunningAction(null)
  }

  async function handleRunDraw(drawId: string, publish: boolean) {
    if (publish && !window.confirm('Are you sure you want to PUBLISH this draw? This will distribute prizes and create verification records. This action cannot be undone.')) {
      return
    }

    setRunningAction(publish ? `publish-${drawId}` : `sim-${drawId}`)
    
    try {
      const res = await fetch('/api/draws/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draw_id: drawId, publish })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      alert(publish ? 'Draw published successfully!' : 'Simulation complete. Check the draw details.')
      fetchDraws()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setRunningAction(null)
    }
  }

  const columns = [
    { header: 'Month', accessor: (d: Draw) => formatDate(d.draw_month) },
    { header: 'Type', accessor: (d: Draw) => <span className="capitalize">{d.draw_type}</span> },
    { 
      header: 'Status', 
      accessor: (d: Draw) => {
        if (d.status === 'published') return <span className="text-emerald-400 rounded-full bg-emerald-500/10 px-2 py-1 text-xs border border-emerald-500/20">Published</span>
        if (d.status === 'simulated') return <span className="text-amber-400 rounded-full bg-amber-500/10 px-2 py-1 text-xs border border-amber-500/20">Simulated</span>
        return <span className="text-slate-400 rounded-full bg-slate-800 px-2 py-1 text-xs border border-slate-700">Pending</span>
      }
    },
    { header: 'Subscribers', accessor: (d: Draw) => d.active_subscriber_count || '-' },
    { header: 'Prize Pool', accessor: (d: Draw) => d.prize_pool_total ? formatCurrency(d.prize_pool_total) : '-' },
    { 
      header: 'Actions', 
      accessor: (d: Draw) => (
        <div className="flex space-x-2">
          {d.status !== 'published' && (
            <>
              <button 
                onClick={() => handleRunDraw(d.id, false)}
                disabled={!!runningAction}
                className="btn-secondary py-1 px-3 text-xs flex items-center"
              >
                {runningAction === `sim-${d.id}` ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                Simulate
              </button>
              <button 
                onClick={() => handleRunDraw(d.id, true)}
                disabled={!!runningAction}
                className="btn-primary py-1 px-3 text-xs flex items-center bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                {runningAction === `publish-${d.id}` ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                Publish
              </button>
            </>
          )}
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
           <h1 className="text-3xl font-bold text-foreground tracking-tight">Draw Management</h1>
           <p className="text-slate-500 mt-1">Configure, simulate, and publish monthly draws.</p>
         </div>
         <button 
           onClick={() => setShowNewDraw(!showNewDraw)}
           className="btn-primary py-3 px-6 shadow-emerald-500/20 shadow-lg flex items-center"
         >
           <Plus className="w-4 h-4 mr-2" /> New Draw Configuration
         </button>
      </div>

      {showNewDraw && (
        <div className="glass p-8 rounded-3xl animate-slide-up border border-emerald-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-3 text-emerald-500" />
            Configure New Monthly Draw
          </h2>
          <form onSubmit={handleCreateDraw} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 flex items-center" htmlFor="month">Draw Month Target</label>
              <input type="date" id="month" value={newDrawDate} onChange={e => setNewDrawDate(e.target.value)} required className="input-field py-2.5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 flex items-center" htmlFor="type">Algorithm Logic</label>
              <select id="type" value={newDrawType} onChange={e => setNewDrawType(e.target.value as any)} className="input-field py-2.5">
                <option value="random">Pure Random Generation</option>
                <option value="algorithmic">Algorithmic (Frequency Weighted)</option>
              </select>
            </div>
            <button type="submit" disabled={runningAction === 'create'} className="btn-primary py-3 shadow-lg shadow-emerald-500/10">
               {runningAction === 'create' ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Draw Configuration'}
            </button>
          </form>
        </div>
      )}

      <div className="glass p-8 rounded-3xl border border-glass shadow-xl">
        <h2 className="text-xl font-bold text-foreground mb-8">Draw History & Status</h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
            <p className="text-slate-500 font-medium">Loading draw data...</p>
          </div>
        ) : (
          <AdminTable data={draws} columns={columns as any} />
        )}
      </div>
    </div>
  )
}
