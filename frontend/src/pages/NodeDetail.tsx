import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Terminal, Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { getNode, provisionNode } from '../api/client';
import { Node, WorkflowRun, EventLog } from '../types';

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
      // Poll or re-fetch (for now just wait a sec)
      setTimeout(() => fetchNode(id), 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setProvisioning(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading node details...</div>;
  if (!node) return <div className="p-8 text-center text-red-400">Node not found</div>;

  return (
    <div>
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
        <ArrowLeft size={16} /> Back to Nodes
      </button>

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold">{node.name}</h1>
            <span className={`px-2 py-1 rounded-full text-xs font-bold border 
              ${node.status === 'HEALTHY' ? 'text-green-400 bg-green-900/30 border-green-800' : 
                node.status === 'PROVISIONING' ? 'text-blue-400 bg-blue-900/30 border-blue-800' : 'text-slate-400 bg-slate-800'}`}>
              {node.status}
            </span>
          </div>
          <p className="text-slate-400 flex items-center gap-4 text-sm">
            <span>ID: <span className="font-mono text-slate-500">{node.id}</span></span>
            <span>Type: {node.node_type}</span>
            <span>Env: {node.environment}</span>
          </p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={handleProvision}
              disabled={provisioning || node.status === 'PROVISIONING'}
              className="btn bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed">
              <Play size={16} /> {provisioning ? 'Starting...' : 'Provision Node'}
            </button>
            <button className="btn bg-slate-700 hover:bg-slate-600 text-white">
              <Terminal size={16} /> SSH Console
            </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="card bg-slate-800/50 border-slate-700 col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} className="text-blue-400" /> System Status
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
               <div className="text-sm text-slate-500 mb-1">Management IP</div>
               <div className="font-mono text-slate-200">{node.mgmt_ip || 'Not Assigned'}</div>
            </div>
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
               <div className="text-sm text-slate-500 mb-1">Config Version</div>
               <div className="font-mono text-slate-200">{node.applied_config_version || 'None'}</div>
            </div>
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
               <div className="text-sm text-slate-500 mb-1">Last Heartbeat</div>
               <div className="text-slate-200">{node.last_heartbeat_at ? new Date(node.last_heartbeat_at).toLocaleString() : 'Never'}</div>
            </div>
             <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
               <div className="text-sm text-slate-500 mb-1">Uptime</div>
               <div className="text-slate-200">--</div>
            </div>
          </div>
        </div>

        {/* Recent Workflows (Mocked for UI feel as we don't have separate endpoint yet, assumed to be fetched appropriately) */}
        <div className="card bg-slate-800/50 border-slate-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} className="text-purple-400" /> Recent Activity
          </h2>
          <div className="space-y-4">
             {/* This would map over workflows/events ideally */}
             <div className="flex gap-3">
                <div className="mt-1"><CheckCircle size={14} className="text-green-500" /></div>
                <div>
                   <div className="text-sm font-medium">Node Registerd</div>
                   <div className="text-xs text-slate-500">{new Date(node.created_at).toLocaleTimeString()}</div>
                </div>
             </div>
             {node.status === 'PROVISIONING' && (
               <div className="flex gap-3 animate-pulse">
                  <div className="mt-1"><Activity size={14} className="text-blue-500" /></div>
                  <div>
                     <div className="text-sm font-medium text-blue-400">Provisioning in progress...</div>
                     <div className="text-xs text-slate-500">Just now</div>
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
