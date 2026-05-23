import { useEffect, useState } from 'react';
import { IComment } from '..';
import { useGetUserById } from '@app/hooks/useGetUserById';
import Button from '@app/components/Button';
import { useDeleteUploadComment, useEditUploadComment } from '@app/components/PhotoComments/hooks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FieldError from '@app/components/FieldError';
import MentionInput from '@app/components/MentionInput';
import { Link, useNavigate } from 'react-router-dom';
import { IUser } from '@app/components/UserCard';
import DOMPurify from 'dompurify';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import ContentFormatter from '@app/components/ContentFormatter';
import Image from '@app/components/Image';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import UserAvatar from '@app/components/UserAvatar';

interface Inputs {
  comment: string;
}

const schema = z.object({
  comment: z.string().min(1),
});

const CommentWithUser: React.FC<{
  comment: IComment;
  onCommentUpdated?: (payload: unknown) => void;
  onCommentDeleted?: (commentId: number) => void;
}> = ({ comment, onCommentUpdated, onCommentDeleted }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState<IUser[]>([]);
  const { user: currentUser } = useGetCurrentUser();
  const currentUserId = currentUser?.data.id;
  const { user, isUserLoading } = useGetUserById(comment?.userId?.toString());
  const { mutateDeleteUploadComment } = useDeleteUploadComment(onCommentDeleted);
  const { mutateEditUploadComment } = useEditUploadComment(onCommentUpdated);
  const { data: imageBlob } = useGetImageBlob(comment.securePhotoUrl || '');

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: { comment: comment.comment },
  });

  useEffect(() => {
    if (!isEditing) {
      reset({ comment: comment.comment });
    }
  }, [comment.comment, isEditing, reset]);

  const onSubmit = (data: Inputs) => {
    if (!isValid) return;

    mutateEditUploadComment({
      id: Number(comment.id),
      comment: data.comment,
      taggedUserIds: taggedUsers.map((user) => Number(user.id)),
      uploadId: comment.uploadId,
    });

    setIsEditing(false);
  };

  const renderFormattedComment = (text: string) => {
    const cleanText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    if (!cleanText) return null;
    const parts = cleanText.split(/(@\w+)/g);

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

      return <ContentFormatter key={index} text={part} />;
    });
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <form className="flex flex-col gap-3 w-full" onSubmit={handleSubmit(onSubmit)}>
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
          <div className="flex justify-end gap-2">
            <Button type="transparent" htmlType="button" onClick={() => setIsEditing(false)}>
              Otkaži
            </Button>
            <Button type="blue" htmlType="submit">
              Spremi
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="flex-1">
          {comment.comment && (
            <div className="text-base leading-relaxed text-gray-800">
              {renderFormattedComment(comment.comment)}
            </div>
          )}
          {imageBlob && (
            <Image
              src={URL.createObjectURL(imageBlob)}
              alt="Slika"
              className="mt-3 max-h-64 w-full rounded-xl object-cover"
            />
          )}
        </div>
        {String(currentUserId) === String(comment.userId) && (
          <div className="flex gap-2">
            <Button type="transparent" htmlType="button" onClick={() => setIsEditing(true)}>
              Izmijeni
            </Button>
            <Button
              type="transparent"
              htmlType="button"
              onClick={() => mutateDeleteUploadComment(Number(comment.id))}
            >
              Obriši
            </Button>
          </div>
        )}
      </div>
    );
  };

  const username = user?.data.username || 'Korisnik';
  const isOwnComment = String(currentUserId) === String(comment.userId);

  return (
    <div className="rounded-2xl border border-[#dce4ff] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          className="flex min-w-0 items-center gap-2 text-left"
          onClick={() => !isOwnComment && navigate(`/user/${comment.userId}`)}
          disabled={isOwnComment}
        >
          <UserAvatar
            color="#F037A5"
            userId={String(comment.userId)}
            avatarFallbackName={username}
            className="h-9 w-9 shrink-0 rounded-full"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">
              {isOwnComment ? 'Tvoj komentar' : username}
            </p>
            {!isUserLoading && <RecordCreatedAt createdAt={comment.createdAt} />}
          </div>
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default CommentWithUser;
