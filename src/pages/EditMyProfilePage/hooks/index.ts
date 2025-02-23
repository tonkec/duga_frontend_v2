import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { IUserUpdateProps, updateUser } from '../../../api/users';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';

export const useUpdateUser = (userId: string) => {
  const navigate = useNavigate();
  const {
    mutate: updateUserMutation,
    isPending: isUserPending,
    isError: isUserUpdatingError,
    isSuccess: isUserUpdatingSuccess,
  } = useMutation({
    mutationFn: ({
      sexuality,
      age,
      location,
      gender,
      bio,
      username,
      lookingFor,
      relationshipStatus,
      cigarettes,
      alcohol,
      sport,
      favoriteDay,
      spirituality,
      embarasement,
      tooOldFor,
      makesMyDay,
      favoriteSong,
      favoriteMovie,
      interests,
      languages,
      ending,
      firstName,
      lastName,
    }: IUserUpdateProps) =>
      updateUser(
        {
          firstName,
          lastName,
          sexuality,
          age,
          location,
          gender,
          bio,
          username,
          lookingFor,
          relationshipStatus,
          cigarettes,
          alcohol,
          sport,
          favoriteDay,
          spirituality,
          embarasement,
          tooOldFor,
          makesMyDay,
          favoriteSong,
          favoriteMovie,
          interests,
          languages,
          ending,
        },
        userId
      ),
    onSuccess: () => {
      toast.success('Uspješno spremljeni podaci!', toastConfig);
      navigate('/profile');
    },
    onError: (err: Error) => {
      console.log(err);
      toast.error('Greška prilikom spremanja podataka!', toastConfig);
    },
  });

  return { isUserPending, updateUserMutation, isUserUpdatingError, isUserUpdatingSuccess };
};
