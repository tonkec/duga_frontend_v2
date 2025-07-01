import { getAllUserPhotos } from '@app/api/users';
import { useQuery } from '@tanstack/react-query';

export const useGetAllUserImages = () => {
  const {
    data: allUserImages,
    error: allUserImagesError,
    isLoading: allUserImagesLoading,
  } = useQuery({
    queryKey: ['uploads', 'user-photos'],
    queryFn: () => getAllUserPhotos(),
  });

  return { allUserImages, allUserImagesError, allUserImagesLoading };
};
