'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTable from '@/components/admin/AdminTable'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Loader2, ExternalLink, Check, X } from 'lucide-react'

export default function AdminWinnersPage() {
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase
      .from('winner_verifications')
      .select('*, draw_entries(*, draws(*)), profiles(full_name, email)')
      .order('created_at', { ascending: false })
      
    if (data) setVerifications(data)
    setLoading(false)
  }

  async function handleAction(id: string, action: 'approve' | 'reject') {
    const notes = action === 'reject' ? window.prompt('Reason for rejection:') : null
    if (action === 'reject' && !notes) return
    
    setLoading(true)
    const updatePayload: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewed_at: new Date().toISOString()
    }
    
    if (action === 'reject') updatePayload.admin_notes = notes
    else updatePayload.payout_status = 'paid' // mock payout logic for approval
    
    await supabase.from('winner_verifications').update(updatePayload).eq('id', id)
    fetchData()
  }

  const columns = [
    { header: 'User Info', accessor: (v: any) => <div><p className="font-bold text-foreground">{v.profiles?.full_name}</p><p className="text-xs text-slate-500">{v.profiles?.email}</p></div> },
    { header: 'Draw Month', accessor: (v: any) => <span className="font-medium">{v.draw_entries?.draws?.draw_month ? formatDate(v.draw_entries.draws.draw_month) : '-'}</span> },
    { header: 'Match Count', accessor: (v: any) => <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold">{v.draw_entries?.match_count} Matches</span> },
    { header: 'Prize Amount', accessor: (v: any) => <span className="font-bold text-amber-500 text-base">{formatCurrency(v.draw_entries?.prize_amount || 0)}</span> },
    { header: 'Proof', accessor: (v: any) => v.proof_url ? <a href={supabase.storage.from('winner-proofs').getPublicUrl(v.proof_url).data.publicUrl} target="_blank" rel="noreferrer" className="flex items-center text-emerald-400 hover:underline">View <ExternalLink className="w-3 h-3 ml-1" /></a> : <span className="text-slate-500">Not uploaded</span> },
    { header: 'Status', accessor: (v: any) => {
        if (v.status === 'approved') return <span className="text-emerald-400">Approved</span>
        if (v.status === 'rejected') return <span className="text-rose-400">Rejected</span>
        return <span className="text-amber-400">Pending</span>
    }},
    { 
      header: 'Actions', 
      accessor: (v: any) => (v.status === 'pending' && v.proof_url) ? (
        <div className="flex items-center space-x-2">
          <button onClick={() => handleAction(v.id, 'approve')} className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Approve"><Check className="w-4 h-4" /></button>
          <button onClick={() => handleAction(v.id, 'reject')} className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Reject"><X className="w-4 h-4" /></button>
        </div>
      ) : <span className="text-slate-400 font-medium">-</span>
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Winner Verification</h1>
            <p className="text-slate-500 mt-1">Review validation proofs and authorize prize payouts.</p>
         </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-glass shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10"></div>
        <h2 className="text-xl font-bold text-foreground mb-8">Verification Pipeline</h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
            <p className="text-slate-500 font-medium">Syncing verification records...</p>
          </div>
        ) : (
          <AdminTable data={verifications} columns={columns} emptyMessage="No winner records found" />
        )}
      </div>
    </div>
  )
}
