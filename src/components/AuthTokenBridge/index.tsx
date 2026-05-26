import { useLayoutEffect, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { clearAccessTokenGetter, clearTokenCookie, setAccessTokenGetter } from '@app/api/authToken';
import { getEnv } from '@app/configs/env';

const AuthTokenBridge = ({ children }: { children: ReactNode }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useLayoutEffect(() => {
    clearTokenCookie();

    if (!isAuthenticated) {
      clearAccessTokenGetter();
      return;
    }

    setAccessTokenGetter(async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: getEnv('VITE_AUTH0_AUDIENCE'),
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
