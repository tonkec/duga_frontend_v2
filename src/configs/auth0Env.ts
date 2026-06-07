import { EnvKey, getEnv, getEnvFlag } from '@app/configs/env';

type Auth0EnvConfig = {
  audience: string | undefined;
  clientId: string | undefined;
  domain: string | undefined;
  redirectUri: string | undefined;
};

type Auth0EnvKeys = {
  audience: EnvKey;
  clientId: EnvKey;
  domain: EnvKey;
  redirectUri: EnvKey;
};

const productionAuth0EnvKeys: Auth0EnvKeys = {
  audience: 'VITE_AUTH0_PRODUCTION_AUDIENCE',
  clientId: 'VITE_AUTH0_PRODUCTION_CLIENT_ID',
  domain: 'VITE_AUTH0_PRODUCTION_DOMAIN',
  redirectUri: 'VITE_AUTH0_PRODUCTION_CALLBACK_URL',
};

const stagingAuth0EnvKeys: Auth0EnvKeys = {
  audience: 'VITE_AUTH0_STAGING_AUDIENCE',
  clientId: 'VITE_AUTH0_STAGING_CLIENT_ID',
  domain: 'VITE_AUTH0_STAGING_DOMAIN',
  redirectUri: 'VITE_AUTH0_STAGING_CALLBACK_URL',
};

const resolveAuth0EnvKeys = () => {
  if (getEnvFlag('STAGING')) return stagingAuth0EnvKeys;

  return productionAuth0EnvKeys;
};

export const getAuth0Config = (): Auth0EnvConfig => {
  const keys = resolveAuth0EnvKeys();

  return {
    audience: getEnv(keys.audience),
    clientId: getEnv(keys.clientId),
    domain: getEnv(keys.domain),
    redirectUri: getEnv(keys.redirectUri),
  };
};

export const getAuth0Audience = () => getAuth0Config().audience;
