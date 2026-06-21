import axios from 'axios';

export const BASE_URL = 'https://hellosavora.com';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { Accept: 'application/json' },
});

// Sisipkan token jika ada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ⬇️ TAMBAHKAN: Public API tanpa interceptor auth
export const publicApi = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { Accept: 'application/json' },
});

export default api;