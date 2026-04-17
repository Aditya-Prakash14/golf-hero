import { createClient } from '@/lib/supabase/server'
import DrawResultCard from '@/components/draws/DrawResultCard'
import PrizePoolBar from '@/components/draws/PrizePoolBar'
import { Trophy, HelpCircle } from 'lucide-react'

export default async function DrawsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch draw entries (participation history)
  const { data: entries } = await supabase
    .from('draw_entries')
    .select('*, draws(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch latest published draw to show current prize pool stats
  const { data: latestDraw } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('draw_month', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Monthly Draws</h1>
        <p className="text-slate-500 mt-1">View your past draw results and winnings.</p>
      </div>

      {latestDraw && (
        <div className="glass p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
          <h2 className="text-lg font-semibold text-foreground mb-6">Latest Draw Prize Pool</h2>
          <PrizePoolBar 
            total={latestDraw.prize_pool_total || 0}
            pool5={latestDraw.pool_5_match || 0}
            pool4={latestDraw.pool_4_match || 0}
            pool3={latestDraw.pool_3_match || 0}
          />
        </div>
      )}

      <div className="flex items-center space-x-2 text-foreground/70 bg-background/50 p-4 rounded-xl border border-glass">
         <HelpCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
         <p className="text-sm">Draws occur on the first of every month. Ensure you have 5 scores logged to participate.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Your Draw History</h2>
        
        {!entries || entries.length === 0 ? (
          <div className="glass p-12 rounded-2xl text-center border-dashed">
            <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No draws yet</h3>
            <p className="text-slate-500">You haven't participated in any draws yet. Ensure your subscription is active and you have scores logged!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entries.map((entry) => (
              <DrawResultCard key={entry.id} entry={entry as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
