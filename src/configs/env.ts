export type EnvKey =
  | 'VITE_AUTH0_AUDIENCE'
  | 'VITE_AUTH0_CALLBACK_URL'
  | 'VITE_AUTH0_CLIENT_ID'
  | 'VITE_AUTH0_DOMAIN'
  | 'VITE_BASE_URL'
  | 'VITE_GIPHY_API_KEY'
  | 'VITE_S3_ENVIRONMENT'
  | 'VITE_YOUTUBE_API_KEY';

export const getEnv = (key: EnvKey) => import.meta.env[key] as string | undefined;
