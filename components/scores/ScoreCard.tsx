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
      className="glass rounded-2xl p-6 relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-slate-600/50"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {isLatest && (
        <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-cyan-500 group-hover:h-1.5 transition-all duration-300" />
      )}
      
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center text-slate-400 text-sm font-medium">
          <Calendar className="w-4 h-4 mr-2 text-slate-500" />
          {formatDate(score.played_date)}
        </div>
        <div className="flex space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(score)}
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-all hover:scale-110"
            title="Edit score"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(score.id)}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all hover:scale-110"
            title="Delete score"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center py-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 group-hover:text-slate-400 transition-colors">Stableford</span>
        <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-foreground to-slate-400 group-hover:from-foreground group-hover:to-slate-500 transition-all transform group-hover:scale-105 duration-300">
          {score.score}
        </div>
      </div>
      
      {isLatest && (
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-500" />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  )
}
