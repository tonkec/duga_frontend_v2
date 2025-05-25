import { useForm, Controller } from 'react-hook-form';
import Button from '@app/components/Button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FieldError from '@app/components/FieldError';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
import { IChat } from '@app/pages/NewChatPage/hooks';
import { IUser } from '@app/components/UserCard';
import { useGetUserById } from '@app/hooks/useGetUserById';
import { useSocket } from '@app/context/useSocket';
import data from '@emoji-mart/data';
import { SyntheticEvent, useState, useRef, useEffect } from 'react';
import { init, SearchIndex } from 'emoji-mart';
import EmojiPicker from '@app/components/EmojiPicker';
import { debounce } from 'lodash';
import Input from '@app/components/Input';
import { BiPaperclip, BiSend, BiSolidFileGif } from 'react-icons/bi';
import { useUploadMessageImage } from './hooks';
import GiphySearch from '@app/components/GiphySearch';
import { useGetAllNotifcations, useMarkAsReadNotification } from '@app/components/Navigation/hooks';

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

export interface IEmoji {
  skins: {
    native: string;
  }[];
}

interface INotification {
  id: number;
  type: string;
  chatId: number;
  isRead: boolean;
}

const SendMessage = ({ chatId, otherUserId }: ISendMessageProps) => {
  init({ data });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentEmojis, setCurrentEmojis] = useState([]);
  const socket = useSocket();
  const [currentUserId] = useLocalStorage('userId');
  const { userChats } = useGetAllUserChats(currentUserId as string);
  const { user: currentUser } = useGetUserById(String(currentUserId));
  const chat = userChats?.data?.find((chat: IChat) => Number(chat.id) === Number(chatId));
  const [currentUploadableImage, setCurrentUploadableImage] = useState<File[] | null>(null);
  const [imageTimestamp, setImageTimestamp] = useState('');
  const [showGiphySearch, setShowGiphySearch] = useState(false);
  const { allNotifications } = useGetAllNotifcations(String(currentUserId) || '');
  const { mutateMarkAsRead } = useMarkAsReadNotification();

  const sendGif = (gifUrl: string) => {
    const msg = {
      type: 'gif',
      fromUserId: currentUserId,
      fromUser: currentUser?.data,
      toUserId: chat.Users && chat.Users.map((user: IUser) => user.id),
      chatId,
      messagePhotoUrl: gifUrl,
    };
    socket.emit('message', msg);
    setShowGiphySearch(false);
  };

  const {
    handleSubmit,
    formState: { errors, isValid },
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

  async function search(value: string) {
    const emojis = await SearchIndex.search(value);
    const results = emojis.map((emoji: IEmoji) => {
      return emoji.skins[0].native;
    });

    return results;
  }

  const emitImageToSockets = () => {
    if (currentUploadableImage) {
      Array.from(currentUploadableImage).forEach((file: File) => {
        socket.emit('message', {
          type: 'file',
          fromUserId: currentUserId,
          fromUser: currentUser?.data,
          toUserId: chat.Users && chat.Users.map((user: IUser) => user.id),
          chatId,
          messagePhotoUrl: `chat/${chatId}/${imageTimestamp}/${file.name}`,
          message: null,
        });
      });
    }
  };

  const { uploadMessageImage } = useUploadMessageImage();

  const onImageSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    const files = (e.target as HTMLFormElement).avatars.files as FileList;
    const formData = new FormData();

    formData.append('chatId', chatId);
    formData.append('fromUserId', currentUserId as string);
    formData.append('timestamp', imageTimestamp);
    Array.from(files).forEach((file: File) => {
      formData.append('avatars', file);
    });
    emitImageToSockets();
    uploadMessageImage(formData);
    setCurrentUploadableImage(null);
    reset();
  };

  const onMessageSubmit = (data: Inputs) => {
    const msg = {
      type: 'text',
      fromUserId: currentUserId,
      fromUser: currentUser?.data,
      toUserId: chat.Users && chat.Users.map((user: IUser) => user.id),
      chatId,
      message: data.content,
    };
    if (isValid) {
      socket.emit('message', msg);
    }
    reset();
  };

  const onSubmit = (e: SyntheticEvent) => {
    handleSubmit(onMessageSubmit)();
    onImageSubmit(e);
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

  return (
    <div>
      <form onSubmit={onSubmit} className="flex-1 flex items-center gap-1">
        <input
          name="avatars"
          type="file"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            socket.emit('typing', { chatId, userId: currentUserId, toUserId: [otherUserId] });
            const files = e.target.files as FileList;
            setValue('files', files);
            setCurrentUploadableImage((prev) => {
              if (prev) {
                return [...prev, ...Array.from(files)];
              }
              return Array.from(files);
            });
          }}
        />
        <BiPaperclip
          fontSize={20}
          style={{
            transform: 'rotate(90deg)',
          }}
          className="cursor-pointer"
          onClick={handleIconClick}
        />

        <BiSolidFileGif
          fontSize={20}
          className="cursor-pointer"
          onClick={() => setShowGiphySearch(!showGiphySearch)}
        />

        <Controller
          name="content"
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
              <Input
                type="text"
                placeholder="Pošalji poruku. Iskoristi : za emojije!"
                {...field}
                onChange={(e: SyntheticEvent) => {
                  const value = (e.target as HTMLInputElement).value;
                  debouncedSearch(value);
                  field.onChange(e);
                }}
                onFocus={() => {
                  socket.emit('typing', { chatId, userId: currentUserId, toUserId: [otherUserId] });
                  socket.emit('markAsRead', {
                    userId: currentUserId,
                    notificationId: allNotifications?.data.find(
                      (notification: INotification) =>
                        notification.type === 'message' &&
                        notification.chatId === Number(chatId) &&
                        !notification.isRead
                    )?.id,
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
                onBlur={() => {
                  socket.emit('stop-typing', {
                    chatId,
                    userId: currentUserId,
                    toUserId: [otherUserId],
                  });
                }}
              />
            );
          }}
        />

        <Button type="primary">
          <BiSend fontSize={20} />
        </Button>
      </form>
      <GiphySearch
        onGifSelect={sendGif}
        isOpen={showGiphySearch}
        onClose={() => setShowGiphySearch(false)}
      />
      {errors.content && <FieldError message="Poruka je obavezna." />}

      <EmojiPicker
        emojis={currentEmojis}
        onEmojiSelect={(emoji: string) => {
          const currentValue = getValues('content');
          const updatedValue = currentValue.replace(/(?:\s|^):([^\s:]+)/, emoji);
          setValue('content', updatedValue, { shouldValidate: true });
          setCurrentEmojis([]);
        }}
      />

      {currentUploadableImage && (
        <div className="flex items-end gap-2 flex-wrap">
          {currentUploadableImage.map((image: File) => {
            return (
              <div key={image.name}>
                <img
                  key={image.name}
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                  width={150}
                  height={150}
                  className="border mt-2"
                />
                <Button
                  type="danger"
                  onClick={() => {
                    if (currentUploadableImage) {
                      setCurrentUploadableImage(
                        currentUploadableImage.filter((img) => img.name !== image.name)
                      );
                    }
                  }}
                  className="mt-2"
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
