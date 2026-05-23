import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { uploadPhotos } from '@app/api/uploads';
import { AxiosError } from 'axios';
import { BackendError } from '@app/pages/ChatPage/components/SendMessage/hooks';

export const useUploadPhotos = () => {
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
        queryKey: ['uploads'],
      });
    },
    onError: (error: AxiosError<BackendError>) => {
      const errors = error?.response?.data?.errors;
      toast.error(errors?.map((err: { reason: string }) => err.reason).join(' '), toastConfig);
    },
  });

  return { onUploadPhotos, isUploadingPhotos, isUploadPhotosError, isSuccess };
};
