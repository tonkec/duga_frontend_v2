type EnvKey =
  | 'VITE_AUTH0_AUDIENCE'
  | 'VITE_AUTH0_CALLBACK_URL'
  | 'VITE_AUTH0_CLIENT_ID'
  | 'VITE_AUTH0_DOMAIN'
  | 'VITE_AUTH0_PRODUCTION_AUDIENCE'
  | 'VITE_AUTH0_PRODUCTION_CALLBACK_URL'
  | 'VITE_AUTH0_PRODUCTION_CLIENT_ID'
  | 'VITE_AUTH0_PRODUCTION_DOMAIN'
  | 'VITE_AUTH0_STAGING_AUDIENCE'
  | 'VITE_AUTH0_STAGING_CALLBACK_URL'
  | 'VITE_AUTH0_STAGING_CLIENT_ID'
  | 'VITE_AUTH0_STAGING_DOMAIN'
  | 'VITE_BASE_URL'
  | 'VITE_GIPHY_API_KEY'
  | 'VITE_S3_ENVIRONMENT'
  | 'VITE_YOUTUBE_API_KEY';

type EnvFlagKey = 'PRODUCTION' | 'STAGING';

const testEnv: Partial<Record<EnvKey, string>> = {
  VITE_AUTH0_AUDIENCE: 'test-auth0-audience',
  VITE_AUTH0_CALLBACK_URL: 'http://localhost/callback',
  VITE_AUTH0_CLIENT_ID: 'test-auth0-client-id',
  VITE_AUTH0_DOMAIN: 'test.auth0.com',
  VITE_AUTH0_PRODUCTION_AUDIENCE: 'test-production-auth0-audience',
  VITE_AUTH0_PRODUCTION_CALLBACK_URL: 'http://production.localhost/callback',
  VITE_AUTH0_PRODUCTION_CLIENT_ID: 'test-production-auth0-client-id',
  VITE_AUTH0_PRODUCTION_DOMAIN: 'production.test.auth0.com',
  VITE_AUTH0_STAGING_AUDIENCE: 'test-staging-auth0-audience',
  VITE_AUTH0_STAGING_CALLBACK_URL: 'http://staging.localhost/callback',
  VITE_AUTH0_STAGING_CLIENT_ID: 'test-staging-auth0-client-id',
  VITE_AUTH0_STAGING_DOMAIN: 'staging.test.auth0.com',
  VITE_BASE_URL: 'http://localhost/api',
  VITE_GIPHY_API_KEY: 'test-giphy-api-key',
  VITE_S3_ENVIRONMENT: 'test',
  VITE_YOUTUBE_API_KEY: 'test-youtube-api-key',
};

const testEnvFlags: Record<EnvFlagKey, boolean> = {
  PRODUCTION: false,
  STAGING: false,
};

export const getEnv = (key: EnvKey) => testEnv[key];

export const getEnvFlag = (key: EnvFlagKey) => testEnvFlags[key];

export const setTestEnvFlag = (key: EnvFlagKey, value: boolean) => {
  testEnvFlags[key] = value;
};

export const resetTestEnvFlags = () => {
  testEnvFlags.PRODUCTION = false;
  testEnvFlags.STAGING = false;
};
