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
import DOMPurify from 'dompurify';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { useGetImageBlob } from '@app/components/LatestUploads/hooks';
import ContentFormatter from '@app/components/ContentFormatter';
import Image from '@app/components/Image';
import RecordCreatedAt from '@app/components/RecordCreatedAt';
import UserAvatar from '@app/components/UserAvatar';
import ConfirmModal from '@app/components/ConfirmModal';
import { getUserProfilePath } from '@app/utils/userProfilePath';
import { useObjectUrl } from '@app/hooks/useObjectUrl';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState<
    Array<{ id: number; publicId?: string; username: string }>
  >(comment.taggedUsers ?? []);
  const { user: currentUser } = useGetCurrentUser();
  const currentUserId = currentUser?.data.id;
  const { user, isUserLoading } = useGetUserById(comment?.userId?.toString());
  const { mutateDeleteUploadComment } = useDeleteUploadComment(onCommentDeleted);
  const { mutateEditUploadComment } = useEditUploadComment(onCommentUpdated);
  const { data: imageBlob } = useGetImageBlob(comment.securePhotoUrl || '');
  const imageBlobUrl = useObjectUrl(imageBlob);

  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { comment: comment.comment },
  });

  useEffect(() => {
    if (!isEditing) {
      reset({ comment: comment.comment });
    }
  }, [comment.comment, isEditing, reset]);

  const onSubmit = (data: Inputs) => {
    mutateEditUploadComment({
      id: Number(comment.id),
      comment: data.comment.trim(),
      taggedUserIds: taggedUsers.map((user) => Number(user.id)),
      uploadId: comment.uploadId,
    });

    setIsEditing(false);
  };

  const renderFormattedComment = (text: string) => {
    const cleanText = DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
    if (!cleanText) return null;
    const parts = cleanText.split(/(@[\w\d]+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.slice(1);

        const matchedUser = (taggedUsers.length > 0 ? taggedUsers : comment.taggedUsers)?.find(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        );

        if (matchedUser) {
          return (
            <Link to={getUserProfilePath(matchedUser)} key={index} className="text-blue underline">
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
                  onChange={(val) => field.onChange(val)}
                  onTagUsersChange={(users) => {
                    setTaggedUsers(users);
                  }}
                  placeholder="Izmijeni komentar"
                  initialTaggedUsers={taggedUsers}
                />
              )}
            />
            {errors.comment && <FieldError message="Komentar je obavezan." />}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="transparent" htmlType="button" onClick={() => setIsEditing(false)}>
              Otkaži
            </Button>
            <Button type="blue" htmlType="submit" disabled={comment.comment === watch('comment')}>
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
          {imageBlobUrl && (
            <Image
              src={imageBlobUrl}
              alt="Slika"
              className="mt-3 max-h-48 w-full max-w-sm rounded-xl object-cover"
            />
          )}
        </div>
        {String(currentUserId) === String(comment.userId) && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="blue"
              htmlType="button"
              className="rounded-full px-4 py-2 font-semibold shadow-sm shadow-blue/15"
              onClick={() => setIsEditing(true)}
            >
              Izmijeni
            </Button>
            <Button
              type="danger"
              htmlType="button"
              className="rounded-full px-4 py-2 font-semibold"
              onClick={() => setIsDeleteModalOpen(true)}
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
    <>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          mutateDeleteUploadComment({ commentId: Number(comment.id), uploadId: comment.uploadId });
        }}
      >
        <div>
          <h2 className="mb-2 text-2xl font-bold text-gray-950">Obrisati komentar?</h2>
          <p className="text-gray-600">Ova radnja trajno uklanja komentar.</p>
        </div>
      </ConfirmModal>

      <div className="rounded-2xl border border-[#dce4ff] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex min-w-0 items-center gap-2 text-left"
            onClick={() =>
              !isOwnComment &&
              navigate(
                getUserProfilePath({
                  id: comment.userId,
                  publicId: comment.userPublicId ?? user?.data?.publicId,
                })
              )
            }
            disabled={isOwnComment}
          >
            <UserAvatar
              color="#2D46B9"
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
    </>
  );
};

export default CommentWithUser;
