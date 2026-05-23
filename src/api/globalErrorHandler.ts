import {
  isSessionConflictCode,
  markSessionRevoked,
  SESSION_REVOKED_CODE,
  SESSION_CONFLICT_CODE,
} from './appSession';

type ApiError = {
  config?: {
    skipGlobalErrorHandler?: boolean;
  };
  response?: {
    status?: number;
    data?: {
      code?: unknown;
    };
  };
  code?: string;
};

const ERROR_ROUTES = ['/broken', '/record-not-found', '/network-error'];

/** Clears only the app API token cookie — never Auth0 session storage. */
const clearAllAuthData = () => {
  document.cookie = `token=;expires=${new Date(0).toUTCString()};path=/`;
};

export const handleGlobalApiError = (error: ApiError) => {
  const cfg = error.config || {};

  if (cfg.skipGlobalErrorHandler) {
    return;
  }

  const here = window.location.pathname;
  const alreadyOnErrorRoute = ERROR_ROUTES.includes(here);

  if (alreadyOnErrorRoute) {
    return;
  }

  if (error.response?.status === 401 && isSessionConflictCode(error.response.data?.code)) {
    clearAllAuthData();
    markSessionRevoked();
    return;
  }

  if (error.response?.status && error.response.status >= 500) {
    window.location.replace('/broken');
    return;
  }

  if (error.response?.status === 404) {
    window.location.replace('/record-not-found');
    return;
  }

  if (error.code === 'ERR_NETWORK') {
    clearAllAuthData();
    window.location.replace('/network-error');
  }
};

export { SESSION_REVOKED_CODE, SESSION_CONFLICT_CODE };
