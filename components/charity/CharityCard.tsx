import { Charity } from '@/types/database'
import { ExternalLink, Heart } from 'lucide-react'

interface CharityCardProps {
  charity: Charity
  isSelected?: boolean
  percentage?: number
  onSelect?: (id: string, percentage: number) => void
}

export default function CharityCard({ charity, isSelected, percentage = 10, onSelect }: CharityCardProps) {
  return (
    <div className={`glass rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full
      ${isSelected ? 'ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] transform -translate-y-1' : 'hover:border-slate-600'}
    `}>
      {charity.image_url ? (
        <div className="h-40 w-full overflow-hidden bg-slate-800 relative">
          <img 
            src={charity.image_url} 
            alt={charity.name} 
            className="w-full h-full object-cover opacity-80 mix-blend-overlay transition-transform duration-500 hover:scale-105"
          />
          {charity.is_featured && (
            <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
          <Heart className="w-12 h-12 text-slate-700" />
          {charity.is_featured && (
            <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>
      )}
      
      <div className="p-5 flex-1 flex flex-col mt-auto">
        <h3 className="text-lg font-semibold text-white mb-2">{charity.name}</h3>
        <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-3">{charity.description}</p>
        
        {charity.website_url && (
          <a 
            href={charity.website_url} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300 mb-4 transition-colors"
          >
            Visit Website <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        )}

        {onSelect ? (
          isSelected ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
               <p className="text-sm text-emerald-400 font-medium flex items-center justify-center">
                 <Heart className="w-4 h-4 mr-1.5 fill-emerald-400" />
                 Currently Supporting ({percentage}%)
               </p>
            </div>
          ) : (
            <button 
              onClick={() => onSelect(charity.id, percentage)}
              className="w-full btn-secondary py-2 flex items-center justify-center"
            >
              Select Charity
            </button>
          )
        ) : null}
      </div>
    </div>
  )
}
