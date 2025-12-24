import React, { useState } from 'react';
import { X, Server, Network, Radio } from 'lucide-react';
import { createNode } from '../api/client';
import type { Node } from '../types';

interface RegisterNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RegisterNodeModal: React.FC<RegisterNodeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<Partial<Node>>({
    name: '',
    node_type: 'GROUND',
    environment: 'PROD',
    mgmt_ip: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createNode(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({ name: '', node_type: 'GROUND', environment: 'PROD', mgmt_ip: '' });
    } catch (err) {
      setError('Failed to create node. Check connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Server size={20} className="text-blue-400" />
            Register New Node
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-900 text-red-300 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Node Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. GS-NYC-01"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-600"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Type</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                value={formData.node_type}
                onChange={e => setFormData({...formData, node_type: e.target.value as any})}
              >
                <option value="GROUND">Ground Station</option>
                <option value="SAT">Satellite</option>
                <option value="ROUTER">Router</option>
              </select>
            </div>

            <div className="space-y-1.5">
               <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Environment</label>
               <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                value={formData.environment}
                onChange={e => setFormData({...formData, environment: e.target.value as any})}
              >
                <option value="PROD">Production</option>
                <option value="STAGE">Staging</option>
                <option value="DEV">Development</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
              Management IP <span className="text-slate-600 font-normal normal-case">(Optional)</span>
            </label>
            <div className="relative">
              <Network size={16} className="absolute left-3 top-2.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="10.0.0.1"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-600 font-mono text-sm"
                value={formData.mgmt_ip}
                onChange={e => setFormData({...formData, mgmt_ip: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary px-4 py-2 rounded-lg text-white font-medium text-sm shadow-lg shadow-blue-900/20 flex items-center gap-2"
            >
              {loading ? (
                 <>Provisioning...</>
              ) : (
                 <><Radio size={16} /> Register Node</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default RegisterNodeModal;
