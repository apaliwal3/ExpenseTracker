import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api',
});

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      // Token is invalid or expired
      if (error.response?.data?.tokenExpired) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Trigger custom event for same-tab detection
        window.dispatchEvent(new Event('logout'));
        // Redirect to login
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;