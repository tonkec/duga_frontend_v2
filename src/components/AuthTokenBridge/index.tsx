import { useLayoutEffect, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useCookies } from 'react-cookie';
import { clearAccessTokenGetter, setAccessTokenGetter } from '@app/api/authToken';

const AuthTokenBridge = ({ children }: { children: ReactNode }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [, setCookie] = useCookies(['token']);

  useLayoutEffect(() => {
    if (!isAuthenticated) {
      clearAccessTokenGetter();
      return;
    }

    setAccessTokenGetter(async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      setCookie('token', token);
      return token;
    });

    return () => {
      clearAccessTokenGetter();
    };
  }, [isAuthenticated, getAccessTokenSilently, setCookie]);

  return <>{children}</>;
};

export default AuthTokenBridge;
