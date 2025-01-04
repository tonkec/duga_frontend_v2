import { IComment } from '..';
import { useGetUserById } from '../../../hooks/useGetUserById';

const CommentWithUser: React.FC<{ comment: IComment }> = ({ comment }) => {
  const { user, isUserLoading } = useGetUserById(comment.userId.toString());

  return (
    <div className="flex flex-col gap-2 bg-gray-100 p-2 rounded">
      <p className="text-lg">{comment.comment}</p>
      {isUserLoading ? (
        <p className="text-xs">Loading user...</p>
      ) : (
        <p>od: {user?.data.firstName || `User ${comment.userId}`}</p>
      )}
    </div>
  );
};

export default CommentWithUser;
