import {
  isAppSessionConflictError,
  markSessionRevoked,
  SESSION_REVOKED_CODE,
  SESSION_CONFLICT_CODE,
} from './appSession';

type ApiError = {
  config?: {
    skipGlobalErrorHandler?: boolean;
    url?: string;
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

  if (isAppSessionConflictError(error)) {
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
    window.location.replace('/network-error');
  }
};

export { SESSION_REVOKED_CODE, SESSION_CONFLICT_CODE };
