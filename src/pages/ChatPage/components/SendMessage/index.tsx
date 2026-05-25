import { useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import Button from '@app/components/Button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FieldError from '@app/components/FieldError';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import { IChat } from '@app/pages/NewChatPage/hooks';
import { IUser } from '@app/components/UserCard';
import { useSocket } from '@app/context/useSocket';
import data from '@emoji-mart/data';
import { SyntheticEvent, useState, useRef, useEffect, useCallback } from 'react';
import { init } from 'emoji-mart';
import EmojiPicker from '@app/components/EmojiPicker';
import { debounce } from 'lodash';
import Input from '@app/components/Input';
import { BiPaperclip, BiSend, BiSmile, BiSolidFileGif } from 'react-icons/bi';
import { useUploadMessageImage } from './hooks';
import GiphySearch from '@app/components/GiphySearch';
import EmojiSearch from '@app/components/EmojiSearch';
import { useGetAllNotifcations, useMarkAsReadNotification } from '@app/components/Navigation/hooks';
import { useGetAllUserImages } from '@app/hooks/useGetAllUserImages';
import { toast } from 'react-toastify';
import { ALLOWED_FILE_TYPES, MAXIMUM_NUMBER_OF_IMAGES } from '@app/utils/consts';
import { areValidImageTypes } from '@app/utils/areValidImageTypes';
import { toastConfig } from '@app/configs/toast.config';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { removeSpacesAndDashes } from '@app/utils/removeSpacesAndDashes';
import Image from '@app/components/Image';
import {
  getEmojiSearchQueryFromText,
  replaceEmojiToken,
  searchEmojiNatives,
} from '@app/utils/emojis';

type Inputs = {
  content: string;
  files: FileList | null;
};

const schema = z
  .object({
    content: z
      .string()
      .optional()
      .refine((val) => !val || val.trim().length > 0, { message: 'Poruka ne može biti prazna.' }),
    files: z
      .any()
      .optional()
      .refine(
        (files) => {
          if (!files) return true;
          return (
            Array.isArray(files) &&
            files.every((file) => file instanceof File && file.size <= 5 * 1024 * 1024)
          );
        },
        { message: 'Datoteka mora biti manja od 5MB.' }
      )
      .refine(
        (files) => {
          if (!files) return true;
          return (
            Array.isArray(files) &&
            files.every((file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type))
          );
        },
        { message: 'Podržani formati su JPG i PNG.' }
      ),
  })
  .refine(
    (data) => {
      return (
        (data.content && data.content.trim().length > 0) || (data.files && data.files.length > 0)
      );
    },
    {
      message: 'Morate unijeti poruku ili dodati datoteku.',
      path: ['content'],
    }
  );

interface ISendMessageProps {
  chatId: string;
  otherUserId: number | undefined | null;
}

interface INotification {
  id: number;
  type: string;
  chatId: number;
  isRead: boolean;
}

export const getMessageImagePath = (chatId: string, timestamp: string, fileName: string) => {
  const cleanedName = removeSpacesAndDashes(fileName.toLowerCase().trim());
  return `chat/${chatId}/${timestamp}/${cleanedName}`;
};

const SendMessage = ({ chatId, otherUserId }: ISendMessageProps) => {
  init({ data });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentEmojis, setCurrentEmojis] = useState<string[]>([]);
  const socket = useSocket();
  const queryClient = useQueryClient();
  const { user: currentUser } = useGetCurrentUser();

  const refreshUserChatsList = () => {
    queryClient.invalidateQueries({ queryKey: ['userChats'] });
  };
  const currentUserId = currentUser?.data?.id;
  const { userChats } = useGetAllUserChats();
  const chat = userChats?.data?.find((chat: IChat) => Number(chat.id) === Number(chatId));
  const [currentUploadableImage, setCurrentUploadableImage] = useState<File[] | null>(null);
  const currentUploadableImageRef = useRef<File[] | null>(null);
  const [imageTimestamp, setImageTimestamp] = useState('');
  const [showGiphySearch, setShowGiphySearch] = useState(false);
  const [showEmojiSearch, setShowEmojiSearch] = useState(false);
  const { allNotifications } = useGetAllNotifcations();
  const { mutateMarkAsRead } = useMarkAsReadNotification();
  const { allUserImages } = useGetAllUserImages();

  const emitStopTyping = useCallback(() => {
    if (!socket || !currentUserId || !otherUserId || !chatId) return;
    socket.emit('stop-typing', {
      chatId,
      userId: currentUserId,
      toUserId: [otherUserId],
    });
  }, [socket, currentUserId, otherUserId, chatId]);

  const emitTyping = useCallback(() => {
    if (!socket || !currentUserId || !otherUserId || !chatId) return;
    socket.emit('typing', {
      chatId,
      userId: currentUserId,
      toUserId: [otherUserId],
    });
  }, [socket, currentUserId, otherUserId, chatId]);

  useEffect(() => {
    return () => {
      emitStopTyping();
    };
  }, [emitStopTyping]);

  const sendGif = (gifUrl: string) => {
    const msg = {
      type: 'gif',
      fromUserId: currentUserId,
      fromUser: currentUser?.data,
      toUserId: chat.Users && chat.Users.map((user: IUser) => user.id),
      chatId,
      messagePhotoUrl: gifUrl,
    };
    socket?.emit('message', msg);
    refreshUserChatsList();
    setShowGiphySearch(false);
    setShowEmojiSearch(false);
  };

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    getValues,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: '',
      files: null,
    },
  });

  const emitImageToSockets = () => {
    const uploadableImages = currentUploadableImageRef.current;
    if (uploadableImages) {
      uploadableImages.forEach((file: File) => {
        socket?.emit('message', {
          type: 'file',
          fromUserId: currentUserId,
          fromUser: currentUser?.data,
          toUserId: chat.Users && chat.Users.map((user: IUser) => user.id),
          chatId,
          messagePhotoUrl: getMessageImagePath(chatId, imageTimestamp, file.name),
          message: null,
        });
      });
      refreshUserChatsList();
    }

    currentUploadableImageRef.current = null;
    setCurrentUploadableImage(null);
    reset({ content: '', files: null });
  };

  const clearSelectedFiles = () => {
    currentUploadableImageRef.current = null;
    setCurrentUploadableImage(null);
    setValue('files', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setImageTimestamp(String(Date.now()));
  };

  const { uploadMessageImage, isUploadingMessageImage } = useUploadMessageImage(
    emitImageToSockets,
    clearSelectedFiles
  );

  const onImageSubmit = () => {
    const files =
      currentUploadableImageRef.current ?? Array.from(fileInputRef.current?.files ?? []);
    if (!files?.length) return;
    currentUploadableImageRef.current = files;

    if (files.length + (allUserImages?.data?.length || 0) > MAXIMUM_NUMBER_OF_IMAGES) {
      toast.error(`Maksimalan broj svih slika je ${MAXIMUM_NUMBER_OF_IMAGES}`);
      return;
    }

    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('fromUserId', currentUserId as string);
    formData.append('timestamp', imageTimestamp);

    files.forEach((file: File) => {
      const cleanedName = removeSpacesAndDashes(file.name.toLowerCase().trim());
      const cleanedFile = new File([file], cleanedName, { type: file.type });
      formData.append('avatars', cleanedFile);
    });

    uploadMessageImage(formData);
  };

  const onMessageSubmit = (data: Inputs) => {
    const toUserId = chat.Users?.filter(
      (user: IUser) => !!user?.id && user.id !== Number(currentUserId)
    ).map((user: IUser) => user.id);

    const msg = {
      type: 'text',
      fromUserId: currentUserId,
      fromUser: currentUser?.data,
      toUserId,
      chatId,
      message: data.content,
    };

    if (toUserId?.length) {
      socket?.emit('message', msg);
      refreshUserChatsList();
    }

    emitStopTyping();
    reset();
  };

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    const hasMessageContent = Boolean(getValues('content')?.trim());
    const hasSelectedImages = Boolean(
      currentUploadableImageRef.current?.length || fileInputRef.current?.files?.length
    );

    if (hasSelectedImages) {
      onImageSubmit();
    }

    if (hasMessageContent || !hasSelectedImages) {
      handleSubmit(onMessageSubmit)(e);
    }
  };

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    const timestamp = Date.now();
    setImageTimestamp(String(timestamp));
  }, []);

  if (!currentUserId || !chat) {
    return null;
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <input
          name="avatars"
          type="file"
          multiple
          className="hidden"
          accept={ALLOWED_FILE_TYPES}
          ref={fileInputRef}
          onChange={(e) => {
            emitTyping();
            const files = e.target.files as FileList;

            if (!areValidImageTypes(files)) {
              toast.error(`Dozvoljeni formati su ${ALLOWED_FILE_TYPES}!`, toastConfig);
              return;
            }

            setValue('files', files);
            setCurrentUploadableImage((prev) => {
              const nextImages = prev ? [...prev, ...Array.from(files)] : Array.from(files);
              currentUploadableImageRef.current = nextImages;
              return nextImages;
            });
          }}
        />
        <button
          type="button"
          className="shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-[#f0f4ff] hover:text-blue disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleIconClick}
          disabled={isUploadingMessageImage}
          aria-label="Priloži datoteku"
        >
          <BiPaperclip fontSize={20} style={{ transform: 'rotate(90deg)' }} />
        </button>

        <button
          type="button"
          className="shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-[#f0f4ff] hover:text-blue disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            setShowGiphySearch((isOpen) => !isOpen);
            setShowEmojiSearch(false);
          }}
          disabled={isUploadingMessageImage}
          aria-label="Odaberi GIF"
        >
          <BiSolidFileGif fontSize={20} />
        </button>

        <button
          type="button"
          className="shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-[#f0f4ff] hover:text-blue disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => {
            setShowEmojiSearch((isOpen) => !isOpen);
            setShowGiphySearch(false);
            setCurrentEmojis([]);
          }}
          disabled={isUploadingMessageImage}
          aria-label="Odaberi emoji"
        >
          <BiSmile fontSize={20} />
        </button>

        <Controller
          name="content"
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
              <Input
                className="!rounded-full !border-[#dce4ff] py-2.5"
                type="text"
                placeholder="Napiši poruku… ( : za emoji )"
                {...field}
                onChange={(e: SyntheticEvent) => {
                  const value = (e.target as HTMLInputElement).value;
                  debouncedSearch(value);
                  if (value.trim()) {
                    emitTyping();
                  } else {
                    emitStopTyping();
                  }
                  field.onChange(e);
                }}
                onFocus={() => {
                  emitTyping();
                  socket?.emit('markAsRead', {
                    userId: currentUserId,
                    chatId: Number(chatId),
                  });

                  if (allNotifications?.data) {
                    allNotifications.data.forEach((notification: INotification) => {
                      if (
                        notification.type === 'message' &&
                        notification.chatId === Number(chatId) &&
                        !notification.isRead
                      ) {
                        mutateMarkAsRead(String(notification.id));
                      }
                    });
                  }
                }}
                onBlur={emitStopTyping}
              />
            );
          }}
        />

        <Button
          type="blue"
          className="!rounded-full !p-2.5 shrink-0"
          htmlType="submit"
          disabled={isUploadingMessageImage}
        >
          {isUploadingMessageImage ? (
            <span className="block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <BiSend fontSize={20} />
          )}
        </Button>
      </form>
      <GiphySearch
        onGifSelect={sendGif}
        isOpen={showGiphySearch}
        onClose={() => setShowGiphySearch(false)}
      />
      <EmojiSearch
        isOpen={showEmojiSearch}
        onClose={() => setShowEmojiSearch(false)}
        onEmojiSelect={(emoji) => {
          const currentValue = getValues('content') ?? '';
          setValue('content', `${currentValue}${emoji}`, { shouldValidate: true });
        }}
      />
      {errors.content && <FieldError message="Poruka je obavezna." />}

      <EmojiPicker
        emojis={currentEmojis}
        onEmojiSelect={(emoji: string) => {
          const currentValue = getValues('content');
          const updatedValue = replaceEmojiToken(currentValue, emoji);
          setValue('content', updatedValue, { shouldValidate: true });
          setCurrentEmojis([]);
        }}
      />

      {currentUploadableImage && (
        <div className="flex items-end gap-2 flex-wrap">
          {currentUploadableImage.map((image: File) => {
            return (
              <div key={image.name} className="relative">
                <Image
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                  style={{ width: 150, height: 150 }}
                  className="border mt-2"
                />
                {isUploadingMessageImage && (
                  <div className="absolute inset-0 mt-2 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                    Slanje...
                  </div>
                )}
                <Button
                  type="danger"
                  onClick={() => {
                    if (currentUploadableImage) {
                      const nextImages = currentUploadableImage.filter(
                        (img) => img.name !== image.name
                      );
                      currentUploadableImageRef.current = nextImages.length ? nextImages : null;
                      setCurrentUploadableImage(nextImages.length ? nextImages : null);
                    }
                  }}
                  className="mt-2"
                  disabled={isUploadingMessageImage}
                >
                  Makni sliku
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SendMessage;
