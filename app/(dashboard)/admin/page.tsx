import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { Users, Trophy, Heart, Gift, Play } from 'lucide-react'

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
         <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Overview</h1>
         <p className="text-slate-500 mt-1">Platform performance and statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="glass p-5 rounded-2xl relative overflow-hidden group hover:border-glass-hover transition-all">
               <div className="flex justify-between items-start mb-4">
                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                 <Icon className={`w-6 h-6 ${stat.color} group-hover:scale-110 transition-transform`} />
               </div>
               <p className="text-3xl font-bold text-foreground mb-1 tracking-tight">{stat.value}</p>
               <p className="text-xs text-slate-500 font-medium">{stat.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="glass p-8 rounded-3xl mt-8 flex flex-col md:flex-row gap-8 items-center border border-amber-500/20 bg-amber-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10 group-hover:bg-amber-500/20 transition-colors"></div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center">
            <Play className="w-5 h-5 mr-3 text-amber-500" />
            Simulate Next Draw
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Preview the results of the next draw before publishing. Check the prize pool distribution and winner count to ensure everything is correct.
          </p>
        </div>
        <div className="flex-shrink-0">
          <a href="/admin/draws" className="btn-primary py-4 px-8 shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform inline-block">
             Manage Draws
          </a>
        </div>
      </div>
    </div>
  )
}
