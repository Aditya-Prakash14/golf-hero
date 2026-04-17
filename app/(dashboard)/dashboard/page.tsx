import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SubscriptionBadge from '@/components/ui/SubscriptionBadge'
import CharityCard from '@/components/charity/CharityCard'
import DrawResultCard from '@/components/draws/DrawResultCard'
import WinnerProofUpload from '@/components/winners/WinnerProofUpload'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowRight, Trophy, Target, AlertCircle, Heart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Await the searchParams mapping before destructuring if necessary in Next.js 15,
  // but in Next.js 14 searchParams is a sync prop during server rendering.
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

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Golfer'}
          </h1>
          <p className="text-slate-400 mt-1">Here's your Golf Heroes summary.</p>
        </div>
        
        {/* Subscription Status Widget */}
        <div className="glass p-4 rounded-xl flex items-center justify-between md:justify-start gap-4">
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
            <div className="glass p-5 rounded-xl">
              <p className="text-sm font-medium text-slate-400 mb-1">Total Winnings</p>
              <p className="text-3xl font-bold gradient-text-amber">{formatCurrency(totalWinnings)}</p>
              <div className="mt-2 text-xs text-slate-500 flex items-center">
                <Trophy className="w-3 h-3 mr-1" />
                From {winnings?.length || 0} draws
              </div>
            </div>
            <div className="glass p-5 rounded-xl">
              <p className="text-sm font-medium text-slate-400 mb-1">Charity Impact</p>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(totalContributed)}</p>
              <div className="mt-2 text-xs text-slate-500 flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                Total contributed
              </div>
            </div>
          </div>

          {/* Scores Overview */}
          <div className="glass p-6 rounded-2xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-emerald-400" />
                Active Scores
              </h2>
              <Link href="/scores" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center transition-colors">
                Manage <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {!scores || scores.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-4">No scores entered yet.</p>
                <Link href="/scores" className="btn-primary inline-block">Add Your First Score</Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {scores.map((s, i) => (
                  <div key={s.id} className={`flex-1 min-w-[80px] p-4 rounded-xl text-center border relative overflow-hidden ${
                    i === 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700/50'
                  }`}>
                    {i === 0 && <span className="absolute top-0 right-0 left-0 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 py-0.5">Latest</span>}
                    <p className={`text-3xl font-bold ${i === 0 ? 'text-white mt-3' : 'text-slate-300'}`}>{s.score}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{formatDate(s.played_date)}</p>
                  </div>
                ))}
                
                {scores.length < 5 && (
                  <Link href="/scores" className="flex-1 min-w-[80px] p-4 rounded-xl text-center border border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors flex flex-col justify-center items-center">
                    <span className="text-2xl text-slate-500">+</span>
                    <span className="text-xs text-slate-500 mt-1">{5 - scores.length} left</span>
                  </Link>
                )}
              </div>
            )}
            <div className="text-xs text-slate-500 mt-4 text-center">
              Scores are rolling. Adding a 6th score automatically removes the oldest entry.
            </div>
          </div>
          
          {/* Action Required: Winnings to Verify */}
          {winnings && winnings.some(w => !w.proof_url || w.status === 'rejected') && (
            <div className="glass p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                Action Required: Claim Winnings
              </h2>
              <p className="text-sm text-amber-100/70 mb-4">You have winnings that require proof verification.</p>
              
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
            <div className="glass p-6 rounded-2xl relative overflow-hidden">
               <h2 className="text-white font-medium mb-4 flex items-center justify-between">
                 <span>Supporting Charity</span>
                 <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-sm">{profile.charity_percentage}%</span>
               </h2>
               <div className="transform scale-95 origin-top relative z-10 w-[calc(100%+10%)] -ml-[5%]">
                 <CharityCard charity={profile.charities as any} />
               </div>
               <div className="text-center mt-2 relative z-20">
                 <Link href="/charity" className="text-xs text-slate-400 hover:text-white transition-colors">
                   Change configuration
                 </Link>
               </div>
            </div>
          )}

          {/* Recent Draws */}
          <div className="glass p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-medium">Recent Draws</h2>
              <Link href="/draws" className="text-xs text-emerald-400 hover:text-emerald-300">View All</Link>
            </div>
            
            {!draws || draws.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No recent draws.</p>
            ) : (
              <div className="space-y-4">
                {draws.map(entry => (
                  <div key={entry.id} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 block hover:border-slate-600 transition-colors">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-white text-md">{formatDate(entry.draws?.draw_month)} Draw</p>
                      <span className="text-xs text-slate-400">{entry.match_count}/5 matches</span>
                    </div>
                    {entry.prize_amount > 0 && (
                      <p className="text-sm text-amber-400 font-bold mt-1">Won {formatCurrency(entry.prize_amount)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
