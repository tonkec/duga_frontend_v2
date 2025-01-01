import { toast } from 'react-toastify';
import { verifyOnSignupToken } from '../../../api/auth/verifyOnSignupToken';
import { useMutation } from '@tanstack/react-query';
import { toastConfig } from '../../../configs/toast.config';
interface IVerifyOnSignupProps {
  email: string;
  token: string;
}
function useVerifyOnSignupToken() {
  const {
    mutate: mutateVerifyOnSignupToken,
    isPending: isPendingVerifyOnSignupToken,
    isError: isVerifyOnSignupTokenError,
    isSuccess: isVerifyOnSignupTokenSuccess,
  } = useMutation({
    mutationFn: ({ email, token }: IVerifyOnSignupProps) => verifyOnSignupToken({ email, token }),
    onSuccess: () => {
      toast.success('Uspješno ste verificirali račun', toastConfig);
    },
    onError: () => {
      toast.error('Greška! Probaj opet.', toastConfig);
    },
  });

  return {
    mutateVerifyOnSignupToken,
    isPendingVerifyOnSignupToken,
    isVerifyOnSignupTokenError,
    isVerifyOnSignupTokenSuccess,
  };
}

export { useVerifyOnSignupToken };
