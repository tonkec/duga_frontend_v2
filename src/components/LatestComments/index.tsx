import { useNavigate } from 'react-router';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Card from '@app/components/Card';
import Loader from '@app/components/Loader';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import { useGetLatestComments } from './hooks';
import DOMPurify from 'dompurify';
import { useGetImageBlob } from '../LatestUploads/hooks';
import UserAvatar from '../UserAvatar';

interface IComment {
  id: number;
  comment: string;
  createdAt: string;
  uploadId: number;
  userId: number;
  taggedUsers?: { id: number; username: string }[];
  imageUrl: string;
  secureImageUrl?: string;
}

export const LatestComment = ({ comment, onClick }: { comment: IComment; onClick: () => void }) => {
  const navigate = useNavigate();
  const { user } = useGetUserById(comment.userId.toString());
  const { data: imageBlob } = useGetImageBlob(comment.secureImageUrl || comment.imageUrl);

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

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className="flex flex-col gap-1 border-b p-4 hover:bg-gray-100 transition cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm">
          {imageBlob ? (
            <img
              src={URL.createObjectURL(imageBlob)}
              alt="Comment image"
              className="w-36 h-36"
              onClick={() => navigate(`/user/${comment.userId}`)}
            />
          ) : (
            <span className="text-gray-500">{renderFormattedComment(comment.comment)}</span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <UserAvatar
          color="black"
          userId={String(comment.userId)}
          avatarFallbackName={user?.data.username}
          className="w-6 h-6"
        />
        <RecordCreatedAt createdAt={comment.createdAt} />
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
    <div className="col-span-2">
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
