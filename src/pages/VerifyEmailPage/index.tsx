import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useNavigate } from 'react-router';
import AuthLayout from '@app/components/AuthLayout';
import Button from '@app/components/Button';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { useState } from 'react';
import { useEnsureBackendUser } from '@app/hooks/useEnsureBackendUser';
import { apiClient } from '@app/api';
import Loader from '@app/components/Loader';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [isSending, setIsSending] = useState(false);
  const { data: currentUser, isLoading: isBackendUserLoading } = useEnsureBackendUser({
    enabled: Boolean(user && !user.email_verified),
  });
  const isUserVerified = Boolean(user?.email_verified || currentUser?.isVerified);

  const resendVerificationEmail = async () => {
    if (!currentUser?.id) {
      toast.error('Došlo je do greške prilikom slanja e-maila.', toastConfig);
      return;
    }

    setIsSending(true);
    try {
      await apiClient().post('/send-verification-email', { userId: currentUser.id });
      toast.success('E-mail je uspješno poslan.', toastConfig);
    } catch (error) {
      toast.error('Došlo je do greške prilikom slanja e-maila.', toastConfig);
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading || (user && !user.email_verified && isBackendUserLoading)) {
    return <Loader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (isUserVerified) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout>
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue/10 text-3xl shadow-sm">
        ✉️
      </div>

      <div className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue">Još jedan korak</p>
        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-blue-dark">
          Potvrdi svoju e-mail adresu
        </h1>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          Poslali smo link za potvrdu na tvoj e-mail. Nakon potvrde se vrati u Dugu i nastavi s
          korištenjem aplikacije.
        </p>
        {user.email && (
          <p className="mt-4 rounded-2xl bg-[#f7f9ff] px-4 py-3 text-sm font-semibold text-blue">
            {user.email}
          </p>
        )}
      </div>

      <Button
        type="primary"
        className="mt-8 w-full !rounded-full !py-4 font-bold shadow-lg"
        onClick={() => navigate('/login')}
      >
        Natrag na login
      </Button>

      <Button
        type="secondary"
        className="mt-3 w-full !rounded-full !py-4 font-bold shadow-sm"
        onClick={resendVerificationEmail}
        disabled={isSending || isBackendUserLoading || !currentUser?.id}
      >
        {isSending ? 'Šaljem...' : 'Ponovno pošalji e-mail'}
      </Button>

      <p className="mt-5 text-center text-xs leading-5 text-gray-500">
        Ne vidiš poruku? Provjeri spam ili promocije u inboxu.
      </p>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
