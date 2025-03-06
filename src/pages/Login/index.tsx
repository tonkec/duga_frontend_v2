import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import { useAuth0 } from '@auth0/auth0-react';

const IS_STAGING = import.meta.env.STAGING;
const URL = IS_STAGING ? 'https://dugastaging.netlify.app' : 'http://localhost:5173';

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();

  console.log('URL', URL);

  return (
    <AuthLayout>
      <form>
        <h1 className="text-center text-white mb-1">Duga.</h1>
        <p className="text-center text-white mb-6">Pronađi zanimljivu osobicu.</p>
        <Button
          className="w-full mt-2 py-4 rounded-xl"
          type="primary"
          onClick={() => {
            loginWithRedirect({
              authorizationParams: {
                redirect_uri: URL,
              },
            });
          }}
        >
          Prijavi se
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
