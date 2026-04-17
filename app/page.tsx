import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, Play, Heart, Trophy, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-soft"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-amber-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-soft" style={{ animationDelay: '1s' }}></div>

      {/* Header */}
      <header className="flex justify-between items-center p-6 lg:px-12 relative z-10 glass-light border-b border-white/5">
        <div className="font-bold text-2xl tracking-tight text-white flex items-center">
           Golf <span className="gradient-text ml-1">Heroes</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="btn-primary py-2 px-6 shadow-lg shadow-emerald-500/20">
            Join the Club
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="px-6 py-24 lg:py-32 max-w-6xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Platform Live • Join the next draw
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 animate-slide-up" style={{ animationFillMode: 'both' }}>
            Play. Win. <span className="gradient-text">Give back.</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            The subscription platform that tracks your scores, rewards you with monthly cash prizes, and supports a charity of your choice.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <Link href="/signup" className="btn-primary text-lg px-8 py-4 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              Subscribe Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center">
              How it Works
            </a>
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-8 text-slate-500 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white mb-1">£99.99</span>
              <span className="text-sm">Yearly Plan (Save 16%)</span>
            </div>
            <div className="h-12 w-px bg-slate-800"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-white mb-1">10%+</span>
              <span className="text-sm">Donated to Charity</span>
            </div>
            <div className="h-12 w-px bg-slate-800 hidden sm:block"></div>
            <div className="flex flex-col items-center hidden sm:flex">
              <span className="text-3xl font-bold text-white mb-1">40%</span>
              <span className="text-sm">Jackpot per Draw</span>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 bg-slate-900/50 border-t border-b border-white/5 relative">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">How Golf Heroes Works</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Three simple steps to combine your love for the game with the power of giving context.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Target className="w-8 h-8 text-emerald-400" />, title: "Enter Your Scores", desc: "Submit your Stableford scores (1-45). We keep your latest 5 rolling scores active." },
                { icon: <Trophy className="w-8 h-8 text-amber-400" />, title: "Draw & Win", desc: "A draw runs every month. Match 3, 4, or 5 numbers derived from your logged scores to win!" },
                { icon: <Heart className="w-8 h-8 text-rose-400" />, title: "Support Charities", desc: "A minimum of 10% of your subscription goes automatically to a charity of your choice." }
              ].map((step, i) => (
                <div key={i} className="glass p-8 rounded-2xl relative overflow-hidden group card-hover">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
                   <div className="mb-6 bg-slate-800/50 inline-flex p-4 rounded-xl border border-slate-700/50">
                     {step.icon}
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                   <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Prize Pool Mechanics */}
        <section className="py-24 max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">The Monthly Prize Pool</h2>
              <p className="text-lg text-slate-400">
                Prizes are generated directly from the active subscriber pool. Every subscription increases the potential winnings for everyone.
              </p>
              
              <ul className="space-y-4 pt-4">
                {[
                  { title: "5-Match Jackpot (40%)", desc: "Rolls over to next month if no winner" },
                  { title: "4-Match Prize (35%)", desc: "Split amongst 4-match winners" },
                  { title: "3-Match Prize (25%)", desc: "Shared equally by 3-match winners" }
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="lg:w-1/2 w-full relative">
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-3xl opacity-20 rounded-full animate-pulse-soft"></div>
               <div className="glass p-8 rounded-3xl border border-slate-700/50 relative">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-semibold text-white">Draw Status</h3>
                   <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20 uppercase tracking-wide">Live</span>
                 </div>
                 
                 <div className="bg-slate-900/80 rounded-xl p-6 border border-slate-700/50 flex flex-col items-center justify-center py-12 mb-6">
                    <p className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-widest">Current Jackpot Estimate</p>
                    <p className="text-5xl font-extrabold gradient-text-amber drop-shadow-md">£5,250</p>
                 </div>
                 
                 <div className="text-center">
                    <p className="text-sm text-slate-400 mb-4">Numbers draw on the 1st of every month.</p>
                    <Link href="/signup" className="text-emerald-400 font-medium hover:text-emerald-300 inline-flex items-center">
                      Join before next draw <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                 </div>
               </div>
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-900"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 opacity-50 blur-[100px] rounded-full"></div>
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 glass-light border border-slate-700 py-16 rounded-3xl">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to become a Hero?</h2>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Join thousands of golfers tracking their scores, winning prizes, and raising money for great causes.
            </p>
            <Link href="/signup" className="btn-primary text-lg px-10 py-5 inline-flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105 transition-all">
              Subscribe Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 py-12 border-t border-slate-800 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-xl tracking-tight text-slate-300">
             Golf <span className="gradient-text">Heroes</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Digital Heroes. Sample Build. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
