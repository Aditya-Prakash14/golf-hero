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
         <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
            Charity Support <Heart className="w-6 h-6 ml-3 text-rose-500 fill-rose-500/20" />
         </h1>
         <p className="text-slate-400 mt-1">Choose who you want to support with your subscription.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <Info className="w-5 h-5 mr-3 flex-shrink-0" />
          <p>{message.text}</p>
        </div>
      )}

      <div className="glass p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden gradient-border border-emerald-500/30">
         <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
         <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-2">Your Contribution</h2>
            <p className="text-sm text-slate-300">
               A portion of your monthly subscription goes directly to your selected charity. 
               The minimum is 10%, but you can give more if you wish.
            </p>
         </div>
         
         <div className="flex-1 max-w-sm w-full space-y-4">
            <div>
               <div className="flex justify-between items-end mb-2">
                 <label className="text-sm font-medium text-slate-300" htmlFor="charity_percentage">
                    Contribution Percentage
                 </label>
                 <span className="text-xl font-bold text-emerald-400">{percentage}%</span>
               </div>
               <input
                 id="charity_percentage"
                 type="range"
                 min="10"
                 max="100"
                 step="5"
                 value={percentage}
                 onChange={(e) => setPercentage(Number(e.target.value))}
                 className="w-full accent-emerald-500"
               />
            </div>
            
            <button
               onClick={handleSave}
               disabled={saving || !selectedCharityId}
               className="btn-primary w-full flex items-center justify-center"
            >
               {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
               Save Preferences
            </button>
         </div>
      </div>

      <div className="space-y-6">
         <h2 className="text-xl font-semibold text-white">Available Charities</h2>
         
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
