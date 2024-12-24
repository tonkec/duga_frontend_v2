import { Navigate } from 'react-router-dom';
import { useLocalStorage } from '@uidotdev/usehooks';

interface IAuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: IAuthGuardProps) => {
  const [isLoggedIn] = useLocalStorage('token');

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
};
