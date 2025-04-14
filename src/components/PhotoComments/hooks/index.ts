import { useMutation, useQuery } from '@tanstack/react-query';
import {
  addUploadComment,
  deleteUploadComment,
  editUploadComment,
  getUploadComments,
} from '../../../api/uploadsComments';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { useSocket } from '../../../context/useSocket';

export const useEditUploadComment = () => {
  const socket = useSocket();
  const {
    mutate: mutateEditUploadComment,
    isPending: isEditingUploadComment,
    isError: isEditUploadCommentError,
    isSuccess: isEditUploadCommentSuccess,
  } = useMutation({
    mutationFn: (comment: { id: number; comment: string; taggedUserIds: number[] }) =>
      editUploadComment(comment.id, comment.comment, comment.taggedUserIds),
    onSuccess: (data) => {
      toast.success('Komentar uspješno izmijenjen.', toastConfig);
      socket.emit('edit-comment', data);
    },
    onError: () => {
      toast.error('Došlo je do greške.', toastConfig);
    },
  });

  return {
    mutateEditUploadComment,
    isEditingUploadComment,
    isEditUploadCommentError,
    isEditUploadCommentSuccess,
  };
};

export const useAddUploadComment = () => {
  const socket = useSocket();
  const {
    mutate: mutateAddUploadComment,
    isPending: isAddingUploadComment,
    isError: isAddUploadCommentError,
    isSuccess: isAddUploadCommentSuccess,
  } = useMutation({
    mutationFn: (formData: FormData) => addUploadComment(formData),
    onSuccess: (data) => {
      toast.success('Komentar uspješno dodan.', toastConfig);
      socket.emit('send-comment', data.data);
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
  const socket = useSocket();

  const {
    mutate: mutateDeleteUploadComment,
    isPending: isDeletingUploadComment,
    isError: isDeleteUploadCommentError,
    isSuccess: isDeleteUploadCommentSuccess,
  } = useMutation({
    mutationFn: (commentId: number) => deleteUploadComment(commentId),
    onSuccess: (data) => {
      socket.emit('delete-comment', data);
      toast.success('Komentar uspiješno obrisan.', toastConfig);
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
    queryKey: ['comments', uploadId],
    queryFn: () => getUploadComments(uploadId),
    enabled: !!uploadId,
  });

  return { allComments, allCommentsError, areCommentsLoading };
};
