import { useState } from 'react';
import { IComment } from '..';
import { useGetUserById } from '../../../hooks/useGetUserById';
import Button from '../../Button';
import { useDeleteUploadComment, useEditUploadComment } from '../hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FieldError from '../../FieldError';
import { useLocalStorage } from '@uidotdev/usehooks';
import Input from '../../Input';
import { Link } from 'react-router-dom';

interface Inputs {
  comment: string;
}

const schema = z.object({
  comment: z.string().min(1),
});

const CommentWithUser: React.FC<{ comment: IComment }> = ({ comment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser] = useLocalStorage('userId');
  const { user, isUserLoading } = useGetUserById(comment?.userId?.toString());
  const { mutateDeleteUploadComment } = useDeleteUploadComment();
  const { mutateEditUploadComment } = useEditUploadComment();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Inputs) => {
    if (isValid) {
      mutateEditUploadComment({ id: Number(comment.id), comment: data.comment });
    }
  };

  const renderFormattedComment = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <Link
            to={`/profile/${part.slice(1)}`}
            key={index}
            className="text-blue-600 font-semibold hover:underline"
          >
            {part}
          </Link>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <form className="flex gap-2 justify-between" onSubmit={handleSubmit(onSubmit)}>
          {errors.comment && <FieldError message="Komentar je obavezan." />}
          <Input
            placeholder="Izmijeni komentar"
            defaultValue={comment.comment}
            type="text"
            className="w-full"
            {...register('comment')}
          />
          <div className="flex gap-2">
            <Button type="tertiary" onClick={() => setIsEditing(false)}>
              Otkaži
            </Button>
            <Button type="tertiary">Sačuvaj</Button>
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
