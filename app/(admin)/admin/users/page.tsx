import { createClient } from '@/lib/supabase/server'
import AdminTable from '@/components/admin/AdminTable'
import SubscriptionBadge from '@/components/ui/SubscriptionBadge'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*, charities(name)')
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error loading users: {error.message}</div>
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
      <div>
         <h1 className="text-3xl font-bold text-white tracking-tight">Users Management</h1>
         <p className="text-slate-400 mt-1">View and manage all registered users.</p>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-semibold text-white mb-4">All Users ({users?.length || 0})</h2>
        <AdminTable data={users || []} columns={columns as any} />
      </div>
    </div>
  )
}
