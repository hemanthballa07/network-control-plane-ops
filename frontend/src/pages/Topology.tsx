import React, { useEffect, useState } from 'react';
import { getTopology } from '../api/client';
import { TopologyData } from '../types';
import { RefreshCw, Share2 } from 'lucide-react';

// A simple manual visualization for now, can be upgraded to D3/Mermaid later
const Topology: React.FC = () => {
  const [data, setData] = useState<TopologyData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        const res = await getTopology();
        setData(res.data);
    };
    fetchData();
  }, []);

  if (!data) return <div className="p-8">Loading topology...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Network Topology</h1>
        <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700">
           <RefreshCw size={18} />
        </button>
      </div>

      <div className="card bg-slate-800 border-slate-700 min-h-[500px] flex items-center justify-center relative overflow-hidden">
        {/* Abstract Visualization Placeholder */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-900 opacity-50"></div>
        
        {data.nodes.length === 0 ? (
            <div className="text-slate-500 flex flex-col items-center">
                <Share2 size={48} className="mb-4 opacity-50" />
                <p>No nodes found in topology.</p>
            </div>
        ) : (
            <div className="grid grid-cols-3 gap-16 relative z-10 w-full max-w-4xl px-8">
                {/* Visualizing simple groups */}
                <div className="flex flex-col gap-4 items-center">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Ground Stations</h3>
                    {data.nodes.filter(n => n.node_type === 'GROUND').map(n => (
                        <div key={n.id} className="w-32 p-3 bg-slate-700 rounded-lg border border-slate-600 text-center shadow-lg">
                            <div className="font-bold text-sm text-blue-300">{n.name}</div>
                            <div className="text-[10px] text-slate-400">{n.status}</div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-4 items-center justify-center border-x border-slate-700/50 px-8">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Links</h3>
                     {/* Simplified links view */}
                     {data.links.map(l => (
                         <div key={l.id} className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{l.from_node_details?.name || l.from_node}</span>
                            <span className="h-px w-8 bg-slate-500"></span>
                            <span>{l.to_node_details?.name || l.to_node}</span>
                         </div>
                     ))}
                     {data.links.length === 0 && <span className="text-slate-600 italic">No active links</span>}
                </div>

                <div className="flex flex-col gap-4 items-center">
                    <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Satellites</h3>
                    {data.nodes.filter(n => n.node_type === 'SAT').map(n => (
                        <div key={n.id} className="w-32 p-3 bg-slate-700 rounded-lg border border-slate-600 text-center shadow-lg">
                            <div className="font-bold text-sm text-purple-300">{n.name}</div>
                            <div className="text-[10px] text-slate-400">{n.status}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Topology;
