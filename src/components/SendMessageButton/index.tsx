import { useLocalStorage } from '@uidotdev/usehooks';
import { IChat, useCreateNewChat } from '../../pages/NewChatPage/hooks';
import Button, { ButtonType } from '../Button';
import { useGetAllUserChats } from '../../hooks/useGetAllUserChats';
import { useNavigate } from 'react-router';
import { hasAlreadyChatted } from './utils/hasAlreadyChatted';

const getChatWithOtherUser = (userChats: IChat[], partnerId: number) => {
  return userChats?.find((chat: IChat) => chat.Users[0].id === partnerId);
};

interface ISendMessageButtonProps {
  sendMessageToId: string;
  buttonType: ButtonType;
  buttonClasses?: string;
}

const SendMessageButton = ({
  sendMessageToId,
  buttonType,
  buttonClasses,
}: ISendMessageButtonProps) => {
  const navigate = useNavigate();
  const [userId] = useLocalStorage('userId');

  const { onCreateChat } = useCreateNewChat();
  const { userChats } = useGetAllUserChats(userId as string);
  return (
    <Button
      className={buttonClasses}
      onClick={() => {
        if (!hasAlreadyChatted(userChats?.data, sendMessageToId)) {
          onCreateChat({ userId: Number(userId), partnerId: Number(sendMessageToId) });
        }

        const chat = getChatWithOtherUser(userChats?.data, Number(sendMessageToId));
        navigate(`/chat/${chat?.id}`);
      }}
      type={buttonType}
    >
      Pošalji poruku
    </Button>
  );
};

export default SendMessageButton;
