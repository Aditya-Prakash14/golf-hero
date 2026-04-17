'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Target, Trophy, Heart, Settings, LogOut, Menu, X, ShieldAlert } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        if (data?.is_admin) {
          setIsAdmin(true)
        }
      }
    }
    checkRole()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Scores', href: '/scores', icon: Target },
    { name: 'Draws', href: '/draws', icon: Trophy },
    { name: 'Charity', href: '/charity', icon: Heart },
  ]

  const adminLinks = [
    { name: 'Admin Overview', href: '/admin', icon: ShieldAlert },
    { name: 'Manage Users', href: '/admin/users', icon: Settings },
    { name: 'Manage Draws', href: '/admin/draws', icon: Trophy },
    { name: 'Manage Charities', href: '/admin/charities', icon: Heart },
    { name: 'Verify Winners', href: '/admin/winners', icon: Target },
  ]

  const isActive = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true
    if (path !== '/admin' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <h1 className="text-xl font-bold gradient-text">Golf Heroes</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 glass-light md:relative md:translate-x-0 transition-transform duration-300 ease-in-out border-r border-slate-800/50 flex flex-col pt-6 pb-4
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-6 mb-8 hidden md:block">
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
               Golf <span className="gradient-text">Heroes</span>
            </h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                  ${isActive(item.href) 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive(item.href) ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.name}
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="mt-8 mb-2 px-3">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Panel</h3>
              </div>
              {adminLinks.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                      ${isActive(item.href) 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive(item.href) ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    {item.name}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        <div className="px-4 mt-6">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800/50 hover:text-white transition-colors"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-slate-500" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 pointer-events-none -z-10"></div>
        <main className="p-4 md:p-8 max-w-6xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
