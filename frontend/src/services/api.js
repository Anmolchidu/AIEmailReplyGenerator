import axios from 'axios';

const BASE = 'http://127.0.0.1:8000/api';

const api = axios.create({ baseURL: BASE, timeout: 60000 });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(BASE + '/auth/refresh/', { refresh });
          localStorage.setItem('access', data.access);
          original.headers.Authorization = 'Bearer ' + data.access;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const register = (data) => api.post('/auth/register/', data);
export const login = (data) => api.post('/auth/login/', data);
export const getProfile = () => api.get('/auth/profile/');
export const updateProfile = (data) => api.patch('/auth/profile/', data);
export const generateReply = (data) => api.post('/generate-reply/', data);
export const sendEmail = (data) => api.post('/send-email/', data);
export const getConversations = () => api.get('/conversations/');
export const createConversation = (data) => api.post('/conversations/', data);
export const getConversation = (id) => api.get('/conversations/' + id + '/');
export const deleteConversation = (id) => api.delete('/conversations/' + id + '/');
export const getDrafts = () => api.get('/drafts/');
export const saveDraft = (data) => api.post('/drafts/', data);
export const updateDraft = (id, data) => api.patch('/drafts/' + id + '/', data);
export const deleteDraft = (id) => api.delete('/drafts/' + id + '/');
export const getHistory = () => api.get('/history/');
