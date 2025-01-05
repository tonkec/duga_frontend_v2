import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { toastConfig } from '../../../configs/toast.config';
import { addUploadLike, getUploadLikes, removeUploadLike } from '../../../api/uploadsLikes';

export const useUpvoteUpload = () => {
  const {
    mutate: mutateUpvoteUpload,
    isPending: isUpvotingUpload,
    isError: isUpvoteUploadError,
    isSuccess: isUpvoteUploadSuccess,
  } = useMutation({
    mutationFn: (photoLike: { userId: string; uploadId: string }) => addUploadLike(photoLike),
    onSuccess: (data) => {
      console.log(data);
      toast.success('Fotografija je lajkana', toastConfig);
    },
    onError: (e) => {
      console.log(e);
      toast.error('Došlo je do greške.', toastConfig);
    },
  });

  return {
    mutateUpvoteUpload,
    isUpvotingUpload,
    isUpvoteUploadError,
    isUpvoteUploadSuccess,
  };
};

export const useDownvoteUpload = () => {
  const {
    mutate: mutateDownvoteUpload,
    isPending: isDownvotingUpload,
    isError: isDownvoteUploadError,
    isSuccess: isDownvoteUploadSuccess,
  } = useMutation({
    mutationFn: (photoLike: { userId: string; uploadId: string }) => removeUploadLike(photoLike),
    onSuccess: () => {
      toast.success('Fotografija je dislajkana', toastConfig);
    },
    onError: (e) => {
      console.log(e);
      toast.error('Došlo je do greške.', toastConfig);
    },
  });

  return {
    mutateDownvoteUpload,
    isDownvotingUpload,
    isDownvoteUploadError,
    isDownvoteUploadSuccess,
  };
};

export const useGetUploadUpvotes = (uploadId: string) => {
  const {
    data: allUploadUpvotes,
    error: allUploadUpvotesError,
    isPending: areUploadUpvotesLoading,
    isSuccess: areUploadUpvotesSuccess,
  } = useQuery({
    queryKey: ['uploadLikes', uploadId],
    queryFn: () => getUploadLikes(uploadId),
  });

  return {
    allUploadUpvotes,
    allUploadUpvotesError,
    areUploadUpvotesLoading,
    areUploadUpvotesSuccess,
  };
};
