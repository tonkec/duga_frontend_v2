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
import { SyntheticEvent, useState } from 'react';
import { init, SearchIndex } from 'emoji-mart';
import EmojiPicker from '../../../../components/EmojiPicker';
import { debounce } from 'lodash';
import Input from '../../../../components/Input';
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
  chatId: string | undefined;
  otherUserId: number | undefined | null;
}

interface IEmoji {
  skins: {
    native: string;
  }[];
}

const SendMessage = ({ chatId, otherUserId }: ISendMessageProps) => {
  init({ data });
  const [currentEmojis, setCurrentEmojis] = useState([]);
  const socket = useSocket();
  const [currentUserId] = useLocalStorage('userId');
  const { userChats } = useGetAllUserChats(currentUserId as string);
  const { user: currentUser } = useGetUserById(String(currentUserId));
  const chat = userChats?.data?.find((chat: IChat) => Number(chat.id) === Number(chatId));

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

  const onSubmit = (data: Inputs) => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
              placeholder="Pošalji poruku"
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

      <EmojiPicker
        emojis={currentEmojis}
        onEmojiSelect={(emoji: string) => {
          const currentValue = getValues('content');
          const updatedValue = currentValue.replace(/(?:\s|^):([^\s:]+)/, emoji);
          setValue('content', updatedValue, { shouldValidate: true });
          setCurrentEmojis([]);
        }}
      />

      {errors.content && <FieldError message="Poruka je obavezna." />}
      <Button className="mt-2" type="primary">
        Pošalji
      </Button>
    </form>
  );
};

export default SendMessage;
