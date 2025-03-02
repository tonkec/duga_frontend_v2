import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@uidotdev/usehooks';
import { register } from '../../../api/auth/register';

interface ISignupProps {
  email: string;
  username: string;
}

export const useCreateUser = () => {
  const [, setUserId] = useLocalStorage('userId', '');
  const {
    mutate: createOrLoginUser,
    isPending: isCreating,
    isError: isSignupError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ email, username }: ISignupProps) => register(email, username),
    onSuccess: (data) => {
      setUserId(data.data.user.id);
    },
    onError: (err: Error) => {
      console.log(err);
    },
  });

  return { isCreating, createOrLoginUser, isSignupError, isSuccess };
};
