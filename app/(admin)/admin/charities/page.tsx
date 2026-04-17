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
    { header: 'Image', accessor: (c: Charity) => c.image_url ? <img src={c.image_url} alt="" className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-slate-800 rounded"></div> },
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: (c: Charity) => <span className="line-clamp-1 max-w-[300px]">{c.description}</span> },
    { header: 'Featured', accessor: (c: Charity) => c.is_featured ? <span className="text-emerald-400">Yes</span> : 'No' },
    { 
      header: 'Actions', 
      accessor: (c: Charity) => (
        <div className="flex space-x-2">
          {/* Mock edit btn for demonstration */}
          <button className="text-slate-400 hover:text-emerald-400 p-1"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(c.id)} className="text-slate-400 hover:text-rose-400 p-1"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
         <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Charity Management</h1>
           <p className="text-slate-400 mt-1">Add, edit, or remove charities.</p>
         </div>
         <button className="btn-secondary">
           <Plus className="w-4 h-4 mr-2 inline-block" /> Add Charity
         </button>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div>
        ) : (
          <AdminTable data={charities} columns={columns as any} />
        )}
      </div>
    </div>
  )
}
