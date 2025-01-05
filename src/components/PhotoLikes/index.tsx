import { useLocalStorage } from '@uidotdev/usehooks';
import { BiHeart, BiSolidHeart } from 'react-icons/bi';
import { useDownvoteUpload, useGetUploadUpvotes, useUpvoteUpload } from './hooks';
import { useEffect, useState } from 'react';
import { socket } from '../../socket';

interface IPhotoLikesProps {
  photoId: string | undefined;
}

interface ILike {
  userId: string;
}

const PhotoLikes = ({ photoId }: IPhotoLikesProps) => {
  const [currentUser] = useLocalStorage('userId');
  const { mutateUpvoteUpload } = useUpvoteUpload();
  const { mutateDownvoteUpload } = useDownvoteUpload();
  const { allUploadUpvotes, areUploadUpvotesLoading } = useGetUploadUpvotes(photoId as string);
  const [allLikes, setAllLikes] = useState<ILike[]>([]);

  const hasUserLiked = allLikes.some((like) => like.userId === currentUser);

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
    socket.on('upvote-upload', (data: ILike[]) => {
      setAllLikes(data);
    });

    socket.on('downvote-upload', (data: ILike[]) => {
      setAllLikes(data);
    });
  }, [allLikes, currentUser]);

  useEffect(() => {
    if (!areUploadUpvotesLoading) {
      setAllLikes(allUploadUpvotes?.data);
    }
  }, [allUploadUpvotes, areUploadUpvotesLoading]);
  return (
    <div className="flex items-center gap-2 mt-2">
      {hasUserLiked ? (
        <BiSolidHeart color="red" className="cursor-pointer" fontSize={30} onClick={onDownvote} />
      ) : (
        <BiHeart color="red" className="cursor-pointer" fontSize={30} onClick={onUpvote} />
      )}
      <span>{allLikes.length}</span>
    </div>
  );
};

export default PhotoLikes;
