import { useNavigate } from 'react-router';
import { useGetUserById } from '../../hooks/useGetUserById';
import Card from '../Card';
import Loader from '../Loader';
import RecordCreatedAt from '../RecordCreatedAt';
import { useGetLatestComments } from './hooks';

interface IComment {
  id: number;
  comment: string;
  createdAt: string;
  uploadId: number;
  userId: number;
}

export const LatestComment = ({ comment, onClick }: { comment: IComment; onClick: () => void }) => {
  const { user } = useGetUserById(comment.userId.toString());
  return (
    <div
      className="flex flex-col gap-1 border-b p-4 hover:bg-blue hover:text-white transition cursor-pointer"
      onClick={onClick}
    >
      <p className="text-sm">{comment.comment || 'Nema komentara'}</p>
      <p className="text-xs text-gray-400">
        {user?.data.firstName} {user?.data.lastName}
      </p>
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

  const comments = allComments?.data.slice(0, numberOfComments) || [];
  return (
    <div>
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
