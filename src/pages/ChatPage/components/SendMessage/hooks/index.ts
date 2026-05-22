import { useMutation } from '@tanstack/react-query';
import { uploadMessagePhotos } from '@app/api/uploads';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { AxiosError } from 'axios';

export type BackendError = {
  errors: { reason: string }[];
};

export const useUploadMessageImage = (
  emitImageToSockets: () => void,
  clearSelectedFiles: () => void
) => {
  const {
    mutate: uploadMessageImage,
    isPending: isUploadingMessageImage,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: (data: FormData) => uploadMessagePhotos(data),
    onSuccess: () => {
      emitImageToSockets();
      clearSelectedFiles();
    },
    onError: (error: AxiosError<BackendError>) => {
      const errors = error?.response?.data?.errors;
      toast.error(errors?.map((err: { reason: string }) => err.reason).join(' '), toastConfig);
      clearSelectedFiles();
    },
  });

  return { uploadMessageImage, isUploadingMessageImage, isError, isSuccess };
};
