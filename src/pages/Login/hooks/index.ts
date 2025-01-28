import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@uidotdev/usehooks';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { register } from '../../../api/auth/register';

interface ISignupProps {
  email: string;
}

export const useCreateUser = () => {
  const [, setUserId] = useLocalStorage('userId', '');
  const {
    mutate: createUser,
    isPending: isCreating,
    isError: isSignupError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ email }: ISignupProps) => register(email),
    onSuccess: (data) => {
      toast.success('Dobro došao_la', toastConfig);
      setUserId(data.data.user.id);
    },
    onError: (err: Error) => {
      console.log(err);
    },
  });

  return { isCreating, createUser, isSignupError, isSuccess };
};
