import { useMutation, useQuery } from '@tanstack/react-query';
import {
  addUploadComment,
  deleteUploadComment,
  getUploadComments,
} from '../../../api/uploadComments';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { socket } from '../../../socket';
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
      toast.success('Komentar uspješno dodan.', toastConfig);
      socket.emit('send-comment', data);
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

export const useDeleteUploadComment = () => {
  const {
    mutate: mutateDeleteUploadComment,
    isPending: isDeletingUploadComment,
    isError: isDeleteUploadCommentError,
    isSuccess: isDeleteUploadCommentSuccess,
  } = useMutation({
    mutationFn: (commentId: number) => deleteUploadComment(commentId),
    onSuccess: (data) => {
      console.log(data);
      socket.emit('delete-comment', data);
      toast.success('Komentar uspešno obrisan.', toastConfig);
    },
    onError: () => {
      toast.error('Došlo je do greške.', toastConfig);
    },
  });

  return {
    mutateDeleteUploadComment,
    isDeletingUploadComment,
    isDeleteUploadCommentError,
    isDeleteUploadCommentSuccess,
  };
};

export const useGetUploadComments = (uploadId: string) => {
  const {
    data: allComments,
    error: allCommentsError,
    isPending: areCommentsLoading,
  } = useQuery({
    queryKey: ['comments'],
    queryFn: () => getUploadComments(uploadId),
  });

  return { allComments, allCommentsError, areCommentsLoading };
};
