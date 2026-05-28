import {
  clearAppSessionCredentials,
  clearAppSessionRevoked,
  consumeAppSessionRevokedNotice,
  isAppSessionConflictError,
  isAppSessionRevoked,
  markSessionRevoked,
  SESSION_REVOKED_EVENT,
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

    clearAppSessionCredentials();

    expect(localStorage.getItem('dugaSessionId')).toBeNull();
    expect(sessionStorage.getItem('dugaApiToken')).toBeNull();
  });

  it('clears app session credentials when the session is revoked', () => {
    localStorage.setItem('dugaSessionId', 'stale-session-id');
    sessionStorage.setItem('dugaApiToken', 'stale-api-token');

    markSessionRevoked();

    expect(localStorage.getItem('dugaSessionId')).toBeNull();
    expect(sessionStorage.getItem('dugaApiToken')).toBeNull();
  });

  it('does not treat missing errors as session conflicts', () => {
    expect(isAppSessionConflictError(undefined)).toBe(false);
  });
});
