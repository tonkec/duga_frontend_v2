import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import { useAuth0 } from '@auth0/auth0-react';
import { useCreateUser } from './hooks';
import { useEffect } from 'react';

const LoginPage = () => {
  const { loginWithRedirect, user, isAuthenticated } = useAuth0();
  const { createUser } = useCreateUser();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log(isAuthenticated, 'login page');
      createUser({
        email: user.email || '',
      });
    }
  }, [isAuthenticated, user, createUser]);

  return (
    <AuthLayout>
      <form>
        <h1 className="text-center text-white mb-2">Evo te natrag!</h1>
        <p className="text-center text-white mb-6">Pronađi zanimljivu osobicu.</p>
        <Button
          className="w-full mt-2 py-4 rounded-xl"
          type="primary"
          onClick={() =>
            loginWithRedirect({
              authorizationParams: {
                redirect_uri: window.location.origin,
              },
            })
          }
        >
          Ulogiraj se
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
