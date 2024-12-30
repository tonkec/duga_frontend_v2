import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { login } from '../../../api/auth/login';

interface IUserProps {
  email: string;
  password: string;
}

function useLoginUser() {
  const navigate = useNavigate();
  const [, saveAuthToken] = useLocalStorage('token', null);
  const [, saveUserId] = useLocalStorage('userId', null);

  const {
    mutate: loginUser,
    isPending: isLoggingIn,
    isError: isLoginError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ email, password }: IUserProps) => login(email, password),
    onSuccess: (data) => {
      saveAuthToken(data.data.token);
      saveUserId(data.data.id);
      toast.success('Uspješno si se ulogirao_la!', toastConfig);
      navigate('/');
    },
    onError: () => {
      toast.error('Greška! Probaj opet.', toastConfig);
    },
  });

  return { isLoggingIn, loginUser, isLoginError, isSuccess };
}

export { useLoginUser };
