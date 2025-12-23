import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Network, Server, Settings } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'text-white bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800';

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            NetOps Plane
          </h1>
          <p className="text-xs text-slate-500 mt-1">Control Plane & Ops Dashboard</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')}`}>
            <Server size={20} />
            <span className="font-medium">Nodes</span>
          </Link>
          <Link to="/topology" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/topology')}`}>
            <Network size={20} />
            <span className="font-medium">Topology</span>
          </Link>
          <Link to="/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/settings')}`}>
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              OP
            </div>
            <div>
              <div className="text-sm font-medium">Operator</div>
              <div className="text-xs text-slate-500">ops@astranis.example</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-4">
             {/* Breadcrumbs could go here */}
          </div>
          <div className="flex items-center gap-4">
            <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded border border-green-800">System Healthy</span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
