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

const SendMessage = ({ chatId, otherUserId }: ISendMessageProps) => {
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
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
        <Input
          type="text"
          placeholder="Pošalji poruku"
          {...register('content')}
          onFocus={() => {
            socket.emit('typing', { chatId, userId: currentUserId, toUserId: [otherUserId] });
          }}
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
