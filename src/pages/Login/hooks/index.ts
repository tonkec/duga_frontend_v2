import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { login } from '../../../api/auth/login';
import { useCookies } from 'react-cookie';
import { register } from '../../../api/auth/register';

interface ILoginProps {
  email: string;
  password: string;
}

function useLoginUser() {
  const [, setCookie] = useCookies(['token']);

  const navigate = useNavigate();
  const [, saveUserId] = useLocalStorage('userId', null);

  const {
    mutate: loginUser,
    isPending: isLoggingIn,
    isError: isLoginError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ email, password }: ILoginProps) => login(email, password),
    onSuccess: (data) => {
      if (data.data.isVerified) {
        setCookie('token', data.data.token);
        saveUserId(data.data.id);
        toast.success('Uspješno si se ulogirao_la!', toastConfig);
        navigate('/');
      }

      if (!data.data.isVerified) {
        toast.error('Email nije verificiran!', toastConfig);
        navigate('/login');
      }
    },
    onError: () => {
      toast.error('Greška! Probaj opet.', toastConfig);
    },
  });

  return { isLoggingIn, loginUser, isLoginError, isSuccess };
}

export { useLoginUser };

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
