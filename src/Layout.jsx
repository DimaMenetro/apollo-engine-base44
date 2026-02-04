import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { 
  LayoutDashboard, 
  UserPlus, 
  Activity, 
  FileText,
  Radar,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
    { name: 'New Subject', page: 'SubjectIntake', icon: UserPlus },
    { name: 'Processing', page: 'Processing', icon: Activity },
    { name: 'Reports', page: 'Reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        :root {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --popover: 222.2 84% 4.9%;
          --popover-foreground: 210 40% 98%;
          --primary: 43 96% 56%;
          --primary-foreground: 222.2 84% 4.9%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
          --ring: 43 96% 56%;
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        .glow-amber {
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.15);
        }
        
        .glass-panel {
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(100, 116, 139, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .glass-panel-thick {
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(100, 116, 139, 0.3);
        }
      `}</style>
      
      {/* Top Navigation Bar - Liquid Glass */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-3xl bg-slate-950/40 border-b border-slate-700/30 shadow-2xl shadow-amber-500/5">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Radar className="h-8 w-8 text-amber-500" />
              <div className="absolute inset-0 animate-ping">
                <Radar className="h-8 w-8 text-amber-500 opacity-20" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-100">APOLLO</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Profiling Engine v1.0</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-xl",
                    isActive 
                      ? "bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/20 border border-amber-500/30" 
                      : "text-slate-300 hover:text-slate-100 hover:bg-white/10 border border-transparent hover:border-white/20"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
      
      {/* Gradient Background - Liquid Glass Style */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-gradient-to-tl from-violet-500/15 via-purple-600/10 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-gradient-to-bl from-cyan-500/10 via-blue-600/8 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        </div>
        
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      </div>
    </div>
  );
}