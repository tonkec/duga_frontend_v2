import { IPostLoginProps, updatePostLoginData } from '@app/api/users';
import { toastConfig } from '@app/configs/toast.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

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
    onError: (data: { response: { data: { errors: string[] } } }) => {
      toast.error(`Greška: ${data?.response.data.errors[0]}`, toastConfig);
    },
  });

  return { isUpdateUserPending, isUpdateUserError, isUpdateUserSuccess, updatePostLoginMutation };
};
