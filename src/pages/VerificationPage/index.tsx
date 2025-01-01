import { useSearchParams } from 'react-router';
import { useVerifyOnSignupToken } from './hooks';
import { useEffect } from 'react';
import AuthLayout from '../../components/AuthLayout';

const VerificationPage = () => {
  const { mutateVerifyOnSignupToken, isVerifyOnSignupTokenSuccess, isPendingVerifyOnSignupToken } =
    useVerifyOnSignupToken();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token && email) {
      mutateVerifyOnSignupToken({ email, token });
    }
  }, [token, email, mutateVerifyOnSignupToken]);

  const message = isVerifyOnSignupTokenSuccess
    ? 'Uspješno ste verificirali račun'
    : 'Greška! Probaj opet';

  return (
    <AuthLayout>
      <div className="text-center">
        <h1 className="text-3xl text-white">Verifikacija</h1>
        <p className="text-white">
          {isPendingVerifyOnSignupToken ? 'Verificiranje računa' : message}
        </p>
      </div>
    </AuthLayout>
  );
};

export default VerificationPage;
