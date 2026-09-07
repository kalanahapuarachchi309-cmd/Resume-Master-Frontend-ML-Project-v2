import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if not already there
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Admin Users endpoints
export const usersAPI = {
  getAll: (skip = 0, limit = 50) => api.get(`/users?skip=${skip}&limit=${limit}`),
  getById: (id) => api.get(`/users/${id}`),
};

// Jobs endpoints
export const jobsAPI = {
  getAll: (skip = 0, limit = 50) => api.get(`/jobs?skip=${skip}&limit=${limit}`),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (jobData) => api.post('/jobs', jobData),
  update: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  delete: (id) => api.delete(`/jobs/${id}`),
};

// Resumes endpoints
export const resumesAPI = {
  upload: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadBulk: (formData) => api.post('/resumes/upload-bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadBatch: (formData) => api.post('/resumes/upload-batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (skip = 0, limit = 300) => api.get(`/resumes?skip=${skip}&limit=${limit}`),
  getById: (id) => api.get(`/resumes/${id}`),
  syncCloudinary: () => api.post('/resumes/sync-cloudinary'),
};

// Matching & ML Evaluation endpoints
export const matchingAPI = {
  evaluate: (jobId, resumeIds = null, topN = null) => {
    const query = topN ? `?top_n=${topN}` : '';
    return api.post(`/matching/job/${jobId}/evaluate${query}`, { job_id: Number(jobId), resume_ids: resumeIds });
  },
  getRankings: (jobId, topN = null) => {
    const query = topN ? `?top_n=${topN}` : '';
    return api.get(`/matching/job/${jobId}/rankings${query}`);
  },
};

export default api;
