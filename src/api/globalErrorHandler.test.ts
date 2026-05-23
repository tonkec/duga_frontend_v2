import { handleGlobalApiError, SESSION_CONFLICT_CODE } from './globalErrorHandler';
import { SESSION_REVOKED_EVENT } from './appSession';

const SESSION_REVOKED_KEY = 'dugaSessionRevoked';
const SESSION_ID_KEY = 'dugaSessionId';

describe('global API session conflict handling', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    window.history.pushState({}, '', '/settings');
  });

  it('forces logout when backend returns SESSION_CONFLICT', () => {
    const onSessionRevoked = jest.fn();
    window.addEventListener(SESSION_REVOKED_EVENT, onSessionRevoked);
    document.cookie = 'token=stale-token;path=/';
    localStorage.setItem(SESSION_ID_KEY, 'existing-session-id');

    handleGlobalApiError({
      response: {
        status: 401,
        data: {
          code: SESSION_CONFLICT_CODE,
        },
      },
    });

    expect(sessionStorage.getItem(SESSION_REVOKED_KEY)).toBe('true');
    expect(localStorage.getItem(SESSION_ID_KEY)).toBeNull();
    expect(document.cookie).not.toContain('token=');
    expect(onSessionRevoked).toHaveBeenCalledTimes(1);

    window.removeEventListener(SESSION_REVOKED_EVENT, onSessionRevoked);
  });

  it('forces logout when session startup returns a conflict', () => {
    const onSessionRevoked = jest.fn();
    window.addEventListener(SESSION_REVOKED_EVENT, onSessionRevoked);
    localStorage.setItem(SESSION_ID_KEY, 'conflicting-session-id');

    handleGlobalApiError({
      config: {
        url: '/sessions/start',
      },
      response: {
        status: 409,
        data: {},
      },
    });

    expect(sessionStorage.getItem(SESSION_REVOKED_KEY)).toBe('true');
    expect(localStorage.getItem(SESSION_ID_KEY)).toBeNull();
    expect(onSessionRevoked).toHaveBeenCalledTimes(1);

    window.removeEventListener(SESSION_REVOKED_EVENT, onSessionRevoked);
  });

  it('does not force logout for unrelated conflict responses', () => {
    handleGlobalApiError({
      config: {
        url: '/users/post-login',
      },
      response: {
        status: 409,
        data: {},
      },
    });

    expect(sessionStorage.getItem(SESSION_REVOKED_KEY)).toBeNull();
  });

  it('does not force logout when global handling is skipped', () => {
    document.cookie = 'token=active-token;path=/';

    handleGlobalApiError({
      config: {
        skipGlobalErrorHandler: true,
      },
      response: {
        status: 401,
        data: {
          code: SESSION_CONFLICT_CODE,
        },
      },
    });

    expect(sessionStorage.getItem(SESSION_REVOKED_KEY)).toBeNull();
    expect(document.cookie).toContain('token=active-token');
  });
});
