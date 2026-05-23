import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { IUser } from '@app/components/UserCard';
import UserChat from '@app/pages/NewChatPage/components/UserChat';
import NewMessageModal from '@app/pages/NewChatPage/components/NewMessageModal';
import { IMessage } from '@app/pages/ChatPage/components/Message';
import Card from '@app/components/Card';
import Button from '@app/components/Button';

export interface IChat {
  id: number;
  Messages: IMessage[];
  Users: IUser[];
  createdAt: string;
  type: string;
  ChatUser: {
    userId: string;
    chatId: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface IAllUserChats {
  userChats: IChat[];
}

const getLastMessage = (userChat: IChat) => {
  if (userChat.Messages.length === 0) {
    return null;
  }

  return userChat.Messages.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0];
};

const getChatSortTime = (chat: IChat) => {
  const last = getLastMessage(chat);
  return new Date(last?.createdAt ?? chat.createdAt).getTime();
};

const getChatId = (chat: IChat) => chat.id ?? chat.ChatUser?.chatId;

const AllUserChats = ({ userChats }: IAllUserChats) => {
  const navigate = useNavigate();
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

  const sortedChats = useMemo(
    () => [...userChats].sort((a, b) => getChatSortTime(b) - getChatSortTime(a)),
    [userChats]
  );

  return (
    <div className="w-full pb-8">
      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Poruke</h1>
            <p className="mt-1 text-sm text-gray-500">
              {sortedChats.length === 1
                ? '1 aktivni razgovor'
                : sortedChats.length >= 2 && sortedChats.length <= 4
                  ? `${sortedChats.length} aktivna razgovora`
                  : `${sortedChats.length} aktivnih razgovora`}
            </p>
          </div>
          <Button type="blue" className="shrink-0" onClick={() => setIsNewMessageModalOpen(true)}>
            Nova poruka
          </Button>
        </div>
      </header>

      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
      />

      <Card className="!rounded-xl !border-[#dce4ff] !bg-white !p-0 !shadow-md">
        <ul className="divide-y divide-[#e8eeff]" role="list">
          {sortedChats.map((chat, index) => {
            const chatId = getChatId(chat);
            return (
              <li key={chatId}>
                <UserChat
                  user={chat.Users[0]}
                  onClick={() => {
                    if (chatId) navigate(`/chat/${chatId}`);
                  }}
                  lastMessage={getLastMessage(chat)}
                  isFirst={index === 0}
                  isLast={index === sortedChats.length - 1}
                />
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
};

export default AllUserChats;
