import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getNodes = () => api.get('/nodes/');
export const getNode = (id: string) => api.get(`/nodes/${id}/`);
export const createNode = (data: any) => api.post('/nodes/', data);
export const provisionNode = (id: string) => api.post(`/nodes/${id}/provision/`);

export const getLinks = () => api.get('/links/');
export const getTopology = () => api.get('/topology/');

export default api;
