import { useQuery } from '@tanstack/react-query';
import { getSingleImage } from '../../../api/uploads';

export const useGetSingleImage = (id: string) => {
  const {
    data: singleImage,
    error: singleImageError,
    isPending: singleImageLoading,
  } = useQuery({
    queryKey: ['uploads', 'photo', id],
    queryFn: () => getSingleImage(id),
    enabled: !!id,
  });

  return {
    singleImage,
    singleImageError,
    singleImageLoading,
  };
};
