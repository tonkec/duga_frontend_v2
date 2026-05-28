import { useNavigate } from 'react-router';
import { Auth0Context, Auth0Provider } from '@auth0/auth0-react';
import { ReactNode, useMemo, useState } from 'react';
import { getEnv } from '@app/configs/env';

type AppState = {
  returnTo?: string;
  [key: string]: string | undefined;
};

type CypressWindow = Window &
  typeof globalThis & {
    Cypress?: unknown;
    __dugaCypressAuthUser?: ReturnType<typeof createCypressUser>;
  };

const CYPRESS_AUTH_USER_KEY = 'duga:cypress-auth-user';
const DEFAULT_AUTH_REDIRECT_PATH = '/';
export const AUTH0_IDENTITY_SCOPE = 'openid profile email';
export const getSafeAuthReturnTo = (returnTo: string | undefined, fallbackPath: string) => {
  if (!returnTo) return fallbackPath || DEFAULT_AUTH_REDIRECT_PATH;
  if (!returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.includes('\\')) {
    return DEFAULT_AUTH_REDIRECT_PATH;
  }

  return returnTo;
};

const createCypressUser = () => ({
  sub: 'auth0|cypress-signup-user',
  email: `cypress-signup-${Date.now()}@example.com`,
  email_verified: true,
  name: 'Cypress Signup User',
});

const getStoredCypressUser = () => {
  const cypressUser = (window as CypressWindow).__dugaCypressAuthUser;
  if (cypressUser) return cypressUser;

  const rawUser = window.localStorage.getItem(CYPRESS_AUTH_USER_KEY);
  return rawUser ? JSON.parse(rawUser) : null;
};

const CypressAuth0Provider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredCypressUser);
  const currentUser = user ?? getStoredCypressUser();

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(currentUser),
      isLoading: false,
      user: currentUser ?? undefined,
      error: undefined,
      getAccessTokenSilently: async () => 'cypress-access-token',
      getAccessTokenWithPopup: async () => 'cypress-access-token',
      getIdTokenClaims: async () => undefined,
      loginWithPopup: async () => undefined,
      loginWithRedirect: async () => {
        const nextUser = getStoredCypressUser() ?? createCypressUser();
        window.localStorage.setItem(CYPRESS_AUTH_USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
        navigate('/post-login');
      },
      handleRedirectCallback: async () => ({ appState: {} }),
      logout: () => {
        window.localStorage.removeItem(CYPRESS_AUTH_USER_KEY);
        setUser(null);
        navigate('/login');
      },
    }),
    [currentUser, navigate]
  );

  return <Auth0Context.Provider value={value as never}>{children}</Auth0Context.Provider>;
};

export const Auth0ProviderWithNavigate = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  if ((window as CypressWindow).Cypress) {
    return <CypressAuth0Provider>{children}</CypressAuth0Provider>;
  }

  const domain = getEnv('VITE_AUTH0_DOMAIN');
  const clientId = getEnv('VITE_AUTH0_CLIENT_ID');
  const redirectUri = getEnv('VITE_AUTH0_CALLBACK_URL');

  const onRedirectCallback = (appState: AppState | undefined) => {
    navigate(getSafeAuthReturnTo(appState?.returnTo, window.location.pathname));
  };

  if (!(domain && clientId && redirectUri)) {
    return <p>Configuration for auth0 is missing!</p>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: getEnv('VITE_AUTH0_AUDIENCE'),
        scope: AUTH0_IDENTITY_SCOPE,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};
