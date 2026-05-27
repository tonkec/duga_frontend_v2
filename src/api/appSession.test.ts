import { clearAppSessionId, getAppSessionId, setAppSessionId } from './appSession';
import { clearDugaApiToken } from './authToken';

describe('appSession storage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearDugaApiToken();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    clearDugaApiToken();
  });

  it('does not generate or reuse browser-created localStorage session ids', () => {
    localStorage.setItem('dugaSessionId', 'browser-generated-session-id');

    expect(getAppSessionId()).toBeNull();
    expect(localStorage.getItem('dugaSessionId')).toBeNull();
  });

  it('stores and reads only server-issued session ids from sessionStorage', () => {
    setAppSessionId('server-issued-session-id');

    expect(getAppSessionId()).toBe('server-issued-session-id');
    expect(sessionStorage.getItem('dugaSessionId')).toBe('server-issued-session-id');
    expect(localStorage.getItem('dugaSessionId')).toBeNull();
  });

  it('clears session ids from both legacy and current storage', () => {
    localStorage.setItem('dugaSessionId', 'legacy-session-id');
    sessionStorage.setItem('dugaSessionId', 'server-issued-session-id');

    clearAppSessionId();

    expect(localStorage.getItem('dugaSessionId')).toBeNull();
    expect(sessionStorage.getItem('dugaSessionId')).toBeNull();
  });
});
