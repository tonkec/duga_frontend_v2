import { useMutation } from '@tanstack/react-query';
import { addUploadComment } from '../../../api/uploadComments';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';

interface IAddUploadCommentProps {
  userId: string;
  uploadId: string;
  comment: string;
}

export const useAddUploadComment = () => {
  const {
    mutate: mutateAddUploadComment,
    isPending: isAddingUploadComment,
    isError: isAddUploadCommentError,
    isSuccess: isAddUploadCommentSuccess,
  } = useMutation({
    mutationFn: ({ userId, uploadId, comment }: IAddUploadCommentProps) =>
      addUploadComment({ userId, uploadId, comment }),
    onSuccess: (data) => {
      console.log('Komentar uspješno dodan.', data);
    },
    onError: () => {
      toast.error('Došlo je do greške.', toastConfig);
    },
  });

  return {
    mutateAddUploadComment,
    isAddingUploadComment,
    isAddUploadCommentError,
    isAddUploadCommentSuccess,
  };
};
