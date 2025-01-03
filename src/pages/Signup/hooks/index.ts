import { useMutation } from '@tanstack/react-query';
import { register } from '../../../api/auth/register';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { useNavigate } from 'react-router-dom';
import { Error, getErrorMessage } from '../../../utils/getErrorMessage';

interface ISignupProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const useCreateUser = () => {
  const navigate = useNavigate();
  const {
    mutate: createUser,
    isPending: isCreating,
    isError: isSignupError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ email, password, firstName, lastName }: ISignupProps) =>
      register(email, password, firstName, lastName),
    onSuccess: () => {
      toast.success('Bravo! Sada se možeš ulogirati', toastConfig);
      navigate('/login');
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err), toastConfig);
    },
  });

  return { isCreating, createUser, isSignupError, isSuccess };
};
