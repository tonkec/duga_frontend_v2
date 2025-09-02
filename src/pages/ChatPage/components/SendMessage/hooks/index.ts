import { useMutation } from '@tanstack/react-query';
import { uploadMessagePhotos } from '@app/api/uploads';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { AxiosError } from 'axios';

type BackendError = {
  errors: { reason: string }[];
};

export const useUploadMessageImage = () => {
  const {
    mutate: uploadMessageImage,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: (data: FormData) => uploadMessagePhotos(data),
    onSuccess: () => {
      toast.success('Slika uspješno poslana', toastConfig);
    },
    onError: (error: AxiosError<BackendError>) => {
      const errors = error?.response?.data?.errors;
      toast.error(errors?.map((err: { reason: string }) => err.reason).join(' '), toastConfig);
    },
  });

  return { uploadMessageImage, isError, isSuccess };
};
