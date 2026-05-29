import {
  clearAppSessionCredentials,
  clearAppSessionRevoked,
  consumeAppSessionRevokedNotice,
  getAppCsrfToken,
  isAppSessionConflictError,
  isAppSessionRevoked,
  markAppSessionLoggedOut,
  markSessionRevoked,
  SESSION_REVOKED_EVENT,
  setAppCsrfToken,
} from './appSession';

describe('appSession state', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('tracks revoked app session state', () => {
    expect(isAppSessionRevoked()).toBe(false);

    markSessionRevoked();

    expect(isAppSessionRevoked()).toBe(true);
  });

  it('clears revoked app session state', () => {
    markSessionRevoked();

    clearAppSessionRevoked();

    expect(isAppSessionRevoked()).toBe(false);
  });

  it('consumes revoked notice once', () => {
    markSessionRevoked();

    expect(consumeAppSessionRevokedNotice()).toBe(true);
    expect(consumeAppSessionRevokedNotice()).toBe(false);
  });

  it('dispatches a session revoked event', () => {
    const onSessionRevoked = jest.fn();
    window.addEventListener(SESSION_REVOKED_EVENT, onSessionRevoked);

    markSessionRevoked();

    expect(onSessionRevoked).toHaveBeenCalledTimes(1);

    window.removeEventListener(SESSION_REVOKED_EVENT, onSessionRevoked);
  });

  it('clears stale app session credentials', () => {
    localStorage.setItem('dugaSessionId', 'stale-session-id');
    sessionStorage.setItem('dugaApiToken', 'stale-api-token');
    sessionStorage.setItem('dugaCsrfToken', 'stale-csrf-token');
    sessionStorage.setItem('dugaAuth0AccessToken', 'stale-auth0-access-token');

    clearAppSessionCredentials();

    expect(localStorage.getItem('dugaSessionId')).toBeNull();
    expect(sessionStorage.getItem('dugaApiToken')).toBeNull();
    expect(sessionStorage.getItem('dugaCsrfToken')).toBeNull();
    expect(sessionStorage.getItem('dugaAuth0AccessToken')).toBeNull();
  });

  it('stores the CSRF token for the current browser session', () => {
    setAppCsrfToken('csrf-token');

    expect(getAppCsrfToken()).toBe('csrf-token');
  });

  it('clears app session credentials when the session is revoked', () => {
    localStorage.setItem('dugaSessionId', 'stale-session-id');
    sessionStorage.setItem('dugaApiToken', 'stale-api-token');
    sessionStorage.setItem('dugaCsrfToken', 'stale-csrf-token');
    sessionStorage.setItem('dugaAuth0AccessToken', 'stale-auth0-access-token');

    markSessionRevoked();

    expect(localStorage.getItem('dugaSessionId')).toBeNull();
    expect(sessionStorage.getItem('dugaApiToken')).toBeNull();
    expect(sessionStorage.getItem('dugaCsrfToken')).toBeNull();
    expect(sessionStorage.getItem('dugaAuth0AccessToken')).toBeNull();
  });

  it('marks a normal logout as inactive without showing a revoked notice', () => {
    markAppSessionLoggedOut();

    expect(isAppSessionRevoked()).toBe(true);
    expect(consumeAppSessionRevokedNotice()).toBe(false);
  });

  it('does not treat missing errors as session conflicts', () => {
    expect(isAppSessionConflictError(undefined)).toBe(false);
  });
});
