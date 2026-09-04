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
  
  // Nếu là Data URL (Base64) - đã được nhúng trực tiếp, an toàn tuyệt đối
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  const backendBase = getBackendBaseUrl();

  // Nếu là relative path /static/... hoặc static/...
  if (trimmed.startsWith('/static/')) {
    return `${backendBase}${trimmed}`;
  }
  if (trimmed.startsWith('static/')) {
    return `${backendBase}/${trimmed}`;
  }
  
  // Nếu url ảnh cũ bị hardcode localhost:8000 nhưng đang kết nối server deploy
  if (trimmed.includes('localhost:8000/static/') && !backendBase.includes('localhost:8000')) {
    return trimmed.replace(/https?:\/\/localhost:8000/, backendBase);
  }
  
  return trimmed;
};

/**
 * Nén ảnh trước khi upload để tăng tốc độ tải, tránh lỗi vượt quá dung lượng (413 Payload Too Large)
 * và tối ưu bộ nhớ.
 */
export const compressImageFile = (file, maxWidth = 1600, quality = 0.82) => {
  return new Promise((resolve) => {
    // Nếu không phải ảnh (hoặc là svg/gif) thì giữ nguyên
    if (!file || !file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
      return resolve(file);
    }

    // Nếu ảnh quá nhỏ (< 150KB) thì không cần nén
    if (file.size <= 150 * 1024) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export const uploadImage = async (file) => {
  // Nén ảnh trước khi gửi đi
  const optimizedFile = await compressImageFile(file);
  const formData = new FormData();
  formData.append('file', optimizedFile);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadImages = async (fileList) => {
  const filesArray = Array.isArray(fileList) ? fileList : Array.from(fileList || []);
  if (filesArray.length === 0) return { urls: [], url: '' };

  // Tải đồng thời tất cả các ảnh lên backend bằng Promise.all
  const uploadPromises = filesArray.map((file) => uploadImage(file));
  const results = await Promise.all(uploadPromises);

  const urls = results.map((res) => res?.url).filter(Boolean);
  return {
    urls,
    url: urls[0] || '',
  };
};

export default api;




