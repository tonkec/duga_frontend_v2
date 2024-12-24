import { useMutation } from '@tanstack/react-query';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { Error, getErrorMessage } from '../../../utils/getErrorMessage';
import { login } from '../../../api/auth/login';

interface IUserProps {
  email: string;
  password: string;
}

function useLoginUser() {
  const navigate = useNavigate();
  const [, saveAuthToken] = useLocalStorage('token', null);

  const {
    mutate: loginUser,
    isPending: isCreating,
    isError: isSignupError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ email, password }: IUserProps) => login(email, password),
    onSuccess: (data) => {
      saveAuthToken(data.data.token);
      toast.success('Uspješno si se ulogirao_la!', toastConfig);
      navigate('/');
    },
    onError: (err: Error) => {
      toast.error(getErrorMessage(err), toastConfig);
    },
  });

  return { isCreating, loginUser, isSignupError, isSuccess };
}

export { useLoginUser };
