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
      className="glass rounded-xl p-5 relative overflow-hidden card-hover transform transition-all duration-300"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {isLatest && (
        <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-cyan-500" />
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center text-slate-400 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(score.played_date)}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(score)}
            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
            title="Edit score"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(score.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
            title="Delete score"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-center justify-center py-2">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Stableford</span>
        <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
          {score.score}
        </div>
      </div>
      
      {isLatest && (
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      )}
    </div>
  )
}
