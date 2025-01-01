import { Navigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

interface IAuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: IAuthGuardProps) => {
  const [cookies] = useCookies(['token']);

  if (!cookies.token) {
    return <Navigate to="/login" />;
  }

  return children;
};
