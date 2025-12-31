import axios from 'axios';

// Uses environment variable in production, falls back to localhost for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Updated Articles (LLM-generated)
export const getUpdatedArticles = async () => {
  const response = await api.get('/updated-articles/articles');
  return response.data;
};

export const getUpdatedArticleById = async (id) => {
  const response = await api.get(`/updated-articles/article/${id}`);
  return response.data;
};

// Original Articles (BeyondChats)
export const getOriginalArticles = async () => {
  const response = await api.get('/original-articles/articles');
  return response.data;
};

export const getOriginalArticleById = async (id) => {
  const response = await api.get(`/original-articles/article/${id}`);
  return response.data;
};

export default api;
