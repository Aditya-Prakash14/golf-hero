import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Users, Trophy, Heart, Gift } from 'lucide-react'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  // 1. Fetch total subscribers stats
  const { count: activeCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active')

  // 2. Fetch total users count
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 3. Score count
  const { count: totalScores } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })

  // 4. Summarize payouts and charity
  const { data: draws } = await supabase.from('draws').select('prize_pool_total')
  const totalPrizePool = draws?.reduce((acc, curr) => acc + (curr.prize_pool_total || 0), 0) || 0

  const { data: contributions } = await supabase.from('charity_contributions').select('amount')
  const totalCharity = contributions?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0

  const stats = [
    { title: 'Active Subscribers', value: activeCount || 0, sub: `of ${totalUsers || 0} total users`, icon: Users, color: 'text-emerald-400' },
    { title: 'Total Prize Pool Generated', value: formatCurrency(totalPrizePool), sub: 'from all published draws', icon: Gift, color: 'text-amber-400' },
    { title: 'Total Charity Contributions', value: formatCurrency(totalCharity), sub: 'waiting to be distributed', icon: Heart, color: 'text-rose-400' },
    { title: 'Total Scores Logged', value: totalScores || 0, sub: 'rolling base entries', icon: Trophy, color: 'text-cyan-400' },
  ]

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
         <h1 className="text-3xl font-bold text-white tracking-tight">Admin Overview</h1>
         <p className="text-slate-400 mt-1">Platform performance and statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="glass p-5 rounded-2xl relative overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                 <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                 <Icon className={`w-5 h-5 ${stat.color}`} />
               </div>
               <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
               <p className="text-xs text-slate-500">{stat.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="glass p-6 rounded-2xl mt-8 flex flex-col md:flex-row gap-6 items-center border border-amber-500/20 bg-amber-500/5">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-2">Simulate Next Draw</h2>
          <p className="text-sm text-slate-300">
            Preview the results of the next draw before publishing. Check the prize pool distribution and winner count.
          </p>
        </div>
        <div>
          <a href="/admin/draws" className="btn-primary inline-block">
             Manage Draws
          </a>
        </div>
      </div>
    </div>
  )
}
