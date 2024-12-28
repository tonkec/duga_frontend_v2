import { useMutation } from '@tanstack/react-query';
import { deleteImage } from '../../../api/uploads';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';

interface DeletePhotoParams {
  url: string;
}

export const useDeletePhoto = () => {
  const {
    mutate: deletePhoto,
    isPending: isDeleting,
    isError: isDeleteError,
    isSuccess,
  } = useMutation({
    mutationFn: (params: DeletePhotoParams) => deleteImage(params.url),
    onSuccess: () => {
      toast.success('Fotografija uspješno obrisana.', toastConfig);
    },
    onError: () => {
      toast.error('Došlo je do greške.', toastConfig);
    },
  });

  return { deletePhoto, isDeleting, isDeleteError, isSuccess };
};
