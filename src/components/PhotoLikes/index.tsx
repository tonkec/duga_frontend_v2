import { useLocalStorage } from '@uidotdev/usehooks';
import { BiHeart, BiSolidHeart } from 'react-icons/bi';
import { useDownvoteUpload, useGetUploadUpvotes, useUpvoteUpload } from './hooks';
import { useEffect, useMemo, useState } from 'react';
import { useSocket } from '@app/context/useSocket';
import PhotoLikeDropdown from './components/LikesList';

interface IPhotoLikesProps {
  photoId: string | undefined;
}

interface ILike {
  userId: string;
  id: number;
}

const PhotoLikes = ({ photoId }: IPhotoLikesProps) => {
  const socket = useSocket();
  const [currentUser] = useLocalStorage('userId');
  const { mutateUpvoteUpload } = useUpvoteUpload();
  const { mutateDownvoteUpload } = useDownvoteUpload();
  const { allUploadUpvotes, areUploadUpvotesLoading } = useGetUploadUpvotes(photoId as string);
  const [allLikes, setAllLikes] = useState<ILike[]>([]);

  const hasUserLiked = useMemo(() => {
    return allLikes.some((like) => Number(like.userId) === Number(currentUser));
  }, [allLikes, currentUser]);

  const onUpvote = () => {
    if (!currentUser || !photoId) return;
    mutateUpvoteUpload({ uploadId: photoId });
  };

  const onDownvote = () => {
    if (!currentUser || !photoId) return;
    mutateDownvoteUpload({ uploadId: photoId });
  };

  useEffect(() => {
    if (!areUploadUpvotesLoading && Array.isArray(allUploadUpvotes?.data)) {
      setAllLikes(allUploadUpvotes.data);
    }
  }, [allUploadUpvotes?.data, areUploadUpvotesLoading]);

  useEffect(() => {
    const handleUpdate = (data: { uploadId: number; likes: ILike[] }) => {
      if (String(data.uploadId) === String(photoId)) {
        setAllLikes(data.likes);
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
    <div className="flex items-center gap-2 mt-2">
      {hasUserLiked ? (
        <BiSolidHeart color="red" className="cursor-pointer" fontSize={30} onClick={onDownvote} />
      ) : (
        <BiHeart color="red" className="cursor-pointer" fontSize={30} onClick={onUpvote} />
      )}
      <PhotoLikeDropdown likes={allLikes} />
    </div>
  );
};

export default PhotoLikes;
