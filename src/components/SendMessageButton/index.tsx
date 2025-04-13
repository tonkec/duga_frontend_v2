import { useLocalStorage } from '@uidotdev/usehooks';
import { IChat, useCreateNewChat } from '../../pages/NewChatPage/hooks';
import Button, { ButtonType } from '../Button';
import { useGetAllUserChats } from '../../hooks/useGetAllUserChats';
import { useNavigate } from 'react-router';
import { hasAlreadyChatted } from './utils/hasAlreadyChatted';
import { useState } from 'react';

const getChatWithOtherUser = (userChats: IChat[], partnerId: number) => {
  return userChats?.find((chat: IChat) => chat.Users[0].id === partnerId);
};

interface ISendMessageButtonProps {
  sendMessageToId: string;
  buttonType: ButtonType;
  buttonClasses?: string;
  disabled?: boolean;
}

const SendMessageButton = ({
  sendMessageToId,
  buttonType,
  buttonClasses,
  disabled = false,
}: ISendMessageButtonProps) => {
  const [isQueryEnabled, setIsQueryEnabled] = useState(false);
  const navigate = useNavigate();
  const [userId] = useLocalStorage('userId');
  const { onCreateChat } = useCreateNewChat();
  const { userChats } = useGetAllUserChats(userId as string, isQueryEnabled);
  return (
    <Button
      className={buttonClasses}
      onClick={() => {
        setIsQueryEnabled(true);
        if (!hasAlreadyChatted(userChats?.data, sendMessageToId)) {
          onCreateChat({ userId: Number(userId), partnerId: Number(sendMessageToId) });
        }

        const chat = getChatWithOtherUser(userChats?.data, Number(sendMessageToId));
        if (chat) {
          navigate(`/chat/${chat.id}`);
        }
      }}
      type={buttonType}
      disabled={disabled}
    >
      Pošalji poruku ✉️
    </Button>
  );
};

export default SendMessageButton;
