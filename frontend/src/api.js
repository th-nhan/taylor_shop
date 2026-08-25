import axios from 'axios';

let rawUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').trim().replace(/\/+$/, '');
if (!rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl}/api`;
}
const API_BASE_URL = rawUrl;

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

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const sendChatMessage = async (message, userId = null) => {
  const response = await api.post('/chat', { message, user_id: userId });
  return response.data;
};

export const getChatPrompts = async () => {
  const response = await api.get('/chat/prompts');
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

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData);
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

export const getBackendBaseUrl = () => {
  return API_BASE_URL.replace(/\/api$/, '');
};

export const formatImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  const backendBase = getBackendBaseUrl();

  // Nếu là relative path /static/...
  if (trimmed.startsWith('/static/')) {
    return `${backendBase}${trimmed}`;
  }
  
  // Nếu url ảnh cũ bị hardcode localhost:8000 nhưng đang kết nối server deploy
  if (trimmed.includes('localhost:8000/static/') && !backendBase.includes('localhost:8000')) {
    return trimmed.replace(/https?:\/\/localhost:8000/, backendBase);
  }
  
  return trimmed;
};

export const uploadImages = async (fileList) => {
  const formData = new FormData();
  const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList || []);
  filesArray.forEach((file) => {
    formData.append('files', file);
  });
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadImage = async (file) => {
  return uploadImages([file]);
};

export default api;



