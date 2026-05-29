import { useMutation } from '@tanstack/react-query';
import { uploadMessagePhotos } from '@app/api/uploads';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { getApiErrorMessage } from '@app/utils/apiErrorMessage';

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
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Fotografiju nije moguće poslati.'), toastConfig);
      clearSelectedFiles();
    },
  });

  return { uploadMessageImage, isUploadingMessageImage, isError, isSuccess };
};
