import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Network, Server, Settings } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path 
    ? 'text-white bg-blue-600/20 border-r-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
    : 'text-slate-400 hover:text-white hover:bg-slate-800/50';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel flex flex-col z-20">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text drop-shadow-sm">
            NetOps Plane
          </h1>
          <p className="text-[11px] uppercase tracking-wider text-slate-500 mt-2 font-semibold">Control Plane V1</p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive('/')}`}>
            <Server size={18} />
            <span className="font-medium text-sm">Nodes</span>
          </Link>
          <Link to="/topology" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive('/topology')}`}>
            <Network size={18} />
            <span className="font-medium text-sm">Topology</span>
          </Link>
          <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive('/settings')}`}>
            <Settings size={18} />
            <span className="font-medium text-sm">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800/50 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold shadow-lg">
              OP
            </div>
            <div>
              <div className="text-sm font-medium text-white">Operator</div>
              <div className="text-[10px] text-slate-400">ops@astranis.example</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
         {/* Background glow effects */}
         <div className="absolute top-0 left-0 w-full h-96 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

        <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-10 backdrop-blur-md bg-opacity-70 border-b border-slate-800/30">
          <div className="flex items-center gap-4">
             {/* Dynamic header content could go here */}
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              System Healthy
            </span>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
