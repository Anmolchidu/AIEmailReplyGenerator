import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

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
