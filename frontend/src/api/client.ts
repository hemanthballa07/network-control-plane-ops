import axios from 'axios';
import type { Node, Link as NetworkLink, TopologyData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 1000, // Fast timeout to fallback to mocks quickly
});

// --- MOCK DATA GENERATOR ---
const generateMockNodes = (): Node[] => [
  { id: '1', name: 'GS-01-NYC', node_type: 'GROUND', environment: 'PROD', status: 'HEALTHY', mgmt_ip: '10.80.1.10', applied_config_version: 'v2.4.1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_heartbeat_at: new Date().toISOString() },
  { id: '2', name: 'GS-02-LDN', node_type: 'GROUND', environment: 'PROD', status: 'HEALTHY', mgmt_ip: '10.80.2.10', applied_config_version: 'v2.4.1', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_heartbeat_at: new Date(Date.now() - 50000).toISOString() },
  { id: '3', name: 'SAT-V1-044', node_type: 'SAT', environment: 'PROD', status: 'HEALTHY', mgmt_ip: '100.64.12.44', applied_config_version: 'v1.9.0', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_heartbeat_at: new Date().toISOString() },
  { id: '4', name: 'SAT-V1-045', node_type: 'SAT', environment: 'PROD', status: 'DEGRADED', mgmt_ip: '100.64.12.45', applied_config_version: 'v1.8.5', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_heartbeat_at: new Date(Date.now() - 120000).toISOString() },
  { id: '5', name: 'SAT-V1-046 [PROV]', node_type: 'SAT', environment: 'DEV', status: 'PROVISIONING', mgmt_ip: '100.64.12.46', applied_config_version: 'v0.0.0', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_heartbeat_at: undefined },
  { id: '6', name: 'CORE-RTR-01', node_type: 'ROUTER', environment: 'PROD', status: 'HEALTHY', mgmt_ip: '172.16.0.1', applied_config_version: 'v4.0.0', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_heartbeat_at: new Date().toISOString() },
];

const generateMockTopology = (): TopologyData => {
  const nodes = generateMockNodes();
  const links: NetworkLink[] = [
    { id: 'l1', from_node: '1', to_node: '3', status: 'UP', latency_ms: 12, link_type: 'RF' },
    { id: 'l2', from_node: '3', to_node: '4', status: 'UP', latency_ms: 45, link_type: 'RF' },
    { id: 'l3', from_node: '4', to_node: '2', status: 'DEGRADED', latency_ms: 150, link_type: 'RF' },
    { id: 'l4', from_node: '1', to_node: '6', status: 'UP', latency_ms: 1, link_type: 'FIBER' },
  ];
  return { nodes, links };
};

// --- WRAPPER WITH FALLBACK ---

export const getNodes = async () => {
  try {
    return await client.get<Node[]>('/nodes/');
  } catch (e) {
    console.warn("Backend unreachable, returning MOCK DATA for Nodes");
    return { data: generateMockNodes() };
  }
};

export const getLinks = async () => {
  try {
    return await client.get<NetworkLink[]>('/links/');
  } catch (e) {
    console.warn("Backend unreachable, returning MOCK DATA for Links");
    // Mock links not exposed directly in UI separate from topology usually, but returning empty or basic
    return { data: [] };
  }
};

export const getTopology = async () => {
  try {
    return await client.get<TopologyData>('/topology/');
  } catch (e) {
    console.warn("Backend unreachable, returning MOCK DATA for Topology");
    return { data: generateMockTopology() };
  }
};

export const getNode = async (id: string) => {
  try {
    return await client.get<Node>(`/nodes/${id}/`);
  } catch (e) {
    console.warn(`Backend unreachable, returning MOCK DATA for Node ${id}`);
    const mock = generateMockNodes().find(n => n.id === id);
    if (mock) return { data: mock };
    throw e;
  }
};

export const provisionNode = async (id: string) => {
  try {
    return await client.post(`/nodes/${id}/provision/`);
  } catch (e) {
    console.warn("Backend unreachable, simulating PROVISIONING");
    return { data: { status: 'queued' } };
  }
};
