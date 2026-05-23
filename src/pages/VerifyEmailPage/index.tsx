import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useNavigate } from 'react-router';
import AuthLayout from '@app/components/AuthLayout';
import Button from '@app/components/Button';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { useState } from 'react';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const [isSending, setIsSending] = useState(false);
  const isUserVerified = user?.email_verified;

  const resendVerificationEmail = async () => {
    setIsSending(true);
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
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isUserVerified) {
    return (
      <AuthLayout>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose text-3xl shadow-sm">
          ✉️
        </div>

        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-pink">Još jedan korak</p>
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
          disabled={isSending}
        >
          {isSending ? 'Šaljem...' : 'Ponovno pošalji e-mail'}
        </Button>

        <p className="mt-5 text-center text-xs leading-5 text-gray-500">
          Ne vidiš poruku? Provjeri spam ili promocije u inboxu.
        </p>
      </AuthLayout>
    );
  }

  return <Navigate to="/" />;
};

export default VerifyEmailPage;
