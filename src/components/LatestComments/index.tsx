import { useNavigate } from 'react-router';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Card from '@app/components/Card';
import Loader from '@app/components/Loader';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import { useGetLatestComments } from './hooks';
import DOMPurify from 'dompurify';
import { useGetImageBlob } from '../LatestUploads/hooks';
import UserAvatar from '../UserAvatar';
import Image from '../Image';
import ContentFormatter from '../ContentFormatter';

interface IComment {
  id: number;
  comment: string;
  createdAt: string;
  uploadId: number;
  userId: number;
  taggedUsers?: { id: number; username: string }[];
  imageUrl: string;
  securePhotoUrl?: string;
}

export const LatestComment = ({ comment, onClick }: { comment: IComment; onClick: () => void }) => {
  const navigate = useNavigate();
  const { user } = useGetUserById(comment.userId.toString());
  const { data: imageBlob } = useGetImageBlob(comment.securePhotoUrl || comment.imageUrl);

  const renderFormattedComment = (text: string) => {
    const cleanText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    if (!cleanText) return null;

    const parts = cleanText.split(/(@\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        const matchedUser = comment.taggedUsers?.find((u) => u.username === username);

        if (matchedUser) {
          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/user/${matchedUser.id}`);
              }}
              className="text-blue underline cursor-pointer"
            >
              {part}
            </span>
          );
        }
      }

      return (
        <span key={index}>
          <ContentFormatter text={part} />
        </span>
      );
    });
  };

  return (
    <div
      className="border-b p-4 hover:bg-gray-100 transition cursor-pointer justify-between"
      onClick={onClick}
    >
      <div className="flex items-end justify-between gap-2 mb-2">
        <div>
          {imageBlob ? (
            <Image
              src={URL.createObjectURL(imageBlob)}
              alt="Comment image"
              className="w-xl rounded max-h-[100px]"
              onClick={() => navigate(`/user/${comment.userId}`)}
            />
          ) : (
            <span className="text-gray-500 text-sm">{renderFormattedComment(comment.comment)}</span>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 text-sm text-gray-500">
          <UserAvatar
            color="black"
            userId={String(comment.userId)}
            avatarFallbackName={user?.data.username}
            className="w-[40px] h-[40px] rounded-full"
          />
          <RecordCreatedAt createdAt={comment.createdAt} />
        </div>
      </div>
    </div>
  );
};

const LatestComments = () => {
  const navigate = useNavigate();
  const numberOfComments = 3;
  const { allComments, isAllCommentsLoading } = useGetLatestComments();
  if (isAllCommentsLoading) {
    return <Loader />;
  }

  if (allComments?.data.length < numberOfComments) {
    return null;
  }

  const comments = allComments?.data.slice(0, numberOfComments) || [];
  return (
    <div className="flex-1">
      <h2 className="mb-2">💬 Zadnji komentari na fotografije</h2>
      <Card className="!p-0 overflow-hidden">
        {comments.map((comment: IComment) => (
          <LatestComment
            key={comment.id}
            comment={comment}
            onClick={() => navigate(`/photo/${comment.uploadId}`)}
          />
        ))}
      </Card>
    </div>
  );
};

export default LatestComments;
