import { useState } from 'react';
import { IComment } from '..';
import { useGetUserById } from '../../../hooks/useGetUserById';
import Button from '../../Button';
import { useDeleteUploadComment, useEditUploadComment } from '../hooks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FieldError from '../../FieldError';
import { useLocalStorage } from '@uidotdev/usehooks';
import MentionInput from '../../MentionInput';
import { Link } from 'react-router-dom';
import { IUser } from '../../UserCard';

interface Inputs {
  comment: string;
}

const schema = z.object({
  comment: z.string().min(1),
});

const CommentWithUser: React.FC<{ comment: IComment }> = ({ comment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState<IUser[]>([]);
  const [currentUser] = useLocalStorage('userId');
  const { user, isUserLoading } = useGetUserById(comment?.userId?.toString());
  const { mutateDeleteUploadComment } = useDeleteUploadComment();
  const { mutateEditUploadComment } = useEditUploadComment();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: { comment: comment.comment },
  });

  const onSubmit = (data: Inputs) => {
    if (!isValid) return;

    mutateEditUploadComment({
      id: Number(comment.id),
      comment: data.comment,
      taggedUserIds: taggedUsers.map((user) => Number(user.id)),
    });

    setIsEditing(false);
  };

  const renderFormattedComment = (text: string) => {
    const parts = text.split(/(@\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);
        const matchedUser = comment.taggedUsers?.find(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        );
        if (matchedUser) {
          return (
            <Link to={`/user/${matchedUser.id}`} key={index} className="text-blue underline">
              {part}
            </Link>
          );
        }
      }

      return <span key={index}>{part}</span>;
    });
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <form className="flex gap-2 justify-between w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col w-full">
            <Controller
              name="comment"
              control={control}
              render={({ field }) => (
                <MentionInput
                  value={field.value}
                  onChange={field.onChange}
                  onTagUsersChange={setTaggedUsers}
                  placeholder="Izmijeni komentar"
                />
              )}
            />
            {errors.comment && <FieldError message="Komentar je obavezan." />}
          </div>
          <div className="flex gap-2 items-start pt-1">
            <Button type="tertiary" onClick={() => setIsEditing(false)}>
              Otkaži
            </Button>
            <Button type="tertiary">Spremi</Button>
          </div>
        </form>
      );
    }

    return (
      <div className="flex gap-2 justify-between">
        <p className="text-lg">{renderFormattedComment(comment.comment)}</p>
        {currentUser === comment.userId && (
          <div className="flex gap-2">
            <Button type="tertiary" onClick={() => setIsEditing(true)}>
              Izmijeni
            </Button>
            <Button type="tertiary" onClick={() => mutateDeleteUploadComment(Number(comment.id))}>
              Obriši
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1 bg-gray-100 p-2 rounded">
      {renderContent()}
      {isUserLoading ? (
        <p className="text-xs">Loading user...</p>
      ) : (
        <p>od: {user?.data.username || `User ${comment.userId}`}</p>
      )}
    </div>
  );
};

export default CommentWithUser;
