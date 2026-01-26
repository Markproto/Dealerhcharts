import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

export async function fetchPrices() {
  const { data } = await api.get('/prices');
  return data;
}

export async function fetchHealth() {
  const { data } = await api.get('/health');
  return data;
}

export default api;
