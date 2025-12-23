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

  const statusColor = (status: string) => {
    switch(status) {
      case 'HEALTHY': return 'text-green-400 bg-green-900/30 border-green-800';
      case 'PROVISIONING': return 'text-blue-400 bg-blue-900/30 border-blue-800';
      case 'ERROR': return 'text-red-400 bg-red-900/30 border-red-800';
      case 'UNREACHABLE': return 'text-orange-400 bg-orange-900/30 border-orange-800';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Network Nodes</h1>
          <p className="text-slate-400">Manage satellites, ground stations, and routers.</p>
        </div>
        <button className="btn btn-primary bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 px-4 py-2 rounded-lg transition-all">
          <Plus size={18} /> Register Node
        </button>
      </div>

      <div className="card bg-slate-800/50 border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search nodes..." 
              className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          <button onClick={fetchNodes} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700">
            <RefreshCw size={18} />
          </button>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700">
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Environment</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Last Heartbeat</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
               <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading nodes...</td></tr>
            ) : nodes.map(node => (
              <tr key={node.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-slate-300">
                      <Activity size={16} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">{node.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{node.mgmt_ip || 'No IP'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">{node.node_type}</td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  <span className="px-2 py-1 rounded text-xs bg-slate-800 border border-slate-700">{node.environment}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs border ${statusColor(node.status)}`}>
                    {node.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {node.last_heartbeat_at ? new Date(node.last_heartbeat_at).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4">
                  <Link to={`/nodes/${node.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NodeList;
