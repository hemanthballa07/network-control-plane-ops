import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Terminal, Activity, Clock, CheckCircle } from 'lucide-react';
import { getNode, provisionNode } from '../api/client';
import type { Node } from '../types';

const NodeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [node, setNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);
  const [provisioning, setProvisioning] = useState(false);

  useEffect(() => {
    if (id) fetchNode(id);
  }, [id]);

  const fetchNode = async (nodeId: string) => {
    try {
      const res = await getNode(nodeId);
      setNode(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProvision = async () => {
    if (!id) return;
    try {
      setProvisioning(true);
      await provisionNode(id);
      setTimeout(() => fetchNode(id), 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setProvisioning(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading node details...</div>;
  if (!node) return <div className="p-8 text-center text-red-400">Node not found</div>;

  const statusBadge = (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 
        ${node.status === 'HEALTHY' ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
          node.status === 'PROVISIONING' ? 'text-blue-400 bg-blue-950/40 border-blue-800/50 animate-pulse' : 'text-slate-400 bg-slate-800'}`}>
        <span className={`w-2 h-2 rounded-full ${node.status === 'HEALTHY' ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
        {node.status}
      </span>
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 group transition-colors">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Nodes
      </button>

      {/* Header */}
      <div className="flex justify-between items-start mb-8 glass p-6 rounded-xl">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{node.name}</h1>
            {statusBadge}
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>ID: <span className="font-mono text-slate-300">{node.id}</span></span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>Type: <span className="text-slate-200">{node.node_type}</span></span>
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>Env: <span className="text-slate-200">{node.environment}</span></span>
          </div>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={handleProvision}
              disabled={provisioning || node.status === 'PROVISIONING'}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all active:scale-95 font-medium">
              <Play size={16} /> {provisioning ? 'Starting...' : 'Provision Node'}
            </button>
            <button className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-2 shadow-lg transition-all active:scale-95 font-medium">
              <Terminal size={16} /> SSH Console
            </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="glass rounded-xl col-span-2 p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-blue-200 border-b border-white/5 pb-4">
            <Activity size={20} className="text-blue-400" /> System Metrics
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
               <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Management IP</div>
               <div className="font-mono text-xl text-slate-200 tracking-tight">{node.mgmt_ip || 'Not Assigned'}</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
               <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Config Version</div>
               <div className="font-mono text-xl text-slate-200 tracking-tight">{node.applied_config_version || 'None'}</div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
               <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Last Heartbeat</div>
               <div className="text-slate-200 text-lg">{node.last_heartbeat_at ? new Date(node.last_heartbeat_at).toLocaleTimeString() : 'Never'}</div>
            </div>
             <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
               <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Uptime</div>
               <div className="text-slate-200 text-lg">99.9%</div>
            </div>
          </div>
        </div>

        {/* Recent Workflows */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-purple-200 border-b border-white/5 pb-4">
            <Clock size={20} className="text-purple-400" /> Recent Activity
          </h2>
          <div className="space-y-6 relative">
             <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-800"></div>
             
             <div className="flex gap-4 relative">
                <div className="mt-1 relative z-10 w-4 h-4 rounded-full bg-slate-900 border-2 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                <div>
                   <div className="text-sm font-medium text-slate-200">Node Registered</div>
                   <div className="text-xs text-slate-500 mt-0.5">{new Date(node.created_at).toLocaleTimeString()}</div>
                </div>
             </div>

             {node.status === 'PROVISIONING' && (
               <div className="flex gap-4 relative animate-pulse">
                  <div className="mt-1 relative z-10 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
                  <div>
                     <div className="text-sm font-medium text-blue-400">Provisioning...</div>
                     <div className="text-xs text-slate-500 mt-0.5">Just now</div>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetail;
