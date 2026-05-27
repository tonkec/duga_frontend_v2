import { clearAppSessionId } from './appSession';
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

  it('does not reuse browser-created localStorage session ids', () => {
    localStorage.setItem('dugaSessionId', 'browser-generated-session-id');

    clearAppSessionId();

    expect(localStorage.getItem('dugaSessionId')).toBeNull();
  });

  it('does not keep server session ids in sessionStorage', () => {
    sessionStorage.setItem('dugaSessionId', 'server-issued-session-id');

    clearAppSessionId();

    expect(sessionStorage.getItem('dugaSessionId')).toBeNull();
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
