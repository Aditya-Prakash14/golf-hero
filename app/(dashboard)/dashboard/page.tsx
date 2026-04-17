import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SubscriptionBadge from '@/components/ui/SubscriptionBadge'
import CharityCard from '@/components/charity/CharityCard'
import DrawResultCard from '@/components/draws/DrawResultCard'
import WinnerProofUpload from '@/components/winners/WinnerProofUpload'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowRight, Trophy, Target, AlertCircle, Heart, Info } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const errorParam = searchParams?.error
  const subscribedParam = searchParams?.subscribed

  // Parallel data fetching for dashboard sections
  const [
    { data: profile },
    { data: scores },
    { data: draws },
    { data: winnings },
    { data: charityContributions }
  ] = await Promise.all([
    // Profile + Charity
    supabase.from('profiles')
      .select('*, charities(*)')
      .eq('id', user.id)
      .single(),
    
    // Scores
    supabase.from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_date', { ascending: false })
      .limit(5),
      
    // Draw Participation
    supabase.from('draw_entries')
      .select('*, draws(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
      
    // Winnings
    supabase.from('winner_verifications')
      .select('*, draw_entries(*, draws(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    // Charity impact
    supabase.from('charity_contributions')
      .select('*')
      .eq('user_id', user.id)
  ])

  // Aggregate stats
  const totalWinnings = winnings?.reduce((acc, curr) => acc + (curr.draw_entries?.prize_amount || 0), 0) || 0
  const totalContributed = charityContributions?.reduce((acc, curr) => acc + curr.amount, 0) || 0

  const MAX_SCORES = 5
  const scoreSlots = Array.from({ length: MAX_SCORES }).map((_, i) => (scores && scores[i]) || null)

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Golfer'}
          </h1>
          <p className="text-slate-400 mt-1">Here's your Golf Heroes summary.</p>
        </div>
        
        {/* Subscription Status Widget */}
        <div className="glass p-4 rounded-xl flex items-center justify-between md:justify-start gap-4 hover:border-slate-600 transition-colors">
          <div>
            <p className="text-xs text-slate-400 mb-1">Subscription Details</p>
            <SubscriptionBadge status={profile?.subscription_status} plan={profile?.subscription_plan} />
          </div>
          {profile?.subscription_status === 'active' ? (
            <a href="/api/stripe/portal" className="text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors">
              Manage
            </a>
          ) : (
            <a href="/api/stripe/checkout?plan=monthly" className="text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-400 px-3 py-1.5 rounded-lg transition-colors">
              Subscribe Now
            </a>
          )}
        </div>
      </div>

      {subscribedParam === 'true' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl">
          🎉 Subscription successful! Thank you for joining Golf Heroes.
        </div>
      )}
      
      {errorParam && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          There was an issue processing your request: {errorParam}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Scores & Impact) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass p-5 rounded-2xl relative overflow-hidden group hover:border-slate-600 transition-all">
              <div className="absolute top-4 right-4 text-slate-500 group-hover:text-amber-400 transition-colors" title="Cumulative winnings from all verified draws">
                <Info className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium text-slate-400 mb-1">Total Winnings</p>
              <p className="text-4xl font-extrabold gradient-text-amber tracking-tight">{formatCurrency(totalWinnings)}</p>
              <div className="mt-3 text-xs text-slate-500 flex items-center">
                <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-500/70" />
                From {winnings?.length || 0} draws
              </div>
            </div>
            <div className="glass p-5 rounded-2xl relative overflow-hidden group hover:border-slate-600 transition-all">
              <div className="absolute top-4 right-4 text-slate-500 group-hover:text-emerald-400 transition-colors" title="Total amount contributed to your chosen charities via your subscription">
                <Info className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium text-slate-400 mb-1">Charity Impact</p>
              <p className="text-4xl font-extrabold text-emerald-400 tracking-tight">{formatCurrency(totalContributed)}</p>
              <div className="mt-3 text-xs text-slate-500 flex items-center">
                <Heart className="w-3.5 h-3.5 mr-1.5 text-emerald-500/70" />
                Automatically donated
              </div>
            </div>
          </div>

          {/* Scores Overview */}
          <div className="glass p-6 rounded-3xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <Target className="w-5 h-5 mr-2 text-emerald-400" />
                Active Score Slots
              </h2>
              <Link href="/scores" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg">
                Manage Scores <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {scoreSlots.map((s, i) => {
                if (s) {
                  return (
                    <div key={s.id} className={`flex-1 min-w-[70px] sm:min-w-[80px] p-4 rounded-2xl text-center border relative overflow-hidden hover:-translate-y-1 transition-transform ${
                      i === 0 ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-background border-slate-200 dark:border-slate-700/50 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}>
                      {i === 0 && <span className="absolute top-0 right-0 left-0 text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 py-1 tracking-wider">Latest</span>}
                      <p className={`text-3xl font-black ${i === 0 ? 'text-foreground mt-4 tracking-tighter' : 'text-foreground/40 tracking-tighter'}`}>{s.score}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">{formatDate(s.played_date)}</p>
                    </div>
                  )
                } else {
                  return (
                    <Link key={`empty-${i}`} href="/scores" className="flex-1 min-w-[70px] sm:min-w-[80px] p-4 rounded-2xl text-center border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex flex-col justify-center items-center group/slot bg-background/50 min-h-[100px]">
                      <span className="text-2xl text-slate-400 group-hover/slot:text-emerald-400 group-hover/slot:scale-110 transition-all">+</span>
                    </Link>
                  )
                }
              })}
            </div>
            
            <div className="text-xs text-slate-500 mt-5 flex items-center justify-center bg-slate-900/50 py-2 rounded-lg border border-slate-800/50">
              <Info className="w-3.5 h-3.5 mr-2 text-slate-400" />
              Scores are rolling. Adding a 6th score automatically removes the oldest entry.
            </div>
          </div>
          
          {/* Action Required: Winnings to Verify */}
          {winnings && winnings.some(w => !w.proof_url || w.status === 'rejected') && (
            <div className="glass p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden animate-pulse-soft">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>
              <h2 className="text-xl font-bold text-foreground mb-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-amber-500 fill-amber-500/20" />
                Action Required: Claim Winnings
              </h2>
              <p className="text-sm text-amber-200/70 mb-6">You have winnings that require proof verification. Upload your scorecard to proceed.</p>
              
              <div className="space-y-4">
                {winnings.filter(w => !w.proof_url || w.status === 'rejected').map(w => (
                  <WinnerProofUpload key={w.id} verification={w as any} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column (Charity & Draws) */}
        <div className="space-y-6">
          
          {/* Charity Spotlight */}
          {profile?.charities && (
            <div className="glass p-6 rounded-3xl relative overflow-hidden group hover:border-slate-600 transition-colors">
               <h2 className="text-foreground font-semibold mb-5 flex items-center justify-between">
                 <span>Supporting Charity</span>
                 <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg text-sm border border-emerald-500/20" title={`${profile.charity_percentage}% of your subscription goes here`}>
                   {profile.charity_percentage}%
                 </span>
               </h2>
               <div className="transform scale-95 origin-top relative z-10 w-[calc(100%+10%)] -ml-[5%] group-hover:scale-[0.98] transition-transform duration-500">
                 <CharityCard charity={profile.charities as any} />
               </div>
               <div className="text-center mt-3 relative z-20 pt-2 border-t border-slate-800">
                 <Link href="/charity" className="text-xs font-medium text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center">
                   Change configuration <ArrowRight className="w-3 h-3 ml-1" />
                 </Link>
               </div>
            </div>
          )}

          {/* Recent Draws */}
          <div className="glass p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-foreground font-semibold flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-slate-400" />
                Recent Draws
              </h2>
              <Link href="/draws" className="text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-md transition-colors">View All</Link>
            </div>
            
            {!draws || draws.length === 0 ? (
              <div className="bg-slate-900/50 rounded-xl p-6 text-center border border-slate-800 border-dashed">
                <Trophy className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No draws played yet.</p>
                <p className="text-xs text-slate-500 mt-1 pb-2">Log scores to enter future draws automatically.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {draws.map(entry => (
                  <Link href={`/draws`} key={entry.id} className="bg-background/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 block hover:border-emerald-500/50 hover:bg-glass-light transition-all group shadow-sm">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-foreground group-hover:text-emerald-400 transition-colors">{formatDate(entry.draws?.draw_month)} Draw</p>
                      <span className="text-xs font-medium bg-slate-800 px-2 py-1 rounded text-slate-300">{entry.match_count}/5 matches</span>
                    </div>
                    {entry.prize_amount > 0 ? (
                      <div className="mt-3 text-sm text-amber-400 font-bold flex items-center bg-amber-500/10 py-1.5 px-3 rounded-lg w-fit border border-amber-500/20">
                        <Trophy className="w-3 h-3 mr-1.5" />
                        Won {formatCurrency(entry.prize_amount)}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">No win this time</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
