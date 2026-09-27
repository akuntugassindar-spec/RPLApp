import axios from 'axios';

/**
 * Konfigurasi instance Axios untuk komunikasi ke Backend API.
 *
 * REACT_APP_API_URL dapat diisi saat frontend dan backend berjalan pada host
 * berbeda. Jika kosong, request memakai /api agar proxy development atau
 * reverse proxy production yang meneruskan request ke backend.
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Menambahkan token JWT Authorization header jika token tersimpan di localStorage.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Menangani error response global, seperti token kadaluarsa (401 Unauthorized).
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus data autentikasi jika sesi telah habis
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
