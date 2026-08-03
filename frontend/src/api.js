import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async (category = '') => {
  const params = category && category !== 'Tất cả' ? { category } : {};
  const response = await api.get('/products', { params });
  return response.data;
};

export const sendChatMessage = async (message, userId = null) => {
  const response = await api.post('/chat', { message, user_id: userId });
  return response.data;
};

export const registerUser = async (fullName, phone, password) => {
  const response = await api.post('/auth/register', {
    full_name: fullName,
    phone,
    password,
  });
  return response.data;
};

export const loginUser = async (phone, password) => {
  const response = await api.post('/auth/login', {
    phone,
    password,
  });
  return response.data;
};

export default api;
