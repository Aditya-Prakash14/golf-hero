import { DrawEntry } from '@/types/database'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Trophy, Calendar } from 'lucide-react'

export default function DrawResultCard({ entry }: { entry: DrawEntry }) {
  const draw = entry.draws
  if (!draw) return null
  
  const isWinner = entry.prize_amount > 0

  return (
    <div className={`glass relative rounded-xl p-6 overflow-hidden ${isWinner ? 'border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''}`}>
      {isWinner && (
        <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-amber-400 to-rose-500" />
      )}
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            {formatDate(draw.draw_month)} Draw
          </h3>
          <p className="text-sm text-slate-500 mt-1 capitalize">Status: {draw.status}</p>
        </div>
        {isWinner && (
          <div className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20 flex items-center shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Trophy className="w-3 h-3 mr-1.5" />
            WINNER
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm text-slate-400 mb-2 font-medium">Your Numbers</p>
          <div className="flex gap-2 flex-wrap">
            {entry.numbers.map((num, i) => {
              const isMatch = draw.winning_numbers?.includes(num)
              return (
                <div 
                  key={i} 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md
                    ${isMatch 
                      ? 'bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 ring-2 ring-emerald-400/50' 
                      : 'bg-background text-foreground/60 border border-slate-200 dark:border-slate-700 shadow-sm'
                    } shadow-md`}>
                  {num}
                </div>
              )
            })}
          </div>
        </div>

        {draw.status === 'published' && draw.winning_numbers && (
          <div>
            <p className="text-sm text-slate-400 mb-2 font-medium">Winning Numbers</p>
            <div className="flex gap-2 flex-wrap">
              {draw.winning_numbers.map((num, i) => (
                <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-background text-slate-400 border border-glass">
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-slate-800 flex justify-between items-end">
        <div>
          <p className="text-sm text-slate-500 mb-0.5">Matches</p>
          <p className="text-xl font-bold text-foreground">{entry.match_count} / 5</p>
        </div>
        
        {isWinner && (
          <div className="text-right">
            <p className="text-sm text-amber-500/80 font-medium mb-0.5 shadow-amber-500/20">Prize Won</p>
            <p className="text-2xl font-bold gradient-text-amber drop-shadow-md">
              {formatCurrency(entry.prize_amount)}
            </p>
          </div>
        )}
      </div>
      
      {isWinner && (
         <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
      )}
    </div>
  )
}
