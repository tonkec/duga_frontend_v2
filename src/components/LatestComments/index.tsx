import { useNavigate } from 'react-router';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Card from '@app/components/Card';
import Loader from '@app/components/Loader';
import { useGetLatestComments } from './hooks';
import CommentContent from '../PhotoComments/components/CommentContent';
import Commenter from '../PhotoComments/components/Commenter';
import { IComment } from '../PhotoComments';
import RecordCreatedAt from '../RecordCreatedAt';

export const LatestComment = ({ comment, onClick }: { comment: IComment; onClick: () => void }) => {
  const { user, isUserLoading } = useGetUserById(comment.userId.toString());

  return (
    <div
      className="flex flex-col gap-1 border-b p-4 hover:bg-gray-100 transition cursor-pointer"
      onClick={onClick}
    >
      <CommentContent comment={comment} />
      <div className="flex items-center justify-between gap-2 mt-4">
        <Commenter isUserLoading={isUserLoading} user={user?.data} />
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
