import { IChat, useCreateNewChat } from '@app/pages/NewChatPage/hooks';
import Button, { ButtonType } from '@app/components/Button';
import { useGetAllUserChats } from '@app/hooks/useGetAllUserChats';
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
  const { onCreateChat } = useCreateNewChat();
  const { userChats } = useGetAllUserChats(isQueryEnabled);
  return (
    <Button
      className={buttonClasses}
      onClick={() => {
        setIsQueryEnabled(true);
        if (!hasAlreadyChatted(userChats?.data, sendMessageToId)) {
          onCreateChat({ partnerId: Number(sendMessageToId) });
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
