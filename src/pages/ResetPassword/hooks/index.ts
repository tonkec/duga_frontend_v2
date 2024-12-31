import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { resetPassword } from '../../../api/auth/resetPassword';
import { verifyToken } from '../../../api/auth/verifyToken';

interface IForgotPasswordProps {
  password: string;
  email: string;
}

interface IVerfiyTokenProps {
  token: string;
  email: string;
}

function useVerifyToken() {
  const {
    mutate: mutateVerifyToken,
    isPending: isPendingVerifyToken,
    isError: isVerifyTokenError,
    isSuccess: isVerifyTokenSuccess,
  } = useMutation({
    mutationFn: ({ token, email }: IVerfiyTokenProps) => verifyToken(token, email),
    onError: () => {
      toast.error('Greška! Probaj opet.', toastConfig);
    },
  });

  return {
    mutateVerifyToken,
    isPendingVerifyToken,
    isVerifyTokenError,
    isVerifyTokenSuccess,
  };
}

function useResetPassword() {
  const navigate = useNavigate();

  const {
    mutate: mutateResetPassword,
    isPending: isPendingResetPassword,
    isError: isResetPasswordError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ password, email }: IForgotPasswordProps) => resetPassword(password, email),
    onSuccess: (data) => {
      console.log(data);
      toast.success('Lozinka je promijenjena', toastConfig);
      navigate('/login');
    },
    onError: () => {
      toast.error('Greška! Probaj opet.', toastConfig);
    },
  });

  return {
    mutateResetPassword,
    isPendingResetPassword,
    isResetPasswordError,
    isSuccess,
  };
}

export { useResetPassword, useVerifyToken };
