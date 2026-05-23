import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import Loader from '@app/components/Loader';
import { useAppSessionStatus } from '@app/context/AppSessionContext';

interface IAuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: IAuthGuardProps) => {
  const [, setCookie] = useCookies(['token']);
  const { isAuthenticated, getAccessTokenSilently, isLoading, user } = useAuth0();
  const appSessionStatus = useAppSessionStatus();
  const isUserVerified = user?.email_verified;

  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      })
        .then((token) => {
          setCookie('token', token);
        })
        .catch((error) => {
          console.error('Error getting access token:', error);
        });
    }
  }, [isAuthenticated, getAccessTokenSilently, setCookie, user]);

  if (isLoading) return <Loader />;

  if (isAuthenticated && appSessionStatus === 'loading') return <Loader />;

  if (isAuthenticated && appSessionStatus !== 'active') {
    return <Navigate to="/login" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isUserVerified) {
    return <Navigate to="/verify-email " />;
  }

  return children;
};
