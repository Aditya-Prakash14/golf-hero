'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTable from '@/components/admin/AdminTable'
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react'
import { Charity } from '@/types/database'

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchCharities()
  }, [])

  async function fetchCharities() {
    setLoading(true)
    const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
    if (data) setCharities(data as Charity[])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This may break user preferences that reference this charity.")) return
    
    const { error } = await supabase.from('charities').delete().eq('id', id)
    if (error) alert(error.message)
    else setCharities(charities.filter(c => c.id !== id))
  }

  const columns = [
    { header: 'Image', accessor: (c: Charity) => c.image_url ? <img src={c.image_url} alt="" className="w-12 h-12 object-cover rounded-xl shadow-sm border border-glass" /> : <div className="w-12 h-12 bg-muted rounded-xl border border-glass flex items-center justify-center text-slate-400">?</div> },
    { header: 'Charity Name', accessor: (c: Charity) => <span className="font-bold text-foreground">{c.name}</span> },
    { header: 'Description', accessor: (c: Charity) => <p className="text-xs text-slate-500 line-clamp-2 max-w-[250px] leading-relaxed">{c.description}</p> },
    { header: 'Status', accessor: (c: Charity) => c.is_featured ? <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Featured</span> : <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Standard</span> },
    { 
      header: 'Actions', 
      accessor: (c: Charity) => (
        <div className="flex items-center space-x-2">
          <button className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 transition-all" title="Edit"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(c.id)} className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Charity Management</h1>
            <p className="text-slate-500 mt-1">Manage partner organizations and featured spotlights.</p>
         </div>
         <button className="btn-primary py-3 px-6 shadow-lg shadow-emerald-500/20 flex items-center">
           <Plus className="w-4 h-4 mr-2" /> Register New Charity
         </button>
      </div>

      <div className="glass p-8 rounded-3xl border border-glass shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -z-10"></div>
        <h2 className="text-xl font-bold text-foreground mb-8">Partner Directory</h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500 mb-4" />
            <p className="text-slate-500 font-medium">Loading partner database...</p>
          </div>
        ) : (
          <AdminTable data={charities} columns={columns as any} />
        )}
      </div>
    </div>
  )
}
