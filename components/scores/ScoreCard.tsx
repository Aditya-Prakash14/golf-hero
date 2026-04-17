import { Score } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { Calendar, Trash2, Edit2 } from 'lucide-react'

interface ScoreCardProps {
  score: Score
  onEdit: (score: Score) => void
  onDelete: (id: string) => void
  isLatest: boolean
  index: number
}

export default function ScoreCard({ score, onEdit, onDelete, isLatest, index }: ScoreCardProps) {
  return (
    <div 
      className="glass rounded-3xl p-8 relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border border-glass"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {isLatest && (
        <div className="absolute top-0 right-0 h-1.5 w-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
      )}
      
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-widest">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(score.played_date)}
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
          <button 
            onClick={() => onEdit(score)}
            className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"
            title="Edit score"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(score.id)}
            className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
            title="Delete score"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center py-6">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Stableford Points</span>
        <div className="text-7xl font-black text-foreground tracking-tighter group-hover:scale-110 transition-transform duration-500">
          {score.score}
        </div>
      </div>
      
      {isLatest && (
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
      )}
    </div>
  )
}
