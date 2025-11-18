import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add wallet address to requests
export const setWalletAddress = (address) => {
  if (address) {
    api.defaults.headers.common['x-wallet-address'] = address;
  } else {
    delete api.defaults.headers.common['x-wallet-address'];
  }
};

// Auth endpoints
export const authAPI = {
  login: (walletAddress) => api.post('/auth/login', { walletAddress }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Files endpoints
export const filesAPI = {
  getAll: (params = {}) => api.get('/files', { params }),
  getById: (id) => api.get(`/files/${id}`),
  upload: (formData, onUploadProgress) =>
    api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  update: (id, data) => api.put(`/files/${id}`, data),
  delete: (id) => api.delete(`/files/${id}`),
  download: (id) => api.get(`/files/${id}/download`),
  getPreviewUrl: async (id) => {
    const response = await api.get(`/files/${id}/preview`);
    return response.data.url;
  },
  getShareLink: (shareLink) => api.get(`/files/share/${shareLink}`),
};

// Folders endpoints
export const foldersAPI = {
  getAll: (params = {}) => api.get('/folders', { params }),
  getById: (id) => api.get(`/folders/${id}`),
  create: (data) => api.post('/folders', data),
  update: (id, data) => api.put(`/folders/${id}`, data),
  delete: (id) => api.delete(`/folders/${id}`),
  getShareLink: (shareLink) => api.get(`/folders/share/${shareLink}`),
};

// Activity endpoints
export const activityAPI = {
  getAll: (params = {}) => api.get('/activity', { params }),
  getStats: (params = {}) => api.get('/activity/stats', { params }),
  clear: (days) => api.delete('/activity/clear', { data: { days } }),
};

export default api;
