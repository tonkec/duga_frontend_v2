import axios, { AxiosInstance } from 'axios';
import { resolveAccessToken } from './authToken';
import { getAppSessionId, SESSION_HEADER } from './appSession';
import { handleGlobalApiError } from './globalErrorHandler';
import { getEnv } from '@app/configs/env';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalErrorHandler?: boolean;
  }
}

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
    baseURL: getEnv('VITE_BASE_URL'),
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
      config.headers[SESSION_HEADER] = getAppSessionId();
      return config;
    },
    (error) => Promise.reject(error)
  );
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      handleGlobalApiError(error);
      return Promise.reject(error);
    }
  );

  return instance;
};
