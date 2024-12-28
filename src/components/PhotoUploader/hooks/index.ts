import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { uploadPhotos } from '../../../api/uploads';

export const useUploadPhotos = (id: string) => {
  const queryClient = useQueryClient();
  const {
    mutate: onUploadPhotos,
    isPending: isUploadingPhotos,
    isError: isUploadPhotosError,
    isSuccess,
  } = useMutation({
    mutationFn: (data: FormData) => uploadPhotos(data),
    onSuccess: () => {
      toast.success('Fotografije uspješno spremljene', toastConfig);
      queryClient.invalidateQueries({
        queryKey: ['uploads', 'avatar', id],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error('Došlo je do greške.', toastConfig);
    },
  });

  return { onUploadPhotos, isUploadingPhotos, isUploadPhotosError, isSuccess };
};
