import { useLayoutEffect, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { clearAccessTokenGetter, setAccessTokenGetter } from '@app/api/authToken';
import { AUTH0_IDENTITY_SCOPE } from '@app/Auth0ProviderWithNavigate';
import { getEnv } from '@app/configs/env';

const AuthTokenBridge = ({ children }: { children: ReactNode }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useLayoutEffect(() => {
    if (!isAuthenticated) {
      clearAccessTokenGetter();
      return;
    }

    setAccessTokenGetter(async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: getEnv('VITE_AUTH0_AUDIENCE'),
          scope: AUTH0_IDENTITY_SCOPE,
        },
      });
      return token;
    });

    return () => {
      clearAccessTokenGetter();
    };
  }, [isAuthenticated, getAccessTokenSilently]);

  return <>{children}</>;
};

export default AuthTokenBridge;
