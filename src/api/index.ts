import axios, { AxiosInstance } from 'axios';
import { getErrorMessage } from '@app/utils/getErrorMessage';

export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

/**
 * Creates an Axios instance with optional auth token support.
 *
 * @param token Optional access token (e.g., from Auth0).
 */
export const apiClient = (token?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: (s) => s >= 200 && s < 300,
  });

  instance.interceptors.request.use(
    (config) => {
      // If token is explicitly passed, use it
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }

      // Otherwise, try cookie-based fallback
      const cookieToken = getCookie('token');
      if (!cookieToken) {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'Not authenticated: token missing' },
          },
        });
      }

      config.headers.Authorization = `Bearer ${cookieToken}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status >= 500) {
        console.error('🔥 Backend error:', error.response);
      }

      if (error.response.status === 404) {
        window.location.href = '/record-not-found';
        return;
      }

      if (error.code === 'ERR_NETWORK') {
        console.error('🚨 Network error: backend down?');
      }

      const errorMessage = getErrorMessage(error);
      if (errorMessage) {
        console.error('API Error:', errorMessage);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
