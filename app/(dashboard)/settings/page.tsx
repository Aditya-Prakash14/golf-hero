'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Save, Loader2, Info, Trophy } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null)
  
  const [fullName, setFullName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setProfile(data)
          setFullName(data.full_name || '')
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    
    setSaving(true)
    setMessage(null)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', profile.id)

      if (error) throw error
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
        <p className="font-medium tracking-tight">Syncing your settings...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center">
          Account Settings <User className="w-8 h-8 ml-3 text-emerald-500/20" />
        </h1>
        <p className="text-slate-500 mt-1">Manage your profile and personal information.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-start border animate-slide-down shadow-lg ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10'
        }`}>
          <Info className="w-5 h-5 mr-3 flex-shrink-0" />
          <p className="font-medium text-sm">{message.text}</p>
        </div>
      )}

      <div className="glass p-8 rounded-3xl border border-glass relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
        
        <form onSubmit={handleSave} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 flex items-center" htmlFor="email">
              <Mail className="w-4 h-4 mr-2" /> Email Address
            </label>
            <input
              id="email"
              type="email"
              value={profile?.email || ''}
              disabled
              className="input-field opacity-60 cursor-not-allowed bg-muted/20"
            />
            <p className="text-[10px] text-slate-500 italic font-medium">Your registered email cannot be changed manually.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 flex items-center" htmlFor="fullName">
              <User className="w-4 h-4 mr-2" /> Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="input-field"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-3.5 flex items-center justify-center shadow-lg shadow-emerald-500/20"
            >
              {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              Update Profile Information
            </button>
          </div>
        </form>
      </div>

      <div className="glass p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between shadow-lg shadow-amber-500/5">
         <div className="flex items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mr-4 border border-amber-500/20">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Membership Status</h3>
              <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">{profile?.subscription_status || 'Inactive'} • {profile?.subscription_plan || 'No Active Plan'}</p>
            </div>
         </div>
         <a href="/api/stripe/portal" className="btn-secondary py-2.5 px-6 shadow-sm text-sm font-bold border-glass hover:border-amber-500/50 transition-all">
           Manage Billing
         </a>
      </div>
    </div>
  )
}
