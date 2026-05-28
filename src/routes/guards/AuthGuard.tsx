import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Loader from '@app/components/Loader';
import { useAppSessionStatus } from '@app/context/AppSessionContext';
import { useCurrentBackendUser } from '@app/hooks/useEnsureBackendUser';
import { isAppSessionConflictError } from '@app/api/appSession';

interface IAuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: IAuthGuardProps) => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const appSessionStatus = useAppSessionStatus();
  const shouldLoadBackendUser = appSessionStatus === 'active';
  const {
    data: backendUser,
    error: backendUserError,
    isLoading: isBackendUserLoading,
  } = useCurrentBackendUser({
    enabled: shouldLoadBackendUser,
    requireAuth0: false,
  });
  const hasBackendSession = Boolean(backendUser);
  const isUserVerified = Boolean(user?.email_verified || backendUser?.isVerified);
  const isBackendSessionRevoked = isAppSessionConflictError(backendUserError);

  if (isLoading) return <Loader />;

  if (appSessionStatus === 'loading') return <Loader />;

  if (appSessionStatus !== 'active') {
    return <Navigate to="/login" />;
  }

  if (shouldLoadBackendUser && isBackendUserLoading) return <Loader />;

  if (isBackendSessionRevoked) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthenticated && !hasBackendSession) {
    return <Navigate to="/login" />;
  }

  if (!isUserVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};
