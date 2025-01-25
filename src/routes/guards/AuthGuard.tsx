import { Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

interface IAuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: IAuthGuardProps) => {
  const { isAuthenticated, error } = useAuth0();
  console.log(error, 'error');
  console.log(isAuthenticated, 'isAuthenticated');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};
