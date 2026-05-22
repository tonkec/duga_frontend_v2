import { Controller, useForm } from 'react-hook-form';
import Button from '@app/components/Button';
import { useAddUploadComment, useGetUploadComments } from './hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams } from 'react-router';
import CommentWithUser from './components/CommentWithUser';
import FieldError from '@app/components/FieldError';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BiPaperclip } from 'react-icons/bi';
import { useRef } from 'react';
import { useSocket } from '@app/context/useSocket';
import MentionInput from '@app/components/MentionInput';
import { IUser } from '@app/components/UserCard';
import { toast } from 'react-toastify';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import { ALLOWED_FILE_TYPES, MAXIMUM_NUMBER_OF_IMAGES } from '@app/utils/consts';
import { init, SearchIndex } from 'emoji-mart';
import { IEmoji } from '@app/pages/ChatPage/components/SendMessage';
import { debounce } from 'lodash';
import EmojiPicker from '../EmojiPicker';
import data from '@emoji-mart/data';
import { areValidImageTypes } from '@app/utils/areValidImageTypes';
import { toastConfig } from '@app/configs/toast.config';
import { removeSpacesAndDashes } from '@app/utils/removeSpacesAndDashes';
import Paginated from '../Paginated';
import Image from '../Image';
import { parseCommentUpdatePayload } from './utils/parseCommentUpdate';

const schema = z
  .object({
    comment: z.string().optional(),
    image: z.any().optional(),
    content: z
      .string()
      .optional()
      .refine((val) => !val || val.trim().length > 0, { message: 'Poruka ne može biti prazna.' }),
  })
  .refine((data) => (data.comment && data.comment.trim().length > 0) || data.image?.length > 0, {
    message: 'Unesi komentar ili dodaj sliku',
    path: ['comment'],
  });

interface Inputs {
  comment: string;
  image?: FileList;
  content: string;
}

export interface IComment {
  id: number;
  comment: string;
  userId: string;
  uploadId: string;
  createdAt: string;
  taggedUsers?: { id: number; username: string }[];
  imageUrl?: string;
  securePhotoUrl?: string;
}

const CommentUpdateContext = createContext<((payload: unknown) => void) | undefined>(undefined);

const PaginatedComment = ({ singleEntry }: { singleEntry: IComment }) => {
  const onCommentUpdated = useContext(CommentUpdateContext);
  return <CommentWithUser comment={singleEntry} onCommentUpdated={onCommentUpdated} />;
};

const PhotoComments = () => {
  init({ data });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentEmojis, setCurrentEmojis] = useState([]);
  const socket = useSocket();
  const { mutateAddUploadComment } = useAddUploadComment();
  const { photoId } = useParams();
  const { allComments: allCommentsData, areCommentsLoading } = useGetUploadComments(
    photoId as string
  );
  const { allUserImages } = useGetAllUserImages();

  const [allComments, setAllComments] = useState<IComment[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<IUser[]>([]);

  const applyCommentUpdate = useCallback(
    (payload: unknown) => {
      const updated = parseCommentUpdatePayload(payload);
      if (!updated?.id) return;
      if (updated.uploadId && photoId && String(updated.uploadId) !== String(photoId)) return;

      setAllComments((prev) =>
        prev.map((comment) =>
          Number(comment.id) === Number(updated.id)
            ? {
                ...comment,
                comment: updated.comment ?? comment.comment,
                taggedUsers: updated.taggedUsers ?? comment.taggedUsers,
              }
            : comment
        )
      );
    },
    [photoId]
  );

  const {
    handleSubmit,
    formState: { isValid, errors },
    reset,
    control,
    watch,
    setValue,
    getValues,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: '',
    },
  });

  const imageFileList = watch('image');
  const selectedImageFile = imageFileList?.[0];
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onSubmit = async (data: Inputs) => {
    if (!photoId || !isValid) return;

    if (data?.image?.length + allUserImages?.data?.length > MAXIMUM_NUMBER_OF_IMAGES) {
      toast.error(`Ukupan maksimalan broj slika je ${MAXIMUM_NUMBER_OF_IMAGES}`);
      return;
    }

    const formData = new FormData();
    formData.append('uploadId', photoId);
    formData.append('comment', data?.comment || '');
    if (taggedUsers.length > 0) {
      formData.append('taggedUserIds', JSON.stringify(taggedUsers.map((u) => u.id)));
    }
    if (data.image?.[0]) {
      const originalFile = data.image[0];
      const cleanedName = removeSpacesAndDashes(originalFile.name.trim()).toLowerCase();

      const cleanedFile = new File([originalFile], cleanedName, {
        type: originalFile.type,
      });

      formData.append('commentImage', cleanedFile);
    }

    mutateAddUploadComment(formData);
    setTaggedUsers([]);
    setCurrentEmojis([]);
    reset({ comment: '', content: '', image: undefined });
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setValue('image', undefined);
  };

  const hasHydratedFromApi = useRef(false);

  useEffect(() => {
    hasHydratedFromApi.current = false;
  }, [photoId]);

  useEffect(() => {
    if (!areCommentsLoading && allCommentsData?.data && !hasHydratedFromApi.current) {
      setAllComments(allCommentsData.data as IComment[]);
      hasHydratedFromApi.current = true;
    }
  }, [areCommentsLoading, allCommentsData?.data, photoId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive-comment', (data) => {
      setAllComments((prev) => [data.data, ...prev]);
    });

    socket.on('remove-comment', (payload) => {
      const { id, uploadId } = payload?.data ?? {};
      if (!id) return;
      if (uploadId && photoId && String(uploadId) !== String(photoId)) return;

      setAllComments((prev) => prev.filter((comment) => comment.id !== Number(id)));
    });

    const handleCommentUpdate = (payload: unknown) => {
      try {
        applyCommentUpdate(payload);
      } catch (error) {
        console.error('Error updating comment:', error);
        toast.error('Greška prilikom ažuriranja komentara');
      }
    };

    socket.on('update-comment', handleCommentUpdate);
    socket.on('edit-comment', handleCommentUpdate);

    return () => {
      socket.off('receive-comment');
      socket.off('remove-comment');
      socket.off('update-comment', handleCommentUpdate);
      socket.off('edit-comment', handleCommentUpdate);
    };
  }, [applyCommentUpdate, photoId, socket]);

  useEffect(() => {
    if (!selectedImageFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedImageFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedImageFile]);

  const sortedComments = useMemo(
    () =>
      [...allComments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [allComments]
  );

  async function search(value: string) {
    const emojis = await SearchIndex.search(value);
    const results = emojis.map((emoji: IEmoji) => {
      return emoji.skins[0].native;
    });

    return results;
  }

  return (
    <CommentUpdateContext.Provider value={applyCommentUpdate}>
      <div className="flex flex-col gap-2 ">
        {!!sortedComments.length && (
          <Paginated<IComment>
            itemsPerPage={3}
            gridClassName="grid grid-cols-1 gap-2"
            data={sortedComments}
            paginatedSingle={PaginatedComment}
            getItemKey={(item) => item.id}
          />
        )}
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
                    accept={ALLOWED_FILE_TYPES}
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (!e.target.files) {
                        return;
                      }

                      if (!areValidImageTypes(e.target.files)) {
                        toast.error(`Dozvoljeni formati su ${ALLOWED_FILE_TYPES}!`, toastConfig);
                        return;
                      }

                      field.onChange(e.target.files);
                    }}
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
            render={({ field }) => {
              const handleSearch = async (value: string) => {
                const emojiRegex = /(?:\s|^):([^\s:]+)/;
                const match = value.match(emojiRegex);

                if (match) {
                  const searchTerm = match[1];
                  const emojis = await search(searchTerm);
                  setCurrentEmojis(emojis);
                } else {
                  setCurrentEmojis([]);
                }
              };

              const debouncedSearch = debounce(handleSearch, 300);
              return (
                <MentionInput
                  value={field.value}
                  onChange={(e) => {
                    const value = e;
                    debouncedSearch(value);
                    field.onChange(value);
                  }}
                  onTagUsersChange={setTaggedUsers}
                  placeholder="Dodaj komentar"
                  className="flex-grow"
                />
              );
            }}
          />

          <EmojiPicker
            emojis={currentEmojis}
            onEmojiSelect={(emoji: string) => {
              const currentComment = getValues('comment');
              const updatedComment = currentComment?.replace(/(?:\s|^):([^\s:]+)?/, emoji);
              setValue('comment', updatedComment, { shouldValidate: true });
              setCurrentEmojis([]);
            }}
          />

          <Button type="primary">Komentiraj</Button>
        </div>

        {previewUrl && (
          <div className="relative w-fit">
            <Image
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
    </CommentUpdateContext.Provider>
  );
};

export default PhotoComments;
