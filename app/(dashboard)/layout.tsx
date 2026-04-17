'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Target, Trophy, Heart, Settings, LogOut, Menu, X, ShieldAlert, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) setIsCollapsed(saved === 'true')
  }, [])

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('sidebarCollapsed', String(isCollapsed))
    }
  }, [isCollapsed, isMounted])

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
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const adminLinks = [
    { name: 'Admin Overview', href: '/admin', icon: ShieldAlert },
    { name: 'Manage Users', href: '/admin/users', icon: Settings },
    { name: 'Manage Draws', href: '/admin/draws', icon: Trophy },
    { name: 'Manage Charities', href: '/admin/charities', icon: Heart },
    { name: 'Verify Winners', href: '/admin/winners', icon: Target },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin'
    }
    // Handle admin subroutes specifically if we want them to stay highlighted
    if (path.startsWith('/admin/')) {
       return pathname.startsWith(path)
    }
    // Default matching for other dashboard routes
    return pathname === path || (path !== '/dashboard' && pathname.startsWith(path))
  }

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 glass sticky top-0 z-[70] rounded-none border-t-0 border-x-0 border-b border-glass transition-colors duration-300">
        <h1 className="text-xl font-bold gradient-text">Golf Heroes</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400 hover:text-foreground transition-colors p-2">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div className="min-h-screen bg-background flex flex-col md:flex-row transition-colors duration-300">
        {/* Sidebar Navigation */}
        <div className={`
          fixed inset-y-0 left-0 z-50 glass transition-all duration-300 ease-in-out border-r border-slate-800/50 flex flex-col pt-20 md:pt-6 pb-4 md:rounded-none md:border-y-0 md:border-l-0 md:relative md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}>
          {/* Desktop Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-10 w-6 h-6 glass rounded-full items-center justify-center hover:text-emerald-400 text-slate-500 z-[60] border border-glass shadow-lg group/toggle transition-transform hover:scale-110"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className={`px-6 mb-8 hidden md:block transition-all duration-300 ${isCollapsed ? 'px-4 mb-10' : 'px-6 mb-8'}`}>
            <Link href="/" className="flex items-center">
              {isCollapsed ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group hover:border-emerald-500 transition-all mx-auto">
                   <h1 className="text-xl font-black gradient-text">G</h1>
                </div>
              ) : (
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2 transform hover:scale-105 transition-transform origin-left whitespace-nowrap">
                   Golf <span className="gradient-text">Heroes</span>
                </h1>
              )}
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto w-full no-scrollbar">
            {navLinks.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden
                    ${isCollapsed ? 'px-0 justify-center' : 'px-3'}
                    ${active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                      : 'text-slate-400 hover:text-foreground hover:bg-emerald-500/5 hover:translate-x-1 border border-transparent'}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                  title={isCollapsed ? item.name : ""}
                >
                  {active && !isCollapsed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 rounded-r-full" />}
                  <Icon className={`flex-shrink-0 h-5 w-5 transition-transform duration-300 
                    ${isCollapsed ? 'mx-auto' : 'mr-3'}
                    ${active ? 'text-emerald-400 scale-110' : 'text-slate-500 group-hover:text-emerald-400 group-hover:scale-110'}
                  `} />
                  {!isCollapsed && <span className="transition-opacity duration-300">{item.name}</span>}
                </Link>
              )
            })}

            {isAdmin && (
              <>
                <div className={`mt-10 mb-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 pointer-events-none' : 'px-3 opacity-100'}`}>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Admin Panel</h3>
                </div>
                {isCollapsed && <div className="h-px bg-slate-800/50 my-6 mx-4" />}
                {adminLinks.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        group flex items-center py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden mb-2
                        ${isCollapsed ? 'px-0 justify-center' : 'px-3'}
                        ${active 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                          : 'text-slate-400 hover:text-foreground hover:bg-amber-500/5 hover:translate-x-1 border border-transparent'}
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                      title={isCollapsed ? item.name : ""}
                    >
                      {active && !isCollapsed && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 rounded-r-full" />}
                      <Icon className={`flex-shrink-0 h-5 w-5 transition-transform duration-300 
                        ${isCollapsed ? 'mx-auto' : 'mr-3'}
                        ${active ? 'text-amber-400 scale-110' : 'text-slate-500 group-hover:text-amber-400 group-hover:scale-110'}
                      `} />
                      {!isCollapsed && <span className="transition-opacity duration-300">{item.name}</span>}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          <div className={`mt-auto border-t border-slate-800/50 pt-4 space-y-2 transition-all duration-300 ${isCollapsed ? 'px-0' : 'px-4'}`}>
            <div className={`flex items-center justify-between mb-2 transition-all duration-300 ${isCollapsed ? 'flex-col space-y-4 px-0' : 'px-3'}`}>
              {!isCollapsed && <span className="text-xs font-medium text-slate-500">Appearance</span>}
              <ThemeToggle />
            </div>
            <button
              onClick={handleSignOut}
              className={`
                flex items-center text-sm font-medium text-slate-400 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 border border-transparent transition-all duration-300 group
                ${isCollapsed ? 'w-full justify-center px-0 py-4' : 'w-full px-3 py-3'}
              `}
              title={isCollapsed ? "Sign Out" : ""}
            >
              <LogOut className={`flex-shrink-0 h-5 w-5 text-slate-500 group-hover:text-rose-400 transition-colors ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>


        {/* Main Content Area */}
        <div className="flex-1 overflow-auto relative scroll-smooth transition-all duration-300">
          <div className="absolute inset-0 bg-background pointer-events-none -z-10 transition-colors duration-300"></div>
          <main className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in relative z-10">
            {children}
          </main>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </>
  )
}
