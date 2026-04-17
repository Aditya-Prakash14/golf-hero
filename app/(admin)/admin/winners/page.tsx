'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTable from '@/components/admin/AdminTable'
import { formatCurrency } from '@/lib/utils'
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
    { header: 'User', accessor: (v: any) => <div><p className="font-semibold text-white">{v.profiles?.full_name}</p><p className="text-xs text-slate-500">{v.profiles?.email}</p></div> },
    { header: 'Draw', accessor: (v: any) => v.draw_entries?.draws?.draw_month || '-' },
    { header: 'Match', accessor: (v: any) => `${v.draw_entries?.match_count} (${v.draw_entries?.prize_tier})` },
    { header: 'Prize', accessor: (v: any) => <span className="font-bold text-amber-400">{formatCurrency(v.draw_entries?.prize_amount || 0)}</span> },
    { header: 'Proof', accessor: (v: any) => v.proof_url ? <a href={supabase.storage.from('winner-proofs').getPublicUrl(v.proof_url).data.publicUrl} target="_blank" rel="noreferrer" className="flex items-center text-emerald-400 hover:underline">View <ExternalLink className="w-3 h-3 ml-1" /></a> : <span className="text-slate-500">Not uploaded</span> },
    { header: 'Status', accessor: (v: any) => {
        if (v.status === 'approved') return <span className="text-emerald-400">Approved</span>
        if (v.status === 'rejected') return <span className="text-rose-400">Rejected</span>
        return <span className="text-amber-400">Pending</span>
    }},
    { 
      header: 'Actions', 
      accessor: (v: any) => (v.status === 'pending' && v.proof_url) ? (
        <div className="flex space-x-2 border border-slate-700 bg-slate-800 rounded p-1">
          <button onClick={() => handleAction(v.id, 'approve')} className="text-emerald-400 hover:bg-slate-700 p-1 rounded" title="Approve"><Check className="w-4 h-4" /></button>
          <button onClick={() => handleAction(v.id, 'reject')} className="text-rose-400 hover:bg-slate-700 p-1 rounded" title="Reject"><X className="w-4 h-4" /></button>
        </div>
      ) : <span className="text-slate-500">-</span>
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
         <h1 className="text-3xl font-bold text-white tracking-tight">Winner Verification</h1>
         <p className="text-slate-400 mt-1">Review proofs and manage payouts.</p>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
        ) : (
          <AdminTable data={verifications} columns={columns} emptyMessage="No winner records found" />
        )}
      </div>
    </div>
  )
}
