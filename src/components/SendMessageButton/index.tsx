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
  sendMessageToPublicId?: string;
  buttonType: ButtonType;
  buttonClasses?: string;
  hasChatWithUser?: boolean;
  existingChatId?: number;
}

const SendMessageButton = ({
  sendMessageToId,
  sendMessageToPublicId,
  buttonType,
  buttonClasses,
  hasChatWithUser = false,
  existingChatId,
}: ISendMessageButtonProps) => {
  const [isQueryEnabled, setIsQueryEnabled] = useState(Boolean(existingChatId));
  const navigate = useNavigate();
  const { onCreateChat } = useCreateNewChat();
  const { userChats } = useGetAllUserChats(isQueryEnabled);
  return (
    <Button
      className={buttonClasses}
      onClick={() => {
        setIsQueryEnabled(true);
        if (existingChatId) {
          navigate(`/chat/${existingChatId}`);
          return;
        }

        if (!hasAlreadyChatted(userChats?.data, sendMessageToId)) {
          onCreateChat(
            sendMessageToPublicId
              ? { partnerPublicId: sendMessageToPublicId }
              : { partnerId: Number(sendMessageToId) }
          );
        }

        const chat = getChatWithOtherUser(userChats?.data, Number(sendMessageToId));

        if (chat) {
          navigate(`/chat/${chat.id}`);
        }
      }}
      type={buttonType}
    >
      {hasChatWithUser || existingChatId ? 'Nastavi razgovor' : 'Započni razgovor'}
    </Button>
  );
};

export default SendMessageButton;
