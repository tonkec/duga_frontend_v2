import { handleGlobalApiError, SESSION_CONFLICT_CODE } from './globalErrorHandler';
import { SESSION_REVOKED_EVENT } from './appSession';

const SESSION_REVOKED_KEY = 'dugaSessionRevoked';

describe('global API session conflict handling', () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.pushState({}, '', '/settings');
  });

  it('forces logout when backend returns SESSION_CONFLICT', () => {
    const onSessionRevoked = jest.fn();
    window.addEventListener(SESSION_REVOKED_EVENT, onSessionRevoked);

    handleGlobalApiError({
      response: {
        status: 401,
        data: {
          code: SESSION_CONFLICT_CODE,
        },
      },
    });

    expect(sessionStorage.getItem(SESSION_REVOKED_KEY)).toBe('true');
    expect(onSessionRevoked).toHaveBeenCalledTimes(1);

    window.removeEventListener(SESSION_REVOKED_EVENT, onSessionRevoked);
  });

  it('forces logout when session startup returns a conflict', () => {
    const onSessionRevoked = jest.fn();
    window.addEventListener(SESSION_REVOKED_EVENT, onSessionRevoked);

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
  });
});
