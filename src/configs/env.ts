export type EnvKey =
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

export type EnvFlagKey = 'PRODUCTION' | 'STAGING';

export const getEnv = (key: EnvKey) => import.meta.env[key] as string | undefined;

export const getEnvFlag = (key: EnvFlagKey) => {
  const env = import.meta.env as unknown as Record<EnvFlagKey, boolean | string | undefined>;
  const value = env[key];

  return value === true || value === 'true';
};
