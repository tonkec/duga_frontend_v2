import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Loader from '@app/components/Loader';
import { useAppSessionStatus } from '@app/context/AppSessionContext';
import { useCurrentBackendUser } from '@app/hooks/useEnsureBackendUser';

interface IAuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: IAuthGuardProps) => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const appSessionStatus = useAppSessionStatus();
  const shouldLoadBackendUser = isAuthenticated && appSessionStatus === 'active';
  const { data: backendUser, isLoading: isBackendUserLoading } = useCurrentBackendUser({
    enabled: shouldLoadBackendUser,
  });
  const isUserVerified = Boolean(user?.email_verified || backendUser?.isVerified);

  if (isLoading) return <Loader />;

  if (isAuthenticated && appSessionStatus === 'loading') return <Loader />;

  if (isAuthenticated && appSessionStatus !== 'active') {
    return <Navigate to="/login" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (shouldLoadBackendUser && isBackendUserLoading) return <Loader />;

  if (!isUserVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};
