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

// News API
export async function fetchNews(limit = 10) {
  const { data } = await api.get('/news', { params: { limit } });
  return data.posts;
}

export async function fetchAllNews(token) {
  const { data } = await api.get('/news/admin', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.posts;
}

export async function createNewsPost(token, post) {
  const { data } = await api.post('/news', post, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.post;
}

export async function updateNewsPost(token, id, updates) {
  const { data } = await api.put(`/news/${id}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.post;
}

export async function deleteNewsPost(token, id) {
  await api.delete(`/news/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export default api;
