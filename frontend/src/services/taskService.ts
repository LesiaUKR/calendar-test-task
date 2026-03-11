import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
});

export default api;
