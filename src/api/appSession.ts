import { clearDugaApiToken } from './authToken';

const SESSION_ID_KEY = 'dugaSessionId';
const SESSION_REVOKED_KEY = 'dugaSessionRevoked';
const SESSION_REVOKED_NOTICE_KEY = 'dugaSessionRevokedNotice';

export const SESSION_REVOKED_EVENT = 'duga:session-revoked';
export const SESSION_REVOKED_CODE = 'SESSION_REVOKED';
export const SESSION_CONFLICT_CODE = 'SESSION_CONFLICT';
export const SESSION_HEADER = 'x-duga-session-id';

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getAppSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = createSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
};

export const clearAppSessionId = () => {
  localStorage.removeItem(SESSION_ID_KEY);
  clearDugaApiToken();
};

export const clearAppSessionRevoked = () => {
  sessionStorage.removeItem(SESSION_REVOKED_KEY);
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
  sessionStorage.setItem(SESSION_REVOKED_KEY, 'true');
  sessionStorage.setItem(SESSION_REVOKED_NOTICE_KEY, 'true');
  clearAppSessionId();
  window.dispatchEvent(new Event(SESSION_REVOKED_EVENT));
};
