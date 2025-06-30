import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { deleteUser, IUserUpdateProps, updateUser } from '@app/api/users';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';

export const useUpdateUser = () => {
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
      updateUser({
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
      }),
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

export const useDeleteUser = () => {
  const navigate = useNavigate();

  const {
    mutate: deleteUserMutation,
    isPending: isUserPending,
    isError: isUserUpdatingError,
    isSuccess: isUserUpdatingSuccess,
  } = useMutation({
    mutationFn: () => deleteUser(),
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
