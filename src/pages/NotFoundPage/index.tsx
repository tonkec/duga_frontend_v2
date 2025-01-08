import { useCookies } from 'react-cookie';
import { Navigate } from 'react-router';
import AppLayout from '../../components/AppLayout';

const NotFoundPage = () => {
  const [cookies] = useCookies(['token']);

  if (!cookies.token) {
    return <Navigate to="/login" />;
  }

  return (
    <AppLayout>
      <h1>404</h1>
      <p>Stranica ne postoji</p>
    </AppLayout>
  );
};

export default NotFoundPage;
