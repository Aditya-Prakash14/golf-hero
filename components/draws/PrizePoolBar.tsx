import { formatCurrency } from '@/lib/utils'

interface PrizePoolBarProps {
  total: number
  pool5: number
  pool4: number
  pool3: number
}

export default function PrizePoolBar({ total, pool5, pool4, pool3 }: PrizePoolBarProps) {
  if (!total) return null

  const p5 = (pool5 / total) * 100
  const p4 = (pool4 / total) * 100
  const p3 = (pool3 / total) * 100

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end mb-2">
        <h3 className="text-sm font-medium text-slate-300">Total Prize Pool Breakdown</h3>
        <p className="text-lg font-bold text-white">{formatCurrency(total)}</p>
      </div>

      <div className="h-4 flex rounded-full overflow-hidden shadow-inner bg-slate-800">
        <div style={{ width: `${p5}%` }} className="bg-gradient-to-r from-amber-400 to-amber-500" title={`5 Match (40%): ${formatCurrency(pool5)}`}></div>
        <div style={{ width: `${p4}%` }} className="bg-gradient-to-r from-emerald-400 to-cyan-500" title={`4 Match (35%): ${formatCurrency(pool4)}`}></div>
        <div style={{ width: `${p3}%` }} className="bg-gradient-to-r from-cyan-500 to-blue-500" title={`3 Match (25%): ${formatCurrency(pool3)}`}></div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="flex items-center text-slate-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></span>
            5 Match (40%)
          </div>
          <p className="font-semibold text-white pl-3.5">{formatCurrency(pool5)}</p>
        </div>
        <div>
          <div className="flex items-center text-slate-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span>
            4 Match (35%)
          </div>
          <p className="font-semibold text-white pl-3.5">{formatCurrency(pool4)}</p>
        </div>
        <div>
          <div className="flex items-center text-slate-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-500 mr-1.5"></span>
            3 Match (25%)
          </div>
          <p className="font-semibold text-white pl-3.5">{formatCurrency(pool3)}</p>
        </div>
      </div>
    </div>
  )
}
