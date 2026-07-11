import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ww_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ww_token');
      localStorage.removeItem('ww_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============ Auth API ============
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (data: { email: string; password: string; fullName: string; panNumber?: string }) =>
    api.post('/api/auth/register', data),
};

// ============ Portfolio API ============
export const portfolioApi = {
  getSummary: () => api.get('/api/portfolio/summary'),
  getHoldings: () => api.get('/api/portfolio/holdings'),
};

// ============ Asset API ============
export const assetApi = {
  discover: (params?: { assetType?: string; riskLevel?: string }) =>
    api.get('/api/assets/discover', { params }),
  getById: (id: string) => api.get(`/api/assets/${id}`),
  getAlternate: () => api.get('/api/assets/alternate'),
};

// ============ AI API ============
export const aiApi = {
  suitability: (userId: string, assetId: string) =>
    api.post('/api/ai/suitability', { userId, assetId }),
  chat: (userId: string, message: string, assetId?: string) =>
    api.post('/api/ai/chat', { userId, message, assetId }),
  knowledgeCheck: (assetId: string) =>
    api.post('/api/ai/knowledge-check', { assetId }),
};

// ============ Ingestion API ============
export const ingestionApi = {
  triggerSync: () => api.post('/api/ingestion/sync'),
};

// ============ Profile API ============
export const profileApi = {
  getProfile: () => api.get('/api/profile'),
  updateRisk: (riskLevel: string) => api.put('/api/profile/risk', { riskLevel }),
};

export default api;
