import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';
import { useAuth0 } from '@auth0/auth0-react';
const URL =
  process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging'
    ? 'https://dugastaging.netlify.app'
    : 'http://localhost:5173';

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <AuthLayout>
      <form>
        <h1 className="text-center text-white mb-2">Evo te natrag!</h1>
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
          Ulogiraj se
        </Button>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
