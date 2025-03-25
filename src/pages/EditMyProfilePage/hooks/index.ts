import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { deleteUser, IUserUpdateProps, updateUser } from '../../../api/users';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { useAuth0 } from '@auth0/auth0-react';

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
    }: IUserUpdateProps) =>
      updateUser(
        {
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

export const useDeleteUser = (userId: string) => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const auth0UserId = user?.sub;

  const {
    mutate: deleteUserMutation,
    isPending: isUserPending,
    isError: isUserUpdatingError,
    isSuccess: isUserUpdatingSuccess,
  } = useMutation({
    mutationFn: () => deleteUser(userId, auth0UserId),
    onSuccess: () => {
      toast.success('Uspješno izbrisan profil!', toastConfig);
      navigate('/login');
    },
    onError: (err: Error) => {
      console.log(err);
      toast.error('Greška prilikom brisanja profila!', toastConfig);
    },
  });

  return { isUserPending, deleteUserMutation, isUserUpdatingError, isUserUpdatingSuccess };
};
