'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Charity } from '@/types/database'
import CharityCard from '@/components/charity/CharityCard'
import { Heart, Loader2, Save, Info } from 'lucide-react'

export default function CharityPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null)
  const [percentage, setPercentage] = useState<number>(10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        
        // Load user's current settings
        const { data: profile } = await supabase
          .from('profiles')
          .select('charity_id, charity_percentage')
          .eq('id', user.id)
          .single()
          
        if (profile) {
          setSelectedCharityId(profile.charity_id)
          setPercentage(profile.charity_percentage || 10)
        }
      }

      // Load all charities
      const { data: chars } = await supabase
        .from('charities')
        .select('*')
        .order('is_featured', { ascending: false })
      
      if (chars) {
        setCharities(chars)
      }
      
      setLoading(false)
    }
    
    loadData()
  }, [])

  const handleSave = async () => {
    if (!userId || !selectedCharityId) return
    
    setSaving(true)
    setMessage(null)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          charity_id: selectedCharityId,
          charity_percentage: percentage
        })
        .eq('id', userId)

      if (error) throw error
      
      setMessage({ type: 'success', text: 'Charity preferences updated successfully!' })
      setTimeout(() => setMessage(null), 5000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update preferences.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Loading charities...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-8 animate-fade-in pb-12">
      <div>
         <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center">
            Charity Support <Heart className="w-6 h-6 ml-3 text-rose-500 fill-rose-500/20" />
         </h1>
         <p className="text-slate-500 mt-1">Choose who you want to support with your subscription.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-start border animate-slide-down shadow-lg ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10'
        }`}>
          <Info className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="glass p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden shadow-xl border border-glass">
         <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
         
         <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Your Contribution Level</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">
               A portion of your monthly subscription goes directly to your selected charity. 
               The minimum is 10%, but your impact grows with every percent you choose to share.
            </p>
         </div>
         
         <div className="flex-1 max-w-sm w-full space-y-6">
            <div>
               <div className="flex justify-between items-end mb-3">
                 <label className="text-sm font-bold text-slate-500 uppercase tracking-wider" htmlFor="charity_percentage">
                    Impact Percentage
                 </label>
                 <span className="text-3xl font-black text-emerald-400 tracking-tighter">{percentage}%</span>
               </div>
               <input
                 id="charity_percentage"
                 type="range"
                 min="10"
                 max="100"
                 step="5"
                 value={percentage}
                 onChange={(e) => setPercentage(Number(e.target.value))}
                 className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
               />
            </div>
            
            <button
               onClick={handleSave}
               disabled={saving || !selectedCharityId}
               className="btn-primary w-full py-3.5 flex items-center justify-center shadow-lg shadow-emerald-500/20"
            >
               {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
               Save Configuration
            </button>
         </div>
      </div>

      <div className="space-y-6">
         <h2 className="text-xl font-semibold text-foreground">Available Charities</h2>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((charity) => (
               <CharityCard
                 key={charity.id}
                 charity={charity}
                 isSelected={charity.id === selectedCharityId}
                 percentage={percentage}
                 onSelect={(id) => setSelectedCharityId(id)}
               />
            ))}
         </div>
      </div>
    </div>
  )
}
