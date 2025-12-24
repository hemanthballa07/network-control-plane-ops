import axios from 'axios';
import type { Node, Link as NetworkLink, TopologyData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 1000, // Fast timeout to fallback to mocks quickly
});


// --- API CALLS ---

export const getNodes = async () => {
  return await client.get<Node[]>('/nodes/');
};

export const getLinks = async () => {
  return await client.get<NetworkLink[]>('/links/');
};

export const getTopology = async () => {
  return await client.get<TopologyData>('/topology/');
};

export const getNode = async (id: string) => {
  return await client.get<Node>(`/nodes/${id}/`);
};

export const provisionNode = async (id: string) => {
  return await client.post(`/nodes/${id}/provision/`);
};

export const createNode = async (data: Partial<Node>) => {
  return await client.post<Node>('/nodes/', data);
};
