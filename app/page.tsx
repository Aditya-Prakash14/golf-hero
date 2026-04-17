import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, ChevronRight, Play, Heart, Trophy, Target, Users, Globe, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-500">
      {/* Header */}
      <header className="flex justify-between items-center p-6 lg:px-12 fixed top-0 w-full z-[100] backdrop-blur-md bg-background/50 border-b border-glass">
        <div className="font-bold text-2xl tracking-tighter text-foreground flex items-center group cursor-pointer">
           <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
             <span className="text-white text-xl">G</span>
           </div>
           Golf <span className="gradient-text ml-1">Heroes</span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8 mr-4">
            <a href="#how" className="text-sm font-semibold text-slate-500 hover:text-emerald-500 transition-colors">How it Works</a>
            <a href="#prizes" className="text-sm font-semibold text-slate-500 hover:text-emerald-500 transition-colors">Prize Pool</a>
            <a href="#charities" className="text-sm font-semibold text-slate-500 hover:text-emerald-500 transition-colors">Charities</a>
          </nav>
          <div className="h-6 w-px bg-slate-800/50 hidden md:block"></div>
          <ThemeToggle />
          <Link href="/login" className="hidden sm:block text-sm font-bold text-slate-500 hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="btn-primary py-2.5 px-6 shadow-xl shadow-emerald-500/20 text-sm">
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Immersive Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Hero Image Background with Overlays */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/hero-bg.png" 
              alt="Premium Golf Course" 
              fill 
              className="object-cover scale-105 opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/20 z-10" />
          </div>

          <div className="container mx-auto px-6 relative z-20 flex flex-col items-center">
            {/* Trust Badge */}
            <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 px-6 py-2 rounded-full text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-3 animate-fade-in shadow-2xl">
              <Sparkles className="w-4 h-4 animate-pulse" />
              The Premium Golf Society Experience
            </div>

            {/* Main Hero Card */}
            <div className="max-w-4xl w-full glass p-10 md:p-16 rounded-[3rem] border border-glass shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] text-center relative overflow-hidden animate-scale-in">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]" />
              
              <h1 className="text-5xl lg:text-8xl font-black tracking-tighter text-foreground mb-8 leading-[0.9] inline-block text-left md:text-center">
                Play. Win. <br />
                <span className="gradient-text">Give Back.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                Record your scores, enter monthly jackpot draws, and support local charities—all in one premium platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                <Link href="/signup" className="btn-primary text-xl px-12 py-5 flex items-center justify-center shadow-2xl shadow-emerald-500/30 transform hover:scale-105 transition-all">
                  Start Your Journey <ArrowRight className="ml-3 w-6 h-6" />
                </Link>
                <a href="#how" className="btn-secondary text-xl px-12 py-5 flex items-center justify-center border-glass hover:border-emerald-500/50 backdrop-blur-3xl transition-all">
                  See How it Works
                </a>
              </div>
            </div>

            {/* Live Stats Bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 items-center justify-center animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <div className="text-center group">
                <p className="text-4xl font-black text-foreground group-hover:scale-110 transition-transform">₹8.5L+</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Pool Stats</p>
              </div>
              <div className="text-center group">
                <p className="text-4xl font-black text-emerald-500 group-hover:scale-110 transition-transform">1.2K</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Active Heroes</p>
              </div>
              <div className="text-center group">
                <p className="text-4xl font-black text-rose-500 group-hover:scale-110 transition-transform">24</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Charities Funded</p>
              </div>
              <div className="text-center group">
                <p className="text-4xl font-black text-amber-500 group-hover:scale-110 transition-transform">5th</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Monthly Draw Day</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Hero's Journey (How it Works) */}
        <section id="how" className="py-32 relative overflow-hidden border-y border-glass bg-muted/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <div className="container mx-auto px-6">
            <div className="text-center mb-24 max-w-3xl mx-auto">
              <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.4em] mb-6">The Journey</h2>
              <h3 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-8 leading-none">Elevate Your Game. <span className="text-slate-500">Simplify Your Impact.</span></h3>
              <p className="text-lg text-slate-500 font-medium">Golf Heroes bridges the gap between your weekend round and meaningful local charity work.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connector lines (Desktop) */}
              <div className="hidden lg:block absolute top-24 left-[25%] right-[25%] h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent z-0" />
              
              {[
                { 
                  icon: <Target className="w-10 h-10 text-emerald-500" />, 
                  title: "Record Scores", 
                  step: "01",
                  desc: "Log your Stableford scores after every round. We maintain your latest 5 active scores for the monthly draw eligibility." 
                },
                { 
                  icon: <Zap className="w-10 h-10 text-amber-500" />, 
                  title: "Enter the Draw", 
                  step: "02",
                  desc: "Every month, a matching draw occurs. Align your scores with the drawn numbers to win massive community jackpots." 
                },
                { 
                  icon: <Heart className="w-10 h-10 text-rose-500" />, 
                  title: "Auto-Donate", 
                  step: "03",
                  desc: "Specify your charity and percentage. A portion of your subscription goes directly to your cause, every single month." 
                }
              ].map((item, i) => (
                <div key={i} className="glass p-10 rounded-[2.5rem] border border-glass relative group z-10 hover:-translate-y-4 transition-all duration-500 hover:shadow-2xl">
                   <div className="text-8xl font-black text-foreground/5 absolute top-4 right-8 select-none group-hover:text-emerald-500/10 transition-colors uppercase">{item.step}</div>
                   <div className="mb-10 bg-muted/20 inline-flex p-6 rounded-3xl border border-glass group-hover:bg-emerald-500/10 group-hover:scale-110 transition-all duration-500 rotate-3 group-hover:rotate-12">
                     {item.icon}
                   </div>
                   <h4 className="text-2xl font-bold text-foreground mb-4 tracking-tight">{item.title}</h4>
                   <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Prize Pool Mechanics */}
        <section id="prizes" className="py-32 container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2 space-y-10">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">The Rewards</h2>
                <h3 className="text-4xl md:text-7xl font-black text-foreground tracking-tighter leading-none">A Pool That <br /> <span className="gradient-text-amber">Grows With You.</span></h3>
              </div>
              
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                40% of all subscriptions pour directly into the monthly prize pool. The more heroes join, the bigger the victory for everyone.
              </p>
              
              <div className="space-y-6">
                {[
                  { level: "Matched 5 Numbers", share: "40%", type: "Main Jackpot", color: "from-amber-400 to-amber-600" },
                  { level: "Matched 4 Numbers", share: "35%", type: "Community Prize", color: "from-slate-400 to-slate-600" },
                  { level: "Matched 3 Numbers", share: "25%", type: "Hero Prize", color: "from-emerald-400 to-emerald-600" }
                ].map((tier, i) => (
                   <div key={i} className="flex items-center group cursor-default">
                     <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center mr-6 shadow-xl transform group-hover:scale-110 group-hover:rotate-12 transition-all`}>
                        <Trophy className="text-white w-7 h-7" />
                     </div>
                     <div className="flex-1 border-b border-glass pb-4 group-hover:border-amber-500/50 transition-colors">
                        <div className="flex justify-between items-end mb-1">
                           <p className="font-bold text-foreground text-lg">{tier.level}</p>
                           <p className="text-2xl font-black text-foreground">{tier.share}</p>
                        </div>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{tier.type}</p>
                     </div>
                   </div>
                ))}
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
               <div className="relative p-1 glass rounded-[3.5rem] bg-gradient-to-br from-amber-500/20 to-emerald-500/20 shadow-3xl">
                  <div className="glass bg-background/90 p-12 rounded-[3.4rem] border border-glass flex flex-col items-center text-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10" />
                    
                    <div className="bg-amber-500/10 px-6 py-2 rounded-full border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12">
                       Active Live Pot
                    </div>
                    
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Estimated Jackpot Remaining</h4>
                    <p className="text-7xl md:text-9xl font-black gradient-text-amber tracking-tighter mb-10 drop-shadow-2xl">₹5.2L</p>
                    
                    <div className="grid grid-cols-2 gap-8 w-full border-t border-glass pt-10 mt-2">
                       <div>
                          <p className="text-3xl font-black text-foreground">14 Days</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Until Next Draw</p>
                       </div>
                       <div>
                          <p className="text-3xl font-black text-foreground">742</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Tickets Active</p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>
        
        {/* Charity Showcase */}
        <section id="charities" className="py-32 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 rotate-12 scale-150 blur-3xl -z-10" />
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="max-w-xl">
                 <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-6">The Impact</h2>
                 <h3 className="text-4xl md:text-7xl font-black text-foreground tracking-tighter leading-none">Your Passion <br /> <span className="text-rose-500">Fuels Their Dreams.</span></h3>
              </div>
              <p className="text-lg text-slate-500 font-medium max-w-sm mb-2">
                Join a community of thousands making a tangible difference in environment, health, and education.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "EcoRestore India", cat: "Environment", impact: "4.2L Raised", desc: "Focusing on local reforestation and restoring our native wetlands." },
                { name: "CarePulse Foundation", cat: "Healthcare", impact: "8.1L Raised", desc: "Providing portable diagnostic equipment to remote rural communities." },
                { name: "SkillStart Kids", cat: "Education", impact: "5.5L Raised", desc: "Building digital learning centers for underprivileged primary schools." }
              ].map((charity, i) => (
                <div key={i} className="glass p-10 rounded-[3rem] border border-glass hover:border-rose-500/30 transition-all group flex flex-col h-full bg-background/40 hover:bg-background/60">
                   <div className="flex justify-between items-start mb-10">
                      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500 group-hover:scale-110 transition-transform">
                         <Heart className="w-8 h-8 group-hover:fill-rose-500 transition-all" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{charity.cat}</span>
                   </div>
                   <h4 className="text-3xl font-black text-foreground mb-4 tracking-tighter">{charity.name}</h4>
                   <p className="text-slate-500 font-medium mb-12 flex-1 leading-relaxed">{charity.desc}</p>
                   <div className="pt-8 border-t border-glass flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Impact Metric</p>
                        <p className="text-xl font-bold text-rose-500">{charity.impact}</p>
                      </div>
                      <Link href="/signup" className="w-10 h-10 rounded-xl bg-glass-light flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all group/btn">
                         <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                   </div>
                </div>
              ))}
            </div>
            
            <div className="mt-24 glass p-16 rounded-[4rem] text-center border-glass relative overflow-hidden">
               <h4 className="text-3xl md:text-5xl font-black text-foreground mb-8 tracking-tighter max-w-2xl mx-auto">Ready to turn your golf game into a force for good?</h4>
               <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link href="/signup" className="btn-primary text-2xl px-16 py-6 shadow-2xl shadow-emerald-500/30 rounded-full">
                    Join the Movement
                  </Link>
               </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background py-24 border-t border-glass relative z-50 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
             <div className="col-span-1 md:col-span-2 space-y-8">
                <div className="font-bold text-3xl tracking-tighter text-foreground flex items-center">
                   <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                      <span className="text-white">G</span>
                   </div>
                   Golf <span className="gradient-text ml-1">Heroes</span>
                </div>
                <p className="text-lg text-slate-500 font-medium max-w-sm">
                   Empowering golfers to win big and give back. The community platform for scoring, draws, and charity impact.
                </p>
             </div>
             <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Navigation</h5>
                <ul className="space-y-4">
                   <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-bold transition-colors">Platform</a></li>
                   <li><a href="#how" className="text-slate-500 hover:text-emerald-500 font-bold transition-colors">How it Works</a></li>
                   <li><a href="#charities" className="text-slate-500 hover:text-emerald-500 font-bold transition-colors">Charities</a></li>
                   <li><Link href="/login" className="text-slate-500 hover:text-emerald-500 font-bold transition-colors">Sign In</Link></li>
                </ul>
             </div>
             <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Legal</h5>
                <ul className="space-y-4">
                   <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-bold transition-colors">Terms of Service</a></li>
                   <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-bold transition-colors">Privacy Policy</a></li>
                   <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-bold transition-colors">Draw Rules</a></li>
                   <li><a href="#" className="text-slate-500 hover:text-emerald-500 font-bold transition-colors">Contact</a></li>
                </ul>
             </div>
          </div>

          <div className="pt-12 border-t border-glass flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-500 text-sm font-medium">
              © 2026 Golf Heroes Community. Build v1.4. All rights reserved.
            </p>
            <div className="flex gap-10">
               <Globe className="w-5 h-5 text-slate-400 hover:text-emerald-500 cursor-pointer" />
               <ShieldCheck className="w-5 h-5 text-slate-400 hover:text-emerald-500 cursor-pointer" />
               <Trophy className="w-5 h-5 text-slate-400 hover:text-emerald-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
