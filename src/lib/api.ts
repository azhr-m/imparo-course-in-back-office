import axios from 'axios';
import i18n from '../i18n';

export const API_BASE_URL = 'https://course-in-api.mytextbook.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Set Accept-Language matching selected language
  const lang = i18n.language || 'bg';
  config.headers['Accept-Language'] = lang;
  
  return config;
});

export default api;
