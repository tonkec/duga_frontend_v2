import { getAllUserPhotos } from '@app/api/users';
import { useQuery } from '@tanstack/react-query';

export const useGetAllUserImages = (userId: string) => {
  const {
    data: allUserImages,
    error: allUserImagesError,
    isLoading: allUserImagesLoading,
  } = useQuery({
    queryKey: ['uploads', 'user-photos', userId],
    queryFn: () => getAllUserPhotos(userId),
    enabled: !!userId,
  });

  return { allUserImages, allUserImagesError, allUserImagesLoading };
};
