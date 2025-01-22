import { useForm, Controller } from 'react-hook-form';
import Button from '../../../../components/Button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FieldError from '../../../../components/FieldError';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useGetAllUserChats } from '../../../../hooks/useGetAllUserChats';
import { IChat } from '../../../NewChatPage/hooks';
import { IUser } from '../../../../components/UserCard';
import { useGetUserById } from '../../../../hooks/useGetUserById';
import { useSocket } from '../../../../context/useSocket';
import data from '@emoji-mart/data';
import { SyntheticEvent, useState, useRef, useEffect } from 'react';
import { init, SearchIndex } from 'emoji-mart';
import EmojiPicker from '../../../../components/EmojiPicker';
import { debounce } from 'lodash';
import Input from '../../../../components/Input';
import { BiPaperclip, BiSend } from 'react-icons/bi';
import { useUploadMessageImage } from './hooks';

type Inputs = {
  content: string;
};

const schema = z.object({
  content: z
    .string()
    .min(1, { message: 'Poruka je obavezna.' })
    .refine(
      (val) => {
        return val.trim().length > 0 || /[^\s]/.test(val);
      },
      {
        message: 'Poruka je obavezna.',
      }
    ),
});

interface ISendMessageProps {
  chatId: string;
  otherUserId: number | undefined | null;
}

interface IEmoji {
  skins: {
    native: string;
  }[];
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
    Array.from(files).forEach((file: File) => {
      formData.append('avatars', file);
    });
    formData.append('chatId', chatId);
    formData.append('fromUserId', currentUserId as string);
    formData.append('timestamp', imageTimestamp);
    emitImageToSockets();
    uploadMessageImage(formData);
    setCurrentUploadableImage(null);
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
              <div>
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
