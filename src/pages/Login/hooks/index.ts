import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@uidotdev/usehooks';
import { register } from '../../../api/auth/register';

interface ISignupProps {
  email: string;
}

export const useCreateUser = () => {
  const [, setUserId] = useLocalStorage('userId', '');
  const {
    mutate: createOrLoginUser,
    isPending: isCreating,
    isError: isSignupError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ email }: ISignupProps) => register(email),
    onSuccess: (data) => {
      setUserId(data.data.user.id);
    },
    onError: (err: Error) => {
      console.log(err);
    },
  });

  return { isCreating, createOrLoginUser, isSignupError, isSuccess };
};
