export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-soft"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="w-full max-w-md p-6 z-10 animate-fade-in relative">
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
               Golf <span className="gradient-text">Heroes</span>
            </h1>
          </a>
          <p className="text-slate-400">Play. Win. Give.</p>
        </div>
        
        {children}
      </div>
    </div>
  );
}
