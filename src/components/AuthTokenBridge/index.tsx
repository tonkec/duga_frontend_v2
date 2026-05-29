import { useLayoutEffect, ReactNode, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { clearAccessTokenGetter, setAccessTokenGetter } from '@app/api/authToken';
import { AUTH0_IDENTITY_SCOPE } from '@app/Auth0ProviderWithNavigate';
import { getEnv } from '@app/configs/env';

const AuthTokenBridge = ({ children }: { children: ReactNode }) => {
  const { getAccessTokenSilently, isLoading } = useAuth0();
  const [isTokenGetterReady, setIsTokenGetterReady] = useState(false);

  useLayoutEffect(() => {
    setIsTokenGetterReady(false);

    if (isLoading) {
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
    setIsTokenGetterReady(true);

    return () => {
      clearAccessTokenGetter();
      setIsTokenGetterReady(false);
    };
  }, [isLoading, getAccessTokenSilently]);

  if (isLoading || !isTokenGetterReady) {
    return null;
  }

  return <>{children}</>;
};

export default AuthTokenBridge;
