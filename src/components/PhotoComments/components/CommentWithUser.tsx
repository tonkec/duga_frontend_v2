import { useState } from 'react';
import { IComment } from '..';
import CommentEditForm from './CommentEditForm';
import CommentContent from './CommentContent';
import Commenter from './Commenter';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Button from '@app/components/Button';
import { useDeleteUploadComment, useEditUploadComment } from '@app/components/PhotoComments/hooks';
import { useLocalStorage } from '@uidotdev/usehooks';
import { IUser } from '@app/components/UserCard';

const CommentWithUser: React.FC<{ comment: IComment }> = ({ comment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser] = useLocalStorage('userId');
  const { user, isUserLoading } = useGetUserById(comment?.userId?.toString());
  const { mutateDeleteUploadComment } = useDeleteUploadComment();
  const { mutateEditUploadComment } = useEditUploadComment();

  const handleEditSubmit = (newComment: string, taggedUsers: IUser[]) => {
    mutateEditUploadComment({
      id: Number(comment.id),
      comment: newComment,
      taggedUserIds: taggedUsers.map((user) => Number(user.id)),
    });
    setIsEditing(false);
  };
  return (
    <div className="bg-gray-100 p-2 rounded">
      {isEditing ? (
        <CommentEditForm
          defaultValue={comment?.comment || ''}
          onCancel={() => setIsEditing(false)}
          onSubmitForm={handleEditSubmit}
        />
      ) : (
        <>
          <CommentContent comment={comment} />
          <div className="flex items-center justify-between gap-2 mt-4">
            <Commenter isUserLoading={isUserLoading} user={user?.data} />

            {currentUser === comment.userId && (
              <div className="flex gap-2">
                <Button type="tertiary" onClick={() => setIsEditing(true)}>
                  Izmijeni
                </Button>
                <Button
                  type="tertiary"
                  onClick={() => mutateDeleteUploadComment(Number(comment.id))}
                >
                  Obriši
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentWithUser;
