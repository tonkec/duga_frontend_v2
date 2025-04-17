import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteImage } from '@app/api/uploads';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';

interface DeletePhotoParams {
  url: string;
}

export const useDeletePhoto = (id: string) => {
  const queryClient = useQueryClient();
  const {
    mutate: deletePhoto,
    isPending: isDeleting,
    isError: isDeleteError,
    isSuccess,
  } = useMutation({
    mutationFn: (params: DeletePhotoParams) => deleteImage(params.url),
    onSuccess: () => {
      toast.success('Fotografija uspješno obrisana.', toastConfig);
      queryClient.invalidateQueries({
        queryKey: ['uploads', 'avatar', id],
      });
    },
    onError: () => {
      toast.error('Došlo je do greške.', toastConfig);
    },
  });

  return { deletePhoto, isDeleting, isDeleteError, isSuccess };
};
