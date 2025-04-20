import { Controller, useForm } from 'react-hook-form';
import Button from '@app/components/Button';
import { useAddUploadComment, useGetUploadComments } from './hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useParams } from 'react-router';
import CommentWithUser from './components/CommentWithUser';
import FieldError from '@app/components/FieldError';
import { useEffect, useState } from 'react';
import { BiPaperclip } from 'react-icons/bi';
import { useRef } from 'react';
import Paginated from '@app/components/Paginated';
import { useSocket } from '@app/context/useSocket';
import MentionInput from '@app/components/MentionInput';
import { IUser } from '@app/components/UserCard';
import { toast } from 'react-toastify';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import { MAXIMUM_NUMBER_OF_IMAGES } from '@app/utils/consts';

const schema = z
  .object({
    comment: z.string().optional(),
    image: z.any().optional(),
  })
  .refine((data) => (data.comment && data.comment.trim().length > 0) || data.image?.length > 0, {
    message: 'Unesi komentar ili dodaj sliku',
    path: ['comment'],
  });

interface Inputs {
  comment: string;
  image?: FileList;
}

export interface IComment {
  id: number;
  comment: string;
  userId: string;
  uploadId: string;
  createdAt: string;
  taggedUsers?: { id: number; username: string }[];
  imageUrl?: string;
}

const PhotoComments = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const socket = useSocket();
  const { mutateAddUploadComment } = useAddUploadComment();
  const [userId] = useLocalStorage('userId');
  const { photoId } = useParams();
  const { allComments: allCommentsData, areCommentsLoading } = useGetUploadComments(
    photoId as string
  );
  const { allUserImages } = useGetAllUserImages(userId as string);
  const [allComments, setAllComments] = useState<IComment[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<IUser[]>([]);
  const {
    handleSubmit,
    formState: { isValid, errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const imageFileList = watch('image');
  const selectedImageFile = imageFileList?.[0];
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onSubmit = async (data: Inputs) => {
    if (!userId || !photoId || !isValid) return;

    if (allUserImages?.data?.length > MAXIMUM_NUMBER_OF_IMAGES) {
      toast.error(`Ukupan maksimalan broj slika je ${MAXIMUM_NUMBER_OF_IMAGES}`);
      return;
    }

    const formData = new FormData();
    formData.append('userId', String(userId));
    formData.append('uploadId', photoId);
    formData.append('comment', data?.comment || '');
    if (taggedUsers.length > 0) {
      formData.append('taggedUserIds', JSON.stringify(taggedUsers.map((u) => u.id)));
    }
    if (data.image?.[0]) {
      formData.append('commentImage', data.image[0]);
    }

    mutateAddUploadComment(formData);
    reset();
    setTaggedUsers([]);
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setValue('image', undefined);
  };

  useEffect(() => {
    if (!areCommentsLoading) {
      setAllComments(allCommentsData?.data as IComment[]);
    }

    socket.on('receive-comment', (data) => {
      setAllComments((prev) => [...prev, data.data]);
    });

    socket.on('remove-comment', (data) => {
      setAllComments((prev) => {
        const updatedComments = prev.filter(
          (comment) => comment.id !== Number(data.data.commentId)
        );
        return updatedComments;
      });
    });

    socket.on('update-comment', (response) => {
      try {
        const updatedComment = response.data?.data;
        if (!updatedComment?.id) return;

        setAllComments((prev) =>
          prev.map((comment) =>
            Number(comment.id) === Number(updatedComment.id) ? updatedComment : comment
          )
        );
      } catch (error) {
        console.error('Error updating comment:', error);
        toast.error('Greška prilikom ažuriranja komentara');
      }
    });

    return () => {
      socket.off('receive-comment');
      socket.off('delete-comment');
      socket.off('update-comment');
    };
  }, [areCommentsLoading, allCommentsData, socket]);

  useEffect(() => {
    if (!selectedImageFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedImageFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedImageFile]);

  const sortedComments = allComments?.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      <div className="flex flex-col gap-2 ">
        <div>
          <Paginated<IComment>
            itemsPerPage={5}
            gridClassName="grid grid-cols-1 gap-2"
            data={sortedComments}
            paginatedSingle={({ singleEntry }: { singleEntry: IComment }) => (
              <CommentWithUser comment={singleEntry} />
            )}
          />
        </div>
      </div>

      <form className="w-full flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full justify-between items-center gap-2">
          <Controller
            name="image"
            control={control}
            render={({ field }) => {
              const handleIconClick = () => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                  fileInputRef.current.click();
                }
              };
              return (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => field.onChange(e.target.files)}
                  />
                  <BiPaperclip
                    fontSize={20}
                    style={{ transform: 'rotate(90deg)' }}
                    className="cursor-pointer text-gray-600 hover:text-gray-800"
                    onClick={handleIconClick}
                  />
                </>
              );
            }}
          />

          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <MentionInput
                value={field.value}
                onChange={field.onChange}
                onTagUsersChange={setTaggedUsers}
                placeholder="Dodaj komentar"
                className="flex-grow"
              />
            )}
          />

          <Button type="primary">Komentiraj</Button>
        </div>

        {previewUrl && (
          <div className="relative w-fit">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-[150px] rounded-md border border-gray-300"
            />
            <Button type="danger" className="mt-2" onClick={clearImage}>
              Makni
            </Button>
          </div>
        )}
      </form>

      {errors.comment && <FieldError message="Komentar je obavezan" />}
    </>
  );
};

export default PhotoComments;
