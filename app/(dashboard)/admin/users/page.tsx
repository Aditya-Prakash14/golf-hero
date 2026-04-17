'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminTable from '@/components/admin/AdminTable'
import SubscriptionBadge from '@/components/ui/SubscriptionBadge'
import { formatDate } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*, charities(name)')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
    setLoading(false)
  }

  const columns = [
    { header: 'Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Status', 
      accessor: (user: any) => <SubscriptionBadge status={user.subscription_status} plan={user.subscription_plan} /> 
    },
    { 
      header: 'Charity', 
      accessor: (user: any) => user.charities?.name ? `${user.charities.name} (${user.charity_percentage}%)` : 'None'
    },
    { 
      header: 'Admin', 
      accessor: (user: any) => user.is_admin ? <span className="text-amber-400 font-medium">Yes</span> : <span className="text-slate-500">No</span>
    },
    { 
      header: 'Joined', 
      accessor: (user: any) => formatDate(user.created_at)
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Users Management</h1>
            <p className="text-slate-500 mt-1">View and manage all registered platform users.</p>
         </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-glass shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-xl font-bold text-foreground">Registered Users ({users.length})</h2>
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
              Live Database
           </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
            <p className="font-medium">Syncing users...</p>
          </div>
        ) : (
          <AdminTable data={users} columns={columns as any} />
        )}
      </div>
    </div>
  )
}
