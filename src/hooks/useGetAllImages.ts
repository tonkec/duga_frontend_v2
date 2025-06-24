import { useQuery } from '@tanstack/react-query';
import { getAllImages } from '@app/api/uploads';

export const useGetAllImages = (id: string) => {
  const {
    data: allImages,
    error: allImagesError,
    isPending: allImagesLoading,
  } = useQuery({
    queryKey: ['uploads', 'avatar', id],
    queryFn: () => getAllImages(id),
    enabled: !!id && id !== 'undefined' && id !== 'null',
  });

  return { allImages, allImagesError, allImagesLoading };
};
