import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import Loader from '../../components/Loader';

interface IAuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: IAuthGuardProps) => {
  const [, setCookie] = useCookies(['token']);
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      })
        .then((token) => {
          setCookie('token', token, { path: '/' });
        })
        .catch((error) => {
          console.error('Error getting access token:', error);
        });
    }
  }, [isAuthenticated, getAccessTokenSilently, setCookie]);

  if (isLoading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};
