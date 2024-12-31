import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { forgotPassword } from '../../../api/auth/forgotPassword';

interface IForgotPasswordProps {
  email: string;
}

function useForgotPassword() {
  const navigate = useNavigate();

  const {
    mutate: mutateForgotPassword,
    isPending: isPendingForgotPassword,
    isError: isForgotPasswordError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ email }: IForgotPasswordProps) => forgotPassword(email),
    onSuccess: () => {
      toast.success('Email s uputama je poslan', toastConfig);
      navigate('/login');
    },
    onError: () => {
      toast.error('Greška! Probaj opet.', toastConfig);
    },
  });

  return {
    mutateForgotPassword,
    isPendingForgotPassword,
    isForgotPasswordError,
    isSuccess,
  };
}

export { useForgotPassword };
