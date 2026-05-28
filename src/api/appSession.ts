const SESSION_REVOKED_KEY = 'dugaSessionRevoked';
const SESSION_REVOKED_NOTICE_KEY = 'dugaSessionRevokedNotice';
const APP_SESSION_ID_KEY = 'dugaSessionId';
const APP_SESSION_TOKEN_KEY = 'dugaApiToken';

export const SESSION_REVOKED_EVENT = 'duga:session-revoked';
export const SESSION_REVOKED_CODE = 'SESSION_REVOKED';
export const SESSION_CONFLICT_CODE = 'SESSION_CONFLICT';

export const clearAppSessionRevoked = () => {
  sessionStorage.removeItem(SESSION_REVOKED_KEY);
};

export const clearAppSessionCredentials = () => {
  localStorage.removeItem(APP_SESSION_ID_KEY);
  sessionStorage.removeItem(APP_SESSION_TOKEN_KEY);
};

export const markAppSessionLoggedOut = () => {
  clearAppSessionCredentials();
  sessionStorage.setItem(SESSION_REVOKED_KEY, 'true');
};

export const consumeAppSessionRevokedNotice = () => {
  const shouldShowNotice = sessionStorage.getItem(SESSION_REVOKED_NOTICE_KEY) === 'true';
  sessionStorage.removeItem(SESSION_REVOKED_NOTICE_KEY);
  return shouldShowNotice;
};

export const isAppSessionRevoked = () => sessionStorage.getItem(SESSION_REVOKED_KEY) === 'true';

export const isSessionConflictCode = (code: unknown) =>
  code === SESSION_REVOKED_CODE || code === SESSION_CONFLICT_CODE;

type AppSessionApiError = {
  config?: {
    url?: string;
  };
  response?: {
    status?: number;
    data?: {
      code?: unknown;
    };
  };
};

export const isAppSessionConflictError = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const apiError = error as AppSessionApiError;
  const status = apiError.response?.status;
  const code = apiError.response?.data?.code;

  return (
    isSessionConflictCode(code) ||
    (status === 409 && apiError.config?.url === '/sessions/start') ||
    (status === 401 && isSessionConflictCode(code))
  );
};

export const markSessionRevoked = () => {
  clearAppSessionCredentials();
  sessionStorage.setItem(SESSION_REVOKED_KEY, 'true');
  sessionStorage.setItem(SESSION_REVOKED_NOTICE_KEY, 'true');
  window.dispatchEvent(new Event(SESSION_REVOKED_EVENT));
};
