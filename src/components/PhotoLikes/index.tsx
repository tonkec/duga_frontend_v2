import { useLocalStorage } from '@uidotdev/usehooks';
import { BiHeart, BiSolidHeart } from 'react-icons/bi';
import { useDownvoteUpload, useGetUploadUpvotes, useUpvoteUpload } from './hooks';

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
  const { allUploadUpvotes } = useGetUploadUpvotes(photoId as string);

  const hasUserLiked = allUploadUpvotes?.data.some((like: ILike) => like.userId === currentUser);

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

  return (
    <div className="flex items-center gap-2 mt-2">
      {hasUserLiked ? (
        <BiSolidHeart color="red" className="cursor-pointer" fontSize={30} onClick={onDownvote} />
      ) : (
        <BiHeart color="red" className="cursor-pointer" fontSize={30} onClick={onUpvote} />
      )}
      <span>{allUploadUpvotes?.data.length}</span>
    </div>
  );
};

export default PhotoLikes;
