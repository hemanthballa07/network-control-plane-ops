import React from 'react';
import { Save, User, Globe, Shield } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">System Settings</h1>
          <p className="text-slate-400">Manage control plane configuration and preferences.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white font-medium shadow-xl shadow-blue-900/20">
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="glass rounded-xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-200">
            <User size={20} className="text-blue-400" /> Operator Profile
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Display Name</label>
              <input type="text" defaultValue="Operator" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2">
               <label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Email</label>
               <input type="email" defaultValue="ops@astranis.example" className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 transition-colors" disabled />
            </div>
          </div>
        </section>

        {/* System Config */}
        <section className="glass rounded-xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-200">
            <Globe size={20} className="text-purple-400" /> Network Configuration
          </h2>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5">
                <div>
                   <div className="font-medium text-slate-200">API Endpoint</div>
                   <div className="text-xs text-slate-500">The base URL for the control plane backend.</div>
                </div>
                <div className="font-mono text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                    http://controller.api.internal:8000
                </div>
             </div>
             
             <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-lg border border-white/5">
                <div>
                   <div className="font-medium text-slate-200">Refresh Interval</div>
                   <div className="text-xs text-slate-500">How often to poll for node status updates.</div>
                </div>
                <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none">
                    <option>10 seconds</option>
                    <option>30 seconds</option>
                    <option>1 minute</option>
                </select>
             </div>
          </div>
        </section>
        
        {/* Security */}
         <section className="glass rounded-xl p-6 border border-white/5">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-slate-200">
            <Shield size={20} className="text-emerald-400" /> Security
          </h2>
          <div className="flex items-center gap-4">
             <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition-colors">Rotate API Keys</button>
             <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm border border-slate-700 transition-colors">View Audit Logs</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
