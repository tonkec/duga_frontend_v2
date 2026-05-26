type EnvKey =
  | 'VITE_AUTH0_AUDIENCE'
  | 'VITE_AUTH0_CALLBACK_URL'
  | 'VITE_AUTH0_CLIENT_ID'
  | 'VITE_AUTH0_DOMAIN'
  | 'VITE_BASE_URL'
  | 'VITE_EMAILJS_PUBLIC_KEY'
  | 'VITE_EMAILJS_SERVICE_ID'
  | 'VITE_EMAILJS_TEMPLATE_ID'
  | 'VITE_GIPHY_API_KEY'
  | 'VITE_S3_ENVIRONMENT'
  | 'VITE_YOUTUBE_API_KEY';

const testEnv: Partial<Record<EnvKey, string>> = {
  VITE_AUTH0_AUDIENCE: 'test-auth0-audience',
  VITE_AUTH0_CALLBACK_URL: 'http://localhost/callback',
  VITE_AUTH0_CLIENT_ID: 'test-auth0-client-id',
  VITE_AUTH0_DOMAIN: 'test.auth0.com',
  VITE_BASE_URL: 'http://localhost/api',
  VITE_EMAILJS_PUBLIC_KEY: 'test-emailjs-public-key',
  VITE_EMAILJS_SERVICE_ID: 'test-emailjs-service-id',
  VITE_EMAILJS_TEMPLATE_ID: 'test-emailjs-template-id',
  VITE_GIPHY_API_KEY: 'test-giphy-api-key',
  VITE_S3_ENVIRONMENT: 'test',
  VITE_YOUTUBE_API_KEY: 'test-youtube-api-key',
};

export const getEnv = (key: EnvKey) => testEnv[key];
