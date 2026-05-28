import { useMutation, useQuery } from '@tanstack/react-query';
import {
  addUploadComment,
  deleteUploadComment,
  editUploadComment,
  getUploadComments,
} from '@app/api/uploadsComments';
import { toast } from 'react-toastify';
import { toastConfig } from '@app/configs/toast.config';
import { useSocket } from '@app/context/useSocket';
import { getUsersByUsernames } from '@app/api/users';
import { getApiErrorMessage } from '@app/utils/apiErrorMessage';
import { toCommentUpdateSocketPayload } from '../utils/parseCommentUpdate';

export const useEditUploadComment = (onCommentUpdated?: (payload: unknown) => void) => {
  const socket = useSocket();
  const {
    mutate: mutateEditUploadComment,
    isPending: isEditingUploadComment,
    isError: isEditUploadCommentError,
    isSuccess: isEditUploadCommentSuccess,
  } = useMutation({
    mutationFn: (comment: {
      id: number;
      comment: string;
      taggedUserIds: number[];
      uploadId: string;
    }) => editUploadComment(comment.id, comment.comment, comment.taggedUserIds),
    onSuccess: (response, variables) => {
      toast.success('Komentar uspješno izmijenjen.', toastConfig);
      const payload = toCommentUpdateSocketPayload(response.data, variables);
      onCommentUpdated?.(payload);
      socket?.emit('edit-comment', payload);
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
    onSuccess: (data, formData) => {
      toast.success('Komentar uspješno dodan.', toastConfig);
      socket?.emit('send-comment', {
        ...data.data,
        uploadId: data.data?.uploadId ?? formData.get('uploadId'),
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Komentar nije moguće dodati.'), toastConfig);
    },
  });

  return {
    mutateAddUploadComment,
    isAddingUploadComment,
    isAddUploadCommentError,
    isAddUploadCommentSuccess,
  };
};
export const useDeleteUploadComment = (onCommentDeleted?: (commentId: number) => void) => {
  const socket = useSocket();

  const {
    mutate: mutateDeleteUploadComment,
    isPending: isDeletingUploadComment,
    isError: isDeleteUploadCommentError,
    isSuccess: isDeleteUploadCommentSuccess,
  } = useMutation({
    mutationFn: ({ commentId }: { commentId: number; uploadId: string | number }) =>
      deleteUploadComment(commentId),
    onSuccess: (data, { commentId, uploadId }) => {
      onCommentDeleted?.(commentId);
      socket?.emit(
        'delete-comment',
        data?.data?.id
          ? { data: { ...data.data, uploadId: data.data.uploadId ?? uploadId } }
          : {
              data: {
                id: commentId,
                uploadId,
              },
            }
      );
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

export const useGetUsersByUsernames = (usernames: string[]) => {
  return useQuery({
    queryKey: ['users', usernames],
    queryFn: () => getUsersByUsernames(usernames),
    enabled: usernames.length > 0,
  });
};
