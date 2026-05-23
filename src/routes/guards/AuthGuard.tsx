import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Loader from '@app/components/Loader';
import { useAppSessionStatus } from '@app/context/AppSessionContext';

interface IAuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: IAuthGuardProps) => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const appSessionStatus = useAppSessionStatus();
  const isUserVerified = user?.email_verified;

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
