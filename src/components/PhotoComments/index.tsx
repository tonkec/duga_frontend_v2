import { Controller, useForm } from 'react-hook-form';
import Button from '@app/components/Button';
import { useAddUploadComment, useGetUploadComments } from './hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams } from 'react-router';
import CommentWithUser from './components/CommentWithUser';
import FieldError from '@app/components/FieldError';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  BiAt,
  BiHeart,
  BiMessageRoundedDots,
  BiPaperclip,
  BiSmile,
  BiSolidFileGif,
} from 'react-icons/bi';
import { useRef } from 'react';
import { useSocket } from '@app/context/useSocket';
import MentionInput from '@app/components/MentionInput';
import { toast } from 'react-toastify';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import {
  ALLOWED_FILE_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
  MAXIMUM_NUMBER_OF_IMAGES,
} from '@app/utils/consts';
import { init } from 'emoji-mart';
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
import GiphySearch from '../GiphySearch';
import EmojiSearch from '../EmojiSearch';
import {
  getEmojiSearchQueryFromText,
  replaceEmojiToken,
  searchEmojiNatives,
} from '@app/utils/emojis';
import { useObjectUrl } from '@app/hooks/useObjectUrl';
import { getSafeRemoteImageUrl } from '@app/utils/mediaSafety';

const schema = z
  .object({
    comment: z.string().optional(),
    image: z.any().optional(),
    gifUrl: z.string().optional(),
    content: z
      .string()
      .optional()
      .refine((val) => !val || val.trim().length > 0, { message: 'Poruka ne može biti prazna.' }),
  })
  .refine(
    (data) => {
      return (
        (data.comment && data.comment.trim().length > 0) ||
        data.image?.length > 0 ||
        Boolean(data.gifUrl)
      );
    },
    {
      message: 'Unesi komentar, dodaj sliku ili GIF',
      path: ['comment'],
    }
  );

const MAX_IMAGE_FILE_SIZE_MB = Math.floor(MAX_IMAGE_FILE_SIZE_BYTES / (1024 * 1024));

interface Inputs {
  comment: string;
  image?: FileList;
  gifUrl?: string;
  content: string;
}

export interface IComment {
  id: number;
  comment: string;
  userId: string;
  userPublicId?: string;
  uploadId: string;
  createdAt: string;
  taggedUsers?: { id: number; publicId?: string; username: string }[];
  imageUrl?: string;
  securePhotoUrl?: string;
}

const CommentUpdateContext = createContext<((payload: unknown) => void) | undefined>(undefined);
const CommentDeleteContext = createContext<((commentId: number) => void) | undefined>(undefined);

const PaginatedComment = ({ singleEntry }: { singleEntry: IComment }) => {
  const onCommentUpdated = useContext(CommentUpdateContext);
  const onCommentDeleted = useContext(CommentDeleteContext);
  return (
    <CommentWithUser
      comment={singleEntry}
      onCommentUpdated={onCommentUpdated}
      onCommentDeleted={onCommentDeleted}
    />
  );
};

const PhotoComments = () => {
  init({ data });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentEmojis, setCurrentEmojis] = useState<string[]>([]);
  const socket = useSocket();
  const { mutateAddUploadComment, isAddingUploadComment } = useAddUploadComment();
  const { photoId } = useParams();
  const { allComments: allCommentsData, areCommentsLoading } = useGetUploadComments(
    photoId as string
  );
  const { allUserImages } = useGetAllUserImages();

  const [allComments, setAllComments] = useState<IComment[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<
    Array<{ id: number; publicId?: string; username: string }>
  >([]);
  const [showGiphySearch, setShowGiphySearch] = useState(false);
  const [showEmojiSearch, setShowEmojiSearch] = useState(false);

  const addCommentToState = useCallback((comment: IComment | undefined) => {
    if (!comment?.id) return;

    setAllComments((prev) => {
      if (prev.some((currentComment) => Number(currentComment.id) === Number(comment.id))) {
        return prev;
      }

      return [comment, ...prev];
    });
  }, []);

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

  const removeComment = useCallback((commentId: number) => {
    setAllComments((prev) => prev.filter((comment) => Number(comment.id) !== Number(commentId)));
  }, []);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
    getValues,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      content: '',
      comment: '',
      image: undefined,
      gifUrl: '',
    },
  });

  const imageFileList = watch('image');
  const selectedImageFile = imageFileList?.[0];
  const selectedGifUrl = watch('gifUrl');
  const previewUrl = useObjectUrl(selectedImageFile);

  const onSubmit = async (data: Inputs) => {
    if (!photoId) return;

    const existingImagesCount = Array.isArray(allUserImages?.data)
      ? allUserImages.data.length
      : allUserImages?.data?.images?.length || 0;
    const selectedImagesCount = data?.image?.length || 0;

    if (selectedImagesCount + existingImagesCount > MAXIMUM_NUMBER_OF_IMAGES) {
      toast.error(`Ukupan maksimalan broj slika je ${MAXIMUM_NUMBER_OF_IMAGES}`);
      return;
    }

    if (data.image?.length && !areValidImageTypes(data.image)) {
      toast.error(
        `Dozvoljeni formati su ${ALLOWED_FILE_TYPES}, do ${MAX_IMAGE_FILE_SIZE_MB} MB po slici!`,
        toastConfig
      );
      return;
    }

    const formData = new FormData();
    formData.append('uploadId', photoId);
    const trimmedComment = data?.comment.trim() || '';
    const commentWithGif = data.gifUrl
      ? [trimmedComment, data.gifUrl].filter(Boolean).join(' ')
      : trimmedComment;

    formData.append('comment', commentWithGif);
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

    mutateAddUploadComment(formData, {
      onSuccess: (response) => {
        addCommentToState(response.data as IComment);
        setTaggedUsers([]);
        setCurrentEmojis([]);
        setShowGiphySearch(false);
        setShowEmojiSearch(false);
        reset({ comment: '', content: '', image: undefined, gifUrl: '' });
      },
    });
  };

  const clearImage = () => {
    setValue('image', undefined);
  };

  const clearGif = () => {
    setValue('gifUrl', '', { shouldValidate: true });
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

    const handleReceiveComment = (data: { data?: IComment }) => {
      const comment = data.data;
      if (!comment?.uploadId || !photoId || String(comment.uploadId) !== String(photoId)) return;

      addCommentToState(comment);
    };

    const handleRemoveComment = (payload: {
      data?: { id?: number | string; uploadId?: string };
    }) => {
      const { id, uploadId } = payload?.data ?? {};
      if (!id || !uploadId || !photoId || String(uploadId) !== String(photoId)) return;

      removeComment(Number(id));
    };

    const handleCommentUpdate = (payload: unknown) => {
      try {
        applyCommentUpdate(payload);
      } catch {
        toast.error('Greška prilikom ažuriranja komentara');
      }
    };

    socket.on('receive-comment', handleReceiveComment);
    socket.on('remove-comment', handleRemoveComment);
    socket.on('update-comment', handleCommentUpdate);
    socket.on('edit-comment', handleCommentUpdate);

    return () => {
      socket.off('receive-comment', handleReceiveComment);
      socket.off('remove-comment', handleRemoveComment);
      socket.off('update-comment', handleCommentUpdate);
      socket.off('edit-comment', handleCommentUpdate);
    };
  }, [addCommentToState, applyCommentUpdate, photoId, removeComment, socket]);

  const sortedComments = useMemo(
    () =>
      [...allComments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [allComments]
  );

  return (
    <CommentUpdateContext.Provider value={applyCommentUpdate}>
      <CommentDeleteContext.Provider value={removeComment}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue">Komentari</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {sortedComments.length
                ? `${sortedComments.length} komentara`
                : 'Budi prva osoba koja komentira'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Podijeli reakciju, dodaj GIF ili označi osobu kojoj želiš odgovoriti.
            </p>
          </div>
          <span className="w-fit rounded-full border border-[#dce4ff] bg-[#f7f9ff] px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
            Razgovor uz fotografiju
          </span>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
          <div className="min-w-0">
            <form
              className="mb-5 rounded-3xl border border-[#dce4ff] bg-[#f7f9ff] p-4 shadow-sm"
              onSubmit={handleSubmit(onSubmit)}
              data-testid="photo-comment-form"
            >
              <div className="grid w-full gap-3">
                <Controller
                  name="comment"
                  control={control}
                  render={({ field }) => {
                    const handleSearch = async (value: string) => {
                      const searchTerm = getEmojiSearchQueryFromText(value);

                      if (searchTerm) {
                        const emojis = await searchEmojiNatives(searchTerm);
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
                        className="min-w-0"
                        data-testid="photo-comment-input"
                      />
                    );
                  }}
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
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
                                  toast.error(
                                    `Dozvoljeni formati su ${ALLOWED_FILE_TYPES}, do ${MAX_IMAGE_FILE_SIZE_MB} MB po slici!`,
                                    toastConfig
                                  );
                                  return;
                                }

                                field.onChange(e.target.files);
                              }}
                            />
                            <button
                              type="button"
                              className="grid h-12 w-12 place-items-center rounded-full bg-white text-gray-600 shadow-sm transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={handleIconClick}
                              disabled={isAddingUploadComment}
                              aria-label="Dodaj sliku"
                            >
                              <BiPaperclip fontSize={20} style={{ transform: 'rotate(90deg)' }} />
                            </button>
                          </>
                        );
                      }}
                    />

                    <EmojiPicker
                      emojis={currentEmojis}
                      onEmojiSelect={(emoji: string) => {
                        const currentComment = getValues('comment');
                        const updatedComment = replaceEmojiToken(currentComment, emoji);
                        setValue('comment', updatedComment, { shouldValidate: true });
                        setCurrentEmojis([]);
                      }}
                    />

                    <button
                      type="button"
                      className="grid h-12 w-12 place-items-center rounded-full bg-white text-gray-600 shadow-sm transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => {
                        setShowGiphySearch((isOpen) => !isOpen);
                        setShowEmojiSearch(false);
                      }}
                      disabled={isAddingUploadComment}
                      aria-label="Dodaj GIF"
                    >
                      <BiSolidFileGif fontSize={20} />
                    </button>

                    <button
                      type="button"
                      className="grid h-12 w-12 place-items-center rounded-full bg-white text-gray-600 shadow-sm transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => {
                        setShowEmojiSearch((isOpen) => !isOpen);
                        setShowGiphySearch(false);
                        setCurrentEmojis([]);
                      }}
                      disabled={isAddingUploadComment}
                      aria-label="Dodaj emoji"
                    >
                      <BiSmile fontSize={20} />
                    </button>
                  </div>

                  <Button
                    type="blue"
                    className="w-full rounded-2xl py-4 text-base font-semibold sm:w-auto sm:px-8"
                    disabled={isAddingUploadComment}
                    data-testid="photo-comment-submit"
                  >
                    {isAddingUploadComment ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Slanje
                      </span>
                    ) : (
                      'Pošalji'
                    )}
                  </Button>
                </div>
              </div>

              <GiphySearch
                onGifSelect={(gifUrl) => {
                  const safeGifUrl = getSafeRemoteImageUrl(gifUrl);
                  if (safeGifUrl) {
                    setValue('gifUrl', safeGifUrl, { shouldValidate: true });
                  }
                }}
                isOpen={showGiphySearch}
                onClose={() => setShowGiphySearch(false)}
              />
              <EmojiSearch
                isOpen={showEmojiSearch}
                onClose={() => setShowEmojiSearch(false)}
                onEmojiSelect={(emoji) => {
                  const currentComment = getValues('comment') ?? '';
                  setValue('comment', `${currentComment}${emoji}`, { shouldValidate: true });
                }}
              />

              {previewUrl && (
                <div className="mt-3 flex items-end gap-3">
                  <div className="relative">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-[150px] rounded-xl border border-[#dce4ff]"
                    />
                    {isAddingUploadComment && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-sm font-semibold text-white">
                        Slanje...
                      </div>
                    )}
                  </div>
                  <Button
                    type="danger"
                    htmlType="button"
                    onClick={clearImage}
                    disabled={isAddingUploadComment}
                  >
                    Makni
                  </Button>
                </div>
              )}

              {selectedGifUrl && (
                <div className="mt-3 flex items-end gap-3">
                  <div className="relative">
                    <Image
                      src={selectedGifUrl}
                      alt="GIF preview"
                      className="max-w-[150px] rounded-xl border border-[#dce4ff]"
                    />
                    {isAddingUploadComment && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-sm font-semibold text-white">
                        Slanje...
                      </div>
                    )}
                  </div>
                  <Button
                    type="danger"
                    htmlType="button"
                    onClick={clearGif}
                    disabled={isAddingUploadComment}
                  >
                    Makni
                  </Button>
                </div>
              )}

              {errors.comment && <FieldError message="Unesi komentar, dodaj sliku ili GIF" />}
            </form>

            <div className="flex flex-col gap-3">
              {areCommentsLoading && (
                <div className="rounded-2xl border border-[#dce4ff] bg-white py-8">
                  <Loader variant="inline" label="Učitavanje komentara..." />
                </div>
              )}

              {!areCommentsLoading && !sortedComments.length && (
                <div
                  className="rounded-2xl border border-dashed border-[#dce4ff] bg-white p-6 text-center text-gray-600"
                  data-testid="photo-comments-empty"
                >
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
          </div>

          <aside className="rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-white via-[#fbfcff] to-[#f7f9ff] p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue">Ideje</p>
            <h2 className="mt-1 text-lg font-bold text-gray-950">Pokreni razgovor</h2>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <BiMessageRoundedDots className="mb-2 text-blue" size={22} />
                <p className="text-sm font-semibold text-gray-950">Napiši kratku reakciju</p>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Jedna iskrena rečenica je dosta.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <BiAt className="mb-2 text-blue" size={22} />
                <p className="text-sm font-semibold text-gray-950">Označi osobu</p>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Koristi @ ako se nadovezuješ na nekoga.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <BiHeart className="mb-2 text-red" size={22} />
                <p className="text-sm font-semibold text-gray-950">Budi podržavajuć_a</p>
                <p className="mt-1 text-xs leading-5 text-gray-600">
                  Komentari su prostor za ugodan razgovor.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </CommentDeleteContext.Provider>
    </CommentUpdateContext.Provider>
  );
};

export default PhotoComments;
