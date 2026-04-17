export default function SubscriptionBadge({ 
  status, 
  plan 
}: { 
  status: string | null | undefined
  plan: string | null | undefined
}) {
  if (!status || status === 'none') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
        No Active Plan
      </span>
    )
  }

  if (status === 'active') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
        <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-400 rounded-full animate-pulse-soft"></span>
        Active {plan ? `(${plan.charAt(0).toUpperCase() + plan.slice(1)})` : ''}
      </span>
    )
  }

  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
        Cancelled (Pending expiry)
      </span>
    )
  }

  if (status === 'lapsed') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        Payment Lapsed
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
      {status}
    </span>
  )
}
