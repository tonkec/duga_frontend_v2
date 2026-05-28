import {
  clearAppSessionRevoked,
  consumeAppSessionRevokedNotice,
  isAppSessionConflictError,
  isAppSessionRevoked,
  markSessionRevoked,
  SESSION_REVOKED_EVENT,
} from './appSession';

describe('appSession state', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
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

  it('does not treat missing errors as session conflicts', () => {
    expect(isAppSessionConflictError(undefined)).toBe(false);
  });
});
