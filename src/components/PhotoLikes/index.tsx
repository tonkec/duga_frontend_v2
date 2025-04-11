import { useLocalStorage } from '@uidotdev/usehooks';
import { BiHeart, BiSolidHeart } from 'react-icons/bi';
import { useDownvoteUpload, useGetUploadUpvotes, useUpvoteUpload } from './hooks';
import { useEffect, useState } from 'react';
import { useSocket } from '../../context/useSocket';
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
  const hasUserLiked = allLikes?.some((like) => like.userId === currentUser);

  const onUpvote = () => {
    if (!currentUser || !photoId) {
      return;
    }

    mutateUpvoteUpload({
      userId: currentUser as string,
      uploadId: photoId,
    });
  };

  const onDownvote = () => {
    if (!currentUser || !photoId) {
      return;
    }

    mutateDownvoteUpload({
      userId: currentUser as string,
      uploadId: photoId,
    });
  };

  useEffect(() => {
    const handleUpvote = (data: { uploadId: number; likes: ILike[] }) => {
      if (String(data.uploadId) === String(photoId)) {
        setAllLikes(data.likes);
      }
    };

    const handleDownvote = (data: { uploadId: number; likes: ILike[] }) => {
      if (String(data.uploadId) === String(photoId)) {
        setAllLikes(data.likes);
      }
    };

    socket.on('upvote-upload', handleUpvote);
    socket.on('downvote-upload', handleDownvote);

    return () => {
      socket.off('upvote-upload', handleUpvote);
      socket.off('downvote-upload', handleDownvote);
    };
  }, [photoId, socket]);

  useEffect(() => {
    if (!areUploadUpvotesLoading) {
      setAllLikes(allUploadUpvotes?.data);
    }
  }, [allUploadUpvotes, areUploadUpvotesLoading]);

  if (!photoId) {
    return null;
  }

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
