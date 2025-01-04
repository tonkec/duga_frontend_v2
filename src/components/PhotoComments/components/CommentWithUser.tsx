import { IComment } from '..';
import { useGetUserById } from '../../../hooks/useGetUserById';
import Button from '../../Button';
import { useDeleteUploadComment } from '../hooks';

const CommentWithUser: React.FC<{ comment: IComment }> = ({ comment }) => {
  const { user, isUserLoading } = useGetUserById(comment.userId.toString());
  const { mutateDeleteUploadComment } = useDeleteUploadComment();

  return (
    <div className="flex flex-col gap-2 bg-gray-100 p-2 rounded">
      <div className="flex gap-2 justify-between">
        <p className="text-lg">{comment.comment}</p>
        <Button type="tertiary" onClick={() => mutateDeleteUploadComment(Number(comment.id))}>
          Obriši
        </Button>
      </div>
      {isUserLoading ? (
        <p className="text-xs">Loading user...</p>
      ) : (
        <p>od: {user?.data.firstName || `User ${comment.userId}`}</p>
      )}
    </div>
  );
};

export default CommentWithUser;
