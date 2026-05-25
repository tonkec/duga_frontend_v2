import { BiHeart, BiSolidHeart } from 'react-icons/bi';
import { useDownvoteUpload, useGetUploadUpvotes, useUpvoteUpload } from './hooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSocket } from '@app/context/useSocket';
import PhotoLikeDropdown from './components/LikesList';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';

interface IPhotoLikesProps {
  photoId: string | undefined;
}

interface ILike {
  userId: string;
  id: number;
}

const PhotoLikes = ({ photoId }: IPhotoLikesProps) => {
  const socket = useSocket();
  const { user: currentUser } = useGetCurrentUser();
  const { mutateUpvoteUpload, isUpvotingUpload } = useUpvoteUpload();
  const { mutateDownvoteUpload, isDownvotingUpload } = useDownvoteUpload();
  const { allUploadUpvotes, areUploadUpvotesLoading } = useGetUploadUpvotes(photoId as string);
  const [allLikes, setAllLikes] = useState<ILike[]>([]);
  const [optimisticUserLiked, setOptimisticUserLikedState] = useState<boolean | null>(null);
  const [isLocalLikePending, setIsLocalLikePending] = useState(false);
  const optimisticUserLikedRef = useRef<boolean | null>(null);
  const isLocalLikePendingRef = useRef(false);
  const isLikeMutationPending = isUpvotingUpload || isDownvotingUpload || isLocalLikePending;

  const hasUserLikedFromServer = useMemo(() => {
    return allLikes.some((like) => Number(like.userId) === Number(currentUser?.data?.id));
  }, [allLikes, currentUser]);
  const hasUserLiked = optimisticUserLiked ?? hasUserLikedFromServer;

  const setOptimisticUserLiked = (value: boolean | null) => {
    optimisticUserLikedRef.current = value;
    setOptimisticUserLikedState(value);
  };

  const setLocalLikePending = (value: boolean) => {
    isLocalLikePendingRef.current = value;
    setIsLocalLikePending(value);
  };

  const onUpvote = () => {
    if (!currentUser || !photoId || hasUserLiked || isLocalLikePendingRef.current) return;
    setLocalLikePending(true);
    setOptimisticUserLiked(true);
    setAllLikes((currentLikes) => [
      ...currentLikes,
      {
        id: -Number(currentUser.data.id),
        userId: String(currentUser.data.id),
      },
    ]);
    mutateUpvoteUpload(
      { uploadId: photoId },
      {
        onError: () => setOptimisticUserLiked(null),
        onSettled: () => setLocalLikePending(false),
      }
    );
  };

  const onDownvote = () => {
    if (!currentUser || !photoId || !hasUserLiked || isLocalLikePendingRef.current) return;
    setLocalLikePending(true);
    setOptimisticUserLiked(false);
    setAllLikes((currentLikes) =>
      currentLikes.filter((like) => Number(like.userId) !== Number(currentUser.data.id))
    );
    mutateDownvoteUpload(
      { uploadId: photoId },
      {
        onError: () => setOptimisticUserLiked(null),
        onSettled: () => setLocalLikePending(false),
      }
    );
  };

  useEffect(() => {
    if (
      !areUploadUpvotesLoading &&
      Array.isArray(allUploadUpvotes?.data) &&
      optimisticUserLikedRef.current === null
    ) {
      setAllLikes(allUploadUpvotes.data);
    }
  }, [allUploadUpvotes?.data, areUploadUpvotesLoading]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data: { uploadId: number; likes: ILike[] }) => {
      if (String(data.uploadId) === String(photoId)) {
        setAllLikes(data.likes);
        setOptimisticUserLiked(null);
        setLocalLikePending(false);
      }
    };

    socket.on('upvote-upload', handleUpdate);
    socket.on('downvote-upload', handleUpdate);

    return () => {
      socket.off('upvote-upload', handleUpdate);
      socket.off('downvote-upload', handleUpdate);
    };
  }, [photoId, socket]);

  if (!photoId) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-red/20 bg-white px-3 py-2 shadow-sm">
      {hasUserLiked ? (
        <button
          type="button"
          aria-label="Ukloni lajk"
          onClick={onDownvote}
          disabled={isLikeMutationPending}
          className="grid h-9 w-9 place-items-center rounded-full bg-red text-white shadow-sm shadow-red/20 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BiSolidHeart fontSize={22} />
        </button>
      ) : (
        <button
          type="button"
          aria-label="Lajkaj fotografiju"
          onClick={onUpvote}
          disabled={isLikeMutationPending}
          className="grid h-9 w-9 place-items-center rounded-full bg-red/10 text-red transition-all hover:scale-105 hover:bg-red hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BiHeart fontSize={22} />
        </button>
      )}
      <PhotoLikeDropdown likes={allLikes} />
    </div>
  );
};

export default PhotoLikes;
