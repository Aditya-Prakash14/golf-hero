'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Charity } from '@/types/database'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    charity_id: '',
    charity_percentage: 10,
    plan: 'monthly' as 'monthly' | 'yearly',
  })
  
  const [charities, setCharities] = useState<Charity[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingCharities, setFetchingCharities] = useState(true)
  
  const supabase = createClient()

  // Fetch charities on mount
  useEffect(() => {
    async function loadCharities() {
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .order('is_featured', { ascending: false })
      
      if (!error && data) {
        setCharities(data)
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, charity_id: data[0].id }))
        }
      }
      setFetchingCharities(false)
    }
    loadCharities()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setFormData(prev => ({ ...prev, [e.target.name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.charity_percentage < 10) {
      setError('Minimum charity contribution is 10%')
      setLoading(false)
      return
    }

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.full_name },
        },
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('No user returned from signup')
      }

      // 2. Profile is auto-created via DB trigger, but we need to update charity settings
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          charity_id: formData.charity_id || null,
          charity_percentage: formData.charity_percentage,
        })
        .eq('id', authData.user.id)

      if (profileError) {
         // Profile might not be created immediately due to trigger async lag
         console.warn('Could not update profile immediately:', profileError)
      }

      // 3. Redirect to Stripe checkout
      window.location.href = `/api/stripe/checkout?plan=${formData.plan}`
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
      setLoading(false)
    }
  }

  return (
    <div className="glass p-8 rounded-3xl relative overflow-hidden group border border-glass shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -z-10 group-hover:bg-emerald-500/10 transition-colors transition-all duration-500"></div>
      <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Create Account</h2>
      <p className="text-sm text-slate-500 mb-6 font-medium">Join the club. Win prizes. Support charities.</p>
      
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-500 mb-1.5" htmlFor="full_name">
            Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            className="input-field"
            placeholder="John Doe"
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-500 mb-1.5" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="input-field"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-500 mb-1.5" htmlFor="password">
            Secure Password (Min 8 chars)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="input-field"
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="pt-6 border-t border-glass">
          <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-4">Charity Support</h3>
          
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-500 mb-1.5" htmlFor="charity_id">
              Choose Your Cause
            </label>
            <div className="relative">
              {fetchingCharities ? (
                <div className="input-field text-slate-500 flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading charities...
                </div>
              ) : (
                <select
                  id="charity_id"
                  name="charity_id"
                  value={formData.charity_id}
                  onChange={handleChange}
                  className="input-field pr-10"
                  required={charities.length > 0}
                  disabled={charities.length === 0}
                >
                  {charities.length === 0 ? (
                    <option value="">No charities available yet</option>
                  ) : (
                    <>
                      <option value="" disabled>Select a charity...</option>
                      {charities.map(charity => (
                        <option key={charity.id} value={charity.id}>
                          {charity.name} {charity.is_featured ? '(Featured)' : ''}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-500 mb-1.5" htmlFor="charity_percentage">
              Contribution Level (Min 10%)
            </label>
            <div className="flex items-center space-x-4">
              <input
                id="charity_percentage"
                name="charity_percentage"
                type="range"
                min="10"
                max="100"
                step="5"
                value={formData.charity_percentage}
                onChange={handleChange}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
              />
              <span className="text-foreground font-bold text-lg min-w-[3ch]">{formData.charity_percentage}%</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-glass">
          <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-4">Subscription Plan</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <label className={`
              relative flex flex-col cursor-pointer rounded-2xl p-4 border transition-all duration-300 ${
                formData.plan === 'monthly' 
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : 'border-glass bg-background/50 hover:bg-emerald-500/5 hover:border-emerald-500/30'
              }
            `}>
              <input 
                type="radio" 
                name="plan" 
                value="monthly" 
                checked={formData.plan === 'monthly'} 
                onChange={handleChange} 
                className="sr-only" 
              />
              <span className={`text-sm font-bold ${formData.plan === 'monthly' ? 'text-emerald-400' : 'text-foreground'}`}>Monthly</span>
              <span className="text-xs text-slate-500 mt-1 font-medium">₹999 / mo</span>
            </label>
            
            <label className={`
              relative flex flex-col cursor-pointer rounded-2xl p-4 border transition-all duration-300 ${
                formData.plan === 'yearly' 
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : 'border-glass bg-background/50 hover:bg-emerald-500/5 hover:border-emerald-500/30'
              }
            `}>
              <input 
                type="radio" 
                name="plan" 
                value="yearly" 
                checked={formData.plan === 'yearly'} 
                onChange={handleChange} 
                className="sr-only" 
              />
              <span className="absolute -top-3 -right-2 text-[10px] font-black bg-amber-500 text-white px-2.5 py-1 rounded-full shadow-[0_4px_10px_rgba(245,158,11,0.3)] border border-amber-400/20">
                SAVE 16%
              </span>
              <span className={`text-sm font-bold ${formData.plan === 'yearly' ? 'text-emerald-400' : 'text-foreground'}`}>Yearly</span>
              <span className="text-xs text-slate-500 mt-1 font-medium">₹9,999 / yr</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || fetchingCharities}
          className="btn-primary w-full flex justify-center items-center py-3 mt-6"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          {loading ? 'Creating account...' : 'Continue to Payment'}
        </button>
      </form>

      <div className="mt-6 flex flex-col space-y-4">
        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
