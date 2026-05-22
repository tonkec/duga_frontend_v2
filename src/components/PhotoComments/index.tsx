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
import Loader from '../Loader';

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

    const existingImagesCount = Array.isArray(allUserImages?.data)
      ? allUserImages.data.length
      : allUserImages?.data?.images?.length || 0;
    const selectedImagesCount = data?.image?.length || 0;

    if (selectedImagesCount + existingImagesCount > MAXIMUM_NUMBER_OF_IMAGES) {
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
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue">Komentari</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          {sortedComments.length
            ? `${sortedComments.length} komentara`
            : 'Budi prva osoba koja komentira'}
        </h1>
      </div>

      <form
        className="mb-5 rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex w-full items-center gap-2">
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
                  <button
                    type="button"
                    className="rounded-full bg-white p-2 text-gray-600 shadow-sm hover:text-gray-900"
                    onClick={handleIconClick}
                    aria-label="Dodaj sliku"
                  >
                    <BiPaperclip fontSize={20} style={{ transform: 'rotate(90deg)' }} />
                  </button>
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

          <Button type="blue">Pošalji</Button>
        </div>

        {previewUrl && (
          <div className="mt-3 flex items-end gap-3">
            <Image
              src={previewUrl}
              alt="Preview"
              className="max-w-[150px] rounded-xl border border-[#dce4ff]"
            />
            <Button type="danger" onClick={clearImage}>
              Makni
            </Button>
          </div>
        )}

        {errors.comment && <FieldError message="Unesi komentar ili dodaj sliku" />}
      </form>

      <div className="flex flex-col gap-3">
        {areCommentsLoading && <Loader />}

        {!areCommentsLoading && !sortedComments.length && (
          <div className="rounded-2xl border border-dashed border-[#dce4ff] bg-white p-6 text-center text-gray-600">
            Još nema komentara.
          </div>
        )}

        {!areCommentsLoading && !!sortedComments.length && (
          <Paginated<IComment>
            itemsPerPage={3}
            gridClassName="grid grid-cols-1 gap-3"
            data={sortedComments}
            paginatedSingle={PaginatedComment}
            getItemKey={(item) => item.id}
          />
        )}
      </div>
    </CommentUpdateContext.Provider>
  );
};

export default PhotoComments;
