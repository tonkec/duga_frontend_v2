import axios, { AxiosInstance } from 'axios';
import { handleGlobalApiError } from './globalErrorHandler';
import { getEnv } from '@app/configs/env';
import { getAppCsrfToken } from './appSession';
import { resolveAuth0AccessToken } from './authToken';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalErrorHandler?: boolean;
  }
}

const URL_SCHEME_REGEX = /^[a-z][a-z\d+\-.]*:/i;

const isAbsoluteOrProtocolRelativeUrl = (url: string) => {
  const trimmedUrl = url.trim();
  return URL_SCHEME_REGEX.test(trimmedUrl) || trimmedUrl.startsWith('//');
};

const absoluteUrlRejection = {
  response: {
    status: 400,
    data: { message: 'Absolute API request URLs are not allowed' },
  },
};

const CSRF_COOKIE_NAME = 'duga_csrf';
const CSRF_HEADER = 'x-csrf-token';
const UNSAFE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf('=');
    const key = separatorIndex >= 0 ? cookie.slice(0, separatorIndex) : cookie;
    const value = separatorIndex >= 0 ? cookie.slice(separatorIndex + 1) : '';
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
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: (s) => s >= 200 && s < 300,
  });

  instance.interceptors.request.use(
    async (config) => {
      if (config.url && isAbsoluteOrProtocolRelativeUrl(config.url)) {
        return Promise.reject(absoluteUrlRejection);
      }

      const authToken = token ?? (await resolveAuth0AccessToken());
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }

      const method = config.method?.toLowerCase();
      const csrfToken = getCookie(CSRF_COOKIE_NAME) ?? getAppCsrfToken();
      if (method && UNSAFE_METHODS.has(method) && csrfToken) {
        config.headers[CSRF_HEADER] = csrfToken;
      }

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
