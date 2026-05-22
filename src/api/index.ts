import axios, { AxiosInstance } from 'axios';
import { resolveAccessToken } from './authToken';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalErrorHandler?: boolean;
  }
}

/** Clears only the app API token cookie — never Auth0 session storage. */
const clearAllAuthData = () => {
  document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/`;
};

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
    async (config) => {
      const authToken = await resolveAccessToken(token);

      if (!authToken) {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'Not authenticated: token missing' },
          },
        });
      }

      config.headers.Authorization = `Bearer ${authToken}`;
      return config;
    },
    (error) => Promise.reject(error)
  );
  const ERROR_ROUTES = ['/broken', '/record-not-found', '/network-error'];

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const cfg = error.config || {};

      // let certain calls opt out
      if (cfg.skipGlobalErrorHandler) {
        return Promise.reject(error);
      }

      const here = window.location.pathname;
      const alreadyOnErrorRoute = ERROR_ROUTES.includes(here);

      if (!alreadyOnErrorRoute) {
        if (error?.response?.status >= 500) {
          window.location.replace('/broken');
          return Promise.reject(error);
        }
        if (error?.response?.status === 404) {
          window.location.replace('/record-not-found');
          return Promise.reject(error);
        }
        if (error.code === 'ERR_NETWORK') {
          clearAllAuthData();
          window.location.replace('/network-error');
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
