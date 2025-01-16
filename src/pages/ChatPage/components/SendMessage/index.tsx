import { useForm } from 'react-hook-form';
import Button from '../../../../components/Button';
import Input from '../../../../components/Input';
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
type Inputs = {
  content: string;
};

const schema = z.object({
  content: z
    .string()
    .min(1)
    .refine((val) => val.trim() !== '', {
      message: 'Poruka je obavezna.',
    }),
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
  const [inputValue, setInputValue] = useState('');
  const socket = useSocket();
  const [currentUserId] = useLocalStorage('userId');
  const { userChats } = useGetAllUserChats(currentUserId as string);
  const { user: currentUser } = useGetUserById(String(currentUserId));
  const chat = userChats?.data?.find((chat: IChat) => Number(chat.id) === Number(chatId));

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
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
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          type="text"
          placeholder="Pošalji poruku"
          {...register('content')}
          onChange={async (e: SyntheticEvent) => {
            const value = (e.target as HTMLInputElement).value;
            const emojiRegex = /(?:\s|^):([a-zA-Z0-9_]+)$/;
            const match = value.match(emojiRegex);
            if (match) {
              const emojis = await search(value.split(':')[1]);
              if (emojis) setCurrentEmojis(emojis);
            } else {
              setCurrentEmojis([]);
            }

            setInputValue(value);
          }}
          onFocus={() => {
            socket.emit('typing', { chatId, userId: currentUserId, toUserId: [otherUserId] });
          }}
          onBlur={() => {
            socket.emit('stop-typing', { chatId, userId: currentUserId, toUserId: [otherUserId] });
          }}
          value={inputValue}
        />

        <EmojiPicker
          onEmojiSelect={(emoji) => {
            setInputValue(inputValue.slice(0, inputValue.lastIndexOf(':')) + emoji + ' ');
          }}
          emojis={currentEmojis}
        />

        {errors.content && <FieldError message="Poruka je obavezna." />}
        <Button className="mt-2" type="primary">
          Pošalji
        </Button>
      </form>
    </>
  );
};

export default SendMessage;
