import axios from 'axios';

/**
 * Mendapatkan Base URL backend API secara dinamis.
 * Menghubungkan browser langsung ke port 5000 (Express API) sehingga tidak bergantung
 * pada Webpack dev-server proxy CRA yang rentan masalah ECONNREFUSED di Windows.
 */
const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:5000/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
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
