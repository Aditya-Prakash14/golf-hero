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
        <div className="glass p-8 rounded-3xl relative overflow-hidden shadow-xl border border-glass">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none -z-10" />
          <h2 className="text-xl font-bold text-foreground mb-8">Latest Pool Statistics</h2>
          <PrizePoolBar 
            total={latestDraw.prize_pool_total || 0}
            pool5={latestDraw.pool_5_match || 0}
            pool4={latestDraw.pool_4_match || 0}
            pool3={latestDraw.pool_3_match || 0}
          />
        </div>
      )}

      <div className="flex items-start md:items-center space-x-3 text-foreground/80 bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/20 shadow-sm">
         <HelpCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 md:mt-0" />
         <p className="text-sm font-medium">Draws occur on the first of every month. Your top 5 scores from the month are used for matching.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Your Participation History</h2>
        
        {!entries || entries.length === 0 ? (
          <div className="glass p-16 rounded-3xl text-center border-2 border-dashed border-glass shadow-inner">
            <Trophy className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-foreground mb-2">Ready for your first draw?</h3>
            <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">Ensure you have 5 scores logged before the end of the month to enter automatically!</p>
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
