import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Activity, RefreshCw } from 'lucide-react';
import { getNodes } from '../api/client';
import type { Node } from '../types';

const NodeList: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const res = await getNodes();
      setNodes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = (status: string) => {
    const base = "px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-fit";
    switch(status) {
      case 'HEALTHY': return `${base} text-emerald-400 bg-emerald-950/40 border-emerald-800/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]`;
      case 'PROVISIONING': return `${base} text-blue-400 bg-blue-950/40 border-blue-800/50 shadow-[0_0_10px_rgba(59,130,246,0.15)] animate-pulse`;
      case 'ERROR': return `${base} text-red-400 bg-red-950/40 border-red-800/50 shadow-[0_0_10px_rgba(239,68,68,0.15)]`;
      case 'UNREACHABLE': return `${base} text-amber-400 bg-amber-950/40 border-amber-800/50 shadow-[0_0_10px_rgba(245,158,11,0.15)]`;
      default: return `${base} text-slate-400 bg-slate-800 border-slate-700`;
    }
  };

  const statusDot = (status: string) => {
    switch(status) {
       case 'HEALTHY': return 'bg-emerald-400';
       case 'PROVISIONING': return 'bg-blue-400';
       case 'ERROR': return 'bg-red-400';
       case 'UNREACHABLE': return 'bg-amber-400';
       default: return 'bg-slate-400';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Network Nodes</h1>
          <p className="text-slate-400">Manage satellites, ground stations, and routers.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white font-medium shadow-xl shadow-blue-900/20">
          <Plus size={18} /> Register Node
        </button>
      </div>

      <div className="glass rounded-xl overflow-hidden backdrop-blur-xl">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search nodes..." 
              className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-72 transition-all placeholder:text-slate-600"
            />
          </div>
          <button 
            onClick={fetchNodes} 
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-all active:scale-95"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-slate-500 uppercase bg-slate-950/30 border-b border-white/5">
              <th className="px-6 py-4 font-semibold tracking-wider">Node Name</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Type</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Environment</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Last Heartbeat</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && nodes.length === 0 ? (
               <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">Loading nodes...</td></tr>
            ) : nodes.map(node => (
              <tr key={node.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-slate-300 shadow-lg group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                      <Activity size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">{node.name}</div>
                      <div className="text-xs text-slate-500 font-mono tracking-tight mt-0.5">{node.mgmt_ip || 'No IP'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400 font-medium">{node.node_type}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide bg-slate-800 text-slate-400 border border-slate-700">{node.environment}</span>
                </td>
                <td className="px-6 py-4">
                  <div className={statusStyles(node.status)}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot(node.status)}`}></span>
                    {node.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                  {node.last_heartbeat_at ? new Date(node.last_heartbeat_at).toLocaleTimeString() : '-'}
                </td>
                <td className="px-6 py-4">
                  <Link to={`/nodes/${node.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium hover:underline decoration-blue-500/50 underline-offset-4">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && nodes.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-2">
                                <Activity className="text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-medium">No nodes registered</p>
                            <p className="text-sm text-slate-600">Click "Register Node" to get started.</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NodeList;
