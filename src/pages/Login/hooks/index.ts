import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@uidotdev/usehooks';
import { register } from '@app/api/auth/register';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { useNavigate } from 'react-router';

interface ISignupProps {
  email: string;
  username: string;
  isVerified: boolean;
  auth0Id: string;
}

export const useCreateUser = () => {
  const navigate = useNavigate();
  const [, setUserId] = useLocalStorage('userId', '');
  const {
    mutate: createOrLoginUser,
    isPending: isCreating,
    isError: isSignupError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ auth0Id, email, username, isVerified }: ISignupProps) =>
      register(auth0Id, email, username, isVerified),
    onSuccess: (data) => {
      setUserId(data?.data?.user?.id);
    },
    onError: (err: Error) => {
      console.log(err);
      toast.error('Došlo je do greške.', toastConfig);
      navigate('/login');
    },
  });

  return { isCreating, createOrLoginUser, isSignupError, isSuccess };
};
