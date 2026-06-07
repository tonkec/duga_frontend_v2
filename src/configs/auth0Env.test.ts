import { getAuth0Config } from '@app/configs/auth0Env';
import { resetTestEnvFlags, setTestEnvFlag } from '@app/test/envMock';

describe('getAuth0Config', () => {
  afterEach(() => {
    resetTestEnvFlags();
  });

  it('uses default Auth0 config when no deploy environment flag is enabled', () => {
    expect(getAuth0Config()).toEqual({
      audience: 'test-auth0-audience',
      clientId: 'test-auth0-client-id',
      domain: 'test.auth0.com',
      redirectUri: 'http://localhost/callback',
    });
  });

  it('uses staging Auth0 config when staging is enabled', () => {
    setTestEnvFlag('STAGING', true);

    expect(getAuth0Config()).toEqual({
      audience: 'test-staging-auth0-audience',
      clientId: 'test-staging-auth0-client-id',
      domain: 'staging.test.auth0.com',
      redirectUri: 'http://staging.localhost/callback',
    });
  });

  it('uses production Auth0 config when production is enabled', () => {
    setTestEnvFlag('PRODUCTION', true);

    expect(getAuth0Config()).toEqual({
      audience: 'test-production-auth0-audience',
      clientId: 'test-production-auth0-client-id',
      domain: 'production.test.auth0.com',
      redirectUri: 'http://production.localhost/callback',
    });
  });
});
