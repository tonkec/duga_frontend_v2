import { getAllImages, getProfilePhoto } from '@app/api/uploads';
import type { IImage } from '@app/components/Photos';
import { useQuery } from '@tanstack/react-query';

const hasProfilePhotoSource = (profilePhoto: Partial<IImage> | undefined) =>
  Boolean(
    profilePhoto?.securePhotoUrl ||
      profilePhoto?.url ||
      profilePhoto?.imageUrl ||
      profilePhoto?.messagePhotoUrl
  );

const getProfilePhotoFromUserImages = async (userId: string) => {
  const response = await getAllImages(userId);
  const images = response.data?.images;
  const profilePhoto = Array.isArray(images)
    ? images.find((image: IImage) => image.isProfilePhoto)
    : undefined;

  return { ...response, data: profilePhoto };
};

export const useGetProfilePhoto = (userId: string) => {
  const {
    data: profilePhoto,
    error: profilePhotoError,
    isPending: isProfilePhotoLoading,
  } = useQuery({
    queryKey: ['profilePhoto', userId],
    queryFn: async () => {
      try {
        const response = await getProfilePhoto(userId);
        if (hasProfilePhotoSource(response.data)) {
          return response;
        }
      } catch {
        // The profile endpoint is a convenience path; fall back to the user's image list below.
      }

      return getProfilePhotoFromUserImages(userId);
    },
    enabled: !!userId && userId !== 'undefined' && userId !== 'null',
    staleTime: 1000 * 60 * 5,
    refetchOnMount: 'always',
    retry: false,
    throwOnError: false,
  });

  return { profilePhoto, profilePhotoError, isProfilePhotoLoading };
};
