import { IPostLoginProps, updatePostLoginData } from '@app/api/users';
import { toastConfig } from '@app/configs/toast.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

type ApiError = {
  response?: {
    data?: {
      errors?: string[];
      error?: string;
      message?: string;
    };
  };
};

const getErrorMessage = (error: ApiError) =>
  error.response?.data?.errors?.[0] ??
  error.response?.data?.error ??
  error.response?.data?.message ??
  'Došlo je do greške.';

export const useUpdateUser = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    mutate: updatePostLoginMutation,
    isPending: isUpdateUserPending,
    isError: isUpdateUserError,
    isSuccess: isUpdateUserSuccess,
  } = useMutation({
    mutationFn: ({ age, acceptPrivacy, acceptTerms, username }: IPostLoginProps) =>
      updatePostLoginData({
        age,
        acceptPrivacy,
        acceptTerms,
        username,
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(['currentUser'], response);
      toast.success('Uspješno spremljeni podaci!', toastConfig);
      navigate('/');
    },
    onError: (error: ApiError) => {
      toast.error(`Greška: ${getErrorMessage(error)}`, toastConfig);
    },
  });

  return { isUpdateUserPending, isUpdateUserError, isUpdateUserSuccess, updatePostLoginMutation };
};
