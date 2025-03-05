import { useAuth0 } from '@auth0/auth0-react';
import Loader from '../../components/Loader';
import { Navigate, useNavigate } from 'react-router';
import AuthLayout from '../../components/AuthLayout';
import Button from '../../components/Button';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const isUserVerified = user?.email_verified;

  if (!user) {
    return <Loader />;
  }

  if (!isUserVerified) {
    return (
      <AuthLayout>
        <h1 className="text-white"> Molimo te da verificiraš svoj e-mail </h1>
        <p className="text-white mt-2">Ako želiš koristiti aplikaciju, potvrdi svoj e-mail.</p>
        <Button
          type="primary"
          className="w-full mt-4 py-4 rounded-xl"
          onClick={() => {
            navigate('/');
          }}
        >
          Natrag na login
        </Button>
      </AuthLayout>
    );
  }

  return <Navigate to="/" />;
};

export default VerifyEmailPage;
