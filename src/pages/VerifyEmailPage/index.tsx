import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useNavigate } from 'react-router';
import AuthLayout from '@app/components/AuthLayout';
import Button from '@app/components/Button';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const isUserVerified = user?.email_verified;

  const resendVerificationEmail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/send-verification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.sub }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      if (response.ok) {
        toast.success('E-mail je uspješno poslan.', toastConfig);
      }
    } catch (error) {
      toast.error('Došlo je do greške prilikom slanja e-maila.', toastConfig);
      console.error('Failed to resend verification email:', error);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isUserVerified) {
    return (
      <AuthLayout>
        <h1 className="text-white">Molimo te da verificiraš svoj e-mail</h1>
        <p className="text-white mt-2">Ako želiš koristiti aplikaciju, potvrdi svoj e-mail.</p>

        <Button
          type="primary"
          className="w-full mt-4 py-4 rounded-xl"
          onClick={() => navigate('/login')}
        >
          Natrag na login
        </Button>

        <Button
          type="secondary"
          className="w-full mt-4 py-4 rounded-xl"
          onClick={resendVerificationEmail}
        >
          Pošalji e-mail
        </Button>
      </AuthLayout>
    );
  }

  return <Navigate to="/" />;
};

export default VerifyEmailPage;
