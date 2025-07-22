import { getProfilePhoto } from '@app/api/uploads';
import { useQuery } from '@tanstack/react-query';

export const useGetProfilePhoto = (userId: string) => {
  const {
    data: profilePhoto,
    error: profilePhotoError,
    isPending: isProfilePhotoLoading,
  } = useQuery({
    queryKey: ['profilePhoto', userId],
    queryFn: () => getProfilePhoto(userId),
    enabled: !!userId && userId !== 'undefined' && userId !== 'null',
  });

  return { profilePhoto, profilePhotoError, isProfilePhotoLoading };
};
