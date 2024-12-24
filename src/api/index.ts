import axios from 'axios';
import { getErrorMessage } from '../utils/getErrorMessage';

const apiClient = ({ isAuth }: { isAuth: boolean }) => {
  const defaultOptions = {
    baseURL: 'http://localhost:8080',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const instance = axios.create(defaultOptions);
  instance.interceptors.request.use(function (config) {
    if (isAuth) return config;
    const isLoggedIn = JSON.parse(localStorage.getItem('token') || '');
    config.headers.Authorization = isLoggedIn ? `Bearer ${isLoggedIn}` : '';
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const errorMessage = getErrorMessage(error);
      if (
        error.response.status === 401 &&
        (errorMessage === 'Invalid token.' || errorMessage.includes('Invalid token.'))
      ) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export { apiClient };
