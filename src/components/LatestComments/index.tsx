import { useNavigate } from 'react-router';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Card from '@app/components/Card';
import Loader from '@app/components/Loader';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import { useGetLatestComments } from './hooks';
import Avatar from 'react-avatar';
import { getProfilePhoto, getProfilePhotoUrl } from '@app/utils/getProfilePhoto';
import { useGetAllImages } from '@app/hooks/useGetAllImages';
import DOMPurify from 'dompurify';

interface IComment {
  id: number;
  comment: string;
  createdAt: string;
  uploadId: number;
  userId: number;
  taggedUsers?: { id: number; username: string }[];
}

export const LatestComment = ({ comment, onClick }: { comment: IComment; onClick: () => void }) => {
  const navigate = useNavigate();
  const { user } = useGetUserById(comment.userId.toString());
  const { allImages } = useGetAllImages(comment.userId.toString());

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
        <Avatar
          color="#2D46B9"
          name={`${user?.data.username}`}
          src={getProfilePhotoUrl(getProfilePhoto(allImages?.data.images))}
          size="40"
          round={true}
          onClick={() => {
            navigate(`/user/${comment.userId}`);
          }}
          className="cursor-pointer"
        />
        <p className="text-sm">{renderFormattedComment(comment.comment)}</p>
      </div>
      <div className="flex justify-between">
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
