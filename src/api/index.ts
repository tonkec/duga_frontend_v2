import axios from 'axios';
import { getErrorMessage } from '@app/utils/getErrorMessage';

const getCookie = (name: string) => {
  const cookies = document.cookie.split('; ');
  for (let i = 0; i < cookies.length; i++) {
    const [key, value] = cookies[i].split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

const apiClient = (isAuth?: boolean) => {
  const defaultOptions = {
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const instance = axios.create(defaultOptions);
  instance.interceptors.request.use(function (config) {
    if (isAuth) return config;
    const token = getCookie('token');
    const isLoggedIn = !!token;

    if (!isLoggedIn) {
      return Promise.reject({
        response: {
          status: 401,
          data: { message: 'Not authenticated: token missing' },
        },
      });
    }

    config.headers.Authorization = isLoggedIn ? `Bearer ${token}` : '';
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const errorMessage = getErrorMessage(error);
      if (errorMessage) {
        console.error('API Error:', errorMessage);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export { apiClient };
